export function calibrateUnderstandingConfidence(params: {
  evidenceCount: number;
  investigationCount: number;
  contradictionCount: number;
  supportingDynamicsCount: number;
  existingConfidence?: number;
}): number {
  const {
    evidenceCount,
    investigationCount,
    contradictionCount,
    supportingDynamicsCount,
    existingConfidence = 0.55,
  } = params;

  const evidenceSupport = Math.min(0.22, evidenceCount * 0.025);
  const investigationSupport = Math.min(0.14, investigationCount * 0.045);
  const dynamicsSupport = Math.min(0.1, supportingDynamicsCount * 0.035);
  const contradictionPenalty = Math.min(0.25, contradictionCount * 0.08);

  const calibrated =
    existingConfidence * 0.45 +
    0.42 +
    evidenceSupport +
    investigationSupport +
    dynamicsSupport -
    contradictionPenalty;

  return Math.max(0.35, Math.min(0.94, Number(calibrated.toFixed(2))));
}

export function deriveUnderstandingStrength(confidence: number): number {
  return Math.max(0.25, Math.min(0.95, Number((confidence * 0.92).toFixed(2))));
}

export function deriveUnderstandingStability(params: {
  investigationCount: number;
  evidenceCount: number;
  contradictionCount: number;
}): number {
  const stability =
    0.38 +
    Math.min(0.24, params.investigationCount * 0.08) +
    Math.min(0.24, params.evidenceCount * 0.025) -
    Math.min(0.22, params.contradictionCount * 0.07);

  return Math.max(0.25, Math.min(0.93, Number(stability.toFixed(2))));
}