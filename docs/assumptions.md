# Homeward — Assumptions to Test First

**Document type:** Hypothesis and validation plan  
**Last updated:** November 7, 2026  
**Owner:** Homeward team  
**Status:** Pre-validation — no interview results are claimed in this document

## Purpose

Homeward is exploring a milestone-based way for people living abroad to fund and oversee home construction or renovation in India. The proposed workflow combines visible construction stages, independent engineer checks, parent/family approval, and conditional payment releases. The current demo uses mock data; rupee payouts, Interac funding, and SMS are simulated. **A working UI is not evidence of customer demand or payment feasibility.**

This file records the assumptions that could make or break the idea, how we intend to test them, and what early evidence would justify investigating further. **All pass criteria below are proposed screening thresholds, not verified findings, statistical proof, or launch approval.** Results and anonymized quotations belong in [`evidence.md`](./evidence.md).

## Assumptions we'd test first

| Priority | What we believe (hypothesis) | How we'll test it | Proposed early pass criterion | Current status |
| --- | --- | --- | --- | --- |
| **P0 — Problem** | People funding construction in India from abroad struggle to independently verify progress, quality, or the use of advances. | Interview at least **5** diaspora families or people with relevant firsthand experience; ask for specific past incidents and current workarounds. | At least **3 of 5** describe a material verification, quality, delay, or payment-control problem from firsthand experience. | **Untested** |
| **P0 — Customer** | The person sending money abroad is a plausible buyer or decision-maker for Homeward. | Ask who controlled the budget, chose contractors, approved payments, and would buy a monitoring service. | At least **3 of 5** relevant respondents can identify a clear payer and decision-maker; document any split between funder and buyer. | **Untested** |
| **P0 — Solution** | Families would prefer engineer-verified milestone releases over sending a large advance without independent checks. | Describe both workflows without leading language; ask respondents to compare them and explain objections. | At least **3 of 5** relevant respondents prefer milestone-based controls and can explain a concrete benefit. | **Untested** |
| **P0 — Pricing** | A proposed **1.5% fee per stage** is acceptable to some target customers. | Ask willingness to pay; clarify the fee basis using a realistic project and total fee example; compare with current verification costs. | At least **3 of 5** relevant respondents say they would seriously consider paying **after** hearing the total cost. Note that stated interest is not a purchase. | **Untested** |
| **P0 — Trust** | A genuinely independent engineer's inspection would increase confidence enough to affect payment decisions. | Interview families and at least **2** construction professionals; ask what evidence, credentials, and independence are necessary. | At least **3 of 5** families value independent verification, and both professionals identify a credible inspection process. | **Untested** |
| **P1 — Feasibility** | Engineers can perform milestone inspections at practical cost and speed, with useful documentation. | Ask engineers about availability, travel, inspection scope, liability, photo/report evidence, and compensation. | At least **2** professionals describe a workable inspection workflow and realistic cost/time ranges; unresolved liability is documented. | **Untested** |
| **P1 — Adoption** | Builders and suppliers would accept payment being conditional on inspections and family approvals. | Speak with **2** builders/contractors or knowledgeable industry professionals; probe cash-flow needs and objections. | At least **1 of 2** sees a viable path with reasonable timing and advance/material allowances; record objections explicitly. | **Untested** |
| **P1 — Parent usability** | Parents can understand a simple approve / check-again decision without financial or technical jargon. | Observe **5** representative users attempting key tasks on `/parents` without coaching. Ask what each button means and what happens next. | At least **4 of 5** correctly explain the payment decision and complete the task without critical confusion. | **Untested** |
| **P1 — Language and access** | Malayalam/Punjabi wording and potentially SMS improve access for some families. | Have fluent speakers review every translated string; test readability and understanding with relevant users, including those less familiar with apps. | Fluent review finds **no critical mistranslations**, and users correctly interpret the core approval and reinspection actions. | **Untested** |
| **P0 — Payments and compliance** | Conditional funding can eventually be connected to compliant cross-border funding and INR disbursement without requiring builders to use digital assets. | Research regulated payment partners, Indian disbursement rules, currency conversion, KYC/AML, escrow/custody requirements, and Stellar integration; interview a qualified payments professional. | A credible, documented partner/regulatory path is identified with no known fundamental blocker; **not** considered validated by interviews alone. | **Unverified — specialist review needed** |
| **P1 — Disputes and exceptions** | The system can handle failed inspections, conflicting approvals, delays, and refunds without unfairly trapping funds. | Walk through failure scenarios with families, engineers, and builders; draft decision rules and escalation paths. | Stakeholders understand the proposed process, and each critical scenario has a documented owner, action, and unresolved-risk list. | **Untested** |

## Immediate validation plan

### 1. Family interviews — target by Monday, November 9, 2026

Collect **at least 5 distinct responses**, prioritizing people with direct experience of funding or managing a house build/renovation in India from abroad. Send this short survey in family networks and ask teammates to share it with their networks:

1. Have you or someone you know built or renovated a house in India while living abroad?
2. Who held and managed the money back home?
3. How did you check construction progress?
4. Did anything go wrong — delays, extra advances, quality issues, or arguments?
5. If a service held the funds and paid the builder only after an independent engineer checked each stage, would you consider paying **1.5% per stage**? Why or why not?

**Follow-ups that matter:** Ask about the most recent real project, the financial consequences of problems, who would make the buying decision, what the total fee would be, and what alternatives they currently use. Do not present hypothetical willingness to pay as confirmed demand.

### 2. Professional interviews

- **Real-estate / construction professional:** Use [`interview-guide.md`](./interview-guide.md) to investigate common payment arrangements, delays, inspection practices, and disputes.
- **Two engineers:** Ask about inspection independence, timing, scope, cost, evidence, and liability.
- **One lending/payments professional:** Explore feasibility, regulatory constraints, funding custody, and local INR payouts; do **not** assume a payment partner has agreed to participate.

### 3. Prototype comprehension checks

Once Krish's shared interface and text object are ready, observe users on `/parents` (and review `/builder`). Test the meaning of **OK**, **Check again**, stage status, payment amount, and whether approval alone releases funds. Review Malayalam and Punjabi copy with fluent speakers. Clearly flag machine translations until reviewed.

## How to record results

Keep interview details in [`evidence.md`](./evidence.md), **not** as unverified claims here. For each interview, record only non-identifying information:

| Field | What to record |
| --- | --- |
| Respondent | Anonymous label, e.g. `Relative A — Toronto` or `Engineer B — Ontario` |
| Context | Firsthand/secondhand experience; relevant role |
| Date and method | Interview date; phone, WhatsApp, or in person |
| Answers | Brief factual notes and anonymized quotations with permission |
| Relevant assumption IDs | Identify applicable rows above by topic |
| Outcome | Supports / contradicts / inconclusive, with a reason |

Track **N = number of distinct respondents**, and report smaller relevant denominators separately (e.g. `3/4 respondents with firsthand experience`). A single respondent's five answers count as **one** respondent, not five. Record negative responses as carefully as positive ones. Do not publish names, phone numbers, precise addresses, screenshots of private conversations, or identifying details in the public repository.

## Decision rules and limitations

- **Verified:** Use only for facts backed by direct sources or completed tests and cite the evidence. Meeting an early screening threshold means *promising signal*, not proof of product-market fit.
- **Pending:** No sufficient evidence gathered yet. This is the default for the assumptions above.
- **Contradicted:** Evidence suggests the assumption may be false; document the conflicting observations and redesign or retest.
- **Technical demo ≠ commercial validation:** Mock approvals, simulated payments, and a working Next.js screen show a possible experience, not live escrow, bank transfers, legal compliance, or customer adoption.
- **Sampling limitation:** Five convenience-sample interviews can reveal problems and sharpen hypotheses but cannot establish population-level demand. Seek contrasting experiences and professional review after the hackathon.

## Next steps and owners

| When | Action | Owner |
| --- | --- | --- |
| **Sat Nov 7** | Send five-question survey through family networks and ask teammates to forward it | Research / outreach |
| **Sat–Mon Nov 7–9** | Schedule and conduct a real-estate interview; start engineer and payments outreach | Research / outreach |
| **By Mon Nov 9 night** | Log **N ≥ 5** distinct responses, identify patterns and contradictions, and update [`evidence.md`](./evidence.md) | Research / outreach |
| **After shared UI is available** | Test parent comprehension; coordinate Malayalam/Punjabi reviews and SMS wording | Frontend / localization |
| **Before final presentation** | Revisit this table: change status only where evidence exists, and call out remaining gaps | Entire team |

---

*Public-repository reminder: Keep interviewees anonymous and do not include private contact information. This document is a plan for testing assumptions, not a list of claims already proven.*
