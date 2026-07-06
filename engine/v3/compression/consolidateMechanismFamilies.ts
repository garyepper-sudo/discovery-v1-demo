import type { MechanismPattern } from "./consolidateMechanismPatterns";

export type MechanismFamily = {
  id: string;
  name: string;

  memberPatternIds: string[];

  dominantMechanismTypes: string[];
  dominantCapabilities: string[];

  frequency: number;

  averageConfidence: number;

  compressionScore: number;
};

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function similarity(a: MechanismPattern, b: MechanismPattern): number {
  let score = 0;

  // type similarity
  if (a.mechanismType === b.mechanismType) score += 0.4;

  // capability overlap
  const overlap = a.dominantCapabilities.filter((x) =>
    b.dominantCapabilities.includes(x)
  ).length;

  score += Math.min(0.4, overlap * 0.15);

  // scope similarity
  if (a.dominantScope === b.dominantScope) score += 0.2;

  return clamp01(score);
}

function deriveFamilyName(patterns: MechanismPattern[]): string {
  const typeCounts: Record<string, number> = {};

  for (const p of patterns) {
    typeCounts[p.mechanismType] =
      (typeCounts[p.mechanismType] ?? 0) + 1;
  }

  const dominantType = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  if (!dominantType) return "Organizational System Pattern";

  // semantic grouping
  if (
    dominantType === "coordinationBreakdown" ||
    dominantType === "decisionLatency" ||
    dominantType === "governanceFriction"
  ) {
    return "Coordination Overhead System";
  }

  if (
    dominantType === "knowledgeFragmentation" ||
    dominantType === "weakKnowledgeTransfer" ||
    dominantType === "institutionalMemoryLoss"
  ) {
    return "Organizational Knowledge Decay System";
  }

  if (
    dominantType === "duplicatedKnowledgeWork" ||
    dominantType === "executionDrag"
  ) {
    return "Execution Inefficiency System";
  }

  return `${dominantType} System Pattern`;
}

function clusterPatterns(patterns: MechanismPattern[]): MechanismPattern[][] {
  const clusters: MechanismPattern[][] = [];
  const threshold = 0.45;

  for (const p of patterns) {
    let bestIndex = -1;
    let bestScore = 0;

    clusters.forEach((c, i) => {
      const score =
        c.reduce((acc, x) => acc + similarity(p, x), 0) / c.length;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    if (bestIndex >= 0 && bestScore >= threshold) {
      clusters[bestIndex].push(p);
    } else {
      clusters.push([p]);
    }
  }

  return clusters;
}

export function consolidateMechanismFamilies(
  patterns: MechanismPattern[],
): MechanismFamily[] {
  const clusters = clusterPatterns(patterns);

  return clusters
    .filter((c) => c.length > 1)
    .map((cluster, index) => {
      const memberPatternIds = cluster.map((p) => p.id);

      const dominantMechanismTypes = Array.from(
        new Set(cluster.map((p) => p.mechanismType)),
      );

      const dominantCapabilities = Array.from(
        new Set(cluster.flatMap((p) => p.dominantCapabilities)),
      ).slice(0, 8);

      const frequency = cluster.reduce((a, b) => a + b.frequency, 0);

      const averageConfidence = average(
        cluster.map((p) => p.averageConfidence),
      );

      const compressionScore = clamp01(
        average(
          cluster.map(
            (p) =>
              p.reinforcementWeight * 0.5 +
              p.averageConfidence * 0.3 +
              Math.min(0.2, p.frequency * 0.05),
          ),
        ),
      );

      return {
        id: `family-${index + 1}`,
        name: deriveFamilyName(cluster),

        memberPatternIds,

        dominantMechanismTypes,
        dominantCapabilities,

        frequency,
        averageConfidence: clamp01(averageConfidence),

        compressionScore,
      };
    });
}