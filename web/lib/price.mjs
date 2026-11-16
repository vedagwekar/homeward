// The price calculator: what a family really pays, and what Homeward needs to break even.
// The video review prices are quotes from eight Kerala engineers (docs/engineer-quotes.md). Everything else
// here is our own assumption (tagged [A]), from docs/business-case.md. Change them when real numbers arrive.

export const FEE_RATE = 0.015; // the contract's fee, charged once when money is locked

// What each engineer quoted for one 20-minute video review, on a ₹15 lakh and on a ₹30 lakh build.
export const REVIEW_QUOTES = { 15: [700, 500, 900, 600, 800, 600, 750, 1000], 30: [900, 700, 1100, 800, 1000, 750, 900, 1200] };
const LAKH = 1_00_000;
const average = (a) => a.reduce((x, y) => x + y, 0) / a.length;

/** The average quote for one review at this build size: the ₹15 lakh figure, rising to the ₹30 lakh figure. */
export function reviewPrice(budget) {
  const low = average(REVIEW_QUOTES[15]), high = average(REVIEW_QUOTES[30]);
  const t = Math.min(1, Math.max(0, (budget - 15 * LAKH) / (15 * LAKH)));
  return low + (high - low) * t;
}
/** Video reviews in a build: six on a small build, seven from about ₹22.5 lakh up. */
export const reviewCount = (budget) => (budget < 22.5 * LAKH ? 6 : 7);
/** What Homeward pays engineers for a build's video reviews, out of its fee. */
export const reviewCost = (budget) => Math.round(reviewCount(budget) * reviewPrice(budget));

export const SITE_VISIT = 3_000; // [A] one visit before concrete is poured. The team's estimate is ₹2,000 to ₹3,000 plus travel.

/** How the family moves money. Ranges are the share of the build budget. */
export const TRANSFER = {
  bank: { label: "Bank or money transfer firm", low: 0.044, high: 0.065 },
  digital: { label: "Low-cost digital service", low: 0.01, high: 0.015 },
};

/** One unchecked stage, as a share of the budget (the demo's roof stage: materials and labour). */
export const UNCHECKED_STAGE_SHARE = 0.25;

/** What the family pays. The fee covers the video reviews; site visits before a pour are extra. */
export function allIn({ budget, siteVisits = 3, sitePrice = SITE_VISIT, transfer }) {
  const t = TRANSFER[transfer];
  const fee = Math.round(budget * FEE_RATE);
  const visits = siteVisits * sitePrice;
  const homeward = fee + visits;
  const moveLow = Math.round(budget * t.low);
  const moveHigh = Math.round(budget * t.high);
  return {
    fee, visits, homeward,
    reviews: reviewCount(budget),
    homewardShare: homeward / budget,
    moveLow, moveHigh,
    totalLow: homeward + moveLow, totalHigh: homeward + moveHigh,
    shareLow: (homeward + moveLow) / budget, shareHigh: (homeward + moveHigh) / budget,
    unchecked: Math.round(budget * UNCHECKED_STAGE_SHARE),
  };
}

/** Yearly fixed costs of the three teams in the business plan, in rupees [A]. */
export const TEAMS = {
  lean: { label: "Lean team", cost: 30_00_000 },
  base: { label: "Base team", cost: 90_00_000 },
  funded: { label: "Funded team", cost: 2_50_00_000 },
};

/** Qualified builds a year in Kerala: the low case and the base case [A]. */
export const MARKET = { low: 1_700, base: 6_850 };

const PER_BUILD = {
  partnerRate: 0.0025, // [A] payment partner
  identity: 600, // [A] two sponsors
  support: 6_000, // [A] ten hours
  reserveRate: 0.1, // [A] share of the fee kept for disputes and losses
  acquire: 5_000, // [A] one referral
};

/** The other costs of one build, besides the engineers' reviews. All assumptions. */
export const otherCosts = (budget) => {
  const fee = Math.round(budget * FEE_RATE);
  return Math.round(budget * PER_BUILD.partnerRate) + PER_BUILD.identity + PER_BUILD.support + Math.round(fee * PER_BUILD.reserveRate) + PER_BUILD.acquire;
};

/** What one build leaves Homeward: the fee, less the reviews it pays for, less its other costs. */
export const contribution = (budget) => Math.round(budget * FEE_RATE) - reviewCost(budget) - otherCosts(budget);

export function breakEven({ budget, team }) {
  const per = contribution(budget);
  if (per <= 0) return { per, builds: null, shareBase: null, shareLow: null };
  const builds = Math.round(TEAMS[team].cost / per);
  return { per, builds, shareBase: builds / MARKET.base, shareLow: builds / MARKET.low };
}

export const percent = (x) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`;
