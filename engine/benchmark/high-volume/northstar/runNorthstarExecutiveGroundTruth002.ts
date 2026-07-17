import {
  basename,
} from "node:path";

import {
  loadOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

type UnknownRecord =
  Record<
    string,
    unknown
  >;

type ExecutiveCapabilityId =
  | "primaryJudgment"
  | "dominantCausalChain"
  | "executiveFocus"
  | "executiveRisks";

type ExpectedDimension = {
  id:
    string;

  label:
    string;

  expressions:
    string[];

  required:
    boolean;
};

type CapabilityDefinition = {
  id:
    ExecutiveCapabilityId;

  label:
    string;

  weight:
    number;

  dimensions:
    ExpectedDimension[];
};

type DimensionResult = {
  id:
    string;

  label:
    string;

  matched:
    boolean;

  matchedExpression:
    string | null;

  required:
    boolean;
};

type CapabilityResult = {
  id:
    ExecutiveCapabilityId;

  label:
    string;

  weight:
    number;

  score:
    number;

  accuracy:
    number;

  passed:
    boolean;

  exposed:
    boolean;

  dimensions:
    DimensionResult[];
};

type NorthstarExecutiveGroundTruthScore = {
  benchmarkId:
    "northstar-executive-ground-truth-002";

  organizationId:
    string;

  evaluatedAt:
    string;

  overallScore:
    number;

  passed:
    boolean;

  capabilities:
    CapabilityResult[];

  conclusion:
    string;
};

type ExtendedMemory = {
  executiveAssessment?:
    UnknownRecord;
};

const CAPABILITY_DEFINITIONS:
  CapabilityDefinition[] = [
  {
    id:
      "primaryJudgment",

    label:
      "Primary Judgment",

    weight:
      30,

    dimensions: [
      {
        id:
          "primary-constraint",

        label:
          "Identifies Execution Capacity as the primary constraint",

        expressions: [
          "execution capacity is the organization s primary constraint",
          "execution capacity",
        ],

        required:
          true,
      },

      {
        id:
          "concurrent-work",

        label:
          "Connects the constraint to excessive concurrent work",

        expressions: [
          "concurrent work",
          "work in progress",
          "too many projects",
          "priority conflict",
          "competing priorities",
          "execution demand appears to exceed",
          "demand exceeds execution capacity",
        ],

        required:
          true,
      },

      {
        id:
          "decision-rights",

        label:
          "Connects the constraint to weak decision rights",

        expressions: [
          "decision rights",
          "decision authority",
          "approval dependency",
          "governance friction",
          "decision flow",
          "centralized authority",
          "leadership dependency",
        ],

        required:
          true,
      },

      {
        id:
          "staffing-boundary",

        label:
          "Does not frame staffing as the root cause",

        expressions: [
          "staffing is not",
          "not a staffing",
          "without adding headcount",
          "avoid additional headcount",
          "hiring will not",
          "prioritization governance coordination",
        ],

        required:
          false,
      },
    ],
  },

  {
    id:
      "dominantCausalChain",

    label:
      "Dominant Causal Chain",

    weight:
      30,

    dimensions: [
      {
        id:
          "causal-drivers",

        label:
          "Names operating drivers of Execution Capacity",

        expressions: [
          "resource constraint",
          "capability constraint",
          "execution drag",
          "priority conflict",
        ],

        required:
          true,
      },

      {
        id:
          "decision-flow-reinforcement",

        label:
          "Connects Decision Flow to Execution Capacity",

        expressions: [
          "decision flow reinforces execution capacity",
          "decision flow",
        ],

        required:
          true,
      },

      {
        id:
          "coordination-reinforcement",

        label:
          "Connects Coordination System to Execution Capacity",

        expressions: [
          "coordination system reinforces execution capacity",
          "coordination system",
          "coordination breakdown",
        ],

        required:
          true,
      },

      {
        id:
          "state-propagation",

        label:
          "Connects the constraint to organizational state",

        expressions: [
          "shapes organizational state",
          "organizational state strained",
          "organizational state",
        ],

        required:
          true,
      },
    ],
  },

  {
    id:
      "executiveFocus",

    label:
      "Executive Focus",

    weight:
      20,

    dimensions: [
      {
        id:
          "focus-primary",

        label:
          "Centers executive attention on Execution Capacity",

        expressions: [
          "executive attention should center on execution capacity",
          "execution capacity",
        ],

        required:
          true,
      },

      {
        id:
          "reduce-work",

        label:
          "Directs leadership to reduce or sequence active work",

        expressions: [
          "reduce concurrent",
          "reduce active work",
          "sequence work",
          "protect the highest leverage work",
          "protect the highest leverage priorities",
          "identify where demand exceeds execution capacity",
        ],

        required:
          true,
      },

      {
        id:
          "decision-rights-focus",

        label:
          "Keeps Decision Flow or decision rights in focus",

        expressions: [
          "decision flow",
          "decision rights",
          "decision authority",
          "reduce approval dependency",
        ],

        required:
          true,
      },
    ],
  },

  {
    id:
      "executiveRisks",

    label:
      "Executive Risks",

    weight:
      20,

    dimensions: [
      {
        id:
          "primary-risk",

        label:
          "States the immediate Execution Capacity risk",

        expressions: [
          "priority work will continue to compete for limited capacity",
          "reducing throughput",
          "delivery pressure",
          "execution capacity",
        ],

        required:
          true,
      },

      {
        id:
          "decision-risk",

        label:
          "Surfaces Decision Flow risk",

        expressions: [
          "decision queues",
          "escalation dependency",
          "decision flow",
          "slowing execution",
        ],

        required:
          true,
      },

      {
        id:
          "coordination-risk",

        label:
          "Surfaces Coordination System risk",

        expressions: [
          "cross functional handoffs",
          "coordination system",
          "management attention",
          "handoffs are likely to remain fragile",
        ],

        required:
          true,
      },

      {
        id:
          "customer-downstream-risk",

        label:
          "Connects operating risk to customer consequences",

        expressions: [
          "customer escalation",
          "customer friction",
          "strategic account risk",
          "delivery failure",
        ],

        required:
          false,
      },
    ],
  },
];

function asRecord(
  value:
    unknown,
): UnknownRecord | null {
  if (
    value ===
      null ||
    value ===
      undefined ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  return value as
    UnknownRecord;
}

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

function collectText(
  value:
    unknown,
): string[] {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return [];
  }

  if (
    typeof value ===
      "string"
  ) {
    return [
      value,
    ];
  }

  if (
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return [];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value.flatMap(
      collectText,
    );
  }

  if (
    typeof value ===
      "object"
  ) {
    return Object.values(
      value as
        UnknownRecord,
    ).flatMap(
      collectText,
    );
  }

  return [];
}

function findExpression(
  text:
    string,

  expressions:
    string[],
): string | null {
  for (
    const expression of
    expressions
  ) {
    const normalized =
      normalizeText(
        expression,
      );

    if (
      normalized.length >
        0 &&
      text.includes(
        normalized,
      )
    ) {
      return expression;
    }
  }

  return null;
}

function scoreCapability(
  definition:
    CapabilityDefinition,

  value:
    unknown,
): CapabilityResult {
  const record =
    asRecord(
      value,
    );

  if (
    !record
  ) {
    return {
      id:
        definition.id,

      label:
        definition.label,

      weight:
        definition.weight,

      score:
        0,

      accuracy:
        0,

      passed:
        false,

      exposed:
        false,

      dimensions:
        definition.dimensions.map(
          (dimension) => ({
            id:
              dimension.id,

            label:
              dimension.label,

            matched:
              false,

            matchedExpression:
              null,

            required:
              dimension.required,
          }),
        ),
    };
  }

  const text =
    normalizeText(
      collectText(
        record,
      ).join(
        " ",
      ),
    );

  const dimensions =
    definition.dimensions.map(
      (
        dimension,
      ): DimensionResult => {
        const matchedExpression =
          findExpression(
            text,
            dimension.expressions,
          );

        return {
          id:
            dimension.id,

          label:
            dimension.label,

          matched:
            matchedExpression !==
            null,

          matchedExpression,

          required:
            dimension.required,
        };
      },
    );

  const requiredDimensions =
    dimensions.filter(
      (dimension) =>
        dimension.required,
    );

  const optionalDimensions =
    dimensions.filter(
      (dimension) =>
        !dimension.required,
    );

  const requiredAccuracy =
    requiredDimensions.length ===
      0
      ? 1
      : requiredDimensions.filter(
          (dimension) =>
            dimension.matched,
        ).length /
        requiredDimensions.length;

  const optionalBonus =
    optionalDimensions.length ===
      0
      ? 0
      : optionalDimensions.filter(
          (dimension) =>
            dimension.matched,
        ).length /
        optionalDimensions.length *
        0.1;

  const accuracy =
    Math.min(
      1,
      requiredAccuracy *
        0.9 +
        optionalBonus,
    );

  const score =
    Number(
      (
        definition.weight *
        accuracy
      ).toFixed(
        2,
      ),
    );

  return {
    id:
      definition.id,

    label:
      definition.label,

    weight:
      definition.weight,

    score,

    accuracy:
      Number(
        (
          accuracy *
          100
        ).toFixed(
          2,
        ),
      ),

    passed:
      requiredAccuracy >=
        0.75,

    exposed:
      true,

    dimensions,
  };
}

function buildConclusion(
  score:
    number,
): string {
  if (
    score >=
    90
  ) {
    return "Discovery converged strongly on the known Northstar ground truth through the current Executive Assessment architecture.";
  }

  if (
    score >=
    80
  ) {
    return "Discovery produced a substantially correct executive synthesis, with limited specificity gaps remaining.";
  }

  if (
    score >=
    65
  ) {
    return "Discovery produced a materially improved executive synthesis but has important causal or downstream gaps remaining.";
  }

  return "Discovery did not yet converge reliably on the Northstar ground truth through the structured Executive Assessment capabilities.";
}

function printCapability(
  result:
    CapabilityResult,
): void {
  console.log("------------------------------------------");
  console.log(
    result.label,
  );

  console.log(
    `${result.passed ? "PASS" : "PARTIAL"}  ${result.score} / ${result.weight} (${result.accuracy}%)`,
  );

  console.log(
    `Structured object exposed: ${result.exposed ? "yes" : "no"}`,
  );

  console.log("");

  for (
    const dimension of
    result.dimensions
  ) {
    const requirement =
      dimension.required
        ? "REQUIRED"
        : "BONUS";

    console.log(
      `${dimension.matched ? "PASS" : "MISS"}  ${requirement}  ${dimension.label}`,
    );

    if (
      dimension.matchedExpression
    ) {
      console.log(
        `  Matched: ${dimension.matchedExpression}`,
      );
    }
  }

  console.log("");
}

export function runNorthstarExecutiveGroundTruth002():
  NorthstarExecutiveGroundTruthScore {
  const runtime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const memory =
    runtime.memory as
      typeof runtime.memory &
      ExtendedMemory;

  const assessment =
    asRecord(
      memory.executiveAssessment,
    );

  const capabilities =
    CAPABILITY_DEFINITIONS.map(
      (definition) =>
        scoreCapability(
          definition,
          assessment?.[
            definition.id
          ],
        ),
    );

  const overallScore =
    Number(
      capabilities
        .reduce(
          (
            total,
            capability,
          ) =>
            total +
            capability.score,
          0,
        )
        .toFixed(
          2,
        ),
    );

  const score:
    NorthstarExecutiveGroundTruthScore = {
    benchmarkId:
      "northstar-executive-ground-truth-002",

    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    evaluatedAt:
      new Date()
        .toISOString(),

    overallScore,

    passed:
      overallScore >=
        80,

    capabilities,

    conclusion:
      buildConclusion(
        overallScore,
      ),
  };

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR EXECUTIVE GROUND TRUTH 002");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Known primary problem: ${northstarCompanyFixture.groundTruth.primaryProblem}`,
  );

  console.log("");

  for (
    const capability of
    capabilities
  ) {
    printCapability(
      capability,
    );
  }

  console.log("==========================================");
  console.log("EXECUTIVE GROUND TRUTH RESULT");
  console.log("==========================================");
  console.log("");

  console.log(
    `Overall executive accuracy: ${overallScore} / 100`,
  );

  console.log(
    `Result: ${score.passed ? "PASS" : "PARTIAL"}`,
  );

  console.log("");
  console.log(
    score.conclusion,
  );

  console.log("");

  return score;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarExecutiveGroundTruth002.ts"
) {
  runNorthstarExecutiveGroundTruth002();
}

export type {
  CapabilityResult,
  DimensionResult,
  NorthstarExecutiveGroundTruthScore,
};
