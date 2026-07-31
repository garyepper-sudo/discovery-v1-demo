import type {
  DiscriminationScenario,
  EvidenceCandidate,
  ExplanationId,
} from "./types";

function evidence(
  id: string,
  description: string,
  values: {
    effort: number;
    confidenceGain: number;
    understandingGain: number;
    decisionRelevance: number;
    causalStrength: EvidenceCandidate["causalStrength"];
    predictedOutcomes: EvidenceCandidate["predictedOutcomes"];
    observedEffects: EvidenceCandidate["observedEffects"];
    admissible?: boolean;
  },
): EvidenceCandidate {
  return {
    id,
    description,
    admissible: values.admissible ?? true,
    ...values,
  };
}

type Fixture = {
  sourceScenarioId: string;
  question: string;
  initial: [ExplanationId, ExplanationId, ExplanationId];
  correct: ExplanationId[];
  decisive: {
    description: string;
    effects: EvidenceCandidate["observedEffects"];
  };
  contextualEffects: EvidenceCandidate["observedEffects"];
};

const FIXTURES: Fixture[] = [
  {
    sourceScenarioId: "decisive-displacement",
    question: "Is delivery delay caused by capacity, decision rights, or coordination?",
    initial: ["capacity", "decision-rights", "coordination"],
    correct: ["decision-rights"],
    decisive: {
      description: "Compare matched low-load work with and without approval waiting.",
      effects: { capacity: "rule-out", "decision-rights": "support", coordination: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", coordination: "weaken" },
  },
  {
    sourceScenarioId: "counterfactual-disproof",
    question: "Does reduced workload or delegated approval change delivery?",
    initial: ["capacity", "decision-rights", "strategy"],
    correct: ["decision-rights"],
    decisive: {
      description: "Run the existing counterfactual comparison of workload and delegation.",
      effects: { capacity: "rule-out", "decision-rights": "support", strategy: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", strategy: "weaken" },
  },
  {
    sourceScenarioId: "delayed-outcome-revision",
    question: "Do priority conflict or decision rights better explain delayed outcomes?",
    initial: ["strategy", "decision-rights", "capacity"],
    correct: ["decision-rights"],
    decisive: {
      description: "Compare outcomes for clear authority under conflicting priorities.",
      effects: { strategy: "rule-out", "decision-rights": "support", capacity: "rule-out" },
    },
    contextualEffects: { strategy: "weaken", capacity: "weaken" },
  },
  {
    sourceScenarioId: "decisive-outweighs-broad",
    question: "Do workload or handoff ownership better explain delay?",
    initial: ["capacity", "coordination", "knowledge"],
    correct: ["coordination"],
    decisive: {
      description: "Compare matched work that differs only in handoff ownership.",
      effects: { capacity: "rule-out", coordination: "support", knowledge: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", knowledge: "weaken" },
  },
  {
    sourceScenarioId: "rejected-becomes-viable",
    question: "Do strategy or missing context better explain repeated failure?",
    initial: ["strategy", "knowledge", "coordination"],
    correct: ["knowledge"],
    decisive: {
      description: "Recover incident histories and compare failure with context availability.",
      effects: { strategy: "rule-out", knowledge: "support", coordination: "rule-out" },
    },
    contextualEffects: { strategy: "weaken", coordination: "weaken" },
  },
  {
    sourceScenarioId: "viable-becomes-untenable",
    question: "Are slow outcomes caused by capacity or approval queues?",
    initial: ["capacity", "decision-rights", "leadership"],
    correct: ["decision-rights"],
    decisive: {
      description: "Compare low-utilization work with and without approval dependency.",
      effects: { capacity: "rule-out", "decision-rights": "support", leadership: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", leadership: "weaken" },
  },
  {
    sourceScenarioId: "unresolved-pair",
    question: "Are approval waiting and handoff failure joint explanations?",
    initial: ["decision-rights", "coordination", "capacity"],
    correct: ["decision-rights", "coordination"],
    decisive: {
      description: "Partition delay into approval-only, handoff-only, and shared cases.",
      effects: { "decision-rights": "support", coordination: "support", capacity: "rule-out" },
    },
    contextualEffects: { capacity: "weaken" },
  },
  {
    sourceScenarioId: "joint-independent-causes",
    question: "Do approval and handoff failures affect independent workstreams?",
    initial: ["decision-rights", "coordination", "strategy"],
    correct: ["decision-rights", "coordination"],
    decisive: {
      description: "Trace approval and handoff effects across separate workstreams.",
      effects: { "decision-rights": "support", coordination: "support", strategy: "rule-out" },
    },
    contextualEffects: { strategy: "weaken" },
  },
  {
    sourceScenarioId: "shared-not-discriminating",
    question: "Does escalation reflect leadership dependency, decision rights, or both?",
    initial: ["leadership", "decision-rights", "capacity"],
    correct: ["leadership", "decision-rights"],
    decisive: {
      description: "Observe cases where authority is delegated without changing leader involvement.",
      effects: { leadership: "support", "decision-rights": "support", capacity: "rule-out" },
    },
    contextualEffects: { capacity: "weaken" },
  },
  {
    sourceScenarioId: "independent-corroboration",
    question: "Is approval waiting the durable explanation for delay?",
    initial: ["decision-rights", "capacity", "coordination"],
    correct: ["decision-rights"],
    decisive: {
      description: "Use an independent outcome sample to compare approval and non-approval work.",
      effects: { "decision-rights": "support", capacity: "rule-out", coordination: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", coordination: "weaken" },
  },
  {
    sourceScenarioId: "industry-neutral-variant",
    question: "Does interface ownership explain outcome delay?",
    initial: ["coordination", "capacity", "knowledge"],
    correct: ["coordination"],
    decisive: {
      description: "Compare matched units differing only in interface ownership.",
      effects: { coordination: "support", capacity: "rule-out", knowledge: "rule-out" },
    },
    contextualEffects: { capacity: "weaken", knowledge: "weaken" },
  },
  {
    sourceScenarioId: "department-level",
    question: "Do incentives or coordination explain local optimization?",
    initial: ["incentives", "coordination", "strategy"],
    correct: ["incentives"],
    decisive: {
      description: "Compare units with the same measures but different coordination practices.",
      effects: { incentives: "support", coordination: "rule-out", strategy: "rule-out" },
    },
    contextualEffects: { coordination: "weaken", strategy: "weaken" },
  },
];

function candidateSet(fixture: Fixture): EvidenceCandidate[] {
  const [leader, alternative, third] = fixture.initial;
  return [
    evidence("confidence", `Collect another report supporting ${leader}.`, {
      effort: 1,
      confidenceGain: 0.95,
      understandingGain: 0.25,
      decisionRelevance: 0.25,
      causalStrength: "descriptive",
      predictedOutcomes: {
        [leader]: "compatible",
        [alternative]: "compatible",
        [third]: "compatible",
      },
      observedEffects: { [leader]: "support" },
    }),
    evidence("context", "Map the outcome across teams, time, and work types.", {
      effort: 2,
      confidenceGain: 0.5,
      understandingGain: 0.9,
      decisionRelevance: 0.8,
      causalStrength: "comparative",
      predictedOutcomes: {
        [leader]: "pattern-a",
        [alternative]: "pattern-b",
        [third]: "pattern-b",
      },
      observedEffects: fixture.contextualEffects,
    }),
    evidence("discrimination", fixture.decisive.description, {
      effort: 2,
      confidenceGain: 0.55,
      understandingGain: 0.8,
      decisionRelevance: 0.95,
      causalStrength: "counterfactual",
      predictedOutcomes: {
        [leader]: "outcome-a",
        [alternative]: "outcome-b",
        [third]: "outcome-c",
      },
      observedEffects: fixture.decisive.effects,
    }),
    evidence("shared", "Collect a broad narrative that all explanations predict.", {
      effort: 1,
      confidenceGain: 0.65,
      understandingGain: 0.45,
      decisionRelevance: 0.35,
      causalStrength: "descriptive",
      predictedOutcomes: {
        [leader]: "same",
        [alternative]: "same",
        [third]: "same",
      },
      observedEffects: {
        [leader]: "shared",
        [alternative]: "shared",
        [third]: "shared",
      },
    }),
    evidence("hypothesis-control", "A leader speculates about a fourth cause.", {
      effort: 1,
      confidenceGain: 0.8,
      understandingGain: 0.7,
      decisionRelevance: 0.7,
      causalStrength: "descriptive",
      predictedOutcomes: {},
      observedEffects: {},
      admissible: false,
    }),
  ];
}

export const DISCRIMINATION_SCENARIOS: DiscriminationScenario[] = FIXTURES.map(
  (fixture, index) => ({
    id: `eed-${String(index + 1).padStart(2, "0")}-${fixture.sourceScenarioId}`,
    sourceBenchmark: "competingExplanationAdjudication",
    sourceScenarioId: fixture.sourceScenarioId,
    question: fixture.question,
    organizationId: `eed-org-${String(index + 1).padStart(2, "0")}`,
    initialExplanations: fixture.initial,
    initiallyLeading: fixture.initial[0],
    correctExplanations: fixture.correct,
    evidenceCandidates: candidateSet(fixture),
  }),
);
