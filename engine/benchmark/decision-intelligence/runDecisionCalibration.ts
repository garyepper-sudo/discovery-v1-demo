import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  buildOrganizationalIntervention,
} from "../../v3/model/simulate/buildOrganizationalIntervention";

import {
  buildExecutiveDecisionContext,
} from "../../v3/scenarios/buildExecutiveDecisionContext";

import {
  runExecutiveScenario,
} from "../../v3/scenarios/runExecutiveScenario";

import {
  buildExecutiveScenarioProjection,
} from "../../../components/executive-v2/projection/buildExecutiveScenarioProjection";

import {
  decisionCalibrationCases,
  type DecisionCalibrationCase,
} from "./decisionCalibrationCases";

type CalibrationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

type ConditionChange = {
  conditionId: string;
  change:
    | "improved"
    | "worsened"
    | "unchanged";
};

function runCalibrationCase(
  calibrationCase: DecisionCalibrationCase,
): {
  checks: CalibrationCheck[];
  passedChecks: number;
  failedChecks: number;
} {
  const runtime =
    loadOrganizationRuntimeState(
      calibrationCase.organizationId,
    );

  const now =
    new Date().toISOString();

  const intervention =
    buildOrganizationalIntervention({
      organizationId:
        calibrationCase.organizationId,

      ...calibrationCase.intervention,

      status:
        "hypothetical",

      createdAt:
        now,
    });

  const decisionContext =
    buildExecutiveDecisionContext(
      runtime,
      {
        changedEntityId:
          calibrationCase.changedEntityId,

        interventionDelta:
          calibrationCase.interventionDelta,

        timeHorizon:
          intervention.timeHorizon,

        simulatedAt:
          now,
      },
    );

  const scenarioResult =
    runExecutiveScenario({
      ...decisionContext,
      intervention,
    });

  const projection =
    buildExecutiveScenarioProjection(
      calibrationCase.organizationId,
      scenarioResult,
    );

  const conditionChanges =
    projection.comparison
      .conditionChanges as ConditionChange[];

  const checks: CalibrationCheck[] = [];

  for (
    const [
      conditionId,
      expectedDirection,
    ] of Object.entries(
      calibrationCase.expected
        .conditionDirections,
    )
  ) {
    const actual =
      conditionChanges.find(
        (change) =>
          change.conditionId ===
          conditionId,
      );

    checks.push({
      name:
        `${conditionId} direction`,

      passed:
        actual?.change ===
        expectedDirection,

      detail:
        actual
          ? `Expected ${expectedDirection}; received ${actual.change}.`
          : "Condition change was not produced.",
    });
  }

  checks.push({
    name:
      "Recommendation",

    passed:
      projection.comparison
        .recommendation ===
      calibrationCase.expected
        .recommendation,

    detail:
      `Expected ${calibrationCase.expected.recommendation}; received ${projection.comparison.recommendation}.`,
  });

  checks.push({
    name:
      "Projected Executive Assessment",

    passed:
      Boolean(
        projection.projectedFuture
          .executiveAssessment,
      ),

    detail:
      "Projected future must include a canonical Executive Assessment.",
  });

  checks.push({
    name:
      "Projected Executive Understanding",

    passed:
      projection.projectedFuture
        .understandingCandidates
        .length > 0,

    detail:
      `${projection.projectedFuture.understandingCandidates.length} understanding candidate(s) generated.`,
  });

  const passedChecks =
    checks.filter(
      (check) => check.passed,
    ).length;

  return {
    checks,
    passedChecks,
    failedChecks:
      checks.length -
      passedChecks,
  };
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION CALIBRATION");
console.log("==========================================");
console.log("");

let totalChecks = 0;
let totalPassed = 0;
let totalFailed = 0;

for (
  const calibrationCase of
  decisionCalibrationCases
) {
  console.log(
    calibrationCase.title.toUpperCase(),
  );

  console.log(
    "-".repeat(
      calibrationCase.title.length,
    ),
  );

  const result =
    runCalibrationCase(
      calibrationCase,
    );

  for (const check of result.checks) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
    );

    console.log(
      `      ${check.detail}`,
    );
  }

  console.log("");

  console.log(
    `Passed: ${result.passedChecks}`,
  );

  console.log(
    `Failed: ${result.failedChecks}`,
  );

  console.log("");

  totalChecks +=
    result.checks.length;

  totalPassed +=
    result.passedChecks;

  totalFailed +=
    result.failedChecks;
}

const score =
  totalChecks === 0
    ? 0
    : Math.round(
        (totalPassed / totalChecks) *
          100,
      );

console.log("==========================================");
console.log("CALIBRATION SUMMARY");
console.log("==========================================");

console.log(
  `Cases ............. ${decisionCalibrationCases.length}`,
);

console.log(
  `Checks ............ ${totalChecks}`,
);

console.log(
  `Passed ............ ${totalPassed}`,
);

console.log(
  `Failed ............ ${totalFailed}`,
);

console.log(
  `Score ............. ${score}%`,
);

console.log("");

if (totalFailed > 0) {
  process.exitCode = 1;
}