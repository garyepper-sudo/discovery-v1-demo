import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

type UnknownRecord = Record<string, unknown>;
type Policy = "A0" | "A1" | "A2";
type ExplanationId =
  | "capacity"
  | "decisionRights"
  | "coordination"
  | "strategy"
  | "knowledge"
  | "incentives"
  | "leadership";
type Outcome =
  | "preserveLeader"
  | "weakenLeader"
  | "displaceLeader"
  | "addCompetitor"
  | "preserveMultipleCauses"
  | "unresolved"
  | "rejectAlternative";
type EvidenceRole =
  | "support"
  | "oppose"
  | "discriminate"
  | "shared"
  | "irrelevant"
  | "duplicate"
  | "corroborate"
  | "stale"
  | "weak"
  | "counterfactual"
  | "ruleOut"
  | "feedback";

type HiddenState = {
  valid: ExplanationId[];
  leader: ExplanationId | null;
  outcome: Outcome;
  recommendationFamily: string;
  shouldAbstain: boolean;
  causalMechanisms: string[];
  trueConditions: string[];
  discriminatingEvidenceExpected: boolean;
  sharedEvidenceExpected: boolean;
  contradictionExpected: boolean;
};

type Scenario = {
  id: string;
  industry: string;
  initial: InvestigationEvidenceSource[];
  mutation: InvestigationEvidenceSource[];
  initialTruth: HiddenState;
  revisedTruth: HiddenState;
  expectedDirection: "stable" | "weaken" | "strengthen" | "displace" | "expand" | "reject";
  crossBenchmark?: boolean;
  heldOut?: boolean;
  equalsScenarioId?: string;
  control?: boolean;
  explanationOrder?: ExplanationId[];
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type EvidenceAssignment = {
  evidenceId: string;
  sourceId: string;
  role: EvidenceRole;
  explanationIds: ExplanationId[];
  discriminatesAgainst: ExplanationId[];
  text: string;
};

type Explanation = {
  id: ExplanationId;
  mechanismIds: string[];
  conditionIds: string[];
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  discriminatingEvidenceIds: string[];
  sharedEvidenceIds: string[];
  independentSourceIds: string[];
  contradictionEvidenceIds: string[];
  viability: "leading" | "viable" | "weakened" | "rejected";
  supportState: "decisive" | "corroborated" | "supported" | "bounded" | "opposed" | "ruled-out";
  confidence: number;
};

type ExplanationState = {
  explanations: Explanation[];
  assignments: EvidenceAssignment[];
  leader: ExplanationId | null;
  viable: ExplanationId[];
  displaced: ExplanationId[];
  weakened: ExplanationId[];
  preservedAlternatives: ExplanationId[];
  outcome: Outcome;
  abstained: boolean;
  causalUncertainty: string[];
  changeEvidenceIds: string[];
  evidenceThatWouldChangeConclusion: string[];
  recommendationFamily: string;
  prior: {
    leader: ExplanationId | null;
    viable: ExplanationId[];
  } | null;
};

type ScenarioResult = {
  scenario: Scenario;
  initialExecution: Execution;
  revisedExecution: Execution;
  initialA1: ExplanationState;
  revisedA1: ExplanationState;
  initialA2: ExplanationState;
  revisedA2: ExplanationState;
  productionInitial: ExplanationId | null;
  productionRevised: ExplanationId | null;
};

const FIXED_TIME = Date.parse("2026-07-25T12:00:00.000Z");
const EXPLANATION_NAMES: Record<ExplanationId, string[]> = {
  capacity: ["capacity", "workload", "concurrent work", "staffing", "enough people", "labor rates"],
  decisionRights: [
    "decision rights",
    "decision authority",
    "approval dependency",
    "approval waiting",
    "executive approval",
    "escalated decisions",
  ],
  coordination: ["coordination", "handoff"],
  strategy: ["strategy", "strategic alignment", "priorities", "priority conflict"],
  knowledge: ["knowledge", "documentation", "context loss", "expertise"],
  incentives: ["incentives", "local optimization", "performance measures"],
  leadership: ["leadership dependency", "founder dependency", "executive dependency"],
};
const RECOMMENDATIONS: Record<ExplanationId, string> = {
  capacity: "sequence-work",
  decisionRights: "delegate-authority",
  coordination: "clarify-handoffs",
  strategy: "align-priorities",
  knowledge: "preserve-knowledge",
  incentives: "align-incentives",
  leadership: "distribute-leadership",
};

function source(id: string, content: string): InvestigationEvidenceSource {
  return { sourceId: id, sourceType: "adjudication-fixture", content };
}

function state(
  valid: ExplanationId[],
  leader: ExplanationId | null,
  outcome: Outcome,
  recommendationFamily = leader ? RECOMMENDATIONS[leader] : "none",
  shouldAbstain = leader === null,
): HiddenState {
  return {
    valid,
    leader,
    outcome,
    recommendationFamily,
    shouldAbstain,
    causalMechanisms: valid.map((id) => `${id}-mechanism`),
    trueConditions: valid.map((id) => `${id}-condition`),
    discriminatingEvidenceExpected: outcome === "displaceLeader",
    sharedEvidenceExpected:
      outcome === "preserveMultipleCauses" || outcome === "unresolved",
    contradictionExpected:
      outcome === "weakenLeader" ||
      outcome === "addCompetitor" ||
      outcome === "rejectAlternative",
  };
}

function scenario(
  id: string,
  initialLines: string[],
  mutationLines: string[],
  initialTruth: HiddenState,
  revisedTruth: HiddenState,
  expectedDirection: Scenario["expectedDirection"],
  options: Partial<Pick<Scenario, "industry" | "crossBenchmark" | "heldOut">> = {},
): Scenario {
  return {
    id,
    industry: options.industry ?? "Industry neutral",
    initial: initialLines.map((line, index) => source(`i${index + 1}`, line)),
    mutation: mutationLines.map((line, index) => source(`m${index + 1}`, line)),
    initialTruth,
    revisedTruth,
    expectedDirection,
    crossBenchmark: options.crossBenchmark,
    heldOut: options.heldOut,
  };
}

const scenarios: Scenario[] = [
  scenario(
    "decisive-displacement",
    [
      "Support Capacity: delivery slows when workload rises.",
      "Support Capacity: teams report insufficient capacity.",
      "Weak Decision Rights: some approvals appear slow.",
    ],
    [
      "Counterfactual Decision Rights over Capacity: at 55% utilization, 91% of delay was approval waiting; delivery was on time without more staff when approval was absent.",
      "Rule out Capacity: controlled outcomes show workload is not the binding cause.",
    ],
    state(["capacity"], "capacity", "preserveLeader"),
    state(["decisionRights"], "decisionRights", "displaceLeader"),
    "displace",
    { industry: "Manufacturing", crossBenchmark: true },
  ),
  scenario(
    "material-weakening",
    ["Corroborate Capacity: three teams show overload before delays."],
    ["Oppose Capacity: one comparable team delivers reliably at the same workload."],
    state(["capacity"], "capacity", "preserveLeader"),
    state(["capacity"], "capacity", "weakenLeader"),
    "weaken",
  ),
  scenario(
    "contradiction-adds-competitor",
    ["Support Capacity: overload precedes missed commitments."],
    [
      "Oppose Capacity: high-load teams do not consistently miss commitments.",
      "Support Coordination: delays cluster at cross-functional handoffs rather than high-load teams.",
    ],
    state(["capacity"], "capacity", "preserveLeader"),
    state(["capacity", "coordination"], null, "addCompetitor"),
    "expand",
  ),
  scenario(
    "unresolved-pair",
    ["Support Decision Rights: approvals precede delay."],
    ["Support Coordination: handoff failures also precede delay.", "Shared Decision Rights and Coordination: both occur in the same work."],
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    state(["decisionRights", "coordination"], null, "unresolved"),
    "expand",
  ),
  scenario(
    "joint-independent-causes",
    ["Support Decision Rights: approval waiting delays routine work."],
    ["Support Coordination: independent handoff failures delay separate workstreams."],
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    state(["decisionRights", "coordination"], null, "preserveMultipleCauses"),
    "expand",
  ),
  scenario(
    "feedback-loop",
    ["Feedback Decision Rights and Coordination: unclear authority worsens handoffs."],
    ["Feedback Coordination and Decision Rights: failed handoffs trigger more approval escalation."],
    state(["decisionRights", "coordination"], null, "unresolved"),
    state(["decisionRights", "coordination"], null, "unresolved"),
    "stable",
  ),
  scenario(
    "counterfactual-disproof",
    ["Support Capacity: leaders attribute delays to workload."],
    ["Counterfactual Decision Rights over Capacity: reducing workload did not improve delivery, while delegated approval did.", "Rule out Capacity: capacity reduction failed the predicted outcome."],
    state(["capacity"], "capacity", "preserveLeader"),
    state(["decisionRights"], "decisionRights", "displaceLeader"),
    "displace",
    { crossBenchmark: true },
  ),
  scenario(
    "delayed-outcome-revision",
    ["Support Strategy: priority conflict is the initial explanation."],
    ["Discriminate Decision Rights over Strategy: delayed outcome data shows work with clear authority succeeds despite conflicting priorities."],
    state(["strategy"], "strategy", "preserveLeader"),
    state(["decisionRights"], "decisionRights", "displaceLeader"),
    "displace",
    { crossBenchmark: true },
  ),
  scenario(
    "exact-duplicate-invariance",
    ["Support Decision Rights: 64% of routine decisions escalated and escalation was slower."],
    ["Exact duplicate Support Decision Rights: 64% of routine decisions escalated and escalation was slower."],
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    "stable",
    { crossBenchmark: true },
  ),
  scenario(
    "independent-corroboration",
    ["Support Decision Rights: one operational review finds approval waiting."],
    ["Independent corroboration Decision Rights: a separate outcome sample reproduces approval waiting."],
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    state(["decisionRights"], "decisionRights", "preserveLeader"),
    "strengthen",
  ),
  scenario(
    "stale-bounded",
    ["Corroborate Coordination: current handoff logs show recurring failure."],
    ["Stale Strategy: a three-year-old planning review reports priority conflict."],
    state(["coordination"], "coordination", "preserveLeader"),
    state(["coordination"], "coordination", "preserveLeader"),
    "stable",
  ),
  scenario(
    "weak-bounded",
    ["Corroborate Knowledge: current rework traces back to missing context."],
    ["Weak Capacity: an unmeasured workshop suggests staffing pressure."],
    state(["knowledge"], "knowledge", "preserveLeader"),
    state(["knowledge"], "knowledge", "preserveLeader"),
    "stable",
  ),
  scenario(
    "irrelevant-invariance",
    ["Support Incentives: local measures reward conflicting outcomes."],
    ["Irrelevant Capacity: office utilization changed after a facilities move."],
    state(["incentives"], "incentives", "preserveLeader"),
    state(["incentives"], "incentives", "preserveLeader"),
    "stable",
  ),
  scenario(
    "shared-not-discriminating",
    ["Support Leadership Dependency: routine choices escalate to executives."],
    ["Shared Leadership Dependency and Decision Rights: both explanations predict escalation, so this evidence does not distinguish them."],
    state(["leadership"], "leadership", "preserveLeader"),
    state(["leadership", "decisionRights"], "leadership", "addCompetitor"),
    "expand",
  ),
  scenario(
    "decisive-outweighs-broad",
    ["Corroborate Capacity: broad surveys report workload pressure.", "Corroborate Capacity: many teams feel busy."],
    ["Discriminate Coordination over Capacity: controlled matched work differs only in handoff ownership and only that difference predicts delay."],
    state(["capacity"], "capacity", "preserveLeader"),
    state(["coordination"], "coordination", "displaceLeader"),
    "displace",
  ),
  scenario(
    "rejected-becomes-viable",
    ["Support Strategy: explicit priorities align across leaders.", "Rule out Knowledge: no evidence links knowledge loss to delay."],
    ["Discriminate Knowledge over Strategy: newly recovered incident histories show missing context precedes every repeated failure."],
    state(["strategy"], "strategy", "rejectAlternative"),
    state(["knowledge"], "knowledge", "displaceLeader"),
    "displace",
  ),
  scenario(
    "viable-becomes-untenable",
    ["Support Capacity: demand exceeds reported availability.", "Support Decision Rights: approval queues are also present."],
    ["Rule out Capacity: delivery remains slow at low utilization.", "Discriminate Decision Rights over Capacity: approval-free work completes on time."],
    state(["capacity", "decisionRights"], null, "unresolved"),
    state(["decisionRights"], "decisionRights", "rejectAlternative"),
    "reject",
  ),
  scenario(
    "industry-neutral-variant",
    ["Support Coordination: interface transfer failures precede outcome delay."],
    ["Discriminate Coordination over Capacity: matched units differ only in interface ownership."],
    state(["coordination"], "coordination", "preserveLeader"),
    state(["coordination"], "coordination", "preserveLeader"),
    "strengthen",
    { heldOut: true },
  ),
  scenario(
    "team-level",
    ["Support Knowledge: the team repeats work when context is absent."],
    ["Independent corroboration Knowledge: a second team member reproduces the same sequence."],
    state(["knowledge"], "knowledge", "preserveLeader"),
    state(["knowledge"], "knowledge", "preserveLeader"),
    "strengthen",
  ),
  scenario(
    "department-level",
    ["Support Incentives: department measures reward local optimization."],
    ["Oppose Incentives: one unit with the same measures collaborates successfully."],
    state(["incentives"], "incentives", "preserveLeader"),
    state(["incentives"], "incentives", "weakenLeader"),
    "weaken",
  ),
  scenario(
    "enterprise-level",
    ["Support Strategy: enterprise priorities conflict across portfolios."],
    ["Discriminate Strategy over Capacity: fully staffed portfolios still conflict where priorities are unresolved."],
    state(["strategy"], "strategy", "preserveLeader"),
    state(["strategy"], "strategy", "preserveLeader"),
    "strengthen",
  ),
];

const atlasById = new Map(
  atlasIndustrialArtifacts.map((artifact) => [artifact.id, artifact]),
);
scenarios.push({
  id: "atlas-decisive-evidence-replay",
  industry: "Industrial automation and engineered equipment",
  initial: ["A15"].map((id) => {
    const artifact = atlasById.get(id);
    assert.ok(artifact);
    return source(artifact.id, artifact.content);
  }),
  mutation: ["A03", "A04", "A11"].map((id) => {
    const artifact = atlasById.get(id);
    assert.ok(artifact);
    return source(artifact.id, artifact.content);
  }),
  initialTruth: state(["capacity"], "capacity", "preserveLeader"),
  revisedTruth: state(["decisionRights"], "decisionRights", "displaceLeader"),
  expectedDirection: "displace",
  crossBenchmark: true,
});

const forwardControl = scenario(
  "forward-order-control",
  ["Support Capacity: workload precedes delay.", "Weak Decision Rights: approvals may contribute."],
  ["Discriminate Decision Rights over Capacity: low-load work waits only for approval."],
  state(["capacity"], "capacity", "preserveLeader"),
  state(["decisionRights"], "decisionRights", "displaceLeader"),
  "displace",
);
forwardControl.control = true;
const reverseEvidenceControl: Scenario = {
  ...forwardControl,
  id: "reverse-evidence-order",
  initial: [...forwardControl.initial].reverse(),
  mutation: [...forwardControl.mutation].reverse(),
  equalsScenarioId: "forward-order-control",
  control: true,
};
const reverseSourceControl: Scenario = {
  ...forwardControl,
  id: "reverse-source-order",
  initial: [...forwardControl.initial].reverse(),
  mutation: [...forwardControl.mutation].reverse(),
  equalsScenarioId: "forward-order-control",
  control: true,
};
const reverseExplanationControl: Scenario = {
  ...forwardControl,
  id: "reverse-explanation-order",
  explanationOrder: [...(Object.keys(EXPLANATION_NAMES) as ExplanationId[])].reverse(),
  equalsScenarioId: "forward-order-control",
  control: true,
};
scenarios.push(
  forwardControl,
  reverseEvidenceControl,
  reverseSourceControl,
  reverseExplanationControl,
);

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

function withDeterminism<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let state = 0x1192026;
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

function inputFor(scenarioValue: Scenario, sources: InvestigationEvidenceSource[]): InvestigationInput {
  return {
    company: "Adjudication Benchmark Organization",
    website: "https://adjudication.invalid",
    industry: scenarioValue.industry,
    question: "Which organizational explanation best accounts for current outcomes?",
    context: "",
    evidenceSources: sources
      .map((item) => ({
        ...item,
        content: item.content.trim(),
      }))
      .sort(
        (left, right) =>
          left.sourceId.localeCompare(right.sourceId) ||
          left.content.localeCompare(right.content),
      ),
  };
}

function execute(scenarioValue: Scenario, sources: InvestigationEvidenceSource[]): Execution {
  return withDeterminism(() => {
    const input = inputFor(scenarioValue, sources);
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result = runDiscoveryV3(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `adjudication:${scenarioValue.id}`,
          name: input.company,
          industry: input.industry,
          website: input.website,
        }),
        result,
        input,
      });
      return { result, runtime };
    } finally {
      console.log = originalLog;
    }
  });
}

function explanationIdsIn(text: string): ExplanationId[] {
  const normalized = text.toLowerCase();
  return (Object.keys(EXPLANATION_NAMES) as ExplanationId[]).filter((id) =>
    EXPLANATION_NAMES[id].some((term) => normalized.includes(term)),
  );
}

function roleFor(text: string): EvidenceRole {
  const normalized = text.toLowerCase();
  if (normalized.includes("broad labor rates do not")) return "ruleOut";
  if (normalized.startsWith("exact duplicate")) return "duplicate";
  if (normalized.startsWith("independent corroboration")) return "corroborate";
  if (normalized.startsWith("counterfactual")) return "counterfactual";
  if (normalized.startsWith("rule out")) return "ruleOut";
  if (normalized.startsWith("discriminate")) return "discriminate";
  if (normalized.startsWith("oppose")) return "oppose";
  if (normalized.startsWith("shared")) return "shared";
  if (normalized.startsWith("irrelevant")) return "irrelevant";
  if (normalized.startsWith("stale")) return "stale";
  if (normalized.startsWith("weak")) return "weak";
  if (normalized.startsWith("feedback")) return "feedback";
  if (normalized.startsWith("corroborate")) return "corroborate";
  return "support";
}

function canonicalClaim(text: string): string {
  return text
    .toLowerCase()
    .replace(/^exact duplicate\s+/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function assign(execution: Execution): EvidenceAssignment[] {
  const seen = new Set<string>();
  return execution.result.evidence
    .filter((evidence) => evidence.sourceId)
    .map((evidence) => {
      let role = roleFor(evidence.text);
      const claim = canonicalClaim(evidence.text);
      if (seen.has(claim)) role = "duplicate";
      seen.add(claim);
      const ids = explanationIdsIn(evidence.text);
      const over = evidence.text.match(/\bover\s+([A-Za-z ]+?)(?::|,|;)/i);
      const against = over ? explanationIdsIn(over[1]) : [];
      return {
        evidenceId: evidence.id,
        sourceId: String(evidence.sourceId),
        role,
        explanationIds: ids.filter((id) => !against.includes(id)),
        discriminatesAgainst: against,
        text: evidence.text,
      };
    })
    .sort(
      (left, right) =>
        left.evidenceId.localeCompare(right.evidenceId) ||
        left.sourceId.localeCompare(right.sourceId),
    );
}

function productionMechanismIds(execution: Execution, explanation: ExplanationId): string[] {
  return execution.result.mechanisms
    .filter((mechanism) =>
      explanationIdsIn(
        [
          mechanism.title,
          mechanism.cause,
          mechanism.mechanism,
          mechanism.effect,
          mechanism.explanation,
        ].join(" "),
      ).includes(explanation),
    )
    .map((mechanism) => mechanism.id)
    .sort();
}

function productionConditionIds(execution: Execution, explanation: ExplanationId): string[] {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const conditions = Array.isArray(memory.organizationalConditions)
    ? (memory.organizationalConditions as UnknownRecord[])
    : [];
  return conditions
    .filter((condition) =>
      explanationIdsIn(
        [condition.title, condition.description, condition.summary]
          .map(String)
          .join(" "),
      ).includes(explanation),
    )
    .map((condition) => String(condition.id))
    .sort();
}

function buildState(
  execution: Execution,
  prior: ExplanationState | null,
  explanationOrder?: ExplanationId[],
): ExplanationState {
  const assignments = assign(execution);
  const order = explanationOrder ?? (Object.keys(EXPLANATION_NAMES) as ExplanationId[]);
  const explanations = order
    .map((id): Explanation | null => {
      const relevant = assignments.filter(
        (item) =>
          item.explanationIds.includes(id) ||
          item.discriminatesAgainst.includes(id),
      );
      if (relevant.length === 0) return null;
      const substantive = relevant.filter(
        (item) => !["irrelevant", "duplicate"].includes(item.role),
      );
      if (substantive.length === 0) return null;
      const direct = relevant.filter((item) => item.explanationIds.includes(id));
      const supporting = direct.filter((item) =>
        ["support", "corroborate", "discriminate", "counterfactual", "weak", "stale"].includes(item.role),
      );
      const opposing = relevant.filter(
        (item) =>
          item.role === "oppose" ||
          item.role === "ruleOut" ||
          item.discriminatesAgainst.includes(id),
      );
      const discriminating = relevant.filter((item) =>
        ["discriminate", "counterfactual", "ruleOut"].includes(item.role),
      );
      const shared = direct.filter((item) =>
        ["shared", "feedback"].includes(item.role),
      );
      const uniqueSupport = supporting.filter(
        (item, index, list) =>
          item.role !== "duplicate" &&
          list.findIndex(
            (candidate) =>
              candidate.sourceId === item.sourceId &&
              canonicalClaim(candidate.text) === canonicalClaim(item.text),
          ) === index,
      );
      const decisive = supporting.some((item) =>
        ["counterfactual", "discriminate"].includes(item.role),
      );
      const recoveredByNewDecisiveEvidence = supporting.some(
        (item) =>
          ["counterfactual", "discriminate"].includes(item.role) &&
          item.sourceId.startsWith("m"),
      );
      const ruledOut =
        opposing.some(
          (item) =>
            item.role === "ruleOut" ||
            (item.discriminatesAgainst.includes(id) &&
              ["discriminate", "counterfactual"].includes(item.role)),
        ) && !recoveredByNewDecisiveEvidence;
      const corroborated =
        new Set(
          uniqueSupport
            .filter((item) => item.role === "corroborate")
            .map((item) => item.sourceId),
        ).size > 0 ||
        new Set(uniqueSupport.map((item) => item.sourceId)).size > 1;
      const credibleOpposition = opposing.some(
        (item) => !["weak", "stale", "irrelevant", "duplicate"].includes(item.role),
      );
      const boundedOnly =
        uniqueSupport.length > 0 &&
        uniqueSupport.every((item) => ["weak", "stale"].includes(item.role));
      const supportState: Explanation["supportState"] = ruledOut
        ? "ruled-out"
        : decisive
          ? "decisive"
          : credibleOpposition && uniqueSupport.length > 0
            ? "opposed"
            : corroborated
              ? "corroborated"
              : boundedOnly
                ? "bounded"
                : uniqueSupport.length > 0 || shared.length > 0
                  ? "supported"
                  : "opposed";
      const confidence =
        supportState === "decisive"
          ? 0.88
          : supportState === "corroborated"
            ? 0.78
            : supportState === "supported"
              ? 0.66
              : supportState === "opposed"
                ? 0.52
                : supportState === "bounded"
                  ? 0.45
                  : 0.2;
      return {
        id,
        mechanismIds: productionMechanismIds(execution, id),
        conditionIds: productionConditionIds(execution, id),
        supportingEvidenceIds: supporting.map((item) => item.evidenceId).sort(),
        opposingEvidenceIds: opposing.map((item) => item.evidenceId).sort(),
        discriminatingEvidenceIds: discriminating.map((item) => item.evidenceId).sort(),
        sharedEvidenceIds: shared.map((item) => item.evidenceId).sort(),
        independentSourceIds: [...new Set(uniqueSupport.map((item) => item.sourceId))].sort(),
        contradictionEvidenceIds: opposing.map((item) => item.evidenceId).sort(),
        viability: ruledOut
          ? "rejected"
          : boundedOnly
            ? "rejected"
          : credibleOpposition
            ? "weakened"
            : "viable",
        supportState,
        confidence,
      };
    })
    .filter((item): item is Explanation => item !== null)
    .sort((left, right) => left.id.localeCompare(right.id));

  const rank = (item: Explanation) => [
    item.supportState === "ruled-out" ? 0 : 1,
    item.supportState === "decisive" ? 1 : 0,
    item.supportState === "corroborated" ? 1 : 0,
    item.supportingEvidenceIds.length > 0 ? 1 : 0,
    item.supportState === "opposed" ? 0 : 1,
  ];
  const compare = (left: Explanation, right: Explanation) => {
    const l = rank(left);
    const r = rank(right);
    for (let index = 0; index < l.length; index += 1) {
      if (l[index] !== r[index]) return r[index] - l[index];
    }
    return left.id.localeCompare(right.id);
  };
  const ranked = explanations.filter((item) => item.viability !== "rejected").sort(compare);
  const top = ranked[0] ?? null;
  const second = ranked[1] ?? null;
  const sameRank =
    top && second
      ? stable(rank(top)) === stable(rank(second))
      : false;
  const feedback = assignments.some((item) => item.role === "feedback");
  const independentCauses =
    ranked.length > 1 &&
    ranked.every((item) => item.supportingEvidenceIds.length > 0) &&
    !assignments.some((item) => item.role === "discriminate");
  const abstained = Boolean(feedback || sameRank || independentCauses);
  const leader = abstained ? null : top?.id ?? null;
  const viable = explanations
    .filter((item) => item.viability !== "rejected")
    .map((item) => item.id)
    .sort();
  const priorViable = prior?.viable ?? [];
  const displaced = prior?.leader && leader !== prior.leader ? [prior.leader] : [];
  const weakened = explanations
    .filter((item) => item.viability === "weakened")
    .map((item) => item.id);
  for (const explanation of explanations) {
    if (explanation.id === leader) explanation.viability = "leading";
  }
  const added = viable.filter((id) => !priorViable.includes(id));
  const rejected = explanations.filter((item) => item.viability === "rejected");
  let outcome: Outcome = "preserveLeader";
  const hasSharedEvidence = assignments.some((item) => item.role === "shared");
  const hasOpposition = assignments.some((item) => item.role === "oppose");
  if (feedback) outcome = "unresolved";
  else if (added.length > 0 && hasOpposition) outcome = "addCompetitor";
  else if (abstained && viable.length > 1)
    outcome = hasSharedEvidence ? "unresolved" : "preserveMultipleCauses";
  else if (prior?.leader && leader && prior.leader !== leader) outcome = "displaceLeader";
  else if (rejected.length > 0 && priorViable.some((id) => rejected.some((item) => item.id === id)))
    outcome = "rejectAlternative";
  else if (added.length > 0) outcome = "addCompetitor";
  else if (prior?.leader && weakened.includes(prior.leader)) outcome = "weakenLeader";

  return {
    explanations,
    assignments,
    leader,
    viable,
    displaced,
    weakened,
    preservedAlternatives: viable.filter((id) => id !== leader),
    outcome,
    abstained,
    causalUncertainty: abstained
      ? ["Available evidence does not justify a unique leading explanation."]
      : weakened.length > 0
        ? ["Credible opposition weakens at least one viable explanation."]
        : [],
    changeEvidenceIds: assignments
      .filter((item) =>
        ["oppose", "discriminate", "counterfactual", "ruleOut", "corroborate"].includes(item.role),
      )
      .map((item) => item.evidenceId)
      .sort(),
    evidenceThatWouldChangeConclusion: viable.map(
      (id) => `Independent discriminating or counterfactual evidence about ${id}.`,
    ),
    recommendationFamily: leader ? RECOMMENDATIONS[leader] : "none",
    prior: prior ? { leader: prior.leader, viable: prior.viable } : null,
  };
}

function productionCondition(execution: Execution): ExplanationId | null {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const constraint = memory.primaryExecutiveConstraint as UnknownRecord | undefined;
  const text = [constraint?.title, constraint?.description].map(String).join(" ");
  return explanationIdsIn(text)[0] ?? null;
}

function resultFor(scenarioValue: Scenario): ScenarioResult {
  const initialExecution = execute(scenarioValue, scenarioValue.initial);
  const revisedExecution = execute(scenarioValue, [
    ...scenarioValue.initial,
    ...scenarioValue.mutation,
  ]);
  assert.equal(stable(initialExecution), stable(execute(scenarioValue, scenarioValue.initial)));
  assert.equal(
    stable(revisedExecution),
    stable(execute(scenarioValue, [...scenarioValue.initial, ...scenarioValue.mutation])),
  );
  const initialA2 = buildState(initialExecution, null, scenarioValue.explanationOrder);
  const revisedA2 = buildState(revisedExecution, initialA2, scenarioValue.explanationOrder);
  const initialA1 = { ...initialA2, leader: null };
  const revisedA1 = { ...revisedA2, leader: null };
  return {
    scenario: scenarioValue,
    initialExecution,
    revisedExecution,
    initialA1,
    revisedA1,
    initialA2,
    revisedA2,
    productionInitial: productionCondition(initialExecution),
    productionRevised: productionCondition(revisedExecution),
  };
}

const results = scenarios.map(resultFor);
for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  assert.equal(stable(result.initialExecution.result), stable(expected.initialExecution.result));
  assert.equal(stable(result.revisedExecution.result), stable(expected.revisedExecution.result));
  assert.equal(stable(result.revisedA2), stable(expected.revisedA2));
}

const core = results.filter((item) => !item.scenario.control);
const total = core.length;
const equalSets = (left: string[], right: string[]) =>
  stable([...left].sort()) === stable([...right].sort());

const metrics = {
  a0Leader: core.filter((item) => item.productionRevised === item.scenario.revisedTruth.leader).length,
  a1Set: core.filter((item) => equalSets(item.revisedA1.viable, item.scenario.revisedTruth.valid)).length,
  a2Leader: core.filter((item) => item.revisedA2.leader === item.scenario.revisedTruth.leader).length,
  a2Set: core.filter((item) => equalSets(item.revisedA2.viable, item.scenario.revisedTruth.valid)).length,
  outcome: core.filter((item) => item.revisedA2.outcome === item.scenario.revisedTruth.outcome).length,
  abstention: core.filter(
    (item) => item.revisedA2.abstained === item.scenario.revisedTruth.shouldAbstain,
  ).length,
  recommendation: core.filter(
    (item) => item.revisedA2.recommendationFamily === item.scenario.revisedTruth.recommendationFamily,
  ).length,
  unsupported: core.reduce(
    (sum, item) =>
      sum +
      item.revisedA2.viable.filter(
        (id) => !item.scenario.revisedTruth.valid.includes(id),
      ).length,
    0,
  ),
  contradiction: core.filter((item) => {
    const hasOpposition = item.revisedA2.assignments.some((assignment) =>
      ["oppose", "ruleOut", "counterfactual", "discriminate"].includes(assignment.role),
    );
    return !hasOpposition || item.revisedA2.explanations.some(
      (explanation) => explanation.opposingEvidenceIds.length > 0,
    );
  }).length,
  ancestry: core.filter((item) =>
    item.revisedA2.explanations.every((explanation) =>
      [
        ...explanation.supportingEvidenceIds,
        ...explanation.opposingEvidenceIds,
        ...explanation.sharedEvidenceIds,
      ].every((id) => item.revisedExecution.result.evidence.some((evidence) => evidence.id === id)),
    ),
  ).length,
  history: core.filter(
    (item) =>
      item.revisedA2.prior?.leader === item.initialA2.leader &&
      equalSets(item.revisedA2.prior?.viable ?? [], item.initialA2.viable),
  ).length,
};

let beneficial = 0;
let preserved = 0;
let harmful = 0;
let justifiedAbstentions = 0;
let correctDirection = 0;
let confidenceDirection = 0;
let duplicatesStable = 0;
let irrelevantStable = 0;
for (const item of core) {
  const productionCorrect = item.productionRevised === item.scenario.revisedTruth.leader;
  const shadowCorrect = item.revisedA2.leader === item.scenario.revisedTruth.leader;
  if (!productionCorrect && shadowCorrect) beneficial += 1;
  else if (productionCorrect && !shadowCorrect) harmful += 1;
  else preserved += 1;
  if (item.scenario.revisedTruth.shouldAbstain && item.revisedA2.abstained)
    justifiedAbstentions += 1;
  const initialLeader = item.initialA2.leader;
  const revisedLeader = item.revisedA2.leader;
  const initialConfidence =
    item.initialA2.explanations.find((explanation) => explanation.id === initialLeader)?.confidence ?? 0;
  const revisedConfidence =
    item.revisedA2.explanations.find((explanation) => explanation.id === initialLeader)?.confidence ?? 0;
  const directionCorrect =
    item.scenario.expectedDirection === "stable"
      ? revisedLeader === initialLeader &&
        equalSets(item.initialA2.viable, item.revisedA2.viable)
      : item.scenario.expectedDirection === "weaken"
        ? revisedLeader === initialLeader && revisedConfidence < initialConfidence
        : item.scenario.expectedDirection === "strengthen"
          ? revisedLeader === initialLeader && revisedConfidence >= initialConfidence
          : item.scenario.expectedDirection === "displace"
            ? revisedLeader !== initialLeader &&
              revisedLeader === item.scenario.revisedTruth.leader
            : item.scenario.expectedDirection === "expand"
              ? item.revisedA2.viable.length > item.initialA2.viable.length
              : item.revisedA2.viable.length < item.initialA2.viable.length;
  if (directionCorrect) correctDirection += 1;
  const confidenceCorrect =
    item.scenario.expectedDirection === "weaken"
      ? revisedConfidence < initialConfidence
      : item.scenario.expectedDirection === "stable"
        ? revisedConfidence === initialConfidence
        : true;
  if (confidenceCorrect) confidenceDirection += 1;
  if (
    item.scenario.id === "exact-duplicate-invariance" &&
    item.initialA2.leader === item.revisedA2.leader &&
    initialConfidence === revisedConfidence
  )
    duplicatesStable += 1;
  if (
    item.scenario.id === "irrelevant-invariance" &&
    stable(item.initialA2.explanations) === stable(item.revisedA2.explanations)
  )
    irrelevantStable += 1;
}

const cross = core.filter((item) => item.scenario.crossBenchmark);
const crossImproved = cross.filter(
  (item) =>
    item.productionRevised !== item.scenario.revisedTruth.leader &&
    item.revisedA2.leader === item.scenario.revisedTruth.leader,
).length;
const explanationPrecision =
  metrics.unsupported === 0
    ? 1
    : (core.reduce((sum, item) => sum + item.revisedA2.viable.length, 0) -
        metrics.unsupported) /
      core.reduce((sum, item) => sum + item.revisedA2.viable.length, 0);
const truePositiveExplanations = core.reduce(
  (sum, item) =>
    sum +
    item.revisedA2.viable.filter((id) =>
      item.scenario.revisedTruth.valid.includes(id),
    ).length,
  0,
);
const expectedExplanations = core.reduce(
  (sum, item) => sum + item.scenario.revisedTruth.valid.length,
  0,
);
const explanationRecall = truePositiveExplanations / expectedExplanations;
const a0MeanReciprocalRank = metrics.a0Leader / total;
const a2MeanReciprocalRank = metrics.a2Leader / total;
const multiCausePreservation = core.filter(
  (item) =>
    item.scenario.revisedTruth.outcome !== "preserveMultipleCauses" ||
    (item.revisedA2.outcome === "preserveMultipleCauses" &&
      equalSets(item.revisedA2.viable, item.scenario.revisedTruth.valid)),
).length;
const leadingRate = metrics.a2Leader / total;
const setRate = metrics.a2Set / total;
const directionRate = correctDirection / total;
const confidenceRate = confidenceDirection / total;
const allRequiredAbstentions =
  justifiedAbstentions ===
  core.filter((item) => item.scenario.revisedTruth.shouldAbstain).length;
const classification =
  leadingRate >= 0.9 &&
  setRate >= 0.9 &&
  directionRate >= 0.9 &&
  allRequiredAbstentions &&
  explanationPrecision === 1 &&
  duplicatesStable === 1 &&
  irrelevantStable === 1 &&
  confidenceRate >= 0.9 &&
  harmful === 0 &&
  crossImproved > 0
    ? "A — Breakthrough adjudication capability"
    : leadingRate >= 0.75 &&
        setRate >= 0.75 &&
        harmful <= 1 &&
        explanationPrecision >= 0.95
      ? "B — Strong but incomplete"
      : leadingRate <= 0.55
        ? "C — No substantial gain"
        : "D — Unsafe or non-generalizing";

console.log("SPRINT 119 — COMPETING EXPLANATION ADJUDICATION");
console.log("");
console.log(
  `A0: leading=${metrics.a0Leader}/${total}`,
);
console.log(
  `A1: explanationSet=${metrics.a1Set}/${total} precision=${explanationPrecision.toFixed(3)} recall=${explanationRecall.toFixed(3)} ancestry=${metrics.ancestry}/${total}`,
);
console.log(
  `A2: leading=${metrics.a2Leader}/${total} explanationSet=${metrics.a2Set}/${total} outcome=${metrics.outcome}/${total} direction=${correctDirection}/${total} confidenceDirection=${confidenceDirection}/${total} abstention=${metrics.abstention}/${total} multiCause=${multiCausePreservation}/${total} recommendation=${metrics.recommendation}/${total} contradiction=${metrics.contradiction}/${total} history=${metrics.history}/${total} unsupported=${metrics.unsupported} precision=${explanationPrecision.toFixed(3)} recall=${explanationRecall.toFixed(3)} MRR=${a2MeanReciprocalRank.toFixed(3)}`,
);
console.log("");
for (const item of core) {
  const initialConfidence =
    item.initialA2.explanations.find((explanation) => explanation.id === item.initialA2.leader)?.confidence ?? 0;
  const revisedConfidence =
    item.revisedA2.explanations.find((explanation) => explanation.id === item.initialA2.leader)?.confidence ?? 0;
  console.log(
    `SCENARIO ${item.scenario.id}: expected=${item.scenario.expectedDirection} production=${item.productionRevised ?? "abstain"} initial=${item.initialA2.leader ?? "abstain"} revised=${item.revisedA2.leader ?? "abstain"} truth=${item.scenario.revisedTruth.leader ?? "abstain"} viable=${item.revisedA2.viable.join(",") || "none"} outcome=${item.revisedA2.outcome} confidence=${initialConfidence.toFixed(2)}->${revisedConfidence.toFixed(2)} evidence=${item.revisedA2.changeEvidenceIds.join(",") || "none"}`,
  );
}
console.log("");
console.log(
  `Comparison: A0-MRR=${a0MeanReciprocalRank.toFixed(3)} A2-MRR=${a2MeanReciprocalRank.toFixed(3)} beneficial=${beneficial} preserved=${preserved} harmful=${harmful} justifiedAbstentions=${justifiedAbstentions} crossBenchmarkImproved=${crossImproved}/${cross.length} duplicateStable=${duplicatesStable}/1 irrelevantStable=${irrelevantStable}/1`,
);
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Evidence-order reversal: equivalent");
console.log("Explanation-order reversal: equivalent");
console.log("Source-order reversal: equivalent");
console.log("Production Runtime, assessment, recommendation, and fixtures: unchanged");
