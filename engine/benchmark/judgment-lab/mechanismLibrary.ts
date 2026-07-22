import type {
  EvaluationUsage,
  ExecutivePerspective,
  OrganizationGroundTruth,
} from "./contracts";

export type MechanismBenchmarkContext = {
  id: string;
  industry: string;
  organizationShape: string;
  terminology: Record<string, string>;
};

export type MechanismEvidenceSubset = {
  id: string;
  description: string;
  includedEvidenceRoles: string[];
  expectedBlindSpots: string[];
};

export type MechanismBenchmarkDefinition = {
  id: string;
  label: string;
  usage: EvaluationUsage;
  contexts: MechanismBenchmarkContext[];
  perspectives: Array<Pick<ExecutivePerspective, "role" | "primaryObjectives" | "likelyBlindSpots">>;
  evidenceSubsets: MechanismEvidenceSubset[];
  hiddenGroundTruth: Omit<OrganizationGroundTruth, "organizationId">;
};

const contexts = (
  mechanism: string,
  terms: Array<[string, string, Record<string, string>]>,
): MechanismBenchmarkContext[] =>
  terms.map(([industry, organizationShape, terminology], index) => ({
    id: `${mechanism}-context-${index + 1}`,
    industry,
    organizationShape,
    terminology,
  }));

const perspectives = [
  { role: "CEO", primaryObjectives: ["enterprise performance"], likelyBlindSpots: ["workflow detail"] },
  { role: "COO", primaryObjectives: ["operating reliability"], likelyBlindSpots: ["market interpretation"] },
  { role: "CFO", primaryObjectives: ["economic performance"], likelyBlindSpots: ["informal coordination"] },
];

const evidenceSubsets: MechanismEvidenceSubset[] = [
  { id: "broad", description: "Cross-functional evidence", includedEvidenceRoles: ["strategy", "operations", "finance", "people"], expectedBlindSpots: [] },
  { id: "operating", description: "Operating evidence only", includedEvidenceRoles: ["operations", "delivery"], expectedBlindSpots: ["strategic intent"] },
  { id: "executive", description: "Executive evidence only", includedEvidenceRoles: ["strategy", "leadership"], expectedBlindSpots: ["workflow behavior"] },
];

function definition(params: {
  id: string;
  label: string;
  contexts: MechanismBenchmarkContext[];
  dominantConstraint: string;
  causalMechanisms: string[];
  intervention: string;
}): MechanismBenchmarkDefinition {
  return {
    id: params.id,
    label: params.label,
    usage: "development",
    contexts: params.contexts,
    perspectives,
    evidenceSubsets,
    hiddenGroundTruth: {
      id: `ground-truth-${params.id}`,
      dominantConstraint: { id: params.id, label: params.dominantConstraint, rationale: `Independent evidence converges on ${params.label.toLowerCase()}.` },
      contributingConditions: [],
      causalMechanisms: params.causalMechanisms,
      misleadingExplanations: [],
      highestLeverageIntervention: { label: params.intervention, rationale: "Intervene at the mechanism rather than its symptoms." },
      acceptableAlternativeInterventions: [],
      harmfulInterventions: [],
      criticalMissingEvidence: [],
      expectedUncertainty: [],
      expectedRecommendationDisposition: "investigate-further",
      evidenceSensitivity: [],
    },
  };
}

export const mechanismLibrary: MechanismBenchmarkDefinition[] = [
  definition({ id: "decision-authority", label: "Decision authority", dominantConstraint: "Decision authority ambiguity", causalMechanisms: ["approval dependency", "unclear decision ownership"], intervention: "Clarify decision rights and escalation boundaries", contexts: contexts("decision-authority", [["industrial manufacturing", "multi-site manufacturer", { decision: "operating decision", executive: "leadership team" }], ["healthcare services", "regional care network", { decision: "care-pathway exception", executive: "clinical leadership" }], ["software", "multi-product scale-up", { decision: "product tradeoff", executive: "product council" }]]) }),
  definition({ id: "coordination-failure", label: "Coordination failure", dominantConstraint: "Cross-functional coordination failure", causalMechanisms: ["weak handoffs", "conflicting ownership"], intervention: "Establish cross-functional ownership", contexts: contexts("coordination-failure", [["logistics", "distributed operator", { handoff: "route handoff" }], ["financial services", "regulated service platform", { handoff: "control handoff" }], ["consumer goods", "brand portfolio", { handoff: "commercial handoff" }]]) }),
  definition({ id: "founder-dependency", label: "Founder dependency", dominantConstraint: "Expertise concentration", causalMechanisms: ["key-person dependency", "weak knowledge transfer"], intervention: "Transfer founder-held methods into repeatable practice", contexts: contexts("founder-dependency", [["consulting", "founder-led advisory firm", { expert: "founder", delivery: "client delivery" }], ["specialty manufacturing", "owner-led manufacturer", { expert: "owner", delivery: "production quality" }], ["creative services", "principal-led studio", { expert: "principal", delivery: "creative review" }]]) }),
  definition({ id: "strategic-misalignment", label: "Strategic misalignment", dominantConstraint: "Strategic alignment drift", causalMechanisms: ["priority conflict", "inconsistent tradeoffs"], intervention: "Clarify enterprise priorities and tradeoff rules", contexts: contexts("strategic-misalignment", [["energy", "diversified operator", { priority: "portfolio priority" }], ["education", "multi-campus institution", { priority: "institutional priority" }], ["retail", "omnichannel retailer", { priority: "channel priority" }]]) }),
  definition({ id: "knowledge-fragmentation", label: "Knowledge fragmentation", dominantConstraint: "Knowledge continuity failure", causalMechanisms: ["localized knowledge", "documentation breakdown"], intervention: "Create a reliable knowledge-transfer system", contexts: contexts("knowledge-fragmentation", [["engineering", "project engineering firm", { knowledge: "engineering judgment" }], ["hospitality", "multi-property operator", { knowledge: "service practice" }], ["biotechnology", "research organization", { knowledge: "experimental knowledge" }]]) }),
];

export function mechanismLibraryForUsage(usage: EvaluationUsage): MechanismBenchmarkDefinition[] {
  return mechanismLibrary.filter((definition) => definition.usage === usage);
}
