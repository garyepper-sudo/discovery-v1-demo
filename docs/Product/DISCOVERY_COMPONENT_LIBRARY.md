# Discovery Component Library

## 1. Status and Authority

**Status:** Canonical component architecture
**Scope:** Reusable component responsibilities, contracts, and boundaries
**Production implementation:** Deferred
**Readers:** Designers, engineers, reviewers, researchers, and Codex

Authority order:

1. `docs/Product/PRODUCT_CANON.md` governs product identity.
2. `docs/Architecture/Canon/DISCOVERY_PLATFORM_PRINCIPLES.md` governs platform
   boundaries.
3. Shared Organizational Intelligence, the Organization Experience Canon, and
   applicable architecture canon govern their named platform, application, and
   technical domains.
4. `docs/Product/DISCOVERY_DESIGN_LANGUAGE.md` governs interaction philosophy.
5. `docs/Product/DISCOVERY_UI_SYSTEM.md` governs shared visual and interaction
   rules.
6. This document governs reusable semantic component responsibilities,
   accessibility, presentation expectations, and composition boundaries.
7. Application specifications and approved mockups govern application-specific
   behavior, composition, and visual intent.
8. Implementation must conform to the authorities above.

The deterministic fixture-backed Discovery Experience Alpha demonstrates
current application implementation and provides examples; it does not define
reusable platform component authority. `DISCOVERY_MOTION_SYSTEM.md` governs
motion behavior. `DISCOVERY_COPY_GUIDE.md` governs detailed copy, voice,
terminology, labels, confidence wording, uncertainty language, action wording,
errors, empty states, restricted-state language, and success and confirmation
language. This Component Library governs where required semantic content
appears and its hierarchy, truncation, visibility, accessibility, and
presentation constraints; it does not maintain a competing language standard.
`DISCOVERY_VIEW_MODEL_ARCHITECTURE.md` owns canonical product-facing view-model
definitions.

`DISCOVERY_FRONTEND_ARCHITECTURE.md` governs routing, server/client boundaries,
module and directory placement, data loading, organization identity
propagation, orchestration, integration structure, and application composition
boundaries. This Component Library does not govern route ownership, data
fetching, Runtime loading, `organizationId` propagation, server-side or
client-side orchestration, feature-module placement, integration wiring, or
application-level composition architecture. It owns semantic component
responsibilities and presentation behavior only and does not duplicate these
sibling contracts.

Implementation may not resolve open product or design decisions implicitly.
Material deviation requires design approval, validated user research, or
benchmark evidence when architecture is affected.

## 2. Purpose

The component library gives Discovery one reusable product vocabulary without
turning the interface into a generic widget collection.

It prevents:

- component invention per screen;
- duplicate concepts under different names;
- generic card and dashboard abstractions;
- metric-first APIs;
- product logic leaking into primitives;
- components reading Runtime or inferring cognition;
- inaccessible or motion-dependent variants;
- inconsistent confidence, unknown, contradiction, and relationship treatment;
- unbounded prop surfaces;
- premature abstraction;
- Codex redesigning the experience while implementing it.

## 3. Component Architecture Principles

### 3.1 Components communicate meaning

**Statement:** A component exists to communicate or support a specific meaning,
not merely to contain content.

**Rationale:** Containers without semantic responsibility create card
proliferation.

**Implication:** Name the user question and product meaning before defining an
API.

**Violation:** Creating `InfoCard` because several blocks have borders.

### 3.2 The Understanding is the composition root

**Statement:** Understanding-centered scenes compose around the Living
Understanding, its objective, synthesis, uncertainty, change, or stewardship.

**Rationale:** Controls and metrics must not become the product's center.

**Implication:** `UnderstandingHero` owns primary visual hierarchy, not evidence
lists or actions.

**Violation:** A dashboard grid owns the page and the synthesis becomes one
tile.

### 3.3 Prefer semantic components

**Statement:** Repeated Discovery concepts receive explicit semantic names.

**Rationale:** `PrimaryUnknown` can enforce meaning, copy, accessibility, and
composition in ways `AlertCard` cannot.

**Implication:** Reuse `MeaningfulContradiction`, not a warning variant of a
generic card.

**Violation:** `MetricCard type="contradiction"`.

### 3.4 Primitives remain quiet

**Statement:** Foundations supply interaction, structure, and accessibility
without imposing product hierarchy.

**Rationale:** A primitive should not pull every use toward a filled card or
prominent action.

**Implication:** `Surface` defaults to no elevation and `Action` requires an
explicit hierarchy.

**Violation:** Every `Section` renders a rounded elevated container.

### 3.5 Product semantics live in view models

**Statement:** Components receive explicit presentation-ready meaning.

**Rationale:** UI must not calculate organizational truth or infer access.

**Implication:** Adapters create qualitative confidence labels, ordered
contradictions, and permitted source summaries.

**Violation:** A component maps a numeric confidence to “High” or sorts evidence
by an invented rule.

### 3.6 Components do not perform cognition

**Statement:** Components never infer mechanisms, causality, relationships,
confidence, contradiction, or learning.

**Rationale:** Cognition has canonical producers and provenance.

**Implication:** Render supplied interpretation and explanation exactly within
the component contract.

**Violation:** `Relationship` decides that shared keywords imply connection.

### 3.7 Components do not own Governance

**Statement:** Components render governed view models and restricted states;
they do not decide visibility.

**Rationale:** Hiding DOM content is not governance enforcement.

**Implication:** Denied raw content never enters component props.

**Violation:** Pass restricted evidence and use CSS to conceal it.

### 3.8 Preserve uncertainty and contradiction

**Statement:** Semantic components cannot omit material unknowns,
qualifications, or contradiction merely to simplify layout.

**Rationale:** These states increase calibrated trust.

**Implication:** Required semantic fields cannot be optional solely for visual
convenience.

**Violation:** Hide contradiction on mobile.

### 3.9 Progressive disclosure is contractual

**Statement:** Components specify what is visible, expandable, and never hidden.

**Rationale:** Disclosure depth must remain coherent across scenes.

**Implication:** Use accessible expansion with stable summaries and focus.

**Violation:** Every component independently invents a drawer or modal.

### 3.10 Mock and production projections share contracts

**Statement:** Deterministic Alpha data and future projections should feed the
same view-model shape where practical.

**Rationale:** Prototype UI should not become a parallel product architecture.

**Implication:** Mock adapters live outside components and identify simulated
behavior honestly.

**Violation:** Components branch on `isMock` to change semantic meaning.

### 3.11 Accessibility belongs to every contract

**Statement:** Semantics, keyboard behavior, focus, announcements, contrast,
touch, and reduced motion are component responsibilities.

**Rationale:** Accessibility cannot be repaired reliably at the scene level.

**Implication:** Required accessibility behavior is documented and tested with
each component.

**Violation:** A visual-only contradiction icon without accessible text.

### 3.12 Motion belongs to component state

**Statement:** Components declare which state changes may move and their
reduced-motion equivalent.

**Rationale:** Motion explains state change and must remain deterministic.

**Implication:** `UnderstandingEvolution` owns its transition semantics; a scene
does not add generic entrance animation.

**Violation:** Wrapper-level stagger animates every child.

### 3.13 Responsive behavior is specified

**Statement:** Every semantic component has an intentional reading order,
stacking rule, action position, and truncation contract.

**Rationale:** Mobile is recomposed, not desktop shrunk.

**Implication:** Components expose semantic regions that can reorder without
changing meaning.

**Violation:** Use CSS scale or hide qualifications on narrow screens.

### 3.14 Abstraction is earned

**Statement:** Extract a reusable component after repeated semantic
responsibility is demonstrated.

**Rationale:** Premature components create broad props and frozen mistakes.

**Implication:** Scene compositions remain local until reuse is proven.

**Violation:** A single-use section becomes `UniversalInsightPanel`.

### 3.15 Components follow canonical product language

**Statement:** Under the Copy Guide's authority, components cannot rename
Understanding, learning, contradiction, unknown, evidence, or meaningful
change.

**Rationale:** Consistent language preserves the product model.

**Implication:** Copy slots are constrained by semantic purpose, not arbitrary
marketing strings.

**Violation:** `PrimaryUnknown` defaults to “Alert” or “Data gap.”

## 4. Library Taxonomy

Classification:

- **Primitive (P):** low-level interaction or layout.
- **Semantic component (S):** encodes one Discovery concept.
- **Composed pattern (C):** reusable arrangement of semantic components.
- **Scene composition (SC):** answers one scene-level question.

### Foundations

| Name | Class | Responsibility |
| --- | --- | --- |
| Action | P | accessible action hierarchy |
| TextAction | P | low-emphasis verb-led action |
| IconAction | P | compact labeled icon control |
| Input | P | concise textual entry |
| TextArea | P | expanding natural-language contribution |
| SelectableRow | P | one bounded selection with explanation |
| Disclosure | P | accessible progressive detail |
| StatusLabel | P | restrained named state |
| SemanticCallout | P | accessible semantic emphasis shell |
| Section | P | heading, description, and vertical rhythm |
| Divider | P | quiet structural separation |
| Surface | P | optional bounded visual region |
| InlineEdit | P | reviewable reversible text editing |
| EmptyState | P | current boundary plus useful path |
| ErrorState | P | recoverable failure preserving work |

### Understanding

| Name | Class |
| --- | --- |
| UnderstandingHeader | C |
| UnderstandingHero | C |
| CurrentSynthesis | S |
| ConciseInterpretation | S |
| UnderstandingStatus | S |
| ConfidenceSummary | S |
| ConfidenceExplanation | S |
| StrongestExplanation | S |
| PrimaryUnknown | S |
| MeaningfulContradiction | S |
| UnderstandingRelationship | S |
| MeaningfulChangeSummary | S |
| UnderstandingHistory | C |
| SupportingOverview | C |
| FollowState | S |

### Learning

| Name | Class |
| --- | --- |
| UnderstandingObjective | S |
| LearningPlanSummary | C |
| SourceRecommendation | S |
| InformationGain | S |
| SourceScopeSummary | S |
| SourceStateControl | S |
| LearningEvent | S |
| LearningEventEffect | S |
| CurrentUnderstandingSnapshot | C |
| UnderstandingEvolution | C |
| BeforeAndAfterUnderstanding | C |
| LearningRecommendation | S |
| LearningReadyState | C |

### Evidence and Reasoning

| Name | Class |
| --- | --- |
| ReasoningSummary | S |
| ReasoningChain | C |
| EvidenceGroup | S |
| EvidenceObservation | S |
| EvidenceStrength | S |
| EvidenceLimitation | S |
| AlternativeExplanation | S |
| FalsificationConditions | S |
| SourceContextAccess | S |
| ReasoningHistory | C |

### Stewardship and Response

| Name | Class |
| --- | --- |
| ResponsePathSelector | C |
| ResponsePathOption | S |
| ContributionComposer | C |
| ContributionTarget | S |
| ContributorPerspective | S |
| ContributionEffectPreview | C |
| SensitiveContributionNotice | S |
| ResponseResult | C |
| ChallengeEntry | S |
| ConfirmationState | S |

### Return and Home

| Name | Class |
| --- | --- |
| MeaningfulLearningSummary | S |
| MostImportantChange | C |
| MeaningfulChangeItem | S |
| RecommendedNextLearning | S |
| FollowedUnderstandingRow | S |
| ContributionFollowUp | S |
| StableUnderstandingsSummary | C |
| AskDiscoveryEntry | C |
| MorningGreeting | scene copy, not yet a component |

Composition-specific arrangements remain application-local until repetition
demonstrates reusable responsibility. Semantic components never contain
routing, Runtime access, or scene-level orchestration. Adapters sit outside the
library under Frontend Architecture and application integration boundaries.

## 5. Component Classification Model

### Primitive

Owns accessible interaction or layout mechanics. It does not understand
Discovery cognition, Runtime, or Governance.

Examples: `Action`, `Disclosure`, `Surface`, `StatusLabel`.

### Semantic component

Owns the consistent representation and interaction contract for one Discovery
concept.

Examples: `ConfidenceSummary`, `PrimaryUnknown`,
`MeaningfulContradiction`, `LearningEvent`.

### Scene composition

Combines semantic components to answer one governing question.

Examples: `AskComposition`, `LearnComposition`, `HomeLearningBrief`.

Rules:

- do not generalize a scene composition until it repeats;
- semantic components remain routing-independent;
- primitives accept no cognitive or Runtime types;
- view-model adapters remain outside component files;
- components emit user intents, not domain mutations.

## 6. Canonical Component Contract Template

Every future component entry or story must document:

```text
Name
Classification
Purpose
Governing product question
Scenes used
Anatomy
Required content
Optional content
Variants
States
Interaction behavior
Responsive behavior
Motion behavior
Accessibility contract
Copy rules
Data/view-model contract
Composition rules
Anti-patterns
Implementation notes
Unresolved questions
```

“Not applicable” is acceptable when justified. Omitting the field is not.

## 7. Foundation Components

### Action

- **Class:** Primitive.
- **Purpose:** Advance or alter the current user question.
- **Variants:** primary, secondary, tertiary, quiet, caution/destructive.
- **Required:** verb-led label, intent handler or destination, accessible name.
- **States:** idle, hover, focus, active, loading, disabled, error recovery.
- **Behavior:** one primary per composition; loading preserves label context and
  prevents duplicate submission; disabled requires an available explanation
  when the reason is not obvious.
- **Responsive:** minimum 44×44px; primary may become full width or sticky on
  mobile only under UI System rules; icons remain secondary.
- **Motion:** brief acknowledgement under the Motion System; no celebratory
  animation.
- **Accessibility:** native button/link semantics, visible focus, `aria-busy`
  where appropriate.
- **Copy:** specific verbs such as “Begin understanding,” “Examine
  contradiction,” or “Follow this Understanding.”
- **Anti-pattern:** filled buttons for every available action.

### TextAction

- **Class:** Primitive.
- **Use:** refine, examine, see what changed, not now, return.
- **Contract:** visible affordance, verb-led label, adequate target size,
  underline or equivalent non-color cue where link-like.
- **Anti-pattern:** generic “Learn more.”

### IconAction

- **Class:** Primitive.
- **Use:** close, expand, pause, or other universally understood compact
  mechanics.
- **Contract:** accessible name, tooltip where helpful, 44×44px target.
- **Prohibited:** icon-only semantic actions such as Challenge or Follow.

### Input

- **Class:** Primitive.
- **Use:** concise single-line natural-language or scoped entry.
- **Contract:** persistent visible/programmatic label, help/error association,
  preserved value, no semantic inference.
- **Mobile:** native keyboard hints and no viewport zoom caused by small text.

### TextArea

- **Class:** Primitive.
- **Use:** Ask, scope guidance, contribution.
- **Behavior:** auto-grow to a documented maximum, then scroll; preserve input
  after failure; `Cmd/Ctrl+Enter` may submit only when disclosed; plain Enter
  creates a line break.
- **Guidance:** scene owns recommended/max length and validation.
- **Mobile:** no hidden submit behind keyboard; avoid fixed height.
- **Anti-pattern:** chat composer styling in the core Understanding flow.

### SelectableRow

- **Class:** Primitive.
- **Use:** response paths, source states, investigation targets.
- **Anatomy:** control, title, one-sentence meaning, optional qualification.
- **Behavior:** entire row is a target; selected state uses text, shape, and
  color; native radio/checkbox semantics match selection model.
- **Anti-pattern:** generic card with invisible selection semantics.

### Disclosure

- **Class:** Primitive.
- **Purpose:** Reveal qualification, reasoning, evidence, or history inline.
- **Behavior:** native or equivalent button with `aria-expanded` and controlled
  region; stable summary remains visible; focus stays on trigger unless a
  focused task opens.
- **Motion:** follow the Motion System's disclosure and reduced-motion
  guidance.
- **Anti-pattern:** modal for routine detail.

### StatusLabel

- **Class:** Primitive.
- **Use:** Living Understanding, Following, Early orientation, Stable,
  Meaningful relationship.
- **Contract:** short text, restrained styling, optional icon, no standalone
  color.
- **Limit:** normally one lifecycle label per object.
- **Anti-pattern:** badge clusters.

### SemanticCallout

- **Class:** Primitive shell.
- **Use:** unknown, contradiction, sensitive context, meaningful change.
- **Contract:** semantic label, heading/content, consequence, optional one
  action; supplied kind controls presentation only.
- **Anti-pattern:** a generic alert API that treats contradiction as warning.

### Surface

- **Class:** Primitive.
- **Variants:** base, subtle, emphasized, semantic.
- **Default:** no surface unless boundary adds comprehension.
- **Prohibited:** nested surfaces, decorative elevation, generic card grids.

### Section

- **Class:** Primitive.
- **Anatomy:** optional eyebrow, heading, description, content, actions.
- **Contract:** semantic heading level supplied by composition; spacing follows
  UI System.
- **Anti-pattern:** owning route, data fetch, or semantic ordering.

### Divider

- **Class:** Primitive.
- **Use:** separate adjacent conceptual regions only when space/alignment is
  insufficient.
- **Accessibility:** decorative by default; labeled separator only if meaningful.

### InlineEdit

- **Class:** Primitive.
- **Use:** objective or Understanding name only where scene/product approval
  exists.
- **Behavior:** preserve original, explicit save/cancel, validation, focus
  return, no silent autosave of canonical meaning.

### EmptyState

- **Class:** Primitive pattern.
- **Contract:** state what Discovery currently can or cannot understand, why
  when safe, and one useful next path.
- **Anti-pattern:** “No data” or generic illustration.

### ErrorState

- **Class:** Primitive pattern.
- **Contract:** name affected operation, preserve Understanding and user work,
  offer safe retry/alternate path, avoid technical leakage.
- **Anti-pattern:** replace the entire scene with a generic error.

## 8. Understanding Components

### UnderstandingHeader

- **Class:** Composed pattern.
- **Purpose/question:** Which Living Understanding is this, and what is its
  current lifecycle?
- **Scenes:** Understand, Examine, Respond, Follow, Return detail.
- **Anatomy:** name, `UnderstandingStatus`, optional `FollowState`, optional last
  meaningful change.
- **Responsive:** stacks metadata below name; never truncates name without full
  accessible value.
- **Composition:** sibling to hero, not a card around it.

### UnderstandingHero

- **Class:** Composed pattern and primary composition root.
- **Question:** What does Discovery currently understand?
- **Anatomy:** header, `CurrentSynthesis`, optional
  `ConciseInterpretation`, `ConfidenceSummary`, one primary action.
- **Maximum default detail:** one synthesis, one confidence summary, one
  material unknown/qualification, one action.
- **Responsive:** single column; 45–65 character synthesis line length; action
  follows meaning.
- **Motion:** current text remains stable unless
  `UnderstandingEvolution` explicitly owns a change.
- **Prohibited:** raw evidence, gauges, count rows, multiple primary actions.

### CurrentSynthesis

- **Class:** Semantic.
- **Required:** synthesis text, qualification when material, version/change
  reference supplied by view model.
- **Treatment:** editorial, uncontained, readable line length.
- **Live update:** only through explicit evolution state; old version remains
  accessible through history.
- **Anti-pattern:** silent text replacement.

### ConciseInterpretation

- **Class:** Semantic, optional.
- **Purpose:** Translate synthesis into shorter executive language when it adds
  comprehension.
- **Rule:** omit if it merely repeats the synthesis.

### UnderstandingStatus

- **Class:** Semantic.
- **Canonical interaction vocabulary:** early, developing, active, contested,
  strengthened, weakened, superseded, stable.
- **Rule:** labels describe user-facing meaning, not new Runtime states.
- **Copy:** no “complete” or “final.”

### ConfidenceSummary

- **Class:** Semantic.
- **Required:** qualitative label, rationale summary or disclosure target,
  semantic state, accessible description.
- **Optional:** numeric value only when the scene contract enables it.
- **Behavior:** opens `ConfidenceExplanation`; does not calculate labels.
- **Prohibited:** gauge, traffic light, unsupported precision, “success” color.

### ConfidenceExplanation

- **Class:** Semantic.
- **Required:** supporting convergence, limitations, material contradiction,
  unresolved causality where relevant.
- **Accessibility:** structured list/headings; qualitative meaning precedes
  numbers.
- **Anti-pattern:** hidden fine print.

### StrongestExplanation

- **Class:** Semantic.
- **Use:** only when naming the explanation adds meaning beyond synthesis.
- **Required:** statement, why strongest, qualification.
- **Open:** whether it appears separately by default remains scene-owned.

### PrimaryUnknown

- **Class:** Semantic.
- **Required:** unknown, why it matters, optional one
  `LearningRecommendation`.
- **Treatment:** calm semantic callout, not empty/error.
- **Copy:** specific, testable where possible.

### MeaningfulContradiction

- **Class:** Semantic.
- **Required:** contradiction, why it matters, confidence/interpretation effect,
  optional examine action.
- **Treatment:** equal dignity with support; never error/warning language.
- **Accessibility:** contradiction explicitly named; effect stated in text.

### UnderstandingRelationship

- **Class:** Semantic.
- **Required:** target name, state/strength label, explanation.
- **Optional:** approved navigation/start action.
- **States:** emerging, meaningful, strong.
- **Prohibited:** line weight or color as sole strength; causality inference.

### MeaningfulChangeSummary

- **Class:** Semantic.
- **Required:** before, now, reason, unresolved.
- **Optional:** consequence/action.
- **Rule:** no activity or source-count substitution.

### UnderstandingHistory

- **Class:** Composed pattern.
- **Purpose:** Show narrative revision over time.
- **Contains:** ordered `MeaningfulChangeSummary` items and version labels.
- **Rule:** narrative first; visualization only when it materially aids
  comparison.

### SupportingOverview

- **Class:** Composed pattern.
- **Contains:** small number of supporting evidence/relationship/unknown
  summaries.
- **Counts:** optional and secondary; never product value.
- **Default maximum:** three items per semantic group before disclosure.

### FollowState

- **Class:** Semantic.
- **States:** unfollowed, updating, following, failed.
- **Meaning:** stewardship status, not subscription.
- **Behavior:** following confirmation is calm; failure preserves prior state.
- **Open:** whether the Hero owns this state remains unresolved.

## 9. Learning Components

### UnderstandingObjective

- **Class:** Semantic.
- **Purpose:** Bounded, reviewable interpretation of the user's question.
- **Required:** objective, original question reference, scope/qualification.
- **Rule:** neutral about cause; editable only where approved.

### LearningPlanSummary

- **Class:** Composed pattern.
- **Contains:** current confidence, expected qualitative movement, addressed
  unknowns, remaining limitations.
- **Rule:** estimates are labeled; no promised improvement.

### SourceRecommendation

- **Class:** Semantic.
- **Required:** name, reason, uncertainty addressed, `InformationGain`,
  `SourceScopeSummary`, limitation, state.
- **Behavior:** disclosure for detail; selection delegated to
  `SourceStateControl`.
- **Treatment:** continuous list or restrained section according to approved
  mockup; never connector-marketplace branding.

### InformationGain

- **Class:** Semantic.
- **Levels:** low, moderate, high, plus explanation.
- **Meaning:** expected contribution to the objective, not source quality or
  certainty.
- **Prohibited:** calculated in component or shown as unqualified score.

### SourceScopeSummary

- **Class:** Semantic.
- **Required:** human-readable source boundary and relevant time/entity limits.
- **Rule:** no permission inference; view model already reflects permitted
  representation.

### SourceStateControl

- **Class:** Semantic.
- **States:** included, limited, excluded, pending approval.
- **Behavior:** explicit label/description; changes emit intent and update plan
  through parent adapter.
- **Accessibility:** radio/segmented/menu semantics must match approved control.

### LearningEvent

- **Class:** Semantic.
- **Required:** meaning-led headline/finding, source category, effect on
  Understanding, confidence/uncertainty effect, limitation.
- **Optional:** expandable evidence detail.
- **States:** future, active, completed, unavailable.
- **Rule:** leads with learning, not processing.

### LearningEventEffect

- **Class:** Semantic.
- **Types:** strengthened, weakened, confidence-increased,
  confidence-decreased, confidence-unchanged, unknown-narrowed,
  unknown-created, contradiction-created, relationship-created,
  relationship-strengthened.
- **Required:** type label plus explanation.
- **Prohibited:** type inferred from number movement in presentation.

### CurrentUnderstandingSnapshot

- **Class:** Composed pattern.
- **Contains:** current synthesis, confidence summary, leading explanation,
  primary unknown, meaningful changes.
- **Use:** persistent context during Learn.
- **Rule:** snapshot version is explicit and read-only.

### UnderstandingEvolution

- **Class:** Signature composed interaction.
- **Required:** prior text, current text, semantic change indicators, confidence
  explanation, new contradiction/relationship/unknown when present.
- **Behavior:** preserves anchor and reveals changed fragments or sections;
  never token-streams.
- **Reduced motion:** immediate before/after with explicit change list.
- **History:** prior version remains available.

### BeforeAndAfterUnderstanding

- **Class:** Composed pattern.
- **Required:** before, now, reason, unresolved.
- **Responsive:** sequential labels on mobile; side-by-side allowed on wide
  desktop.

### LearningRecommendation

- **Class:** Semantic.
- **Required:** what to learn, why now, expected gain, expected effect.
- **Action:** one specific action or “Not now.”

### LearningReadyState

- **Class:** Composed pattern.
- **Meaning:** first/current synthesis stabilized enough for review—not
  complete.
- **Contains:** summary, remaining uncertainty, primary view action.

## 10. Evidence and Reasoning Components

### ReasoningSummary

- **Class:** Semantic.
- **Required:** concise explanation of why current synthesis is strongest and
  its qualification.
- **Rule:** uses human language, not cognitive object names.

### ReasoningChain

- **Class:** Composed pattern.
- **Stages:** Observed pattern → Interpretation → Current explanation →
  Qualification.
- **Accessibility:** ordered semantic text remains complete without arrows or
  visual connectors.
- **Responsive:** vertical at all sizes by default.

### EvidenceGroup

- **Class:** Semantic.
- **Required:** finding, source category, why it matters, interpretation,
  limitation, `EvidenceStrength`.
- **Optional:** `EvidenceObservation` disclosure and `SourceContextAccess`.
- **Default count:** three groups before progressive disclosure.

### EvidenceObservation

- **Class:** Semantic.
- **Required:** prepared summary, context, relevance, limitation, permitted
  lineage.
- **Rule:** never receives restricted raw content merely to hide it.

### EvidenceStrength

- **Class:** Semantic.
- **Required:** qualitative label and explanation.
- **Prohibited:** color-only strength or component calculation.

### EvidenceLimitation

- **Class:** Semantic.
- **Required:** plain-language limitation and consequence.
- **Placement:** adjacent to the evidence it qualifies; never inaccessible fine
  print.

### AlternativeExplanation

- **Class:** Semantic.
- **Required:** name, plausibility, supporting evidence, weakening evidence,
  clarification opportunity.
- **Treatment:** readable and dignified; not visually dismissed.

### FalsificationConditions

- **Class:** Semantic.
- **Required:** what would weaken and what would strengthen the explanation.
- **Presentation:** concise list; one investigation action where approved.

### SourceContextAccess

- **Class:** Semantic.
- **States:** available, summarized-only, restricted, unavailable.
- **Rule:** state copy cannot reveal protected source existence beyond approved
  disclosure.

### ReasoningHistory

- **Class:** Composed pattern.
- **Contains:** ordered explanation revisions with cause and policy-safe
  provenance.
- **Rule:** does not mutate or erase historical explanation.

## 11. Stewardship and Response Components

### ResponsePathSelector

- **Class:** Composed pattern.
- **Canonical paths:** This matches what I see; Something important is missing;
  I interpret the evidence differently; Investigate further before I respond.
- **Contains:** four `ResponsePathOption` items.
- **Behavior:** selection expands one path inline; no social-feedback UI.

### ResponsePathOption

- **Class:** Semantic.
- **Required:** canonical title and one-sentence meaning.
- **States:** idle, hover, focus, selected, disabled.
- **Rule:** color does not imply agreement good/disagreement bad.

### ContributionComposer

- **Class:** Composed pattern.
- **Required:** selected path, path-specific prompt, `ContributionTarget`,
  optional perspective, textarea, effect-review action.
- **Behavior:** preserves input, validates meaningfully, no auto-adoption.

### ContributionTarget

- **Class:** Semantic.
- **Targets:** synthesis, evidence, contradiction, alternative, unknown, scope,
  terminology.
- **Rule:** target references stable view-model identity.

### ContributorPerspective

- **Class:** Semantic.
- **Purpose:** Describe proximity/context relevant to interpretation.
- **Prohibited:** authority score or seniority weighting.

### ContributionEffectPreview

- **Class:** Composed pattern.
- **Required:** what Discovery heard, expected effect, what remains unchanged,
  next learning opportunity.
- **Rule:** clearly provisional until submission/evaluation.

### SensitiveContributionNotice

- **Class:** Semantic.
- **Required:** intended handling, current prototype/production limitation, safe
  alternative.
- **Rule:** does not claim live Governance enforcement when mocked.

### ResponseResult

- **Class:** Composed pattern.
- **Required:** interpreted contribution, bounded effect, unchanged elements,
  next step.
- **Rule:** no silent confidence/model mutation.

### ChallengeEntry

- **Class:** Semantic action pattern.
- **Use:** Understand and Examine.
- **Copy:** “Respond to this Understanding” or approved scene wording.

### ConfirmationState

- **Class:** Semantic.
- **Meaning:** user perspective converges with the current synthesis.
- **Rule:** confirmation is not proof and cannot imply a large confidence gain
  without evidence.

## 12. Return and Home Components

### MeaningfulLearningSummary

- **Class:** Semantic.
- **Required:** concise number/description of meaningful changes.
- **Count behavior:** use a number only when every counted item is a warranted
  meaningful change; no notification badge.

### MostImportantChange

- **Class:** Composed pattern and editorial hero.
- **Required:** Understanding, before, now, reason, implication, unresolved
  qualification, one action.
- **Rule:** dominant story, not metric card.

### MeaningfulChangeItem

- **Class:** Semantic.
- **Use:** secondary change.
- **Required:** type, concise change, why it matters, optional action.
- **Default maximum:** two below the dominant change.

### RecommendedNextLearning

- **Class:** Semantic.
- **Required:** question/investigation, why now, expected gain/effect.
- **Default:** one primary recommendation.

### FollowedUnderstandingRow

- **Class:** Semantic.
- **Required:** name, status, concise current meaning/change, attention state.
- **Optional:** confidence label and last meaningful change if semantically
  justified.
- **Rule:** no mini-dashboard or sparkline.

### ContributionFollowUp

- **Class:** Semantic.
- **Required:** what the user contributed, how it affected learning, what
  remains unresolved.

### StableUnderstandingsSummary

- **Class:** Composed pattern.
- **Use:** quiet disclosure when stability matters.
- **Rule:** does not manufacture novelty or health claims.

### AskDiscoveryEntry

- **Class:** Composed pattern.
- **Purpose:** Quiet entry into a new consequential question.
- **Rule:** not a persistent chatbot transcript or floating assistant.

### MorningGreeting

Currently scene-level optional copy. It should become a component only if
repeated behavior, localization, time logic, and accessibility justify
abstraction.

## 13. Scene Compositions

| Scene | Governing question | Root and required semantic components | Primary action | Density/disclosure | Prohibited additions |
| --- | --- | --- | --- | --- | --- |
| Ask | What would you like Discovery to understand? | `AskComposition`: Input/TextArea, quiet examples | Begin understanding | extremely sparse | dashboard, navigation, upload, transcript |
| Orient | Did Discovery understand my intent? | `OrientComposition`: UnderstandingObjective, current orientation, PrimaryUnknown, ConfidenceSummary | Continue with this Understanding | sparse; scope detail secondary | configuration stepper, answer |
| Plan | How should Discovery improve it? | `PlanComposition`: LearningPlanSummary, SourceRecommendation list | approved begin-learning label | structured; recommendation detail disclosed | connector marketplace |
| Learn | How is it changing? | `LearnComposition`: CurrentUnderstandingSnapshot, LearningEvent, UnderstandingEvolution | pause/examine/continue contextually | sequential; event detail disclosed | AI processing theater |
| Understand | What does Discovery understand? | `UnderstandingHero`, PrimaryUnknown, MeaningfulContradiction, MeaningfulChangeSummary | Examine why | narrative; evidence later | metric grid |
| Respond | How does this compare with what I see? | `RespondComposition`: ResponsePathSelector, ContributionComposer, EffectPreview | submit path-specific contribution | focused; form expands inline | survey/modal feedback |
| Follow | Should Discovery keep learning? | FollowState, future-learning explanation, RecommendedNextLearning | Follow / approved Finish step | calm; little detail | notification settings wall |
| Return | What changed while I was away? | MostImportantChange, up to two MeaningfulChangeItem, RecommendedNextLearning | view dominant change | prioritized editorial | notification center |
| Home | What deserves attention now? | `HomeLearningBrief`: learning summary, dominant change, followed rows, Ask entry | current highest-value action | curated; lists disclosed | dashboard tiles, project work added without approval |

Detailed scene behavior remains in the nine scene specifications.

## 14. Shared Component States

Universal interaction states:

- idle;
- hover;
- focus;
- active/pressed;
- selected;
- loading;
- disabled;
- empty;
- error.

Semantic states:

- restricted;
- provisional;
- stable;
- changed;
- more uncertain;
- followed.

Rules:

- universal states are implemented consistently by foundations;
- semantic states require explicit view-model meaning and copy;
- `loading` does not imply learning;
- `disabled` is not a substitute for restricted;
- `empty` is not an unknown;
- `error` does not erase the last valid Understanding;
- `changed` names what changed;
- `more uncertain` is not styled as failure;
- `followed` is stewardship, not subscription.

## 15. Responsive Behavior Matrix

| Component | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| UnderstandingHero | open reading column; confidence/action may align beside supporting area | supporting regions stack | single column; synthesis never truncates; action follows uncertainty |
| ConfidenceSummary | inline with hero metadata or adjacent | moves beneath synthesis | qualitative label and short rationale; detail inline |
| PrimaryUnknown | distinct quiet callout; one action | full-width below hero | full-width, no collapsed statement |
| MeaningfulContradiction | readable section, optional examine action | full-width | text-first; action ≥44px; never hidden |
| SourceRecommendation | continuous row/section, detail inline | stacked anatomy | title/reason first; scope/limitation disclosure; state control full-width |
| LearningEvent | timeline item plus optional summary rail | one primary column | manual progression preferred when timing is used; pause/skip reachable |
| UnderstandingEvolution | before/after or anchored transition | stacked comparison | labeled sequential before/now; reduced-motion equivalent identical |
| EvidenceGroup | grouped section; observation disclosure | stacked | finding and limitation visible; evidence detail inline |
| ResponsePathSelector | four restrained rows | stacked rows | single column; 44px targets; selected path expands beneath |
| FollowedUnderstandingRow | compact row with restrained metadata | wraps metadata | stacked name/status/change; no horizontal scroll |
| MostImportantChange | broad editorial story; optional secondary region | one column | summary, before/now, qualification, action in that order |

General:

- body line length 55–75 characters;
- side rails stack after primary meaning;
- primary sticky actions are allowed only by UI System rules;
- no semantic content is removed for mobile;
- secondary lists collapse after the documented default count;
- touch targets are at least 44×44px.

## 16. Accessibility Contract

Library-wide:

- semantic HTML before ARIA;
- logical headings and DOM order;
- full keyboard operation;
- visible `:focus-visible`;
- 44×44px touch targets;
- programmatic names/descriptions;
- restrained live regions only for material user-relevant changes;
- no color-only or motion-only state;
- disclosure uses `aria-expanded` plus controlled region;
- errors associate with fields and preserve values;
- scene transitions focus the new main heading;
- auto-advance pauses on focus, interaction, disclosure, or user request;
- reduced motion preserves meaning and function;
- confidence uses qualitative accessible language and rationale;
- contradiction is explicitly announced as contradiction, not warning;
- restricted states do not leak protected detail.

Specific responsibilities:

| Component | Accessibility responsibility |
| --- | --- |
| UnderstandingHero | one primary heading; synthesis read before actions |
| ConfidenceSummary | accessible label includes rationale, not number alone |
| PrimaryUnknown | unknown and why it matters are adjacent in reading order |
| MeaningfulContradiction | named heading plus effect; no alert role by default |
| Relationship | target and relationship meaning expressed in text |
| LearningEvent | active/completed state announced only when meaningful |
| UnderstandingEvolution | before/now text available; updates not repeatedly announced |
| EvidenceGroup | headings, list semantics, disclosure labeling |
| ResponsePathSelector | native single-choice semantics where exclusive |
| ContributionComposer | prompt, target, errors, preserved value |
| FollowState | state change announced once, without celebration |
| MostImportantChange | page hierarchy reaches it before secondary changes |

## 17. Motion Contract

Component motion responsibilities:

- interaction states: brief visual acknowledgement;
- Disclosure: controlled expansion;
- UnderstandingEvolution: preserve anchor and reveal semantic change;
- ConfidenceSummary: update label/value together with explanation;
- MeaningfulContradiction: calm appearance, no shake or alert pulse;
- Relationship: line/connection may emerge only with textual explanation;
- FollowState: quiet state confirmation;
- MostImportantChange: restrained page reveal without stagger.

All motion:

- is deterministic;
- follows the Motion System's authoritative duration and easing guidance;
- avoids simulated typing/token streaming;
- pauses where user review is required;
- has reduced-motion parity.

Detailed motion values belong to
`docs/Product/DISCOVERY_MOTION_SYSTEM.md`.

## 18. Copy Contract

- Learning Event headlines lead with meaning, not source processing.
- Unknowns state what is unknown, why it matters, and possible next learning.
- Contradictions explain the tension and its consequence.
- Confidence is qualitative-first and includes rationale.
- Actions use specific verbs tied to understanding.
- Empty states describe the current knowledge boundary and useful next path.
- Error states name the affected operation and preserve progress.
- Contributions use stewardship language, not rating language.
- Follow describes continued learning, not notifications.
- Restricted states provide only policy-safe reason and next path.

`docs/Product/DISCOVERY_COPY_GUIDE.md` governs detailed copy, voice,
terminology, labels, confidence wording, uncertainty language, action wording,
errors, empty states, restricted-state language, and success and confirmation
language. Components may specify where required semantic content appears and
its hierarchy, truncation, visibility, accessibility, and presentation
constraints, but must not define competing wording standards.

## 19. View-Model Boundaries

Components:

- receive explicit view models;
- never read Runtime directly;
- never infer cognitive relationships or causality;
- never calculate confidence;
- never decide access;
- never sort semantic priority unless the view contract explicitly assigns
  presentation sorting;
- emit interaction intents rather than domain mutations.

Adapters translate Runtime projections or deterministic mock data into the
canonical product-facing contracts governed by
`docs/Product/DISCOVERY_VIEW_MODEL_ARCHITECTURE.md`. Component entries in this
document specify only which semantics they require and present; they do not
redefine or version view-model shapes. Any implementation-facing prop excerpt
must remain illustrative, use a component-specific name, and defer to the View
Model Architecture.

No component may accept a whole `OrganizationRuntime` as a convenience prop.

## 20. Component Composition Rules

- `UnderstandingHero` may contain `CurrentSynthesis`,
  `ConfidenceSummary`, and one primary action; never raw evidence.
- `PrimaryUnknown` may contain one `LearningRecommendation`.
- `MeaningfulContradiction` may link to an `EvidenceGroup`; it does not contain
  the full evidence group.
- `LearningEvent` may contain one `LearningEventEffect` and one Disclosure.
- `SourceRecommendation` contains `InformationGain`, `SourceScopeSummary`, and
  `SourceStateControl`; it does not own plan-wide calculations.
- `EvidenceGroup` may repeat three times by default; additional groups enter
  progressive disclosure.
- `ResponsePathSelector` contains exactly the canonical response paths unless a
  scene specification is updated.
- `MostImportantChange` contains one action and one qualification.
- Home shows one dominant change and no more than two secondary changes by
  default.
- Only one primary action appears per scene composition.
- Semantic callouts remain uncontained when another card would create nested
  framing.
- Components that repeat do so by semantic priority supplied in the view model.
- Lists become progressive disclosure when they exceed the default count or
  push the governing answer out of the first coherent reading sequence.
- Application and scene compositions consume components. Routing and
  orchestration remain owned by the Frontend Architecture and application
  integration. Adapters and hooks may connect prepared view models to
  components, but neither components nor scene compositions establish canonical
  routing or orchestration authority; component contracts remain independent of
  route implementation.

## 21. Component Naming Rules

Prefer names that state Discovery meaning:

- `PrimaryUnknown`;
- `MeaningfulContradiction`;
- `LearningEvent`;
- `ConfidenceExplanation`;
- `FollowedUnderstandingRow`.

Avoid:

- `MetricCard`;
- `InsightWidget`;
- `DataPanel`;
- `AIResponseBox`;
- `DashboardTile`;
- `AlertCard`.

Illustrative and non-authoritative possible organization:

```text
components/discovery/<family>/<ComponentName>.tsx
components/discovery/<family>/<ComponentName>.module.css
components/discovery/<family>/<ComponentName>.test.tsx
components/discovery/<family>/<ComponentName>.stories.tsx
components/discovery/compositions/<SceneName>Composition.tsx
components/discovery/<family>/<ComponentName>.props.ts
```

State suffixes describe semantic presentation, not implementation:
`Provisional`, `Restricted`, `Stable`, `Changed`, `Error`.

These examples demonstrate one possible organization; implementation may use
different names or locations. Frontend Architecture owns canonical module and
directory placement, and these examples do not override the existing frontend
structure. The optional `.props.ts` example applies only to component-local,
illustrative presentation props. Canonical product-facing view-model placement
and contracts remain owned by the View Model Architecture. No code migration is
authorized by this naming guidance.

## 22. Testing Expectations

### Primitives

- render and semantic-role tests;
- keyboard/focus tests;
- state transitions;
- touch-target and accessible-name checks;
- reduced-motion behavior;
- responsive layout checks.

### Semantic components

- required-content and omission tests;
- every semantic state;
- accessible meaning independent of color/motion;
- copy-contract tests;
- deterministic render for identical view models;
- restricted-state leakage tests;
- responsive order and truncation tests.

### Scene compositions

- governing-question hierarchy;
- default counts and disclosure;
- single-primary-action rule;
- mocked and projected adapter parity;
- error/empty/provisional/no-change paths;
- end-to-end interaction and focus continuity.

Pixel snapshots are useful for reviewed visual regression but cannot be the sole
validation. Prefer semantic assertions plus approved screenshot comparison.

Signature end-to-end coverage:

- Ask submission and focus transition;
- source-plan modification;
- Learn pause/resume/skip;
- Understanding examination;
- contribution effect preview and submission;
- Follow;
- Return-state meaningful changes and no-change state.

## 23. Storybook or Component Harness Recommendation

**Recommendation, not implementation:** adopt an isolated component harness
after the first semantic component extraction begins.

Benefits:

- deterministic coverage of semantic states;
- accessibility review;
- responsive and reduced-motion inspection;
- approved visual-regression baselines;
- easier comparison of mock and production view models;
- review without navigating full scene flows.

Costs:

- dependency, configuration, maintenance, and build time;
- risk of disconnected “component gallery” work;
- duplicated fixtures if adapters are poorly organized;
- temptation to optimize isolated components over scene composition.

Repository evidence:

- no Storybook dependency or script exists in `package.json`;
- no equivalent isolated component harness is currently evident;
- product validation scripts exercise composed experiences, not a visual
  component catalog;
- Next.js, React, TypeScript, and `lucide-react` are present.

Recommended decision sequence:

1. define two or three semantic components and deterministic view-model fixtures;
2. compare Storybook with a minimal repository-native Next.js development
   harness;
3. select based on accessibility tooling, motion/reduced-motion review, visual
   regression integration, and maintenance cost;
4. keep any harness development-only and outside production navigation.

Do not add a dependency until that evaluation is explicitly authorized.

## 24. Migration and Compatibility

Observed current implementation:

### Reuse candidates

- native `<details>` patterns in `CurrentUnderstanding`,
  `OrganizationModel`, and Ask uncertainty sections demonstrate progressive
  disclosure;
- `CurrentUnderstanding` already projects a synthesis, qualitative confidence,
  rationale, missing evidence, falsification condition, and stewardship actions;
- `ResearchRecommendation` and `DecisionRecommendation` demonstrate compact
  semantic recommendation patterns;
- `LivingModelContext` and `OrganizationModel` provide evidence for reusable
  orientation patterns;
- CSS modules and `lucide-react` align with scoped styling and coherent
  iconography.

### Adapt candidates

- `DisclosureRow` and `ExecutiveAccordion` can inform a canonical `Disclosure`,
  but currently duplicate semantics and styling;
- `CurrentUnderstanding` is a scene-heavy composition that should eventually
  consume semantic components and an explicit view model rather than become the
  reusable component itself;
- existing `UnderstandingTimeline` can inform Learning Event and Evolution
  behavior but currently emphasizes loaded document counts and analysis state;
- multiple recommendation components may converge on shared foundation plus
  domain-specific semantic wrappers where repetition is real;
- current `--ds-*` spacing, surface, radius, and color tokens require semantic
  mapping described by the UI System.

### Replace or retire candidates

- `ConfidenceBadge` calculates qualitative labels and colors inside the
  component, defaults to a percentage, and does not require rationale; it
  conflicts with `ConfidenceSummary`;
- `UnderstandingCard` uses “Helpful? Yes/No” social-feedback behavior and claims
  Discovery will learn from the signal; it conflicts with stewardship;
- generic executive dashboard/card patterns should not become the Alpha
  component foundation;
- purely decorative Living Understanding visuals should be retained only when
  they communicate real approved state.

### Defer

- full component-directory migration;
- final component APIs;
- a shared component package;
- Storybook/harness selection;
- token replacement;
- deletion of obsolete components;
- final Living Organization Model visualization.

Migration risks:

- broad replacements could disturb current product-shell validation;
- duplicate component families span `components/ui`, `understanding`,
  `executive-v*`, `results`, and `product-shell`;
- some components combine data fetching/interaction orchestration with
  presentation;
- current styling mixes global CSS, CSS modules, and inline styled JSX;
- current token names encode generic success/warning/danger semantics that do
  not match Discovery meaning;
- the deterministic fixture-backed Alpha is implemented, while broader
  production component migration and Runtime integration remain deferred.

Future categories:

1. **Reuse** accessible mechanics already aligned.
2. **Adapt** current compositions around explicit view models.
3. **Replace** conflicting semantic abstractions only after regressions exist.
4. **Defer** anything without repeated need or approved product behavior.

## 25. Anti-Patterns

The library prohibits:

1. `MetricCard` as the default abstraction.
2. `InsightWidget`.
3. Generic dashboard tiles.
4. Nested cards.
5. Equal-weight semantic cards.
6. Unexplained confidence gauges.
7. Contradiction styled as error.
8. Unknown presented as an empty state.
9. Activity presented as learning.
10. Source count presented as value.
11. Component-calculated confidence.
12. Component-inferred causality.
13. Component-owned Governance.
14. Raw Runtime access.
15. Restricted raw props hidden in presentation.
16. Generic AI response boxes.
17. Chatbot transcripts in the core flow.
18. Thumbs-up/down feedback.
19. Executive override controls.
20. Notification-center patterns.
21. Follow represented as subscription.
22. Excessive badges.
23. Generic “Learn more” actions.
24. Icon-only semantic states.
25. Source-logo dominance.
26. Mobile desktop shrinkage.
27. Hidden limitations.
28. Decorative charts.
29. Mini sparklines without meaning.
30. Multiple primary actions.
31. Modal-heavy disclosure.
32. Prop surfaces that encode whole-scene logic.
33. One-use abstractions.
34. Components that silently sort contradiction/evidence.
35. Components that mutate historical Understanding state.
36. Semantic color selected from numeric threshold in UI.
37. `isExecutive` or role-specific reasoning variants.
38. Provider-specific rendering contracts.
39. Mock-only semantic branches.
40. Loading animations presented as cognition.
41. Automatic model adoption after contribution.
42. Dense source tables in Plan.
43. Evidence inside `UnderstandingHero`.
44. Unbounded `children` slots in semantic components.
45. Arbitrary string variants that bypass canonical vocabulary.

## 26. Review Checklist

### Component author

- What Discovery meaning does this communicate?
- Is it primitive, semantic, composed, or scene-level?
- Does it already exist under another name?
- Is abstraction earned?
- Does it preserve uncertainty and contradiction?
- What is visible versus progressively disclosed?
- Are all accessibility states contractual?
- Does it work without motion?
- Does it receive an explicit view model?
- Does it contain product, cognition, governance, or routing logic it should not
  own?
- Are mock and production projections compatible?

### Scene author

- Is the Understanding still the hero?
- Does every component support the one governing question?
- Are component counts restrained?
- Is there one primary action?
- Are cards replacing whitespace?
- Are secondary components overpowering meaning?
- Is the mobile hierarchy intentional?
- Are prohibited additions absent?

### Reviewer or Codex

- Is an unresolved decision being invented?
- Is this drifting toward generic SaaS?
- Is a generic primitive replacing an existing semantic component?
- Is architecture exposed in normal UI?
- Is contradiction hidden or diminished?
- Is confidence unexplained or recalculated?
- Does any prop contain Runtime or restricted raw data?
- Can 15–20% of chrome be removed?
- Was unrelated dirty work preserved?

## 27. Open Decisions

1. Final isolated component-harness choice.
2. Whether numeric confidence is enabled by default.
3. Whether `UnderstandingHero` owns `FollowState` or they remain siblings.
4. Whether Evidence Group source context opens inline or in a separate view.
5. Exact default counts before progressive disclosure beyond the documented
   starting recommendations.
6. Final name of `FollowedUnderstandingRow`.
7. Whether Morning Greeting is a component or scene copy.
8. Whether Meaningful Change is one polymorphic component or a small semantic
   family.
9. Whether Source Recommendation selection uses segmented controls, explicit
   row actions, or another approved pattern.
10. Whether Learning Event history remains expanded after stabilization.
11. Which responsibility boundaries need Frontend Architecture placement
    guidance across foundations, semantic components, and scene compositions.
12. Where component-specific illustrative prop types live without duplicating
    canonical view-model contracts.

These require design/engineering review or validated use. This document does not
resolve them.

## 28. Definition of Done

The component architecture is complete when:

- Discovery has one reusable semantic UI vocabulary;
- every canonical concept has one clear component responsibility;
- primitive, semantic, composed-pattern, and scene boundaries are explicit;
- components preserve approved mockup intent;
- explicit view models prevent Runtime, cognition, Governance, and provider
  logic from entering presentation;
- accessibility, motion, responsive behavior, and copy are part of contracts;
- deterministic mock and future projected data can share components;
- generic SaaS drift is actively prevented;
- current compatibility is assessed from repository evidence;
- the library can explain and evolve from the current deterministic
  fixture-backed Alpha implementation while supporting later production
  projection paths;
- no implementation or production behavior is changed.

This document creates no component, type, dependency, token, style, route,
test, harness, or application behavior.
