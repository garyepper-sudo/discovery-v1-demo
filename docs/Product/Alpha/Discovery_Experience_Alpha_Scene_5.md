# Discovery Experience Alpha

# Scene Five Specification — Understand

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Clarity
**Implemented Alpha route:** `/alpha/understand`
**Previous scene:** Learn
**Historical next concept:** Examine
**Implemented next routed scene:** Respond
**Primary objective:** Present the first Living Understanding clearly enough that the user can grasp its meaning in under one minute.
**Core trust requirement:** The synthesis must be concise without hiding confidence, uncertainty, contradiction, or change over time.

This document preserves detailed Alpha design intent. The displayed
Understanding, confidence, history, and relationships come from deterministic
fixtures; they are not projections of live Organization Runtime or production
cognition. Examine remains an intentional interaction concept but is not a
standalone implemented route.

---

# 1. Scene Purpose

Scene Five is the first moment when Discovery presents a coherent Understanding rather than the process of building one.

The user should now be able to answer:

> What does Discovery currently understand?

This is not the final answer to the user’s original question.

It is the best current synthesis supported by the approved evidence, interpreted through the current Understanding objective.

The scene must balance two competing needs:

* make the central meaning immediately clear;
* preserve enough uncertainty and traceability to prevent false certainty.

The default view should communicate the Understanding in less than one minute.

Deeper reasoning remains available through progressive disclosure and Scene Six.

---

# 2. Primary User Outcome

The user understands:

* the current synthesis;
* the strongest explanation;
* why it matters;
* how confident Discovery is;
* what changed from the initial orientation;
* what remains unresolved;
* that contradictory evidence still exists;
* what they may do next.

The user should be able to explain the Understanding in their own words without opening detailed evidence.

---

# 3. Primary Discovery Outcome

Discovery presents a stable first version of the Living Understanding.

The scene should establish the Understanding as:

* persistent;
* evolving;
* historically traceable;
* evidence-supported;
* confidence-qualified;
* connected to other organizational meaning;
* open to challenge;
* capable of continued learning.

The scene is not merely a report result.

It is the first visible state of an Understanding the user may choose to steward over time.

---

# 4. Emotional Objective

The emotional transition is:

```text
Clarity

↓

Recognition

↓

Measured confidence

↓

Interest in deeper examination
```

The user should think:

> That is a useful explanation, and I understand why Discovery is not completely certain.

The user should not think:

* Discovery has proven causation;
* the issue is solved;
* a recommendation has already been justified;
* the confidence percentage is scientific precision;
* contradictory evidence has been dismissed.

---

# 5. Canonical Alpha Understanding

## Understanding name

> Engineering Productivity

## Understanding status

> Living Understanding

## Original question

> Why has engineering productivity slowed?

## Current synthesis

> Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Confidence

> Moderate

Optional secondary representation:

> 74%

## Strongest explanation

> Post-planning ownership ambiguity

## Weakened explanation

> Formal priority instability

## Largest remaining unknown

> Why one Engineering team delivers reliably despite using a similar ownership structure.

## Meaningful contradiction

> A comparable team performs better under apparently similar formal conditions.

## Connected Understandings

* Decision Ownership — meaningful relationship
* Cross-functional Coordination — emerging relationship

---

# 6. Primary Scene Message

The Understanding itself should be the primary message.

Do not precede it with a large generic heading such as:

* Results
* Analysis
* Findings
* Your report
* AI summary
* Discovery output

Recommended page opening:

**Engineering Productivity**

> Living Understanding

Then the current synthesis.

The user should encounter the meaning before the surrounding interface.

---

# 7. Page Structure

Scene Five contains eight primary regions:

```text
Application frame

Understanding identity

Current synthesis

Confidence and state

Why it matters

Meaningful change

Unknown and contradiction

Primary actions
```

Supporting evidence counts and relationships appear after the main meaning.

The page should not open with metrics.

---

# 8. Transition from Scene Four

## 8.1 Preserved synthesis

The final learning-event synthesis should transform directly into the Scene Five primary synthesis.

The content should not disappear and reappear as an unrelated result.

## 8.2 Transition sequence

Recommended sequence:

1. “The first useful Understanding is ready” recedes.
2. The synthesis remains in place.
3. The Understanding name and Living Understanding status appear.
4. Confidence, unknown, and contradiction settle into the page.
5. Primary actions become available.
6. Historical learning events become accessible through a secondary action.

## 8.3 Spatial continuity

Where possible:

* the Scene Four current synthesis becomes the Scene Five hero;
* the final confidence state remains anchored;
* the largest unknown moves into its persistent location;
* learning history collapses behind “See what changed.”

The transition should communicate stabilization, not completion.

---

# 9. Desktop Layout

## 9.1 Main container

Recommended maximum width:

```text
1080–1160 px
```

Primary reading column:

```text
680–780 px
```

## 9.2 Suggested composition

```text
Engineering Productivity
Living Understanding

Current synthesis

Confidence          Largest unknown

Why this matters

What changed

Contradiction
Relationships

Examine              Follow
```

## 9.3 Page balance

The synthesis should dominate.

Confidence, unknowns, contradiction, and relationships should support it rather than compete with it.

Avoid placing all supporting states in equally weighted cards.

## 9.4 Optional secondary rail

A quiet right rail may contain:

* confidence;
* last meaningful change;
* follow state;
* relationship summary.

Use only if it does not create a dashboard appearance.

A single-column design may better preserve the intended hierarchy.

---

# 10. Tablet and Mobile Layout

## 10.1 Tablet

* preserve synthesis at the top;
* stack confidence and largest unknown when needed;
* keep actions immediately after the primary meaning;
* move relationships beneath the contradiction;
* avoid a persistent side rail.

## 10.2 Mobile

Use one column with the following priority:

1. Understanding identity
2. Current synthesis
3. Confidence
4. Why it matters
5. Largest unknown
6. Meaningful contradiction
7. Primary actions
8. What changed
9. Relationships
10. Supporting overview

The user should not need to scroll through statistics before reaching the synthesis.

## 10.3 Action behavior

On small screens, primary actions may be full-width.

Avoid a sticky action bar unless it does not obscure reading or browser controls.

---

# 11. Understanding Identity

## Name

> Engineering Productivity

This is the user-facing Understanding title.

It should not be treated as a technical object identifier.

## Status label

> Living Understanding

The status communicates that the meaning can evolve.

It should appear:

* close to the title;
* visually secondary;
* without a bright badge treatment;
* without implying process completion.

## Optional status details

Progressive disclosure may show:

* Created today
* Last changed moments ago
* Follow status
* Current lifecycle state

Do not show these details before the synthesis.

---

# 12. Current Synthesis

## Canonical copy

> Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Requirements

The synthesis must:

* state the strongest current meaning;
* distinguish planning from post-planning execution;
* avoid claiming proven causation;
* identify ownership and decision authority;
* include cross-functional dependency context;
* remain understandable without domain jargon;
* fit within approximately two to four lines on desktop.

## Language discipline

Use:

* appears;
* strongest recurring constraint;
* emerges;
* current;
* across dependencies.

Avoid:

* definitely;
* caused by;
* root cause;
* proven;
* always;
* failure;
* dysfunctional;
* broken.

---

# 13. Concise Interpretation

A short interpretive line may follow the synthesis.

## Recommended copy

> Teams appear busy, but delivery slows when important decisions no longer have clear ownership after work begins.

This line translates the synthesis into more direct executive language.

## Role

The primary synthesis is the formal current Understanding.

The concise interpretation makes the operational consequence easier to grasp.

Use only if it reduces reading burden rather than duplicating the synthesis.

---

# 14. Confidence Presentation

## Qualitative state

> Moderate confidence

## Optional secondary percentage

> 74%

The qualitative state must remain primary.

## Explanation

> Multiple source categories support the same pattern, but causal direction and one meaningful contradiction remain unresolved.

This explanation should be available without opening the full evidence view.

## Confidence interaction

Action:

> Why moderate?

Selecting it reveals:

* supporting diversity;
* unresolved causality;
* contradiction;
* source limitations;
* distinction between association and causation.

## Rule

Confidence must communicate Discovery’s trust in the synthesis, not probability that the organization has a problem.

---

# 15. Why This Matters

## Heading

> Why this matters

## Canonical copy

> Teams may spend substantial time resolving ownership and escalation questions after delivery has begun. That creates delay and rework without necessarily appearing as reduced activity.

## Requirements

This section should:

* translate the Understanding into organizational consequence;
* avoid prescribing an intervention;
* avoid financial impact estimates not supported by evidence;
* explain why activity levels can obscure productivity loss;
* remain brief.

## Do not use

* Business impact
* Revenue at risk
* Critical alert
* Executive warning

unless the evidence supports those labels.

---

# 16. Strongest Explanation

## Heading

> Strongest current explanation

## Value

> Post-planning ownership ambiguity

## Supporting sentence

> Work is more likely to delay when teams must clarify ownership or decision authority after commitment.

## Alternative explanations

Alternative explanations should remain available through disclosure:

* informal priority changes;
* cross-functional coordination burden;
* structural dependency complexity;
* leadership or team-level moderation.

Do not display all alternatives at equal prominence by default.

---

# 17. Largest Remaining Unknown

## Heading

> Largest remaining unknown

## Canonical copy

> Why one Engineering team delivers reliably despite using a similar ownership structure.

## Why it matters

> The difference may reveal whether leadership behavior, team practices, or local decision norms moderate the broader constraint.

## Action

> Investigate this unknown

This action may become the primary bridge to continued learning.

## Rule

The unknown should be framed as valuable next learning, not unfinished system work.

---

# 18. Meaningful Contradiction

## Heading

> Meaningful contradiction

## Canonical copy

> One comparable Engineering team delivers reliably under apparently similar formal ownership conditions.

## Interpretation

> Formal structure alone may not explain the outcome.

## Why preserved

> The contradiction prevents Discovery from treating ownership ambiguity as a complete causal explanation.

## Action

> Examine contradiction

## Visual treatment

The contradiction should be distinct but calm.

Do not use:

* warning triangles;
* red alert styling;
* error language;
* anomaly alarms.

---

# 19. What Changed

## Heading

> What changed

This section summarizes movement from the initial orientation.

## Before

> Discovery could not distinguish among planning, ownership, coordination, and execution constraints.

## Now

> Ownership ambiguity after commitment is the strongest current explanation.

## Explanation weakened

> Formal priority instability is less likely to be the primary constraint.

## New question

> What allows one team to perform reliably under similar formal conditions?

## Presentation

A concise before-and-after treatment is preferred.

Avoid a full event timeline in the default view.

Action:

> See the learning history

This opens the Scene Four trace or a persistent historical view.

---

# 20. Relationships

## Heading

> Connected Understandings

## Relationship One

**Decision Ownership**

> Meaningfully connected

Explanation:

> Delivery slows more often when ownership or decision authority becomes unclear after commitment.

## Relationship Two

**Cross-functional Coordination**

> Emerging connection

Explanation:

> Clarification behavior is concentrated where work crosses Product, Design, and Engineering boundaries.

## Interaction

Selecting a relationship may:

* preview its current meaning;
* explain supporting evidence;
* offer to begin or open that Understanding.

## Alpha boundary

Do not create a full graph explorer.

A restrained relationship list is sufficient.

---

# 21. Supporting Overview

A concise supporting summary may appear below the primary sections.

## Canonical values

* 31 supporting observations
* 3 connected organizational conditions
* 2 unresolved alternative explanations
* 2 meaningful contradictions
* 4 approved source categories

## Rule

Counts should remain secondary.

The user should never need them to understand the synthesis.

## Evidence counts

Only display counts that correspond to deterministic mock data and have clear definitions.

Avoid inflated activity metrics such as:

* thousands of messages processed;
* millions of tokens reviewed;
* hundreds of insights generated.

---

# 22. Primary Actions

Scene Five should have one dominant action and one important secondary action.

## Primary action

> Examine this Understanding

This advances to Scene Six.

It answers the natural trust question:

> Why does Discovery believe this?

## Secondary action

> Follow this Understanding

This establishes continued learning intent and may advance to Scene Eight after examination or be available immediately.

## Tertiary actions

* Investigate the largest unknown
* Add context
* Challenge the interpretation
* See what changed

These should remain visually secondary.

---

# 23. Recommended Action Hierarchy

For first exposure:

1. Examine this Understanding
2. Follow this Understanding
3. Investigate largest unknown
4. Challenge or add context
5. Review learning history

The product should encourage trust examination before passive following, without forcing a rigid sequence.

---

# 24. Follow State in Scene Five

The user may follow directly from this scene.

## Action

> Follow this Understanding

## Confirmation

> Discovery will continue learning and show you when the Understanding changes meaningfully.

## Prototype limitation

The deterministic prototype demonstrates the future followed state but does not imply live autonomous operation.

## Visual update

The status changes quietly:

> Following

Do not use:

* celebration;
* confetti;
* follower counts;
* social-media metaphors;
* notification urgency.

---

# 25. Challenge Entry

The user must be able to challenge the synthesis from this scene.

## Action

> Something is missing

or:

> Challenge this interpretation

Preferred initial action:

> Something is missing

It is less confrontational and may encourage contribution.

A secondary menu may include:

* I disagree with the interpretation
* The scope is incomplete
* The evidence is missing context
* The terminology is wrong

Challenge behavior is fully specified in Scene Seven.

---

# 26. Historical State

The Understanding must visually imply history.

## Recommended copy

> First synthesis · created today

or:

> First meaningful change recorded today

The user should understand that future versions will be preserved.

## History action

> See what changed

The historical view should preserve:

* prior synthesis;
* confidence history;
* unknown changes;
* contradiction additions;
* relationship changes;
* source additions.

## Rule

The Understanding should not appear as a static generated page.

---

# 27. Freshness and Change

The Understanding may display:

> Last changed moments ago

This should refer to meaningful model change, not page refresh time.

Future states may include:

* changed today;
* stable for 12 days;
* confidence decreased yesterday;
* new contradiction added;
* scope expanded.

Avoid showing “updated” for irrelevant technical refreshes.

---

# 28. Progressive Disclosure Model

Scene Five uses four levels.

## Level One — Meaning

Visible by default:

* Understanding name;
* synthesis;
* confidence;
* why it matters;
* largest unknown;
* primary actions.

## Level Two — Qualification

Visible with minimal expansion:

* strongest explanation;
* contradiction;
* confidence explanation;
* what changed;
* relationships.

## Level Three — Reasoning

Available through Scene Six:

* evidence categories;
* reasoning relationships;
* alternative explanations;
* falsification conditions;
* source limitations.

## Level Four — Trace

Available through deeper inspection:

* observation summaries;
* timestamps;
* source references;
* historical states;
* governance-aware evidence access.

The default view should never open at Level Three or Four.

---

# 29. No Strong Synthesis State

The product must support a Living Understanding without a strong explanation.

## Headline

> Discovery does not yet have a reliable explanation.

## Current pattern

> Work appears to lose momentum after commitment, but the available evidence does not distinguish among ownership, coordination, and execution causes.

## Confidence

> Low

## Largest unknown

> Which condition consistently precedes delayed delivery?

## Primary action

> Review the next learning opportunity

## Secondary action

> Examine what Discovery has learned so far

## Rule

An inconclusive Understanding remains valuable when it clearly communicates the current boundary of knowledge.

---

# 30. Confidence-Decreased State

When new evidence weakens a previously stronger synthesis:

## Status

> Understanding changed

## Message

> New evidence reduced confidence in the current explanation.

## Show

* prior synthesis;
* current synthesis;
* confidence movement;
* contradiction;
* what Discovery now needs to learn.

## Tone

Calm and constructive.

Do not frame the change as a correction failure.

---

# 31. Stable Understanding State

A future Understanding may remain unchanged after new evidence.

## Message

> The Understanding remains stable.

## Explanation

> New evidence was consistent with the current synthesis but did not materially increase confidence or reduce the largest unknown.

## Rule

Stability is meaningful only when explained.

Do not create meaningless “no change” updates.

---

# 32. Visual Treatment

## 32.1 Overall character

The scene should feel:

* calm;
* authoritative;
* unfinished in a productive way;
* clear;
* human-readable;
* historically alive.

## 32.2 Hero area

The title, status, and synthesis should occupy one continuous region.

Avoid placing the synthesis inside a conventional analytics card.

## 32.3 Supporting regions

Use whitespace and restrained dividers before adding containers.

Unknowns and contradictions may use subtle surfaces because they represent distinct interpretive responsibilities.

## 32.4 Density

The first viewport should contain:

* title;
* status;
* synthesis;
* confidence;
* why it matters;
* primary actions.

It should not contain the entire evidence structure.

---

# 33. Typography Roles

## Understanding title

Strong heading, but smaller than the Scene One question.

Suggested desktop range:

```text
34–44 px
```

## Status label

Small body or label.

## Current synthesis

Large body or compact display.

Suggested desktop range:

```text
28–36 px
Line height: 1.25–1.4
```

Suggested mobile range:

```text
23–29 px
```

## Section headings

Small emphasized headings.

## Supporting body

Readable body text.

## Confidence

Medium emphasis, not oversized metric typography.

---

# 34. Color Semantics

Scene Five may use semantic treatment for:

* confidence;
* unknown;
* contradiction;
* relationship strength;
* meaningful change.

Color must always be paired with text.

## Confidence

Avoid treating high confidence as success and low confidence as failure.

## Contradiction

Use a distinct neutral or cautionary semantic treatment, not an error state.

## Unknown

Use a calm exploratory treatment.

## Relationship

Strength may be expressed through labels and restrained visual weight.

---

# 35. Motion Specification

## 35.1 Scene arrival

The synthesis should remain stable from Scene Four.

Supporting elements may appear through short fades or gentle settling.

Suggested duration:

```text
250–450 ms
```

## 35.2 Expansion

Use restrained inline expansion.

Do not shift the user unexpectedly to separate pages for small disclosures.

## 35.3 Follow action

A short state transition is sufficient.

No celebratory animation.

## 35.4 Relationship interaction

A selected relationship may reveal additional context through a subtle expansion.

Do not animate a network graph.

## 35.5 Reduced motion

Use direct state changes or short opacity transitions.

The Understanding must remain fully comprehensible without motion.

---

# 36. Copy Principles

Scene Five copy should be:

* concise;
* qualified;
* causal only where supported;
* executive-readable;
* honest about uncertainty;
* clear about organizational consequence.

## Preferred language

* currently;
* appears;
* strongest explanation;
* meaningful contradiction;
* remains uncertain;
* connected;
* changed;
* current synthesis;
* why this matters;
* what would improve this Understanding.

## Avoid

* root cause;
* definitive;
* final answer;
* proven;
* solved;
* completed;
* insight score;
* intelligence score;
* organizational health score;
* AI-generated conclusion.

---

# 37. Error and Failure States

## 37.1 Understanding unavailable

Message:

> Discovery couldn’t present a consistent Understanding from the current learning state.

Supporting copy:

> The approved evidence and learning history remain preserved.

Actions:

* Try again
* Review learning history
* Return to learning plan

## 37.2 Supporting overview unavailable

The synthesis may still appear.

Message:

> Some supporting details are temporarily unavailable.

Do not hide the entire Understanding if the primary synthesis remains valid.

## 37.3 Relationship unavailable

Omit the relationship section or show:

> Connected Understandings are not available yet.

Do not render an empty graph.

## 37.4 Historical comparison unavailable

Message:

> Discovery could not load the previous Understanding state.

The current synthesis remains visible.

---

# 38. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* clearly labeled sections;
* a descriptive status label;
* semantic lists for relationships and supporting overview;
* accessible disclosure controls.

## Confidence

Screen-reader copy should include the explanation:

> Discovery has moderate confidence because multiple source categories support the pattern, but causal direction and a meaningful contradiction remain unresolved.

## Contradiction

The contradiction must be programmatically labeled as a meaningful contradiction, not merely styled differently.

## Actions

Action labels must remain descriptive outside visual context.

Use:

* Examine this Understanding
* Follow this Understanding
* Investigate the largest remaining unknown

Avoid generic labels such as:

* View
* Open
* Learn more

## Focus after transition

Move focus to the Understanding title or current synthesis heading.

Do not automatically move focus into confidence or actions.

---

# 39. Component Hierarchy

```text
UnderstandScene
├── ExperienceFrame
├── UnderstandingHeader
│   ├── UnderstandingName
│   ├── LivingUnderstandingStatus
│   ├── FollowStatus
│   └── LastMeaningfulChange
├── CurrentSynthesis
│   ├── SynthesisText
│   └── ConciseInterpretation
├── ConfidenceSummary
│   ├── ConfidenceLevel
│   ├── ConfidenceValue
│   ├── ConfidenceExplanation
│   └── WhyConfidenceAction
├── UnderstandingImportance
├── StrongestExplanation
├── PrimaryUnknown
│   ├── UnknownText
│   ├── UnknownImportance
│   └── InvestigateUnknownAction
├── MeaningfulContradiction
│   ├── ContradictionText
│   ├── ContradictionInterpretation
│   └── ExamineContradictionAction
├── MeaningfulChangeSummary
│   ├── PreviousOrientation
│   ├── CurrentOrientation
│   ├── WeakenedExplanation
│   └── LearningHistoryAction
├── ConnectedUnderstandings
│   └── UnderstandingRelationship[]
├── SupportingOverview
└── UnderstandingActions
    ├── ExamineUnderstandingAction
    ├── FollowUnderstandingAction
    └── ChallengeUnderstandingAction
```

---

# 40. Experience State Contract

```ts
type UnderstandingLifecycleStatus =
  | "early-orientation"
  | "learning"
  | "first-synthesis"
  | "growing"
  | "stable"
  | "changed"
  | "uncertain";

type RelationshipStrength =
  | "emerging"
  | "meaningful"
  | "strong";

interface UnderstandingRelationshipViewModel {
  id: string;
  name: string;
  strength: RelationshipStrength;
  explanation: string;
  targetUnderstandingId: string | null;
}

interface UnderstandingContradictionViewModel {
  id: string;
  summary: string;
  interpretation: string;
  whyItMatters: string;
  status: "open" | "partially-explained" | "resolved";
}

interface UnderstandingHistorySummary {
  previousSynthesis: string;
  currentSynthesis: string;
  confidenceBefore: string;
  confidenceAfter: string;
  strengthenedExplanation: string;
  weakenedExplanation: string;
  newUnknown: string;
  changedAt: string;
}

interface LivingUnderstandingViewModel {
  id: string;
  name: string;
  status: UnderstandingLifecycleStatus;
  statusLabel: string;
  originalQuestion: string;
  objective: string;
  synthesis: string;
  conciseInterpretation: string | null;
  confidenceLevel:
    | "low"
    | "low-moderate"
    | "moderate"
    | "moderate-high"
    | "high";
  confidenceValue: number | null;
  confidenceExplanation: string;
  whyItMatters: string;
  strongestExplanation: string;
  strongestExplanationSupport: string;
  weakenedExplanation: string | null;
  primaryUnknown: string;
  primaryUnknownWhyItMatters: string;
  contradictions: UnderstandingContradictionViewModel[];
  relationships: UnderstandingRelationshipViewModel[];
  supportingObservationCount: number;
  connectedConditionCount: number;
  unresolvedAlternativeCount: number;
  approvedSourceCount: number;
  historySummary: UnderstandingHistorySummary;
  isFollowed: boolean;
  createdAt: string;
  lastMeaningfulChangeAt: string;
}
```

## Scene state

```ts
interface UnderstandSceneState {
  status:
    | "ready"
    | "updating-follow-state"
    | "opening-disclosure"
    | "failed";
  understanding: LivingUnderstandingViewModel | null;
  expandedSections: string[];
  error: string | null;
}
```

## Emitted intents

```ts
interface ExamineUnderstandingIntent {
  understandingId: string;
  initiatedAt: string;
}

interface FollowUnderstandingIntent {
  understandingId: string;
  notificationPreference: "meaningful-changes";
  followedAt: string;
}

interface InvestigateUnknownIntent {
  understandingId: string;
  unknown: string;
  initiatedAt: string;
}
```

These remain experience-layer contracts.

---

# 41. Canonical Alpha View Model

```ts
const engineeringProductivityUnderstanding: LivingUnderstandingViewModel = {
  id: "engineering-productivity",
  name: "Engineering Productivity",
  status: "first-synthesis",
  statusLabel: "Living Understanding",
  originalQuestion: "Why has engineering productivity slowed?",
  objective:
    "Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.",
  synthesis:
    "Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.",
  conciseInterpretation:
    "Teams appear busy, but delivery slows when important decisions no longer have clear ownership after work begins.",
  confidenceLevel: "moderate",
  confidenceValue: 74,
  confidenceExplanation:
    "Multiple source categories support the same pattern, but causal direction and one meaningful contradiction remain unresolved.",
  whyItMatters:
    "Teams may spend substantial time resolving ownership and escalation questions after delivery has begun. That creates delay and rework without necessarily appearing as reduced activity.",
  strongestExplanation: "Post-planning ownership ambiguity",
  strongestExplanationSupport:
    "Work is more likely to delay when teams must clarify ownership or decision authority after commitment.",
  weakenedExplanation: "Formal priority instability",
  primaryUnknown:
    "Why one Engineering team delivers reliably despite using a similar ownership structure.",
  primaryUnknownWhyItMatters:
    "The difference may reveal whether leadership behavior, team practices, or local decision norms moderate the broader constraint.",
  contradictions: [
    {
      id: "reliable-team-under-similar-structure",
      summary:
        "One comparable Engineering team delivers reliably under apparently similar formal ownership conditions.",
      interpretation:
        "Formal structure alone may not explain the outcome.",
      whyItMatters:
        "The contradiction prevents Discovery from treating ownership ambiguity as a complete causal explanation.",
      status: "open",
    },
    {
      id: "formal-versus-reported-priority-change",
      summary:
        "Team accounts describe shifting priorities while formal plans remain comparatively stable.",
      interpretation:
        "Informal reprioritization may occur outside published planning records.",
      whyItMatters:
        "Formal planning evidence may understate how priorities change during delivery.",
      status: "open",
    },
  ],
  relationships: [
    {
      id: "decision-ownership",
      name: "Decision Ownership",
      strength: "meaningful",
      explanation:
        "Delivery slows more often when ownership or decision authority becomes unclear after commitment.",
      targetUnderstandingId: "decision-ownership",
    },
    {
      id: "cross-functional-coordination",
      name: "Cross-functional Coordination",
      strength: "emerging",
      explanation:
        "Clarification behavior is concentrated where work crosses Product, Design, and Engineering boundaries.",
      targetUnderstandingId: null,
    },
  ],
  supportingObservationCount: 31,
  connectedConditionCount: 3,
  unresolvedAlternativeCount: 2,
  approvedSourceCount: 4,
  historySummary: {
    previousSynthesis:
      "Discovery could not distinguish among planning, ownership, coordination, and execution constraints.",
    currentSynthesis:
      "Ownership ambiguity after commitment is the strongest current explanation.",
    confidenceBefore: "Low",
    confidenceAfter: "Moderate",
    strengthenedExplanation: "Post-planning ownership ambiguity",
    weakenedExplanation: "Formal priority instability",
    newUnknown:
      "Why one team delivers reliably despite a similar ownership structure.",
    changedAt: "2026-07-23T19:30:00.000Z",
  },
  isFollowed: false,
  createdAt: "2026-07-23T19:00:00.000Z",
  lastMeaningfulChangeAt: "2026-07-23T19:30:00.000Z",
};
```

---

# 42. Determinism Requirements

For the canonical Alpha Understanding:

* the synthesis remains fixed;
* confidence remains Moderate and 74%;
* strongest and weakened explanations remain fixed;
* contradictions remain fixed and ordered by importance;
* relationships remain fixed and ordered by strength;
* supporting counts remain fixed;
* history comparison remains fixed;
* following does not alter the synthesis;
* refreshing preserves the current prototype state;
* returning from Scene Six restores disclosure state where appropriate;
* internal data ordering does not alter visible priority;
* the Scene Five model matches the final Scene Four snapshot exactly.

---

# 43. Product Analytics

Suggested events:

```text
understanding_viewed
understanding_confidence_expanded
understanding_unknown_selected
understanding_contradiction_selected
understanding_relationship_selected
understanding_history_opened
understanding_examine_selected
understanding_follow_selected
understanding_challenge_selected
```

Suggested properties:

* understanding identifier;
* lifecycle status;
* confidence level;
* contradiction count;
* relationship count;
* whether followed;
* time to first action;
* primary action selected;
* sections expanded.

Do not record raw evidence or private source content.

---

# 44. Quality Checks

Confirm:

1. The synthesis is visible without scrolling on the primary desktop viewport.
2. The user can explain the synthesis after less than one minute.
3. The Understanding is labeled as living.
4. Confidence is qualitative first.
5. Confidence has an explanation.
6. The strongest explanation is visible.
7. A weakened explanation remains accessible.
8. The largest unknown is specific.
9. The contradiction is preserved.
10. The contradiction does not appear as an error.
11. Why this matters is clear.
12. Association is not represented as proven causation.
13. The history of change is accessible.
14. Relationships are present but restrained.
15. Counts remain secondary.
16. Examine is the primary action.
17. Follow is available.
18. Challenge is available.
19. No recommendation is presented as inevitable.
20. No dashboard layout appears.
21. No implementation mechanics appear.
22. Mobile hierarchy preserves the synthesis.
23. Keyboard-only navigation works.
24. Reduced motion preserves the transition.
25. The model matches Scene Four exactly.
26. A no-strong-synthesis state exists.
27. A confidence-decrease state exists.
28. A stable state exists.
29. Failure states preserve current meaning.
30. The Understanding feels persistent rather than generated.

---

# 45. Acceptance Criteria

## Functional

* Scene Five receives the canonical final learning snapshot.
* The Understanding name and status are displayed.
* The current synthesis is displayed.
* Confidence and its explanation are displayed.
* Why this matters is displayed.
* The strongest explanation is displayed.
* The largest unknown is displayed.
* At least one contradiction is displayed.
* Meaningful historical change is available.
* Relationships are available.
* Supporting counts are available secondarily.
* The user can advance to Scene Six.
* The user can follow the Understanding.
* The user can investigate the largest unknown.
* The user can begin a challenge path.
* Follow state updates deterministically.
* Browser navigation preserves the scene.
* Failure states preserve the most recent valid Understanding.

## Visual

* The synthesis is the strongest element.
* The page does not open with metrics.
* Confidence is restrained.
* Unknowns and contradictions are visually distinct without alarm treatment.
* Supporting sections use progressive disclosure.
* The layout does not resemble a dashboard.
* The page remains calm and readable.
* Mobile layouts preserve the primary meaning.
* Motion communicates stabilization rather than completion.
* The follow state is quiet and persistent.

## Product

* The user understands the strongest current explanation.
* The user understands why it matters.
* The user understands why confidence is only moderate.
* The user understands what remains unknown.
* The user recognizes that contradictory evidence remains.
* The user can see how the Understanding changed.
* The user understands that the Understanding may continue evolving.
* The user is interested in examining the reasoning.
* The user sees value in following the Understanding.

---

# 46. Prototype Review Script

A reviewer should complete the following:

1. Enter Scene Five from the final Scene Four state.
2. Read only the first viewport.
3. Explain the current Understanding in their own words.
4. Identify the confidence level.
5. Explain why confidence is not high.
6. Identify the strongest explanation.
7. Identify the largest unknown.
8. Identify the meaningful contradiction.
9. Explain why the contradiction matters.
10. Open What Changed.
11. Compare the initial and current orientation.
12. Open the Decision Ownership relationship.
13. Return to the main view.
14. Select Follow this Understanding.
15. Confirm the quiet followed state.
16. Select Examine this Understanding.
17. Confirm transition to Scene Six.
18. Navigate back.
19. Confirm the followed state remains.
20. Repeat with the no-strong-synthesis state.
21. Repeat with confidence decreased.
22. Repeat using only a keyboard.
23. Repeat with reduced motion.
24. Repeat at mobile width.

If the reviewer interprets Moderate confidence as a 74% probability that ownership ambiguity caused the slowdown, the confidence presentation requires revision.

---

# 47. Open Decisions

The following should be resolved through high-fidelity design and product testing:

1. Whether the concise interpretation appears by default.
2. Whether the numeric confidence value appears at all.
3. Whether confidence and largest unknown appear side by side on desktop.
4. Whether What Changed appears before or after the contradiction.
5. Whether the first contradiction is visible by default.
6. Whether both contradictions appear or only the most important one.
7. Whether relationships appear in the first view or lower on the page.
8. Whether Follow is available before examination.
9. Whether Examine should remain the only primary action.
10. Whether “Living Understanding” is a label, subtitle, or lifecycle state.
11. Whether the strongest explanation needs a separate section when it is already clear from the synthesis.
12. Whether the original question remains visible by default.
13. Whether evidence counts add trust or unnecessary density.
14. Whether the page should show the time of the last meaningful change.
15. Whether the largest unknown should use a visually distinct surface.
16. Whether historical change opens inline or on a dedicated view.
17. Whether a relationship can begin a new Understanding directly.
18. Whether users can rename an Understanding.
19. Whether the user may mark the synthesis as useful before examining it.
20. Whether follow preferences should appear immediately or after the follow action.

Codex must not independently resolve these decisions.

---

# 48. Codex Implementation Boundary

Codex may implement:

* the canonical Living Understanding view;
* responsive hierarchy;
* progressive disclosures;
* confidence explanation;
* contradiction presentation;
* relationship presentation;
* history summary;
* follow-state interaction;
* challenge entry;
* transition to Scene Six;
* no-strong-synthesis state;
* confidence-decrease state;
* stable state;
* accessibility;
* deterministic tests.

Codex must not:

* create a new technical Understanding object;
* modify Runtime;
* modify cognition;
* modify Governance;
* generate live synthesis;
* calculate production confidence;
* create causal claims;
* add recommendations not present in the view model;
* expose raw private evidence;
* create a dashboard;
* add graph visualization;
* redesign the canonical hierarchy;
* make the Understanding appear complete;
* imply autonomous background learning is live;
* invent additional organizational findings.

---

# 49. Definition of Done

Scene Five is complete when:

* the first Living Understanding is clear in under one minute;
* the synthesis is concise and qualified;
* confidence is understandable;
* organizational consequence is clear;
* the strongest explanation is visible;
* uncertainty remains specific;
* contradictions remain meaningful;
* historical change is traceable;
* relationships appear without overwhelming the page;
* the user can examine, follow, investigate, or challenge;
* the page feels alive without appearing unstable;
* no production architecture changes;
* Scene Six receives a coherent and inspectable Understanding.

The final review question is:

> Can the user understand what Discovery currently believes, why it matters, and why Discovery could still be wrong—without reading a report?

Only an unambiguous yes is acceptable.
