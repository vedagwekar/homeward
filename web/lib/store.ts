"use client";

import { useSyncExternalStore } from "react";
import rawSeed from "@/mock/projects.json";
import { canPay } from "./project.mjs";

// All app data goes through this file. Swap these functions for the backend API when it's ready.
export type Stage = {
  slug: string;
  name: string;
  amount: number;
  status: string;
  photos: { src: string; caption: string }[];
  checklist: { item: string; result: string | null }[];
  payouts: { to: string; amount: number }[];
  paidOn?: string;
  code?: string;
  fundBy?: string;
  steelBy?: string;
  finishBy?: string;
  reviewBy?: string;
  needsAmma?: boolean;
  proofSent?: boolean;
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
  stages: Stage[];
};

const seed = rawSeed as Project[];

const KEY = "homeward-demo";
const listeners = new Set<() => void>();
let cache: Project[] | null = null;

function read(): Project[] {
  if (cache) return cache;
  try {
    const saved = localStorage.getItem(KEY);
    cache = saved ? JSON.parse(saved) : seed;
  } catch {
    cache = seed;
  }
  return cache as Project[];
}

function write(next: Project[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
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

export function updateStage(projectId: string, slug: string, change: Partial<Stage>) {
  const settle = (stage: Stage): Stage => {
    const next = { ...stage, ...change };
    return next.status === "waiting" && canPay(next)
      ? { ...next, status: "paid", paidOn: new Date().toISOString().slice(0, 10) }
      : next;
  };
  write(
    read().map((p) =>
      p.id === projectId ? { ...p, stages: p.stages.map((s) => (s.slug === slug ? settle(s) : s)) } : p,
    ),
  );
}

export function addFunding(projectId: string, sponsor: string, amount: number) {
  write(
    read().map((p) =>
      p.id !== projectId
        ? p
        : { ...p, sponsors: p.sponsors.map((s) => (s.name === sponsor ? { ...s, paidIn: s.paidIn + amount } : s)) },
    ),
  );
}

export function resetDemo() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
  write(seed);
}

// The one stage being worked on, for the Builder, Engineer and Amma views.
export function activeStage(projects: Project[]) {
  for (const project of projects) {
    const stage = project.stages.find((s) => s.status === "waiting");
    if (stage) return { project, stage };
  }
  return null;
}

// Every button that changes something shows loading, then success with a receipt link, or an error.
export type Status =
  | { state: "idle" }
  | { state: "loading"; text: string }
  | { state: "done"; text: string; link: string }
  | { state: "error"; text: string };

let status: Status = { state: "idle" };
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
    () => status,
  );
}

export const clearStatus = () => setStatus({ state: "idle" });

export async function act(text: { loading: string; done: string }, change: () => void) {
  setStatus({ state: "loading", text: text.loading });
  try {
    // shortcut: fake 1.2 s delay and "#" receipt link, replace with the backend call on Mon Nov 9
    await new Promise((r) => setTimeout(r, 1200));
    change();
    setStatus({ state: "done", text: text.done, link: "#" });
  } catch {
    setStatus({ state: "error", text: "That didn't go through. Nothing was paid. Try again." });
  }
}
