# Discovery View Model Architecture

## 1. Status and Authority

**Status:** Canonical product-facing data-boundary guidance.

This document defines the boundary between Discovery’s Runtime and cognitive
systems and its user interface. It does not change the cognitive architecture,
Runtime, Executive Projection, Governance, or production contracts.

The Cognitive Architecture owns organizational reasoning. Runtime owns
canonical evolving organizational state. Existing Executive Projection
remains a canonical executive-facing projection. This document defines the
additional product-facing shape required by the approved Living Understanding
experience. The Component Library consumes these semantics; the Frontend
Architecture governs how they reach scenes. Mocked prototype data may
instantiate the same illustrative contracts without using Runtime.

View models are product projections. They are not cognitive truth objects,
Runtime replacements, governance decisions, or durable memory.

All TypeScript below is illustrative documentation, not a production
contract. Labels:

- **Locked requirement** — required by existing canon.
- **Recommended default** — preferred implementation.
- **Illustrative example** — requires implementation review.
- **Unresolved decision** — evidence is insufficient to canonize a contract.

## 2. Purpose

The boundary exists to provide:

- UI stability while engine and Runtime representations evolve;
- lower reading burden through traceable semantic prioritization;
- explicit access and restriction states;
- consistent product copy;
- deterministic testing;
- a production-quality mocked prototype without live cognition;
- protection against Runtime and cognitive terminology leaking into UI;
- immutable historical presentation;
- scene-specific data without component inference;
- future production integration without component rewrites.

## 3. Core Principles

1. Runtime is not a UI contract.
2. Components receive explicit view models.
3. View models serve a scene or semantic purpose.
4. Adapters project; they do not create unsupported cognition.
5. Product prioritization remains traceable to an explicit source and rule.
6. Confidence remains qualified.
7. Contradictions and unknowns cannot be silently removed.
8. Access restrictions are represented explicitly.
9. Historical states are immutable.
10. Mock and production paths share contracts where practical.
11. View models reduce reading burden without distorting meaning.
12. Sorting and truncation rules are explicit and deterministic.
13. Empty, loading, restricted, stale, and error states are modeled.
14. Low-level components do not assemble dynamic product narratives ad hoc.
15. Server-to-client view models are serializable.

## 4. Architectural Position

```text
Cognitive producers
        ↓
Organization Runtime
        ↓
Canonical product projection
        ↓
Scene adapter
        ↓
Scene view model
        ↓
Semantic component view models
        ↓
Scene composition and components
```

This extends the product boundary around, but does not rewrite, the existing
production flow:

```text
runDiscoveryV3
  → evolveOrganizationRuntime
  → saveOrganizationRuntimeState
  → buildExecutiveProjection
```

An Alpha adapter may project from an approved fixture rather than Runtime. A
future production adapter may project from Runtime or an existing executive
projection. Both terminate in the same product-facing semantics.

## 5. Boundary Responsibilities

### Runtime

Stores canonical evolving organizational state, stable identity, memory,
reasoning outputs, and historical state according to existing architecture.

### Product projection

Selects and translates product-relevant cognitive state, applies authorized
visibility, preserves traceability, and exposes product-canonical meaning.

### Scene adapter

Builds the exact contract for one governing question and applies explicit
ordering, disclosure, copy, and state mapping rules.

### View model

Carries render-ready meaning, state, identity, actions, qualification, and
recovery information.

### Component

Presents and interacts with its view model. It does not reach behind the
contract.

### Action handler

Translates user intent into an application command, validates the result, and
causes a refreshed projection. Transport is a frontend architecture concern.

## 6. Prohibited Responsibilities

View models and adapters must not:

- invent mechanisms, beliefs, observations, or evidence;
- calculate cognitive confidence independently;
- infer causality;
- suppress contradictions for visual simplicity;
- mutate Runtime;
- decide governance authorization;
- fabricate evidence or learning;
- create unsupported recommendations;
- conflate missing data with zero;
- treat source counts as value;
- use component state as durable organizational state;
- infer restriction from absence;
- rewrite historical revisions;
- convert a contribution into truth;
- expose raw restricted information.

## 7. Canonical Scene View Models

Shared scene envelope:

```ts
type SceneStatus =
  | { kind: "ready" }
  | { kind: "loading"; message: string; lastStable: boolean }
  | { kind: "empty"; boundary: string; nextAction?: ProductAction }
  | { kind: "restricted"; access: AccessState }
  | { kind: "error"; error: ProductErrorViewModel }
  | { kind: "provisional"; explanation: string }
  | { kind: "stale"; asOf: string; explanation: string };

type SceneMeta = {
  scene: "ask" | "orient" | "plan" | "learn" | "understand"
    | "respond" | "follow" | "return" | "home";
  governingQuestion: string;
  organizationRef?: string;
  understandingRef?: string;
  projectionVersion: string;
  generatedAt: string;
  sourceRevision?: string;
};
```

### AskSceneViewModel

- **Question:** What would you like Discovery to understand?
- **Required:** scene metadata, prompt, primary Ask action.
- **Optional:** restrained question examples, preserved draft.
- **Children:** `UnderstandingIdentityViewModel` only on return to an existing
  inquiry.
- **States:** empty is the normal first-use state; loading preserves the
  submitted question; error preserves input.
- **History/freshness:** none required for first use.

### OrientSceneViewModel

- **Question:** Did Discovery understand my intent?
- **Required:** original question, objective, included scope, excluded scope,
  current orientation, primary unknown, qualified starting confidence.
- **Optional:** direct-edit affordance.
- **Children:** identity, hero/objective, unknown, confidence.
- **Actions:** refine question, refine scope, approve objective.
- **States:** provisional by definition; restriction must identify which scope
  cannot be represented.
- **History:** original question is immutable.

### PlanSceneViewModel

- **Question:** How should Discovery improve this Understanding?
- **Required:** objective, primary unknown, plan summary, source
  recommendations, expected information gain, current source state.
- **Optional:** user-supplied context and limitation detail.
- **Children:** plan, source, information-gain models.
- **Actions:** include, limit, exclude, begin learning.
- **States:** empty means no useful source is currently available and must
  include another learning path.
- **History:** preserve the approved plan version.

### LearnSceneViewModel

- **Question:** What is Discovery learning, and how is it changing the
  Understanding?
- **Required:** last stable snapshot, ordered Learning Events, active event,
  evolution, pause/resume/skip state, ready state.
- **Optional:** prior completed events.
- **Children:** event, evolution, confidence, contradiction, unknown.
- **Actions:** pause, resume, skip, examine, continue.
- **States:** loading never fabricates an event; error preserves the last stable
  revision.
- **History:** each event references immutable before/after revisions.

### UnderstandSceneViewModel

- **Question:** What does Discovery currently understand?
- **Required:** identity, hero, synthesis, confidence, primary unknown,
  material contradiction, meaningful change.
- **Optional:** supporting overview and relationships.
- **Actions:** examine, respond, follow where appropriate.
- **States:** empty means a current synthesis is not yet available, not “no
  data.”
- **History:** current revision and prior comparison.

### RespondSceneViewModel

- **Question:** How does this compare with what I see?
- **Required:** current Understanding, response paths, contribution target,
  effect-preview boundary.
- **Optional:** evidence detail and sensitive-handling notice.
- **Actions:** submit contribution, challenge, request investigation.
- **States:** contribution is provisional until accepted; errors preserve text.
- **History:** actual accepted effect references the prior and resulting
  revision.

The detailed Alpha specifications currently separate Examine from Challenge or
Confirm. A Respond scene model must retain both examination and contribution
semantics until that naming conflict is canonically resolved.

### FollowSceneViewModel

- **Question:** Should Discovery keep learning about this?
- **Required:** identity, current follow state, meaning of following, expected
  future learning.
- **Optional:** meaningful-change preference only if approved.
- **Actions:** follow, unfollow, continue learning.
- **States:** following, paused, restricted, unavailable.
- **History:** followed-at time and state change, where canonical.

### ReturnSceneViewModel

- **Question:** What changed while I was away?
- **Required:** most important change, why it changed, why it matters, remaining
  unknown.
- **Optional:** up to two secondary changes and next learning.
- **Actions:** examine change, continue learning.
- **States:** no meaningful change is explicit and quiet.
- **History:** comparison window and immutable revision references.

### HomeSceneViewModel

- **Question:** What deserves attention now?
- **Required:** Home learning brief, dominant meaningful change or stable
  summary, followed Understandings, Ask entry.
- **Optional:** contribution follow-up and next learning.
- **Actions:** open Understanding, see change, Ask.
- **States:** first-use Home points to Ask; restricted items reveal no protected
  meaning.
- **Freshness:** explicit `asOf` and comparison window.

## 8. Canonical Semantic View Models

These shapes illustrate semantic completeness. They are intentionally not
production types.

```ts
type IdRef = string;
type ChangeDirection = "strengthened" | "weakened" | "unchanged"
  | "more-uncertain" | "not-established";
type AccessState =
  | { kind: "available" }
  | { kind: "summarized"; explanation: string }
  | { kind: "restricted"; explanation: string; requestable: boolean }
  | { kind: "unavailable"; explanation: string }
  | { kind: "permission-required"; explanation: string; action?: ProductAction };
type ProductAction = { id: string; label: string; intent: ProductActionIntent };

type UnderstandingIdentityViewModel = {
  ref: IdRef; name: string; originalQuestion: string; revisionRef: IdRef;
  state: UnderstandingSemanticState;
};
type UnderstandingHeroViewModel = {
  identity: UnderstandingIdentityViewModel;
  synthesis: CurrentSynthesisViewModel;
  confidence: ConfidenceSummaryViewModel;
  primaryUnknown: PrimaryUnknownViewModel;
  primaryAction?: ProductAction;
};
type CurrentSynthesisViewModel = {
  statement: string; conciseInterpretation?: string; whyItMatters: string;
  status: "current" | "historical" | "provisional";
};
type ConfidenceSummaryViewModel = {
  subject: "synthesis" | "evidence" | "causality" | "relationship";
  qualitative: "not-established" | "low" | "moderate" | "high";
  numeric?: number; explanation: ConfidenceExplanationViewModel;
  direction?: ChangeDirection;
};
type ConfidenceExplanationViewModel = {
  rationale: string; limitation: string; priorRevisionRef?: IdRef;
};
type PrimaryUnknownViewModel = {
  ref: IdRef; statement: string; importance: string; currentBoundary: string;
  learningOpportunity?: string; expectedInformationGain?: string;
  status: "open" | "narrowed" | "expanded" | "partially-resolved";
};
type ContradictionViewModel = {
  ref: IdRef; statement: string; affectedSynthesis: string; whyItMatters: string;
  confidenceEffect: ChangeDirection; evidenceRefs: IdRef[];
  unresolved: boolean; examineAction?: ProductAction;
};
type RelationshipViewModel = {
  ref: IdRef; relatedUnderstanding: Pick<UnderstandingIdentityViewModel, "ref" | "name">;
  type: "associated" | "overlapping" | "reinforcing" | "opposing" | "unknown";
  strength: "emerging" | "meaningful" | "strong" | "uncertain";
  explanation: string; directionality: "directed" | "bidirectional" | "undetermined";
  causality: "not-established" | "plausible" | "supported";
  change: ChangeDirection;
};
type LearningPlanViewModel = {
  objective: string; targetUnknownRefs: IdRef[];
  sources: SourceRecommendationViewModel[]; expectedOutcome: string;
  state: "draft" | "approved" | "paused" | "completed";
};
type SourceRecommendationViewModel = {
  ref: IdRef; category: string; reason: string; scope: string;
  expectedInformationGain: string; limitation: string;
  selection: "included" | "limited" | "excluded";
  access: AccessState;
};
type LearningEventViewModel = {
  ref: IdRef; headline: string; learned: string; changed: string;
  unchanged: string; sourceCategory?: string;
  beforeRevisionRef: IdRef; afterRevisionRef: IdRef;
  state: "ready" | "active" | "completed" | "skipped" | "unavailable";
};
type UnderstandingEvolutionViewModel = {
  before: CurrentSynthesisViewModel; now: CurrentSynthesisViewModel;
  differences: MeaningfulChangeViewModel[];
  confidenceChange?: ConfidenceSummaryViewModel;
  newContradictions: ContradictionViewModel[];
  unknownChanges: PrimaryUnknownViewModel[];
};
type EvidenceGroupViewModel = {
  ref: IdRef; title: string; meaning: string; strength: string;
  limitation: string; evidenceRefs: IdRef[]; access: AccessState;
};
type AlternativeExplanationViewModel = {
  ref: IdRef; statement: string; supportingMeaning: string;
  limitingMeaning: string; currentStatus: "plausible" | "weakened" | "unresolved";
};
type FalsificationConditionsViewModel = {
  explanationRef: IdRef; conditions: Array<{ statement: string; why: string }>;
};
type ResponsePathViewModel = {
  id: "agree" | "add-context" | "alternative" | "investigate";
  label: string; explanation: string; selected: boolean;
};
type ContributionEffectViewModel = {
  contributionRef?: IdRef; interpretedContribution: string;
  expectedEffect?: string; acceptedEffect?: string; unchanged: string[];
  state: "preview" | "provisional" | "accepted" | "rejected";
  resultingRevisionRef?: IdRef;
};
type FollowStateViewModel = {
  understandingRef: IdRef; state: "not-following" | "following" | "paused";
  meaning: string; followedAt?: string; nextLearning?: string;
};
type MeaningfulChangeViewModel = {
  ref: IdRef; kind: "synthesis" | "confidence" | "unknown"
    | "contradiction" | "relationship";
  headline: string; before: string; now: string; cause: string;
  whyItMatters: string; occurredAt: string;
};
type FollowedUnderstandingViewModel = {
  identity: UnderstandingIdentityViewModel; follow: FollowStateViewModel;
  mostRecentChange?: MeaningfulChangeViewModel; lastReviewedAt?: string;
};
type HomeLearningBriefViewModel = {
  headline: string; summary: string; asOf: string;
  dominantChange?: MeaningfulChangeViewModel;
  followed: FollowedUnderstandingViewModel[];
  nextLearning?: string; askAction: ProductAction;
};
```

## 9. Identity and References

Stable references are required for organization, Understanding, evidence,
contradiction, relationship, Learning Event, contribution, historical
revision, and Follow state.

- Organization identity follows the canonical Runtime identity.
- Understanding and revision identity must remain stable across projections.
- Evidence references may reach the client only when safe and useful.
- Raw storage paths, provider identifiers, internal database keys, and
  sensitive source IDs remain server-side.
- Opaque references are preferred when client actions need identity but users
  do not need to read it.
- IDs never become display language.
- A revision has its own reference; it is not inferred from timestamps alone.

## 10. Semantic State Model

Product-facing states:

- `emerging` — the first bounded Understanding is forming;
- `developing` — meaningful learning is changing it;
- `stable` — no material change in the relevant window;
- `changed` — a material semantic difference exists;
- `more-uncertain` — the knowledge boundary expanded;
- `contradicted` — a material contradiction affects the synthesis;
- `restricted` — meaning cannot be disclosed at the requested level;
- `provisional` — not yet durable or sufficiently supported;
- `following` — ongoing stewardship is active;
- `paused` — approved learning or following is paused;
- `unavailable` — the object cannot currently be obtained;
- `stale` — a stable projection exists but may not reflect the current Runtime.

Internal engine enum names are translated only when a product-canonical state
exists. Missing data is not a state.

## 11. Confidence Projection

The projection carries:

- the source cognitive confidence and its subject;
- a product qualitative state;
- an optional numeric value;
- rationale;
- limitation;
- direction of change;
- historical comparison.

An adapter may normalize scale and map an existing value to an approved
qualitative label. It may not recompute confidence from evidence, counts, or
component needs. Mapping rules are explicit, versioned, deterministic, and
tested. Numeric display remains unresolved.

## 12. Contradiction Projection

Every projected contradiction includes:

- stable identity;
- statement;
- affected synthesis or explanation;
- why it matters;
- effect on confidence;
- safe evidence references;
- unresolved state;
- an examination action where available.

Selection rules may prioritize material contradictions but cannot silently
turn omitted contradictions into absence. A summary states when additional
contradictions exist.

## 13. Unknown Projection

Every unknown includes:

- what is unknown;
- why it matters;
- the current boundary;
- a learning opportunity;
- expected information gain when supported;
- open, narrowed, expanded, or partially resolved status.

Expected information gain is projected from an approved source; adapters do
not invent it.

## 14. Relationship Projection

Every relationship includes:

- the related Understanding;
- relationship type and strength;
- an explanation;
- directionality;
- explicit causal qualification;
- change state.

A graph is not implied. Components choose an approved representation from the
view model.

## 15. Learning Projection

Learning projection includes:

- approved plan and objective;
- selected source categories and scope;
- ordered Learning Events;
- Understanding evolution;
- pause/resume/skip state;
- readiness and its reason;
- next useful learning.

Source operations are secondary. A Learning Event exists only when meaningful
change is represented by the fixture or production projection.

## 16. Historical State and Revision Model

- Understanding revisions are immutable.
- Current and prior revisions use explicit references.
- A meaningful change links before, now, cause, and consequence.
- Return summaries use an explicit comparison window.
- Timestamps use deterministic ISO 8601 strings.
- History is not reconstructed from current component state.
- Corrections create a new revision or metadata according to canonical
  persistence; they do not overwrite displayed history.

The prototype uses scripted revision sequences. It must not imply production
historical persistence.

## 17. User Contribution Projection

Contribution projection includes:

- selected response path;
- target Understanding, synthesis, evidence, contradiction, or unknown;
- contributor perspective where safe and useful;
- sensitive-handling indicator;
- interpreted contribution;
- expected effect preview;
- actual accepted effect;
- unchanged elements;
- provisional or durable state.

The view model can represent governance outcomes supplied by an authorized
boundary. It cannot decide them or imply enforcement that is not implemented.

## 18. Access and Governance Projection

Access is explicit:

- `available`;
- `summarized`;
- `restricted`;
- `unavailable`;
- `permission-required`.

The UI never infers access from missing fields. A summarized state does not
leak source identity. A restricted state distinguishes “cannot disclose” from
“has not learned” only to the extent permitted by Governance. This document
does not create authorization policy.

## 19. Action Contracts

Illustrative intents:

| Intent | Meaning | Expected result |
| --- | --- | --- |
| `submitQuestion` | begin an inquiry | provisional objective projection |
| `refineQuestion` | change the expressed objective | new provisional orientation |
| `updateLearningPlan` | revise approved scope | updated deterministic plan |
| `includeSource` | allow a source category | updated plan projection |
| `limitSource` | narrow permitted scope | bounded source state |
| `excludeSource` | remove a source category | updated plan and expected effect |
| `pauseLearning` | pause presentation/acquisition where supported | paused state |
| `resumeLearning` | continue approved sequence | active state |
| `skipLearningStep` | bypass an optional step | explicit skipped state |
| `examineUnderstanding` | open reasoning detail | examination projection |
| `submitContribution` | contribute context or evidence | preserved input and effect result |
| `challengeUnderstanding` | contest a specific meaning | provisional contribution effect |
| `followUnderstanding` | begin ongoing stewardship | following state |
| `unfollowUnderstanding` | end active stewardship | not-following state |
| `continueLearning` | begin approved next learning | next scene/projection |

Transport-specific endpoints, HTTP methods, and persistence implementations do
not belong here.

## 20. Loading, Error, and Recovery Models

```ts
type ProductErrorViewModel = {
  title: string;
  explanation: string;
  stableStatePreserved: boolean;
  durableStateChanged: boolean;
  inputPreserved: boolean;
  retryable: boolean;
  recoveryAction?: ProductAction;
  supportRef?: string;
};
```

Loading identifies the affected operation and retains last stable data.
Errors are structured, not plain strings. Normal UI excludes stack traces,
provider payloads, storage paths, and sensitive context.

## 21. Mock Data Architecture

Interactive Prototype Alpha should use:

- deterministic fixtures;
- named scenarios;
- immutable baseline states;
- scripted semantic transitions;
- the same scene and semantic contracts intended for production adapters;
- no Runtime dependency;
- no engine calls;
- no fake live cognition.

Recommended organization:

```text
product/
  fixtures/
    alpha/
      atlas/
        baseline
        low-confidence
        contradiction-emerges
        contribution-provisional
        return-meaningful-change
  scenarios/
    ask-to-orient
    plan-source-limited
    learn-evolution
    respond-challenge
    follow-and-return
```

This is a target recommendation, not a request to create directories.

## 22. Projection Traceability

Development and audit metadata may include:

- source object references;
- projection version;
- adapter version;
- generation timestamp;
- originating Runtime revision;
- ordering rule identifier;
- fixture scenario identifier.

Trace data stays outside primary copy and is removed or sanitized before
client delivery when it could expose internals or restricted identity.

## 23. Serialization and Server Boundaries

- Use JSON-serializable values.
- Represent dates as ISO 8601 strings.
- Use discriminated unions for semantic states.
- Do not send class instances, Symbols, Maps, Sets, BigInts, or functions.
- Do not include callbacks in server-to-client models.
- Keep ephemeral component state client-side and separate.
- Preserve stable ordering in arrays.
- Produce deterministic output for the same source revision and adapter
  version.
- Avoid `undefined` where absence semantics matter; use explicit unions.

## 24. Versioning and Compatibility

- Prefer additive changes.
- A breaking change alters meaning, removes a required field, changes identity,
  changes action intent, or changes a discriminant.
- Optional fields require defined absence behavior.
- Version the projection/scene contract only when needed for traceability and
  migration.
- Fixtures declare the contract version they instantiate.
- Migrate adapters before scene components.
- Preserve old revision rendering for historical replay.
- Avoid premature public-API or package-level formalism.

## 25. Testing

Required test categories:

- adapter unit tests;
- fixture contract tests;
- deterministic projection and ordering tests;
- contradiction-preservation tests;
- unknown-preservation tests;
- confidence qualification tests;
- access-state and non-leakage tests;
- historical revision immutability tests;
- scene render-contract tests;
- structured loading/error/recovery tests;
- tests that UI/component directories do not import Runtime;
- prototype/production contract-parity tests where production adapters exist.

## 26. Current Repository Compatibility Assessment

Observed on 23 July 2026:

### Retain

- `components/product-shell/data/loadProductOrganization.ts` is marked
  `server-only`, resolves canonical organization identity, and loads Runtime
  outside components.
- `buildOrganizationExperienceView`,
  `buildAskExperienceView`, `buildDecisionsExperienceView`,
  `buildResearchExperienceView`, and related builders already act as
  server-side projection adapters.
- Product pages pass projected props to experience components.
- Explicit load states distinguish missing identity, invalid identity, and
  unavailable Runtime.
- Current script-based validations support deterministic contract assertions.

### Adapt

- Existing `*ExperienceView` types are colocated with builder implementation
  and are shaped for the executive workspace, not the Alpha scenes.
- Several builders inspect `runtime.memory` through loose `Record<string,
  unknown>` access and apply copy, compaction, deduplication, ordering, and
  qualitative confidence mapping in one module. These responsibilities need
  explicit product projection and scene-adapter boundaries during integration.
- Some view types use `ReturnType<typeof builder>` rather than named semantic
  contracts.
- `ProductWorkspace` loads Runtime, selects builders, invokes conversation
  interpretation, and orchestrates rendering. It is a useful server seam but
  currently carries several responsibilities.

### Replace

- No current executive-workspace view model should be relabeled as the Alpha
  contract without mapping and contract tests.
- Current UI terms such as Insights, Think, Decide, Experiment, Brief, Model
  Health, coherence scores, and primary-constraint metrics do not define the
  approved Alpha scene hierarchy.

### Defer

- Production adapters for all nine Alpha scenes.
- View-model versioning machinery.
- Runtime revision identifiers beyond existing canonical support.
- Durable Follow and contribution contracts.
- Governance-enforced disclosure behavior.
- Migration or deletion of current executive workspace code.

### Direct Runtime coupling

Runtime imports are present in server-side data builders and API routes, not in
the inspected product-shell presentation components. This is an aligned
boundary direction, though enforcement is by convention rather than a
dedicated import rule. Older standalone pages outside the product shell are
separate migration concerns.

## 27. Anti-Patterns

1. Passing Runtime objects to components.
2. Components calculating confidence.
3. Components inferring relationships.
4. Ad hoc scene data shapes.
5. Raw cognition terminology in UI.
6. Generic catch-all view models.
7. One global dashboard model.
8. View models containing JSX.
9. View models containing callbacks across server boundaries.
10. Silently omitted contradictions.
11. Silently omitted unknowns.
12. Missing-field access inference.
13. Mutable history.
14. Nondeterministic sorting.
15. Source counts treated as value.
16. Adapter-created causality.
17. Adapter-created recommendations.
18. Duplicated copy logic.
19. Transport-specific types as product contracts.
20. Loading represented only by `null`.
21. Errors represented only by strings.
22. Client state used as durable Runtime state.
23. Mock data shaped differently from production contracts.
24. Identifiers used as display language.
25. Numeric confidence without rationale.
26. Unavailable evidence shown as absent.
27. One model serving every scene.
28. Over-normalized data that increases UI complexity.
29. Scene components reading repositories directly.
30. Product projection mutating engine state.
31. Recalculating confidence from counts.
32. Treating empty arrays as proof that nothing exists.
33. Serializing the whole Runtime.
34. Embedding access policy in component visibility.
35. Deriving history from current timestamps.
36. Using unstable array position as identity.
37. Truncating away a qualification or contradiction.
38. Combining fixture transition logic with semantic components.
39. Exposing source IDs that create privacy side channels.
40. Using view-model fields to introduce a new cognitive object.

## 28. Review Checklist

### Adapter author

- Is every field traceable to a source or explicit mapping rule?
- Are ordering and truncation deterministic?
- Are contradiction, unknown, confidence, and access preserved?
- Does projection avoid mutation and cognition?

### View-model author

- Does the model serve one semantic or scene purpose?
- Are states discriminated and serializable?
- Are identity and history explicit?
- Are actions intents rather than transports?

### Component author

- Does the component depend only on its view model?
- Does it avoid copy, confidence, access, and priority inference?
- Are empty, loading, restricted, stale, and error states supported?

### Reviewer

- Could the same contract be instantiated by fixture and production adapter?
- Is material meaning lost for brevity?
- Is protected absence distinguishable safely?
- Is historical replay deterministic?

### Codex

- Do not create production types from illustrative examples without approval.
- Do not import Runtime into presentation code.
- Preserve canonical object and scene names.
- Record conflicts rather than inventing missing contracts.
- Keep architecture changes out of documentation-only work.

## 29. Open Decisions

1. The canonical directory for product projections and view-model types is
   unresolved.
2. Whether view-model versions are required before the first prototype is
   unresolved.
3. Numeric confidence display remains unresolved.
4. Durable identity for Alpha Understandings, revisions, Follow state, and
   contributions must come from canonical production contracts later.
5. The Respond versus Examine / Challenge-or-Confirm naming conflict requires
   product-canon reconciliation.
6. Return versus Home route/state ownership remains unresolved.
7. The product projection’s relationship to existing Executive Projection
   needs a scene-specific integration decision: compose from it where semantic
   coverage exists, otherwise adapt from Runtime server-side.
8. Governance-safe language for summarized versus restricted evidence requires
   policy and privacy validation.
9. Whether copy strings live entirely in adapters or partly in semantic
   components should be decided component by component; dynamic knowledge
   claims must remain projected.

## 30. Definition of Done

A view-model implementation is complete when:

- Runtime remains behind a server-side projection boundary;
- the scene contract answers one governing question;
- semantic components receive explicit render-ready props;
- source meaning and prioritization are traceable;
- confidence is translated, never recalculated;
- contradictions, unknowns, relationships, and restrictions are preserved;
- identity and immutable history are explicit;
- loading, empty, restricted, stale, and error states are structured;
- mock and production adapters can satisfy the same contract;
- serialization and deterministic ordering are verified;
- no view model creates cognition, governance, or durable organizational
  truth.
