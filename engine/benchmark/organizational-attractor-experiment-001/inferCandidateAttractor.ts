import { createHash } from "node:crypto";

import type {
  AttractorEvidence,
  AttractorPhase,
  CandidateOrganizationalAttractor,
  Direction,
  InferenceResult,
  ObservedState,
  TrajectoryPrediction,
} from "./types";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;
const unique = <T>(values: T[]) => [...new Set(values)];

function contribution(item: AttractorEvidence): number {
  return item.strength * (item.structural ? 1 : 0.55);
}

function stableId(direction: Direction, ids: string[]): string {
  const digest = createHash("sha256")
    .update(`${direction}:${[...ids].sort().join("|")}`)
    .digest("hex")
    .slice(0, 12);
  return `candidate-attractor:${direction}:${digest}`;
}

function stateFor(direction: Direction): ObservedState {
  return direction === "centralizing" ? "centralized" : "decentralized";
}

function predictedTrajectory(
  direction: Direction,
  confidence: number,
  basisEvidenceIds: string[],
): TrajectoryPrediction[] {
  const target = stateFor(direction);
  return [
    {
      horizon: "short",
      state: "mixed",
      confidence: round(confidence * 0.72),
      basisEvidenceIds,
    },
    {
      horizon: "medium",
      state: target,
      confidence: round(confidence * 0.86),
      basisEvidenceIds,
    },
    {
      horizon: "long",
      state: target,
      confidence,
      basisEvidenceIds,
    },
  ];
}

export function inferCandidateAttractor(
  phases: AttractorPhase[],
): InferenceResult {
  const evidence = phases
    .flatMap((item) => item.evidence)
    .sort((a, b) => a.id.localeCompare(b.id));

  const currentPeriod =
    evidence.some((item) => item.period === "restoration")
      ? "restoration"
      : evidence.some((item) => item.period === "perturbation")
        ? "perturbation"
        : "baseline";

  const currentEvidence =
    currentPeriod === "baseline"
      ? evidence
      : evidence.filter(
          (item) =>
            item.period === currentPeriod ||
            item.period === "historical" ||
            item.period === "baseline",
        );

  const weights = new Map<Direction, number>([
    ["centralizing", 0],
    ["decentralizing", 0],
  ]);

  for (const item of currentEvidence) {
    const recencyMultiplier =
      item.period === "restoration"
        ? 1.35
        : item.period === "perturbation"
          ? 0.8
          : 1;
    weights.set(
      item.direction,
      (weights.get(item.direction) ?? 0) +
        contribution(item) * recencyMultiplier,
    );
  }

  const centralizing = weights.get("centralizing") ?? 0;
  const decentralizing = weights.get("decentralizing") ?? 0;
  const total = centralizing + decentralizing;
  const direction: Direction =
    centralizing >= decentralizing ? "centralizing" : "decentralizing";
  const supporting = currentEvidence.filter(
    (item) => item.direction === direction,
  );
  const opposing = currentEvidence.filter(
    (item) => item.direction !== direction,
  );
  const supportingWeight = weights.get(direction) ?? 0;
  const opposingWeight =
    weights.get(direction === "centralizing" ? "decentralizing" : "centralizing") ??
    0;
  const directionalBalance =
    total === 0 ? 0 : (supportingWeight - opposingWeight) / total;
  const independentSourceCount = unique(
    supporting.map((item) => item.sourceId),
  ).length;
  const supportingMechanismCount = unique(
    supporting.map((item) => item.mechanism),
  ).length;
  const supportingPeriods = unique(
    supporting.map((item) => item.period),
  ).length;
  const structuralSupport = supporting.filter((item) => item.structural).length;

  const trace = {
    independentSourceCount,
    supportingMechanismCount,
    supportingPeriods,
    structuralSupport,
    directionalBalance: round(directionalBalance),
    supportingWeight: round(supportingWeight),
    opposingWeight: round(opposingWeight),
  };

  if (independentSourceCount < 3) {
    return {
      candidate: null,
      abstentionReason: "Fewer than three independent supporting sources.",
      trace,
    };
  }
  if (supportingMechanismCount < 2) {
    return {
      candidate: null,
      abstentionReason: "Support does not span multiple restoring mechanisms.",
      trace,
    };
  }
  if (supportingPeriods < 2) {
    return {
      candidate: null,
      abstentionReason: "The tendency is not observed across multiple periods.",
      trace,
    };
  }
  if (structuralSupport < 2) {
    return {
      candidate: null,
      abstentionReason: "The tendency lacks independent structural support.",
      trace,
    };
  }
  if (directionalBalance < 0.28) {
    return {
      candidate: null,
      abstentionReason: "Directional evidence remains contradictory or balanced.",
      trace,
    };
  }

  const persistenceConfidence = round(
    Math.min(
      0.95,
      0.34 +
        directionalBalance * 0.32 +
        Math.min(independentSourceCount, 6) * 0.035 +
        Math.min(structuralSupport, 4) * 0.045,
    ),
  );
  const supportingEvidenceIds = supporting.map((item) => item.id).sort();
  const opposingEvidenceIds = opposing.map((item) => item.id).sort();
  const grouped = new Map<
    AttractorEvidence["mechanism"],
    AttractorEvidence[]
  >();
  for (const item of supporting) {
    grouped.set(item.mechanism, [...(grouped.get(item.mechanism) ?? []), item]);
  }

  const candidate: CandidateOrganizationalAttractor = {
    id: stableId(direction, supportingEvidenceIds),
    targetState:
      direction === "centralizing"
        ? "centralized-decision-control"
        : "distributed-decision-control",
    restoringMechanisms: [...grouped.entries()]
      .map(([mechanism, items]) => ({
        mechanism,
        evidenceIds: items.map((item) => item.id).sort(),
        contribution: round(
          items.reduce((sum, item) => sum + contribution(item), 0),
        ),
      }))
      .sort(
        (a, b) =>
          b.contribution - a.contribution ||
          a.mechanism.localeCompare(b.mechanism),
      ),
    activatingConditions: unique(
      supporting.map((item) => item.condition),
    ).sort(),
    weakeningConditions: unique(
      opposing.map((item) => item.condition),
    ).sort(),
    supportingEvidenceIds,
    opposingEvidenceIds,
    predictedTrajectory: predictedTrajectory(
      direction,
      persistenceConfidence,
      supportingEvidenceIds,
    ),
    persistenceConfidence,
    falsificationCriteria:
      direction === "centralizing"
        ? [
            "Decision information remains distributed across multiple consequential trade-offs.",
            "Executives consistently decline to override contested local decisions.",
            "Incentives reward learning from reversible local mistakes.",
          ]
        : [
            "Decision information becomes concentrated among executives.",
            "Executives repeatedly override contested local decisions.",
            "Incentives penalize visible local mistakes more than escalation delay.",
          ],
  };

  return { candidate, abstentionReason: null, trace };
}
