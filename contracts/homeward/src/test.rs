#![cfg(test)]
//! Unit tests. Run with `cargo test` (no network needed).
//! `setup()` gives every test a fresh contract, a fake token and funded people.

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, BytesN, Env,
};

/// Everything a test needs. Field names match the roles in the dev guide.
pub struct T<'a> {
    pub e: Env,
    pub c: HomewardClient<'a>,
    pub tok: TokenClient<'a>,
    pub admin: Address,
    pub platform: Address,
    pub s1: Address,
    pub s2: Address,
    pub parent: Address,
    pub builder: Address,
    pub supplier: Address,
    pub labour: Address,
    pub i1: Address,
    pub i2: Address,
}

/// Each sponsor starts with this many units (= 100 TUSDC at 7 decimals).
pub const START_BALANCE: i128 = 1_000_000_000;

pub fn setup<'a>() -> T<'a> {
    let e = Env::default();
    // Pretend every require_auth() is signed, so tests focus on logic.
    // To test auth itself, use e.auths() after a call.
    e.mock_all_auths();

    let admin = Address::generate(&e);
    let platform = Address::generate(&e);

    // A fake token standing in for TUSDC.
    let issuer = Address::generate(&e);
    let sac = e.register_stellar_asset_contract_v2(issuer);
    let tok_addr = sac.address();

    // Deploy Homeward, passing constructor args (fee 150 bps = 1.5%).
    let id = e.register(Homeward, (&admin, &tok_addr, &platform, 150u32));
    let c = HomewardClient::new(&e, &id);

    let s1 = Address::generate(&e);
    let s2 = Address::generate(&e);
    let mint = StellarAssetClient::new(&e, &tok_addr);
    mint.mint(&s1, &START_BALANCE);
    mint.mint(&s2, &START_BALANCE);
    let tok = TokenClient::new(&e, &tok_addr);

    T {
        parent: Address::generate(&e),
        builder: Address::generate(&e),
        supplier: Address::generate(&e),
        labour: Address::generate(&e),
        i1: Address::generate(&e),
        i2: Address::generate(&e),
        e, c, tok, admin, platform, s1, s2,
    }
}

/// A fake 32-byte hash filled with byte `b` (for code/video/report hashes).
pub fn h(e: &Env, b: u8) -> BytesN<32> {
    BytesN::from_array(e, &[b; 32])
}

// TODO (Ved): add `fn project(t: &T, parent_must: bool) -> u32` once
// create_project exists. It creates 1 stage: materials 100, labour 1000,
// payees labour 40% / builder 60%.

#[test]
fn t0_setup_works() {
    let t = setup();
    let (admin, token, platform, fee) = t.c.config();
    assert_eq!(admin, t.admin);
    assert_eq!(token, t.tok.address);
    assert_eq!(platform, t.platform);
    assert_eq!(fee, 150);
    assert_eq!(t.tok.balance(&t.s1), START_BALANCE);
    assert_eq!(t.tok.balance(&t.s2), START_BALANCE);
    // No project yet → NotFound error, not a crash.
    assert_eq!(t.c.try_get_project(&0), Err(Ok(Error::NotFound)));
    assert_eq!(t.c.get_certificate(&0, &0), None);
    let _ = h(&t.e, 1);
}
