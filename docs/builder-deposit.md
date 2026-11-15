# Builder deposit, retention and default

What changed in the contract, how money moves now, and what the backend and app have to do next. Written 14 Nov 2026. The code is in `contracts/homeward/src`, with 50 passing tests.

## The idea in one paragraph

The builder keeps a deposit and a share of each payment in the contract. If the build goes well, all of it comes back at handover. If the builder abandons the job, it goes to the families, together with whatever is still locked, so a replacement builder can be paid without the family dipping into their own pocket. Anil's fee does not change, and Homeward never keeps forfeited money.

## What is new in the contract

### Terms, set once in `create_project`

`create_project` takes a new last argument, `SecurityTerms`. Like the payees, it is fixed forever after that call.

| Field | Meaning | Demo value on a ₹15,00,000 build |
|---|---|---|
| `deposit` | The deposit the builder keeps in the contract. 0 means none. | ₹75,000 (5%) |
| `upfront` | The part that must be posted before the first stage opens. 0 means "earned from the first payment". | ₹75,000, or 0 |
| `retention_bps` | Share of each stage's labour held back from the builder. Capped at 2,000 (20%). | 1,000 (10%) |
| `defects_secs` | Wait after the last stage is paid before the builder gets it all back. | about 60 days |
| `stall_secs` | A stage waiting on the builder this long can be declared a default. | about 30 days |
| `response_secs` | How long the builder has to respond to a default claim. | about 7 days |

The demo values are suggestions to test with builders, not validated numbers. Zero stall or response windows are refused.

### New functions

| Function | Who signs | What it does |
|---|---|---|
| `post_deposit(id, amount)` | the builder | Moves the builder's tokens into the contract, up to the deposit target. |
| `return_deposit(id)` | anyone | After the last stage is paid and the defects period has passed, sends deposit plus retention to the builder. Refused while a claim is open or the project is frozen. |
| `claim_default(caller, id, stage)` | a sponsor or the parent | Opens a claim on a stage. If that stage has waited on the builder for `stall_secs`, the claim stands on its own. Otherwise an engineer must confirm. |
| `confirm_default(engineer, id)` | an engineer assigned to the claimed stage | Confirms the failure and starts the builder's response window. |
| `contest_default(id)` | the builder | Disputes a confirmed claim during the window. |
| `finalize_default(id)` | anyone | After the window, with no dispute, carries out the default. A stall claim is re-checked first. |
| `settle_default(id, forfeit_it)` | the admin | Settles a disputed claim, only between "forfeit" and "dismiss". |
| `withdraw_claim(caller, id)` | a sponsor or the parent | Takes an open claim back. |
| `get_claim(id)`, `fee_credit(sponsor)` | nobody (views) | Read a claim, or a sponsor's fee-free credit. |

### Changed behaviour

- **`open_stage`** refuses with `DepositNeeded` until `upfront` is posted. It also records when the stage started waiting on the builder.
- **`decide`**, on a rejection, restarts that clock.
- **`submit_proof`** cancels a claim that only rested on a stall. Sending proof is the builder's answer.
- **`release`** holds back part of the builder's share only. Workers and everyone else are paid in full. Until the deposit is full, the builder's payment fills it. After that, `retention_bps` of the stage's labour is held back as retention. When the last stage is paid, the completion time is recorded.
- **`resolve`** (a stop with no default found) returns the builder's deposit and retention to the builder.
- **`fund`** takes no fee on money covered by the sponsor's fee credit. Credit comes only from a default refund.

## Money flow

Per project, the contract always holds exactly: `(funded - spent) + deposit_held + retention_held`. A test checks this. There are three separate pots:

1. **Family money**: `funded - spent`. Pays suppliers and labour, as before.
2. **Deposit**: the builder's own money. Never touches the stage payments.
3. **Retention**: labour withheld from the builder's share at each release.

On the demo home (₹15,00,000, 5% deposit posted up front, 10% retention), at the roof stage, with ₹8,55,000 paid out and ₹2,70,000 locked, ₹1,23,000 of the builder's money is held: ₹75,000 deposit plus ₹25,500 and ₹22,500 retention from the foundation and walls.

## Flows

**Nothing goes wrong**
1. Admin creates the project with terms. Families fund. The builder posts the deposit (or lets the first payment fill it).
2. Each stage: open, proof, approval, release. Release pays the supplier at open, then workers in full and the builder less retention.
3. Last stage paid. After `defects_secs`, anyone calls `return_deposit`. The builder gets deposit plus retention in one transaction.

**The builder disappears or stalls**
1. A sponsor or the parent calls `claim_default` on the stuck stage.
2. The stage has waited `stall_secs`, so the claim is confirmed automatically, and the builder's window starts.
3. If the builder sends proof in time, the claim is cancelled. Otherwise anyone calls `finalize_default` after the window.
4. The project stops. Unspent money plus the deposit and retention go to the sponsors in proportion to what each paid in. Each sponsor gets a fee credit for their share of the unspent money.
5. Admin creates a new project for the remaining stages with a new builder. Families fund it from the refund. The credit covers the first part, so there is no second 1.5% fee.

**A default that isn't a stall** (for example a fake video, or a defect after handover)
1. The family calls `claim_default`. An engineer assigned to that stage calls `confirm_default`.
2. The builder has `response_secs` to `contest_default`.
3. No contest: `finalize_default` carries it out. Contested: only the admin can settle it, with `settle_default`.

## Why a new project and not a new builder

Payees can never change. That is the strongest promise in the pitch. So a default ends the old project and starts a new one with new payees, and the credit stops the family paying the fee twice.

## What the admin can and can't do

- It can settle a disputed claim between two outcomes. It cannot send anything to itself.
- It cannot change terms, payees or stages after `create_project`.
- `resolve` still lets the admin choose how much unspent family money goes back, as before. It cannot touch the builder's security. That only returns to the builder or goes to the sponsors.

## Not done yet

- **Deployment.** This is a new contract with a new ID. The old contract stays on Testnet with its transactions, so the links in the submitted form still work. Nothing has been deployed.
- **Backend and app.** `create_project` has a new argument, so the generated client must be regenerated, and the backend, `scripts/demo.ts` and the smoke test must pass terms. The builder needs a deposit screen, and the family a "builder's deposit held" line. None of that is written.
- **Real money.** A deposit in rupees must be held by a licensed partner, like the family's money.
- **Disputes.** The admin's settlement of a contested claim is still a trusted step.
- **Unvalidated numbers.** 5%, 10%, 30 days, 7 days and 60 days are starting points to test with builders.
- **Edge case.** A project with no retention and no deposit still has the default path, which lets the family stop a stalled build and recover unspent money.
