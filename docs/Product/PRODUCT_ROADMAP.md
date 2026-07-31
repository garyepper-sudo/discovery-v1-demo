# Discovery Product Roadmap

**Status:** Canonical promotion roadmap
**Gap register:** [PRODUCT_GAPS.md](./PRODUCT_GAPS.md)
**Architecture:** [CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)
**Product objective:** [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)

Roadmap phases are promotion gates, not date commitments. Work may enter a
phase only when its dependencies and validations are explicit.

## Ordered pre-wireframe backend program

No additional wireframe or frontend implementation begins until this sequence
passes the binding replay in
[`WORKFLOW_ACCEPTANCE_SPEC.md`](./WORKFLOW_ACCEPTANCE_SPEC.md).

1. **Phase 0 — Scope lock:** `GAP-A-005`; acceptance authority, metrics, and
   exact replay are canonical.
2. **Phase 1A — Governed source:** `GAP-A-006`, `GAP-A-007`, `GAP-A-016`;
   least-privilege Google authorization, encrypted credential ownership,
   explicit folders, revocation, safe diagnostics, and bounded recovery of a
   missing ephemeral development Runtime under `GAP-A-017`.
3. **Phase 1B — Source material:** `GAP-A-008`, `GAP-A-009`, `GAP-B-004`,
   `GAP-B-010`; incremental synchronization, bounded extraction,
   deduplication, and source-backed freshness.
4. **Phase 2 — Question-relative evidence intelligence:** `GAP-A-010`,
   `GAP-B-001`, controlled portions of `GAP-B-017`; exact-Question retrieval,
   canonical evidence admission, Answer/abstention, citations, and reload.
5. **Phase 3 — Confidence improvement:** `GAP-A-011`; one specific action
   causes further acquisition and an Answer revision or explicit no-change.
6. **Phase 4 — Decision completion:** `GAP-A-012`; draft and commit through the
   existing canonical decision pipeline.
7. **Phase 5 — Outcome and learning:** `GAP-A-013`, `GAP-A-014`; manual
   observed outcomes, canonical review, learning, and model-state revision.
8. **Phase 6 — Insight completion:** `GAP-A-015`; source-backed insight or
   qualified abstention with duplicate suppression and full reload.

Each phase must close its permanent gaps with live evidence before the next
phase is promoted. Deterministic fakes protect regression behavior but never
replace live connector proof.

### Phase 1.1 — Governed Google Drive Retrieval: COMPLETE

Accepted on 2026-07-30. One exact authorized development user and organization
proved encrypted OAuth credential persistence, selected-folder scope,
incremental synchronization, bounded Docs/Sheets/Slides/PDF extraction,
content-addressed Evidence identity, source-version and citation lineage,
Question-relative retrieval, canonical admission, targeted abstention,
null-confidence protection, freshness, idempotent replay, and restart/reload
survival.

The controlled onboarding Question remains an abstention because ownership
timing and credential readiness are competing explanations. Live revocation was
intentionally deferred to preserve the reusable connection; its fail-closed
boundary remains deterministically validated and is not represented as
live-proven.

The next implementation phase is **Phase 2 — Complete
Confidence-Improvement and Recommendation Operations**.

All Phase 2 implementation is governed by
[`ORGANIZATIONAL_UNDERSTANDING_MODEL.md`](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
and
[`PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md`](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md),
with object identity and lifecycle governed by
[`PHASE_2_PRODUCT_OBJECT_CONTRACTS.md`](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md).
The specification must be satisfied through existing canonical owners unless a
separately reviewed architecture decision proves that they cannot express a
required workflow.

The Phase 2 pre-implementation object decisions are complete under
`DEC-PROD-025`. **Phase 2A — Answer Contract** may begin with the existing
reference-backed Answer and Answer-owned Confidence contracts. Unknown and
later object implementation must follow the additive versioning and lifecycle
gates in the object-contract specification; this readiness statement does not
mark `GAP-A-018` or any implementation gap resolved.

### Phase 2A — Canonical Answer Contract: COMPLETE

Accepted on 2026-07-30. ProductQuestion history now supports immutable
version-2 Answer events and operation receipts alongside unchanged version-1
history. Answer lineage is organization- and Question-scoped; deterministic
versions supersede rather than overwrite; Confidence is immutable and owned by
the exact Answer version; abstention creates no Answer and no customer
Confidence.

All 14 deterministic scenarios passed. The existing connected development
Question replayed as the expected targeted abstention with no Answer version,
null Confidence, an identical idempotent receipt, and no duplicate Runtime
write.

### Phase 2B — Unknown Identity and Lifecycle: COMPLETE

Question-scoped Unknowns now have stable semantic identity, immutable version-2
ProductQuestion history events, explicit resolution ancestry, deterministic
current projection, lifecycle replay, idempotent receipts, and authorization-
first adapter operations. Candidate Unknowns remain non-durable until an
explicit open operation. No Confidence-Improvement Operation, Recommendation,
or frontend behavior is included.

The next bounded implementation stage is **Phase 2C — Confidence-Improvement
Operation**.

## Completed foundation — Phases 0–2

Phases 0–2 established the canonical Product architecture, customer-readable
Product Workflow contracts, durable `ProductQuestion` lifecycle, versioned
`ProductQuestionWorkspace`, Runtime-backed lineage, answer-owned confidence,
truthful abstention, deterministic projection, organization isolation, and the
Product Projection Firewall. Their closed gaps remain permanently recorded in
the Resolved Gaps section of `PRODUCT_GAPS.md`.

Phase 2.6 is the bounded pre-frontend correction for `GAP-A-004`. It requires
evidence support **and** exact-Question relevance before Product Workflow may
emit an Answer.

Phase 2.7 proves the canonical frontend integration boundary. It closes
`GAP-A-001`, `GAP-A-002`, and `GAP-A-003` through one authorized adapter,
deterministic legacy adoption, exact-source historical resolution, Question
list projection, mutation-to-workspace round trips, and a frontend import
firewall. The active visual route remains on its compatibility presentation
until Phase 3.

## Phase 3 — Frontend proof

**Objective:** Render the complete authorized `ProductQuestionWorkspace`
through a thin canonical frontend without changing backend meaning.

Phase 3.0 establishes the fixture-first proof at the isolated development
route `/product-alpha`. Its components consume only version-1 Product Workflow
and approved integration contracts through one fixture adapter. It does not
replace `/your-organization`, activate Production behavior, or introduce a
second product interpretation layer. Live sandbox integration follows only
after fixture coverage, firewall, responsive, accessibility, and browser
review pass.

**Capabilities**

- Canonical frontend adapter (`GAP-A-001`)
- Legacy Question adoption/migration (`GAP-A-002`)
- Historical Answer resolution (`GAP-A-003`)
- Question-to-Answer relevance (`GAP-A-004`)

**Dependencies**

- Product contract version 1
- Customer-readable Markdown acceptance
- Durable Question lifecycle
- Product projection firewall
- Question relevance and confidence-suppression validation
- Canonical adapter, adoption, historical-resolution, reload, and frontend
  firewall validation

**Promotion gates**

- Active presentation imports no Runtime, engine, or legacy meaning builder.
- Fixture and live workspaces render through one schema.
- Adjacent, unrelated, or undetermined explanations always abstain without
  customer-facing confidence.
- Question history, abstention, decision, outcome, model, and insight states
  are visually testable.

**Exit criteria**

- All Class A gaps are Resolved.
- Capability Survival and product-governance validation pass.
- No frontend-derived product semantics exist.

## Phase 4 — First governed connector

**Objective:** Add one governed source without weakening authorization,
lineage, abstention, or organization isolation.

**Capabilities**

- Choose one initial connector from `GAP-B-001` or `GAP-B-002`
- Source-backed freshness (`GAP-B-004`)
- Evidence deduplication (`GAP-B-010`)
- Large-scale retrieval validation foundation (`GAP-B-017`)

**Dependencies**

- Phase 3 complete
- Approved OAuth, source-scope, retention, and revocation policy
- Existing evidence-admission pipeline

**Promotion gates**

- Authorization occurs before retrieval.
- Every retrieved item preserves source and Question lineage.
- Revoked sources stop contributing authority.
- Retrieval failure produces a truthful limitation, never a fabricated answer.

**Exit criteria**

- One connector passes security, isolation, replay, and precision validation.
- Manual evidence remains supported.

## Phase 5 — Connected understanding

**Objective:** Make Questions continuously useful across evidence, decisions,
and outcomes while remaining user-governed.

**Capabilities**

- Connected outcome acquisition (`GAP-B-006`)
- Question clustering/similarity (`GAP-B-007`, `GAP-B-009`)
- Multi-user and multi-perspective understanding (`GAP-B-012`, `GAP-B-013`)
- Role-specific visibility (`GAP-B-014`)
- Answer and industry coverage (`GAP-B-015`, `GAP-B-016`)
- Evidence conflict resolution (`GAP-B-011`)

**Dependencies**

- Governed connector
- Durable Question lineage
- Expanded authorization design
- Domain-balanced evaluation

**Promotion gates**

- Connected Evidence improves specific Answer recovery without weaker negative
  controls.
- Collaboration never manufactures consensus.
- Question grouping never silently merges identity or lineage.

**Exit criteria**

- All Beta-required gaps selected for the release are Resolved.
- External design-partner evidence meets truthfulness and utility gates.

## Phase 6 — Autonomous organizational intelligence

**Objective:** Introduce bounded proactive behavior only after connected
understanding, calibration, and operational governance are proven.

**Capabilities**

- Autonomous reevaluation (`GAP-C-001`)
- Proactive insight delivery and suppression (`GAP-C-002`, `GAP-C-003`)
- Continuous monitoring (`GAP-C-005`)
- Model and confidence calibration (`GAP-C-006`, `GAP-C-007`)
- Production observability, recovery, performance, and scale
  (`GAP-C-008`, `GAP-C-009`, `GAP-C-010`, `GAP-C-011`)
- Evidence expiration (`GAP-C-012`)
- Enterprise permissions (`GAP-C-004`)

**Dependencies**

- Phase 5 complete
- Outcome ground truth
- Production operations and governance

**Promotion gates**

- Every autonomous action has policy, scope, budget, stopping, audit, and
  suppression behavior.
- Calibration and observability expose degradation.
- Recovery and concurrency tests preserve Question lineage.

**Exit criteria**

- Production-required gaps are Resolved.
- Autonomous behavior is reversible, observable, and fails closed.

## Research track

Research does not enter production merely because a benchmark succeeds.
`GAP-D-001`, `GAP-D-002`, and `GAP-D-003` require independent evidence,
negative controls, an explicit owner, and a promotion decision recorded in
[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).
