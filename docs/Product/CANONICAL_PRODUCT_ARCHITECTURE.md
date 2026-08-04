# Discovery Canonical Product Architecture

**Status:** Canonical
**Contract version:** 1
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)

## Purpose

This document is Discovery's product-architecture constitution. It defines
what the product is, which objects own product meaning, and the boundaries
future work must preserve.

Changes to this architecture require evidence that the current architecture
cannot support the intended workflow.

The core architecture is stable enough for implementation. Further research
should primarily evaluate implemented capability, calibration, comparative
advantage, and demonstrated defects rather than inventing additional objects.
The current phase is contract implementation and product validation; complete
the backend workflow before final frontend wiring.

## Product philosophy

Discovery is a governed organizational learning system. It helps authorized
people ask consequential Questions, form evidence-bounded answers, improve
those answers, make decisions, observe outcomes, retain learning, and improve
the Organizational Model.

A Question is not a transient investigation input. `ProductQuestion` is the
canonical long-lived product object. It accumulates references to searches,
answers, confidence, improvements, decisions, outcomes, learning, and insights.

## Canonical workflow

```mermaid
flowchart TD
  Q["Question"] --> S["Search"]
  S --> E["Evidence"]
  E --> U["Understanding"]
  U --> D["Decision"]
  D --> O["Outcome"]
  O --> L["Learning"]
  L --> M["Organizational Model"]
  M --> I["Insight"]
  I --> Q
```

Search supports manual contribution and one governed Google Drive connector
for an exact development user, sandbox organization, source, and
private/non-root/non-recursive folder. Synchronization is manual, incremental,
read-only, and validate-before-persist; it performs no Drive writes.
Evidence admission and cognition remain authoritative upstream. Product
contracts project that authority; they do not recreate it.

The complete governed learning and action loop is:

```text
Reality → Evidence → Organizational Understanding → Material Uncertainty
→ Understanding Recommendation → Information Acquisition
→ Updated Organizational Understanding → Objective Discovery
→ Organizational Objective + Optimization Context
→ Objective Recommendation → Decision → Outcome → Learning
→ Updated Organizational Understanding
```

Stages explicitly marked designed, benchmark-supported, blocked, or deferred
are not production capabilities.

Canonical organizational Evidence is content-addressed within its authorized
organization/source scope. External repository revisions remain separate
provenance, accessibility, freshness, and source-version lineage. A newer
repository revision with the same deterministically normalized extracted
content must not create another canonical Evidence item or inflate
corroboration. Material content changes may create a new Evidence version while
preserving prior source-version and citation history. This invariant applies
to every governed connector.

## Canonical product objects

| Object | Owner | Responsibility | Persistence |
|---|---|---|---|
| `ProductQuestion` | `product/questions/` | Stable product identity, lifecycle, current references, histories, timeline | Versioned Question events in existing Organization Runtime memory |
| `ProductQuestionWorkspace` | `product/workflow/contracts.ts` plus additive version-2 frontend projection | Complete frontend boundary for one Question, including deterministic workflow orientation and semantic actions | Projection; not an independent store |
| `ProductAnswer` | Product Workflow | Selected specific answer, evidence, uncertainty, improvement, optional decision implication | Referenced by durable Question history |
| `ProductAnswerConfidence` | Selected answer | Confidence in that exact answer and its principal limiter | Preserved with answer revision reference |
| `ProductUnknown` | Product Workflow | Stable Question-scoped identity for the exact unresolved limiter | Versioned Question events in existing Organization Runtime memory |
| `ProductConfidenceImprovementProposal` | Product Workflow | Read-only ranked next step for one exact current Unknown | Derived projection; authorization receipt is a versioned Question event |
| `ProductUnderstandingRecommendation` | Product Workflow | Product-facing projection of an exact Confidence-Improvement proposal with primary understanding purpose | Derived projection; no independent persistence |
| `MaterialInformationAcquisitionResult` | Product Workflow | Read-only comparison selecting one eligible information-producing action, preserving a material tie, stopping, or abstaining | Derived projection; existing action-specific receipts retain lifecycle authority |
| `ProductObjectiveRecommendationEligibility` | Product Workflow | Read-only determination that Objective and Optimization inputs permit future business Recommendation generation | Derived result; no Recommendation generation or persistence |
| `ProductOrganizationalObjective` | Product Workflow | Versioned authoritative desired organizational change | Immutable additive product events in Runtime `memory.events` |
| `ProductOptimizationContext` | Product Workflow | Objective-version-specific governed action preferences and criteria | Immutable additive product events in Runtime `memory.events` |
| `ProductDecisionDraft` | Product Workflow | Readiness-bounded draft that references Question and Answer | Projection of existing decision capability |
| `ProductDecision` | Executive Decision pipeline | Committed intervention and ancestry | Existing Runtime decision/work objects |
| `ProductOutcomeReview` | Executive Review/Learning | Comparison of expected and observed outcomes | Existing Runtime review and learning objects |
| `ProductModelState` | Product Workflow projection | Coverage, coherence, freshness, trustworthiness, tensions, growth | Projection of canonical Runtime state |
| `ProductInsight` | Product Workflow | Quality-gated, evidence-backed insight referencing Questions | Referenced by Question history |
| `ProductChangeReceipt` | Product Workflow | What changed, when, and which bounded product fields changed | Referenced by answer revision history |

These objects are versioned contracts. They may reference canonical objects;
they must not duplicate cognition or create parallel authority.

## ProductQuestion lifecycle

Allowed product states are:

```text
Created
→ Searching
→ Answered
→ Improving
→ Decision In Progress
→ Monitoring
→ Archived
```

Transitions are deterministic and validated. A Question owns exactly one
current Answer reference, at most one current Decision reference, and
append-only histories. Historical objects remain canonical at their existing
owners; the Question preserves lineage to them.

## Ownership boundaries

### Cognition

The engine owns evidence admission, observations, explanations, conditions,
uncertainty, investigation opportunities, recommendations, predictions, and
learning. Product code never alters those outputs or confidence.

### Runtime

Organization Runtime is canonical persistence. Question events use the
existing Runtime event collection and repository replacement contract. No
parallel Question database, identity, history store, or organization identity
is permitted.

### Product Workflow

Product Workflow selects and compresses already-authorized canonical outputs
into versioned product contracts. It owns customer-readable bounded language,
answer selection gates, abstention, and contract composition. It owns no
cognition.

Material Information Acquisition generalizes the existing Phase 2C proposal
boundary without becoming a planner or execution owner. Product Workflow may
compare candidates supplied by existing owners after authorization and
governance gates. Action-specific owners retain initiation, cancellation,
completion, failure, and receipts; canonical Evidence and cognition retain
admission and Understanding updates.

Product Confidence Improvement owns the version-1 immutable local information
operation result for `inspect-existing-evidence`. Execution requires the exact
current governed V3 authorization receipt plus separate local execution
authority. The result organizes exact already-admitted Evidence; it does not
create or admit Evidence, change cognition, or imply learning. Outcome remains
owned by the existing version-1 outcome-observation lifecycle.

### Frontend

The frontend is a renderer of `ProductQuestionWorkspace`. It may own layout,
visual hierarchy, interaction state, animation, disclosure, and accessibility.
It may not choose the answer, evidence, confidence, uncertainty, action,
change meaning, outcome meaning, model change, or insight eligibility.

### Canonical product adapter

`CanonicalProductWorkspaceAdapter` is the sole supported integration boundary
for future frontend reads and mutations. It authorizes before Runtime
retrieval, composes durable `ProductQuestion` lifecycle services with Product
Workflow, performs writes through optimistic Runtime repository replacement,
and returns a refreshed version-1 `ProductQuestionWorkspace`.

Legacy investigations enter through deterministic adoption receipts. Historical
Answers resolve only from an exact retained customer-safe Answer revision;
missing or incompatible content fails closed. The adapter never consumes legacy
presentation output, Product Communication internals, Runtime objects, or
cognition objects as a frontend contract.

## Projection firewall

The active product presentation must consume Product Workflow contracts. It
must not import Runtime, engine cognition, Product Communication internals, or
legacy data builders to determine product meaning.

Dependency direction is:

```text
Canonical cognition and Runtime
→ authorized projection
→ Product Workflow
→ ProductQuestionWorkspace
→ frontend presentation
```

Dependencies must never point back from engine or Runtime into product or
presentation code.

All authorized people and roles project from one canonical governed model:

```text
Canonical Evidence + Organization Runtime + Understanding history
→ authorization before retrieval
→ role/scope-safe Product projection
```

Role-specific disclosure must not create separate truth, cognition, Runtime,
confidence, lineage, history, persistence, or organization-identity owners.

## Shared scoped governance boundary

Scoped disclosure, historical visibility, and contribution use one versioned,
server-resolved governance context. It binds exact organization and subject
identity to an exact requested scope, operation/purpose, sensitivity,
evaluation time, temporal mode, and current authority/policy references.
Role labels and reporting hierarchy are not authorization and do not determine
Evidence quality.

The canonical Understanding disclosure owner evaluates direct and derived
support lineage before serialization and distinguishes disclosed, safely
abstracted, withheld, unavailable, and insufficient-authorized-information
results. Restricted support identifiers are absent from withheld decisions.
Historical reads re-evaluate current authority before loading retained content;
creation-time authority and cached projection identifiers are not access
tokens, and immutable canonical history is not rewritten.

Scoped Product contribution evaluation remains separate from Evidence
candidacy, canonical Evidence admission, and Organizational Understanding.
Contribution results may retain content locally or mark it eligible for
governed consideration, but create no Evidence, perform no admission, propagate
nothing autonomously, and change no canonical Understanding.

## Answer and confidence ownership

- The backend selects one current Answer or explicitly abstains.
- The frontend never combines, ranks, summarizes, or chooses answers.
- Confidence belongs to the exact selected Answer.
- Confidence never silently transfers to a condition, recommendation,
  prediction, evidence count, or organizational model.
- Every displayed confidence value preserves its authoritative source and
  principal limiter.
- Generic recommendations must abstain; intervention-specific evidence is
  required.

## Architectural invariants

1. Organization identity flows from authorization through Runtime and every
   product contract.
2. Unauthorized data is never retrieved to build a workspace.
3. Projection and rendering do not mutate Runtime.
4. Deterministic inputs produce byte-equivalent product contracts and
   rendering.
5. Product language may compress but may not reinterpret canonical meaning.
6. Unsupported content is omitted or represented by a bounded abstention.
7. Question, Answer, Decision, Outcome, Learning, and Insight lineage remains
   explicit.
8. Existing Runtime and cognition are composed before new infrastructure or
   primitives are proposed.
9. Contract changes require version, migration, fixture, validator, and
   documentation review.
10. Active and historical Questions remain organization-isolated.
11. Frontend live-data selection occurs at a server-only canonical adapter
    boundary; Runtime revisions, storage details, and cognition objects never
    cross into presentation.

## Related canonical documents

- [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
- [WORKFLOW_ACCEPTANCE_SPEC.md](./WORKFLOW_ACCEPTANCE_SPEC.md)
- [PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md)
- [PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md)
- [PRODUCT_GAPS.md](./PRODUCT_GAPS.md)
- [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
- [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)
- [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)
- [PRODUCT_CANON.md](./PRODUCT_CANON.md)
- [PRODUCT_COMMUNICATION_ARCHITECTURE.md](./PRODUCT_COMMUNICATION_ARCHITECTURE.md)
- [CANONICAL_PRODUCT_ROUTES.md](./CANONICAL_PRODUCT_ROUTES.md)

## Governed connector boundary

External-source credentials are not organizational cognition and do not belong
in Organization Runtime. A product-owned connector owns encrypted credentials
and bounded connection metadata. It authorizes the exact user and organization
before source retrieval, admits selected source passages only through the
canonical evidence pipeline, records Question search lineage in Runtime, and
returns the unchanged version-1 `ProductQuestionWorkspace`.

Source removal or revocation removes current retrieval authority while
preserving historical Evidence ancestry. Source modification and
synchronization timestamps may support bounded Question freshness; Runtime
update time may not.

The current Google Drive implementation keeps stable source identity separate
from transport-specific file identity and requires exact user, organization,
source, and folder binding. It validates folder shape, non-recursion, MIME
types, counts, byte bounds, content digests, and all staged semantic results
before replacing canonical state. Failure leaves the prior Runtime,
Understanding history, receipt, and checkpoint unchanged. OAuth callback and
log redaction is recursive; credentials and raw Runtime are never report
content.
