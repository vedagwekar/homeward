import assert from "node:assert/strict";
import test from "node:test";
import { CURRENCIES, currencyForCity, foreign, budgetParts, canPay, canReturnDeposit, claimStatus, defaultPayback, depositNeeded, duration, feeAfterCredit, gates, isStalled, securityHeld, refundSplit, dollars, homewardFee, nextStage, rupees, settle, timeline, totalFunded, totalPaid } from "./project.mjs";

const stages = [
  { name: "A", amount: 100, materials: 20, status: "paid" },
  { name: "B", amount: 200, materials: 50, status: "open" },
  { name: "C", amount: 300, materials: 0, status: "locked" },
  { name: "D", amount: 400, materials: 0, status: "locked" },
];
const project = (paidIn) => ({ sponsors: [{ paidIn }], stages });

test("next stage asks only for the shortfall", () => {
  const next = nextStage(project(350));
  assert.equal(next.stage.name, "C");
  assert.equal(next.stillNeeded, 250);
});

test("a fully funded stage needs nothing more", () => {
  assert.equal(nextStage(project(600)).stillNeeded, 0);
});

test("no next stage once nothing is locked", () => {
  assert.equal(nextStage({ sponsors: [], stages: [stages[0]] }), null);
});

test("totals and formats", () => {
  assert.equal(totalFunded({ sponsors: [{ paidIn: 1 }, { paidIn: 2 }] }), 3);
  assert.equal(totalPaid(project(0)), 150); // stage A plus B's materials
  assert.equal(rupees(1500000), "₹15,00,000");
  assert.equal(dollars(300000, 67), "$4,480");
});

test("budget parts always add up to the budget", () => {
  const p = { budget: 1000, ...project(350) };
  const parts = budgetParts(p);
  assert.deepEqual(parts, { paid: 150, waiting: 150, ready: 50, unfunded: 650 });
  assert.equal(parts.paid + parts.waiting + parts.ready + parts.unfunded, 1000);
});

test("fee is 1.5 percent, rounded to the rupee", () => {
  assert.equal(homewardFee(300000), 4500);
});

test("payment waits for every required approval", () => {
  assert.equal(canPay({ engineerDecision: null }), false);
  assert.equal(canPay({ engineerDecision: "rejected" }), false);
  assert.equal(canPay({ engineerDecision: "approved", parentMustApprove: true }), false);
  assert.equal(canPay({ engineerDecision: "approved", parentMustApprove: true, amma: "ok" }), true);
  assert.equal(canPay({ engineerDecision: "approved" }), true);
});

test("Amma's second check blocks payment until a second engineer approves", () => {
  const stage = { engineerDecision: "approved", parentMustApprove: true, amma: "recheck" };
  assert.equal(canPay(stage), false);
  assert.equal(canPay({ ...stage, secondDecision: "rejected" }), false);
  assert.equal(canPay({ ...stage, secondDecision: "approved" }), true);
});

test("timeline merges homes and sorts by date", () => {
  const items = timeline([
    { id: "a", name: "A", sponsors: [{ paidIn: 0 }], stages: [{ slug: "x", name: "Roof", amount: 10, status: "locked", fundBy: "2026-12-01" }] },
    { id: "b", name: "B", sponsors: [{ paidIn: 0 }], stages: [{ slug: "y", name: "Walls", amount: 10, status: "locked", fundBy: "2026-11-01" }] },
  ]);
  assert.deepEqual(items.map((i) => i.project), ["B", "A"]);
  assert.equal(items[0].amount, 10);
});

test("settle follows the contract: rejections go back to the builder, full approval pays", () => {
  const s = { status: "submitted", engineerDecision: "approved", parentMustApprove: true };
  assert.equal(settle(s).status, "submitted");
  assert.equal(settle({ ...s, amma: "ok" }).status, "paid");
  assert.equal(settle({ ...s, engineerDecision: "rejected" }).status, "rejected");
  assert.equal(settle({ ...s, amma: "recheck", secondDecision: "rejected" }).status, "rejected");
  assert.equal(settle({ status: "open", engineerDecision: "approved" }).status, "open");
});

test("demo data: every stage's payouts add up to the stage", async () => {
  const { default: data } = await import("../mock/projects.json", { with: { type: "json" } });
  for (const p of data) {
    assert.equal(p.stages.reduce((t, s) => t + s.amount, 0), p.budget, p.id);
    for (const s of p.stages) assert.equal(s.payouts.reduce((t, x) => t + x.amount, 0), s.amount, s.slug);
  }
});

test("money back splits by what each person paid in and always adds up", () => {
  const split = refundSplit([{ name: "A", paidIn: 600000 }, { name: "B", paidIn: 300000 }], 100001);
  assert.deepEqual(split, [{ name: "A", amount: 66668 }, { name: "B", amount: 33333 }]);
  assert.equal(split.reduce((t, s) => t + s.amount, 0), 100001);
});

test("a stopped build no longer holds labour for the active stage", () => {
  const p = { budget: 1000, frozen: true, ...project(350) };
  assert.equal(budgetParts(p).waiting, 0);
});

test("gates: an open stage waits on the builder, nothing else is lit", () => {
  const open = { status: "open", amount: 375000, materials: 150000, parentMustApprove: true };
  assert.deepEqual(gates(open, "Amma").map((g) => g.state), ["done", "now", "todo", "todo", "todo"]);
  assert.equal(gates(open, "Amma").at(-1).amount, 225000);
});

test("gates: locked has nothing current, paid has everything done, rejected fails the engineer", () => {
  const base = { amount: 100, materials: 0, parentMustApprove: false };
  assert.deepEqual(gates({ ...base, status: "locked" }, "Dad").map((g) => g.state), ["todo", "todo", "todo"]);
  assert.deepEqual(gates({ ...base, status: "paid" }, "Dad").map((g) => g.state), ["done", "done", "done"]);
  assert.deepEqual(gates({ ...base, status: "rejected" }, "Dad").map((g) => g.state), ["done", "failed", "todo"]);
  const waitingOnAmma = { ...base, status: "submitted", engineerDecision: "approved", parentMustApprove: true };
  assert.deepEqual(gates(waitingOnAmma, "Amma").map((g) => g.state), ["done", "done", "now", "todo"]);
});

test("gates: a second engineer's rejection shows as sent back and leaves the money locked", () => {
  const stage = { status: "rejected", amount: 225000, materials: 0, parentMustApprove: true, engineerDecision: "approved", amma: "recheck", secondDecision: "rejected" };
  const track = gates(stage, "Amma");
  assert.deepEqual(track.map((g) => g.state), ["done", "done", "failed", "todo"]);
  assert.equal(track[2].label, "Second engineer sent it back");
  assert.equal(track.at(-1).state, "todo");
});

// ---- the builder's security ----
const paidStage = (amount, materials, builder) => ({ status: "paid", amount, materials, payouts: [{ to: "Builder", amount: builder }] });
const amma = (stages, security) => ({ budget: 1500000, sponsors: [{ name: "A", paidIn: 900000 }, { name: "B", paidIn: 300000 }], stages, security: { depositPct: 5, retentionPct: 10, ...security } });

test("security: a deposit posted up front, then 10% of each stage's labour held back", () => {
  const p = amma([paidStage(300000, 45000, 178500), paidStage(375000, 150000, 157500)], { posted: 75000, upfront: 75000 });
  assert.deepEqual(securityHeld(p), { target: 75000, deposit: 75000, retention: 25500 + 22500 });
});

test("security: with no cash up front the first payment fills the deposit, retention starts after", () => {
  const dad = { budget: 500000, sponsors: [], security: { depositPct: 5, retentionPct: 10 }, stages: [paidStage(100000, 30000, 49000), paidStage(300000, 140000, 112000)] };
  assert.deepEqual(securityHeld({ ...dad, stages: [dad.stages[0], { ...dad.stages[1], status: "locked" }] }), { target: 25000, deposit: 25000, retention: 0 });
  assert.deepEqual(securityHeld(dad), { target: 25000, deposit: 25000, retention: 16000 });
});

test("security: retention can never take more than the builder's share", () => {
  const p = amma([paidStage(100000, 0, 5000)], { posted: 75000 });
  assert.equal(securityHeld(p).retention, 5000);
});

test("security: nothing is held after it was returned or the build was stopped", () => {
  const stages = [paidStage(300000, 45000, 178500)];
  assert.deepEqual(securityHeld(amma(stages, { posted: 75000, returned: true })), { target: 75000, deposit: 0, retention: 0 });
  assert.deepEqual(securityHeld(amma(stages, { posted: 75000, defaulted: true })), { target: 75000, deposit: 0, retention: 0 });
});

test("security: a stage can't start until the up-front deposit is posted", () => {
  assert.equal(depositNeeded(amma([], { upfront: 75000, posted: 0 })), true);
  assert.equal(depositNeeded(amma([], { upfront: 75000, posted: 75000 })), false);
  assert.equal(depositNeeded(amma([], { upfront: 0, posted: 0 })), false);
  assert.equal(depositNeeded({ stages: [] }), false);
});

test("security: the deposit goes back only after the last stage and the defects period", () => {
  const done = [paidStage(100, 0, 70)];
  const s = { defectsSecs: 60, completedAt: 1000 };
  assert.equal(canReturnDeposit(amma(done, s), 1059), false);
  assert.equal(canReturnDeposit(amma(done, s), 1060), true);
  assert.equal(canReturnDeposit(amma([...done, { status: "open" }], s), 5000), false);
  assert.equal(canReturnDeposit(amma(done, { ...s, claim: { stage: "x" } }), 5000), false);
  assert.equal(canReturnDeposit(amma(done, { ...s, returned: true }), 5000), false);
});

test("security: a report moves from needing an engineer, to the builder's window, to ready", () => {
  const s = (claim) => ({ responseSecs: 45, claim });
  assert.equal(claimStatus(s(undefined), 0).phase, "none");
  assert.equal(claimStatus(s({ at: 100, confirmed: false }), 110).phase, "needs-engineer");
  assert.deepEqual(claimStatus(s({ at: 100, confirmed: true }), 130), { phase: "waiting", secsLeft: 15 });
  assert.equal(claimStatus(s({ at: 100, confirmed: true }), 145).phase, "ready");
  assert.equal(claimStatus(s({ at: 100, confirmed: true, contested: true }), 500).phase, "contested");
});

test("security: only a stage waiting on the builder for the stall period counts as stalled", () => {
  const sec = { stallSecs: 120 };
  assert.equal(isStalled({ status: "open", since: 100 }, sec, 219), false);
  assert.equal(isStalled({ status: "open", since: 100 }, sec, 220), true);
  assert.equal(isStalled({ status: "rejected", since: 100 }, sec, 220), true);
  assert.equal(isStalled({ status: "submitted", since: 100 }, sec, 9999), false);
});

test("security: a stopped build gives back what was never paid out plus the builder's deposit and retention", () => {
  const stages = [paidStage(300000, 45000, 178500), paidStage(375000, 150000, 157500), { status: "open", amount: 450000, materials: 180000, payouts: [] }];
  const p = amma(stages, { posted: 75000 });
  assert.deepEqual(defaultPayback(p), { unspent: 1200000 - (300000 + 375000 + 180000), fromBuilder: 75000 + 48000 });
});

test("fees: money refunded from a stopped build is funded again without a second fee", () => {
  assert.equal(feeAfterCredit(1000, 0), 15);
  assert.equal(feeAfterCredit(1000, 1000), 0);
  assert.equal(feeAfterCredit(1000, 400), 9); // 600 pays 1.5%
  assert.equal(feeAfterCredit(1000, 5000), 0);
});

test("duration: demo windows read as seconds and minutes, a launch's as days", () => {
  assert.equal(duration(1), "1 second");
  assert.equal(duration(45), "45 seconds");
  assert.equal(duration(120), "2 minutes");
  assert.equal(duration(3 * 3600), "3 hours");
  assert.equal(duration(30 * 86400), "30 days");
  assert.equal(duration(-5), "0 seconds");
});

test("a Dubai sender sees dirhams, a Toronto sender sees Canadian dollars", () => {
  assert.equal(currencyForCity("Dubai"), "AED");
  assert.equal(currencyForCity("Toronto"), "CAD");
  assert.equal(CURRENCIES.AED.rate, 23);
  assert.match(foreign(230000, "AED"), /10,000/); // ₹2,30,000 at ₹23 is AED 10,000
  assert.equal(foreign(300000, "CAD"), "$4,480");
});
