import type { ExecutiveDecision } from "../model/simulate/executiveDecision";
import type { InterventionOption } from "../model/simulate/interventionOption";

export type GenerateInterventionOptionsInput = {
  executiveDecision: ExecutiveDecision;

  generatedAt?: string;
};

function createOptionId(
  executiveDecisionId: string,
  suffix: string,
): string {
  return [
    "intervention-option",
    executiveDecisionId,
    suffix,
  ].join("-");
}

function allows(
  executiveDecision: ExecutiveDecision,
  interventionType: InterventionOption["type"],
): boolean {
  return executiveDecision.allowedInterventionTypes.includes(
    interventionType,
  );
}

export function generateInterventionOptions({
  executiveDecision,
  generatedAt = new Date().toISOString(),
}: GenerateInterventionOptionsInput): InterventionOption[] {
  const options: InterventionOption[] = [];

  const targetsExecution =
    executiveDecision.targetConditionIds.includes(
      "condition-executioncapacity",
    );

  if (!targetsExecution) {
    return options;
  }

  if (allows(executiveDecision, "governance")) {
    options.push({
      id: createOptionId(
        executiveDecision.id,
        "remove-approval-layer",
      ),

      executiveDecisionId:
        executiveDecision.id,

      organizationId:
        executiveDecision.organizationId,

      type:
        "governance",

      title:
        "Remove one approval layer",

      description:
        "Allow routine operating decisions to proceed without an additional leadership approval.",

      rationale:
        "Reducing avoidable approval dependency may improve decision flow, coordination, and execution throughput.",

      scope:
        "organization",

      timeHorizon:
        executiveDecision.timeHorizon,

      targetConditionIds: [
        "condition-decisionflow",
        "condition-executioncapacity",
      ],

      expectedMechanismIds: [
        "decisionLatency",
        "governanceFriction",
      ],

      satisfiedConstraintIndexes: [
        0,
      ],

      unresolvedConstraintIndexes: [],

      assumptions: [
        "Decision rights can be clarified.",
        "Control requirements remain intact.",
      ],

      risks: [
        "Poorly defined authority could create inconsistent decisions.",
      ],

      missingEvidence: [
        "Current approval workflow",
        "Decision latency by approval stage",
      ],

      confidence:
        0.82,

      createdAt:
        generatedAt,
    });
  }

  if (allows(executiveDecision, "policy")) {
    options.push({
      id: createOptionId(
        executiveDecision.id,
        "clarify-decision-ownership",
      ),

      executiveDecisionId:
        executiveDecision.id,

      organizationId:
        executiveDecision.organizationId,

      type:
        "policy",

      title:
        "Clarify decision ownership",

      description:
        "Define which roles own recurring operating decisions and when escalation is required.",

      rationale:
        "Clear decision ownership may reduce ambiguity, waiting, and repeated escalation.",

      scope:
        "organization",

      timeHorizon:
        executiveDecision.timeHorizon,

      targetConditionIds: [
        "condition-decisionflow",
        "condition-operatingmodel",
      ],

      expectedMechanismIds: [
        "accountabilityGap",
        "decisionLatency",
      ],

      satisfiedConstraintIndexes: [
        0,
      ],

      unresolvedConstraintIndexes: [],

      assumptions: [
        "Leaders can agree on decision boundaries.",
      ],

      risks: [
        "Ownership definitions may be ignored without reinforcement.",
      ],

      missingEvidence: [
        "Current role definitions",
        "Examples of repeated escalation",
      ],

      confidence:
        0.79,

      createdAt:
        generatedAt,
    });
  }

  if (allows(executiveDecision, "strategy")) {
    options.push({
      id: createOptionId(
        executiveDecision.id,
        "reduce-concurrent-work",
      ),

      executiveDecisionId:
        executiveDecision.id,

      organizationId:
        executiveDecision.organizationId,

      type:
        "strategy",

      title:
        "Reduce concurrent work",

      description:
        "Reduce the number of active priorities so execution capacity is concentrated on fewer outcomes.",

      rationale:
        "Lower work-in-progress may reduce priority conflict and protect execution capacity without increasing headcount.",

      scope:
        "organization",

      timeHorizon:
        executiveDecision.timeHorizon,

      targetConditionIds: [
        "condition-executioncapacity",
        "condition-strategicalignment",
      ],

      expectedMechanismIds: [
        "priorityConflict",
        "resourceConstraint",
      ],

      satisfiedConstraintIndexes: [
        0,
      ],

      unresolvedConstraintIndexes: [],

      assumptions: [
        "Leadership is willing to stop or defer lower-priority work.",
      ],

      risks: [
        "Deferred initiatives may create stakeholder resistance.",
      ],

      missingEvidence: [
        "Current initiative portfolio",
        "Resource allocation by initiative",
      ],

      confidence:
        0.85,

      createdAt:
        generatedAt,
    });
  }

  return options;
}