import type {
  ExecutiveOptimizationOption,
  ExecutiveOptimizationOptionSet,
} from "./executiveOptimizationOptionTypes";

import type {
  ExecutiveOptimizationProblem,
  ExecutiveOptimizationVariable,
} from "./executiveOptimizationTypes";

export type GenerateExecutiveOptimizationOptionsInput = {
  optimizationProblem:
    ExecutiveOptimizationProblem;

  now?:
    string;
};

function clamp01(
  value:
    number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function findVariable(
  variables:
    ExecutiveOptimizationVariable[],

  type:
    ExecutiveOptimizationVariable["type"],
): ExecutiveOptimizationVariable {
  const variable =
    variables.find(
      (item) =>
        item.type ===
        type,
    );

  if (
    !variable
  ) {
    throw new Error(
      `Executive Optimization Option Generation requires variable: ${type}.`,
    );
  }

  return variable;
}

export function generateExecutiveOptimizationOptions(
  input:
    GenerateExecutiveOptimizationOptionsInput,
): ExecutiveOptimizationOptionSet {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const problem =
    input.optimizationProblem;

  const scope =
    findVariable(
      problem.variables,
      "scope",
    );

  const sequence =
    findVariable(
      problem.variables,
      "sequence",
    );

  const timing =
    findVariable(
      problem.variables,
      "timing",
    );

  const resourceAllocation =
    findVariable(
      problem.variables,
      "resource-allocation",
    );

  const decisionRights =
    findVariable(
      problem.variables,
      "decision-rights",
    );

  const coordinationLoad =
    findVariable(
      problem.variables,
      "coordination-load",
    );

  const implementationIntensity =
    findVariable(
      problem.variables,
      "implementation-intensity",
    );

  const recommendation =
    problem.recommendation;

  const options:
    ExecutiveOptimizationOption[] = [
    {
      id:
        `executive-optimization-option-${problem.id}-focus-reset`,

      optimizationProblemId:
        problem.id,

      recommendationId:
        problem.recommendationId,

      profile:
        "focus_reset",

      title:
        "Focus Reset",

      summary:
        "Reduce active work aggressively and protect only the highest-leverage priorities from new demand.",

      rationale:
        "This option prioritizes speed and execution relief by concentrating scarce capacity on fewer active priorities.",

      variableAdjustments: [
        {
          variableId:
            scope.id,

          variableType:
            scope.type,

          direction:
            "decrease",

          proposedValue:
            "Apply the intervention across the organization and reduce the active portfolio to the smallest viable set of priorities.",

          rationale:
            "Broad scope produces the fastest reduction in execution overload.",
        },

        {
          variableId:
            sequence.id,

          variableType:
            sequence.type,

          direction:
            "sequence",

          proposedValue:
            "Reduce active work first, then clarify decision rights and coordination expectations.",

          rationale:
            "Immediate work reduction creates capacity before supporting governance changes are introduced.",
        },

        {
          variableId:
            timing.id,

          variableType:
            timing.type,

          direction:
            "clarify",

          proposedValue:
            "Begin immediately with a short executive reset period.",

          rationale:
            "The primary benefit depends on rapid interruption of competing demand.",
        },

        {
          variableId:
            resourceAllocation.id,

          variableType:
            resourceAllocation.type,

          direction:
            "increase",

          proposedValue:
            "Concentrate available capacity on the highest-leverage work.",

          rationale:
            "Concentrated capacity improves completion probability and reduces focus fragmentation.",
        },

        {
          variableId:
            decisionRights.id,

          variableType:
            decisionRights.type,

          direction:
            "clarify",

          proposedValue:
            "Clarify only the decision rights necessary to protect the reduced portfolio.",

          rationale:
            "This avoids delaying the capacity reset with a broader governance redesign.",
        },

        {
          variableId:
            coordinationLoad.id,

          variableType:
            coordinationLoad.type,

          direction:
            "decrease",

          proposedValue:
            "Suspend or simplify coordination forums that do not support the protected priorities.",

          rationale:
            "Lower coordination load releases additional execution capacity.",
        },

        {
          variableId:
            implementationIntensity.id,

          variableType:
            implementationIntensity.type,

          direction:
            "increase",

          proposedValue:
            "High-intensity executive intervention.",

          rationale:
            "A decisive reset creates faster impact but increases disruption risk.",
        },
      ],

      expectedValue:
        0.88,

      implementationRisk:
        0.72,

      speedToImpact:
        0.92,

      reversibility:
        0.48,

      confidence:
        clamp01(
          recommendation.confidence *
          0.96,
        ),

      constraintAssumptions: [
        "Leadership can stop or defer active work quickly.",
        "The organization can identify the highest-leverage priorities with sufficient confidence.",
        "Short-term disruption is acceptable in exchange for faster execution relief.",
      ],

      uncertaintySummary:
        problem.uncertaintySummary,

      boundaries: {
        preservesObjective:
          true,

        preservesRecommendation:
          true,

        doesNotSimulate:
          true,

        doesNotSelectFinalDecision:
          true,
      },

      createdAt:
        now,
    },

    {
      id:
        `executive-optimization-option-${problem.id}-sequenced-governance`,

      optimizationProblemId:
        problem.id,

      recommendationId:
        problem.recommendationId,

      profile:
        "sequenced_governance",

      title:
        "Sequenced Governance",

      summary:
        "Reduce competing work while clarifying decision rights in a staged sequence.",

      rationale:
        "This option balances execution relief with governance durability by sequencing portfolio reduction and decision-rights clarification.",

      variableAdjustments: [
        {
          variableId:
            scope.id,

          variableType:
            scope.type,

          direction:
            "decrease",

          proposedValue:
            "Reduce work across the most constrained cross-functional areas first.",

          rationale:
            "Targeted scope preserves focus while reducing organization-wide disruption.",
        },

        {
          variableId:
            sequence.id,

          variableType:
            sequence.type,

          direction:
            "sequence",

          proposedValue:
            "Clarify decision rights for priority work, reduce active work, then formalize coordination interfaces.",

          rationale:
            "This sequence reduces the chance that work reduction recreates the same approval bottlenecks.",
        },

        {
          variableId:
            timing.id,

          variableType:
            timing.type,

          direction:
            "clarify",

          proposedValue:
            "Implement in defined stages over an executive-relevant near-term horizon.",

          rationale:
            "Staging balances speed with adoption and operating stability.",
        },

        {
          variableId:
            resourceAllocation.id,

          variableType:
            resourceAllocation.type,

          direction:
            "increase",

          proposedValue:
            "Shift capacity toward protected priorities as decision ownership becomes explicit.",

          rationale:
            "Resource movement remains synchronized with clarified authority.",
        },

        {
          variableId:
            decisionRights.id,

          variableType:
            decisionRights.type,

          direction:
            "clarify",

          proposedValue:
            "Explicitly assign routine decision authority for the protected work.",

          rationale:
            "Clear authority reduces approval dependency and improves execution flow.",
        },

        {
          variableId:
            coordinationLoad.id,

          variableType:
            coordinationLoad.type,

          direction:
            "decrease",

          proposedValue:
            "Replace informal escalation with explicit ownership and handoff expectations.",

          rationale:
            "Reliable interfaces reduce repeated coordination effort.",
        },

        {
          variableId:
            implementationIntensity.id,

          variableType:
            implementationIntensity.type,

          direction:
            "hold",

          proposedValue:
            "Moderate implementation intensity.",

          rationale:
            "Balanced intensity supports meaningful change without an abrupt operating reset.",
        },
      ],

      expectedValue:
        0.84,

      implementationRisk:
        0.5,

      speedToImpact:
        0.72,

      reversibility:
        0.7,

      confidence:
        clamp01(
          recommendation.confidence,
        ),

      constraintAssumptions: [
        "Leadership can clarify decision authority before or during portfolio reduction.",
        "Cross-functional owners can adopt new handoff expectations.",
        "The organization can tolerate a staged implementation.",
      ],

      uncertaintySummary:
        problem.uncertaintySummary,

      boundaries: {
        preservesObjective:
          true,

        preservesRecommendation:
          true,

        doesNotSimulate:
          true,

        doesNotSelectFinalDecision:
          true,
      },

      createdAt:
        now,
    },

    {
      id:
        `executive-optimization-option-${problem.id}-controlled-pilot`,

      optimizationProblemId:
        problem.id,

      recommendationId:
        problem.recommendationId,

      profile:
        "controlled_pilot",

      title:
        "Controlled Pilot",

      summary:
        "Apply a narrower work-in-progress reduction to one constrained operating area before broader adoption.",

      rationale:
        "This option prioritizes reversibility and learning by testing the recommendation in a bounded area with lower disruption.",

      variableAdjustments: [
        {
          variableId:
            scope.id,

          variableType:
            scope.type,

          direction:
            "decrease",

          proposedValue:
            "Limit the intervention to one high-friction cross-functional operating area.",

          rationale:
            "Narrow scope reduces execution risk and creates a controlled learning environment.",
        },

        {
          variableId:
            sequence.id,

          variableType:
            sequence.type,

          direction:
            "sequence",

          proposedValue:
            "Select the pilot area, clarify local decision rights, reduce active work, then evaluate before expansion.",

          rationale:
            "A learning sequence makes evidence generation part of the intervention.",
        },

        {
          variableId:
            timing.id,

          variableType:
            timing.type,

          direction:
            "clarify",

          proposedValue:
            "Use a short, bounded pilot period with an explicit review point.",

          rationale:
            "A defined review point protects reversibility and limits prolonged ambiguity.",
        },

        {
          variableId:
            resourceAllocation.id,

          variableType:
            resourceAllocation.type,

          direction:
            "increase",

          proposedValue:
            "Concentrate local capacity on the pilot area's highest-leverage work.",

          rationale:
            "A local concentration test reveals whether focus improves execution reliability.",
        },

        {
          variableId:
            decisionRights.id,

          variableType:
            decisionRights.type,

          direction:
            "clarify",

          proposedValue:
            "Clarify decision rights only within the pilot scope.",

          rationale:
            "Local authority changes are easier to observe and reverse.",
        },

        {
          variableId:
            coordinationLoad.id,

          variableType:
            coordinationLoad.type,

          direction:
            "decrease",

          proposedValue:
            "Simplify handoffs and escalation paths within the pilot area.",

          rationale:
            "Bounded coordination changes make operating effects easier to evaluate.",
        },

        {
          variableId:
            implementationIntensity.id,

          variableType:
            implementationIntensity.type,

          direction:
            "decrease",

          proposedValue:
            "Low-to-moderate implementation intensity.",

          rationale:
            "Lower intensity protects operations while producing evidence for broader optimization.",
        },
      ],

      expectedValue:
        0.66,

      implementationRisk:
        0.28,

      speedToImpact:
        0.55,

      reversibility:
        0.94,

      confidence:
        clamp01(
          recommendation.confidence *
          0.92,
        ),

      constraintAssumptions: [
        "A representative pilot area can be isolated.",
        "Pilot outcomes can be observed with enough clarity to guide expansion.",
        "Leadership accepts slower organization-wide impact in exchange for lower risk.",
      ],

      uncertaintySummary:
        problem.uncertaintySummary,

      boundaries: {
        preservesObjective:
          true,

        preservesRecommendation:
          true,

        doesNotSimulate:
          true,

        doesNotSelectFinalDecision:
          true,
      },

      createdAt:
        now,
    },
  ];

  return {
    id:
      `executive-optimization-option-set-${problem.id}`,

    optimizationProblem:
      problem,

    options,

    createdAt:
      now,
  };
}
