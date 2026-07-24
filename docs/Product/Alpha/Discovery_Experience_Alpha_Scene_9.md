# Discovery Experience Alpha

# Scene Nine Specification — Return

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Partnership
**Implemented Alpha route:** `/alpha/return`
**Previous scene:** Follow
**Implemented next scene:** Home at `/alpha/home`
**Intended future state:** Ongoing Discovery experience
**Primary objective:** Demonstrate that Discovery becomes more valuable between visits by showing only meaningful changes to followed Understandings.
**Core trust requirement:** The returning experience must distinguish genuine learning from refreshed activity, manufactured novelty, and dashboard noise.

This document preserves detailed Alpha design intent. Return and Home use
predetermined fixture states to simulate continuity and meaningful learning.
They do not prove background processing, durable following, organizational
memory updates, or Organization Runtime evolution.

---

# 1. Scene Purpose

Scene Nine answers the question that determines whether Discovery becomes a habit:

> What did Discovery learn while I was away?

The user has already:

* asked a consequential question;
* approved an Understanding objective;
* reviewed a learning plan;
* watched the Understanding evolve;
* examined Discovery’s reasoning;
* contributed context or challenged the model;
* chosen to follow the Understanding.

Discovery must now demonstrate compounding value.

The returning experience should not require the user to reconstruct where they left off.

It should communicate:

1. what changed;
2. why it changed;
3. why the change matters;
4. what remains unresolved;
5. what Discovery recommends learning next.

This is the first expression of Discovery as an enduring organizational intelligence rather than a one-session analysis product.

---

# 2. Primary User Outcome

The user understands the most meaningful changes since their previous visit in less than two minutes.

The user should leave believing:

* Discovery continued improving the Understanding;
* the updates are consequential rather than cosmetic;
* previous conclusions were preserved;
* confidence changed for a reason;
* contradictions remain visible;
* Discovery knows what deserves attention next;
* returning regularly will produce value.

The strongest desired reaction is:

> I want to see what Discovery learns next.

---

# 3. Primary Discovery Outcome

Discovery presents a prioritized account of meaningful organizational learning.

The returning state should include:

* followed Understandings;
* meaningful changes since the last visit;
* explanations for those changes;
* updated confidence;
* new contradictions;
* emerging relationships;
* high-value learning opportunities;
* unchanged Understandings only when their stability matters;
* access to historical comparison.

The homepage should not display all available information.

It should surface only what deserves executive attention.

---

# 4. Emotional Objective

The emotional transition is:

```text
Expectation

↓

Recognition of progress

↓

Curiosity

↓

Reliance

↓

Partnership
```

The user should think:

> Discovery kept working on something that matters and returned with a clearer organizational picture.

The user should not think:

* this is a notification center;
* these are refreshed dashboard metrics;
* Discovery manufactured three updates because it needed content;
* every Understanding must change daily;
* urgency is being artificially created.

---

# 5. Canonical Alpha Time State

The returning experience occurs the next morning after the user followed:

> Engineering Productivity

For deterministic Alpha purposes:

## Previous visit

> July 23, 2026 at 7:45 PM

## Current visit

> July 24, 2026 at 8:10 AM

These timestamps are illustrative prototype state.

They do not imply actual autonomous processing occurred.

---

# 6. Canonical Meaningful Changes

The returning Alpha experience contains three meaningful changes.

## Change One — Confidence increased

**Understanding**

> Engineering Productivity

**Previous confidence**

> Moderate · 74%

**Current confidence**

> Moderately high · 81%

**Why it changed**

> Additional project history strengthened the relationship between delayed delivery and unresolved decision authority.

**Why it matters**

> Ownership ambiguity is now more consistently associated with delivery friction across initiatives.

**Qualification**

> Causal direction remains unresolved.

---

## Change Two — New contradiction

**Understanding**

> Engineering Productivity

**Change**

> A new contradiction emerged.

**Finding**

> One team delivers reliably despite operating under the same formal ownership model.

**Why it matters**

> Formal structure alone is increasingly unlikely to explain the difference.

**New question**

> What decision practices distinguish this team from the rest of Engineering?

---

## Change Three — New relationship

**Connected Understanding**

> Product Prioritization

**Relationship state**

> Meaningfully connected to Engineering Productivity

**Why it emerged**

> Priority stability changes how clearly Discovery can distinguish planning problems from post-planning ownership problems.

**Implication**

> Improving Product Prioritization understanding is expected to increase confidence in the Engineering Productivity model.

---

# 7. Primary Homepage Message

## Greeting

> Good morning.

Greeting language may vary by local time.

It should remain restrained and optional.

## Primary statement

> Discovery learned three meaningful things since your last visit.

This is the canonical Alpha homepage message.

Alternative for one change:

> Discovery learned something meaningful since your last visit.

Alternative for no changes:

> Your followed Understandings remain stable.

Do not say:

* You have three notifications.
* Three new insights.
* Your dashboard has been updated.
* Discovery processed new data.
* Here is your daily report.
* Three things happened overnight.

---

# 8. Homepage Philosophy

The homepage is not a dashboard.

It is a prioritized narrative of organizational learning.

It should answer:

* What changed?
* Why does it matter?
* What should I understand next?
* Which followed Understandings need my attention?
* Which Understandings remain stable?

It should not attempt to summarize every:

* department;
* source;
* metric;
* initiative;
* task;
* integration;
* alert;
* recommendation.

The homepage should behave like a thoughtful executive briefing prepared by an intelligence that understands the user’s learning priorities.

---

# 9. Page Structure

Scene Nine contains seven primary regions:

```text
Application frame

Greeting and learning summary

Most important change

Additional meaningful changes

Recommended next learning

Followed Understandings

Historical and secondary access
```

The first viewport should communicate:

* the number of meaningful changes;
* the most important change;
* one recommended next action.

---

# 10. Desktop Layout

## 10.1 Main container

Recommended maximum width:

```text
1120–1240 px
```

Primary narrative width:

```text
720–820 px
```

## 10.2 Suggested composition

```text
Good morning.
Discovery learned three meaningful things...

Most important change

Second change
Third change

Discovery recommends

Followed Understandings
```

## 10.3 Optional two-region layout

On wide screens:

```text
Meaningful changes            Followed Understandings
Discovery recommendation      Quiet status summary
```

The meaningful-change narrative must remain dominant.

Avoid equally weighted dashboard columns.

---

# 11. Tablet and Mobile Layout

## 11.1 Tablet

* use one primary column;
* place followed Understandings after meaningful changes;
* keep the recommendation near the top;
* collapse secondary details;
* preserve explicit before-and-after comparisons.

## 11.2 Mobile

Priority order:

1. Learning summary
2. Most important change
3. Why it matters
4. Recommended next learning
5. Other meaningful changes
6. Followed Understandings
7. Stable or secondary updates
8. Historical access

## 11.3 Returning speed

The user should be able to understand the most important update without scrolling extensively.

---

# 12. Most Important Change

Discovery should prioritize one change above the others.

For Alpha:

> Confidence increased in Engineering Productivity.

## Presentation

**Engineering Productivity**

> Confidence increased from Moderate to Moderately high.

**Why**

> New project history strengthened the relationship between delayed delivery and unresolved decision authority.

**What this changes**

> Ownership ambiguity is now more consistently associated with delivery friction.

**What remains unresolved**

> Discovery still cannot establish whether unclear ownership causes delay or emerges after work is already in difficulty.

## Primary action

> See what changed

## Secondary action

> Open Understanding

---

# 13. Meaningful Change Anatomy

Every change shown on the homepage must include:

1. affected Understanding;
2. change type;
3. before state;
4. current state;
5. reason;
6. implication;
7. remaining qualification;
8. relevant action.

A change should not appear solely as:

> Confidence +7%.

The meaning of the change matters more than the magnitude.

---

# 14. Change Types

The returning experience supports the following canonical types:

```text
Synthesis changed
Confidence increased
Confidence decreased
New contradiction
Contradiction resolved
New relationship
Relationship strengthened
Largest unknown changed
Scope changed
High-value learning opportunity
No meaningful change
```

These should map to user-facing language.

Avoid technical event names.

---

# 15. Confidence-Increase Presentation

## Headline

> Confidence increased

## Before and after

```text
Moderate → Moderately high
```

Optional secondary values:

```text
74% → 81%
```

## Explanation

> Additional project history showed the same ownership-and-delay pattern across more initiatives.

## Qualification

> More recurrence strengthens the pattern, but does not resolve causal direction.

## Rule

Confidence increase is not inherently positive news.

Visual treatment should communicate model strengthening, not organizational improvement.

---

# 16. Confidence-Decrease Presentation

The homepage must also support confidence decreasing.

## Example headline

> Confidence decreased

## Explanation

> New evidence did not fit the current explanation.

## Show

* prior confidence;
* current confidence;
* contradiction;
* affected synthesis;
* reopened alternatives;
* next recommended learning.

## Tone

> Discovery is less certain than it was yesterday.

This should feel like useful learning, not failure.

---

# 17. New-Contradiction Presentation

## Headline

> A new contradiction emerged

## Canonical copy

> One team delivers reliably despite operating under the same formal ownership model.

## Why it matters

> The difference suggests that local decision practices or leadership behavior may matter more than structure alone.

## Effect

> Confidence in ownership ambiguity remains strong as a pattern, but confidence in the structural causal explanation decreases.

## Action

> Examine contradiction

---

# 18. New-Relationship Presentation

## Headline

> A new relationship became meaningful

## Connected Understanding

> Product Prioritization

## Explanation

> Priority stability helps distinguish whether delivery problems begin during planning or after commitment.

## Relationship effect

> Product Prioritization now contributes directly to the confidence of the Engineering Productivity Understanding.

## Actions

* Open Product Prioritization
* Begin this Understanding
* Not now

If Product Prioritization does not yet exist as a Living Understanding:

> Begin this Understanding

If it already exists:

> Open Understanding

---

# 19. Recommended Next Learning

## Heading

> Discovery recommends

## Canonical recommendation

> Compare decision practices in the consistently delivering team with the rest of Engineering.

## Why now

> This directly addresses the strongest contradiction in the current Understanding.

## Expected information gain

> High

## Expected effect

> Clarify whether leadership behavior, delegation, or local team practices moderate ownership ambiguity.

## Primary action

> Review learning plan

## Secondary action

> Not now

Discovery recommends learning, not an operational intervention.

---

# 20. Recommendation Priority

Only one primary recommendation should appear by default.

Secondary learning opportunities may be available through disclosure.

Do not present:

* a queue of ten recommendations;
* a task backlog;
* an urgency-ranked action center;
* multiple competing calls to action.

The user should know the single highest-value next learning opportunity.

---

# 21. Followed Understandings

## Heading

> Followed Understandings

The list should remain concise.

For Alpha:

### Engineering Productivity

Status:

> Growing

Confidence:

> Moderately high

Last meaningful change:

> Today

Attention:

> New contradiction

### Product Prioritization

Status:

> Early orientation

Confidence:

> Low

Last meaningful change:

> Newly connected

Attention:

> High-value learning opportunity

## Rule

This is not a metric table.

Each row should communicate:

* current lifecycle state;
* meaningful recent change;
* attention requirement.

---

# 22. Understanding Status Vocabulary

Suggested user-facing states:

```text
Early orientation
Learning
Growing
Stable
Changed
More uncertain
Needs context
```

Avoid:

* Active
* Processing
* Complete
* Failed
* Healthy
* Warning
* Red
* Green

unless those terms describe a validated organizational state rather than product activity.

---

# 23. Stable Understandings

A followed Understanding may have no meaningful change.

## Presentation

> Customer Retention remains stable.

## Explanation

> New evidence was consistent with the current synthesis but did not materially change confidence, relationships, or uncertainty.

Stable Understandings should not dominate the homepage.

They may appear in the followed list or a quiet summary.

## Rule

Discovery should not manufacture change to justify a return visit.

---

# 24. No Meaningful Changes State

This is a required first-class state.

## Headline

> Your followed Understandings remain stable.

## Supporting copy

> Discovery reviewed new relevant information, but nothing changed enough to warrant your attention.

## Optional meaningful detail

> Engineering Productivity remains at Moderate confidence. The largest unknown is unchanged.

## Recommendation

Discovery may still show:

> The highest-value next learning opportunity remains comparing decision practices across Engineering teams.

## Rule

Do not turn source activity into an update when the Understanding did not materially change.

---

# 25. One Meaningful Change State

## Headline

> Discovery learned something meaningful since your last visit.

Then display the single change prominently.

Do not pad the page with secondary activity.

---

# 26. Many Changes State

If many meaningful changes exist, Discovery must prioritize them.

## Default view

Show:

* one most important change;
* up to two additional changes;
* summary of remaining changes.

Example:

> Four other Understandings changed meaningfully.

Action:

> Review remaining changes

## Prioritization factors

* relevance to followed Understanding;
* magnitude of synthesis change;
* confidence movement;
* contradiction importance;
* executive consequence;
* user stewardship responsibility;
* recency.

This priority model is not implemented as production cognition in Alpha.

---

# 27. Before-and-After Comparison

Every material update should offer a concise comparison.

## Example

**Previously**

> Ownership ambiguity was the strongest explanation, but evidence was limited across initiatives.

**Now**

> The same pattern appears across more delayed work, increasing confidence.

**Still unresolved**

> Whether ownership ambiguity causes delay or follows it.

This pattern should be reusable throughout the returning experience.

---

# 28. Historical Traceability

The user must be able to inspect:

* prior synthesis;
* current synthesis;
* confidence history;
* newly added evidence;
* contradiction history;
* relationship changes;
* user contributions;
* learning recommendations.

## Action

> See full history

## Rule

Historical states must never be overwritten merely because the current synthesis changed.

---

# 29. User Contribution Follow-Up

If the user added context in Scene Seven, the returning state should show how that contribution affected learning.

## Canonical example

**Your context helped Discovery investigate practical decision authority.**

> The distinction between formal project ownership and platform-group decision authority now appears in three delayed initiatives.

## Effect

> The current synthesis is more specific.

## Remaining unknown

> Whether this authority split also appears in reliably delivered work.

## Action

> Review how your contribution was used

This reinforces stewardship.

---

# 30. Contribution Not Yet Resolved

Discovery may not have enough evidence to evaluate a user contribution.

## Message

> Discovery has not resolved the context you added.

## Explanation

> The current information does not yet show whether platform-group authority consistently affects delivery timing.

## Action

> Review the next learning opportunity

The user should never assume their contribution was ignored.

---

# 31. Attention State

An Understanding may require the user’s input.

## Example

> Engineering Productivity needs your context.

## Why

> Two sources describe the same decision differently, and Discovery cannot determine which reflects actual authority.

## Action

> Help resolve this

This should remain calm.

Avoid:

* urgent alert;
* blocking issue;
* action required;
* overdue.

---

# 32. Navigation Model

The returning experience may now expose the minimal persistent navigation:

* Home
* Understandings
* Ask Discovery

Optional later destinations:

* Learning
* Decisions
* Organization

For Experience Alpha, keep navigation minimal.

The homepage should remain the center of learning, not a route directory.

---

# 33. Ask Discovery Entry

The returning homepage should retain a quiet path to begin another Understanding.

## Prompt

> What would you like Discovery to understand next?

This may appear:

* beneath meaningful updates;
* as a restrained persistent action;
* on the Understandings index.

It should not compete with the current learning summary.

---

# 34. Visual Treatment

## 34.1 Overall character

The homepage should feel:

* calm;
* current;
* prioritized;
* alive;
* trustworthy;
* increasingly familiar.

## 34.2 Change presentation

Prefer narrative change sections over metric cards.

Use:

* concise headlines;
* before-and-after language;
* restrained semantic labels;
* whitespace;
* clear actions.

## 34.3 Density

The first viewport should contain:

* greeting;
* meaningful-learning summary;
* most important change;
* primary recommendation.

Do not fill the first viewport with the entire Understanding portfolio.

## 34.4 Decorative treatment

Avoid:

* news-feed patterns;
* notification badges;
* dense activity streams;
* charts without a specific explanatory role;
* celebratory graphics;
* urgency colors;
* constantly moving elements.

---

# 35. Typography Roles

## Greeting

Small or medium heading.

## Learning summary

Primary display heading.

Suggested desktop range:

```text
38–50 px
```

## Most important change

Large section heading or strong body.

## Before-and-after states

Medium body with clear labels.

## Recommendation

Medium heading and primary body.

## Followed Understanding rows

Compact heading and secondary body.

The page should be scannable without becoming visually fragmented.

---

# 36. Color Semantics

Color may support:

* confidence movement;
* contradiction;
* relationship;
* learning opportunity;
* stable state;
* needs-context state.

Color must not imply:

* confidence increase is organizational improvement;
* contradiction is failure;
* stable means healthy;
* lower confidence is bad;
* urgency without consequence.

Every state must be written explicitly.

---

# 37. Motion Specification

## 37.1 Page arrival

The learning summary and most important change may enter through a restrained fade.

No staged reveal is necessary.

Suggested duration:

```text
200–350 ms
```

## 37.2 Change expansion

Before-and-after detail opens inline.

## 37.3 Understanding-state movement

Confidence labels may transition subtly.

Do not animate numeric counters upward.

## 37.4 New relationship

A relationship may appear through a restrained fade or text emphasis.

Do not draw an animated graph.

## 37.5 Reduced motion

Use direct state changes or short opacity transitions.

The homepage must remain fully understandable without animation.

---

# 38. Copy Principles

Scene Nine copy should be:

* prioritized;
* specific;
* temporal;
* concise;
* explanatory;
* calm.

## Preferred language

* learned;
* changed;
* remains stable;
* new contradiction;
* confidence increased;
* confidence decreased;
* became meaningfully connected;
* since your last visit;
* why it matters;
* what remains unresolved;
* recommends learning next.

## Avoid

* notification;
* alert;
* feed;
* update available;
* daily digest;
* activity;
* processed;
* scanned;
* monitored;
* watched;
* breaking;
* urgent;
* critical;
* engagement.

---

# 39. Failure States

## 39.1 Returning state unavailable

Message:

> Discovery couldn’t prepare your latest learning summary.

Supporting copy:

> Your followed Understandings and previous history remain available.

Actions:

* Try again
* Open followed Understandings

## 39.2 One change unavailable

Display the other valid changes.

Message:

> One Understanding could not be compared with its previous state.

Do not hide the entire homepage.

## 39.3 Historical state unavailable

Message:

> Discovery knows the current Understanding changed but cannot display the complete before-and-after comparison.

The current state remains visible.

## 39.4 Recommendation unavailable

Message:

> Discovery has not identified a sufficiently valuable next learning opportunity.

Do not fabricate one.

---

# 40. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* a clearly labeled meaningful-changes region;
* an ordered list when changes are prioritized;
* section headings for recommendations and followed Understandings;
* descriptive action labels.

## Change announcements

Do not use an aggressive live region on page load.

The learning summary should be available through normal reading order.

## Before and after

Screen-reader copy should clearly distinguish:

* previous state;
* current state;
* unresolved qualification.

## Confidence movement

Example:

> Confidence changed from Moderate, 74 percent, to Moderately high, 81 percent.

The percentage remains secondary.

## Contradictions

Label explicitly:

> New meaningful contradiction.

## Focus

On arrival, focus remains at the page heading or beginning of main content.

Do not automatically move focus to the most important action.

---

# 41. Component Hierarchy

```text
ReturnScene
├── ExperienceFrame
│   ├── MinimalNavigation
│   └── UserContext
├── ReturnHeader
│   ├── Greeting
│   └── MeaningfulLearningSummary
├── MostImportantChange
│   ├── UnderstandingIdentity
│   ├── ChangeType
│   ├── BeforeState
│   ├── CurrentState
│   ├── ChangeReason
│   ├── ChangeImplication
│   ├── RemainingQualification
│   └── ChangeActions
├── AdditionalMeaningfulChanges
│   └── MeaningfulChange[]
├── RecommendedNextLearning
│   ├── Recommendation
│   ├── WhyNow
│   ├── ExpectedInformationGain
│   ├── ExpectedEffect
│   └── RecommendationActions
├── ContributionFollowUp
├── FollowedUnderstandings
│   └── FollowedUnderstandingRow[]
├── StableUnderstandingsSummary
├── HistoricalAccess
└── AskDiscoveryEntry
```

---

# 42. Experience State Contract

```ts
type MeaningfulChangeType =
  | "synthesis-changed"
  | "confidence-increased"
  | "confidence-decreased"
  | "contradiction-created"
  | "contradiction-resolved"
  | "relationship-created"
  | "relationship-strengthened"
  | "primary-unknown-changed"
  | "scope-changed"
  | "learning-opportunity-created"
  | "stable";

type AttentionState =
  | "none"
  | "new-contradiction"
  | "needs-context"
  | "high-value-learning"
  | "confidence-decreased";

interface MeaningfulChangeViewModel {
  id: string;
  understandingId: string;
  understandingName: string;
  type: MeaningfulChangeType;
  headline: string;
  previousState: string | null;
  currentState: string;
  reason: string;
  implication: string;
  remainingQualification: string | null;
  occurredAt: string;
  priority: number;
  actionLabel: string;
}

interface FollowedUnderstandingSummary {
  id: string;
  name: string;
  status:
    | "early-orientation"
    | "learning"
    | "growing"
    | "stable"
    | "changed"
    | "more-uncertain"
    | "needs-context";
  statusLabel: string;
  confidenceLabel: string;
  lastMeaningfulChangeAt: string | null;
  attentionState: AttentionState;
  attentionLabel: string | null;
  isFollowed: boolean;
}

interface NextLearningRecommendationViewModel {
  id: string;
  understandingId: string;
  headline: string;
  whyNow: string;
  informationGain:
    | "very-high"
    | "high"
    | "moderate"
    | "low"
    | "unknown";
  expectedEffect: string;
  actionLabel: string;
}

interface ContributionFollowUpViewModel {
  contributionSummary: string;
  learningEffect: string;
  remainingUnknown: string;
  actionLabel: string;
}

interface ReturnSceneState {
  status:
    | "ready"
    | "no-meaningful-changes"
    | "partial"
    | "failed";
  lastVisitedAt: string;
  returnedAt: string;
  meaningfulChanges: MeaningfulChangeViewModel[];
  followedUnderstandings: FollowedUnderstandingSummary[];
  primaryRecommendation: NextLearningRecommendationViewModel | null;
  contributionFollowUp: ContributionFollowUpViewModel | null;
  error: string | null;
}
```

---

# 43. Canonical Alpha Return Model

```ts
const engineeringProductivityReturnState: ReturnSceneState = {
  status: "ready",
  lastVisitedAt: "2026-07-23T19:45:00.000Z",
  returnedAt: "2026-07-24T08:10:00.000Z",
  meaningfulChanges: [
    {
      id: "engineering-confidence-increased",
      understandingId: "engineering-productivity",
      understandingName: "Engineering Productivity",
      type: "confidence-increased",
      headline: "Confidence increased",
      previousState: "Moderate · 74%",
      currentState: "Moderately high · 81%",
      reason:
        "Additional project history strengthened the relationship between delayed delivery and unresolved decision authority.",
      implication:
        "Ownership ambiguity is now more consistently associated with delivery friction across initiatives.",
      remainingQualification:
        "Causal direction remains unresolved.",
      occurredAt: "2026-07-24T06:40:00.000Z",
      priority: 1,
      actionLabel: "See what changed",
    },
    {
      id: "reliable-team-contradiction",
      understandingId: "engineering-productivity",
      understandingName: "Engineering Productivity",
      type: "contradiction-created",
      headline: "A new contradiction emerged",
      previousState: null,
      currentState:
        "One team delivers reliably despite operating under the same formal ownership model.",
      reason:
        "The team’s delivery pattern does not fit a simple structural ownership explanation.",
      implication:
        "Leadership behavior, delegation, or local decision practices may moderate the broader constraint.",
      remainingQualification:
        "Discovery has not yet identified which practice differs.",
      occurredAt: "2026-07-24T07:05:00.000Z",
      priority: 2,
      actionLabel: "Examine contradiction",
    },
    {
      id: "product-prioritization-relationship",
      understandingId: "product-prioritization",
      understandingName: "Product Prioritization",
      type: "relationship-created",
      headline: "A new relationship became meaningful",
      previousState: "Weakly related",
      currentState: "Meaningfully connected to Engineering Productivity",
      reason:
        "Priority stability helps distinguish whether delivery problems begin during planning or after commitment.",
      implication:
        "Improving Product Prioritization understanding is expected to increase confidence in the Engineering Productivity model.",
      remainingQualification:
        "Product Prioritization remains at an early orientation.",
      occurredAt: "2026-07-24T07:20:00.000Z",
      priority: 3,
      actionLabel: "Begin this Understanding",
    },
  ],
  followedUnderstandings: [
    {
      id: "engineering-productivity",
      name: "Engineering Productivity",
      status: "growing",
      statusLabel: "Growing",
      confidenceLabel: "Moderately high",
      lastMeaningfulChangeAt: "2026-07-24T07:05:00.000Z",
      attentionState: "new-contradiction",
      attentionLabel: "New contradiction",
      isFollowed: true,
    },
    {
      id: "product-prioritization",
      name: "Product Prioritization",
      status: "early-orientation",
      statusLabel: "Early orientation",
      confidenceLabel: "Low",
      lastMeaningfulChangeAt: "2026-07-24T07:20:00.000Z",
      attentionState: "high-value-learning",
      attentionLabel: "High-value learning opportunity",
      isFollowed: true,
    },
  ],
  primaryRecommendation: {
    id: "compare-reliable-team-practices",
    understandingId: "engineering-productivity",
    headline:
      "Compare decision practices in the consistently delivering team with the rest of Engineering.",
    whyNow:
      "This directly addresses the strongest contradiction in the current Understanding.",
    informationGain: "high",
    expectedEffect:
      "Clarify whether leadership behavior, delegation, or local team practices moderate ownership ambiguity.",
    actionLabel: "Review learning plan",
  },
  contributionFollowUp: {
    contributionSummary:
      "You added that architecture decisions are controlled by a separate platform group.",
    learningEffect:
      "The distinction between formal project ownership and practical decision authority now appears in three delayed initiatives.",
    remainingUnknown:
      "Whether the same authority split appears in reliably delivered work.",
    actionLabel: "Review how your contribution was used",
  },
  error: null,
};
```

---

# 44. No-Change Alpha Model

```ts
const stableReturnState: ReturnSceneState = {
  status: "no-meaningful-changes",
  lastVisitedAt: "2026-07-23T19:45:00.000Z",
  returnedAt: "2026-07-24T08:10:00.000Z",
  meaningfulChanges: [],
  followedUnderstandings: [
    {
      id: "engineering-productivity",
      name: "Engineering Productivity",
      status: "stable",
      statusLabel: "Stable",
      confidenceLabel: "Moderate",
      lastMeaningfulChangeAt: "2026-07-23T19:30:00.000Z",
      attentionState: "high-value-learning",
      attentionLabel: "Learning opportunity remains",
      isFollowed: true,
    },
  ],
  primaryRecommendation: {
    id: "compare-reliable-team-practices",
    understandingId: "engineering-productivity",
    headline:
      "Compare decision practices in the consistently delivering team with the rest of Engineering.",
    whyNow:
      "This remains the highest-value opportunity for resolving the current contradiction.",
    informationGain: "high",
    expectedEffect:
      "Clarify what moderates ownership ambiguity across teams.",
    actionLabel: "Review learning plan",
  },
  contributionFollowUp: null,
  error: null,
};
```

---

# 45. Determinism Requirements

For the canonical Alpha return experience:

* three meaningful changes always appear;
* change order remains fixed by priority;
* the confidence comparison remains fixed;
* the contradiction remains fixed;
* the Product Prioritization relationship remains fixed;
* the primary recommendation remains fixed;
* followed Understanding states remain fixed;
* contribution follow-up remains fixed when the canonical Scene Seven context is used;
* browser refresh restores the same returning state;
* no timestamps use the actual current clock;
* the no-change scenario remains independently testable;
* internal array order does not change visible priority;
* the return state remains consistent with all previous scenes.

---

# 46. Product Analytics

Suggested events:

```text
return_scene_viewed
return_change_opened
return_primary_change_opened
return_contradiction_opened
return_relationship_opened
return_recommendation_opened
return_recommendation_deferred
return_followed_understanding_opened
return_history_opened
return_contribution_followup_opened
return_new_understanding_started
```

Suggested properties:

* meaningful change count;
* primary change type;
* Understanding identifier;
* attention state;
* recommendation information gain;
* no-change state;
* time to first action;
* first action selected.

Do not record private evidence or contribution content in general analytics.

---

# 47. Quality Checks

Confirm:

1. The homepage opens with learning, not metrics.
2. The most important change is immediately identifiable.
3. Every change explains why it occurred.
4. Every change explains why it matters.
5. Every change preserves unresolved qualification.
6. Confidence movement is not presented as organizational improvement.
7. A new contradiction is treated as meaningful learning.
8. The Product Prioritization relationship is understandable.
9. Only one primary recommendation appears.
10. The recommendation concerns learning, not operational work.
11. Followed Understandings remain secondary to meaningful changes.
12. Stable Understandings do not create noise.
13. A no-change state exists.
14. A one-change state exists.
15. A many-change prioritization state exists.
16. Historical comparison remains accessible.
17. User contributions receive follow-up.
18. Unresolved contributions remain visible.
19. Needs-context states remain calm.
20. The page does not resemble a notification center.
21. The page does not resemble a dashboard.
22. The page does not resemble a news feed.
23. No novelty is fabricated.
24. Mobile hierarchy preserves the most important change.
25. Keyboard-only navigation works.
26. Reduced motion preserves meaning.
27. Failure states preserve followed Understandings.
28. The returning experience creates curiosity without urgency.

---

# 48. Acceptance Criteria

## Functional

* Scene Nine receives the followed Understanding state.
* A deterministic returning summary is displayed.
* Three canonical meaningful changes are available.
* Changes are ordered by priority.
* Each change includes before, current, reason, implication, and qualification.
* One primary recommendation is displayed.
* Followed Understandings are displayed.
* Contribution follow-up is displayed when applicable.
* Users can inspect change history.
* Users can open affected Understandings.
* Users can review the recommended learning plan.
* Users can defer the recommendation.
* Users can begin another Understanding.
* No-change, one-change, and many-change states are testable.
* Failure states preserve access to followed Understandings.

## Visual

* The learning summary is the dominant heading.
* The most important change is visually primary.
* The homepage does not open with metric cards.
* Changes read as a narrative.
* The recommendation is prominent but not urgent.
* Followed Understandings are compact and scannable.
* Stable states remain quiet.
* Contradictions are distinct without alarm styling.
* Responsive layouts preserve priority.
* Motion remains restrained.

## Product

* The user understands what Discovery learned.
* The user understands why the Understanding changed.
* The user understands what remains unresolved.
* The user sees value in the contradiction.
* The user sees how another Understanding became relevant.
* The user knows the highest-value next learning opportunity.
* The user feels that their prior contribution mattered.
* The user does not feel overwhelmed.
* The user is curious to return again.
* The homepage feels like the front door to organizational learning.

---

# 49. Prototype Review Script

A reviewer should complete the following:

1. Complete Scene Eight and finish the first-use experience.
2. Load the canonical next-morning state.
3. Read only the first viewport.
4. Identify the most important change.
5. Explain why confidence increased.
6. Explain what remains unresolved.
7. Open the new contradiction.
8. Explain why it matters.
9. Return to the homepage.
10. Open the Product Prioritization relationship.
11. Explain why it became relevant.
12. Return to the homepage.
13. Review the primary learning recommendation.
14. Explain why it is the highest-value next step.
15. Open Engineering Productivity from Followed Understandings.
16. Return and review contribution follow-up.
17. Explain how the user’s context affected the model.
18. Load the no-meaningful-changes state.
19. Confirm Discovery does not manufacture an update.
20. Load a confidence-decrease state.
21. Confirm uncertainty is framed as useful learning.
22. Load a many-change state.
23. Confirm changes are prioritized rather than dumped.
24. Repeat using only a keyboard.
25. Repeat with reduced motion.
26. Repeat at mobile width.
27. Simulate one unavailable historical comparison.
28. Confirm valid updates remain visible.

If the reviewer describes the page as a dashboard, feed, or notification center, the scene requires redesign.

---

# 50. Open Decisions

The following should be resolved through high-fidelity design and testing:

1. Whether the greeting appears at all.
2. Whether “Discovery learned three meaningful things” is the page heading or supporting statement.
3. Whether the most important change occupies a distinct surface.
4. Whether additional changes are expanded by default.
5. Whether percentages appear with confidence labels.
6. Whether followed Understandings appear in the first viewport.
7. Whether stable Understandings appear at all.
8. Whether contribution follow-up appears before or after the primary recommendation.
9. Whether the homepage should show only one recommendation.
10. Whether a no-change state should still include reviewed-evidence activity.
11. Whether users can dismiss a meaningful change.
12. Whether dismissed changes remain in history.
13. Whether “Not now” changes recommendation priority.
14. Whether a relationship automatically creates an early-orientation Understanding.
15. Whether the user can follow a newly connected Understanding directly.
16. Whether important changes should be grouped by Understanding.
17. Whether homepage priority should adapt by user role.
18. Whether the user may configure what counts as meaningful.
19. Whether “Growing” is the correct lifecycle label.
20. Whether the homepage should include upcoming decisions or initiatives in later applications.
21. Whether the learning summary should be generated daily or on visit.
22. Whether meaningful-change delivery later supports email or Slack.
23. How much evidence detail belongs directly on the homepage.
24. Whether the homepage supports team-level shared stewardship.
25. Whether “Ask Discovery” appears persistently or only after updates.

Codex must not independently resolve these decisions.

---

# 51. Codex Implementation Boundary

Codex may implement:

* the canonical deterministic returning state;
* meaningful-change prioritization;
* before-and-after comparisons;
* confidence movement;
* contradiction update;
* relationship update;
* primary learning recommendation;
* followed Understanding summaries;
* contribution follow-up;
* no-change state;
* one-change state;
* many-change state;
* confidence-decrease state;
* responsive behavior;
* accessibility;
* deterministic tests;
* prototype reset and return-state controls.

Codex must not:

* implement actual background processing;
* claim autonomous learning occurred;
* connect live sources;
* generate live homepage summaries;
* create production notification infrastructure;
* modify Runtime;
* modify cognition;
* modify Governance;
* create a new prioritization architecture;
* fabricate meaningful changes;
* turn the homepage into a dashboard;
* add activity-feed behavior;
* add notification badges;
* create urgency without evidence;
* add operational recommendations not supported by the Understanding;
* redesign the canonical returning hierarchy.

---

# 52. Definition of Done

Scene Nine is complete when:

* the user can understand the most important learning in less than two minutes;
* meaningful changes are prioritized;
* every change has a reason and implication;
* uncertainty and contradiction remain visible;
* stable Understandings do not create noise;
* no-change is treated honestly;
* the highest-value next learning is clear;
* user stewardship receives follow-up;
* the homepage feels alive without becoming busy;
* the user wants to return again;
* no production architecture changes;
* Experience Alpha demonstrates a deterministic simulation of the complete loop
  from question to organizational learning; durable persistence remains future
  Runtime-integrated behavior.

The final review question is:

> Does returning to Discovery feel like rejoining an intelligence that has become more useful since the user left?

Only an unambiguous yes is acceptable.
