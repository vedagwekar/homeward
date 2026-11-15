// "Try to break it": forbidden payments, tried against the real contract on Stellar Testnet.
// Each attack signs as someone who should not be able to do it, and the contract says no.
//
//   sh scripts/attack.sh prepare     builds a stage waiting for approval (about a minute; do this before the table opens)
//   sh scripts/attack.sh 1           runs one attack (a few seconds)   [1 to 4]
//   sh scripts/attack.sh all         runs all four, then checks that no money moved
//   sh scripts/attack.sh functions   lists every function the contract has
//
// Needs the .env file, like demo.sh. Refused calls are stopped by the network before anything is recorded,
// so they do not show up on Stellar Expert. The builder's setup calls (prepare) do.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ChainError, clientFor, ensureTusdc, read, send, StageStatus, tokenBalance, type StageInput } from "../backend/src/chain";
import { addr, cfg, type Role } from "../backend/src/config";

const T = 10_000_000n; // 1 TUSDC
const sha = (text: string) => createHash("sha256").update(text).digest();
const stateFile = resolve(dirname(fileURLToPath(import.meta.url)), ".attack-build.json");

const stage = (): StageInput => ({
  materials: 10n * T,
  labour_amount: 100n * T,
  payees: [{ to: addr.labour, bps: 4_000 }, { to: addr.builder, bps: 6_000 }],
  parent_must_approve: false,
  pre_pour: false,
  hold_secs: 0n,
});

// ---------------------------------------------------------------------------------------------
async function prepare() {
  console.log("Setting up a build with one stage waiting for the engineer. This takes about a minute.\n");
  const admin = clientFor("admin");
  await ensureTusdc("sponsor1", 200n * T);
  const made = await send(admin.create_project({
    sponsors: [addr.sponsor1], parent: addr.parent, builder: addr.builder, supplier: addr.supplier,
    stages: [stage()],
    terms: { deposit: 0n, upfront: 0n, retention_bps: 0, defects_secs: 20n, stall_secs: 3600n, response_secs: 3600n },
  }));
  const id = made.result;
  console.log(`  Build ${id} set up with fixed payees\n    ${made.explorer}`);
  await send(admin.assign_inspector({ id, stage: 0, inspector: addr.inspector1, slot: 1 }));
  await send(admin.assign_inspector({ id, stage: 0, inspector: addr.inspector2, slot: 2 }));
  const funded = await send(clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id, amount: 110n * T }));
  console.log(`  The family locked 110 TUSDC\n    ${funded.explorer}`);
  const opened = await send(admin.open_stage({ id, stage: 0, code_hash: sha(`attack-code-${id}`) }));
  console.log(`  Stage opened, supplier paid for materials\n    ${opened.explorer}`);
  const proof = await send(clientFor("builder").submit_proof({ id, stage: 0, video_hash: sha(`attack-video-${id}`) }));
  console.log(`  Builder sent proof. The stage now waits for the engineer\n    ${proof.explorer}`);
  writeFileSync(stateFile, JSON.stringify({ id }));
  console.log(`\nReady. Contract: https://stellar.expert/explorer/testnet/contract/${cfg.contractId}`);
  console.log("Now run an attack: sh scripts/attack.sh 1   (or all)");
}

function buildId(): number {
  if (!existsSync(stateFile)) throw new Error("No build is ready. Run: sh scripts/attack.sh prepare");
  return JSON.parse(readFileSync(stateFile, "utf8")).id;
}

// ---------------------------------------------------------------------------------------------
interface Attack {
  title: string;
  who: string;
  tries: string;
  expect: string;
  because: string;
  run: (id: number) => Promise<unknown>;
}

const attacks: Record<string, Attack> = {
  "1": {
    title: "A stranger approves the stage",
    who: "a worker on the site, who is not the engineer or the parent",
    tries: "approve the stage so the money moves",
    expect: "NotAuthorized",
    because: "Only the engineers named for this stage, and the parent, can approve it.",
    run: (id) => send(clientFor("labour").decide({ approver: addr.labour, id, stage: 0, approve: true, report_hash: sha("fake report") })),
  },
  "2": {
    title: "Make the builder the engineer",
    who: "Homeward's own admin account",
    tries: "name the builder as the engineer who checks the builder's work",
    expect: "NotAuthorized",
    because: "Anyone who pays, builds, supplies or gets paid on a build can never be its engineer.",
    run: (id) => send(clientFor("admin").assign_inspector({ id, stage: 0, inspector: addr.builder, slot: 2 })),
  },
  "3": {
    title: "Pay the builder before anyone approves",
    who: "Homeward's admin account (anyone is allowed to call this)",
    tries: "release the stage payment while it is still waiting for the engineer",
    expect: "WrongStatus",
    because: "Money only moves after the approvals the stage needs. Nobody can skip them, including us.",
    run: (id) => send(clientFor("admin").release({ id, stage: 0 })),
  },
  "4": {
    title: "Homeward takes the family's unspent money",
    who: "Homeward's admin account, the most powerful account there is",
    tries: "settle the build and send the unspent money out, without the family having stopped it",
    expect: "WrongStatus",
    because: "Unspent money can only be settled after a family member stops the build. There is no function that sends it to Homeward.",
    run: (id) => send(clientFor("admin").resolve({ id, refund_bps: 0 })),
  },
};

/** Returns true if the contract refused with the code we expected. */
async function attack(n: string, id: number): Promise<boolean> {
  const a = attacks[n];
  console.log(`\nATTACK ${n}: ${a.title}`);
  console.log(`  Who:     ${a.who}`);
  console.log(`  Tries to: ${a.tries}`);
  try {
    await a.run(id);
    console.log("  Result:  ACCEPTED. THIS SHOULD NOT HAPPEN.");
    return false;
  } catch (err) {
    if (err instanceof ChainError) {
      const ok = err.code === a.expect || err.message === FRIENDLY_FOR[a.expect];
      console.log(`  Result:  REFUSED by the contract: "${err.message}"`);
      console.log(`  Why:     ${a.because}`);
      if (!ok) console.log(`  (expected ${a.expect})`);
      return ok;
    }
    console.log(`  Result:  something else went wrong: ${(err as Error).message}`);
    return false;
  }
}
const FRIENDLY_FOR: Record<string, string> = {
  NotAuthorized: "This person isn't allowed to do that.",
  WrongStatus: "This stage isn't ready for that step yet.",
};

async function snapshot() {
  const roles: Role[] = ["builder", "labour", "supplier", "sponsor1"];
  const out: Record<string, bigint> = { contract: await tokenBalance(cfg.contractId) };
  for (const r of roles) out[r] = await tokenBalance(addr[r]);
  return out;
}

async function all(id: number) {
  const before = await snapshot();
  let held = true;
  for (const n of Object.keys(attacks)) held = (await attack(n, id)) && held;
  const after = await snapshot();
  const stageNow = await read(clientFor("admin").get_stage({ id, stage: 0 }));
  const moved = Object.keys(before).filter((k) => before[k] !== after[k]);
  console.log("\nAFTER ALL FOUR ATTACKS");
  console.log(`  Stage still waiting for the engineer: ${stageNow.status === StageStatus.Submitted ? "yes" : "NO"}`);
  console.log(`  Balances changed: ${moved.length ? moved.join(", ") : "none. No money moved."}`);
  held = held && stageNow.status === StageStatus.Submitted && moved.length === 0;
  console.log(held ? "\nEVERY ATTACK WAS REFUSED." : "\nSOMETHING GOT THROUGH. Do not show this build.");
  process.exitCode = held ? 0 : 1;
}

/** Everything the contract can do. There is no withdraw, no change-payee, no pay-me. */
async function functions() {
  const names: string[] = (clientFor("admin") as any).spec.funcs().map((f: any) => f.name().toString()).filter((n: string) => n !== "__constructor");
  console.log(`The contract has ${names.length} functions:\n  ${names.join("\n  ")}`);
  const bad = names.filter((n) => /withdraw(?!_claim)|payee|owner|transfer|upgrade|sweep|drain/i.test(n));
  console.log(bad.length ? `\nLook at: ${bad.join(", ")}` : "\nNone of them can change who gets paid, take money out for the admin, or upgrade the rules.");
}

async function main() {
  const arg = process.argv[2] ?? "";
  console.log("HOMEWARD: try to break it, on Stellar Testnet");
  console.log(`Contract: https://stellar.expert/explorer/testnet/contract/${cfg.contractId}`);
  if (arg === "prepare") return prepare();
  if (arg === "functions") return functions();
  if (arg === "all") return all(buildId());
  if (attacks[arg]) {
    const ok = await attack(arg, buildId());
    process.exitCode = ok ? 0 : 1;
    return;
  }
  console.log("\nUsage: attack.sh prepare | 1 | 2 | 3 | 4 | all | functions");
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`\nATTACK SCRIPT STOPPED: ${err?.message ?? err}`);
  process.exitCode = 1;
});
