# Homeward: what is real, what is demo, what we know is weak

Written 14 Nov 2026 for the pitch and the Q&A. Each line says where the limit is and what we would do about it. Nothing here is hidden in the code: the file and line are named.

## What the contract guarantees (tested)

- Payees, stage amounts and the builder's terms are fixed when the build is created.
- Money leaves only to the fixed payees, after the approvals the stage needs. The contract holds exactly `(funded - spent) + deposit + retention`, and a test checks it.
- Homeward's admin account cannot pay itself. It can settle a disputed report only by forfeiting or dismissing it.
- An engineer cannot be someone who pays, builds, supplies or gets paid. Once proof is in, the engineer cannot be swapped.

## What it does not guarantee

| Limit | Where | What we say and plan |
|---|---|---|
| **The contract proves who approved, not that the work is real.** The stage code and video fingerprint are stored, never checked. | `open_stage`, `submit_proof` | It controls who may release money. It is not a truth oracle. In production the engineer is licensed, insured and named. |
| **Homeward picks the engineers.** An admin and an engineer working together could approve bad work. | `assign_inspector` | Engineer pool with published credentials, rotation, and the parent's right to demand a second engineer. |
| **The admin can steer a stopped build.** After a freeze, `resolve` lets the admin choose how much unspent money goes back, and the rest goes to the builder. Any one sponsor or the parent can freeze. | `freeze`, `resolve` | Roadmap: sponsors must agree to any refund below 100%, and an exit if the admin goes quiet. |
| **An unconfirmed report never expires.** It holds the builder's deposit until the family withdraws it. | `claim_default`, `return_deposit` | Roadmap: an expiry on reports. |
| **A payee who cannot receive the token blocks the stage.** | `release`, `resolve`, `forfeit` | Check trustlines before a build is set up. Roadmap: let each person collect their own share. |
| **Data expires if nobody touches it** (30 days per touch). | `storage.rs` | `scripts/extend.sh` weekly, and a longer extension window in the next version. |
| **No upgrade, no pause.** | whole contract | A fix means a new contract and a migration. This is also why Homeward cannot rewrite the rules. |
| **The first stage's materials are paid when the stage opens, before any proof.** The deposit does not cover real-world materials (about 75% of spend in real builds). | `open_stage` | Cap materials per stage, or approve a purchase order first. |

## What is demo only

| Item | Why | Real version |
|---|---|---|
| The backend holds every role's key, and the web app can act as any role. | Lets one person run the whole story. | Each person signs with their own wallet or passkey. The admin becomes a multi-signature account. |
| No sign-in on the API. | Same. | Real accounts, with identity checks for sponsors. |
| Request limits, `ADMIN_KEY`, and a cap on free test money. | Stop floods on a public demo. | Per-account limits. |
| Test dollars, a fixed rupee rate, simulated Interac, SMS and payouts. | Testnet. | A licensed payment partner holds the money. |
| History comes from what our backend sent, not from the chain. | No indexer yet. | An indexer reads chain events and keeps them. |
| One server, one disk. | Hackathon scale. | A managed database, backed up. |

## Answers to the likely questions

- **Who holds the keys?** On the demo, our server does, and it says so on screen. The contract rules are real, and you can read them and the transactions on Stellar Expert.
- **What if the engineer lies?** The contract cannot tell. It limits who can sign, requires a second engineer on request, and records who approved each stage, with the engineer's report.
- **Can Homeward run off with the money?** There is no function that sends money to Homeward except the fee at funding. The admin can steer only the unspent money of a stopped build, which is on our list to tighten.
- **What happens to the builder's deposit?** It comes back after handover and the defects period, or goes to the family after a confirmed default.
