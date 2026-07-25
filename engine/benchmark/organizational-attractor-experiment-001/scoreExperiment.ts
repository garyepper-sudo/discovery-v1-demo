import type {
  AttractorPhase,
  ExperimentScore,
  InferenceResult,
  ModelPrediction,
  ObservedState,
  PredictionModelId,
  SyntheticOrganization,
} from "./types";

type ScoreInput = {
  organization: SyntheticOrganization;
  baseline: InferenceResult;
  perturbation: InferenceResult;
  restorationA: InferenceResult;
  restorationB: InferenceResult;
  predictions: ModelPrediction[];
  negativeControls: Array<{
    organizationId: string;
    inference: InferenceResult;
  }>;
  deterministic: boolean;
};

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function accuracy(
  predictions: ModelPrediction[],
  model: PredictionModelId,
  expectedA: Record<string, ObservedState>,
  expectedB: Record<string, ObservedState>,
): number {
  const selected = predictions.filter((item) => item.model === model);
  const results = selected.flatMap((item) =>
    item.predictions.map((prediction) => {
      const expected =
        item.branch === "restoration-a" ? expectedA : expectedB;
      return prediction.state === expected[prediction.horizon];
    }),
  );
  return results.length === 0
    ? 0
    : round(results.filter(Boolean).length / results.length);
}

function includesDistributedEvidence(
  phase: AttractorPhase,
  inference: InferenceResult,
): boolean {
  if (!inference.candidate) return false;
  const cited = phase.evidence.filter((item) =>
    inference.candidate?.supportingEvidenceIds.includes(item.id),
  );
  return (
    new Set(cited.map((item) => item.sourceId)).size >= 3 &&
    new Set(cited.map((item) => item.sourceType)).size >= 3 &&
    !cited.some((item) =>
      /organization (wants|seeks|has an attractor)|centralized control/i.test(
        item.observation,
      ),
    )
  );
}

export function scoreExperiment(input: ScoreInput): ExperimentScore {
  const baselineCandidate = input.baseline.candidate;
  const perturbationCandidate = input.perturbation.candidate;
  const falsePositives = input.negativeControls
    .filter((item) => item.inference.candidate !== null)
    .map((item) => item.organizationId);

  const modelAccuracy: Record<PredictionModelId, number> = {
    "organizational-state": accuracy(
      input.predictions,
      "organizational-state",
      input.organization.expected.restorationA,
      input.organization.expected.restorationB,
    ),
    mechanisms: accuracy(
      input.predictions,
      "mechanisms",
      input.organization.expected.restorationA,
      input.organization.expected.restorationB,
    ),
    "candidate-attractor": accuracy(
      input.predictions,
      "candidate-attractor",
      input.organization.expected.restorationA,
      input.organization.expected.restorationB,
    ),
  };

  const distributedEmergence =
    baselineCandidate?.targetState === "centralized-decision-control" &&
    includesDistributedEvidence(
      input.organization.phases[0],
      input.baseline,
    );
  const mechanisticGrounding =
    (baselineCandidate?.restoringMechanisms.length ?? 0) >= 3 &&
    baselineCandidate?.restoringMechanisms.every(
      (item) => item.evidenceIds.length > 0 && item.contribution > 0,
    ) === true;
  const persistence =
    perturbationCandidate?.targetState === baselineCandidate?.targetState &&
    input.restorationA.candidate?.targetState ===
      "centralized-decision-control" &&
    modelAccuracy["candidate-attractor"] === 1;
  const interventionSensitive =
    baselineCandidate !== null &&
    perturbationCandidate !== null &&
    perturbationCandidate.persistenceConfidence <
      baselineCandidate.persistenceConfidence &&
    (input.restorationB.candidate === null ||
      input.restorationB.candidate.targetState !==
        baselineCandidate.targetState);
  const falsifiable =
    (baselineCandidate?.falsificationCriteria.length ?? 0) >= 3 &&
    baselineCandidate?.falsificationCriteria.every(
      (criterion) => criterion.trim().length > 0,
    ) === true;
  const counterEvidenceIntegrated =
    (baselineCandidate?.opposingEvidenceIds.length ?? 0) > 0 &&
    (perturbationCandidate?.opposingEvidenceIds.length ?? 0) >
      (baselineCandidate?.opposingEvidenceIds.length ?? 0) &&
    perturbationCandidate!.persistenceConfidence <
      baselineCandidate!.persistenceConfidence;
  const incrementalPredictionValue =
    modelAccuracy["candidate-attractor"] >
      modelAccuracy["organizational-state"] &&
    modelAccuracy["candidate-attractor"] > modelAccuracy.mechanisms;

  const dimensions = {
    emergence: {
      earned: distributedEmergence ? 15 : 0,
      possible: 15,
      rationale: distributedEmergence
        ? "The candidate uses independent, heterogeneous observations and is not copied from one statement."
        : "The candidate was absent, explicit in one source, or insufficiently distributed.",
    },
    mechanisticGrounding: {
      earned: mechanisticGrounding ? 15 : 0,
      possible: 15,
      rationale: mechanisticGrounding
        ? "At least three restoring mechanisms retain exact supporting Evidence identities."
        : "The candidate lacks diverse, identity-bearing restoring mechanisms.",
    },
    persistence: {
      earned: persistence ? 15 : 0,
      possible: 15,
      rationale: persistence
        ? "The model distinguishes short-term decentralization from restoration when structures remain."
        : "The model confuses temporary state with durable direction.",
    },
    interventionSensitivity: {
      earned: interventionSensitive ? 15 : 0,
      possible: 15,
      rationale: interventionSensitive
        ? "Behavioral perturbation reduces confidence while structural change removes or reverses the candidate."
        : "The candidate is rigid under intervention or disappears after temporary behavior.",
    },
    predictionQuality: {
      earned: incrementalPredictionValue
        ? Math.round(modelAccuracy["candidate-attractor"] * 20)
        : 0,
      possible: 20,
      rationale: `Trajectory accuracy — State: ${modelAccuracy["organizational-state"]}, Mechanisms: ${modelAccuracy.mechanisms}, Attractor: ${modelAccuracy["candidate-attractor"]}.`,
    },
    falsifiability: {
      earned: falsifiable ? 10 : 0,
      possible: 10,
      rationale: falsifiable
        ? "The candidate names three observable structural conditions that would falsify it."
        : "Falsification criteria are absent or not observable.",
    },
    counterEvidenceIntegration: {
      earned: counterEvidenceIntegrated ? 5 : 0,
      possible: 5,
      rationale: counterEvidenceIntegrated
        ? "Opposing intervention Evidence is retained and lowers persistence confidence."
        : "Opposing Evidence does not affect confidence appropriately.",
    },
    determinism: {
      earned: input.deterministic ? 5 : 0,
      possible: 5,
      rationale: input.deterministic
        ? "Repeated and reversed-order executions are byte-equal."
        : "Output changes across repeated or reversed-order execution.",
    },
  };

  const rawScore = Object.values(dimensions).reduce(
    (sum, item) => sum + item.earned,
    0,
  );
  const falsePositivePenalty = falsePositives.length * 30;
  const overallScore = Math.max(0, rawScore - falsePositivePenalty);
  const hardGates = {
    distributedEmergence,
    negativeControls: falsePositives.length === 0,
    incrementalPredictionValue,
    falsifiable,
    deterministic: input.deterministic,
    interventionSensitive,
  };

  return {
    dimensions,
    rawScore,
    falsePositivePenalty,
    overallScore,
    negativeControlFalsePositives: falsePositives,
    modelAccuracy,
    hardGates,
    passed: Object.values(hardGates).every(Boolean),
  };
}
