export const productionPathAudit = {
  entryPoint: "runDiscoveryV3 with raw InvestigationEvidenceSource[]",
  runtime: "In-memory evolveOrganizationRuntime under the existing production-shadow harness.",
  unchangedStages: [
    "Evidence", "Entities", "Observations", "Signals", "Contradictions",
    "Themes", "Mechanisms", "Beliefs", "Concepts", "Theories", "Conditions",
    "Organizational State", "Executive Assessment",
  ],
  benchmarkBoundary:
    "All architecture comparison logic begins after unchanged production replay and consumes the same parsed benchmark input.",
  semanticAdapter:
    "A fixed parser reads measured benchmark fields; it adds no expected transitions or scoring truth.",
};
