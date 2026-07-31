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
