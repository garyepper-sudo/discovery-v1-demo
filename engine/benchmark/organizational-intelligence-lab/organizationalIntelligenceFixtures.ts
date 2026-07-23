import type {
  BenchmarkContribution,
  BenchmarkFixture,
  BenchmarkIntelligenceContext,
  BenchmarkPrincipal,
  BenchmarkVisibilityRule,
  IntelligencePurpose,
} from "./organizationalIntelligenceLabTypes";

const fixedNow = "2026-08-01T12:00:00.000Z";
const start = "2026-01-01T00:00:00.000Z";

const contexts: BenchmarkIntelligenceContext[] = [
  { id: "ctx-org", label: "Northstar Systems", kind: "organization", parentIds: [], memberPrincipalIds: ["p-ceo", "p-hr", "p-eng", "p-product", "p-employee"] },
  { id: "ctx-hr", label: "HR / Culture", kind: "function", parentIds: ["ctx-org"], memberPrincipalIds: ["p-hr"] },
  { id: "ctx-alpha", label: "Engineering Team Alpha", kind: "team", parentIds: ["ctx-org"], memberPrincipalIds: ["p-eng"] },
  { id: "ctx-beta", label: "Engineering Team Beta", kind: "team", parentIds: ["ctx-org"], memberPrincipalIds: ["p-eng", "p-employee"] },
  { id: "ctx-exec", label: "Executive Strategy", kind: "team", parentIds: ["ctx-org"], memberPrincipalIds: ["p-ceo"] },
  { id: "ctx-launch", label: "Cross-functional Product Launch", kind: "project", parentIds: ["ctx-org", "ctx-alpha"], memberPrincipalIds: ["p-product", "p-eng", "p-employee"] },
  { id: "ctx-private", label: "Employee Private Workspace", kind: "individual", parentIds: [], memberPrincipalIds: ["p-employee"] },
];

const principals: BenchmarkPrincipal[] = [
  { id: "p-ceo", label: "CEO", role: "executive" },
  { id: "p-hr", label: "HR manager", role: "specialist" },
  { id: "p-eng", label: "Engineering manager", role: "manager" },
  { id: "p-product", label: "Product manager", role: "manager" },
  { id: "p-employee", label: "Employee participant", role: "participant" },
];

const sensitivity = {
  internal: { source: "internal", claim: "ordinary", identity: "anonymous", aggregationRisk: "low" } as const,
  hrRestricted: { source: "restricted", claim: "sensitive", identity: "identifiable", aggregationRisk: "high" } as const,
  executiveRestricted: { source: "restricted", claim: "highly-sensitive", identity: "indirect", aggregationRisk: "high" } as const,
};

const contributions: BenchmarkContribution[] = [
  { id: "c-org-stable", contextIds: ["ctx-org"], category: "organization pulse", rawText: "Organization-wide pulse measures remain broadly stable.", sanitizedClaim: "Culture is broadly stable at the organization level.", trend: "stable", confidence: .76, validScopeIds: ["ctx-org"], generalizableToContextIds: [], purposes: ["culture-health", "organizational-learning"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-hr" },
  { id: "c-hr-uncertainty", contextIds: ["ctx-hr"], category: "anonymized workforce signal", rawText: "Named employee A reported fear about an August restructuring after a manager conversation.", sanitizedClaim: "Workforce uncertainty appears to be increasing in parts of the organization.", trend: "declining", confidence: .82, validScopeIds: ["ctx-hr"], generalizableToContextIds: ["ctx-org"], purposes: ["culture-health", "organizational-learning"], sensitivity: sensitivity.hrRestricted, contributorPrincipalId: "p-hr" },
  { id: "c-alpha-trust", contextIds: ["ctx-alpha"], category: "team pulse", rawText: "Team Alpha reports high trust and candid technical debate.", sanitizedClaim: "Team Alpha trust remains healthy.", trend: "stable", confidence: .84, validScopeIds: ["ctx-alpha"], generalizableToContextIds: ["ctx-org"], purposes: ["culture-health", "delivery-health"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-eng" },
  { id: "c-alpha-approval", contextIds: ["ctx-alpha", "ctx-launch"], category: "delivery signal", rawText: "Architecture approvals add nine days to launch-critical decisions.", sanitizedClaim: "Architectural approvals are slowing launch decisions.", trend: "declining", confidence: .88, validScopeIds: ["ctx-alpha", "ctx-launch"], generalizableToContextIds: ["ctx-org"], purposes: ["delivery-health", "product-launch", "organizational-learning"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-eng" },
  { id: "c-beta-trust", contextIds: ["ctx-beta"], category: "team pulse", rawText: "Team Beta trust scores fell for three consecutive pulses amid leadership friction.", sanitizedClaim: "Team Beta trust is meaningfully declining.", trend: "declining", confidence: .9, validScopeIds: ["ctx-beta"], generalizableToContextIds: ["ctx-org"], purposes: ["culture-health", "organizational-learning"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-employee" },
  { id: "c-exec-restructure", contextIds: ["ctx-exec"], category: "confidential strategy", rawText: "The CEO is considering eliminating the Beta management layer on August 15.", sanitizedClaim: "Confidential strategic change may contribute to uncertainty.", trend: "uncertain", confidence: .86, validScopeIds: ["ctx-exec"], generalizableToContextIds: [], purposes: ["strategy"], sensitivity: sensitivity.executiveRestricted, contributorPrincipalId: "p-ceo" },
  { id: "c-launch-priority", contextIds: ["ctx-exec", "ctx-org"], category: "permitted strategic priority", rawText: "The product launch is the company's highest near-term customer commitment.", sanitizedClaim: "The launch is a permitted organization-level priority.", trend: "stable", confidence: .92, validScopeIds: ["ctx-exec", "ctx-org"], generalizableToContextIds: ["ctx-launch"], purposes: ["product-launch", "strategy"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-ceo" },
  { id: "c-launch-overlap", contextIds: ["ctx-alpha", "ctx-launch"], category: "shared launch observation", rawText: "The same approval queue blocks Product and Engineering launch work.", sanitizedClaim: "One shared approval queue constrains cross-functional launch work.", trend: "declining", confidence: .87, validScopeIds: ["ctx-alpha", "ctx-launch"], generalizableToContextIds: ["ctx-org"], purposes: ["product-launch", "delivery-health"], sensitivity: sensitivity.internal, contributorPrincipalId: "p-product" },
  { id: "c-private-anecdote", contextIds: ["ctx-private"], category: "private observation", rawText: "One teammate seemed unusually quiet after the roadmap meeting.", sanitizedClaim: "One private anecdote suggests possible uncertainty.", trend: "uncertain", confidence: .42, validScopeIds: ["ctx-private"], generalizableToContextIds: [], purposes: ["culture-health"], sensitivity: sensitivity.hrRestricted, contributorPrincipalId: "p-employee" },
];

const purposes: IntelligencePurpose[] = ["culture-health", "delivery-health", "product-launch", "strategy", "organizational-learning"];
const rules: BenchmarkVisibilityRule[] = [];
function allow(principalId: string, contextId: string, purpose: IntelligencePurpose, level: "aggregate" | "raw", activeUntil?: string) {
  rules.push({ principalId, contextId, purpose, level, activeFrom: start, activeUntil });
}
for (const purpose of purposes) allow("p-ceo", "ctx-org", purpose, "aggregate");
allow("p-ceo", "ctx-exec", "strategy", "raw");
allow("p-ceo", "ctx-hr", "culture-health", "aggregate");
allow("p-ceo", "ctx-alpha", "culture-health", "aggregate");
allow("p-ceo", "ctx-beta", "culture-health", "aggregate");
allow("p-hr", "ctx-hr", "culture-health", "raw");
allow("p-hr", "ctx-org", "culture-health", "aggregate");
allow("p-eng", "ctx-alpha", "delivery-health", "raw");
allow("p-eng", "ctx-alpha", "culture-health", "raw");
allow("p-eng", "ctx-beta", "culture-health", "raw");
allow("p-eng", "ctx-launch", "product-launch", "raw");
allow("p-eng", "ctx-org", "organizational-learning", "aggregate");
allow("p-product", "ctx-launch", "product-launch", "raw");
allow("p-product", "ctx-org", "product-launch", "aggregate");
allow("p-employee", "ctx-private", "culture-health", "raw", "2026-07-31T23:59:59.000Z");
allow("p-employee", "ctx-beta", "culture-health", "aggregate", "2026-07-31T23:59:59.000Z");
allow("p-employee", "ctx-launch", "product-launch", "raw", "2026-07-31T23:59:59.000Z");
// Specialist access exceeds CEO raw access for identifiable HR evidence.

export function createOrganizationalIntelligenceFixture(): BenchmarkFixture {
  return JSON.parse(JSON.stringify({ fixedNow, contexts, principals, contributions, visibilityPolicy: { id: "policy-northstar-v1", rules } })) as BenchmarkFixture;
}
