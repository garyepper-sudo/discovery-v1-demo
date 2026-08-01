import type { MaterialAcquisitionCandidateEnvelope } from "../contracts";
import { materialAcquisitionEnvelopeDigest } from "../../improvements/candidateEnvelope";
import type { CalibrationDraftManifest, CalibrationPreparationResult, CalibrationPreregistrationManifest } from "./contracts";
import { candidateSetDigest } from "./protocol";

export type PrepareCalibrationInput = Omit<CalibrationPreregistrationManifest, "phase" | "candidateEnvelopes" | "neutralDisplayOrder" | "candidateSetDigest" | "manifestDigest"> & {
  candidateEnvelopes: Array<{ envelope: MaterialAcquisitionCandidateEnvelope; candidateType: string; neutralDescription: string; limitations: string[] }>;
};
export function prepareCalibrationManifest(input: PrepareCalibrationInput, preparation: CalibrationPreparationResult): CalibrationDraftManifest {
  if (preparation.status === "ineligible" || preparation.status === "blocked") {
    throw new Error(`Calibration ${preparation.status} preparation cannot create a manifest.`);
  }
  if (preparation.manifestClassification !== input.proposedClassification) {
    throw new Error("Calibration preparation classification does not match the manifest classification.");
  }
  const candidateEnvelopes = input.candidateEnvelopes.map((item) => ({ ...item, digest: materialAcquisitionEnvelopeDigest(item.envelope) }));
  const neutralDisplayOrder = [...candidateEnvelopes]
    .sort((left, right) => left.envelope.candidate.actionType.localeCompare(right.envelope.candidate.actionType, "en")
      || left.envelope.candidate.candidateId.localeCompare(right.envelope.candidate.candidateId, "en"))
    .map((item) => item.envelope.candidate.candidateId);
  const unsigned = {
    ...input, phase: "draft" as const, candidateEnvelopes,
    neutralDisplayOrder,
    candidateSetDigest: candidateSetDigest({ candidateEnvelopes }),
  };
  return unsigned;
}
