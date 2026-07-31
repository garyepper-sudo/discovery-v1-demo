# Discovery Next Chat

## Read first

1. `AGENTS.md`
2. `docs/Product/PRODUCT_GOVERNANCE.md`
3. `docs/Product/CANONICAL_PRODUCT_ARCHITECTURE.md`
4. `docs/Product/ORGANIZATIONAL_UNDERSTANDING_MODEL.md`
5. `docs/Product/WORKFLOW_ACCEPTANCE_SPEC.md`
6. `docs/Product/PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md`
7. `docs/Product/PHASE_2_PRODUCT_OBJECT_CONTRACTS.md`
8. `docs/Product/ORGANIZATIONAL_OBJECTIVE_CONTRACT.md`
9. `docs/Product/OPTIMIZATION_CONTEXT_CONTRACT.md`
10. `docs/Product/MATERIAL_INFORMATION_ACQUISITION_CONTRACT.md`
11. `docs/Sprint Updates/DISCOVERY_SNAPSHOT.md`
12. `docs/Sprint Updates/PROJECT_STATE.md`

Inspect `git status --short`, the current branch, upstream, and latest commits before acting.

## Current identity and workflow

Discovery is a governed organizational learning and intelligence system. The canonical complete workflow is:

```text
Reality → Evidence → Organizational Understanding → Material Uncertainty
→ Understanding Recommendation → Information Acquisition
→ Updated Organizational Understanding → Objective Discovery
→ Organizational Objective + Optimization Context
→ Objective Recommendation → Decision → Outcome → Learning
→ Updated Organizational Understanding
```

Governed Drive retrieval, Answer, Confidence, Unknown, and Phase 2C operations
are committed. Organizational Objective and Optimization Context are distinct
immutable Product Workflow event families, and Backend Acceptance 001 passed
Classification A. Objective Discovery, Objective Recommendation generation,
complete Decision/Outcome/Learning, and Insight lifecycle remain unimplemented.

Material Information Acquisition has an inactive, read-only, non-persistent
ordinal/Pareto shadow selector. Live calibration remains Classification B with
zero complete live cases. Candidate Envelope and Outcome Readiness 001 passed
Classification A through Product Confidence Improvement as the initial
canonical information-operation owner. Historical v2 receipts remain readable
but incomplete and are not backfilled. `GAP-B-018` remains Open.

## Critical decisions

- Objective confidence and authority are separate.
- Metrics and strategies are not Objectives.
- Objective versions supersede; they never overwrite history.
- Risk appetite belongs to Optimization Context; risk and execution capacity remain Organizational Understanding.
- Objective and Optimization Context persistence must be implemented together.
- Understanding and Objective Recommendations have different primary purposes.
- Material Information Acquisition is read-only, non-persistent, governed,
  inactive, and not production calibrated.
- No universal utility score, automatic Decision, or autonomous external action.

## Environment and frontend boundaries

Local Clerk, PostgreSQL, filesystem Runtime, OAuth, connector, and recovery state must remain ignored and uncommitted. Do not expose secrets or live identifiers. `/product-alpha` is a development/compatibility sandbox only; `/your-organization` remains unchanged. Do not begin final frontend wiring before backend workflow completion.

## Exact next Codex task

Run Material Information Acquisition — Independent Live Outcome Calibration
002. Freeze complete owner-produced v3 candidate envelopes, persist real human
choices before revealing the shadow result, and observe only separately
authorized outcomes that already occur. Do not optimize selector logic against
the evaluation cases.

## Prohibited shortcuts

Do not reopen foundational architecture without benchmark or implementation evidence. Do not create duplicate persistence, organization identity, confidence, history, Recommendation, or Runtime owners. Do not infer authority from confidence. Do not silently default material Optimization Context. Do not wire the final frontend, deploy, modify Production/Atlas, or automate external action.

## Validation baseline

Run focused validators for every changed contract plus Product Governance, Workflow Acceptance, authorized organization resolution, canonical adapter, typecheck, lint, build, architecture validation, duplicate filenames, and `git diff --check`.

## Copy-paste startup prompt

> Continue Discovery from the independent evidence-calibration phase. Do not
> reopen foundational architecture unless empirical execution reveals a genuine
> invariant the accepted contracts cannot express. Run Material Information
> Acquisition Independent Live Outcome Calibration 002 with the selector frozen,
> hidden until after human choice, and read-only. Preserve authorization,
> governance, Evidence ownership, organization isolation, immutable history,
> truthful outcome absence, and zero autonomous external action. Do not activate
> the selector, execute a connector, begin final frontend wiring, or deploy.
