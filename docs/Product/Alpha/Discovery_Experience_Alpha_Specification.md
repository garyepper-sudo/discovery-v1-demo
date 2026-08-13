# Discovery Experience Alpha Specification

**Status:** Foundational Alpha specification — historical where superseded
**Version:** 0.1
**Program:** Discovery Experience Alpha
**Primary implementation phase:** Mocked interactive experience
**Implementation:** Implemented selectively through deterministic fixtures
**Production integration:** Explicitly deferred

This document preserves the foundational Alpha design. The later canonical
Alpha experience specification governs the Alpha journey, and the committed
prototype records implemented behavior where either document differs. All
Alpha documentation remains subordinate to the Product Canon, Discovery
Platform Principles, Shared Organizational Intelligence, the Organization
Experience Canon, and applicable architecture canon.

The current prototype uses deterministic fixtures and local interaction state.
It does not read or write Organization Runtime, invoke production cognition or
AI interpretation, or durably persist questions, responses, following, or
organizational learning.

The implemented route sequence is `/alpha/ask`, `/alpha/orient`, `/alpha/plan`,
`/alpha/learn`, `/alpha/understand`, `/alpha/respond`, `/alpha/follow`,
`/alpha/return`, and `/alpha/home`, with `/alpha` redirecting to `/alpha/ask`.
The separate Examine and Challenge-or-Confirm scenes below preserve the
historical design lineage: Examine is not a standalone implemented route, and
Challenge or Confirm became the implemented Respond experience.

---

# 1. Purpose

Discovery Experience Alpha is the first complete expression of the Discovery Design Language in a functioning product experience.

Its purpose is to answer one product question:

> Can Discovery turn a consequential organizational question into a Living Understanding that a user trusts, follows, and wants to revisit?

Experience Alpha is not intended to demonstrate the full platform.

It is intended to prove the core Discovery experience:

```text
Question

↓

Orientation

↓

Learning Plan

↓

Understanding Growth

↓

Meaningful Insight

↓

Calibrated Trust

↓

Continued Learning
```

The experience should make Discovery feel less like software being operated and more like an intelligence becoming progressively better at understanding an organization.

---

# 2. Product Hypothesis

A user will return to Discovery when they believe:

1. Discovery understands an important organizational issue.
2. Discovery is clear about what it knows and does not know.
3. Discovery can explain why its understanding changed.
4. Discovery will continue learning without requiring constant prompting.
5. Each return visit is likely to reveal something meaningful.

The Alpha experience must make those beliefs plausible.

---

# 3. Primary Success Moment

The primary success moment occurs when the user chooses:

> **Follow this understanding**

That action indicates that the user believes the Understanding is:

* relevant;
* credible;
* alive;
* worth revisiting;
* capable of becoming more valuable over time.

The experience is not successful merely because the user receives an answer.

It is successful when the user wants Discovery to keep learning.

---

# 4. Primary User

The initial experience is designed for an executive or senior organizational leader.

The prototype should use the following representative user:

**Role:** VP of Engineering
**Organizational concern:** Engineering delivery has slowed despite teams appearing busy.
**Question:** Why has engineering productivity slowed?

The experience must remain conceptually industry-agnostic and role-agnostic.

The example provides enough specificity to make the prototype believable without redefining Discovery around engineering.

---

# 5. Primary Understanding

The first Living Understanding is:

> **Engineering Productivity**

The Understanding should evolve from a broad question into a structured model containing:

* current synthesis;
* confidence;
* supporting evidence;
* meaningful unknowns;
* contradictions;
* connected understandings;
* historical change;
* recommended learning;
* follow status.

“Engineering Productivity” is a user-facing orientation.

It is not a new cognitive or Runtime object.

The experience may use mocked projections that represent information already compatible with Discovery’s existing architecture.

---

# 6. Experience Boundaries

## Included

Experience Alpha includes:

* question-first entry;
* creation of an Understanding;
* initial orientation;
* proposed learning plan;
* source recommendations;
* expected information gain;
* simulated learning progress;
* first synthesized understanding;
* one primary insight;
* evidence and rationale;
* explicit uncertainty;
* challenge and correction paths;
* following an Understanding;
* a returning-user homepage;
* meaningful before-and-after change.

## Excluded

Experience Alpha does not include:

* production authentication;
* live connectors;
* broad document ingestion;
* production retrieval orchestration;
* production governance enforcement;
* multi-organization administration;
* billing;
* account settings;
* full navigation architecture;
* actual background processing;
* new cognitive capabilities;
* changes to Runtime;
* changes to Governance;
* changes to the Universal Intelligence Lifecycle;
* autonomous production actions.

All data may initially be deterministic and mocked.

The experience must not pretend that mocked behavior is live production behavior.

---

# 7. Experience Principles

Every screen must follow the canonical Discovery Design Language.

## 7.1 Begin with a consequential question

The first experience should not begin with:

* a dashboard;
* a setup wizard;
* an integration list;
* a file uploader;
* a template gallery;
* an empty workspace.

It begins with:

> **What would you like Discovery to understand?**

Supporting copy should clarify that Discovery will help determine what information is necessary.

## 7.2 Understanding is the user-facing orientation

The product should organize the experience around the Understanding being developed.

The user should not need to understand:

* the cognitive architecture;
* Runtime;
* retrieval workers;
* embeddings;
* pipelines;
* governance internals;
* provider boundaries.

## 7.3 Unknowns must be specific

Discovery should never communicate only:

> More information is needed.

It should communicate:

* what remains uncertain;
* why it matters;
* what information could reduce that uncertainty;
* how much improvement is expected.

## 7.4 Learning must be meaningful

Learning should not be represented by decorative activity.

Each visible change must correspond to a meaningful change in the Understanding, such as:

* confidence increased;
* an uncertainty narrowed;
* a relationship emerged;
* a contradiction appeared;
* a belief weakened;
* a new explanation became more plausible.

## 7.5 Reading is expensive

Every screen has one primary message.

Supporting detail remains available through progressive disclosure.

No screen should present a dense report by default.

## 7.6 Trust must be calibrated

Discovery must communicate:

* what it currently believes;
* why it believes it;
* how confident it is;
* what remains uncertain;
* what could change its mind.

## 7.7 Challenge is normal

Users must be able to:

* question an interpretation;
* challenge supporting evidence;
* identify missing context;
* correct Discovery;
* request further investigation.

Challenge should strengthen the Understanding rather than appear as a product failure.

---

# 8. Canonical User Journey

The Alpha journey contains nine scenes.

```text
1. Ask

2. Orient

3. Plan

4. Learn

5. Understand

6. Examine

7. Challenge or Confirm

8. Follow

9. Return
```

Each scene has one emotional and functional responsibility.

---

# 9. Scene One — Ask

## User objective

Express the organizational issue they want to understand.

## Discovery objective

Transform the user’s concern into a bounded understanding objective.

## Primary screen content

**Headline**

> What would you like Discovery to understand?

**Supporting copy**

> Start with a question, concern, or part of the organization you want to understand more clearly.

**Primary input**

Large natural-language input with the cursor active.

**Example prompts**

* Why has engineering delivery slowed?
* What is making cross-functional work difficult?
* Why are customers leaving during onboarding?
* How healthy is our decision-making process?

Example prompts should assist, not dominate.

## Primary action

> Begin understanding

## Prototype input

> Why has engineering productivity slowed?

## Interaction behavior

After submission:

* the original question remains visible;
* Discovery acknowledges the objective;
* the interface transitions rather than navigating abruptly;
* Discovery begins orientation before requesting information.

## Do not show

* connectors;
* upload actions;
* technical setup;
* navigation menus;
* account configuration;
* confidence percentages before Discovery has established context.

## Success condition

The user believes that Discovery is beginning with their problem rather than requiring them to understand the software.

---

# 10. Scene Two — Orient

## User objective

Understand how Discovery interpreted the question.

## Discovery objective

Establish a bounded objective and show its current orientation.

## Primary message

> Here is how I understand what you are trying to learn.

## Understanding objective

> Understand what is constraining engineering’s ability to turn planned work into reliable delivery.

## Scope

**Included**

* planning-to-delivery flow;
* decision ownership;
* prioritization stability;
* cross-functional dependencies;
* recurring delivery friction.

**Not yet included**

* individual employee performance;
* compensation;
* code quality assessment;
* hiring requirements.

## Current orientation

Discovery should communicate that its initial understanding is limited.

Example:

**Current understanding**

Early orientation

**Confidence**

Low

**Most important unknown**

Where planned work loses momentum after commitment

## User actions

Primary:

> Continue

Secondary:

> Refine the question

## Refinement behavior

The user may edit the objective or scope before learning begins.

## Success condition

The user believes Discovery understood the question accurately enough to proceed.

---

# 11. Scene Three — Plan

## User objective

Understand what Discovery wants to learn and why.

## Discovery objective

Present a bounded, explainable learning plan.

## Primary message

> I can improve this understanding by examining where delivery expectations and actual work begin to diverge.

## Recommended information

Each recommendation must include:

* source;
* reason;
* expected information gain;
* uncertainty addressed;
* access status.

### Recommendation 1

**Sprint retrospectives**

Expected information gain: High

Why:

> Retrospectives can reveal recurring delivery constraints, escalation patterns, and unresolved dependencies.

Addresses:

> Whether friction occurs during execution rather than planning.

### Recommendation 2

**Project and issue history**

Expected information gain: High

Why:

> Work history can show where delivery slows, changes ownership, or repeatedly returns to earlier stages.

Addresses:

> Where momentum is lost after commitment.

### Recommendation 3

**Selected team conversations**

Expected information gain: Medium to high

Why:

> Relevant conversations can reveal ambiguity, rework, and coordination patterns that formal project records do not capture.

Addresses:

> Why recorded workflow changes occur.

### Recommendation 4

**Product planning documents**

Expected information gain: Medium

Why:

> Planning documents can help determine whether priorities remain stable after teams commit to work.

Addresses:

> Whether delivery friction originates upstream.

## Expected change

**Current confidence**

Low

**Expected confidence after recommended learning**

Moderate to high

This is an estimate, not a promise.

## User controls

The user may:

* approve all recommended sources;
* exclude a source;
* inspect why a source is recommended;
* add context manually;
* continue with limited information.

## Primary action

> Start learning

## Success condition

The user believes Discovery has a deliberate research strategy rather than a desire to ingest everything.

---

# 12. Scene Four — Learn

## User objective

Understand that meaningful progress is occurring.

## Discovery objective

Show the Understanding changing through specific learning events.

## Experience rule

Do not use a generic progress bar as the primary expression.

Progress should be communicated through meaningful model change.

## Learning sequence

The prototype should use a deterministic sequence.

### Event 1

> Reviewing sprint retrospectives

Finding:

> Delivery concerns repeatedly appear after sprint commitment.

Effect:

* execution uncertainty decreases;
* confidence increases slightly.

### Event 2

> Comparing project ownership changes

Finding:

> Delayed work changes ownership more often than work delivered on time.

Effect:

* decision ownership becomes a candidate constraint;
* a relationship is created.

### Event 3

> Examining planning changes

Finding:

> Priorities remain relatively stable after planning.

Effect:

* the planning-instability explanation weakens;
* a contradiction is preserved.

### Event 4

> Connecting team conversations to delivery history

Finding:

> Teams repeatedly seek clarification after work has already begun.

Effect:

* ownership ambiguity strengthens;
* confidence becomes moderate.

## Visible indicators

The interface may show:

* confidence movement;
* unknowns resolved;
* new relationships;
* candidate explanations;
* contradictions;
* evidence reviewed.

## Motion

Motion should communicate:

* accumulation;
* connection;
* refinement;
* change over time.

Motion must not imply cognition that is not represented in the mocked state.

## Completion language

Do not say:

> Analysis complete.

Use:

> The first useful understanding is ready.

## Success condition

The user sees evidence that Discovery’s understanding changed rather than merely seeing a loading animation.

---

# 13. Scene Five — Understand

## User objective

Receive a clear synthesis of the issue.

## Discovery objective

Present the first Living Understanding with calibrated confidence.

## Header

**Engineering Productivity**

Living Understanding

## Primary synthesis

> Engineering planning appears healthier than delivery outcomes suggest. The largest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Confidence

Moderate

A percentage may appear secondarily, but the qualitative interpretation should remain primary.

Example:

> Moderate confidence · 74%

## Why this matters

> Teams are spending time resolving ownership and escalation questions after delivery has begun. That creates delay without necessarily appearing as reduced activity.

## Largest remaining unknown

> Whether unclear ownership is caused primarily by team structure, cross-functional governance, or inconsistent leadership intervention.

## Meaningful change

> The initial hypothesis that priorities were changing excessively after planning is now less likely.

## Supporting overview

* 31 supporting observations;
* 3 connected organizational conditions;
* 1 meaningful contradiction;
* 2 unresolved alternatives.

## Primary action

> Examine this understanding

## Secondary action

> Follow this understanding

## Success condition

The user can accurately explain Discovery’s current understanding after reading the default view for less than one minute.

---

# 14. Scene Six — Examine

## User objective

Determine whether the Understanding is credible.

## Discovery objective

Explain reasoning without overwhelming the user.

## Progressive disclosure structure

### Level 1 — Synthesis

The concise Understanding shown in Scene Five.

### Level 2 — Why Discovery believes this

Show the strongest evidence categories and reasoning relationships.

Example:

**Recurring pattern**

Delayed initiatives change ownership more frequently.

**Observed behavior**

Teams seek decision clarification after delivery begins.

**Contradicting evidence**

Planning priorities remained more stable than expected.

**Interpretation**

The strongest constraint appears to be post-planning ownership ambiguity rather than planning instability.

### Level 3 — Evidence

Users may inspect:

* specific observations;
* source context;
* timestamps;
* evidence relationships;
* contradictions;
* historical changes.

### Level 4 — Technical trace

Not included in Experience Alpha’s default product UI.

Existing traceability may eventually support internal validation or specialized administrative experiences, but implementation mechanics remain invisible to normal users.

## Required question

Discovery must answer:

> What would change your mind?

Example:

> I would become less confident in this explanation if ownership remained stable across delayed work, or if delays were concentrated primarily in periods of major priority change.

## Success condition

The user sees Discovery as reasoned and falsifiable rather than confidently opaque.

---

# 15. Scene Seven — Challenge or Confirm

## User objective

Contribute context and correct Discovery where needed.

## Discovery objective

Treat user challenge as evidence and model stewardship.

## Available actions

* This matches what I see
* Something is missing
* I disagree with the interpretation
* Investigate further

## Confirmation response

> Your confirmation strengthens the relevance of this Understanding, but it does not replace the supporting evidence.

## Missing-context response

Prompt:

> What context should Discovery consider?

User-provided example:

> Architecture review decisions are controlled by a separate platform group that is not represented in the project ownership data.

Discovery response:

> This may explain why formal ownership appears stable while decision authority remains unclear. I will treat this as a new hypothesis to examine.

## Disagreement response

Discovery should ask what specifically is disputed:

* evidence;
* interpretation;
* scope;
* terminology;
* omitted context.

## Rule

User feedback must not instantly force confidence upward.

Its effect depends on the type and support of the contribution.

## Success condition

The user believes they can improve Discovery without manually rebuilding its model.

---

# 16. Scene Eight — Follow

## User objective

Indicate that this Understanding matters over time.

## Discovery objective

Establish continued stewardship expectations.

## Primary action

> Follow this understanding

## Confirmation message

> I’ll continue learning about Engineering Productivity and show you when the understanding changes meaningfully.

## Follow settings for Alpha

The user may select:

* meaningful changes only;
* new contradictions;
* confidence changes;
* recommended next learning.

Default:

> Meaningful changes only

## Important limitation

The mocked Alpha must not imply actual autonomous background operation.

The prototype may demonstrate the intended future experience using a preconfigured returning-user state.

## Visual state change

The Understanding receives a restrained followed state.

Avoid:

* celebratory animation;
* social-media interaction patterns;
* notification-style urgency.

## Success condition

The user understands what following means and expects future value from returning.

---

# 17. Scene Nine — Return

## User objective

Quickly understand what changed since the previous visit.

## Discovery objective

Demonstrate compounding value.

## Homepage headline

> Good morning.

## Primary message

> Discovery learned three meaningful things since your last visit.

## Change One

**Engineering Productivity**

Confidence increased from moderate to moderately high.

Why:

> New project history strengthened the relationship between delayed delivery and unresolved decision ownership.

## Change Two

**Engineering Productivity**

A new contradiction emerged.

Why:

> One team delivers reliably despite using the same ownership structure.

Implication:

> Team-level leadership behavior may moderate the constraint.

## Change Three

**Connected understanding**

Product Prioritization is now meaningfully connected to Engineering Productivity.

Why:

> Priority stability affects how clearly ownership decisions can be evaluated.

## Recommended next learning

> Compare decision practices in the consistently delivering team with the rest of Engineering.

Expected information gain:

High

## Homepage secondary content

**Followed Understandings**

* Engineering Productivity — growing
* Product Prioritization — early orientation

**Needs attention**

* One unresolved contradiction
* One high-value learning opportunity

## Homepage rule

The homepage is not a dashboard.

It is a prioritized account of:

* what changed;
* why it matters;
* what should be understood next.

## Success condition

The user feels that returning to Discovery revealed meaningful new intelligence rather than refreshed metrics.

---

# 18. Core Product Objects Presented in Alpha

Experience Alpha should use a small user-facing vocabulary.

## Understanding

A continuously evolving orientation around a consequential organizational question.

## Current synthesis

Discovery’s best concise explanation at the present time.

## Confidence

Discovery’s calibrated trust in the current synthesis.

## Unknown

A specific uncertainty that materially limits understanding.

## Evidence

Information that supports, weakens, or contextualizes an interpretation.

## Contradiction

Meaningful evidence that does not fit the current synthesis.

## Relationship

A connection between this Understanding and another organizational issue or condition.

## Learning opportunity

A proposed action expected to materially reduce uncertainty.

## Meaningful change

A change to the synthesis, confidence, unknowns, contradictions, or relationships that warrants user attention.

These terms are product language, not necessarily new architecture contracts.

---

# 19. Navigation Model

Experience Alpha should avoid building a complete application navigation system.

The minimum navigation model is:

* Home
* Understandings
* Current Understanding
* Ask Discovery

During first-use onboarding, navigation may remain hidden until the first Understanding exists.

After creation, navigation should remain quiet and secondary.

The Understanding—not navigation—is the center of the experience.

---

# 20. Mock Data Requirements

All mocked data must be:

* deterministic;
* internally coherent;
* historically traceable;
* compatible with the interaction story;
* clearly isolated from production data;
* replaceable through a future projection adapter.

The mock model should include:

* organization;
* user;
* understanding objective;
* understanding status;
* confidence history;
* synthesis history;
* unknowns;
* evidence summaries;
* contradictions;
* relationships;
* learning recommendations;
* followed state;
* returning-user changes.

Mock data should not be embedded independently across components.

One canonical mocked experience model should drive the entire flow.

---

# 21. Implementation Architecture for the Prototype

The prototype should separate:

```text
Experience State

↓

View Models

↓

Components

↓

Interaction Transitions
```

Do not bind the UI directly to assumed future Runtime structures.

A temporary experience projection layer should provide the exact data required by the product experience.

This allows later replacement of mocked data with real projections without redesigning components.

---

# 22. Required Prototype States

The implementation must support:

1. New user
2. Question entered
3. Objective orientation
4. Learning plan proposed
5. Source excluded
6. Learning in progress
7. Learning event expanded
8. First Understanding ready
9. Understanding examined
10. Evidence expanded
11. Contradiction expanded
12. User confirms interpretation
13. User challenges interpretation
14. Understanding followed
15. Returning-user homepage
16. No meaningful changes
17. New contradiction
18. Confidence decreased
19. Learning recommendation unavailable
20. Mock experience reset

These states should be deterministic and directly testable.

---

# 23. Accessibility Requirements

The Alpha experience must:

* support keyboard navigation;
* maintain visible focus states;
* not rely on color alone;
* respect reduced-motion settings;
* use semantic headings;
* provide accessible labels for confidence and change;
* avoid auto-advancing content that cannot be paused;
* preserve reading order during transitions;
* meet WCAG AA contrast requirements.

Motion must enhance meaning without becoming necessary to understand it.

---

# 24. Product Validation Questions

Experience Alpha should be tested against these questions:

1. Does the user understand what Discovery is doing?
2. Does the user understand why Discovery recommends each source?
3. Can the user explain the current synthesis?
4. Does confidence feel reasoned rather than decorative?
5. Are the unknowns specific and useful?
6. Does the user understand what changed during learning?
7. Can the user challenge Discovery naturally?
8. Does the user trust Discovery more after examining its reasoning?
9. Does following an Understanding feel valuable?
10. Does the returning homepage create curiosity?
11. Does the experience require too much reading?
12. Does any screen feel like a conventional dashboard?
13. Does any interaction expose implementation mechanics?
14. Does the user want to create or follow another Understanding?
15. Would the user return tomorrow?

---

# 25. Alpha Success Criteria

Experience Alpha is successful when test users can complete the journey and consistently express the following beliefs:

* Discovery understood what I wanted to learn.
* Discovery had a sensible plan for improving its understanding.
* I could see how its understanding changed.
* Its primary insight was clear.
* I understood why it believed the insight.
* It was honest about uncertainty.
* I could challenge it.
* Following the Understanding felt useful.
* I would be curious to return and see what changed.

The most important behavioral signal is:

> The user voluntarily follows the Understanding.

The strongest qualitative signal is:

> “I want to see what Discovery learns next.”

---

# 26. Implementation Sequence

## Stage One — Experience specification

Complete:

* screen-by-screen specifications;
* responsive behavior;
* component inventory;
* interaction states;
* transitions;
* copy;
* mock data model.

## Stage Two — High-fidelity mockup

Create:

* first-use journey;
* Understanding page;
* challenge path;
* returning homepage;
* responsive variants.

## Stage Three — Mocked product implementation

Codex implements:

* reusable components;
* deterministic experience state;
* mocked projection;
* transitions;
* accessibility;
* responsive layout.

No production integration.

## Stage Four — Product validation

Test with representative executives.

Measure:

* comprehension;
* trust;
* perceived value;
* reading burden;
* desire to return;
* willingness to follow.

## Stage Five — Selective integration

Replace mocked capabilities one at a time.

Recommended order:

1. Understanding creation
2. Existing organizational projection
3. Current synthesis
4. Confidence
5. Evidence
6. Unknowns
7. Historical change
8. Learning recommendations
9. Retrieval planning
10. Continued learning

Architecture changes remain prohibited unless validated product behavior exposes a genuine gap.

---

# 27. Immediate Next Artifact

# 28. Canonical Alpha Semantic Freeze

The current Alpha target is one Chief-led Leadership Conversation workflow over
shared Organizational Understanding. Counsel may supply bounded challenge,
Operator may connect a choice to execution and review, and Scout may recommend a
material Evidence gap. None owns a separate truth store or autonomous authority.

Alpha acceptance requires a reproducible Baseline A, two-cycle replay, exact
organization and record authorization, revocation, cross-account and
cross-organization isolation, protected-body non-disclosure, truthful
insufficiency, auditability, and rollback. Architecture-compression
infrastructure, generic agents, continuous monitoring, universal search, and
privacy-preserving cross-user learning are outside this Alpha.

The Alpha cohort is approximately 5–10 closely supported design-partner users.
Readiness asks whether Discovery can serve them safely, explain and recover from
failure, preserve governance, and collect trustworthy Product evidence. After
Baseline A freezes, optimization is benchmarked, time-bounded, and guarded by
ablation, sensitivity, holdout/Goodhart controls, hard governance gates, and
human adjudication. Without a clearly superior candidate, retain A and proceed.
The next artifact should define the exact visual and interaction specification for:

> **Scene One — Ask**

It should include:

* desktop layout;
* responsive layout;
* exact copy;
* typography roles;
* spacing;
* input states;
* example-prompt behavior;
* keyboard behavior;
* transition into orientation;
* error states;
* component hierarchy;
* mocked state contract;
* acceptance criteria.

After Scene One is complete, the same process should be applied sequentially to all nine scenes.

This specification should be treated as the authoritative product blueprint for Discovery Experience Alpha.
