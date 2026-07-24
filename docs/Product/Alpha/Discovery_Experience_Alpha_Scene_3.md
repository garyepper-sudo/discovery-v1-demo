# Discovery Experience Alpha

# Scene Three Specification — Plan

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Agency
**Implemented Alpha route:** `/alpha/plan`
**Previous scene:** Orient
**Next scene:** Learn
**Primary objective:** Show how Discovery intends to improve the Understanding before requesting access to information.
**Core trust requirement:** Every recommended source must be tied to a specific uncertainty and an expected contribution to understanding.

This document preserves detailed Alpha design intent. Source choices and plan
controls are deterministic, local prototype interactions. They do not authorize
connectors, retrieve live information, persist a plan, or update Organization
Runtime.

---

# 1. Scene Purpose

Scene Three helps the user answer:

> How does Discovery plan to improve this Understanding?

Discovery has:

* received the user’s original question;
* proposed a bounded Understanding objective;
* established an initial scope;
* identified the most important unknown;
* received user approval to continue.

Discovery must now present a deliberate learning plan.

The scene must demonstrate that Discovery does not ingest information merely because it is available.

It identifies:

1. what remains uncertain;
2. which information could reduce that uncertainty;
3. why each source matters;
4. how much improvement is expected;
5. what will remain unknown afterward.

The scene should make Discovery feel like a thoughtful organizational researcher rather than a connector marketplace or bulk-ingestion system.

---

# 2. Primary User Outcome

The user reviews Discovery’s proposed learning plan and decides what information Discovery may use.

The user should leave the scene believing:

* Discovery has a clear research strategy;
* each recommendation has a reason;
* requested access is bounded;
* the user can exclude sources;
* Discovery can proceed with partial information;
* expected improvement is an estimate rather than a promise;
* the plan is designed around uncertainty reduction.

---

# 3. Primary Discovery Outcome

Discovery receives an approved temporary learning plan for the Alpha experience.

The plan provides:

* approved source categories;
* excluded source categories;
* uncertainties targeted;
* expected information gain;
* expected confidence movement;
* scope constraints;
* user-supplied context;
* permission to begin the mocked learning sequence.

This remains an experience-layer contract.

It is not a production retrieval plan, connector authorization, or governance decision.

---

# 4. Emotional Objective

The emotional transition is:

```text
Control

↓

Agency

↓

Confidence in the process

↓

Permission to proceed
```

The user should think:

> Discovery knows what it needs and can explain why.

The user should not yet think:

* Discovery already has access;
* Discovery has already reviewed the sources;
* the expected confidence gain is guaranteed;
* every recommended source is mandatory;
* more information is always better.

---

# 5. Canonical Alpha Context

## Original question

> Why has engineering productivity slowed?

## Approved Understanding objective

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

## Current orientation

> Early orientation

## Current Understanding confidence

> Low

## Most important unknown

> Where planned work begins to lose momentum after commitment.

This context should remain accessible without dominating the page.

---

# 6. Primary Scene Message

## Headline

> Here is how Discovery would improve this Understanding.

Alternative:

> Here is what would help Discovery learn.

Preferred Alpha copy:

> Here is how Discovery would improve this Understanding.

This phrasing reinforces:

* the Understanding already exists in an early form;
* the plan is proposed, not imposed;
* information is selected for a defined purpose.

## Supporting copy

> Each recommendation is tied to a specific uncertainty. You can approve, exclude, or limit any source before Discovery begins learning.

Do not use:

* Connect your tools.
* Choose your data sources.
* Import information.
* Complete setup.
* Add integrations.
* Train Discovery.
* Give Discovery access to everything.

---

# 7. Page Structure

Scene Three contains seven primary regions:

```text
Application frame

Understanding context

Learning-plan introduction

Expected Understanding change

Recommended information

Plan controls

Start-learning action
```

The recommended information section carries most of the interaction.

The page should not resemble an integrations settings screen.

---

# 8. Transition from Scene Two

## 8.1 Persistent context

The approved Understanding objective remains visible in a restrained form.

Recommended presentation:

**Understanding**

> Engineering Productivity

**Objective**

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

The original question remains available through progressive disclosure.

## 8.2 Transition behavior

As Scene Two advances:

* scope details recede;
* the approved objective remains;
* the most important unknown moves into the learning-plan context;
* recommended sources appear as responses to that unknown.

The transition should visually communicate:

```text
Bounded question

↓

Specific uncertainty

↓

Targeted learning plan
```

---

# 9. Desktop Layout

## 9.1 Main container

Recommended maximum width:

```text
1080–1180 px
```

Primary reading column:

```text
720–820 px
```

The wider container allows recommendation details without creating cramped cards.

## 9.2 Recommended composition

```text
Understanding context

Here is how Discovery would improve this Understanding.

Current confidence → Expected confidence
Largest uncertainty

Recommended information
  Recommendation 1
  Recommendation 2
  Recommendation 3
  Recommendation 4

Plan summary

Back to orientation        Start learning
```

## 9.3 Columns

On wide screens, the expected-change summary may appear beside the learning-plan introduction.

The source recommendations should remain in a single vertical reading sequence unless testing proves a two-column arrangement clearer.

A single column better preserves reasoning order and comparison.

---

# 10. Tablet and Mobile Layout

## 10.1 Tablet

* stack expected-change information above recommendations;
* keep recommendation controls aligned consistently;
* avoid horizontal comparison tables;
* allow source details to expand inline;
* keep the primary action easy to locate after the list.

## 10.2 Mobile

* use one column;
* display each recommendation as a compact expandable section;
* place approval controls near the source title;
* move secondary metrics beneath the reason;
* make the final plan summary sticky only if it does not obscure content;
* keep the user’s selection state visible.

## 10.3 Reading priority

When space is constrained:

1. Primary scene message
2. Largest uncertainty
3. Recommended sources
4. Why each source matters
5. Source controls
6. Expected confidence movement
7. Secondary explanatory detail

The user must understand the plan without reading every expanded explanation.

---

# 11. Expected Understanding Change

This region communicates the intended effect of the complete recommended plan.

It must not appear as a guaranteed forecast.

## Current state

**Understanding confidence**

> Low

## Expected state

**Expected after recommended learning**

> Moderate to high

## Canonical explanatory copy

> This is an estimate based on how directly the recommended information addresses the current unknowns. Actual confidence may increase less, increase more, or decrease if the evidence contradicts the current orientation.

This statement is important.

Evidence may weaken an explanation rather than merely raise confidence.

## Visual treatment

The change may be shown as:

```text
Low  →  Moderate to high
```

Use restrained motion or a static directional treatment.

Do not use:

* a gamified progress bar;
* a percentage gain promise;
* “82% confidence guaranteed”;
* celebratory growth graphics;
* green-only semantics.

---

# 12. Information-Gain Vocabulary

Each recommendation should use a qualitative information-gain level.

Canonical levels:

```text
Very high
High
Moderate
Low
Unknown
```

For Alpha, use:

* High
* Moderate to high
* Moderate

Avoid false precision such as:

* 23% information gain;
* +17 confidence points;
* exact token or document estimates.

Precise values may be introduced later only if supported by a validated model.

## Meaning

**Very high**

Likely to resolve or materially redefine a central uncertainty.

**High**

Likely to substantially narrow an important uncertainty.

**Moderate**

Likely to provide useful context or discriminate among explanations.

**Low**

Limited expected contribution under the current objective.

**Unknown**

Potential value exists, but Discovery cannot estimate it reliably.

These definitions may appear through progressive disclosure.

---

# 13. Recommendation Anatomy

Every recommended source must include:

1. source name;
2. source category;
3. expected information gain;
4. why it is recommended;
5. uncertainty addressed;
6. proposed scope;
7. access state;
8. user control;
9. limitations or risks where relevant.

No recommendation may appear solely because the source is available.

---

# 14. Recommendation One — Sprint Retrospectives

## Source name

> Sprint retrospectives

## Source category

> Team reflection

## Expected information gain

> High

## Why Discovery recommends it

> Retrospectives can reveal recurring delivery constraints, unresolved dependencies, escalation patterns, and issues teams believe are slowing execution.

## Uncertainty addressed

> Whether delivery friction consistently emerges during execution rather than during planning.

## Proposed scope

> Engineering retrospectives from the last six months.

## Expected contribution

> Identify recurring explanations and determine whether the same friction appears across teams and time periods.

## Important limitation

> Retrospectives reflect what participants noticed and chose to document. They may omit sensitive or normalized problems.

## Default state

> Included

---

# 15. Recommendation Two — Project and Issue History

## Source name

> Project and issue history

## Source category

> Work-system records

## Expected information gain

> High

## Why Discovery recommends it

> Work history can show where delivery slows, changes ownership, waits for decisions, reopens, or repeatedly moves between teams.

## Uncertainty addressed

> Where planned work begins to lose momentum after commitment.

## Proposed scope

> Engineering initiatives and delivery records from the last two quarters.

## Expected contribution

> Compare delayed and reliably delivered work to identify differences in ownership, dependencies, and workflow movement.

## Important limitation

> Work-system records show formal activity. They may not explain the reasoning or relationships behind it.

## Default state

> Included

---

# 16. Recommendation Three — Selected Team Conversations

## Source name

> Selected team conversations

## Source category

> Collaboration context

## Expected information gain

> Moderate to high

## Why Discovery recommends it

> Relevant conversations can reveal ambiguity, repeated clarification, informal escalation, and coordination patterns that formal work records do not capture.

## Uncertainty addressed

> Why recorded workflow delays or ownership changes occur.

## Proposed scope

> Conversations tied to selected delayed initiatives and relevant planning or delivery channels.

## Expected contribution

> Connect observed delays to the decisions, questions, and dependencies surrounding them.

## Important limitation

> Conversation access is sensitive and must remain bounded by purpose, membership, and approved scope.

## Default state

> Included, pending approval

This source should visually carry greater sensitivity than the others without using alarmist language.

---

# 17. Recommendation Four — Product Planning Documents

## Source name

> Product planning documents

## Source category

> Strategic context

## Expected information gain

> Moderate

## Why Discovery recommends it

> Planning documents can help determine whether priorities, assumptions, and commitments remain stable after teams begin delivery.

## Uncertainty addressed

> Whether delivery friction originates upstream in planning or prioritization.

## Proposed scope

> Current and previous-quarter plans affecting Engineering commitments.

## Expected contribution

> Test whether priority instability is a plausible explanation for slowed delivery.

## Important limitation

> Formal plans may not reflect informal reprioritization or decisions made after publication.

## Default state

> Included

---

# 18. Recommendation Presentation

## 18.1 Default collapsed state

Each recommendation should show:

* source name;
* expected information gain;
* one-sentence reason;
* included or excluded state;
* expand action.

## 18.2 Expanded state

Expanded content includes:

* uncertainty addressed;
* proposed scope;
* expected contribution;
* limitation;
* scope controls where supported.

## 18.3 Visual hierarchy

Within each recommendation:

1. Source name
2. Included-state control
3. Expected information gain
4. Why recommended
5. Uncertainty addressed
6. Scope
7. Limitation

## 18.4 Avoid

Do not use:

* connector logos as the dominant visual;
* marketplace-style installation buttons;
* pricing-like comparison cards;
* scores without explanation;
* provider-specific branding unless a real connection is being authorized;
* “recommended because similar customers use this.”

---

# 19. Source Controls

Each recommendation must support one of three planning states:

```text
Included
Limited
Excluded
```

## Included

Discovery may use the proposed source scope in the mocked plan.

## Limited

The user narrows:

* time range;
* teams;
* projects;
* channels;
* document groups;
* categories.

## Excluded

Discovery will not use the source.

## Control language

Preferred:

* Include
* Limit
* Exclude

Alternative compact selector:

> Included ▾

Do not use:

* Enable
* Disable
* Install
* Authorize all
* Grant full access
* Skip forever

---

# 20. Source-Limitation Interaction

## Trigger

> Limit scope

## Inline prompt

> What should Discovery use from this source?

## Canonical controls

Depending on source:

* time period;
* teams;
* projects;
* document groups;
* channels;
* selected initiatives;
* free-text guidance.

## Example for team conversations

**Time period**

> Last six months

**Channels or conversations**

> Only conversations directly connected to selected Engineering initiatives

**Exclude**

> Direct messages and private channels

## Alpha limitation

The controls are illustrative and deterministic.

They do not perform production authorization or governance enforcement.

The UI must not falsely imply that a governance decision has been created.

---

# 21. Sensitive-Source Treatment

Selected team conversations require additional explanation.

## Required copy

> Discovery will request only conversations relevant to this Understanding and within the approved scope. Access must follow organizational permissions and governance policy.

This language describes intended behavior.

It must not claim that production enforcement already exists unless it does.

## Optional action

> Review proposed scope

## Rule

Sensitive sources must never be preapproved through hidden defaults.

For the prototype, the visual state may be:

> Included, pending approval

The user must explicitly confirm this source before starting learning.

---

# 22. Plan-Level Controls

## 22.1 Approve recommended plan

Default state:

* Sprint retrospectives — Included
* Project and issue history — Included
* Selected team conversations — Pending explicit approval
* Product planning documents — Included

## 22.2 Continue with limited information

The user may exclude any source and proceed.

Required copy:

> Discovery can begin with less information. The resulting Understanding may remain more uncertain.

## 22.3 Add context manually

Action:

> Add context instead

Prompt:

> What context should Discovery consider before it begins learning?

Placeholder:

> Add relevant changes, constraints, recent events, or boundaries that may not appear in organizational records.

Manual context is treated as contributed evidence or orientation context in the prototype story.

It should not automatically receive the same weight as corroborated organizational evidence.

## 22.4 Add another source

For Alpha, this may be omitted.

If included, use:

> Suggest another source

Do not expose a full connector catalog.

---

# 23. Dynamic Plan Summary

The plan summary updates as the user changes source states.

## Canonical complete-plan summary

**Approved sources**

> Four source categories

**Uncertainties addressed**

> Four

**Expected Understanding confidence**

> Moderate to high

**Important expected limitation**

> Informal decision behavior may remain difficult to distinguish from structural ownership issues.

## Example reduced-plan summary

When conversations are excluded:

**Approved sources**

> Three source categories

**Expected Understanding confidence**

> Moderate

**Remaining limitation**

> Discovery may identify where work slows without fully understanding why participants respond as they do.

## Rule

Changing a source must visibly affect:

* expected confidence;
* uncertainties addressed;
* remaining unknowns or limitations.

Selection controls must not feel cosmetic.

---

# 24. Confidence Recalculation

For the deterministic Alpha, use a fixed mapping.

## All four sources approved

> Moderate to high

## Retrospectives, project history, and planning documents approved

> Moderate

## Project history only

> Low to moderate

## Conversations only

> Low to moderate

## No sources approved, manual context only

> Low

## Rule

The experience must explain that this is an estimate of likely understanding quality, not a certainty score.

The mapping should live in one canonical mock-plan model, not in component conditionals.

---

# 25. Uncertainty Coverage

The plan should map sources to specific uncertainties.

## Uncertainty One

> Where work loses momentum after commitment

Primary source:

* Project and issue history

Supporting source:

* Sprint retrospectives

## Uncertainty Two

> Why ownership or workflow changes occur

Primary source:

* Selected team conversations

Supporting source:

* Sprint retrospectives

## Uncertainty Three

> Whether priority instability contributes to delay

Primary source:

* Product planning documents

Supporting source:

* Project and issue history

## Uncertainty Four

> Whether the pattern is recurring or isolated

Primary sources:

* Sprint retrospectives
* Project and issue history

The user may inspect this mapping through:

> See uncertainty coverage

---

# 26. Information-Gap State

If the approved sources do not address an important uncertainty, Discovery should say so.

Example:

> This plan does not directly explain why ownership changes occur. Discovery may identify the pattern without being able to distinguish among structural, interpersonal, and governance causes.

This is a stronger product behavior than merely lowering the expected confidence.

Unknowns should remain explicit.

---

# 27. Primary Action

## Default label

> Start learning

## Disabled state

The action remains disabled until:

* at least one source is included; or
* manual context has been supplied;
* all sensitive pending approvals are explicitly resolved.

## Loading label

> Preparing to learn…

This state should be brief.

Do not use:

* Start analysis
* Run ingestion
* Process sources
* Launch AI
* Train model
* Generate Understanding

---

# 28. Secondary Actions

## Back action

> Back to orientation

Returns to Scene Two without losing plan choices during the current session.

## Continue with less information

This should not require a separate action if the user can simply exclude sources and start.

A contextual reassurance should make the option clear.

## Save for later

Not required for Alpha.

## Cancel

Not required during the first-use flow.

---

# 29. Start-Learning Confirmation

When the user selects Start learning:

1. Validate all source states.
2. Confirm sensitive-source approval.
3. Freeze the temporary approved plan.
4. Preserve the plan summary.
5. Transition into Scene Four.
6. Begin the deterministic learning-event sequence.

## Brief transitional statement

> Discovery will begin with the approved information and remain within the current Understanding objective.

This may appear for a short period.

Avoid a conventional consent-completion screen.

---

# 30. Prototype Honesty

The Alpha prototype must not falsely represent live source access.

Use one of these implementation approaches:

## Preferred internal-demo approach

A development-only demonstration control loads the deterministic learning sequence after the user approves the plan.

No user-facing disclaimer interrupts the experience.

The environment itself is clearly identified as a prototype outside the product UI.

## Alternative user-facing approach

A quiet line may state:

> This prototype demonstrates the planned learning experience using prepared example information.

Use only when external reviewers could otherwise mistake the prototype for a functioning data integration.

Do not repeatedly label every source as fake or mocked inside the experience.

---

# 31. Visual Treatment

## 31.1 Overall composition

The scene should feel:

* reasoned;
* transparent;
* controlled;
* substantive;
* calm.

## 31.2 Recommendation surfaces

Recommendations may use restrained surfaces with:

* subtle borders;
* generous internal spacing;
* consistent control placement;
* minimal iconography.

The cards should feel like parts of a research plan, not products for installation.

## 31.3 Icons

Optional category icons may distinguish:

* reflection;
* work history;
* conversation;
* planning context.

Icons must remain secondary.

Do not lead with provider logos.

## 31.4 Selection states

Included, limited, and excluded states must be visible through:

* text;
* control state;
* surface treatment;
* accessible labels.

Do not rely on color alone.

---

# 32. Typography Roles

## Scene headline

Large heading, smaller than Scene One’s primary question.

Suggested desktop range:

```text
36–46 px
```

## Understanding context

Compact heading and body.

## Recommendation title

Medium heading.

Suggested range:

```text
19–23 px
```

## Information-gain label

Small emphasized text.

## Recommendation reason

Primary body.

## Scope and limitation copy

Secondary body.

## Plan summary values

Medium body with restrained emphasis.

Avoid large dashboard-style numbers.

---

# 33. Motion Specification

## 33.1 Scene arrival

Recommended sources should appear as a coherent set.

Do not stagger each card theatrically.

Suggested behavior:

* brief fade;
* slight vertical settling;
* plan summary appears with the recommendations.

## 33.2 Source-state change

When a source changes:

* the card updates immediately;
* the plan summary recalculates;
* expected confidence changes;
* remaining limitations update.

Use short transitions:

```text
150–250 ms
```

## 33.3 Expansion

Expanded details open inline.

Avoid side panels unless high-fidelity testing proves them substantially clearer.

## 33.4 Start-learning transition

Recommendations recede while:

* approved sources remain summarized;
* the first learning event emerges;
* the Understanding objective stays in context.

The motion should communicate:

```text
Plan approved

↓

Learning begins
```

## 33.5 Reduced motion

Use immediate state updates or short fades.

No animated confidence movement is required.

---

# 34. Copy Principles

Scene Three copy must be:

* causal;
* specific;
* bounded;
* transparent;
* nontechnical;
* honest about limitations.

## Preferred language

* recommended because
* addresses
* expected contribution
* expected information gain
* proposed scope
* limitation
* include
* limit
* exclude
* begin with less information
* expected confidence

## Avoid

* data ingestion
* crawl
* index
* sync everything
* train
* connector coverage
* corpus
* embeddings
* tokens
* AI worker
* pipeline
* vector search
* model context

---

# 35. Error and Failure States

## 35.1 No source approved

Message:

> Choose at least one source or add context before Discovery begins learning.

The user’s plan selections remain intact.

## 35.2 Sensitive source unresolved

Message:

> Review the proposed conversation scope before continuing.

Focus moves to the unresolved source.

## 35.3 Invalid scope

Example:

A date range is empty or reversed.

Message:

> Review the selected scope for this source.

Specific fields receive inline guidance.

## 35.4 Plan calculation unavailable

Message:

> Discovery couldn’t estimate the expected Understanding change.

Supporting copy:

> You can still review and approve the sources, but the confidence estimate is temporarily unavailable.

The user may proceed if the plan itself remains valid.

## 35.5 Prototype transition failure

Message:

> Discovery couldn’t begin learning from this plan.

Actions:

* Try again
* Review plan

Preserve all selections.

---

# 36. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* a labeled Understanding-context region;
* a semantic list of source recommendations;
* grouped controls for source states;
* descriptive expanded-detail buttons;
* an announced dynamic plan summary.

## Recommendation controls

Each control must communicate both source and state.

Example accessible label:

> Include Sprint retrospectives in the learning plan

## Dynamic summary

When the plan changes, announce concise updates:

> Expected Understanding confidence changed to moderate.

Do not announce every small visual change.

## Expanded content

Expansion controls must use:

* `aria-expanded`;
* associated region identifiers;
* predictable focus behavior.

## Sensitive-source approval

The approval control must be explicit and keyboard accessible.

## Start-learning focus

After transition, focus moves to the Scene Four heading or current learning event.

---

# 37. Component Hierarchy

```text
PlanScene
├── ExperienceFrame
├── UnderstandingContext
│   ├── UnderstandingName
│   ├── ApprovedObjective
│   └── OriginalQuestionDisclosure
├── LearningPlanIntro
│   ├── PlanHeadline
│   └── PlanSupportingCopy
├── ExpectedUnderstandingChange
│   ├── CurrentConfidence
│   ├── ExpectedConfidence
│   └── EstimateExplanation
├── PrimaryUnknownContext
│   ├── PrimaryUnknown
│   └── UnknownExplanation
├── SourceRecommendationList
│   └── SourceRecommendation[]
│       ├── SourceHeader
│       ├── InformationGain
│       ├── RecommendationReason
│       ├── SourceStateControl
│       ├── RecommendationDetails
│       │   ├── UncertaintyAddressed
│       │   ├── ProposedScope
│       │   ├── ExpectedContribution
│       │   └── Limitation
│       └── SourceScopeEditor
├── ManualContextInput
├── PlanSummary
│   ├── ApprovedSourcesSummary
│   ├── UncertaintyCoverage
│   ├── ExpectedConfidenceSummary
│   └── RemainingLimitations
└── PlanActions
    ├── BackToOrientationAction
    └── StartLearningAction
```

---

# 38. Experience State Contract

```ts
type SourcePlanState =
  | "included"
  | "limited"
  | "excluded"
  | "pending-approval";

type InformationGainLevel =
  | "very-high"
  | "high"
  | "moderate-high"
  | "moderate"
  | "low"
  | "unknown";

interface SourceScope {
  timeRange: string | null;
  teamIds: string[];
  projectIds: string[];
  channelIds: string[];
  documentGroupIds: string[];
  guidance: string | null;
  exclusions: string[];
}

interface LearningSourceRecommendation {
  id: string;
  name: string;
  category: string;
  informationGain: InformationGainLevel;
  reason: string;
  uncertaintyIds: string[];
  proposedScope: SourceScope;
  expectedContribution: string;
  limitation: string;
  sensitivity: "standard" | "elevated";
  state: SourcePlanState;
  requiresExplicitApproval: boolean;
}

interface LearningPlanSummary {
  approvedSourceCount: number;
  addressedUncertaintyIds: string[];
  unaddressedUncertaintyIds: string[];
  expectedConfidence:
    | "low"
    | "low-moderate"
    | "moderate"
    | "moderate-high"
    | "high";
  remainingLimitations: string[];
}

interface PlanSceneState {
  status:
    | "ready"
    | "editing-source"
    | "validating"
    | "submitting"
    | "failed";
  recommendations: LearningSourceRecommendation[];
  manualContext: string;
  summary: LearningPlanSummary;
  expandedRecommendationIds: string[];
  error: string | null;
}
```

## Emitted intent

```ts
interface ApproveLearningPlanIntent {
  understandingId: string;
  approvedObjective: string;
  approvedSources: Array<{
    sourceId: string;
    state: Exclude<SourcePlanState, "pending-approval">;
    scope: SourceScope;
  }>;
  manualContext: string | null;
  expectedConfidence: LearningPlanSummary["expectedConfidence"];
  remainingLimitations: string[];
  approvedAt: string;
}
```

This is an experience-layer contract only.

---

# 39. Canonical Alpha Recommendation Model

```ts
const engineeringProductivityRecommendations: LearningSourceRecommendation[] = [
  {
    id: "sprint-retrospectives",
    name: "Sprint retrospectives",
    category: "Team reflection",
    informationGain: "high",
    reason:
      "Retrospectives can reveal recurring delivery constraints, unresolved dependencies, escalation patterns, and issues teams believe are slowing execution.",
    uncertaintyIds: [
      "execution-versus-planning",
      "recurring-versus-isolated",
    ],
    proposedScope: {
      timeRange: "Last six months",
      teamIds: ["engineering"],
      projectIds: [],
      channelIds: [],
      documentGroupIds: ["engineering-retrospectives"],
      guidance: null,
      exclusions: [],
    },
    expectedContribution:
      "Identify recurring explanations and determine whether the same friction appears across teams and time periods.",
    limitation:
      "Retrospectives reflect what participants noticed and chose to document. They may omit sensitive or normalized problems.",
    sensitivity: "standard",
    state: "included",
    requiresExplicitApproval: false,
  },
  {
    id: "project-issue-history",
    name: "Project and issue history",
    category: "Work-system records",
    informationGain: "high",
    reason:
      "Work history can show where delivery slows, changes ownership, waits for decisions, reopens, or repeatedly moves between teams.",
    uncertaintyIds: [
      "momentum-loss-point",
      "recurring-versus-isolated",
      "priority-instability",
    ],
    proposedScope: {
      timeRange: "Last two quarters",
      teamIds: ["engineering"],
      projectIds: ["engineering-initiatives"],
      channelIds: [],
      documentGroupIds: [],
      guidance: null,
      exclusions: [],
    },
    expectedContribution:
      "Compare delayed and reliably delivered work to identify differences in ownership, dependencies, and workflow movement.",
    limitation:
      "Work-system records show formal activity. They may not explain the reasoning or relationships behind it.",
    sensitivity: "standard",
    state: "included",
    requiresExplicitApproval: false,
  },
  {
    id: "selected-team-conversations",
    name: "Selected team conversations",
    category: "Collaboration context",
    informationGain: "moderate-high",
    reason:
      "Relevant conversations can reveal ambiguity, repeated clarification, informal escalation, and coordination patterns that formal work records do not capture.",
    uncertaintyIds: ["why-workflow-changes-occur"],
    proposedScope: {
      timeRange: "Last six months",
      teamIds: ["engineering", "product", "design"],
      projectIds: ["selected-delayed-initiatives"],
      channelIds: ["approved-project-channels"],
      documentGroupIds: [],
      guidance:
        "Only conversations directly connected to selected Engineering initiatives.",
      exclusions: ["Direct messages", "Private channels"],
    },
    expectedContribution:
      "Connect observed delays to the decisions, questions, and dependencies surrounding them.",
    limitation:
      "Conversation access is sensitive and must remain bounded by purpose, membership, and approved scope.",
    sensitivity: "elevated",
    state: "pending-approval",
    requiresExplicitApproval: true,
  },
  {
    id: "product-planning-documents",
    name: "Product planning documents",
    category: "Strategic context",
    informationGain: "moderate",
    reason:
      "Planning documents can help determine whether priorities, assumptions, and commitments remain stable after teams begin delivery.",
    uncertaintyIds: ["priority-instability"],
    proposedScope: {
      timeRange: "Current and previous quarter",
      teamIds: ["product", "engineering"],
      projectIds: [],
      channelIds: [],
      documentGroupIds: ["product-plans", "quarterly-commitments"],
      guidance: null,
      exclusions: [],
    },
    expectedContribution:
      "Test whether priority instability is a plausible explanation for slowed delivery.",
    limitation:
      "Formal plans may not reflect informal reprioritization or decisions made after publication.",
    sensitivity: "standard",
    state: "included",
    requiresExplicitApproval: false,
  },
];
```

---

# 40. Determinism Requirements

For the canonical Alpha plan:

* recommendation order remains stable;
* default source states remain stable;
* information-gain levels remain stable;
* scope values remain stable;
* confidence mapping remains stable;
* uncertainty coverage remains stable;
* remaining limitations remain stable;
* source-state changes always produce the same summary;
* internal array order changes do not alter the final rendered order;
* timestamps are fixed or seeded where used.

The deterministic model must be centralized.

---

# 41. Product Analytics

Suggested events:

```text
plan_scene_viewed
plan_source_expanded
plan_source_included
plan_source_limited
plan_source_excluded
plan_sensitive_source_approved
plan_manual_context_added
plan_uncertainty_coverage_viewed
plan_started
plan_validation_failed
plan_start_failed
```

Suggested properties:

* source identifier;
* source category;
* information-gain level;
* previous state;
* new state;
* approved source count;
* expected confidence;
* number of remaining limitations;
* time spent reviewing plan.

Do not record:

* raw manual context;
* channel names;
* private scope guidance;
* source contents.

---

# 42. Quality Checks

Confirm:

1. The scene begins with the Understanding objective, not connectors.
2. The primary unknown is visible.
3. Each source has a clear reason.
4. Each source maps to at least one uncertainty.
5. Each source includes an expected contribution.
6. Each source includes a limitation.
7. Information gain is qualitative and explained.
8. Expected confidence is an estimate.
9. Evidence may increase or decrease confidence.
10. Users can exclude any source.
11. Discovery can proceed with less information.
12. Sensitive conversations require explicit approval.
13. Scope is bounded.
14. Source choices affect the plan summary.
15. Source choices affect expected confidence.
16. Unaddressed uncertainties remain visible.
17. Provider logos do not dominate.
18. The scene does not resemble an integration marketplace.
19. The scene does not expose retrieval mechanics.
20. The user knows no learning has begun yet.
21. Keyboard-only operation works.
22. Dynamic changes are announced accessibly.
23. Reduced motion preserves meaning.
24. Mobile controls remain usable.
25. Mocked behavior is not mistaken for production authorization.

---

# 43. Acceptance Criteria

## Functional

* Scene Three displays the approved Understanding objective.
* The current primary unknown is visible.
* Four deterministic source recommendations appear.
* Each recommendation can expand and collapse.
* Each recommendation displays information gain, reason, scope, and limitation.
* Users can include, limit, or exclude sources.
* Sensitive-source approval is explicit.
* Users can add manual context.
* The plan summary updates deterministically.
* Expected confidence changes based on approved sources.
* Remaining limitations update based on approved sources.
* At least one source or manual context is required.
* The approved plan advances to Scene Four.
* Back navigation preserves plan state.
* Failure states preserve all user selections.

## Visual

* The Understanding objective remains visible but secondary to the plan.
* The primary unknown is easy to find.
* Recommendations feel like a coherent research plan.
* Source logos or provider branding do not dominate.
* Information-gain labels are legible but restrained.
* Selection states are clear without relying only on color.
* The plan summary is not styled like a dashboard.
* Sensitive sources are distinguishable without alarmist visual treatment.
* The primary action is easy to locate.
* Responsive layouts preserve reasoning order.

## Product

* The user understands why each source is recommended.
* The user understands what uncertainty each source addresses.
* The user understands what Discovery expects to learn.
* The user understands the limitations of each source.
* The user understands that more information is not always required.
* The user understands the effect of excluding a source.
* The user knows that expected confidence is not guaranteed.
* The user retains control over the learning plan.
* The user believes Discovery is requesting information deliberately rather than indiscriminately.

---

# 44. Prototype Review Script

A reviewer should complete the following:

1. Enter Scene Three from the approved canonical orientation.
2. Identify the most important unknown.
3. Explain why sprint retrospectives are recommended.
4. Explain why project history is recommended.
5. Expand selected team conversations.
6. Identify why that source is sensitive.
7. Review its proposed scope.
8. Explicitly approve it.
9. Exclude product planning documents.
10. Observe the expected confidence change.
11. Identify the remaining limitation.
12. Limit project history to the last quarter.
13. Confirm the plan summary updates.
14. Add manual context:

    > A platform reorganization occurred four months ago.
15. Start learning.
16. Confirm transition to Scene Four.
17. Navigate back and confirm plan state remains.
18. Repeat with all sources except project history excluded.
19. Confirm the plan remains valid but materially more uncertain.
20. Repeat using only a keyboard.
21. Repeat with reduced motion.
22. Repeat at mobile width.

Any inability to explain why a source was requested is a blocking product defect.

---

# 45. Open Decisions

The following must be resolved through high-fidelity design and testing:

1. Whether recommendations use cards, bordered sections, or a continuous list.
2. Whether all recommendation reasons are visible by default.
3. Whether source-state controls use segmented buttons, a menu, or explicit text actions.
4. Whether information gain appears beside the title or beneath the reason.
5. Whether expected confidence appears before or after the source list.
6. Whether uncertainty coverage is always visible or progressively disclosed.
7. Whether sensitive-source approval uses a checkbox, explicit action, or review step.
8. Whether source-limitation editing occurs inline or in a side sheet.
9. Whether manual context appears by default or behind an action.
10. Whether the plan summary remains visible while scrolling.
11. Whether “Moderate to high” is preferable to “Moderately high.”
12. Whether the final action says “Start learning” or “Begin learning.”
13. How the prototype environment communicates that source access is simulated.
14. Whether users can reorder source priority.
15. Whether expected effort or processing time should ever appear.
16. Whether Discovery should recommend proceeding without a low-value source.
17. Whether the user can ask why a source was not recommended.

Codex must not invent answers to these questions during implementation.

---

# 46. Codex Implementation Boundary

Codex may implement:

* the deterministic learning plan;
* recommendation presentation;
* source-state controls;
* scope-limitation interactions;
* sensitive-source approval;
* dynamic summary;
* deterministic confidence mapping;
* manual context input;
* responsive behavior;
* accessibility;
* mocked transition to Scene Four;
* component and interaction tests.

Codex must not:

* connect live sources;
* request real OAuth access;
* create connector infrastructure;
* implement production retrieval;
* modify Governance;
* imply production governance enforcement;
* modify Runtime;
* modify cognition;
* create information-gain architecture;
* introduce exact confidence calculations;
* ingest raw organizational information;
* create new canonical source objects;
* expose provider mechanics;
* redesign the approved learning flow;
* require every recommended source;
* turn the page into a connector marketplace.

---

# 47. Definition of Done

Scene Three is complete when:

* Discovery’s proposed learning strategy is understandable;
* every source has an explicit reason;
* every source addresses a specific uncertainty;
* expected contributions and limitations are visible;
* the user can constrain or exclude sources;
* sensitive access requires explicit approval;
* plan changes alter expected Understanding quality;
* unknowns remain visible when the plan is incomplete;
* the transition into learning feels deliberate;
* the interface remains calm and nontechnical;
* no production behavior changes;
* the user feels agency rather than setup burden.

The final review question is:

> Does Discovery appear to be requesting the smallest, highest-value set of information needed to improve this Understanding?

Only an unambiguous yes is acceptable.
