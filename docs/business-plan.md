# Homeward: business plan

Written 14 Nov 2026 for the Project Showcase (16 Nov) and the finals (18 Nov). It brings together `business-case.md`, `business-one-page.md`, `builder-deposit.md`, `assumptions.md`, the evidence files, the pitch strategy, and every interview we have done so far. Where those documents disagree, this one uses the most recent version and says so.

**How to read the numbers.** Every figure is tagged:
- **[V]** verified in a source (listed at the end)
- **[C]** calculated from verified figures (the sum is shown)
- **[A]** our assumption, not data. Each one says how we will test it.

Nothing in this plan claims validated pricing, demand or a precise market.

---

## 1. Summary

1. **Problem.** Families abroad can send money home in seconds, but they cannot see what it turns into. Payment gets ahead of the work, approvals get lost across WhatsApp threads, and getting money back after a bad build can take years in a consumer commission.
2. **Customer.** Kerala-origin family members in Canada and the Gulf who are paying, from savings, for a build or extension on the family's own plot, with their own builder, usually ₹10 to 40 lakh. Best fit: ₹25 to 40 lakh builds funded by two or more siblings.
3. **Product.** A Soroban contract on Stellar locks the family's money and releases it one stage at a time. Materials are paid to the supplier when a stage opens. The builder's labour is paid only after an independent engineer passes the work and the parent approves. The parent can force a second, different engineer. The builder posts a deposit that goes to the family if they walk off.
4. **Revenue.** 1.5% of the money families lock in, enforced by the contract. Engineer visits are billed separately at a fixed price, the same whether the engineer passes or fails the work.
5. **Market.** About ₹34,269 crore a year of remittances goes into renovating houses and shops in Kerala alone [C]. We estimate 1,700 to 20,600 qualified builds a year, with 6,850 as the base case [C from assumptions].
6. **Break-even.** A lean team on ₹30 lakh builds with an engineer-visit margin needs about 100 builds a year, which is 1.4% of the base market [C]. On ₹15 lakh builds with the fee alone it does not work, and we say so.
7. **Validation.** One family interview and 15 engineer interviews. Engineers back the idea. Families paying the fee is still untested, and that is what the pilot measures.

---

## 2. The problem

**Payment moves faster than proof.** A transfer to India settles in minutes. Whether the work it paid for exists, and was done properly, is only known by whoever is on site.

**Evidence that this happens:**

| Case | What happened | Tag |
|---|---|---|
| Wayanad, Kerala, 2026 | A US-resident homeowner's brother oversaw the build and reportedly paid ₹34.52 lakh of a ₹37.25 lakh contract. The house was left unfinished and leaking. The commission relied on independent expert evidence. | [V] Indian Express |
| Telangana, 2026 | A consumer commission ordered an ₹8.29 lakh refund after milestone escrow money was released without proper checks on structural problems. Escrow alone was not enough. | [V] Indian Express |
| Kerala, 2026 | A house contracted at ₹32 lakh ended up costing ₹42.63 lakh, and the family moved out because of serious defects. Not shown to involve an NRI; ex parte order. | [V] Indian Express, Mint |
| Banks already do this for loans | Indian lenders release home-loan money by construction stage. Families paying from their own savings get no such check. | [V] ICICI Home Finance |

These are documented examples, not a fraud rate. We do not claim to know how often this happens.

**What our interviews added** (section 10): the problem is mostly not fraud. It is unclear approvals, "stage complete" meaning different things to different people, photos that miss what an engineer would catch, and nobody being able to find who approved what.

---

## 3. Who we serve

### Beachhead: Kerala families in Canada and the Gulf

| Why Kerala | Figure | Tag |
|---|---|---|
| Share of India's inward remittances, 2023-24 | 19.7%, second only to Maharashtra (20.5%) | [V] RBI |
| Remittances into Kerala, 2023 | ₹2,16,893 crore | [V] Kerala Migration Survey 2023 |
| Largest listed use of remittances | Renovating houses and shops, 15.8% | [V] KMS 2023, Table 5.11 |
| Emigrants | 2.2 million | [V] KMS 2023 |
| Dwelling houses completed, 2022-23 | 3,13,468 in Kerala, 27,690 in Thrissur | Team research. **Add the source before using it publicly.** |
| Building rules | Kerala's rules provide for a registered site-supervising professional, so outside oversight is already normal | [V, counsel to confirm current text] |

The senders are changing. Kerala households receiving remittances fell from 16% to 12% between 2018 and 2023, while student emigrants doubled to about 2.5 lakh [V]. Newer senders are younger, in Canada and Europe, and used to apps.

**Who pays:** the son or daughter abroad. Parents, builders and engineers use Homeward for free.

**Best fit, from the interviews:** builds with more than one person paying or deciding. One engineer told us his single-owner clients with simple projects are fine with his reports and WhatsApp. Homeward's value is strongest where siblings, a parent and a builder all need the same record.

### Other markets

| Market | Evidence | Plan |
|---|---|---|
| Punjab, Doaba region | 24% of Doaba households have a current overseas migrant [V, second-hand from a 2015 study] | Second market. Our demo's roof repair is set here. |
| Maharashtra, Tamil Nadu, Telangana, Karnataka | 20.5%, 10.4%, 8.1% and 7.7% of remittances [V] | Expansion, if families there self-build the same way (unverified) |
| NRIs buying flats | About 18% to 20% of property purchases [V, industry commentary] | Not our customer. A different job. |
| Other corridors | Mexico US$68B, Philippines US$40B, Pakistan US$33B [V, World Bank 2024] | Later. The contract is not India-specific, but each corridor needs a local payout partner. |

---

## 4. The product

### How a build runs

1. **Set up.** Homeward lists the family members paying (sponsors), the parent, the builder and the supplier, and sets each stage's materials cost, labour and who gets paid. **Payees are fixed forever after this.** There is no withdraw function, not even for us.
2. **Fund.** Each sibling locks in their share. The contract records what each paid, so any refund is split fairly.
3. **Builder deposit.** The builder posts a deposit (5% in the demo) before the first stage, or lets the first payment fill it.
4. **Open a stage.** Only if the whole stage is funded. The supplier is paid for materials straight away. The builder gets a one-time stage code.
5. **Proof.** The builder uploads a video showing the stage code. Only its fingerprint (hash) goes on-chain. An AI check flags whether the code is visible and the work looks relevant, as a help for the engineer, not a replacement.
6. **Check.** An independent engineer passes or fails the work. The contract refuses anyone with a stake in the build. A failed stage stays locked until new proof passes.
7. **Approve.** The parent approves, or asks for a second engineer. The second engineer must be a different person, and payment waits for them.
8. **Pay.** One transaction pays the builder and labour together and records a stage certificate. 10% of the builder's share is held back as retention.
9. **Finish.** After a defects period (about 60 days in the demo), the builder gets the deposit and retention back.
10. **If the builder walks off.** The family reports it. After a response window, unspent money, the deposit and the retention all go back to the siblings by what each paid in, with a credit so they do not pay the 1.5% fee twice on a new builder.

### Who is in it

| Person | What they do | What they pay |
|---|---|---|
| Sponsor (sibling abroad) | Funds stages, can ask for a second check or stop the build | 1.5% fee plus engineer visits |
| Parent on site | Approves stages in one tap or by SMS reply, in Malayalam or Punjabi, can call a second check | Nothing |
| Builder | Sends proof, gets paid with no chasing, posts a refundable deposit | Nothing |
| Engineer | Passes or fails each stage, paid the same either way | Nothing (paid by the family) |
| Supplier | Paid for materials when a stage opens | Nothing |

### Real today vs simulated

**Real on Stellar testnet:** everything in the contract, at `CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2`, with 50 contract tests and recorded end-to-end runs (29, 23 and 88 checks).

**Simulated:** Interac funding, rupee payouts, SMS, KYC, engineer licences, site photos and the site camera.

---

## 5. Why Stellar

1. **A rule anyone can check.** The release rules live in a public Soroban contract. The family can verify every payment, refusal and refund on Stellar Expert without trusting us.
2. **One approval pays several people.** Builder and labour are paid in one transaction. Our test payout cost 0.019 XLM in network fees [V, testnet].
3. **Near-zero cost per build.** A build is about 25 transactions. On-chain cost is negligible next to the fee.
4. **A path to local payout.** Stellar anchors (SEP-24 and SEP-31) are the route to paying builders in rupees through a licensed partner. Not built yet.

Builders and parents never touch crypto. The money is held as USDC on-chain (test USDC today).

---

## 6. Competition

| | Hire an engineer | RECONPRO, NRI Land Check | Brick & Bolt, BuildNext | DiasporaBuild (Africa) | Homeward |
|---|---|---|---|---|---|
| Independent stage check | Yes | Advertised | Advertised | Advertised | Yes |
| Keep your own builder | Yes | Yes | No, managed builder | Yes | Yes |
| Several family members fund one plan | No | Not shown publicly | No | Not shown publicly | Yes |
| Parent can require a second engineer | No | Not shown publicly | No | Not shown publicly | Yes, enforced |
| Payment cannot leave without the approvals | No | No, owner pays | Escrow, but see the Telangana case | Through Stripe | Yes, enforced by the contract |
| Builder deposit returned to the family on default | No | No | No | Not shown publicly | Yes, enforced |
| Holds money | No | No | Yes | Through Stripe | Through a licensed partner (planned) |

We do not claim to be first or only. RECONPRO already offers independent engineers, stage sign-offs and hashed audit logs, and does not handle money. DiasporaBuild markets nearly the full idea to African families, which tells us the need exists in other corridors. Our difference is the combination: shared family funding, the parent's veto, payment that cannot leave without the approvals, and a deposit that protects the family.

---

## 7. Pricing

### What families already pay

| Item | Price | Tag |
|---|---|---|
| One home inspection | ₹8,000 to ₹15,000 | [V] customer reports |
| NRI villa check package | ₹14,999 | [V] advertised |
| NRI remote site oversight | ₹8,000 to ₹20,000 a month | [V] advertised |
| Project supervision consultancy | 1% to 4% of project cost | [V, weak] vendor blogs |
| Sending money to India | 4.8% South Asia average for a US$200 send; about 3.55% average for digital services; some advertise under 1% | [V] World Bank RPW; [V, weak] vendor figures |

### What Homeward charges

| Line | Price | How it is collected |
|---|---|---|
| Homeward fee | 1.5% of the money families lock in, charged once when it is funded | Enforced by the contract today |
| Engineer visits | A fixed price agreed up front, the same whether the engineer passes or fails the work, never paid through the builder | Billed through the payment partner (pilot) |
| Minimum fee (pilot) | The greater of 1.5% or ₹20,000 | Partner bills the top-up (pilot) |

**What is not a feature.** Two other price models are things the pilot tests, not things we sell: a flat ₹25,000 per build, and an ₹8,000 a month care plan. The contract does not support them, and we do not pitch them.

### How the engineer margin works

1. The family pays the fixed visit price when they fund, shown as its own line.
2. Homeward pays the engineer after the report is in, whether the stage passed or failed.
3. Homeward keeps the difference. We assume 15% [A].

During the pilot this runs through the payment partner, off-chain. Later it can move into the contract as a per-build fee setting with a minimum and a separate inspection payment. That payment cannot sit in the stage payout split, because the contract bars anyone paid from that split from acting as the engineer.

### Fewer site visits

Not every stage needs an engineer on site. The contract already marks stages where concrete will cover the steel (`pre_pour`). Our plan:
- **Site visits** for those stages: foundation and roof slab, about 3 per build.
- **Remote video review** for the rest, helped by the AI check on each proof video.
- **One return visit** budgeted, because schedules slip and fixes need checking. Engineers told us a six-visit package can understate the real number.

### Cost to the family, worked through

| | ₹15 lakh, six visits | ₹15 lakh, pre-pour model | ₹30 lakh, six visits | ₹30 lakh, pre-pour model |
|---|---|---|---|---|
| Homeward fee, 1.5% | 22,500 | 22,500 | 45,000 | 45,000 |
| Site visits at ₹10,000 [A] | 60,000 (6) | 30,000 (3) | 60,000 (6) | 30,000 (3) |
| Remote reviews at ₹3,000 [A] | 0 | 9,000 (3) | 0 | 9,000 (3) |
| Return visit at ₹10,000 [A] | 0 | 10,000 | 0 | 10,000 |
| **Total** | **82,500** | **71,500** | **1,05,000** | **94,000** |
| **Share of budget** | **5.5%** | **4.8%** | **3.5%** | **3.1%** |

All visit prices are placeholders until we have real quotes. None of the 15 engineers gave a price.

### The all-in cost, added up honestly

Families pay to move the money whether or not they use Homeward. We do not add a second transfer. But the honest total adds both:

| How the family sends money | Transfer cost | Plus Homeward and visits | All-in |
|---|---|---|---|
| Bank or money transfer firm | about 4.4% to 6.5% | 3.1% to 5.5% | **about 7.5% to 12%** |
| Low-cost digital service | about 1% to 1.5% | 3.1% to 5.5% | **about 4% to 7%** |

For a careful family that already pays an inspector, the real extra cost is our 1.5%. The comparison that matters: the fee on a ₹15 lakh build is ₹22,500, and one unchecked stage on the same build is ₹3.75 lakh (one demo stage, materials plus labour).

---

## 8. Unit economics per build

Assumptions [A] unless stated. Each gets replaced by a real quote.

| Item | ₹15 lakh build | ₹30 lakh build | Note |
|---|---|---|---|
| Homeward fee, 1.5% | 22,500 | 45,000 | [C] |
| Engineer-visit margin, 15% of ₹60,000 | 9,000 | 9,000 | [A] optional |
| Payment-partner fee, 0.25% of the money | 3,750 | 7,500 | [A] |
| Identity checks, two sponsors | 600 | 600 | [A] |
| Support time, 10 hours at ₹600 | 6,000 | 6,000 | [A] |
| Loss and dispute reserve, 10% of the fee | 2,250 | 4,500 | [A] |
| Acquiring the customer (referrals) | 5,000 | 5,000 | [A] |
| **Contribution, fee only** | **4,900** | **21,400** | [C] |
| **Contribution, with the visit margin** | **13,900** | **30,400** | [C] |

On-chain cost per build is negligible. Interviews suggest support time may fall, because engineers spend less time answering the same questions from several family members.

---

## 9. Market size and break-even

### Top-down

| Step | Figure | Tag |
|---|---|---|
| India inward remittances, FY2024-25 | US$135.4 billion | [V] PIB |
| Kerala remittances, 2023 | ₹2,16,893 crore | [V] KMS 2023 |
| Cross-check: 19.7% of US$118.7B at about ₹83 to the dollar | about ₹1.9 lakh crore | [C] within about 11% of the survey |
| × renovation of houses and shops, 15.8% | **₹34,269 crore a year** | [C] includes shops |
| Canada's share of India's remittances | 1.6% (2020-21) to 3.8% (2023-24), about US$4.5B a year | [V] RBI; [C] 3.8% of US$118.7B |

### Bottom-up: builds we could serve a year in Kerala

| Step | Low | Base | High | Tag |
|---|---|---|---|---|
| Renovation money going into real projects, not small repairs | 15% | 30% | 45% | [A] |
| ÷ average project size | ₹15 lakh | ₹15 lakh | ₹15 lakh | [A] |
| = projects a year | 34,000 | 68,500 | 103,000 | [C] |
| × family-managed from abroad, own builder, paying in stages, willing to pay for oversight | 5% | 10% | 20% | [A] |
| **= qualified builds a year** | **1,700** | **6,850** | **20,600** | [C] |

**How we test it:** in the pilot, count how many families pass each step (building now, own builder, budget above ₹10 lakh, saw the price, put down a deposit), and report the rates with their denominators.

### Break-even

Yearly fixed costs [A]: **Lean ₹30 lakh** (one developer, one coordinator, legal advice, tools), **Base ₹90 lakh** (two developers, an ops lead, two coordinators, compliance, insurance, marketing), **Funded ₹2.5 crore** (adds partner integration and a second corridor).

**Builds needed a year (share of the base market of 6,850):**

| Team | ₹15 lakh, fee only | ₹15 lakh, with visit margin | ₹30 lakh, fee only | ₹30 lakh, with visit margin |
|---|---|---|---|---|
| Lean, ₹30 lakh | 612 (8.9%) | 216 (3.1%) | 140 (2.0%) | **99 (1.4%)** |
| Base, ₹90 lakh | 1,837 (26.8%) | 647 (9.4%) | 421 (6.1%) | **296 (4.3%)** |
| Funded, ₹2.5 crore | 5,102 (74%) | 1,799 (26%) | 1,168 (17%) | 822 (12%) |

**Our plan:** a lean team, ₹25 to 40 lakh builds, and the visit margin. About 100 builds a year. At the low market estimate (1,700) that is still 5.8% [C], which is why the pilot funnel matters as much as the cost estimate.

**What we do not claim:** the 1.5% fee alone does not carry a company on ₹15 lakh builds (26.8% of the base market). The three levers, in order: average build size, the engineer-visit margin, team size. More states multiply the market only if families there build the same way.

---

## 10. Validation so far

### Family interview: Krish's father (1)

He built a house in India while living in Canada and gave permission to be quoted.
- "Easy to send money, very, very hard to get money back."
- He hired a professional inspector, not a relative, and used a checklist, pictures and documents.
- Finding a good one was hard. He tried three or four.
- He wanted a live camera on the site.

**What we built because of it:** money back for stages not started, a live site camera, and a list of checked engineers and builders.

### Engineer interviews (15)

| Where | Count |
|---|---|
| Mumbai | 6 |
| Delhi | 5 |
| Kerala | 2 |
| Canada | 2 |
| **Total** | **15** |

**What they told us, in common:**
- Homeward would be a good way to run stage payments.
- It would save them a lot of hassle: chasing approvals from several family members, finding old reports, confirming which invoices were paid.
- It would help make sure the money is spent on what it was meant for.

**What they did not tell us:** prices. None of the 15 gave a quote, so every visit price in this plan is a placeholder.

**What they showed us about the edges.** We turned the interviews into the scenarios below. **Each is a composite of what several engineers described, not one person's story.** We say so whenever we use them.

| # | Scenario (composite) | What it means for Homeward |
|---|---|---|
| 1 | A mother approves a change she thinks is free. The siblings get an invoice they never expected. The engineer spends a weekend piecing it together from three WhatsApp chats. | One shared record of who approved what, and at what price |
| 2 | A contractor bills for a finished electrical stage that is not finished. | Payment tied to an agreed scope |
| 3 | A waterproofing test fails, the contractor fixes it, and gets paid after a pass. | A check leads to a fix and payment, not a fight |
| 4 | An engineer catches steel errors before a roof pour. After the pour, holding money back could not undo it. | Checks before concrete (`pre_pour`) |
| 5 | Photos of a dry balcony miss water pooling at the door. | Photos do not replace a site visit |
| 6 | "Windows done" means installed to the builder, and working and sealed to the engineer. | A written checklist for each stage |
| 7 | An engineer's report was ignored by another family member who paid anyway. A shared record would have stopped that, but not a dispute over what the price included. | Clear benefit, clear limit |
| 8 | A single visit price misses return visits and schedule changes. | Budget a return visit |
| 9 | A builder asks for an inspection at 6 p.m. for a pour the next morning. | Notice and scheduling rules |
| 10 | A contractor will try inspections but not open-ended waits for siblings abroad. | Fixed response times and agreed materials advances |
| 11 | A family pays a supplier directly; a short delivery stalls the site while they sleep in Canada. | Who accepts deliveries must be agreed |
| 12 | An inspector refuses a job for a relative and refuses to soften a report. | Paid the same pass or fail; no one with a stake |
| 13 | Two engineers disagree and refer it to a specialist. | A specialist route, holding only the disputed part (not built) |
| 14 | A mother sees a leak in the rain after a dry-weather report. | The parent can trigger a second check |
| 15 | An engineer says simple single-owner builds may not need this. | Target multi-sponsor builds |

### What has changed because of the interviews

Already built:
- **Paid the same pass or fail (12):** our engineer pricing policy.
- **Nobody with a stake can be the engineer (12):** enforced by the contract.
- **Parent-triggered second check (14):** `recheck` in the contract.
- **Fixed response windows for builders (10):** in the deposit and default flow.
- **Site visits before concrete covers steel (4):** the pre-pour visit plan.

Next, not built:
- A written checklist for each stage (2, 6).
- A specialist route when engineers disagree, and holding only the disputed part of a payment (13). Today the contract holds the whole stage.
- Rules for materials deliveries and inspection notice (9, 11).

### What is still untested

| Hypothesis | Status |
|---|---|
| Families abroad have this problem | Supported by one family interview, 15 engineers and the court cases |
| Engineers would use it | Supported by 15 engineers |
| Families would pay 1.5% plus visits | **Untested.** Pass mark: 3 of 5 relevant families would seriously consider it after seeing the full price |
| Builders accept deposits, retention and response windows | **Untested.** Engineer accounts suggest conditions (section 11) |
| Engineers can inspect at a workable price | **No quotes yet** |
| Parents understand the approve and check-again screen | **Untested.** Malayalam and Punjabi need a native speaker's check |

---

## 11. Go-to-market

1. **Through engineers.** The interviews point here. Engineers already serve families abroad and told us Homeward saves them work. Each engineer who uses it can bring their next overseas client.
2. **Through community networks.** Kerala and Punjabi associations in Kitchener-Waterloo, Toronto and the Gulf, and our own families.
3. **At the moment of the quote.** A family signing a builder's quote is when they decide how to pay. Reach them through the engineers and architects they already use.

**Pilot (after the challenge).** Ten Kerala families with ₹25 lakh or larger builds:
- A real engineer quote and the full price on one screen.
- Families pay from their own bank account after each approval. We do not hold money in the pilot.
- A refundable deposit to hold a place. We count deposits, not compliments.
- Measure: did anyone understand the approvals, did reports arrive on time, how much coordination time did it save, and was any stage paid without the required approvals (target: none).

**What builders need to say yes** (from the engineer interviews): materials advances agreed up front, inspection criteria fixed before work starts, families responding within an agreed time, and disputes going through a set process. We still have to ask builders directly.

---

## 12. Operations and compliance

- **Holding money needs a licence or a partner.** RBI's September 2025 payment aggregator directions need ₹15 crore net worth at application, rising to ₹25 crore by year three [V]. We will use a licensed partner, not our own licence. Their cut is in the unit economics as 0.25% [A].
- **Noncustodial first.** Families can pay from their own NRE or NRO account after an approval, as RECONPRO already does [V]. That lets a pilot start before any partner is signed.
- **The builder's deposit** must also be held by a licensed party in real rupees.
- **Materials are most of the spend.** About 75% of household construction spending is materials [V, MoSPI, broad definition], against 31% in our demo [C]. More money goes out when a stage opens, so the 5% deposit may be too low. Pair it with purchase-order approval and delivery checks.
- **Kerala's building rules** already call for a registered site supervisor [V]. Homeward's engineer checks are an extra owner-side service, not a replacement.
- **Keys.** The demo signs on the server. Production needs per-user wallets or passkeys, with fees sponsored so parents never see crypto.

---

## 13. Risks and limits

| Risk | What we do about it | What remains |
|---|---|---|
| Engineer and builder collude | The contract bars anyone with a stake; the parent can force a different second engineer; every approval is a public record | A dishonest engineer plus a parent's approval can still release money. The contract checks rules, not concrete. |
| Engineers disagree | A second engineer's rejection keeps the money locked | No specialist route; the whole stage is held, not just the disputed part |
| Admin key | It cannot approve a stage or pay the builder | It opens stages (paying materials), settles disputed defaults, and sets refunds when a build stops. Before real money: a multisig or an agreed independent arbiter. |
| Builder walks off | Deposit, retention and unspent money go back to the family | It reduces the loss. It does not guarantee full recovery. |
| Small builds | Minimum fee and pre-pour visit model | All-in price is high below ₹15 lakh |
| Simple builds do not need us | Target builds with several sponsors | Smaller market than "all NRI builds" |
| Scope disputes | Written checklist per stage (next) | Disputes over what the original price included are outside what Homeward fixes |
| Exchange rate | Live USDC estimate on the fund screen | Rupee value of locked USDC moves until payout |

---

## 14. How we measure impact

1. **Stage payments released without the required approvals.** Target: zero.
2. **Unspent money returned to families** when a build stops.
3. **Disputes settled by the record**, instead of by WhatsApp history or a consumer commission.
4. **Engineer hours saved** on coordination, which engineers told us is the biggest hassle.

---

## 15. Questions judges will ask

| Question | Answer |
|---|---|
| Who pays? | The sibling abroad. Parents, builders and engineers use it free. |
| Why 1.5%? | It is a starting price. On a ₹15 lakh build that is ₹22,500. Families already pay ₹8,000 to ₹20,000 a month for remote oversight. The pilot tests whether they will pay ours. |
| What does the family pay in total? | About 4% to 7% all in with a cheap digital transfer, or 7.5% to 12% through a bank. Our part is 1.5% plus visits. |
| Does the fee pay the engineer? | No. Visits are billed separately at a fixed price, the same whether the engineer passes or fails the work. |
| What share of the market do you need? | About 1% to 4% of qualified Kerala builds with a lean team and ₹30 lakh builds. We would not make it on ₹15 lakh builds with the fee alone. |
| Have you validated it? | We interviewed 15 engineers in Mumbai, Delhi, Kerala and Canada, and a father who built from Canada. Engineers back it. Families paying the fee is what the pilot tests. |
| Why not just hire an engineer? | Many families should. Homeward adds what an engineer alone does not: several siblings in one plan, the parent's say, and payment that cannot leave without the sign-off. |
| Why Stellar? | A public rule anyone can check, one transaction paying several people at near-zero cost, and anchors as the route to rupee payout. |
| Can you hold money? | Not yet. It needs a licensed partner under RBI rules. The pilot runs without holding money. |
| What if the builder disappears? | The deposit, the retention and unspent money go back to the family, with no second fee on a new builder. That reduces the loss; it does not guarantee full recovery. |
| What if the engineer is bribed? | They cannot have a stake, the parent can force a second engineer, and every approval is public. The contract cannot inspect concrete. |
| What do you know least? | How many families fit, what they will pay, and what builders will accept. The pilot measures all three. |

---

## 16. Next steps, in order

1. Five family sessions with `validation-sessions.md` before the finals. Report counts and the noes.
2. Two real engineer quotes, one for a site visit and one for a remote review. Replace the placeholders in sections 7 and 8.
3. One quote from a licensed payment partner.
4. A native speaker checks the Malayalam and Punjabi screens.
5. Add the source for the Kerala and Thrissur housing figures, or drop them.
6. Write the stage checklists (scenarios 2 and 6).
7. After the challenge: the ten-family pilot.

---

## Sources

- Remittances: [PIB, FY2024-25](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219971&lang=2&reg=3); [World Bank 2024 flows](https://blogs.worldbank.org/en/peoplemove/in-2024--remittance-flows-to-low--and-middle-income-countries-ar); [RBI Bulletin, state shares](https://rbi.org.in/scripts/BS_ViewBulletin.aspx?Id=23260).
- Kerala Migration Survey 2023: [GIFT report](https://gift.res.in/wp-content/uploads/2024/09/Kerala-Migration-Survey-Report-2023-Irudaya-Raj.pdf); [IIMAD working paper, Table 5.11](https://iimad.org/wp-content/uploads/2024/06/Working-paper-11-pdf.pdf).
- Cases: [Wayanad, Indian Express](https://indianexpress.com/article/legal-news/new-house-incomplete-leaking-kerala-man-wins-rs-40000-contractor-10826627/lite/); [Telangana, Indian Express](https://indianexpress.com/article/legal-news/house-construction-structural-telangana-wins-rs-8-lakh-refund-10871571/); [₹42.63 lakh house, Indian Express](https://indianexpress.com/article/legal-news/kerala-builder-rs-25-lakh-unfit-home-family-out-2-years-10841625/).
- Stage-release lending: [ICICI Home Finance](https://www.icicihfc.com/en/loans/home-loan/plot-and-construction-loan).
- Remittance prices: [World Bank Remittance Prices Worldwide, Canada to India](https://remittanceprices.worldbank.org/corridor/Canada/India); [RPW Q1 2025 report](https://remittanceprices.worldbank.org/sites/default/files/rpw_main_report_and_annex_q125_1_0.pdf); [RemitBee corridor fees](https://remitbee.com/blog/money-transfer/remittance/top-remittance-corridors-2025-fees-market-share) (vendor figures).
- Competitors: [RECONPRO](https://reconpro.io/nri); [NRI Land Check](https://www.nrilandcheck.in/construction-monitoring); [Brick & Bolt](https://www.bricknbolt.com/home-construction-company); [BuildNext](https://buildnext.in/); [DiasporaBuild](https://diasporabuild.com/).
- Compliance: [RBI payment aggregator directions, Sep 2025](https://rbi.org.in/scripts/BS_ViewMasDirections.aspx?id=12896); [RBI NRE/NRO FAQs](https://www.rbi.org.in/scripts/FS_FAQs.aspx?Id=52&fn=5).
- Construction: [MoSPI own-account construction, PIB](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2250808); Kerala cost per sq ft: [Infralens](https://www.infralens.in/knowledge/construction-cost-kochi-kerala-2026).
- Inspection and oversight prices, competitor details: `docs/Homeward Evidence Part 3 - Updated and Expanded.md`.
- Contract, deposit and testnet results: `docs/builder-deposit.md`, `contracts/homeward`, `web/mock/proof.json`.
