import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type {
  DiscoveryV3Result,
  V3Evidence,
  V3Mechanism,
} from "../../v3/types";
import { runEvidenceIndependenceShadow } from "./runEvidenceIndependenceShadow";

type Policy = "P0" | "P1" | "P2" | "P3";
type UnknownRecord = Record<string, unknown>;

type HiddenGroundTruth = {
  trueMechanism: string;
  trueCondition: string;
  trueSourceIds: string[];
  falseSourceIds: string[];
  recommendationFamily: string[];
};

type Scenario = {
  id: string;
  input: InvestigationInput;
  truth: HiddenGroundTruth;
  equalsScenarioId?: string;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type PolicyScore = {
  mechanismSelected: boolean;
  trueMechanismRank: number;
  falseMechanismRank: number;
  confidenceMargin: number;
  independentSupport: number;
  duplicateSensitivity: number;
  trueConditionSelected: boolean;
  trueConditionRank: number;
  primaryConstraintAccurate: boolean;
  conditionConfidence: number;
  recommendationAligned: boolean;
  explanationSupportFidelity: number;
  riskCount: number;
  opportunityCount: number;
};

const FIXED_TIME = Date.parse("2026-07-24T16:00:00.000Z");
const TRUE_A =
  "Routine decisions wait for executive approval, causing delivery delays after teams complete planned work.";
const TRUE_B =
  "Unclear cross-functional decision ownership creates approval queues and repeated priority resets.";
const TRUE_C =
  "Delegated decisions move four times faster with equal quality, while escalated decisions remain delayed.";
const FALSE =
  "Insufficient staffing capacity causes delivery delays, so hiring more people is the primary solution.";
const IRRELEVANT =
  "The recruiting team expanded university partnerships across three regions.";
const CONTRADICTION =
  "One delegated team still missed a delivery commitment despite clear decision ownership.";

function source(
  sourceId: string,
  content: string,
): InvestigationEvidenceSource {
  return {
    sourceId,
    sourceType: "mechanism-ground-truth-fixture",
    content,
  };
}

function input(
  evidenceSources: InvestigationEvidenceSource[],
  context = "",
): InvestigationInput {
  return {
    company: "Mechanism Ground Truth Company",
    website: "https://mechanism-ground-truth.invalid",
    industry: "Industrial services",
    question:
      "What is the highest-leverage organizational constraint limiting reliable delivery?",
    context,
    evidenceSources,
  };
}

const truth: HiddenGroundTruth = {
  trueMechanism: "decision authority ambiguity",
  trueCondition: "decision flow",
  trueSourceIds: ["source:true-a", "source:true-b", "source:true-c"],
  falseSourceIds: ["source:false"],
  recommendationFamily: ["decision", "authority", "delegat", "approval"],
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
    id: "duplicate-heavy-false-mechanism",
    input: input([...falseTen, ...trueSources]),
    truth,
  },
  {
    id: "independent-corroboration-true-mechanism",
    input: input(trueSources),
    truth,
  },
  {
    id: "high-volume-single-source-minority",
    input: input([...falseTen, ...trueSources]),
    truth,
  },
  {
    id: "low-volume-multi-source-true",
    input: input(trueSources),
    truth,
  },
  {
    id: "two-plausible-mechanisms",
    input: input([
      ...trueSources,
      source("source:false", FALSE),
      source("source:false", FALSE),
    ]),
    truth,
  },
  {
    id: "one-decisive-independent-source",
    input: input([source("source:true-c", TRUE_C)]),
    truth,
  },
  {
    id: "irrelevant-plausible-evidence",
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
    id: "reversed-evidence-order",
    input: input([
      source(
        "source:true-a",
        [TRUE_A, "Executive approval adds nine days to routine decisions."].reverse().join("\n"),
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
        [TRUE_A, "Executive approval adds nine days to routine decisions."].join("\n"),
      ),
      ...trueSources.slice(1),
    ]),
    truth,
  },
  {
    id: "reversed-source-order",
    input: input([...trueSources].reverse()),
    truth,
    equalsScenarioId: "independent-corroboration-true-mechanism",
  },
  {
    id: "unprovenanced-control",
    input: input([], [TRUE_A, TRUE_B, TRUE_C].join("\n")),
    truth: { ...truth, trueSourceIds: [] },
  },
  {
    id: "sparse-evidence-control",
    input: input([source("source:true-a", TRUE_A)]),
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
  let state = 0x1142026;

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
  policy: Policy,
): Execution {
  const benchmarkInput = canonicalInput(scenario.input);
  return withDeterminism(() => {
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result =
        policy === "P0"
          ? runDiscoveryV3(benchmarkInput)
          : runEvidenceIndependenceShadow(benchmarkInput, {
              themeEvidenceComposition:
                policy === "P2" || policy === "P3"
                  ? "independent-source"
                  : "production",
              mechanismEvidenceComposition:
                policy === "P3" ? "independent-source" : "production",
            });
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `mechanism-ground-truth:${scenario.id}`,
          name: benchmarkInput.company,
          industry: benchmarkInput.industry,
          website: benchmarkInput.website,
        }),
        result,
        input: benchmarkInput,
      });
      return { result, runtime };
    } finally {
      console.log = originalLog;
    }
  });
}

function sourceIds(
  mechanism: V3Mechanism,
  evidenceById: Map<string, V3Evidence>,
): string[] {
  return [
    ...new Set(
      mechanism.evidenceIds
        .map((id) => evidenceById.get(id)?.sourceId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
}

function overlap(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return new Set(left.filter((item) => rightSet.has(item))).size;
}

function findMechanismRanks(
  execution: Execution,
  hidden: HiddenGroundTruth,
): {
  ranked: V3Mechanism[];
  trueMechanism?: V3Mechanism;
  falseMechanism?: V3Mechanism;
} {
  const evidenceById = new Map(
    execution.result.evidence.map((item) => [item.id, item]),
  );
  const ranked = [...execution.result.mechanisms].sort(
    (left, right) =>
      right.confidence - left.confidence ||
      execution.result.mechanisms.indexOf(left) -
        execution.result.mechanisms.indexOf(right),
  );
  const bySupport = (
    targetIds: string[],
  ): V3Mechanism | undefined => {
    if (targetIds.length === 0) return undefined;
    const candidates = ranked.filter(
      (mechanism) =>
        overlap(sourceIds(mechanism, evidenceById), targetIds) > 0,
    );
    if (candidates.length === 0) return undefined;
    return [...candidates].sort((left, right) => {
      const supportDelta =
        overlap(sourceIds(right, evidenceById), targetIds) -
        overlap(sourceIds(left, evidenceById), targetIds);
      return supportDelta || right.confidence - left.confidence;
    })[0];
  };

  return {
    ranked,
    trueMechanism: bySupport(hidden.trueSourceIds),
    falseMechanism: bySupport(hidden.falseSourceIds),
  };
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is UnknownRecord =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function text(value: unknown): string {
  return stable(value).toLowerCase();
}

function evidenceAncestry(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(evidenceAncestry);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as UnknownRecord).flatMap(([key, item]) => {
    if (/evidenceids$/i.test(key) && Array.isArray(item)) {
      return item.filter((entry): entry is string => typeof entry === "string");
    }
    return evidenceAncestry(item);
  });
}

function score(
  execution: Execution,
  hidden: HiddenGroundTruth,
): PolicyScore {
  const { ranked, trueMechanism, falseMechanism } = findMechanismRanks(
    execution,
    hidden,
  );
  const rank = (mechanism?: V3Mechanism): number =>
    mechanism ? ranked.indexOf(mechanism) + 1 : ranked.length + 1;
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const conditions = records(memory.organizationalConditions);
  const trueConditionIndex = conditions.findIndex((condition) =>
    text(condition).includes(hidden.trueCondition),
  );
  const primaryConstraint = memory.primaryExecutiveConstraint;
  const recommendation = memory.executiveRecommendation;
  const recommendationText = text(recommendation);
  const explanationIds = new Set(
    evidenceAncestry([
      memory.executiveAssessment,
      primaryConstraint,
      recommendation,
    ]).map((id) => id.toLowerCase()),
  );
  const trueEvidenceIds = execution.result.evidence
    .filter((item) => hidden.trueSourceIds.includes(item.sourceId ?? ""))
    .map((item) => item.id.toLowerCase());
  const evidenceById = new Map(
    execution.result.evidence.map((item) => [item.id, item]),
  );
  const independentSupport = trueMechanism
    ? overlap(sourceIds(trueMechanism, evidenceById), hidden.trueSourceIds)
    : 0;
  const trueRank = rank(trueMechanism);
  const falseRank = rank(falseMechanism);
  const conditionConfidence =
    trueConditionIndex >= 0 &&
    typeof conditions[trueConditionIndex].confidence === "number"
      ? Number(conditions[trueConditionIndex].confidence)
      : 0;

  return {
    mechanismSelected: trueRank === 1,
    trueMechanismRank: trueRank,
    falseMechanismRank: falseRank,
    confidenceMargin: Number(
      (
        (trueMechanism?.confidence ?? 0) -
        (falseMechanism?.confidence ?? 0)
      ).toFixed(4),
    ),
    independentSupport,
    duplicateSensitivity:
      falseMechanism && trueMechanism
        ? Math.max(0, falseMechanism.confidence - trueMechanism.confidence)
        : 0,
    trueConditionSelected: trueConditionIndex === 0,
    trueConditionRank:
      trueConditionIndex >= 0 ? trueConditionIndex + 1 : conditions.length + 1,
    primaryConstraintAccurate: text(primaryConstraint).includes(
      hidden.trueCondition,
    ),
    conditionConfidence,
    recommendationAligned: hidden.recommendationFamily.some((term) =>
      recommendationText.includes(term),
    ),
    explanationSupportFidelity:
      trueEvidenceIds.length === 0
        ? 1
        : trueEvidenceIds.filter((id) => explanationIds.has(id)).length /
          trueEvidenceIds.length,
    riskCount: Array.isArray(
      (recommendation as UnknownRecord | undefined)?.risks,
    )
      ? ((recommendation as UnknownRecord).risks as unknown[]).length
      : 0,
    opportunityCount: Array.isArray(memory.investigationOpportunities)
      ? memory.investigationOpportunities.length
      : 0,
  };
}

function scoreValue(value: PolicyScore): number {
  return (
    Number(value.mechanismSelected) * 4 +
    Number(value.trueConditionSelected) * 3 +
    Number(value.primaryConstraintAccurate) * 3 +
    Number(value.recommendationAligned) * 2 +
    value.independentSupport +
    value.explanationSupportFidelity -
    value.duplicateSensitivity
  );
}

const policies: Policy[] = ["P0", "P1", "P2", "P3"];
const results = scenarios.map((scenario) => {
  const executions = Object.fromEntries(
    policies.map((policy) => {
      const first = execute(scenario, policy);
      const repeat = execute(scenario, policy);
      assert.equal(stable(first), stable(repeat));
      assert.equal(
        first.runtime.metadata.organizationId,
        repeat.runtime.metadata.organizationId,
      );
      return [policy, first];
    }),
  ) as Record<Policy, Execution>;

  const evidenceIds = policies.map((policy) =>
    executions[policy].result.evidence.map((item) => item.id),
  );
  for (const ids of evidenceIds.slice(1)) {
    assert.deepEqual(ids, evidenceIds[0]);
  }

  return {
    scenario,
    executions,
    scores: Object.fromEntries(
      policies.map((policy) => [
        policy,
        score(executions[policy], scenario.truth),
      ]),
    ) as Record<Policy, PolicyScore>,
  };
});

for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  for (const policy of policies) {
    assert.equal(
      stable(result.executions[policy].result),
      stable(expected.executions[policy].result),
    );
    assert.deepEqual(result.scores[policy], expected.scores[policy]);
  }
}

const totals = Object.fromEntries(
  policies.map((policy) => [
    policy,
    Number(
      results
        .reduce((sum, result) => sum + scoreValue(result.scores[policy]), 0)
        .toFixed(4),
    ),
  ]),
) as Record<Policy, number>;

const comparisons = [
  ["P0", "P1"],
  ["P1", "P2"],
  ["P2", "P3"],
  ["P0", "P3"],
] as const;

const comparisonResults = comparisons.map(([from, to]) => {
  let beneficial = 0;
  let neutral = 0;
  let harmful = 0;
  let arbitrary = 0;
  for (const result of results) {
    const delta =
      scoreValue(result.scores[to]) - scoreValue(result.scores[from]);
    if (delta > 0.0001) beneficial += 1;
    else if (delta < -0.0001) harmful += 1;
    else if (
      stable(result.scores[to]) !== stable(result.scores[from])
    )
      arbitrary += 1;
    else neutral += 1;
  }
  return { from, to, beneficial, neutral, harmful, arbitrary };
});

const p3MechanismGain = results.filter(
  (result) =>
    result.scores.P3.mechanismSelected &&
    !result.scores.P2.mechanismSelected,
).length;
const p3ConditionGain = results.filter(
  (result) =>
    result.scores.P3.trueConditionSelected &&
    !result.scores.P2.trueConditionSelected,
).length;
const p3Harm = comparisonResults.find(
  (item) => item.from === "P2" && item.to === "P3",
)!.harmful;
const identityStable = results.every((result) =>
  policies.every(
    (policy) =>
      result.executions[policy].runtime.metadata.organizationId ===
      `mechanism-ground-truth:${result.scenario.id}`,
  ),
);

const classification =
  !identityStable || p3Harm > 0
    ? "D — Unsafe"
    : p3MechanismGain > 0 && p3ConditionGain > 0
      ? "A — Mechanism boundary resolves causal fidelity"
      : p3MechanismGain > 0
        ? "B — Partial improvement, later ranking bottleneck"
        : "C — Evidence independence is not sufficient";

console.log("MECHANISM EVIDENCE COMPOSITION GROUND-TRUTH BENCHMARK");
console.log("");
console.log("scenario".padEnd(42), "P0", "P1", "P2", "P3");
for (const result of results) {
  console.log(
    result.scenario.id.padEnd(42),
    ...policies.map((policy) => scoreValue(result.scores[policy]).toFixed(2)),
  );
}
console.log("");
for (const policy of policies) {
  const mechanismHits = results.filter(
    (result) => result.scores[policy].mechanismSelected,
  ).length;
  const conditionHits = results.filter(
    (result) => result.scores[policy].trueConditionSelected,
  ).length;
  const constraintHits = results.filter(
    (result) => result.scores[policy].primaryConstraintAccurate,
  ).length;
  const recommendationHits = results.filter(
    (result) => result.scores[policy].recommendationAligned,
  ).length;
  const averageTrueRank =
    results.reduce(
      (sum, result) => sum + result.scores[policy].trueMechanismRank,
      0,
    ) / results.length;
  const averageConditionRank =
    results.reduce(
      (sum, result) => sum + result.scores[policy].trueConditionRank,
      0,
    ) / results.length;
  const averageConditionConfidence =
    results.reduce(
      (sum, result) => sum + result.scores[policy].conditionConfidence,
      0,
    ) / results.length;
  const independentSupport =
    results.reduce(
      (sum, result) => sum + result.scores[policy].independentSupport,
      0,
    ) / results.length;
  console.log(
    `${policy}: total=${totals[policy].toFixed(2)} mechanism=${mechanismHits}/${results.length} mechanismRank=${averageTrueRank.toFixed(2)} independentSupport=${independentSupport.toFixed(2)} condition=${conditionHits}/${results.length} conditionRank=${averageConditionRank.toFixed(2)} conditionConfidence=${averageConditionConfidence.toFixed(3)} constraint=${constraintHits}/${results.length} recommendation=${recommendationHits}/${results.length}`,
  );
}
console.log("");
for (const comparison of comparisonResults) {
  console.log(
    `${comparison.from}→${comparison.to}: beneficial=${comparison.beneficial} neutral=${comparison.neutral} harmful=${comparison.harmful} arbitrary=${comparison.arbitrary}`,
  );
}
console.log("");
for (const [from, to] of comparisons) {
  const recommendationChanges = results.filter(
    (result) =>
      stable(
        (
          result.executions[from].runtime.memory as unknown as UnknownRecord
        ).executiveRecommendation,
      ) !==
      stable(
        (
          result.executions[to].runtime.memory as unknown as UnknownRecord
        ).executiveRecommendation,
      ),
  ).length;
  const riskCountChanges = results.filter(
    (result) =>
      result.scores[from].riskCount !== result.scores[to].riskCount,
  ).length;
  const opportunityCountChanges = results.filter(
    (result) =>
      result.scores[from].opportunityCount !==
      result.scores[to].opportunityCount,
  ).length;
  console.log(
    `${from}→${to} executive consequences: recommendationChanges=${recommendationChanges} riskCountChanges=${riskCountChanges} opportunityCountChanges=${opportunityCountChanges}`,
  );
}
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Reverse record order: equivalent");
console.log("Reverse source order: equivalent");
console.log("Evidence identities: stable");
console.log("Organization identities: stable");
