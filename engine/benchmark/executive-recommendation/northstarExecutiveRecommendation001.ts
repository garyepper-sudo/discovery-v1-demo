import {
  basename,
} from "node:path";

import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime/organizationStateStore";

import {
  buildExecutiveRecommendation,
} from "../../v3/model/recommendation/buildExecutiveRecommendation";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "../high-volume/northstar/northstarCompanyFixture";

import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../../v3/model/judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../v3/model/state/inferOrganizationalConditions";

type UnknownRecord =
  Record<
    string,
    unknown
  >;

type ExtendedMemory = {
  executiveAssessment?:
    ExecutiveAssessmentWithPrimaryJudgment;

  organizationalState?:
    OrganizationalState;

  organizationalConditions?:
    OrganizationalCondition[];
};

type Check = {
  label:
    string;

  passed:
    boolean;

  detail?:
    string;
};

function normalizeText(
  value:
    string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .toLowerCase()
    .replace(
      /[_/.-]+/g,
      " ",
    )
    .replace(
      /[^a-z0-9\s]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function includesAny(
  value:
    string,

  expressions:
    string[],
): boolean {
  const normalizedValue =
    normalizeText(
      value,
    );

  return expressions.some(
    (expression) =>
      normalizedValue.includes(
        normalizeText(
          expression,
        ),
      ),
  );
}

function assertChecks(
  checks:
    Check[],
): void {
  const failed =
    checks.filter(
      (check) =>
        !check.passed,
    );

  for (
    const check of
    checks
  ) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.label}`,
    );

    if (
      check.detail
    ) {
      console.log(
        `  ${check.detail}`,
      );
    }
  }

  if (
    failed.length >
    0
  ) {
    throw new Error(
      `Northstar Executive Recommendation benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
    );
  }
}

export function runNorthstarExecutiveRecommendation001():
  ReturnType<
    typeof buildExecutiveRecommendation
  > {
  const runtime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const memory =
    runtime.memory as
      typeof runtime.memory &
      ExtendedMemory;

  const executiveAssessment =
    memory.executiveAssessment;

  const organizationalState =
    memory.organizationalState;

  const organizationalConditions =
    memory.organizationalConditions ??
    [];

  if (
    !executiveAssessment
  ) {
    throw new Error(
      "Northstar Executive Recommendation requires runtime.memory.executiveAssessment.",
    );
  }

  if (
    !organizationalState
  ) {
    throw new Error(
      "Northstar Executive Recommendation requires runtime.memory.organizationalState.",
    );
  }

  if (
    organizationalConditions.length ===
    0
  ) {
    throw new Error(
      "Northstar Executive Recommendation requires runtime.memory.organizationalConditions.",
    );
  }

  const recommendation =
    buildExecutiveRecommendation({
      executiveAssessment,

      organizationalState,

      organizationalConditions,

      now:
        "2026-07-17T19:00:00.000Z",
    });

  const combinedText =
    [
      recommendation.headline,
      recommendation.executiveRecommendation,
      recommendation.objective.headline,
      recommendation.objective.executiveObjective,
      recommendation.strategy.executiveStrategy,
      ...recommendation.strategy.strategies.map(
        (strategy) =>
          [
            strategy.headline,
            strategy.strategicDirection,
            strategy.rationale,
          ].join(
            " ",
          ),
      ),
      recommendation.intervention.headline,
      recommendation.intervention.executiveIntervention,
      recommendation.intervention.rationale,
      recommendation.rationale,
    ].join(
      " ",
    );

  const checks:
    Check[] = [
    {
      label:
        "Recommendation consumes the canonical Executive Assessment",

      passed:
        recommendation.supportingAssessmentId ===
        (
          (
            executiveAssessment as
              ExecutiveAssessmentWithPrimaryJudgment & {
                id?:
                  string;
              }
          )
            .id ??
          "executiveAssessment-1"
        ),
    },

    {
      label:
        "Primary condition is preserved",

      passed:
        recommendation.objective
          .targetConditionId ===
        recommendation.intervention
          .targetConditionId,
    },

    {
      label:
        "Objective targets Execution Capacity",

      passed:
        includesAny(
          recommendation.objective
            .headline,
          [
            "increase execution capacity",
            "stabilize execution capacity",
          ],
        ),
    },

    {
      label:
        "Strategy reduces competing work",

      passed:
        recommendation.strategy
          .strategies
          .some(
            (strategy) =>
              strategy.theme ===
              "reduce_competing_work",
          ),
    },

    {
      label:
        "Strategy retains decision-rights reasoning",

      passed:
        recommendation.strategy
          .strategies
          .some(
            (strategy) =>
              strategy.theme ===
              "clarify_decision_rights",
          ),
    },

    {
      label:
        "Strategy retains coordination reasoning",

      passed:
        recommendation.strategy
          .strategies
          .some(
            (strategy) =>
              strategy.theme ===
              "strengthen_coordination",
          ),
    },

    {
      label:
        "Intervention reduces active work in progress",

      passed:
        recommendation.intervention
          .interventionType ===
          "work_portfolio_reduction" &&
        includesAny(
          combinedText,
          [
            "reduce active work in progress",
            "reduce the number of concurrently active priorities",
          ],
        ),
    },

    {
      label:
        "Recommendation is specific to Northstar's known root cause",

      passed:
        includesAny(
          combinedText,
          [
            "competing work",
            "concurrently active priorities",
            "work in progress",
          ],
        ) &&
        includesAny(
          combinedText,
          [
            "decision rights",
            "decision authority",
            "approval dependency",
          ],
        ),
    },

    {
      label:
        "Recommendation does not treat headcount as the primary solution",

      passed:
        !includesAny(
          combinedText,
          [
            "hire more people",
            "increase headcount",
            "add headcount",
            "staffing increase",
            "recruit additional",
          ],
        ),
    },

    {
      label:
        "Recommendation avoids unsupported technology replacement",

      passed:
        !includesAny(
          combinedText,
          [
            "replace the technology stack",
            "replace core systems",
            "new erp",
            "technology replacement",
          ],
        ),
    },

    {
      label:
        "Recommendation avoids unsupported reorganization",

      passed:
        !includesAny(
          combinedText,
          [
            "reorganize the company",
            "major reorganization",
            "restructure the organization",
            "replace leadership",
          ],
        ),
    },

    {
      label:
        "Objective ancestry is preserved",

      passed:
        recommendation.intervention
          .supportingObjectiveId ===
        recommendation.objective.id,
    },

    {
      label:
        "Strategy ancestry is preserved",

      passed:
        recommendation.intervention
          .supportingStrategyId ===
        recommendation.strategy.id,
    },

    {
      label:
        "Condition ancestry is preserved",

      passed:
        recommendation
          .supportingConditionIds
          .includes(
            recommendation.objective
              .targetConditionId,
          ),
    },

    {
      label:
        "Recommendation remains distinct from Optimization",

      passed:
        recommendation.boundaries
          .doesNotOptimize ===
        true &&
        recommendation.intervention
          .boundaries
          .doesNotOptimize ===
        true,
    },

    {
      label:
        "Recommendation remains distinct from Simulation",

      passed:
        recommendation.boundaries
          .doesNotSimulate ===
        true &&
        recommendation.intervention
          .boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Recommendation avoids detailed implementation planning",

      passed:
        recommendation.boundaries
          .doesNotProduceImplementationPlan ===
        true &&
        recommendation.intervention
          .boundaries
          .doesNotSpecifyDetailedImplementationPlan ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        recommendation.confidence >=
          0 &&
        recommendation.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is explicit",

      passed:
        recommendation
          .uncertaintySummary
          .trim()
          .length >
        0,
    },
  ];

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR EXECUTIVE RECOMMENDATION 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Known primary problem: ${northstarCompanyFixture.groundTruth.primaryProblem}`,
  );

  console.log("");

  console.log("Objective");
  console.log("------------------------------------------");
  console.log(
    recommendation.objective.headline,
  );

  console.log("");
  console.log(
    recommendation.objective
      .executiveObjective,
  );

  console.log("");
  console.log("Strategy");
  console.log("------------------------------------------");

  for (
    const strategy of
    recommendation.strategy.strategies
  ) {
    console.log(
      `${strategy.priority.toUpperCase()}  ${strategy.headline}`,
    );

    console.log(
      `  ${strategy.strategicDirection}`,
    );
  }

  console.log("");
  console.log("Intervention");
  console.log("------------------------------------------");
  console.log(
    recommendation.intervention
      .headline,
  );

  console.log("");
  console.log(
    recommendation.intervention
      .executiveIntervention,
  );

  console.log("");
  console.log(
    `Confidence: ${recommendation.confidence.toFixed(3)}`,
  );

  console.log(
    `Uncertainty: ${recommendation.uncertaintySummary}`,
  );

  console.log("");
  console.log("Checks");
  console.log("------------------------------------------");

  assertChecks(
    checks,
  );

  console.log("");
  console.log("==========================================");
  console.log("VALIDATION RESULT");
  console.log("==========================================");
  console.log("");
  console.log("PASS");
  console.log("");

  return recommendation;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "northstarExecutiveRecommendation001.ts"
) {
  runNorthstarExecutiveRecommendation001();
}
