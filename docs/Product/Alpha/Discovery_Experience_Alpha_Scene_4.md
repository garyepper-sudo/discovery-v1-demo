# Discovery Experience Alpha

# Scene Four Specification — Learn

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Clarity
**Implemented Alpha route:** `/alpha/learn`
**Previous scene:** Plan
**Next scene:** Understand
**Primary objective:** Show Discovery’s Understanding changing through specific, traceable learning events.
**Core trust requirement:** The interface must communicate meaningful model change, not decorate a waiting period.

This document preserves detailed Alpha design intent. The implemented learning
events and model changes are deterministic fixture simulation, not live
ingestion, cognition, background processing, persistence, or Runtime evolution.

---

# 1. Scene Purpose

Scene Four helps the user answer:

> What is Discovery learning, and how is that changing the Understanding?

The user has approved a bounded learning plan.

Discovery must now demonstrate progress in a way that is:

* meaningful;
* honest;
* traceable;
* calm;
* comprehensible;
* connected to the approved objective.

This scene must not become a theatrical representation of artificial intelligence.

It should not attempt to impress the user with:

* speed;
* volume;
* technical complexity;
* animated processing;
* arbitrary counts;
* model-like internal narration.

Instead, it should show how the Understanding changes as evidence is considered.

The scene succeeds when the user can explain:

* what Discovery examined;
* what it learned;
* what changed;
* what remains uncertain;
* why the first Understanding is now ready.

---

# 2. Primary User Outcome

The user watches the Understanding evolve from an early orientation into a useful initial synthesis.

The user should leave the scene believing:

* Discovery followed the approved learning plan;
* each visible event changed the Understanding in a specific way;
* some explanations became more plausible;
* some explanations became less plausible;
* contradictions were preserved;
* confidence changed for explainable reasons;
* Discovery did not simply wait and reveal a prewritten answer.

---

# 3. Primary Discovery Outcome

Discovery produces the first presentable state of the Living Understanding.

The deterministic Alpha sequence should establish:

* an initial hypothesis set;
* evidence-bearing learning events;
* confidence movement;
* one strengthened explanation;
* one weakened explanation;
* one preserved contradiction;
* one emerging relationship;
* one specific remaining unknown;
* readiness for the first Understanding synthesis.

This remains a mocked experience projection.

It is not a production cognition pipeline, ingestion process, or retrieval runtime.

---

# 4. Emotional Objective

The emotional transition is:

```text
Permission to proceed

↓

Visible progress

↓

Recognition of change

↓

Clarity
```

The user should think:

> I can see how Discovery reached this understanding.

The user should not think:

* Discovery is performing magic;
* the interface is fabricating activity;
* every event raises confidence;
* uncertainty is disappearing automatically;
* the system has reached a final answer.

---

# 5. Canonical Alpha Context

## Understanding

> Engineering Productivity

## Original question

> Why has engineering productivity slowed?

## Approved objective

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

## Approved information

* Sprint retrospectives
* Project and issue history
* Selected team conversations
* Product planning documents

## Current confidence at scene start

> Low

## Most important unknown at scene start

> Where planned work begins to lose momentum after commitment.

---

# 6. Primary Scene Message

## Initial headline

> Discovery is building the first useful Understanding.

## Supporting copy

> As evidence is considered, you’ll see which explanations strengthen, weaken, or remain uncertain.

This language communicates:

* active learning;
* temporary incompleteness;
* model revision;
* evidence-based change.

Do not use:

* Processing your data
* Running analysis
* AI is thinking
* Building your model
* Generating insights
* Training Discovery
* This may take a few minutes
* Sit tight
* Almost done

---

# 7. Page Structure

Scene Four contains seven primary regions:

```text
Application frame

Understanding context

Current learning state

Learning-event sequence

Understanding change summary

Remaining uncertainty

Ready-state transition
```

The learning-event sequence is the center of the scene.

The page should not resemble:

* a system log;
* a terminal;
* a task queue;
* a generic loading screen;
* a data-pipeline monitor;
* an analytics dashboard.

---

# 8. Experience Modes

Scene Four has four modes:

```text
Preparing

Learning

Paused for review

First Understanding ready
```

## 8.1 Preparing

A brief state after the learning plan is approved.

Purpose:

* acknowledge the approved scope;
* initialize the deterministic sequence;
* establish the starting Understanding state.

## 8.2 Learning

The default active state.

Learning events appear sequentially, each with a visible effect on the Understanding.

## 8.3 Paused for review

The user may pause progression to inspect an event.

The experience should not continue advancing while the user is reading expanded content.

## 8.4 First Understanding ready

The sequence stabilizes and transitions toward Scene Five.

---

# 9. Transition from Scene Three

## 9.1 Preserved plan context

The approved plan briefly appears as a restrained summary:

> Beginning with four approved information sources.

The summary should not remain prominent after learning begins.

## 9.2 Transition sequence

Recommended sequence:

1. The Start Learning action enters a preparing state.
2. Source recommendations recede.
3. The Understanding objective remains visible.
4. The starting confidence and primary unknown appear.
5. The first learning event begins.
6. The approved-plan summary collapses into a quiet disclosure.

## 9.3 Transitional copy

> Beginning with the approved information…

Then:

> Looking for where planned work begins to lose momentum.

The second statement ties the learning sequence to the approved unknown.

---

# 10. Desktop Layout

## 10.1 Main container

Recommended maximum width:

```text
1080–1160 px
```

## 10.2 Primary composition

A wide-screen layout may use two coordinated regions:

```text
Learning sequence                  Understanding now
                                   Confidence
                                   Current leading explanation
                                   Largest unknown
```

The learning sequence should occupy more space.

Recommended proportions:

```text
Learning sequence: 60–68%
Understanding state: 32–40%
```

## 10.3 Alternative single-column composition

A single column may be preferable if the side summary feels dashboard-like.

Recommended order:

```text
Understanding context

Current Understanding state

Active learning event

Previous events

Remaining unknown

Ready transition
```

The final high-fidelity design should select the composition that best preserves one clear narrative.

---

# 11. Tablet and Mobile Layout

## 11.1 Tablet

* use one primary column;
* place the current Understanding summary above the learning sequence;
* keep only the active event fully expanded;
* collapse completed events;
* preserve clear event order;
* avoid side-by-side comparison panels.

## 11.2 Mobile

* show the current event first;
* keep confidence and unknowns in a compact summary;
* place completed events below as an ordered timeline;
* ensure the user can pause and expand events;
* keep any continue action outside the keyboard and browser-control regions;
* avoid automatic scroll that removes context.

## 11.3 Reading priority

On constrained screens:

1. What Discovery is examining now
2. What it learned
3. What changed in the Understanding
4. Current confidence
5. Remaining unknown
6. Earlier events
7. Source detail

---

# 12. Starting Understanding State

Before the first event, show the initial state.

## Current synthesis

> Discovery does not yet have enough evidence to distinguish among planning, ownership, coordination, and execution constraints.

## Confidence

> Low

## Leading explanations

At the starting point, the following may be presented as unranked possibilities:

* priorities change after planning;
* work loses momentum during execution;
* ownership becomes unclear;
* cross-functional dependencies delay progress;
* formal activity obscures delivery friction.

## Largest unknown

> Where planned work begins to lose momentum after commitment.

## Rule

Do not present a leading conclusion before the first evidence-bearing event.

---

# 13. Learning Event Model

Each event must contain:

1. activity;
2. evidence scope;
3. finding;
4. effect on the Understanding;
5. confidence effect;
6. uncertainty effect;
7. source attribution;
8. review state.

No event should appear solely as:

> Reading document 17 of 42.

Volume may appear secondarily, but it is not the learning event.

---

# 14. Canonical Learning Sequence

The Alpha sequence contains four primary learning events and one synthesis event.

```text
Event 1 — Execution timing

Event 2 — Ownership movement

Event 3 — Priority stability contradiction

Event 4 — Clarification behavior

Event 5 — Initial synthesis
```

The sequence must be deterministic.

---

# 15. Event One — Execution Timing

## Activity

> Reviewing sprint retrospectives

## Evidence scope

> Engineering retrospectives from the last six months

## Finding

> Delivery concerns appear most often after teams have committed to work, rather than during initial planning.

## Effect on the Understanding

> The explanation shifts away from planning quality alone and toward constraints arising during execution.

## Confidence effect

> Slight increase

Canonical movement:

```text
Low → Low to moderate
```

## Unknown reduced

> Whether the primary friction begins before or after commitment

## New unknown

> What changes after commitment that causes delivery to lose momentum?

## Source limitation

> Retrospectives reflect participant interpretation and may omit normalized or sensitive issues.

## Event label

> Execution appears to be the more important period.

This may appear as the concise timeline headline.

---

# 16. Event Two — Ownership Movement

## Activity

> Comparing project and issue history

## Evidence scope

> Delayed and reliably delivered Engineering initiatives from the last two quarters

## Finding

> Delayed work changes ownership or waits for ownership clarification more often than work delivered reliably.

## Effect on the Understanding

> Decision ownership becomes a stronger candidate explanation for delivery friction.

## Relationship created

> Engineering Productivity ↔ Decision Ownership

Relationship state:

> Emerging

## Confidence effect

> Moderate increase

Canonical movement:

```text
Low to moderate → Moderate
```

## Unknown reduced

> Whether delayed work differs structurally from reliably delivered work

## Remaining uncertainty

> Ownership movement may be a consequence of delay rather than its cause.

## Event label

> Ownership instability is associated with delayed delivery.

The word **associated** is important.

Do not claim causation.

---

# 17. Event Three — Priority Stability Contradiction

## Activity

> Examining product planning documents

## Evidence scope

> Current and previous-quarter plans affecting Engineering commitments

## Finding

> Priorities remain more stable after planning than the initial orientation expected.

## Effect on the Understanding

> The hypothesis that frequent reprioritization is the primary cause becomes less plausible.

## Contradiction

> Some team accounts describe shifting priorities, while formal plans show relatively stable commitments.

## Confidence effect

The confidence in the overall Understanding may increase slightly because one explanation has been weakened.

However, confidence in the initial priority-instability hypothesis must decrease.

Canonical presentation:

```text
Overall Understanding confidence: remains Moderate

Priority-instability explanation: weakened
```

## New unknown

> Whether informal priority changes occur without appearing in formal plans.

## Event label

> Formal priority instability is less likely to be the primary constraint.

## Rule

This event is essential because it proves that learning does not always strengthen the leading explanation.

---

# 18. Event Four — Clarification Behavior

## Activity

> Connecting selected team conversations to delivery history

## Evidence scope

> Approved project channels connected to selected delayed initiatives

## Finding

> Teams repeatedly seek decision clarification after work begins, especially when dependencies cross Product, Design, and Engineering boundaries.

## Effect on the Understanding

> Ownership ambiguity strengthens as the leading explanation.

## Relationship strengthened

> Engineering Productivity ↔ Decision Ownership

Relationship state:

```text
Emerging → Meaningful
```

## Additional relationship created

> Engineering Productivity ↔ Cross-functional Coordination

Relationship state:

> Emerging

## Confidence effect

Canonical movement:

```text
Moderate → Moderate, approaching moderately high
```

Use qualitative language rather than an animated pseudo-precise score.

## Unknown reduced

> Why ownership changes or work pauses after commitment

## Remaining uncertainty

> Whether the ambiguity originates in formal structure, governance practices, or leadership behavior.

## Event label

> Decision clarification repeatedly occurs after delivery begins.

---

# 19. Event Five — Initial Synthesis

## Activity

> Integrating the strongest and contradicting evidence

## Finding

> Planning itself appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after commitment, when ownership and decision authority become unclear across dependencies.

## Effect on the Understanding

The first useful synthesis becomes available.

## Confidence

> Moderate

Optional secondary representation:

> 74%

The qualitative level remains primary.

## Strongest explanation

> Post-planning ownership ambiguity

## Weakened explanation

> Formal priority instability

## Preserved contradiction

> One team delivers reliably despite using a similar ownership structure.

## Largest remaining unknown

> Whether leadership behavior or local team practices explain the difference.

## Event label

> The first useful Understanding is ready.

---

# 20. Event Presentation

## 20.1 Active event

The active event should show:

* current activity;
* source category;
* concise finding;
* effect on Understanding;
* confidence or uncertainty movement;
* optional detail action.

## 20.2 Completed event

Completed events collapse into a readable history.

Each should retain:

* event headline;
* finding;
* timestamp or sequence position;
* change type;
* expand action.

## 20.3 Future event

Do not reveal the content of upcoming events.

A future state may show only:

> Continuing with the approved learning plan.

Avoid previewing conclusions.

## 20.4 Event numbering

Visible numbering is optional.

If used, frame it as sequence rather than process completion:

* First change
* Next change
* New contradiction

Avoid:

* Step 1 of 5
* 40% complete

The sequence is about understanding, not task completion.

---

# 21. Current Understanding Summary

A quiet summary should update after each event.

It may include:

## Current confidence

Qualitative level.

## Current leading explanation

One concise sentence.

## Most important unknown

One concise sentence.

## Meaningful changes

* explanation strengthened;
* explanation weakened;
* contradiction added;
* relationship created;
* uncertainty reduced.

## Rule

Do not show more than one leading explanation in the compact summary.

Alternatives may appear through progressive disclosure.

---

# 22. Confidence Behavior

Confidence must never behave like a progress bar.

## Allowed behavior

Confidence may:

* increase;
* decrease;
* remain unchanged;
* become more qualified;
* split across competing explanations.

## Canonical sequence

```text
Start: Low

After Event One: Low to moderate

After Event Two: Moderate

After Event Three: Moderate

After Event Four: Moderate, approaching moderately high

Final presented state: Moderate
```

The final value remains moderate because:

* evidence supports ownership ambiguity;
* causal direction is not fully established;
* a meaningful contradiction remains;
* alternative structural explanations remain unresolved.

## Required explanation

At any point, the user may ask:

> Why did confidence change?

Discovery should answer using the relevant event effects.

---

# 23. Unknown Behavior

Unknowns should visibly change.

The Alpha sequence should demonstrate three forms of unknown movement:

## Unknown resolved enough to retire

> Whether friction begins before or after commitment

Status:

> Narrowed sufficiently

## Unknown transformed

> Where work loses momentum

becomes:

> Why decision ownership becomes unclear after commitment

## New unknown created

> Why one team delivers reliably despite a similar ownership structure

## Rule

Learning should sometimes create better questions rather than only remove uncertainty.

---

# 24. Contradiction Behavior

Contradictions must appear as valuable model inputs.

## Canonical contradiction

> One Engineering team delivers reliably despite using a similar ownership structure.

## Presentation

**New contradiction**

> A comparable team performs better under apparently similar formal conditions.

**Why it matters**

> Ownership structure alone may not explain the outcome. Leadership behavior, local norms, or decision practices may moderate the constraint.

## Actions

* Examine contradiction
* Keep learning
* Add context

## Rule

Do not present contradictions as errors, warnings, or failures.

---

# 25. Relationship Behavior

Relationships should emerge only when supported by the sequence.

## Relationship One

> Engineering Productivity ↔ Decision Ownership

Progression:

```text
Not established

↓

Emerging

↓

Meaningful
```

## Relationship Two

> Engineering Productivity ↔ Cross-functional Coordination

Progression:

```text
Not established

↓

Emerging
```

## Presentation

Relationships may appear as concise text or a restrained relationship strip.

Avoid building a full graph visualization in Experience Alpha.

Example:

> Decision Ownership is now meaningfully connected to this Understanding.

---

# 26. User Controls

Scene Four should provide limited but meaningful control.

## Pause

> Pause learning

The sequence stops advancing.

Use only if the sequence auto-advances.

## Continue

> Continue learning

Resumes progression.

## Examine change

Opens expanded event detail.

## Skip animation

> Show current Understanding

Allows users to move directly to the ready state.

This is especially important for repeated demonstrations and users who do not want to watch the sequence.

## Review approved plan

Available through secondary disclosure.

## Stop learning

Not required for the first mocked Alpha unless the sequence represents real long-running behavior.

---

# 27. Timing Model

The Alpha sequence should feel deliberate but not slow.

Recommended deterministic pacing:

## Preparing state

```text
500–900 ms
```

## Event introduction

```text
400–700 ms
```

## Event reading interval

```text
3–6 seconds
```

depending on content length.

## Transition between events

```text
250–450 ms
```

## Total unattended sequence

Target:

```text
20–35 seconds
```

The user must be able to:

* pause;
* expand;
* skip to the current Understanding.

Do not force the user to wait longer for theatrical effect.

---

# 28. Auto-Advance Rules

## Default desktop behavior

The sequence may auto-advance when:

* the user has not interacted with the current event;
* the event has remained visible for a minimum readable interval;
* the page remains active;
* reduced-motion settings do not prohibit the transition.

## Pause conditions

Auto-advance pauses when:

* the user expands an event;
* keyboard focus enters event controls;
* the browser tab becomes inactive;
* the user selects Pause;
* assistive technology interaction indicates review;
* the page loses visibility.

## Mobile recommendation

Manual advancement may be preferable on small screens.

Final behavior should be validated with users.

---

# 29. Progress Communication

Do not use a conventional percentage progress bar.

Allowed indicators:

* approved sources considered;
* meaningful changes discovered;
* uncertainties narrowed;
* current learning activity;
* event history.

Example quiet summary:

> 3 meaningful changes · 1 contradiction · 2 relationships emerging

This should appear only after those changes exist.

Do not show empty counts at scene start.

---

# 30. Source Attribution

Every event must indicate its evidence category.

Example:

> Based on sprint retrospectives from the last six months

or:

> Supported by project history and selected team conversations

Source attribution should remain concise.

Detailed source references belong behind progressive disclosure.

## Rule

The active event must never appear detached from evidence.

---

# 31. Expanded Event Detail

An expanded event may show:

* source scope;
* evidence summary;
* strongest observations;
* interpretation;
* alternative explanation;
* confidence effect;
* uncertainty effect;
* limitation;
* timestamp or sequence point.

## Example expanded detail

**Evidence reviewed**

> 12 Engineering retrospectives across four teams

**Recurring observation**

> Ownership and escalation concerns appeared in 9 of 12 retrospectives after sprint commitment.

**Interpretation**

> Execution friction is more consistently documented than planning instability.

**Limitation**

> Retrospectives reflect team perception and may not establish causality.

## Alpha rule

Do not expose raw private conversation content in the default experience.

Use prepared summaries.

---

# 32. Before-and-After Change

The user should be able to inspect a concise comparison.

## Before

> Discovery could not distinguish among planning, ownership, coordination, and execution constraints.

## After

> Ownership ambiguity after commitment is now the strongest explanation, while formal priority instability is less likely.

## What remains unresolved

> Why similar teams perform differently under apparently similar ownership structures.

This comparison becomes the transition anchor into Scene Five.

---

# 33. Ready State

When the deterministic sequence is complete:

## Primary message

> The first useful Understanding is ready.

## Supporting copy

> Discovery has enough evidence to present a current synthesis, explain why it believes it, and show what remains uncertain.

## Summary

* Confidence: Moderate
* Strongest explanation: Ownership ambiguity after commitment
* Weakened explanation: Formal priority instability
* New contradiction: One comparable team performs reliably
* Largest unknown: What moderates the constraint

## Primary action

> View the Understanding

## Secondary action

> Review how it changed

The ready state should not auto-advance immediately.

The user chooses when to enter Scene Five.

---

# 34. No Meaningful Finding State

The product must support the possibility that reviewed information does not produce a useful synthesis.

## Message

> Discovery has not found a reliable explanation yet.

## Supporting copy

> The approved information narrowed some possibilities, but no explanation is currently strong enough to present as the leading Understanding.

## Show

* what was ruled out;
* what remains uncertain;
* what information may help next;
* current confidence;
* whether the scope should change.

## Primary action

> Review the next learning opportunity

## Rule

Do not fabricate a conclusion to preserve momentum.

This state is required even if the canonical Alpha path does not use it.

---

# 35. Confidence-Decrease State

Learning may reduce confidence.

## Message

> New evidence weakened the current Understanding.

## Supporting explanation

> The newest evidence does not fit the leading explanation and increases uncertainty about where the constraint originates.

## Show

* previous confidence;
* current confidence;
* contradiction;
* affected explanation;
* next learning opportunity.

## Rule

Confidence decrease must feel like learning, not regression or product failure.

---

# 36. Insufficient-Evidence State

If the approved plan was too limited:

## Message

> Discovery can describe the pattern, but not yet explain it reliably.

## Example

> Work loses momentum after commitment, but the current information does not establish whether ownership ambiguity causes the delay or results from it.

## Actions

* View current pattern
* Expand learning plan
* Add context

---

# 37. Visual Treatment

## 37.1 Overall character

The scene should feel:

* alive;
* thoughtful;
* evidence-based;
* restrained;
* temporally coherent.

## 37.2 Timeline

A simple vertical sequence is preferred.

Each event may use:

* a small state marker;
* concise headline;
* body;
* change annotation;
* expandable detail.

Avoid:

* animated neural networks;
* pulsing nodes;
* fake terminal text;
* streaming token effects;
* typewriter animation;
* particle motion;
* rotating loaders as the primary experience.

## 37.3 Active state

The active event may receive:

* stronger text emphasis;
* a subtle surface;
* a restrained motion cue;
* an accessible “currently learning” label.

## 37.4 Completed state

Completed events remain legible and inspectable.

Do not fade them into near invisibility.

They form the historical trace.

---

# 38. Color Semantics

Scene Four introduces semantic change states.

Possible categories:

* strengthened;
* weakened;
* contradiction;
* uncertainty;
* relationship;
* neutral evidence.

Color may support these distinctions but must not carry them alone.

Every state also requires:

* text;
* label;
* icon or shape where appropriate;
* accessible description.

Avoid assigning “green” to every confidence increase.

A strengthened explanation is not necessarily good news.

---

# 39. Motion Specification

## 39.1 Meaningful motion only

Motion may communicate:

* a new event entering;
* an event becoming historical;
* confidence state changing;
* a relationship emerging;
* an unknown transforming;
* transition to readiness.

## 39.2 Confidence movement

Do not animate a number counting upward.

Preferred:

* label transition;
* short directional cue;
* changed explanation text.

## 39.3 Relationship movement

A relationship label may appear with a restrained fade.

Do not draw a complex animated graph.

## 39.4 Contradiction movement

A contradiction should appear clearly but calmly.

Avoid shaking, warning flashes, or alert-like motion.

## 39.5 Reduced motion

When reduced motion is enabled:

* events appear through direct replacement or brief opacity changes;
* auto-advance may remain, but without positional animation;
* users retain pause and skip controls;
* the historical order remains clear.

---

# 40. Copy Principles

Scene Four copy should describe:

* evidence activity;
* findings;
* model effects;
* uncertainty movement.

It should not anthropomorphize Discovery excessively.

## Preferred language

* reviewing;
* comparing;
* connecting;
* found;
* suggests;
* strengthens;
* weakens;
* remains uncertain;
* contradicts;
* is associated with;
* current explanation;
* first useful Understanding.

## Avoid

* I’m thinking deeply;
* I had an idea;
* Eureka;
* I solved it;
* I discovered the truth;
* AI analysis;
* model inference complete;
* cognition running;
* processing millions of tokens;
* scanning everything;
* confidence unlocked.

---

# 41. Error and Failure States

## 41.1 Event unavailable

Message:

> Discovery couldn’t complete this learning step.

Supporting copy:

> The previous Understanding state is unchanged.

Actions:

* Try again
* Continue without this source
* Review plan

## 41.2 Source unavailable

Message:

> One approved source could not be reviewed.

Show:

* affected source;
* expected consequence;
* updated confidence estimate;
* whether learning can continue.

## 41.3 Sequence interruption

Message:

> Learning paused before the first Understanding was ready.

Actions:

* Resume
* Review current Understanding
* Return to plan

## 41.4 Inconsistent mock state

Development-facing error handling should prevent contradictory UI states, such as:

* a weakened explanation marked as leading;
* a contradiction counted but not represented;
* confidence movement without an event;
* a relationship shown before creation.

User-facing message:

> Discovery couldn’t assemble a consistent Understanding from the current learning state.

Actions:

* Restart demonstration
* Return to plan

---

# 42. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* an ordered event list;
* clear headings for active and completed events;
* an `aria-live` region for concise learning updates;
* accessible pause, continue, and skip controls.

## Live announcements

Announce only meaningful changes.

Example:

> New finding: delayed work changes ownership more often. Understanding confidence is now moderate.

Do not announce decorative motion or every status update.

## Auto-advance

Users must be able to pause auto-advancing content.

Expanded content must halt automatic progression.

## Focus behavior

When an event auto-advances:

* do not move keyboard focus automatically;
* update the live region;
* preserve the user’s reading position.

When the user manually advances:

* focus may remain on the control or move to the new event heading based on testing.

## Timeline semantics

Completed events should remain available in an ordered list.

Current event status should be programmatically identifiable.

---

# 43. Component Hierarchy

```text
LearnScene
├── ExperienceFrame
├── UnderstandingContext
│   ├── UnderstandingName
│   ├── ApprovedObjective
│   └── ApprovedPlanDisclosure
├── LearningHeader
│   ├── LearnHeadline
│   └── LearnSupportingCopy
├── CurrentUnderstandingSummary
│   ├── CurrentConfidence
│   ├── LeadingExplanation
│   ├── PrimaryUnknown
│   └── MeaningfulChangeSummary
├── LearningSequence
│   ├── ActiveLearningEvent
│   │   ├── LearningActivity
│   │   ├── EvidenceScope
│   │   ├── Finding
│   │   ├── UnderstandingEffect
│   │   ├── ConfidenceEffect
│   │   ├── UncertaintyEffect
│   │   └── EventDetailDisclosure
│   └── CompletedLearningEvents
│       └── CompletedLearningEvent[]
├── LearningControls
│   ├── PauseLearningAction
│   ├── ContinueLearningAction
│   └── ShowCurrentUnderstandingAction
├── RemainingUncertainty
├── BeforeAfterSummary
└── UnderstandingReadyState
    ├── ReadyMessage
    ├── ReadySummary
    ├── ReviewChangesAction
    └── ViewUnderstandingAction
```

---

# 44. Experience State Contract

```ts
type LearnSceneStatus =
  | "preparing"
  | "learning"
  | "paused"
  | "ready"
  | "insufficient-evidence"
  | "failed";

type LearningChangeType =
  | "explanation-strengthened"
  | "explanation-weakened"
  | "confidence-increased"
  | "confidence-decreased"
  | "confidence-unchanged"
  | "unknown-narrowed"
  | "unknown-created"
  | "contradiction-created"
  | "relationship-created"
  | "relationship-strengthened";

type LearningEventStatus =
  | "pending"
  | "active"
  | "completed"
  | "failed"
  | "skipped";

interface LearningEventEffect {
  type: LearningChangeType;
  label: string;
  explanation: string;
}

interface LearningEventViewModel {
  id: string;
  sequence: number;
  activity: string;
  sourceIds: string[];
  sourceLabel: string;
  evidenceScope: string;
  headline: string;
  finding: string;
  interpretation: string;
  effects: LearningEventEffect[];
  confidenceBefore: string;
  confidenceAfter: string;
  unknownsNarrowed: string[];
  unknownsCreated: string[];
  limitation: string;
  status: LearningEventStatus;
  durationMs: number;
}

interface CurrentUnderstandingSnapshot {
  sequence: number;
  synthesis: string;
  confidenceLevel:
    | "low"
    | "low-moderate"
    | "moderate"
    | "moderate-high"
    | "high";
  leadingExplanation: string | null;
  weakenedExplanationIds: string[];
  contradictionIds: string[];
  relationshipIds: string[];
  primaryUnknown: string;
}

interface LearnSceneState {
  status: LearnSceneStatus;
  activeEventId: string | null;
  events: LearningEventViewModel[];
  currentSnapshot: CurrentUnderstandingSnapshot;
  snapshotHistory: CurrentUnderstandingSnapshot[];
  isAutoAdvanceEnabled: boolean;
  expandedEventIds: string[];
  error: string | null;
}
```

## Emitted intent

```ts
interface ViewFirstUnderstandingIntent {
  understandingId: string;
  finalSnapshot: CurrentUnderstandingSnapshot;
  completedLearningEventIds: string[];
  viewedAt: string;
}
```

This remains an experience-layer contract.

---

# 45. Canonical Alpha Learning Events

```ts
const engineeringProductivityLearningEvents: LearningEventViewModel[] = [
  {
    id: "execution-timing",
    sequence: 1,
    activity: "Reviewing sprint retrospectives",
    sourceIds: ["sprint-retrospectives"],
    sourceLabel: "Sprint retrospectives",
    evidenceScope: "Engineering retrospectives from the last six months",
    headline: "Execution appears to be the more important period.",
    finding:
      "Delivery concerns appear most often after teams have committed to work, rather than during initial planning.",
    interpretation:
      "The explanation shifts away from planning quality alone and toward constraints arising during execution.",
    effects: [
      {
        type: "explanation-strengthened",
        label: "Execution-stage constraints strengthened",
        explanation:
          "Recurring concerns are concentrated after commitment.",
      },
      {
        type: "confidence-increased",
        label: "Confidence increased slightly",
        explanation:
          "The evidence narrows when the friction is most likely to begin.",
      },
      {
        type: "unknown-narrowed",
        label: "Timing uncertainty narrowed",
        explanation:
          "Friction appears more likely after commitment than before it.",
      },
      {
        type: "unknown-created",
        label: "New question created",
        explanation:
          "What changes after commitment that causes delivery to lose momentum?",
      },
    ],
    confidenceBefore: "Low",
    confidenceAfter: "Low to moderate",
    unknownsNarrowed: [
      "Whether the primary friction begins before or after commitment",
    ],
    unknownsCreated: [
      "What changes after commitment that causes delivery to lose momentum?",
    ],
    limitation:
      "Retrospectives reflect participant interpretation and may omit normalized or sensitive issues.",
    status: "pending",
    durationMs: 5000,
  },
  {
    id: "ownership-movement",
    sequence: 2,
    activity: "Comparing project and issue history",
    sourceIds: ["project-issue-history"],
    sourceLabel: "Project and issue history",
    evidenceScope:
      "Delayed and reliably delivered Engineering initiatives from the last two quarters",
    headline: "Ownership instability is associated with delayed delivery.",
    finding:
      "Delayed work changes ownership or waits for ownership clarification more often than work delivered reliably.",
    interpretation:
      "Decision ownership becomes a stronger candidate explanation for delivery friction.",
    effects: [
      {
        type: "explanation-strengthened",
        label: "Ownership ambiguity strengthened",
        explanation:
          "Ownership movement occurs more often in delayed work.",
      },
      {
        type: "relationship-created",
        label: "Relationship emerged",
        explanation:
          "Engineering Productivity is now connected to Decision Ownership.",
      },
      {
        type: "confidence-increased",
        label: "Confidence increased",
        explanation:
          "Delayed and reliable delivery now show a meaningful structural difference.",
      },
      {
        type: "unknown-created",
        label: "Causal question remains",
        explanation:
          "Ownership movement may cause delay or may result from it.",
      },
    ],
    confidenceBefore: "Low to moderate",
    confidenceAfter: "Moderate",
    unknownsNarrowed: [
      "Whether delayed work differs structurally from reliably delivered work",
    ],
    unknownsCreated: [
      "Whether ownership movement causes delay or results from it",
    ],
    limitation:
      "Work-system history shows association but does not establish causal direction.",
    status: "pending",
    durationMs: 5500,
  },
  {
    id: "priority-stability",
    sequence: 3,
    activity: "Examining product planning documents",
    sourceIds: ["product-planning-documents"],
    sourceLabel: "Product planning documents",
    evidenceScope:
      "Current and previous-quarter plans affecting Engineering commitments",
    headline:
      "Formal priority instability is less likely to be the primary constraint.",
    finding:
      "Priorities remain more stable after planning than the initial orientation expected.",
    interpretation:
      "The hypothesis that frequent formal reprioritization is the primary cause becomes less plausible.",
    effects: [
      {
        type: "explanation-weakened",
        label: "Priority-instability explanation weakened",
        explanation:
          "Formal commitments remained comparatively stable.",
      },
      {
        type: "confidence-unchanged",
        label: "Overall confidence remained moderate",
        explanation:
          "Weakening one explanation improves discrimination without resolving the leading cause.",
      },
      {
        type: "contradiction-created",
        label: "Contradiction preserved",
        explanation:
          "Team accounts describe shifting priorities while formal plans remain stable.",
      },
      {
        type: "unknown-created",
        label: "Informal change remains uncertain",
        explanation:
          "Priority changes may occur outside formal planning records.",
      },
    ],
    confidenceBefore: "Moderate",
    confidenceAfter: "Moderate",
    unknownsNarrowed: [
      "Whether formal reprioritization is the primary explanation",
    ],
    unknownsCreated: [
      "Whether informal priority changes occur outside formal plans",
    ],
    limitation:
      "Published plans may not reflect informal decisions made after commitment.",
    status: "pending",
    durationMs: 5000,
  },
  {
    id: "clarification-behavior",
    sequence: 4,
    activity: "Connecting selected team conversations to delivery history",
    sourceIds: [
      "selected-team-conversations",
      "project-issue-history",
    ],
    sourceLabel: "Selected team conversations and project history",
    evidenceScope:
      "Approved project channels connected to selected delayed initiatives",
    headline:
      "Decision clarification repeatedly occurs after delivery begins.",
    finding:
      "Teams repeatedly seek decision clarification after work begins, especially when dependencies cross Product, Design, and Engineering boundaries.",
    interpretation:
      "Ownership ambiguity strengthens as the leading explanation.",
    effects: [
      {
        type: "explanation-strengthened",
        label: "Ownership ambiguity became the leading explanation",
        explanation:
          "Clarification behavior repeatedly aligns with delayed work.",
      },
      {
        type: "relationship-strengthened",
        label: "Decision Ownership relationship strengthened",
        explanation:
          "The relationship is now supported by both workflow and conversation evidence.",
      },
      {
        type: "relationship-created",
        label: "Coordination relationship emerged",
        explanation:
          "Cross-functional Coordination is now connected to Engineering Productivity.",
      },
      {
        type: "confidence-increased",
        label: "Confidence approached moderately high",
        explanation:
          "Multiple source categories now support the same explanation.",
      },
      {
        type: "unknown-created",
        label: "Origin remains uncertain",
        explanation:
          "The ambiguity may originate in structure, governance, or leadership behavior.",
      },
    ],
    confidenceBefore: "Moderate",
    confidenceAfter: "Moderate, approaching moderately high",
    unknownsNarrowed: [
      "Why ownership changes or work pauses after commitment",
    ],
    unknownsCreated: [
      "Whether ambiguity originates in formal structure, governance practices, or leadership behavior",
    ],
    limitation:
      "Conversation patterns reveal behavior but do not independently establish why the behavior persists.",
    status: "pending",
    durationMs: 6000,
  },
  {
    id: "initial-synthesis",
    sequence: 5,
    activity: "Integrating the strongest and contradicting evidence",
    sourceIds: [
      "sprint-retrospectives",
      "project-issue-history",
      "selected-team-conversations",
      "product-planning-documents",
    ],
    sourceLabel: "Approved learning plan",
    evidenceScope: "All approved information considered in the Alpha sequence",
    headline: "The first useful Understanding is ready.",
    finding:
      "Planning itself appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after commitment, when ownership and decision authority become unclear across dependencies.",
    interpretation:
      "Ownership ambiguity is currently the strongest explanation, but a reliable team operating under similar formal conditions prevents a high-confidence causal conclusion.",
    effects: [
      {
        type: "explanation-strengthened",
        label: "Leading explanation established",
        explanation:
          "Post-planning ownership ambiguity is the strongest current explanation.",
      },
      {
        type: "explanation-weakened",
        label: "Alternative weakened",
        explanation:
          "Formal priority instability is less likely to be the primary cause.",
      },
      {
        type: "contradiction-created",
        label: "Meaningful contradiction retained",
        explanation:
          "One comparable team delivers reliably under similar formal conditions.",
      },
      {
        type: "confidence-unchanged",
        label: "Final confidence calibrated to moderate",
        explanation:
          "The explanation is well supported, but causal direction and moderating behavior remain unresolved.",
      },
    ],
    confidenceBefore: "Moderate, approaching moderately high",
    confidenceAfter: "Moderate",
    unknownsNarrowed: [
      "Which explanation is currently strongest",
    ],
    unknownsCreated: [
      "Why one team delivers reliably despite a similar ownership structure",
    ],
    limitation:
      "The current evidence supports a strong organizational pattern but not a definitive causal claim.",
    status: "pending",
    durationMs: 4500,
  },
];
```

---

# 46. Snapshot History

The prototype should preserve a deterministic snapshot after every event.

```ts
const engineeringProductivitySnapshotHistory: CurrentUnderstandingSnapshot[] = [
  {
    sequence: 0,
    synthesis:
      "Discovery does not yet have enough evidence to distinguish among planning, ownership, coordination, and execution constraints.",
    confidenceLevel: "low",
    leadingExplanation: null,
    weakenedExplanationIds: [],
    contradictionIds: [],
    relationshipIds: [],
    primaryUnknown:
      "Where planned work begins to lose momentum after commitment.",
  },
  {
    sequence: 1,
    synthesis:
      "Delivery friction appears more likely to emerge after commitment than during initial planning.",
    confidenceLevel: "low-moderate",
    leadingExplanation: "Execution-stage constraint",
    weakenedExplanationIds: [],
    contradictionIds: [],
    relationshipIds: [],
    primaryUnknown:
      "What changes after commitment that causes delivery to lose momentum?",
  },
  {
    sequence: 2,
    synthesis:
      "Ownership movement is associated with delayed delivery and is now a plausible explanation for execution friction.",
    confidenceLevel: "moderate",
    leadingExplanation: "Ownership ambiguity",
    weakenedExplanationIds: [],
    contradictionIds: [],
    relationshipIds: ["decision-ownership"],
    primaryUnknown:
      "Whether ownership movement causes delay or results from it.",
  },
  {
    sequence: 3,
    synthesis:
      "Ownership ambiguity remains plausible, while formal priority instability is less likely to be the primary explanation.",
    confidenceLevel: "moderate",
    leadingExplanation: "Ownership ambiguity",
    weakenedExplanationIds: ["formal-priority-instability"],
    contradictionIds: ["formal-versus-reported-priority-change"],
    relationshipIds: ["decision-ownership"],
    primaryUnknown:
      "Whether informal priority changes occur outside formal plans.",
  },
  {
    sequence: 4,
    synthesis:
      "Ownership ambiguity after commitment is now the strongest explanation, especially across cross-functional dependencies.",
    confidenceLevel: "moderate-high",
    leadingExplanation: "Post-planning ownership ambiguity",
    weakenedExplanationIds: ["formal-priority-instability"],
    contradictionIds: ["formal-versus-reported-priority-change"],
    relationshipIds: [
      "decision-ownership",
      "cross-functional-coordination",
    ],
    primaryUnknown:
      "Whether ambiguity originates in structure, governance, or leadership behavior.",
  },
  {
    sequence: 5,
    synthesis:
      "Planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after commitment, when ownership and decision authority become unclear across dependencies.",
    confidenceLevel: "moderate",
    leadingExplanation: "Post-planning ownership ambiguity",
    weakenedExplanationIds: ["formal-priority-instability"],
    contradictionIds: [
      "formal-versus-reported-priority-change",
      "reliable-team-under-similar-structure",
    ],
    relationshipIds: [
      "decision-ownership",
      "cross-functional-coordination",
    ],
    primaryUnknown:
      "Why one team delivers reliably despite a similar ownership structure.",
  },
];
```

---

# 47. Determinism Requirements

For the canonical Alpha sequence:

* event order remains fixed;
* event copy remains fixed;
* event duration is centrally configured;
* each event produces one canonical snapshot;
* confidence transitions remain fixed;
* contradictions appear at the same sequence points;
* relationships appear and strengthen at the same sequence points;
* skipped animation produces the same final state;
* pause and resume do not duplicate events;
* refresh restores the current sequence position during the prototype session;
* browser-back behavior preserves the approved plan;
* internal array ordering does not alter visible chronology;
* the final Understanding state is identical across repeated runs.

---

# 48. Product Analytics

Suggested events:

```text
learn_scene_viewed
learning_started
learning_event_viewed
learning_event_expanded
learning_paused
learning_resumed
learning_skipped_to_current
learning_contradiction_examined
learning_ready
learning_failed
```

Suggested properties:

* event identifier;
* event sequence;
* source category;
* change types;
* confidence before;
* confidence after;
* whether auto-advance was enabled;
* whether event details were expanded;
* time spent on event;
* whether the user skipped.

Do not record:

* raw evidence;
* conversation content;
* private source excerpts;
* unapproved organizational data.

---

# 49. Quality Checks

Confirm:

1. The scene begins from the approved learning plan.
2. The Understanding objective remains visible.
3. The initial confidence is low.
4. No conclusion appears before evidence.
5. Every event includes a finding.
6. Every event changes or qualifies the Understanding.
7. Every event names its source category.
8. Confidence does not increase automatically after every event.
9. One explanation visibly weakens.
10. One contradiction is preserved.
11. At least one relationship emerges.
12. Unknowns transform rather than merely disappear.
13. Association is not described as causation.
14. The user can pause.
15. The user can inspect events.
16. The user can skip to the current Understanding.
17. Auto-advance pauses during review.
18. The sequence does not resemble a system log.
19. The sequence does not use fake AI theater.
20. The page does not use a generic percentage progress bar.
21. The ready state waits for user action.
22. A no-finding state exists.
23. A confidence-decrease state exists.
24. An insufficient-evidence state exists.
25. Source limitations remain available.
26. Keyboard-only interaction works.
27. Live announcements remain concise.
28. Reduced motion preserves meaning.
29. Mobile reading order remains coherent.
30. The final Understanding matches Scene Five input.

---

# 50. Acceptance Criteria

## Functional

* Scene Four receives the approved deterministic plan.
* The starting Understanding state is displayed.
* Five deterministic learning events are available.
* Events progress in canonical order.
* Users can pause and resume.
* Users can expand completed or active events.
* Expanded events pause automatic progression.
* Users can skip to the final current Understanding.
* Every event updates the canonical snapshot.
* Confidence changes match the event model.
* Unknowns update match the event model.
* Contradictions update match the event model.
* Relationships update match the event model.
* The final ready state appears after synthesis.
* The user must select View the Understanding to advance.
* Browser navigation preserves state.
* Restarting the demonstration resets the sequence deterministically.
* Failure states preserve the last valid snapshot.

## Visual

* The current event is the strongest visual element.
* Completed events remain inspectable.
* The current Understanding summary is easy to locate.
* Confidence is not styled as a progress meter.
* Contradictions are visually distinct without appearing as errors.
* Relationship emergence is visible but restrained.
* Source attribution remains clear.
* The page does not resemble a dashboard.
* The page does not resemble a terminal or pipeline monitor.
* Motion communicates change rather than spectacle.
* The ready state feels like stabilization, not completion.
* Responsive layouts preserve chronology and hierarchy.

## Product

* The user can identify what Discovery examined.
* The user can explain what each event changed.
* The user understands why confidence changed.
* The user sees that evidence can weaken an explanation.
* The user sees that contradictions are retained.
* The user understands what remains unknown.
* The user can distinguish association from causation.
* The user believes the first Understanding emerged through learning.
* The user does not believe the Understanding is final.
* The user is ready to examine the synthesis.

---

# 51. Prototype Review Script

A reviewer should complete the following:

1. Enter Scene Four from the approved full learning plan.
2. Identify the starting confidence.
3. Identify the largest starting unknown.
4. Observe Event One.
5. Explain what changed after Event One.
6. Pause during Event Two.
7. Expand Event Two.
8. Identify the association-versus-causation limitation.
9. Resume learning.
10. Observe Event Three.
11. Explain why overall confidence did not increase.
12. Identify the new contradiction.
13. Observe Event Four.
14. Identify the two relationships now connected to the Understanding.
15. Observe Event Five.
16. Explain why final confidence returned to Moderate.
17. Review the before-and-after summary.
18. Select View the Understanding.
19. Confirm transition to Scene Five.
20. Restart the demonstration.
21. Select Show current Understanding during Event One.
22. Confirm the final state is identical.
23. Repeat using keyboard only.
24. Repeat with reduced motion.
25. Repeat at mobile width.
26. Simulate a failed source.
27. Confirm the previous valid Understanding state remains intact.
28. Simulate insufficient evidence.
29. Confirm Discovery does not fabricate a conclusion.

Any event that cannot be explained as a meaningful change to the Understanding is a blocking defect.

---

# 52. Open Decisions

The following must be resolved through high-fidelity design and user testing:

1. Whether the desktop layout uses one column or a learning-plus-summary split.
2. Whether learning events auto-advance by default.
3. Whether mobile progression is automatic or manual.
4. Whether confidence appears as text only or with a restrained visual scale.
5. Whether completed events remain fully visible or collapse by default.
6. Whether event details open inline or in a temporary panel.
7. Whether the approved-plan summary remains accessible throughout.
8. Whether source counts should appear.
9. Whether “Moderate, approaching moderately high” is too verbose.
10. Whether the ready state should summarize all meaningful changes.
11. Whether the user can advance events manually before the reading interval ends.
12. Whether “Show current Understanding” is clearer than “Skip learning sequence.”
13. Whether relationship changes appear in the event or only in the summary.
14. Whether contradictions interrupt auto-advance and require acknowledgment.
15. Whether users can add context during learning.
16. Whether a long-running production version should support leaving the page.
17. How the experience should represent asynchronous real-world learning later.
18. Whether evidence-source limitations appear by default or behind disclosure.
19. Whether the timeline includes clock times or only sequence order.
20. How much historical event detail persists on the final Understanding page.

Codex must not invent resolutions to these questions.

---

# 53. Codex Implementation Boundary

Codex may implement:

* the deterministic learning sequence;
* canonical event state;
* snapshot history;
* confidence transitions;
* contradiction and relationship updates;
* pause and resume behavior;
* skip-to-current behavior;
* event expansion;
* ready state;
* no-finding state;
* confidence-decrease state;
* insufficient-evidence state;
* responsive behavior;
* accessibility;
* component and interaction tests;
* mocked transition to Scene Five.

Codex must not:

* process real organizational data;
* implement retrieval;
* connect external sources;
* create a production cognition pipeline;
* modify Runtime;
* modify Governance;
* modify canonical cognitive objects;
* create new confidence algorithms;
* claim causal findings;
* fabricate dynamic AI narration;
* add technical processing logs;
* add neural-network visuals;
* expose provider or model behavior;
* implement autonomous background work;
* redesign the canonical sequence;
* turn learning into a generic progress animation.

---

# 54. Definition of Done

Scene Four is complete when:

* every visible event changes the Understanding meaningfully;
* the user can trace the evolution from uncertainty to synthesis;
* strengthened and weakened explanations are both visible;
* contradictions remain intact;
* relationships emerge through evidence;
* confidence changes are explainable;
* unknowns become more specific;
* the user can pause, inspect, and skip;
* the final state is deterministic;
* no finding is fabricated when evidence is insufficient;
* the experience feels alive without relying on AI theater;
* no production architecture changes;
* Scene Five receives one coherent first Understanding.

The final review question is:

> Does the user witness Discovery’s Understanding change, or merely wait while the interface performs activity?

Only the first outcome is acceptable.
