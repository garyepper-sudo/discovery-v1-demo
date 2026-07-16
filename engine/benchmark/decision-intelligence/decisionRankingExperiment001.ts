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
  type ExecutiveScenarioResult,
} from "../../v3/scenarios/runExecutiveScenario";

import {
  compareExecutiveScenarios,
} from "../../v3/decisions/compareExecutiveScenarios";

import {
  rankExecutiveScenarios,
} from "../../v3/decisions/rankExecutiveScenarios";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const SIMULATED_AT =
  "2026-07-13T12:00:00.000Z";

type ExperimentCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

const executiveDecision: ExecutiveDecision = {
  id:
    "executive-decision-ranking-experiment-001",

  organizationId:
    ORGANIZATION_ID,

  type:
    "execution",

  title:
    "Improve Organizational Execution",

  objective:
    "Improve execution capacity by reducing avoidable decision friction.",

  rationale:
    "Leadership wants the organization to execute faster without accepting unnecessary organizational deterioration.",

  status:
    "ready",

  timeHorizon:
    "near-term",

  targetConditionIds: [
    "condition-decisionflow",
  ],

  successMetrics: [
    {
      name:
        "Decision Flow",

      rationale:
        "Decision flow must improve for the intervention to produce the intended execution benefit.",
    },
  ],

  constraints: [
    {
      type:
        "risk",

      description:
        "Do not create more organizational deterioration than improvement.",

      required:
        true,
    },
  ],

  allowedInterventionTypes: [
    "governance",
  ],

  assumptions: [
    "The current organizational baseline is sufficiently accurate for scenario comparison.",
  ],

  openQuestions: [],

  confidence:
    0.8,

  createdAt:
    SIMULATED_AT,

  updatedAt:
    SIMULATED_AT,
};

function buildScenario(params: {
  title: string;
  description: string;
  rationale: string;
  interventionDelta: number;
}): ExecutiveScenarioResult {
  const runtime =
    loadOrganizationRuntimeState(
      ORGANIZATION_ID,
    );

  const intervention =
    buildOrganizationalIntervention({
      organizationId:
        ORGANIZATION_ID,

      type:
        "governance",

      title:
        params.title,

      description:
        params.description,

      rationale:
        params.rationale,

      scope:
        "organization",

      timeHorizon:
        executiveDecision.timeHorizon,

      status:
        "hypothetical",

      affectedConditionIds: [
        "condition-decisionflow",
      ],

      expectedMechanismIds: [
        "mechanism:governanceFriction",
        "mechanism:decisionLatency",
      ],

      assumptions: [
        "The intervention is applied consistently across the organization.",
        "No unrelated organizational change occurs during the scenario.",
      ],

      confidence:
        0.8,

      createdAt:
        SIMULATED_AT,
    });

  const context =
    buildExecutiveDecisionContext(
      runtime,
      {
        changedEntityId:
          "condition-decisionflow",

        interventionDelta:
          params.interventionDelta,

        timeHorizon:
          intervention.timeHorizon,

        simulatedAt:
          SIMULATED_AT,
      },
    );

  return runExecutiveScenario({
    ...context,
    intervention,
  });
}

function rankingSnapshot(
  scenarios: ExecutiveScenarioResult[],
): string {
  const comparisonSet =
    compareExecutiveScenarios({
      scenarios,
      generatedAt:
        SIMULATED_AT,
    });

  const ranking =
    rankExecutiveScenarios({
      executiveDecision,
      comparisonSet,
    });

  return JSON.stringify(
    ranking.map((entry) => ({
      rank:
        entry.rank,

      interventionId:
        entry.interventionId,

      score:
        entry.score,

      objectiveAlignmentScore:
        entry.objectiveAlignmentScore,

      organizationalBenefitScore:
        entry.organizationalBenefitScore,

      organizationalRiskScore:
        entry.organizationalRiskScore,

      confidenceScore:
        entry.confidenceScore,

      recommendationScore:
        entry.recommendationScore,
    })),
  );
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION RANKING");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

const clarifyDecisionRights =
  buildScenario({
    title:
      "Clarify Decision Rights",

    description:
      "Reduce approval bottlenecks by clarifying decision authority.",

    rationale:
      "Evaluate whether reducing governance friction improves organizational execution.",

    interventionDelta:
      0.25,
  });

const increaseApprovalLayers =
  buildScenario({
    title:
      "Increase Approval Layers",

    description:
      "Require additional leadership approval before operational decisions can be made.",

    rationale:
      "Evaluate whether additional governance controls improve or degrade organizational performance.",

    interventionDelta:
      -0.25,
  });

const scenarios = [
  clarifyDecisionRights,
  increaseApprovalLayers,
];

const comparisonSet =
  compareExecutiveScenarios({
    scenarios,
    generatedAt:
      SIMULATED_AT,
  });

const ranking =
  rankExecutiveScenarios({
    executiveDecision,
    comparisonSet,
  });

const firstRanked =
  ranking[0];

const secondRanked =
  ranking[1];

const clarifyInterventionId =
  clarifyDecisionRights.intervention.id;

const approvalInterventionId =
  increaseApprovalLayers.intervention.id;

const firstSnapshot =
  rankingSnapshot(scenarios);

const secondSnapshot =
  rankingSnapshot(scenarios);

const checks: ExperimentCheck[] = [
  {
    name:
      "Scenario comparison set created",

    passed:
      comparisonSet
        .scenarioComparisons
        .length === 2,

    detail:
      `${comparisonSet.scenarioComparisons.length}/2 scenarios compared.`,
  },

  {
    name:
      "Ranking returned two entries",

    passed:
      ranking.length === 2,

    detail:
      `${ranking.length}/2 scenarios ranked.`,
  },

  {
    name:
      "Clarify Decision Rights ranks first",

    passed:
      firstRanked
        ?.interventionId ===
      clarifyInterventionId,

    detail:
      firstRanked
        ? `Rank 1: ${firstRanked.interventionId}`
        : "No first-ranked scenario.",
  },

  {
    name:
      "Increase Approval Layers ranks second",

    passed:
      secondRanked
        ?.interventionId ===
      approvalInterventionId,

    detail:
      secondRanked
        ? `Rank 2: ${secondRanked.interventionId}`
        : "No second-ranked scenario.",
  },

  {
    name:
      "Beneficial option scores higher",

    passed:
      Boolean(
        firstRanked &&
        secondRanked &&
        firstRanked.score >
          secondRanked.score,
      ),

    detail:
      firstRanked &&
      secondRanked
        ? `${firstRanked.score.toFixed(4)} versus ${secondRanked.score.toFixed(4)}`
        : "Ranking scores unavailable.",
  },

  {
    name:
      "Beneficial option aligns better with the executive objective",

    passed:
      Boolean(
        firstRanked &&
        secondRanked &&
        firstRanked
          .objectiveAlignmentScore >
          secondRanked
            .objectiveAlignmentScore,
      ),

    detail:
      firstRanked &&
      secondRanked
        ? `${Math.round(firstRanked.objectiveAlignmentScore * 100)}% versus ${Math.round(secondRanked.objectiveAlignmentScore * 100)}% objective alignment`
        : "Objective alignment scores unavailable.",
  },

  {
    name:
      "Harmful option does not rank first",

    passed:
      firstRanked
        ?.interventionId !==
      approvalInterventionId,

    detail:
      firstRanked
        ? `Top-ranked intervention: ${firstRanked.interventionId}`
        : "No top-ranked intervention.",
  },

  {
    name:
      "Ranking is deterministic",

    passed:
      firstSnapshot ===
      secondSnapshot,

    detail:
      firstSnapshot ===
      secondSnapshot
        ? "Repeated ranking produced identical results."
        : "Repeated ranking produced different results.",
  },

  {
    name:
      "Recommendations differentiate scenarios",

    passed:
      comparisonSet
        .differentiatingRecommendations,

    detail:
      comparisonSet
        .differentiatingRecommendations
        ? "The scenarios produced different executive recommendations."
        : "The scenarios produced the same executive recommendation.",
  },

  {
    name:
      "Condition outcomes differentiate scenarios",

    passed:
      comparisonSet
        .differentiatingConditionIds
        .length > 0,

    detail:
      `${comparisonSet.differentiatingConditionIds.length} differentiating condition(s).`,
  },
];

const passedChecks =
  checks.filter(
    (check) => check.passed,
  ).length;

const failedChecks =
  checks.length -
  passedChecks;

console.log("Executive Objective");
console.log("------------------------------");
console.log(
  executiveDecision.objective,
);
console.log("");

console.log("Ranked Scenarios");
console.log("------------------------------");

for (const rankedScenario of ranking) {
  const scenario =
    scenarios.find(
      (candidate) =>
        candidate.intervention.id ===
        rankedScenario.interventionId,
    );

  console.log(
    `${rankedScenario.rank}. ${scenario?.intervention.title ?? rankedScenario.interventionId}`,
  );

  console.log(
    `   Score: ${Math.round(rankedScenario.score * 100)}%`,
  );

  console.log(
    `   Objective alignment: ${Math.round(rankedScenario.objectiveAlignmentScore * 100)}%`,
  );

  console.log(
    `   Benefit: ${Math.round(rankedScenario.organizationalBenefitScore * 100)}%`,
  );

  console.log(
    `   Risk: ${Math.round(rankedScenario.organizationalRiskScore * 100)}%`,
  );

  console.log(
    `   Confidence: ${Math.round(rankedScenario.confidenceScore * 100)}%`,
  );

  console.log(
    `   Recommendation score: ${Math.round(rankedScenario.recommendationScore * 100)}%`,
  );

  for (
    const reason of
    rankedScenario.reasonsForRank
  ) {
    console.log(
      `   - ${reason}`,
    );
  }

  console.log("");
}

console.log("Experiment Assertions");
console.log("------------------------------");

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
  );

  console.log(
    `      ${check.detail}`,
  );
}

console.log("");
console.log(
  `Passed Checks: ${passedChecks}`,
);
console.log(
  `Failed Checks: ${failedChecks}`,
);
console.log("");

if (failedChecks > 0) {
  process.exitCode = 1;
}

console.log("Experiment Complete");
console.log("");
