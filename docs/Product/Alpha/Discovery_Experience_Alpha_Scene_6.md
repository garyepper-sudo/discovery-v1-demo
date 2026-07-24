# Discovery Experience Alpha

# Scene Six Specification — Examine

**Status:** Historical detailed Alpha interaction specification — not implemented as a standalone route
**Version:** 0.1
**Experience stage:** Calibrated trust
**Implemented Alpha location:** Examination is entered from `/alpha/understand`; no `/alpha/examine` route exists
**Previous scene:** Understand
**Historical next concept:** Challenge or Confirm
**Implemented next routed scene:** Respond
**Primary objective:** Help the user determine whether Discovery’s current Understanding is credible, well-supported, and appropriately uncertain.
**Core trust requirement:** Discovery must explain why it believes the synthesis, what evidence weakens it, and what would change its mind.

This document preserves the original standalone Examine design. The committed
prototype does not implement this full scene or a separate Examine route.
Examination remains a conceptual interaction within Understand, whose primary
action proceeds to the fixture-backed Respond experience. The evidence,
alternatives, and falsification behavior described below remain design intent
unless directly present in the prototype.

---

# 1. Scene Purpose

Scene Six answers the user’s natural question:

> Why does Discovery believe this?

The user has seen the first Living Understanding.

They now need a clear path from:

* evidence;
* to recurring observations;
* to interpretation;
* to the current synthesis.

The scene must make Discovery’s reasoning inspectable without turning the experience into:

* a technical trace viewer;
* a raw evidence dump;
* a long report;
* an AI explanation transcript;
* a defense of the system’s conclusion.

Discovery should behave like a thoughtful organizational researcher showing its work.

The user should leave with a more accurate understanding of:

* what supports the synthesis;
* what does not fit;
* which alternative explanations remain;
* where causal uncertainty persists;
* what evidence could materially change the Understanding.

---

# 2. Primary User Outcome

The user evaluates the credibility of the Understanding.

They should be able to answer:

* What is the strongest supporting evidence?
* Is the conclusion based on one source or several?
* What evidence contradicts it?
* Which assumptions remain?
* What would weaken the current explanation?
* What would strengthen an alternative explanation?
* Can I inspect the source context if needed?

The user should not need to review every observation to form a trust judgment.

---

# 3. Primary Discovery Outcome

Discovery presents an evidence-to-meaning explanation of the current Understanding.

The scene should establish:

* supporting evidence categories;
* strongest recurring observations;
* interpretation steps;
* alternative explanations;
* meaningful contradictions;
* source limitations;
* falsification conditions;
* confidence rationale;
* accessible evidence traceability.

The scene does not prove that Discovery is correct.

It shows why the current synthesis is the strongest available explanation.

---

# 4. Emotional Objective

The emotional transition is:

```text
Interest

↓

Inspection

↓

Understanding of reasoning

↓

Calibrated trust
```

The user should think:

> Discovery has a defensible reason for believing this, and it is clear about what could make the explanation wrong.

The user should not think:

* Discovery is arguing with me;
* I need to read every source;
* the reasoning is infallible;
* the contradiction is insignificant;
* confidence is based only on evidence volume.

---

# 5. Canonical Alpha Context

## Living Understanding

> Engineering Productivity

## Current synthesis

> Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Confidence

> Moderate

## Strongest current explanation

> Post-planning ownership ambiguity

## Largest remaining unknown

> Why one Engineering team delivers reliably despite using a similar ownership structure.

---

# 6. Primary Scene Message

## Headline

> Why Discovery currently believes this

Alternative:

> How Discovery reached this Understanding

Preferred Alpha copy:

> Why Discovery currently believes this

The word **currently** is important.

It communicates that the reasoning is:

* time-bound;
* revisable;
* evidence-dependent;
* not a permanent declaration.

## Supporting copy

> The current synthesis is supported by several evidence types, weakened by meaningful contradictions, and limited by unresolved causal questions.

Do not use:

* Explainable AI
* Model reasoning
* Chain of thought
* Cognitive trace
* Analysis details
* Proof
* Confidence breakdown

---

# 7. Page Structure

Scene Six contains eight primary regions:

```text
Application frame

Understanding context

Reasoning summary

Strongest supporting evidence

Contradicting evidence

Alternative explanations

What would change Discovery’s mind

Source and history access
```

The first view should emphasize the reasoning structure, not raw evidence.

---

# 8. Transition from Scene Five

## 8.1 Preserved context

The Understanding title and concise synthesis remain visible at the top.

They should appear in a quieter treatment than on Scene Five.

## 8.2 Transition behavior

When the user selects:

> Examine this Understanding

the synthesis remains anchored while the reasoning structure unfolds below it.

Recommended sequence:

1. Scene Five supporting sections recede.
2. The current synthesis remains.
3. The confidence rationale appears.
4. Supporting and contradicting evidence groups appear.
5. “What would change my mind?” becomes visible.
6. Evidence-level disclosures remain collapsed.

This should feel like looking beneath the Understanding rather than navigating to a separate technical product.

---

# 9. Desktop Layout

## 9.1 Main container

Recommended maximum width:

```text
1080–1160 px
```

Primary reading width:

```text
720–820 px
```

## 9.2 Suggested composition

```text
Understanding context

Why Discovery currently believes this

Reasoning summary

Strongest supporting evidence

Meaningful contradiction

Alternative explanations

What would change Discovery’s mind?

Evidence and history access
```

A right rail may show a restrained reasoning map, but only if it does not become a graph or dashboard.

## 9.3 Preferred default

A single-column reasoning narrative is preferred for Alpha.

It better supports:

* reading order;
* progressive disclosure;
* accessibility;
* executive comprehension.

---

# 10. Tablet and Mobile Layout

## 10.1 Tablet

* maintain one primary column;
* collapse detailed evidence by default;
* show one strongest supporting pattern first;
* place contradiction immediately after support;
* keep falsification conditions visible without excessive scrolling.

## 10.2 Mobile

Priority order:

1. Current synthesis
2. Confidence explanation
3. Strongest support
4. Contradiction
5. What would change Discovery’s mind
6. Alternative explanations
7. Source access
8. Historical reasoning changes

## 10.3 Disclosure behavior

Expanded evidence must open inline.

Avoid side panels on mobile.

The user must be able to close an expanded section and return to the same reading position.

---

# 11. Reasoning Summary

The scene should begin with a concise explanation of the current reasoning.

## Canonical summary

> Discovery’s current explanation is strongest because three different evidence types point to the same post-planning pattern: delayed work changes ownership more often, teams repeatedly seek decision clarification after work begins, and delivery friction is concentrated across cross-functional dependencies.

## Qualification

> The explanation remains moderate rather than high confidence because the evidence does not fully establish causation, and one comparable team performs reliably under similar formal conditions.

## Requirements

The summary must:

* identify evidence diversity;
* identify convergence;
* state the leading explanation;
* explain the confidence limitation;
* mention the contradiction;
* avoid claiming proof.

---

# 12. Reasoning Structure

Discovery’s reasoning should be presented in four stages:

```text
Observed pattern

↓

Interpretation

↓

Current explanation

↓

Qualification
```

## Observed pattern

> Delayed work changes ownership or waits for clarification more often than reliably delivered work.

## Interpretation

> Unclear ownership appears to create coordination and escalation work after delivery has begun.

## Current explanation

> Post-planning ownership ambiguity is the strongest current explanation for slowed delivery.

## Qualification

> Similar formal ownership conditions do not produce the same outcome in every team, so formal structure alone is insufficient as a causal explanation.

This structure should be visible without opening technical detail.

---

# 13. Strongest Supporting Evidence

## Heading

> Strongest supporting evidence

The scene should present no more than three primary evidence groups by default.

Each group should include:

* concise finding;
* evidence category;
* why it matters;
* limitation;
* inspect action.

---

# 14. Supporting Evidence One — Ownership and Delay

## Finding

> Delayed initiatives change ownership or wait for ownership clarification more often than reliably delivered initiatives.

## Evidence category

> Project and issue history

## Why it matters

> This distinguishes delayed work from work that moves reliably through delivery.

## Interpretation

> Ownership instability is associated with delivery friction.

## Limitation

> The records do not establish whether ownership changes caused the delay or occurred because the work was already in difficulty.

## Strength

> Strong support

The strength label should remain qualitative.

---

# 15. Supporting Evidence Two — Clarification After Commitment

## Finding

> Teams repeatedly seek clarification about decision authority after delivery begins.

## Evidence category

> Selected team conversations

## Why it matters

> The behavior occurs during the same period in which delivery momentum declines.

## Interpretation

> Formal ownership may exist while practical decision authority remains unclear.

## Limitation

> Conversation patterns reveal repeated behavior but may not capture unspoken context or decisions made outside the reviewed channels.

## Strength

> Strong support

---

# 16. Supporting Evidence Three — Cross-Functional Concentration

## Finding

> Clarification and escalation are concentrated where work crosses Product, Design, and Engineering boundaries.

## Evidence categories

* Selected team conversations
* Sprint retrospectives
* Project history

## Why it matters

> The pattern is more consistent with an organizational coordination constraint than with generalized low individual productivity.

## Interpretation

> Cross-functional dependencies appear to amplify ownership ambiguity.

## Limitation

> The evidence does not yet distinguish whether the primary mechanism is structure, governance, leadership behavior, or local team practice.

## Strength

> Moderate to strong support

---

# 17. Evidence Convergence

The user should be able to see why evidence diversity matters.

## Heading

> Why the evidence is meaningful together

## Canonical copy

> No single source establishes the explanation. The current confidence comes from different evidence types describing the same period and behavior from different perspectives.

## Evidence contribution

**Project history**

> Shows where delay and ownership movement occur.

**Team conversations**

> Shows how teams respond when ownership becomes unclear.

**Retrospectives**

> Shows that the pattern recurs across time and teams.

**Planning documents**

> Weaken the alternative explanation that formal reprioritization is the primary cause.

## Rule

Evidence volume alone must not determine confidence.

Convergence and discrimination among explanations matter more than raw counts.

---

# 18. Contradicting Evidence

## Heading

> Evidence that does not fit cleanly

Preferred over:

* Conflicting data
* Anomalies
* Errors
* Outliers

## Canonical contradiction

> One comparable Engineering team delivers reliably despite operating under apparently similar formal ownership conditions.

## Why it matters

> If ownership structure alone caused the slowdown, this team would be expected to experience similar delivery friction.

## Current interpretation

> Leadership behavior, local decision norms, team practices, or hidden structural differences may moderate the broader pattern.

## Effect on confidence

> This contradiction prevents Discovery from assigning high confidence to a causal explanation.

## Action

> Examine this contradiction

---

# 19. Secondary Contradiction

The second contradiction may remain behind progressive disclosure.

## Summary

> Team accounts describe shifting priorities, while formal plans show comparatively stable commitments.

## Current interpretation

> Informal reprioritization may occur outside published plans, or teams may experience decision uncertainty as changing priority.

## Why it matters

> Discovery should not dismiss priority instability entirely simply because formal documents remain stable.

## Effect

> The priority-instability explanation is weakened, not eliminated.

---

# 20. Alternative Explanations

## Heading

> Explanations Discovery has not ruled out

The scene should show two or three alternatives.

Each alternative includes:

* current plausibility;
* supporting evidence;
* weakening evidence;
* what would clarify it.

---

# 21. Alternative One — Informal Priority Instability

## Current status

> Plausible but weakened

## Supporting evidence

> Some teams report changing direction after planning.

## Weakening evidence

> Formal product plans and commitments remain more stable than expected.

## What would clarify it

> Compare informal decisions, meeting records, and delivery changes that occur without formal plan updates.

---

# 22. Alternative Two — Structural Dependency Complexity

## Current status

> Plausible

## Supporting evidence

> Delivery friction is concentrated across Product, Design, and Engineering dependencies.

## Weakening evidence

> Some cross-functional work proceeds reliably under similar formal structures.

## What would clarify it

> Compare dependency design and decision practices in reliable and delayed initiatives.

---

# 23. Alternative Three — Leadership or Local Team Practice

## Current status

> Increasingly plausible

## Supporting evidence

> One team performs reliably despite similar formal ownership conditions.

## Weakening evidence

> The current evidence does not yet show which local behavior differs.

## What would clarify it

> Compare escalation, delegation, and decision practices across teams.

---

# 24. What Would Change Discovery’s Mind

This is one of the most important sections in the entire product.

## Heading

> What would change Discovery’s mind?

## Introductory copy

> The current explanation should weaken if new evidence does not behave as the explanation predicts.

## Canonical falsification conditions

Discovery would become less confident in ownership ambiguity as the primary explanation if:

1. delayed initiatives show stable ownership and clear decision authority;
2. clarification behavior occurs equally often in reliably delivered work;
3. delays concentrate before commitment rather than after it;
4. changes in priority explain timing differences more consistently;
5. teams with clearer decision ownership do not deliver more reliably;
6. the apparently comparable high-performing team is found to have materially different hidden conditions.

## Why this matters

> These conditions make the Understanding testable rather than self-protecting.

## Action

> Test the current explanation

This may lead to a future learning plan or investigation workflow.

---

# 25. What Would Strengthen the Explanation

A secondary disclosure may show:

> What would increase confidence?

Canonical conditions:

* repeated evidence across additional initiatives;
* clear temporal ordering between ambiguity and delay;
* reliable teams consistently showing clearer decision practices;
* the pattern appearing across multiple organizational periods;
* alternative explanations becoming less consistent with observed outcomes.

## Rule

Discovery should show both:

* what would weaken the explanation;
* what would strengthen it.

Trust requires symmetry.

---

# 26. Confidence Rationale

## Heading

> Why confidence is moderate

## Positive factors

* multiple source categories converge;
* the pattern recurs across teams and time periods;
* delayed and reliably delivered work differ meaningfully;
* an important alternative explanation has weakened.

## Limiting factors

* causal direction is unresolved;
* one comparable team contradicts a simple structural explanation;
* informal decisions may be missing from formal records;
* selected conversations may not represent all relevant behavior;
* leadership and local practices remain underexplored.

## Canonical conclusion

> The evidence supports a strong organizational pattern, but not a definitive causal claim.

---

# 27. Evidence Hierarchy

Evidence should be grouped by interpretive importance.

## Level One — Strongest evidence

Visible by default:

* ownership movement;
* clarification behavior;
* cross-functional concentration.

## Level Two — Supporting context

Available through expansion:

* recurring retrospective themes;
* planning stability;
* source coverage;
* timing comparisons.

## Level Three — Observation summaries

Available on request:

* specific summarized observations;
* selected dates;
* initiative comparisons;
* source lineage.

## Level Four — Source context

Access-controlled detail:

* document excerpts;
* conversation context;
* record-level history;
* governance-aware visibility.

The scene must never begin at Level Three or Four.

---

# 28. Evidence Detail Interaction

## Action labels

* Examine evidence
* See supporting observations
* View source context

Avoid generic:

* Details
* More
* Open data
* Raw view

## Expanded evidence content

Each evidence group may show:

* source category;
* date range;
* scope;
* observation count;
* strongest observation summaries;
* contradictory observations;
* limitations;
* lineage.

## Alpha boundary

Use prepared evidence summaries.

Do not expose real private content or imply that production permissions are active.

---

# 29. Observation Summaries

The Alpha may include prepared observation examples.

## Example One

**Observation**

> Ownership was reassigned or escalated in 8 of 11 significantly delayed initiatives.

**Context**

> Engineering initiatives from the last two quarters.

**Interpretive relevance**

> Supports association between ownership instability and delay.

**Limitation**

> Reassignment may result from delay rather than cause it.

## Example Two

**Observation**

> Decision clarification appeared after work began in 14 reviewed project conversations.

**Context**

> Approved Product, Design, and Engineering project channels.

**Interpretive relevance**

> Supports the timing of practical ownership ambiguity.

**Limitation**

> Conversation sampling may omit decisions made elsewhere.

## Example Three

**Observation**

> Formal priority commitments changed materially in only 2 of 13 reviewed initiatives.

**Interpretive relevance**

> Weakens formal reprioritization as the primary explanation.

**Limitation**

> Informal priority shifts may not appear in plans.

---

# 30. Source Context Access

## User action

> View source context

## Required behavior

Before displaying source-level material, Discovery should show:

* source type;
* approved scope;
* date;
* why the source is relevant;
* whether any content is summarized;
* access limitations where applicable.

## Governance relationship

The product must not imply that evidence visibility is universal.

Future production behavior must respect:

* principal identity;
* membership;
* purpose;
* source permissions;
* sensitivity;
* disclosure policy;
* revocation.

The Alpha may demonstrate the intended interaction with prepared content only.

---

# 31. Reasoning History

The user may inspect how Discovery’s explanation changed.

## Heading

> How the reasoning changed

## Canonical sequence

**Initial orientation**

> Planning, ownership, coordination, and execution were all plausible explanations.

**After retrospectives**

> Friction appeared more concentrated after commitment.

**After project comparison**

> Ownership instability became a stronger candidate explanation.

**After planning review**

> Formal priority instability weakened.

**After conversation context**

> Ownership ambiguity became the leading explanation.

**After integration**

> Confidence stabilized at Moderate because a meaningful contradiction remained.

## Rule

The history should show model revision, not just a timestamped activity log.

---

# 32. User Contribution Entry

The user should be able to contribute directly while examining.

## Actions

* Add context
* Something is missing
* I interpret this differently

## Add-context prompt

> What context could change how Discovery should interpret this evidence?

## Example user contribution

> Architecture decisions are controlled by a platform group that is not represented in formal project ownership.

## Discovery response

> This could explain why formal ownership appears stable while practical decision authority remains unclear. Discovery should examine this as an alternative mechanism.

This leads naturally to Scene Seven.

---

# 33. Primary Actions

## Primary action

> Respond to this Understanding

This advances to Scene Seven.

Alternative:

> Confirm or challenge

Preferred Alpha label:

> Respond to this Understanding

It accommodates:

* confirmation;
* correction;
* disagreement;
* additional context;
* investigation.

## Secondary action

> Return to Understanding

Returns to Scene Five.

## Tertiary action

> Follow this Understanding

May remain available but secondary.

---

# 34. Action Hierarchy

Recommended hierarchy:

1. Respond to this Understanding
2. Return to Understanding
3. Test the current explanation
4. Follow this Understanding
5. View source context

Evidence inspection is important but should not become the primary product action.

---

# 35. Visual Treatment

## 35.1 Overall character

The scene should feel:

* transparent;
* rigorous;
* calm;
* structured;
* readable;
* nondefensive.

## 35.2 Evidence groups

Use clear sections rather than metric cards.

Each group may use:

* a restrained heading;
* one concise finding;
* one interpretation;
* one limitation;
* one disclosure action.

## 35.3 Reasoning map

A minimal vertical reasoning chain may appear:

```text
Observed pattern
↓
Interpretation
↓
Current explanation
↓
Qualification
```

Avoid:

* graph canvases;
* branching node diagrams;
* technical lineage trees;
* animated causal networks.

## 35.4 Contradiction

Contradicting evidence should receive equal interpretive dignity.

It should not be visually buried beneath support.

---

# 36. Typography Roles

## Scene headline

Suggested desktop range:

```text
34–44 px
```

## Current synthesis

Compact large body.

## Evidence-group heading

Medium heading.

## Finding

Primary body with emphasis.

## Interpretation and limitation

Secondary body.

## Falsification conditions

Readable numbered list.

## Source details

Small body, but not so small that they appear legally defensive.

---

# 37. Color Semantics

Use semantic treatments for:

* support;
* contradiction;
* uncertainty;
* weakened explanation;
* alternative explanation.

Color remains secondary to labels.

Avoid:

* green equals true;
* red equals false;
* traffic-light confidence;
* warning styling for contradiction;
* visually dimming alternative explanations into irrelevance.

---

# 38. Motion Specification

## 38.1 Scene arrival

The current synthesis remains stable.

Reasoning sections may appear through short fades.

Suggested duration:

```text
250–450 ms
```

## 38.2 Disclosure expansion

Use inline height and opacity transitions.

Keep motion restrained.

## 38.3 Evidence selection

Selecting an observation should reveal context without losing the reasoning position.

## 38.4 Return transition

Returning to Scene Five should collapse the reasoning beneath the persistent synthesis.

## 38.5 Reduced motion

Use immediate state changes or short opacity transitions.

No reasoning information may depend on animation.

---

# 39. Copy Principles

Scene Six copy should be:

* specific;
* evidentiary;
* symmetric;
* qualified;
* testable;
* concise.

## Preferred language

* supports;
* weakens;
* is associated with;
* suggests;
* current interpretation;
* alternative explanation;
* limitation;
* contradiction;
* would change Discovery’s mind;
* remains unresolved.

## Avoid

* proves;
* confirms beyond doubt;
* truth;
* root cause;
* unquestionable;
* hallucination;
* chain of thought;
* hidden reasoning;
* AI confidence;
* the model decided.

---

# 40. No Inspectable Evidence State

The product must support a situation where Discovery can present a synthesis but the user cannot access all source context.

## Message

> Some supporting evidence cannot be shown in your current access context.

## Show

* the evidence category;
* the summarized contribution;
* the reason access is limited, where permissible;
* how the limitation affects trust;
* whether another accessible source supports the same conclusion.

## Rule

Discovery must never invent evidence summaries to fill an access gap.

---

# 41. Weak Evidence State

If the synthesis has limited support:

## Message

> The current explanation is provisional.

## Supporting copy

> The evidence identifies a recurring pattern but does not yet discriminate reliably among the leading explanations.

## Show

* strongest observation;
* key alternatives;
* what evidence is missing;
* why confidence remains low.

## Primary action

> Review the next learning opportunity

---

# 42. Contradiction-Dominant State

If contradiction materially weakens the synthesis:

## Message

> The current explanation no longer fits the evidence consistently.

## Show

* previous explanation;
* contradicting evidence;
* reduced confidence;
* reopened alternatives;
* next learning opportunity.

## Rule

The scene should not attempt to defend the old synthesis.

---

# 43. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* section headings for support, contradiction, alternatives, and falsification;
* semantic lists;
* descriptive disclosure controls;
* accessible evidence-strength labels.

## Reasoning chain

The reasoning chain must be understandable in ordinary document order.

Do not depend on visual arrows.

## Evidence strength

Screen-reader text should explain qualitative strength.

Example:

> Strong support. This finding appears across multiple initiatives, but does not establish causal direction.

## Contradiction

Contradicting evidence must be explicitly announced as such.

## Expanded evidence

Expanded content should:

* maintain logical focus;
* preserve reading position;
* expose clear close or collapse controls;
* associate source context with the relevant evidence group.

## Focus after transition

Move focus to:

> Why Discovery currently believes this

Do not move directly to an evidence control.

---

# 44. Component Hierarchy

```text
ExamineScene
├── ExperienceFrame
├── UnderstandingContext
│   ├── UnderstandingName
│   ├── CurrentSynthesis
│   └── ConfidenceSummary
├── ExaminationHeader
│   ├── ExamineHeadline
│   └── ExamineSupportingCopy
├── ReasoningSummary
│   ├── EvidenceConvergenceSummary
│   └── ConfidenceQualification
├── ReasoningChain
│   ├── ObservedPattern
│   ├── Interpretation
│   ├── CurrentExplanation
│   └── Qualification
├── SupportingEvidence
│   └── EvidenceGroup[]
│       ├── EvidenceFinding
│       ├── EvidenceCategory
│       ├── EvidenceImportance
│       ├── EvidenceInterpretation
│       ├── EvidenceLimitation
│       └── EvidenceDisclosure
├── ContradictingEvidence
│   └── ContradictionGroup[]
├── AlternativeExplanations
│   └── AlternativeExplanation[]
├── FalsificationConditions
│   ├── WeakeningConditions
│   └── StrengtheningConditions
├── ConfidenceRationale
├── ReasoningHistory
├── SourceContextAccess
└── ExaminationActions
    ├── RespondToUnderstandingAction
    ├── ReturnToUnderstandingAction
    └── TestExplanationAction
```

---

# 45. Experience State Contract

```ts
type EvidenceStrength =
  | "limited"
  | "moderate"
  | "strong"
  | "very-strong";

type AlternativePlausibility =
  | "weakened"
  | "plausible"
  | "increasing"
  | "strong";

interface EvidenceObservationViewModel {
  id: string;
  summary: string;
  context: string;
  interpretiveRelevance: string;
  limitation: string;
  occurredAt: string | null;
}

interface EvidenceGroupViewModel {
  id: string;
  title: string;
  sourceCategory: string;
  finding: string;
  whyItMatters: string;
  interpretation: string;
  limitation: string;
  strength: EvidenceStrength;
  observationCount: number;
  observations: EvidenceObservationViewModel[];
  sourceContextAvailable: boolean;
  accessState:
    | "available"
    | "summarized-only"
    | "restricted"
    | "unavailable";
}

interface AlternativeExplanationViewModel {
  id: string;
  name: string;
  plausibility: AlternativePlausibility;
  supportingEvidence: string;
  weakeningEvidence: string;
  clarificationOpportunity: string;
}

interface FalsificationConditionViewModel {
  id: string;
  condition: string;
  effect: string;
}

interface ExaminationViewModel {
  understandingId: string;
  synthesis: string;
  confidenceLevel: string;
  confidenceExplanation: string;
  reasoningSummary: string;
  observedPattern: string;
  interpretation: string;
  currentExplanation: string;
  qualification: string;
  supportingEvidence: EvidenceGroupViewModel[];
  contradictions: UnderstandingContradictionViewModel[];
  alternatives: AlternativeExplanationViewModel[];
  weakeningConditions: FalsificationConditionViewModel[];
  strengtheningConditions: FalsificationConditionViewModel[];
  reasoningHistory: Array<{
    sequence: number;
    label: string;
    explanation: string;
  }>;
}

interface ExamineSceneState {
  status:
    | "ready"
    | "opening-evidence"
    | "opening-source-context"
    | "failed";
  examination: ExaminationViewModel | null;
  expandedEvidenceIds: string[];
  expandedContradictionIds: string[];
  expandedAlternativeIds: string[];
  isReasoningHistoryExpanded: boolean;
  error: string | null;
}
```

## Emitted intents

```ts
interface RespondToUnderstandingIntent {
  understandingId: string;
  initiatedAt: string;
}

interface TestCurrentExplanationIntent {
  understandingId: string;
  explanation: string;
  weakeningConditionIds: string[];
  initiatedAt: string;
}

interface ViewEvidenceSourceIntent {
  understandingId: string;
  evidenceGroupId: string;
  requestedAt: string;
}
```

These remain experience-layer contracts.

---

# 46. Canonical Alpha Examination Model

```ts
const engineeringProductivityExamination: ExaminationViewModel = {
  understandingId: "engineering-productivity",
  synthesis:
    "Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.",
  confidenceLevel: "Moderate",
  confidenceExplanation:
    "Multiple source categories support the same pattern, but causal direction and one meaningful contradiction remain unresolved.",
  reasoningSummary:
    "Discovery’s current explanation is strongest because project history, team conversations, and retrospectives point to the same post-planning pattern from different perspectives.",
  observedPattern:
    "Delayed work changes ownership or waits for clarification more often than reliably delivered work.",
  interpretation:
    "Unclear ownership appears to create coordination and escalation work after delivery has begun.",
  currentExplanation:
    "Post-planning ownership ambiguity is the strongest current explanation for slowed delivery.",
  qualification:
    "Similar formal ownership conditions do not produce the same outcome in every team, so formal structure alone is insufficient as a causal explanation.",
  supportingEvidence: [
    {
      id: "ownership-and-delay",
      title: "Ownership movement and delayed delivery",
      sourceCategory: "Project and issue history",
      finding:
        "Delayed initiatives change ownership or wait for ownership clarification more often than reliably delivered initiatives.",
      whyItMatters:
        "This distinguishes delayed work from work that moves reliably through delivery.",
      interpretation:
        "Ownership instability is associated with delivery friction.",
      limitation:
        "The records do not establish whether ownership changes caused the delay or occurred because the work was already in difficulty.",
      strength: "strong",
      observationCount: 11,
      observations: [
        {
          id: "ownership-delay-observation",
          summary:
            "Ownership was reassigned or escalated in 8 of 11 significantly delayed initiatives.",
          context:
            "Engineering initiatives from the last two quarters.",
          interpretiveRelevance:
            "Supports an association between ownership instability and delay.",
          limitation:
            "Reassignment may result from delay rather than cause it.",
          occurredAt: null,
        },
      ],
      sourceContextAvailable: true,
      accessState: "available",
    },
    {
      id: "clarification-after-commitment",
      title: "Clarification after commitment",
      sourceCategory: "Selected team conversations",
      finding:
        "Teams repeatedly seek clarification about decision authority after delivery begins.",
      whyItMatters:
        "The behavior occurs during the same period in which delivery momentum declines.",
      interpretation:
        "Formal ownership may exist while practical decision authority remains unclear.",
      limitation:
        "Conversation patterns may omit decisions made outside the reviewed channels.",
      strength: "strong",
      observationCount: 14,
      observations: [
        {
          id: "clarification-observation",
          summary:
            "Decision clarification appeared after work began in 14 reviewed project conversations.",
          context:
            "Approved Product, Design, and Engineering project channels.",
          interpretiveRelevance:
            "Supports the timing of practical ownership ambiguity.",
          limitation:
            "Conversation sampling may omit decisions made elsewhere.",
          occurredAt: null,
        },
      ],
      sourceContextAvailable: true,
      accessState: "summarized-only",
    },
    {
      id: "cross-functional-concentration",
      title: "Cross-functional concentration",
      sourceCategory:
        "Selected conversations, retrospectives, and project history",
      finding:
        "Clarification and escalation are concentrated where work crosses Product, Design, and Engineering boundaries.",
      whyItMatters:
        "The pattern is more consistent with an organizational coordination constraint than with generalized low individual productivity.",
      interpretation:
        "Cross-functional dependencies appear to amplify ownership ambiguity.",
      limitation:
        "The evidence does not yet distinguish whether the primary mechanism is structure, governance, leadership behavior, or local team practice.",
      strength: "strong",
      observationCount: 6,
      observations: [],
      sourceContextAvailable: false,
      accessState: "summarized-only",
    },
  ],
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
  alternatives: [
    {
      id: "informal-priority-instability",
      name: "Informal priority instability",
      plausibility: "weakened",
      supportingEvidence:
        "Some teams report changing direction after planning.",
      weakeningEvidence:
        "Formal product plans and commitments remain more stable than expected.",
      clarificationOpportunity:
        "Compare informal decisions, meeting records, and delivery changes that occur without formal plan updates.",
    },
    {
      id: "structural-dependency-complexity",
      name: "Structural dependency complexity",
      plausibility: "plausible",
      supportingEvidence:
        "Delivery friction is concentrated across Product, Design, and Engineering dependencies.",
      weakeningEvidence:
        "Some cross-functional work proceeds reliably under similar formal structures.",
      clarificationOpportunity:
        "Compare dependency design and decision practices in reliable and delayed initiatives.",
    },
    {
      id: "leadership-local-practice",
      name: "Leadership or local team practice",
      plausibility: "increasing",
      supportingEvidence:
        "One team performs reliably despite similar formal ownership conditions.",
      weakeningEvidence:
        "The current evidence does not yet show which local behavior differs.",
      clarificationOpportunity:
        "Compare escalation, delegation, and decision practices across teams.",
    },
  ],
  weakeningConditions: [
    {
      id: "stable-ownership-in-delayed-work",
      condition:
        "Delayed initiatives show stable ownership and clear decision authority.",
      effect:
        "Ownership ambiguity would become less plausible as the primary explanation.",
    },
    {
      id: "clarification-equal-in-reliable-work",
      condition:
        "Clarification behavior occurs equally often in reliably delivered work.",
      effect:
        "The observed behavior would no longer discriminate between delayed and reliable delivery.",
    },
    {
      id: "delay-before-commitment",
      condition:
        "Delays concentrate before commitment rather than after it.",
      effect:
        "The post-planning explanation would weaken.",
    },
    {
      id: "priority-change-better-explanation",
      condition:
        "Priority changes explain delivery timing more consistently.",
      effect:
        "Priority instability would become a stronger alternative.",
    },
    {
      id: "clearer-ownership-no-improvement",
      condition:
        "Teams with clearer decision ownership do not deliver more reliably.",
      effect:
        "The assumed organizational leverage of ownership clarity would weaken.",
    },
  ],
  strengtheningConditions: [
    {
      id: "additional-initiative-recurrence",
      condition:
        "The same pattern recurs across additional initiatives and time periods.",
      effect:
        "Confidence in the organizational pattern would increase.",
    },
    {
      id: "temporal-ordering",
      condition:
        "Ownership ambiguity consistently appears before delivery delay.",
      effect:
        "The causal explanation would become more plausible.",
    },
    {
      id: "reliable-teams-clearer-practice",
      condition:
        "Reliable teams consistently demonstrate clearer decision practices.",
      effect:
        "Local decision practice would become a stronger moderating explanation.",
    },
  ],
  reasoningHistory: [
    {
      sequence: 1,
      label: "Initial orientation",
      explanation:
        "Planning, ownership, coordination, and execution were all plausible explanations.",
    },
    {
      sequence: 2,
      label: "Execution timing",
      explanation:
        "Friction appeared more concentrated after commitment.",
    },
    {
      sequence: 3,
      label: "Ownership movement",
      explanation:
        "Ownership instability became a stronger candidate explanation.",
    },
    {
      sequence: 4,
      label: "Priority stability",
      explanation:
        "Formal priority instability weakened.",
    },
    {
      sequence: 5,
      label: "Clarification behavior",
      explanation:
        "Ownership ambiguity became the leading explanation.",
    },
    {
      sequence: 6,
      label: "Integrated synthesis",
      explanation:
        "Confidence stabilized at Moderate because a meaningful contradiction remained.",
    },
  ],
};
```

---

# 47. Determinism Requirements

For the canonical Alpha examination:

* reasoning order remains fixed;
* supporting evidence order remains fixed;
* evidence-strength labels remain fixed;
* contradictions remain fixed;
* alternative explanations remain fixed;
* falsification conditions remain fixed;
* reasoning history remains fixed;
* expanding evidence does not change the Understanding;
* returning to Scene Five preserves examination state during the session where appropriate;
* source-access states remain deterministic;
* the examination model remains consistent with Scene Four and Scene Five;
* no hidden component logic generates new conclusions.

---

# 48. Product Analytics

Suggested events:

```text
examine_scene_viewed
reasoning_support_expanded
reasoning_contradiction_expanded
reasoning_alternative_expanded
reasoning_falsification_viewed
reasoning_history_viewed
evidence_observation_viewed
evidence_source_context_requested
examination_response_selected
examination_return_selected
```

Suggested properties:

* understanding identifier;
* evidence-group identifier;
* evidence strength;
* contradiction identifier;
* alternative identifier;
* source-access state;
* time to first expansion;
* primary response selected.

Do not record raw source content or user-contributed context in general product analytics.

---

# 49. Quality Checks

Confirm:

1. The current synthesis remains visible.
2. The reasoning summary fits within a short reading window.
3. Evidence support is grouped by meaning, not source count.
4. At least three evidence types converge.
5. Each evidence group has a limitation.
6. Association is not described as causation.
7. Contradicting evidence receives prominent treatment.
8. Alternative explanations remain visible.
9. The user can see what would weaken the explanation.
10. The user can see what would strengthen it.
11. Confidence rationale is balanced.
12. Evidence volume is not presented as proof.
13. Raw evidence is progressively disclosed.
14. Source access respects intended governance boundaries.
15. The reasoning history shows revision.
16. Discovery does not expose private chain-of-thought.
17. The scene does not resemble a technical trace viewer.
18. The scene does not resemble a report appendix.
19. The scene does not defend the Understanding against the user.
20. A weak-evidence state exists.
21. A contradiction-dominant state exists.
22. Restricted evidence is handled honestly.
23. Mobile reading order remains coherent.
24. Keyboard-only interaction works.
25. Reduced motion preserves comprehension.
26. The scene leads naturally to user response.

---

# 50. Acceptance Criteria

## Functional

* Scene Six receives the canonical Living Understanding.
* The reasoning summary is displayed.
* A four-stage reasoning structure is displayed.
* Three supporting evidence groups are available.
* Each evidence group includes a finding, interpretation, and limitation.
* Contradictions are available.
* Alternative explanations are available.
* Weakening conditions are available.
* Strengthening conditions are available.
* Confidence rationale is available.
* Reasoning history is available.
* Observation summaries may be expanded.
* Source context access states are handled deterministically.
* The user can return to Scene Five.
* The user can advance to Scene Seven.
* Restricted evidence does not expose unavailable content.
* Failure states preserve the current Understanding.

## Visual

* The synthesis remains the primary contextual anchor.
* Supporting evidence does not appear as metric cards.
* Contradictions are not visually buried.
* Falsification conditions are readable.
* Evidence limitations remain visible.
* The scene does not resemble a dashboard.
* The scene does not resemble a technical debugging tool.
* Progressive disclosure keeps the default view manageable.
* Mobile hierarchy preserves trust-critical content.
* Semantic states do not rely on color alone.

## Product

* The user understands why Discovery believes the synthesis.
* The user sees that multiple evidence types converge.
* The user understands why confidence is Moderate.
* The user understands the main contradiction.
* The user recognizes that alternative explanations remain.
* The user can describe what would change Discovery’s mind.
* The user does not interpret the evidence as proven causation.
* The user feels invited to contribute rather than pressured to accept.
* The user is prepared to confirm, challenge, or add context.

---

# 51. Prototype Review Script

A reviewer should complete the following:

1. Enter Scene Six from Scene Five.
2. Read the reasoning summary.
3. Explain the difference between observed pattern and current explanation.
4. Open Ownership and Delay.
5. Identify the limitation.
6. Open Clarification After Commitment.
7. Identify the evidence source and access state.
8. Read the primary contradiction.
9. Explain why it limits confidence.
10. Open the informal-priority alternative.
11. Explain why it is weakened but not eliminated.
12. Read What Would Change Discovery’s Mind.
13. Identify two weakening conditions.
14. Identify one strengthening condition.
15. Open reasoning history.
16. Explain how Discovery’s explanation changed.
17. Request source context for an available evidence group.
18. Request source context for a summarized-only group.
19. Confirm the access difference is clear.
20. Select Respond to this Understanding.
21. Confirm transition to Scene Seven.
22. Navigate back.
23. Confirm expanded-state behavior is coherent.
24. Repeat with weak evidence.
25. Repeat with contradiction dominant.
26. Repeat using only a keyboard.
27. Repeat with reduced motion.
28. Repeat at mobile width.

If the reviewer cannot identify what would weaken Discovery’s explanation, the scene is not complete.

---

# 52. Open Decisions

The following should be resolved through high-fidelity design and product testing:

1. Whether the four-stage reasoning structure is displayed visually or only through headings.
2. Whether all three evidence groups are visible by default.
3. Whether the main contradiction appears before or after supporting evidence.
4. Whether alternative explanations are always visible.
5. Whether falsification conditions use a numbered list or grouped cards.
6. Whether “What would change Discovery’s mind?” should appear earlier.
7. Whether evidence-strength labels add clarity.
8. Whether observation counts increase trust or create false precision.
9. Whether source context opens inline or in a dedicated evidence view.
10. Whether reasoning history appears before source access.
11. Whether users can annotate individual observations.
12. Whether the user can mark evidence as inaccurate.
13. Whether “Respond to this Understanding” is clearer than “Confirm or challenge.”
14. Whether the user may follow from this scene.
15. Whether confidence rationale should remain expanded by default.
16. Whether alternative explanations should include relative ordering.
17. Whether source limitations belong within each evidence group or a shared section.
18. Whether the reasoning view needs a printable or board-ready format later.
19. Whether sensitive evidence summaries require an explicit access notice.
20. Whether a test-explanation action belongs here or in a future investigation workflow.

Codex must not independently resolve these decisions.

---

# 53. Codex Implementation Boundary

Codex may implement:

* the canonical examination view;
* reasoning summary;
* four-stage reasoning structure;
* evidence groups;
* limitations;
* contradictions;
* alternative explanations;
* falsification conditions;
* reasoning history;
* source-access states;
* progressive disclosure;
* responsive behavior;
* accessibility;
* transition to Scene Seven;
* deterministic tests.

Codex must not:

* reveal private model chain-of-thought;
* generate live reasoning;
* process production evidence;
* expose inaccessible source content;
* modify Runtime;
* modify cognition;
* modify Governance;
* create new evidence architecture;
* claim causal certainty;
* remove contradictions;
* invent evidence;
* create a technical trace viewer;
* build a graph explorer;
* redesign the canonical reasoning hierarchy;
* add recommendations not supported by the Understanding;
* treat user disagreement as an error.

---

# 54. Definition of Done

Scene Six is complete when:

* the reasoning can be understood without reading raw evidence;
* evidence convergence is visible;
* evidence limitations are explicit;
* contradictions receive serious treatment;
* alternative explanations remain inspectable;
* confidence is explained symmetrically;
* falsification conditions are clear;
* reasoning history demonstrates revision;
* source access remains bounded;
* the user is invited to respond;
* the scene increases calibrated trust rather than certainty theater;
* no production architecture changes;
* Scene Seven receives a clear Understanding and the context needed for confirmation or challenge.

The final review question is:

> Can the user understand why Discovery currently believes this, what could make it wrong, and where their own context could improve the Understanding?

Only an unambiguous yes is acceptable.
