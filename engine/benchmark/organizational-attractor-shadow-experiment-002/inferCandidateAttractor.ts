import { createHash } from "node:crypto";

import type {
  CandidateOrganizationalAttractor,
  InferenceScenario,
  MechanismArtifact,
  ProductionDerivedSnapshot,
} from "./types";

export type Ablation =
  | "none"
  | "no-history"
  | "no-contradictions"
  | "no-weakening"
  | "no-falsification"
  | "no-mechanism-confidence"
  | "latest-state-only";

export type CanonicalForecast = {
  conditionId?: string;
  confidence: number;
  trigger: string;
  supportingArtifactIds: string[];
  falsificationCondition: string;
  abstentionReason?: string;
  temporalSupport: Array<{
    beforeStateId: string;
    perturbationEvidenceIds: string[];
    afterStateId: string;
    restorationObserved: boolean;
  }>;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const unique = <T>(items: T[]) => [...new Set(items)];
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function mechanismSupportsCondition(
  mechanism: MechanismArtifact,
  conditionId: string,
): boolean {
  const conditionWords = normalize(conditionId.replace(/^condition-/, ""))
    .split(" ")
    .filter((word) => word.length > 3);
  const effect = normalize(mechanism.effect);
  return conditionWords.every((word) => effect.includes(word));
}

function activeMechanisms(
  snapshots: ProductionDerivedSnapshot[],
  conditionId: string,
): MechanismArtifact[] {
  const latest = snapshots[snapshots.length - 1];
  return latest.mechanisms
    .filter((item) => mechanismSupportsCondition(item, conditionId))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function deriveCanonicalForecast(
  scenario: InferenceScenario,
  ablation: Ablation = "none",
): CanonicalForecast {
  const ordered = [...scenario.inferenceWindow].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt),
  );
  const snapshots =
    ablation === "no-history" || ablation === "latest-state-only"
      ? ordered.slice(-1)
      : ordered;
  const latest = snapshots[snapshots.length - 1];
  const latestConditions = [...latest.state.dominantConditions].sort();

  if (latestConditions.length !== 1 && ablation === "latest-state-only") {
    return {
      confidence: 0.3,
      trigger: "",
      supportingArtifactIds: [latest.state.id],
      falsificationCondition: "",
      abstentionReason: "Latest Organizational State is not directionally singular.",
      temporalSupport: [],
    };
  }

  const conditionIds = unique(
    snapshots.flatMap((item) => item.state.dominantConditions),
  ).sort();
  const ranked = conditionIds
    .map((conditionId) => {
      const occurrences = snapshots
        .map((item, index) => ({
          index,
          snapshot: item,
          present: item.state.dominantConditions.includes(conditionId),
        }))
        .filter((item) => item.present);
      const mechanisms = activeMechanisms(snapshots, conditionId);
      const meanMechanismConfidence =
        mechanisms.length === 0
          ? 0
          : mechanisms.reduce(
              (sum, item) =>
                sum +
                (ablation === "no-mechanism-confidence"
                  ? 0.5
                  : item.confidence * item.stability),
              0,
            ) / mechanisms.length;
      const restored = occurrences.some((item, index) => {
        const previous = occurrences[index - 1];
        return previous && item.index - previous.index > 1;
      });
      const sustainedLatest =
        occurrences.length >= 2 &&
        occurrences.at(-1)?.index === snapshots.length - 1 &&
        occurrences.at(-2)?.index === snapshots.length - 2;
      const latestPresent = latest.state.dominantConditions.includes(conditionId);
      const contradictionCount =
        ablation === "no-contradictions"
          ? 0
          : latest.contradictions.length;
      const score =
        occurrences.length * 0.16 +
        mechanisms.length * 0.13 +
        meanMechanismConfidence * 0.24 +
        (restored ? 0.22 : 0) +
        (sustainedLatest ? 0.12 : 0) +
        (latestPresent ? 0.06 : 0) -
        contradictionCount * 0.08;
      return {
        conditionId,
        occurrences,
        mechanisms,
        restored,
        sustainedLatest,
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.conditionId.localeCompare(b.conditionId),
    );

  const leader = ranked[0];
  const runnerUp = ranked[1];
  if (!leader) {
    return {
      confidence: 0.25,
      trigger: "",
      supportingArtifactIds: [latest.state.id],
      falsificationCondition: "",
      abstentionReason: "No recurring Organizational Condition is available.",
      temporalSupport: [],
    };
  }
  if (leader.mechanisms.length < 2) {
    return {
      confidence: 0.35,
      trigger: "",
      supportingArtifactIds: leader.occurrences.map(
        (item) => item.snapshot.state.id,
      ),
      falsificationCondition: "",
      abstentionReason:
        "A recurring state lacks multiple supported restoring mechanisms.",
      temporalSupport: [],
    };
  }
  if (snapshots.length < 2 || leader.occurrences.length < 2) {
    return {
      confidence: 0.4,
      trigger: "",
      supportingArtifactIds: leader.mechanisms.map((item) => item.id),
      falsificationCondition: "",
      abstentionReason:
        "Strong mechanisms exist without sufficient temporal persistence.",
      temporalSupport: [],
    };
  }
  if (runnerUp && leader.score - runnerUp.score < 0.18) {
    return {
      confidence: 0.42,
      trigger: "",
      supportingArtifactIds: [
        ...leader.mechanisms.map((item) => item.id),
        ...runnerUp.mechanisms.map((item) => item.id),
      ].sort(),
      falsificationCondition: "",
      abstentionReason:
        "Competing directional tendencies cannot be resolved from canonical artifacts.",
      temporalSupport: [],
    };
  }
  if (!leader.restored && !leader.sustainedLatest) {
    return {
      confidence: 0.44,
      trigger: "",
      supportingArtifactIds: leader.mechanisms.map((item) => item.id),
      falsificationCondition: "",
      abstentionReason:
        "No restoration or sustained transition is present in history.",
      temporalSupport: [],
    };
  }

  const temporalSupport = leader.occurrences.slice(1).map((item, index) => {
    const previous = leader.occurrences[index];
    const between = snapshots.slice(previous.index + 1, item.index);
    return {
      beforeStateId: previous.snapshot.state.id,
      perturbationEvidenceIds: between.flatMap((entry) => entry.evidenceIds).sort(),
      afterStateId: item.snapshot.state.id,
      restorationObserved: item.index - previous.index > 1,
    };
  });
  const confidence = round(Math.min(0.9, 0.48 + leader.score * 0.28));
  const trigger = leader.mechanisms
    .map((item) => item.cause)
    .sort()
    .join(" AND ");
  const falsificationCondition =
    `The supported mechanisms (${leader.mechanisms
      .map((item) => item.id)
      .sort()
      .join(", ")}) remain inactive across the next consequential transition.`;

  return {
    conditionId: leader.conditionId,
    confidence,
    trigger,
    supportingArtifactIds: [
      ...leader.mechanisms.map((item) => item.id),
      ...leader.occurrences.map((item) => item.snapshot.state.id),
    ].sort(),
    falsificationCondition,
    temporalSupport,
  };
}

export function inferCandidateAttractor(
  scenario: InferenceScenario,
  ablation: Ablation = "none",
): CandidateOrganizationalAttractor | null {
  const forecast = deriveCanonicalForecast(scenario, ablation);
  if (!forecast.conditionId) return null;
  const snapshots = [...scenario.inferenceWindow].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt),
  );
  const latest = snapshots.at(-1)!;
  const mechanisms = activeMechanisms(snapshots, forecast.conditionId);
  const digest = createHash("sha256")
    .update(
      `${scenario.id}:${forecast.conditionId}:${forecast.supportingArtifactIds.join("|")}`,
    )
    .digest("hex")
    .slice(0, 12);
  const weakening =
    ablation === "no-weakening"
      ? []
      : [...latest.contradictions]
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((item) => ({
            condition: item.explanation,
            evidenceIds: [
              ...item.evidenceIds,
              ...(item.opposingEvidenceIds ?? []),
            ].sort(),
          }));

  return {
    id: `candidate-attractor:${digest}`,
    targetState: {
      conditionIds: [forecast.conditionId],
      stateSummary: `Conditional movement toward ${forecast.conditionId}.`,
    },
    restoringMechanismIds: mechanisms.map((item) => item.id),
    activatingConditions: mechanisms.map((item) => ({
      condition: item.cause,
      evidenceIds: [...item.evidenceIds].sort(),
    })),
    weakeningConditions: weakening,
    historicalSupport: forecast.temporalSupport,
    implications: [
      {
        id: `implication:${digest}`,
        triggeringCondition: forecast.trigger,
        predictedOutcome: forecast.conditionId,
        predictionHorizon: "next consequential transition",
        confidence: forecast.confidence,
        distinguishingFromBaseline:
          "Retains conditional temporal restoration rather than carrying forward the latest state.",
      },
    ],
    supportingArtifactIds: forecast.supportingArtifactIds,
    opposingArtifactIds: weakening.flatMap((item) => item.evidenceIds).sort(),
    persistenceConfidence: forecast.confidence,
    falsificationCriteria:
      ablation === "no-falsification"
        ? []
        : [forecast.falsificationCondition],
  };
}
