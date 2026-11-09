import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO",
  }
} as const

export const Errors = {
  1: {message:"NotFound"},
  2: {message:"BadShares"},
  3: {message:"NotAuthorized"},
  4: {message:"WrongStatus"},
  5: {message:"Frozen"},
  6: {message:"InsufficientFunds"},
  7: {message:"NotSponsor"},
  8: {message:"TooEarly"},
  9: {message:"NoInspector"},
  10: {message:"AlreadyApproved"},
  11: {message:"BadAmount"}
}


/**
 * One person paid from a stage's labour amount, by basis points (10_000 = 100%).
 */
export interface Payee {
  bps: u32;
  to: string;
}


/**
 * A stage as stored on chain.
 */
export interface Stage {
  approvals: Array<string>;
  approvals_needed: u32;
  approved_at: u64;
  code_hash: Option<Buffer>;
  hold_secs: u64;
  inspector: Option<string>;
  inspector2: Option<string>;
  labour_amount: i128;
  materials: i128;
  parent_must_approve: boolean;
  parent_ok: boolean;
  payees: Array<Payee>;
  pre_pour: boolean;
  report_hash: Option<Buffer>;
  status: StageStatus;
  video_hash: Option<Buffer>;
}


export interface Project {
  builder: string;
  frozen: boolean;
  funded: i128;
  parent: string;
  spent: i128;
  sponsors: Array<string>;
  stage_count: u32;
  supplier: string;
}


/**
 * What the admin supplies per stage in create_project.
 */
export interface StageInput {
  hold_secs: u64;
  labour_amount: i128;
  materials: i128;
  parent_must_approve: boolean;
  payees: Array<Payee>;
  pre_pour: boolean;
}


/**
 * Recorded when a stage is paid. Anyone can read it.
 */
export interface Certificate {
  amount: i128;
  approvers: Array<string>;
  project: u32;
  report_hash: Buffer;
  stage: u32;
  time: u64;
}

export enum StageStatus {
  Locked = 0,
  Open = 1,
  Submitted = 2,
  Approved = 3,
  Rejected = 4,
  Paid = 5,
}

export interface Client {
  /**
   * Construct and simulate a fund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  fund: ({sponsor, id, amount}: {sponsor: string, id: u32, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  config: (options?: MethodOptions) => Promise<AssembledTransaction<readonly [string, string, string, u32]>>

  /**
   * Construct and simulate a decide transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * An inspector or the parent approves or rejects a submitted stage.
   * When every required approval is in, money is released (now, or after the hold).
   */
  decide: ({approver, id, stage, approve, report_hash}: {approver: string, id: u32, stage: u32, approve: boolean, report_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a freeze transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The parent or a sponsor stops the project. Nothing pays out while it's frozen.
   */
  freeze: ({caller, id}: {caller: string, id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a recheck transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * The parent or a sponsor asks for a second engineer before money moves.
   * Works any time before the stage is paid. During a handover hold it pulls
   * an approved stage back to Submitted, so nothing can release until both
   * engineers have approved.
   */
  recheck: ({caller, id, stage}: {caller: string, id: u32, stage: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pays every payee of an approved stage in ONE call and records a certificate.
   * Anyone may call it once the hold time has passed (no auth needed: the
   * money can only ever go to the fixed payees).
   */
  release: ({id, stage}: {id: u32, stage: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a resolve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin settles a frozen project. `refund_bps` of the unspent money goes back
   * to sponsors in proportion to what they paid in, and the rest goes to the
   * builder for work done. The project stays frozen.
   */
  resolve: ({id, refund_bps}: {id: u32, refund_bps: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_stage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_stage: ({id, stage}: {id: u32, stage: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Stage>>>

  /**
   * Construct and simulate a open_stage transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin starts a stage: checks the money is there, pays the supplier for
   * materials, and stores the hash of the stage code shown to the builder.
   */
  open_stage: ({id, stage, code_hash}: {id: u32, stage: u32, code_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project: ({id}: {id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Project>>>

  /**
   * Construct and simulate a contribution transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  contribution: ({id, sponsor}: {id: u32, sponsor: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a submit_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  submit_proof: ({id, stage, video_hash}: {id: u32, stage: u32, video_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Admin set up a build: who ever is involved and every stage's money + payees.
   * Payees are fixed FOREVER after this call.
   */
  create_project: ({sponsors, parent, builder, supplier, stages}: {sponsors: Array<string>, parent: string, builder: string, supplier: string, stages: Array<StageInput>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a get_certificate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_certificate: ({id, stage}: {id: u32, stage: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Certificate>>>

  /**
   * Construct and simulate a assign_inspector transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  assign_inspector: ({id, stage, inspector, slot}: {id: u32, stage: u32, inspector: string, slot: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, token, platform, fee_bps}: {admin: string, token: string, platform: string, fee_bps: u32},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin, token, platform, fee_bps}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAAAAAAAEZnVuZAAAAAMAAAAAAAAAB3Nwb25zb3IAAAAAEwAAAAAAAAACaWQAAAAAAAQAAAAAAAAABmFtb3VudAAAAAAACwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAGY29uZmlnAAAAAAAAAAAAAQAAA+0AAAAEAAAAEwAAABMAAAATAAAABA==",
        "AAAAAAAAAJFBbiBpbnNwZWN0b3Igb3IgdGhlIHBhcmVudCBhcHByb3ZlcyBvciByZWplY3RzIGEgc3VibWl0dGVkIHN0YWdlLgpXaGVuIGV2ZXJ5IHJlcXVpcmVkIGFwcHJvdmFsIGlzIGluLCBtb25leSBpcyByZWxlYXNlZCAobm93LCBvciBhZnRlciB0aGUgaG9sZCkuAAAAAAAABmRlY2lkZQAAAAAABQAAAAAAAAAIYXBwcm92ZXIAAAATAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAFc3RhZ2UAAAAAAAAEAAAAAAAAAAdhcHByb3ZlAAAAAAEAAAAAAAAAC3JlcG9ydF9oYXNoAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAE5UaGUgcGFyZW50IG9yIGEgc3BvbnNvciBzdG9wcyB0aGUgcHJvamVjdC4gTm90aGluZyBwYXlzIG91dCB3aGlsZSBpdCdzIGZyb3plbi4AAAAAAAZmcmVlemUAAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAACaWQAAAAAAAQAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAO9UaGUgcGFyZW50IG9yIGEgc3BvbnNvciBhc2tzIGZvciBhIHNlY29uZCBlbmdpbmVlciBiZWZvcmUgbW9uZXkgbW92ZXMuCldvcmtzIGFueSB0aW1lIGJlZm9yZSB0aGUgc3RhZ2UgaXMgcGFpZC4gRHVyaW5nIGEgaGFuZG92ZXIgaG9sZCBpdCBwdWxscwphbiBhcHByb3ZlZCBzdGFnZSBiYWNrIHRvIFN1Ym1pdHRlZCwgc28gbm90aGluZyBjYW4gcmVsZWFzZSB1bnRpbCBib3RoCmVuZ2luZWVycyBoYXZlIGFwcHJvdmVkLgAAAAAHcmVjaGVjawAAAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAAVzdGFnZQAAAAAAAAQAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAL9QYXlzIGV2ZXJ5IHBheWVlIG9mIGFuIGFwcHJvdmVkIHN0YWdlIGluIE9ORSBjYWxsIGFuZCByZWNvcmRzIGEgY2VydGlmaWNhdGUuCkFueW9uZSBtYXkgY2FsbCBpdCBvbmNlIHRoZSBob2xkIHRpbWUgaGFzIHBhc3NlZCAobm8gYXV0aCBuZWVkZWQ6IHRoZQptb25leSBjYW4gb25seSBldmVyIGdvIHRvIHRoZSBmaXhlZCBwYXllZXMpLgAAAAAHcmVsZWFzZQAAAAACAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAFc3RhZ2UAAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAMVBZG1pbiBzZXR0bGVzIGEgZnJvemVuIHByb2plY3QuIGByZWZ1bmRfYnBzYCBvZiB0aGUgdW5zcGVudCBtb25leSBnb2VzIGJhY2sKdG8gc3BvbnNvcnMgaW4gcHJvcG9ydGlvbiB0byB3aGF0IHRoZXkgcGFpZCBpbiwgYW5kIHRoZSByZXN0IGdvZXMgdG8gdGhlCmJ1aWxkZXIgZm9yIHdvcmsgZG9uZS4gVGhlIHByb2plY3Qgc3RheXMgZnJvemVuLgAAAAAAAAdyZXNvbHZlAAAAAAIAAAAAAAAAAmlkAAAAAAAEAAAAAAAAAApyZWZ1bmRfYnBzAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAJZ2V0X3N0YWdlAAAAAAAAAgAAAAAAAAACaWQAAAAAAAQAAAAAAAAABXN0YWdlAAAAAAAABAAAAAEAAAPpAAAH0AAAAAVTdGFnZQAAAAAAAAM=",
        "AAAAAAAAAI1BZG1pbiBzdGFydHMgYSBzdGFnZTogY2hlY2tzIHRoZSBtb25leSBpcyB0aGVyZSwgcGF5cyB0aGUgc3VwcGxpZXIgZm9yCm1hdGVyaWFscywgYW5kIHN0b3JlcyB0aGUgaGFzaCBvZiB0aGUgc3RhZ2UgY29kZSBzaG93biB0byB0aGUgYnVpbGRlci4AAAAAAAAKb3Blbl9zdGFnZQAAAAAAAwAAAAAAAAACaWQAAAAAAAQAAAAAAAAABXN0YWdlAAAAAAAABAAAAAAAAAAJY29kZV9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAAD",
        "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" ]),
      options
    )
  }
  public readonly fromJSON = {
    fund: this.txFromJSON<Result<void>>,
        config: this.txFromJSON<readonly [string, string, string, u32]>,
        decide: this.txFromJSON<Result<void>>,
        freeze: this.txFromJSON<Result<void>>,
        recheck: this.txFromJSON<Result<void>>,
        release: this.txFromJSON<Result<void>>,
        resolve: this.txFromJSON<Result<void>>,
        get_stage: this.txFromJSON<Result<Stage>>,
        open_stage: this.txFromJSON<Result<void>>,
        get_project: this.txFromJSON<Result<Project>>,
        contribution: this.txFromJSON<i128>,
        submit_proof: this.txFromJSON<Result<void>>,
        create_project: this.txFromJSON<Result<u32>>,
        get_certificate: this.txFromJSON<Option<Certificate>>,
        assign_inspector: this.txFromJSON<Result<void>>
  }
}