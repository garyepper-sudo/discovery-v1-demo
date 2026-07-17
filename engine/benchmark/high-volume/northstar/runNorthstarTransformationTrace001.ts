import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";

import {
  basename,
  extname,
  join,
  relative,
} from "node:path";

import {
  pathToFileURL,
} from "node:url";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

type CognitiveLayer = {
  id: string;
  label: string;
  candidatePaths: string[][];
};

type LayerTrace = {
  layerId: string;
  layerLabel: string;
  count: number;
  matchedTerms: string[];
  excerpts: string[];
};

type TransformationTraceReport = {
  organizationId: string;
  evidencePath: string;
  evidenceName: string;
  executedAt: string;
  invocationShape: string;
  layers: LayerTrace[];
};

type EvidenceArtifact = {
  id: string;
  name: string;
  content: string;
  type: string;
  source: string;
};

const TARGET_PHRASES = [
  "concurrent work",
  "staffing is not",
  "staffing is sufficient",
  "current staffing is sufficient",
  "primary constraint",
];

const TRACE_TERMS = [
  "concurrent work",
  "work in progress",
  "wip",
  "priority conflict",
  "priority overload",
  "competing priorities",
  "focus fragmentation",
  "execution demand",
  "sequence work",
  "reduce concurrent",
  "staffing is not",
  "staffing is sufficient",
  "headcount is not",
  "not a staffing",
  "without adding headcount",
  "avoid additional headcount",
  "capacity constraint",
  "execution capacity",
  "resource constraint",
  "governance friction",
  "coordination breakdown",
  "decision latency",
];

const LAYERS: CognitiveLayer[] = [
  {
    id: "observations",
    label: "Observations",
    candidatePaths: [
      ["observations"],
      ["result", "observations"],
      ["investigation", "observations"],
      ["cognition", "observations"],
    ],
  },
  {
    id: "signals",
    label: "Signals",
    candidatePaths: [
      ["signals"],
      ["organizationalSignals"],
      ["result", "signals"],
      ["investigation", "signals"],
      ["cognition", "signals"],
    ],
  },
  {
    id: "phenomena",
    label: "Phenomena",
    candidatePaths: [
      ["phenomena"],
      ["organizationalPhenomena"],
      ["result", "phenomena"],
      ["investigation", "phenomena"],
      ["cognition", "phenomena"],
    ],
  },
  {
    id: "mechanisms",
    label: "Mechanisms",
    candidatePaths: [
      ["mechanisms"],
      ["organizationalMechanisms"],
      ["mechanismNetwork", "mechanisms"],
      ["result", "mechanisms"],
      ["investigation", "mechanisms"],
      ["cognition", "mechanisms"],
    ],
  },
  {
    id: "beliefs",
    label: "Beliefs",
    candidatePaths: [
      ["beliefs"],
      ["organizationalBeliefs"],
      ["result", "beliefs"],
      ["investigation", "beliefs"],
      ["cognition", "beliefs"],
    ],
  },
  {
    id: "concepts",
    label: "Concepts",
    candidatePaths: [
      ["concepts"],
      ["organizationalConcepts"],
      ["semanticConcepts"],
      ["result", "concepts"],
      ["investigation", "concepts"],
      ["cognition", "concepts"],
    ],
  },
  {
    id: "theories",
    label: "Theories",
    candidatePaths: [
      ["theories"],
      ["organizationalTheories"],
      ["result", "theories"],
      ["investigation", "theories"],
      ["cognition", "theories"],
    ],
  },
];

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectFiles(
  directory: string,
): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const results: string[] = [];

  for (const entry of readdirSync(directory)) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(
        ...collectFiles(fullPath),
      );
      continue;
    }

    const extension =
      extname(fullPath).toLowerCase();

    if (
      [".md", ".txt", ".csv", ".json"].includes(
        extension,
      )
    ) {
      results.push(fullPath);
    }
  }

  return results;
}

function scoreEvidenceCandidate(
  content: string,
): number {
  const normalized =
    normalizeText(content);

  return TARGET_PHRASES.reduce(
    (score, phrase) =>
      score +
      (
        normalized.includes(
          normalizeText(phrase),
        )
          ? 1
          : 0
      ),
    0,
  );
}

function locateTargetEvidence():
  EvidenceArtifact & {
    path: string;
  } {
  const northstarRoot =
    join(
      process.cwd(),
      "engine",
      "benchmark",
      "high-volume",
      "northstar",
    );

  const candidateFiles =
    collectFiles(
      northstarRoot,
    )
      .filter(
        (path) =>
          !path.endsWith(".ts"),
      )
      .map(
        (path) => {
          const content =
            readFileSync(
              path,
              "utf8",
            );

          return {
            path,
            content,
            score:
              scoreEvidenceCandidate(
                content,
              ),
          };
        },
      )
      .sort(
        (left, right) =>
          right.score -
          left.score,
      );

  const bestCandidate =
    candidateFiles[0];

  if (
    !bestCandidate ||
    bestCandidate.score === 0
  ) {
    throw new Error(
      "Unable to find a generated Northstar evidence artifact containing concurrency or staffing language. Run the Northstar evidence generator first.",
    );
  }

  const name =
    basename(
      bestCandidate.path,
    );

  return {
    id:
      `northstar-trace-${normalizeText(name).replace(/\s+/g, "-")}`,

    name,

    content:
      bestCandidate.content,

    type:
      extname(name)
        .replace(".", "") ||
      "text",

    source:
      "northstar-transformation-trace",

    path:
      bestCandidate.path,
  };
}

function getAtPath(
  value: unknown,
  path: string[],
): unknown {
  let current = value;

  for (const segment of path) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
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

function collectStrings(
  value: unknown,
): string[] {
  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(
      collectStrings,
    );
  }

  if (typeof value === "object") {
    return Object.values(
      value as
        Record<
          string,
          unknown
        >,
    ).flatMap(
      collectStrings,
    );
  }

  return [];
}

function collectLayerValues(
  result: unknown,
  layer: CognitiveLayer,
): unknown[] {
  return layer.candidatePaths
    .map(
      (path) =>
        getAtPath(
          result,
          path,
        ),
    )
    .filter(
      (value) =>
        value !== undefined,
    );
}

function buildLayerTrace(
  result: unknown,
  layer: CognitiveLayer,
): LayerTrace {
  const layerValues =
    collectLayerValues(
      result,
      layer,
    );

  const strings =
    Array.from(
      new Set(
        layerValues
          .flatMap(
            collectStrings,
          )
          .map(
            (value) =>
              value.trim(),
          )
          .filter(Boolean),
      ),
    );

  const normalizedEntries =
    strings.map(
      (raw) => ({
        raw,
        normalized:
          normalizeText(raw),
      }),
    );

  const matchedTerms =
    TRACE_TERMS.filter(
      (term) => {
        const normalizedTerm =
          normalizeText(term);

        return normalizedEntries.some(
          (entry) =>
            entry.normalized.includes(
              normalizedTerm,
            ),
        );
      },
    );

  const excerpts =
    normalizedEntries
      .filter(
        (entry) =>
          matchedTerms.some(
            (term) =>
              entry.normalized.includes(
                normalizeText(term),
              ),
          ),
      )
      .slice(0, 8)
      .map(
        (entry) =>
          entry.raw.length >
          280
            ? `${entry.raw.slice(0, 277)}...`
            : entry.raw,
      );

  const count =
  layerValues.reduce<number>(
    (
      total,
      value,
    ) => {
      if (
        Array.isArray(
          value,
        )
      ) {
        return (
          total +
          value.length
        );
      }

      return (
        total +
        1
      );
    },
    0,
  );

  return {
    layerId:
      layer.id,

    layerLabel:
      layer.label,

    count,

    matchedTerms,

    excerpts,
  };
}

async function loadRunDiscoveryV3():
  Promise<
    (
      ...args: unknown[]
    ) => Promise<unknown>
  > {
  const candidatePaths = [
    "../../../v3/runDiscoveryV3.ts",
    "../../../v3/runDiscoveryV3",
    "../../../v3/index.ts",
    "../../../v3/index",
  ];

  const errors: string[] = [];

  for (const candidatePath of candidatePaths) {
    try {
      const absolutePath =
        join(
          __dirname,
          candidatePath,
        );

      const module =
        await import(
          pathToFileURL(
            absolutePath,
          ).href
        );

      const candidate =
        (
          module as
            Record<
              string,
              unknown
            >
        ).runDiscoveryV3;

      if (
        typeof candidate ===
        "function"
      ) {
        return candidate as
          (
            ...args: unknown[]
          ) => Promise<unknown>;
      }

      errors.push(
        `${candidatePath}: runDiscoveryV3 export not found`,
      );
    } catch (error) {
      errors.push(
        `${candidatePath}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }
  }

  throw new Error(
    [
      "Unable to load runDiscoveryV3.",
      ...errors,
    ].join("\n"),
  );
}

async function invokeRunDiscoveryV3(
  runDiscoveryV3:
    (
      ...args: unknown[]
    ) => Promise<unknown>,

  artifact:
    EvidenceArtifact,
): Promise<{
  result: unknown;
  invocationShape: string;
}> {
  const now =
    new Date(
      "2026-07-17T12:00:00.000Z",
    );

  const organization =
    northstarCompanyFixture.organization;

  const attempts: Array<{
    label: string;
    args: unknown[];
  }> = [
    {
      label:
        "object: organizationId + evidenceObjects + now",

      args: [
        {
          organizationId:
            NORTHSTAR_ORGANIZATION_ID,

          evidenceObjects: [
            artifact,
          ],

          now:
            now.toISOString(),
        },
      ],
    },
    {
      label:
        "object: organizationId + evidence + now",

      args: [
        {
          organizationId:
            NORTHSTAR_ORGANIZATION_ID,

          evidence: [
            artifact,
          ],

          now:
            now.toISOString(),
        },
      ],
    },
    {
      label:
        "object: organization + evidenceObjects + now",

      args: [
        {
          organization,
          evidenceObjects: [
            artifact,
          ],
          now:
            now.toISOString(),
        },
      ],
    },
    {
      label:
        "positional: organizationId + evidenceObjects + now",

      args: [
        NORTHSTAR_ORGANIZATION_ID,
        [
          artifact,
        ],
        now.toISOString(),
      ],
    },
    {
      label:
        "positional: organization + evidenceObjects + now",

      args: [
        organization,
        [
          artifact,
        ],
        now.toISOString(),
      ],
    },
  ];

  const failures: string[] = [];

  for (const attempt of attempts) {
    try {
      const result =
        await runDiscoveryV3(
          ...attempt.args,
        );

      if (
        result !==
        undefined
      ) {
        return {
          result,
          invocationShape:
            attempt.label,
        };
      }

      failures.push(
        `${attempt.label}: returned undefined`,
      );
    } catch (error) {
      failures.push(
        `${attempt.label}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }
  }

  throw new Error(
    [
      "Unable to invoke runDiscoveryV3 using the supported diagnostic call shapes.",
      ...failures,
    ].join("\n"),
  );
}

function printEvidencePreview(
  artifact:
    EvidenceArtifact & {
      path: string;
    },
): void {
  console.log("");
  console.log("==========================================");
  console.log("TARGET EVIDENCE");
  console.log("==========================================");
  console.log("");

  console.log(
    `File: ${relative(process.cwd(), artifact.path)}`,
  );

  console.log(
    `Name: ${artifact.name}`,
  );

  console.log("");

  const matchingLines =
    artifact.content
      .split(/\r?\n/)
      .filter(
        (line) => {
          const normalized =
            normalizeText(line);

          return TARGET_PHRASES.some(
            (phrase) =>
              normalized.includes(
                normalizeText(phrase),
              ),
          );
        },
      )
      .slice(0, 12);

  if (
    matchingLines.length ===
    0
  ) {
    console.log(
      artifact.content.slice(
        0,
        1200,
      ),
    );
  } else {
    for (const line of matchingLines) {
      console.log(
        `- ${line}`,
      );
    }
  }
}

function printLayerTrace(
  trace:
    LayerTrace,
): void {
  console.log("");
  console.log("------------------------------------------");
  console.log(
    `${trace.layerLabel} (${trace.count})`,
  );

  if (
    trace.matchedTerms.length ===
    0
  ) {
    console.log(
      "No target language detected.",
    );
    return;
  }

  console.log(
    `Matched terms: ${trace.matchedTerms.join(", ")}`,
  );

  for (const excerpt of trace.excerpts) {
    console.log(
      `- ${excerpt}`,
    );
  }
}

export async function runNorthstarTransformationTrace001():
  Promise<
    TransformationTraceReport
  > {
  const artifact =
    locateTargetEvidence();

  printEvidencePreview(
    artifact,
  );

  const runDiscoveryV3 =
    await loadRunDiscoveryV3();

  const {
    result,
    invocationShape,
  } =
    await invokeRunDiscoveryV3(
      runDiscoveryV3,
      artifact,
    );

    console.log("");
console.log("==========================================");
console.log("RAW RESULT STRUCTURE");
console.log("==========================================");
console.log("");

console.log(
  "Top-level keys:",
  Object.keys(
    result as Record<string, unknown>,
  ),
);

console.log("");
console.log("OBSERVATIONS");
console.dir(
  (
    result as Record<string, unknown>
  ).observations,
  {
    depth: 6,
  },
);

console.log("");
console.log("SIGNALS");
console.dir(
  (
    result as Record<string, unknown>
  ).signals,
  {
    depth: 6,
  },
);

console.log("");
console.log("PHENOMENA");
console.dir(
  (
    result as Record<string, unknown>
  ).phenomena,
  {
    depth: 6,
  },
);

console.log("");
console.log("MECHANISMS");
console.dir(
  (
    result as Record<string, unknown>
  ).mechanisms,
  {
    depth: 6,
  },
);

  const layers =
    LAYERS.map(
      (layer) =>
        buildLayerTrace(
          result,
          layer,
        ),
    );

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR TRANSFORMATION TRACE 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${NORTHSTAR_ORGANIZATION_ID}`,
  );

  console.log(
    `Invocation: ${invocationShape}`,
  );

  for (const layer of layers) {
    printLayerTrace(
      layer,
    );
  }

  console.log("");
  console.log("==========================================");
  console.log("TRACE SUMMARY");
  console.log("==========================================");
  console.log("");

  for (const layer of layers) {
    console.log(
      `${layer.layerLabel}: ${
        layer.matchedTerms.length >
        0
          ? layer.matchedTerms.join(", ")
          : "No target language"
      }`,
    );
  }

  console.log("");
  console.log(
    "Use this trace to identify the first live transformation that compresses or drops the concurrency and staffing conclusions.",
  );
  console.log("");

  return {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    evidencePath:
      relative(
        process.cwd(),
        artifact.path,
      ),

    evidenceName:
      artifact.name,

    executedAt:
      new Date()
        .toISOString(),

    invocationShape,

    layers,
  };
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarTransformationTrace001.ts"
) {
  void runNorthstarTransformationTrace001();
}

export type {
  LayerTrace,
  TransformationTraceReport,
};
