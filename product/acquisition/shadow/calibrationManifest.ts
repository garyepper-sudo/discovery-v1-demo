import type { MaterialAcquisitionCalibrationManifest } from "./contracts";

export const MATERIAL_ACQUISITION_SHADOW_METRICS = [
  "unauthorized-candidate-false-positives",
  "governance-prohibited-false-positives",
  "cross-organization-leakage",
  "protected-source-access-before-authorization",
  "runtime-writes",
  "external-actions",
  "connector-calls",
  "selection-disposition",
  "tie-preservation",
  "stop-correctness",
  "abstention-correctness",
  "deterministic-replay",
  "input-order-stability",
  "exact-revision-use",
  "stale-context-handling",
  "comparator-agreement",
  "outcome-utility-observed",
] as const;

export const MATERIAL_ACQUISITION_SHADOW_THRESHOLDS = {
  unauthorizedCandidateFalsePositives: 0,
  governanceProhibitedFalsePositives: 0,
  crossOrganizationLeakage: 0,
  protectedSourceReadsBeforeAuthorization: 0,
  runtimeWrites: 0,
  externalActions: 0,
  connectorCalls: 0,
  deterministicReplay: 1,
  inputOrderStability: 1,
  exactRevisionUse: 1,
} as const;

export function preregisterMaterialAcquisitionCalibration(
  cases: MaterialAcquisitionCalibrationManifest["cases"],
): MaterialAcquisitionCalibrationManifest {
  return {
    manifestVersion: "1",
    registeredBeforeSelection: true,
    cases: cases.map((item) => ({ ...item, candidateIds: [...item.candidateIds].sort(), missingOutcomeData: [...item.missingOutcomeData].sort() })),
    metrics: [...MATERIAL_ACQUISITION_SHADOW_METRICS],
    promotionThresholds: { ...MATERIAL_ACQUISITION_SHADOW_THRESHOLDS },
  };
}
