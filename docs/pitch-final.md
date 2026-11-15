# Homeward: the final pitch, for Monday 16 Nov

Replaces the script in `pitch-update-showcase.md`. Same facts, now with the video inside the three minutes, the trifold as a prop, and a guided tour for judges. Pairs with `docs/showcase/` (the board) and `docs/risk-wall.html`.

## 1. What the showcase requires, and where we stand

| Requirement | Status | Owner |
|---|---|---|
| Trifold board (38 × 27 in) | **Designed.** `docs/showcase/homeward-trifold.pdf` (and one PDF per panel). Needs printing and mounting | Ved: print today |
| 3-minute talk by one person | **Script below.** Needs five stopwatch rehearsals | Ved |
| 1-minute demo video **inside** the 3 minutes, real prototype, not slides | **Not recorded yet.** Shot list in section 3 | Ved and Krish |
| Video hosted publicly (YouTube or Loom) and on Devpost | Not done | Krish |
| Live prototype on Testnet, contract ID and live URL on Devpost | Live: https://homeward-ecru.vercel.app. Contract `CC2NYVUTHJWBRTDG7J4O6VB7TINL5MTNOTTXOMVMHKSCUYZR4W3M6QF2`. Put both on Devpost | Krish |

## 2. The three minutes

One speaker, about 236 words, the video plays from 0:32 to 1:32. The speaker stands beside the board and the screen.

| Time | Say | Do |
|---|---|---|
| 0:00 to 0:07 | "Show of hands: who has sent money home and wondered where it went?" | Hand up yourself. Pause two seconds |
| 0:07 to 0:23 | "This August, a Kerala commission ruled on a house a US-based owner's brother was overseeing. Most of a ₹37 lakh contract had reportedly been paid. The house was unfinished and leaking." | Touch the Wayanad card, left panel |
| 0:23 to 0:32 | "Homeward holds the next payment until the work is checked. This is a real stage, live on Stellar Testnet." | Turn to the screen. Press play on the beat |
| **0:32 to 1:32** | **Video. You say nothing.** | Stand still, eyes on the screen. Point to the matching step on the board's centre panel as each caption appears |
| 1:32 to 1:50 | "The builder reused old footage. The parent tapped Check again. The second engineer said no, and the money stayed locked. A person caught the problem; the contract made sure nobody could pay around them." | Touch step 5, then step 6 (centre panel) |
| 1:50 to 2:09 | "The rule lives in a public Soroban contract. One approval pays builder and workers in one transaction. Honest limits: the demo signs on our server, and our admin can settle a disputed claim. Both change before real money." | Touch the contract ID and QR |
| 2:09 to 2:40 | "Our customer is the son or daughter abroad. We spoke to fifteen engineers and one family: engineers say it saves them hours, none quoted a price, and we haven't tested the fee on families. A family pays about four to seven percent all in. One unchecked stage on a ₹15 lakh build is ₹3.75 lakh. Our fee is ₹22,500." | Touch the right panel's price card, then "What we have learned" |
| 2:40 to 2:52 | "Which of our ten risks would stop you backing us? Put a dot on it, and try to break the contract at our table." | Gesture to the risk wall and the tablet |
| 2:52 to 3:00 | "Sending money home takes seconds. Homeward makes sure it builds what it paid for." | Stop. Do not add anything |

**If you run long, cut in this order:** the sentence "Both change before real money", then "One unchecked stage…₹3.75 lakh", then the show of hands. **Never cut** "none quoted a price, and we haven't tested the fee on families".

**Use real counts only.** If engineer quotes or family sessions come in before Monday, replace the validation sentence with them, for example "Five engineers quoted ₹X to ₹Y a visit."

## 3. The 60-second video (inside the talk)

Silent, with captions. Record the **live app** (https://homeward-ecru.vercel.app) following the guided tour at `/demo`, so a real Testnet transaction is on screen. A slide-only video does not count.

| Seconds | On screen | Caption |
|---|---|---|
| 0 to 6 | Anil locks money for the walls stage; Meera adds hers | "Two siblings lock the money. A Stellar contract holds it." |
| 6 to 12 | Builder starts the stage; supplier paid | "The stage opens. The supplier is paid for materials." |
| 12 to 19 | Builder sends a video showing today's code | "The builder films today's code." |
| 19 to 28 | Engineer ticks the checks and approves; the certificate appears | "An independent engineer checks. One payment pays builder and workers." |
| 28 to 36 | Next stage (roof): builder sends a clip; the engineer approves | "The roof slab. The parent can ask for a second check." |
| 36 to 43 | Amma's screen: she taps **Check again** | "Amma taps Check again." |
| 43 to 51 | Second engineer rejects ("no code in this footage") | "The second engineer says no. The money stays locked." |
| 51 to 57 | Timeline, then a Stellar Expert transaction | "Every step is a public Stellar transaction." |
| 57 to 60 | End card | "homeward · live on Stellar Testnet" |

**How to record it yourselves (about 30 minutes):**
1. Open the live site. Press **Start over** on `/demo` and wait about a minute.
2. Start the Mac's screen recording (Cmd+Shift+5, record selected portion) over a phone-width browser window.
3. Follow the guided tour: tap **Go as…** at each step. Use **Send a sample** for the video, or a short clip you filmed.
4. Waits of a few seconds are real. Trim them in iMovie so the whole video is 60 seconds, and add the captions above.
5. Upload to YouTube (unlisted is fine) or Loom, test the link in a private window, and put it on Devpost.

**Backup:** keep the finished video as a file on the laptop and phone. If the Wi-Fi or Railway fails, play the file and show the printed proof page.

## 4. Making it interactive with judges

**During the talk (cheap, no risk):** the show of hands at the start, and the closing question that sends them to the table.

**At the table (after the talk):**

| What | How | Setup |
|---|---|---|
| **Guided tour** | A tablet open at `/demo`. The judge taps **Go as…** and plays every role in seven taps, ending with the money staying locked. QR on the board | Press Start over 5 minutes before judges arrive |
| **Try to break it** | `sh scripts/attack.sh all` on the laptop. Judge picks an attack from a card | Run `sh scripts/attack.sh prepare` first (about a minute) |
| **Price your own build** | `/price` on a second screen | None |
| **WhatsApp vs Homeward** | Printed 40-message family chat (label it "composite"). Judge finds who approved the window change and the price | Print the chat. Rivan writes it from engineer scenarios 1 and 7 |
| **Risk wall** | `docs/risk-wall.html` printed A3, sticker dots | Buy dots. Print the wall |

**Three questions to ask every judge** (write answers in a notebook, with permission): is 1.5% plus visits fair on a ₹30 lakh build for your parents? What would make you trust the engineer? Who should see this, a builder, an engineer, a payments partner? Record their answers as expert reactions, never as customer demand.

## 5. What to go get before Monday

| Get | Why it matters | How, in about an hour |
|---|---|---|
| **Five engineer prices** | Replaces our biggest placeholder (visit cost) | WhatsApp each of the 15: *"What would you charge for one site visit with a written report, and for a 20-minute review of a stage video? And would you introduce clients to a tool like this?"* |
| **Two or three builder answers** | No builder has said yes or no | Call two builders: *Would you accept payment tied to an engineer's pass? Would you post a deposit, how much? What response time from the family is workable?* |
| **Three family sessions** | Our fee is untested on families | Krish's father with the prototype, plus two relatives or Kerala or Punjabi association members in Waterloo. Use `validation-sessions.md`. Report the noes |
| **Advisor notes** | Partner feedback is a rubric line | Write down what the 9 Nov advisor meetings said, including anything negative |
| **Props** | The table must work with no help | Tablet and phone charged, hotspot, printed risk wall, printed WhatsApp chat, sticker dots, laminated attack cards, printed QR of the live app, the video as a file on two devices |
| **The trifold** | It is a scoring surface | Print `homeward-trifold.pdf`. Ask the shop to fit it to 36 in if their roll is 36 in. Velocity events (velocity.events@uwaterloo.ca) can confirm the board if yours hasn't arrived |
| **Devpost** | Judges verify there | Video link, live URL, contract ID, repo link. Use the new URL and contract |
| **A 90-second Q&A card per teammate** | One person talks, all four answer | Each teammate memorises their section 7 answers |

## 6. The users, and what that means for the design

This is separate from the demo, but the demo follows it.

| User | Reality | What the product does |
|---|---|---|
| **Parent in Kerala** (often older, one phone, Malayalam first) | Prefers speaking to typing; reads instructions literally; wants predictability before any money action | Two big buttons, plain words, "Nothing is paid until you say yes". **New:** a *Listen* button reads the card aloud, and *Bigger text*. A basic-phone SMS path with 1 or 2 replies exists. **Not yet:** a native speaker has not checked the Malayalam and Punjabi, and the voice uses the phone's own voice |
| **Sibling abroad** (Canada, Gulf) | Time zones stall approvals; wants every rupee and approval in one place | Funding, timeline, locked-money view, certificates, in rupees or CAD |
| **Builder** | Wants clear stage criteria and prompt payment, hates open-ended waits | One screen: the code to film, the video, when the money comes. Terms set per build |
| **Engineer** | Wants one record instead of chasing WhatsApp, and to be paid the same either way | Look, tick, decide. Same fee pass or fail |
| **Judge, at the table** | Has about two minutes and no instructions | **New:** the guided tour at `/demo` tells them who to be next. In live mode a sample clip replaces a real video |

The research behind the parent screen is directional. Studies of low-literacy and older users in India point to graphics, local-language voice and simple guided paths ([Medhi and Thies, 2015](https://courses.cs.washington.edu/courses/cse490c/18au/readings/medhi-thies-2015.pdf); [multigenerational design in India](https://www.adgully.com/post/23623/designing-for-multigenerational-users-in-indias-evolving-digital-economy); [age-friendly design review](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12350549/)). The samples are small and mostly older. They support the direction. They are not evidence about Kerala parents, and our one family interview is the only local data we have. I found no survey on how NRI families approve builds over WhatsApp; the "WhatsApp breaks" scenarios come from our engineer interviews.

## 7. Questions, with 15-second answers

| Question | Answer |
|---|---|
| Who pays? | The sibling abroad. Parents, builders and engineers use it free |
| Why 1.5%? | A starting price. ₹22,500 on a ₹15 lakh build, against about ₹3.75 lakh for one unchecked stage. The pilot tests it |
| What's the all-in cost? | 4% to 7% with a digital transfer, 7.5% to 12% by bank. Our part is 1.5% plus fixed visits |
| Have you validated it? | Fifteen engineers and one family. Engineers back it. Families paying is untested, and here is the test |
| Why not WhatsApp and a relative? | Often fine for one owner and a simple build. It breaks with several siblings: one record, an independent check, the parent's say |
| Who holds the money? | Nobody real yet. The pilot is noncustodial; a licensed partner comes before we hold anything |
| What can your admin do? | Open stages, assign engineers, settle a disputed claim, and steer a stopped build's refund. It cannot approve a stage or pay itself. That is on the board |
| What if the engineer lies? | The contract checks rules, not concrete. A second engineer, the parent's veto and a public record limit it |
| Why Stellar? | A public rule anyone can check, one transaction paying several people at near-zero cost, anchors as the route to rupee payout |
| Will builders accept a deposit? | Untested. Terms are set per build: the deposit can be zero or earned from the first payment |
| What would you do with a win? | Ten Kerala families, real engineer quotes, a licensed partner conversation |
| What do you know least? | How many families fit, what they will pay, what builders accept. The pilot measures all three |

## 8. Day-of checklist

- 60 minutes before: press **Start over** on `/demo`, run `sh scripts/attack.sh prepare`, open every page once, set phone and tablet to do-not-disturb and full brightness.
- Stopwatch rehearsal at least five times. Target finishing at 2:55.
- If the live site fails: play the video file, show `docs/risk-wall.html` and the printed proof page, and say so plainly.
- If a judge asks something you can't answer: "We don't know yet. Here is how we'd find out."
- Never say: "twenty people", "validated", "secure", "decentralized", "AI verifies the work".
