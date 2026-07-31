# Discovery Workflow Acceptance Specification

**Status:** Canonical product authority beneath Product Governance
**Version:** 1
**Roadmap owner:** Pre-wireframe backend program, Phases 0–6
**Conceptual authority:** [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)

> The eight-stage workflow is the product. Architecture, cognition, Product Workflow, connectors, model state, and frontend presentation are subordinate to making this workflow complete.

Search is an explicit functional stage. The governed workflow is:

`Question → Search → Answer → Confidence → Improve confidence → Decision → Outcome → Model learns → New insight`

These stages are operations that inspect, improve, test, or revise
organizational understanding. Workflow completion is not itself evidence that
understanding improved.

## Global acceptance rules

- `ProductQuestion` owns durable product identity and lineage.
- `ProductQuestionWorkspace` v1 is the only customer-product projection.
- Authorization precedes Runtime and source retrieval.
- Runtime, canonical cognition, evidence admission, decision, review, and learning
  remain authoritative at their existing owners.
- Product Workflow owns bounded customer meaning. A frontend only renders it.
- Unsupported meaning abstains. Unknown remains unknown.
- Every mutation is organization-scoped, idempotent, auditable, and reloadable.
- No frontend work may begin until the final replay below passes using real
  backend operations.

## Stage contracts

| Stage | User objective | Backend objects and reads | Mutations | Customer output and transition | Failure/abstention | Persistence, lineage, authorization | Deterministic acceptance | Browser acceptance | Promotion metrics |
|---|---|---|---|---|---|---|---|---|---|
| Question | State exactly what must be understood. | `ProductQuestion`, authorized Question list/workspace. | Create/archive Question event. | Exact Question and `Created → Searching`. | Invalid, duplicate, or unauthorized identity fails closed. | Runtime Question events preserve organization, principal, time, and exact text. | Create/retry/reload/isolation. | Create, select, reload. | 100% identity and organization preservation. |
| Search | Review only authorized information for that Question. | `ProductSearchPlan`, connected-source metadata, exact Question interpretation. | Synchronize selected scope; record `ProductSearchReceipt`; admit selected passages. | Source scope, counts, citations, limitations, then Answer evaluation. | Authorization-required or targeted no-relevant-material limitation. | Credential store is separate; Question search history and Evidence ancestry retain source/revision/passage. | Scope, relevance, deduplication, revocation, reload. | Authorize, select folder, search, inspect receipt. | precision ≥0.90; irrelevant rejection ≥0.95; duplicate admission 0. |
| Answer | Receive one supported response to the exact Question. | Canonical evidence/cognition and relevance eligibility. | Record exact Answer revision reference. | `ProductAnswer` or targeted abstention. | No generic or adjacent Answer. | Runtime and Question answer history retain source and revision. | relevance, alternatives, negative controls. | Answer/abstention survives reload. | unrelated Answer emission 0; relevance ≥9/10. |
| Confidence | Understand support for the exact Answer. | Answer-owned confidence and limiter. | None independently. | Level/score/meaning/limiter tied to Answer. | No Answer means no customer confidence. | Exact authoritative source and revision retained. | no transfer, clarity, calibration fixtures. | Confidence disappears with abstention. | clarity/trust ≥8.5/10. |
| Understanding Recommendation | Take the most useful bounded next step to improve understanding. | Exact current Unknown, canonical investigation opportunity, authorized candidate actions, and Material Information Acquisition comparison. | Record proposal-specific authorization and target the Unknown; action-specific execution remains separate. | One selected action, preserved material tie, stop, or abstention, projected with purpose, expected contribution, burden/cost/delay, authorization needs, limitations, and stopping condition. | Ineligible actions are removed before comparison; missing material values, ties, insufficient value, or unavailable authority fail truthfully. | ProductQuestion history owns only the existing Phase 2C authorization receipt; action-specific owners retain execution receipts; selection creates no store. | gates, dominance, ties, missing values, ordering, staleness, organization isolation, no Runtime write, no autonomous follow-on. | Authorize one proposal and confirm the Unknown is targeted without executing external work. | one receipt; duplicate selector/action store 0; external action 0. |
| Objective context | Establish what authorized change is sought and which governed criteria may shape action. | Exact Understanding revision, authoritative Objective version, and Objective-specific Optimization Context. | Append explicit authorized Objective or Context versions through the canonical adapter; resolve without mutation. | Confirmed Objective, material context, alternatives requirement, and explicit limitations. | Unknown, unauthorized, conflicting, stale, or materially incomplete inputs fail closed or return one material clarification. | Separate immutable version histories use existing Runtime product events, exact scope authority, idempotency, optimistic concurrency, and no legacy backfill. | authority/confidence separation, correction, supersession, conflict, context sensitivity, Goodhart and governance controls. | Backend-neutral proof only; no frontend activation. | silent defaults 0; understanding mutation 0; generated Objective Recommendations 0. |
| Decision | Convert supported understanding into reviewable action. | `ProductDecisionDraft`, exact Question/Answer ancestry, decision pipeline. | Draft then commit canonical Decision. | Readiness, intervention, risks, outcomes, owner, review date. | Not-ready state names limiter. | Decision/work records remain canonical; Question stores references. | ancestry, readiness, retry, reload. | Draft, commit, revisit. | 100% Question/Answer ancestry. |
| Outcome | Compare observed results with committed expectations. | Decision, expected outcomes, authorized observations. | Manual or governed connected outcome review. | Working/not-working/mixed/inconclusive/too-early. | Missing observations never become results. | Review and learning objects retain decision and evidence references. | comparison, timing, isolation, reload. | Record/review outcome. | 0 fabricated observations. |
| Model learns | Retain governed learning from the outcome. | Review, decision reflection, Runtime memory/model state. | Apply canonical learning and model revision. | Exact bounded model change or explicit no-change. | Evidence arrival alone is not learning. | Existing Runtime learning/memory owners preserve ancestry. | revision, no-change, byte stability, reload. | Model change is visible only after canonical mutation. | 100% linked learning; duplicate application 0. |
| New insight | Surface a material, supported implication. | Quality-gated `ProductInsight`, affected Questions/Decisions. | Link emitted insight to Question history; delivery is separate. | Insight or qualified abstention. | Duplicate, low-value, unsupported, or unauthorized insight abstains. | Runtime/Question references preserve source Answer and affected objects. | gating, duplicate suppression, isolation. | Inspect insight/abstention after reload. | false/duplicate insight emission 0. |

## Required final replay

`Question → Google folder search → Answer or targeted abstention → Confidence where eligible → durable Unknown → governed Material Information Acquisition selection → Understanding Recommendation over one action/tie/stop/abstention → explicit action-specific authorization → existing durable receipt → Unknown targeted → action-specific execution → canonical Evidence admission → revised Answer or explicit no-change → eligible Objective Recommendation where objective/context exist → Decision draft → committed Decision → Outcome review → organizational learning → model-state update → New Insight or qualified abstention → Runtime reload → full ancestry preserved`

The replay must use a safe development Google account and explicitly selected
test folders. Deterministic fakes protect regression behavior but cannot satisfy
the live connector promotion gate.

## Phase 1.1 acceptance record

**Status:** COMPLETE — Governed Google Drive Retrieval
**Accepted:** 2026-07-30

The proven workflow segment is:

`Question → authorized external search → extracted source passages → Question-relative ranking → canonical evidence admission → Answer gate → confidence gate`

The controlled Question “Why are customer onboarding handoffs getting delayed?”
truthfully produces a targeted abstention. Ownership timing and customer
credential readiness remain plausible competing explanations, so no confidence
is emitted.

Canonical organizational Evidence is content-addressed within its authorized
organization and connected-source scope. Repository revisions preserve
provenance, freshness, accessibility, and source-version lineage. A revision
creates new canonical Evidence only when deterministically normalized extracted
content materially changes.

Development Runtime recovery restores the exact organization identity and one
empty Runtime after ephemeral local storage loss. It does not reconstruct lost
historical cognition. Historical onboarding request IDs remain lineage rather
than permanent operating prerequisites, and explicit operator-supplied metadata
is required when canonical metadata is unavailable.

OAuth revocation remains deterministically validated but was intentionally not
executed against the reusable live acceptance connection.

Phase 1.1 governs retrieval through the Answer and confidence gates. Work after
that boundary is additionally governed by
[`PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md`](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md),
which defines the required Why, competing-explanation, Unknown, improvement,
Recommendation, Decision, Outcome, Learning, and Insight behavior before
implementation begins. Their Phase 2 identity, persistence, lifecycle,
permission, and replay semantics are governed by
[`PHASE_2_PRODUCT_OBJECT_CONTRACTS.md`](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md).
