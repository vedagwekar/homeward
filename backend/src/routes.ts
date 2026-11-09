// REST API for the web app. The browser never sees a key: it names a demo role,
// and the server signs. "as" is a demo role switcher, not real sign-in.
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import multer from "multer";
import { allProjectViews, displayFor, hasActiveStage, projectView, sponsorRole, stageInput, timelineView } from "./builds";
import { ChainError, clientFor, ensureTusdc, read, send, StageStatus } from "./chain";
import { addr, cfg, root, rupeesToUnits, type Role } from "./config";
import { newStageCode, sha256 } from "./codes";
import { addAction, chainIdFor, markPaid, saveBuild, saveCode, saveRejection, saveVideo, videoMime } from "./db";

const uploadDir = process.env.UPLOAD_DIR || resolve(root, "uploads");
mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, done) => done(null, file.mimetype.startsWith("video/")),
});

class HttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
const bad = (message: string) => new HttpError(400, message);

// Testnet transactions from one account must go one at a time, or they fail with tx_bad_seq.
let tail: Promise<unknown> = Promise.resolve();
function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = tail.then(job);
  tail = run.catch(() => undefined);
  return run;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) throw bad(`${field} must be one of: ${allowed.join(", ")}`);
  return value as T;
}

/** Finds the build and stage named in a request, or answers 404. */
function locateBuild(slug: unknown) {
  if (typeof slug !== "string") throw bad("project is required");
  const display = displayFor(slug);
  const chainId = chainIdFor(slug);
  if (!display || chainId === undefined) throw new HttpError(404, "We couldn't find that build. It may need setting up first.");
  return { slug, display, chainId };
}

function locateStage(req: Request) {
  const build = locateBuild(req.body?.project);
  const index = build.display.stages.findIndex((s) => s.slug === req.params.stage);
  if (index < 0) throw new HttpError(404, "We couldn't find that stage.");
  return { ...build, index, stageName: build.display.stages[index].name };
}

/** Sends one contract write, records it for the timeline and returns its receipt. */
async function write(
  chainId: number,
  stage: number | null,
  kind: string,
  label: string,
  // Promise<any>: the generated client's transaction type is checked inside send().
  call: () => Promise<any>,
): Promise<{ hash: string; explorer: string }> {
  const res = await send(call());
  addAction(chainId, stage, kind, label, res.hash);
  return { hash: res.hash, explorer: res.explorer };
}

const SIGNERS = ["parent", "sponsor1", "sponsor2"] as const;
const receipt = (r: { hash: string; explorer: string }) => ({ hash: r.hash, explorer: r.explorer });

export function createApi() {
  const api = express.Router();

  api.get("/health", (_req, res) => {
    res.json({ ok: true, network: "testnet", contractId: cfg.contractId });
  });

  api.get("/projects", async (_req, res) => {
    res.json(await allProjectViews());
  });

  api.get("/project/:id", async (req, res) => {
    const view = await projectView(String(req.params.id));
    if (!view) throw new HttpError(404, "We couldn't find that build.");
    res.json(view);
  });

  api.get("/timeline/:id", (req, res) => {
    const view = timelineView(String(req.params.id));
    if (!view) throw new HttpError(404, "We couldn't find that build.");
    res.json(view);
  });

  /** Sets up a build on chain. Pass fresh: true to start it again from scratch. */
  api.post("/project", async (req, res) => {
    const slug = req.body?.slug;
    const display = typeof slug === "string" ? displayFor(slug) : undefined;
    if (!display) throw new HttpError(404, "We couldn't find that build.");
    if (chainIdFor(display.id) !== undefined && req.body?.fresh !== true) {
      throw new HttpError(409, "This build is already set up.");
    }
    const created = await serial(async () => {
      const admin = clientFor("admin");
      const made = await send(admin.create_project({
        sponsors: display.sponsors.map((_, i) => addr[sponsorRole(i)]),
        parent: addr.parent,
        builder: addr.builder,
        supplier: addr.supplier,
        stages: display.stages.map(stageInput),
      }));
      const id = made.result;
      addAction(id, null, "created", "Build set up with fixed payees", made.hash);
      // Engineers are assigned here, so opening a stage later takes one transaction.
      for (let stage = 0; stage < display.stages.length; stage++) {
        await send(admin.assign_inspector({ id, stage, inspector: addr.inspector1, slot: 1 }));
        await send(admin.assign_inspector({ id, stage, inspector: addr.inspector2, slot: 2 }));
      }
      saveBuild(display.id, id);
      return { id, made };
    });
    res.status(201).json({ id: display.id, chainId: created.id, ...receipt(created.made) });
  });

  api.post("/fund", async (req, res) => {
    const { slug, display, chainId } = locateBuild(req.body?.project);
    const index = display.sponsors.findIndex(
      (s, i) => s.name === req.body?.sponsor || sponsorRole(i) === req.body?.sponsor,
    );
    if (index < 0) throw bad("That person isn't a sponsor on this build.");
    const rupees = req.body?.amount;
    if (!Number.isSafeInteger(rupees) || rupees <= 0 || rupees > display.budget) {
      throw bad(`Amount must be a whole number of rupees from 1 to ${display.budget}.`);
    }
    const role = sponsorRole(index);
    const amount = rupeesToUnits(BigInt(rupees));
    const out = await serial(async () => {
      await ensureTusdc(role, amount + (amount * 150n) / 10_000n);
      return write(chainId, null, "funded", `${display.sponsors[index].name} locked Rs ${rupees}`, () =>
        clientFor(role).fund({ sponsor: addr[role], id: chainId, amount }));
    });
    res.json({ project: slug, ...receipt(out) });
  });

  api.post("/stages/:stage/open", async (req, res) => {
    const { chainId, index, display, stageName } = locateStage(req);
    const code = newStageCode();
    const out = await serial(async () => {
      if (await hasActiveStage(chainId, display.stages.length)) {
        throw new HttpError(409, "Finish the stage in progress before starting another.");
      }
      return write(chainId, index, "opened", `${stageName} started, supplier paid`, () =>
        clientFor("admin").open_stage({ id: chainId, stage: index, code_hash: sha256(code) }));
    });
    saveCode(chainId, index, code);
    res.json({ code, ...receipt(out) });
  });

  api.post("/stages/:stage/proof", upload.single("video"), async (req, res) => {
    if (!req.file) throw bad("Please attach a video file in the 'video' field.");
    const { chainId, index, stageName } = locateStage(req);
    const file = req.file;
    const video = sha256(readFileSync(file.path));
    const out = await serial(() =>
      write(chainId, index, "proof", `Proof video sent for ${stageName}`, () =>
        clientFor("builder").submit_proof({ id: chainId, stage: index, video_hash: video })));
    saveVideo(chainId, index, file.filename, file.mimetype);
    res.json({ videoHash: video.toString("hex"), ...receipt(out) });
  });

  api.post("/stages/:stage/decide", async (req, res) => {
    const { chainId, index, stageName } = locateStage(req);
    const as = oneOf(req.body?.as, ["inspector1", "inspector2", "parent"] as const, "as");
    const approve = req.body?.approve;
    if (typeof approve !== "boolean") throw bad("approve must be true or false");
    const note = typeof req.body?.note === "string" && req.body.note.trim() ? req.body.note : approve ? "Approved" : "Rejected";
    const who = as === "parent" ? "Amma" : as === "inspector1" ? "The engineer" : "The second engineer";
    const out = await serial(() =>
      write(chainId, index, approve ? "approved" : "rejected", `${who} ${approve ? "approved" : "rejected"} ${stageName}`, () =>
        clientFor(as).decide({ approver: addr[as], id: chainId, stage: index, approve, report_hash: sha256(note) })));
    if (!approve && as !== "parent") saveRejection(chainId, index, as === "inspector1" ? "first" : "second");
    const after = await read(clientFor("admin").get_stage({ id: chainId, stage: index }));
    const paid = after.status === StageStatus.Paid;
    if (paid) markPaid(out.hash, `${stageName} approved, builder and labour paid`);
    res.json({ paid, ...receipt(out) });
  });

  api.post("/stages/:stage/recheck", async (req, res) => {
    const { chainId, index, stageName } = locateStage(req);
    const as = oneOf(req.body?.as, SIGNERS, "as");
    const out = await serial(() =>
      write(chainId, index, "recheck", `Second check requested for ${stageName}`, () =>
        clientFor(as as Role).recheck({ caller: addr[as], id: chainId, stage: index })));
    res.json(receipt(out));
  });

  /** Pays a stage once its handover hold has passed. */
  api.post("/stages/:stage/release", async (req, res) => {
    const { chainId, index, stageName } = locateStage(req);
    const out = await serial(() =>
      write(chainId, index, "paid", `${stageName} approved, builder and labour paid`, () =>
        clientFor("admin").release({ id: chainId, stage: index })));
    res.json(receipt(out));
  });

  api.post("/project/:id/freeze", async (req, res) => {
    const { chainId } = locateBuild(req.params.id);
    const as = oneOf(req.body?.as, SIGNERS, "as");
    const out = await serial(() =>
      write(chainId, null, "frozen", "Build stopped", () =>
        clientFor(as as Role).freeze({ caller: addr[as], id: chainId })));
    res.json(receipt(out));
  });

  /** Settles a stopped build. By default all unspent money goes back to the family. */
  api.post("/project/:id/resolve", async (req, res) => {
    const { chainId } = locateBuild(req.params.id);
    const refund = req.body?.refundBps ?? 10_000;
    if (!Number.isInteger(refund) || refund < 0 || refund > 10_000) throw bad("refundBps must be from 0 to 10000");
    const out = await serial(() =>
      write(chainId, null, "resolved", "Unspent money returned", () =>
        clientFor("admin").resolve({ id: chainId, refund_bps: refund })));
    res.json(receipt(out));
  });

  api.get("/videos/:file", (req, res) => {
    const file = String(req.params.file);
    const mime = /^[a-f0-9]{32}$/.test(file) ? videoMime(file) : undefined;
    if (!mime) throw new HttpError(404, "We couldn't find that video.");
    res.type(mime).sendFile(file, { root: uploadDir });
  });

  return api;
}

export function createApp() {
  const app = express();
  const origins = (process.env.WEB_ORIGIN || "http://localhost:3000").split(",").map((o) => o.trim());
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createApi());

  // Every failure leaves here in plain words, without internal details.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
    if (err instanceof ChainError) {
      return void res.status(err.code === "NotAuthorized" ? 403 : 400).json({ error: err.message, code: err.code });
    }
    if (err instanceof multer.MulterError) return void res.status(400).json({ error: "That video couldn't be uploaded." });
    console.error(err instanceof Error ? err.message : err);
    res.status(502).json({ error: "That didn't go through. Nothing was paid. Try again." });
  });
  return app;
}
