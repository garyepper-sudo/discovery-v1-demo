export const productionPathAudit = {
  entryPoints: ["runDiscoveryV3", "evolveOrganizationRuntime"],
  consumedGeneratedArtifacts: [
    "Observations", "Signals", "Themes", "Phenomena", "Contradictions",
    "Mechanisms", "Beliefs", "Concepts", "Theories", "Conditions",
    "Organizational State", "Predictions", "Evidence lineage",
  ],
  excludedInputs: [
    "scoring truth", "held-out futures", "expected mediation",
    "expected activation", "expected implications", "expected interventions",
  ],
  adaptersAddSemanticFacts: false,
  productionModified: false,
  persistence: false,
};
