import type { PersistentBelief } from "../understanding/types";

export type MechanismPattern = {
  id: string;
  name: string;
  mechanismType: string;

  frequency: number;
  averageConfidence: number;

  totalSeverity: number;

  supportingMechanismIds: string[];

  dominantScope: string;
};

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function reinforcePatternsFromBeliefs(params: {
  beliefs: PersistentBelief[];
  patterns: MechanismPattern[];
}): MechanismPattern[] {
  const updatedPatterns = [...params.patterns];

  for (const belief of params.beliefs) {
    const beliefMechanisms = (belief as any).mechanismIds ?? [];

    for (const pattern of updatedPatterns) {
      const overlap = beliefMechanisms.some((id: string) =>
        pattern.supportingMechanismIds.includes(id),
      );

      if (!overlap) continue;

      pattern.frequency += 1;

      pattern.averageConfidence = clamp01(
        average([pattern.averageConfidence, belief.confidence ?? 0.5]),
      );

      pattern.totalSeverity += 1;
    }
  }

  return updatedPatterns;
}