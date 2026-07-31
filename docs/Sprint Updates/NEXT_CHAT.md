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

Implemented capability stops after the authorized Understanding Recommendation/Unknown-targeting boundary. Governed Drive retrieval, Answer, Confidence, Unknown, and Phase 2C operations are committed. Objective/Optimization persistence, Objective Discovery, Objective Recommendation generation, complete Decision/Outcome/Learning, and Insight lifecycle remain unimplemented.

## Critical decisions

- Objective confidence and authority are separate.
- Metrics and strategies are not Objectives.
- Objective versions supersede; they never overwrite history.
- Risk appetite belongs to Optimization Context; risk and execution capacity remain Organizational Understanding.
- Objective and Optimization Context persistence must be implemented together.
- Understanding and Objective Recommendations have different primary purposes.
- Material Information Acquisition is read-only, non-persistent, governed, and not yet production calibrated.
- No universal utility score, automatic Decision, or autonomous external action.

## Environment and frontend boundaries

Local Clerk, PostgreSQL, filesystem Runtime, OAuth, connector, and recovery state must remain ignored and uncommitted. Do not expose secrets or live identifiers. `/product-alpha` is a development/compatibility sandbox only; `/your-organization` remains unchanged. Do not begin final frontend wiring before backend workflow completion.

## Exact next Codex task

Implement Organizational Objective and Optimization Context contracts together as Phase 2D.1, using existing Product Workflow, Runtime repository, authorization, lineage, versioning, and idempotency owners. Do not generate Objective Recommendations in that task.

Parallel validation task: design and run read-only Material Information Acquisition live shadow calibration without initiating actions.

## Prohibited shortcuts

Do not reopen foundational architecture without benchmark or implementation evidence. Do not create duplicate persistence, organization identity, confidence, history, Recommendation, or Runtime owners. Do not infer authority from confidence. Do not silently default material Optimization Context. Do not wire the final frontend, deploy, modify Production/Atlas, or automate external action.

## Validation baseline

Run focused validators for every changed contract plus Product Governance, Workflow Acceptance, authorized organization resolution, canonical adapter, typecheck, lint, build, architecture validation, duplicate filenames, and `git diff --check`.

## Copy-paste startup prompt

> Continue Discovery from the implementation phase. Do not reopen foundational architecture unless benchmark or implementation evidence reveals a genuine gap. Begin by reviewing the canonical handoff and planning implementation of Organizational Objective and Optimization Context contracts together. Preserve the complete workflow vision and do not begin final frontend wiring prematurely. Treat Material Information Acquisition as benchmark-supported but blocked on read-only live shadow calibration. Preserve authorization, governance, evidence integrity, organization isolation, truthful uncertainty, immutable history, and no autonomous external action.
