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

/// Security terms with nothing held back, for tests that are not about the builder's deposit.
pub fn no_terms() -> SecurityTerms {
    SecurityTerms {
        deposit: 0,
        upfront: 0,
        retention_bps: 0,
        defects_secs: 0,
        stall_secs: 1_000,
        response_secs: 500,
    }
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
        &no_terms(),
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
        &no_terms(),
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
fn engineer_cannot_have_a_stake_in_the_project() {
    let t = setup();
    let id = project(&t, false);
    for who in [&t.builder, &t.supplier, &t.parent, &t.s1, &t.s2, &t.labour] {
        assert_eq!(
            t.c.try_assign_inspector(&id, &0, who, &1),
            Err(Ok(Error::NotAuthorized))
        );
    }
    assert_eq!(t.c.get_stage(&id, &0).inspector, None);
}

#[test]
fn second_engineer_must_be_a_different_person() {
    let t = setup();
    let id = project(&t, false);
    t.c.assign_inspector(&id, &0, &t.i1, &1);
    assert_eq!(
        t.c.try_assign_inspector(&id, &0, &t.i1, &2),
        Err(Ok(Error::NotAuthorized))
    );
    assert_eq!(t.c.get_stage(&id, &0).inspector2, None);
}

#[test]
fn engineer_cannot_be_swapped_once_proof_is_in() {
    let t = setup();
    let id = project(&t, false);
    to_submitted(&t, id);
    let friend = Address::generate(&t.e);
    assert_eq!(
        t.c.try_assign_inspector(&id, &0, &friend, &1),
        Err(Ok(Error::WrongStatus))
    );
    assert_eq!(
        t.c.try_assign_inspector(&id, &0, &friend, &2),
        Err(Ok(Error::WrongStatus))
    );
    assert_eq!(t.c.get_stage(&id, &0).inspector, Some(t.i1.clone()));
}

#[test]
fn empty_engineer_slot_can_be_filled_after_proof() {
    let t = setup();
    let id = project(&t, false);
    t.c.fund(&t.s1, &id, &2_000);
    t.c.open_stage(&id, &0, &h(&t.e, 1));
    t.c.assign_inspector(&id, &0, &t.i1, &1);
    t.c.submit_proof(&id, &0, &h(&t.e, 2));

    t.c.assign_inspector(&id, &0, &t.i2, &2);
    t.c.recheck(&t.parent, &id, &0);
    assert_eq!(t.c.get_stage(&id, &0).approvals_needed, 2);
}

#[test]
fn frozen_project_cannot_assign_an_engineer() {
    let t = setup();
    let id = project(&t, false);
    t.c.freeze(&t.s1, &id);
    assert_eq!(
        t.c.try_assign_inspector(&id, &0, &t.i1, &1),
        Err(Ok(Error::Frozen))
    );
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
        &no_terms(),
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

// ---------- builder security: deposit, retention, return, default ----------

/// Terms with a 10% retention, a 100 s defects period, a 1000 s stall and a 500 s response window.
fn terms(deposit: i128, upfront: i128) -> SecurityTerms {
    SecurityTerms {
        deposit,
        upfront,
        retention_bps: 1_000,
        defects_secs: 100,
        stall_secs: 1_000,
        response_secs: 500,
    }
}

/// Two stages, each: materials 100 to the supplier, labour 1000 split 40% labour, 60% builder.
fn two_stages(t: &T) -> Vec<StageInput> {
    let stage = || StageInput {
        materials: 100,
        labour_amount: 1_000,
        payees: vec![
            &t.e,
            Payee { to: t.labour.clone(), bps: 4_000 },
            Payee { to: t.builder.clone(), bps: 6_000 },
        ],
        parent_must_approve: false,
        pre_pour: false,
        hold_secs: 0,
    };
    vec![&t.e, stage(), stage()]
}

fn secured(t: &T, terms: &SecurityTerms) -> u32 {
    t.c.create_project(
        &vec![&t.e, t.s1.clone(), t.s2.clone()],
        &t.parent,
        &t.builder,
        &t.supplier,
        &two_stages(t),
        terms,
    )
}

fn mint_builder(t: &T, amount: i128) {
    StellarAssetClient::new(&t.e, &t.tok.address).mint(&t.builder, &amount);
}

/// Runs a stage all the way to paid: open, name both engineers, proof, approval.
fn pass_stage(t: &T, id: u32, stage: u32) {
    t.c.open_stage(&id, &stage, &h(&t.e, 1));
    t.c.assign_inspector(&id, &stage, &t.i1, &1);
    t.c.assign_inspector(&id, &stage, &t.i2, &2);
    t.c.submit_proof(&id, &stage, &h(&t.e, 2));
    t.c.decide(&t.i1, &id, &stage, &true, &h(&t.e, 3));
}

fn advance(t: &T, secs: u64) {
    t.e.ledger().with_mut(|l| l.timestamp += secs);
}

/// Both sponsors fund 1100, a deposit of 200 is posted, and stage 0 is opened and left alone.
fn stalled_build(t: &T) -> u32 {
    let id = secured(t, &terms(200, 200));
    mint_builder(t, 1_000);
    t.c.post_deposit(&id, &200);
    t.c.fund(&t.s1, &id, &1_100);
    t.c.fund(&t.s2, &id, &1_100);
    t.c.open_stage(&id, &0, &h(&t.e, 1));
    t.c.assign_inspector(&id, &0, &t.i1, &1);
    t.c.assign_inspector(&id, &0, &t.i2, &2);
    id
}

#[test]
fn security_terms_are_checked() {
    let t = setup();
    let go = |terms: SecurityTerms| {
        t.c.try_create_project(
            &vec![&t.e, t.s1.clone()],
            &t.parent,
            &t.builder,
            &t.supplier,
            &two_stages(&t),
            &terms,
        )
    };
    let bad = Err(Ok(Error::BadAmount));
    assert_eq!(go(SecurityTerms { upfront: 300, ..terms(200, 0) }), bad); // upfront above the deposit
    assert_eq!(go(SecurityTerms { retention_bps: 2_001, ..terms(200, 0) }), bad); // over 20%
    assert_eq!(go(SecurityTerms { stall_secs: 0, ..terms(200, 0) }), bad);
    assert_eq!(go(SecurityTerms { response_secs: 0, ..terms(200, 0) }), bad);
    assert_eq!(go(SecurityTerms { deposit: -1, ..terms(0, 0) }), bad);
    assert!(go(SecurityTerms { retention_bps: 2_000, ..terms(200, 100) }).is_ok());
}

#[test]
fn builder_posts_the_deposit_up_to_the_target() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);

    t.c.post_deposit(&id, &100);
    assert_eq!(t.e.auths()[0].0, t.builder); // only the builder can put it in
    assert_eq!(t.c.get_project(&id).deposit_held, 100);
    assert_eq!(t.tok.balance(&t.builder), 900);
    assert_eq!(t.tok.balance(&t.c.address), 100);

    assert_eq!(t.c.try_post_deposit(&id, &150), Err(Ok(Error::BadAmount))); // only 100 left to post
    assert_eq!(t.c.try_post_deposit(&id, &0), Err(Ok(Error::BadAmount)));
    t.c.post_deposit(&id, &100);
    assert_eq!(t.c.get_project(&id).deposit_held, 200);
}

#[test]
fn first_stage_waits_for_the_upfront_deposit() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);
    t.c.fund(&t.s1, &id, &2_200);

    assert_eq!(t.c.try_open_stage(&id, &0, &h(&t.e, 1)), Err(Ok(Error::DepositNeeded)));
    t.c.post_deposit(&id, &150);
    assert_eq!(t.c.try_open_stage(&id, &0, &h(&t.e, 1)), Err(Ok(Error::DepositNeeded)));
    t.c.post_deposit(&id, &50);
    t.c.open_stage(&id, &0, &h(&t.e, 1));
    assert_eq!(t.c.get_stage(&id, &0).status, StageStatus::Open);
}

#[test]
fn retention_is_held_back_from_the_builder_only() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);
    t.c.post_deposit(&id, &200);
    t.c.fund(&t.s1, &id, &2_200);
    pass_stage(&t, id, 0);

    // Labour 1000: workers 400 in full, builder's 600 less 10% of the labour (100).
    assert_eq!(t.tok.balance(&t.labour), 400);
    assert_eq!(t.tok.balance(&t.builder), 800 + 500);
    assert_eq!(t.tok.balance(&t.supplier), 100);
    let p = t.c.get_project(&id);
    assert_eq!((p.deposit_held, p.retention_held), (200, 100));
    // The contract holds what is unspent plus the builder's security, and nothing else.
    assert_eq!(t.tok.balance(&t.c.address), (p.funded - p.spent) + 200 + 100);
}

#[test]
fn earned_deposit_fills_from_the_first_payment() {
    let t = setup();
    let id = secured(&t, &terms(200, 0)); // no cash up front
    t.c.fund(&t.s1, &id, &2_200);

    pass_stage(&t, id, 0); // the builder's 600 fills the deposit: 200 held, 400 paid, no retention yet
    let p = t.c.get_project(&id);
    assert_eq!((p.deposit_held, p.retention_held), (200, 0));
    assert_eq!(t.tok.balance(&t.builder), 400);

    pass_stage(&t, id, 1); // deposit is full, so the normal 10% retention starts
    let p = t.c.get_project(&id);
    assert_eq!((p.deposit_held, p.retention_held), (200, 100));
    assert_eq!(t.tok.balance(&t.builder), 400 + 500);
    assert_eq!(t.tok.balance(&t.labour), 800);
}

#[test]
fn security_comes_back_after_the_last_stage_and_the_defects_period() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);
    t.c.post_deposit(&id, &200);
    t.c.fund(&t.s1, &id, &2_200);

    pass_stage(&t, id, 0);
    assert_eq!(t.c.try_return_deposit(&id), Err(Ok(Error::WrongStatus))); // a stage is still to do
    pass_stage(&t, id, 1);
    assert_eq!(t.c.try_return_deposit(&id), Err(Ok(Error::TooEarly))); // defects period still running

    advance(&t, 100);
    t.c.return_deposit(&id);
    // Deposit 200 plus retention 2 x 100 comes back, in full, with no claim from the builder.
    assert_eq!(t.tok.balance(&t.builder), 800 + 500 + 500 + 400);
    assert_eq!(t.tok.balance(&t.c.address), 0);
    assert_eq!(t.c.try_return_deposit(&id), Err(Ok(Error::WrongStatus)));
    assert_eq!(t.c.try_claim_default(&t.s1, &id, &0), Err(Ok(Error::WrongStatus))); // nothing left to claim on
}

#[test]
fn an_open_claim_holds_the_security_through_the_defects_period() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);
    t.c.post_deposit(&id, &200);
    t.c.fund(&t.s1, &id, &2_200);
    pass_stage(&t, id, 0);
    pass_stage(&t, id, 1);
    advance(&t, 100);

    t.c.claim_default(&t.s1, &id, &1); // e.g. a leak found after the first rain
    assert_eq!(t.c.try_return_deposit(&id), Err(Ok(Error::ClaimOpen)));
    t.c.withdraw_claim(&t.s1, &id);
    t.c.return_deposit(&id);
    assert_eq!(t.tok.balance(&t.c.address), 0);
}

#[test]
fn a_stop_with_no_default_gives_the_builder_their_security_back() {
    let t = setup();
    let id = secured(&t, &terms(200, 200));
    mint_builder(&t, 1_000);
    t.c.post_deposit(&id, &200);
    t.c.fund(&t.s1, &id, &1_100);
    t.c.freeze(&t.s1, &id);

    t.c.resolve(&id, &10_000);
    assert_eq!(t.tok.balance(&t.builder), 1_000); // deposit back
    assert_eq!(t.tok.balance(&t.s1), START_BALANCE - 1_100 - 16 + 1_100);
    assert_eq!(t.tok.balance(&t.c.address), 0);
    assert!(t.c.get_project(&id).security_returned);
}

#[test]
fn a_stalled_stage_ends_in_a_default_that_pays_the_sponsors() {
    let t = setup();
    let id = stalled_build(&t); // stage 0 opened at time 0, builder never sends proof

    assert_eq!(t.c.try_claim_default(&t.parent, &id, &0).is_ok(), true);
    t.c.withdraw_claim(&t.parent, &id);
    advance(&t, 999);
    t.c.claim_default(&t.s1, &id, &0);
    assert!(!t.c.get_claim(&id).unwrap().confirmed); // not stalled long enough yet
    t.c.withdraw_claim(&t.s1, &id);

    advance(&t, 1);
    t.c.claim_default(&t.s1, &id, &0);
    let claim = t.c.get_claim(&id).unwrap();
    assert!(claim.confirmed && claim.stalled); // objective: needs no engineer
    assert_eq!(t.c.try_finalize_default(&id), Err(Ok(Error::TooEarly))); // the builder's window is open

    advance(&t, 500);
    t.c.finalize_default(&id);
    // Unspent 2100 plus the builder's 200 deposit, split 50/50.
    assert_eq!(t.tok.balance(&t.s1), START_BALANCE - 1_100 - 16 + 1_150);
    assert_eq!(t.tok.balance(&t.s2), START_BALANCE - 1_100 - 16 + 1_150);
    assert_eq!(t.tok.balance(&t.builder), 800); // the deposit is gone
    assert_eq!(t.tok.balance(&t.c.address), 0);
    assert_eq!(t.c.fee_credit(&t.s1), 1_050); // only their own unspent money earns a credit
    let p = t.c.get_project(&id);
    assert!(p.defaulted && p.frozen && t.c.get_claim(&id).is_none());
    assert_eq!(p.deposit_held, 0);
    assert_eq!(t.c.try_claim_default(&t.s1, &id, &0), Err(Ok(Error::WrongStatus)));
    assert_eq!(t.c.try_fund(&t.s1, &id, &10), Err(Ok(Error::Frozen)));
    assert_eq!(t.c.try_post_deposit(&id, &10), Err(Ok(Error::Frozen)));
}

#[test]
fn proof_from_the_builder_cancels_a_stall_claim() {
    let t = setup();
    let id = stalled_build(&t);
    advance(&t, 1_000);
    t.c.claim_default(&t.s1, &id, &0);

    advance(&t, 400);
    t.c.submit_proof(&id, &0, &h(&t.e, 2)); // the builder answers in time
    assert!(t.c.get_claim(&id).is_none());
    advance(&t, 200);
    assert_eq!(t.c.try_finalize_default(&id), Err(Ok(Error::NoClaim)));
    assert!(!t.c.get_project(&id).defaulted);
}

#[test]
fn a_claim_without_a_stall_needs_an_engineer_on_that_stage() {
    let t = setup();
    let id = stalled_build(&t);
    t.c.submit_proof(&id, &0, &h(&t.e, 2)); // proof is in, so nothing is stalled
    t.c.claim_default(&t.s1, &id, &0);
    assert!(!t.c.get_claim(&id).unwrap().confirmed);
    assert_eq!(t.c.try_finalize_default(&id), Err(Ok(Error::WrongStatus)));

    let stranger = Address::generate(&t.e);
    assert_eq!(t.c.try_confirm_default(&stranger, &id), Err(Ok(Error::NotAuthorized)));
    advance(&t, 700);
    t.c.confirm_default(&t.i1, &id);
    let claim = t.c.get_claim(&id).unwrap();
    assert!(claim.confirmed && !claim.stalled);
    assert_eq!(claim.at, 700); // the builder's window starts when the engineer confirms

    advance(&t, 499);
    assert_eq!(t.c.try_finalize_default(&id), Err(Ok(Error::TooEarly)));
    advance(&t, 1);
    t.c.finalize_default(&id);
    assert!(t.c.get_project(&id).defaulted);
}

#[test]
fn the_builder_can_contest_and_only_the_admin_can_settle_it() {
    let t = setup();
    let id = stalled_build(&t);
    t.c.submit_proof(&id, &0, &h(&t.e, 2));
    t.c.claim_default(&t.s1, &id, &0);
    t.c.confirm_default(&t.i2, &id);

    t.c.contest_default(&id);
    assert_eq!(t.e.auths()[0].0, t.builder);
    advance(&t, 600);
    assert_eq!(t.c.try_finalize_default(&id), Err(Ok(Error::WrongStatus))); // nobody can finalize a disputed claim
    t.c.settle_default(&id, &false);
    assert_eq!(t.e.auths()[0].0, t.admin);
    assert!(t.c.get_claim(&id).is_none() && !t.c.get_project(&id).defaulted);
    assert_eq!(t.tok.balance(&t.c.address), 2_200 - 100 + 200); // nothing moved
}

#[test]
fn the_admin_can_forfeit_a_disputed_claim() {
    let t = setup();
    let id = stalled_build(&t);
    t.c.submit_proof(&id, &0, &h(&t.e, 2));
    t.c.claim_default(&t.s2, &id, &0);
    t.c.confirm_default(&t.i1, &id);
    t.c.contest_default(&id);
    assert_eq!(t.c.try_settle_default(&id, &true).is_ok(), true);
    assert!(t.c.get_project(&id).defaulted);
    assert_eq!(t.tok.balance(&t.c.address), 0);
}

#[test]
fn contesting_after_the_window_is_too_late() {
    let t = setup();
    let id = stalled_build(&t);
    t.c.submit_proof(&id, &0, &h(&t.e, 2));
    t.c.claim_default(&t.s1, &id, &0);
    t.c.confirm_default(&t.i1, &id);
    advance(&t, 500);
    assert_eq!(t.c.try_contest_default(&id), Err(Ok(Error::TooLate)));
    assert_eq!(t.c.try_settle_default(&id, &true), Err(Ok(Error::WrongStatus))); // not disputed
}

#[test]
fn only_a_sponsor_or_the_parent_can_claim_or_withdraw() {
    let t = setup();
    let id = stalled_build(&t);
    let stranger = Address::generate(&t.e);
    assert_eq!(t.c.try_claim_default(&stranger, &id, &0), Err(Ok(Error::NotAuthorized)));
    assert_eq!(t.c.try_claim_default(&t.builder, &id, &0), Err(Ok(Error::NotAuthorized)));
    t.c.claim_default(&t.s1, &id, &0);
    assert_eq!(t.c.try_claim_default(&t.s2, &id, &0), Err(Ok(Error::ClaimOpen)));
    assert_eq!(t.c.try_withdraw_claim(&stranger, &id), Err(Ok(Error::NotAuthorized)));
    t.c.withdraw_claim(&t.parent, &id);
    assert_eq!(t.c.try_withdraw_claim(&t.parent, &id), Err(Ok(Error::NoClaim)));
    assert_eq!(t.c.try_claim_default(&t.s1, &id, &9), Err(Ok(Error::NotFound)));
}

#[test]
fn money_back_from_a_default_is_funded_into_a_new_build_without_a_second_fee() {
    let t = setup();
    let id = stalled_build(&t);
    advance(&t, 1_000);
    t.c.claim_default(&t.s1, &id, &0);
    advance(&t, 500);
    t.c.finalize_default(&id);
    assert_eq!(t.c.fee_credit(&t.s1), 1_050);
    let fees_before = t.tok.balance(&t.platform);

    let fresh = project(&t, false); // a new build with a new builder
    t.c.fund(&t.s1, &fresh, &1_000); // inside the credit: no fee
    assert_eq!(t.tok.balance(&t.platform), fees_before);
    assert_eq!(t.c.fee_credit(&t.s1), 50);
    t.c.fund(&t.s1, &fresh, &500); // 50 is free, the other 450 pays 1.5% (6)
    assert_eq!(t.tok.balance(&t.platform), fees_before + 6);
    assert_eq!(t.c.fee_credit(&t.s1), 0);
    t.c.fund(&t.s2, &fresh, &1_000); // sponsor 2 has their own credit
    assert_eq!(t.c.fee_credit(&t.s2), 50);
}

#[test]
fn nothing_changes_for_a_build_with_no_security() {
    let t = setup();
    let id = secured(&t, &no_terms());
    t.c.fund(&t.s1, &id, &2_200);
    pass_stage(&t, id, 0);
    assert_eq!(t.tok.balance(&t.builder), 600); // paid in full, nothing held
    assert_eq!(t.c.get_project(&id).retention_held, 0);
    pass_stage(&t, id, 1);
    t.c.return_deposit(&id); // nothing to return, and nothing breaks
    assert_eq!(t.tok.balance(&t.builder), 1_200);
}
