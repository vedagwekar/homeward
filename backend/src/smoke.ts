// Tests every API route against Stellar Testnet, using a throwaway database.
// Run with: npm run smoke (takes about 5 minutes). Exits non-zero if anything fails.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";

const temp = mkdtempSync(join(tmpdir(), "homeward-smoke-"));
process.env.DB_PATH = join(temp, "smoke.sqlite");
process.env.UPLOAD_DIR = join(temp, "uploads");

const { createApp } = await import("./routes");
const { tokenBalance } = await import("./chain");
const { addr, unitsToRupees } = await import("./config");

const server = createApp().listen(0);
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
const P = "jalandhar";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${ok ? "" : `  (got ${String(actual)}, expected ${String(expected)})`}`);
}
const section = (title: string) => console.log(`\n== ${title}`);

async function get(path: string) {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.json() as any };
}
async function post(path: string, body: unknown = {}) {
  const res = await fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() as any };
}
async function ok(label: string, path: string, body: unknown = {}) {
  const res = await post(path, body);
  check(`${label}${res.status < 300 ? "" : `: ${res.body.error}`}`, res.status < 300, true);
  if (res.status < 300 && res.body.explorer) check("  returns an explorer link", res.body.explorer.includes("stellar.expert"), true);
  return res.body;
}
const view = async () => (await get(`/project/${P}`)).body;
const stage = async (slug: string) => (await view()).stages.find((s: any) => s.slug === slug);

async function sendProof(slug: string, content: string) {
  const form = new FormData();
  form.set("project", P);
  form.set("video", new Blob([content], { type: "video/mp4" }), "proof.mp4");
  const res = await fetch(`${base}/stages/${slug}/proof`, { method: "POST", body: form });
  const body = await res.json() as any;
  check(`Proof accepted for ${slug}${res.ok ? "" : `: ${body.error}`}`, res.ok, true);
  return body;
}

async function main() {
  section("Health and bad input");
  check("Health responds", (await get("/health")).body.ok, true);
  check("No builds yet", (await get("/projects")).body.length, 0);
  check("Unknown build is 404", (await post("/fund", { project: "nowhere", sponsor: "Anil", amount: 1 })).status, 404);

  section("Set up a build");
  await ok("Build set up", "/project", { slug: P });
  check("Second setup refused", (await post("/project", { slug: P })).status, 409);
  let v = await view();
  check("Budget comes from chain", v.stages.reduce((sum: number, s: any) => sum + s.amount, 0), 500_000);
  check("Stage starts locked", v.stages[0].status, "locked");
  check("App's 70/30 split is on chain", v.stages[0].payouts.map((p: any) => `${p.to}:${p.amount}`).join(), "Supplier:30000,Builder:49000,Labour:21000");

  section("Fund");
  check("Negative amount refused", (await post("/fund", { project: P, sponsor: "Anil", amount: -5 })).status, 400);
  check("Stranger refused", (await post("/fund", { project: P, sponsor: "Eve", amount: 5 })).status, 400);
  check("Secrets are not a field", (await post("/fund", { project: P, sponsor: "SECRET", amount: 5 })).status, 400);
  const before = await tokenBalance(addr.sponsor1);
  await ok("Anil locks the whole budget", "/fund", { project: P, sponsor: "Anil", amount: 500_000 });
  check("Paid-in shows on the build", (await view()).sponsors[0].paidIn, 500_000);

  section("Stage: approve and pay");
  const opened = await ok("Prep opens", "/stages/prep/open", { project: P });
  check("Builder gets a stage code", /^HW-\d{4}-\d{4}$/.test(opened.code), true);
  check("Only one stage at a time", (await post("/stages/repairs/open", { project: P })).status, 409);
  check("Missing video refused", (await post("/stages/prep/proof", { project: P })).status, 400);
  const proof = await sendProof("prep", "video-one");
  check("Second engineer has no say yet", (await post("/stages/prep/decide", { project: P, as: "inspector2", approve: true })).status, 403);
  check("Unknown role refused", (await post("/stages/prep/decide", { project: P, as: "builder", approve: true })).status, 400);
  check("Approve must be yes or no", (await post("/stages/prep/decide", { project: P, as: "inspector1", approve: "yes" })).status, 400);
  check("Engineer's approval doesn't pay alone", (await ok("Engineer approves", "/stages/prep/decide", { project: P, as: "inspector1", approve: true, note: "All good" })).paid, false);
  check("Amma's OK pays", (await ok("Amma says OK", "/stages/prep/decide", { project: P, as: "parent", approve: true })).paid, true);
  const prep = await stage("prep");
  check("Stage shows paid", prep.status, "paid");
  check("Engineer's decision shows", prep.engineerDecision, "approved");
  check("Amma's decision shows", prep.amma, "ok");
  check("Paid date shows", typeof prep.paidOn, "string");
  check("Certificate links the payout", String(prep.certificate?.explorer).includes("stellar.expert"), true);
  const video = await fetch(base.replace(/\/api$/, "") + prep.videoUrl);
  check("Video can be watched", await video.text(), "video-one");
  check("Bad video path refused", (await fetch(`${base}/videos/..%2F.env`)).status, 404);
  check("Proof hash returned", proof.videoHash.length, 64);

  section("Handover hold");
  await ok("Handover opens", "/stages/handover/open", { project: P });
  await sendProof("handover", "video-two");
  await ok("Engineer approves", "/stages/handover/decide", { project: P, as: "inspector1", approve: true });
  await ok("Amma says OK", "/stages/handover/decide", { project: P, as: "parent", approve: true });
  const held = await stage("handover");
  check("Waiting out the hold", typeof held.holdUntil, "number");
  check("Early release refused", (await post("/stages/handover/release", { project: P })).body.code, "TooEarly");
  console.log("  (waiting 65 seconds for the hold)");
  await new Promise((r) => setTimeout(r, 65_000));
  await ok("Release after the hold", "/stages/handover/release", { project: P });
  check("Handover shows paid", (await stage("handover")).status, "paid");

  section("Check again: recycled footage");
  await ok("Repairs opens", "/stages/repairs/open", { project: P });
  await sendProof("repairs", "video-one");
  await ok("Amma taps check again", "/stages/repairs/recheck", { project: P, as: "parent" });
  check("Check again shows", (await stage("repairs")).amma, "recheck");
  check("Engineer's approval doesn't pay", (await ok("Engineer approves", "/stages/repairs/decide", { project: P, as: "inspector1", approve: true })).paid, false);
  await ok("Second engineer rejects", "/stages/repairs/decide", { project: P, as: "inspector2", approve: false, note: "Recycled footage" });
  const rejected = await stage("repairs");
  check("Stage shows rejected", rejected.status, "rejected");
  check("Second decision shows", rejected.secondDecision, "rejected");
  check("No certificate", rejected.certificate, undefined);

  section("Timeline");
  const timeline = (await get(`/timeline/${P}`)).body;
  check("Newest first", timeline[0].kind, "rejected");
  check("Payouts are marked", timeline.filter((t: any) => t.kind === "paid").length, 2);

  section("Stop and refund");
  check("Unknown role refused", (await post(`/project/${P}/freeze`, { as: "builder" })).status, 400);
  await ok("Amma stops the build", `/project/${P}/freeze`, { as: "parent" });
  check("Frozen shows", (await view()).frozen, true);
  check("Stopped build can't be funded", (await post("/fund", { project: P, sponsor: "Anil", amount: 5 })).body.code, "Frozen");
  check("Refund over 100% refused", (await post(`/project/${P}/resolve`, { refundBps: 10_001 })).status, 400);
  await ok("Unspent money returned", `/project/${P}/resolve`);
  v = await view();
  check("Everything is accounted for", v.spent, 500_000);
  const spentRupees = 100_000 + 100_000 + 140_000; // prep, handover, repairs materials
  const fee = 500_000 * 0.015;
  const change = unitsToRupees(before - (await tokenBalance(addr.sponsor1)));
  check("Family only paid for finished work plus the fee", Math.abs(change - (spentRupees + fee)) <= 1, true);

  console.log(failures ? `\nSMOKE FAILED: ${failures} check(s).` : "\nSMOKE PASSED: every route works on testnet.");
}

try {
  await main();
} catch (err) {
  failures++;
  console.error(`\nSMOKE STOPPED: ${err instanceof Error ? err.message : err}`);
} finally {
  server.close();
  rmSync(temp, { recursive: true, force: true });
}
process.exit(failures ? 1 : 0);
