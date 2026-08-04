export type RoleLevel = "team-lead" | "manager" | "director" | "functional-executive" | "organization-executive";
export type ScopeKind = "organization" | "function" | "department" | "team" | "initiative" | "private-manager" | "restricted-people";

export type SyntheticScope = { id: string; kind: ScopeKind; parentId?: string; organizationId: string };
export type SyntheticRole = { id: string; personId: string; title: string; level: RoleLevel | "individual-contributor" | "restricted-authority"; scopeIds: string[]; contributionScopeIds: string[]; evidenceAdmissionScopeIds: string[]; retrievalScopeIds: string[]; projectionScopeIds: string[]; decisionScopeIds: string[]; status: "active" | "revoked"; reportsToRoleId?: string };
export type SyntheticEvidence = { id: string; organizationId: string; category: string; scopeId: string; sensitivity: "standard" | "restricted" | "private"; effectiveAt: string; sourceId: string; sourceAuthorityRoleId: string; lineageIds: string[]; admissionDisposition: "admitted" | "rejected"; supports: string[]; contradicts: string[]; canaryDigest?: string };
export type BenchmarkScenario = { id: string; category: "projection" | "direct" | "derived" | "propagation" | "revocation" | "metric" | "contribution" | "decision" | "adversarial"; description: string; expected: "pass" | "fail-closed" | "unsupported" };
export type CheckResult = { id: string; result: "pass" | "fail-closed" | "unsupported" | "fail"; canonicalOwner: string; observation: string; fieldFailures: string[] };
export type RoleProjection = { role: RoleLevel; recipientRoleId: string; status: "supported" | "unsupported"; authorizedScopeIds: string[]; categories: string[]; withheldCategories: string[]; explanation: string; lineage: string[] };
export type Gap = { id: string; classification: "missing-implementation" | "incomplete-contract" | "governance-defect" | "architecture-mismatch"; owner: string; description: string; smallestFutureBoundary: string[] };
