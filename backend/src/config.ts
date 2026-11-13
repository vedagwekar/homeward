// Settings and demo keys by role. Secrets come from the git-ignored .env file
// locally, and from the host's environment variables once deployed.
import { config as loadEnv } from "dotenv";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Keypair } from "@stellar/stellar-sdk";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
loadEnv({ path: resolve(root, ".env"), quiet: true });

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env (see .env.example).`);
  return value;
}

export const cfg = {
  rpcUrl: need("RPC_URL"),
  passphrase: need("NETWORK_PASSPHRASE"),
  contractId: need("CONTRACT_ID"),
  tokenId: need("TOKEN_CONTRACT_ID"),
};

export type Role =
  | "admin" | "sponsor1" | "sponsor2" | "parent" | "inspector1"
  | "inspector2" | "builder" | "supplier" | "labour" | "platform";

/** Public addresses. Safe to commit, safe to log. */
export const addr: Record<Role, string> & { issuer: string } = JSON.parse(
  readFileSync(resolve(root, "scripts/accounts.json"), "utf8"),
);

/** Loads a role's key and checks it really belongs to that role's address. */
export function keypair(role: Role | "issuer"): Keypair {
  const kp = Keypair.fromSecret(need(`${role.toUpperCase()}_SECRET`));
  if (kp.publicKey() !== addr[role]) throw new Error(`Key mismatch for ${role}`);
  return kp;
}

// ---- money: whole-number units only, 7 decimals, never floats ----
export const UNITS_PER_TUSDC = 10_000_000n;
/** Fixed demo rate. Shown to users as "demo rate", never as a live price. */
export const RUPEES_PER_TUSDC = 85n;

export const rupeesToUnits = (rupees: bigint) => (rupees * UNITS_PER_TUSDC) / RUPEES_PER_TUSDC;

/** Back to whole rupees for the screens, rounded to the nearest rupee. */
export const unitsToRupees = (units: bigint) =>
  Number((units * RUPEES_PER_TUSDC + UNITS_PER_TUSDC / 2n) / UNITS_PER_TUSDC);

/** 1234567890n becomes "123.45" (for printing only). */
export function formatUnits(units: bigint): string {
  const sign = units < 0n ? "-" : "";
  const abs = units < 0n ? -units : units;
  const cents = (abs % UNITS_PER_TUSDC) / 100_000n;
  return `${sign}${abs / UNITS_PER_TUSDC}.${cents.toString().padStart(2, "0")}`;
}
