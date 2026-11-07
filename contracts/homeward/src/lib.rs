#![no_std]
//! Homeward: build money locked by construction stage.
//! Ved: create_project, open_stage, decide, release, recheck.
//! Youdis: fund, assign_inspector, submit_proof, freeze, resolve.

mod storage;
mod types;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, BytesN, Env, Vec};
use storage::*;
pub use types::*;

#[contract]
pub struct Homeward;

#[contractimpl]
impl Homeward {
    /// Runs once, at deploy. Stores who the admin is, which token we use,
    /// where platform fees go, and the fee in basis points (150 = 1.5%).
    pub fn __constructor(e: Env, admin: Address, token: Address, platform: Address, fee_bps: u32) {
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::Platform, &platform);
        e.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        e.storage().instance().set(&DataKey::NextId, &0u32);
        bump_instance(&e);
    }

    // ---------- write functions go here (see dev guide §5.4–5.7) ----------

    /// Admin set up a build: who ever is involved and every stage's money + payees.
    /// Payees are fixed FOREVER after this call.
    pub fn create_project(
        e: Env,
        sponsors: Vec<Address>,
        parent: Address,
        builder: Address,
        supplier: Address,
        stages: Vec<StageInput>,
    ) -> Result<u32, Error> {
        admin(&e).require_auth();
        if sponsors.is_empty() || stages.is_empty() {
            return Err(Error::BadAmount);
        }
        for s in stages.iter() {
            if s.materials < 0 || s.labour_amount < 0 {
                return Err(Error::BadAmount);
            }
            if s.payees.is_empty() {
                return Err(Error::BadAmount);
            }
            let mut sum: u32 = 0;
            for p in s.payees.iter() {
                sum += p.bps;
            }
            if sum != 10_000 {
                return Err(Error::BadShares);
            }
        }

        let id = next_id(&e);
        let project = Project {
            sponsors,
            parent,
            builder,
            supplier,
            stage_count: stages.len(),
            funded: 0,
            spent: 0,
            frozen: false,
        };
        save_project(&e, id, &project);

        let mut i: u32 = 0;
        for s in stages.iter() {
            let st = Stage {
                materials: s.materials,
                labour_amount: s.labour_amount,
                payees: s.payees,
                parent_must_approve: s.parent_must_approve,
                pre_pour: s.pre_pour,
                hold_secs: s.hold_secs,
                status: StageStatus::Locked,
                inspector: None,
                inspector2: None,
                approvals_needed: 1,
                approvals: Vec::new(&e),
                parent_ok: false,
                code_hash: None,
                video_hash: None,
                approved_at: 0,
            };
            save_stage(&e, id, i, &st);
            i += 1;
        }
        bump_instance(&e);
        e.events().publish((symbol_short!("created"), id), project.stage_count);
        Ok(id)
    }

    // ---------- read-only views (free to call, no signature needed) ----------
    pub fn get_project(e: Env, id: u32) -> Result<Project, Error> {
        load_project(&e, id)
    }
    pub fn get_stage(e: Env, id: u32, stage: u32) -> Result<Stage, Error> {
        load_stage(&e, id, stage)
    }
    pub fn get_certificate(e: Env, id: u32, stage: u32) -> Option<Certificate> {
        load_cert(&e, id, stage)
    }
    pub fn contribution(e: Env, id: u32, sponsor: Address) -> i128 {
        storage::contribution(&e, id, &sponsor)
    }
    pub fn config(e: Env) -> (Address, Address, Address, u32) {
        (admin(&e), token(&e), platform(&e), fee_bps(&e))
    }
}
