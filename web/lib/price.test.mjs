import assert from "node:assert/strict";
import test from "node:test";
import { allIn, breakEven, contribution, PLANS, PRICES } from "./price.mjs";

const LAKH = 1_00_000;

// The figures below are the ones printed in docs/business-plan.md, sections 7 to 9.
test("₹15 lakh, six visits: ₹22,500 fee and ₹60,000 of visits, 5.5% of the budget", () => {
  const r = allIn({ budget: 15 * LAKH, plan: "six", transfer: "bank" });
  assert.equal(r.fee, 22_500);
  assert.equal(r.visits, 60_000);
  assert.equal(r.homeward, 82_500);
  assert.equal(r.homewardShare.toFixed(3), "0.055");
});

test("₹30 lakh, six visits: ₹1,05,000, 3.5%", () => {
  const r = allIn({ budget: 30 * LAKH, plan: "six", transfer: "digital" });
  assert.equal(r.homeward, 1_05_000);
  assert.equal(r.homewardShare.toFixed(3), "0.035");
});

test("pre-pour model costs less: ₹71,500 on ₹15 lakh and ₹94,000 on ₹30 lakh", () => {
  assert.equal(allIn({ budget: 15 * LAKH, plan: "prepour", transfer: "bank" }).homeward, 71_500);
  assert.equal(allIn({ budget: 30 * LAKH, plan: "prepour", transfer: "bank" }).homeward, 94_000);
});

test("adding the transfer cost gives about 7.5% to 12% by bank and 4% to 7% by digital service", () => {
  const bank = [allIn({ budget: 30 * LAKH, plan: "prepour", transfer: "bank" }), allIn({ budget: 15 * LAKH, plan: "six", transfer: "bank" })];
  assert.equal(bank[0].shareLow.toFixed(3), "0.075"); // 3.1% + 4.4%
  assert.equal(bank[1].shareHigh.toFixed(3), "0.120"); // 5.5% + 6.5%
  const digital = [allIn({ budget: 30 * LAKH, plan: "prepour", transfer: "digital" }), allIn({ budget: 15 * LAKH, plan: "six", transfer: "digital" })];
  assert.equal(digital[0].shareLow.toFixed(3), "0.041");
  assert.equal(digital[1].shareHigh.toFixed(3), "0.070");
});

test("one unchecked stage on ₹15 lakh is ₹3.75 lakh, far more than the fee", () => {
  const r = allIn({ budget: 15 * LAKH, plan: "six", transfer: "bank" });
  assert.equal(r.unchecked, 3_75_000);
  assert.ok(r.unchecked > r.fee);
});

test("a changed visit price flows through", () => {
  assert.equal(allIn({ budget: 15 * LAKH, plan: "six", transfer: "bank", sitePrice: 5_000 }).visits, 30_000);
  assert.equal(PLANS.six.site, 6);
  assert.equal(PRICES.feeRate, 0.015);
});

test("contribution per build matches the unit economics table", () => {
  assert.equal(contribution({ budget: 15 * LAKH, visitSpend: 60_000, withMargin: false }), 4_900);
  assert.equal(contribution({ budget: 15 * LAKH, visitSpend: 60_000, withMargin: true }), 13_900);
  assert.equal(contribution({ budget: 30 * LAKH, visitSpend: 60_000, withMargin: false }), 21_400);
  assert.equal(contribution({ budget: 30 * LAKH, visitSpend: 60_000, withMargin: true }), 30_400);
});

test("break-even builds match the business plan table", () => {
  const be = (budget, withMargin, team) => breakEven({ budget, visitSpend: 60_000, withMargin, team });
  assert.equal(be(15 * LAKH, false, "lean").builds, 612);
  assert.equal(be(15 * LAKH, true, "lean").builds, 216);
  assert.equal(be(30 * LAKH, false, "lean").builds, 140);
  assert.equal(be(30 * LAKH, true, "lean").builds, 99);
  assert.equal(be(30 * LAKH, true, "base").builds, 296);
  assert.equal(be(15 * LAKH, false, "base").builds, 1_837);
  assert.equal(be(30 * LAKH, true, "funded").builds, 822);
  assert.equal(be(30 * LAKH, true, "lean").shareBase.toFixed(3), "0.014");
});

test("a build that earns nothing never breaks even", () => {
  const r = breakEven({ budget: 3 * LAKH, visitSpend: 60_000, withMargin: false, team: "lean" });
  assert.equal(r.builds, null);
});
