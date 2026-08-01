import type { CalibrationDraftManifest, CalibrationPreregistrationManifest, CalibrationValidationContext } from "./contracts";
import { manifestDigest, validatePreregistrationManifest } from "./protocol";
export function verifyCalibrationPreregistration(draft: CalibrationDraftManifest, context: CalibrationValidationContext): { manifest: CalibrationPreregistrationManifest; confirmation: "Calibration Case is frozen and preregistered" } {
  const { phase: _draftPhase, ...draftFields } = draft;
  const unsigned = { ...draftFields, phase: "preregistered" as const };
  const manifest = { ...unsigned, manifestDigest: manifestDigest(unsigned) };
  validatePreregistrationManifest(manifest, context);
  return { manifest, confirmation: "Calibration Case is frozen and preregistered" };
}
