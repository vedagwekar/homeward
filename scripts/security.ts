// The builder's deposit, on Stellar Testnet: it comes back when all goes well, and goes to the family when
// the builder disappears. Uses short waiting periods (20 to 25 seconds) so it finishes in a few minutes.
// Run with: sh scripts/security.sh   (needs the .env file, like demo.sh)
import { createHash } from "node:crypto";
import { clientFor, ChainError, ensureTusdc, read, send, StageStatus, tokenBalance, type StageInput } from "../backend/src/chain";
import { addr, cfg } from "../backend/src/config";

const T = 10_000_000n; // 1 TUSDC
const sha = (text: string) => createHash("sha256").update(text).digest();
const sleep = (secs: number) => new Promise((r) => setTimeout(r, secs * 1000));

// Two stages: materials 10 to the supplier, labour 100 split 40% workers and 60% builder.
const stage = (): StageInput => ({
  materials: 10n * T,
  labour_amount: 100n * T,
  payees: [{ to: addr.labour, bps: 4_000 }, { to: addr.builder, bps: 6_000 }],
  parent_must_approve: false,
  pre_pour: false,
  hold_secs: 0n,
});
const terms = (deposit: bigint, upfront: bigint) => ({
  deposit, upfront, retention_bps: 1_000, defects_secs: 20n, stall_secs: 25n, response_secs: 15n,
});

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`   ${ok ? "PASS" : "FAIL"} ${label}${ok ? "" : `  (got ${String(actual)}, expected ${String(expected)})`}`);
}
const section = (title: string) => console.log(`\n== ${title}`);
async function step<T>(label: string, call: Parameters<typeof send<T>>[0]) {
  const res = await send(call);
  console.log(`   ${label}\n      ${res.explorer}`);
  return res.result;
}
/** Expects the contract to refuse, and says with which error. */
async function refused(label: string, code: string, call: Parameters<typeof send<unknown>>[0]) {
  try {
    await send(call);
    check(label, "was accepted", code);
  } catch (err) {
    check(label, err instanceof ChainError ? err.code : String(err), code);
  }
}

const admin = clientFor("admin");
const builder = clientFor("builder");
const engineer = clientFor("inspector1");

async function newBuild(deposit: bigint, upfront: bigint, sponsors = [addr.sponsor1, addr.sponsor2]) {
  const id = await step("Build set up with fixed payees and the builder's terms", admin.create_project({
    sponsors, parent: addr.parent, builder: addr.builder, supplier: addr.supplier,
    stages: [stage(), stage()], terms: terms(deposit, upfront),
  }));
  for (let s = 0; s < 2; s++) {
    await send(admin.assign_inspector({ id, stage: s, inspector: addr.inspector1, slot: 1 }));
    await send(admin.assign_inspector({ id, stage: s, inspector: addr.inspector2, slot: 2 }));
  }
  return id;
}
async function passStage(id: number, s: number) {
  await step(`Stage ${s + 1} opens, supplier paid`, admin.open_stage({ id, stage: s, code_hash: sha(`code-${id}-${s}`) }));
  await step("Builder sends the proof video", builder.submit_proof({ id, stage: s, video_hash: sha(`video-${id}-${s}`) }));
  await step("Engineer approves: one payment to workers and builder",
    engineer.decide({ approver: addr.inspector1, id, stage: s, approve: true, report_hash: sha(`report-${id}-${s}`) }));
}

async function main() {
  console.log("HOMEWARD: the builder's deposit, on Stellar Testnet");
  console.log(`Contract: https://stellar.expert/explorer/testnet/contract/${cfg.contractId}`);
  await ensureTusdc("sponsor1", 400n * T);
  await ensureTusdc("sponsor2", 400n * T);
  await ensureTusdc("builder", 100n * T);

  // ---------------------------------------------------------------------------------------------
  section("A. Nothing goes wrong: the deposit comes back");
  const a = await newBuild(20n * T, 20n * T, [addr.sponsor1]);
  await refused("First stage can't open before the deposit is in", "DepositNeeded",
    admin.open_stage({ id: a, stage: 0, code_hash: sha("early") }));
  const builderBefore = await tokenBalance(addr.builder);
  await step("Builder puts in the 20 TUSDC deposit", builder.post_deposit({ id: a, amount: 20n * T }));
  await step("Family locks 220 TUSDC", clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id: a, amount: 220n * T }));
  const labourBefore = await tokenBalance(addr.labour);

  await passStage(a, 0);
  let project = await read(admin.get_project({ id: a }));
  check("10% of the labour is held back", project.retention_held, 10n * T);
  check("Workers were paid in full (40%)", (await tokenBalance(addr.labour)) - labourBefore, 40n * T);
  check("Builder got 60 less 10 held back, after the deposit", (await tokenBalance(addr.builder)) - builderBefore, -20n * T + 50n * T);
  await passStage(a, 1);
  project = await read(admin.get_project({ id: a }));
  check("Both stages paid", project.stages_paid, 2);
  check("20 held back in total", project.retention_held, 20n * T);
  await refused("Nothing comes back during the check period", "TooEarly", admin.return_deposit({ id: a }));
  console.log("   (waiting 22 seconds for the check period)");
  await sleep(22);
  const contractBefore = await tokenBalance(cfg.contractId);
  await step("Anyone can return the deposit: it goes to the builder", admin.return_deposit({ id: a }));
  check("Builder is paid the 20 deposit and 20 retention", contractBefore - (await tokenBalance(cfg.contractId)), 40n * T);
  check("Builder ends with their whole 120 share of the labour", (await tokenBalance(addr.builder)) - builderBefore, 120n * T);
  check("Nothing is left in the contract for this build", (await read(admin.get_project({ id: a }))).security_returned, true);
  await refused("It can only be returned once", "WrongStatus", admin.return_deposit({ id: a }));

  // ---------------------------------------------------------------------------------------------
  section("B. The builder disappears: the family gets the money back");
  const b = await newBuild(20n * T, 20n * T);
  const builderStart = await tokenBalance(addr.builder);
  await step("Builder puts in the 20 TUSDC deposit", builder.post_deposit({ id: b, amount: 20n * T }));
  const s1 = 132n * T, s2 = 88n * T;
  const fee = (n: bigint) => (n * 150n) / 10_000n;
  // Credit left over from an earlier run is used up first, so the fee we expect depends on it.
  const credit0 = { s1: await read(admin.fee_credit({ sponsor: addr.sponsor1 })), s2: await read(admin.fee_credit({ sponsor: addr.sponsor2 })) };
  const feeAfter = (n: bigint, credit: bigint) => fee(n - (n < credit ? n : credit));
  const used = (n: bigint, credit: bigint) => (n < credit ? n : credit);
  const before = { s1: await tokenBalance(addr.sponsor1), s2: await tokenBalance(addr.sponsor2) };
  await step("Sibling 1 locks 132 TUSDC", clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id: b, amount: s1 }));
  await step("Sibling 2 locks 88 TUSDC", clientFor("sponsor2").fund({ sponsor: addr.sponsor2, id: b, amount: s2 }));
  await step("Stage 1 opens, supplier paid. The builder then goes quiet", admin.open_stage({ id: b, stage: 0, code_hash: sha("quiet") }));
  await refused("A stranger can't report the builder", "NotAuthorized", clientFor("builder").claim_default({ caller: addr.builder, id: b, stage: 0 }));
  console.log("   (waiting 27 seconds: the stage has now waited on the builder for the stall period)");
  await sleep(27);
  await step("Sibling 1 reports the builder", clientFor("sponsor1").claim_default({ caller: addr.sponsor1, id: b, stage: 0 }));
  const claim = await read(admin.get_claim({ id: b }));
  check("It counts on its own: no engineer needed", claim?.confirmed && claim?.stalled, true);
  await refused("Nothing is carried out while the builder can still reply", "TooEarly", admin.finalize_default({ id: b }));
  console.log("   (waiting 17 seconds for the builder's reply time)");
  await sleep(17);
  await step("Anyone carries it out", admin.finalize_default({ id: b }));
  project = await read(admin.get_project({ id: b }));
  check("The build is ended", project.defaulted && project.frozen, true);
  // Unspent 210 (220 less 10 for materials) plus the 20 deposit = 230, split 60/40.
  check("Sibling 1 got 138 back", (await tokenBalance(addr.sponsor1)) - before.s1, -s1 - feeAfter(s1, credit0.s1) + 138n * T);
  check("Sibling 2 got 92 back", (await tokenBalance(addr.sponsor2)) - before.s2, -s2 - feeAfter(s2, credit0.s2) + 92n * T);
  check("The builder lost the deposit", (await tokenBalance(addr.builder)) - builderStart, -20n * T);
  check("Sibling 1 can fund a new build with 126 more fee-free", await read(admin.fee_credit({ sponsor: addr.sponsor1 })), credit0.s1 - used(s1, credit0.s1) + 126n * T);

  // ---------------------------------------------------------------------------------------------
  section("C. Funding the new build costs no second fee");
  const c = await newBuild(0n, 0n);
  const platformBefore = await tokenBalance(addr.platform);
  const owed = await read(admin.fee_credit({ sponsor: addr.sponsor1 }));
  await step("Sibling 1 puts all the refunded money into the new build", clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id: c, amount: owed }));
  check("No fee was charged", (await tokenBalance(addr.platform)) - platformBefore, 0n);
  await step("Sibling 1 adds 10 more", clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id: c, amount: 10n * T }));
  check("The new money pays the normal 1.5%", (await tokenBalance(addr.platform)) - platformBefore, fee(10n * T));
  check("Credit is used up", await read(admin.fee_credit({ sponsor: addr.sponsor1 })), 0n);
  void StageStatus;

  console.log(failures ? `\nSECURITY RUN FAILED: ${failures} check(s) did not pass.` : "\nSECURITY RUN PASSED: the deposit comes back, or goes to the family, on testnet.");
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(`\nSECURITY RUN STOPPED: ${err?.message ?? err}`);
  process.exitCode = 1;
});
