import type { RegisteredInput, CandidateCausalEdge, EdgeBasis } from "./types";

const rules: Array<{ basis: EdgeBasis; pattern: RegExp }> = [
  { basis: "temporal-contrast", pattern: /^After (.+?) changed, (.+?) changed in the following period\.$/i },
  { basis: "intervention-response", pattern: /^When (.+?) was reduced, (.+?) declined while major alternatives remained stable\.$/i },
  { basis: "cross-case-contrast", pattern: /^Comparable groups with less (.+?) showed less (.+?) under otherwise similar conditions\.$/i },
  { basis: "repeated-transition", pattern: /^Repeated transitions from higher (.+?) were followed by higher (.+?) across periods\.$/i },
];

export function inferImplicitEdges(input: RegisteredInput): CandidateCausalEdge[] {
  const fragments = input.rawEvidence.flatMap((evidence) => rules.flatMap((rule) => {
    const match = evidence.text.match(rule.pattern);
    return match ? [{
      from: match[1].trim(), to: match[2].trim(), basis: rule.basis,
      evidenceId: evidence.id, silo: evidence.silo ?? "unknown",
      artifactIds: input.artifacts.filter((a) => a.evidenceIds.includes(evidence.id)).map((a) => a.id),
    }] : [];
  }));
  const groups = new Map<string, typeof fragments>();
  for (const fragment of fragments) {
    const key = `${fragment.from}\u0000${fragment.to}`;
    groups.set(key, [...(groups.get(key) ?? []), fragment]);
  }
  return [...groups.values()].map((group, index): CandidateCausalEdge => {
    const forms = [...new Set(group.map((item) => item.basis))].sort();
    const deterministic = forms.length >= 2 && forms.some((form) => form !== "temporal-contrast");
    return {
      id: `implicit-edge-${index}`,
      fromNodeId: group[0].from,
      toNodeId: group[0].to,
      relationship: "contributes to",
      basis: deterministic ? forms[0] : "unsupported",
      supportForms: forms,
      artifactIds: [...new Set(group.flatMap((item) => item.artifactIds))].sort(),
      evidenceIds: [...new Set(group.map((item) => item.evidenceId))].sort(),
      supportingSiloIds: [...new Set(group.map((item) => item.silo))].sort(),
      supportStatus: deterministic ? "deterministically-derived" : "supported-but-ambiguous",
      confidence: deterministic ? 0.72 : 0.35,
      alternativeDirections: [`${group[0].to} may influence ${group[0].from}`],
      confounders: ["an unobserved common cause"],
    };
  }).sort((a, b) => a.fromNodeId.localeCompare(b.fromNodeId) || a.toNodeId.localeCompare(b.toNodeId));
}
