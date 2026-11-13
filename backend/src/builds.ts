// Turns contract data into the Project shape the web app already uses (web/lib/store.ts).
// Names, places and photos come from the app's own mock file. Money and status come from chain.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clientFor, explorerTx, read, StageStatus, type StageInput } from "./chain";
import { addr, root, rupeesToUnits, unitsToRupees } from "./config";
import { actionsFor, allBuilds, chainIdFor, getMeta } from "./db";

interface Payout { to: string; amount: number }
export interface DisplayStage {
  slug: string; name: string; amount: number; materials: number;
  payouts: Payout[]; photos: unknown[]; checklist: { item: string; result: string | null }[];
  parentMustApprove?: boolean; prePour?: boolean;
  [key: string]: unknown;
}
export interface DisplayProject {
  id: string; name: string; budget: number; parent: string;
  sponsors: { name: string; city: string; paidIn: number }[];
  stages: DisplayStage[];
  [key: string]: unknown;
}

const display: DisplayProject[] = JSON.parse(readFileSync(resolve(root, "web/mock/projects.json"), "utf8"));
export const displayFor = (slug: string) => display.find((p) => p.id === slug);

export const HANDOVER_HOLD_SECS = 60n;
export const sponsorRole = (index: number) => (index === 0 ? "sponsor1" : "sponsor2") as "sponsor1" | "sponsor2";

const PAYEE_ADDRESS: Record<string, string> = { Builder: addr.builder, Labour: addr.labour };
const PAYEE_NAME: Record<string, string> = { [addr.builder]: "Builder", [addr.labour]: "Labour" };

/** The app's own split (70/30), with the builder last so they receive any rounding. */
export function stageInput(s: DisplayStage): StageInput {
  const workers = [
    ...s.payouts.filter((p) => p.to !== "Supplier" && p.to !== "Builder"),
    ...s.payouts.filter((p) => p.to === "Builder"),
  ];
  const total = workers.reduce((sum, p) => sum + p.amount, 0);
  let used = 0;
  const payees = workers.map((p, i) => {
    const bps = i === workers.length - 1 ? 10_000 - used : Math.round((p.amount * 10_000) / total);
    used += bps;
    return { to: PAYEE_ADDRESS[p.to], bps };
  });
  const materials = rupeesToUnits(BigInt(s.materials));
  return {
    materials,
    labour_amount: rupeesToUnits(BigInt(s.amount)) - materials,
    payees,
    parent_must_approve: s.parentMustApprove ?? false,
    pre_pour: s.prePour ?? false,
    hold_secs: s.slug === "handover" ? HANDOVER_HOLD_SECS : 0n,
  };
}

const STATUS: Record<StageStatus, "locked" | "open" | "submitted" | "rejected" | "paid"> = {
  [StageStatus.Locked]: "locked",
  [StageStatus.Open]: "open",
  [StageStatus.Submitted]: "submitted",
  [StageStatus.Approved]: "submitted", // approved, waiting for the handover hold: see holdUntil
  [StageStatus.Rejected]: "rejected",
  [StageStatus.Paid]: "paid",
};

const ACTIVE = [StageStatus.Open, StageStatus.Submitted, StageStatus.Approved, StageStatus.Rejected];

/** True while a stage is being worked on. Only one may be active at a time. */
export async function hasActiveStage(chainId: number, stageCount: number) {
  const client = clientFor("admin");
  const stages = await Promise.all(
    Array.from({ length: stageCount }, (_, stage) => read(client.get_stage({ id: chainId, stage }))),
  );
  return stages.some((s) => ACTIVE.includes(s.status));
}

export async function projectView(slug: string) {
  const d = displayFor(slug);
  const chainId = chainIdFor(slug);
  if (!d || chainId === undefined) return null;

  const client = clientFor("admin");
  const id = chainId;
  const [project, stages, contributions] = await Promise.all([
    read(client.get_project({ id })),
    Promise.all(d.stages.map((_, stage) => read(client.get_stage({ id, stage })))),
    Promise.all(d.sponsors.map((_, i) => read(client.contribution({ id, sponsor: addr[sponsorRole(i)] })))),
  ]);
  const paidTx = new Map(actionsFor(id).filter((a) => a.kind === "paid").map((a) => [a.stage, a.hash]));

  const views = await Promise.all(d.stages.map(async (s, index) => {
    const st = stages[index];
    const meta = getMeta(id, index);
    const paid = st.status === StageStatus.Paid;
    const cert = paid ? await read(client.get_certificate({ id, stage: index })) : null;
    const hash = paidTx.get(index);
    const { status: _status, paidOn: _paidOn, code: _code, ...rest } = s;
    return {
      ...rest,
      amount: unitsToRupees(st.materials + st.labour_amount),
      materials: unitsToRupees(st.materials),
      status: STATUS[st.status],
      checklist: s.checklist.map((c) => ({ ...c, result: paid ? c.result : null })),
      payouts: [
        ...(st.materials > 0n ? [{ to: "Supplier", amount: unitsToRupees(st.materials) }] : []),
        ...st.payees.map((p) => ({ to: PAYEE_NAME[p.to] ?? "Payee", amount: unitsToRupees((st.labour_amount * BigInt(p.bps)) / 10_000n) })),
      ].sort((a, b) => ["Supplier", "Builder", "Labour"].indexOf(a.to) - ["Supplier", "Builder", "Labour"].indexOf(b.to)),
      parentMustApprove: st.parent_must_approve,
      prePour: st.pre_pour,
      code: st.status === StageStatus.Locked ? undefined : meta?.code ?? undefined,
      videoUrl: meta?.video_file ? `/api/videos/${meta.video_file}` : undefined,
      engineerDecision: st.approvals.includes(addr.inspector1) ? "approved" : meta?.engineer_rejected ? "rejected" : null,
      secondDecision: st.approvals.includes(addr.inspector2) ? "approved" : meta?.second_rejected ? "rejected" : null,
      amma: st.parent_ok ? "ok" : st.approvals_needed === 2 ? "recheck" : null,
      holdUntil: st.status === StageStatus.Approved ? Number(st.approved_at + st.hold_secs) : undefined,
      paidOn: cert ? new Date(Number(cert.time) * 1000).toISOString().slice(0, 10) : undefined,
      certificate: cert
        ? {
            time: Number(cert.time),
            amount: unitsToRupees(cert.amount),
            approvals: cert.approvers.length,
            reportHash: cert.report_hash.toString("hex"),
            explorer: hash ? explorerTx(hash) : undefined,
          }
        : undefined,
    };
  }));

  return {
    ...d,
    chainId: id,
    frozen: project.frozen,
    funded: unitsToRupees(project.funded),
    spent: unitsToRupees(project.spent),
    sponsors: d.sponsors.map((s, i) => ({ ...s, paidIn: unitsToRupees(contributions[i]) })),
    stages: views,
  };
}

export const allProjectViews = async () =>
  (await Promise.all(allBuilds().map((b) => projectView(b.slug)))).filter((p) => p !== null);

export function timelineView(slug: string) {
  const d = displayFor(slug);
  const chainId = chainIdFor(slug);
  if (!d || chainId === undefined) return null;
  return actionsFor(chainId).map((a) => ({
    stage: a.stage === null ? null : d.stages[a.stage]?.slug ?? null,
    kind: a.kind,
    label: a.label,
    at: a.at,
    hash: a.hash,
    explorer: explorerTx(a.hash),
  })).reverse();
}
