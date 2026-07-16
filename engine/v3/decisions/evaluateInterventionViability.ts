import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  InterventionConstraintEvaluation,
  InterventionOption,
} from "../model/simulate/interventionOption";

export type InterventionViabilityStatus =
  | "viable"
  | "conditionally-viable"
  | "disqualified";

export type InterventionConstraintIssue = {
  constraintIndex: number;

  constraintType:
    ExecutiveDecision["constraints"][number]["type"];

  required: boolean;

  evaluationStatus:
    InterventionConstraintEvaluation["status"];

  description: string;

  explanation: string;
};

export type InterventionViabilityEvaluation = {
  optionId: string;

  status:
    InterventionViabilityStatus;

  requiredViolations:
    InterventionConstraintIssue[];

  unresolvedRequiredConstraints:
    InterventionConstraintIssue[];

  optionalIssues:
    InterventionConstraintIssue[];

  summary: string;
};

export type EvaluateInterventionViabilityInput = {
  executiveDecision:
    ExecutiveDecision;

  option:
    InterventionOption;
};

function buildIssue(params: {
  executiveDecision:
    ExecutiveDecision;

  evaluation:
    InterventionConstraintEvaluation;
}): InterventionConstraintIssue | null {
  const constraint =
    params.executiveDecision.constraints[
      params.evaluation.constraintIndex
    ];

  if (!constraint) {
    return null;
  }

  return {
    constraintIndex:
      params.evaluation.constraintIndex,

    constraintType:
      constraint.type,

    required:
      constraint.required,

    evaluationStatus:
      params.evaluation.status,

    description:
      constraint.description,

    explanation:
      params.evaluation.explanation,
  };
}

export function evaluateInterventionViability({
  executiveDecision,
  option,
}: EvaluateInterventionViabilityInput):
  InterventionViabilityEvaluation {
  const issues =
    option.constraintEvaluations
      .map((evaluation) =>
        buildIssue({
          executiveDecision,
          evaluation,
        }),
      )
      .filter(
        (
          issue,
        ): issue is InterventionConstraintIssue =>
          issue !== null,
      );

  const requiredViolations =
    issues.filter(
      (issue) =>
        issue.required &&
        issue.evaluationStatus ===
          "violated",
    );

  const unresolvedRequiredConstraints =
    issues.filter(
      (issue) =>
        issue.required &&
        (
          issue.evaluationStatus ===
            "insufficient-evidence" ||
          issue.evaluationStatus ===
            "requires-simulation"
        ),
    );

  const optionalIssues =
    issues.filter(
      (issue) =>
        !issue.required &&
        issue.evaluationStatus !==
          "satisfied",
    );

  if (requiredViolations.length > 0) {
    return {
      optionId:
        option.id,

      status:
        "disqualified",

      requiredViolations,

      unresolvedRequiredConstraints,

      optionalIssues,

      summary:
        "The intervention violates one or more required executive constraints and cannot currently be recommended.",
    };
  }

  if (
    unresolvedRequiredConstraints.length >
      0 ||
    optionalIssues.length > 0
  ) {
    return {
      optionId:
        option.id,

      status:
        "conditionally-viable",

      requiredViolations,

      unresolvedRequiredConstraints,

      optionalIssues,

      summary:
        "The intervention remains under consideration, but one or more constraints require simulation or additional evidence.",
    };
  }

  return {
    optionId:
      option.id,

    status:
      "viable",

    requiredViolations,

    unresolvedRequiredConstraints,

    optionalIssues,

    summary:
      "The intervention satisfies all currently evaluable executive constraints.",
  };
}