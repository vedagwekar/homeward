//! Storage helpers. Always read and write through these, so every entry's
//! time-to-live (TTL) is extended and data doesn't get archived mid-demo.

use crate::types::*;
use soroban_sdk::{Address, Env};

pub const DAY_LEDGERS: u32 = 17_280; // ~5 s per ledger
pub const BUMP_AMOUNT: u32 = 30 * DAY_LEDGERS; // keep alive ~30 days
pub const BUMP_THRESHOLD: u32 = 7 * DAY_LEDGERS; // re-extend when < 7 days left

pub fn bump_instance(e: &Env) {
    e.storage().instance().extend_ttl(BUMP_THRESHOLD, BUMP_AMOUNT);
}

fn bump(e: &Env, k: &DataKey) {
    e.storage().persistent().extend_ttl(k, BUMP_THRESHOLD, BUMP_AMOUNT);
}

// ---- contract-wide settings (instance storage) ----
pub fn admin(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap()
}
pub fn token(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Token).unwrap()
}
pub fn platform(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Platform).unwrap()
}
pub fn fee_bps(e: &Env) -> u32 {
    e.storage().instance().get(&DataKey::FeeBps).unwrap()
}

/// Returns the next project id and increments the counter.
pub fn next_id(e: &Env) -> u32 {
    let id: u32 = e.storage().instance().get(&DataKey::NextId).unwrap_or(0);
    e.storage().instance().set(&DataKey::NextId, &(id + 1));
    id
}

// ---- projects ----
pub fn load_project(e: &Env, id: u32) -> Result<Project, Error> {
    let k = DataKey::Project(id);
    let p = e.storage().persistent().get(&k).ok_or(Error::NotFound)?;
    bump(e, &k);
    Ok(p)
}
pub fn save_project(e: &Env, id: u32, p: &Project) {
    let k = DataKey::Project(id);
    e.storage().persistent().set(&k, p);
    bump(e, &k);
}

// ---- stages ----
pub fn load_stage(e: &Env, id: u32, s: u32) -> Result<Stage, Error> {
    let k = DataKey::Stage(id, s);
    let st = e.storage().persistent().get(&k).ok_or(Error::NotFound)?;
    bump(e, &k);
    Ok(st)
}
pub fn save_stage(e: &Env, id: u32, s: u32, st: &Stage) {
    let k = DataKey::Stage(id, s);
    e.storage().persistent().set(&k, st);
    bump(e, &k);
}

// ---- sponsor contributions ----
pub fn contribution(e: &Env, id: u32, sponsor: &Address) -> i128 {
    let k = DataKey::Contribution(id, sponsor.clone());
    e.storage().persistent().get(&k).unwrap_or(0)
}
pub fn add_contribution(e: &Env, id: u32, sponsor: &Address, amount: i128) {
    let k = DataKey::Contribution(id, sponsor.clone());
    let prev: i128 = e.storage().persistent().get(&k).unwrap_or(0);
    e.storage().persistent().set(&k, &(prev + amount));
    bump(e, &k);
}

// ---- certificates ----
pub fn load_cert(e: &Env, id: u32, s: u32) -> Option<Certificate> {
    let k = DataKey::Cert(id, s);
    let c = e.storage().persistent().get(&k);
    if c.is_some() {
        bump(e, &k);
    }
    c
}
pub fn save_cert(e: &Env, id: u32, s: u32, c: &Certificate) {
    let k = DataKey::Cert(id, s);
    e.storage().persistent().set(&k, c);
    bump(e, &k);
}
