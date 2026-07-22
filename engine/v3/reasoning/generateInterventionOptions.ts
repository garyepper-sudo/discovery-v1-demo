import {
  evaluateInterventionConstraints,
} from "../decisions/evaluateInterventionConstraints";

import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  OrganizationalMechanism,
} from "../model/judgment/organizationalMechanism";

import type {
  OrganizationalCondition,
} from "../model/state/inferOrganizationalConditions";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

export type GenerateInterventionOptionsInput = {
  executiveDecision: ExecutiveDecision;

  organizationalConditions?: OrganizationalCondition[];

  organizationalMechanisms?: OrganizationalMechanism[];

  generatedAt?: string;
};

type InterventionOptionInput =
  Omit<
    InterventionOption,
    | "executiveDecisionId"
    | "organizationId"
    | "constraintEvaluations"
    | "createdAt"
  >;

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
  interventionType:
    InterventionOption["type"],
): boolean {
  return executiveDecision
    .allowedInterventionTypes
    .includes(
      interventionType,
    );
}

function targetsCondition(
  executiveDecision:
    ExecutiveDecision,

  conditionId:
    string,
): boolean {
  return executiveDecision
    .targetConditionIds
    .includes(
      conditionId,
    );
}

function createOption(
  executiveDecision:
    ExecutiveDecision,

  input:
    InterventionOptionInput,

  createdAt:
    string,

  organizationalConditions:
    OrganizationalCondition[],

  organizationalMechanisms:
    OrganizationalMechanism[],
): InterventionOption {
  const scope = resolveOrganizationalScope({
    executiveDecision,
    option: input,
    organizationalConditions,
    organizationalMechanisms,
  });

  const option:
    InterventionOption = {
      ...input,

      description:
        scope === "team"
          ? `${input.description} Limit the change to the affected team.`
          : scope === "department"
            ? `${input.description} Limit the change to the affected department.`
            : input.description,

      scope,

      profile: {
        ...input.profile,
        organizationalScope: scope,
      },

      executiveDecisionId:
        executiveDecision.id,

      organizationId:
        executiveDecision.organizationId,

      constraintEvaluations: [],

      createdAt,
    };

  option.constraintEvaluations =
    evaluateInterventionConstraints({
      executiveDecision,
      option,
    });

  return option;
}

function normalizedMechanismId(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^mechanism:/, "")
    .replace(/[^a-z0-9]/g, "");
}

function resolveOrganizationalScope({
  executiveDecision,
  option,
  organizationalConditions,
  organizationalMechanisms,
}: {
  executiveDecision: ExecutiveDecision;
  option: InterventionOptionInput;
  organizationalConditions: OrganizationalCondition[];
  organizationalMechanisms: OrganizationalMechanism[];
}): InterventionOption["scope"] {
  const targetedConditionIds = option.targetConditionIds.filter(
    (conditionId) =>
      executiveDecision.targetConditionIds.includes(conditionId),
  );

  if (targetedConditionIds.length !== 1) {
    return "organization";
  }

  const condition = organizationalConditions.find(
    (candidate) => candidate.id === targetedConditionIds[0],
  );

  if (!condition) {
    return "organization";
  }

  const supportingMechanismIds = new Set(
    condition.supportingMechanismIds.map(normalizedMechanismId),
  );
  const expectedMechanismIds = new Set(
    option.expectedMechanismIds.map(normalizedMechanismId),
  );

  const relevantScopes = organizationalMechanisms
    .filter((mechanism) => {
      const id = normalizedMechanismId(mechanism.id);
      const type = normalizedMechanismId(mechanism.type);

      return (
        supportingMechanismIds.has(id) &&
        (expectedMechanismIds.has(id) || expectedMechanismIds.has(type))
      );
    })
    .map((mechanism) => mechanism.organizationalScope);

  if (relevantScopes.includes("local")) {
    return "team";
  }

  if (relevantScopes.includes("crossFunctional")) {
    return "department";
  }

  return "organization";
}

export function generateInterventionOptions({
  executiveDecision,
  organizationalConditions = [],
  organizationalMechanisms = [],
  generatedAt =
    new Date().toISOString(),
}: GenerateInterventionOptionsInput): InterventionOption[] {
  const options:
    InterventionOption[] = [];

  const targetsCoordination =
    targetsCondition(
      executiveDecision,
      "condition-coordination",
    );

  const targetsDecisionFlow =
    targetsCondition(
      executiveDecision,
      "condition-decisionflow",
    );

  const targetsExecutionCapacity =
    targetsCondition(
      executiveDecision,
      "condition-executioncapacity",
    );

  const targetsOperatingModel =
    targetsCondition(
      executiveDecision,
      "condition-operatingmodel",
    );

  const targetsStrategicAlignment =
    targetsCondition(
      executiveDecision,
      "condition-strategicalignment",
    );

  const targetsLeadershipDependency =
    targetsCondition(
      executiveDecision,
      "condition-leadershipdependency",
    );

  const targetsSupportedConstraint =
    targetsCoordination ||
    targetsDecisionFlow ||
    targetsExecutionCapacity ||
    targetsOperatingModel ||
    targetsStrategicAlignment ||
    targetsLeadershipDependency;

  if (!targetsSupportedConstraint) {
    return options;
  }

  /**
   * Governance simplification
   *
   * Reduce unnecessary approval dependency where decision flow,
   * coordination, or leadership dependency is constraining execution.
   */
  if (
    (
      targetsCoordination ||
      targetsDecisionFlow ||
      targetsLeadershipDependency
    ) &&
    allows(
      executiveDecision,
      "governance",
    )
  ) {
    options.push(
      createOption(
        executiveDecision,
        {
          id:
            createOptionId(
              executiveDecision.id,
              "remove-approval-layer",
            ),

          type:
            "governance",

          title:
            "Remove one approval layer",

          description:
            "Allow routine operating decisions to proceed without an additional leadership approval.",

          rationale:
            "Reducing avoidable approval dependency may improve decision flow, coordination, leadership leverage, and execution throughput.",

          scope:
            "organization",

          timeHorizon:
            executiveDecision
              .timeHorizon,

          profile: {
            organizationalScope:
              "organization",

            implementationBurden:
              "moderate",

            organizationalDisruption:
              "low",

            reversibility:
              "high",

            leadershipAttentionRequired:
              "moderate",

            coordinationRequirement:
              "low",

            expectedTimeToImpact:
              executiveDecision.timeHorizon,

            implementationRisk:
              "moderate",

            preconditions: [
              "Routine decisions can be separated from decisions requiring leadership review.",
              "Decision accountability remains explicit after the approval layer is removed.",
            ],
          },

          targetConditionIds: [
            "condition-decisionflow",
            "condition-coordination",
            "condition-executioncapacity",
            "condition-leadershipdependency",
          ],

          expectedMechanismIds: [
            "decisionLatency",
            "governanceFriction",
            "leadershipDependency",
          ],

          assumptions: [
            "Decision rights can be clarified.",
            "Control requirements remain intact.",
            "Routine decisions do not require direct leadership involvement.",
          ],

          risks: [
            "Poorly defined authority could create inconsistent decisions.",
            "Removing approval without clarifying accountability could shift rather than resolve decision friction.",
          ],

          missingEvidence: [
            "Current approval workflow",
            "Decision latency by approval stage",
            "Percentage of routine decisions requiring leadership escalation",
          ],

          confidence:
            0.82,
        },
        generatedAt,
        organizationalConditions,
        organizationalMechanisms,
      ),
    );
  }

  /**
   * Ownership clarification
   *
   * Reduce ambiguity by defining recurring decision rights,
   * escalation boundaries, and accountable roles.
   */
  if (
    (
      targetsCoordination ||
      targetsDecisionFlow ||
      targetsOperatingModel ||
      targetsStrategicAlignment ||
      targetsLeadershipDependency
    ) &&
    allows(
      executiveDecision,
      "policy",
    )
  ) {
    options.push(
      createOption(
        executiveDecision,
        {
          id:
            createOptionId(
              executiveDecision.id,
              "clarify-decision-ownership",
            ),

          type:
            "policy",

          title:
            "Clarify decision ownership",

          description:
            "Define which roles own recurring operating decisions and when escalation is required.",

          rationale:
            "Clear decision ownership may reduce ambiguity, waiting, repeated escalation, leadership dependency, and cross-functional coordination friction.",

          scope:
            "organization",

          timeHorizon:
            executiveDecision
              .timeHorizon,

          profile: {
            organizationalScope:
              "organization",

            implementationBurden:
              "moderate",

            organizationalDisruption:
              "moderate",

            reversibility:
              "high",

            leadershipAttentionRequired:
              "high",

            coordinationRequirement:
              "high",

            expectedTimeToImpact:
              executiveDecision.timeHorizon,

            implementationRisk:
              "moderate",

            preconditions: [
              "Leaders agree on recurring decision boundaries.",
              "Named decision owners have sufficient authority and context.",
            ],
          },

          targetConditionIds: [
            "condition-coordination",
            "condition-decisionflow",
            "condition-operatingmodel",
            "condition-strategicalignment",
            "condition-leadershipdependency",
          ],

          expectedMechanismIds: [
            "accountabilityGap",
            "decisionLatency",
            "leadershipDependency",
          ],

          assumptions: [
            "Leaders can agree on decision boundaries.",
            "Decision owners have sufficient context and authority to act.",
          ],

          risks: [
            "Ownership definitions may be ignored without reinforcement.",
            "Overly rigid ownership boundaries may reduce necessary collaboration.",
          ],

          missingEvidence: [
            "Current role definitions",
            "Examples of repeated escalation",
            "Decision-right ambiguity across functions",
          ],

          confidence:
            0.79,
        },
        generatedAt,
        organizationalConditions,
        organizationalMechanisms,
      ),
    );
  }

  /**
   * Strategic focus
   *
   * Reduce work in progress where execution capacity, strategic
   * alignment, or leadership dependency is being diluted by too
   * many concurrent priorities.
   */
  if (
    (
      targetsExecutionCapacity ||
      targetsStrategicAlignment ||
      targetsLeadershipDependency ||
      targetsCoordination
    ) &&
    allows(
      executiveDecision,
      "strategy",
    )
  ) {
    options.push(
      createOption(
        executiveDecision,
        {
          id:
            createOptionId(
              executiveDecision.id,
              "reduce-concurrent-work",
            ),

          type:
            "strategy",

          title:
            "Reduce concurrent work",

          description:
            "Reduce the number of active priorities so organizational capacity and leadership attention are concentrated on fewer outcomes.",

          rationale:
            "Lower work-in-progress may reduce priority conflict, improve strategic alignment, reduce leadership coordination burden, and protect execution capacity without increasing headcount.",

          scope:
            "organization",

          timeHorizon:
            executiveDecision
              .timeHorizon,

          profile: {
            organizationalScope:
              "organization",

            implementationBurden:
              "low",

            organizationalDisruption:
              "moderate",

            reversibility:
              "high",

            leadershipAttentionRequired:
              "low",

            coordinationRequirement:
              "moderate",

            expectedTimeToImpact:
              executiveDecision.timeHorizon,

            implementationRisk:
              "low",

            preconditions: [
              "Leadership can stop or defer lower-priority work.",
              "The remaining priority portfolio receives sustained focus.",
            ],
          },

          targetConditionIds: [
            "condition-executioncapacity",
            "condition-strategicalignment",
            "condition-leadershipdependency",
            "condition-coordination",
          ],

          expectedMechanismIds: [
            "priorityConflict",
            "resourceConstraint",
            "leadershipAttentionFragmentation",
          ],

          assumptions: [
            "Leadership is willing to stop or defer lower-priority work.",
            "A smaller priority portfolio will receive sustained organizational focus.",
          ],

          risks: [
            "Deferred initiatives may create stakeholder resistance.",
            "Poor prioritization could pause strategically valuable work.",
          ],

          missingEvidence: [
            "Current initiative portfolio",
            "Resource allocation by initiative",
            "Leadership time allocated across active priorities",
          ],

          confidence:
            0.85,
        },
        generatedAt,
        organizationalConditions,
        organizationalMechanisms,
      ),
    );
  }

  return options;
}
