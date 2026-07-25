export const productionPathAudit = {
  entryPoint:
    "runDiscoveryV3(organization context, question, raw InvestigationEvidenceSource[])",
  runtimeEvolution:
    "evolveOrganizationRuntime runs in memory under a fixed clock; persistence is not invoked.",
  stagesExercised: [
    "Evidence", "Observations", "Signals", "Contradictions", "Themes",
    "Mechanisms", "Beliefs", "Concepts", "Theories", "Conditions",
    "Organizational State", "Executive Assessment", "Executive Recommendation",
  ],
  generatedArtifactsConsumed: [
    "raw Evidence", "Observations", "Signals", "Contradictions", "Themes",
    "Phenomena", "current Mechanisms", "Beliefs", "Concepts", "Theories",
    "Organizational Conditions", "Organizational State",
  ],
  adapters: [
    "collectCanonicalInputs flattens generated artifacts for text and lineage inspection.",
    "The adapter adds raw-Evidence artifact identities but no causal semantics.",
  ],
  currentCausalInformation:
    "Production Mechanisms preserve cause, mechanism, effect, confidence, Evidence IDs, and silo lineage.",
  stoppingPoint:
    "Production does not form explicit multi-hop mediation, activation/persistence, comparative alternatives, implications, or falsification criteria.",
  limitation:
    "The harness exercises the broadest unchanged production-shadow path available; candidate causal formation remains benchmark-local.",
};
