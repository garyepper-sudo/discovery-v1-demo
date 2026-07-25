import type {
  ConditionArtifact,
  ContradictionArtifact,
  FutureOutcome,
  InferenceScenario,
  MechanismArtifact,
  ProductionDerivedSnapshot,
  ScoringTruth,
} from "./types";

const condition = (
  id: string,
  status: ConditionArtifact["status"],
  trend: ConditionArtifact["trend"],
  mechanisms: string[],
  confidence = 0.78,
): ConditionArtifact => ({
  id,
  name: id.replace(/^condition-/, "").replace(/-/g, " "),
  status,
  confidence,
  trend,
  supportingMechanismIds: mechanisms,
});

const mechanism = (
  id: string,
  cause: string,
  process: string,
  effect: string,
  confidence = 0.8,
  stability = 0.8,
): MechanismArtifact => ({
  id,
  cause,
  mechanism: process,
  effect,
  confidence,
  stability,
  evidenceIds: [`evidence-${id}`],
  contradictionIds: [],
});

const contradiction = (
  id: string,
  explanation: string,
): ContradictionArtifact => ({
  id,
  explanation,
  evidenceIds: [`evidence-${id}-support`],
  opposingEvidenceIds: [`evidence-${id}-oppose`],
  confidence: 0.76,
});

const snapshot = (
  id: string,
  recordedAt: string,
  dominantConditions: string[],
  mechanisms: MechanismArtifact[],
  conditions: ConditionArtifact[],
  contradictions: ContradictionArtifact[] = [],
): ProductionDerivedSnapshot => ({
  id,
  recordedAt,
  evidenceIds: [
    ...mechanisms.flatMap((item) => item.evidenceIds),
    ...contradictions.flatMap((item) => [
      ...item.evidenceIds,
      ...(item.opposingEvidenceIds ?? []),
    ]),
  ].sort(),
  mechanisms,
  contradictions,
  conditions,
  state: {
    id: `state-${id}`,
    summary: `Dominant organizational conditions: ${dominantConditions.join(", ")}.`,
    status: dominantConditions.length === 0 ? "uncertain" : "watch",
    confidence: dominantConditions.length === 0 ? 0.42 : 0.78,
    dominantConditions,
  },
});

const centralized = [
  mechanism("override", "visible local failure", "executive override", "condition-decision-centralization", 0.86, 0.9),
  mechanism("risk", "mistake-sensitive incentives", "manager escalation", "condition-decision-centralization", 0.82, 0.86),
  mechanism("information", "privileged executive information", "approval dependency", "condition-decision-centralization", 0.84, 0.88),
];
const distributed = [
  mechanism("access", "shared operating information", "local trade-off resolution", "condition-decision-distribution", 0.86, 0.82),
  mechanism("safety", "learning-safe incentives", "local experimentation", "condition-decision-distribution", 0.84, 0.8),
  mechanism("rights", "respected decision rights", "local commitment", "condition-decision-distribution", 0.88, 0.86),
];

export const inferenceScenarios: InferenceScenario[] = [
  {
    id: "scenario-001",
    inferenceWindow: [
      snapshot("001-a", "2025-01-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "stable", centralized.map((item) => item.id))]),
      snapshot("001-b", "2025-04-01", ["condition-decision-distribution"], centralized, [condition("condition-decision-distribution", "improving", "new", [], 0.68), condition("condition-decision-centralization", "weak", "weakening", centralized.map((item) => item.id), 0.64)]),
      snapshot("001-c", "2025-07-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "strengthening", centralized.map((item) => item.id), 0.84)]),
      snapshot("001-d", "2025-10-01", ["condition-decision-distribution"], centralized, [condition("condition-decision-distribution", "improving", "new", [], 0.7), condition("condition-decision-centralization", "weak", "weakening", centralized.map((item) => item.id), 0.66)]),
    ],
  },
  {
    id: "scenario-002",
    inferenceWindow: [
      snapshot("002-a", "2025-01-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "stable", centralized.map((item) => item.id))]),
      snapshot("002-b", "2025-05-01", ["condition-decision-distribution"], distributed, [condition("condition-decision-distribution", "improving", "strengthening", distributed.map((item) => item.id))], [contradiction("structural-change", "Executive override and mistake penalties no longer explain current decisions.")]),
      snapshot("002-c", "2025-10-01", ["condition-decision-distribution"], distributed, [condition("condition-decision-distribution", "stable", "stable", distributed.map((item) => item.id), 0.86)]),
    ],
  },
  {
    id: "scenario-003",
    inferenceWindow: [
      snapshot("003-a", "2025-01-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "stable", centralized.map((item) => item.id))]),
      snapshot("003-b", "2025-04-01", ["condition-decision-distribution"], distributed, [condition("condition-decision-distribution", "improving", "stable", distributed.map((item) => item.id))]),
      snapshot("003-c", "2025-08-01", ["condition-decision-centralization", "condition-decision-distribution"], [...centralized, ...distributed], [condition("condition-decision-centralization", "unresolved", "stable", centralized.map((item) => item.id), 0.62), condition("condition-decision-distribution", "unresolved", "stable", distributed.map((item) => item.id), 0.62)]),
    ],
  },
  {
    id: "scenario-004",
    inferenceWindow: [
      snapshot("004-a", "2025-01-01", ["condition-capacity-strain"], [mechanism("shock-a", "supplier outage", "temporary queue growth", "condition-capacity-strain", 0.7, 0.3)], [condition("condition-capacity-strain", "constrained", "new", ["shock-a"])]),
      snapshot("004-b", "2025-04-01", ["condition-strategic-alignment"], [mechanism("shock-b", "leadership transition", "priority reset", "condition-strategic-alignment", 0.68, 0.25)], [condition("condition-strategic-alignment", "unresolved", "new", ["shock-b"])]),
    ],
  },
  {
    id: "scenario-005",
    inferenceWindow: [
      snapshot("005-a", "2025-01-01", ["condition-capacity-strain"], [], [condition("condition-capacity-strain", "constrained", "new", [])]),
      snapshot("005-b", "2025-04-01", [], [], []),
      snapshot("005-c", "2025-08-01", ["condition-capacity-strain"], [], [condition("condition-capacity-strain", "constrained", "new", [])]),
    ],
  },
  {
    id: "scenario-006",
    inferenceWindow: [
      snapshot("006-a", "2025-08-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "new", centralized.map((item) => item.id))]),
    ],
  },
  {
    id: "scenario-007",
    inferenceWindow: [
      snapshot("007-a", "2025-01-01", ["condition-decision-centralization"], centralized, [condition("condition-decision-centralization", "constrained", "stable", centralized.map((item) => item.id))]),
      snapshot("007-b", "2025-05-01", ["condition-decision-distribution"], distributed, [condition("condition-decision-distribution", "improving", "stable", distributed.map((item) => item.id))]),
      snapshot("007-c", "2025-09-01", ["condition-decision-centralization", "condition-decision-distribution"], [...centralized, ...distributed], [condition("condition-decision-centralization", "unresolved", "stable", centralized.map((item) => item.id), 0.6), condition("condition-decision-distribution", "unresolved", "stable", distributed.map((item) => item.id), 0.6)], [contradiction("context-conflict", "Operational risk centralizes decisions while exploration distributes them.")]),
    ],
  },
];

// Scoring-only data. This export is never passed to inference or registration.
export const scoringTruth: ScoringTruth[] = [
  { scenarioId: "scenario-001", family: "temporary-change", shouldAbstain: false, expectedConditionId: "condition-decision-centralization" },
  { scenarioId: "scenario-002", family: "structural-transition", shouldAbstain: false, expectedConditionId: "condition-decision-distribution" },
  { scenarioId: "scenario-003", family: "competing", shouldAbstain: true },
  { scenarioId: "scenario-004", family: "unstable", shouldAbstain: true },
  { scenarioId: "scenario-005", family: "recurrence-without-mechanism", shouldAbstain: true },
  { scenarioId: "scenario-006", family: "mechanism-without-restoration", shouldAbstain: true },
  { scenarioId: "scenario-007", family: "contradictory", shouldAbstain: true },
];

// Future outcomes are revealed only after predictions are registered.
export const futureOutcomes: FutureOutcome[] = [
  { scenarioId: "scenario-001", triggerObserved: true, realizedConditionIds: ["condition-decision-centralization"], realizedSummary: "A visible local failure is followed by renewed executive approval." },
  { scenarioId: "scenario-002", triggerObserved: true, realizedConditionIds: ["condition-decision-distribution"], realizedSummary: "Local decision rights remain intact after a contested decision." },
  { scenarioId: "scenario-003", triggerObserved: true, realizedConditionIds: ["condition-decision-centralization", "condition-decision-distribution"], realizedSummary: "Operational and exploration contexts continue to diverge." },
  { scenarioId: "scenario-004", triggerObserved: false, realizedConditionIds: ["condition-knowledge-continuity"], realizedSummary: "A different external shock changes the dominant condition." },
  { scenarioId: "scenario-005", triggerObserved: false, realizedConditionIds: [], realizedSummary: "The repeated state does not recur." },
  { scenarioId: "scenario-006", triggerObserved: false, realizedConditionIds: ["condition-decision-centralization"], realizedSummary: "Centralization remains plausible but no restoration event is observed." },
  { scenarioId: "scenario-007", triggerObserved: true, realizedConditionIds: ["condition-decision-centralization", "condition-decision-distribution"], realizedSummary: "Context-dependent decision patterns remain unresolved." },
];
