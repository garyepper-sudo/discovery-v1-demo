# Product Workflow UI/UX Handoff

**Next canonical phase:** DISCOVERY PRODUCT WORKFLOW UI/UX DESIGN 001

Canonical story: Question → Understanding → Answer or Unknown → Objective and Context → Recommendation → Human decision → Operation → Outcome → Learning.

The frontend receives `ProductQuestionWorkspaceV2` through one authorized adapter read. Product Workflow owns stage, status, next action, blockers, unavailable/withheld meaning, disposition, and lineage.

## Inputs

- Read: `readFrontendReadyProductQuestionWorkspace` over `CanonicalProductWorkspaceAdapter.getQuestionWorkspace`
- Fixtures/reset: `workflowReadinessFixtureAdapter`
- Contract: `product/workflow/frontendReadinessContracts.ts`
- Catalog: `FRONTEND_WORKFLOW_FIXTURE_CATALOG.md`
- Matrix: `PRODUCT_WORKFLOW_FRONTEND_STATE_MATRIX.md`
- Integration: `PRODUCT_WORKFLOW_FRONTEND_INTEGRATION_SPEC.md`
- Validation: `npm run validate:product-workflow-frontend-readiness-001`

All twenty-four fixtures instantiate their claimed canonical nested V2 state. Orientation is no longer used as a substitute for absent Product state; the validator checks stage/action coherence, exact prerequisites, structural dispositions, immutable receipts/results, Outcome and Learning lineage, disclosure non-leakage, historical revisions, blocked mutations, and exact reset. The pack is approved as the UI/UX design and frontend acceptance coverage surface.

Show current task and primary meaning first. Alternatives, secondary blockers, limitations, source refs, and immutable audit detail use progressive disclosure. Structured meaning is authoritative; optional deterministic presentation is never parsed.

The UI/UX sprint may change information hierarchy, labels, layout, navigation, disclosure, interaction/visual design, responsiveness, and accessibility. It may not change Product meaning, disposition, Question/revision semantics, Evidence lineage, Objective/Context semantics, authorization, governance, unavailable/withheld meaning, immutable history, action ownership, or execution authority.

Product Confidence Improvement now owns exact local `inspect-existing-evidence` execution. The UI may submit only the enabled semantic action and render the returned operation, Outcome, and Learning states; it must not inspect Evidence, reconstruct eligibility, or execute source logic. `compare-existing-evidence` remains blocked as unimplemented. No React, CSS, route, or final navigation change is part of this backend sprint.

V2 React implementation remains not started. The next canonical phase remains **DISCOVERY PRODUCT WORKFLOW UI/UX DESIGN 001**.
