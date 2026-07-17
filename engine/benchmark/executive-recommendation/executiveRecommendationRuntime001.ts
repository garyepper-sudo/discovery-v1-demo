import {
  basename,
} from "node:path";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
} from "../../v3/runtime/organizationStateStore";

import type {
  ExecutiveRecommendation,
} from "../../v3/model/recommendation/executiveRecommendationTypes";

import {
  runExecutiveRecommendationOperatingSystem,
} from "../../v3/operating-systems/recommendation/runExecutiveRecommendationOperatingSystem";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "../high-volume/northstar/northstarCompanyFixture";

type RecommendationRuntimeMemory = {
  executiveRecommendation?:
    ExecutiveRecommendation;
};

type Check = {
  label:
    string;

  passed:
    boolean;
};

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
  }

  if (
    failed.length >
    0
  ) {
    throw new Error(
      `Executive Recommendation Runtime benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
    );
  }
}

export function runExecutiveRecommendationRuntime001():
  ExecutiveRecommendation {
  const originalRuntime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const originalInvestigationCount =
    originalRuntime.metadata
      .investigationCount;

  const result =
    runExecutiveRecommendationOperatingSystem({
      runtime:
        originalRuntime,

      now:
        "2026-07-17T20:00:00.000Z",
    });

  const persistedRuntime =
    persistOrganizationRuntimeState(
      result.runtime,
    );

  const reloadedRuntime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const persistedMemory =
    persistedRuntime.memory as
      typeof persistedRuntime.memory &
      RecommendationRuntimeMemory;

  const reloadedMemory =
    reloadedRuntime.memory as
      typeof reloadedRuntime.memory &
      RecommendationRuntimeMemory;

  const persistedRecommendation =
    persistedMemory
      .executiveRecommendation;

  const reloadedRecommendation =
    reloadedMemory
      .executiveRecommendation;

  console.log("");
  console.log("==========================================");
  console.log("EXECUTIVE RECOMMENDATION RUNTIME 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Recommendation: ${result.executiveRecommendation.headline}`,
  );

  console.log(
    `Runtime destination: runtime.memory.executiveRecommendation`,
  );

  console.log("");
  console.log("Checks");
  console.log("------------------------------------------");

  assertChecks(
    [
      {
        label:
          "Operating System produces an Executive Recommendation",

        passed:
          result
            .executiveRecommendation
            .id
            .length >
          0,
      },

      {
        label:
          "Operating System writes recommendation into runtime memory",

        passed:
          (
            result.runtime.memory as
              typeof result.runtime.memory &
              RecommendationRuntimeMemory
          )
            .executiveRecommendation
            ?.id ===
          result
            .executiveRecommendation
            .id,
      },

      {
        label:
          "Canonical runtime store persists the recommendation",

        passed:
          persistedRecommendation
            ?.id ===
          result
            .executiveRecommendation
            .id,
      },

      {
        label:
          "Recommendation survives runtime reload",

        passed:
          reloadedRecommendation
            ?.id ===
          result
            .executiveRecommendation
            .id,
      },

      {
        label:
          "Persisted recommendation preserves objective",

        passed:
          reloadedRecommendation
            ?.objective
            .id ===
          result
            .executiveRecommendation
            .objective
            .id,
      },

      {
        label:
          "Persisted recommendation preserves strategy",

        passed:
          reloadedRecommendation
            ?.strategy
            .id ===
          result
            .executiveRecommendation
            .strategy
            .id,
      },

      {
        label:
          "Persisted recommendation preserves intervention",

        passed:
          reloadedRecommendation
            ?.intervention
            .id ===
          result
            .executiveRecommendation
            .intervention
            .id,
      },

      {
        label:
          "Recommendation ancestry survives persistence",

        passed:
          reloadedRecommendation
            ?.supportingAssessmentId ===
          result
            .executiveRecommendation
            .supportingAssessmentId,
      },

      {
        label:
          "Recommendation confidence survives persistence",

        passed:
          reloadedRecommendation
            ?.confidence ===
          result
            .executiveRecommendation
            .confidence,
      },

      {
        label:
          "Recommendation boundaries survive persistence",

        passed:
          reloadedRecommendation
            ?.boundaries
            .doesNotOptimize ===
            true &&
          reloadedRecommendation
            ?.boundaries
            .doesNotSimulate ===
            true,
      },

      {
        label:
          "Recommendation persistence does not advance investigation count",

        passed:
          reloadedRuntime
            .metadata
            .investigationCount ===
          originalInvestigationCount,
      },
    ],
  );

  console.log("");
  console.log("==========================================");
  console.log("VALIDATION RESULT");
  console.log("==========================================");
  console.log("");
  console.log("PASS");
  console.log("");

  return result
    .executiveRecommendation;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "executiveRecommendationRuntime001.ts"
) {
  runExecutiveRecommendationRuntime001();
}
