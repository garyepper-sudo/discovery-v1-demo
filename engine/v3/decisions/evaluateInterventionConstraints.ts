import type {
  ExecutiveDecision,
  ExecutiveDecisionConstraint,
} from "../model/simulate/executiveDecision";

import type {
  InterventionConstraintEvaluation,
  InterventionOption,
} from "../model/simulate/interventionOption";

export type EvaluateInterventionConstraintsInput = {
  executiveDecision:
    ExecutiveDecision;

  option:
    Pick<
      InterventionOption,
      | "type"
      | "timeHorizon"
      | "description"
      | "rationale"
      | "assumptions"
      | "risks"
      | "missingEvidence"
    >;
};

function evaluateTimeConstraint(
  constraint:
    ExecutiveDecisionConstraint,

  executiveDecision:
    ExecutiveDecision,

  option:
    EvaluateInterventionConstraintsInput["option"],
): InterventionConstraintEvaluation["status"] {
  if (
    option.timeHorizon ===
    executiveDecision.timeHorizon
  ) {
    return "satisfied";
  }

  return constraint.required
    ? "violated"
    : "insufficient-evidence";
}

function evaluateConstraint(
  constraint:
    ExecutiveDecisionConstraint,

  constraintIndex:
    number,

  executiveDecision:
    ExecutiveDecision,

  option:
    EvaluateInterventionConstraintsInput["option"],
): InterventionConstraintEvaluation {
  switch (constraint.type) {
    case "time": {
      const status =
        evaluateTimeConstraint(
          constraint,
          executiveDecision,
          option,
        );

      return {
        constraintIndex,
        status,
        explanation:
          status === "satisfied"
            ? "The intervention uses the required decision time horizon."
            : "The intervention time horizon does not satisfy the decision requirement.",
      };
    }

    case "risk":
      return {
        constraintIndex,
        status:
          option.risks.length > 0
            ? "requires-simulation"
            : "satisfied",
        explanation:
          option.risks.length > 0
            ? "The intervention creates risks that must be evaluated through simulation."
            : "No material pre-simulation risks are identified.",
      };

    case "budget":
    case "people":
    case "capacity":
    case "regulatory":
    case "technology":
    case "strategic":
    case "custom":
      return {
        constraintIndex,
        status:
          "insufficient-evidence",
        explanation:
          "The intervention does not yet contain enough structured implementation data to evaluate this constraint reliably.",
      };
  }
}

export function evaluateInterventionConstraints({
  executiveDecision,
  option,
}: EvaluateInterventionConstraintsInput): InterventionConstraintEvaluation[] {
  return executiveDecision.constraints.map(
    (constraint, constraintIndex) =>
      evaluateConstraint(
        constraint,
        constraintIndex,
        executiveDecision,
        option,
      ),
  );
}