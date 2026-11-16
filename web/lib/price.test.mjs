import assert from "node:assert/strict";
import test from "node:test";
import { allIn, breakEven, contribution, otherCosts, reviewCost, reviewCount, reviewPrice } from "./price.mjs";

const LAKH = 1_00_000;

// The figures below are the ones printed in docs/engineer-quotes.md.
test("the average quote is about ₹731 a review on ₹15 lakh and ₹919 on ₹30 lakh", () => {
  assert.equal(reviewPrice(15 * LAKH), 731.25);
  assert.equal(reviewPrice(30 * LAKH), 918.75);
  assert.equal(reviewPrice(10 * LAKH), 731.25); // never below the small-build quote
  assert.ok(reviewPrice(22.5 * LAKH) > 731.25 && reviewPrice(22.5 * LAKH) < 918.75);
});

test("six reviews on a ₹15 lakh build cost ₹4,388; seven on ₹30 lakh cost ₹6,431", () => {
  assert.equal(reviewCount(15 * LAKH), 6);
  assert.equal(reviewCount(30 * LAKH), 7);
  assert.equal(reviewCost(15 * LAKH), 4_388);
  assert.equal(reviewCost(30 * LAKH), 6_431);
});

test("the family pays the 1.5% fee, which covers the reviews, plus site visits", () => {
  const r = allIn({ budget: 15 * LAKH, transfer: "digital" });
  assert.equal(r.fee, 22_500);
  assert.equal(r.visits, 9_000); // three visits at ₹3,000
  assert.equal(r.homeward, 31_500);
  assert.equal(r.homewardShare.toFixed(3), "0.021");
  assert.equal(allIn({ budget: 30 * LAKH, transfer: "digital" }).homewardShare.toFixed(3), "0.018");
});

test("all in is about 3% to 4% by digital transfer and 6% to 9% by bank", () => {
  const d15 = allIn({ budget: 15 * LAKH, transfer: "digital" }), d30 = allIn({ budget: 30 * LAKH, transfer: "digital" });
  assert.equal(d30.shareLow.toFixed(3), "0.028");
  assert.equal(d15.shareHigh.toFixed(3), "0.036");
  const b15 = allIn({ budget: 15 * LAKH, transfer: "bank" }), b30 = allIn({ budget: 30 * LAKH, transfer: "bank" });
  assert.equal(b30.shareLow.toFixed(3), "0.062");
  assert.equal(b15.shareHigh.toFixed(3), "0.086");
});

test("one unchecked stage on ₹15 lakh is ₹3.75 lakh, far more than the fee", () => {
  const r = allIn({ budget: 15 * LAKH, transfer: "bank" });
  assert.equal(r.unchecked, 3_75_000);
  assert.ok(r.unchecked > r.fee);
});

test("site visits can be changed, and none is allowed", () => {
  assert.equal(allIn({ budget: 15 * LAKH, transfer: "bank", siteVisits: 2, sitePrice: 2_000 }).visits, 4_000);
  assert.equal(allIn({ budget: 15 * LAKH, transfer: "bank", siteVisits: 0 }).homeward, 22_500);
});

test("what a build leaves: about ₹500 on ₹15 lakh and about ₹15,000 on ₹30 lakh", () => {
  assert.equal(otherCosts(15 * LAKH), 17_600);
  assert.equal(otherCosts(30 * LAKH), 23_600);
  assert.equal(contribution(15 * LAKH), 512);
  assert.equal(contribution(30 * LAKH), 14_969);
});

test("break-even: about 200 builds a year on ₹30 lakh with a lean team, 2.9% of the base market", () => {
  const lean = breakEven({ budget: 30 * LAKH, team: "lean" });
  assert.equal(lean.builds, 200);
  assert.equal(lean.shareBase.toFixed(3), "0.029");
  assert.equal(breakEven({ budget: 30 * LAKH, team: "base" }).builds, 601);
  assert.equal(breakEven({ budget: 15 * LAKH, team: "lean" }).builds, 5_859);
});

test("a build that earns nothing never breaks even", () => {
  assert.equal(breakEven({ budget: 3 * LAKH, team: "lean" }).builds, null);
});
