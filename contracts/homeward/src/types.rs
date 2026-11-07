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
}
