# Product Workflow Frontend Readiness Audit

**Status:** Implemented projection; operation replay blocked
**Gap:** GAP-A-005
**Roadmap phase:** frontend readiness before wireframes
**Architecture change:** additive version-2 projection only; no new authority, persistence, Runtime field, or cognition

## Finding

Canonical owners express every workflow distinction through existing Product events and projections. Version-1 `ProductQuestionWorkspace` does not orient a frontend across Objective, Context, recommendation, human choice, operation, Outcome, and Learning. Version 2 adds derived orientation and semantic actions while embedding version 1 unchanged.

The repository does not implement a canonical executor for `compare-existing-evidence` or `inspect-existing-evidence`. They are governed candidate types, not executable services. GAP-A-005 remains blocked at operation execution; simulating it would violate Product authority.

## Stage audit

| Stage | Owner / persistence | Read and mutation | Frontend semantics | Readiness |
|---|---|---|---|---|
| Question | `product/questions`; immutable Runtime Question events | canonical adapter read/create/revise/archive | identity, revision, scope, status, history and actions | Ready |
| Evidence | canonical admission and cognition; contribution receipt | `contributeEvidence` through investigation owner | authorized refs only; unavailable explicit; withheld absent | Ready |
| Understanding | canonical cognition projected by Product Workflow | v1 builder then v2 orientation | current bounded meaning, uncertainty and source refs | Ready |
| Answer / Unknown | Product Answer and Unknown lifecycles | existing adapter operations | exact Answer or truthful Unknown; confidence only on Answer | Ready |
| Objective / Context | `product/objectives`; immutable product events | existing record/resolve operations | missing, stale, prohibited and resolved remain distinct | Ready |
| Recommendation | Confidence Improvement, candidate envelope and Material Information Acquisition | existing projections; selection is read-only | select, tie, stop and abstain remain structural | Ready for rendering; inactive |
| Human decision | Confidence Improvement v3 receipt | governed authorize/decline/defer | distinct immutable dispositions and execution authorization | Ready |
| Operation | action-specific owner | no canonical local executor found | `operation-owner-unimplemented` | **Blocked** |
| Outcome | Confidence Improvement Outcome observation | existing outcome observation operation | completion, observation, information and Evidence remain distinct | Contract ready; replay blocked |
| Learning | canonical Answer/Unknown/Understanding and learning owners | recompute only after admitted Evidence | exact before/after or truthful no-change | Contract ready; replay blocked |

All reads authorize the exact user and organization before Runtime access. Historical correction and supersession remain append-only. Empty, unavailable, withheld, blocked, and historical states are never collapsed.

## Existing paths and duplication

- `/product-alpha` remains on version-1 fixture/live-sandbox contracts and is unchanged.
- Legacy and active surfaces still contain Runtime and Executive projection imports; they are not the new supported path and were not modified.
- Benchmark communication remains benchmark-only and is not imported by frontend code.
- The version-2 fixture adapter returns the same contract as the canonical read rather than a display-prose contract.
- Existing live-sandbox mutations use canonical adapter methods. Historical route/Executive mutations are not promoted by this sprint.

## Supported path

`authorized request → readFrontendReadyProductQuestionWorkspace → CanonicalProductWorkspaceAdapter.getQuestionWorkspace → one Runtime read → v1 composition → v2 orientation → frontend`

No new Product primitive, Runtime field, migration, or persisted aggregate is required.
