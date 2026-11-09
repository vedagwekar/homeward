#![cfg(test)]
//! Unit tests. Run with `cargo test` (no network needed).
//! `setup()` gives every test a fresh contract, a fake token and funded people.

extern crate std;

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    token::{StellarAssetClient, TokenClient},
    vec, Address, BytesN, Env,
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
        e,
        c,
        tok,
        admin,
        platform,
        s1,
        s2,
    }
}

/// A fake 32-byte hash filled with byte `b` (for code/video/report hashes).
pub fn h(e: &Env, b: u8) -> BytesN<32> {
    BytesN::from_array(e, &[b; 32])
}

/// Creates a 1-stage project: materials 100 (to supplier), labour 1000 split
/// 40% to labour, 60% to builder. Returns the project ID.
pub fn project(t: &T, parent_must: bool) -> u32 {
    let payees = vec![
        &t.e,
        Payee {
            to: t.labour.clone(),
            bps: 4_000,
        },
        Payee {
            to: t.builder.clone(),
            bps: 6_000,
        },
    ];
    let stages = vec![
        &t.e,
        StageInput {
            materials: 100,
            labour_amount: 1_000,
            payees,
            parent_must_approve: parent_must,
            pre_pour: true,
            hold_secs: 0,
        },
    ];
    t.c.create_project(
        &vec![&t.e, t.s1.clone(), t.s2.clone()],
        &t.parent,
        &t.builder,
        &t.supplier,
        &stages,
    )
}

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

#[test]
fn t4_bad_shares_rejected() {
    let t = setup();
    let payees = vec![
        &t.e,
        Payee {
            to: t.labour.clone(),
            bps: 4_000,
        },
        Payee {
            to: t.builder.clone(),
            bps: 5_000,
        }, // only 90% in total
    ];
    let stages = vec![
        &t.e,
        StageInput {
            materials: 100,
            labour_amount: 1_000,
            payees,
            parent_must_approve: false,
            pre_pour: false,
            hold_secs: 0,
        },
    ];
    let r = t.c.try_create_project(
        &vec![&t.e, t.s1.clone()],
        &t.parent,
        &t.builder,
        &t.supplier,
        &stages,
    );
    assert_eq!(r, Err(Ok(Error::BadShares)));
}

#[test]
fn create_project_stores_everything() {
    let t = setup();
    let id = project(&t, false);
    assert_eq!(id, 0);
    let p = t.c.get_project(&id);
    assert_eq!(p.stage_count, 1);
    assert_eq!(p.funded, 0);
    let st = t.c.get_stage(&id, &0);
    assert_eq!(st.status, StageStatus::Locked);
    assert_eq!(st.approvals_needed, 1);
    assert_eq!(project(&t, false), 1); // ids count up
}

#[test]
fn fund_works() {
    let t = setup();
    let id = project(&t, false);

    let sponsor_before = t.tok.balance(&t.s1);

    t.c.fund(&t.s1, &id, &1000);

    assert_eq!(t.tok.balance(&t.s1), sponsor_before - 1015);
    assert_eq!(t.tok.balance(&t.platform), 15);
    assert_eq!(t.tok.balance(&t.c.address), 1000);
    assert_eq!(t.c.get_project(&id).funded, 1000);
    assert_eq!(t.c.contribution(&id, &t.s1), 1000);
}

#[test]
fn t2_stranger_cannot_fund() {
    let t = setup();
    let id = project(&t, false);

    let stranger = Address::generate(&t.e);

    assert_eq!(
        t.c.try_fund(&stranger, &id, &1000),
        Err(Ok(Error::NotSponsor))
    );
}

#[test]
fn zero_amount_fails() {
    let t = setup();
    let id = project(&t, false);

    assert_eq!(t.c.try_fund(&t.s1, &id, &0), Err(Ok(Error::BadAmount)));
}

#[test]
fn assign_inspector_works() {
    let t = setup();
    let id = project(&t, false);

    t.c.assign_inspector(&id, &0, &t.i1, &1);
    t.c.assign_inspector(&id, &0, &t.i2, &2);

    let st = t.c.get_stage(&id, &0);

    assert_eq!(st.inspector, Some(t.i1.clone()));
    assert_eq!(st.inspector2, Some(t.i2.clone()));
}

#[test]
fn submit_proof_rejects_locked_stage() {
    let t = setup();
    let id = project(&t, false);

    let video_hash = h(&t.e, 42);

    assert_eq!(
        t.c.try_submit_proof(&id, &0, &video_hash),
        Err(Ok(Error::WrongStatus))
    );
}

// ---------- stage flow: open, approve, split pay (Ved) ----------

/// One-stage project with custom labour, parent sign-off and hold time.
fn custom(t: &T, labour: i128, parent_must: bool, hold_secs: u64) -> u32 {
    let payees = vec![
        &t.e,
        Payee {
            to: t.labour.clone(),
            bps: 4_000,
        },
        Payee {
            to: t.builder.clone(),
            bps: 6_000,
        },
    ];
    let stages = vec![
        &t.e,
        StageInput {
            materials: 100,
            labour_amount: labour,
            payees,
            parent_must_approve: parent_must,
            pre_pour: true,
            hold_secs,
        },
    ];
    t.c.create_project(
        &vec![&t.e, t.s1.clone(), t.s2.clone()],
        &t.parent,
        &t.builder,
        &t.supplier,
        &stages,
    )
}

/// Runs the real steps up to "waiting for the engineer": fund, open, assign, proof.
fn to_submitted(t: &T, id: u32) {
    t.c.fund(&t.s1, &id, &2_000);
    t.c.open_stage(&id, &0, &h(&t.e, 1));
    t.c.assign_inspector(&id, &0, &t.i1, &1);
    t.c.assign_inspector(&id, &0, &t.i2, &2);
    t.c.submit_proof(&id, &0, &h(&t.e, 2));
}

#[test]
fn t1_no_payout_without_approval() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Submitted);
    assert_eq!(t.tok.balance(&t.supplier), 100); // materials go first
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.labour), 0);
}

#[test]
fn t2_stranger_cannot_approve() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    let stranger = Address::generate(&t.e);
    let r = t.c.try_decide(&stranger, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(r, Err(Ok(Error::NotAuthorized)));
    // The second engineer has no say until someone asks for a re-check.
    let r = t.c.try_decide(&t.i2, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(r, Err(Ok(Error::NotAuthorized)));
    assert_eq!(t.tok.balance(&t.builder), 0);
}

#[test]
fn t3_rejected_stays_locked_then_can_resubmit() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    t.c.decide(&t.i1, &id, &0, &false, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Rejected);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.labour), 0);
    assert_eq!(t.tok.balance(&t.c.address), 1_900); // 2000 funded - 100 materials

    t.c.submit_proof(&id, &0, &h(&t.e, 4));
    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 5));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
}

#[test]
fn t5_split_and_rounding() {
    let t = setup();
    // 1001 does not split evenly: 40% = 400.4, rounds down to 400.
    let id = custom(&t, 1_001, false, 0);

    // Can't open a stage the project can't fully pay for.
    assert_eq!(
        t.c.try_open_stage(&id, &0, &h(&t.e, 1)),
        Err(Ok(Error::InsufficientFunds))
    );

    to_submitted(&t, id);
    assert_eq!(
        t.c.try_open_stage(&id, &0, &h(&t.e, 1)),
        Err(Ok(Error::WrongStatus))
    ); // can't pay the supplier twice

    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));

    assert_eq!(t.tok.balance(&t.supplier), 100);
    assert_eq!(t.tok.balance(&t.labour), 400);
    assert_eq!(t.tok.balance(&t.builder), 601); // last payee gets the rounding
    assert_eq!(t.tok.balance(&t.c.address), 2_000 - 100 - 1_001);
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
    assert_eq!(t.c.get_project(&id).spent, 1_101);

    let cert = t.c.get_certificate(&id, &0).unwrap();
    assert_eq!(cert.amount, 1_001);
    assert_eq!(cert.report_hash, h(&t.e, 3));
    assert_eq!(cert.approvers, vec![&t.e, t.i1.clone()]);

    // Paying again is impossible.
    assert_eq!(
        t.c.try_release(&id, &0),
        Err(Ok(Error::WrongStatus))
    );
}

#[test]
fn parent_must_approve_blocks_payment() {
    let t = setup();
    let id = project(&t, true);
    to_submitted(&t, id);

    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Submitted);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(
        t.c.try_decide(&t.i1, &id, &0, &true, &h(&t.e, 3)),
        Err(Ok(Error::AlreadyApproved))
    );

    t.c.decide(&t.parent, &id, &0, &true, &h(&t.e, 9));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
    assert_eq!(t.tok.balance(&t.builder), 600);
    let cert = t.c.get_certificate(&id, &0).unwrap();
    assert_eq!(cert.approvers, vec![&t.e, t.i1.clone(), t.parent.clone()]);
    assert_eq!(cert.report_hash, h(&t.e, 3)); // the engineer's report, not the parent's
}

#[test]
fn t7_hold_blocks_early_release() {
    let t = setup();
    let id = custom(&t, 1_000, false, 100);
    to_submitted(&t, id);
    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Approved);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(
        t.c.try_release(&id, &0),
        Err(Ok(Error::TooEarly))
    );

    t.e.ledger().with_mut(|l| l.timestamp += 101);
    t.c.release(&id, &0);
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
    assert_eq!(t.tok.balance(&t.builder), 600);
    // release takes no hash, so the certificate keeps the engineer's report.
    assert_eq!(t.c.get_certificate(&id, &0).unwrap().report_hash, h(&t.e, 3));
}

// ---------- re-check: a second engineer before money moves (Ved) ----------

#[test]
fn t6_recheck_needs_second_inspector() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    t.c.recheck(&t.parent, &id, &0);

    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Submitted);
    assert_eq!(t.tok.balance(&t.builder), 0);

    t.c.decide(&t.i2, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
    assert_eq!(t.tok.balance(&t.labour), 400);
    assert_eq!(t.tok.balance(&t.builder), 600);
    let cert = t.c.get_certificate(&id, &0).unwrap();
    assert_eq!(cert.approvers, vec![&t.e, t.i1.clone(), t.i2.clone()]);
}

/// The demo story: Amma taps "check again", the second engineer spots
/// recycled footage, and the money stays locked.
#[test]
fn recheck_second_engineer_rejects_money_stays_locked() {
    let t = setup();
    let id = project(&t, true);
    to_submitted(&t, id);
    t.c.recheck(&t.parent, &id, &0);

    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    t.c.decide(&t.i2, &id, &0, &false, &h(&t.e, 4));

    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Rejected);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.labour), 0);
    assert_eq!(t.tok.balance(&t.c.address), 1_900);
    assert_eq!(t.c.get_certificate(&id, &0), None);

    // New proof still needs both engineers, and approvals start over.
    t.c.submit_proof(&id, &0, &h(&t.e, 5));
    let st = t.c.get_stage(&id, &0);
    assert_eq!(st.approvals_needed, 2);
    assert_eq!(st.approvals.len(), 0);
    assert_eq!(st.report_hash, None); // the old report doesn't carry over
}

#[test]
fn recheck_only_parent_or_sponsor() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    let stranger = Address::generate(&t.e);
    assert_eq!(
        t.c.try_recheck(&stranger, &id, &0),
        Err(Ok(Error::NotAuthorized))
    );
    assert_eq!(
        t.c.try_recheck(&t.builder, &id, &0),
        Err(Ok(Error::NotAuthorized))
    );
    assert_eq!(t.c.get_stage(&id, &0).approvals_needed, 1);

    t.c.recheck(&t.s2, &id, &0); // a sponsor can ask too
    assert_eq!(t.c.get_stage(&id, &0).approvals_needed, 2);
}

#[test]
fn recheck_needs_a_second_inspector_assigned() {
    let t = setup();
    let id = project(&t, false);
    t.c.assign_inspector(&id, &0, &t.i1, &1);
    assert_eq!(
        t.c.try_recheck(&t.parent, &id, &0),
        Err(Ok(Error::NoInspector))
    );
}

#[test]
fn recheck_too_late_once_paid() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(
        t.c.try_recheck(&t.parent, &id, &0),
        Err(Ok(Error::WrongStatus))
    );
}

#[test]
fn recheck_pulls_back_during_hold() {
    let t = setup();
    let id = custom(&t, 1_000, false, 100);
    to_submitted(&t, id);
    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Approved);

    t.c.recheck(&t.s1, &id, &0);
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Submitted);
    t.e.ledger().with_mut(|l| l.timestamp += 101);
    assert_eq!(
        t.c.try_release(&id, &0),
        Err(Ok(Error::WrongStatus))
    );

    // The second approval restarts the hold.
    t.c.decide(&t.i2, &id, &0, &true, &h(&t.e, 3));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Approved);
    assert_eq!(
        t.c.try_release(&id, &0),
        Err(Ok(Error::TooEarly))
    );
    // Both engineers are in, so a repeat can't strand the stage.
    assert_eq!(
        t.c.try_recheck(&t.parent, &id, &0),
        Err(Ok(Error::WrongStatus))
    );

    t.e.ledger().with_mut(|l| l.timestamp += 101);
    t.c.release(&id, &0);
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Paid);
    assert_eq!(t.tok.balance(&t.builder), 600);
}

// ---------- freeze and resolve ----------

#[test]
fn t8_freeze_and_resolve_refund() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &600);
    t.c.fund(&t.s2, &id, &400);
    t.c.freeze(&t.s1, &id);
    assert!(t.c.get_project(&id).frozen);

    t.c.resolve(&id, &10_000);
    assert_eq!(t.e.auths()[0].0, t.admin); // only the admin can settle

    // Everything comes back except the 1.5% fee (9 and 6).
    assert_eq!(t.tok.balance(&t.s1), START_BALANCE - 9);
    assert_eq!(t.tok.balance(&t.s2), START_BALANCE - 6);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.c.address), 0);
    assert_eq!(t.c.get_project(&id).spent, 1_000);
    assert!(t.c.get_project(&id).frozen);
}

#[test]
fn resolve_only_splits_what_is_unspent() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &660);
    t.c.fund(&t.s2, &id, &440);
    t.c.open_stage(&id, &0, &h(&t.e, 1)); // 100 already gone to the supplier
    t.c.freeze(&t.parent, &id);

    t.c.resolve(&id, &5_000); // half of the 1000 left goes back, 60/40

    assert_eq!(t.tok.balance(&t.supplier), 100);
    assert_eq!(t.tok.balance(&t.s1), START_BALANCE - 660 - 9 + 300);
    assert_eq!(t.tok.balance(&t.s2), START_BALANCE - 440 - 6 + 200);
    assert_eq!(t.tok.balance(&t.builder), 500);
    assert_eq!(t.tok.balance(&t.c.address), 0);
}

#[test]
fn resolve_rounding_never_loses_a_unit() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &367);
    t.c.fund(&t.s2, &id, &734);
    t.c.open_stage(&id, &0, &h(&t.e, 1));
    t.c.freeze(&t.s2, &id);

    t.c.resolve(&id, &10_000); // 1001 left; 1001 x 367 / 1101 rounds down to 333

    assert_eq!(t.tok.balance(&t.s1), START_BALANCE - 367 - 5 + 333);
    assert_eq!(t.tok.balance(&t.s2), START_BALANCE - 734 - 11 + 668);
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.c.address), 0);
}

#[test]
fn resolve_cannot_pay_out_twice_or_over_100_percent() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &1_000);
    assert_eq!(t.c.try_resolve(&id, &10_000), Err(Ok(Error::WrongStatus))); // not frozen
    t.c.freeze(&t.s1, &id);
    assert_eq!(t.c.try_resolve(&id, &10_001), Err(Ok(Error::BadShares)));

    t.c.resolve(&id, &10_000);
    let after = t.tok.balance(&t.s1);
    t.c.resolve(&id, &10_000);
    assert_eq!(t.tok.balance(&t.s1), after);
    assert_eq!(t.tok.balance(&t.c.address), 0);
}

#[test]
fn freeze_only_parent_or_sponsor() {
    let t = setup();
    let id = project(&t, false);
    let stranger = Address::generate(&t.e);
    assert_eq!(t.c.try_freeze(&stranger, &id), Err(Ok(Error::NotAuthorized)));
    assert_eq!(t.c.try_freeze(&t.builder, &id), Err(Ok(Error::NotAuthorized)));
    assert!(!t.c.get_project(&id).frozen);
    t.c.freeze(&t.parent, &id);
    assert_eq!(t.e.auths()[0].0, t.parent);
}

#[test]
fn frozen_project_pays_nobody() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    t.c.freeze(&t.s1, &id);
    assert_eq!(
        t.c.try_decide(&t.i1, &id, &0, &true, &h(&t.e, 3)),
        Err(Ok(Error::Frozen))
    );
    assert_eq!(t.c.try_fund(&t.s1, &id, &100), Err(Ok(Error::Frozen)));
    assert_eq!(
        t.c.try_submit_proof(&id, &0, &h(&t.e, 4)),
        Err(Ok(Error::Frozen))
    );
    assert_eq!(t.tok.balance(&t.builder), 0);
    assert_eq!(t.tok.balance(&t.labour), 0);
}

#[test]
fn freeze_blocks_release_during_hold() {
    let t = setup();
    let id = custom(&t, 1_000, false, 100);
    to_submitted(&t, id);
    t.c.decide(&t.i1, &id, &0, &true, &h(&t.e, 3));
    t.c.freeze(&t.parent, &id);
    t.e.ledger().with_mut(|l| l.timestamp += 101);
    assert_eq!(
        t.c.try_release(&id, &0),
        Err(Ok(Error::Frozen))
    );
    assert_eq!(t.tok.balance(&t.builder), 0);
}

#[test]
fn frozen_project_cannot_open_a_stage() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &2_000);
    t.c.freeze(&t.s1, &id);
    assert_eq!(
        t.c.try_open_stage(&id, &0, &h(&t.e, 1)),
        Err(Ok(Error::Frozen))
    );
    assert_eq!(t.tok.balance(&t.supplier), 0);
}
