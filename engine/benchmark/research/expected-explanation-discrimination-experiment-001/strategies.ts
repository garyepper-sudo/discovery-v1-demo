import type {
  AcquisitionStrategy,
  DiscriminationScenario,
  EvidenceCandidate,
  ExplanationId,
} from "./types";

function pairwiseDiscrimination(
  candidate: EvidenceCandidate,
  viable: ExplanationId[],
): number {
  let pairs = 0;
  let separated = 0;
  for (let left = 0; left < viable.length; left += 1) {
    for (let right = left + 1; right < viable.length; right += 1) {
      pairs += 1;
      const leftOutcome = candidate.predictedOutcomes[viable[left]];
      const rightOutcome = candidate.predictedOutcomes[viable[right]];
      if (
        leftOutcome !== undefined &&
        rightOutcome !== undefined &&
        leftOutcome !== rightOutcome
      ) {
        separated += 1;
      }
    }
  }
  return pairs === 0 ? 0 : separated / pairs;
}

export function scoreEvidenceCandidate(
  strategy: AcquisitionStrategy,
  candidate: EvidenceCandidate,
  viable: ExplanationId[],
): number {
  if (!candidate.admissible) return Number.NEGATIVE_INFINITY;
  if (strategy === "highest-confidence-gain") {
    return candidate.confidenceGain / candidate.effort;
  }
  if (strategy === "highest-understanding-gain") {
    return (
      (candidate.understandingGain * 0.7 +
        candidate.decisionRelevance * 0.3) /
      candidate.effort
    );
  }
  return pairwiseDiscrimination(candidate, viable) / candidate.effort;
}

export function selectEvidenceCandidate(
  strategy: AcquisitionStrategy,
  scenario: DiscriminationScenario,
  viable: ExplanationId[],
  acquired: Set<string>,
): { candidate: EvidenceCandidate; score: number } | null {
  const ranked = scenario.evidenceCandidates
    .filter((candidate) => !acquired.has(candidate.id))
    .map((candidate) => ({
      candidate,
      score: scoreEvidenceCandidate(strategy, candidate, viable),
    }))
    .filter((item) => Number.isFinite(item.score))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.id.localeCompare(right.candidate.id),
    );
  return ranked[0] ?? null;
}
