import assert from "node:assert/strict";

import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import {
  atlasDecisiveEvidenceIds,
  atlasFullCorpusPerspective,
  atlasIndustrialArtifacts,
  atlasIndustrialGroundTruth,
  atlasIndustrialOrganization,
} from "./atlasIndustrialPilot";
import type {
  JudgmentLabOutput,
  SyntheticEvidenceArtifact,
} from "./contracts";
import { buildJudgmentScorecard } from "./evaluateJudgment";

const fixedTimestamp = "2026-07-01T12:00:00.000Z";
const delayedTimestamp = "2026-07-08T12:00:00.000Z";
const sourceFixtureSignature = JSON.stringify(atlasIndustrialArtifacts);

type UnknownRecord = Record<string, unknown>;
type ArtifactTransform = (artifacts: SyntheticEvidenceArtifact[]) => SyntheticEvidenceArtifact[];

type CognitiveTrace = {
  evidence: string[];
  observations: string[];
  signals: string[];
  contradictions: string[];
  themes: string[];
  phenomena: string[];
  mechanisms: string[];
  beliefs: string[];
  theories: string[];
  conditions: string[];
  dominantJudgment?: string;
  confidence?: number;
  confidenceExplanation?: string;
  missingInformation: string[];
  investigationPriority?: string;
  recommendation?: string;
  explanation?: string;
  supportingEvidenceIds: string[];
  candidateRanking: string[];
};

type DiagnosticRun = {
  id: string;
  artifactIds: string[];
  trace: CognitiveTrace;
  output: JudgmentLabOutput;
  evaluator: Record<string, number>;
  runtimeSignature: string;
};

type Comparison = {
  condition: "same" | "changed";
  mechanism: "same" | "changed";
  theory: "same" | "changed";
  contradictions: "same" | "changed";
  confidenceDelta: number;
  confidenceExplanation: "same" | "changed";
  missingInformation: "same" | "changed";
  investigation: "same" | "changed";
  recommendation: "same" | "changed";
  explanation: "same" | "changed";
  lineage: "same" | "changed";
  ranking: "same" | "changed";
  evaluator: "same" | "changed";
};

const record = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? value as UnknownRecord : {};
const records = (value: unknown): UnknownRecord[] =>
  Array.isArray(value) ? value.map(record) : [];
const strings = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
const text = (...values: unknown[]): string | undefined =>
  values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  )?.trim();
const number = (...values: unknown[]): number | undefined =>
  values.find((value): value is number => typeof value === "number");
const stable = (value: unknown): string => JSON.stringify(value);
const same = (left: unknown, right: unknown): "same" | "changed" =>
  stable(left) === stable(right) ? "same" : "changed";

function label(item: UnknownRecord): string {
  return text(
    item.id,
    item.title,
    item.label,
    item.statement,
    item.summary,
    item.description,
  ) ?? "unlabeled";
}

function describe(item: UnknownRecord): string {
  const identity = label(item);
  const human = text(
    item.title,
    item.label,
    item.statement,
    item.summary,
    item.description,
  );
  const confidence = number(item.confidence, item.strength, item.score);
  const lineage = [
    ...strings(item.sourceEvidenceIds),
    ...strings(item.evidenceIds),
    ...strings(item.supportingEvidenceIds),
    ...strings(item.observationIds),
    ...strings(item.signalIds),
    ...strings(item.themeIds),
    ...strings(item.mechanismIds),
  ];
  return [
    identity,
    human && human !== identity ? `meaning=${human}` : undefined,
    confidence === undefined ? undefined : `confidence=${confidence}`,
    lineage.length ? `lineage=${[...new Set(lineage)].sort().join(",")}` : undefined,
  ].filter(Boolean).join(" | ");
}

function buildContext(
  artifacts: SyntheticEvidenceArtifact[],
  reverseEvidenceOrder = false,
): string {
  const selected = [...artifacts];
  if (reverseEvidenceOrder) selected.reverse();
  return selected.map((item) => [
    `Artifact: ${item.id}`,
    `Title: ${item.title}`,
    `Type: ${item.artifactType}`,
    `Author role: ${item.authorRole}`,
    `Created: ${item.createdAt}`,
    `Reliability: ${item.reliability}`,
    `Staleness: ${item.staleness}`,
    item.content,
  ].join("\n")).join("\n\n");
}

function extractTrace(
  result: ReturnType<typeof runDiscoveryV3>,
  runtime: ReturnType<typeof evolveOrganizationRuntime>,
): CognitiveTrace {
  const memory = record(runtime.memory);
  const understandingState = record(memory.organizationalUnderstandingState);
  const understanding = records(understandingState.currentUnderstandings)[0] ?? {};
  const constraint = record(memory.primaryExecutiveConstraint);
  const assessment = record(memory.executiveAssessment);
  const recommendation = record(memory.executiveRecommendation);
  const uncertainty = record(memory.organizationalUncertainty);
  const communication = record(memory.executiveCommunication);
  const mechanismNetwork = record(memory.mechanismNetwork);
  const mechanisms = records(mechanismNetwork.mechanisms);
  const phenomenaState = record(memory.organizationalPhenomenaState);
  const phenomena = records(phenomenaState.phenomena);
  const opportunities = records(memory.investigationOpportunities);
  const organizationState = record(memory.organizationalState);
  const primaryJudgment = record(assessment.primaryJudgment);

  return {
    evidence: records(result.evidence).map(describe),
    observations: records(result.observations).map(describe),
    signals: records(result.signals).map(describe),
    contradictions: records(result.contradictions).map(describe),
    themes: records(result.themes).map(describe),
    phenomena: phenomena.map(describe),
    mechanisms: mechanisms.map(describe),
    beliefs: records(memory.beliefs).map(describe),
    theories: records(memory.theories).map(describe),
    conditions: records(memory.organizationalConditions).map(describe),
    dominantJudgment: text(
      constraint.title,
      primaryJudgment.title,
      record(organizationState.primaryConstraint).title,
    ),
    confidence: number(
      recommendation.confidence,
      constraint.confidence,
      primaryJudgment.confidence,
    ),
    confidenceExplanation: text(
      recommendation.confidenceRationale,
      uncertainty.confidenceExplanation,
      constraint.confidenceExplanation,
    ),
    missingInformation: opportunities.flatMap((item) =>
      strings(item.missingEvidence)
    ),
    investigationPriority: opportunities[0]
      ? label(opportunities[0])
      : undefined,
    recommendation: text(
      recommendation.headline,
      recommendation.executiveRecommendation,
    ),
    explanation: text(
      communication.executiveSummary,
      communication.headline,
      understanding.statement,
      understanding.summary,
    ),
    supportingEvidenceIds: [
      ...strings(understanding.evidenceIds),
      ...strings(constraint.supportingEvidenceIds),
    ],
    candidateRanking: [
      ...strings(organizationState.rankedConditionIds),
      ...records(organizationState.rankedConditions).map(describe),
      ...records(assessment.candidateJudgments).map(describe),
    ],
  };
}

function outputFromTrace(trace: CognitiveTrace): JudgmentLabOutput {
  return {
    dominantUnderstanding: trace.explanation,
    primaryConstraint: trace.dominantJudgment,
    causalMechanisms: trace.mechanisms.slice(0, 5),
    recommendation: trace.recommendation,
    confidence: trace.confidence,
    uncertainty: trace.contradictions.slice(0, 5),
    missingEvidence: trace.missingInformation.slice(0, 8),
    supportingEvidenceIds: trace.supportingEvidenceIds,
    communicationSummary: trace.explanation,
  };
}

function withFixedClock<T>(timestamp: string, work: () => T): T {
  const NativeDate = Date;
  const fixedTime = NativeDate.parse(timestamp);
  class FixedDate extends NativeDate {
    constructor(value?: string | number | Date) {
      super(value === undefined ? fixedTime : value);
    }
    static now(): number {
      return fixedTime;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return work();
  } finally {
    globalThis.Date = NativeDate;
  }
}

function runVariant(params: {
  id: string;
  artifacts: SyntheticEvidenceArtifact[];
  timestamp?: string;
  reverseEvidenceOrder?: boolean;
  priorRuntime?: ReturnType<typeof createEmptyOrganizationRuntime>;
}): {
  diagnostic: DiagnosticRun;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
} {
  return withFixedClock(params.timestamp ?? fixedTimestamp, () => {
    const context = buildContext(
      params.artifacts,
      params.reverseEvidenceOrder ?? false,
    );
    const input = {
      company: atlasIndustrialOrganization.name,
      website: "https://judgment-lab.invalid",
      industry: atlasIndustrialOrganization.industry,
      question: atlasIndustrialOrganization.investigationQuestion,
      context,
    };
    const originalLog = console.log;
    let result: ReturnType<typeof runDiscoveryV3>;
    let runtime: ReturnType<typeof evolveOrganizationRuntime>;
    try {
      console.log = () => undefined;
      result = runDiscoveryV3(input);
      runtime = evolveOrganizationRuntime({
        runtime: params.priorRuntime ?? createEmptyOrganizationRuntime({
          organizationId: atlasIndustrialOrganization.id,
          name: atlasIndustrialOrganization.name,
          industry: atlasIndustrialOrganization.industry,
        }),
        result,
        input,
      });
    } finally {
      console.log = originalLog;
    }
    const trace = extractTrace(result, runtime);
    const output = outputFromTrace(trace);
    const scorecard = buildJudgmentScorecard({
      run: {
        organizationId: atlasIndustrialOrganization.id,
        perspectiveId: atlasFullCorpusPerspective.id,
        fixedTimestamp: params.timestamp ?? fixedTimestamp,
        evidenceArtifactIds: params.artifacts.map((item) => item.id),
        engineInput: context,
        output,
      },
      groundTruth: atlasIndustrialGroundTruth,
      perspective: atlasFullCorpusPerspective,
      repeatedStable: true,
      orderStable: true,
      sensitivityObserved: "limited",
    });
    return {
      diagnostic: {
        id: params.id,
        artifactIds: params.artifacts.map((item) => item.id),
        trace,
        output,
        evaluator: Object.fromEntries(
          Object.entries(scorecard).map(([key, value]) => [key, value.score]),
        ),
        runtimeSignature: stable({
          organizationId: runtime.metadata.organizationId,
          evidence: trace.evidence,
          observations: trace.observations,
          signals: trace.signals,
          contradictions: trace.contradictions,
          themes: trace.themes,
          phenomena: trace.phenomena,
          mechanisms: trace.mechanisms,
          beliefs: trace.beliefs,
          theories: trace.theories,
          conditions: trace.conditions,
          output,
          ranking: trace.candidateRanking,
        }),
      },
      runtime,
    };
  });
}

function transform(transformer: ArtifactTransform): SyntheticEvidenceArtifact[] {
  return transformer(atlasIndustrialArtifacts.map((item) => ({ ...item })));
}

const withoutDecisive = transform((artifacts) =>
  artifacts.filter((item) => !atlasDecisiveEvidenceIds.includes(item.id))
);
const weakened = transform((artifacts) =>
  artifacts.map((item) =>
    atlasDecisiveEvidenceIds.includes(item.id)
      ? { ...item, reliability: "low", staleness: "stale" }
      : item
  )
);
const contradicted = transform((artifacts) => [
  ...artifacts,
  {
    id: "A17",
    organizationId: atlasIndustrialOrganization.id,
    title: "Independent decision-quality review",
    artifactType: "decision-log",
    authorRole: "Internal Audit",
    createdAt: "2026-06-17T12:00:00.000Z",
    reliability: "high",
    staleness: "current",
    content:
      "After controlling for decision complexity, routine delegated decisions had eighteen percent more defects than executive-reviewed decisions. Executive review did not add material elapsed time. The review concludes that escalation currently protects decision quality.",
  },
]);
const duplicated = transform((artifacts) => [
  ...artifacts,
  ...artifacts
    .filter((item) => atlasDecisiveEvidenceIds.includes(item.id))
    .map((item) => ({
      ...item,
      id: `${item.id}-duplicate`,
      title: `${item.title} duplicate`,
    })),
]);
const plausibleSubstitute = [
  ...withoutDecisive,
  {
    id: "A18",
    organizationId: atlasIndustrialOrganization.id,
    title: "Delegation workshop update",
    artifactType: "initiative-update" as const,
    authorRole: "Chief of Staff",
    createdAt: "2026-06-18T12:00:00.000Z",
    reliability: "moderate" as const,
    staleness: "current" as const,
    content:
      "Leaders attended a workshop about delegation and agreed that faster decisions are desirable. The workshop did not measure decision time, escalation frequency, decision quality, or actual changes in authority.",
  },
];
const supportingContextRemoved = transform((artifacts) =>
  artifacts.filter((item) => !["A08", "A10", "A16"].includes(item.id))
);
const irrelevant = transform((artifacts) => [
  ...artifacts,
  {
    id: "A19",
    organizationId: atlasIndustrialOrganization.id,
    title: "Office facilities update",
    artifactType: "other",
    authorRole: "Facilities",
    createdAt: "2026-06-19T12:00:00.000Z",
    reliability: "high",
    staleness: "current",
    content:
      "The main office completed scheduled lighting maintenance and replaced meeting-room chairs. No operating decisions, customer commitments, staffing levels, or delivery processes changed.",
  },
]);
const stale = transform((artifacts) =>
  artifacts.map((item) =>
    atlasDecisiveEvidenceIds.includes(item.id)
      ? {
          ...item,
          createdAt: "2023-06-01T12:00:00.000Z",
          staleness: "stale",
        }
      : item
  )
);

function diagnosticArtifact(
  id: string,
  title: string,
  content: string,
): SyntheticEvidenceArtifact {
  return {
    id,
    organizationId: atlasIndustrialOrganization.id,
    title,
    artifactType: "operating-review",
    authorRole: "Independent Operations Review",
    createdAt: `2026-06-${id.slice(-2)}T12:00:00.000Z`,
    reliability: "high",
    staleness: "current",
    content,
  };
}

const reversalBeforeArtifacts = [
  diagnosticArtifact(
    "R01",
    "Delivery capacity review",
    "Execution demand exceeds available capacity. Teams are overloaded, throughput is falling, delivery work is incomplete, and resource strain is persistent.",
  ),
  diagnosticArtifact(
    "R02",
    "Portfolio load review",
    "Too many active priorities compete for the same capacity. Work in progress is above the operating limit and delivery reliability is deteriorating.",
  ),
  diagnosticArtifact(
    "R03",
    "Staffing and workload review",
    "Current staffing appears insufficient for the committed workload. Overtime and resource contention are increasing across delivery teams.",
  ),
];
const reversalDecisiveArtifact = diagnosticArtifact(
  "R04",
  "Controlled flow-time study",
  "A controlled review found teams operating at fifty-five percent capacity. Ninety-one percent of delay occurred while completed work waited for executive approval. When approval was not required, the same teams delivered on time without additional staff. Decision authority and approval latency, not staffing or workload, explain the delay.",
);
const reversalAfterArtifacts = [
  ...reversalBeforeArtifacts,
  reversalDecisiveArtifact,
];

const baseline = runVariant({
  id: "baseline",
  artifacts: atlasIndustrialArtifacts,
}).diagnostic;
const variants = [
  runVariant({ id: "decisive-removed", artifacts: withoutDecisive }).diagnostic,
  runVariant({ id: "decisive-present", artifacts: atlasIndustrialArtifacts }).diagnostic,
  runVariant({ id: "decisive-weakened", artifacts: weakened }).diagnostic,
  runVariant({ id: "decisive-contradicted", artifacts: contradicted }).diagnostic,
  runVariant({ id: "decisive-duplicated", artifacts: duplicated }).diagnostic,
  runVariant({ id: "plausible-substitute", artifacts: plausibleSubstitute }).diagnostic,
  runVariant({
    id: "reversed-evidence-order",
    artifacts: [...atlasIndustrialArtifacts].reverse(),
    reverseEvidenceOrder: true,
  }).diagnostic,
  runVariant({
    id: "supporting-context-removed",
    artifacts: supportingContextRemoved,
  }).diagnostic,
  runVariant({ id: "irrelevant-evidence", artifacts: irrelevant }).diagnostic,
  runVariant({ id: "stale-decisive-evidence", artifacts: stale }).diagnostic,
];

const delayedStageOne = runVariant({
  id: "delayed-stage-one",
  artifacts: withoutDecisive,
});
const delayedStageTwo = runVariant({
  id: "decisive-delayed",
  artifacts: atlasIndustrialArtifacts.filter((item) =>
    atlasDecisiveEvidenceIds.includes(item.id)
  ),
  timestamp: delayedTimestamp,
  priorRuntime: delayedStageOne.runtime,
}).diagnostic;
variants.splice(4, 0, delayedStageTwo);

const reversalBefore = runVariant({
  id: "reversal-before-decisive",
  artifacts: reversalBeforeArtifacts,
}).diagnostic;
const reversalAfter = runVariant({
  id: "reversal-after-decisive",
  artifacts: reversalAfterArtifacts,
}).diagnostic;

function compare(left: DiagnosticRun, right: DiagnosticRun): Comparison {
  return {
    condition: same(left.trace.dominantJudgment, right.trace.dominantJudgment),
    mechanism: same(left.trace.mechanisms, right.trace.mechanisms),
    theory: same(left.trace.theories, right.trace.theories),
    contradictions: same(left.trace.contradictions, right.trace.contradictions),
    confidenceDelta: Number(
      ((right.trace.confidence ?? 0) - (left.trace.confidence ?? 0)).toFixed(6),
    ),
    confidenceExplanation: same(
      left.trace.confidenceExplanation,
      right.trace.confidenceExplanation,
    ),
    missingInformation: same(
      left.trace.missingInformation,
      right.trace.missingInformation,
    ),
    investigation: same(
      left.trace.investigationPriority,
      right.trace.investigationPriority,
    ),
    recommendation: same(
      left.trace.recommendation,
      right.trace.recommendation,
    ),
    explanation: same(left.trace.explanation, right.trace.explanation),
    lineage: same(
      left.trace.supportingEvidenceIds,
      right.trace.supportingEvidenceIds,
    ),
    ranking: same(left.trace.candidateRanking, right.trace.candidateRanking),
    evaluator: same(left.evaluator, right.evaluator),
  };
}

const comparisons = Object.fromEntries(
  variants.map((variant) => [variant.id, compare(baseline, variant)]),
);
comparisons["delayed-revision"] = compare(
  delayedStageOne.diagnostic,
  delayedStageTwo,
);

const repeatedBaseline = runVariant({
  id: "baseline",
  artifacts: atlasIndustrialArtifacts,
}).diagnostic;
const repeatedVariants = variants.map((variant) => {
  if (variant.id === "decisive-delayed") {
    const prior = runVariant({
      id: "delayed-stage-one",
      artifacts: withoutDecisive,
    });
    return runVariant({
      id: variant.id,
      artifacts: atlasIndustrialArtifacts.filter((item) =>
        atlasDecisiveEvidenceIds.includes(item.id)
      ),
      timestamp: delayedTimestamp,
      priorRuntime: prior.runtime,
    }).diagnostic;
  }
  const map: Record<string, { artifacts: SyntheticEvidenceArtifact[]; reverseEvidenceOrder?: boolean }> = {
    "decisive-removed": { artifacts: withoutDecisive },
    "decisive-present": { artifacts: atlasIndustrialArtifacts },
    "decisive-weakened": { artifacts: weakened },
    "decisive-contradicted": { artifacts: contradicted },
    "decisive-duplicated": { artifacts: duplicated },
    "plausible-substitute": { artifacts: plausibleSubstitute },
    "reversed-evidence-order": {
      artifacts: [...atlasIndustrialArtifacts].reverse(),
      reverseEvidenceOrder: true,
    },
    "supporting-context-removed": { artifacts: supportingContextRemoved },
    "irrelevant-evidence": { artifacts: irrelevant },
    "stale-decisive-evidence": { artifacts: stale },
  };
  return runVariant({ id: variant.id, ...map[variant.id] }).diagnostic;
});
const repeatedReversalBefore = runVariant({
  id: "reversal-before-decisive",
  artifacts: reversalBeforeArtifacts,
}).diagnostic;
const repeatedReversalAfter = runVariant({
  id: "reversal-after-decisive",
  artifacts: reversalAfterArtifacts,
}).diagnostic;

assert.equal(sourceFixtureSignature, JSON.stringify(atlasIndustrialArtifacts));
assert.equal(baseline.runtimeSignature, repeatedBaseline.runtimeSignature);
assert.deepEqual(
  variants.map((item) => item.runtimeSignature),
  repeatedVariants.map((item) => item.runtimeSignature),
);
assert.equal(
  reversalBefore.runtimeSignature,
  repeatedReversalBefore.runtimeSignature,
);
assert.equal(
  reversalAfter.runtimeSignature,
  repeatedReversalAfter.runtimeSignature,
);
assert.equal(
  variants.find((item) => item.id === "reversed-evidence-order")
    ?.runtimeSignature,
  baseline.runtimeSignature,
);
assert.equal(baseline.output.primaryConstraint, "Decision Flow");
assert.equal(baseline.output.recommendation, "Delegate routine decision authority.");

const report = {
  fixedTimestamp,
  organizationId: atlasIndustrialOrganization.id,
  hiddenGroundTruthPassedToEngine: false,
  decisiveEvidence: atlasIndustrialArtifacts
    .filter((item) => atlasDecisiveEvidenceIds.includes(item.id))
    .map((item) => ({
      id: item.id,
      reliability: item.reliability,
      staleness: item.staleness,
      content: item.content,
    })),
  baseline: {
    artifactIds: baseline.artifactIds,
    trace: baseline.trace,
    evaluator: baseline.evaluator,
  },
  variants: variants.map((variant) => ({
    id: variant.id,
    artifactIds: variant.artifactIds,
    trace: variant.trace,
    evaluator: variant.evaluator,
    versusBaseline: comparisons[variant.id],
  })),
  delayedStageOne: {
    trace: delayedStageOne.diagnostic.trace,
    evaluator: delayedStageOne.diagnostic.evaluator,
  },
  delayedRevision: comparisons["delayed-revision"],
  multiScenario: {
    reversal: {
      hiddenRealityBefore:
        "The available evidence attributes delay to workload exceeding execution capacity.",
      hiddenRealityAfter:
        "A high-reliability controlled comparison isolates approval waiting and rules out capacity as the binding cause.",
      expectedResponse:
        "The dominant conclusion should move from Execution Capacity toward Decision Flow; confidence in the capacity explanation should fall.",
      before: reversalBefore.trace,
      after: reversalAfter.trace,
      comparison: compare(reversalBefore, reversalAfter),
    },
    confidenceWithoutReversal: {
      variantId: "decisive-contradicted",
      expectedResponse:
        "Preserve competing explanations and materially reduce confidence in the unchanged decision-authority conclusion.",
    },
    investigationChange: {
      variantId: "decisive-removed",
      expectedResponse:
        "Retain a plausible conclusion but prioritize direct decision-cycle and delegated-quality evidence.",
    },
    duplicateControl: {
      variantId: "decisive-duplicated",
      expectedResponse:
        "Do not treat verbatim copies as independent corroboration.",
    },
    plausibleControl: {
      variantId: "plausible-substitute",
      expectedResponse:
        "Do not treat an unmeasured delegation workshop as diagnostic evidence.",
    },
    longitudinalRevision: {
      variantId: "decisive-delayed",
      expectedResponse:
        "Revise prior understanding proportionately while preserving history and organization identity.",
    },
  },
  robustness: {
    repeatedBaselineStable:
      baseline.runtimeSignature === repeatedBaseline.runtimeSignature,
    repeatedMatrixStable: variants.every(
      (variant, index) =>
        variant.runtimeSignature === repeatedVariants[index].runtimeSignature,
    ),
    repeatedReversalStable:
      reversalBefore.runtimeSignature === repeatedReversalBefore.runtimeSignature &&
      reversalAfter.runtimeSignature === repeatedReversalAfter.runtimeSignature,
    reversedEvidenceOrderStable:
      variants.find((item) => item.id === "reversed-evidence-order")
        ?.runtimeSignature === baseline.runtimeSignature,
    fixtureUnchanged:
      sourceFixtureSignature === JSON.stringify(atlasIndustrialArtifacts),
    organizationIdentityPreserved: [
      baseline,
      ...variants,
    ].every((item) => item.runtimeSignature.includes(atlasIndustrialOrganization.id)),
    runtimeFilesWritten: false,
  },
};

console.log("JUDGMENT LAB DECISIVE-EVIDENCE ABLATION");
console.log(JSON.stringify(report, null, 2));
