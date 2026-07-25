import type {
  AttractorEvidence,
  CandidateOrganizationalAttractor,
  Horizon,
  ModelPrediction,
  ObservedState,
  PredictionModelId,
} from "./types";

const horizons: Horizon[] = ["short", "medium", "long"];
const contribution = (item: AttractorEvidence) =>
  item.strength * (item.structural ? 1 : 0.55);

function repeat(
  model: PredictionModelId,
  branch: ModelPrediction["branch"],
  state: ObservedState,
  evidenceIds: string[],
  confidence: number,
): ModelPrediction {
  return {
    model,
    branch,
    predictions: horizons.map((horizon) => ({
      horizon,
      state,
      confidence,
      basisEvidenceIds: [...evidenceIds].sort(),
    })),
  };
}

export function predictFromState(
  branch: ModelPrediction["branch"],
  currentState: ObservedState,
  currentEvidence: AttractorEvidence[],
): ModelPrediction {
  return repeat(
    "organizational-state",
    branch,
    currentState,
    currentEvidence.map((item) => item.id),
    0.62,
  );
}

export function predictFromMechanisms(
  branch: ModelPrediction["branch"],
  evidence: AttractorEvidence[],
): ModelPrediction {
  const latestPeriod = evidence.some((item) => item.period === "restoration")
    ? "restoration"
    : evidence.some((item) => item.period === "perturbation")
      ? "perturbation"
      : "baseline";
  const relevant = evidence.filter((item) => item.period === latestPeriod);
  const centralizing = relevant
    .filter((item) => item.direction === "centralizing")
    .reduce((sum, item) => sum + contribution(item), 0);
  const decentralizing = relevant
    .filter((item) => item.direction === "decentralizing")
    .reduce((sum, item) => sum + contribution(item), 0);
  const state: ObservedState =
    Math.abs(centralizing - decentralizing) < 0.25
      ? "mixed"
      : centralizing > decentralizing
        ? "centralized"
        : "decentralized";

  return repeat(
    "mechanisms",
    branch,
    state,
    relevant.map((item) => item.id),
    0.68,
  );
}

export function predictFromAttractor(
  branch: ModelPrediction["branch"],
  candidate: CandidateOrganizationalAttractor | null,
  restorationEvidence: AttractorEvidence[],
): ModelPrediction {
  if (!candidate) {
    return repeat(
      "candidate-attractor",
      branch,
      "mixed",
      restorationEvidence.map((item) => item.id),
      0.35,
    );
  }

  const structuralOpposition = restorationEvidence.filter((item) => {
    const candidateDirection =
      candidate.targetState === "centralized-decision-control"
        ? "centralizing"
        : "decentralizing";
    return item.structural && item.direction !== candidateDirection;
  });

  if (structuralOpposition.length >= 3) {
    const changedState: ObservedState =
      candidate.targetState === "centralized-decision-control"
        ? "decentralized"
        : "centralized";
    return repeat(
      "candidate-attractor",
      branch,
      changedState,
      structuralOpposition.map((item) => item.id),
      0.82,
    );
  }

  return {
    model: "candidate-attractor",
    branch,
    predictions: [
      {
        horizon: "short",
        state: "decentralized",
        confidence: 0.7,
        basisEvidenceIds: restorationEvidence.map((item) => item.id).sort(),
      },
      {
        horizon: "medium",
        state: "mixed",
        confidence: 0.72,
        basisEvidenceIds: candidate.supportingEvidenceIds,
      },
      {
        horizon: "long",
        state:
          candidate.targetState === "centralized-decision-control"
            ? "centralized"
            : "decentralized",
        confidence: candidate.persistenceConfidence,
        basisEvidenceIds: candidate.supportingEvidenceIds,
      },
    ],
  };
}
