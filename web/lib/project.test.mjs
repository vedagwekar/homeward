import assert from "node:assert/strict";
import test from "node:test";
import { budgetParts, canPay, dollars, homewardFee, nextStage, rupees, timeline, totalFunded, totalPaid } from "./project.mjs";

const stages = [
  { name: "A", amount: 100, status: "paid" },
  { name: "B", amount: 200, status: "waiting" },
  { name: "C", amount: 300, status: "locked" },
  { name: "D", amount: 400, status: "locked" },
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
  assert.equal(totalPaid(project(0)), 100);
  assert.equal(rupees(1500000), "₹15,00,000");
  assert.equal(dollars(300000, 67), "$4,480");
});

test("budget parts always add up to the budget", () => {
  const p = { budget: 1000, ...project(350) };
  const parts = budgetParts(p);
  assert.deepEqual(parts, { paid: 100, waiting: 200, ready: 50, unfunded: 650 });
  assert.equal(parts.paid + parts.waiting + parts.ready + parts.unfunded, 1000);
});

test("fee is 1.5 percent, rounded to the rupee", () => {
  assert.equal(homewardFee(300000), 4500);
});

test("payment waits for every required approval", () => {
  assert.equal(canPay({ engineerDecision: null }), false);
  assert.equal(canPay({ engineerDecision: "rejected" }), false);
  assert.equal(canPay({ engineerDecision: "approved", needsAmma: true }), false);
  assert.equal(canPay({ engineerDecision: "approved", needsAmma: true, amma: "ok" }), true);
  assert.equal(canPay({ engineerDecision: "approved" }), true);
});

test("Amma's second check blocks payment until a second engineer approves", () => {
  const stage = { engineerDecision: "approved", needsAmma: true, amma: "recheck" };
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
