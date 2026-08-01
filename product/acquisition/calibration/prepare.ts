import type { MaterialAcquisitionCandidateEnvelope } from "../contracts";
import { materialAcquisitionEnvelopeDigest } from "../../improvements/candidateEnvelope";
import type { CalibrationDraftManifest, CalibrationPreregistrationManifest } from "./contracts";
import { candidateSetDigest } from "./protocol";

export type PrepareCalibrationInput = Omit<CalibrationPreregistrationManifest, "phase" | "candidateEnvelopes" | "neutralDisplayOrder" | "candidateSetDigest" | "manifestDigest"> & {
  candidateEnvelopes: Array<{ envelope: MaterialAcquisitionCandidateEnvelope; candidateType: string; neutralDescription: string; limitations: string[] }>;
};
export function prepareCalibrationManifest(input: PrepareCalibrationInput): CalibrationDraftManifest {
  const candidateEnvelopes = input.candidateEnvelopes.map((item) => ({ ...item, digest: materialAcquisitionEnvelopeDigest(item.envelope) }));
  const unsigned = {
    ...input, phase: "draft" as const, candidateEnvelopes,
    neutralDisplayOrder: candidateEnvelopes.map((item) => item.envelope.candidate.candidateId).sort((a, b) => a.localeCompare(b, "en")),
    candidateSetDigest: candidateSetDigest({ candidateEnvelopes }),
  };
  return unsigned;
}
