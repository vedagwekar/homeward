export const rupees = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// The money a family member sends from abroad. Demo rates, shown as such. The UAE dirham is pegged to the
// US dollar, so ₹23 per dirham is the ₹85 per dollar the backend uses, divided by 3.67.
export const CURRENCIES = {
  CAD: { code: "CAD", label: "$ CAD", rate: 67, locale: "en-CA", perUnit: "C$1", method: "Interac" },
  AED: { code: "AED", label: "AED dirham", rate: 23, locale: "en-AE", perUnit: "AED 1", method: "bank transfer" },
};

/** The currency a sender uses, from the city they send from. */
export const currencyForCity = (city = "") => (/dubai|abu dhabi|sharjah|uae|emirates/i.test(city) ? "AED" : "CAD");

/** Rupees as the sender's currency, to the nearest 10 so a demo rate never looks falsely exact. */
export function foreign(rupeeAmount, code = "CAD") {
  const c = CURRENCIES[code] ?? CURRENCIES.CAD;
  return new Intl.NumberFormat(c.locale, { style: "currency", currency: c.code, maximumFractionDigits: 0 }).format(
    Math.round(rupeeAmount / c.rate / 10) * 10,
  );
}

export const dollars = (rupeeAmount, rupeesPerCad) => {
  // Kept for older callers: Canadian dollars at the given rate.
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(
    Math.round(rupeeAmount / rupeesPerCad / 10) * 10,
  );
};

export const totalFunded = (project) => project.sponsors.reduce((sum, s) => sum + s.paidIn, 0);

// Stage statuses match the contract: locked, open (supplier paid, builder working),
// submitted (proof sent, waiting for approvals), rejected (builder must fix and resend), paid.
export const isActive = (stage) => ["open", "submitted", "rejected"].includes(stage.status);

// Like the contract's `spent`: whole paid stages, plus materials already paid for active stages.
export const totalPaid = (project) =>
  project.stages.reduce((sum, s) => sum + (s.status === "paid" ? s.amount : isActive(s) ? s.materials : 0), 0);

// Stages run in order, so a stage opens only once funding covers it and every stage before it.
export function nextStage(project) {
  const funded = totalFunded(project);
  let needed = 0;
  for (const stage of project.stages) {
    needed += stage.amount;
    if (stage.status === "locked") return { stage, stillNeeded: Math.max(needed - funded, 0) };
  }
  return null;
}

export const homewardFee = (amount) => Math.round(amount * 0.015);

// Budget split for the bar: each rupee sits in exactly one part.
export function budgetParts(project) {
  const paid = totalPaid(project);
  // A stopped build releases the labour it was holding for the active stage.
  const waiting = project.frozen ? 0 : project.stages.filter(isActive).reduce((t, s) => t + s.amount - s.materials, 0);
  const ready = Math.max(totalFunded(project) - paid - waiting, 0);
  return { paid, waiting, ready, unfunded: project.budget - paid - waiting - ready };
}

// Splits money going back by what each person paid in. Rounding leftovers go to the biggest share,
// so the parts always add up to the amount.
/** @param {{ name: string, paidIn: number }[]} sponsors @param {number} amount @returns {{ name: string, amount: number }[]} */
export function refundSplit(sponsors, amount) {
  const total = sponsors.reduce((t, s) => t + s.paidIn, 0);
  const parts = sponsors.map((s) => ({ name: s.name, amount: total ? Math.floor((amount * s.paidIn) / total) : 0 }));
  const biggest = parts.reduce((b, p, i) => (sponsors[i].paidIn > sponsors[b].paidIn ? i : b), 0);
  if (parts.length) parts[biggest].amount += amount - parts.reduce((t, p) => t + p.amount, 0);
  return parts;
}

// Payment needs the engineer's approval, Amma's OK where required, and a second approval after "check again".
export function canPay(stage) {
  if (stage.engineerDecision !== "approved") return false;
  if (stage.amma === "recheck") return stage.secondDecision === "approved";
  return !stage.parentMustApprove || stage.amma === "ok";
}

// What a stage becomes after a change, the way the contract would settle it.
export function settle(stage) {
  if (stage.status !== "submitted") return stage;
  if (stage.engineerDecision === "rejected" || stage.secondDecision === "rejected") return { ...stage, status: "rejected" };
  return canPay(stage) ? { ...stage, status: "paid" } : stage;
}

export const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

// What's due across every home, soonest first. "pay" is the family's, "site" is the builder's and engineer's.
export function timeline(projects) {
  /** @type {{ project: string, projectId: string, slug: string, date: string, track: string, title: string, amount?: number }[]} */
  const items = [];
  for (const project of projects) {
    let needed = 0;
    const funded = totalFunded(project);
    for (const stage of project.stages) {
      needed += stage.amount;
      const base = { project: project.name, projectId: project.id, slug: stage.slug };
      if (stage.status === "paid") continue;
      if (isActive(stage) && stage.reviewBy) items.push({ ...base, date: stage.reviewBy, track: "site", title: `${stage.name} review` });
      if (stage.fundBy && needed > funded) items.push({ ...base, date: stage.fundBy, track: "pay", title: `Fund ${stage.name.toLowerCase()}`, amount: Math.min(stage.amount, needed - funded) });
      if (stage.steelBy) items.push({ ...base, date: stage.steelBy, track: "site", title: `Steel check before the ${stage.name.toLowerCase()} pour` });
      if (stage.finishBy && stage.status === "locked") items.push({ ...base, date: stage.finishBy, track: "site", title: `${stage.name} finishes` });
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}

// The checks a stage passes before its money moves, in the contract's order.
// Each gate is done, failed, now (the one everyone is waiting on) or todo.
export function gates(stage, parent) {
  const paid = stage.status === "paid";
  const proofIn = ["submitted", "rejected", "paid"].includes(stage.status);
  const list = [];
  if (stage.materials > 0) list.push({ key: "supplier", label: "Supplier paid for materials", amount: stage.materials, done: stage.status !== "locked" });
  list.push({ key: "proof", label: "Builder sends photos and video", done: proofIn });
  list.push({ key: "engineer", label: "Engineer checks the work", done: paid || stage.engineerDecision === "approved", failed: stage.status === "rejected" });
  if (stage.parentMustApprove) {
    const recheck = stage.amma === "recheck";
    const sentBack = recheck && stage.secondDecision === "rejected"; // the second engineer said no, so nothing is paid
    list.push({
      key: "parent",
      label: sentBack ? "Second engineer sent it back" : recheck ? `${parent} asked for a second engineer` : `${parent} approves`,
      done: paid || stage.amma === "ok" || (recheck && stage.secondDecision === "approved"),
      failed: sentBack,
    });
  }
  list.push({ key: "release", label: "Money released to the builder", amount: stage.amount - stage.materials, done: paid });
  let found = stage.status === "locked";
  return list.map((g) => {
    const state = g.done ? "done" : g.failed ? "failed" : found ? "todo" : "now";
    if (state !== "done") found = true;
    return { key: g.key, label: g.label, amount: g.amount, state };
  });
}

// ---- the builder's security ----

// What the builder has with the contract, the way the contract holds it: the deposit (posted up front,
// or earned from the builder's first payment) and a share of each stage's labour held back once the
// deposit is full. Only the builder's own share is ever held back.
export function securityHeld(project) {
  const s = project.security;
  const target = s?.depositTarget ?? Math.round((project.budget * (s?.depositPct ?? 0)) / 100);
  if (!s || s.returned || s.defaulted) return { target, deposit: 0, retention: 0 };
  let deposit = s.posted ?? 0;
  let retention = 0;
  for (const stage of project.stages) {
    if (stage.status !== "paid") continue;
    const labour = stage.amount - stage.materials;
    const builder = stage.payouts.find((p) => p.to === "Builder")?.amount ?? 0;
    if (deposit < target) deposit += Math.min(target - deposit, builder);
    else retention += Math.min(Math.round((labour * s.retentionPct) / 100), builder);
  }
  return { target, deposit, retention };
}

// True while the builder still has to post part of the deposit before the first stage can open.
// `deposit` is what the contract holds now, on Testnet and in the mock alike. `posted` is only the mock's starting value
// (the sample data carries one), so it must not decide this on Testnet.
export const depositNeeded = (project) => Boolean(project.security) && (project.security.upfront ?? 0) > (project.security.deposit ?? project.security.posted ?? 0);

// After the last stage is paid and the defects period has passed, the builder's security can go back to them.
export function canReturnDeposit(project, now) {
  const s = project.security;
  if (!s || s.returned || s.defaulted || s.claim) return false;
  if (project.stages.some((st) => st.status !== "paid")) return false;
  return now >= (s.completedAt ?? Infinity) + s.defectsSecs;
}

// Where a report that the builder failed stands: nobody has confirmed it, the builder's time to
// respond is running, it can be carried out, or the builder disputed it.
export function claimStatus(security, now) {
  const c = security?.claim;
  if (!c) return { phase: "none" };
  if (!c.confirmed) return { phase: "needs-engineer" };
  if (c.contested) return { phase: "contested" };
  const left = c.at + security.responseSecs - now;
  return left > 0 ? { phase: "waiting", secsLeft: left } : { phase: "ready" };
}

// A stage that has been waiting on the builder (open, or sent back) for the stall period counts on its own.
export const isStalled = (stage, security, now) =>
  (stage.status === "open" || stage.status === "rejected") && stage.since !== undefined && now >= stage.since + security.stallSecs;

// Money that a stopped build puts back in the family's hands: what was never paid out, plus the builder's security.
export const defaultPayback = (project) => ({
  unspent: totalFunded(project) - totalPaid(project),
  fromBuilder: securityHeld(project).deposit + securityHeld(project).retention,
});

// The fee on a funding, after any fee-free credit the person earned back from a stopped build.
export const feeAfterCredit = (amount, credit = 0) => homewardFee(amount - Math.min(credit, amount));

// A length of time in words. The demo's windows are seconds; a launch would use days.
export function duration(secs) {
  const s = Math.max(0, Math.round(secs));
  if (s < 90) return `${s} second${s === 1 ? "" : "s"}`;
  if (s < 5400) return `${Math.round(s / 60)} minutes`;
  if (s < 129600) return `${Math.round(s / 3600)} hours`;
  return `${Math.round(s / 86400)} days`;
}
