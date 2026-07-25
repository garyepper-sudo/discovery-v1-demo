import type { ArchitectureWorld, BenchmarkContribution, PermissionRule, ScopeId } from "./architectureBenchmarkTypes";

const fixedNow = "2026-08-15T12:00:00.000Z";
const contribution = (value: Partial<BenchmarkContribution> & Pick<BenchmarkContribution, "id" | "semanticId" | "scopeId" | "contributorId">): BenchmarkContribution => ({
  kind: "assertion",
  rootSourceIds: [],
  purpose: "delivery-learning",
  confidence: 0.7,
  provisional: false,
  aiGenerated: false,
  private: false,
  restricted: false,
  localOnly: false,
  validFrom: fixedNow,
  ...value,
});
const rule = (principalId: PermissionRule["principalId"], purpose: PermissionRule["purpose"], scopeId: ScopeId, level: PermissionRule["level"], activeUntil?: string): PermissionRule => ({
  principalId, purpose, scopeId, level, activeUntil,
});
const commonPermissions: PermissionRule[] = [
  rule("analyst-a", "delivery-learning", "team-a", "raw"),
  rule("analyst-b", "delivery-learning", "team-b", "raw"),
  rule("manager", "delivery-learning", "organization", "raw"),
  rule("executive", "delivery-learning", "organization", "raw"),
];

export function createArchitectureWorlds(): ArchitectureWorld[] {
  return [
    {
      id: "duplicate-ancestry",
      heldOut: false,
      fixedNow,
      organizationId: "architecture-benchmark-org",
      contributions: [
        contribution({ id: "dup-original", semanticId: "claim-flow-delay", kind: "evidence", scopeId: "team-a", contributorId: "analyst-a", sourceId: "source-opaque-1", rootSourceIds: ["source-opaque-1"], supportsClaimId: "claim-flow-delay" }),
        contribution({ id: "dup-summary", semanticId: "claim-flow-delay", scopeId: "team-b", contributorId: "analyst-b", sourceId: "summary-1", rootSourceIds: ["source-opaque-1"], supportsClaimId: "claim-flow-delay" }),
        contribution({ id: "dup-ai", semanticId: "claim-flow-delay", scopeId: "team-a", contributorId: "analyst-a", sourceId: "ai-1", rootSourceIds: ["source-opaque-1"], supportsClaimId: "claim-flow-delay", aiGenerated: true }),
        contribution({ id: "dup-memory", semanticId: "claim-flow-delay", scopeId: "team-b", contributorId: "analyst-b", sourceId: "memory-1", rootSourceIds: ["source-opaque-1"], supportsClaimId: "claim-flow-delay" }),
        contribution({ id: "dup-copy", semanticId: "claim-flow-delay", scopeId: "organization", contributorId: "manager", sourceId: "copy-1", rootSourceIds: ["source-opaque-1"], supportsClaimId: "claim-flow-delay" }),
      ],
      permissions: commonPermissions,
      expected: {
        authoritativeClaimIds: ["claim-flow-delay"],
        localExceptionIds: [],
        emergentClaimIds: [],
        rejectedAuthoritativeIds: [],
        contradictionPairs: [],
      },
    },
    {
      id: "local-exception",
      heldOut: true,
      fixedNow,
      organizationId: "architecture-benchmark-org",
      contributions: [
        contribution({ id: "pattern-a", semanticId: "claim-broad-friction", kind: "evidence", scopeId: "team-a", contributorId: "analyst-a", sourceId: "source-a", rootSourceIds: ["source-a"], supportsClaimId: "claim-broad-friction" }),
        contribution({ id: "pattern-b", semanticId: "claim-broad-friction", kind: "evidence", scopeId: "team-b", contributorId: "analyst-b", sourceId: "source-b", rootSourceIds: ["source-b"], supportsClaimId: "claim-broad-friction" }),
        contribution({ id: "exception-c", semanticId: "claim-local-exception", kind: "exception", scopeId: "team-exception", contributorId: "manager", sourceId: "source-c", rootSourceIds: ["source-c"], contradictsClaimId: "claim-broad-friction", localOnly: true }),
      ],
      permissions: [...commonPermissions, rule("manager", "delivery-learning", "team-exception", "raw")],
      expected: {
        authoritativeClaimIds: ["claim-broad-friction", "claim-local-exception"],
        localExceptionIds: ["claim-local-exception"],
        emergentClaimIds: [],
        rejectedAuthoritativeIds: [],
        contradictionPairs: [["claim-local-exception", "claim-broad-friction"]],
      },
    },
    {
      id: "restricted-evidence",
      heldOut: false,
      fixedNow,
      organizationId: "architecture-benchmark-org",
      contributions: [
        contribution({ id: "restricted-raw", semanticId: "claim-sensitive-retention", kind: "evidence", scopeId: "function-specialist", contributorId: "specialist", sourceId: "source-r", rootSourceIds: ["source-r"], purpose: "workforce-planning", restricted: true }),
        contribution({ id: "sanctioned-aggregate", semanticId: "claim-retention-aggregate", kind: "assertion", scopeId: "organization", contributorId: "specialist", sourceId: "aggregate-r", rootSourceIds: ["source-r"], purpose: "workforce-planning", confidence: 0.6 }),
      ],
      permissions: [
        rule("specialist", "workforce-planning", "function-specialist", "raw"),
        rule("specialist", "workforce-planning", "organization", "raw"),
        rule("manager", "workforce-planning", "organization", "aggregate"),
        rule("employee", "workforce-planning", "organization", "none"),
        rule("specialist", "strategy", "function-specialist", "none"),
      ],
      expected: {
        authoritativeClaimIds: ["claim-sensitive-retention", "claim-retention-aggregate"],
        localExceptionIds: [],
        emergentClaimIds: [],
        rejectedAuthoritativeIds: [],
        contradictionPairs: [],
      },
    },
    {
      id: "cross-scope-root",
      heldOut: true,
      fixedNow,
      organizationId: "architecture-benchmark-org",
      contributions: [
        contribution({ id: "edge-a", semanticId: "symptom-a", kind: "relationship", scopeId: "team-a", contributorId: "analyst-a", sourceId: "source-edge-a", rootSourceIds: ["source-edge-a"], relationship: { from: "symptom-a", to: "bridge-x" } }),
        contribution({ id: "edge-b", semanticId: "symptom-b", kind: "relationship", scopeId: "team-b", contributorId: "analyst-b", sourceId: "source-edge-b", rootSourceIds: ["source-edge-b"], relationship: { from: "bridge-x", to: "root-z" } }),
      ],
      permissions: commonPermissions,
      expected: {
        authoritativeClaimIds: ["symptom-a", "symptom-b", "emergent-root-z"],
        localExceptionIds: [],
        emergentClaimIds: ["emergent-root-z"],
        rejectedAuthoritativeIds: [],
        contradictionPairs: [],
      },
    },
    {
      id: "unsupported-ai",
      heldOut: false,
      fixedNow,
      organizationId: "architecture-benchmark-org",
      contributions: [
        contribution({ id: "ai-hypothesis", semanticId: "claim-ai-root", kind: "hypothesis", scopeId: "team-a", contributorId: "analyst-a", rootSourceIds: [], provisional: true, aiGenerated: true, confidence: 0.8 }),
        contribution({ id: "ai-repeat", semanticId: "claim-ai-root", kind: "assertion", scopeId: "team-b", contributorId: "analyst-b", sourceId: "user-repeat", rootSourceIds: [], provisional: true, confidence: 0.7 }),
      ],
      permissions: commonPermissions,
      expected: {
        authoritativeClaimIds: [],
        localExceptionIds: [],
        emergentClaimIds: [],
        rejectedAuthoritativeIds: ["claim-ai-root"],
        contradictionPairs: [],
      },
    },
  ];
}
