import type { BenchmarkCase, BenchmarkScenario, CaseCategory } from "./contracts";

const groups: Array<[CaseCategory, string[]]> = [
  ["scope-relation", ["organization subject claim with organization-scoped support", "organization subject claim supported only by one team", "organization subject claim supported by two different functions", "function subject claim supported by organization context and function-specific Evidence", "function subject claim supported by a child team", "team subject claim supported by organization context and team Evidence", "recipient authorized for the exact subject scope", "recipient authorized for a broader scope", "recipient authorized for a narrower scope", "recipient authorized for a sibling function or sibling team", "initiative-scoped support crossing function boundaries", "cross-organization support contamination"]],
  ["nested-field", ["claim eligible, Explanation restricted", "claim eligible, Evidence references restricted", "Evidence references eligible, Evidence bodies unavailable", "one visible and one restricted Evidence reference", "restricted Evidence whose hidden existence would change a displayed count", "condition supported by one eligible and one restricted Explanation", "investigation referencing an eligible and a restricted condition", "confidence derived partly from restricted support", "uncertainty revealing the absence of restricted Evidence", "contradiction revealing the existence of restricted claims", "history entry referencing a formerly visible but now unauthorized object", "evolution linking current eligible content to restricted historical content", "safe lineage containing restricted identities", "availability state differing only because hidden information exists"]],
  ["lineage-quality", ["complete direct lineage", "complete transitive lineage", "incomplete lineage", "conflicting scopes", "duplicate support references", "alternative support paths", "malformed scope identity", "missing organization identity", "stale composition revision", "mismatched authority receipt"]],
  ["authorization-lifecycle", ["active assignment", "inactive assignment", "revoked assignment", "missing assignment", "malformed assignment", "current recipient after a previously eligible read", "same role label with different assignments", "different role labels with identical assignments", "signed-out recipient", "cross-organization recipient"]],
  ["determinism", ["reverse all source arrays", "shuffle support-reference arrays", "duplicate semantically identical but canonically distinct objects", "repeated byte-identical input", "fixed-clock replay", "frontend-safe serialization"]],
];
const base = (): BenchmarkScenario => ({ subjectAuthorized: true, audienceRelationDefined: false, nestedAuthorityDefined: false, lineage: "complete", assignment: "active", sameOrganization: true, restrictedSupport: false, canonicalAbstraction: false, supportRequiredForClaim: false, roleLabel: "recipient", sourceOrder: "canonical", supportOrder: "canonical" });
function scenarioFor(id: number, name: string): BenchmarkScenario {
  const s = base();
  if ([9, 10].includes(id)) s.subjectAuthorized = false;
  if ([2, 3, 4, 5, 6, 11, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].includes(id)) s.restrictedSupport = true;
  if ([4, 6, 18, 19].includes(id)) s.supportRequiredForClaim = false;
  if (id === 15) s.canonicalAbstraction = true;
  if ([29, 33, 34].includes(id)) s.lineage = "incomplete";
  if (id === 30) s.lineage = "conflicting";
  if ([12, 46].includes(id)) s.sameOrganization = false;
  if (id === 38) s.assignment = "inactive";
  if ([39, 42].includes(id)) s.assignment = "revoked";
  if ([40, 45].includes(id)) s.assignment = "missing";
  if (id === 41) s.assignment = "malformed";
  if (id === 47) s.sourceOrder = "reversed";
  if (id === 48) s.supportOrder = "shuffled";
  if (name.includes("role label")) s.roleLabel = `changed-${id}`;
  return s;
}
export const cases: BenchmarkCase[] = groups.flatMap(([category, names]) => names.map((name) => ({ id: 0, category, name, scenario: base() }))).map((entry, index) => ({ ...entry, id: index + 1, scenario: scenarioFor(index + 1, entry.name) }));
export const models = ["model-0", "model-1", "model-2", "model-3", "model-4"] as const;
export const leakageChannels = ["claim", "title", "summary", "Explanation", "Evidence identity", "Evidence count", "comparative Evidence role", "conditions", "condition count", "investigations", "investigation count", "confidence", "uncertainty", "contradictions", "unknowns", "history", "evolution", "availability", "audit references", "safe lineage", "ordering", "omission", "projection identity", "revision identity", "semantic digest", "Product Communication", "rendered presentation"] as const;
