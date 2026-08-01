import type { CalibrationComparisonInput, CalibrationPreregistrationManifest, CalibrationValidationContext, HumanChoiceArtifact, HumanChoiceReloadVerification, SelectorComparisonArtifact } from "./contracts";
import { calibrationDigest, validatePreregistrationManifest } from "./protocol";
import { resolveCanonicalCalibrationChoice, type CalibrationReloadDependencies } from "./verifyHumanChoiceReload";
export async function compareCalibrationSelector(input: { manifest: CalibrationPreregistrationManifest; context: CalibrationValidationContext; choice: HumanChoiceArtifact; reload: HumanChoiceReloadVerification; selectorInput: CalibrationComparisonInput; userId: string; dependencies: CalibrationReloadDependencies; comparedAt: string }): Promise<SelectorComparisonArtifact> {
  validatePreregistrationManifest(input.manifest, input.context);
  const { artifactDigest: choiceDigest, ...choiceUnsigned } = input.choice;
  const { artifactDigest: reloadDigest, ...reloadUnsigned } = input.reload;
  if (input.choice.phase !== "human-choice-recorded" || calibrationDigest(choiceUnsigned) !== choiceDigest || input.reload.phase !== "human-choice-reloaded" || !input.reload.independentlyReloaded || input.reload.predecessorChoiceDigest !== choiceDigest || input.reload.canonicalReceiptDigest !== input.choice.canonicalReceiptDigest || input.reload.canonicalEventRef !== input.choice.canonicalEventRef || input.reload.canonicalOperationId !== input.choice.idempotencyIdentity || calibrationDigest(reloadUnsigned) !== reloadDigest) throw new Error("Calibration selector comparison requires persisted and independently reloaded canonical choice.");
  if (input.choice.organizationId !== input.manifest.organizationId || input.selectorInput.organizationId !== input.manifest.organizationId || input.selectorInput.questionId !== input.manifest.question.questionId || !Number.isFinite(Date.parse(input.comparedAt))) throw new Error("Calibration selector comparison scope is invalid.");
  if (input.selectorInput.understandingRevisionRef !== input.manifest.understandingRef || input.selectorInput.materialUncertainty.unknownId !== input.manifest.unknown.unknownId || input.selectorInput.materialUncertainty.unknownVersionRef !== input.manifest.unknown.revisionRef || calibrationDigest(input.selectorInput.candidates.map((candidate) => candidate.candidateId).sort()) !== calibrationDigest(input.manifest.candidateEnvelopes.map((item) => item.envelope.candidate.candidateId).sort()) || input.selectorInput.candidates.some((candidate) => {
    const frozen = input.manifest.candidateEnvelopes.find((item) => item.envelope.candidate.candidateId === candidate.candidateId);
    return !frozen || calibrationDigest(candidate) !== calibrationDigest(frozen.envelope.candidate) || !candidate.eligibility.authorizationSatisfied || !candidate.eligibility.governanceAllowed;
  })) throw new Error("Calibration selector input drifted from the frozen authorized candidate set.");
  const canonical = await resolveCanonicalCalibrationChoice({ manifest: input.manifest, context: input.context, choice: input.choice, userId: input.userId, dependencies: input.dependencies });
  if (canonical.receiptDigest !== input.reload.canonicalReceiptDigest) throw new Error("Calibration canonical receipt changed after reload verification.");
  const { selectMaterialInformationAcquisition } = await import("../shadow/selectMaterialInformationAcquisition");
  const selectorResult = selectMaterialInformationAcquisition(input.selectorInput);
  const unsigned = { artifactVersion: "1" as const, phase: "selector-compared" as const, caseId: input.manifest.caseId, organizationId: input.manifest.organizationId, predecessorReloadDigest: reloadDigest, selectorResult, runtimeWriteCount: 0 as const, comparedAt: input.comparedAt };
  return { ...unsigned, artifactDigest: calibrationDigest(unsigned) };
}
