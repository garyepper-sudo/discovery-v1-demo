# Discovery Next Chat

## Exact next task

Begin **DISCOVERY PRODUCT WORKFLOW UI/UX DESIGN 001**.

Do not begin frontend implementation until the design is reviewed. Do not
change Product meaning, backend contracts, Runtime, cognition, authorization,
governance, action ownership, or execution authority.

## Read first

1. `AGENTS.md`
2. `docs/Product/PRODUCT_GOVERNANCE.md`
3. `docs/Product/CANONICAL_PRODUCT_ARCHITECTURE.md`
4. `docs/Product/PRODUCT_WORKFLOW_FRONTEND_STATE_MATRIX.md`
5. `docs/Product/PRODUCT_WORKFLOW_FRONTEND_INTEGRATION_SPEC.md`
6. `docs/Product/PRODUCT_WORKFLOW_UI_UX_HANDOFF.md`
7. `docs/Product/FRONTEND_WORKFLOW_FIXTURE_CATALOG.md`
8. `docs/Sprint Updates/DISCOVERY_SNAPSHOT.md`
9. `docs/Sprint Updates/PROJECT_STATE.md`

Inspect branch, HEAD, upstream, staging, and complete working-tree state before
acting. Use the clean Product worktree and create a new branch from
`origin/main`.

## Canonical current state

- GAP-A-005 is closed as `GAP-R-011`.
- Product Workflow Frontend Readiness is Classification A.
- `ProductQuestionWorkspaceV2` contract version `2` is the frontend boundary.
- It contains 9 stages, 14 semantic actions, and 24 deterministic fixtures.
- Workspace loading performs 1 authorized repository read.
- Exact fixture reset and real-operation replay pass.
- `inspect-existing-evidence` is implemented.
- `compare-existing-evidence` remains blocked.
- The replay produced information but no Evidence candidate or admission and
  no Unknown, Answer, Understanding, or recommendation change.
- Learning truthfully reports no cognitive change.
- Frontend wiring has not started.

## Design authority

The UI/UX sprint may change information hierarchy, labels, layout, navigation,
progressive disclosure, interaction and visual design, accessibility, and
responsive behavior.

It may not change ProductQuestion semantics, Product meaning, Evidence
lineage, Answer or Unknown truthfulness, Objective or Optimization Context
semantics, recommendation disposition, authorization, governance, unavailable
or withheld meaning, immutable history, action ownership, or execution
authority.

The frontend must consume the Product-owned V2 contract and server-owned
semantic action surface. It must not inspect Runtime or cognition, infer
eligibility from candidate presence, call the internal operation adapter
directly, or execute source logic.

## Frozen and prohibited work

Recommendation and Organizational Understanding Evaluator development are
frozen by default. Human communication feedback is deferred until frontend
completion. Selector activation, connector execution, external action,
autonomous behavior, Production activation, and deployment remain prohibited.

The original research worktree contains preserved unapproved evaluator Phase
4–5 and related research drafts. Do not clean, merge, or consume it.

## Copy-paste startup prompt

> Begin DISCOVERY PRODUCT WORKFLOW UI/UX DESIGN 001 from the clean Product
> worktree and current `origin/main`. Design the information hierarchy,
> navigation, progressive disclosure, interactions, visual system,
> accessibility, and responsive behavior for `ProductQuestionWorkspaceV2`.
> Preserve all Product-owned semantics, exact unavailable/withheld states,
> immutable lineage, server-owned eligibility, and action authority. Use the
> twenty-four deterministic fixtures and exact reset. Do not implement React,
> change backend contracts, activate selectors or connectors, perform external
> action, modify Production, deploy, or consume the dirty research worktree.
