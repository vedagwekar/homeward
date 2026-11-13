// The signing wrapper: every contract call in the backend goes through here.
// Keys stay on the server. The browser only ever sees hashes and results.
import { Account, Address, Asset, BASE_FEE, Contract, Horizon, Networks, Operation, TransactionBuilder, nativeToScVal, rpc, scValToNative } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Client, Errors } from "homeward-client";
export { StageStatus, type StageInput } from "homeward-client";
import { addr, cfg, keypair, type Role } from "./config";

// Testnet connections drop now and then. Retrying is safe even when submitting,
// because a signed transaction can only ever execute once.
const networkFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await networkFetch(input, init);
    } catch (err) {
      const stopped = ["AbortError", "TimeoutError"].includes((err as Error).name);
      if (stopped || attempt >= 4) throw err;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
};

/** Contract error names (types.rs) in words a family can read. */
const FRIENDLY: Record<string, string> = {
  NotFound: "We couldn't find that build or stage.",
  BadShares: "The payment split must add up to 100%.",
  NotAuthorized: "This person isn't allowed to do that.",
  WrongStatus: "This stage isn't ready for that step yet.",
  Frozen: "This build has been stopped, so nothing can be paid.",
  InsufficientFunds: "There isn't enough money locked for this stage yet.",
  NotSponsor: "Only family members on this build can add money.",
  TooEarly: "The handover waiting period hasn't finished yet.",
  NoInspector: "A second engineer needs to be assigned first.",
  AlreadyApproved: "This engineer has already approved this stage.",
  BadAmount: "Please enter an amount above zero.",
};

export class ChainError extends Error {
  constructor(public readonly code: string) {
    super(FRIENDLY[code] ?? code);
  }
}

type Unwrapped<T> = T extends { unwrap(): infer U } ? U : T;

/**
 * Turns "Error(Contract, #3)" into a ChainError. The SDK's own Err has an empty
 * message because the contract's error enum has no doc comments.
 */
function refusalIn(text: unknown): ChainError | null {
  const match = /Error\(Contract, #(\d+)\)/.exec(String(text ?? ""));
  if (!match) return null;
  const known = Errors[Number(match[1]) as keyof typeof Errors];
  return new ChainError(known?.message ?? `Error${match[1]}`);
}

function unwrap<T>(value: T): Unwrapped<T> {
  const r = value as any;
  if (r && typeof r.isErr === "function") {
    if (r.isErr()) throw new ChainError(r.unwrapErr().message);
    return r.unwrap();
  }
  return value as Unwrapped<T>;
}

function throwIfRefused(tx: { simulation?: unknown }) {
  const refusal = refusalIn((tx.simulation as { error?: string } | undefined)?.error);
  if (refusal) throw refusal;
}

/** A contract client that signs as one role. */
export function clientFor(role: Role) {
  const kp = keypair(role);
  const { signTransaction, signAuthEntry } = basicNodeSigner(kp, cfg.passphrase);
  return new Client({
    contractId: cfg.contractId,
    networkPassphrase: cfg.passphrase,
    rpcUrl: cfg.rpcUrl,
    publicKey: kp.publicKey(),
    signTransaction,
    signAuthEntry,
  });
}

export const explorerTx = (hash: string) => `https://stellar.expert/explorer/testnet/tx/${hash}`;

// Only the parts of the SDK's transaction object that we use.
interface Assembled<T> {
  simulation?: unknown;
  result: T;
  signAndSend(): Promise<{ sendTransactionResponse?: { hash: string }; result: T }>;
}

/** Signs and submits a write. A refusal from the contract becomes a ChainError. */
export async function send<T>(call: Promise<Assembled<T>>) {
  const tx = await call;
  throwIfRefused(tx); // the simulation already knows if the contract will refuse
  unwrap(tx.result);
  let sent;
  try {
    sent = await tx.signAndSend();
  } catch (err) {
    throw refusalIn(err) ?? err;
  }
  const hash = sent.sendTransactionResponse?.hash;
  if (!hash) throw new Error("The network did not return a transaction hash.");
  return { hash, explorer: explorerTx(hash), result: unwrap(sent.result) };
}

/** Runs a read-only call. Free: nothing is submitted. */
export async function read<T>(call: Promise<{ result: T; simulation?: unknown }>): Promise<Unwrapped<T>> {
  const tx = await call;
  throwIfRefused(tx);
  return unwrap(tx.result);
}

/** TUSDC balance of any account or contract, in units. */
export async function tokenBalance(owner: string): Promise<bigint> {
  const server = new rpc.Server(cfg.rpcUrl);
  const tx = new TransactionBuilder(new Account(addr.admin, "0"), {
    fee: BASE_FEE,
    networkPassphrase: cfg.passphrase,
  })
    .addOperation(new Contract(cfg.tokenId).call("balance", nativeToScVal(Address.fromString(owner))))
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) throw new Error(`Could not read the balance of ${owner}`);
  return scValToNative(sim.result.retval) as bigint;
}

/**
 * Demo only: keeps test sponsors funded so the demo can be repeated. Does nothing
 * when the issuer key isn't configured.
 */
export async function ensureTusdc(role: "sponsor1" | "sponsor2", needed: bigint) {
  if (!process.env.ISSUER_SECRET || (await tokenBalance(addr[role])) >= needed) return false;
  const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
  const issuer = keypair("issuer");
  const tx = new TransactionBuilder(await horizon.loadAccount(issuer.publicKey()), {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.payment({
      destination: addr[role],
      asset: new Asset("TUSDC", issuer.publicKey()),
      amount: "50000",
    }))
    .setTimeout(180)
    .build();
  tx.sign(issuer);
  await horizon.submitTransaction(tx);
  return true;
}
