// Gate B: plays the whole Homeward story against Stellar Testnet.
// Run with ./scripts/demo.sh. Each run creates a new project, so it's safe to repeat.
// It checks the money as it goes and exits with an error if anything is wrong.
import { createHash, randomInt } from "node:crypto";
import { Asset, BASE_FEE, Horizon, Keypair, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { clientFor, read, send, StageStatus, tokenBalance, type StageInput } from "../backend/src/chain";
import { addr, cfg, formatUnits, keypair, rupeesToUnits, RUPEES_PER_TUSDC } from "../backend/src/config";

const sha256 = (text: string) => createHash("sha256").update(text).digest();
const stageCode = () => `HW-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;

// Same build as the web app's Thrissur house: 15 lakh across five stages (rupees).
// Amma signs off every stage, which gives her time to tap "check again".
const PLAN = [
  { name: "Foundation and plinth", total: 300_000n, materials: 45_000n, prePour: true, holdSecs: 0n },
  { name: "Walls up", total: 375_000n, materials: 150_000n, prePour: false, holdSecs: 0n },
  { name: "Roof slab", total: 450_000n, materials: 180_000n, prePour: true, holdSecs: 0n },
  { name: "Finishing", total: 225_000n, materials: 90_000n, prePour: false, holdSecs: 0n },
  { name: "Handover", total: 150_000n, materials: 0n, prePour: false, holdSecs: 60n },
];
const FOUNDATION = 0;
const ROOF = 2;

const stages = PLAN.map((s) => {
  const materials = rupeesToUnits(s.materials);
  return { ...s, materialsUnits: materials, labourUnits: rupeesToUnits(s.total) - materials };
});
const stageInputs: StageInput[] = stages.map((s) => ({
  materials: s.materialsUnits,
  labour_amount: s.labourUnits,
  payees: [
    { to: addr.labour, bps: 4_000 },
    { to: addr.builder, bps: 6_000 }, // last payee gets any rounding
  ],
  parent_must_approve: true,
  pre_pour: s.prePour,
  hold_secs: s.holdSecs,
}));

const budget = stages.reduce((sum, s) => sum + s.materialsUnits + s.labourUnits, 0n);
const sponsor1Amount = (budget * 60n) / 100n;
const sponsor2Amount = budget - sponsor1Amount;
const fee = (amount: bigint) => (amount * 150n) / 10_000n;

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  const detail = ok ? "" : `  (got ${String(actual)}, expected ${String(expected)})`;
  console.log(`   ${ok ? "PASS" : "FAIL"} ${label}${detail}`);
}

const section = (title: string) => console.log(`\n== ${title}`);

async function step<T>(label: string, call: Parameters<typeof send<T>>[0]) {
  const res = await send(call);
  console.log(`   ${label}\n      ${res.explorer}`);
  return res.result;
}

const WATCHED = {
  sponsor1: addr.sponsor1,
  sponsor2: addr.sponsor2,
  supplier: addr.supplier,
  labour: addr.labour,
  builder: addr.builder,
  platform: addr.platform,
  contract: cfg.contractId,
};
type Name = keyof typeof WATCHED;

async function balances() {
  const out = {} as Record<Name, bigint>;
  for (const name of Object.keys(WATCHED) as Name[]) out[name] = await tokenBalance(WATCHED[name]);
  return out;
}

/** Keeps the demo repeatable: the test issuer tops up a sponsor who is running low. */
async function topUpIfNeeded(role: "sponsor1" | "sponsor2", needed: bigint) {
  const balance = await tokenBalance(addr[role]);
  if (balance >= needed) return;
  const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
  const issuer = Keypair.fromSecret(keypair("issuer").secret());
  const tx = new TransactionBuilder(await horizon.loadAccount(issuer.publicKey()), {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({
      destination: addr[role],
      asset: new Asset("TUSDC", issuer.publicKey()),
      amount: "50000",
    }))
    .setTimeout(180)
    .build();
  tx.sign(issuer);
  await horizon.submitTransaction(tx);
  console.log(`   Topped up ${role} with 50,000 test TUSDC`);
}

async function main() {
  console.log("HOMEWARD DEMO on Stellar Testnet");
  console.log(`Contract: https://stellar.expert/explorer/testnet/contract/${cfg.contractId}`);
  console.log(`Demo rate: 1 TUSDC = Rs ${RUPEES_PER_TUSDC}. Rupee payouts are simulated.`);

  section("Getting ready");
  await topUpIfNeeded("sponsor1", sponsor1Amount + fee(sponsor1Amount));
  await topUpIfNeeded("sponsor2", sponsor2Amount + fee(sponsor2Amount));
  const start = await balances();

  const admin = clientFor("admin");
  const builder = clientFor("builder");
  const parent = clientFor("parent");
  const engineer1 = clientFor("inspector1");
  const engineer2 = clientFor("inspector2");

  section("1. Homeward sets up Amma's Rs 15 lakh build with fixed payees");
  const id = await step("Project created, five stages", admin.create_project({
    sponsors: [addr.sponsor1, addr.sponsor2],
    parent: addr.parent,
    builder: addr.builder,
    supplier: addr.supplier,
    stages: stageInputs,
  }));
  console.log(`   Project id: ${id}`);

  section("2. Two siblings fund one build");
  await step(`Sibling 1 locks ${formatUnits(sponsor1Amount)} TUSDC (60%)`,
    clientFor("sponsor1").fund({ sponsor: addr.sponsor1, id, amount: sponsor1Amount }));
  await step(`Sibling 2 locks ${formatUnits(sponsor2Amount)} TUSDC (40%)`,
    clientFor("sponsor2").fund({ sponsor: addr.sponsor2, id, amount: sponsor2Amount }));
  const funded = await read(admin.get_project({ id }));
  check("Whole budget is locked", funded.funded, budget);

  section("3. Two independent engineers are assigned to every stage");
  for (let stage = 0; stage < stages.length; stage++) {
    await step(`${stages[stage].name}: engineer 1`,
      admin.assign_inspector({ id, stage, inspector: addr.inspector1, slot: 1 }));
    await step(`${stages[stage].name}: engineer 2`,
      admin.assign_inspector({ id, stage, inspector: addr.inspector2, slot: 2 }));
  }

  section("4. Foundation: supplier first, proof, approvals, one payout");
  const f = stages[FOUNDATION];
  const beforeFoundation = await balances();
  await step("Stage opens, supplier paid for materials",
    admin.open_stage({ id, stage: FOUNDATION, code_hash: sha256(stageCode()) }));
  check("Supplier was paid first",
    (await tokenBalance(addr.supplier)) - beforeFoundation.supplier, f.materialsUnits);
  check("Builder has received nothing yet",
    (await tokenBalance(addr.builder)) - beforeFoundation.builder, 0n);

  const foundationVideo = sha256("foundation-steel-video");
  const foundationReport = sha256("Steel and plinth match the drawings.");
  await step("Builder submits the coded video",
    builder.submit_proof({ id, stage: FOUNDATION, video_hash: foundationVideo }));
  await step("Engineer 1 approves",
    engineer1.decide({ approver: addr.inspector1, id, stage: FOUNDATION, approve: true, report_hash: foundationReport }));
  check("Still waiting for Amma, nobody paid",
    (await tokenBalance(addr.builder)) - beforeFoundation.builder, 0n);
  await step("Amma says OK: this one transaction pays labour and builder",
    parent.decide({ approver: addr.parent, id, stage: FOUNDATION, approve: true, report_hash: sha256("Amma OK") }));

  const labourShare = (f.labourUnits * 4_000n) / 10_000n;
  const afterFoundation = await balances();
  check("Labour got 40%", afterFoundation.labour - beforeFoundation.labour, labourShare);
  check("Builder got 60%", afterFoundation.builder - beforeFoundation.builder, f.labourUnits - labourShare);
  check("Stage is Paid", (await read(admin.get_stage({ id, stage: FOUNDATION }))).status, StageStatus.Paid);
  const cert = await read(admin.get_certificate({ id, stage: FOUNDATION }));
  check("Certificate records the amount", cert?.amount, f.labourUnits);
  check("Certificate names engineer and Amma", cert?.approvers.join(), [addr.inspector1, addr.parent].join());
  check("Certificate keeps the engineer's report", cert?.report_hash.equals(foundationReport), true);

  section("5. Roof slab: Amma taps 'check again', recycled footage is rejected");
  const r = stages[ROOF];
  await step("Stage opens, supplier paid for materials",
    admin.open_stage({ id, stage: ROOF, code_hash: sha256(stageCode()) }));
  const beforeRoof = await balances();
  await step("Builder resubmits the foundation video as roof proof",
    builder.submit_proof({ id, stage: ROOF, video_hash: foundationVideo }));
  await step("Amma taps 'check again': a second engineer is now required",
    parent.recheck({ caller: addr.parent, id, stage: ROOF }));
  check("Two engineers now required", (await read(admin.get_stage({ id, stage: ROOF }))).approvals_needed, 2);
  await step("Engineer 1 approves, but that's no longer enough",
    engineer1.decide({ approver: addr.inspector1, id, stage: ROOF, approve: true, report_hash: sha256("Looks fine.") }));
  check("Stage is still waiting", (await read(admin.get_stage({ id, stage: ROOF }))).status, StageStatus.Submitted);
  await step("Engineer 2 spots recycled footage and rejects",
    engineer2.decide({ approver: addr.inspector2, id, stage: ROOF, approve: false, report_hash: sha256("Same footage as the foundation.") }));

  const afterRoof = await balances();
  check("Stage is Rejected", (await read(admin.get_stage({ id, stage: ROOF }))).status, StageStatus.Rejected);
  check("Labour was not paid", afterRoof.labour, beforeRoof.labour);
  check("Builder was not paid", afterRoof.builder, beforeRoof.builder);
  check("Contract balance did not move", afterRoof.contract, beforeRoof.contract);
  check("No certificate for the roof", (await read(admin.get_certificate({ id, stage: ROOF }))) ?? null, null);

  section("6. Final balances (TUSDC)");
  const totalFee = fee(sponsor1Amount) + fee(sponsor2Amount);
  const expectedChange: Record<Name, bigint> = {
    sponsor1: -(sponsor1Amount + fee(sponsor1Amount)),
    sponsor2: -(sponsor2Amount + fee(sponsor2Amount)),
    supplier: f.materialsUnits + r.materialsUnits,
    labour: labourShare,
    builder: f.labourUnits - labourShare,
    platform: totalFee,
    contract: budget - f.materialsUnits - f.labourUnits - r.materialsUnits,
  };
  for (const name of Object.keys(WATCHED) as Name[]) {
    const change = afterRoof[name] - start[name];
    console.log(`   ${name.padEnd(9)} now ${formatUnits(afterRoof[name]).padStart(12)}   this run ${formatUnits(change).padStart(12)}`);
    check(`${name} changed by the right amount`, change, expectedChange[name]);
  }
  const project = await read(admin.get_project({ id }));
  check("Contract's spent total matches", project.spent, f.materialsUnits + f.labourUnits + r.materialsUnits);

  console.log(failures ? `\nDEMO FAILED: ${failures} check(s) did not pass.` : "\nDEMO PASSED: the whole story ran on testnet.");
  process.exitCode = failures ? 1 : 0;
}

main().catch((err) => {
  console.error(`\nDEMO STOPPED: ${err?.message ?? err}${err?.cause ? ` (${err.cause.code ?? ""} ${err.cause.message ?? err.cause})` : ""}`);
  process.exitCode = 1;
});
