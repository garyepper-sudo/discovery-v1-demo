import type { OrganizationalMechanism } from "../model/judgment/organizationalMechanism";
import type { MechanismPattern } from "./consolidateMechanismPatterns";

type ReinforcementResult = {
  reinforcedMechanisms: OrganizationalMechanism[];
  updatedPatterns: MechanismPattern[];
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function safeNumber(x: unknown, fallback = 0): number {
  return typeof x === "number" && !Number.isNaN(x) ? x : fallback;
}

function reinforcementBoost(frequency: number): number {
  // logarithmic scaling so repetition compounds but doesn't explode
  return Math.log(1 + frequency) * 0.08;
}

function patternStrengthScore(pattern: MechanismPattern): number {
  return clamp01(
    safeNumber(pattern.averageConfidence) * 0.5 +
      Math.min(1, pattern.frequency * 0.08) +
      Math.min(1, pattern.totalSeverity * 0.05),
  );
}

function reinforceMechanism(m: OrganizationalMechanism, pattern: MechanismPattern): OrganizationalMechanism {
  const boost = reinforcementBoost(pattern.frequency);
  const patternStrength = patternStrengthScore(pattern);

  const newConfidence = clamp01(
    safeNumber(m.confidence) + boost * 0.6 + patternStrength * 0.15,
  );

  const newSeverity = clamp01(
    typeof m.severity === "number"
      ? m.severity + patternStrength * 0.05
      : patternStrength * 0.1,
  );

  const newSupportCount =
    (m.supportCount ?? 0) + Math.min(2, pattern.frequency * 0.2);

  return {
    ...m,
    confidence: newConfidence,
    severity: newSeverity,
    supportCount: newSupportCount,
    stability:
      newConfidence > 0.75
        ? "reinforced"
        : newConfidence > 0.5
          ? "emerging"
          : m.stability,
  };
}

function matchPatternToMechanism(
  m: OrganizationalMechanism,
  patterns: MechanismPattern[],
): MechanismPattern | undefined {
  return patterns.find((p) => {
    return (
      p.mechanismType === m.type &&
      p.frequency >= 2 // key reinforcement threshold
    );
  });
}

export function reinforceMechanismFromPatterns(params: {
  mechanisms: OrganizationalMechanism[];
  patterns: MechanismPattern[];
}): ReinforcementResult {
  const { mechanisms, patterns } = params;

  const updatedPatterns = patterns.map((p) => ({
    ...p,
    averageConfidence: clamp01(
      p.averageConfidence + Math.min(0.03, p.frequency * 0.005),
    ),
  }));

  const reinforcedMechanisms = mechanisms.map((m) => {
    const pattern = matchPatternToMechanism(m, patterns);

    if (!pattern) return m;

    return reinforceMechanism(m, pattern);
  });

  return {
    reinforcedMechanisms,
    updatedPatterns,
  };
}