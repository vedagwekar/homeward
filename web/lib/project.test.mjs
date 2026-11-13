import assert from "node:assert/strict";
import test from "node:test";
import { budgetParts, canPay, gates, refundSplit, dollars, homewardFee, nextStage, rupees, settle, timeline, totalFunded, totalPaid } from "./project.mjs";

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
