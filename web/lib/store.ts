"use client";

import { useSyncExternalStore } from "react";
import rawSeed from "@/mock/projects.json";
import { dollars, isActive, refundSplit, rupees, settle } from "./project.mjs";

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
};

export type Project = {
  id: string;
  name: string;
  place: string;
  budget: number;
  rupeesPerCad: number;
  parent: string;
  sponsors: { name: string; city: string; paidIn: number }[];
  engineer: { name: string; licence: string; secondName: string };
  builder: { name: string; role: string };
  frozen?: boolean; // build stopped and unspent money returned
  stages: Stage[];
};

const seed = rawSeed as Project[];

// Ved's Soroban contract on Stellar testnet.
export const CONTRACT_URL = "https://stellar.expert/explorer/testnet/contract/CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO";

// The backend's address. When it's set, every button sends a real testnet transaction through
// the backend, which signs as the right person. When it isn't, the app runs on mock data saved in
// this browser. The browser never holds a key either way.
const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
export const LIVE = Boolean(API);

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
    const fits = (p: Project) => p.builder && p.stages.every((s) => STATUSES.includes(s.status));
    cache = Array.isArray(parsed) && parsed.length === seed.length && parsed.every(fits) ? parsed : seed;
  } catch {
    cache = seed;
  }
  return cache as Project[];
}

function write(next: Project[]) {
  cache = next;
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
  if (change.status === "submitted") return sendProof(project, slug);
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

// shortcut: a small sample file stands in for the builder's phone video. Its fingerprint (sha256) goes
// on chain exactly as a real video's would. The timestamp makes every sample a different video.
function sendProof(project: string, slug: string) {
  const form = new FormData();
  form.set("project", project);
  form.set("video", new Blob([`Sample proof for ${slug}, ${new Date().toISOString()}`], { type: "video/mp4" }), "proof.mp4");
  return api(`/stages/${slug}/proof`, form);
}

export function updateStage(projectId: string, slug: string, change: Partial<Stage>): Promise<Receipt> | undefined {
  if (LIVE) return stageOnChain(projectId, slug, change);
  const apply = (stage: Stage): Stage => {
    const next = settle({ ...stage, ...change }) as Stage;
    return next.status === "paid" && stage.status !== "paid" ? { ...next, paidOn: new Date().toISOString().slice(0, 10) } : next;
  };
  write(
    read().map((p) =>
      p.id === projectId ? { ...p, stages: p.stages.map((s) => (s.slug === slug ? apply(s) : s)) } : p,
    ),
  );
}

/** Opens the next stage: the contract pays the supplier for materials and the builder gets a stage code. */
export function startStage(projectId: string, slug: string) {
  const code = `HW-${1000 + Math.floor(Math.random() * 9000)}-${1000 + Math.floor(Math.random() * 9000)}`;
  return updateStage(projectId, slug, { status: "open", code }); // live: the backend makes the code
}

export function addFunding(projectId: string, sponsor: string, amount: number): Promise<Receipt> | undefined {
  if (LIVE) return api("/fund", { project: projectId, sponsor, amount: Math.round(amount) });
  write(
    read().map((p) =>
      p.id !== projectId
        ? p
        : { ...p, sponsors: p.sponsors.map((s) => (s.name === sponsor ? { ...s, paidIn: s.paidIn + amount } : s)) },
    ),
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

export function resetDemo() {
  if (LIVE) {
    // Fresh builds on chain: each is one create_project plus two engineers per stage, so about a minute.
    act({ loading: "Setting up fresh builds on testnet. This takes about a minute", done: "Fresh builds ready" }, async () => {
      let last: Receipt | undefined;
      for (const p of seed) last = await api("/project", { slug: p.id, fresh: true });
      return last;
    });
    return;
  }
  try {
    localStorage.removeItem(KEY);
  } catch {}
  write(seed);
}

// The one stage being worked on, for the Builder, Engineer and Amma views.
export function activeStage(projects: Project[]) {
  for (const project of projects) {
    const stage = project.frozen ? undefined : project.stages.find(isActive);
    if (stage) return { project, stage };
  }
  return null;
}

// Family screens can show money in rupees or Canadian dollars. Builder and parent screens stay in rupees.
const CURRENCY_KEY = "homeward-currency";
let currency: "INR" | "CAD" = "INR";
try {
  if (typeof localStorage !== "undefined" && localStorage.getItem(CURRENCY_KEY) === "CAD") currency = "CAD";
} catch {}

export function setCurrency(next: "INR" | "CAD") {
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
    () => "INR" as const,
  );
}

// shortcut: one demo rate for every home (both use ₹67 per C$1), pass the home's own rate once rates are live
export function useMoney(rupeesPerCad = seed[0].rupeesPerCad) {
  const c = useCurrency();
  return (n: number) => (c === "CAD" ? dollars(n, rupeesPerCad) : rupees(n));
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
    const text = LIVE && e instanceof Error ? e.message : "That didn't go through. Nothing was paid. Try again.";
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
