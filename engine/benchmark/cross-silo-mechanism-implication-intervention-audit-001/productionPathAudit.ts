export const productionPathAudit = {
  replay: [
    "runDiscoveryV3(InvestigationInput)",
    "evolveOrganizationRuntime({ runtime, result, input })",
  ],
  handoffs: [
    { stage: "Evidence", producedBy: "runDiscoveryV3 ingestion", consumedFields: ["content", "sourceId", "sourceType", "observedAt", "reliability"] },
    { stage: "Observations", producedBy: "runDiscoveryV3 observation producers", tracedFields: ["id", "description", "sourceEvidenceIds", "confidence"] },
    { stage: "Signals", producedBy: "runDiscoveryV3 signal producers", tracedFields: ["id", "summary", "evidenceIds", "confidence"] },
    { stage: "Themes/Phenomena", producedBy: "runDiscoveryV3 and evolveOrganizationRuntime", tracedFields: ["id", "description", "supporting Evidence", "confidence"] },
    { stage: "Mechanisms", producedBy: "inferMechanisms", tracedFields: ["cause", "mechanism", "effect", "evidenceIds", "confidence"] },
    { stage: "Predictions", producedBy: "evolveOrganizationRuntime prediction producers", tracedFields: ["statement", "conditions", "horizon", "confidence", "falsifyingEvidence", "source condition/concept/theory IDs"] },
    { stage: "Interventions", producedBy: "Executive Decision recommendation pipeline", tracedFields: ["intervention", "targetConditionId", "rationale", "confidence", "supportingConditionIds"] },
  ],
  observedContractGaps: [
    "Mechanism has cause/mechanism/effect but no canonical activation condition.",
    "Mechanism has no canonical prediction horizon or falsification field.",
    "Alternative explanations are not represented on the Mechanism.",
    "Prediction lineage is condition/concept/theory oriented rather than direct Mechanism ancestry.",
    "Intervention targets organizational conditions and strategies rather than a Mechanism causal link.",
  ],
  benchmarkAdaptersAddSemanticFacts: false,
  persistence: false,
};
