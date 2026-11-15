// The price calculator: what a family really pays, and what Homeward needs to break even.
// Every input here is an assumption from docs/business-plan.md (tagged [A] there), not data.
// None of the visit prices are quotes yet. Change them when real quotes arrive.

export const PRICES = {
  feeRate: 0.015, // the contract's fee, charged once when money is locked
  siteVisit: 10_000, // [A] one engineer visit with a written report
  remoteReview: 3_000, // [A] one video review
  returnVisit: 10_000, // [A] one visit to check a fix
};

/** How the family moves money. Ranges are the share of the build budget. */
export const TRANSFER = {
  bank: { label: "Bank or money transfer firm", low: 0.044, high: 0.065 },
  digital: { label: "Low-cost digital service", low: 0.01, high: 0.015 },
};

/** Visit plans: Krish's six-visit package, and the pre-pour model (site visits only where concrete hides steel). */
export const PLANS = {
  six: { label: "Six site visits", site: 6, remote: 0, back: 0 },
  prepour: { label: "Three site visits, three video reviews, one return visit", site: 3, remote: 3, back: 1 },
};

/** One unchecked stage, as a share of the budget (the demo's roof stage: materials and labour). */
export const UNCHECKED_STAGE_SHARE = 0.25;

export function allIn({ budget, plan, transfer, sitePrice = PRICES.siteVisit, remotePrice = PRICES.remoteReview }) {
  const p = PLANS[plan];
  const t = TRANSFER[transfer];
  const fee = Math.round(budget * PRICES.feeRate);
  const visits = p.site * sitePrice + p.remote * remotePrice + p.back * PRICES.returnVisit;
  const homeward = fee + visits;
  const moveLow = Math.round(budget * t.low);
  const moveHigh = Math.round(budget * t.high);
  return {
    fee,
    visits,
    homeward,
    homewardShare: homeward / budget,
    moveLow,
    moveHigh,
    totalLow: homeward + moveLow,
    totalHigh: homeward + moveHigh,
    shareLow: (homeward + moveLow) / budget,
    shareHigh: (homeward + moveHigh) / budget,
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
  visitMargin: 0.15, // [A] share of visit spend Homeward keeps
};

/** What one build leaves after its own costs. */
export function contribution({ budget, visitSpend, withMargin }) {
  const fee = Math.round(budget * PRICES.feeRate);
  const margin = withMargin ? Math.round(visitSpend * PER_BUILD.visitMargin) : 0;
  return (
    fee + margin
    - Math.round(budget * PER_BUILD.partnerRate)
    - PER_BUILD.identity - PER_BUILD.support
    - Math.round(fee * PER_BUILD.reserveRate)
    - PER_BUILD.acquire
  );
}

export function breakEven({ budget, visitSpend, withMargin, team }) {
  const per = contribution({ budget, visitSpend, withMargin });
  if (per <= 0) return { per, builds: null, shareBase: null, shareLow: null };
  const builds = Math.round(TEAMS[team].cost / per);
  return { per, builds, shareBase: builds / MARKET.base, shareLow: builds / MARKET.low };
}

export const lakh = (rupees) => `₹${rupees / 1_00_000} lakh`;
export const percent = (x) => `${(x * 100).toFixed(x < 0.1 ? 1 : 0)}%`;
