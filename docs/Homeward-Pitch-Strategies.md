# HOMEWARD — THREE COMPETITION PITCH STRATEGIES

**Prepared:** 12 November 2026 · **For:** University of Waterloo / Velocity Blockchain Innovation Challenge powered by Stellar · **Presenter (per README):** Ved Agwekar  
**Method:** An advisor council (five independent advisors, five blind peer reviews, chairman verdict) plus a check of the public repo, the Testnet contract and the official judging page. The council summary is in the appendix.

> **Status line for the whole team.** Everything below uses only what we could verify. There are no documented customer interviews, deposits, engineer quotes or partners yet. Interac, rupee payouts, SMS, KYC, engineer licences and site photos are simulated. The Soroban contract and the end-to-end Testnet script are real.

---

## Competition Brief

**Format (official Devpost rules).** One presenter. 3:00 total. That 3:00 **includes** a mandatory 1:00 prerecorded video of the working prototype. A slides-only video does not count. So the live speech is about **2:00, roughly 215–255 words**. Teams also submit a public video link, a public GitHub repo with setup steps, a Testnet contract ID or live app URL, and a trifold board.

**Judging (verified on the official Notion page, 12 Nov 2026).**

| Category | Weight | What judges look for |
|---|---:|---|
| Business Impact and Relevance | **37.5%** | Real, evidenced problem; how impact is measured; differentiation, including benefits of building on Stellar; a specific, reachable first customer and market size; affordable pricing and early cost thinking; **user validation: prototype tested with real users** |
| Technology and Implementation | **37.5%** | Meaningful Stellar use (Soroban, assets, anchors/SEPs); sound on-chain/off-chain split; a working, verifiable build with contract IDs and docs; security, key management, KYC awareness; UX that hides blockchain |
| Presentation | **~25%** | The page's third section did not load through Notion's public API. 25% is the remainder and matches the team's earlier summary. Treat it as likely, not confirmed. |

**Who is judging.** Project showcase judges are mostly Stellar Development Foundation staff: ecosystem, ecosystem impact, policy, developer advocacy and payment-partner account management, plus an ecosystem contributor. The finals judge listed is a co-founder of Float, a Canadian business-payments fintech. Expect sharp questions on custody, key control and payment economics.

**What is verifiably built (repo `vedagwekar/homeward`, checked 12 Nov 2026).**

| Item | Status | Proof to show |
|---|---|---|
| Soroban contract on Testnet | **Real.** `CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO`. Stellar Expert reports 91 invocations, 106 events, 0 errors. | Stellar Expert contract page |
| Contract tests | **33 test functions in the repo**, including `t1_no_payout_without_approval`, `t2_stranger_cannot_approve`, `parent_must_approve_blocks_payment`, `engineer_cannot_have_a_stake_in_the_project`, `second_engineer_must_be_a_different_person`, `frozen_project_pays_nobody`. **We did not run them for this review.** | Run `cargo test` and screenshot the result before saying "passing" |
| End-to-end Testnet script | **Real.** `scripts/demo.ts`: two siblings fund 60/40, the supplier is paid when a stage opens, the foundation pays builder 60% and labour 40% in one transaction with a certificate, then on the roof the builder resubmits old footage, Amma taps "check again", engineer 1 approves, engineer 2 rejects, and the script checks that builder, labour and contract balances did not move. | Explorer links printed by the script |
| Web app | **Real UI, demo data.** On `main`, the app runs on browser-stored mock data with placeholder receipt links. The README says it is "being connected to the backend API". The live Vercel app was not opened in this review. | Label it on screen |
| Simulated | Interac, INR payouts, SMS, KYC, engineer licences, site photos, site camera. Test token TUSDC at a demo rate of 1 = ₹85. | On-screen label |

**Contract powers judges will ask about.** The builder's stage payment (`release`) needs the stage to be approved by the assigned engineer(s), plus the parent if required. Homeward's admin key creates projects, assigns engineers, opens stages, which pays the supplier for materials, and settles frozen projects by choosing the refund share. The admin cannot approve a stage. **So say "the builder's stage payment can't go out without the engineer and parent." Do not say "nobody, including us, can move money."**

**Presentation constraints we carry into every version.**

- The video is one uninterrupted 60-second block. Nobody speaks over it.
- Before the video, set up who and why. During it, show how. After it, explain why it matters and how it makes money.
- No more than two numbers that the audience has to hold in their heads.
- Never say "fraud-proof", "trustless", "blockchain verifies the building", "live rupee payouts" or "customers told us".

---

## The 60-Second Video (shared asset)

The team can realistically make one video. All three versions use the same cut. Each version's "Video integration" section says what it must achieve in that slot. Use captions only, with no voiceover, so the presenter's live lines and the video never repeat each other.

| Video time | Shot | On-screen caption |
|---|---|---|
| 0:00–0:07 | Web app, Homes dashboard: the Thrissur roof build, ₹15,00,000, two siblings | "Two siblings in Canada. Amma's roof in Thrissur." |
| 0:07–0:16 | Fund screen: 1.5% fee shown up front, sibling picker. Cut to the Stellar Expert funding transaction. | "Fees shown before paying. Money locked in a Stellar contract." |
| 0:16–0:26 | Foundation stage opens and the supplier is paid. Engineer and Amma approve. One transaction pays builder 60% and labour 40%. Stage certificate on Stellar Expert. | "Materials first. Labour paid only after engineer + Amma approve." |
| 0:26–0:48 | **Roof slab.** Builder uploads the foundation video again. Amma taps **Check again**. Engineer 1 approves and the status stays "waiting". Engineer 2 rejects. Cut to the script output: builder, labour and contract balances **unchanged**, no certificate. | "Same footage as before." → "Amma asks for a second check." → "One yes is no longer enough." → "Rejected. No one was paid." |
| 0:48–0:56 | Money-back screen: unspent money split back by what each sibling paid in | "If the build stops, unspent money goes back by share." |
| 0:56–1:00 | End card: contract ID, repo link | "Stellar Testnet. Rupee payouts, Interac, SMS and licences are simulated." |

**Production rules.**

1. The 0:26–0:48 roof sequence must show **real Testnet evidence** (explorer page or script output), not only the browser demo. That clip carries the technical score.
2. If the web app is not wired to the contract by recording day, show the web screen for what the user sees and the explorer for what actually happened. Caption the switch: "Same step, on Stellar Testnet."
3. Keep captions at 1–6 words, large enough to read from the back of a room.
4. Export at exactly 60.0 seconds. Rehearse with the real file.

---

## Version A — Human-First Pitch

### 1. Strategy and audience psychology

Version A makes the judges feel the problem before they see the product. It opens on an illustrative family (clearly not a testimonial), then grounds that family in one real 2026 Kerala case: an overseas owner, a brother overseeing, money paid, a house left unfinished. The video plays at the moment of greatest concern, so the product arrives as relief. After the video, Stellar is used as reassurance ("this isn't a promise on a dashboard"), and the close returns to the opening family. **Its advantage** is warmth and instant understanding. Nobody needs a definition of escrow to care. **Different from B and C:** evidence is used for empathy, not for analysis, and the technology is the support act. **Key risk:** it spends about 48 seconds on story, which leaves the business case thin in a rubric where business and technology each weigh 37.5%. Sentiment can also read as filler to SDF engineers.

### 2. Central message

**Distance shouldn't mean paying blind: Homeward lets families abroad check and approve each stage before the builder is paid.** (19 words)

### 3. Detailed 0:00–3:00 outline

| Time | Duration | Purpose | What the presenter says | Evidence integrated | Visual/demo cue | Judge criterion |
|---|---:|---|---|---|---|---|
| 0:00–0:18 | 18 s | Hook: illustrative family | "Picture a nurse in Toronto. Her parents in Thrissur are fixing the roof she grew up under…" (see D) | None. Say "picture", because this family is illustrative. | Board: photo-style illustration of a half-built roof | Presentation |
| 0:18–0:38 | 20 s | The real case | "This isn't hypothetical. In August, a Wayanad consumer commission…" | **Source A**, Wayanad case | Board: one-line case summary with date | Business: problem evidence |
| 0:38–0:48 | 10 s | Thesis and lead-in | "Homeward puts that expert before the payment…" | — | Presenter turns to the screen | Presentation |
| **0:48–1:48** | **60 s** | **VIDEO** (silent presenter) | — | Testnet evidence on screen | **Play the video at 0:48 sharp; it ends at 1:48** | Technology: working build |
| 1:48–2:06 | 18 s | Stellar as reassurance | "What you just saw isn't a promise on a dashboard…" | Contract ID on board | Board: contract ID + QR code | Technology: meaningful Stellar use |
| 2:06–2:34 | 28 s | Business | "Our first customer is the person abroad paying for a family build in Kerala…" | **Source C**, Kerala 15.8% | Board: fee example | Business: customer, monetization |
| 2:34–2:50 | 16 s | Honest next step | "We haven't run this with paying families yet…" | — | — | Business: validation |
| 2:50–3:00 | 10 s | Close | "Sending money home takes seconds…" | — | Return to the roof illustration | Presentation |

**Live words: about 236. Video: 60 s. Total: 180 s.**

### 4. Suggested spoken lines

- **0:00 Hook.** "Picture a nurse in Toronto. Her parents in Thrissur are fixing the roof she grew up under. She sends the money. Then the calls start: the builder needs more. She has photos. She doesn't have proof."
- **0:18 Real case.** "This isn't hypothetical. In August, a Wayanad consumer commission ruled on a house a US-based owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking. It took an independent expert to say what had actually been built."
- **0:38 Lead-in.** "Homeward puts that expert before the payment, not after the damage. Here's a roof, one stage at a time."
- **1:48 Stellar.** "What you just saw isn't a promise on a dashboard. The money sits in a Soroban contract on Stellar Testnet. The builder's stage payment moves only when the named engineer and the parent approve, and every payment leaves a record the whole family can check."
- **2:06 Business.** "Our first customer is the person abroad paying for a family build in Kerala, where renovating houses and shops is the largest single use of remittances. Families already pay for site monitors and inspections separately. We charge 1.5% to run the whole process, and we quote engineer visits openly on top."
- **2:34 Next step.** "We haven't run this with paying families yet. Next is a small Kerala pilot where families pay from their own bank after each approval."
- **2:50 Close.** "Sending money home takes seconds. Homeward helps make sure it builds a home."

### 5. Evidence placement and citations

| When | Evidence | Source | Why it works here | Do NOT imply |
|---|---|---|---|---|
| 0:18 | US-resident owner; brother oversaw a Wayanad build; ₹37.25 lakh completion contract; brother said ₹34.52 lakh was paid; house incomplete and leaking; expert assessed the completion cost; commission awarded ₹30,000 plus ₹10,000 costs (4 Aug 2026) | [Indian Express, 10 Aug 2026](https://indianexpress.com/article/legal-news/new-house-incomplete-leaking-kerala-man-wins-rs-40000-contractor-10826627/lite/) | Turns the illustrative nurse into a real pattern: overseas payer, trusted relative, disputed progress | That ₹34.52 lakh was stolen, that the family were Homeward users, or that Homeward would have prevented it |
| 2:06 | Renovation of houses and shops is 15.8% of remittance uses, the largest listed category (Table 5.11) | [Kerala Migration Survey 2023, IIMAD WP 11](https://iimad.org/wp-content/uploads/2024/06/Working-paper-11-pdf.pdf) | Justifies Kerala as the first market in one clause | That 15.8% of Kerala families want Homeward; it also includes shops |
| 2:06 (implied) | Families already buy site monitoring and inspections | [Homon NRI pricing](https://homon.in/nri?service=site_coordinator), [SAZ pricing](https://sazengservices.com/pricing/) | Shows people already spend money on this job | That those prices are paid Homeward demand |

### 6. Video integration

- **Just before:** "Here's a roof, one stage at a time." The presenter steps aside and does not narrate.
- **Starts at 0:48. Ends at 1:48.**
- **Its job in this version:** the relief. The judge has just met a worried family, and the video shows the same family getting control: fees up front, Amma's button, the payment that stays put.
- **Just after:** "What you just saw isn't a promise on a dashboard." This opens the Stellar explanation without re-describing features.
- **Why here:** emotion peaks at 0:38. Playing the product at that moment converts concern into understanding.

### 7. Opening and closing lines

- **Open:** "Picture a nurse in Toronto. Her parents in Thrissur are fixing the roof she grew up under."
- **Close:** "Sending money home takes seconds. Homeward helps make sure it builds a home." (13 words)

### 8. Strengths, risks and presenter notes

- **Strength:** the easiest pitch to follow. It suits the Presentation score and non-technical judges.
- **Could fail in delivery:** the illustrative nurse can sound like a testimonial. Say "picture" clearly and never give her a surname.
- **Could sound exaggerated:** "not after the damage", if spoken as if Homeward would have saved the Wayanad house. Keep it about timing.
- **Needs technical verification:** "the money sits in a Soroban contract" is true for the Testnet script. If the video only shows the web demo, this line is not proven on screen.
- **Pause** after "She doesn't have proof." and after "unfinished and leaking."
- **Most likely challenge:** "That's a sad story, but how is this different from hiring an engineer, and who pays?" Version A has only 28 seconds to answer that.

---

## Version B — Evidence and Business-First Pitch

### 1. Strategy and audience psychology

Version B argues like a founder who has done the homework. It opens with a precedent every judge accepts: Indian construction lenders already release money only after a technical stage check. Then it names the gap. Families paying from their own savings have to build that protection themselves, and escrow without real checks has already failed in a 2026 Telangana ruling. It defines the buyer, shows the market already pays for parts of the job, and only then shows the product. After the video it names competitors, states the differentiation and gives honest pricing. **Its advantage** is the highest business credibility: the customer, the precedent, the competitors and the price are all on the table. **Different from A and C:** logic first, emotion light, video late. **Key risk:** it can sound like an investment memo, and the video arrives late (1:05). It has the highest number density, and its weakest moment is the ending.

### 2. Central message

**Banks already release construction money only after stage checks; Homeward gives families paying from savings the same protection, with their own builder.** (22 words)

### 3. Detailed 0:00–3:00 outline

| Time | Duration | Purpose | What the presenter says | Evidence integrated | Visual/demo cue | Judge criterion |
|---|---:|---|---|---|---|---|
| 0:00–0:15 | 15 s | Precedent hook | "When an Indian bank lends you money to build a house…" | **Source E**, ICICI stage verification | Board: "Bank loan: checked stage by stage. Family savings: ?" | Business: problem |
| 0:15–0:35 | 20 s | Why escrow alone fails | "Holding money isn't the answer by itself…" | **Source D**, Telangana ₹8.29 lakh | Board: case line | Business: problem evidence |
| 0:35–0:55 | 20 s | Customer and market | "Our first customer is the family member abroad…" | **Source C**, Kerala 15.8%; Homon prices | Board: customer profile | Business: customer segment |
| 0:55–1:05 | 10 s | Lead-in | "Homeward joins those pieces into one process…" | — | Presenter turns to the screen | Presentation |
| **1:05–2:05** | **60 s** | **VIDEO** | — | Testnet evidence | **Play at 1:05; ends at 2:05** | Technology: working build |
| 2:05–2:25 | 20 s | Differentiation and Stellar | "Others do parts of this…" | RECONPRO, NRI Land Check | Board: comparison strip | Business: differentiation; Technology: Stellar |
| 2:25–2:47 | 22 s | Money and path | "We charge 1.5% of funded value…" | Fee arithmetic | Board: ₹15 lakh → ₹22,500 | Business: monetization, validation |
| 2:47–3:00 | 13 s | Close | "Lenders already protect their money with stage checks…" | — | — | Presentation |

**Live words: about 248. Video: 60 s. Total: 180 s.**

### 4. Suggested spoken lines

- **0:00 Hook.** "When an Indian bank lends you money to build a house, it doesn't hand it over at once. A technical team checks each stage first. When a family abroad pays from its own savings, that check is up to them."
- **0:15 Gap.** "Holding money isn't the answer by itself. This September, a Telangana consumer commission ordered an ₹8.29 lakh refund after milestone payments left escrow without proper structural checks. Locked money doesn't help if nobody checks the work."
- **0:35 Customer.** "Our first customer is the family member abroad funding a build in Kerala. In Kerala's 2023 migration survey, renovating houses and shops is the largest single use of remittances. People already pay for pieces of this. NRI site monitoring is advertised at ₹8,000 to ₹20,000 a month."
- **0:55 Lead-in.** "Homeward joins those pieces into one process. Watch two siblings pay for one roof."
- **2:05 Differentiation.** "Others do parts of this. RECONPRO and NRI Land Check send engineers to sites. What we didn't find in their public offers: several family sponsors, a parent who can force a second engineer, and a Stellar contract that pays the stage only after those approvals."
- **2:25 Money.** "We charge 1.5% of funded value. On a ₹15 lakh build, that's ₹22,500. Engineer visits are quoted separately, at real local rates. We start noncustodial: families pay from their own bank after approval, while we work toward a licensed payment partner. Our next test is whether ten Kerala families will pay that price."
- **2:47 Close.** "Lenders already protect their money with stage checks. Homeward lets families protect theirs."

### 5. Evidence placement and citations

| When | Evidence | Source | Why it works here | Do NOT imply |
|---|---|---|---|---|
| 0:00 | Construction-loan stages are verified by a technical team with site inspections before disbursement | [ICICI HFC construction loan FAQ](https://www.icicihfc.com/en/loans/home-loan/plot-and-construction-loan); [ICICI Bank disbursement blog](https://www.icici.bank.in/personal-banking/blogs/loan/home-loan/home-loan-disbursement-process) | The judge accepts the principle instantly, so Homeward looks like a proven idea applied to a new buyer | That ICICI is a partner or accepts Homeward certificates |
| 0:15 | Telangana commission ordered a ₹8.29 lakh refund; milestone payments were released from escrow without adequate structural verification | [Indian Express, 10 Sep 2026](https://indianexpress.com/article/legal-news/house-construction-structural-telangana-wins-rs-8-lakh-refund-10871571/) | Pre-empts the "just use escrow" objection | That all escrow services are unsafe, or that Homeward's inspections are proven reliable |
| 0:35 | Kerala: house/shop renovation is 15.8% of remittance uses | [KMS 2023](https://iimad.org/wp-content/uploads/2024/06/Working-paper-11-pdf.pdf) | Ties the first market to data | A market size in rupees |
| 0:35 | NRI site-monitoring plans advertised at ₹8,000 and ₹20,000 a month | [Homon NRI page](https://homon.in/nri?service=site_coordinator) | Shows existing spending on the job | That Homon has paying customers at that price, or that this is Homeward demand |
| 2:05 | RECONPRO offers independent engineers, stage sign-offs and hashed payment logs, with the owner paying from their own NRE/NRO account; NRI Land Check monitors own-builder projects | [RECONPRO](https://reconpro.io/nri); [NRI Land Check](https://www.nrilandcheck.in/construction-monitoring) | Naming competitors earns trust | That competitors cannot add these features, or that our combination is a world first (DiasporaBuild in Africa is close) |

### 6. Video integration

- **Just before:** "Homeward joins those pieces into one process. Watch two siblings pay for one roof."
- **Starts at 1:05. Ends at 2:05.**
- **Its job in this version:** proof that the argument is built. By 1:05 the judge believes the gap exists, and the video shows the bank-style stage check working for a family.
- **Just after:** "Others do parts of this." This moves to competitors without repeating features.
- **Why here:** the evidence makes the video meaningful. The cost is that technical judges wait 65 seconds for anything real.

### 7. Opening and closing lines

- **Open:** "When an Indian bank lends you money to build a house, it doesn't hand it over at once."
- **Close:** "Lenders already protect their money with stage checks. Homeward lets families protect theirs." (13 words)

### 8. Strengths, risks and presenter notes

- **Strength:** the strongest on customer, competitors and price, which covers most of the 37.5% business weight.
- **Could fail in delivery:** five numbers before the video (₹8.29 lakh, 15.8%, ₹8,000, ₹20,000, 2023). Drop the Homon range if rehearsal runs long.
- **Could sound exaggerated:** "families have no protection". Keep "that check is up to them", because families can hire engineers.
- **Needs technical verification:** "pays the stage only after those approvals" must be visible in the video.
- **Pause** after "that check is up to them."
- **Most likely challenge:** "Your UI says the 1.5% covers the engineer. Six visits cost about ₹60,000. Doesn't that lose money?" Version B already answers it by quoting inspections separately, but the team must change the UI text to match (see Stress Test).

---

## Version C — Product and Technical-First Pitch

### 1. Strategy and audience psychology

Version C bets on one image: a payment that correctly refuses to move. It opens with a provocation, gives the family context in a single breath, and plays the video at 0:20, before judges have formed an opinion. The roof sequence becomes the turning point: old footage, Amma's "check again", one approval no longer enough, a rejection, balances unchanged. After the video, the presenter explains what just happened. **A person caught the problem, and the contract made sure the builder couldn't be paid around them.** Then come why that rule matters (Telangana), why Stellar, and the business. **Its advantage** is memorability and technical credibility. It is the only version where the strongest real asset leads. **Different from A and B:** the demo is the argument, not the illustration. **Key risk:** if the video doesn't clearly show real Testnet evidence, the whole pitch rests on a browser demo. Opening on the video also gives non-technical judges less context.

### 2. Central message

**Homeward's proof is a payment that refuses to move: the builder isn't paid until the engineer and parent approve, enforced on Stellar.** (21 words)

### 3. Detailed 0:00–3:00 outline

| Time | Duration | Purpose | What the presenter says | Evidence integrated | Visual/demo cue | Judge criterion |
|---|---:|---|---|---|---|---|
| 0:00–0:20 | 20 s | Provocation and context | "The most important payment in our demo is one that never happens…" | — | Board: "₹0 moved" | Presentation |
| **0:20–1:20** | **60 s** | **VIDEO** | — | Testnet evidence | **Play at 0:20; ends at 1:20** | Technology: working build |
| 1:20–1:40 | 20 s | What just happened | "Look at what just happened…" | Script balance checks | Board: three icons (engineer, Amma, contract) | Technology: security and trust |
| 1:40–1:55 | 15 s | Why the rule matters | "That rule exists for a reason…" | **Source D**, Telangana | Board: case line | Business: problem evidence |
| 1:55–2:12 | 17 s | Why Stellar | "In an ordinary app, a rule like that is a setting…" | 33 tests, 91 calls | Board: contract ID + QR code | Technology: Stellar use, verifiable build |
| 2:12–2:45 | 33 s | Business | "Our first customer is the family member abroad…" | **Source C**, Kerala 15.8% | Board: fee and pilot | Business: customer, monetization, validation |
| 2:45–3:00 | 15 s | Close | "Sending money home is easy…" | — | Board: "₹0 moved" | Presentation |

**Live words: about 236. Video: 60 s. Total: 180 s.**

### 4. Suggested spoken lines

- **0:00 Hook.** "The most important payment in our demo is one that never happens. Two siblings in Canada are paying for their mother's roof in Kerala. They can send money in seconds. What they can't do is stand on that roof."
- **1:20 What happened.** "Look at what just happened. The builder reused old footage. Amma tapped 'check again'. One engineer said yes, and that was no longer enough. The second said no. The builder and labour balances didn't move. A person caught the problem. The contract made sure the builder couldn't be paid around them."
- **1:40 Why it matters.** "That rule exists for a reason. This September, a Telangana commission ordered an ₹8.29 lakh refund because milestone money left escrow before the structure was properly checked."
- **1:55 Why Stellar.** "In an ordinary app, a rule like that is a setting someone can switch off. Ours is in a Soroban contract: no engineer and parent approval, no stage payment, and every release leaves a public record. It's backed by thirty-three contract tests and ninety-one Testnet calls."
- **2:12 Business.** "Our first customer is the family member abroad funding a build in Kerala, where renovating houses and shops is the largest use of remittances. Families already pay site monitors. We charge 1.5% to run the whole process, with engineer visits quoted separately. We start with families paying from their own bank, then add a licensed partner. Our next test: will ten Kerala families pay?"
- **2:45 Close.** "Sending money home is easy. Homeward makes sure it only pays for work someone has checked."

### 5. Evidence placement and citations

| When | Evidence | Source | Why it works here | Do NOT imply |
|---|---|---|---|---|
| Video and 1:20 | Testnet script: after a recheck and a rejection, builder, labour and contract balances are unchanged and no certificate is issued | Repo `scripts/demo.ts`; [contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO) | The team's own evidence is the most persuasive thing in the room | That the contract detected the recycled footage. Engineer 2, a person, did. |
| 1:40 | Telangana: ₹8.29 lakh refund; escrow milestone release without adequate verification | [Indian Express, 10 Sep 2026](https://indianexpress.com/article/legal-news/house-construction-structural-telangana-wins-rs-8-lakh-refund-10871571/) | Explains why the rule has to be enforced, not just recorded | That the case proves Homeward works |
| 1:55 | 33 test functions; 91 invocations, 0 errors | Repo `contracts/homeward/src/test.rs`; Stellar Expert API, 12 Nov 2026 | Specific, checkable numbers impress SDF engineers | "All tests pass" until someone has run `cargo test` and kept the output |
| 2:12 | Kerala 15.8% | [KMS 2023](https://iimad.org/wp-content/uploads/2024/06/Working-paper-11-pdf.pdf) | Market anchor in one clause | Market size |

### 6. Video integration

- **Just before:** "…What they can't do is stand on that roof." Then the presenter gestures to the screen and goes silent.
- **Starts at 0:20. Ends at 1:20.**
- **Its job in this version:** to be the argument. The judge should leave the video with one picture: "it didn't pay."
- **Just after:** "Look at what just happened." The presenter interprets the video rather than repeating it. The key move is separating the person's judgment from the contract's enforcement.
- **Why here:** early placement lands the strongest real asset while attention is highest, and leaves 100 seconds of live time for meaning and money.

### 7. Opening and closing lines

- **Open:** "The most important payment in our demo is one that never happens."
- **Close:** "Sending money home is easy. Homeward makes sure it only pays for work someone has checked." (16 words)

### 8. Strengths, risks and presenter notes

- **Strength:** the most memorable and the most technically credible. It suits a panel that is mostly SDF staff.
- **Could fail in delivery:** if the video's roof sequence is unclear, the "what just happened" line has nothing to point to. Test the video on a projector.
- **Could sound exaggerated:** "a setting someone can switch off". It is fair as a comparison, but Homeward's admin still assigns engineers and settles frozen projects, so expect that question.
- **Needs technical verification:** 33 tests passing, and explorer links for the roof rejection. Capture both before pitch day.
- **Pause** after "one that never happens" and after "The second said no."
- **Most likely challenge:** "Your admin key picks the engineer. What stops you picking a friendly one?" (see Stress Test).

---

## Side-by-Side Comparison

Editorial estimates, 1–10. **Execution risk: 10 = safest.**

| Criterion | Version A | Version B | Version C |
|---|---:|---:|---:|
| Business impact | 6 | **9** | 7 |
| Technical credibility | 5 | 5 | **9** |
| Presentation clarity | **8** | 7 | 7 |
| Emotional engagement | **9** | 4 | 6 |
| Evidence integration | 7 | **9** | 6 |
| Memorability | 7 | 5 | **9** |
| Execution risk (10 = safest) | **8** | 7 | 5 |
| Fits 180 seconds | 8 | 6 | 8 |
| **Rough weighted score** (37.5% business, 37.5% tech, 25% avg of clarity, emotion and memorability) | 6.1 | 6.7 | **7.6** |

**Tradeoffs.**

- **A** wins hearts but under-feeds both 37.5% categories. Its Stellar line comes after the video, as reassurance, so technical judges never see the mechanism framed as the point.
- **B** is the best business answer, but its demo arrives at 1:05 and it carries the most numbers. Its close is logical rather than memorable. It is the safest choice if the video turns out weak.
- **C** puts the team's only hard-to-copy asset first and gives SDF judges something they can check. It has two real weaknesses: thinner problem evidence (no human case), and full dependence on the video showing real Testnet results.
- **None of the three** fixes the largest gap in the rubric: user validation. Every version needs one honest sentence about it, and the team should try to close it before pitch day.

---

## Recommended Winning Approach

**Recommendation: Version C as the spine, with one change. Replace C's abstract family hook with A's real Wayanad case, compressed to one sentence.** This is not a collage. The structure, video position, Stellar explanation and close are all C. The only import is a single, sourced sentence that gives the "payment that never happens" line a real reason. B's fee arithmetic and competitor honesty go to the board and the Q&A, not the speech.

1. **Why it fits the judging.** Technology is 37.5%, and the panel is mostly Stellar Development Foundation staff. C is the only version that leads with a working, verifiable Soroban flow. Business is also 37.5%. The tuned C keeps a named first customer, a Kerala market anchor, a price, a noncustodial launch path and an honest validation line in 40 live seconds.
2. **Why the evidence placement works.** Each piece answers one question at the moment it arises. Wayanad (0:00) answers "is this real?" Telangana (1:48) answers "why not just escrow?" Kerala 15.8% (2:10) answers "why start there?" The audience holds only two numbers.
3. **Why the demo placement works.** At 0:30 the judges know just enough (an overseas family, a house left unfinished) to understand what they are watching. Everything after the video interprets it, so nothing is repeated.
4. **Emotion versus credibility.** The Wayanad sentence and "Amma" carry the emotion. The rest is mechanism and money. That matches the planned arc: recognition, concern, demonstration, understanding, confidence.
5. **What judges will remember.** "One engineer saying yes wasn't enough, and the builder wasn't paid." Second: "the family keeps its own builder."
6. **What could stop it working.** A video that only shows the browser demo. A presenter running over the 250-word budget. A judge asking about the admin key, the fee math or user validation without a prepared answer. All four have fixes below.

**The council agreed.** All five blind reviewers rated the Executor's demo-first plan strongest. The Contrarian's dissent (lead with the human story to avoid the validation question) is partly adopted through the Wayanad opener. We rejected the Expansionist's "pitch the whole category" idea: every reviewer flagged it as inviting custody and traction questions the team cannot answer.

---

## Final Optimized Pitch Outline

**Presenter: Ved. Live words: about 235 (about 2.0 words per second). Video: one silent 60-second block.**

| Time | Duration | Beat | Spoken line (outline-final) | Board / screen | Criterion |
|---|---:|---|---|---|---|
| 0:00–0:22 | 22 s | **Hook + real case** | "The most important payment in our demo is one that never happens. This August, a Kerala consumer commission ruled on a house a US-based owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking." | Board panel 1: the case line with date and source | Business: problem |
| 0:22–0:30 | 8 s | **Bridge** | "Homeward holds the next payment until the work is checked. Here's how." | Presenter turns to the screen; the video's first caption introduces the siblings and Amma | Presentation |
| **0:30–1:30** | **60 s** | **VIDEO** (presenter silent, standing beside the screen) | — | Video, as in the shot list above | Technology: working build, UX |
| 1:30–1:48 | 18 s | **What just happened** | "The builder reused old footage. Amma tapped 'check again'. One engineer approving was no longer enough. The second said no, and the builder's money stayed where it was. A person caught the problem. The contract made sure the builder couldn't be paid around them." | Board panel 2: engineer → Amma → contract | Technology: security and trust |
| 1:48–2:10 | 22 s | **Why Stellar** | "Escrow alone isn't enough. In September, a Telangana commission ordered an ₹8.29 lakh refund after milestone money left escrow without proper checks. So our rule lives in a Soroban contract on Stellar Testnet: no engineer and parent approval, no stage payment. Every release and refund is a record the family can check." | Contract ID + QR code; "33 contract tests · 91 Testnet calls" | Technology: Stellar use; Business: differentiation |
| 2:10–2:42 | 32 s | **Business** | "Our first customer is the family member abroad paying for a build in Kerala, where renovating houses and shops is the top use of remittances. Homeward charges 1.5% to run the whole process, with engineer visits quoted at local rates. We'll start with families paying from their own bank after each approval, then add a licensed payment partner." | Board panel 3: "₹15 lakh build → ₹22,500 fee + quoted visits" | Business: customer, monetization, feasibility |
| 2:42–2:50 | 8 s | **Validation, honestly** | "We haven't tested with paying families yet. Ten Kerala families come next." | — | Business: user validation |
| 2:50–3:00 | 10 s | **Close** | "Sending money home takes seconds. Homeward makes sure it builds what it paid for." | Return to panel 1 | Presentation |

**Total: 22 + 8 + 60 + 18 + 22 + 32 + 8 + 10 = 180 s.**

**Cut order if rehearsal runs long:** (1) "Every release and refund is a record the family can check." (2) The Telangana sentence; keep "Escrow alone isn't enough." (3) "A person caught the problem." The "families already pay site monitors" point lives on the board and in Q&A.

**Validation slot swap.** If, before pitch day, the team has a documented session (for example, a parent using the Amma screen, or the planned interview with Krish's dad), and has permission to mention it, replace 2:42–2:50 with: "We put the Amma screen in front of [N] parents; [one specific change] came from that." Use the real number only. The commit "Money back, site camera… from interview feedback" is **not** documented evidence until notes exist in `docs/`.

**Before pitch day (all four are needed for this outline to be honest):**

1. Run `scripts/demo.sh` once more and save every explorer link, especially the roof rejection and the unchanged balances.
2. Run `cargo test` and screenshot the output. Say "33 contract tests" only if they pass.
3. Change the UI copy "1.5% covers the engineer" to match the spoken model (inspections quoted separately), or change the spoken line to match the UI. The UI and the speech must not disagree.
4. Rehearse with a stopwatch and the real video file at least five times. The target is finishing at 2:55.

**Trifold board (scored surface; it carries what the speech can't).**

| Panel | Content |
|---|---|
| Left: "The problem" | Wayanad case line; Telangana case line; Kerala 15.8%; the line "Families already pay for site monitors (₹8k–₹20k/month advertised)" |
| Centre: "How it works" | Six-step flow: fund → materials → proof → engineer → Amma → paid or held. Screenshot of the roof rejection. Contract ID + QR code. "Real on Testnet / Simulated" table. |
| Right: "The business" | First customer; fee example; all-in cost honesty (1.5% + quoted visits); competitor strip (RECONPRO, NRI Land Check, Brick & Bolt, DiasporaBuild); pilot plan; "What we still have to prove" |

---

## Judge Stress Test

### Judge 1 — Business investor (likely the Float co-founder)

| Question | Weak answer to avoid | Recommended answer |
|---|---|---|
| Who actually pays? | "The family." | "The sponsor abroad, usually a son or daughter, pays the fee. Parents, builder and engineer use it free." |
| Why 1.5%? | "It's cheap." | "It's a hypothesis. On a ₹15 lakh build that's ₹22,500 for setup, approvals, records and support. We're testing it against what families already pay monitors: ₹8,000–₹20,000 a month advertised." |
| How much goes to engineers? | "The fee covers the engineer." (What the UI currently says.) | "Bundled, it doesn't work. Six visits at around ₹10,000 each would cost more than the fee. So visits are quoted separately at local rates. All-in, that's roughly 3.5–5.5% of a ₹15–30 lakh build, and we'll show families that total up front." |
| Why not just hire a local engineer? | "Engineers can't be trusted." | "Many families should. Homeward adds what an engineer alone doesn't: several sponsors in one plan, the parent's say, and payment tied to the sign-off." |
| Evidence of willingness to pay? | Any invented interview | "None yet, and we won't claim it. Our test is a real price to ten Kerala families, counting deposits, not 'likes'." |
| How do you reach families? | "Social media." | "First through independent engineers and architects at the point a family signs a building quote, and through diaspora networks we already belong to. These are hypotheses to test." |
| How does it scale beyond referrals? | "Viral growth." | "Through engineers. Each local engineer who uses Homeward brings their next overseas client. Later, licensed remittance or payment partners." |

### Judge 2 — Stellar engineer (SDF)

| Question | Recommended answer |
|---|---|
| Why Stellar instead of escrow plus a database? | "Our rules (who can approve, when the builder can be paid, how refunds split) are in a Soroban contract that the family can read and nobody can quietly edit. Test-token transfers settle in seconds for fractions of a cent. Later, anchors could connect it to real rails." *Do not promise a specific anchor.* |
| What is on-chain? | "Project, sponsors, payees and shares; stage status; approvals; hashes of proof videos and engineer reports; certificates; every payment and refund. No photos, IDs or bank details." |
| Who can approve payment? | "Only the engineer assigned to that stage, plus the parent when required. A second check needs a second, different engineer. Someone with a stake in the project can't be the engineer." |
| Can a false engineer approval cause a payout? | "Yes, if a dishonest engineer approves and the parent agrees. The contract enforces the rules; it doesn't know concrete. That's why the parent can force a second engineer, and why choosing engineers is the hard real-world part." |
| What can your admin key do? | "Create projects, assign engineers, open stages, which pays the supplier for materials, and settle a frozen project's refund split. It can't approve a stage or pay the builder. Before real money, those powers should move to a multisig or an agreed independent arbiter." **Don't hide this.** |
| Keys compromised? | "Today, demo keys are held on the server for the Testnet script. Production needs per-user wallets or passkeys, with fee sponsorship so parents never see crypto." |
| Are transactions actually shown? | "Yes. Here is the contract on Stellar Expert, with 91 invocations. The roof rejection is in the video, with explorer links." *(Only if captured.)* |
| Testnet vs INR? | "Test token TUSDC at a demo rate. No rupees moved. Interac and payouts are simulated, and the screen says so." |

### Judge 3 — Startup competition judge

| Question | Recommended answer |
|---|---|
| Is this financial inclusion? | "Banks give stage-checked release to people who borrow. Families paying from savings, often with parents who aren't comfortable with apps, get no such structure. Homeward gives them that protection, with big buttons and the parent's say." |
| Is the customer different from a generic construction-app user? | "Yes. The buyer is overseas, the occupant is a parent, and two or more siblings share the cost. Most construction apps assume one owner on site." |
| Is it realistic? | "As a noncustodial pilot, yes: families pay from their own bank after approval. Holding money for real needs a licensed partner under RBI payment-aggregator rules, and we won't skip that." |
| Why advance this team? | "The contract works on Testnet, we know our closest competitors by name, and we know exactly what we still have to prove." |

### Lines in the outlines that were weakened and fixed

| Vulnerable line | Problem | Fixed version |
|---|---|---|
| "Nobody can move the money except by the rules" (early draft) | The admin opens stages (paying materials) and settles frozen projects | "The builder's stage payment can't go out without the engineer and parent." |
| "The contract caught the fake footage" | A human engineer caught it | "A person caught the problem. The contract made sure the builder couldn't be paid around them." |
| "1.5% covers the engineer" (current UI) | Loses money at realistic visit costs | "1.5%, with engineer visits quoted at local rates." Update the UI. |
| "All 33 tests pass" | Not run in this review | Say it only after `cargo test` output is captured |
| "No one else does this" | RECONPRO, NRI Land Check and DiasporaBuild overlap | "What we didn't find in their public offers…" |
| "Most of a ₹37 lakh contract was paid" | It was the representative's statement | "…had reportedly been paid." |

---

## Sources

| Source | Claim it supports | Where used |
|---|---|---|
| [Indian Express, 10 Aug 2026, Wayanad](https://indianexpress.com/article/legal-news/new-house-incomplete-leaking-kerala-man-wins-rs-40000-contractor-10826627/lite/) | US-resident owner; brother oversaw; ₹37.25 lakh completion contract; ₹34.52 lakh said to be paid; incomplete, leaking; expert assessment; ₹30,000 + ₹10,000 award | A, Final |
| [Indian Express, 10 Sep 2026, Telangana](https://indianexpress.com/article/legal-news/house-construction-structural-telangana-wins-rs-8-lakh-refund-10871571/) | ₹8.29 lakh refund; milestone release from escrow without adequate structural checks | B, C, Final |
| [Kerala Migration Survey 2023, IIMAD WP 11, Table 5.11](https://iimad.org/wp-content/uploads/2024/06/Working-paper-11-pdf.pdf) | Renovation of houses/shops = 15.8% of remittance uses, the largest listed | A, B, C, Final |
| [PIB / Ministry of Finance, 29 Jan 2026](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2219971&lang=2&reg=3) | US$135.4B remittances, FY2024–25. **Q&A only; not the market.** | Stress test |
| [ICICI HFC construction loan](https://www.icicihfc.com/en/loans/home-loan/plot-and-construction-loan); [ICICI Bank disbursement](https://www.icici.bank.in/personal-banking/blogs/loan/home-loan/home-loan-disbursement-process) | Lenders verify construction stages before disbursing | B |
| [Homon NRI pricing](https://homon.in/nri?service=site_coordinator) | NRI site monitoring advertised at ₹8,000 and ₹20,000 a month | B, Final board, Stress test |
| [SAZ Engineering pricing](https://sazengservices.com/pricing/) | NRI villa inspection advertised at ₹14,999 | A, board |
| [WAPCOS indicative notice](https://www.wapcos.co.in/english/doc/a69e6760-e848-42a4-b197-1ffa2ee9f6af/?download=1) | Indicative ₹5,000–₹10,000 visit + ₹5,000 report; basis for the ~₹10,000 per visit scenario | Stress test |
| [RECONPRO NRI](https://reconpro.io/nri); [NRI Land Check](https://www.nrilandcheck.in/construction-monitoring); [Brick & Bolt](https://www.bricknbolt.com/home-construction-company); [DiasporaBuild](https://diasporabuild.com/) | Competitors and overlapping features | B, board, Stress test |
| [RBI Master Direction on Payment Aggregators](https://www.rbi.org.in/SCRIPTS/BS_ViewMasDirections.aspx?id=12896) | Custody needs a licensed entity; supports the noncustodial pilot | Stress test |
| [Shalwani & Lines 2021](https://www.sciencedirect.com/org/science/article/pii/S0969998821000758) | Issue logs associated with 3.1–4.3% less cost growth (observational). **Q&A only.** | Stress test reserve |
| [Contract on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CC2T4LZMG2UX7TCYX63MSCWSRYZO3XWNP3IACH47WQVM7NSI7XZP3JNO) | Deployed Testnet contract; 91 invocations, 0 errors (API read 12 Nov 2026) | C, Final |
| [GitHub repo](https://github.com/vedagwekar/homeward) (`contracts/homeward/src/test.rs`, `scripts/demo.ts`, `contracts/homeward/src/lib.rs`) | 33 test functions; Testnet demo flow; admin powers | C, Final, Stress test |
| [Official judging criteria (Notion)](https://uwvelocity.notion.site/Judges-Criteria-Prizes-55163713ead68280bca8010b823ef072); [Devpost rules](https://blockchain-stellar-ic.devpost.com/) | Weights, criteria, format | Brief |

Supporting evidence ledgers: `homeward-evidence.md` (6 Nov), `evidence2.md` (9 Nov), *Homeward Evidence Part 3* (12 Nov).

---

## Appendix — Council Verdict: which pitch strategy wins

**Advisors (independent):** Contrarian, First Principles, Expansionist, Outsider, Executor. **Peer reviewers:** 5, blind to authorship.

**Where the council agrees**

- The biggest scoring gap is user validation, not running order. Four of five advisors said so on their own.
- Lead with the "payment that doesn't move" Testnet flow. Four of five chose demo-first.
- Name RECONPRO. Silence reads as naivety.
- Don't spend airtime on the US$135.4B figure.
- The fee story must be fixed: bundling engineers into 1.5% loses money.

**Where the council clashes**

- **Contrarian vs the rest:** the Contrarian argued that demo-first invites the "who will pay?" question and favoured the human story as cover. The others argued that owning the gap in one sentence beats hiding it.
- **Expansionist vs everyone:** the Expansionist pitched "programmable trust for all family capital". All five reviewers named this the biggest blind spot, because it invites custody and traction questions in front of payments judges.

**Blind spots caught in peer review**

- The video is a scored, prerecorded artifact. It must show real Testnet evidence, not only the browser demo with placeholder receipts.
- "The payment didn't move" proves rule enforcement, not fraud detection. A human engineer spotted the footage.
- The trifold board and README are scoring surfaces and can carry evidence the speech can't.
- The single presenter must rehearse to the word budget.

**Recommendation:** Version C with the Wayanad opener (above). All five reviewers ranked the Executor's demo-first plan strongest. The chairman kept its spine, added the Contrarian's human grounding, and rejected the Expansionist's category pitch.

**The one thing to do first:** Re-run `scripts/demo.sh`, save the roof-rejection explorer links, and build the video's 0:26–0:48 sequence around them.
