#![no_std]
//! Homeward: build money locked by construction stage.
//! Ved: create_project, open_stage, decide, release, recheck.
//! Youdis: fund, assign_inspector, submit_proof, freeze, resolve.

mod storage;
mod types;
#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env};
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
