# Homeward: the pitch

One presenter, three minutes: you talk for two, then the 60-second video plays. Everything you need to rehearse is on this page. The long version (board build guide, video shot list, every question) is in `pitch-reference.md`.

**The whole pitch in one breath:** a judge holds up today's code, you tell them why it matters, a judge decides whether real money is paid, you say what it costs, the video shows the rest.

---

## 1. The speech

About 270 words. Aim to finish at 1:55. *Italics are what your hands do.* The circled numbers are the pieces on the board.

**0:00 · The code** *(point at ① on the board; a judge has paper and a marker)*

> "HW, 5501, 9380. Could you write that down and hold it up for me?
> Thank you. You've just done what a builder in Kerala has to do before he gets paid: show today's code, in today's video. Yesterday's footage doesn't have it."

*Read out whatever code is on the board that day.*

**0:15 · Why it matters** *(touch ②)*

> "Here is why that matters. Anil lives in Toronto. He is paying for his mother's house, thirteen thousand kilometres away.
> This August, a Kerala consumer commission ruled on a house just like it. Nearly thirty-five lakh rupees paid. The house was unfinished, and leaking. The money went out before anyone independent had looked."

**0:35 · How it works** *(touch ③, then the house)*

> "Homeward flips the order. The family locks the money, stage by stage. The builder films the work with that code. An engineer with no stake checks it. And the parent, standing in the house, has the last word."

**0:50 · You decide** *(hand the judge your phone; touch ④)*

> "So you are the parent now. This is Amma's phone. The engineer has passed the foundation. Yes, or check again?"

*Wait. Repeat their answer out loud. Take the phone back.*

**1:05 · What just happened** *(touch ⑤)*

> "What you just tapped is a real transaction on Stellar. Not a database we control. A public contract with one rule: no engineer and no parent, no payment."

*Look at the phone, then say one of these and show them the screen:*

> **If they said yes:** "And there: one transaction just paid the builder and his workers."
> **If they said check again:** "And nothing moved. It can't, until a second engineer agrees."

> "This is a testnet demo. Our server signs for each role, and the bank side is simulated. That is on the board."

**1:30 · What it costs** *(touch ⑥)*

> "What does this cost Anil? One and a half percent. On a fifteen lakh build that is twenty-two thousand five hundred rupees, and it pays the engineer. Eight Kerala engineers quoted us five hundred to twelve hundred rupees a review.
> One unchecked stage costs three lakh seventy-five thousand.
> What we haven't done yet is charge a real family. Ten families are next."

**1:52 · Close** *(gesture to ⑦, press play)*

> "Sending money home takes seconds. Homeward makes sure it becomes a house. Here is a whole build, in sixty seconds."

**2:00 to 3:00 · The video.** Say nothing. Stand at the board and touch the layer of the house the video is on.

**If you are running late,** cut in this order: the testnet line (the board says it), then "One unchecked stage costs…", then "Eight Kerala engineers quoted us…". Never cut "What we haven't done yet is charge a real family." At 1:58, stop wherever you are and press play.

---

## 2. Know these by heart

If you learn nothing else, learn this section. A judge can ask about any of it.

### The six numbers
| Number | What it is |
|---|---|
| **13,500 km** | Toronto to Thrissur |
| **₹3,452,000** (about 35 lakh) | Paid for the Wayanad house left unfinished and leaking. The commission awarded ₹40,000. Aug 2026, Indian Express |
| **1.5%** → **₹22,500** | Our fee on a ₹15 lakh build. It pays for the engineer's six video reviews |
| **₹500 to ₹1,200** | What eight Kerala engineers quoted us for one video review |
| **₹375,000** | One stage of that build, paid with no check |
| **200 builds a year** | Break-even, on ₹30 lakh builds. About 3% of the 6,850 Kerala builds a year we estimate fit us |

### The five sentences that carry the pitch
1. "The builder isn't paid until an engineer checks the work and the parent says yes."
2. "No engineer and no parent, no payment."
3. "A public contract, not a database we control."
4. "What we haven't done yet is charge a real family."
5. "Sending money home takes seconds. Homeward makes sure it becomes a house."

### How it is built (say it in this order)
- **The contract:** written in Rust for Soroban, running on Stellar Testnet. It holds the money, checks every rule and pays everyone for a stage in one transaction. 50 tests.
- **The server:** Node and Express. It signs for each demo role and keeps a record of events.
- **The app:** Next.js. Five role screens. No keys in the browser.
- **On-chain:** the money, the approvals, the payouts, a fingerprint of each video. **Off-chain:** the video itself.
- **Why Stellar:** cheap, fast payments in a dollar stablecoin, and a contract the family can read. A normal app could only record a decision. This one enforces it.

### What is not real yet (say it before they ask)
- Our server signs for every role. In a real product each person signs for themselves.
- Bank transfers in, rupee payouts and text messages are simulated.
- Our admin account can settle a disputed claim.
- The AI video check only helps. A person decides.
- No family has paid the fee. No builder has been asked about the deposit.

### What we have actually done
- Interviewed **16 people**: 15 engineers and one family.
- Collected **8 price quotes** from Kerala engineers.
- Run the whole story on Testnet: paid path and locked path. The video is that recording.

### Never say
"Validated", "secure", "decentralized", "fraud-proof", "the AI verifies the work", or "twenty people".

---

## 3. Six questions you will get

| Question | Answer |
|---|---|
| **Is a video enough to check concrete?** | "For most stages, yes. For the ones concrete will hide, the foundation steel and the roof steel, the engineer goes to the site before the pour. That visit is priced separately. Our estimate is ₹2,000 to ₹3,000 plus travel." |
| **Why not a bank escrow?** | "Escrow holds money. It doesn't check a wall. A Telangana escrow paid out without proper checks and a refund of ₹829,000 was ordered. We tie the payment to the check." |
| **Why blockchain at all?** | "Because the family shouldn't have to trust us either. The rule is public, and there is no function that sends their money to Homeward." |
| **Who are the engineers?** | "Independent licensed engineers we assign. Anyone who pays, builds or supplies on a build can't be its engineer; the contract refuses it. The parent can demand a second one." |
| **Will builders accept this?** | "We don't know yet. We haven't asked builders. What they get is materials paid up front and one payment the moment the checks pass." |
| **Can you hold real money?** | "Not today. The pilot holds none, and a licensed partner comes before we do." |

If you don't know: "We don't know yet. Here is how we'd find out."

---

## 4. Set-up (five minutes, before each group of judges)

On your phone:
1. Open **homeward-ecru.vercel.app/demo**. Press **Start over from step 1**. Wait about 95 seconds.
2. Choose **Amma's house extension**. Press **Go as…** and do each step: lock the money, deposit, start Foundation.
3. On the builder's page, **write today's code in the box on the board.** Then tap **No clip handy? Send a sample**.
4. **Go as** the engineer: tick the boxes, **Approve**.
5. **Go as Amma.** Stop. Do not tap Yes or Check again. Set auto-lock to Never, do-not-disturb on.

On the laptop: the video full screen, paused at 0:00. On the table: paper, a marker, the phone.

---

## 5. If something breaks

| What | Do |
|---|---|
| The phone locked or reloaded | Do "What it costs" first. Reopen `/demo`, **Go as Amma**, then come back to "You decide" |
| The result is slow | Keep going with the phone in your hand. When it lands: "and there's the payment" or "and nothing moved" |
| No network | "The network has dropped, so the video will show you this exact moment." The judge still answers out loud |
| Nobody will take the paper or the phone | Do it yourself and say which you chose and why |

---

## 6. Why each part is there

| What the judges mark | Weight | The parts of the speech that earn it |
|---|---|---|
| Business impact and relevance | 37.5% | Why it matters · What it costs · "we haven't charged a real family" |
| Technology and implementation | 37.5% | How it works · You decide · What just happened · the video |
| Presentation and deliverables | 25% | The code · the phone in a judge's hand · touching the board in order · finishing on time |

---

## 7. Rehearse tonight
1. The speech out loud, three times, with a stopwatch. Target 1:55.
2. Twice with the phone, the laptop and a friend as the judge.
3. Once with the Wi-Fi off, using section 5.
4. Cover section 2 and say the six numbers from memory.
