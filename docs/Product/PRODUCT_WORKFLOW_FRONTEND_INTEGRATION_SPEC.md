# Product Workflow Frontend Integration Specification

## Boundary

Server frontend code imports only the Product frontend read wrapper and workflow contracts. `readFrontendReadyProductQuestionWorkspace` delegates to the unchanged `CanonicalProductWorkspaceAdapter.getQuestionWorkspace`, which performs one authorization check before one repository read, then returns `ProductQuestionWorkspaceV2`. Raw Runtime and cognition never cross the boundary.

Contract version is `2`. The Product-owned `readFrontendReadyProductQuestionWorkspace` wrapper and `workflowReadinessFixtureAdapter` return that same contract. The unchanged canonical adapter remains authoritative for the embedded version-1 workspace. Fixtures are development-only and never selectable in Production.

## Commands and errors

Semantic actions map only to existing canonical owners. Mutations require exact organization, Question, authority, current revision, idempotency, and optimistic concurrency. Stable blocked-reason codes are contract-owned. Arbitrary adapter invocation is unsupported.

`execute-existing-local-read-only-operation` is enabled only for an exact current governed V3 authorize receipt, separate `operation:execute-local` authority, the implemented `inspect-existing-evidence` type, current Question/Unknown/Understanding and Objective/Context references, unchanged candidate-envelope digest, and exact authorized source scope. Completed operations expose `operation-already-completed`; unsupported types expose `operation-type-not-implemented`. A candidate never grants execution authority. External actions are absent.

The version-1 operation result preserves exact input and source digests, human-choice ancestry, information, limitations, and idempotency. Resulting information is not Evidence. The existing version-1 Outcome observation separately records Evidence disposition and exact Unknown, Answer, and Understanding before/after references.

Authorization denial precedes protected read. Organization, Question, revision, and concurrency mismatches fail closed. Refresh repeats the canonical server read. Organization or Question switching discards prior projected state. Unsupported serialization values fail closed.

The frontend must not infer workflow stage from nulls, parse presentation text, recompute recommendations, infer Objective/Context freshness, combine confidence, expose withheld values, or convert unavailable into absence. Historical revisions remain version-bound.

Fixture reset regenerates the exact seed and verifies seed/workspace digests. Temporary replay reset removes only task-owned filesystem Runtime and cannot target external or Production resources.
