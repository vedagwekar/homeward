// The signing wrapper: every contract call in the backend goes through here.
// Keys stay on the server. The browser only ever sees hashes and results.
import { Account, Address, BASE_FEE, Contract, TransactionBuilder, nativeToScVal, rpc, scValToNative } from "@stellar/stellar-sdk";
import { basicNodeSigner } from "@stellar/stellar-sdk/contract";
import { Client } from "homeward-client";
export { StageStatus, type StageInput } from "homeward-client";
import { addr, cfg, keypair, type Role } from "./config";

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

function unwrap<T>(value: T): Unwrapped<T> {
  const r = value as any;
  if (r && typeof r.isErr === "function") {
    if (r.isErr()) throw new ChainError(r.unwrapErr().message);
    return r.unwrap();
  }
  return value as Unwrapped<T>;
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
  result: T;
  signAndSend(): Promise<{ sendTransactionResponse?: { hash: string }; result: T }>;
}

/** Signs and submits a write. A refusal from the contract becomes a ChainError. */
export async function send<T>(call: Promise<Assembled<T>>) {
  const tx = await call;
  unwrap(tx.result); // the simulation already knows if the contract will refuse
  const sent = await tx.signAndSend();
  const hash = sent.sendTransactionResponse?.hash;
  if (!hash) throw new Error("The network did not return a transaction hash.");
  return { hash, explorer: explorerTx(hash), result: unwrap(sent.result) };
}

/** Runs a read-only call. Free: nothing is submitted. */
export async function read<T>(call: Promise<{ result: T }>): Promise<Unwrapped<T>> {
  return unwrap((await call).result);
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
