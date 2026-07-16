import type { OrganizationalCausalModel } from "../../v3/model/causal/organizationalCausalModel";
import type { OrganizationalCondition } from "../../v3/model/state/inferOrganizationalConditions";
import type { ExecutiveDecision } from "../../v3/model/simulate/executiveDecision";
import { runDecisionReasoningExperiment } from "../../v3/reasoning/runDecisionReasoningExperiment";

/**
 * ============================================================
 * Discovery Decision Intelligence Experiment 001
 *
 * Executive Goal:
 *
 * Improve execution.
 *
 * ============================================================
 *
 * Purpose
 *
 * This experiment validates Discovery's reasoning pipeline,
 * not merely its final recommendation.
 *
 * Every stage of reasoning is independently inspected.
 *
 * ============================================================
 */

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION INTELLIGENCE");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

const now = new Date().toISOString();

const executiveDecision: ExecutiveDecision = {
  id: "decision-improve-execution-001",

  organizationId: "decision-intelligence-test",

  type: "execution",

  title: "Improve execution",

  objective:
    "Improve execution reliability without increasing headcount.",

  rationale:
    "Leadership wants to improve organizational throughput through governance and operating-model improvements rather than hiring additional people.",

  status: "exploring",

  timeHorizon: "near-term",

  targetConditionIds: [
    "condition-executioncapacity",
  ],

  successMetrics: [
    {
      name: "Execution Capacity",
      baseline: 0.55,
      target: 0.7,
      unit: "score",
      rationale:
        "The organization should complete priority work more reliably.",
    },
  ],

  constraints: [
    {
      type: "people",
      description:
        "Do not increase headcount.",
      required: true,
    },
  ],

  allowedInterventionTypes: [
    "governance",
    "policy",
    "reorganization",
    "strategy",
  ],

  assumptions: [
    "Leadership is willing to change decision rights.",
    "Operating practices can change within ninety days.",
  ],

  openQuestions: [
    "Which approval layers create the greatest delay?",
    "Where is decision ownership currently unclear?",
  ],

  confidence: 0.9,

  createdAt: now,

  updatedAt: now,
};

const causalModel: OrganizationalCausalModel = {
  id: "causal-model-improve-execution-001",

  organizationId:
    executiveDecision.organizationId,

  organizationalEntities: [
    {
      id: "condition-decisionflow",
      type: "condition",
      label: "Decision Flow",
      status: "deteriorating",
      confidence: 0.85,
    },
    {
      id: "condition-coordination",
      type: "condition",
      label: "Coordination System",
      status: "constrained",
      confidence: 0.82,
    },
    {
      id: "condition-executioncapacity",
      type: "condition",
      label: "Execution Capacity",
      status: "deteriorating",
      confidence: 0.8,
    },
    {
      id: "condition-leadershipdependency",
      type: "condition",
      label: "Leadership Dependency",
      status: "constrained",
      confidence: 0.76,
    },
    {
      id: "condition-operatingmodel",
      type: "condition",
      label: "Operating Model",
      status: "constrained",
      confidence: 0.78,
    },
  ],

  causalRelationships: [
    {
      id: "law-001-decision-flow-coordination",

      sourceEntityId:
        "condition-decisionflow",

      targetEntityId:
        "condition-coordination",

      direction:
        "enables",

      strength:
        0.82,

      confidence:
        0.78,

      explanation:
        "Faster and clearer decisions reduce ambiguity, waiting, and coordination overhead.",

      supportingMechanismIds: [
        "decisionLatency",
        "governanceFriction",
      ],

      supportingTheoryIds: [
        "Centralized Governance Bottleneck",
      ],

      supportingBeliefIds: [],

      supportingEvidenceIds: [],
    },
    {
      id: "law-002-coordination-execution",

      sourceEntityId:
        "condition-coordination",

      targetEntityId:
        "condition-executioncapacity",

      direction:
        "enables",

      strength:
        0.85,

      confidence:
        0.81,

      explanation:
        "Better coordination reduces rework and increases execution throughput.",

      supportingMechanismIds: [
        "coordinationBreakdown",
        "executionDrag",
      ],

      supportingTheoryIds: [],

      supportingBeliefIds: [],

      supportingEvidenceIds: [],
    },
  ],

  confidence:
    0.8,

  summary:
    "Focused causal model for testing execution-related governance interventions.",

  generatedAt:
    now,
};

const conditions = [
  {
    id: "condition-decisionflow",
    name: "Decision Flow",
  },
  {
    id: "condition-coordination",
    name: "Coordination System",
  },
  {
    id: "condition-executioncapacity",
    name: "Execution Capacity",
  },
  {
    id: "condition-leadershipdependency",
    name: "Leadership Dependency",
  },
  {
    id: "condition-operatingmodel",
    name: "Operating Model",
  },
] as unknown as OrganizationalCondition[];

console.log("Executive Decision");
console.log("------------------------------");
console.dir(executiveDecision, {
  depth: null,
});
console.log("");

/**
 * ============================================================
 * Actual Discovery Reasoning
 * ============================================================
 */

const reasoningResult =
  runDecisionReasoningExperiment({
    executiveDecision,
    causalModel,
    conditions,
  });

console.log("Actual Reasoning");
console.log("------------------------------");

console.log("Reasoning Stages");
console.dir(
  reasoningResult.reasoningStages,
  {
    depth: null,
  },
);

console.log("");

console.log("Generated Intervention Options");
console.dir(
  reasoningResult.interventionOptions.map(
    (option) => ({
      title:
        option.title,

      type:
        option.type,

      confidence:
        option.confidence,

      targetConditionIds:
        option.targetConditionIds,

      constraintEvaluations:
        option.constraintEvaluations,

      satisfiedConstraintIndexes:
        option.constraintEvaluations
          .filter(
            (evaluation) =>
              evaluation.status ===
              "satisfied",
          )
          .map(
            (evaluation) =>
              evaluation.constraintIndex,
          ),

      risks:
        option.risks,

      missingEvidence:
        option.missingEvidence,
    }),
  ),
  {
    depth: null,
  },
);

console.log("");

console.log("Selected Intervention Option");
console.log("------------------------------");
console.dir(
  reasoningResult.selectedInterventionOption,
  {
    depth: null,
  },
);
console.log("");

console.log("Selected Organizational Intervention");
console.log("------------------------------");
console.dir(
  reasoningResult.selectedIntervention,
  {
    depth: null,
  },
);
console.log("");

console.log("Mapped Causal Changes");
console.log("------------------------------");
console.dir(
  reasoningResult.mappedChanges,
  {
    depth: null,
  },
);
console.log("");

console.log("Propagation Results");
console.log("------------------------------");
console.dir(
  reasoningResult.propagationResults,
  {
    depth: null,
  },
);
console.log("");

console.log("Aggregated Influence");
console.log("------------------------------");
console.dir(
  reasoningResult.aggregatedInfluence,
  {
    depth: null,
  },
);
console.log("");

type ExperimentCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

const expectedInterventionTitles = [
  "Remove one approval layer",
  "Clarify decision ownership",
  "Reduce concurrent work",
];

const generatedTitles =
  reasoningResult.interventionOptions.map(
    (option) => option.title,
  );

const propagatedEntityIds =
  reasoningResult.propagationResults.flatMap(
    (result) =>
      result.changes.map(
        (change) => change.entityId,
      ),
  );

const maximumPropagationDepth =
  reasoningResult.propagationResults.reduce(
    (maximum, result) =>
      Math.max(
        maximum,
        result.maxDepthReached,
      ),
    0,
  );

const aggregatedExecutionCapacity =
  reasoningResult.aggregatedInfluence.find(
    (influence) =>
      influence.entityId ===
      "condition-executioncapacity",
  );

const aggregatedDecisionFlow =
  reasoningResult.aggregatedInfluence.find(
    (influence) =>
      influence.entityId ===
      "condition-decisionflow",
  );

const aggregatedCoordination =
  reasoningResult.aggregatedInfluence.find(
    (influence) =>
      influence.entityId ===
      "condition-coordination",
  );

const checks: ExperimentCheck[] = [
  {
    name: "Expected intervention count",
    passed:
      reasoningResult.interventionOptions.length ===
      expectedInterventionTitles.length,
    detail:
      `${reasoningResult.interventionOptions.length}/${expectedInterventionTitles.length} options generated`,
  },

  {
    name: "Expected intervention titles",
    passed:
      expectedInterventionTitles.every(
        (title) => generatedTitles.includes(title),
      ),
    detail:
      expectedInterventionTitles
        .filter(
          (title) =>
            !generatedTitles.includes(title),
        )
        .map((title) => `Missing: ${title}`)
        .join(", ") || "All expected options found",
  },

  {
    name:
      "Required constraints explicitly evaluated",

    passed:
      reasoningResult.interventionOptions.every(
        (option) =>
          executiveDecision.constraints
            .map((_, index) => index)
            .filter(
              (index) =>
                executiveDecision.constraints[index]
                  ?.required,
            )
            .every((index) =>
              option.constraintEvaluations.some(
                (evaluation) =>
                  evaluation.constraintIndex ===
                  index,
              ),
            ),
      ),

    detail:
      "Every generated option contains an explicit evaluation for every required decision constraint.",
  },

  {
    name:
      "Unverified people constraint is not falsely satisfied",

    passed:
      reasoningResult.interventionOptions.every(
        (option) =>
          option.constraintEvaluations
            .filter(
              (evaluation) =>
                evaluation.constraintIndex ===
                0,
            )
            .every(
              (evaluation) =>
                evaluation.status !==
                "satisfied",
            ),
      ),

    detail:
      "The no-headcount constraint remains unresolved until structured implementation evidence is available.",
  },

  {
    name:
      "No generated option has a known required-constraint violation",

    passed:
      reasoningResult.interventionOptions.every(
        (option) =>
          option.constraintEvaluations
            .filter(
              (evaluation) =>
                executiveDecision.constraints[
                  evaluation.constraintIndex
                ]?.required,
            )
            .every(
              (evaluation) =>
                evaluation.status !==
                "violated",
            ),
      ),

    detail:
      "Generated options may require evidence, but none is currently known to violate the required constraint.",
  },

  {
    name: "Target-condition relevance",
    passed:
      reasoningResult.interventionOptions.every(
        (option) =>
          option.targetConditionIds.length > 0,
      ),
    detail:
      "Every generated option identifies at least one target condition.",
  },

  {
    name: "Missing evidence supplied",
    passed:
      reasoningResult.interventionOptions.every(
        (option) =>
          option.missingEvidence.length > 0,
      ),
    detail:
      "Every generated option identifies evidence that would improve evaluation.",
  },

  {
    name: "Intervention selected",
    passed:
      reasoningResult.selectedInterventionOption
        ?.title ===
      "Remove one approval layer",
    detail:
      reasoningResult.selectedInterventionOption
        ? `Selected: ${reasoningResult.selectedInterventionOption.title}`
        : "No intervention option was selected.",
  },

  {
    name: "Canonical intervention created",
    passed:
      reasoningResult.selectedIntervention
        ?.title ===
      "Remove one approval layer",
    detail:
      reasoningResult.selectedIntervention
        ? `Created: ${reasoningResult.selectedIntervention.id}`
        : "No canonical intervention was created.",
  },

  {
    name: "Decision Flow mapped",
    passed:
      reasoningResult.mappedChanges.some(
        (change) =>
          change.entityId ===
          "condition-decisionflow",
      ),
    detail:
      "The selected governance intervention should directly affect Decision Flow.",
  },

  {
    name: "Coordination reached",
    passed:
      propagatedEntityIds.includes(
        "condition-coordination",
      ),
    detail:
      "Causal propagation should reach Coordination System.",
  },

  {
    name: "Execution Capacity reached",
    passed:
      propagatedEntityIds.includes(
        "condition-executioncapacity",
      ),
    detail:
      "Causal propagation should reach Execution Capacity.",
  },

  {
    name: "Multi-stage propagation",
    passed:
      maximumPropagationDepth >= 2,
    detail:
      `Maximum propagation depth: ${maximumPropagationDepth}`,
  },

  {
    name: "Decision Flow aggregated",
    passed:
      aggregatedDecisionFlow?.sourceType ===
        "direct" &&
      aggregatedDecisionFlow.delta > 0,
    detail:
      aggregatedDecisionFlow
        ? `Delta: ${aggregatedDecisionFlow.delta}, source: ${aggregatedDecisionFlow.sourceType}`
        : "Decision Flow was not aggregated.",
  },

  {
    name: "Coordination aggregated",
    passed:
      aggregatedCoordination?.sourceType ===
        "indirect" &&
      aggregatedCoordination.delta > 0,
    detail:
      aggregatedCoordination
        ? `Delta: ${aggregatedCoordination.delta}, source: ${aggregatedCoordination.sourceType}`
        : "Coordination was not aggregated.",
  },

  {
    name: "Execution Capacity combined safely",
    passed:
      aggregatedExecutionCapacity
        ?.sourceType ===
        "direct-and-indirect" &&
      aggregatedExecutionCapacity.delta > 0.2 &&
      aggregatedExecutionCapacity.delta < 0.3,
    detail:
      aggregatedExecutionCapacity
        ? `Delta: ${aggregatedExecutionCapacity.delta}, source: ${aggregatedExecutionCapacity.sourceType}`
        : "Execution Capacity was not aggregated.",
  },

  {
    name: "Causal explanations preserved",
    passed:
      reasoningResult.aggregatedInfluence.every(
        (influence) =>
          influence.explanations.length > 0,
      ),
    detail:
      "Every aggregated effect preserves at least one explanation.",
  },
];

const passedChecks =
  checks.filter((check) => check.passed).length;

const failedChecks =
  checks.length - passedChecks;

console.log("Experiment Assertions");
console.log("------------------------------");

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
  );
  console.log(`      ${check.detail}`);
}

console.log("");
console.log(
  `Passed Checks: ${passedChecks}`,
);
console.log(
  `Failed Checks: ${failedChecks}`,
);
console.log("");

if (failedChecks > 0) {
  process.exitCode = 1;
}

/**
 * ============================================================
 * Expected Reasoning
 * ============================================================
 */

const expectedReasoning = {
  targetCondition:
    "Execution Capacity",

  expectedInterventions: [
    "Remove approval layer",
    "Clarify decision ownership",
    "Reduce concurrent work",
  ],

  expectedAffectedSystems: [
    "Decision Flow",
  ],

  expectedPropagation: [
    "Decision Flow",
    "Coordination",
    "Execution Capacity",
  ],
};

console.log("Expected Reasoning");
console.log("------------------------------");
console.dir(expectedReasoning, {
  depth: null,
});

console.log("");
console.log("Experiment Complete");
console.log("");
