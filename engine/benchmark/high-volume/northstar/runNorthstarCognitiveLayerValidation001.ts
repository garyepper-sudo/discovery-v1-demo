import {
  readFileSync,
} from "node:fs";

import {
  basename,
  join,
} from "node:path";

import {
  runOrganizationInvestigation,
} from "../../../v3/investigation";

import {
  resetOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

import {
  northstarEvidenceManifest,
  type NorthstarEvidenceArtifact,
} from "./northstarEvidenceManifest";

type LayerStatus =
  | "pass"
  | "warn"
  | "fail";

type CognitiveLayerAuditResult = {
  id: string;
  label: string;
  status: LayerStatus;
  count: number;
  sourcePathsFound: string[];
  message: string;
};

type CognitiveHandoffAuditResult = {
  id: string;
  label: string;
  status: LayerStatus;
  message: string;
};

type CognitiveLayerValidationReport = {
  organizationId: string;
  artifactId: string;
  artifactSequence: number;
  artifactFilename: string;
  evaluatedAt: string;
  layerResults: CognitiveLayerAuditResult[];
  handoffResults: CognitiveHandoffAuditResult[];
  failures: string[];
  warnings: string[];
  passed: boolean;
};

type LayerDefinition = {
  id: string;
  label: string;
  required: boolean;
  minimumCount: number;
  paths: string[][];
};

const TARGET_SEQUENCE =
  41;

const EVIDENCE_DIRECTORY =
  join(
    process.cwd(),
    "engine",
    "benchmark",
    "high-volume",
    "northstar",
    "evidence",
  );

const LAYER_DEFINITIONS:
  LayerDefinition[] = [
  {
    id: "evidence",
    label: "Evidence",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "evidence"],
      ["evidence"],
    ],
  },
  {
    id: "observations",
    label: "Observations",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "observations"],
      ["observations"],
    ],
  },
  {
    id: "signals",
    label: "Signals",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "signals"],
      ["signals"],
    ],
  },
  {
    id: "contradictions",
    label: "Contradictions",
    required: false,
    minimumCount: 0,
    paths: [
      ["result", "contradictions"],
      ["contradictions"],
    ],
  },
  {
    id: "phenomena",
    label: "Phenomena",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "phenomena"],
      ["result", "organizationalPhenomena"],
      ["phenomena"],
      ["organizationalPhenomena"],
      ["runtime", "memory", "phenomena"],
      ["runtime", "memory", "organizationalPhenomena"],
    ],
  },
  {
    id: "mechanisms",
    label: "Mechanisms",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "mechanisms"],
      ["mechanisms"],
      ["runtime", "memory", "mechanismNetwork", "mechanisms"],
    ],
  },
  {
    id: "beliefs",
    label: "Beliefs",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "beliefs"],
      ["beliefs"],
      ["runtime", "memory", "beliefs"],
      ["runtime", "memory", "organizationalBeliefs"],
    ],
  },
  {
    id: "concepts",
    label: "Concepts",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "concepts"],
      ["result", "organizationalConcepts"],
      ["concepts"],
      ["organizationalConcepts"],
      ["runtime", "memory", "organizationalConcepts"],
    ],
  },
  {
    id: "theories",
    label: "Theories",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "theories"],
      ["theories"],
      ["runtime", "memory", "theories"],
    ],
  },
  {
    id: "conditions",
    label: "Organizational Conditions",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "organizationalConditions"],
      ["organizationalConditions"],
      ["runtime", "memory", "organizationalConditions"],
    ],
  },
  {
    id: "organizational-state",
    label: "Organizational State",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "organizationalState"],
      ["organizationalState"],
      ["runtime", "memory", "organizationalState"],
    ],
  },
  {
    id: "executive-assessment",
    label: "Executive Assessment",
    required: true,
    minimumCount: 1,
    paths: [
      ["result", "executiveAssessment"],
      ["executiveAssessment"],
      ["runtime", "memory", "executiveAssessment"],
    ],
  },
  {
    id: "executive-projection",
    label: "Executive Projection",
    required: true,
    minimumCount: 1,
    paths: [
      ["projection"],
      ["executiveProjection"],
    ],
  },
];

function readEvidenceArtifact(
  artifact:
    NorthstarEvidenceArtifact,
): string {
  return readFileSync(
    join(
      EVIDENCE_DIRECTORY,
      artifact.filename,
    ),
    "utf8",
  );
}

function buildInvestigationContext(
  artifact:
    NorthstarEvidenceArtifact,

  document:
    string,
): string {
  return [
    `Evidence Artifact ID: ${artifact.id}`,
    `Evidence Sequence: ${artifact.sequence}`,
    `Evidence Batch: ${artifact.batch}`,
    `Evidence Title: ${artifact.title}`,
    `Evidence Owner: ${artifact.owner}`,
    `Evidence Function: ${artifact.function}`,
    `Evidence Effective Date: ${artifact.effectiveDate}`,
    `Evidence Reliability: ${artifact.reliability}`,
    `Evidence Bias: ${artifact.bias}`,
    `Evidence Stale: ${artifact.stale ? "yes" : "no"}`,
    "",
    "Document:",
    document,
  ].join("\n");
}

function getAtPath(
  source: unknown,
  path: string[],
): unknown {
  let current = source;

  for (const segment of path) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    current = (
      current as Record<string, unknown>
    )[segment];
  }

  return current;
}

function valueCount(
  value: unknown,
): number {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  return 1;
}

function pathLabel(
  path: string[],
): string {
  return path.join(".");
}

function auditLayer(
  investigation: unknown,
  definition: LayerDefinition,
): CognitiveLayerAuditResult {
  const resolved =
    definition.paths
      .map(
        (path) => ({
          path,
          value:
            getAtPath(
              investigation,
              path,
            ),
        }),
      )
      .filter(
        (entry) =>
          entry.value !==
          undefined,
      );

  const sourcePathsFound =
    resolved.map(
      (entry) =>
        pathLabel(
          entry.path,
        ),
    );

  const count =
    resolved.reduce<number>(
      (
        total,
        entry,
      ) =>
        Math.max(
          total,
          valueCount(
            entry.value,
          ),
        ),
      0,
    );

  if (
    definition.required &&
    sourcePathsFound.length ===
      0
  ) {
    return {
      id:
        definition.id,

      label:
        definition.label,

      status:
        "fail",

      count:
        0,

      sourcePathsFound,

      message:
        `${definition.label} was not returned or persisted at any audited path.`,
    };
  }

  if (
    definition.required &&
    count <
      definition.minimumCount
  ) {
    return {
      id:
        definition.id,

      label:
        definition.label,

      status:
        "fail",

      count,

      sourcePathsFound,

      message:
        `${definition.label} exists but produced ${count} item(s); expected at least ${definition.minimumCount}.`,
    };
  }

  if (
    !definition.required &&
    sourcePathsFound.length ===
      0
  ) {
    return {
      id:
        definition.id,

      label:
        definition.label,

      status:
        "warn",

      count:
        0,

      sourcePathsFound,

      message:
        `${definition.label} was not returned. This may be valid when no contradiction exists.`,
    };
  }

  return {
    id:
      definition.id,

    label:
      definition.label,

    status:
      "pass",

    count,

    sourcePathsFound,

    message:
      `${definition.label} is available with ${count} item(s).`,
  };
}

function findLayer(
  results:
    CognitiveLayerAuditResult[],

  id:
    string,
): CognitiveLayerAuditResult {
  const result =
    results.find(
      (candidate) =>
        candidate.id ===
        id,
    );

  if (!result) {
    throw new Error(
      `Missing audited layer "${id}".`,
    );
  }

  return result;
}

function auditHandoffs(
  layers:
    CognitiveLayerAuditResult[],
): CognitiveHandoffAuditResult[] {
  const evidence =
    findLayer(
      layers,
      "evidence",
    );

  const observations =
    findLayer(
      layers,
      "observations",
    );

  const signals =
    findLayer(
      layers,
      "signals",
    );

  const phenomena =
    findLayer(
      layers,
      "phenomena",
    );

  const mechanisms =
    findLayer(
      layers,
      "mechanisms",
    );

  const beliefs =
    findLayer(
      layers,
      "beliefs",
    );

  const concepts =
    findLayer(
      layers,
      "concepts",
    );

  const theories =
    findLayer(
      layers,
      "theories",
    );

  const conditions =
    findLayer(
      layers,
      "conditions",
    );

  const assessment =
    findLayer(
      layers,
      "executive-assessment",
    );

  const projection =
    findLayer(
      layers,
      "executive-projection",
    );

  const results:
    CognitiveHandoffAuditResult[] = [];

  results.push({
    id:
      "evidence-to-observations",

    label:
      "Evidence → Observations",

    status:
      evidence.count >
        0 &&
      observations.count >
        0
        ? "pass"
        : "fail",

    message:
      evidence.count >
        0 &&
      observations.count >
        0
        ? "Evidence produced observations."
        : "Evidence did not produce observations.",
  });

  results.push({
    id:
      "observations-to-signals",

    label:
      "Observations → Signals",

    status:
      observations.count >
        0 &&
      signals.count >
        0
        ? "pass"
        : "fail",

    message:
      observations.count >
        0 &&
      signals.count >
        0
        ? "Observations produced signals."
        : "Observations did not produce signals.",
  });

  results.push({
    id:
      "signals-to-phenomena",

    label:
      "Signals → Phenomena",

    status:
      signals.count >
        0 &&
      phenomena.count >
        0
        ? "pass"
        : "fail",

    message:
      signals.count >
        0 &&
      phenomena.count >
        0
        ? "Signals produced phenomena."
        : "Signals exist, but no phenomena were returned or persisted.",
  });

  results.push({
    id:
      "phenomena-to-mechanisms",

    label:
      "Phenomena → Mechanisms",

    status:
      phenomena.count >
        0 &&
      mechanisms.count >
        0
        ? "pass"
        : mechanisms.count >
            0
          ? "fail"
          : "fail",

    message:
      phenomena.count >
        0 &&
      mechanisms.count >
        0
        ? "Phenomena support mechanism formation."
        : mechanisms.count >
            0
          ? "Mechanisms exist while phenomena are absent. The layer may be bypassed or omitted from the returned contract."
          : "Phenomena did not produce mechanisms.",
  });

  results.push({
    id:
      "mechanisms-to-beliefs",

    label:
      "Mechanisms → Beliefs",

    status:
      mechanisms.count >
        0 &&
      beliefs.count >
        0
        ? "pass"
        : "fail",

    message:
      mechanisms.count >
        0 &&
      beliefs.count >
        0
        ? "Mechanisms support belief formation."
        : "Mechanisms did not produce beliefs.",
  });

  results.push({
    id:
      "beliefs-to-concepts",

    label:
      "Beliefs → Concepts",

    status:
      beliefs.count >
        0 &&
      concepts.count >
        0
        ? "pass"
        : "fail",

    message:
      beliefs.count >
        0 &&
      concepts.count >
        0
        ? "Beliefs support concept formation."
        : "Beliefs did not produce concepts.",
  });

  results.push({
    id:
      "concepts-to-theories",

    label:
      "Concepts → Theories",

    status:
      concepts.count >
        0 &&
      theories.count >
        0
        ? "pass"
        : "fail",

    message:
      concepts.count >
        0 &&
      theories.count >
        0
        ? "Concepts support theory formation."
        : "Concepts did not produce theories.",
  });

  results.push({
    id:
      "theories-to-conditions",

    label:
      "Theories → Conditions",

    status:
      theories.count >
        0 &&
      conditions.count >
        0
        ? "pass"
        : "fail",

    message:
      theories.count >
        0 &&
      conditions.count >
        0
        ? "Theories support organizational condition synthesis."
        : "Theories did not produce organizational conditions.",
  });

  results.push({
    id:
      "conditions-to-assessment",

    label:
      "Conditions → Executive Assessment",

    status:
      conditions.count >
        0 &&
      assessment.count >
        0
        ? "pass"
        : "fail",

    message:
      conditions.count >
        0 &&
      assessment.count >
        0
        ? "Organizational conditions support executive assessment."
        : "Organizational conditions did not produce an executive assessment.",
  });

  results.push({
    id:
      "assessment-to-projection",

    label:
      "Executive Assessment → Executive Projection",

    status:
      assessment.count >
        0 &&
      projection.count >
        0
        ? "pass"
        : "fail",

    message:
      assessment.count >
        0 &&
      projection.count >
        0
        ? "Executive assessment produced an executive projection."
        : "Executive assessment did not produce an executive projection.",
  });

  return results;
}

function printStatus(
  status:
    LayerStatus,
): string {
  if (
    status ===
    "pass"
  ) {
    return "PASS";
  }

  if (
    status ===
    "warn"
  ) {
    return "WARN";
  }

  return "FAIL";
}

function requireTargetArtifact():
  NorthstarEvidenceArtifact {
  const artifact =
    northstarEvidenceManifest
      .artifacts
      .find(
        (candidate) =>
          candidate.sequence ===
          TARGET_SEQUENCE,
      );

  if (!artifact) {
    throw new Error(
      `Northstar evidence sequence ${TARGET_SEQUENCE} was not found.`,
    );
  }

  return artifact;
}

function printLayerResults(
  results:
    CognitiveLayerAuditResult[],
): void {
  console.log("");
  console.log("Cognitive layers");
  console.log("------------------------------------------");

  for (const result of results) {
    console.log(
      `${printStatus(result.status)}  ${result.label} (${result.count})`,
    );

    console.log(
      `  ${result.message}`,
    );

    if (
      result.sourcePathsFound.length >
      0
    ) {
      console.log(
        `  Paths: ${result.sourcePathsFound.join(", ")}`,
      );
    }
  }
}

function printHandoffResults(
  results:
    CognitiveHandoffAuditResult[],
): void {
  console.log("");
  console.log("Cognitive handoffs");
  console.log("------------------------------------------");

  for (const result of results) {
    console.log(
      `${printStatus(result.status)}  ${result.label}`,
    );

    console.log(
      `  ${result.message}`,
    );
  }
}

export function runNorthstarCognitiveLayerValidation001():
  CognitiveLayerValidationReport {
  const artifact =
    requireTargetArtifact();

  const document =
    readEvidenceArtifact(
      artifact,
    );

  resetOrganizationRuntimeState(
    NORTHSTAR_ORGANIZATION_ID,
  );

  const investigation =
    runOrganizationInvestigation({
      organizationId:
        NORTHSTAR_ORGANIZATION_ID,

      company:
        northstarCompanyFixture
          .organization
          .name,

      website:
        "",

      industry:
        northstarCompanyFixture
          .organization
          .industry,

      question:
        "What is happening inside Northstar Industrial Systems, why is it happening, and what should executives focus on next?",

      context:
        buildInvestigationContext(
          artifact,
          document,
        ),
    });

  const layerResults =
    LAYER_DEFINITIONS.map(
      (definition) =>
        auditLayer(
          investigation,
          definition,
        ),
    );

  const handoffResults =
    auditHandoffs(
      layerResults,
    );

  const failures = [
    ...layerResults
      .filter(
        (result) =>
          result.status ===
          "fail",
      )
      .map(
        (result) =>
          `${result.label}: ${result.message}`,
      ),

    ...handoffResults
      .filter(
        (result) =>
          result.status ===
          "fail",
      )
      .map(
        (result) =>
          `${result.label}: ${result.message}`,
      ),
  ];

  const warnings = [
    ...layerResults
      .filter(
        (result) =>
          result.status ===
          "warn",
      )
      .map(
        (result) =>
          `${result.label}: ${result.message}`,
      ),

    ...handoffResults
      .filter(
        (result) =>
          result.status ===
          "warn",
      )
      .map(
        (result) =>
          `${result.label}: ${result.message}`,
      ),
  ];

  const passed =
    failures.length ===
    0;

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR COGNITIVE LAYER VALIDATION 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Artifact: ${artifact.filename}`,
  );

  console.log(
    `Sequence: ${artifact.sequence}`,
  );

  printLayerResults(
    layerResults,
  );

  printHandoffResults(
    handoffResults,
  );

  console.log("");
  console.log("==========================================");
  console.log("VALIDATION RESULT");
  console.log("==========================================");
  console.log("");

  console.log(
    `Failures: ${failures.length}`,
  );

  console.log(
    `Warnings: ${warnings.length}`,
  );

  console.log("");

  if (passed) {
    console.log("PASS");
  } else {
    console.log("FAIL");

    console.log("");

    for (const failure of failures) {
      console.log(
        `- ${failure}`,
      );
    }
  }

  console.log("");

  return {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    artifactId:
      artifact.id,

    artifactSequence:
      artifact.sequence,

    artifactFilename:
      artifact.filename,

    evaluatedAt:
      new Date()
        .toISOString(),

    layerResults,

    handoffResults,

    failures,

    warnings,

    passed,
  };
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarCognitiveLayerValidation001.ts"
) {
  const report =
    runNorthstarCognitiveLayerValidation001();

  if (
    !report.passed
  ) {
    process.exitCode =
      1;
  }
}

export type {
  CognitiveHandoffAuditResult,
  CognitiveLayerAuditResult,
  CognitiveLayerValidationReport,
};
