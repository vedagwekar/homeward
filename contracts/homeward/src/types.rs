//! Shared data types for the Homeward contract.
//! Everyone builds on these. Ask Ved before adding or renaming a field:
//! changing a stored struct after deploy breaks reading old data.

use soroban_sdk::{contracterror, contracttype, Address, BytesN, Vec};

/// Keys for everything we put in storage.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    // Instance storage (contract-wide settings)
    Admin,
    Token,
    Platform,
    FeeBps,
    NextId,
    // Persistent storage (per project / stage / sponsor)
    Project(u32),
    Stage(u32, u32), // (project_id, stage_index)
    Contribution(u32, Address),
    Cert(u32, u32),
    Claim(u32), // an open default claim for a project
    Credit(Address), // fee-free funding a sponsor earned back from a defaulted build
}

/// One person paid from a stage's labour amount, by basis points (10_000 = 100%).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payee {
    pub to: Address,
    pub bps: u32,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum StageStatus {
    Locked = 0,    // not started, money untouched
    Open = 1,      // supplier paid for materials, builder working
    Submitted = 2, // builder sent proof video, waiting for approvals
    Approved = 3,  // approvals in, waiting for the hold time (if any)
    Rejected = 4,  // inspector rejected; builder can submit again
    Paid = 5,      // labour paid out, certificate recorded
}

/// The builder's security terms. The admin sets them in create_project, agreed with the
/// family and the builder beforehand, and nobody can change them afterwards.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SecurityTerms {
    pub deposit: i128,      // deposit the builder keeps with the contract (0 = none)
    pub upfront: i128,      // part of it that must be posted before the first stage opens
    pub retention_bps: u32, // share of each stage's labour held back from the builder (max 20%)
    pub defects_secs: u64,  // wait after the last stage is paid before the builder gets it all back
    pub stall_secs: u64,    // a stage waiting on the builder this long can be declared a default
    pub response_secs: u64, // time the builder has to respond to a default claim
}

/// A request to end the build because the builder failed. Needs an objective stall or an engineer.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Claim {
    pub stage: u32,
    pub at: u64,         // when the builder's response window started
    pub confirmed: bool, // stalled for long enough, or an engineer on that stage confirmed it
    pub contested: bool, // the builder disputed it, so only the admin can settle it
    pub stalled: bool,   // raised on a stall, so new proof from the builder cancels it
}

/// What the admin supplies per stage in create_project.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StageInput {
    pub materials: i128,     // paid to the supplier at open_stage (can be 0)
    pub labour_amount: i128, // split across payees at release
    pub payees: Vec<Payee>,  // bps must sum to 10_000; last payee gets rounding
    pub parent_must_approve: bool,
    pub pre_pour: bool, // label only: UI shows "steel check before pour"
    pub hold_secs: u64, // handover hold after approval (0 = pay immediately)
}

/// A stage as stored on chain.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stage {
    pub materials: i128,
    pub labour_amount: i128,
    pub payees: Vec<Payee>,
    pub parent_must_approve: bool,
    pub pre_pour: bool,
    pub hold_secs: u64,
    pub status: StageStatus,
    pub inspector: Option<Address>,
    pub inspector2: Option<Address>,
    pub approvals_needed: u32, // 1 normally, 2 after a recheck
    pub approvals: Vec<Address>, // inspectors who have approved
    pub parent_ok: bool,
    pub code_hash: Option<BytesN<32>>,  // sha256 of the stage code
    pub video_hash: Option<BytesN<32>>, // sha256 of the proof video
    pub approved_at: u64,
    pub report_hash: Option<BytesN<32>>, // sha256 of the engineer's report
    pub since: u64, // when the stage last started waiting on the builder (opened or rejected)
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub sponsors: Vec<Address>,
    pub parent: Address,
    pub builder: Address,
    pub supplier: Address,
    pub stage_count: u32,
    pub funded: i128, // total locked in by sponsors (fees excluded)
    pub spent: i128,  // total paid out so far
    pub frozen: bool,
    pub terms: SecurityTerms,
    pub deposit_held: i128,   // the builder's deposit now held by the contract
    pub retention_held: i128, // labour held back from the builder so far
    pub stages_paid: u32,
    pub completed_at: u64, // when the last stage was paid (only meaningful once stages_paid == stage_count)
    pub defaulted: bool,
    pub security_returned: bool,
}

/// Recorded when a stage is paid. Anyone can read it.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Certificate {
    pub project: u32,
    pub stage: u32,
    pub time: u64,
    pub approvers: Vec<Address>,
    pub report_hash: BytesN<32>, // sha256 of the inspection note
    pub amount: i128,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotFound = 1,
    BadShares = 2,
    NotAuthorized = 3,
    WrongStatus = 4,
    Frozen = 5,
    InsufficientFunds = 6,
    NotSponsor = 7,
    TooEarly = 8,
    NoInspector = 9,
    AlreadyApproved = 10,
    BadAmount = 11,
    DepositNeeded = 12, // the first stage can't open until the upfront deposit is posted
    NotStalled = 13,    // a stall claim no longer holds because the builder responded
    ClaimOpen = 14,     // a default claim is already open
    NoClaim = 15,
    TooLate = 16, // the builder's response window has closed
}
