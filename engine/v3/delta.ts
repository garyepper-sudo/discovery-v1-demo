import {
  DiscoveryV3Result,
  V3Belief,
  V3Contradiction,
  V3OrganismState,
  V3UnderstandingDelta,
} from "./types";

type CompareInput = {
  previous?: Partial<DiscoveryV3Result>;
  current: Partial<DiscoveryV3Result>;
};

export function compareUnderstanding({
  previous,
  current,
}: CompareInput): V3UnderstandingDelta {
  const previousBeliefs = previous?.beliefs ?? [];
  const currentBeliefs = current.beliefs ?? [];

  const previousContradictions = previous?.contradictions ?? [];
  const currentContradictions = current.contradictions ?? [];

  const previousHealth = previous?.organismState;
  const currentHealth = current.organismState;

  return {
    newBeliefs: findNewBeliefs(previousBeliefs, currentBeliefs),
    strengthenedBeliefs: findStrengthenedBeliefs(previousBeliefs, currentBeliefs),
    weakenedBeliefs: findWeakenedBeliefs(previousBeliefs, currentBeliefs),
    resolvedContradictions: findResolvedContradictions(
      previousContradictions,
      currentContradictions
    ),
    newContradictions: findNewContradictions(
      previousContradictions,
      currentContradictions
    ),
    confidenceChanges: buildConfidenceChanges(previousBeliefs, currentBeliefs),
    healthChanges: buildHealthChanges(previousHealth, currentHealth),
  };
}

export function buildInitialDelta(
  current: Partial<DiscoveryV3Result>
): V3UnderstandingDelta {
  return compareUnderstanding({
    previous: undefined,
    current,
  });
}

function findNewBeliefs(
  previous: V3Belief[],
  current: V3Belief[]
): string[] {
  const previousFingerprints = new Set(previous.map(beliefFingerprint));

  return current
    .filter((belief) => !previousFingerprints.has(beliefFingerprint(belief)))
    .map((belief) => belief.id);
}

function findStrengthenedBeliefs(
  previous: V3Belief[],
  current: V3Belief[]
): string[] {
  return current
    .filter((belief) => {
      const prior = findMatchingBelief(belief, previous);
      if (!prior) return false;

      return belief.confidence - prior.confidence >= 0.08;
    })
    .map((belief) => belief.id);
}

function findWeakenedBeliefs(
  previous: V3Belief[],
  current: V3Belief[]
): string[] {
  return current
    .filter((belief) => {
      const prior = findMatchingBelief(belief, previous);
      if (!prior) return false;

      return prior.confidence - belief.confidence >= 0.08;
    })
    .map((belief) => belief.id);
}

function findResolvedContradictions(
  previous: V3Contradiction[],
  current: V3Contradiction[]
): string[] {
  const currentFingerprints = new Set(current.map(contradictionFingerprint));

  return previous
    .filter(
      (contradiction) =>
        !currentFingerprints.has(contradictionFingerprint(contradiction))
    )
    .map((contradiction) => contradiction.id);
}

function findNewContradictions(
  previous: V3Contradiction[],
  current: V3Contradiction[]
): string[] {
  const previousFingerprints = new Set(previous.map(contradictionFingerprint));

  return current
    .filter(
      (contradiction) =>
        !previousFingerprints.has(contradictionFingerprint(contradiction))
    )
    .map((contradiction) => contradiction.id);
}

function buildConfidenceChanges(
  previous: V3Belief[],
  current: V3Belief[]
): V3UnderstandingDelta["confidenceChanges"] {
  return current
    .map((belief) => {
      const prior = findMatchingBelief(belief, previous);

      return {
        sourceId: belief.id,
        sourceType: "belief" as const,
        previousConfidence: prior?.confidence,
        currentConfidence: belief.confidence,
        direction: getDirection(prior?.confidence, belief.confidence),
        explanation: prior
          ? `Belief confidence changed from ${prior.confidence} to ${belief.confidence}.`
          : "New belief formed in this investigation.",
      };
    })
    .filter((change) => change.direction !== "unchanged");
}

function buildHealthChanges(
  previous?: V3OrganismState,
  current?: V3OrganismState
): V3UnderstandingDelta["healthChanges"] {
  if (!current) return [];

  return [
    buildHealthChange("density", previous?.density, current.density),
    buildHealthChange("coherence", previous?.coherence, current.coherence),
    buildHealthChange("tension", previous?.tension, current.tension),
    buildHealthChange("maturity", previous?.maturity, current.maturity),
    buildHealthChange("uncertainty", previous?.uncertainty, current.uncertainty),
  ].filter((change) => change.direction !== "unchanged");
}

function buildHealthChange(
  metric: V3UnderstandingDelta["healthChanges"][number]["metric"],
  previousValue: number | undefined,
  currentValue: number
): V3UnderstandingDelta["healthChanges"][number] {
  return {
    metric,
    previousValue,
    currentValue,
    direction: getDirection(previousValue, currentValue),
    explanation:
      previousValue === undefined
        ? `${metric} was established at ${currentValue}.`
        : `${metric} changed from ${previousValue} to ${currentValue}.`,
  };
}

function findMatchingBelief(
  belief: V3Belief,
  candidates: V3Belief[]
): V3Belief | undefined {
  const fingerprint = beliefFingerprint(belief);

  return candidates.find(
    (candidate) => beliefFingerprint(candidate) === fingerprint
  );
}

function beliefFingerprint(belief: V3Belief): string {
  return normalizeFingerprint([
    belief.headline,
    ...belief.themeIds,
    ...belief.mechanismIds,
  ]);
}

function contradictionFingerprint(contradiction: V3Contradiction): string {
  return normalizeFingerprint([
    contradiction.title,
    ...contradiction.evidenceIds,
  ]);
}

function normalizeFingerprint(parts: string[]): string {
  return parts
    .join("|")
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDirection(
  previousValue: number | undefined,
  currentValue: number
): "up" | "down" | "unchanged" {
  if (previousValue === undefined) return "up";

  const difference = currentValue - previousValue;

  if (difference >= 0.03) return "up";
  if (difference <= -0.03) return "down";

  return "unchanged";
}