# Discovery Experience Alpha

# Scene Two Specification — Orient

**Status:** Detailed Alpha interaction specification — implemented selectively
**Version:** 0.1
**Experience stage:** Orientation
**Implemented Alpha route:** `/alpha/orient`
**Previous scene:** Ask
**Next scene:** Plan
**Primary objective:** Convert the user’s original question into a bounded, reviewable Understanding objective.
**Core trust requirement:** Discovery must demonstrate interpretation without pretending certainty.

This document preserves detailed Alpha design intent. The implemented
orientation is deterministic and fixture-backed; edits remain local prototype
state and do not update Organization Runtime or invoke live interpretation.

---

# 1. Scene Purpose

Scene Two helps the user answer:

> Did Discovery understand what I am actually trying to learn?

The user has supplied a natural-language question.

Discovery must now:

* preserve the original question;
* interpret its likely intent;
* establish an initial scope;
* distinguish what is included from what is not yet included;
* communicate its limited starting position;
* allow correction before learning begins.

This scene prevents Discovery from becoming either:

* an opaque system that silently decides what the user meant; or
* a burdensome intake form that asks the user to define everything manually.

Discovery proposes an interpretation.

The user remains responsible for confirming or refining it.

---

# 2. Primary User Outcome

The user reviews Discovery’s interpretation and decides whether it is accurate enough to continue.

The user should leave the scene believing:

* Discovery understood the central concern;
* the inquiry now has a useful boundary;
* Discovery has not started gathering information prematurely;
* the scope can still be corrected;
* exclusions do not imply permanent limitations;
* uncertainty is expected at this stage.

---

# 3. Primary Discovery Outcome

Discovery creates a temporary, user-approved Understanding objective for the Alpha experience.

The objective should provide enough structure to support:

* knowledge-gap identification;
* source recommendations;
* expected information-gain estimates;
* the deterministic learning sequence;
* the first Living Understanding.

The objective remains an experience-layer orientation.

It is not a new canonical cognitive or Runtime object.

---

# 4. Emotional Objective

The emotional transition is:

```text
Readiness

↓

Recognition

↓

Clarity

↓

Control
```

The user should think:

> Yes, that is what I am trying to understand.

The user should not yet think:

* Discovery has solved the problem;
* Discovery has evidence;
* Discovery is highly confident;
* the stated objective is permanent;
* excluded areas are irrelevant.

---

# 5. Canonical Alpha Input

## Original question

> Why has engineering productivity slowed?

This question remains visible throughout the scene.

It should not be silently rewritten or replaced.

---

# 6. Primary Scene Message

## Introductory statement

> Here is how I understand what you are trying to learn.

This language should communicate:

* interpretation;
* humility;
* reviewability;
* forward progress.

Do not use:

* I know what you mean.
* Here is your objective.
* I have defined the problem.
* Analysis scope.
* Query interpretation.
* Prompt understanding.
* Here is what I will analyze.

---

# 7. Interpreted Understanding Objective

## Canonical objective

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

This is the central product object of the scene.

It should be presented as Discovery’s interpretation, not as an objective fact.

## Required characteristics

The objective must be:

* concise;
* consequential;
* organizational rather than individual;
* broad enough to permit discovery;
* bounded enough to guide learning;
* neutral about the cause;
* free of unsupported conclusions;
* written in clear executive language.

## The objective must not presume

* poor employee performance;
* inadequate staffing;
* technical incompetence;
* weak engineering practices;
* bad leadership;
* excessive priority changes;
* unclear ownership;
* a particular intervention.

Those possibilities may later emerge as hypotheses.

They do not belong in the initial objective.

---

# 8. Page Structure

Scene Two contains six primary regions:

```text
Application frame

Original question

Discovery interpretation

Scope boundaries

Current orientation

Review actions
```

The scene should feel like the same inquiry continuing from Scene One.

It must not look like a new configuration page.

---

# 9. Transition from Scene One

## 9.1 Preserved question

The original input surface transforms into a quieter read-only presentation.

Recommended label:

> Your question

Value:

> Why has engineering productivity slowed?

The question should remain editable through a secondary action.

## 9.2 Interpretation state

A brief transitional state may display:

> Understanding your question…

The transition should be restrained and short.

The purpose is to show that Discovery is interpreting the user’s words, not running a full analysis.

## 9.3 Scene emergence

Recommended reveal order:

1. Original question settles into its read-only state.
2. Introductory statement appears.
3. Interpreted objective appears.
4. Scope boundaries appear.
5. Current orientation appears.
6. Review actions become available.

Avoid theatrical one-line-at-a-time AI responses.

The entire meaningful scene should become available quickly.

---

# 10. Desktop Layout

## 10.1 Main content container

Recommended maximum width:

```text
920–1040 px
```

The central objective should occupy a narrower readable column within that container.

Recommended primary text width:

```text
680–780 px
```

## 10.2 Vertical position

The content begins higher than Scene One because the scene contains more information.

Recommended top offset beneath the application frame:

```text
96–128 px
```

## 10.3 Alignment

Primary content remains left-aligned.

The scope and orientation regions may use columns on wide screens, but the visual reading order must remain obvious.

## 10.4 Recommended desktop composition

```text
Your question
Original question text

Here is how I understand...
Interpreted objective

Included                     Not yet included

Current orientation

Refine the question          Continue
```

The primary objective should receive more visual emphasis than the original question.

---

# 11. Tablet and Mobile Layout

## 11.1 Tablet

At tablet widths:

* preserve the original question at the top;
* stack the interpreted objective beneath it;
* allow Included and Not Yet Included to remain in two columns only when legible;
* otherwise stack them;
* keep actions visible without requiring excessive scrolling.

## 11.2 Mobile

On mobile:

* use one column;
* stack all content;
* place scope boundaries in separate sections;
* present the primary action as full width where appropriate;
* keep the secondary refinement action immediately nearby;
* avoid sticky actions that obscure content unless usability testing supports them.

## 11.3 Reading priority

When space is limited, preserve this order:

1. Original question
2. Interpreted objective
3. Current orientation
4. Primary action
5. Scope details
6. Secondary explanatory content

The user must be able to understand and confirm the interpretation without reading every scope item.

---

# 12. Original Question Treatment

## Label

> Your question

## Presentation

The original question should appear:

* clearly;
* without quotation-mark decoration;
* in the user’s exact submitted wording;
* in a quieter visual treatment than the interpreted objective;
* with an available edit action.

## Edit action

Recommended label:

> Edit question

Selecting it should either:

* return the user to Scene One with the question preserved; or
* transform the question back into an editable input within the current scene.

Preferred Alpha behavior:

Return to Scene One with the original question preserved.

This keeps the scene state model simple and makes browser history predictable.

## Rule

Discovery must never alter the original question display after submission.

Any corrected or refined objective appears separately.

---

# 13. Interpretation Presentation

## Introductory copy

> Here is how I understand what you are trying to learn.

## Objective label

Optional:

> Understanding objective

This label may improve clarity but should remain visually secondary.

## Objective copy

> Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.

## Supporting explanation

> I’m treating productivity as the organization’s ability to convert commitments into dependable outcomes—not simply the amount of activity taking place.

This explanation is valuable because “productivity” is ambiguous.

It demonstrates an interpretive choice without overcomplicating the scene.

## Progressive disclosure

The supporting explanation may be collapsed behind:

> How I interpreted “productivity”

However, for the canonical Alpha question, displaying it directly may improve trust.

Final treatment should be tested.

---

# 14. Scope Boundaries

Scope communicates that Discovery has formed a bounded inquiry.

It should not look like a legal contract or configuration form.

## 14.1 Included

### Heading

> This understanding will initially consider

### Canonical items

* how planned work moves into delivery;
* whether decision ownership remains clear;
* whether priorities remain stable after commitment;
* cross-functional dependencies;
* recurring sources of delivery friction.

## 14.2 Not yet included

### Heading

> It will not initially assess

### Canonical items

* individual employee performance;
* compensation or performance reviews;
* whether additional hiring is required;
* code quality or technical architecture;
* broad conclusions about Engineering leadership.

## 14.3 Meaning of “not yet included”

The phrase **not initially** or **not yet included** is essential.

It communicates that:

* Discovery is setting an initial boundary;
* new evidence may justify expansion;
* excluded subjects are not being declared irrelevant;
* sensitive areas are not silently inferred.

## 14.4 Exclusion explanation

Optional copy:

> Discovery can recommend expanding the scope later if evidence suggests one of these areas materially affects the Understanding.

This reinforces the recursive lifecycle.

---

# 15. Scope Interaction

## Default Alpha behavior

Scope items are reviewable but not individually configurable during the first implementation.

The user may:

* continue;
* refine the question;
* open a scope-adjustment interaction.

## Scope adjustment action

Recommended label:

> Adjust scope

This should remain secondary.

## Adjust-scope interaction

The prototype may show a simple dialog or inline expansion with:

* current included areas;
* current exclusions;
* one free-text field:

> What should Discovery include or avoid?

User-entered scope guidance becomes part of the temporary Understanding objective.

## Avoid

Do not make the user manage:

* dozens of checkboxes;
* departments;
* data-source permissions;
* sensitive-data classifications;
* connector scopes;
* role taxonomies.

Those are different product responsibilities.

---

# 16. Current Orientation

Discovery should communicate its starting position before proposing a learning plan.

## Primary heading

> Current orientation

## Orientation state

> Early

or:

> Limited

Preferred Alpha language:

> Early orientation

This emphasizes that Discovery has formed a direction but not an evidence-based conclusion.

## Confidence

> Low confidence

Do not display a precise percentage unless the product has a defensible method for generating it.

The initial mocked experience may use a qualitative level only.

## Most important unknown

> Where planned work begins to lose momentum after commitment.

## Why this unknown matters

> Until that point is understood, Discovery cannot distinguish among planning, ownership, coordination, and execution constraints.

## What Discovery currently has

For a new organization:

> No relevant organizational evidence has been reviewed yet.

For an organization with prior context:

> Discovery has limited related context, but not enough to support a reliable explanation.

The Alpha should use whichever state matches the prototype narrative.

---

# 17. Confidence Language

Scene Two confidence represents confidence in the current orientation—not confidence in the eventual explanation.

The interface must not create ambiguity between:

* confidence that Discovery correctly interpreted the user’s objective;
* confidence in a substantive organizational conclusion.

Recommended separation:

**Interpretation fit**

> Ready for your review

**Understanding confidence**

> Low

Alternatively, avoid an interpretation-confidence score entirely.

## Canonical rule

Do not show a single percentage that could be mistaken for confidence in an answer.

---

# 18. Unknown Presentation

The unknown should be specific and consequential.

## Canonical unknown

> Where planned work begins to lose momentum after commitment.

## Presentation pattern

```text
Most important unknown

Where planned work begins to lose momentum after commitment.

Why it matters

It determines whether Discovery should investigate planning, ownership,
coordination, execution, or another explanation.
```

## Avoid

* More data is needed.
* Insufficient information.
* Unknown cause.
* Analysis unavailable.
* Connect sources to continue.

The unknown itself should create useful orientation.

---

# 19. Primary Actions

## Primary action

> Continue to learning plan

This action advances to Scene Three.

Alternative:

> See how Discovery would learn

The alternative is more descriptive but may be less concise.

Preferred Alpha label:

> Continue to learning plan

## Secondary action

> Refine the question

This returns to Scene One with the original question preserved.

## Tertiary action

> Adjust scope

This opens scope refinement.

## Action hierarchy

The primary action should be visually dominant.

Refinement should feel normal, not like reversing progress or reporting an error.

---

# 20. Confirmation Behavior

When the user selects the primary action:

1. The interpreted objective is marked as accepted for the current inquiry.
2. Scope becomes the input to the learning-plan state.
3. The current orientation remains visible during transition.
4. Scene Three appears.
5. The original question remains accessible as context.

Do not use a celebratory confirmation.

The user is approving a working interpretation, not completing setup.

---

# 21. Refinement Behavior

## 21.1 Refine question

Returning to Scene One should preserve:

* original question;
* any current edits, if applicable;
* selected prompt-source metadata;
* navigation history.

The input should receive focus.

## 21.2 Resubmission

After the user resubmits:

* rerun the deterministic orientation transformation;
* replace the previous interpreted objective;
* do not retain stale scope assumptions;
* preserve access to browser-back behavior.

## 21.3 Alpha constraint

Only the canonical question requires a fully authored downstream journey.

When another question is entered, the prototype may generate a structurally valid generic orientation, but it must not imply production-quality interpretation.

A development-only notice may clarify demonstration boundaries outside the user-facing product surface.

---

# 22. Scope Adjustment Behavior

## Prompt

> What should Discovery include or avoid?

## Input placeholder

> Add context about the teams, outcomes, time period, or boundaries that matter.

## Example guidance

* Focus on work after quarterly planning.
* Do not assess individual engineers.
* Include Product and Design dependencies.
* Consider the last six months.

## Action

> Update orientation

## Result

Discovery updates:

* interpreted objective where relevant;
* included scope;
* excluded scope;
* most important unknown.

## Alpha rule

Scope adjustment should be deterministic for the canonical example.

It does not need a general natural-language interpretation system.

---

# 23. Visual Hierarchy

The visual hierarchy should be:

1. Interpreted Understanding objective
2. Primary action
3. Original question
4. Current orientation
5. Scope boundaries
6. Supporting explanations
7. Secondary actions

The scope should not visually overwhelm the objective.

Avoid rendering every item as an independent card.

Recommended treatment:

* simple grouped text;
* restrained separators;
* subtle surface changes;
* generous whitespace.

---

# 24. Surface Model

Prefer three restrained surfaces at most:

1. Page background
2. Interpreted objective or orientation surface
3. Optional scope-adjustment surface

The original question may appear as a quiet inset or text block.

Do not create:

* separate cards for every scope item;
* analytics-style metric tiles;
* colored confidence widgets;
* side-panel navigation;
* an onboarding stepper.

---

# 25. Typography Roles

## Original question label

Small body or label.

## Original question

Medium body or compact heading.

## Introductory statement

Body or secondary heading.

## Interpreted objective

Primary display or large heading beneath the main page heading.

Suggested desktop range:

```text
34–44 px
Line height: 1.15–1.25
```

Suggested mobile range:

```text
27–34 px
```

## Scope headings

Small heading or emphasized body.

## Scope items

Readable body text.

## Current orientation values

Medium body with restrained emphasis.

Do not use oversized metric typography for confidence.

---

# 26. Motion Specification

## 26.1 Scene arrival

The original question should already be visible from the transition.

The remaining content may fade or settle into place.

Suggested duration:

```text
250–450 ms
```

## 26.2 Scope adjustment

Use:

* inline expansion;
* short opacity transition;
* minimal vertical movement.

Avoid modal motion that feels detached from the inquiry.

## 26.3 Continue transition

When advancing:

* preserve the objective;
* allow scope details to recede;
* introduce the learning-plan message;
* maintain spatial continuity.

The objective may become the persistent header context of Scene Three.

## 26.4 Reduced motion

Use direct state replacement or short fades.

No sliding panels are required.

---

# 27. Copy Principles

Scene Two copy must be:

* interpretive, not declarative;
* concise;
* neutral about causes;
* clear about boundaries;
* explicit about uncertainty;
* free of technical vocabulary.

## Preferred phrases

* Here is how I understand…
* initially consider
* not yet included
* current orientation
* most important unknown
* refine
* adjust
* working objective

## Avoid

* parsed query
* analysis parameters
* search scope
* ingestion targets
* detected intent
* generated objective
* confidence score
* system interpretation
* AI recommendation

---

# 28. Error and Failure States

## 28.1 Orientation unavailable

Message:

> Discovery couldn’t form a clear Understanding objective from this question.

Supporting copy:

> Your original question has been preserved. Add a little more context and try again.

Actions:

* Refine question
* Try again

## 28.2 Conflicting scope guidance

Message:

> Some of the current boundaries conflict.

Supporting example:

> The scope asks Discovery to assess Engineering leadership while also excluding leadership conclusions.

Action:

> Review scope

Do not automatically choose one interpretation.

## 28.3 Empty or removed objective

The primary action remains unavailable.

Message:

> Discovery needs a clear working objective before it can propose a learning plan.

## 28.4 Prototype state failure

Message:

> Discovery couldn’t prepare the learning plan.

Actions:

* Try again
* Return to question

The question and scope must remain preserved.

---

# 29. Accessibility Contract

## Semantic structure

Use:

* one page-level heading;
* clear section headings;
* semantic lists for included and excluded areas;
* descriptive action labels;
* status announcements for interpretation and scope updates.

## Focus after Scene One

When Scene Two loads, move focus to:

> Here is how I understand what you are trying to learn.

or the interpreted objective heading.

## Scope adjustment

If an inline region opens:

* move focus to its heading or input;
* preserve focus containment only if implemented as a true modal;
* return focus to the triggering control after closure.

## Confidence

Do not rely on visual styling alone.

Screen-reader text should communicate:

> Understanding confidence is currently low because no relevant evidence has been reviewed.

## Lists

Included and excluded areas should be announced as separate labeled groups.

---

# 30. Component Hierarchy

```text
OrientScene
├── ExperienceFrame
├── InquiryContext
│   ├── OriginalQuestionLabel
│   ├── OriginalQuestion
│   └── EditQuestionAction
├── OrientationIntro
│   ├── OrientationStatement
│   ├── UnderstandingObjective
│   └── InterpretationExplanation
├── ScopeSummary
│   ├── IncludedScope
│   │   ├── ScopeHeading
│   │   └── ScopeItem[]
│   ├── ExcludedScope
│   │   ├── ScopeHeading
│   │   └── ScopeItem[]
│   └── AdjustScopeAction
├── CurrentOrientation
│   ├── OrientationStage
│   ├── UnderstandingConfidence
│   ├── PrimaryUnknown
│   └── UnknownExplanation
└── OrientationActions
    ├── RefineQuestionAction
    └── ContinueToPlanAction
```

Components should remain experience-specific until repeated patterns justify extraction.

---

# 31. Experience State Contract

```ts
type OrientSceneStatus =
  | "interpreting"
  | "ready"
  | "editing-scope"
  | "updating-scope"
  | "failed";

type UnderstandingConfidenceLevel =
  | "very-low"
  | "low"
  | "moderate"
  | "high";

interface UnderstandingScope {
  included: string[];
  excluded: string[];
  userGuidance: string | null;
}

interface OrientationViewModel {
  originalQuestion: string;
  objective: string;
  interpretationExplanation: string | null;
  scope: UnderstandingScope;
  stageLabel: string;
  confidenceLevel: UnderstandingConfidenceLevel;
  confidenceExplanation: string;
  primaryUnknown: string;
  primaryUnknownWhyItMatters: string;
}

interface OrientSceneState {
  status: OrientSceneStatus;
  orientation: OrientationViewModel | null;
  scopeDraft: string;
  error: string | null;
}
```

## Emitted intent

```ts
interface ApproveUnderstandingOrientationIntent {
  originalQuestion: string;
  approvedObjective: string;
  scope: UnderstandingScope;
  approvedAt: string;
}
```

This remains an experience-layer contract.

---

# 32. Canonical Alpha View Model

```ts
const engineeringProductivityOrientation: OrientationViewModel = {
  originalQuestion: "Why has engineering productivity slowed?",
  objective:
    "Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.",
  interpretationExplanation:
    "I’m treating productivity as the organization’s ability to convert commitments into dependable outcomes—not simply the amount of activity taking place.",
  scope: {
    included: [
      "How planned work moves into delivery",
      "Whether decision ownership remains clear",
      "Whether priorities remain stable after commitment",
      "Cross-functional dependencies",
      "Recurring sources of delivery friction",
    ],
    excluded: [
      "Individual employee performance",
      "Compensation or performance reviews",
      "Whether additional hiring is required",
      "Code quality or technical architecture",
      "Broad conclusions about Engineering leadership",
    ],
    userGuidance: null,
  },
  stageLabel: "Early orientation",
  confidenceLevel: "low",
  confidenceExplanation:
    "No relevant organizational evidence has been reviewed yet.",
  primaryUnknown:
    "Where planned work begins to lose momentum after commitment.",
  primaryUnknownWhyItMatters:
    "Until that point is understood, Discovery cannot distinguish among planning, ownership, coordination, and execution constraints.",
};
```

---

# 33. Determinism Requirements

For the canonical Alpha question:

* the same input produces the same objective;
* the same input produces the same default scope;
* included and excluded lists remain stable across refreshes;
* current orientation remains stable;
* the primary unknown remains stable;
* input-order differences in internal mock structures do not alter presentation;
* timestamps, where used, are seeded or fixed for demonstration.

Scope-adjustment examples must also produce deterministic outputs.

---

# 34. Product Analytics

Suggested events:

```text
orient_scene_viewed
orientation_refine_question_selected
orientation_scope_adjustment_opened
orientation_scope_updated
orientation_approved
orientation_failed
```

Suggested properties:

* source question type;
* whether the question was edited;
* whether scope was adjusted;
* number of included areas;
* number of excluded areas;
* time spent reviewing orientation.

Do not record raw scope guidance in analytics by default.

---

# 35. Quality Checks

Confirm:

1. The original question remains visible.
2. The interpreted objective is clearly separate from the original wording.
3. Discovery does not claim the interpretation is unquestionably correct.
4. The objective does not presume a cause.
5. Included scope is understandable.
6. Excluded scope is framed as provisional.
7. Sensitive individual assessment is excluded by default.
8. Confidence is clearly low.
9. Confidence refers to the Understanding, not interface interpretation.
10. The most important unknown is specific.
11. The user can refine the question.
12. The user can adjust scope.
13. The primary action advances to a learning plan.
14. No information source is requested yet.
15. No implementation mechanics appear.
16. The scene contains no dashboard-style metrics.
17. Mobile reading order remains coherent.
18. Keyboard-only review and continuation work.
19. Reduced motion preserves the transition.
20. The user remains in control.

---

# 36. Acceptance Criteria

## Functional

* Scene Two receives and displays the exact original question.
* A deterministic interpreted objective is displayed.
* Included and excluded scope are displayed.
* Current orientation is displayed.
* Low confidence is explained.
* One primary unknown is shown.
* The user can return to edit the question.
* The user can open scope adjustment.
* Scope guidance can update the deterministic orientation.
* The user can approve the orientation.
* Approval advances to Scene Three.
* Scene state survives browser navigation during the prototype session.
* Failure states preserve the original question and scope.

## Visual

* The interpreted objective is the dominant visual element.
* The original question remains easy to locate.
* Scope does not overwhelm the page.
* Included and excluded areas are visually distinguishable without relying only on color.
* Confidence is not presented as a decorative metric.
* The page does not resemble a setup wizard.
* The page does not resemble a technical query builder.
* The layout remains calm and spacious.
* Responsive behavior preserves the intended hierarchy.

## Product

* The user can tell how Discovery interpreted “productivity.”
* The user can tell what Discovery will initially consider.
* The user can tell what Discovery will not initially assess.
* The user understands that the scope may evolve.
* The user knows Discovery has not reviewed evidence yet.
* The user understands the most important current unknown.
* The user feels able to correct Discovery.
* The user believes the inquiry is sufficiently bounded to continue.

---

# 37. Prototype Review Script

A reviewer should complete the following:

1. Submit:

   > Why has engineering productivity slowed?
2. Observe the question remain visible.
3. Read the interpreted objective.
4. Explain in their own words how Discovery interpreted “productivity.”
5. Identify one included area.
6. Identify one excluded area.
7. Identify the largest unknown.
8. Open Adjust Scope.
9. Add:

   > Include Product and Design dependencies.
10. Update the orientation.
11. Confirm the scope changes coherently.
12. Return to edit the original question.
13. Confirm the original wording is preserved.
14. Resubmit and return to Scene Two.
15. Approve the orientation.
16. Confirm transition to Scene Three.
17. Repeat using only a keyboard.
18. Repeat with reduced motion.
19. Repeat at mobile width.

Confusion about whether Discovery already has evidence is a blocking defect.

---

# 38. Open Decisions

The following should be resolved in visual design:

1. Whether the original question appears in a quiet surface or as plain text.
2. Whether the interpretation explanation is visible by default.
3. Whether Included and Not Yet Included use columns on desktop.
4. Whether Current Orientation appears before or after scope boundaries.
5. Whether “Early orientation” is clearer than “Limited understanding.”
6. Whether confidence is shown as “Low” or “Low confidence.”
7. Whether scope adjustment is inline, a dialog, or a temporary side sheet.
8. Whether the primary action says “Continue to learning plan” or “See how Discovery would learn.”
9. Whether the scope includes an explicit time horizon.
10. Whether an existing organization displays related prior knowledge at this stage.
11. Whether the interpreted objective can be edited directly.
12. Whether the user must explicitly approve scope or may continue through the primary action alone.

Codex must not resolve these questions by inventing new interaction patterns.

---

# 39. Codex Implementation Boundary

Codex may implement:

* the deterministic orientation;
* the preserved question;
* responsive layout;
* scope display;
* scope adjustment;
* current orientation;
* accessibility;
* transition to Scene Three;
* testable error states;
* component tests.

Codex must not:

* call a production language model;
* infer real organizational scope;
* create new cognitive objects;
* modify Runtime;
* modify Governance;
* begin retrieval;
* connect integrations;
* create technical confidence calculations;
* add employee-level assessment;
* expose internal architecture;
* turn the scene into a settings page;
* silently change the user’s question;
* invent conclusions about the organization.

---

# 40. Definition of Done

Scene Two is complete when:

* the original question remains intact;
* Discovery’s interpretation is clear and neutral;
* the initial inquiry is meaningfully bounded;
* excluded areas are explicit and provisional;
* the current lack of evidence is obvious;
* the most important unknown is actionable;
* the user can correct Discovery;
* the user can approve the orientation;
* the experience transitions naturally into the learning plan;
* no production architecture changes;
* the user feels recognized rather than categorized.

The final review question is:

> Does Discovery appear to have thoughtfully interpreted the user’s concern while leaving the user in control of what it means?

Only an unambiguous yes is acceptable.
