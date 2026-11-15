# Homeward: pitch update for the showcase, built around the ten weak spots

Written 15 Nov 2026. It updates `Homeward-Pitch-Strategies.md` (written before the deposit, the AI check, the hardening and the interviews) and uses Krish's `business-plan.md` (PR 37) and Rivan's `Homeward_Judge_Answers_Problems_6-10.md` (PR 36).

Assumption to correct if wrong: the docs list **16 Nov as the Project Showcase** (judges walk up to a table and a trifold) and **18 Nov as the finals** (a 3-minute stage pitch). Part 2 is the showcase plan. Part 3 is the stage script.

## 1. Fix these before anything else

| Where | Says | Should say |
|---|---|---|
| "We spoke to around 20 people" | 20 | **16 documented:** 15 engineers (Mumbai 6, Delhi 5, Kerala 2, Canada 2) and 1 father who built from Canada. If four more conversations happened, add a table of who, where, when and what they said to `docs/` before saying 20. A judge who asks "who?" needs an answer. |
| Who the 15 are | "validation" | They are **engineers**, who gain clients from Homeward. They back the idea. That is supply-side evidence, not proof that families will pay. Say so first, before a judge does. |
| The 15 scenarios | Real stories | Krish's plan says they are **composites**. Say "composite of what several engineers described" every time. |
| Old outline | "33 contract tests · 91 Testnet calls", the first contract | **50 tests**, the new contract `CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2`, builder deposit and default path |
| Old outline | Admin key described as "can't pay the builder" | Add: it can steer a stopped build's refund and settle disputes (`docs/technical-limits.md`). Say it before they ask. |
| Old outline | Video shows roof rejection only | Add the deposit and the "builder disappears" payoff (`security.sh` has the transactions) |
| All-in price | "3.5% to 5.5%" | Krish's table adds the transfer cost: **4% to 7%** with a digital service, **7.5% to 12%** through a bank. Use that |
| Engineer margin | 15% on visits | A judge can say Homeward profits when more visits happen. Publish the visit schedule up front (three pre-pour visits, remote reviews for the rest) and show the margin |

## 2. Showcase (16 Nov): make the judges do the work

Judges remember what they did. Five stations, each under two minutes, each aimed at a weak spot. One person runs each. Keep the live backend, a laptop-width window signed in as Anil, and a short video clip (under 14 MB) ready.

| Station | What the judge does | What it proves | Weak spots it answers |
|---|---|---|---|
| **1. Be Amma** | Hold the phone on the roof stage, "Submitted". Tap **Check again**. Watch the second engineer reject. A QR opens the transaction on Stellar Expert | The money stays locked, and the record is public | 3, 7 (technical honesty), 10 |
| **2. Try to break it** | Pick one of three attacks on a card: approve as a stranger, pay before approval, change a payee. We run it live and show the contract's refusal in plain words | The rules are in the contract. Needs `scripts/attack.ts` (about an hour to write) | 8, technical trust |
| **3. Price your own build** | Type a build size. The screen shows fee, visits and transfer cost added up, in rupees and as a share of budget, next to the cost of one unchecked stage (₹3.75 lakh) | We show the honest all-in price | 2, 4 |
| **4. WhatsApp vs Homeward** | Hand over a printed 40-message family chat (a labelled composite from engineer scenarios 1 and 7). Ask "who approved the window change, and at what price?" Time it. Then show the Homeward timeline | The real competitor is a family chat, and what it fails at | 10 |
| **5. Risk wall** | A poster with the ten weak spots and sticker dots. "Which one would stop you backing us?" | We name our own risks. The dots are data, labelled as expert reactions, not demand | all |

**Three questions to put on a card for every judge** (their answers go in a notebook, with permission):
1. "If you were funding a ₹30 lakh build for your parents abroad, would 1.5% plus visits be fair?"
2. "What would make you trust the engineer?"
3. "Who do you know who should see this? A builder, an engineer, a payments partner?"

**Ask for something specific, by judge type.** Stellar engineer: "Which anchor would you start with for rupee payout?" Investor: "Would you back a ten-family pilot, and what would you need to see?" Startup judge: "Which of these ten would you test first?"

## 3. Stage pitch (18 Nov): updated script

About 235 live words and a 60-second silent video. Same spine as the earlier winner: Wayanad opener, video, what happened, why Stellar, business, close.

| Time | Beat | Say |
|---|---|---|
| 0:00 to 0:05 | Hook | "Hands up if you've ever sent money for a family project and wondered where it went." |
| 0:05 to 0:25 | Real case | "This August, a Kerala consumer commission ruled on a house a US-based owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking." |
| 0:25 to 0:30 | Bridge | "Homeward holds the next payment until the work is checked." |
| **0:30 to 1:30** | **Video** (silent, you stand beside it) | Two siblings fund. Supplier paid. Builder films the stage code. AI flags "code visible". Engineer approves, one payment, certificate. Amma taps check again, second engineer rejects, money stays. Last six seconds: the builder walks off, the family gets the money and deposit back |
| 1:30 to 1:46 | What happened | "A person caught the problem. The contract made sure the builder couldn't be paid around them. And if a builder walks off, the deposit goes to the family." |
| 1:46 to 2:06 | Why Stellar, and the limits | "The rule lives in a public Soroban contract on Testnet. One approval pays several people. The honest limits: the demo signs on our server, and our admin can settle a disputed claim. Both change before real money." |
| 2:06 to 2:36 | Business | "Our first customer is the sibling abroad. We spoke to fifteen engineers in Mumbai, Delhi, Kerala and Canada, and a father who built from Canada. Engineers told us it saves them hours of chasing approvals. None quoted a price, and we haven't tested the fee on families. A family pays 4% to 7% all in. Ours is 1.5% plus fixed visits." |
| 2:36 to 2:52 | Ask | "Which of these would stop you backing us: price, builders, or custody? Come tell us at the table." |
| 2:52 to 3:00 | Close | "Sending money home takes seconds. Homeward makes sure it builds what it paid for." |

If before the stage we have **real numbers** (engineer quotes, families, builders), replace "None quoted a price, and we haven't tested the fee" with them: "Five engineers quoted ₹X to ₹Y a visit. Four of six families said Z." Only real counts.

## 4. The ten weak spots: answer, evidence, what to do by 16 Nov

For each: the answer that is honest today, what we can show, the action that moves it before the showcase, and what not to say.

### 1. Validation is thin
- **Answer:** "Sixteen conversations: fifteen engineers and one family. Engineers say yes. Families paying is untested, and here is how we test it."
- **We have:** the roster by city, the father's quotes with permission, the 15 composite scenarios, three consumer-commission cases.
- **Do now:** run **three to five** family sessions with `validation-sessions.md`. Krish's father again, with the prototype, plus relatives and the Kerala and Punjabi associations in Kitchener-Waterloo. Report counts with the noes.
- **Don't say:** "20 people validated it", "families will pay".

### 2. The all-in price is understated
- **Answer:** "Families already pay 4.4% to 6.5% to move money through a bank, or 1% to 1.5% with a digital service. Adding Homeward and visits, the honest total is 7.5% to 12% by bank and 4% to 7% by digital. Our part is 1.5% plus fixed visits. One unchecked stage on a ₹15 lakh build is ₹3.75 lakh. The fee is ₹22,500."
- **Do now:** build station 3, and put the all-in table on the trifold.
- **Don't say:** "only 1.5%".

### 3. Pricing options and the engineer margin have no mechanism
- **Answer:** "The contract charges 1.5%. Visits and the minimum fee run through the payment partner in the pilot. A flat fee and a monthly plan are things we test, not things we sell. Moving visits on-chain needs a new contract version, and it isn't built." (Krish's plan already says this.)
- **Do now:** publish the visit schedule and the margin on one slide, so nobody can say we profit from extra visits in secret.
- **Don't say:** that the contract supports flat fees or care plans.

### 4. Break-even rests on assumptions
- **Answer:** "Fee-only on ₹15 lakh builds needs about 27% of the market, so we don't pitch that. A lean team on ₹25 to 40 lakh builds with a visit margin needs about 100 builds a year, about 1.4% of our base estimate and 5.8% of the low estimate. Every input is tagged as assumption, and the pilot replaces them."
- **Do now:** station 3 lets the judge move the build size and see the break-even number change.
- **Don't say:** "TAM" as a single figure.

### 5. Engineer quotes: zero
- **Answer:** "None of the fifteen quoted. Every visit price is a placeholder, labelled."
- **Do now (highest value, about two hours):** send one WhatsApp to each of the fifteen: *"What would you charge for (a) one site visit with a written report and (b) a 20-minute review of a stage video?"* Even five numbers replace the biggest guesses. Record who answered, and the price.
- **Don't say:** any visit price as fact.

### 6. Builders haven't been asked
- **Answer:** "No builder has told us yes. Engineers listed what builders need: materials advances agreed up front, inspection criteria fixed before work, a response time for families, a set process for disputes. The contract already supports them: terms are set per build, the deposit can be zero or earned from the first payment, retention is capped at 20%. The 5% and 10% in the demo are starting points." (Rivan's answer, with the contract facts added.)
- **Do now:** two or three builder calls with three questions: would you accept payment tied to an engineer's pass? would you post a deposit, and how much? what response time from the family is workable? Count the answers.
- **Don't say:** "builders will accept".

### 7. Custody and remittance rules unconfirmed
- **Answer:** "We don't hold money. The pilot is noncustodial: the family pays from their own NRE or NRO account after each approval, as RECONPRO already does. Holding money needs a licensed partner under RBI payment-aggregator rules. We haven't taken legal advice on cross-border rules yet." (Rivan's phased answer, with the honesty line.)
- **Do now:** write down what the 9 Nov advisor meetings (Circle, Superteam) said. Partner feedback is a rubric line, even if it was negative. Add one sentence if a partner conversation really happened.
- **Don't say:** any partner or compliance claim we can't point to.

### 8. Arbiter and operations costs
- **Answer:** "Today our admin settles a contested claim. That is a trusted step, and it is on the board. Before real money it moves to an independent arbiter named in each build. Better records should make disputes smaller, and we budget a reserve and support hours in the unit economics. We will measure both in the pilot."
- **Do now:** station 2 shows what the admin cannot do. Keep `docs/technical-limits.md` open at the table.
- **Don't say:** "disputes are handled", "no legal risk".

### 9. No acquisition channel
- **Answer:** "Through engineers, at the moment a family signs a builder's quote. All fifteen said Homeward saves them time, and each could bring their next overseas client. The ₹5,000 acquisition cost is a guess, and the pilot measures it."
- **Do now:** add one question to the fifteen WhatsApps: *"Would you introduce a client to this, and how many a year?"* Count the yeses.
- **Don't say:** "viral", "social media".

### 10. The real competitor is a relative and WhatsApp
- **Answer:** "Most families do it that way, and for a single owner with a simple build it works. Engineers described where it breaks: a mother approves a change she thinks is free, and the siblings get a surprise invoice; photos miss water pooling at the door; 'windows done' means different things; nobody can find who approved what. Homeward doesn't replace the relative. It gives them an independent engineer, one record and a say for the parent." (Rivan's framing plus the engineer scenarios.)
- **Do now:** build station 4 from scenarios 1 and 7, labelled as a composite.
- **Don't say:** "WhatsApp is dangerous".

## 5. Say and don't say

| Say | Don't say |
|---|---|
| "Sixteen conversations: fifteen engineers, one family." | "We spoke to twenty people." |
| "A composite of what several engineers described." | Present a scenario as one person's story. |
| "The contract checks the rules, not the concrete." | "The contract caught the fake footage." |
| "A trusted step today, an independent arbiter before real money." | "Nobody can move the money except by the rules." |
| "Testnet, demo signing on our server." | "Secure" or "decentralized". |
| "4% to 7% all in." | "Just 1.5%." |
| "An AI check helps the engineer see if the code is visible." | "AI verifies the work." |
| "We haven't taken legal advice yet." | Any compliance claim without a source. |

## 6. Forty-eight hours, by owner (suggested)

| Who | Do | Done when |
|---|---|---|
| Krish | Send the fifteen WhatsApps (price and introduction questions). Run two family sessions. Update Devpost with the new link and contract ID | At least five prices recorded, two sessions written up |
| Rivan | Two or three builder calls. Fold the answers into the Problem 6 to 10 file. Print the WhatsApp composite | Builder counts in the doc, print ready |
| Youdis | Build `attack.ts` for station 2 (with me), decide the Gemini key, and delete videos after 7 days or soften the help text | Script runs three refusals on Testnet |
| Ved | Freeze the app, rehearse the script five times with a stopwatch, set `ADMIN_KEY`, run `extend.sh` once, own the risk wall | Finishes at 2:55, demo state ready |
| Claude | Station 3 calculator, the risk wall poster text, the video shot list, a roll-up of everyone's numbers into the plan | Reviewed by Ved before printing |

## 7. The two open PRs

- **PR 37, Krish's business plan:** good. It adds the interviews, the noncustodial pilot, the all-in cost table and the risks. Fix before using publicly: add a source for the Kerala and Thrissur housing figures or drop them, and add the roster of who the 15 are.
- **PR 36, Rivan's answers to problems 6 to 10:** well written, but it says "funding would validate" in every answer. Judges will hear that five times. Reword as "the pilot validates" where the challenge gives no funding. It also needs the contract facts from section 4, items 6 and 8. Problems 1 to 5 aren't covered; section 4 above is a draft.
