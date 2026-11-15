"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import rawSeed from "@/mock/projects.json";
import { CURRENCIES, currencyForCity, foreign, canReturnDeposit, defaultPayback, depositNeeded, isActive, isStalled, refundSplit, rupees, securityHeld, settle } from "./project.mjs";

export type VideoReview =
  | { status: "unavailable"; summary: string }
  | {
      status: "reviewed";
      clarity: "clear" | "unclear";
      stageCode: "visible" | "not_visible" | "uncertain";
      stageWork: "matches" | "unclear" | "unrelated";
      summary: string;
    };

// All app data goes through this file. Swap these functions for the backend API when it's ready.
export type Stage = {
  slug: string;
  name: string;
  amount: number; // materials + labour
  materials: number; // paid to the supplier when the stage opens
  status: "locked" | "open" | "submitted" | "rejected" | "paid";
  photos: { src: string; caption: string }[];
  checklist: { item: string; result: string | null }[];
  payouts: { to: string; amount: number }[];
  paidOn?: string;
  videoUrl?: string;
  videoReview?: VideoReview;
  code?: string;
  fundBy?: string;
  steelBy?: string;
  finishBy?: string;
  reviewBy?: string;
  parentMustApprove?: boolean;
  prePour?: boolean; // steel is checked before concrete is poured
  engineerDecision?: "approved" | "rejected" | null;
  amma?: "ok" | "recheck" | null;
  secondDecision?: "approved" | "rejected" | null;
  since?: number; // unix seconds: when the stage last started waiting on the builder
};

export type Project = {
  id: string;
  name: string;
  place: string;
  budget: number;
  parent: string;
  sponsors: { name: string; city: string; paidIn: number; credit?: number }[]; // credit: fee-free funding earned back from a stopped build
  engineer: { name: string; licence: string; secondName: string };
  builder: { name: string; role: string };
  frozen?: boolean; // build stopped and unspent money returned
  security?: Security; // what the builder keeps with the contract
  stages: Stage[];
};

/** A report that the builder failed on a stage. */
export type Claim = { stage: string; at: number; confirmed: boolean; contested: boolean; stalled: boolean };

/** The builder's deposit and retention: the terms, what is held now, and where a report stands. All money in rupees. */
export type Security = {
  depositPct: number;
  retentionPct: number;
  depositTarget: number;
  upfront: number; // the part that must be posted before the first stage opens
  defectsSecs: number;
  stallSecs: number;
  responseSecs: number;
  deposit: number; // held now
  retention: number; // held now
  posted?: number; // mock mode: the deposit the builder has put in
  returned?: boolean;
  defaulted?: boolean;
  completedAt?: number;
  claim?: Claim;
};

const nowSecs = () => Math.floor(Date.now() / 1000);

// Mock mode: the numbers the contract would hold, and the builder's clock started on any stage already waiting.
function prepare(p: Project): Project {
  const raw = p.security as (Security & { postUpfront?: boolean }) | undefined;
  if (!raw) return p;
  const target = raw.depositTarget ?? Math.round((p.budget * raw.depositPct) / 100);
  const stages = p.stages.map((s) => (s.since === undefined && (s.status === "open" || s.status === "rejected") ? { ...s, since: nowSecs() } : s));
  const next = { ...p, stages, security: { ...raw, depositTarget: target, upfront: raw.upfront ?? (raw.postUpfront ? target : 0), deposit: 0, retention: 0 } };
  return derive(next);
}
const derive = (p: Project): Project => {
  if (!p.security) return p;
  const held = securityHeld(p);
  return { ...p, security: { ...p.security, deposit: held.deposit, retention: held.retention } };
};

const seed = (rawSeed as unknown as Project[]).map(prepare);

// The story from the very beginning, which is also where fresh builds on Testnet start: nothing funded,
// every stage locked, the builder's deposit not yet in. The sample above is the same homes part-way built.
const fresh = (rawSeed as unknown as Project[]).map((p) =>
  prepare({
    ...p,
    frozen: false,
    sponsors: p.sponsors.map((s) => ({ ...s, paidIn: 0 })),
    security: p.security ? ({ ...p.security, posted: 0 } as Security) : p.security,
    stages: p.stages.map((s) => ({
      ...s, status: "locked" as const, paidOn: undefined, code: undefined, since: undefined,
      engineerDecision: null, secondDecision: null, amma: null, videoUrl: undefined, videoReview: undefined,
    })),
  }),
);

// Ved's Soroban contract on Stellar testnet, with the builder's deposit (deployed 15 Nov 2026).
export const CONTRACT_URL = "https://stellar.expert/explorer/testnet/contract/CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2";
// The first version, from 9 Nov, before the deposit was added. Its transactions stay valid.
export const FIRST_CONTRACT_URL = "https://stellar.expert/explorer/testnet/contract/CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO";

// The backend's address. When it's set, every button sends a real testnet transaction through
// the backend, which signs as the right person. When it isn't, the app runs on mock data saved in
// this browser. The browser never holds a key either way.
const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const LIVE = Boolean(API);

export const proofVideoUrl = (path: string) => `${API}${path}`;

/** A deliberate "no" from the rules, worded for the person who hit it. */
class Refusal extends Error {}
const refuse = (message: string): never => {
  throw new Refusal(message);
};

/** What the backend returns for every write: the transaction hash and its Stellar Expert page. */
export type Receipt = { hash: string; explorer: string };

async function api(path: string, body?: object | FormData) {
  const form = body instanceof FormData;
  const res = await fetch(`${API}/api${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined || form ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : form ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  // The backend already turns contract errors into plain words, e.g. "This stage isn't ready for that step yet."
  if (!res.ok) throw new Error(data.error ?? "That didn't go through. Nothing was paid. Try again.");
  return data;
}

/** Re-reads every home from the contract. The backend returns the same Project shape as the mock data. */
export async function refresh() {
  if (!LIVE) return;
  // The public testnet RPC sometimes turns away a burst of reads ("queue full"), so try up to 3 times.
  for (let attempt = 1; ; attempt++) {
    try {
      const projects: Project[] = await api("/projects");
      if (projects.length) write(projects); // none yet: keep showing the sample homes until Reset demo sets them up
      return;
    } catch (e) {
      if (attempt >= 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

const KEY = "homeward-demo";
const STATUSES = ["locked", "open", "submitted", "rejected", "paid"];
const listeners = new Set<() => void>();
let cache: Project[] | null = null;

function read(): Project[] {
  if (cache) return cache;
  if (LIVE) return seed; // shown only until the first refresh() arrives
  try {
    const saved = localStorage.getItem(KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    // Demo data saved by an older version of the app has a different shape and would crash the screens.
    const fits = (p: Project) => p.builder && p.security && p.stages.every((s) => STATUSES.includes(s.status));
    cache = Array.isArray(parsed) && parsed.length === seed.length && parsed.every(fits) ? parsed : seed;
  } catch {
    cache = seed;
  }
  return cache as Project[];
}

function write(next: Project[]) {
  cache = LIVE ? next : next.map(derive); // live numbers come from the contract
  try {
    if (!LIVE) localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private windows can block storage. The demo still works until refresh.
  }
  listeners.forEach((l) => l());
}

export function useProjects() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => seed,
  );
}

/** Each screen action, as the contract call that makes it happen. */
function stageOnChain(project: string, slug: string, change: Partial<Stage>): Promise<Receipt> {
  const at = `/stages/${slug}`;
  if (change.status === "open") return api(`${at}/open`, { project });
  const engineer = change.secondDecision ?? change.engineerDecision;
  if (engineer) {
    const as = change.secondDecision ? "inspector2" : "inspector1";
    return api(`${at}/decide`, { project, as, approve: engineer === "approved" });
  }
  if (change.amma === "ok") return api(`${at}/decide`, { project, as: "parent", approve: true });
  if (change.amma === "recheck") return api(`${at}/recheck`, { project, as: "parent" });
  return Promise.reject(new Error("That step isn't on testnet yet."));
}

export function submitVideoProof(project: string, slug: string, video?: File): Promise<Receipt> | undefined {
  if (!LIVE) {
    return updateStage(project, slug, { status: "submitted", engineerDecision: null, secondDecision: null, amma: null });
  }
  if (!video?.size) return refuse("Choose a video to submit.");
  if (video.size > 200 * 1024 * 1024) return refuse("Choose a video under 200 MB.");
  const form = new FormData();
  form.set("project", project);
  form.set("video", video);
  return api(`/stages/${slug}/proof`, form);
}

export function updateStage(projectId: string, slug: string, change: Partial<Stage>): Promise<Receipt> | undefined {
  if (LIVE) return stageOnChain(projectId, slug, change);
  const apply = (stage: Stage): Stage => {
    const next = settle({ ...stage, ...change }) as Stage;
    // The builder's clock starts whenever a stage starts waiting on them.
    const waiting = next.status !== stage.status && (next.status === "open" || next.status === "rejected");
    const stamped = waiting ? { ...next, since: nowSecs() } : next;
    return next.status === "paid" && stage.status !== "paid" ? { ...stamped, paidOn: new Date().toISOString().slice(0, 10) } : stamped;
  };
  // The last stage being paid starts the defects period.
  const finish = (p: Project): Project =>
    p.security && !p.security.completedAt && p.stages.every((s) => s.status === "paid") ? { ...p, security: { ...p.security, completedAt: nowSecs() } } : p;
  write(
    read().map((p) =>
      p.id === projectId ? finish({ ...p, stages: p.stages.map((s) => (s.slug === slug ? apply(s) : s)) }) : p,
    ),
  );
}

/** Opens the next stage: the contract pays the supplier for materials and the builder gets a stage code. */
export function startStage(projectId: string, slug: string) {
  if (!LIVE && depositNeeded(read().find((p) => p.id === projectId)!)) refuse("The builder's deposit has to be in before the first stage can start.");
  const code = `HW-${1000 + Math.floor(Math.random() * 9000)}-${1000 + Math.floor(Math.random() * 9000)}`;
  return updateStage(projectId, slug, { status: "open", code }); // live: the backend makes the code
}

export function addFunding(projectId: string, sponsor: string, amount: number): Promise<Receipt> | undefined {
  if (LIVE) return api("/fund", { project: projectId, sponsor, amount: Math.round(amount) });
  // Fee-free credit follows the person from build to build, like the contract's, and is used up first.
  let left = amount;
  write(
    read().map((p) => ({
      ...p,
      sponsors: p.sponsors.map((s) => {
        if (s.name !== sponsor) return s;
        const used = Math.min(s.credit ?? 0, left);
        left -= used;
        return { ...s, credit: (s.credit ?? 0) - used, paidIn: s.paidIn + (p.id === projectId ? amount : 0) };
      }),
    })),
  );
}

// shortcut: the contract's freeze/resolve covers "stop and return everything"; returning part of
// the spare money while the build continues needs a contract function, ask Ved before relying on it.
export async function returnMoney(projectId: string, amount: number, stop: boolean): Promise<Receipt | undefined> {
  if (LIVE) {
    if (!stop) throw new Error("Returning part of the money while the build keeps going isn't on testnet yet.");
    // Two transactions: a family member stops the build, then Homeward returns all unspent money pro-rata.
    await api(`/project/${projectId}/freeze`, { as: "sponsor1" });
    return api(`/project/${projectId}/resolve`, {});
  }
  write(
    read().map((p) => {
      if (p.id !== projectId) return p;
      const split = refundSplit(p.sponsors, amount);
      return { ...p, frozen: stop || p.frozen, sponsors: p.sponsors.map((s, i) => ({ ...s, paidIn: s.paidIn - split[i].amount })) };
    }),
  );
}

/** "fresh" starts the story from the very beginning. "sample" puts back the homes part-way built (mock mode only). */
export function resetDemo(scenario: "fresh" | "sample" = "fresh") {
  if (LIVE) {
    // Fresh builds on chain: each is one create_project plus two engineers per stage, so about a minute each.
    act({ loading: "Setting up fresh builds on testnet. About a minute each", done: "Fresh builds ready. Start from step 1" }, async () => {
      let last: Receipt | undefined;
      for (const [i, p] of seed.entries()) {
        setStatus({ state: "loading", text: `Setting up home ${i + 1} of ${seed.length} on testnet. About a minute each` });
        last = await api("/project", { slug: p.id, fresh: true });
      }
      return last;
    });
    return;
  }
  try {
    localStorage.removeItem(KEY);
  } catch {}
  write(scenario === "fresh" ? fresh : seed);
  setStatus({ state: "done", text: scenario === "fresh" ? "Back to the start. Nothing funded yet" : "Sample homes restored", link: CONTRACT_URL });
}

// Which home the builder, engineer and parent screens work on. The tour and the directory set it, so playing
// one home never acts on the other. Left unset, the first home with work in progress is used.
const FOCUS_KEY = "homeward-home";
let focus: string | null = null;
try {
  if (typeof localStorage !== "undefined") focus = localStorage.getItem(FOCUS_KEY);
} catch {}

export function setHomeFocus(id: string) {
  focus = id;
  try {
    localStorage.setItem(FOCUS_KEY, id);
  } catch {}
  listeners.forEach((l) => l());
}

/** The homes in the order a role screen should look at them: the chosen one first. */
export const homesInOrder = (projects: Project[]) => (focus ? [...projects.filter((p) => p.id === focus), ...projects.filter((p) => p.id !== focus)] : projects);

// The one stage being worked on, for the Builder and Engineer views.
export function activeStage(projects: Project[]) {
  const chosen = focus ? projects.find((p) => p.id === focus) : undefined;
  for (const project of chosen ? [chosen] : projects) {
    const stage = project.frozen ? undefined : project.stages.find(isActive);
    if (stage) return { project, stage };
  }
  return null;
}

// Family screens can show money in rupees or in what the sender uses: Canadian dollars for Anil in Toronto,
// dirhams for Meera in Dubai. Builder and parent screens stay in rupees.
const CURRENCY_KEY = "homeward-currency";
type Shown = "INR" | "ABROAD";
let currency: Shown = "INR";
try {
  if (typeof localStorage !== "undefined" && ["ABROAD", "CAD", "AED"].includes(localStorage.getItem(CURRENCY_KEY) ?? "")) currency = "ABROAD";
} catch {}

export function setCurrency(next: Shown) {
  currency = next;
  try {
    localStorage.setItem(CURRENCY_KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

export function useCurrency() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => currency,
    () => "INR" as Shown,
  );
}

/** The currency the signed-in sender uses, from the city they send from. Not signed in as a sender: Canadian dollars. */
export function useHomeCurrency() {
  const session = useSession();
  const projects = useProjects();
  const city = session?.role === "sponsor" ? projects.flatMap((p) => p.sponsors).find((s) => s.name === session.name)?.city : undefined;
  return CURRENCIES[currencyForCity(city) as keyof typeof CURRENCIES];
}

// shortcut: one demo rate per currency (see CURRENCIES), the same for every home.
export function useMoney() {
  const shown = useCurrency();
  const home = useHomeCurrency();
  return (n: number) => (shown === "ABROAD" ? foreign(n, home.code) : rupees(n));
}

// Every button that changes something shows loading, then success with a receipt link, or an error.
export type Status =
  | { state: "idle" }
  | { state: "loading"; text: string }
  | { state: "done"; text: string; link: string }
  | { state: "error"; text: string };

const IDLE: Status = { state: "idle" };
let status: Status = IDLE;
const setStatus = (next: Status) => {
  status = next;
  listeners.forEach((l) => l());
};

export function useStatus() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => IDLE, // the server never knows about loading, so the first render always matches
  );
}

export const clearStatus = () => setStatus({ state: "idle" });

type Change = () => void | Receipt | undefined | Promise<void | Receipt | undefined>;

export async function act(text: { loading: string; done: string }, change: Change) {
  setStatus({ state: "loading", text: text.loading });
  try {
    if (!LIVE) await new Promise((r) => setTimeout(r, 1200)); // mock mode: pretend to wait for the network
    const receipt = await change();
    if (LIVE) await refresh().catch(() => {}); // show what the contract now says, not what we hoped
    // Live: this transaction's page. Mock or simulated steps: the contract's page.
    setStatus({ state: "done", text: text.done, link: receipt?.explorer ?? CONTRACT_URL });
  } catch (e) {
    const text = (LIVE || e instanceof Refusal) && e instanceof Error ? e.message : "That didn't go through. Nothing was paid. Try again.";
    setStatus({ state: "error", text });
  }
}

// Live mode: load the real homes once the page opens, and again when the tab comes back into focus.
// Buttons stay disabled ("loading") until then, so nobody acts on the sample numbers.
if (typeof window !== "undefined" && LIVE) {
  setStatus({ state: "loading", text: "Loading the latest from testnet" });
  refresh().then(
    () => status.state === "loading" && clearStatus(),
    () => setStatus({ state: "error", text: "Couldn't reach Homeward. Showing sample homes." }),
  );
  window.addEventListener("focus", () => refresh().catch(() => {}));
}

// Who is using the app. A demo sign-in: it picks whose screens you see, and the backend signs as that
// person's demo key. Real sign-in (a phone number and a one-time code) is on the roadmap.
export type Session = { role: "sponsor" | "parent" | "builder" | "engineer"; name: string };
const SESSION_KEY = "homeward-session";
let session: Session | null | undefined; // undefined until this browser's storage has been read

function readSession(): Session | null {
  if (session !== undefined) return session;
  try {
    session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
  } catch {
    session = null;
  }
  return session as Session | null;
}

export function signIn(next: Session | null) {
  session = next;
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
  listeners.forEach((l) => l());
}

/** The signed-in person, null when signed out, undefined while the server is rendering. */
export function useSession() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    readSession,
    () => undefined,
  );
}

/** One contract call that really happened on Stellar testnet, with the page that proves it. */
export type ProofItem = { home: string; stage: string | number | null; kind: string; label: string; at: string; hash: string; explorer: string };
const TX_URL = "https://stellar.expert/explorer/testnet/tx/";

// Live: the backend's record of every transaction it sent. Otherwise: the transactions from our
// end-to-end run on 13 Nov 2026, saved in mock/proof.json. Both are real and open on Stellar Expert.
export async function loadProof(): Promise<ProofItem[]> {
  if (LIVE) {
    const lists = await Promise.all(read().map(async (p) => ((await api(`/timeline/${p.id}`)) as ProofItem[]).map((i) => ({ ...i, home: p.id }))));
    return lists.flat().sort((a, b) => b.at.localeCompare(a.at));
  }
  const saved = (await import("@/mock/proof.json")).default as Omit<ProofItem, "explorer">[];
  return saved.map((i) => ({ ...i, explorer: TX_URL + i.hash })).reverse();
}

// ---- the builder's deposit, and what happens if the builder fails ----
// Live, each of these is one contract call. In mock mode they follow the same rules, with real clocks.

const find = (projectId: string) => read().find((p) => p.id === projectId)!;
function change(projectId: string, edit: (p: Project) => Project) {
  write(read().map((p) => (p.id === projectId ? edit(p) : p)));
}
const withSecurity = (p: Project, extra: Partial<Security>): Project => ({ ...p, security: { ...p.security!, ...extra } });

/** The family member who is acting, in the backend's words. */
export function familyRole(project: Project, session: Session | null | undefined): "parent" | "sponsor1" | "sponsor2" {
  if (session?.role === "parent") return "parent";
  return project.sponsors.findIndex((s) => s.name === session?.name) === 1 ? "sponsor2" : "sponsor1";
}

/** The builder puts their deposit into the contract. */
export function postDeposit(projectId: string): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/deposit`, {});
  change(projectId, (p) => withSecurity(p, { posted: p.security!.depositTarget }));
}

/** After handover and the defects period, the builder's deposit and held-back payments go back to them. */
export function returnDeposit(projectId: string): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/return-deposit`, {});
  if (!canReturnDeposit(find(projectId), nowSecs())) refuse("The waiting period hasn't finished yet.");
  change(projectId, (p) => withSecurity(p, { returned: true }));
}

/** A family member reports that the builder has failed on a stage. */
export function claimDefault(projectId: string, stage: string, as: "parent" | "sponsor1" | "sponsor2"): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/default/claim`, { as, stage });
  const p = find(projectId);
  if (p.security!.claim) refuse("There is already an open report on this build.");
  const st = p.stages.find((s) => s.slug === stage);
  if (!st) refuse("Say which stage the builder failed on.");
  const stalled = isStalled(st!, p.security!, nowSecs());
  change(projectId, (q) => withSecurity(q, { claim: { stage, at: nowSecs(), confirmed: stalled, contested: false, stalled } }));
}

/** An engineer on that stage confirms the report. The builder's time to respond starts now. */
export function confirmDefault(projectId: string): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/default/confirm`, { as: "inspector1" });
  const claim = find(projectId).security!.claim;
  if (!claim) refuse("There is no open report on this build.");
  if (claim!.confirmed) refuse("This stage isn't ready for that step yet.");
  change(projectId, (p) => withSecurity(p, { claim: { ...claim!, confirmed: true, at: nowSecs() } }));
}

/** The builder disputes the report during their time to respond. */
export function contestDefault(projectId: string): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/default/contest`, {});
  const s = find(projectId).security!;
  if (!s.claim) refuse("There is no open report on this build.");
  if (!s.claim!.confirmed || s.claim!.contested) refuse("This stage isn't ready for that step yet.");
  if (nowSecs() >= s.claim!.at + s.responseSecs) refuse("The builder's time to respond has passed.");
  change(projectId, (p) => withSecurity(p, { claim: { ...s.claim!, contested: true } }));
}

/** The family takes their report back. */
export function withdrawClaim(projectId: string, as: "parent" | "sponsor1" | "sponsor2"): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/default/withdraw`, { as });
  if (!find(projectId).security!.claim) refuse("There is no open report on this build.");
  change(projectId, (p) => withSecurity(p, { claim: undefined }));
}

/** After the builder's time to respond, carries the report out: unspent money and the builder's deposit go back to the family. */
export function finalizeDefault(projectId: string): Promise<Receipt> | undefined {
  if (LIVE) return api(`/project/${projectId}/default/finalize`, {});
  const p = find(projectId);
  const claim = p.security!.claim;
  if (!claim) refuse("There is no open report on this build.");
  if (!claim!.confirmed || claim!.contested) refuse("This stage isn't ready for that step yet.");
  if (nowSecs() < claim!.at + p.security!.responseSecs) refuse("The waiting period hasn't finished yet.");
  const stage = p.stages.find((s) => s.slug === claim!.stage)!;
  if (claim!.stalled && !isStalled(stage, p.security!, nowSecs())) refuse("The builder has sent proof since, so this report no longer applies.");
  const split = refundSplit(p.sponsors, defaultPayback(p).unspent);
  change(projectId, (q) => ({
    ...withSecurity(q, { defaulted: true, claim: undefined }),
    frozen: true,
    // What each person got back is theirs to put into a new build without paying the fee a second time.
    sponsors: q.sponsors.map((s, i) => ({ ...s, paidIn: s.paidIn - split[i].amount, credit: (s.credit ?? 0) + split[i].amount })),
  }));
}

/** Ticks once a second, so countdowns stay true. 0 until the page has loaded in the browser. */
export function useNow() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(nowSecs());
    const tick = setInterval(() => setNow(nowSecs()), 1000);
    return () => clearInterval(tick);
  }, []);
  return now;
}
