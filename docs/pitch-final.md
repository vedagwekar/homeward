# Homeward: the pitch, in one document

Version 5, for one presenter (Ved alone), for the Project Showcase on Monday 16 Nov. This replaces every earlier pitch doc. Read sections 1 to 3 to understand it, rehearse from sections 4 to 6, and keep sections 7 to 9 for the day.

**The format.** The organisers allow two ways: speak over the video, or speak for two minutes and then play it. **You speak for two minutes, then play the 60-second video.** It is the easier one to learn in a day: nothing has to be timed against a moving picture, and the live part with the judges gets your full attention. The video then shows the whole build and carries the tech in its captions.

**The three minutes in one line:** a judge holds up today's code, a judge decides whether real Testnet money is paid, and the video shows the whole build. You present alone: one phone, one laptop, the board.

---

## 1. Why this pitch works

Most teams will describe a product. You will make the judges use it. There are three moments, and each one carries part of the argument.

| Moment | What happens | What it proves |
|---|---|---|
| **1. They hold the proof** (0:00) | A judge writes today's stage code on paper and holds it up. Nothing is filmed. | The proof step is concrete, and old footage can't be reused, because the code is new for each stage. |
| **2. One of them decides** (0:46) | You hand a judge your phone, already on the parent's screen. They tap Yes or Check again. A real transaction lands while you talk. | The parent's say is real, and the contract acts on it, not you. |
| **3. They watch the whole build** (2:00) | The 60-second video: money locked, a stage paid in one transaction, and on the roof a second engineer says no and the money stays locked. | The rule is enforced by the contract, including when the answer is no. |

Everything else you say (the case, the price, the limits) hangs on those moments. If the live part fails, section 7 gives you two safer versions with the same words.

**What a judge should remember afterwards**
1. "I held up the code a builder has to film."
2. "I pressed the parent's button and real money moved."
3. "They told us what they haven't proven before we asked."

### How each beat scores on the rubric
The judges mark three things. Every beat is there to earn one of them, so if you have to cut, you know what you are giving up.

| Rubric | Weight | Where you earn it | The line that earns it |
|---|---|---|---|
| **Business impact and relevance** | 37.5% | 0:15 The case, 1:25 Business, and the right panel of the board | "Most of a ₹37 lakh contract had reportedly been paid." · "The son or daughter abroad pays 1.5%." · "We haven't tested the fee on families." |
| **Technology and implementation** | 37.5% | 0:33 How a stage gets paid, 0:46 the judge's decision, 1:00 Stellar and limits, and the video | "Your answer is now a transaction on Stellar Testnet." · "No engineer and no parent, no payment." · "The demo signs on our server." |
| **Presentation and deliverables** | 25% | The code hook, the phone in a judge's hand, the board you touch in order, finishing by 1:58 | "You are Amma, the parent. Yes, or check again?" |

One thread ties it together: **the house in the middle of the board.** You open on the code a builder films there, the judge decides whether one layer of it gets paid, the price is the cost of checking it, and the video builds it layer by layer.

---

## 2. The business side: what you must land

Business impact is 37.5% of the score. You have about 30 seconds of speech for it, so the board and the Q&A carry the rest. These are the six points, the sentence for each, and where the backup is.

| # | Point | Say | Backup |
|---|---|---|---|
| 1 | **The problem is real** | "Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking." | Board, left: Wayanad and Telangana cases, both sourced |
| 2 | **Who pays** | "The son or daughter abroad pays." | Board, left: "Who it is for". Parents, builders and engineers use it free |
| 3 | **The price, honestly** | "The son or daughter abroad pays 1.5%, and that covers the engineer's video reviews." | Board, right: the ₹15 lakh table. `/price` at the table. All in is about 3% to 4% by digital transfer and 6% to 9% by bank, including site visits for the stages concrete will hide. Site visit prices are our estimate |
| 4 | **Why it's worth it** | "One unchecked stage on a ₹15 lakh build is ₹3.75 lakh." (fee: ₹22,500) | The envelope and the slip, held up |
| 5 | **Validation, exactly** | "Eight Kerala engineers quoted us ₹500 to ₹1,200 each. … We haven't tested the fee on families." | `docs/engineer-quotes.md`. Board, right: "What we have learned", with the father's quote. Fifteen engineer interviews and one family interview sit behind it |
| 6 | **What's next** | "Ten families are next." | Families pay from their own bank; we hold no money; a licensed partner comes before we do |

**Numbers to know cold, for questions**
- Kerala received ₹2,16,893 crore in remittances in 2023; renovating houses and shops is the largest listed use at 15.8% (Kerala Migration Survey 2023).
- Break-even: about 200 builds a year on ₹30 lakh builds with a small team, roughly 3% of our base estimate of Kerala builds. On ₹15 lakh builds the fee barely covers its costs (about ₹500 left per build), so we start with bigger builds. The review prices are quotes; every other input is our assumption.
- Competitors: RECONPRO and NRI Land Check (engineers, no control over payment), Brick & Bolt (a managed builder), DiasporaBuild (African diaspora).
- How we reach families: through engineers, at the moment a family signs a builder's quote. The ₹5,000 cost to win a customer is a guess.

**Never say:** "twenty people", "validated", "families will pay", "only 1.5%".

The engineer prices are in `docs/engineer-quotes.md` (names kept out of the public repo). If builder answers or family sessions arrive before Monday, add them to point 5 with the real counts.

---

## 3. The tech side: what you must land

Technology is the other 37.5%, and most of the panel is from the Stellar Development Foundation. They will check whether Stellar is doing real work and whether you know your limits.

| # | Point | Say or show | Backup |
|---|---|---|---|
| 1 | **It runs** | The live decision at 0:46: a judge taps the parent's button and a real transaction lands | Contract ID and QR on the board; Stellar Expert link on screen after each action |
| 2 | **The rule is on-chain** | "The rule is a public contract: no engineer and no parent, no payment." | 50 contract tests; three recorded Testnet runs (29, 23 and 88 checks); `sh scripts/attack.sh all` at the table |
| 3 | **Why Stellar** | "One transaction just paid the builder and the workers." | Near-zero fees, a public record anyone can open, anchors as the route to rupee payout (not built) |
| 4 | **What is on-chain and what isn't** | Only if asked: the people, the stage amounts, approvals, payments and certificates are on-chain. The video stays off-chain; only its fingerprint (hash) goes on. | `docs/technical-limits.md` |
| 5 | **The honest limits** | "The demo signs on our server, and our admin can settle a disputed claim." | Board, centre: "Demo limits". Before real money: each person signs with their own wallet or passkey, and disputes go to an independent arbiter |
| 6 | **The contract doesn't judge concrete** | "An AI check helps the engineer see the code. A person decides." | Board: "The contract checks the rules; a person checks the concrete". For stages concrete will hide, the engineer visits the site; the video proves the footage is fresh |

**What our admin account can and can't do** (the most likely hard question): it creates builds, assigns engineers, opens stages, settles a disputed claim, and decides the refund split of a stopped build. It cannot approve a stage, pay itself, or change who gets paid.

**Never say:** "secure", "decentralized", "AI verifies the work", "nobody can move the money".

---

## 4. Run of show

You present alone. Your hands only ever do three things: touch the board, hand over the phone, press play.

### Before the clock (as judges arrive)
Put a sheet of paper and a marker in front of one judge, and the YES and CHECK AGAIN paddles beside them. Your phone is in your pocket, unlocked, on the parent's screen (section 6). The laptop faces the judges with the video paused on its first frame. Today's code is written in the "Today's code" box on the board.

### The three minutes

| Time | You say | You do | Board piece |
|---|---|---|---|
| 0:00 to 0:15 | **Hook.** Ask a judge to write the code and hold it up | Point at ① | ① Today's code |
| 0:15 to 0:33 | **The case** | Touch ② | ② The Wayanad case |
| 0:33 to 0:46 | **How a stage gets paid** | Touch the five steps, then the house | ③ How each stage gets paid |
| 0:46 to 1:00 | **Decision.** "You are Amma. Yes, or check again?" | Hand the judge your phone. They tap | ④ Amma's screen |
| 1:00 to 1:25 | **Stellar and limits**, then the result line | Take the phone back, read the result aloud, show it | ⑤ Live on Stellar Testnet |
| 1:25 to 1:50 | **Business** | Hold up the envelope, then the slip; touch ⑥ | ⑥ What Anil and Meera pay |
| 1:50 to 2:00 | **Close and handoff** | Gesture to ⑦, press play on "sixty seconds" | ⑦ Try to break it |
| 2:00 to 3:00 | **Nothing** | Stand at the board and touch the piece the video is on | The house, layer by layer |

---

## 5. The script

About 245 spoken words in two minutes. *Italics are directions.* The video must start by 2:00, so finish speaking by 1:58.

**0:00. Hook** *(point at the code on the screen, then at piece ① on the board)*

> "This code was made minutes ago, for one stage of one house in Kerala. Please write it on your paper and hold it up. You are now a builder proving today's work."

**0:15. The case** *(touch ②)*

> "This August, a Kerala commission ruled on a house an overseas owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking. Homeward holds each payment until the work is checked."

**0:33. How a stage gets paid** *(touch each step on ③)*

> "The family locks the money. The builder films today's code, the one you are holding. An engineer with no stake checks it. Then the parent has the last word."

**0:46. Decision** *(take out your phone, already on the parent's screen, and hand it to the judge with the paper)*

> "A builder has sent a video with that code, and our engineer has passed it. This is the parent's phone. You are Amma. Yes, or check again?"

*Wait for the answer. Repeat it aloud: "Yes." or "Check again." The judge taps it on the phone. Take the phone back.*

**1:00. Stellar and limits** *(touch ⑤)*

> "Your answer is now a transaction on Stellar Testnet. The rule is a public contract: no engineer and no parent, no payment. The limits are on our board: the demo signs on our server, and our admin can settle a disputed claim."

*Glance at the phone for the result, then say one of these and turn the screen to the judges:*

> **If Yes:** "And there: one transaction just paid the builder and the workers."
>
> **If Check again:** "And nothing moved. It can't, until a second engineer agrees."

**1:25. Business** *(hold up the envelope, then the slip; touch ⑥)*

> "The son or daughter abroad pays 1.5%, and that covers the engineer's video reviews: eight Kerala engineers quoted us ₹500 to ₹1,200 each. For stages concrete will hide, the engineer visits the site. One unchecked stage on a ₹15 lakh build is ₹3.75 lakh. We haven't tested the fee on families."

**1:50. Close and handoff** *(gesture to ⑦ and the table, then to the screen)*

> "Sending money home takes seconds. Homeward makes sure it builds what it paid for. Here is a whole build, in sixty seconds."

**2:00. The video.** *It is silent, with subtitles. Say nothing. Stand at the board and touch the layer of the house the video is on (table in section 8). Its last subtitle is "Play any role yourself."*

**If the phone isn't on the parent's screen at 0:46** (it locked, or the page reloaded): do the Business beat first while you reopen it, then come back to the Decision and Stellar beats.

**If the result hasn't landed by 1:25:** go on to Business, and add "and there's the payment" when it appears.

**If you run long, cut in this order:** "The limits are on our board…" (the board still shows them), then "One unchecked stage on a ₹15 lakh build is ₹3.75 lakh" (hold up the envelope without the line), then "Most of a ₹37 lakh contract had reportedly been paid." Never cut "For stages concrete will hide, the engineer visits the site" or "We haven't tested the fee on families."

---

## 6. The demo, tap by tap

### Devices
- **Your phone:** the app, parked on the parent's screen, waiting for Yes or Check again. This is the only live device.
- **Laptop**, facing the judges: the 60-second video open full screen in a video player, paused on its first frame. Space bar plays it.
- A second phone as a hotspot, if you have one. Otherwise turn mobile data on.

### Set up the state (20 minutes before, on your phone)
1. Open https://homeward-ecru.vercel.app/demo and press **Start over from step 1**. Wait for "Fresh builds ready" (about 95 seconds).
2. Choose **Amma's house extension**. Press **Go as…** and do each step in turn: Anil locks the money, the builder puts in the deposit, the builder starts Foundation, the builder taps **No clip handy? Send a sample**, the engineer ticks the boxes and taps **Approve**.
3. Press **Go as Amma**. Stop here. The screen shows **Yes, it's done** and **Check again**. Do not tap either.
4. Before step 2's sample clip, note today's code from the builder's page and write it in the "Today's code" box on the board.
5. Set the phone's auto-lock to **Never**, turn on do-not-disturb, and turn the brightness up.
6. Start the video once on the laptop to check it plays, then pause it at 0:00.

Each step takes 6 to 13 seconds, so the set-up takes about three minutes after the reset.

### Your cue sheet
| When | Do | Expect |
|---|---|---|
| 0:00 | Point at the code on the board. The judge writes it and holds it up | Nothing on a screen |
| 0:46 | Hand the judge the phone | They tap **Yes, it's done** or **Check again** |
| about 1:05 | Take the phone back, glance, say the result line, turn the screen to them | "Foundation and plinth paid" or "Second check requested. Nothing paid", with a Stellar Expert link, within about ten seconds |
| 1:50 | Phone face down on the table. Press space on the laptop on "sixty seconds" | Video plays to 3:00 |

### What I measured on the live site
- **Start over:** about 95 seconds. **Each step:** 6 to 13 seconds.
- **Parent says yes:** paid in one transaction, with a certificate. **Check again:** "Second check requested. Nothing paid".
- With the sample clip, the engineer's screen says "AI review could not finish". The judges never see that screen in this version.

Not measured: the venue's Wi-Fi, and how long your phone's browser keeps the page alive in your pocket. Check the screen once, 30 seconds before you start.

---

## 7. If something goes wrong

All three versions use the same script.

| Version | When | What changes |
|---|---|---|
| **A. Full live** (the plan) | The phone is on the parent's screen and the network is up | As scripted |
| **B. Slow result** | The judge has tapped but no result by 1:25 | Go on to Business with the phone in your hand. When it lands, say "and there's the payment" or "and nothing moved" |
| **C. No live** | The site or network is down | Say: "The venue's network has dropped, so the video will show you this exact moment." The judge still answers aloud with the paddle. Skip the result line. Everything else stays |

Other cases:
- **Nobody wants to hold the paper or the phone:** hold up the paper yourself, then tap the phone yourself and say which you chose and why.
- **The phone has locked or reloaded:** do Business first, reopen `/demo`, press **Go as Amma**, then come back.
- **The judge taps the wrong thing or hesitates:** "Either answer is fine. That is the point: it is her call."
- **Someone writes the wrong code:** "And an engineer would send that back, because the code doesn't match."
- **You are past 1:58:** stop mid-sentence and press play. The video is required, and it must fit in the three minutes.

After the pitch, press **Start over from step 1** again before the next group of judges, and redo the set-up.

---

## 8. The video, the board and the table

### The 60-second video
**Made: `docs/showcase/video/homeward-demo-60s.mp4`.** It is a screen recording of the live app on Stellar Testnet with the waits cut out, built-in subtitles and no sound. It is written to stand alone, because on Devpost it is the first thing people see. `docs/showcase/video/README.md` lists the 12 real transactions in it.

**Format on the day: speak for two minutes, then play it.** Do not talk over it. The subtitles carry the story, so it works in a loud hall with no speaker.

| Seconds | On screen | Subtitle | Touch on the board |
|---|---|---|---|
| 0 to 4 | ₹342,690,000,000 sent home to Kerala in 2023 | "Families abroad send billions home to Kerala to build and renovate houses." | The bigger picture, left panel |
| 4 to 9 | 13,500 km; the Wayanad case, ₹3,452,000 | "They can't check the work. Money goes out before anyone independent has looked." | ② The Wayanad case |
| 9 to 12 | Title card | "Homeward locks the money by stage, and releases it only after the checks." | The title |
| 12 to 16 | Live app: Anil locks ₹3,00,000 | "Anil locks the money for the first stage. It sits in a smart contract, not with the builder." | Layer 1, the plinth |
| 16 to 20 | Builder's deposit, then the stage starts | "The builder puts in his own deposit and starts the stage. The supplier is paid for materials at once." | Layer 1 |
| 20 to 24 | Today's code; the clip is sent | "The builder films the work showing today's code. Only the video's fingerprint goes on-chain." | ① Today's code |
| 24 to 29 | The engineer ticks and approves | "An independent engineer ticks what they saw and approves. Same fee for yes or no." | The engineer's screen beside the house |
| 29 to 34 | Amma taps Yes; "Foundation and plinth paid" | "Amma says yes. One transaction pays the builder and the workers." | The PAID tag on Foundation |
| 34 to 36 | Walls: a new code | "The next stage runs the same way, with a new code." | Layer 2, the wall |
| 36 to 43 | Engineer approves; Amma taps Check again | "The engineer approves the walls, but Amma isn't sure. She taps Check again, and nothing is paid." | ④ Amma's screen |
| 43 to 47 | Second engineer rejects | "A second engineer says no. The contract won't pay. The money stays locked." | Layer 2 |
| 47 to 56 | How it's built: Next.js app, Node and Express API, Soroban contract in Rust, Stellar Testnet; 50 tests; demo limits | "A Rust smart contract on Stellar holds the money and enforces the rules. The app and server only ask it to act." | ⑤ Live on Stellar Testnet |
| 56 to 60 | End card with the site, contract ID and repo | "Every step you saw is a public transaction. Play any role yourself." | ⑦ Try to break it |

In this recording the money stays locked on the **walls**, not the roof slab, because that is the second stage of a real run. If a judge notices that the board's tags say the walls are PAID and the roof slab LOCKED, say the board shows a later point in the same build.

During the video you say nothing. Stand at the board, not at the screen, and put a hand on the piece the video is on.

Upload it to YouTube (unlisted) or Loom and put the link on Devpost, with the live URL and the contract ID.

### The board
A clean white board with gold double rules and a lot of empty space. The gold-on-cream is the border of a Kerala kasavu cloth. The real photos of a Kerala house carry the \"house\" idea, so the rest of the paper can stay plain.

**Files, in `docs/showcase/`:**
- **`homeward-board.jpg` and `homeward-board.pdf`:** the whole board at 38 × 27 in. The dashed lines are the folds.
- **`pieces/`:** the 16 blocks as separate images. `pieces/cutouts/` has the seven house photo cutouts and `pieces/app/` has the app snippets, all on see-through backgrounds. Drop each onto a slide, set the width from the table, print at 100% and paste it on. Side-panel blocks are 8.1 in wide and fit letter paper. The centre blocks are 17.6 in wide: print them on tabloid paper in two halves, or at a print shop.
- **`board.html`:** the source.

**What is on it, and why it is less than before.** Each panel answers one question, top to bottom.

| Panel | Blocks | Question it answers |
|---|---|---|
| Left: the problem | 13,500 km route · ② the Wayanad case and the Telangana refund · the father's quote · ₹342,690,000,000 sent home | Why does this need to exist? |
| Centre: how it works | Title · ① today's code · ③ five steps · the house in the middle, taken apart into its five stages, with ④ the app screens on its left, the stage prices on its right and where the money goes under it · ⑤ live on Stellar Testnet | What does it do, and is it real? |
| Right: the business | ⑥ what Anil and Meera pay · eight engineers' quotes · 200 builds to break even · why not escrow · what isn't real yet · ⑦ try to break it | Does it pay, and what's unproven? |

Cut from the earlier boards: the builder's deposit box, the "money doesn't stop at the house" chain, the per-stage bars, the "Fool our AI check" box and the second set of QR codes. They are still in the app and in the Q&A (section 9).

**A real Kerala house, taken apart.** The centre shows five photo cutouts stacked like a house, one per stage. They are real photos from Wikimedia Commons, cropped into the shape of each layer.

| Stage | Cutout in `pieces/cutouts/` | What the photo is |
|---|---|---|
| 5 · Handover | `cut-5-brass-door-lock` | A manichitrathazhu, the brass lock on a traditional Kerala door (Kerala Folklore Museum, Kochi) |
| 4 · Finishing | `cut-4-carved-gable` and `cut-4-clay-tile-roof` | A carved wooden gable in Kerala, and Mangalore clay tiles |
| 3 · Roof slab | `cut-3-slab-steel` | Slab steel tied and ready for a pour. This one is not from India; it is the clearest free photo of the steel an engineer checks |
| 2 · Walls | `cut-2-laterite-wall` | A laterite wall in Kottayam, with a doorway cut out |
| 1 · Foundation | `cut-1-laterite-plinth` | Laterite cut in a Kerala quarry, the stone under most Kerala houses |
| Left panel | `cut-whole-house` | A family's nalukettu house in Kerala, whole |

**App snippets, in `pieces/app/`.** These are from the working app, for the sides of the house or anywhere else you want one.

| File | Size on the board (in) | What it shows |
|---|---|---|
| `app-amma-decides` | 3.6 × 4.8 | The parent's Yes / Check again screen, in a phone frame with its caption |
| `app-engineer-checks` | 3.6 × 4.8 | The engineer's proof and checklist |
| `app-anil-sees-every-rupee` | 3.6 × 2.4 | The locked money and the paid / in progress / locked bar |
| `full-screen-amma`, `full-screen-engineer`, `full-screen-anil` | any | The three full screenshots, uncropped, if you want them larger |

How to use them on the trifold:
1. Print the block `08-centre-house` as the base. It is the middle of the board: 17.6 × 12.8 in, so print it in four letter pages or at a print shop.
2. Print the cutouts again on card or photo paper, at 100% or up to 150%, and cut them out along the photo edge. They have see-through backgrounds, so they drop straight onto a slide.
3. Stick each one over its printed twin with foam tape, the plinth flat and each layer above it one tape thicker. The house then stands off the board in steps, and the layers read as separate.
4. If a judge asks what something is, the credit line under the stack and `trifold-assets/photos/CREDITS.md` say where each photo came from. Say "a Kerala house", not "Amma's house": the photos are of real buildings, and Amma is our demo family.

Optional, if you have time: tape a real brass key beside the lock cutout and hold up a short piece of rebar at "for stages concrete will hide, the engineer visits the site".

**The blocks.**

| File in `pieces/` | Size (in) |
|---|---|
| `01-left-route` | 8.1 × 6.3 |
| `02-left-wayanad-case` ② | 8.1 × 6.0 |
| `02b-left-real-house` | 8.1 × 4.7 |
| `03-left-quote` | 8.1 × 2.3 |
| `04-left-money-sent-home` | 8.1 × 4.3 |
| `05-centre-title` | 17.6 × 3.6 |
| `06-centre-todays-code` ① | 4.6 × 2.8 |
| `07-centre-how-a-stage-gets-paid` ③ | 12.4 × 2.8 |
| `08-centre-house` ④ | 17.6 × 12.8 |
| `10-centre-stellar` ⑤ | 17.6 × 2.7 |
| `11-right-what-they-pay` ⑥ | 8.1 × 5.8 |
| `12-right-engineer-quotes` | 8.1 × 1.9 |
| `13-right-break-even` | 8.1 × 5.4 |
| `14-right-why-not-escrow` | 8.1 × 4.1 |
| `15-right-not-real-yet` | 8.1 × 1.4 |
| `16-right-try-to-break-it` ⑦ | 8.1 × 2.4 |

**Where your hand goes during the talk:**

| Circle | Block | You touch it at |
|---|---|---|
| ① | Today's code (centre, top left). Write the code in the box before the pitch | 0:00 |
| ② | The Wayanad case, ₹3,452,000 (left) | 0:15 |
| ③ | How each stage gets paid (centre) | 0:33 |
| ④ | Amma decides: the app screen to the left of the house | 0:46 |
| ⑤ | Live on Stellar Testnet (centre, bottom) | 1:00 |
| ⑥ | What Anil and Meera pay (right, top). Point at the slab steel on "the engineer visits the site" | 1:25 |
| ⑦ | Try to break it (right, bottom) | 1:50 |

Numbers to keep straight: break-even is **200 builds a year**, because the fee pays for the engineers' reviews. The 23.2% compares money sent home with Kerala's net state income (NSDP); the board says "equals", not "is".

Props: five LOCKED / PAID tags on Velcro, YES and CHECK AGAIN paddles, the ₹3.75 lakh envelope and ₹22,500 slip.

### The table, after the talk
| Station | What the judge does |
|---|---|
| Guided tour | Plays every role on your phone or their own at `/demo`. The QR on the board opens it |
| Try to break it | Picks one of four forbidden payments; `sh scripts/attack.sh all` shows the contract refusing each |
| Price your own build | `/price`: fee, visits and transfer cost added up, and the break-even |
| Fool the AI check | Plays the builder with an old clip or no code, and sees what the AI check says. A person still decides |

Run `sh scripts/attack.sh prepare` before judges arrive. It uses the same Testnet accounts as the live demo, so **never run it during the pitch**.

---

## 9. Questions and answers

### Business
| Question | Answer |
|---|---|
| Who pays? | The sibling abroad. Parents, builders and engineers use it free |
| Why 1.5%? | It covers the engineer's video reviews, which eight Kerala engineers quoted at ₹500 to ₹1,200 each, and our running costs. ₹22,500 on a ₹15 lakh build, against about ₹3.75 lakh for one unchecked stage |
| What does a family really pay? | About 3% to 4% all in with a digital transfer, 6% to 9% by bank. Ours is 1.5%, which covers the video reviews, plus a site visit for the stages concrete will hide |
| Have you validated it? | Fifteen engineer interviews, one family, and price quotes from eight Kerala engineers. Engineers would gain clients, so that isn't proof families will pay. That is what the pilot tests |
| Can an engineer really check from a video? | Not everything. Video reviews are for work that stays visible. For the foundation and the roof slab, where concrete hides the steel, the engineer visits the site. Two of the eight asked for close-ups or a tape measure in shot |
| Where do the engineers come from? | Independent licensed engineers on a list we keep. We assign one, and the parent can demand a second. Eight have quoted; the network itself isn't built yet |
| How big is it? | ₹2,16,893 crore reached Kerala in 2023, and house renovation is the largest listed use. We estimate 1,700 to 20,600 builds a year we could serve, and the pilot replaces that guess |
| What share do you need? | About 200 builds a year with a small team on ₹30 lakh builds, roughly 3% of our Kerala estimate. On ₹15 lakh builds the fee barely covers its costs |
| Why not WhatsApp and a relative? | For one owner and a simple build, that's often fine. It breaks with several siblings: nobody can find who approved what |
| How do you reach families? | Through engineers, when a family signs a builder's quote. Our acquisition cost is a guess |
| Will builders accept a deposit? | We haven't asked builders yet. Terms are set per build, and the deposit can be zero |
| What would you do with a win? | Ten Kerala families, real engineer quotes, a first conversation with a licensed payment partner |

### Technology
| Question | Answer |
|---|---|
| Why Stellar, not a database? | The family can read the rule and every payment themselves. One transaction pays several people for a fraction of a cent. Anchors are the route to rupee payout |
| What's on-chain? | People, stage amounts, approvals, payments, certificates, and fingerprints of the videos and reports. No video, ID or bank detail |
| Who holds the keys? | In this demo our server does, for every role, and the board says so. A real launch needs each person's own wallet or passkey |
| What can your admin do? | Open stages, assign engineers, settle a disputed claim and split the refund of a stopped build. It can't approve a stage, pay itself or change a payee |
| What if the engineer lies? | The contract can't tell. It limits who can sign, the parent can demand a second engineer, and every approval is public |
| Is the AI deciding? | No. It tells the engineer whether the footage is clear and the code is visible. A person decides |
| Can you hold real money? | Not yet. The pilot is noncustodial, and a licensed partner comes before we hold anything |
| What breaks at scale? | One server signs transactions one at a time; history comes from our own log, not a chain indexer; stored data needs a keep-alive job. All are in `docs/technical-limits.md` |
| Is it tested? | 50 contract tests, 52 app tests, and a full live run on Testnet on 15 Nov: both the paid path and the refused path |

If you don't know: "We don't know yet. Here is how we'd find out."

---

## 10. Rehearsal and checklists

### Tonight
1. **Words only**, three times with a stopwatch. Target 1:56 for the speech.
2. **Full run alone**, twice, with the real phone, the laptop and a friend as the judge. Time from handing over the phone to the result showing.
3. **Failure run**, once: turn the Wi-Fi off at 0:30 and do Version C.
4. **Go or no-go for the live decision:** if the result takes longer than 25 seconds in both full runs, make Version B your plan (carry on to Business with the phone in your hand).

### Before judges arrive
- Start over, then set up the state (section 6). Code written in the box.
- Video paused on its first frame. Volume off.
- Phone parked on the parent's screen, auto-lock off, do-not-disturb on. Mobile data or a hotspot ready.
- Paper, markers, paddles, envelope, slip, tags.
- `attack.sh prepare` done. Railway set to one replica.
- Devpost has the video link, the live URL and the contract ID.

### Still to get, if you can
- From the eight engineers who quoted: would they pass a foundation or roof slab from video alone, and what would a site visit cost? Add who collected each quote, and when, to `docs/engineer-quotes.md`.
- Two builder answers and three family sessions.
- A native speaker's check of the Malayalam and Punjabi text.

### What is and isn't verified
- **Verified live on Testnet (15 Nov):** the full reject path, the full paid path with certificate, the deposit step, a five-second clip with the AI check, the parent's Yes paying in one transaction, dirham and dollar display, the live USDC rate.
- **Not verified:** the solo run-through under real timing; the phone staying on the parent's screen in your pocket; the venue's Wi-Fi.
