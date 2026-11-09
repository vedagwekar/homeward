#![no_std]
//! Homeward: build money locked by construction stage.
//! Ved: create_project, open_stage, decide, release, recheck.
//! Youdis: fund, assign_inspector, submit_proof, freeze, resolve.

mod storage;
#[cfg(test)]
mod test;
mod types;

use soroban_sdk::{contract, contractimpl, symbol_short, token, Address, BytesN, Env, Vec};
use storage::*;
pub use types::*;

#[contract]
pub struct Homeward;

/// Move `amount` of our token from the contract to `to`. Skips zero amounts.
fn pay(e: &Env, to: &Address, amount: i128) {
    if amount > 0 {
        token::Client::new(e, &token(e)).transfer(&e.current_contract_address(), to, &amount);
    }
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

        let fee = (amount * fee_bps(&e) as i128) / 10_000;
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

        let mut st = load_stage(&e, id, stage)?;

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

        save_stage(&e, id, stage, &st);

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
        if p.funded - p.spent < st.materials + st.labour_amount {
            return Err(Error::InsufficientFunds);
        }
        pay(&e, &p.supplier, st.materials);
        p.spent += st.materials;
        st.status = StageStatus::Open;
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
                Self::release(e.clone(), id, stage, report_hash)?;
            }
        } else {
            save_stage(&e, id, stage, &st);
        }
        Ok(())
    }

    /// Pays every payee of an approved stage in ONE call and records a certificate.
    /// Anyone may call it once the hold time has passed (no auth needed: the
    /// money can only ever go to the fixed payees).
    pub fn release(e: Env, id: u32, stage: u32, report_hash: BytesN<32>) -> Result<(), Error> {
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
        for py in st.payees.iter() {
            // Last payee gets whatever is left, so rounding never loses a unit.
            let amt = if i == n - 1 {
                st.labour_amount - paid
            } else {
                st.labour_amount * py.bps as i128 / 10_000
            };
            pay(&e, &py.to, amt);
            paid += amt;
            e.events()
                .publish((symbol_short!("paid"), id, stage), (py.to.clone(), amt));
            i += 1;
        }

        p.spent += st.labour_amount;
        st.status = StageStatus::Paid;
        save_project(&e, id, &p);
        save_stage(&e, id, stage, &st);

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
        pay(&e, &p.builder, unspent - refunded);

        p.spent = p.funded;
        save_project(&e, id, &p);
        e.events()
            .publish((symbol_short!("resolved"), id), refunded);
        Ok(())
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
