# Discovery Experience Alpha

# Canonical Experience Specification

**Status:** Implemented Alpha experience specification — canonical for Discovery Experience Alpha
**Version:** 1.0
**Program:** Discovery Experience Alpha
**Primary phase:** High-fidelity interactive prototype
**Implementation:** Deterministic and fixture-backed
**Production integration:** Deferred
**Detailed supplements:** Scene One through Scene Nine specifications

This document is canonical only for Discovery Experience Alpha. It remains
subordinate to the Product Canon, Discovery Platform Principles, Shared
Organizational Intelligence, the Organization Experience Canon, and applicable
architecture canon. It does not define platform-wide product or technical
authority.

The implemented prototype uses deterministic fixtures and local interaction
state. It does not read or write Organization Runtime, invoke production
cognition or AI interpretation, or provide durable persistence. Statements
about future organizational learning or memory describe intended product
behavior unless explicitly identified as implemented Alpha behavior.

The implemented route sequence is:

```text
/alpha → /alpha/ask
/alpha/ask
/alpha/orient
/alpha/plan
/alpha/learn
/alpha/understand
/alpha/respond
/alpha/follow
/alpha/return
/alpha/home
```

The original design lineage below retains separate **Examine** and **Challenge
or Confirm** concepts. In the implemented prototype, Examine is not a
standalone route; examination is entered from Understand, and the stewardship
interaction designed as Challenge or Confirm is presented as Respond at
`/alpha/respond`. Home is the implemented ninth routed scene after Return.

---

# 1. Purpose

Discovery Experience Alpha is the first complete product expression of the Discovery Design Language.

It exists to validate one central product hypothesis:

> A user will value Discovery when it transforms a consequential organizational question into a Living Understanding that becomes more useful, credible, and actionable over time.

Experience Alpha demonstrates the complete loop:

```text
Question

↓

Orientation

↓

Learning Plan

↓

Visible Learning

↓

Living Understanding

↓

Reasoning Examination

↓

User Stewardship

↓

Continued Learning

↓

Meaningful Return
```

The Alpha is not intended to demonstrate the entire Discovery platform.

It is intended to prove that Discovery can create a relationship between:

* a user;
* an important organizational question;
* a continuously evolving Understanding;
* and a shared learning process.

---

# 2. Primary Product Question

Experience Alpha must answer:

> Can Discovery create a Living Understanding that a user trusts enough to examine, improve, follow, and revisit?

The experience is not successful merely because the user receives an insight.

It is successful when the user voluntarily decides:

> Discovery should keep learning about this.

The strongest behavioral signal is:

> **Follow this Understanding**

The strongest return signal is:

> The user wants to know what Discovery learned next.

---

# 3. Canonical User

**Representative role:** VP of Engineering

**Organizational concern:**

> Engineering delivery has slowed despite teams appearing busy.

**Initial question:**

> Why has engineering productivity slowed?

The Alpha uses Engineering Productivity to make the experience specific and believable.

The product architecture and interaction model must remain:

* industry-agnostic;
* role-agnostic;
* function-agnostic;
* reusable for other consequential organizational questions.

---

# 4. Canonical Living Understanding

## Name

> Engineering Productivity

## Original question

> Why has engineering productivity slowed?

## Understanding objective

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

## First synthesis

> Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Concise interpretation

> Teams appear busy, but delivery slows when important decisions no longer have clear ownership after work begins.

## Initial confidence

> Moderate

Optional secondary value:

> 74%

## Strongest current explanation

> Post-planning ownership ambiguity

## Weakened explanation

> Formal priority instability

## Largest remaining unknown

> Why one Engineering team delivers reliably despite using a similar ownership structure.

## Primary contradiction

> One comparable team performs reliably under apparently similar formal ownership conditions.

## Connected Understandings

* Decision Ownership
* Cross-functional Coordination
* Product Prioritization

---

# 5. Canonical Emotional Journey

The Experience Alpha emotional progression is:

```text
Curiosity

↓

Orientation

↓

Clarity

↓

Agency

↓

Calibrated trust

↓

Stewardship

↓

Partnership
```

Each scene owns a distinct part of this progression.

| Scene                | Experience responsibility          | Emotional responsibility |
| -------------------- | ---------------------------------- | ------------------------ |
| Ask                  | Express a consequential question   | Curiosity                |
| Orient               | Review Discovery’s interpretation  | Recognition and control  |
| Plan                 | Approve how Discovery should learn | Agency                   |
| Learn                | Witness meaningful model change    | Clarity                  |
| Understand           | Grasp the current synthesis        | Recognition              |
| Examine              | Evaluate evidence and reasoning    | Calibrated trust         |
| Challenge or Confirm | Improve the model                  | Stewardship              |
| Follow               | Commit to continued learning       | Ownership                |
| Return               | Experience compounding value       | Partnership              |

The interface should never attempt to create trust before Discovery has earned it through explanation and uncertainty.

---

# 6. Canonical Scene Sequence

Experience Alpha contains nine scenes.

## Scene One — Ask

Discovery begins with:

> What would you like Discovery to understand?

The user enters:

> Why has engineering productivity slowed?

The scene establishes that Discovery begins with the user’s consequential question rather than:

* files;
* integrations;
* configuration;
* dashboards;
* templates;
* technical setup.

Primary action:

> Begin understanding

---

## Scene Two — Orient

Discovery preserves the user’s original words and proposes:

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

The scene establishes:

* the interpreted objective;
* initial scope;
* provisional exclusions;
* low confidence;
* the most important unknown.

The user may:

* refine the question;
* adjust the scope;
* approve the orientation.

Primary action:

> Continue to learning plan

---

## Scene Three — Plan

Discovery proposes the smallest, highest-value set of information expected to improve the Understanding.

Canonical recommendations:

1. Sprint retrospectives
2. Project and issue history
3. Selected team conversations
4. Product planning documents

Every source includes:

* why it is recommended;
* which uncertainty it addresses;
* expected information gain;
* proposed scope;
* expected contribution;
* limitation;
* inclusion state.

The user may:

* include;
* limit;
* exclude;
* add manual context;
* continue with incomplete information.

Primary action:

> Start learning

---

## Scene Four — Learn

Discovery shows meaningful model change rather than generic processing activity.

Canonical sequence:

1. Delivery friction appears after commitment.
2. Ownership movement is associated with delay.
3. Formal priority instability weakens.
4. Decision clarification repeatedly occurs after work begins.
5. The first useful synthesis becomes ready.

The scene visibly demonstrates:

* explanation strengthening;
* explanation weakening;
* confidence movement;
* contradiction preservation;
* relationship emergence;
* unknown transformation.

Primary action at readiness:

> View the Understanding

---

## Scene Five — Understand

Discovery presents the first Living Understanding.

The default view communicates in less than one minute:

* current synthesis;
* confidence;
* why it matters;
* strongest explanation;
* largest unknown;
* meaningful contradiction;
* historical change;
* connected Understandings.

Primary action:

> Examine this Understanding

Secondary action:

> Follow this Understanding

---

## Scene Six — Examine

Discovery explains:

> Why Discovery currently believes this

The scene presents:

* observed patterns;
* interpretation;
* current explanation;
* qualification;
* strongest evidence;
* contradicting evidence;
* alternative explanations;
* confidence rationale;
* what would weaken the explanation;
* what would strengthen it;
* reasoning history.

The scene must make the Understanding falsifiable.

Primary action:

> Respond to this Understanding

---

## Scene Seven — Challenge or Confirm

The user may respond through four paths:

1. This matches what I see
2. Something important is missing
3. I interpret the evidence differently
4. Investigate further before I respond

Discovery explains how it will treat the contribution.

User input may:

* strengthen relevance;
* create a hypothesis;
* reduce causal confidence;
* challenge evidence;
* narrow scope;
* expand scope;
* correct terminology;
* create a contradiction;
* recommend investigation.

User input must not automatically overwrite the Understanding.

Primary action:

Path-specific submission

Resulting action:

> Continue

---

## Scene Eight — Follow

Discovery asks:

> Keep learning?

Following means Discovery will:

* continue evaluating relevant evidence;
* preserve historical versions;
* identify meaningful changes;
* surface contradictions;
* recommend high-value learning.

Default interruption preference:

> Meaningful changes only

The scene should make following feel like stewardship rather than subscribing to alerts.

Primary action:

> Follow this Understanding

Completion action:

> Finish

---

## Scene Nine — Return

The user returns the next morning.

The homepage opens with:

> Good morning.

> Discovery learned three meaningful things since your last visit.

Canonical changes:

1. Confidence increased.
2. A new contradiction emerged.
3. Product Prioritization became meaningfully connected.

Canonical recommendation:

> Compare decision practices in the consistently delivering team with the rest of Engineering.

The homepage presents:

* what changed;
* why it changed;
* why it matters;
* what remains unresolved;
* what should be learned next.

It must not become:

* a dashboard;
* a feed;
* a notification center;
* an activity log;
* a report index.

---

# 7. Cross-Scene Interaction Model

The nine scenes are not separate workflows.

They are states of one continuous inquiry.

The user’s original question must remain historically traceable throughout the experience.

The canonical continuity model is:

```text
Original Question

↓

Interpreted Objective

↓

Approved Learning Plan

↓

Learning Events

↓

Current Synthesis

↓

Evidence and Reasoning

↓

User Contribution

↓

Followed Understanding

↓

Meaningful Change
```

Transitions should feel like the inquiry evolving rather than the user navigating between unrelated tools.

---

# 8. Primary User-Facing Objects

Experience Alpha uses a small product vocabulary.

## Understanding

A continuously evolving orientation around a consequential organizational question.

## Current synthesis

Discovery’s best concise explanation at the present time.

## Confidence

Discovery’s calibrated trust in the current synthesis.

## Unknown

A specific uncertainty that materially limits the Understanding.

## Evidence

Information that supports, weakens, or contextualizes an interpretation.

## Contradiction

Meaningful evidence that does not fit the current synthesis cleanly.

## Relationship

A connection between this Understanding and another organizational issue or condition.

## Learning opportunity

A proposed action expected to materially reduce uncertainty.

## Meaningful change

A change significant enough to deserve user attention.

## Contribution

Context, confirmation, disagreement, correction, or interpretation supplied by a user.

These are user-facing experience concepts.

They do not automatically define new Runtime, cognition, or Governance objects.

---

# 9. Understanding Lifecycle

The Alpha presents the Understanding through the following lifecycle states:

```text
Question

↓

Early orientation

↓

Learning plan

↓

Learning

↓

First synthesis

↓

Growing

↓

Stable or changed

↓

More useful Understanding
```

Canonical user-facing labels may include:

* Early orientation
* Learning
* First synthesis
* Growing
* Stable
* Changed
* More uncertain
* Needs context

Avoid:

* Complete
* Final
* Processed
* Failed
* Closed

An Understanding should rarely feel finished.

---

# 10. Confidence Contract

Confidence represents Discovery’s current trust in the synthesis.

It does not represent:

* the probability that the organization has a problem;
* system processing completion;
* evidence volume alone;
* organizational performance quality;
* certainty that one intervention will work.

## Confidence may

* increase;
* decrease;
* remain unchanged;
* become more qualified;
* differ across explanations.

## Canonical Alpha progression

```text
Low

↓

Low to moderate

↓

Moderate

↓

Moderate

↓

Moderately high

↓

Moderate after final contradiction calibration
```

The returning state may later increase to:

> Moderately high · 81%

## Presentation rule

Qualitative confidence is primary.

Numeric confidence is optional and secondary.

Every confidence value must have an explanation.

---

# 11. Unknown Contract

Unknowns are first-class product content.

An unknown must identify:

* what Discovery does not know;
* why it matters;
* what could reduce the uncertainty.

Unknowns may:

* narrow;
* transform;
* retire;
* split;
* become more important;
* generate new learning.

Learning should sometimes create a better unknown rather than eliminating uncertainty.

Avoid:

* More data needed
* Insufficient information
* Unknown cause

---

# 12. Contradiction Contract

Contradictions are valuable model inputs.

A contradiction must include:

* the evidence that does not fit;
* why it matters;
* how it affects confidence;
* which explanation it challenges;
* what could clarify it.

Contradictions must not appear as:

* errors;
* warnings;
* system failures;
* anomalies to be hidden.

The Alpha must visibly preserve at least one meaningful contradiction through the complete experience.

---

# 13. Evidence Contract

Evidence should be presented through progressive disclosure.

## Level One — Meaning

* synthesis;
* confidence;
* why it matters;
* largest unknown.

## Level Two — Qualification

* strongest explanation;
* contradiction;
* alternatives;
* relationship;
* what changed.

## Level Three — Reasoning

* evidence categories;
* recurring observations;
* interpretations;
* limitations;
* falsification conditions.

## Level Four — Trace

* observation summaries;
* timestamps;
* source context;
* lineage;
* access-controlled detail.

The user should never need Level Four to understand the primary synthesis.

---

# 14. User Contribution Contract

User contribution is evidence and stewardship input.

It is not an automatic override.

## Confirmation may

* strengthen practical relevance;
* increase investigation priority;
* support a mechanism hypothesis.

## Confirmation must not automatically

* prove causation;
* resolve contradiction;
* replace evidence;
* dramatically increase confidence.

## Disagreement may

* create an alternative explanation;
* reduce causal confidence;
* challenge evidence quality;
* narrow or expand scope;
* correct terminology.

## Missing context may

* create a hypothesis;
* identify hidden authority;
* introduce a new source;
* reveal governance or visibility requirements.

## Contribution response must show

* what Discovery heard;
* how it may affect the Understanding;
* what remains unchanged;
* what should happen next.

---

# 15. Meaningful Change Contract

Following an Understanding does not mean receiving every update.

A change is meaningful when it materially affects:

1. the synthesis;
2. confidence;
3. a contradiction;
4. the largest unknown;
5. a significant relationship;
6. scope;
7. the highest-value learning opportunity.

Canonical change types:

* Synthesis changed
* Confidence increased
* Confidence decreased
* New contradiction
* Contradiction resolved
* New relationship
* Relationship strengthened
* Largest unknown changed
* Scope changed
* High-value learning opportunity
* Stable

Discovery must not manufacture change to justify engagement.

---

# 16. Homepage Contract

The returning homepage is the front door to organizational learning.

It should answer:

1. What did Discovery learn?
2. Why does it matter?
3. What remains unresolved?
4. What should be understood next?
5. Which followed Understandings need attention?

The first viewport should include:

* meaningful-learning summary;
* most important change;
* primary next-learning recommendation.

The homepage should not begin with:

* metric cards;
* health scores;
* source activity;
* organizational charts;
* task lists;
* integration status;
* notifications;
* generic recent activity.

---

# 17. Navigation Contract

During first use, navigation should remain minimal or hidden.

After the first Understanding exists, Alpha may expose:

* Home
* Understandings
* Ask Discovery

The Understanding remains the center of the experience.

Navigation must not become the organizing metaphor.

---

# 18. Motion Contract

Motion communicates meaningful change.

Allowed motion purposes:

* preserve an object across scenes;
* show an Understanding stabilizing;
* show confidence changing;
* show an unknown transforming;
* show a contradiction appearing;
* show a relationship emerging;
* reveal progressive detail.

Avoid:

* animated AI particles;
* simulated typing;
* streaming token effects;
* neural-network animation;
* generic progress bars;
* spinning cognition visuals;
* celebratory motion;
* unnecessary staggered reveals.

All scenes must support reduced motion.

No meaning may depend on animation.

---

# 19. Copy Contract

Discovery speaks like a thoughtful organizational researcher.

## Preferred language

* understand;
* currently;
* appears;
* supports;
* weakens;
* remains uncertain;
* contradiction;
* meaningful change;
* why it matters;
* what would change Discovery’s mind;
* improve this Understanding;
* keep learning.

## Avoid

* AI-generated;
* model output;
* prompt;
* ingestion;
* processing;
* tokens;
* embeddings;
* pipeline;
* crawl;
* train;
* root cause;
* proven;
* final answer;
* complete;
* dashboard;
* alert;
* feed;
* monitor;
* subscribe.

---

# 20. Accessibility Contract

Every scene must:

* support full keyboard navigation;
* maintain visible focus;
* use semantic headings;
* preserve logical reading order;
* label dynamic states clearly;
* not rely on color alone;
* support reduced motion;
* provide accessible confidence explanations;
* pause auto-advancing learning during review;
* preserve user input after errors;
* meet WCAG AA contrast requirements.

Auto-advancing content must be:

* pausable;
* skippable;
* nonessential to comprehension.

---

# 21. Responsive Contract

The experience must support:

* desktop;
* tablet;
* mobile;
* limited-height displays.

## Desktop

Use spacious, left-aligned reading layouts.

Avoid wide dashboard grids.

## Tablet

Preserve the hierarchy while stacking secondary regions.

## Mobile

Prioritize:

1. primary meaning;
2. confidence;
3. unknown;
4. primary action;
5. progressive details.

The user should never need to scroll through metrics before reaching meaning.

---

# 22. Prototype Data Contract

The Alpha must use one canonical deterministic experience model.

Do not duplicate mocked values across components.

The model must contain:

* user;
* organization;
* original question;
* Understanding objective;
* scope;
* learning plan;
* source recommendations;
* uncertainty coverage;
* learning events;
* snapshot history;
* current synthesis;
* confidence;
* contradictions;
* relationships;
* evidence groups;
* alternative explanations;
* falsification conditions;
* user contribution;
* follow state;
* return-state changes.

Mock data must be:

* internally coherent;
* historically traceable;
* centrally defined;
* replaceable by a future projection adapter;
* clearly separated from production architecture.

---

# 23. Shared Prototype State

A consolidated Alpha state may resemble:

```ts
type ExperienceScene =
  | "ask"
  | "orient"
  | "plan"
  | "learn"
  | "understand"
  | "examine"
  | "respond"
  | "follow"
  | "return";

interface DiscoveryExperienceAlphaState {
  scene: ExperienceScene;

  inquiry: {
    originalQuestion: string;
    objective: string | null;
    scopeApproved: boolean;
  };

  learningPlan: {
    status: "unavailable" | "draft" | "approved";
    approvedSourceIds: string[];
    expectedConfidence: string | null;
  };

  learning: {
    status:
      | "not-started"
      | "preparing"
      | "learning"
      | "paused"
      | "ready"
      | "failed";
    activeEventId: string | null;
    completedEventIds: string[];
    snapshotSequence: number;
  };

  understanding: {
    id: string | null;
    status: string | null;
    isFollowed: boolean;
  };

  response: {
    type: string | null;
    submitted: boolean;
  };

  returnState: {
    enabled: boolean;
    scenario:
      | "canonical"
      | "no-change"
      | "one-change"
      | "many-change"
      | "confidence-decreased";
  };
}
```

This is a prototype orchestration contract only.

It must not become a new platform or cognitive architecture.

---

# 24. Prototype Modes

The interactive prototype should support deterministic controls for:

* canonical complete journey;
* vague-question validation;
* adjusted scope;
* reduced learning plan;
* learning pause;
* insufficient evidence;
* no strong synthesis;
* confidence decrease;
* contradiction dominant;
* confirmation response;
* missing-context response;
* alternative interpretation;
* sensitive contribution;
* no meaningful return changes;
* one meaningful return change;
* many return changes;
* prototype reset.

These controls may be development-only.

They should not appear in the normal user experience.

---

# 25. Production Honesty

Experience Alpha uses prepared data.

It must not falsely imply that:

* live sources were accessed;
* Governance enforcement is production-ready;
* autonomous learning occurred while the user was away;
* confidence was calculated by a validated production model;
* the source scope was actually enforced;
* new cognition was implemented.

The prototype environment may be clearly labeled outside the normal product surface.

The user-facing journey should remain coherent and immersive.

---

# 26. Architecture Boundary

Experience Alpha may introduce:

* experience-specific components;
* deterministic mocked state;
* prototype view models;
* a temporary projection adapter;
* responsive layouts;
* motion and interaction behavior;
* accessibility tests.

Experience Alpha must not introduce:

* new cognitive capabilities;
* new Runtime objects;
* new Governance objects;
* live retrieval;
* connector infrastructure;
* production background processing;
* production confidence calculation;
* new architecture layers;
* technical Understanding persistence contracts.

Architecture changes remain prohibited unless validated product behavior demonstrates a genuine gap.

---

# 27. High-Fidelity Design Deliverables

The next phase should produce high-fidelity visual designs for:

1. Scene One — Ask
2. Scene Two — Orient
3. Scene Three — Plan
4. Scene Four — Learn
5. Scene Five — Understand
6. Scene Six — Examine
7. Scene Seven — Challenge or Confirm
8. Scene Eight — Follow
9. Scene Nine — Return

Each visual design should include:

* primary desktop screen;
* mobile screen;
* important expanded state;
* loading or transition state;
* error or uncertainty state;
* interaction annotations;
* motion annotations;
* responsive notes.

---

# 28. Visual Design Questions to Resolve

High-fidelity design must resolve the following questions.

## Global

* final typeface;
* typography scale;
* spacing scale;
* semantic color system;
* surface treatment;
* border and radius language;
* icon strategy;
* primary action style;
* motion timing;
* application frame;
* navigation behavior.

## Ask

* action inside or below the input;
* examples as text or restrained chips;
* desktop autofocus;
* first-use frame treatment.

## Orient

* scope columns or stacked presentation;
* position of Current Orientation;
* direct objective editing;
* scope-adjustment interaction.

## Plan

* recommendation cards or continuous list;
* source-state control;
* sensitive-source approval;
* dynamic plan-summary placement.

## Learn

* one-column or split layout;
* auto-advance behavior;
* active-event presentation;
* confidence change treatment;
* event history treatment.

## Understand

* whether numeric confidence appears;
* contradiction default visibility;
* relationship placement;
* primary action hierarchy.

## Examine

* reasoning-chain visual treatment;
* evidence-section density;
* placement of falsification conditions;
* source-context interaction.

## Challenge or Confirm

* response-path control;
* effect-preview timing;
* contribution-target interaction;
* sensitive-response treatment.

## Follow

* meaningful-change preference interaction;
* future-learning preview;
* suggested Understanding placement.

## Return

* homepage first-viewport composition;
* primary-change treatment;
* followed-Understanding density;
* contribution follow-up placement.

Codex must not resolve these design questions independently.

---

# 29. Product Validation Plan

The high-fidelity prototype should be tested with representative executives.

## Core comprehension tests

Can the user explain:

* what Discovery is doing;
* what the current Understanding means;
* why Discovery is confident;
* what remains unknown;
* why a source was requested;
* what changed;
* what following means?

## Core trust tests

Does the user believe:

* Discovery preserved contradictions;
* confidence is calibrated;
* disagreement is welcome;
* evidence can weaken an explanation;
* user input does not automatically overwrite the model?

## Core behavioral tests

Does the user:

* complete the first Understanding;
* examine the reasoning;
* contribute context;
* follow the Understanding;
* express curiosity about returning?

## Core design tests

Does any screen feel like:

* a dashboard;
* a chatbot;
* an onboarding wizard;
* an integration marketplace;
* a report;
* a notification center;
* AI theater?

Any strong association with those patterns should trigger redesign.

---

# 30. Canonical Success Criteria

Experience Alpha succeeds when users consistently report:

* Discovery understood what I wanted to learn.
* Discovery formed a sensible learning plan.
* I could see how its Understanding changed.
* The synthesis was clear.
* Confidence felt reasoned.
* Discovery was honest about uncertainty.
* I could examine why it believed the synthesis.
* I could improve or challenge the model.
* Following the Understanding felt valuable.
* Returning revealed meaningful learning.
* I want to see what Discovery learns next.

The most important success moment remains:

> **The user follows the Understanding.**

The ultimate emotional result is:

> **Discovery feels like an intelligence becoming progressively better at understanding the organization.**

---

# 31. Canonical Anti-Patterns

Experience Alpha must never:

1. Begin with a dashboard.
2. Begin with source connection.
3. Begin with file upload.
4. Present itself as a chatbot.
5. Use technical AI language.
6. Request information without explaining why.
7. Treat confidence as processing progress.
8. Treat confidence increase as organizational improvement.
9. Hide contradictions.
10. Present association as causation.
11. Treat executive confirmation as proof.
12. Treat disagreement as rejection.
13. Overwrite historical Understanding.
14. Manufacture novelty.
15. Notify for insignificant activity.
16. Show source volume as product value.
17. Expose Runtime or cognition.
18. Build a graph because relationships exist.
19. Create urgency without consequence.
20. Require excessive reading before meaning.
21. Ask the user to configure the platform before receiving value.
22. Allow Codex to invent unresolved interaction decisions.

---

# 32. Implementation Sequence

## Phase One — Consolidation

Complete:

* canonical master specification;
* nine detailed scene specifications;
* shared state model;
* canonical mock data;
* prototype-state scenarios.

## Phase Two — High-Fidelity Visual Design

Create:

* visual system;
* all nine primary screens;
* major responsive states;
* interaction prototype;
* motion prototype.

## Phase Three — Product Validation

Test:

* comprehension;
* hierarchy;
* reading burden;
* trust;
* challenge behavior;
* follow intent;
* return curiosity.

Revise the visual experience before implementation.

## Phase Four — Mocked Product Implementation

Codex implements:

* approved visual designs;
* deterministic state;
* accessibility;
* responsive behavior;
* prototype controls;
* interaction tests.

Codex does not redesign.

## Phase Five — Selective Production Integration

Replace mocked projections one capability at a time:

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

Architecture changes remain prohibited unless product validation exposes a genuine gap.

---

# 33. Document Hierarchy

The canonical hierarchy for Discovery Experience Alpha is:

```text
Product Canon

↓

Platform Principles + Shared Organizational Intelligence

↓

Organization Experience Canon + applicable architecture canon

↓

Discovery Design Language

↓

Discovery Experience Alpha Canonical Specification

↓

Nine Detailed Scene Specifications

↓

High-Fidelity Visual Prototype

↓

Mocked Product Implementation
```

When documents conflict:

1. Product Canon governs product identity.
2. Platform Principles and Shared Organizational Intelligence govern platform
   hierarchy and direction.
3. Organization Experience Canon and applicable architecture canon govern
   their application and technical domains.
4. Discovery Design Language governs experience behavior.
5. This document governs the complete Alpha journey within that authority.
6. Detailed scene specifications govern scene-level design intent.
7. Approved visual designs govern visual implementation.
8. The committed prototype records implemented Alpha behavior where an earlier
   design specification differs.

---

# 34. Definition of Ready for Visual Design

Experience Alpha is ready for high-fidelity visual design when:

* all nine scenes exist;
* the scene sequence is stable;
* canonical content is defined;
* confidence behavior is coherent;
* contradictions remain preserved;
* user contribution behavior is bounded;
* follow meaning is defined;
* return-state meaning is defined;
* shared vocabulary is stable;
* unresolved visual decisions are listed;
* no additional product-philosophy document is required.

These conditions are now satisfied.

---

# 35. Final Product Standard

Every screen in Experience Alpha should pass this test:

> Does this interaction make Discovery’s Understanding clearer, more credible, more useful, or more capable of improving over time?

If not, the interaction should be removed.

The complete experience should pass this test:

> Does the user feel that Discovery understands the organization better than it did when the journey began—and that it will understand it better still when they return?

Only an unambiguous yes is acceptable.
