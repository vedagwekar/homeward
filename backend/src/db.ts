// Things that can't live on chain: the plain stage code, who rejected, video files,
// and which transaction did what. Money and status always come from the contract.
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { root } from "./config";

const path = process.env.DB_PATH ?? resolve(root, "homeward.sqlite");
mkdirSync(dirname(path), { recursive: true });
const db = new DatabaseSync(path);

db.exec(`
  CREATE TABLE IF NOT EXISTS builds (slug TEXT PRIMARY KEY, chain_id INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS stage_meta (
    chain_id INTEGER NOT NULL, stage INTEGER NOT NULL,
    code TEXT, video_file TEXT, video_mime TEXT,
    engineer_rejected INTEGER NOT NULL DEFAULT 0,
    second_rejected INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (chain_id, stage)
  );
  CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id INTEGER NOT NULL, stage INTEGER, kind TEXT NOT NULL,
    label TEXT NOT NULL, hash TEXT NOT NULL, at TEXT NOT NULL
  );
`);

export interface StageMeta {
  code: string | null;
  video_file: string | null;
  video_mime: string | null;
  engineer_rejected: number;
  second_rejected: number;
}

export interface ActionRow {
  stage: number | null;
  kind: string;
  label: string;
  hash: string;
  at: string;
}

export const chainIdFor = (slug: string) =>
  (db.prepare("SELECT chain_id FROM builds WHERE slug = ?").get(slug) as { chain_id: number } | undefined)?.chain_id;

export const saveBuild = (slug: string, chainId: number) =>
  db.prepare("INSERT INTO builds (slug, chain_id) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET chain_id = excluded.chain_id").run(slug, chainId);

export const allBuilds = () => db.prepare("SELECT slug FROM builds").all() as unknown as { slug: string }[];

export const getMeta = (chainId: number, stage: number) =>
  (db.prepare("SELECT code, video_file, video_mime, engineer_rejected, second_rejected FROM stage_meta WHERE chain_id = ? AND stage = ?")
    .get(chainId, stage) as StageMeta | undefined) ?? null;

function ensureMeta(chainId: number, stage: number) {
  db.prepare("INSERT OR IGNORE INTO stage_meta (chain_id, stage) VALUES (?, ?)").run(chainId, stage);
}

export function saveCode(chainId: number, stage: number, code: string) {
  ensureMeta(chainId, stage);
  db.prepare("UPDATE stage_meta SET code = ? WHERE chain_id = ? AND stage = ?").run(code, chainId, stage);
}

/** New proof starts a fresh review, so earlier rejections no longer apply. */
export function saveVideo(chainId: number, stage: number, file: string, mime: string) {
  ensureMeta(chainId, stage);
  db.prepare("UPDATE stage_meta SET video_file = ?, video_mime = ?, engineer_rejected = 0, second_rejected = 0 WHERE chain_id = ? AND stage = ?")
    .run(file, mime, chainId, stage);
}

export function saveRejection(chainId: number, stage: number, engineer: "first" | "second") {
  ensureMeta(chainId, stage);
  const column = engineer === "first" ? "engineer_rejected" : "second_rejected";
  db.prepare(`UPDATE stage_meta SET ${column} = 1 WHERE chain_id = ? AND stage = ?`).run(chainId, stage);
}

export const videoMime = (file: string) =>
  (db.prepare("SELECT video_mime FROM stage_meta WHERE video_file = ?").get(file) as { video_mime: string } | undefined)?.video_mime;

export function addAction(chainId: number, stage: number | null, kind: string, label: string, hash: string) {
  db.prepare("INSERT INTO actions (chain_id, stage, kind, label, hash, at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(chainId, stage, kind, label, hash, new Date().toISOString());
}

export const markPaid = (hash: string, label: string) =>
  db.prepare("UPDATE actions SET kind = 'paid', label = ? WHERE hash = ?").run(label, hash);

export const actionsFor = (chainId: number) =>
  db.prepare("SELECT stage, kind, label, hash, at FROM actions WHERE chain_id = ? ORDER BY id").all(chainId) as unknown as ActionRow[];
