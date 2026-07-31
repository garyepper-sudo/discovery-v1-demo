# Discovery Organizational Objective Contract

**Status:** Implemented at the governed Product Workflow boundary; not frontend-exposed
**Phase:** 2D
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)

## Purpose

An Organizational Objective is the governed, prospective statement of a
desired organizational change that may qualify future Objective Recommendation
generation. It is not a Question, metric, strategy, constraint, Outcome, or
Recommendation.

```ts
type ProductOrganizationalObjective = {
  contractVersion: "1";
  objectiveId: string;
  organizationId: string;
  scope:
    | { kind: "organization" }
    | { kind: "team"; teamRef: string }
    | { kind: "initiative"; initiativeRef: string }
    | { kind: "question"; questionId: string };
  statement: string;
  desiredChange: {
    target: string;
    direction: "increase" | "decrease" | "maintain" | "achieve" | "avoid";
  };
  successCriteria: Array<{
    criterionId: string;
    statement: string;
    indicatorRef: string | null;
    target: { kind: "qualitative"; description: string }
      | { kind: "quantitative"; value: number; unit: string };
  }>;
  horizon: {
    startsAt: string | null;
    targetBy: string | null;
    reviewAt: string | null;
  };
  status:
    | "proposed" | "inferred" | "confirmed" | "active" | "suspended"
    | "achieved" | "abandoned" | "expired" | "superseded";
  epistemicConfidence: "low" | "moderate" | "high" | null;
  authority: {
    sourceKind: "authorized-user" | "governed-policy" | "decision" | "inference";
    sourceRef: string;
    authorityScopeRef: string | null;
    authorityBasis: string;
    authorizedToEstablish: boolean;
  };
  ancestry: {
    evidenceRefs: string[];
    questionRefs: string[];
    decisionRefs: string[];
    sourceRefs: string[];
  };
  parentObjectiveVersionRef: string | null;
  constraintRefs: string[];
  version: number;
  supersedesObjectiveVersionRef: string | null;
  establishedAt: string;
};
```

## Minimum semantics

- Identity is organization-scoped and stable across wording-only changes.
- Every material correction creates a new immutable version. Supersession does
  not delete history or rewrite Organizational Understanding.
- `confirmed` means an authorized source affirmed the Objective. `active` means
  the confirmed Objective currently governs action selection. The states are
  distinct.
- Epistemic confidence concerns whether Discovery interpreted the Objective
  correctly. Authority concerns whether the source may establish it. High
  confidence never substitutes for authority.
- Inferred Objectives are assumptions. They may support only disclosed,
  reversible, non-high-stakes eligibility and never become authoritative by
  repetition.
- At least one success criterion is required before an Objective is active.
  A qualitative criterion is valid when it is bounded and reviewable. A metric
  is an indicator for a criterion, not automatically the Objective.
- Parent objectives express hierarchy. A lower-scope Objective may not silently
  override an authoritative parent or protected constraint.
- An Objective may constrain another Objective only through an explicit
  `constraintRef`; silent aggregation and implicit weighting are prohibited.

## Ownership and persistence

Product Workflow is the owner, composed through the canonical product adapter.
Immutable Objective versions are additive schema-version-1 product events in
the existing Organization Runtime `memory.events` collection. The existing
Runtime repository replacement contract owns optimistic concurrency. Exact
scope authority and reference validation are injected server-side and fail
closed before a write. Existing Runtimes require no migration or backfill.

The implementation is in `product/objectives/`. It does not discover an
Objective, infer authority, generate an Objective Recommendation, alter
Organizational Understanding, or expose Objective state to the frontend.

## Eligibility boundary

An Objective Recommendation requires an active authoritative Objective version.
A confirmed but inactive Objective, an expired or superseded version, an
unauthorized source, an unresolved conflict, or a missing success criterion
fails closed. High-stakes or irreversible candidates require confirmed and
authorized status.

## Discovery and revalidation boundary

Objective Discovery Experiment 001 supports a governed hybrid adaptive
discovery design. Declarations, admitted evidence, decisions, strategy, metrics,
and organizational conditions are lineage-preserving signals. They may produce
temporary Objective hypotheses, but neither recurrence nor evidential
confidence establishes authority.

`declared` and `observed` are signal classifications, not additional durable
Objective object types. Only a confirmed, scoped, authorized version is a
governed Objective. A material conflict remains unresolved until an authorized
source resolves it or explicitly governs multiple scoped Objectives.

Material changes trigger revalidation rather than implicit mutation. Scheduled
review, authority change, crisis, regulation, acquisition, market discontinuity,
success, abandonment, expiry, or persistent declared/observed conflict may open
review. Revalidation creates no replacement until the normal versioned authority
gate passes.

The hypothesis projection, authority-resolution interface, question-selection
contract, and persistence event remain unimplemented.
