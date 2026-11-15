#![no_std]
//! Homeward: build money locked by construction stage.
//! Ved: create_project, open_stage, decide, release, recheck.
//! Youdis: fund, assign_inspector, submit_proof, freeze, resolve.
//! Builder security (deposit, retention, default): see the docs/builder-deposit.md notes.

mod storage;
#[cfg(test)]
mod test;
mod types;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, BytesN, Env, Vec};
use storage::*;
pub use types::*;

#[contract]
pub struct Homeward;

/// Retention can never take more than this share of a stage's labour.
const MAX_RETENTION_BPS: u32 = 2_000;

fn min(a: i128, b: i128) -> i128 {
    if a < b {
        a
    } else {
        b
    }
}

/// Ends a build for good: everything not paid out, plus the builder's whole deposit and
/// retention, goes back to the sponsors in proportion to what each paid in. The share that was
/// their own unspent money earns a fee credit, so putting it into a new build costs no second fee.
fn forfeit(e: &Env, id: u32, mut p: Project) {
    let unspent = p.funded - p.spent;
    let total = unspent + p.deposit_held + p.retention_held;
    let n = p.sponsors.len();
    let (mut given, mut given_unspent, mut i) = (0i128, 0i128, 0u32);
    for s in p.sponsors.iter() {
        // The last sponsor gets whatever is left, so rounding never loses a unit.
        let (share, share_unspent) = if i == n - 1 {
            (total - given, unspent - given_unspent)
        } else if p.funded > 0 {
            let c = storage::contribution(e, id, &s);
            (total * c / p.funded, unspent * c / p.funded)
        } else {
            (0, 0)
        };
        pay(e, &s, share);
        if share_unspent > 0 {
            set_credit(e, &s, credit(e, &s) + share_unspent);
        }
        given += share;
        given_unspent += share_unspent;
        i += 1;
    }
    p.frozen = true;
    p.defaulted = true;
    p.spent = p.funded;
    p.deposit_held = 0;
    p.retention_held = 0;
    clear_claim(e, id);
    save_project(e, id, &p);
    e.events().publish((symbol_short!("defaulted"), id), total);
}

/// Move `amount` of our token from the contract to `to`. Skips zero amounts.
fn pay(e: &Env, to: &Address, amount: i128) {
    if amount > 0 {
        token::Client::new(e, &token(e)).transfer(&e.current_contract_address(), to, &amount);
    }
}

/// True if `who` funds, lives in, builds, supplies or gets paid from this stage.
fn has_stake(p: &Project, st: &Stage, who: &Address) -> bool {
    *who == p.builder
        || *who == p.supplier
        || *who == p.parent
        || p.sponsors.contains(who)
        || st.payees.iter().any(|py| py.to == *who)
}

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
        terms: SecurityTerms,
    ) -> Result<u32, Error> {
        admin(&e).require_auth();
        if sponsors.is_empty() || stages.is_empty() {
            return Err(Error::BadAmount);
        }
        if terms.deposit < 0
            || terms.upfront < 0
            || terms.upfront > terms.deposit
            || terms.retention_bps > MAX_RETENTION_BPS
            || terms.stall_secs == 0
            || terms.response_secs == 0
        {
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
            terms,
            deposit_held: 0,
            retention_held: 0,
            stages_paid: 0,
            completed_at: 0,
            defaulted: false,
            security_returned: false,
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
                report_hash: None,
                since: 0,
            };
            save_stage(&e, id, i, &st);
            i += 1;
        }
        bump_instance(&e);
        e.events()
            .publish((symbol_short!("created"), id), project.stage_count);
        Ok(id)
    }

    pub fn fund(e: Env, sponsor: Address, id: u32, amount: i128) -> Result<(), Error> {
        sponsor.require_auth();

        if amount <= 0 {
            return Err(Error::BadAmount);
        }
        let mut p = load_project(&e, id)?;

        if p.frozen {
            return Err(Error::Frozen);
        }

        if !p.sponsors.contains(&sponsor) {
            return Err(Error::NotSponsor);
        }

        // Money coming back from a defaulted build was already charged a fee once.
        let owed = credit(&e, &sponsor);
        let free = min(owed, amount);
        if free > 0 {
            set_credit(&e, &sponsor, owed - free);
        }
        let fee = ((amount - free) * fee_bps(&e) as i128) / 10_000;
        let t = token::Client::new(&e, &token(&e));
        t.transfer(&sponsor, &e.current_contract_address(), &amount);
        if fee > 0 {
            t.transfer(&sponsor, &platform(&e), &fee);
        }

        p.funded += amount;
        save_project(&e, id, &p);
        add_contribution(&e, id, &sponsor, amount);

        e.events()
            .publish((symbol_short!("funded"), id, sponsor), amount);
        Ok(())
    }

    pub fn assign_inspector(
        e: Env,
        id: u32,
        stage: u32,
        inspector: Address,
        slot: u32,
    ) -> Result<(), Error> {
        admin(&e).require_auth();

        let p = load_project(&e, id)?;
        if p.frozen {
            return Err(Error::Frozen);
        }
        let mut st = load_stage(&e, id, stage)?;

        // An engineer must be independent: nobody who pays or gets paid can sign
        // off, and a re-check needs two different people.
        let other = if slot == 1 { &st.inspector2 } else { &st.inspector };
        if has_stake(&p, &st, &inspector) || other.as_ref() == Some(&inspector) {
            return Err(Error::NotAuthorized);
        }

        // Once proof is in, a named engineer can't be swapped for a friendlier one.
        // An empty slot can still be filled, so a re-check is never stuck.
        let current = if slot == 1 { &st.inspector } else { &st.inspector2 };
        let proof_in = matches!(
            st.status,
            StageStatus::Submitted | StageStatus::Approved | StageStatus::Paid
        );
        if proof_in && current.is_some() {
            return Err(Error::WrongStatus);
        }

        if slot == 1 {
            st.inspector = Some(inspector.clone());
        } else {
            st.inspector2 = Some(inspector.clone());
        }

        save_stage(&e, id, stage, &st);

        e.events()
            .publish((symbol_short!("assigned"), id, stage), inspector);

        Ok(())
    }

    pub fn submit_proof(e: Env, id: u32, stage: u32, video_hash: BytesN<32>) -> Result<(), Error> {
        let p = load_project(&e, id)?;
        p.builder.require_auth();

        if p.frozen {
            return Err(Error::Frozen);
        }

        let mut st = load_stage(&e, id, stage)?;

        if st.status != StageStatus::Open && st.status != StageStatus::Rejected {
            return Err(Error::WrongStatus);
        }

        st.video_hash = Some(video_hash);
        st.status = StageStatus::Submitted;
        st.approvals = Vec::new(&e);
        st.parent_ok = false;
        st.report_hash = None;

        save_stage(&e, id, stage, &st);

        // Sending proof is the builder's answer to a claim that only rested on the stall.
        if load_claim(&e, id).map_or(false, |c| c.stalled && c.stage == stage) {
            clear_claim(&e, id);
            e.events().publish((symbol_short!("claimvoid"), id), stage);
        }

        e.events().publish((symbol_short!("proof"), id, stage), ());

        Ok(())
    }

    // ---------- stage flow (Ved) ----------

    /// Admin starts a stage: checks the money is there, pays the supplier for
    /// materials, and stores the hash of the stage code shown to the builder.
    pub fn open_stage(e: Env, id: u32, stage: u32, code_hash: BytesN<32>) -> Result<(), Error> {
        admin(&e).require_auth();
        let mut p = load_project(&e, id)?;
        if p.frozen {
            return Err(Error::Frozen);
        }
        let mut st = load_stage(&e, id, stage)?;
        if st.status != StageStatus::Locked {
            return Err(Error::WrongStatus);
        }
        if p.deposit_held < p.terms.upfront {
            return Err(Error::DepositNeeded);
        }
        if p.funded - p.spent < st.materials + st.labour_amount {
            return Err(Error::InsufficientFunds);
        }
        pay(&e, &p.supplier, st.materials);
        p.spent += st.materials;
        st.status = StageStatus::Open;
        st.since = e.ledger().timestamp();
        st.code_hash = Some(code_hash);
        save_project(&e, id, &p);
        save_stage(&e, id, stage, &st);
        e.events()
            .publish((symbol_short!("opened"), id, stage), st.materials);
        Ok(())
    }

    /// An inspector or the parent approves or rejects a submitted stage.
    /// When every required approval is in, money is released (now, or after the hold).
    pub fn decide(
        e: Env,
        approver: Address,
        id: u32,
        stage: u32,
        approve: bool,
        report_hash: BytesN<32>,
    ) -> Result<(), Error> {
        approver.require_auth();
        let p = load_project(&e, id)?;
        if p.frozen {
            return Err(Error::Frozen);
        }
        let mut st = load_stage(&e, id, stage)?;
        if st.status != StageStatus::Submitted {
            return Err(Error::WrongStatus);
        }

        let is_insp1 = st.inspector.clone().map_or(false, |a| a == approver);
        let is_insp2 = st.inspector2.clone().map_or(false, |a| a == approver);
        let is_parent = approver == p.parent;
        if !(is_insp1 || is_insp2 || is_parent) {
            return Err(Error::NotAuthorized);
        }
        // The 2nd inspector only has a say after a recheck was requested.
        if is_insp2 && !is_insp1 && st.approvals_needed < 2 {
            return Err(Error::NotAuthorized);
        }

        if !approve {
            st.status = StageStatus::Rejected;
            st.since = e.ledger().timestamp();
            save_stage(&e, id, stage, &st);
            e.events()
                .publish((symbol_short!("rejected"), id, stage), approver);
            return Ok(());
        }

        if is_parent {
            st.parent_ok = true;
        } else {
            if st.approvals.contains(&approver) {
                return Err(Error::AlreadyApproved);
            }
            st.approvals.push_back(approver.clone());
            // The certificate carries the engineer's report, never the parent's note.
            st.report_hash = Some(report_hash);
        }
        e.events()
            .publish((symbol_short!("approved"), id, stage), approver);

        let inspectors_done = st.approvals.len() >= st.approvals_needed;
        let parent_done = !st.parent_must_approve || st.parent_ok;
        if inspectors_done && parent_done {
            st.status = StageStatus::Approved;
            st.approved_at = e.ledger().timestamp();
            save_stage(&e, id, stage, &st);
            if st.hold_secs == 0 {
                Self::release(e.clone(), id, stage)?;
            }
        } else {
            save_stage(&e, id, stage, &st);
        }
        Ok(())
    }

    /// Pays every payee of an approved stage in ONE call and records a certificate.
    /// Anyone may call it once the hold time has passed (no auth needed: the
    /// money can only ever go to the fixed payees).
    pub fn release(e: Env, id: u32, stage: u32) -> Result<(), Error> {
        let mut p = load_project(&e, id)?;
        if p.frozen {
            return Err(Error::Frozen);
        }
        let mut st = load_stage(&e, id, stage)?;
        if st.status != StageStatus::Approved {
            return Err(Error::WrongStatus);
        }
        if e.ledger().timestamp() < st.approved_at + st.hold_secs {
            return Err(Error::TooEarly);
        }
        if p.funded - p.spent < st.labour_amount {
            return Err(Error::InsufficientFunds);
        }

        let n = st.payees.len();
        let mut paid: i128 = 0;
        let mut i: u32 = 0;
        let allowance = st.labour_amount * p.terms.retention_bps as i128 / 10_000;
        let mut kept_back: i128 = 0;
        for py in st.payees.iter() {
            // Last payee gets whatever is left, so rounding never loses a unit.
            let gross = if i == n - 1 {
                st.labour_amount - paid
            } else {
                st.labour_amount * py.bps as i128 / 10_000
            };
            paid += gross;
            let mut amt = gross;
            // Only the builder's share is ever held back; workers and everyone else are paid in full.
            if py.to == p.builder {
                // Until the deposit is full, this payment fills it. After that, a share is kept as retention.
                let filled = p.deposit_held >= p.terms.deposit;
                let top_up = if filled { 0 } else { min(p.terms.deposit - p.deposit_held, gross) };
                let retained = if filled { min(allowance - kept_back, gross) } else { 0 };
                if top_up > 0 || retained > 0 {
                    p.deposit_held += top_up;
                    p.retention_held += retained;
                    kept_back += retained;
                    amt = gross - top_up - retained;
                    e.events()
                        .publish((symbol_short!("retained"), id, stage), (top_up, retained));
                }
            }
            pay(&e, &py.to, amt);
            e.events()
                .publish((symbol_short!("paid"), id, stage), (py.to.clone(), amt));
            i += 1;
        }

        p.spent += st.labour_amount;
        p.stages_paid += 1;
        if p.stages_paid == p.stage_count {
            p.completed_at = e.ledger().timestamp();
        }
        st.status = StageStatus::Paid;
        save_project(&e, id, &p);
        save_stage(&e, id, stage, &st);

        // Saved at approval, so whoever calls release can't choose it.
        let report_hash = st.report_hash.clone().ok_or(Error::WrongStatus)?;
        let mut approvers = st.approvals.clone();
        if st.parent_ok {
            approvers.push_back(p.parent.clone());
        }
        let cert = Certificate {
            project: id,
            stage,
            time: e.ledger().timestamp(),
            approvers,
            report_hash,
            amount: st.labour_amount,
        };
        save_cert(&e, id, stage, &cert);
        e.events()
            .publish((symbol_short!("cert"), id, stage), st.labour_amount);
        Ok(())
    }

    /// The parent or a sponsor asks for a second engineer before money moves.
    /// Works any time before the stage is paid. During a handover hold it pulls
    /// an approved stage back to Submitted, so nothing can release until both
    /// engineers have approved.
    pub fn recheck(e: Env, caller: Address, id: u32, stage: u32) -> Result<(), Error> {
        caller.require_auth();
        let p = load_project(&e, id)?;
        if caller != p.parent && !p.sponsors.contains(&caller) {
            return Err(Error::NotAuthorized);
        }
        let mut st = load_stage(&e, id, stage)?;
        // One re-check per stage. A repeat could strand a stage that both
        // engineers already approved, since neither could approve it again.
        if st.status == StageStatus::Paid || st.approvals_needed >= 2 {
            return Err(Error::WrongStatus);
        }
        if st.inspector2.is_none() {
            return Err(Error::NoInspector);
        }
        st.approvals_needed = 2;
        if st.status == StageStatus::Approved {
            st.status = StageStatus::Submitted;
        }
        save_stage(&e, id, stage, &st);
        e.events()
            .publish((symbol_short!("recheck"), id, stage), caller);
        Ok(())
    }

    // ---------- freeze and resolve ----------

    /// The parent or a sponsor stops the project. Nothing pays out while it's frozen.
    pub fn freeze(e: Env, caller: Address, id: u32) -> Result<(), Error> {
        caller.require_auth();
        let mut p = load_project(&e, id)?;
        if caller != p.parent && !p.sponsors.contains(&caller) {
            return Err(Error::NotAuthorized);
        }
        p.frozen = true;
        save_project(&e, id, &p);
        e.events()
            .publish((symbol_short!("frozen"), id), caller);
        Ok(())
    }

    /// Admin settles a frozen project. `refund_bps` of the unspent money goes back
    /// to sponsors in proportion to what they paid in, and the rest goes to the
    /// builder for work done. The project stays frozen.
    pub fn resolve(e: Env, id: u32, refund_bps: u32) -> Result<(), Error> {
        admin(&e).require_auth();
        let mut p = load_project(&e, id)?;
        if !p.frozen {
            return Err(Error::WrongStatus);
        }
        // Above 100% would pay out more than the project has left.
        if refund_bps > 10_000 {
            return Err(Error::BadShares);
        }

        let unspent = p.funded - p.spent;
        let refund_total = unspent * refund_bps as i128 / 10_000;
        let n = p.sponsors.len();
        let mut refunded: i128 = 0;
        let mut i: u32 = 0;
        for s in p.sponsors.iter() {
            // Last sponsor gets whatever is left, so rounding never loses a unit.
            let share = if i == n - 1 {
                refund_total - refunded
            } else if p.funded > 0 {
                refund_total * storage::contribution(&e, id, &s) / p.funded
            } else {
                0
            };
            pay(&e, &s, share);
            refunded += share;
            i += 1;
        }
        // A stop with no default found gives the builder's own security back. Only the
        // default path can take it, and only to give it to the sponsors.
        pay(&e, &p.builder, unspent - refunded + p.deposit_held + p.retention_held);
        p.deposit_held = 0;
        p.retention_held = 0;
        p.security_returned = true;
        clear_claim(&e, id);

        p.spent = p.funded;
        save_project(&e, id, &p);
        e.events()
            .publish((symbol_short!("resolved"), id), refunded);
        Ok(())
    }

    // ---------- builder security: deposit, return, default ----------

    /// The builder puts (part of) the deposit into the contract. It can only come back to the
    /// builder at the end, or go to the sponsors after a confirmed default.
    pub fn post_deposit(e: Env, id: u32, amount: i128) -> Result<(), Error> {
        let mut p = load_project(&e, id)?;
        p.builder.require_auth();
        if p.frozen {
            return Err(Error::Frozen);
        }
        if p.security_returned {
            return Err(Error::WrongStatus);
        }
        if amount <= 0 || amount > p.terms.deposit - p.deposit_held {
            return Err(Error::BadAmount);
        }
        token::Client::new(&e, &token(&e)).transfer(&p.builder, &e.current_contract_address(), &amount);
        p.deposit_held += amount;
        save_project(&e, id, &p);
        e.events().publish((symbol_short!("deposit"), id), amount);
        Ok(())
    }

    /// After the last stage is paid and the defects period has passed, the deposit and all the
    /// retention go back to the builder. Anyone may call it: the money can only go to the builder.
    pub fn return_deposit(e: Env, id: u32) -> Result<(), Error> {
        let mut p = load_project(&e, id)?;
        if p.frozen {
            return Err(Error::Frozen);
        }
        if p.stages_paid < p.stage_count || p.security_returned {
            return Err(Error::WrongStatus);
        }
        if load_claim(&e, id).is_some() {
            return Err(Error::ClaimOpen);
        }
        if e.ledger().timestamp() < p.completed_at + p.terms.defects_secs {
            return Err(Error::TooEarly);
        }
        let total = p.deposit_held + p.retention_held;
        pay(&e, &p.builder, total);
        p.deposit_held = 0;
        p.retention_held = 0;
        p.security_returned = true;
        save_project(&e, id, &p);
        e.events().publish((symbol_short!("returned"), id), total);
        Ok(())
    }

    /// A sponsor or the parent says the builder has failed on `stage`. If that stage has been
    /// waiting on the builder for the stall period, the claim stands on its own. Otherwise an
    /// engineer on that stage has to confirm it.
    pub fn claim_default(e: Env, caller: Address, id: u32, stage: u32) -> Result<(), Error> {
        caller.require_auth();
        let p = load_project(&e, id)?;
        if caller != p.parent && !p.sponsors.contains(&caller) {
            return Err(Error::NotAuthorized);
        }
        if p.defaulted || p.security_returned {
            return Err(Error::WrongStatus);
        }
        if load_claim(&e, id).is_some() {
            return Err(Error::ClaimOpen);
        }
        let st = load_stage(&e, id, stage)?;
        let now = e.ledger().timestamp();
        let waiting = matches!(st.status, StageStatus::Open | StageStatus::Rejected);
        let stalled = waiting && now >= st.since + p.terms.stall_secs;
        save_claim(&e, id, &Claim { stage, at: now, confirmed: stalled, contested: false, stalled });
        e.events().publish((symbol_short!("claimed"), id), (stage, caller));
        Ok(())
    }

    /// An engineer assigned to the claimed stage confirms the builder failed. The builder's
    /// response window starts now.
    pub fn confirm_default(e: Env, engineer: Address, id: u32) -> Result<(), Error> {
        engineer.require_auth();
        load_project(&e, id)?;
        let mut c = load_claim(&e, id).ok_or(Error::NoClaim)?;
        if c.confirmed {
            return Err(Error::WrongStatus);
        }
        let st = load_stage(&e, id, c.stage)?;
        if st.inspector != Some(engineer.clone()) && st.inspector2 != Some(engineer.clone()) {
            return Err(Error::NotAuthorized);
        }
        c.confirmed = true;
        c.at = e.ledger().timestamp();
        save_claim(&e, id, &c);
        e.events().publish((symbol_short!("confirmed"), id), engineer);
        Ok(())
    }

    /// The claimant takes the claim back.
    pub fn withdraw_claim(e: Env, caller: Address, id: u32) -> Result<(), Error> {
        caller.require_auth();
        let p = load_project(&e, id)?;
        if caller != p.parent && !p.sponsors.contains(&caller) {
            return Err(Error::NotAuthorized);
        }
        if load_claim(&e, id).is_none() {
            return Err(Error::NoClaim);
        }
        clear_claim(&e, id);
        e.events().publish((symbol_short!("withdrawn"), id), caller);
        Ok(())
    }

    /// The builder disputes a confirmed claim during the response window. After that, only the
    /// admin can settle it, and only between two fixed outcomes.
    pub fn contest_default(e: Env, id: u32) -> Result<(), Error> {
        let p = load_project(&e, id)?;
        p.builder.require_auth();
        let mut c = load_claim(&e, id).ok_or(Error::NoClaim)?;
        if !c.confirmed || c.contested {
            return Err(Error::WrongStatus);
        }
        if e.ledger().timestamp() >= c.at + p.terms.response_secs {
            return Err(Error::TooLate);
        }
        c.contested = true;
        save_claim(&e, id, &c);
        e.events().publish((symbol_short!("contested"), id), ());
        Ok(())
    }

    /// Once the builder's window has closed without a dispute, anyone can carry out the default:
    /// the money goes back to the sponsors. A stall claim must still hold, so a builder who sent
    /// proof in time is safe.
    pub fn finalize_default(e: Env, id: u32) -> Result<(), Error> {
        let p = load_project(&e, id)?;
        let c = load_claim(&e, id).ok_or(Error::NoClaim)?;
        if !c.confirmed || c.contested {
            return Err(Error::WrongStatus);
        }
        let now = e.ledger().timestamp();
        if now < c.at + p.terms.response_secs {
            return Err(Error::TooEarly);
        }
        if c.stalled {
            let st = load_stage(&e, id, c.stage)?;
            let waiting = matches!(st.status, StageStatus::Open | StageStatus::Rejected);
            if !waiting || now < st.since + p.terms.stall_secs {
                return Err(Error::NotStalled);
            }
        }
        forfeit(&e, id, p);
        Ok(())
    }

    /// The admin settles a claim the builder disputed: forfeit it, or dismiss it.
    pub fn settle_default(e: Env, id: u32, forfeit_it: bool) -> Result<(), Error> {
        admin(&e).require_auth();
        let p = load_project(&e, id)?;
        let c = load_claim(&e, id).ok_or(Error::NoClaim)?;
        if !c.contested {
            return Err(Error::WrongStatus);
        }
        if forfeit_it {
            forfeit(&e, id, p);
        } else {
            clear_claim(&e, id);
            e.events().publish((symbol_short!("dismissed"), id), ());
        }
        Ok(())
    }

    // ---------- read-only views (free to call, no signature needed) ----------
    pub fn get_claim(e: Env, id: u32) -> Option<Claim> {
        load_claim(&e, id)
    }
    pub fn fee_credit(e: Env, sponsor: Address) -> i128 {
        credit(&e, &sponsor)
    }
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
