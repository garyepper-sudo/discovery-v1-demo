import { productConfidenceImprovementOutcomeObservations } from "../../improvements/outcomeObservationLifecycle";
import { CanonicalProductWorkspaceAdapter } from "../../integration/canonicalProductWorkspaceAdapter";
import type { HumanChoiceArtifact, OutcomeArtifact, SelectorComparisonArtifact } from "./contracts";
import type { CalibrationReloadDependencies } from "./verifyHumanChoiceReload";
import { calibrationDigest } from "./protocol";
export async function observeCalibrationOutcome(input: { comparison: SelectorComparisonArtifact; choice: HumanChoiceArtifact; userId: string; dependencies: CalibrationReloadDependencies; outcome: { state: "unmeasured"; reason: string; missingOutcomeFields: string[] } | { state: "canonical-observation"; observationId: string }; observedAt: string }): Promise<OutcomeArtifact> {
  const { artifactDigest, ...unsignedComparison } = input.comparison;
  if (calibrationDigest(unsignedComparison) !== artifactDigest || !Number.isFinite(Date.parse(input.observedAt))) throw new Error("Calibration outcome predecessor is invalid.");
  if (input.choice.caseId !== input.comparison.caseId || input.choice.organizationId !== input.comparison.organizationId) throw new Error("Calibration outcome choice lineage is invalid.");
  const repository = input.dependencies.createRepository();
  const adapter = new CanonicalProductWorkspaceAdapter({ runtimeRepository: repository, authorize: input.dependencies.authorize, authorizeImprovementOperation: input.dependencies.authorizeImprovementOperation, async investigate() { throw new Error("Calibration outcome inspection performs no investigation."); } });
  await adapter.getQuestionWorkspace({ userId: input.userId, organizationId: input.choice.organizationId, questionId: input.choice.canonicalReceiptSnapshot.questionId });
  const stored = await repository.read(input.choice.organizationId);
  if (!stored) throw new Error("Calibration canonical outcome store is unavailable.");
  const observations = productConfidenceImprovementOutcomeObservations(stored.runtime).filter((item) => item.operationId === input.choice.idempotencyIdentity && item.operationEventId === input.choice.canonicalEventRef);
  let outcome: OutcomeArtifact["outcome"];
  if (input.outcome.state === "unmeasured") {
    if (!input.outcome.reason.trim() || !input.outcome.missingOutcomeFields.length || observations.length) throw new Error("Calibration outcome cannot be locally declared unmeasured when a canonical observation exists.");
    outcome = { state: "unmeasured", reason: input.outcome.reason, missingOutcomeFields: [...new Set(input.outcome.missingOutcomeFields)].sort() };
  } else {
    const observationId = input.outcome.observationId;
    const observation = observations.find((item) => item.observationId === observationId);
    if (!observation || observation.organizationId !== input.choice.organizationId || observation.questionId !== input.choice.canonicalReceiptSnapshot.questionId || observation.unknownId !== input.choice.canonicalReceiptSnapshot.unknownId || observation.proposalId !== input.choice.canonicalReceiptSnapshot.proposalId) throw new Error("Calibration canonical outcome observation is missing or cross-scoped.");
    outcome = { state: "canonical-observation", observationId: observation.observationId, observationVersion: observation.observationVersion, observationDigest: calibrationDigest(observation), snapshot: observation };
  }
  const unsigned = { artifactVersion: "1" as const, phase: "outcome-observed" as const, caseId: input.comparison.caseId, organizationId: input.comparison.organizationId, predecessorComparisonDigest: artifactDigest, canonicalChoiceReceiptDigest: input.choice.canonicalReceiptDigest, outcome, observedAt: input.observedAt };
  return { ...unsigned, artifactDigest: calibrationDigest(unsigned) };
}
