import type {
  ExecutiveOptimizationConstraint,
} from "./executiveOptimizationTypes";

import type {
  ExecutiveOptimizationOption,
  ExecutiveOptimizationOptionSet,
} from "./executiveOptimizationOptionTypes";

import type {
  ExecutiveConstraintEvaluation,
  ExecutiveOptimizationConstraintEvaluationSet,
  ExecutiveOptimizationOptionConstraintResult,
} from "./executiveConstraintEvaluationTypes";

export type EvaluateExecutiveOptimizationConstraintsInput = {
  optionSet:
    ExecutiveOptimizationOptionSet;

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

function evaluateConstraint(
  option:
    ExecutiveOptimizationOption,

  constraint:
    ExecutiveOptimizationConstraint,
): ExecutiveConstraintEvaluation {
  let score =
    1;

  let rationale =
    "The option satisfies the constraint.";

  let requiredAssumptions:
    string[] = [];

  switch (
    constraint.type
  ) {
    case "time": {
      score =
        option.speedToImpact;

      rationale =
        option.speedToImpact >=
        0.8
          ? "The option is expected to create meaningful impact quickly."
          : option.speedToImpact >=
            0.55
            ? "The option can create impact within a reasonable horizon, but timing remains a binding consideration."
            : "The option is unlikely to create meaningful impact within the required horizon.";

      requiredAssumptions =
        option.constraintAssumptions.filter(
          (assumption) =>
            /tim|immediate|stage|pilot|review/i.test(
              assumption,
            ),
        );

      break;
    }

    case "capacity": {
      const implementationLoad =
        option.implementationRisk *
        (
          option.profile ===
          "focus_reset"
            ? 1
            : option.profile ===
              "sequenced_governance"
              ? 0.8
              : 0.55
        );

      score =
        clamp01(
          1 -
          implementationLoad,
        );

      rationale =
        score >=
        0.65
          ? "The option appears executable within constrained organizational capacity."
          : score >=
            0.4
            ? "The option may be feasible, but organizational capacity is likely to become binding during implementation."
            : "The option is likely to require more implementation capacity than the organization can reliably supply.";

      requiredAssumptions =
        option.constraintAssumptions.filter(
          (assumption) =>
            /capacity|priority|portfolio|work|scope/i.test(
              assumption,
            ),
        );

      break;
    }

    case "risk": {
      score =
        clamp01(
          1 -
          option.implementationRisk,
        );

      rationale =
        score >=
        0.65
          ? "Implementation risk is within an acceptable range."
          : score >=
            0.35
            ? "Implementation risk is material and should be treated as binding."
            : "Implementation risk is too high relative to the current confidence and uncertainty.";

      requiredAssumptions =
        option.constraintAssumptions.filter(
          (assumption) =>
            /risk|disruption|acceptable|tolerate/i.test(
              assumption,
            ),
        );

      break;
    }

    case "decision-authority": {
      const decisionRightsAdjustment =
        option.variableAdjustments.find(
          (adjustment) =>
            adjustment.variableType ===
            "decision-rights",
        );

      score =
        decisionRightsAdjustment
          ? option.profile ===
            "sequenced_governance"
            ? 0.9
            : option.profile ===
              "controlled_pilot"
              ? 0.82
              : 0.66
          : 0.25;

      rationale =
        score >=
        0.75
          ? "The option explicitly addresses the authority required for execution."
          : score >=
            0.5
            ? "The option can proceed, but available decision authority remains a binding dependency."
            : "The option does not establish enough decision authority to execute reliably.";

      requiredAssumptions =
        option.constraintAssumptions.filter(
          (assumption) =>
            /authority|leadership|owner|decision/i.test(
              assumption,
            ),
        );

      break;
    }

    case "implementation-complexity": {
      const intensityAdjustment =
        option.variableAdjustments.find(
          (adjustment) =>
            adjustment.variableType ===
            "implementation-intensity",
        );

      const complexityPenalty =
        option.profile ===
        "focus_reset"
          ? 0.72
          : option.profile ===
            "sequenced_governance"
            ? 0.5
            : 0.25;

      score =
        clamp01(
          1 -
          complexityPenalty,
        );

      rationale =
        score >=
        0.65
          ? "Implementation complexity is bounded and manageable."
          : score >=
            0.35
            ? "Implementation complexity is manageable but binding."
            : "Implementation complexity is excessive relative to expected value.";

      requiredAssumptions =
        intensityAdjustment
          ? [
              intensityAdjustment
                .proposedValue,
            ]
          : [];

      break;
    }

    case "budget": {
      score =
        option.profile ===
        "controlled_pilot"
          ? 0.9
          : option.profile ===
            "sequenced_governance"
            ? 0.72
            : 0.55;

      rationale =
        score >=
        0.75
          ? "The option appears compatible with a constrained budget."
          : score >=
            0.5
            ? "Budget is likely to become a binding consideration."
            : "The option is likely to exceed the available budget.";

      break;
    }
  }

  const status =
    score >=
    0.65
      ? "satisfied"
      : score >=
        0.35
        ? "binding"
        : "violated";

  return {
    id:
      `constraint-evaluation-${option.id}-${constraint.id}`,

    optionId:
      option.id,

    constraintId:
      constraint.id,

    constraintType:
      constraint.type,

    status,

    severity:
      clamp01(
        1 -
        score,
      ),

    score:
      clamp01(
        score,
      ),

    rationale,

    requiredAssumptions,
  };
}

function summarizeResult(
  option:
    ExecutiveOptimizationOption,

  evaluations:
    ExecutiveConstraintEvaluation[],

  feasible:
    boolean,
): string {
  const binding =
    evaluations.filter(
      (evaluation) =>
        evaluation.status ===
        "binding",
    );

  const violated =
    evaluations.filter(
      (evaluation) =>
        evaluation.status ===
        "violated",
    );

  if (
    !feasible
  ) {
    return `${option.title} is not currently feasible because it violates ${violated.length} required constraint${violated.length === 1 ? "" : "s"}.`;
  }

  if (
    binding.length >
    0
  ) {
    return `${option.title} is feasible, with ${binding.length} binding constraint${binding.length === 1 ? "" : "s"} requiring active management.`;
  }

  return `${option.title} satisfies all required constraints.`;
}

export function evaluateExecutiveOptimizationConstraints(
  input:
    EvaluateExecutiveOptimizationConstraintsInput,
): ExecutiveOptimizationConstraintEvaluationSet {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const optionSet =
    input.optionSet;

  const problem =
    optionSet.optimizationProblem;

  const results:
    ExecutiveOptimizationOptionConstraintResult[] =
    optionSet.options.map(
      (option) => {
        const evaluations =
          problem.constraints.map(
            (constraint) =>
              evaluateConstraint(
                option,
                constraint,
              ),
          );

        const violatedConstraintIds =
          evaluations
            .filter(
              (evaluation) =>
                evaluation.status ===
                "violated",
            )
            .map(
              (evaluation) =>
                evaluation.constraintId,
            );

        const bindingConstraintIds =
          evaluations
            .filter(
              (evaluation) =>
                evaluation.status ===
                "binding",
            )
            .map(
              (evaluation) =>
                evaluation.constraintId,
            );

        const feasible =
          violatedConstraintIds.length ===
          0;

        const feasibilityScore =
          clamp01(
            evaluations.reduce(
              (
                total,
                evaluation,
              ) =>
                total +
                evaluation.score,
              0,
            ) /
              Math.max(
                evaluations.length,
                1,
              ),
          );

        return {
          option,

          evaluations,

          feasible,

          bindingConstraintIds,

          violatedConstraintIds,

          feasibilityScore,

          summary:
            summarizeResult(
              option,
              evaluations,
              feasible,
            ),
        };
      },
    );

  return {
    id:
      `executive-optimization-constraint-evaluation-${optionSet.id}`,

    optimizationProblem:
      problem,

    optionSet,

    results,

    createdAt:
      now,
  };
}
