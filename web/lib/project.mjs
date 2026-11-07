export const rupees = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const dollars = (rupeeAmount, rupeesPerCad) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(
    Math.round(rupeeAmount / rupeesPerCad / 10) * 10,
  );

export const totalFunded = (project) => project.sponsors.reduce((sum, s) => sum + s.paidIn, 0);

export const totalPaid = (project) =>
  project.stages.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.amount, 0);

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
  const sum = (status) => project.stages.filter((s) => s.status === status).reduce((t, s) => t + s.amount, 0);
  const paid = sum("paid");
  const waiting = sum("waiting");
  const ready = Math.max(totalFunded(project) - paid - waiting, 0);
  return { paid, waiting, ready, unfunded: project.budget - paid - waiting - ready };
}

// Payment needs the engineer's approval, Amma's OK where required, and a second approval after "check again".
export function canPay(stage) {
  if (stage.engineerDecision !== "approved") return false;
  if (stage.amma === "recheck") return stage.secondDecision === "approved";
  return !stage.needsAmma || stage.amma === "ok";
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
      if (stage.status === "waiting" && stage.reviewBy) items.push({ ...base, date: stage.reviewBy, track: "site", title: `${stage.name} review` });
      if (stage.fundBy && needed > funded) items.push({ ...base, date: stage.fundBy, track: "pay", title: `Fund ${stage.name.toLowerCase()}`, amount: Math.min(stage.amount, needed - funded) });
      if (stage.steelBy) items.push({ ...base, date: stage.steelBy, track: "site", title: `Steel check before the ${stage.name.toLowerCase()} pour` });
      if (stage.finishBy && stage.status === "locked") items.push({ ...base, date: stage.finishBy, track: "site", title: `${stage.name} finishes` });
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
