# Discovery Product Governance

**Status:** Mandatory repository policy
**Architecture:** [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)

## Required pre-implementation review

Every product implementation begins by reading:

1. [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)
2. [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
3. [PRODUCT_GAPS.md](./PRODUCT_GAPS.md)
4. [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)
5. [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)
6. [PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md)
7. [PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md)
8. [MATERIAL_INFORMATION_ACQUISITION_CONTRACT.md](./MATERIAL_INFORMATION_ACQUISITION_CONTRACT.md)

The implementation plan must state:

- which Gap ID is addressed;
- which roadmap phase owns the work;
- whether canonical architecture changes;
- which existing owner is reused;
- what is explicitly out of scope.

If architecture changes, the proposal must explain why the current
architecture cannot support the requirement and provide benchmark or product
evidence. Preference for a cleaner design is not evidence.

## Capability declaration

Every new product capability declares:

| Concern | Required declaration |
|---|---|
| Ownership | One authoritative producer and downstream consumers |
| Persistence | Existing Runtime location, or explicit proof that Runtime cannot support it |
| Lineage | Source object, Question, organization, and downstream references |
| Confidence | Exact object that owns confidence and its limiter |
| Authorization | Boundary that authorizes before retrieval |
| Validation | Focused deterministic command and negative controls |
| Fixtures | Required states, absent states, conflict states, and isolation |
| Migration | Effect on existing Runtime and deployed contracts |

No capability may create duplicate ownership merely to simplify presentation.

## Product authority hierarchy

Product specifications apply in this order:

1. Product Governance defines mandatory process and ownership rules.
2. The
   [Organizational Understanding Model](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
   defines the canonical product objective and conceptual model.
3. The [Workflow Acceptance Specification](./WORKFLOW_ACCEPTANCE_SPEC.md)
   defines the binding end-to-end workflow.
4. Phase-specific acceptance specifications define bounded promotion criteria.
5. The
   [Phase 2 Product Object Contracts](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md)
   govern Phase 2 identity, persistence, lifecycle, permission, lineage, and
   failure semantics.
6. Object-specific architecture contracts define implementation boundaries.
7. Implementations and presentations remain subordinate to all of the above.

Lower-level specifications may refine a higher-level authority but may not
contradict it.

## Question-to-Answer relevance invariant

No Answer may be emitted unless the selected explanation materially addresses
the exact `ProductQuestion`. Evidence support and internal confidence are
necessary but not sufficient. Product Workflow must establish Question
interpretability, requested-relationship coverage, required-concept coverage,
and any required causal bridge before creating a customer Answer.

Adjacent, unrelated, and undetermined candidates must produce a bounded
Question-specific abstention. Canonical candidate confidence remains unchanged
internally, but no customer Answer confidence exists when relevance eligibility
fails. The frontend may not repair, soften, or reinterpret a failed relevance
decision.

## Contract changes

Every contract change requires:

1. Version review.
2. Fixture updates.
3. Focused validator updates.
4. Fixture/live parity review.
5. Migration and rollback assessment.
6. Product-language review.
7. Updates to architecture, gaps, roadmap, and decisions where applicable.

Additive TypeScript compatibility alone does not waive version review.

Product Recommendations must declare exactly one primary purpose: improving
organizational understanding or advancing an explicit organizational
objective. Secondary effects cannot bypass the eligibility, authorization,
lineage, or confidence rules of that primary purpose.

An Organizational Objective's epistemic confidence and authority are distinct.
Optimization Context may express governed preferences but may not restate or
mutate evidence-grounded organizational facts. Operating conditions remain in
Organizational Understanding unless future evidence proves a separate object is
necessary. Objective Recommendation work requires meaningful alternatives and
must treat status quo, delay, abstention, and additional learning as eligible
alternatives where material.

Material Information Acquisition is a non-persistent Product Workflow
selection capability. Authorization, governance, consent, scope, owner
availability, and material safety are hard eligibility gates before comparison.
The selector may compare bounded ordinal information contribution,
organizational relevance, burden, cost, delay, reliability, evidence quality,
and reversibility; it may not establish a universal utility scalar, initiate an
action, admit Evidence, update Understanding, or own an action lifecycle.
Material ties, stopping, and abstention are canonical results.

## Dependency and composition rules

- Prefer composition through existing Product Workflow, Runtime, cognition,
  authorization, and persistence.
- `ProductQuestion` is the canonical product object.
- `ProductQuestionWorkspace` is the canonical frontend boundary.
- Frontends never interpret engine or Runtime internals.
- Engine and Runtime never depend on product or presentation code.
- Product projections do not create cognition.
- Product histories reference canonical objects instead of duplicating them.
- Organization identity is never recreated or inferred from a global default.
- Authorization occurs before Runtime or source retrieval.
- Future frontend product interactions enter only through
  `CanonicalProductWorkspaceAdapter` or an approved server/API boundary that
  preserves its contracts.
- Legacy Questions must be adopted from authoritative source identity and exact
  Question text; similarity may not merge identity.
- Historical Answer content may be shown only when the exact retained revision,
  confidence owner, and customer-safe source resolve. Current content may never
  substitute for missing history.
- Fixture-first frontend proofs consume the same product-safe contracts as the
  canonical adapter through one injected fixture boundary. Fixtures may
  exercise contract states and transitions, but presentation components may
  not import fixture catalogs, legacy composition, Runtime, or cognition.
- Live frontend proofs are development-only, authorize before Runtime
  retrieval, accept only exact `onb-dev-*` organization identity, and expose
  only versioned product contracts through the canonical adapter.

## Gap governance

- Every deferred capability receives one ID in
  [PRODUCT_GAPS.md](./PRODUCT_GAPS.md).
- Do not retain product debt only in prompts, sprint handoffs, comments, or
  memory.
- Do not create two Gap IDs for one capability.
- When a gap is solved, retain its entry, mark it `Resolved`, and cite the
  validation and decision.
- Roadmap work must reference registered Gap IDs.
- Research gaps remain non-production until a decision records promotion.

## Connector governance

- OAuth credentials have one encrypted server-side owner outside Runtime.
- Connector metadata never contains access or refresh tokens.
- Exact user and organization authorization occurs before credential or source
  retrieval.
- Users select explicit source scope; client-supplied tokens or authorization
  claims are never trusted.
- Retrieved content acquires product authority only after exact-Question
  selection and canonical evidence admission.
- Revocation removes current retrieval authority and credentials while
  preserving historical lineage and truthful accessibility state.
- Deterministic fakes are required for regression tests. Promotion additionally
  requires safe live authorization, synchronization, search, reload, and
  revocation.

## Validation and review

Every product phase must run:

- its focused validators;
- `validate:product-governance`;
- relevant contract, firewall, isolation, determinism, and Capability Survival
  validators;
- `npm run typecheck`;
- `npm run lint`;
- `npm run build`;
- `git diff --check`.

Any phase that creates, changes, or promotes an Answer must also run the
Question interpretation, Question-to-Answer relevance, answer coverage,
relevance-confidence, Question-aligned improvement, alternatives-preservation,
paraphrase, substitution, and generalization validators.

All work beginning after Phase 1.1 must identify the applicable acceptance
criteria in
[PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md).
Completion, activity, document volume, and interface engagement are not
sufficient acceptance evidence. The review must state whose individual or
collective organizational understanding improved, what truthful information
became available, and which canonical owner produced it.

Reviews must explicitly confirm:

- no duplicate owner or persistence;
- no confidence transfer;
- no frontend reasoning;
- no organization-isolation regression;
- no unsupported unavailable-state substitution;
- no unresolved debt disappeared from the Gap register.

## Decision governance

Foundational decisions live in
[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md). A superseding decision records:

- the prior decision ID;
- new evidence;
- alternatives considered;
- migration and rollback consequences;
- affected Gap IDs and roadmap phases;
- validator changes.

Silent reversal through implementation is prohibited.

The durable Product laws and first Leadership Conversation boundary live in
[DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md](./DISCOVERY_LEADERSHIP_CONVERSATION_PRODUCT_CONSTITUTION.md).
Implementation review must also reconcile the first-slice specification and
conflict register. Neither artifact supersedes canonical object owners,
authorization, disclosure, Runtime, Evidence admission, or the projection
firewall.

The governed exact Source Content owner is the only semantic ingress for local
exact bytes. Product Workflow stores receipt references, not replacement body
text. Proposal reads and Evidence-admission reads use separate exact scoped
operations; neither read grants admission or Runtime authority. The owner is
development-only and connector-neutral.

## Executive History current-access governance

## Feature-value and architecture-cost gate

Every proposed capability is classified before implementation:

- **P — Projection:** a new permission-aware view of existing canonical truth;
- **W — Workflow composition:** existing owners composed into Product work;
- **A — Derived analysis artifact:** non-authoritative analysis over existing
  canonical truth;
- **R — New canonical record:** durable semantic state with its own justified
  authoritative producer, lifecycle, integrity, and current-access boundary;
- **F — New platform primitive:** shared mechanics supported by independently
  approved consumers without acquiring their semantic authority.

P, W, and A are the default. R requires durable user-relevant state, a distinct
authoritative producer or Decision boundary, an independent lifecycle or
integrity boundary, proof that projection, relationship, Prepared Work, and
analysis are insufficient, and Product, benchmark, or unavoidable governance
evidence. Two proposed new owners trigger architecture review; three or more
normally require rejection, narrowing, or separate platform authorization.
F requires three independently approved consumers or two security/integrity-
critical repetitions, preserved semantic ownership, executable conformance,
and bounded migration. A genuine one-time security boundary may still proceed
when its invariant cannot be represented safely by existing owners.

Feature value is considered across user utility, learning leverage, Alpha
necessity, reuse breadth, and risk reduction. Enduring architecture cost is
considered across new owners, repositories, schemas, migrations, policy/access
families, operational burden, disclosure surface, and irreversible coupling.
Numerical scores and value-to-cost ratios are provisional comparison heuristics,
never authorization and never grounds to weaken security, privacy, lineage, or
current-access invariants. Proof before promotion is mandatory: local patterns
remain owner-specific until repeated evidence and conformance justify reuse.

The fuller value review records frequency, consequence, differentiation,
evidence strength, and compounding value. A provisional planning target is
`feature value / architecture cost >= 2`, recalibrated against actual sprint
history. It is non-automatic: weak evidence, unsafe authority, wrong sequence,
duplication of a mature external system, Alpha distraction, or unproven
prerequisites can still reject a feature. Security-critical prerequisites may
proceed with lower direct user value when required to preserve hard invariants.

Every capability proposal records an extension-cost budget and the increment it
consumes. A capability manifest is a roadmap hypothesis for declaring owner,
class, persistence, lineage, authorization, projection, fixtures, validators,
and dependencies; it is not yet a runtime registry or source of authority.
Executive History disclosure is owned by a content-free, versioned policy and
exact-record binding service. Shared policies may cover audiences, purposes,
sensitivity, and actions; they do not require a manual per-user ACL for every
record. A Review has one exact binding, its observed Outcomes inherit that
Review decision, and Learning has an independent binding.

Organization membership, current persona/assignment, scoped authority, and
`leadership-history:read` are prerequisites only. They never grant a record by
themselves. Semantic owners remain Review, Outcome, and Learning; current access
must be authorized before Runtime load. Missing, pending, stale, revoked,
expired, wrong-parent, or unbound legacy state fails closed without revealing
existence, counts, metadata, or bodies.

Revocation and restoration append access history without mutating semantic
history. Policy revision, revocation, and restoration also append immutable
successors; existing bindings remain inaccessible until explicitly rebound to
the current active policy revision. Access persistence survives process restart,
serializes concurrent writers through real per-organization CAS, and contains no
protected semantic content. Exact replay can recover only its identical persisted
winner; divergent idempotency fingerprints and forked successors are rejected.
The server-only safe projection is versioned and body-free, and missing versus
denied state has one indistinguishable serialization. A post-semantic-commit
activation failure remains explicitly pending and is recoverable idempotently
under administrative authority. Any
future historical-checkpoint L1 linkage must be reconciled separately after
this owner is canonically integrated.
