import type { OrganizationalMemoryMaturity } from "./organizationalTheories";

type MemoryMaturityInput = {
  persistentBeliefs: number;
  recurringMechanisms: number;
  stableTheories: number;
  historicalEvents: number;
  theoryEvolutionEvents: number;
  conceptCount: number;
};

export function calculateMemoryMaturity({
  persistentBeliefs,
  recurringMechanisms,
  stableTheories,
  historicalEvents,
  theoryEvolutionEvents,
  conceptCount,
}: MemoryMaturityInput): OrganizationalMemoryMaturity {
  const persistentBeliefScore = scoreCount(persistentBeliefs, 12);
  const recurringMechanismScore = scoreCount(recurringMechanisms, 8);
  const stableTheoryScore = scoreCount(stableTheories, 6);
  const historicalContinuity = scoreCount(historicalEvents, 8);
  const contradictionResolution = scoreCount(theoryEvolutionEvents, 6);
  const understandingReuse = scoreCount(
    persistentBeliefs + stableTheories + recurringMechanisms,
    24,
  );
  const conceptStability = scoreCount(conceptCount, 8);

  const score = Math.round(
    persistentBeliefScore * 0.2 +
      recurringMechanismScore * 0.18 +
      stableTheoryScore * 0.22 +
      historicalContinuity * 0.14 +
      contradictionResolution * 0.1 +
      understandingReuse * 0.1 +
      conceptStability * 0.06,
  );

  return {
    score,
    persistentBeliefs: persistentBeliefScore,
    recurringMechanisms: recurringMechanismScore,
    stableTheories: stableTheoryScore,
    historicalContinuity,
    contradictionResolution,
    understandingReuse,
    conceptStability,
    reasons: [
      `${persistentBeliefs} persistent beliefs retained`,
      `${recurringMechanisms} recurring mechanisms detected`,
      `${stableTheories} stable organizational theories maintained`,
      `${historicalEvents} investigation events preserved`,
      `${theoryEvolutionEvents} theory evolution events tracked`,
      `${conceptCount} organizational concepts reused`,
    ],
  };
}

function scoreCount(count: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((count / target) * 100));
}