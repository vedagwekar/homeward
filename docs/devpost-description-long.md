# Homeward: Build Trust Across Borders

Making cross-border home construction transparent, accountable, and accessible, one milestone at a time.

## Inspiration

Every year, millions of people working abroad send money home to support their families. In India alone, remittances reached approximately US$135 billion in 2024–25. For many families, that money goes toward something deeply personal: building or renovating a home for their parents.

But sending the money is often the easy part.

Imagine working in Canada while your parents are renovating their house in Kerala. You send money for materials, labour, and construction, but how do you know whether the work has actually been completed? How can you verify that the steel was inspected before concrete was poured? And how can your parents, who might not be comfortable with complicated financial applications, meaningfully participate in these decisions?

Traditional transfers move money, but they don't provide accountability for what happens afterward. Families are left relying on photographs, phone calls, and trust, while disputes or construction mistakes can become expensive or impossible to reverse.

We built Homeward to bridge that gap.

Our goal is simple: help families abroad support construction projects back home while giving everyone involved visibility, confidence, and control over how money is released.

## What it does

Homeward is a milestone-based construction funding and approval platform designed for families managing home construction across borders.

Instead of releasing an entire construction budget upfront, Homeward organizes funding around clearly defined construction milestones. Each stage has an associated payment amount, inspection status, and approval process.

The intended workflow is straightforward:

1. **Fund the project:** A family member abroad contributes toward a home construction budget, with payment amounts and platform fees displayed transparently.
2. **Track construction milestones:** The project is divided into stages such as materials, foundation, walls, roof slab, finishing, and handover.
3. **Verify completed work:** An independent engineer reviews critical construction work before the corresponding payment can be approved.
4. **Give parents a voice:** Parents can review the milestone and choose to approve it or request another inspection through a simple, accessible interface.
5. **Release milestone payments:** Once the required approvals are satisfied, the intended payment system releases funds to the appropriate construction participants and records the outcome.

One of our most important design decisions was making the parental approval experience accessible.

Rather than expecting older users to navigate complicated financial terminology, Homeward presents direct questions and clear choices. Large buttons, readable text, familiar language, and colour-coded milestone statuses make it easier to understand what is happening.

For example, a parent reviewing the roof slab can see that an engineer has completed an inspection, review the proposed payment of ₹3,75,000, and select either "OK" or "Check again."

The prototype also includes a construction timeline, funding overview, and role-based views for different participants.

Homeward is not simply about transferring money. It's about ensuring that families understand what they are paying for, why a payment is being requested, and who has verified the work.

## How we built it

We designed Homeward around two complementary components: an accessible web interface and a proposed milestone-based approval and payment system using Stellar.

### Frontend and user experience

We used Next.js, React, TypeScript, and CSS to build an interactive web prototype.

The frontend includes project information, construction timelines, payment milestones, and role-specific views for builders, engineers, and parents.

We also developed a standalone parental approval interface using Next.js and Tailwind CSS. This mobile-friendly screen uses mock project data to display construction stages, payment amounts in Indian rupees, and interactive approval or reinspection options.

We focused on making the experience approachable for users with varying levels of technical familiarity, particularly parents who may use smartphones infrequently.

### Smart contracts and payment architecture

Our proposed transaction architecture uses Soroban smart contracts on the Stellar network to manage milestone approvals and conditional payment releases.

The intended contract logic associates funds with construction milestones and requires the relevant approvals before releasing payment.

Stellar provides a foundation for creating transparent records of milestone decisions while supporting programmable financial workflows.

Because the intended recipients need usable local currency, our design separates on-network approval and settlement from the final conversion and distribution of funds in Indian rupees.

### Prototyping and collaboration

We used mock data to develop and test the user experience independently of backend availability.

This allowed us to iterate on how construction stages, approval decisions, and payment information should appear before connecting the interface to live contract data.

Our team collaborated through GitHub, using separate branches for frontend development and feature integration, and deployed the web prototype using Vercel.

At the current prototype stage, rupee payouts, Interac funding, and SMS interactions are simulated rather than production financial integrations.

## Challenges we ran into

### 1. Bridging financial technology and real-world construction

Construction projects don't progress through simple online transactions. Work must be inspected, materials must be verified, and mistakes can become irreversible once certain stages are completed.

We needed an approval process that reflects these real-world dependencies rather than automatically releasing payments according to a schedule.

### 2. Making the interface genuinely accessible

A technically sophisticated application is not useful if the people it is intended to protect cannot comfortably operate it.

We had to balance financial accountability with simplicity, particularly for older parents who may be unfamiliar with digital financial applications.

This led us to prioritize large touch targets, straightforward language, clear payment amounts, and simple approval choices instead of technical terminology.

### 3. Connecting international funding to local construction payments

Our intended users may contribute from abroad, while builders, engineers, and suppliers expect payments in Indian rupees.

A major design challenge is connecting programmable milestone approvals with conventional local payment infrastructure.

Rather than assuming every participant would directly interact with digital assets, we designed the system around a future payout partner handling currency conversion and local distribution.

### 4. Coordinating frontend and backend development

Developing a usable interface while the underlying payment and contract architecture was still evolving required careful separation of concerns.

Using mock project data allowed us to build and validate the frontend independently, then prepare for integration with a shared data structure and backend.

## Accomplishments that we're proud of

We're particularly proud of translating a complex cross-border financial problem into a simple, human-centred user experience.

We developed an interactive prototype that demonstrates how families can track construction progress, understand upcoming milestones, and participate in payment decisions.

Our parental approval screen demonstrates an important principle: users shouldn't need to understand the technology behind a financial system to benefit from its protections.

We're also proud of the milestone-based structure, which ties financial decisions to verifiable construction progress instead of relying solely on trust after money is transferred.

Finally, Homeward brings together ideas from software engineering, financial technology, construction verification, and accessible design to address a problem that directly affects families separated by distance.

## What we learned

Building Homeward reinforced that financial transparency is as much a user-experience problem as it is a technical problem.

A system can record transactions accurately but still leave families confused about whether work has been done properly. Meaningful accountability requires clear information, independent verification, and understandable decisions.

We also gained practical experience with Next.js, React, TypeScript, frontend prototyping, Git collaboration, and structuring an application around data that will eventually come from backend services.

Most importantly, we learned to design from the perspective of the people who will actually use the product, not just those building it.

## What's next for Homeward

Our next steps focus on turning the prototype into a more complete, practically deployable system.

- **Backend integration:** Connect the frontend to the live milestone and approval state managed by the smart contract.
- **Real-world payment partners:** Explore compliant international funding, currency conversion, and Indian rupee disbursement.
- **Engineer verification:** Establish a reliable process for engineer onboarding, inspection evidence, and approval authentication.
- **Accessible communication:** Expand multilingual support, particularly Malayalam and Punjabi, and explore SMS-based interactions for users with basic phones.
- **User validation:** Gather feedback from families, engineers, and financial professionals to refine the approval process and ensure it matches real construction workflows.
- **Further testing:** Evaluate failure cases, disputed inspections, delayed construction, and situations where family members disagree about releasing payments.

Our longer-term vision is for Homeward to become a trusted bridge between families working abroad and the homes they are building back home.

Because sending money home should also mean knowing that it's making a difference.

## Built with

Next.js, React, TypeScript, JavaScript, CSS, Tailwind CSS, Node.js, Stellar, Soroban, Rust, GitHub, and Vercel.

## Try it out

- Live prototype: <https://homeward-tan.vercel.app/>
- Construction timeline: <https://homeward-tan.vercel.app/timeline>
- GitHub: <https://github.com/vedagwekar/homeward>
