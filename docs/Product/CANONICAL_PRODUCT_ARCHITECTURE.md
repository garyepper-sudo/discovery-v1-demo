# Discovery Canonical Product Architecture

**Status:** Canonical
**Contract version:** 1
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)

## Canonical Organizational Understanding epistemic revisions

Canonical Organizational Understanding owns confidence and uncertainty as
immutable epistemic revisions beneath one stable semantic Understanding
identity. A confidence-only or uncertainty-only change preserves the
conclusion identity, binds its exact predecessor and governed material basis,
and publishes through one Runtime CAS with an owner event, receipt, request
fingerprint, and idempotency record. Current authorized projections and
Prepared Work consume the resulting revision only after scoped authorization.
Product Workflow owns neither confidence nor a replacement truth store.

Historical Runtime without these additive fields remains readable and is not
backfilled. Historical checkpoint lifecycle linkage remains separate work.

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

At the experience boundary, Discovery is organized around the leadership
objective **“What are you trying to accomplish?”** Organizational
Understanding remains the engine; Leadership Workspaces become the product.
Brief, Prepare, Explore, and Capture are initial universal workspace
hypotheses, not new cognition, persistence, identity, or authority owners.
They compose durable Questions and existing workflow objects into recurring
leadership work. The governing strategy is
[DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md](./DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md).
`canonicalCompositions` remains the Product-visible Organizational
Understanding owner. Future Prepared Work Products consume governed Product
contracts derived from that owner, never raw Runtime cognition.

`PreparedWorkProduct` is canonized as a bounded, versioned Product Workflow
artifact for work leaders already create. It references existing canonical
owners and preserves organization, Question, projection, scope, Evidence
lineage, uncertainty, unavailable areas, and exact confidence ownership. Its
preparation and freeze transitions publish an owner-resolved, body-free
material-lineage envelope atomically with the Product Workflow header. The
envelope carries identifiers and digests, never Source Content, Evidence
bodies, Runtime cognition, grants, or authorization objects. It is not
cognition, a report owner, authorization, disclosure, Evidence, Decision, or a
second Question. The bounded first slice is governed by
[the Leadership Conversation Product Constitution](./DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md)
and [first-slice specification](./LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md).

Decision Readiness is a future bounded product determination about whether
sufficient authorized understanding exists for one exact decision. It may not
be inferred from object counts, presentation completeness, hierarchy, or a
universal score. Until its owner and contract are validated, the product must
abstain rather than manufacture readiness.

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

Bounded Runtime reconstruction inputs use the versioned
[Canonical Reconstruction Input Snapshot](./CANONICAL_RECONSTRUCTION_INPUT_SNAPSHOT.md).
The snapshot records semantic replay arguments with stable serialization; it
does not own Evidence admission, Runtime persistence, authorization, scope, or
Product meaning. Report-only digests without their package contract are not
canonical acceptance oracles.

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
| `ProductDecisionDraft` | Product Workflow | Non-authoritative, readiness-bounded immutable draft revisions with exact Question and Answer ancestry | Typed Product Workflow events in authorized Runtime event persistence; actual Decision ownership remains with the Executive Decision pipeline |
| `ProductDecision` | Executive Decision pipeline | Committed intervention and ancestry | Existing Runtime decision/work objects |
| `ProductOutcomeReview` | Executive Review/Learning | Comparison of expected and observed outcomes | Existing Runtime review and learning objects |
| `ProductModelState` | Product Workflow projection | Coverage, coherence, freshness, trustworthiness, tensions, growth | Projection of canonical Runtime state |
| `ProductInsight` | Product Workflow | Quality-gated, evidence-backed insight referencing Questions | Referenced by Question history |
| `ProductChangeReceipt` | Product Workflow | What changed, when, and which bounded product fields changed | Referenced by answer revision history |
| `PreparedWorkProduct` | Product Workflow | Versioned, non-authoritative composition for one Question-linked leadership activity | Bounded Product artifact persistence selected during implementation planning; never generic Runtime storage |
| `ConversationUploadReceipt` | Product Workflow source boundary | Exact source identity, digests, organization, Question, artifact, uploader, duplicate, and binding state | Bounded Product source receipt; grants no Evidence authority |
| `TakeawayProposalEnvelope` | Product Workflow proposal boundary | Human-reviewable typed proposal naming an existing canonical admission owner | Versioned proposal/disposition history; no generic Takeaway authority |

These objects are versioned contracts. They may reference canonical objects;
they must not duplicate cognition or create parallel authority.

## Governed application-role architecture

Discovery has four governed application roles over one canonical Product and
Organizational Understanding substrate:

- **Chief** maintains attention, conversational continuity, organizational
  memory, what matters now, what changed, what deserves attention, and creates
  or consumes consequential cognitive-commit boundaries. It is the primary
  adoption and frequency wedge.
- **Counsel** tests consequential theories, assumptions, strategies, and
  choices; evaluates supporting and contradicting Evidence; exposes
  incompatible and competing explanations; and states falsification and
  reconsideration conditions, including a truthful no-material-challenge result.
- **Operator** connects choices to execution, expected signals, observed
  Outcomes, and durable Learning while preserving Decision authority. It is not
  a generic project-management owner.
- **Scout** detects material environmental change or missing Evidence, reasons
  about freshness and volatility, and recommends targeted acquisition. It does
  not own autonomous monitoring, research, or ingestion.

These are packaged application roles, not separate agents, models, memories,
truth stores, authorization owners, or cognition pipelines. Persona names grant
no scope or authority. All roles consume permission-aware projections from the
same Objective, Context, `ProductQuestion`, source, Evidence, cognition,
Organizational Understanding, Product Workflow, Decision, Outcome, Learning,
lineage, provenance, authorization, and governance owners. No role may mutate
canonical Organizational Understanding outside an existing authorized
operation.

The conceptual organizational-learning loop may compose the roles in sequence,
but it creates no autonomous authority or implementation dependency:

```text
Scout detects material change or an evidence gap
→ Counsel identifies the affected theory, assumption, Question, or Decision
→ Chief places it into governed leadership work
→ Counsel challenges the consequential choice
→ Chief captures and communicates what changed
→ Operator connects the choice to action, signals, Outcomes, and review
→ observed reality updates—or justifiably does not update—Understanding
→ every role receives a new permission-aware projection
```

## Contemporaneous Epistemic History boundary

Contemporaneous Epistemic History is the shared temporal substrate beneath the
four application roles. It preserves authentic governed state at a cutoff; it
does not become a fifth persona, separate memory, second Organizational
Understanding, transcript archive, or retrospective narrative owner.

The architecture distinguishes:

1. **Current Organizational Understanding:** present governed state.
2. **Contemporaneous Epistemic History:** an immutable historical package,
   frozen owner-backed state, or exact immutable canonical references bound at
   the historical cutoff.
3. **Retrospective Analysis:** later derived interpretation, explicitly labeled
   with its later source, model, rubric, prompt, evaluator, and algorithm basis.

No later knowledge may alter what was understood, uncertain, disputed,
expected, accepted, rejected, or unresolved at the earlier governed moment.
Current reasoning over old documents, current owner state, post-cutoff Evidence
or Outcomes, or newer interpretation machinery cannot impersonate the
contemporaneous record. Later Decisions, Outcomes, and Learning may link to the
immutable package without rewriting it.

Before substantial persona behavior depends on historical semantics, a minimum
versioned historical package must bind directly or by exact immutable
references: organization; `ProductQuestion`; actor/recipient context; scope;
purpose; cutoff/freeze boundary; exact Understanding identity/revision; Source
Binding, Source Content revision, and Evidence basis; applicable Prepared Work
revision; interpretation-affecting versions; conclusions; confidence;
uncertainty; assumptions; supporting and contradicting basis; competing
explanations; known unknowns; scope divergence; falsification/reconsideration
conditions; available expected signals/Outcomes; deterministic identity;
immutable lineage; creation authorization; and separately reevaluated
historical-read authorization.

Immutability does not grant disclosure. Historical reads reapply current
authorization and revocation without deleting or rewriting the immutable
record. A formerly broader historical scope must not leak to a currently
narrower recipient.

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

For callers that require exact canonical admission references, the additive
`contributeEvidenceWithCanonicalResult` operation returns the zero/one/many
batch produced directly by the admission invocation and persists a typed,
non-authoritative replay record in existing Runtime events. That record binds
the Product operation to canonical references but changes no Evidence,
admission, attribution, Source Binding, confidence, cognition, or Runtime-schema
owner. Exact replay reads the immutable record without rerunning investigation
or persistence; the established `contributeEvidence` contract remains
compatible.

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

Authorized metric lineage is evaluated server-side before a canonical metric
value enters a Product projection. The evaluator accepts only a
server-resolved canonical producer, producer version, exact scoped inputs, and
complete safe lineage; every input passes the shared scoped-disclosure owner
before a precomputed canonical value may be released. It never computes a
global metric and filters it afterward, changes a metric formula, or exposes a
hidden value, count, delta, trend, rank, or input identity. Coherence from the
Organizational Understanding state owner and learning velocity from the
Organizational Learning Profile owner are currently supported only when all
canonical inputs and the result side channel are authorized. Freshness,
universal confidence, composite health, growth, and trend ranking remain
unsupported where no safely scopable canonical producer contract exists.

One Product-owned server adapter composes scoped Understanding items and
authorized metric-lineage results for every recipient. Material differences
derive from exact scope, authority, purpose, sensitivity, lineage, and temporal
mode rather than role-name branches. Authorization occurs before the single
bounded repository read; cross-organization denial performs no canonical read.
The adapter returns no raw Runtime, cognition, unrestricted Evidence, or
role-specific state. A distinct Product-owned decision-calibration producer
now evaluates exact server-resolved decision, Objective, Optimization Context,
authority, Evidence, constraint, experiment, and Outcome inputs through direct
and derived scoped disclosure before returning independent authority,
strategic-relationship, Evidence-support, feasibility, cross-scope,
strategy-challenge, experiment, and Outcome axes. Only then does it derive a
bounded advisory classification. It adds no alignment score, treats neither
hierarchy nor authority as evidential truth, performs no approval or mutation,
and is consumed unchanged by the same one-read adapter for every recipient.

Canonical Understanding lineage and current eligibility are separate owners.
Immutable ancestry records the material Evidence, admissions, Source Bindings,
ancestor revisions, support roles, and lineage-policy version that produced a
Theory or Explanation. A server-owned Understanding-domain operation then
re-resolves current subject authority and every materially required Source
Binding for the exact purpose, scope, sensitivity, semantic evaluation time,
and canonical Understanding revision. Its deterministic result is `eligible`,
`withheld`, or `unavailable`, with unavailable taking precedence whenever a
material branch cannot be safely evaluated. The scoped projection validates
that result and its bindings before any cognition enters Product composition.
Revocation changes current eligibility without rewriting immutable cognition or
ancestry. Historical Runtime state without the required ancestry fails closed;
no compatibility default may infer authorization.

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

- [DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md](./DISCOVERY_LEADERSHIP_WORKSPACE_MANIFESTO.md)
- [DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md](./DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md)
- [LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md](./LEADERSHIP_CONVERSATION_PREPARE_CAPTURE_SPEC_001.md)
- [LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md](./LEADERSHIP_CONVERSATION_CONFLICT_REGISTER_001.md)
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

Exact local Source Content is now owned by the connector-neutral,
development-only `GovernedSourceContentService`. Source Binding remains the
stable source and scope-lineage owner; the service resolves its current
immutable revision server-side before any mechanical repository access. Exact
bytes receive a content-addressed version while normalized digest remains a
comparison constraint. The owner persists no authorization context, does not
admit Evidence or mutate Organization Runtime, and has no Product Workflow or
Production-storage authority. See
[DISCOVERY_GOVERNED_EXACT_SOURCE_CONTENT_OWNER_001.md](./DISCOVERY_GOVERNED_EXACT_SOURCE_CONTENT_OWNER_001.md).

Local Source Binding registration remains owned by canonical scope lineage.
Its version-2 Runtime index retains the complete canonical topology for
fresh-process validation, while historical version-1 indexes remain readable
and fail closed for new governed operations without topology. Registration,
current resolution, and availability revision authorize before Runtime access,
use optimistic replacement, and return immutable safe receipts. No separate
binding repository, Source Content authority, Product Workflow authority,
Evidence admission, or cognition is created. See
[DISCOVERY_CANONICAL_LOCAL_SOURCE_BINDING_REGISTRATION_PERSISTENCE_AND_IMMUTABLE_RECEIPT_001.md](./DISCOVERY_CANONICAL_LOCAL_SOURCE_BINDING_REGISTRATION_PERSISTENCE_AND_IMMUTABLE_RECEIPT_001.md).

## Field audience-requirement security

The canonical shadow boundary is a content-addressed chain from authoritative
proposal, governing family policy, and canonical topology through derived
approval policy, reconstructed issuance authorization, validated receipt
construction, and historical validation. Current requirement lifecycle remains
separate. The boundary is unpersisted and has no live Product consumer.

Comparative ownership and temporal-model research is noncanonical and selects
no architecture owner or successor. The owner-graph reconciliation is closed
as `OWNER-GRAPH-B`; the remaining governance roots continue in parallel. None
blocks the development-only shared organization-wide Leadership Conversation
slice, which creates no differentiated activation authority.

## Historical checkpoint lifecycle links (L1)

## Architecture compression thin waist

Discovery preserves semantic richness while compressing mechanical variety. The
canonical thin waist is a small family of reusable governed mechanics beneath
independent semantic owners:

1. canonical record references identify owner-issued records without copying
   their meaning;
2. exact-record current-access evaluation reauthorizes the requested record,
   operation, scope, audience, policy revision, and evaluation time;
3. governed operations bind authenticated actor, purpose, inputs, result,
   lineage, replay identity, and immutable receipt;
4. typed relationships connect records without creating a universal graph;
5. permission-aware projections disclose Product-safe views rather than owner
   internals;
6. provider adapters translate external mechanics without acquiring semantic
   authority.

`DEC-PROD-056` freezes the distinction between invariant and implementation.
The waist admits organization confinement, authorization-before-load/current
access, non-disclosure, body-safe projection, canonical identity/revision/
digest/lineage/provenance, atomic expected-revision persistence, exact replay/
collision/deterministic reconstruction, governed-operation receipts, and
real-process concurrency/restart/residue validation. These invariants are
already complete or complete but not yet composed into Chief; no new Alpha-
blocking foundation was found.

The six protocol shapes above remain implementation candidates, not an
implemented universal framework or the complete definition of the waist. Each
permanent shared implementation must independently earn promotion under Product
governance. Semantic owners, repositories, lifecycles, confidence, lineage,
and authorization remain independent. No universal ontology, graph, workflow
language, policy language, persona truth store, migration-before-Alpha, or
replacement compression benchmark is authorized.

### Persona composition over shared Understanding

- **Chief** owns leadership attention, preparation, conversation continuity,
  capture, and follow-through as one Product application over shared
  Organizational Understanding.
- **Counsel** owns bounded challenge work products; it neither owns truth nor
  autonomously mutates canonical records.
- **Operator** owns execution linkage, signals, Outcomes, and review work
  products through governed operations.
- **Scout** owns material-change and Evidence-gap recommendations; acquisition
  and admission remain with their canonical owners.

The cross-persona loop is: Scout recommends a material gap; Counsel tests the
affected assumption; Chief places the issue into governed leadership work;
Operator connects an accepted choice to execution and review; owner-issued
results update shared Understanding; every persona then receives a fresh,
permission-aware projection. Persona output alone is never Evidence or
organizational truth.

### Cognitive privacy boundary

Private cognition, Working cognition, and Organizational cognition are distinct
classes. Private and Working material do not become organizational memory by
being generated, viewed, or reused. Promotion requires an explicit governed
operation, canonical owner acceptance, lineage, current authorization, and a
body-safe disclosure decision. Privacy-preserving aggregate learning across
people or organizations remains deferred until its owner, consent, revocation,
non-inference, and adversarial proof are separately canonized.
Product Workflow owns a bounded, content-free relationship from an immutable
Leadership Conversation frozen checkpoint to exactly one canonical Product
Decision Draft revision, Executive Review, observed Outcome within its owning
Review, or Executive Learning record. It owns only the relationship, receipt,
event, replay identity, and safe projection. Endpoint meaning and persistence
remain with their existing owners.

Publication and every current list/detail read require current authorization
for both the checkpoint Product artifact and the linked endpoint. Product
artifacts reuse the canonical Runtime-to-current-eligibility derivation;
Review, Outcome, and Learning reuse Executive History exact-record access.
Authorization precedes protected loading. The link binds the exact frozen
checkpoint package and exact Understanding confidence/uncertainty revision.
One Product Workflow CAS persists link, receipt, event, and idempotency state.
This is not a universal relationship graph or an authorization owner.
