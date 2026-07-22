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
      | "profile"
      | "assumptions"
      | "risks"
      | "missingEvidence"
    >;
};

function evaluateCapacityConstraint(
  constraint:
    ExecutiveDecisionConstraint,

  option:
    EvaluateInterventionConstraintsInput["option"],
): InterventionConstraintEvaluation {
  const description =
    constraint.description
      .trim()
      .toLowerCase();

  const requiresMinimalLeadershipCapacity =
    /\b(minimal|limited|low)\b/.test(
      description,
    ) &&
    /\b(leadership|implementation capacity|capacity)\b/.test(
      description,
    );

  const requiresNarrowScope =
    /\b(narrow|localized|limited scope)\b/.test(
      description,
    );

  const requiresReversibility =
    /\breversib/.test(
      description,
    );

  if (
    requiresMinimalLeadershipCapacity
  ) {
    const fitsMinimalCapacity =
      option.profile
        .implementationBurden ===
        "low" &&
      option.profile
        .leadershipAttentionRequired ===
        "low";

    return {
      constraintIndex: 0,
      status:
        fitsMinimalCapacity
          ? "satisfied"
          : "violated",
      explanation:
        fitsMinimalCapacity
          ? "The intervention profile requires low implementation burden and low leadership attention."
          : `The intervention profile requires ${option.profile.implementationBurden} implementation burden and ${option.profile.leadershipAttentionRequired} leadership attention, which does not satisfy a minimal-capacity requirement.`,
    };
  }

  if (
    requiresNarrowScope ||
    requiresReversibility
  ) {
    if (
      requiresReversibility &&
      option.profile.reversibility ===
        "low"
    ) {
      return {
        constraintIndex: 0,
        status:
          "violated",
        explanation:
          "The intervention profile has low reversibility and does not satisfy the required reversible implementation boundary.",
      };
    }

    if (
      requiresNarrowScope &&
      option.profile
        .organizationalScope ===
        "organization"
    ) {
      const canBeEvaluatedAsBounded =
        option.profile
          .organizationalDisruption ===
          "low" &&
        option.profile
          .coordinationRequirement ===
          "low";

      return {
        constraintIndex: 0,
        status:
          canBeEvaluatedAsBounded
            ? "requires-simulation"
            : "violated",
        explanation:
          canBeEvaluatedAsBounded
            ? "The intervention is organization-scoped, but its low disruption and coordination requirements may permit a bounded implementation; simulation must confirm this."
            : "The intervention profile is organization-scoped and its execution characteristics do not satisfy a narrow implementation boundary.",
      };
    }

    return {
      constraintIndex: 0,
      status:
        "satisfied",
      explanation:
        "The intervention profile satisfies the structured scope and reversibility requirements.",
    };
  }

  return {
    constraintIndex: 0,
    status:
      "insufficient-evidence",
    explanation:
      "The capacity constraint does not specify a structured execution characteristic that can be compared with the intervention profile.",
  };
}

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

    case "capacity": {
      const evaluation =
        evaluateCapacityConstraint(
          constraint,
          option,
        );

      return {
        ...evaluation,
        constraintIndex,
      };
    }

    case "budget":
    case "people":
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
