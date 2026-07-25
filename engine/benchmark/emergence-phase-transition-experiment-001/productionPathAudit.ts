export const productionPathAudit = {
  classification: "true isolated production replay",
  entryPoints: [
    "runDiscoveryV3(InvestigationInput)",
    "evolveOrganizationRuntime({ runtime, result, input })",
  ],
  stages: [
    "Evidence",
    "Signals",
    "Themes",
    "Observations",
    "Contradictions",
    "Mechanisms",
    "Beliefs",
    "Phenomena",
    "Concepts",
    "Theories",
    "Organizational Conditions",
    "Organizational State",
  ],
  adapters: [
    {
      name: "deterministic Evidence ordering",
      shapeOnly: true,
      semanticContentAdded: false,
    },
    {
      name: "production lineage to silo mapping",
      shapeOnly: true,
      semanticContentAdded: false,
    },
    {
      name: "analysis graph",
      shapeOnly: false,
      semanticContentAdded: false,
      note: "Edges derive only from lexical overlap, timestamps, silo membership, and production lineage.",
    },
  ],
  bypassedStages: [],
  persistence: false,
};
