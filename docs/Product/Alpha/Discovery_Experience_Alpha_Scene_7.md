# Discovery Experience Alpha

# Scene Seven Specification — Challenge or Confirm

**Status:** Detailed Alpha interaction specification — design precursor to implemented Respond
**Version:** 0.1
**Experience stage:** Agency and stewardship
**Implemented Alpha route:** `/alpha/respond`
**Historical previous concept:** Examine
**Implemented previous routed scene:** Understand
**Next scene:** Follow
**Primary objective:** Let the user confirm, challenge, or enrich the Understanding without allowing unsupported feedback to overwrite evidence.
**Core trust requirement:** User input must improve the model while preserving evidence, uncertainty, contradiction, and historical traceability.

This document preserves the Challenge-or-Confirm design that became Respond in
the implemented prototype. The current response interaction uses deterministic
fixtures and local component state. It does not form production evidence,
update Organization Runtime, invoke cognition, or durably preserve a response.

---

# 1. Scene Purpose

Scene Seven answers:

> How can I respond to Discovery’s Understanding?

The user has now:

* reviewed the current synthesis;
* examined the supporting evidence;
* seen meaningful contradictions;
* considered alternative explanations;
* understood what would change Discovery’s mind.

Discovery must now invite the user to participate in stewardship of the Understanding.

The user may:

* confirm that the synthesis matches their experience;
* identify missing context;
* disagree with the interpretation;
* challenge specific evidence;
* correct terminology or scope;
* recommend further investigation.

This scene must avoid two opposite failures.

## Failure One — User feedback is ignored

The user feels that Discovery is presenting a fixed conclusion and merely collecting reactions.

## Failure Two — User feedback instantly becomes truth

The Understanding changes merely because an executive asserts something.

Discovery should treat user input as organizational evidence whose effect depends on:

* relevance;
* specificity;
* proximity to the issue;
* corroboration;
* contradiction;
* source type;
* governance;
* historical consistency.

The scene should make model stewardship feel natural, serious, and useful.

---

# 2. Primary User Outcome

The user contributes a meaningful response and understands how Discovery will treat it.

The user should leave believing:

* they can improve the Understanding;
* disagreement is welcome;
* confirmation is useful but not automatically decisive;
* missing context can generate a new hypothesis;
* Discovery distinguishes evidence from interpretation;
* Discovery preserves the prior Understanding;
* their response will have an explainable effect;
* unsupported authority does not override the model.

---

# 3. Primary Discovery Outcome

Discovery receives a structured user response linked to the current Understanding.

The response may affect:

* relevance confidence;
* interpretation confidence;
* scope;
* terminology;
* evidence quality;
* hypothesis priority;
* contradiction state;
* recommended next learning;
* user-follow intent.

The response should not directly rewrite the canonical synthesis in the Alpha unless the deterministic scenario explicitly specifies an updated provisional state.

This remains an experience-layer interaction.

It is not a production governance, evidence, or cognition contract.

---

# 4. Emotional Objective

The emotional transition is:

```text
Calibrated trust

↓

Participation

↓

Influence

↓

Stewardship
```

The user should think:

> Discovery takes my context seriously without simply agreeing with me.

The user should not think:

* I am grading an AI answer;
* clicking confirm proves the conclusion;
* disagreement breaks the system;
* my title gives my opinion automatic priority;
* Discovery silently changed its model;
* I need to reconstruct the entire analysis.

---

# 5. Canonical Alpha Context

## Understanding

> Engineering Productivity

## Current synthesis

> Engineering planning appears healthier than delivery outcomes suggest. The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.

## Confidence

> Moderate

## Largest remaining unknown

> Why one Engineering team delivers reliably despite using a similar ownership structure.

## Main contradiction

> One comparable Engineering team performs reliably under apparently similar formal ownership conditions.

---

# 6. Primary Scene Message

## Headline

> How does this Understanding compare with what you see?

This invites contribution without implying that the user must accept or reject the entire synthesis.

Alternative:

> Help Discovery improve this Understanding

Preferred Alpha copy:

> How does this Understanding compare with what you see?

## Supporting copy

> Confirm what fits, identify what is missing, or challenge the evidence and interpretation. Discovery will preserve your response and explain how it affects the Understanding.

This copy describes intended durable product behavior. The Alpha prototype
simulates the response and its effect within local deterministic interaction
state; it does not durably preserve the response.

Do not use:

* Was this answer correct?
* Rate this insight.
* Give feedback.
* Thumbs up or down.
* Improve the AI.
* Is Discovery right?
* Accept or reject analysis.

---

# 7. Page Structure

Scene Seven contains seven primary regions:

```text
Application frame

Understanding context

Response prompt

Response-path selection

Structured contribution

Expected effect preview

Submission and resulting state
```

The user should not need to revisit all reasoning content to respond.

The current synthesis and confidence remain available as context.

---

# 8. Transition from Scene Six

## 8.1 Preserved context

The Understanding title and concise synthesis remain visible.

A quiet link returns to the examination view.

## 8.2 Transition behavior

When the user selects:

> Respond to this Understanding

the evidence details recede while four response paths appear.

Recommended sequence:

1. Current synthesis remains anchored.
2. Response headline appears.
3. Four response paths become available.
4. No free-text field is shown until a path is selected.
5. The selected path expands into a structured response interaction.

This should feel like contributing to a shared model, not filling out a survey.

---

# 9. Response Paths

The Alpha experience supports four primary response paths:

1. **This matches what I see**
2. **Something important is missing**
3. **I interpret the evidence differently**
4. **Investigate further before I respond**

These paths should be presented with one-sentence explanations.

---

# 10. Path One — This Matches What I See

## Purpose

Allow the user to confirm experiential relevance without treating confirmation as proof.

## Supporting copy

> The current explanation is consistent with your experience of the organization.

## Follow-up prompt

> What specifically matches what you have seen?

## Optional response categories

* ownership becomes unclear after work begins;
* cross-functional dependencies create delay;
* teams stay active while delivery slows;
* planning is not the primary problem;
* another part of the synthesis.

The user may select one or more categories and add context.

## Free-text prompt

> Add an example or context that would help Discovery evaluate your confirmation.

## Canonical example

> Teams usually agree on the work, but decisions stall when Product and Engineering disagree about who can make the final call.

## Discovery treatment

Confirmation should:

* increase confidence that the synthesis is relevant;
* add an executive-observation source;
* potentially strengthen a mechanism hypothesis;
* not establish causality;
* not replace existing evidence;
* preserve the original confidence rationale.

## Canonical response message

> Your confirmation strengthens the relevance of the current Understanding, especially the role of decision authority after commitment. It does not independently establish that ownership ambiguity causes the slowdown.

---

# 11. Confirmation Effect

For the canonical Alpha:

## Before

> Moderate confidence · 74%

## After confirmation

Preferred presentation:

> Moderate confidence, strengthened

Optional secondary value:

> 76%

The qualitative interpretation remains primary.

## Why the effect is limited

> Your observation aligns with the current synthesis, but it represents one informed perspective and has not yet been independently compared with additional evidence.

## New learning opportunity

> Compare where final decision authority is explicit versus disputed across delayed and reliable initiatives.

## Rule

Do not significantly increase confidence solely because a senior executive confirms the result.

---

# 12. Path Two — Something Important Is Missing

## Purpose

Let the user introduce context that may alter scope or explanation.

## Supporting copy

> Important context may not appear in the reviewed information.

## Prompt

> What context is missing?

## Guidance

The user may describe:

* an organizational change;
* an informal authority relationship;
* a time period;
* a team difference;
* a market or customer constraint;
* a source that was not reviewed;
* a sensitive issue not documented elsewhere.

## Canonical Alpha contribution

> Architecture decisions are controlled by a separate platform group that is not represented in the project ownership data.

## Discovery interpretation

> This may explain why formal project ownership appears stable while practical decision authority remains unclear.

## Proposed effect

* create a new hypothesis;
* increase relevance of governance and cross-functional authority;
* expand the scope;
* reduce confidence in the current simplified explanation;
* recommend targeted learning.

## Canonical new hypothesis

> Practical decision authority may sit outside formal project ownership.

---

# 13. Missing-Context Effect

## Before

Strongest explanation:

> Post-planning ownership ambiguity

## After contribution

Refined provisional explanation:

> Post-planning ambiguity may arise because formal project ownership and practical decision authority are split across organizational groups.

## Confidence

The synthesis may become more specific but not necessarily more certain.

Recommended:

> Moderate confidence remains unchanged

## Why

> The contribution offers a plausible mechanism but has not yet been corroborated.

## New unknown

> How often platform-group authority delays or redirects decisions after Engineering work begins.

## Recommended next learning

> Compare architecture-decision requests, platform-group involvement, and delivery timing across delayed and reliable initiatives.

## Canonical response message

> This context may materially improve the current explanation. Discovery will preserve it as a new hypothesis rather than treating it as confirmed.

---

# 14. Path Three — I Interpret the Evidence Differently

## Purpose

Allow disagreement with the current reasoning while identifying precisely what is disputed.

## Supporting copy

> You agree that the evidence matters but believe it supports a different explanation.

## First prompt

> What do you interpret differently?

## Structured options

* the strongest explanation;
* the causal direction;
* the importance of the contradiction;
* the role of priority changes;
* the scope of the issue;
* the meaning of a term;
* another part of the reasoning.

## Second prompt

> What explanation fits the evidence better?

## Canonical alternative contribution

> Ownership changes because projects are already late. The real issue is that technical dependencies are discovered too late.

## Discovery interpretation

This challenges causal direction.

## Proposed alternative hypothesis

> Late discovery of technical dependencies may cause delay, with ownership reassignment occurring afterward as a response.

## Effect

* preserve the current explanation;
* add the alternative;
* reduce causal confidence;
* elevate dependency-timing investigation;
* retain existing associations.

---

# 15. Different-Interpretation Effect

## Current explanation

> Ownership ambiguity contributes to delivery delay.

## User-proposed explanation

> Delivery difficulty caused by late technical dependencies leads to ownership changes.

## Discovery response

> Your interpretation fits the observed association but reverses its causal direction. The current evidence does not yet distinguish reliably between these explanations.

## Confidence effect

> Confidence in the organizational pattern remains Moderate.

> Confidence in the causal explanation decreases.

## New recommended test

> Determine whether technical dependency discovery occurs before ownership clarification and delay.

## Rule

Discovery should not force a binary winner before evidence discriminates between explanations.

---

# 16. Path Four — Investigate Further Before I Respond

## Purpose

Let the user defer judgment and ask Discovery to reduce uncertainty first.

## Supporting copy

> Discovery can investigate the most important unresolved question before asking for your judgment.

## Available investigation targets

* compare the reliable team with delayed teams;
* test practical versus formal decision authority;
* investigate informal priority changes;
* test whether ownership movement precedes delay;
* investigate late technical dependency discovery.

## Canonical recommended target

> Compare decision practices in the reliable team with the rest of Engineering.

## Why recommended

> This directly addresses the strongest contradiction and may reveal what moderates the current constraint.

## Expected information gain

> High

## Resulting action

> Prepare investigation plan

This does not begin live retrieval in Alpha.

It creates the deterministic next-learning proposal.

---

# 17. Response-Path Presentation

Each path should include:

* concise title;
* one-sentence meaning;
* no icon-heavy decorative treatment;
* clear selected state;
* keyboard accessibility.

Recommended presentation:

A vertical list of four restrained interactive sections.

Avoid:

* emoji reactions;
* thumbs-up or thumbs-down controls;
* sentiment faces;
* star ratings;
* survey scales;
* brightly colored tiles.

---

# 18. Structured Contribution

Once a path is selected, the response area should request only the information relevant to that path.

## General rules

* one primary prompt at a time;
* clear examples;
* optional free text;
* no long form by default;
* preserve drafts while switching paths;
* show how the response may affect the Understanding;
* never imply that submission guarantees a change.

## Maximum Alpha response length

```text
2,000 characters
```

No character count until the user approaches the limit.

---

# 19. Evidence Targeting

When the user challenges or confirms something, they may connect the response to:

* current synthesis;
* a supporting evidence group;
* a contradiction;
* an alternative explanation;
* the largest unknown;
* the scope;
* terminology.

## Action

> Connect this response to…

The product may preselect the likely target based on the chosen response path.

The user can change it.

## Alpha example

The technical-dependency disagreement connects to:

> Ownership movement and delayed delivery

and:

> Current causal interpretation

---

# 20. Source and Perspective

Discovery should understand who is contributing without using status as automatic authority.

## Optional context

> Your perspective

Examples:

* directly involved;
* observed across teams;
* responsible for the area;
* heard from others;
* historical knowledge;
* external perspective.

## Canonical user

> Directly involved and responsible for the area

## Why it matters

Perspective helps Discovery evaluate proximity and relevance.

It does not automatically determine truth.

## Avoid

* authority score;
* seniority weighting shown to the user;
* “executive override”;
* automatic prioritization based only on title.

---

# 21. Contribution Preview

Before submission, Discovery should explain the likely treatment.

## Heading

> How Discovery will use this

## Example — confirmation

> Preserve this as an executive observation, test it against the current evidence, and strengthen relevance only if it remains consistent.

## Example — missing context

> Add a new hypothesis about practical decision authority and recommend targeted evidence to test it.

## Example — disagreement

> Preserve your alternative explanation, reduce causal certainty, and identify evidence that could distinguish between the two interpretations.

## Example — investigate

> Create a targeted learning opportunity focused on the unresolved contradiction.

This preview is critical for trust.

---

# 22. Submission Action

## Primary label

Path-specific labels are preferred.

### Confirmation

> Add confirmation

### Missing context

> Add this context

### Different interpretation

> Add alternative interpretation

### Investigation

> Prepare investigation plan

## Secondary action

> Cancel response

Returns to the response-path selection while preserving the draft during the current session.

Avoid generic:

* Submit
* Send feedback
* Save
* Correct Discovery

---

# 23. Submission Behavior

When the user submits:

1. Preserve the response exactly as entered.
2. Record the selected response type.
3. Record the targeted part of the Understanding.
4. Record perspective metadata where supplied.
5. Produce a deterministic interpretation of the response.
6. Show the expected model effect.
7. Preserve the previous Understanding state.
8. Update the provisional Alpha response state.
9. Ask whether the user wants to follow the Understanding.

The response must not disappear into a generic success message.

---

# 24. Resulting State

After submission, show:

## What Discovery heard

A concise paraphrase.

## How it affects the Understanding

* strengthens relevance;
* creates a new hypothesis;
* reduces causal confidence;
* expands scope;
* creates a contradiction;
* recommends further learning;
* no immediate change.

## What remains unchanged

Example:

> The existing evidence and historical Understanding remain preserved.

## What happens next

Example:

> Discovery should compare decision-authority patterns across delayed and reliable initiatives.

## Primary action

> Continue

Advances to Scene Eight — Follow.

---

# 25. User Confirmation Is Not Proof

This principle must appear in product behavior, even if not as a visible policy statement.

## Confirmation may affect

* practical relevance;
* interpretation plausibility;
* priority of investigation;
* organizational salience;
* source coverage.

## Confirmation must not automatically affect

* evidence count;
* causal certainty;
* contradiction resolution;
* historical facts;
* source lineage;
* governance status.

## Canonical copy

> Your confirmation strengthens the relevance of this Understanding but does not replace the supporting evidence.

---

# 26. User Disagreement Is Not Rejection

A disagreement should not mark the Understanding as wrong.

It may:

* create an alternative explanation;
* weaken an interpretation;
* challenge a source;
* expose a terminology problem;
* identify missing scope;
* create a contradiction;
* request investigation.

## Canonical copy

> Discovery will preserve both interpretations until the evidence distinguishes between them.

This is especially important for shared organizational intelligence.

---

# 27. Conflicting User Contributions

Future users may provide incompatible interpretations.

The Alpha should define the intended state.

## Example

User One:

> Decision authority is unclear.

User Two:

> Decision authority is clear; technical dependencies are the issue.

## Discovery behavior

* preserve both contributions;
* record context and perspective;
* identify the conflict;
* avoid averaging them into vague consensus;
* recommend discriminating evidence;
* keep the contradiction visible.

## User-facing message

> Organizational perspectives differ on what causes the delay. Discovery will preserve the disagreement and investigate the conditions under which each explanation fits.

---

# 28. Sensitive Contribution State

A user may enter sensitive context.

## Example

> A specific leader blocks decisions but teams will not document it.

## Intended behavior

The product should:

* avoid exposing the contribution broadly;
* clarify visibility before submission where necessary;
* route the contribution through governance;
* distinguish private context from shareable evidence;
* avoid immediately incorporating personally accusatory claims into a shared synthesis.

## Alpha message

> This context may be sensitive. Before Discovery uses it beyond your private response, its visibility and purpose must be reviewed.

## Alpha limitation

No production governance enforcement is implemented here.

The prototype demonstrates intended behavior only.

---

# 29. Scope Correction

The user may say:

> This issue affects Product Operations, not all of Engineering.

## Discovery response

> This narrows the current scope. Discovery should avoid generalizing the pattern to all Engineering teams until broader evidence supports it.

## Effect

* scope narrows;
* confidence in broad generalization decreases;
* local confidence may remain;
* title or Understanding name may require later revision.

## Rule

Scope correction should not be treated as disagreement with the underlying pattern.

---

# 30. Terminology Correction

The user may say:

> We do not use “ownership” this way. The issue is decision authority.

## Discovery response

> Discovery will distinguish assigned ownership from practical decision authority in future explanations.

## Effect

* update user-facing language;
* preserve historical wording;
* create a terminology mapping;
* avoid pretending the underlying evidence changed.

## Rule

Terminology corrections alter communication before they alter cognition.

---

# 31. Evidence Challenge

The user may challenge a specific evidence group.

## Example

> Ownership reassignment in our issue tracker is administrative and does not reflect real ownership changes.

## Discovery response

> This weakens the interpretive value of issue-history ownership changes. Conversation and retrospective evidence still support practical ambiguity, but the project-history contribution should be reduced.

## Effect

* evidence-group strength decreases;
* confidence may decrease;
* source limitation becomes more prominent;
* alternative evidence becomes more important;
* investigation may be recommended.

## Rule

The user should be able to challenge evidence quality without rejecting the entire Understanding.

---

# 32. No Immediate Model Change State

Some contributions are relevant but not strong enough to change the current Understanding.

## Message

> Discovery preserved your response, but it does not currently change the leading explanation.

## Why

> The response is relevant but either lacks enough specificity or does not yet distinguish among the current alternatives.

## Next action

> Add an example

or:

> Identify where this occurs

The system must be honest when feedback does not materially alter the model.

---

# 33. Confirmation Without Context

The user may select:

> This matches what I see

without adding detail.

## Discovery response

> Confirmation recorded.

## Effect

* user relevance signal;
* no material confidence change;
* no new evidence claim;
* prompt for optional example.

## Copy

> A specific example would help Discovery evaluate how strongly your experience supports the current explanation.

The user may continue without providing one.

---

# 34. Visual Treatment

## 34.1 Overall character

The scene should feel:

* collaborative;
* serious;
* open;
* structured;
* nondefensive;
* low pressure.

## 34.2 Response paths

Use restrained selectable rows or sections.

The selected path may receive a subtle surface treatment.

Avoid bright categorization colors.

## 34.3 Response form

The form should feel integrated with the Understanding.

Avoid a generic feedback modal.

## 34.4 Effect preview

Use a distinct but calm region showing:

* likely effect;
* preserved uncertainty;
* next learning implication.

This is more important than a success animation.

---

# 35. Typography Roles

## Scene headline

Suggested desktop range:

```text
34–44 px
```

## Current synthesis

Compact supporting body.

## Response-path title

Medium heading.

## Response-path explanation

Secondary body.

## Contribution prompt

Clear body or small heading.

## Effect preview

Medium body with concise labels.

Avoid small, form-heavy typography that makes the interaction feel administrative.

---

# 36. Color Semantics

Possible response semantics:

* confirmation;
* missing context;
* alternative interpretation;
* investigation.

Color may support these states but must not imply:

* confirmation is good;
* disagreement is bad;
* investigation is failure;
* executive input is authoritative.

Every state must be labeled in text.

---

# 37. Motion Specification

## 37.1 Path selection

The selected response path expands inline.

Suggested duration:

```text
180–280 ms
```

## 37.2 Effect preview

Update the preview after relevant user input settles.

Avoid generating a preview on every keystroke.

For Alpha, the preview may update after:

* selecting structured options;
* leaving the text field;
* choosing Review response.

## 37.3 Submission

The response form transitions into:

* what Discovery heard;
* expected effect;
* next learning.

No celebration is needed.

## 37.4 Reduced motion

Use direct expansion and state replacement.

No content may depend on motion.

---

# 38. Copy Principles

Scene Seven copy should be:

* invitational;
* specific;
* nondefensive;
* transparent;
* neutral about agreement;
* clear about model effect.

## Preferred language

* matches what you see;
* missing context;
* interpret differently;
* preserve;
* test;
* compare;
* new hypothesis;
* causal direction;
* relevance;
* does not independently establish;
* remains unchanged.

## Avoid

* correct the AI;
* rate;
* good feedback;
* wrong answer;
* accepted;
* rejected;
* override;
* executive truth;
* retrain;
* punish;
* reward.

---

# 39. Error and Failure States

## 39.1 Empty required response

Message:

> Add enough context for Discovery to understand what should change.

This applies to missing-context and alternative-interpretation paths.

## 39.2 Response too vague

Example:

> This is wrong.

Message:

> Identify which part of the evidence or interpretation you see differently.

## 39.3 Conflicting structured selections

Example:

The user confirms and rejects the same interpretation.

Message:

> Your response contains two different signals. Clarify which better reflects your view.

Do not silently resolve the conflict.

## 39.4 Contribution interpretation unavailable

Message:

> Discovery preserved your response but could not determine how it should affect the Understanding.

Actions:

* Clarify response
* Save without immediate effect
* Cancel

## 39.5 Submission failure

Message:

> Discovery couldn’t add your response.

Supporting copy:

> Your draft has been preserved.

Actions:

* Try again
* Copy response
* Return to Understanding

---

# 40. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* a grouped set of response-path controls;
* properly labeled text areas;
* descriptive effect-preview region;
* clear submission actions;
* status announcements.

## Response-path controls

They may use:

* radio-group semantics; or
* buttons controlling distinct regions.

The selected state must be programmatically clear.

## Dynamic expansion

When a response path expands:

* move focus to the new region heading or first field;
* preserve a clear return to path selection;
* announce the selected path.

## Effect preview

Use an `aria-live` region only for meaningful completed updates.

Do not announce every keystroke.

## Submission result

Move focus to:

> How this affects the Understanding

## Error association

All errors must:

* be associated with the relevant field;
* preserve user input;
* not rely on color alone.

---

# 41. Component Hierarchy

```text
RespondScene
├── ExperienceFrame
├── UnderstandingContext
│   ├── UnderstandingName
│   ├── CurrentSynthesis
│   ├── CurrentConfidence
│   └── ReturnToExaminationAction
├── ResponseHeader
│   ├── ResponseHeadline
│   └── ResponseSupportingCopy
├── ResponsePathSelector
│   └── ResponsePathOption[]
├── ResponseComposer
│   ├── ConfirmationComposer
│   ├── MissingContextComposer
│   ├── AlternativeInterpretationComposer
│   └── InvestigationComposer
├── ContributionTarget
├── ContributorPerspective
├── ContributionEffectPreview
│   ├── LikelyInterpretation
│   ├── ExpectedUnderstandingEffect
│   ├── PreservedElements
│   └── NextLearningOpportunity
├── SensitiveContributionNotice
├── ResponseActions
│   ├── SubmitResponseAction
│   └── CancelResponseAction
└── ResponseResult
    ├── HeardSummary
    ├── UnderstandingEffect
    ├── UnchangedSummary
    ├── NextStep
    └── ContinueAction
```

---

# 42. Experience State Contract

```ts
type UnderstandingResponseType =
  | "confirmation"
  | "missing-context"
  | "alternative-interpretation"
  | "investigate-further";

type ContributionTargetType =
  | "synthesis"
  | "evidence-group"
  | "contradiction"
  | "alternative"
  | "primary-unknown"
  | "scope"
  | "terminology";

type ContributorPerspective =
  | "directly-involved"
  | "cross-team-observer"
  | "area-owner"
  | "secondhand"
  | "historical"
  | "external"
  | "unspecified";

type ProposedUnderstandingEffect =
  | "strengthen-relevance"
  | "create-hypothesis"
  | "reduce-causal-confidence"
  | "challenge-evidence"
  | "narrow-scope"
  | "expand-scope"
  | "correct-terminology"
  | "create-contradiction"
  | "recommend-investigation"
  | "no-immediate-change";

interface UnderstandingResponseDraft {
  type: UnderstandingResponseType | null;
  selectedCategories: string[];
  text: string;
  targetType: ContributionTargetType;
  targetId: string | null;
  perspective: ContributorPerspective;
  sensitive: boolean;
}

interface ResponseInterpretationViewModel {
  heardSummary: string;
  proposedEffects: ProposedUnderstandingEffect[];
  effectExplanation: string;
  unchangedElements: string[];
  newHypothesis: string | null;
  newUnknown: string | null;
  nextLearningOpportunity: string | null;
  confidenceEffect:
    | "increase-limited"
    | "decrease-causal"
    | "unchanged"
    | "not-estimated";
  requiresGovernanceReview: boolean;
}

interface RespondSceneState {
  status:
    | "selecting-path"
    | "composing"
    | "reviewing"
    | "submitting"
    | "submitted"
    | "failed";
  draft: UnderstandingResponseDraft;
  interpretation: ResponseInterpretationViewModel | null;
  error: string | null;
}
```

## Emitted intent

```ts
interface SubmitUnderstandingResponseIntent {
  understandingId: string;
  responseType: UnderstandingResponseType;
  selectedCategories: string[];
  responseText: string | null;
  targetType: ContributionTargetType;
  targetId: string | null;
  perspective: ContributorPerspective;
  sensitive: boolean;
  submittedAt: string;
}
```

This remains an experience-layer contract.

---

# 43. Canonical Alpha Response Scenarios

## 43.1 Confirmation scenario

```ts
const confirmationResponse: ResponseInterpretationViewModel = {
  heardSummary:
    "Decision authority often becomes unclear after Product and Engineering disagree about who can make the final call.",
  proposedEffects: ["strengthen-relevance"],
  effectExplanation:
    "This aligns with the current Understanding and strengthens its practical relevance, but it does not independently establish causation.",
  unchangedElements: [
    "Existing supporting evidence",
    "Meaningful contradiction",
    "Moderate confidence level",
    "Unresolved causal direction",
  ],
  newHypothesis: null,
  newUnknown: null,
  nextLearningOpportunity:
    "Compare where final decision authority is explicit versus disputed across delayed and reliable initiatives.",
  confidenceEffect: "increase-limited",
  requiresGovernanceReview: false,
};
```

## 43.2 Missing-context scenario

```ts
const missingContextResponse: ResponseInterpretationViewModel = {
  heardSummary:
    "Architecture decisions are controlled by a separate platform group that is not represented in formal project ownership.",
  proposedEffects: [
    "create-hypothesis",
    "expand-scope",
    "recommend-investigation",
  ],
  effectExplanation:
    "This may explain why formal ownership appears stable while practical decision authority remains unclear.",
  unchangedElements: [
    "Current evidence",
    "Historical synthesis",
    "Existing contradictions",
    "Moderate confidence",
  ],
  newHypothesis:
    "Practical decision authority may sit outside formal project ownership.",
  newUnknown:
    "How often platform-group authority delays or redirects decisions after Engineering work begins.",
  nextLearningOpportunity:
    "Compare architecture-decision requests, platform-group involvement, and delivery timing across delayed and reliable initiatives.",
  confidenceEffect: "unchanged",
  requiresGovernanceReview: false,
};
```

## 43.3 Alternative-interpretation scenario

```ts
const alternativeInterpretationResponse: ResponseInterpretationViewModel = {
  heardSummary:
    "Late discovery of technical dependencies may cause delivery delay, with ownership changes occurring afterward as a response.",
  proposedEffects: [
    "create-hypothesis",
    "reduce-causal-confidence",
    "recommend-investigation",
  ],
  effectExplanation:
    "This interpretation fits the observed association but reverses the proposed causal direction.",
  unchangedElements: [
    "Association between ownership movement and delayed delivery",
    "Cross-functional concentration",
    "Historical evidence",
    "Current organizational pattern",
  ],
  newHypothesis:
    "Late discovery of technical dependencies may precede delay and trigger later ownership reassignment.",
  newUnknown:
    "Whether technical dependency discovery occurs before ownership clarification and delay.",
  nextLearningOpportunity:
    "Compare the timing of dependency discovery, ownership clarification, and delivery slowdown.",
  confidenceEffect: "decrease-causal",
  requiresGovernanceReview: false,
};
```

## 43.4 Investigation scenario

```ts
const investigationResponse: ResponseInterpretationViewModel = {
  heardSummary:
    "Investigate why one comparable team delivers reliably under similar formal ownership conditions.",
  proposedEffects: ["recommend-investigation"],
  effectExplanation:
    "This directly targets the strongest contradiction and may reveal what moderates the current constraint.",
  unchangedElements: [
    "Current synthesis",
    "Moderate confidence",
    "Existing evidence",
    "Open contradiction",
  ],
  newHypothesis: null,
  newUnknown:
    "Which decision practices distinguish the reliable team from delayed teams?",
  nextLearningOpportunity:
    "Compare escalation, delegation, dependency handling, and decision authority across teams.",
  confidenceEffect: "not-estimated",
  requiresGovernanceReview: false,
};
```

---

# 44. Determinism Requirements

For the canonical Alpha:

* response paths remain fixed;
* structured options remain fixed;
* prepared contributions produce fixed interpretations;
* effect previews remain fixed;
* confidence effects remain fixed;
* historical Understanding state remains preserved;
* switching paths preserves drafts;
* submitting the same canonical response produces the same result;
* sensitive-response behavior remains fixed;
* browser-back behavior preserves the draft during the session;
* response results remain consistent with Scenes Five and Six;
* no component independently alters the Understanding.

---

# 45. Product Analytics

Suggested events:

```text
response_scene_viewed
response_path_selected
response_target_selected
response_perspective_selected
response_preview_viewed
response_submitted
response_sensitive_notice_viewed
response_interpretation_failed
response_cancelled
```

Suggested properties:

* understanding identifier;
* response type;
* target type;
* perspective type;
* proposed effect types;
* confidence effect;
* whether text was supplied;
* whether sensitive;
* time to submission.

Do not record raw response text in general analytics.

---

# 46. Quality Checks

Confirm:

1. The current Understanding remains visible.
2. The scene is not framed as rating an answer.
3. Confirmation is not treated as proof.
4. Disagreement is not treated as rejection.
5. Missing context can create a hypothesis.
6. Alternative interpretations preserve the current evidence.
7. The user can target a specific evidence group or interpretation.
8. Perspective is contextual, not automatically authoritative.
9. Discovery previews how it will use the response.
10. The previous Understanding remains preserved.
11. The user sees what remains unchanged.
12. Confidence effects are bounded and explained.
13. Sensitive contributions receive special treatment.
14. Scope correction differs from causal disagreement.
15. Terminology correction differs from evidence change.
16. Evidence can be challenged independently.
17. No-immediate-change responses are handled honestly.
18. Conflicting contributions can coexist.
19. The scene does not use social-feedback patterns.
20. The form requests only relevant information.
21. Drafts are preserved during path switching.
22. Submission results are specific.
23. Keyboard-only operation works.
24. Reduced motion preserves comprehension.
25. Mobile layouts remain usable.
26. The scene leads naturally to following and stewardship.

---

# 47. Acceptance Criteria

## Functional

* Scene Seven receives the canonical Understanding and examination context.
* Four response paths are available.
* Each path opens a tailored composer.
* Confirmation supports optional structured categories.
* Missing context requires usable context.
* Alternative interpretation targets a specific part of the reasoning.
* Investigation supports a deterministic target.
* The user can connect a response to an Understanding element.
* The user can indicate perspective.
* The user can review the expected effect.
* The user can submit the response.
* The submission result shows what Discovery heard.
* The result shows how the Understanding may be affected.
* The result shows what remains unchanged.
* The result shows the next learning opportunity.
* Drafts remain preserved during the session.
* Failure states preserve user input.
* The user can continue to Scene Eight.

## Visual

* The current synthesis remains an anchor.
* Response paths are clear but restrained.
* The page does not resemble a survey.
* The page does not resemble a chatbot thread.
* Agreement and disagreement receive equal visual dignity.
* Effect preview is easy to locate.
* Sensitive contribution treatment is clear without alarmism.
* The response result emphasizes model effect over success animation.
* Responsive hierarchy remains coherent.
* Semantic differences do not rely only on color.

## Product

* The user understands that confirmation strengthens relevance, not proof.
* The user understands that missing context creates a testable hypothesis.
* The user understands that disagreement may reduce causal confidence.
* The user understands that Discovery preserves multiple interpretations.
* The user understands what Discovery will do with the contribution.
* The user feels able to influence the model.
* The user does not believe the model was silently overwritten.
* The user sees the Understanding as shared and stewarded.
* The user is ready to follow it over time.

---

# 48. Prototype Review Script

A reviewer should complete the following:

1. Enter Scene Seven from Scene Six.
2. Select This matches what I see.
3. Confirm one structured category.
4. Submit without adding context.
5. Verify no material confidence change occurs.
6. Restart the scene.
7. Select Something important is missing.
8. Enter:

   > Architecture decisions are controlled by a separate platform group that is not represented in project ownership.
9. Review the effect preview.
10. Identify the new hypothesis.
11. Submit.
12. Confirm the historical Understanding remains preserved.
13. Restart.
14. Select I interpret the evidence differently.
15. Enter:

> Ownership changes because projects are already late. Technical dependencies are discovered too late.

16. Connect it to the ownership-and-delay evidence group.
17. Review the causal-direction effect.
18. Submit.
19. Confirm causal confidence decreases while the association remains.
20. Restart.
21. Select Investigate further before I respond.
22. Choose the reliable-team comparison.
23. Prepare the investigation plan.
24. Continue to Scene Eight.
25. Repeat with sensitive context.
26. Confirm governance-review language appears.
27. Repeat with a vague disagreement.
28. Confirm specific guidance appears.
29. Repeat using keyboard only.
30. Repeat with reduced motion.
31. Repeat at mobile width.

If the reviewer believes confirmation automatically makes Discovery “more correct,” the response-effect language requires revision.

---

# 49. Open Decisions

The following should be resolved through high-fidelity design and testing:

1. Whether response paths use radio rows, buttons, or expandable sections.
2. Whether confirmation requires an example.
3. Whether contributor perspective is visible by default.
4. Whether users may select more than one response path.
5. Whether effect preview appears live or after a review action.
6. Whether the user can edit Discovery’s paraphrase before submission.
7. Whether sensitive-content detection is automatic or user-declared.
8. Whether a response may be private to the contributor.
9. Whether other users can comment on a contribution.
10. Whether confirmation changes a displayed numeric confidence value.
11. Whether terminology correction deserves its own response path.
12. Whether scope correction deserves its own response path.
13. Whether evidence challenge is nested under interpretation or separate.
14. Whether “Respond to this Understanding” is the correct scene title.
15. Whether users can attach supporting material.
16. Whether users can identify another person who should respond.
17. Whether conflicting contributions should become a visible contradiction immediately.
18. Whether the user can withdraw a contribution.
19. Whether contribution history appears on the Understanding page.
20. Whether investigation planning should occur here or in a dedicated future workflow.

Codex must not independently resolve these decisions.

---

# 50. Codex Implementation Boundary

Codex may implement:

* the four canonical response paths;
* tailored composers;
* structured response targeting;
* perspective selection;
* deterministic effect previews;
* deterministic response results;
* draft preservation;
* sensitive-content demonstration state;
* scope and terminology correction states;
* evidence challenge state;
* no-immediate-change state;
* responsive behavior;
* accessibility;
* transition to Scene Eight;
* deterministic tests.

Codex must not:

* modify production cognition;
* modify Runtime;
* modify Governance;
* create production evidence objects;
* automatically treat executive input as truth;
* overwrite historical Understanding state;
* resolve conflicting interpretations without evidence;
* expose contributions beyond intended access;
* record raw responses in general analytics;
* add a social-feedback system;
* implement likes, votes, or popularity ranking;
* redesign the response model;
* call a production language model;
* claim governance enforcement is live;
* create autonomous investigation behavior.

---

# 51. Definition of Done

Scene Seven is complete when:

* users can confirm, challenge, enrich, or defer;
* each response path is clear;
* user input has an explainable bounded effect;
* confirmation does not become proof;
* disagreement does not erase evidence;
* missing context creates hypotheses rather than instant conclusions;
* alternative causal interpretations remain preserved;
* sensitive contributions are handled carefully;
* historical Understanding state remains intact;
* the user sees what changed and what did not;
* the experience feels collaborative rather than evaluative;
* no production architecture changes;
* Scene Eight receives a stewarded Understanding and a clear reason to continue following it.

The final review question is:

> Does the user feel able to improve Discovery’s Understanding without being able to overwrite it merely through authority or opinion?

Only an unambiguous yes is acceptable.
