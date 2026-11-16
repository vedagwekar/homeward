# Homeward: the pitch, in one document

Version 3, for the Project Showcase on Monday 16 Nov. This replaces every earlier pitch doc. Read sections 1 to 3 to understand it, rehearse from sections 4 to 6, and keep sections 7 to 9 for the day.

**The three minutes in one line:** the judges make the proof themselves, watch the money refuse to move, then one of them decides whether real Testnet money is paid.

---

## 1. Why this pitch works

Most teams will describe a product. You will make the judges use it. There are three moments, and each one carries part of the argument.

| Moment | What happens | What it proves |
|---|---|---|
| **1. They make the proof** (0:00) | Judges write today's stage code on paper and hold it up. Youdis films five seconds and uploads it. | The proof step is real, and old footage can't be reused, because the code is new for each stage. |
| **2. They watch the money refuse** (0:36) | The 60-second video: one stage is paid in a single transaction; on the roof, the parent taps Check again, a second engineer says no, and the money stays locked. | The rule is enforced by the contract, not by a promise. |
| **3. One of them decides** (1:36) | Their clip is on the engineer's screen with the AI check. The engineer passes it. One judge plays the parent: Yes, or Check again. Youdis taps their answer and a real transaction lands while you talk. | The parent's say is real, and a single approval pays several people at once, live. |

Everything else you say (the case, the price, the limits) hangs on those three moments. If the live part fails, section 7 gives you two safer versions with the same words.

**What a judge should remember afterwards**
1. "I held up the code, and my clip went on the record."
2. "The builder couldn't be paid around the second engineer."
3. "They told us what they haven't proven before we asked."

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

The engineer prices are in `docs/engineer-quotes.md` (names kept out of the public repo). If builder answers or family sessions arrive before Monday, add them to point 5 with the real counts. Confirm with Krish whether the eight who quoted are among the fifteen interviewed, so the count you say is exact.

---

## 3. The tech side: what you must land

Technology is the other 37.5%, and most of the panel is from the Stellar Development Foundation. They will check whether Stellar is doing real work and whether you know your limits.

| # | Point | Say or show | Backup |
|---|---|---|---|
| 1 | **It runs** | The live decision at 1:36. "This is live." | Contract ID and QR on the board; Stellar Expert link on screen after each action |
| 2 | **The rule is on-chain** | "The rule is a public contract: no engineer and no parent, no payment." | 50 contract tests; three recorded Testnet runs (29, 23 and 88 checks); `sh scripts/attack.sh all` at the table |
| 3 | **Why Stellar** | "One transaction just paid the builder and the workers." | Near-zero fees, a public record anyone can open, anchors as the route to rupee payout (not built) |
| 4 | **What is on-chain and what isn't** | Only if asked: the people, the stage amounts, approvals, payments and certificates are on-chain. The video stays off-chain; only its fingerprint (hash) goes on. | `docs/technical-limits.md` |
| 5 | **The honest limits** | "The demo signs on our server, and our admin can settle a disputed claim." | Board, centre: "Demo limits". Before real money: each person signs with their own wallet or passkey, and disputes go to an independent arbiter |
| 6 | **The contract doesn't judge concrete** | "An AI check helps the engineer see the code. A person decides." | Board: "The contract checks the rules; a person checks the concrete". For stages concrete will hide, the engineer visits the site; the video proves the footage is fresh |

**What our admin account can and can't do** (the most likely hard question): it creates builds, assigns engineers, opens stages, settles a disputed claim, and decides the refund split of a stopped build. It cannot approve a stage, pay itself, or change who gets paid.

**Never say:** "secure", "decentralized", "AI verifies the work", "nobody can move the money".

---

## 4. Run of show

### Before the clock (as judges arrive)
Krish puts paper and a marker in front of each judge and asks:

> "May we film you holding up a piece of paper for five seconds during the pitch? Hands and paper only. It goes to our demo and we delete it today."

Only people who say yes are filmed. The laptop faces the judges, showing the builder's page with **today's code** in large type.

### The three minutes

| Time | Ved says and does | Youdis does | Screen |
|---|---|---|---|
| 0:00 to 0:16 | **Hook.** Asks them to write the code and hold it up | Films 4 to 5 seconds on the tablet, ticks the consent box, taps **Send video** | Builder's page, code in big type |
| 0:16 to 0:36 | **The case.** Touches the Wayanad card | Switches the laptop to **Engineer** with the Demo role bar. Starts the video on "checked" | Engineer's page, then the video |
| 0:36 to 1:36 | **Silent.** Points at the five hands on the board as captions appear | Watches the tablet: upload done? Gives Ved a thumbs up or down by 1:30 | The 60-second video |
| 1:36 to 1:52 | **Circle back and decision.** "This is live." Asks one judge: Yes, or check again? | Brings the browser forward (the clip and AI check appear), ticks the boxes, clicks **Approve** | Engineer's page with their clip |
| 1:52 to 2:16 | **Stellar and limits**, then the result line | Switches to **Parent**, clicks the judge's answer. The transaction lands in about ten seconds | Parent's page, then "paid" or "nothing paid", with the Stellar Expert link |
| 2:16 to 2:43 | **Business.** Envelope and slip. Touches the right panel | Opens the Stellar Expert link in a new tab, ready for questions | The transaction on Stellar Expert |
| 2:43 to 2:56 | **Close.** Gestures to the table | Nothing | Same |

Krish hands the YES and CHECK AGAIN paddles to the judge at 1:36. Rivan stands at the table, ready for the stations.

---

## 5. The script

About 240 spoken words. *Italics are directions.* Speak at a normal pace; the timing has four seconds of slack.

**0:00. Hook** *(point at the code on the screen)*

> "This code was made minutes ago, for one stage of one house in Kerala. Please write it on your paper and hold it up. You are now a builder proving today's work."

**0:16. The case** *(touch the Wayanad card)*

> "Why does it matter? This August, a Kerala commission ruled on a house an overseas owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking. Homeward holds each payment until the work is checked."

**0:36. The video.** *Silent. Point at Family, Builder, Engineer, Parent, Second engineer on the board as each appears.*

**1:36. Circle back and decision** *(turn to the screen, then to one judge; Krish hands over the paddles)*

> "That was a recording. This is live. Here is your clip, with your code, and our engineer has passed it. You are Amma, the parent. Yes, or check again?"

*Wait for the answer. Repeat it aloud: "Yes." or "Check again."*

**1:52. Stellar and limits** *(touch the contract ID on the board)*

> "Your answer is now a transaction on Stellar Testnet. The rule is a public contract: no engineer and no parent, no payment. The limits are on our board: the demo signs on our server, and our admin can settle a disputed claim."

*Glance at the screen for the result, then say one of these:*

> **If Yes:** "And there: one transaction just paid the builder and the workers."
>
> **If Check again:** "And nothing moved. It can't, until a second engineer agrees."

**2:16. Business** *(hold up the envelope, then the slip; touch the right panel)*

> "The son or daughter abroad pays 1.5%, and that covers the engineer's video reviews: eight Kerala engineers quoted us ₹500 to ₹1,200 each. For stages concrete will hide, the engineer visits the site. One unchecked stage on a ₹15 lakh build is ₹3.75 lakh. We haven't tested the fee on families. Ten families are next."

**2:43. Close** *(gesture to the table)*

> "Come play any role at our table, and try to break the contract. Sending money home takes seconds. Homeward makes sure it builds what it paid for."

**If the result hasn't landed by 2:16:** go on to Business, and add "and there's the payment" when it appears.

**If you run long, cut in this order:** "Why does it matter?", then "The limits are on our board…" (the board still shows them), then "One unchecked stage on a ₹15 lakh build is ₹3.75 lakh" (hold up the envelope without the line). Never cut "For stages concrete will hide, the engineer visits the site" or "We haven't tested the fee on families."

---

## 6. The demo, tap by tap

### Devices
- **Laptop**, facing the judges: the app in one browser window, and the 60-second video open in a separate video player (not a browser tab), paused on its first frame.
- **Tablet or phone**, in Youdis's hands: the app, signed in as the builder, for filming and uploading only.
- A phone hotspot as backup for Wi-Fi.

### Set up the state (20 minutes before)
1. On the laptop open https://homeward-ecru.vercel.app/demo and press **Start over from step 1**. Wait for "Fresh builds ready" (about 95 seconds).
2. Choose **Amma's house extension**. Press **Go as…** three times and do each step: Anil locks the money, the builder puts in the deposit, the builder starts Foundation.
3. Stop on the **builder's page**. It shows "Today's code", for example HW-5501-9380. Zoom the browser so the code is readable from two metres.
4. On the tablet, open `/demo`, choose Amma's house, press **Go as** the builder. Check the file picker opens the camera.
5. Write the code on the card and slide it into the slot on the board.
6. Test the hotspot. Put both devices on do-not-disturb.

### Youdis's cue sheet
| When | Do | Expect |
|---|---|---|
| 0:08 | Film hands and paper for 4 to 5 seconds. Choose the clip, tick the consent box, tap **Send video** | "Uploading video and checking proof", then "Video sent" within about 25 seconds |
| 0:20 | On the laptop, Demo role bar: **Engineer** | "No checks waiting" for now. That is fine |
| 0:36 | Start the video on the word "checked" | Video plays for 60 seconds |
| 1:30 | Check the tablet says "Video sent". Thumbs up to Ved. If not, thumbs down (see section 7) | |
| 1:36 | Bring the browser forward. It refreshes itself. If the clip isn't there in two seconds, press Cmd+R | The clip and the "AI video review" panel appear |
| 1:38 | Tick the four boxes, click **Approve** | "Approved" in about ten seconds |
| 1:52 | Demo role bar: **Parent**. Click the judge's answer: **Yes, it's done** or **Check again** | "Foundation and plinth paid" or "Second check requested. Nothing paid", with a Stellar Expert link |
| 2:16 | Click **View on Stellar Expert** | The transaction opens in a new tab |

Don't touch the app during the video except to check the tablet.

### What I measured on the live site (15 Nov)
- **Start over:** about 95 seconds.
- **Each step** (lock money, deposit, start, approve, parent's answer): 6 to 13 seconds.
- **A five-second clip showing the code:** upload and AI check together took 15 seconds. The AI answered "Footage clear. Code visible. Work unclear", with the note that the code card is clearly shown but no construction work is visible. That is a good line to read out: the AI saw the code and still left the decision to a person.
- **A 33-second clip:** the upload took 23 seconds and the AI check did not finish ("AI review could not finish"). Keep the clip to five seconds.
- **Parent says yes:** paid in one transaction, with a certificate.

Not measured: a clip from a real phone camera. My test clip was a clean generated image of the code. Handwriting and a larger phone file may be slower or read as "code unclear". Rehearse with a real phone.

---

## 7. If something goes wrong

Decide at 1:30, from Youdis's thumbs up or down. All three versions use the same script up to 1:36.

| Version | When | What changes at 1:36 |
|---|---|---|
| **A. Full live** (the plan) | The clip uploaded | As scripted |
| **B. Sample clip** | The camera upload failed or is still running | Youdis taps **No clip handy? Send a sample** on the tablet, then carries on. You say: "The connection dropped your clip, so this is a sample one. The rest is live." The decision still happens |
| **C. No live** | The site or Wi-Fi is down | You say: "The venue's network has dropped, so I'll show you what you would have seen." Show the saved screenshot of the engineer's page from rehearsal, skip the decision, and go to "The rule is a public contract…" |

Other cases:
- **A judge won't be filmed:** don't film them. Never ask twice.
- **Nobody volunteers to decide:** Krish decides, as "the parent".
- **The AI says "code not visible":** "The AI is only a helper, and the engineer decides. That is the point."
- **The approval is slow:** keep talking. Youdis clicks the judge's answer when "Approved" shows.
- **Someone writes the wrong code:** "And an engineer would send that back, because the code doesn't match."

After the showcase, delete the judges' clips from the backend's uploads folder on Railway the same day. That is what we promise them.

---

## 8. The video, the board and the table

### The 60-second video
Silent with captions, recorded from the live app by following `/demo` with a screen recorder. It must show the real prototype. Trim waits so it runs exactly 60 seconds.

| Seconds | On screen | Caption |
|---|---|---|
| 0 to 6 | Anil locks money in dollars; Meera adds hers in dirhams | "Two siblings lock the money. A Stellar contract holds it." |
| 6 to 12 | Builder starts the stage; supplier paid | "The stage opens. The supplier is paid for materials." |
| 12 to 19 | Builder sends a video showing today's code | "The builder films today's code." |
| 19 to 28 | Engineer approves; the certificate appears | "An engineer checks. One payment pays builder and workers." |
| 28 to 36 | The roof stage: builder sends a clip; engineer approves | "The roof slab. The parent has the last word." |
| 36 to 43 | The parent's screen in Malayalam: she taps Check again | "Amma taps Check again." |
| 43 to 51 | Second engineer rejects | "The second engineer says no. The money stays locked." |
| 51 to 57 | Timeline, then a Stellar Expert transaction | "Every step is a public Stellar transaction." |
| 57 to 60 | End card | "homeward · live on Stellar Testnet" |

Upload it to YouTube (unlisted) or Loom and put the link on Devpost, with the live URL and the contract ID.

### The board
It is built like a house: roof, three walls, brick plinth. PDFs are in `docs/showcase/` (the full board at 38 × 27 in, and one per panel).

| You touch | When |
|---|---|
| The code-card slot, centre top | 0:00 |
| The Wayanad card, left | 0:16 |
| The five hands, centre | During the video |
| The contract ID and "Demo limits", centre bottom | 1:52 |
| The price table and "What we have learned", right | 2:16 |

Props: the code card, five LOCKED / PAID tags on Velcro, YES and CHECK AGAIN paddles, the ₹3.75 lakh envelope and ₹22,500 slip, and a small lockbox as "the contract". If time is short, make the code card and the paddles.

### The table, after the talk
| Station | What the judge does |
|---|---|
| Guided tour | Plays every role on a tablet at `/demo`. The QR on the board opens it |
| Try to break it | Picks one of four forbidden payments; `sh scripts/attack.sh all` shows the contract refusing each |
| Price your own build | `/price`: fee, visits and transfer cost added up, and the break-even |
| WhatsApp vs Homeward | Finds who approved a change in a printed 40-message family chat (a labelled composite), then in our timeline |

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
| What happens to our clip? | It stays in our demo, only its fingerprint is on Testnet, and we delete the clip today |
| Can you hold real money? | Not yet. The pilot is noncustodial, and a licensed partner comes before we hold anything |
| What breaks at scale? | One server signs transactions one at a time; history comes from our own log, not a chain indexer; stored data needs a keep-alive job. All are in `docs/technical-limits.md` |
| Is it tested? | 50 contract tests, 52 app tests, and a full live run on Testnet on 15 Nov: both the paid path and the refused path |

If you don't know: "We don't know yet. Here is how we'd find out."

---

## 10. Rehearsal and checklists

### Tonight
1. **Words only**, three times with a stopwatch. Target 2:56.
2. **Full run with the team**, twice, using a real phone for the clip and a friend as the judge. Time the upload and the two transactions.
3. **Failure run**, once: turn the Wi-Fi off at 1:20 and do Version C.
4. **Go or no-go for the live decision:** if the full run fails twice in a row, use Version B's opening (a sample clip) as your plan, or drop the decision and end the circle-back at "A person decides."

### Before judges arrive
- Start over, then set up the state (section 6). Code card in the slot.
- Video paused on its first frame. Volume off.
- Tablet signed in as the builder. Hotspot ready. Do-not-disturb on.
- Paper, markers, paddles, envelope, slip, tags.
- `attack.sh prepare` done. Railway set to one replica.
- Devpost has the video link, the live URL and the contract ID.

### Still to get, if you can
- From the eight engineers who quoted: would they pass a foundation or roof slab from video alone, and what would a site visit cost? Add who collected each quote, and when, to `docs/engineer-quotes.md`.
- Two builder answers and three family sessions.
- A native speaker's check of the Malayalam and Punjabi text.

### What is and isn't verified
- **Verified live on Testnet (15 Nov):** the full reject path, the full paid path with certificate, the deposit step, a five-second clip with the AI check, the parent's Yes paying in one transaction, dirham and dollar display, the live USDC rate.
- **Not verified:** a clip from a real phone camera through the consent box; the AI check on handwriting; this exact choreography on stage timing; the venue's Wi-Fi.
