# Product Workflow Frontend Integration Specification

## Boundary

Server frontend code imports only the Product frontend read wrapper and workflow contracts. `readFrontendReadyProductQuestionWorkspace` delegates to the unchanged `CanonicalProductWorkspaceAdapter.getQuestionWorkspace`, which performs one authorization check before one repository read, then returns `ProductQuestionWorkspaceV2`. Raw Runtime and cognition never cross the boundary.

Contract version is `2`. The Product-owned `readFrontendReadyProductQuestionWorkspace` wrapper and `workflowReadinessFixtureAdapter` return that same contract. The unchanged canonical adapter remains authoritative for the embedded version-1 workspace. Fixtures are development-only and never selectable in Production.

## Commands and errors

Semantic actions map only to existing canonical owners. Mutations require exact organization, Question, authority, current revision, idempotency, and optimistic concurrency. Stable blocked-reason codes are contract-owned. Arbitrary adapter invocation is unsupported.

`execute-existing-local-read-only-operation` is disabled with `operation-owner-unimplemented`. A candidate never grants execution authority. External actions are absent.

Authorization denial precedes protected read. Organization, Question, revision, and concurrency mismatches fail closed. Refresh repeats the canonical server read. Organization or Question switching discards prior projected state. Unsupported serialization values fail closed.

The frontend must not infer workflow stage from nulls, parse presentation text, recompute recommendations, infer Objective/Context freshness, combine confidence, expose withheld values, or convert unavailable into absence. Historical revisions remain version-bound.

Fixture reset regenerates the exact seed and verifies seed/workspace digests. Temporary replay reset removes only task-owned filesystem Runtime and cannot target external or Production resources.
