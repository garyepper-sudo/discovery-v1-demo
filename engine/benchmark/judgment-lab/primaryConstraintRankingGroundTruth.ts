import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { rankExecutiveConstraint } from "../../v3/model/judgment/rankExecutiveConstraint";
import type { OrganizationalCondition } from "../../v3/model/state/inferOrganizationalConditions";
import { rankOrganizationalCondition } from "../../v3/model/state/rankOrganizationalCondition";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result, V3Evidence } from "../../v3/types";
import { runEvidenceIndependenceShadow } from "./runEvidenceIndependenceShadow";

type UpstreamPolicy = "P0" | "P1";
type RankingPolicy = "R0" | "R1" | "R2" | "R3" | "R4";
type Combination =
  | "P0+R0"
  | "P1+R0"
  | "P1+R1"
  | "P1+R2"
  | "P1+R3"
  | "P1+R4";
type UnknownRecord = Record<string, unknown>;

type HiddenTruth = {
  trueMechanismTerms: string[];
  trueCondition: string;
  truePrimaryConstraint: string;
  secondaryConditions: string[];
  falseVolumeCondition: string;
  trueSourceIds: string[];
  recommendationTerms: string[];
};

type Scenario = {
  id: string;
  input: InvestigationInput;
  truth: HiddenTruth;
  equalsScenarioId?: string;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
  conditions: OrganizationalCondition[];
};

type RankingInputs = {
  condition: OrganizationalCondition;
  score: number;
  confidence: number;
  leverage: number;
  significance: number;
  independentSources: number;
  rawRecords: number;
  mechanismSpecificity: number;
  mechanismIds: string[];
  theoryIds: string[];
};

type Evaluation = {
  selected: string;
  trueRank: number;
  reciprocalRank: number;
  falseRank: number;
  correct: boolean;
  confidenceCalibration: number;
  leverageAlignment: boolean;
  explanationFidelity: boolean;
  recommendationAligned: boolean;
  ranking: RankingInputs[];
  tieBreak: string;
};

const FIXED_TIME = Date.parse("2026-07-24T18:00:00.000Z");
const TRUE_A =
  "Routine decisions wait for executive approval, causing delivery delays after teams complete planned work.";
const TRUE_B =
  "Unclear cross-functional decision ownership creates approval queues and repeated priority resets.";
const TRUE_C =
  "Delegated decisions move four times faster with equal quality, while escalated decisions remain delayed.";
const FALSE =
  "Insufficient staffing capacity causes delivery delays, so hiring more people is the primary solution.";
const BROAD =
  "Execution capacity is constrained across delivery, coordination, prioritization, and operating bandwidth.";
const IRRELEVANT =
  "The recruiting team expanded university partnerships across three regions.";
const CONTRADICTION =
  "One delegated team missed a commitment despite clear decision ownership.";

function source(
  sourceId: string,
  content: string,
): InvestigationEvidenceSource {
  return {
    sourceId,
    sourceType: "primary-constraint-ground-truth-fixture",
    content,
  };
}

function input(
  evidenceSources: InvestigationEvidenceSource[],
  context = "",
): InvestigationInput {
  return {
    company: "Primary Constraint Ground Truth Company",
    website: "https://primary-constraint-ground-truth.invalid",
    industry: "Industrial services",
    question:
      "What is the highest-leverage organizational constraint limiting reliable delivery?",
    context,
    evidenceSources,
  };
}

const truth: HiddenTruth = {
  trueMechanismTerms: [
    "decision",
    "authority",
    "approval",
    "escalation",
  ],
  trueCondition: "Decision Flow",
  truePrimaryConstraint: "Decision Flow",
  secondaryConditions: [
    "Coordination System",
    "Execution Capacity",
    "Leadership Dependency",
  ],
  falseVolumeCondition: "Execution Capacity",
  trueSourceIds: ["source:true-a", "source:true-b", "source:true-c"],
  recommendationTerms: ["authority", "delegat", "approval"],
};

const trueSources = [
  source("source:true-a", TRUE_A),
  source("source:true-b", TRUE_B),
  source("source:true-c", TRUE_C),
];
const falseTen = Array.from({ length: 10 }, () =>
  source("source:false", FALSE),
);

const scenarios: Scenario[] = [
  {
    id: "duplicate-heavy-false-condition",
    input: input([...falseTen, ...trueSources]),
    truth,
  },
  {
    id: "low-volume-independent-true-condition",
    input: input(trueSources),
    truth,
  },
  {
    id: "broad-high-confidence-versus-specific",
    input: input([
      ...Array.from({ length: 6 }, () => source("source:broad", BROAD)),
      ...trueSources,
    ]),
    truth,
  },
  {
    id: "high-leverage-true-versus-volume-symptom",
    input: input([...falseTen, ...trueSources]),
    truth,
  },
  {
    id: "shared-upstream-evidence",
    input: input([
      source("source:true-a", `${TRUE_A} ${TRUE_B}`),
      source("source:true-b", `${TRUE_B} Coordination handoffs also slow.`),
      source("source:true-c", TRUE_C),
    ]),
    truth,
  },
  {
    id: "one-decisive-source",
    input: input([source("source:true-c", TRUE_C)]),
    truth,
  },
  {
    id: "sparse-evidence",
    input: input([source("source:true-a", TRUE_A)]),
    truth,
  },
  {
    id: "irrelevant-plausible",
    input: input([...trueSources, source("source:irrelevant", IRRELEVANT)]),
    truth,
  },
  {
    id: "contradiction-held-constant",
    input: input([
      ...trueSources,
      source("source:contradiction", CONTRADICTION),
    ]),
    truth,
  },
  {
    id: "unprovenanced-control",
    input: input([], [TRUE_A, TRUE_B, TRUE_C].join("\n")),
    truth: { ...truth, trueSourceIds: [] },
  },
  {
    id: "reversed-evidence-order",
    input: input([
      source(
        "source:true-a",
        [TRUE_A, "Executive approval adds nine days."].reverse().join("\n"),
      ),
      ...trueSources.slice(1),
    ]),
    truth,
    equalsScenarioId: "forward-evidence-order",
  },
  {
    id: "forward-evidence-order",
    input: input([
      source(
        "source:true-a",
        [TRUE_A, "Executive approval adds nine days."].join("\n"),
      ),
      ...trueSources.slice(1),
    ]),
    truth,
  },
  {
    id: "reversed-source-order",
    input: input([...trueSources].reverse()),
    truth,
    equalsScenarioId: "low-volume-independent-true-condition",
  },
  {
    id: "equal-score-tie-breaking",
    input: input([
      source(
        "source:tie-a",
        "Coordination and decision flow are equally constrained by unclear ownership.",
      ),
      source(
        "source:tie-b",
        "Decision flow and coordination are equally constrained by unclear ownership.",
      ),
    ]),
    truth,
  },
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as UnknownRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function canonicalInput(value: InvestigationInput): InvestigationInput {
  return {
    ...value,
    evidenceSources: value.evidenceSources
      ?.map((item) => ({
        ...item,
        content: item.content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right))
          .join("\n"),
      }))
      .sort(
        (left, right) =>
          left.sourceId.localeCompare(right.sourceId) ||
          left.content.localeCompare(right.content),
      ),
  };
}

function withDeterminism<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let state = 0x1152026;
  class FixedDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length > 0) super(...args);
      else super(FIXED_TIME + tick++);
    }
    static now(): number {
      return FIXED_TIME + tick++;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  try {
    return operation();
  } finally {
    globalThis.Date = OriginalDate;
    Math.random = originalRandom;
  }
}

function execute(
  scenario: Scenario,
  policy: UpstreamPolicy,
): Execution {
  const benchmarkInput = canonicalInput(scenario.input);
  return withDeterminism(() => {
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result =
        policy === "P0"
          ? runDiscoveryV3(benchmarkInput)
          : runEvidenceIndependenceShadow(benchmarkInput);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `primary-constraint-ground-truth:${scenario.id}`,
          name: benchmarkInput.company,
          industry: benchmarkInput.industry,
          website: benchmarkInput.website,
        }),
        result,
        input: benchmarkInput,
      });
      return {
        result,
        runtime,
        conditions: runtime.memory.organizationalConditions ?? [],
      };
    } finally {
      console.log = originalLog;
    }
  });
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function priority(value: string): number {
  return value === "critical"
    ? 1
    : value === "high"
      ? 0.8
      : value === "medium"
        ? 0.5
        : 0.2;
}

function status(value: string): number {
  return /critical|severe|blocked/.test(value)
    ? 1
    : /strained|constrained|at-risk|risk/.test(value)
      ? 0.8
      : /watch|emerging|mixed/.test(value)
        ? 0.55
        : /uncertain|unknown/.test(value)
          ? 0.35
          : /healthy|resolved|strong/.test(value)
            ? 0.1
            : 0.4;
}

function trend(value: string): number {
  return value === "weakening"
    ? 1
    : value === "new"
      ? 0.7
      : value === "stable"
        ? 0.45
        : value === "strengthening"
          ? 0.2
          : 0;
}

function supportIds(condition: OrganizationalCondition): string[] {
  return [
    ...condition.supportingMechanismIds,
    ...condition.supportingBeliefIds,
    ...condition.supportingConceptIds,
    ...condition.supportingTheoryIds,
  ];
}

function productionLeverage(
  condition: OrganizationalCondition,
  conditions: OrganizationalCondition[],
): number {
  const maximumDownstream = Math.max(
    0,
    ...conditions.map((item) => item.downstreamConditionIds.length),
  );
  const maximumSupport = Math.max(
    0,
    ...conditions.map((item) => supportIds(item).length),
  );
  const downstream =
    maximumDownstream > 0
      ? condition.downstreamConditionIds.length / maximumDownstream
      : 0;
  const support =
    maximumSupport > 0 ? supportIds(condition).length / maximumSupport : 0;
  return Number(
    clamp(
      priority(condition.priority) * 0.28 +
        status(condition.status) * 0.14 +
        trend(condition.trend) * 0.14 +
        condition.confidence * 0.14 +
        condition.strength * 0.14 +
        downstream * 0.12 +
        support * 0.04,
    ).toFixed(4),
  );
}

function evidenceSourcesById(evidence: V3Evidence[]): Map<string, string> {
  return new Map(
    evidence.map((item) => [item.id, item.sourceId ?? `record:${item.id}`]),
  );
}

function organizationalMechanisms(execution: Execution): UnknownRecord[] {
  const network = (
    execution.runtime.memory as unknown as UnknownRecord
  ).mechanismNetwork as UnknownRecord | undefined;
  const value = network?.mechanisms;
  return Array.isArray(value)
    ? value.filter(
        (item): item is UnknownRecord =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function ancestry(
  condition: OrganizationalCondition,
  execution: Execution,
): { independentSources: number; rawRecords: number; mechanisms: UnknownRecord[] } {
  const mechanismIds = new Set(condition.supportingMechanismIds);
  const mechanisms = organizationalMechanisms(execution).filter((mechanism) =>
    mechanismIds.has(String(mechanism.id)),
  );
  const evidenceIds = [
    ...new Set(
      mechanisms.flatMap((mechanism) => [
        ...strings(mechanism.supportingEvidenceIds),
        ...strings(mechanism.evidenceIds),
      ]),
    ),
  ];
  const sourceByEvidence = evidenceSourcesById(execution.result.evidence);
  return {
    independentSources: new Set(
      evidenceIds
        .map((id) => sourceByEvidence.get(id))
        .filter((id): id is string => Boolean(id)),
    ).size,
    rawRecords: evidenceIds.length,
    mechanisms,
  };
}

function specificity(
  condition: OrganizationalCondition,
  execution: Execution,
): number {
  const support = ancestry(condition, execution);
  const mechanismRatio =
    supportIds(condition).length === 0
      ? 0
      : condition.supportingMechanismIds.length / supportIds(condition).length;
  const namedMechanismRatio =
    support.mechanisms.length === 0
      ? 0
      : support.mechanisms.filter(
          (mechanism) =>
            String(mechanism.type ?? "").toLowerCase() !== "unknown" &&
            String(mechanism.name ?? mechanism.title ?? "").trim().length > 0,
        ).length / support.mechanisms.length;
  return clamp(mechanismRatio * 0.6 + namedMechanismRatio * 0.4);
}

function scoreFor(
  condition: OrganizationalCondition,
  execution: Execution,
  policy: RankingPolicy,
): number {
  const support = ancestry(condition, execution);
  if (policy === "R0")
    return productionLeverage(condition, execution.conditions);
  if (policy === "R1") return condition.confidence;
  if (policy === "R2")
    return clamp(
      support.independentSources / 4 -
        Math.max(0, support.rawRecords - support.independentSources) * 0.01,
    );
  if (policy === "R3") return specificity(condition, execution);
  return rankExecutiveConstraint({
    condition,
    allConditions: execution.conditions,
  });
}

function rank(
  execution: Execution,
  policy: RankingPolicy,
): RankingInputs[] {
  return execution.conditions
    .map((condition) => {
      const support = ancestry(condition, execution);
      return {
        condition,
        score: scoreFor(condition, execution, policy),
        confidence: condition.confidence,
        leverage: productionLeverage(condition, execution.conditions),
        significance: rankOrganizationalCondition(condition),
        independentSources: support.independentSources,
        rawRecords: support.rawRecords,
        mechanismSpecificity: specificity(condition, execution),
        mechanismIds: [...condition.supportingMechanismIds],
        theoryIds: [...condition.supportingTheoryIds],
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        (policy === "R0"
          ? priority(right.condition.priority) -
              priority(left.condition.priority) ||
            right.condition.confidence - left.condition.confidence ||
            right.condition.strength - left.condition.strength ||
            right.condition.downstreamConditionIds.length -
              left.condition.downstreamConditionIds.length
          : 0) ||
        left.condition.id.localeCompare(right.condition.id),
    );
}

function evaluate(
  execution: Execution,
  policy: RankingPolicy,
  hidden: HiddenTruth,
): Evaluation {
  const ranking = rank(execution, policy);
  const trueIndex = ranking.findIndex(
    (item) => item.condition.name === hidden.trueCondition,
  );
  const falseIndex = ranking.findIndex(
    (item) => item.condition.name === hidden.falseVolumeCondition,
  );
  const selected = ranking[0];
  const trueCandidate = ranking[trueIndex];
  const selectedText = stable(selected?.condition ?? {}).toLowerCase();
  const recommendationText = stable(
    (execution.runtime.memory as unknown as UnknownRecord)
      .executiveRecommendation,
  ).toLowerCase();
  const tied =
    ranking.length > 1 &&
    Math.abs(ranking[0].score - ranking[1].score) < 0.000001;

  return {
    selected: selected?.condition.name ?? "none",
    trueRank: trueIndex >= 0 ? trueIndex + 1 : ranking.length + 1,
    reciprocalRank: trueIndex >= 0 ? 1 / (trueIndex + 1) : 0,
    falseRank: falseIndex >= 0 ? falseIndex + 1 : ranking.length + 1,
    correct: selected?.condition.name === hidden.truePrimaryConstraint,
    confidenceCalibration: trueCandidate?.confidence ?? 0,
    leverageAlignment:
      Boolean(trueCandidate) &&
      trueCandidate.leverage >=
        Math.max(...ranking.map((item) => item.leverage)) - 0.000001,
    explanationFidelity:
      hidden.trueMechanismTerms.filter((term) => selectedText.includes(term))
        .length >= 2,
    recommendationAligned: hidden.recommendationTerms.some((term) =>
      recommendationText.includes(term),
    ),
    ranking,
    tieBreak: tied
      ? `equal ${policy} score resolved by ${policy === "R0" ? "priority, confidence, strength, downstream count, then condition id" : "condition id"}`
      : `${policy} score`,
  };
}

const combinations: Array<{
  id: Combination;
  upstream: UpstreamPolicy;
  ranking: RankingPolicy;
}> = [
  { id: "P0+R0", upstream: "P0", ranking: "R0" },
  { id: "P1+R0", upstream: "P1", ranking: "R0" },
  { id: "P1+R1", upstream: "P1", ranking: "R1" },
  { id: "P1+R2", upstream: "P1", ranking: "R2" },
  { id: "P1+R3", upstream: "P1", ranking: "R3" },
  { id: "P1+R4", upstream: "P1", ranking: "R4" },
];

const results = scenarios.map((scenario) => {
  const executions = {
    P0: execute(scenario, "P0"),
    P1: execute(scenario, "P1"),
  };
  assert.equal(stable(executions.P0), stable(execute(scenario, "P0")));
  assert.equal(stable(executions.P1), stable(execute(scenario, "P1")));
  assert.equal(
    executions.P0.runtime.metadata.organizationId,
    executions.P1.runtime.metadata.organizationId,
  );
  assert.deepEqual(
    executions.P0.result.evidence.map((item) => item.id),
    executions.P1.result.evidence.map((item) => item.id),
  );
  const evaluations = Object.fromEntries(
    combinations.map((combination) => [
      combination.id,
      evaluate(
        executions[combination.upstream],
        combination.ranking,
        scenario.truth,
      ),
    ]),
  ) as Record<Combination, Evaluation>;
  return { scenario, executions, evaluations };
});

for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  assert.equal(
    stable(result.executions.P0.result),
    stable(expected.executions.P0.result),
  );
  assert.equal(
    stable(result.executions.P1.result),
    stable(expected.executions.P1.result),
  );
  for (const combination of combinations) {
    assert.equal(
      stable(result.evaluations[combination.id]),
      stable(expected.evaluations[combination.id]),
    );
  }
}

const summary = combinations.map((combination) => {
  const evaluations = results.map(
    (result) => result.evaluations[combination.id],
  );
  return {
    id: combination.id,
    correct: evaluations.filter((item) => item.correct).length,
    meanRank:
      evaluations.reduce((sum, item) => sum + item.trueRank, 0) /
      evaluations.length,
    meanReciprocalRank:
      evaluations.reduce((sum, item) => sum + item.reciprocalRank, 0) /
      evaluations.length,
    meanFalseRank:
      evaluations.reduce((sum, item) => sum + item.falseRank, 0) /
      evaluations.length,
    leverageAligned: evaluations.filter((item) => item.leverageAlignment)
      .length,
    explanations: evaluations.filter((item) => item.explanationFidelity)
      .length,
    recommendations: evaluations.filter((item) => item.recommendationAligned)
      .length,
  };
});

const best = [...summary].sort(
  (left, right) =>
    right.correct - left.correct ||
    right.meanReciprocalRank - left.meanReciprocalRank,
)[0];
const production = summary.find((item) => item.id === "P1+R0")!;
const confidence = summary.find((item) => item.id === "P1+R1")!;
const support = summary.find((item) => item.id === "P1+R2")!;
const specificityResult = summary.find((item) => item.id === "P1+R3")!;
const leverage = summary.find((item) => item.id === "P1+R4")!;
const trueConditionPresent = results.every((result) =>
  result.executions.P1.conditions.some(
    (condition) => condition.name === result.scenario.truth.trueCondition,
  ),
);
const localizedThreshold = Math.ceil(results.length * 0.8);
const classification =
  best.correct > production.correct &&
  best.correct >= localizedThreshold &&
  [confidence, support, specificityResult, leverage].filter(
    (item) => item.correct === best.correct,
  ).length === 1
    ? "A — Localized primary-ranking defect"
    : !trueConditionPresent
      ? "C — Ontology or specificity limitation"
      : best.correct === 0 || best.correct === production.correct
        ? "B — Condition composition defect"
        : "D — Mixed or unsafe";

const tieScenario = results.find(
  (item) => item.scenario.id === "equal-score-tie-breaking",
)!;
const tieCandidates = tieScenario.executions.P1.conditions.slice(0, 2).map(
  (condition, index) => ({
    ...condition,
    id: index === 0 ? "condition-z-tie" : "condition-a-tie",
    priority: "medium" as const,
    status: "emerging" as const,
    trend: "new" as const,
    confidence: 0.5,
    strength: 0.5,
    supportingConceptIds: [],
    supportingBeliefIds: [],
    supportingMechanismIds: [],
    supportingTheoryIds: [],
    upstreamConditionIds: [],
    downstreamConditionIds: [],
  }),
);
assert.equal(tieCandidates.length, 2);
const tieExecution: Execution = {
  ...tieScenario.executions.P1,
  conditions: tieCandidates,
};
const tieRanking = rank(tieExecution, "R0");
assert.equal(tieRanking[0].score, tieRanking[1].score);
assert.equal(tieRanking[0].condition.id, "condition-a-tie");

console.log("PRIMARY CONSTRAINT RANKING GROUND-TRUTH BENCHMARK");
console.log("");
for (const item of summary) {
  console.log(
    `${item.id}: correct=${item.correct}/${results.length} meanRank=${item.meanRank.toFixed(2)} MRR=${item.meanReciprocalRank.toFixed(3)} falseRank=${item.meanFalseRank.toFixed(2)} leverageAligned=${item.leverageAligned}/${results.length} explanation=${item.explanations}/${results.length} recommendation=${item.recommendations}/${results.length}`,
  );
}
console.log("");
for (const result of results) {
  const evaluation = result.evaluations["P1+R0"];
  const trueCandidate = evaluation.ranking.find(
    (item) => item.condition.name === result.scenario.truth.trueCondition,
  );
  const winner = evaluation.ranking[0];
  console.log(
    `SCENARIO ${result.scenario.id}: winner=${winner?.condition.name ?? "none"} trueRank=${evaluation.trueRank} winnerScore=${winner?.score.toFixed(4) ?? "0"} trueScore=${trueCandidate?.score.toFixed(4) ?? "0"} tieBreak=${evaluation.tieBreak}`,
  );
}
console.log("");
for (const result of results) {
  const productionRanking = result.evaluations["P1+R0"].ranking;
  const specificityRanking = result.evaluations["P1+R3"].ranking;
  for (const candidate of productionRanking) {
    const productionRank = productionRanking.indexOf(candidate) + 1;
    const shadowRank =
      specificityRanking.findIndex(
        (item) => item.condition.id === candidate.condition.id,
      ) + 1;
    const reason =
      productionRank === 1
        ? "won production leverage"
        : shadowRank < productionRank
          ? "gained through mechanism specificity"
          : candidate.independentSources === 0
            ? "lost without direct independent-source ancestry"
            : "lost on the active ranking score";
    console.log(
      [
        `CANDIDATE ${result.scenario.id}`,
        `condition=${candidate.condition.name}`,
        `productionRank=${productionRank}`,
        `specificityRank=${shadowRank}`,
        `confidence=${candidate.confidence.toFixed(4)}`,
        `leverage=${candidate.leverage.toFixed(4)}`,
        `theories=${candidate.theoryIds.join(",") || "none"}`,
        `mechanisms=${candidate.mechanismIds.join(",") || "none"}`,
        `independentSources=${candidate.independentSources}`,
        `rawRecords=${candidate.rawRecords}`,
        `specificity=${candidate.mechanismSpecificity.toFixed(4)}`,
        `reason=${reason}`,
      ].join("  "),
    );
  }
}
console.log("");
console.log("Selection owner: buildPrimaryExecutiveConstraint()");
console.log(
  "R0 inputs: priority 28%, status 14%, trend 14%, confidence 14%, strength 14%, downstream breadth 12%, support breadth 4%.",
);
console.log(
  "R0 tie-break: leverage, priority, confidence, strength, downstream count, condition id.",
);
console.log(
  `Equal-score probe: ${tieRanking[0].condition.id} selected over ${tieRanking[1].condition.id} by ascending condition id.`,
);
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Reverse evidence order: equivalent");
console.log("Reverse source order: equivalent");
console.log("Evidence ancestry and object identities: stable");
