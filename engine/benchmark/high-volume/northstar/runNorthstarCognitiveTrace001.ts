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

type CognitiveLayerDefinition = {
  id: string;
  label: string;
  paths: string[][];
};

type CognitiveLayerTrace = {
  id: string;
  label: string;
  itemCount: number;
  values: unknown[];
};

type NorthstarCognitiveTraceReport = {
  organizationId: string;
  artifactId: string;
  artifactSequence: number;
  artifactFilename: string;
  executedAt: string;
  layers: CognitiveLayerTrace[];
};

const EVIDENCE_DIRECTORY =
  join(
    process.cwd(),
    "engine",
    "benchmark",
    "high-volume",
    "northstar",
    "evidence",
  );

const TARGET_SEQUENCE =
  41;

const COGNITIVE_LAYERS:
  CognitiveLayerDefinition[] = [
  {
    id:
      "evidence",

    label:
      "Evidence",

    paths: [
      [
        "result",
        "evidence",
      ],
      [
        "evidence",
      ],
    ],
  },

  {
    id:
      "observations",

    label:
      "Observations",

    paths: [
      [
        "result",
        "observations",
      ],
      [
        "observations",
      ],
    ],
  },

  {
    id:
      "signals",

    label:
      "Signals",

    paths: [
      [
        "result",
        "signals",
      ],
      [
        "signals",
      ],
    ],
  },

  {
    id:
      "contradictions",

    label:
      "Contradictions",

    paths: [
      [
        "result",
        "contradictions",
      ],
      [
        "contradictions",
      ],
    ],
  },

  {
    id:
      "phenomena",

    label:
      "Phenomena",

    paths: [
      [
        "result",
        "phenomena",
      ],
      [
        "result",
        "organizationalPhenomena",
      ],
      [
        "phenomena",
      ],
      [
        "organizationalPhenomena",
      ],
    ],
  },

  {
    id:
      "mechanisms",

    label:
      "Mechanisms",

    paths: [
      [
        "result",
        "mechanisms",
      ],
      [
        "mechanisms",
      ],
      [
        "runtime",
        "memory",
        "mechanismNetwork",
        "mechanisms",
      ],
    ],
  },

  {
    id:
      "beliefs",

    label:
      "Beliefs",

    paths: [
      [
        "result",
        "beliefs",
      ],
      [
        "beliefs",
      ],
      [
        "runtime",
        "memory",
        "beliefs",
      ],
      [
        "runtime",
        "memory",
        "organizationalBeliefs",
      ],
    ],
  },

  {
    id:
      "concepts",

    label:
      "Concepts",

    paths: [
      [
        "result",
        "concepts",
      ],
      [
        "result",
        "organizationalConcepts",
      ],
      [
        "concepts",
      ],
      [
        "organizationalConcepts",
      ],
      [
        "runtime",
        "memory",
        "organizationalConcepts",
      ],
    ],
  },

  {
    id:
      "theories",

    label:
      "Theories",

    paths: [
      [
        "result",
        "theories",
      ],
      [
        "theories",
      ],
      [
        "runtime",
        "memory",
        "theories",
      ],
    ],
  },

  {
    id:
      "conditions",

    label:
      "Organizational Conditions",

    paths: [
      [
        "result",
        "organizationalConditions",
      ],
      [
        "organizationalConditions",
      ],
      [
        "runtime",
        "memory",
        "organizationalConditions",
      ],
    ],
  },

  {
    id:
      "organizational-state",

    label:
      "Organizational State",

    paths: [
      [
        "result",
        "organizationalState",
      ],
      [
        "organizationalState",
      ],
      [
        "runtime",
        "memory",
        "organizationalState",
      ],
    ],
  },

  {
    id:
      "executive-assessment",

    label:
      "Executive Assessment",

    paths: [
      [
        "result",
        "executiveAssessment",
      ],
      [
        "executiveAssessment",
      ],
      [
        "runtime",
        "memory",
        "executiveAssessment",
      ],
    ],
  },

  {
    id:
      "executive-projection",

    label:
      "Executive Projection",

    paths: [
      [
        "projection",
      ],
      [
        "executiveProjection",
      ],
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
  ].join(
    "\n",
  );
}

function getAtPath(
  source:
    unknown,

  path:
    string[],
): unknown {
  let current =
    source;

  for (
    const segment of
    path
  ) {
    if (
      current ===
        null ||
      current ===
        undefined ||
      typeof current !==
        "object"
    ) {
      return undefined;
    }

    current =
      (
        current as
          Record<
            string,
            unknown
          >
      )[segment];
  }

  return current;
}

function uniqueValues(
  values:
    unknown[],
): unknown[] {
  const seen =
    new Set<
      string
    >();

  const unique:
    unknown[] = [];

  for (
    const value of
    values
  ) {
    if (
      value ===
        undefined
    ) {
      continue;
    }

    const key =
      JSON.stringify(
        value,
      );

    if (
      seen.has(
        key,
      )
    ) {
      continue;
    }

    seen.add(
      key,
    );

    unique.push(
      value,
    );
  }

  return unique;
}

function buildLayerTrace(
  investigation:
    unknown,

  definition:
    CognitiveLayerDefinition,
): CognitiveLayerTrace {
  const rawValues =
    definition.paths
      .map(
        (path) =>
          getAtPath(
            investigation,
            path,
          ),
      )
      .filter(
        (value) =>
          value !==
          undefined,
      );

  const flattened =
    rawValues.flatMap(
      (value) =>
        Array.isArray(
          value,
        )
          ? value
          : [
              value,
            ],
    );

  const values =
    uniqueValues(
      flattened,
    );

  return {
    id:
      definition.id,

    label:
      definition.label,

    itemCount:
      values.length,

    values,
  };
}

function printDivider(
  label:
    string,
): void {
  console.log("");
  console.log("==========================================");
  console.log(
    label.toUpperCase(),
  );
  console.log("==========================================");
  console.log("");
}

function printValue(
  value:
    unknown,

  index:
    number,
): void {
  console.log(
    `[${index + 1}]`,
  );

  console.dir(
    value,
    {
      depth:
        8,

      maxArrayLength:
        50,

      maxStringLength:
        1200,

      compact:
        false,
    },
  );

  console.log("");
}

function printLayer(
  layer:
    CognitiveLayerTrace,
): void {
  printDivider(
    layer.label,
  );

  console.log(
    `Items: ${layer.itemCount}`,
  );

  console.log("");

  if (
    layer.values.length ===
    0
  ) {
    console.log(
      "No values available at this layer.",
    );

    console.log("");

    return;
  }

  for (
    let index = 0;
    index <
    layer.values.length;
    index +=
      1
  ) {
    printValue(
      layer.values[
        index
      ],
      index,
    );
  }
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

  if (
    !artifact
  ) {
    throw new Error(
      `Northstar evidence sequence ${TARGET_SEQUENCE} was not found in the manifest.`,
    );
  }

  return artifact;
}

export function runNorthstarCognitiveTrace001():
  NorthstarCognitiveTraceReport {
  const artifact =
    requireTargetArtifact();

  const document =
    readEvidenceArtifact(
      artifact,
    );

  printDivider(
    "Northstar Cognitive Trace 001",
  );

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Organization ID: ${NORTHSTAR_ORGANIZATION_ID}`,
  );

  console.log(
    `Artifact: ${artifact.filename}`,
  );

  console.log(
    `Sequence: ${artifact.sequence}`,
  );

  console.log(
    `Batch: ${artifact.batch}`,
  );

  console.log("");

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

  printDivider(
    "Source Document",
  );

  console.log(
    document,
  );

  console.log("");

  const layers =
    COGNITIVE_LAYERS
      .map(
        (definition) =>
          buildLayerTrace(
            investigation,
            definition,
          ),
      );

  for (
    const layer of
    layers
  ) {
    printLayer(
      layer,
    );
  }

  printDivider(
    "Trace Summary",
  );

  for (
    const layer of
    layers
  ) {
    console.log(
      `${layer.label}: ${layer.itemCount}`,
    );
  }

  console.log("");
  console.log(
    "This trace uses the same canonical investigation pathway as the Northstar ingestion benchmark.",
  );

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

    executedAt:
      new Date()
        .toISOString(),

    layers,
  };
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarCognitiveTrace001.ts"
) {
  runNorthstarCognitiveTrace001();
}

export type {
  CognitiveLayerTrace,
  NorthstarCognitiveTraceReport,
};
