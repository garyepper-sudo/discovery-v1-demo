import {
  basename,
} from "node:path";

import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "../high-volume/northstar/northstarCompanyFixture";

type CognitiveLayerId =
  | "phenomena"
  | "mechanisms"
  | "beliefs"
  | "concepts"
  | "theories"
  | "conditions"
  | "organizationalState"
  | "executiveAssessment";

type UnknownRecord =
  Record<
    string,
    unknown
  >;

type ExtendedMemory = {
  phenomena?: UnknownRecord[];
  organizationalPhenomena?: UnknownRecord[];

  organizationalPhenomenaState?: {
    phenomena?: UnknownRecord[];
  };

  mechanismNetwork?: {
    mechanisms?: UnknownRecord[];
  };

  beliefs?: UnknownRecord[];
  organizationalBeliefs?: UnknownRecord[];

  organizationalConcepts?: UnknownRecord[];
  semanticConcepts?: UnknownRecord[];
  conceptualUnderstanding?: UnknownRecord[];

  theories?: UnknownRecord[];

  organizationalConditions?: UnknownRecord[];
  organizationalState?: UnknownRecord;

  executiveAssessment?: UnknownRecord;

  organizationalMemory?: {
    beliefs?: UnknownRecord[];
    theories?: UnknownRecord[];
    organizationalConditions?: UnknownRecord[];
    organizationalState?: UnknownRecord;
  } | null;
};

type SemanticCategory =
  | "phenomenon"
  | "mechanism"
  | "belief"
  | "concept"
  | "theory"
  | "condition"
  | "organizational-state"
  | "executive-assessment"
  | "entity"
  | "cluster"
  | "understanding"
  | "unknown";

type SemanticClassification = {
  category:
    SemanticCategory;

  confidence:
    number;

  reasons:
    string[];
};

type AuditedObject = {
  storedLayer:
    CognitiveLayerId;

  id:
    string;

  label:
    string;

  type:
    string | null;

  summary:
    string;

  classification:
    SemanticClassification;

  layerCompatible:
    boolean;

  duplicateLayers:
    CognitiveLayerId[];
};

type LayerAudit = {
  layer:
    CognitiveLayerId;

  label:
    string;

  objectCount:
    number;

  compatibleCount:
    number;

  incompatibleCount:
    number;

  compatibilityRate:
    number;

  objects:
    AuditedObject[];
};

type DuplicateObject = {
  identity:
    string;

  label:
    string;

  layers:
    CognitiveLayerId[];
};

type CognitiveSemanticNormalizationAudit = {
  auditId:
    "cognitive-semantic-normalization-audit-001";

  organizationId:
    string;

  evaluatedAt:
    string;

  overallCompatibilityRate:
    number;

  passed:
    boolean;

  layers:
    LayerAudit[];

  duplicates:
    DuplicateObject[];

  priorityFindings:
    string[];
};

const LAYER_LABELS:
  Record<
    CognitiveLayerId,
    string
  > = {
  phenomena:
    "Phenomena",

  mechanisms:
    "Mechanisms",

  beliefs:
    "Beliefs",

  concepts:
    "Concepts",

  theories:
    "Theories",

  conditions:
    "Organizational Conditions",

  organizationalState:
    "Organizational State",

  executiveAssessment:
    "Executive Assessment",
};

const EXPECTED_CATEGORY_BY_LAYER:
  Record<
    CognitiveLayerId,
    SemanticCategory
  > = {
  phenomena:
    "phenomenon",

  mechanisms:
    "mechanism",

  beliefs:
    "belief",

  concepts:
    "concept",

  theories:
    "theory",

  conditions:
    "condition",

  organizationalState:
    "organizational-state",

  executiveAssessment:
    "executive-assessment",
};

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

function asString(
  value:
    unknown,
): string | null {
  if (
    typeof value !==
      "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length >
    0
      ? trimmed
      : null;
}

function firstString(
  record:
    UnknownRecord,

  keys:
    string[],
): string | null {
  for (
    const key of
    keys
  ) {
    const value =
      asString(
        record[
          key
        ],
      );

    if (
      value
    ) {
      return value;
    }
  }

  return null;
}

function normalizeText(
  value:
    string,
): string {
  return value
    .toLowerCase()
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[_/.:()-]+/g,
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

function extractRecords(
  memory:
    ExtendedMemory,

  layer:
    CognitiveLayerId,
): UnknownRecord[] {
  switch (
    layer
  ) {
    case "phenomena":
      return [
        ...(
          memory.phenomena ??
          []
        ),

        ...(
          memory.organizationalPhenomena ??
          []
        ),

        ...(
          memory
            .organizationalPhenomenaState
            ?.phenomena ??
          []
        ),
      ];

    case "mechanisms":
      return [
        ...(
          memory
            .mechanismNetwork
            ?.mechanisms ??
          []
        ),
      ];

    case "beliefs":
      return [
        ...(
          memory.beliefs ??
          []
        ),

        ...(
          memory.organizationalBeliefs ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.beliefs ??
          []
        ),
      ];

    case "concepts":
      return [
        ...(
          memory.organizationalConcepts ??
          []
        ),

        ...(
          memory.semanticConcepts ??
          []
        ),

        ...(
          memory.conceptualUnderstanding ??
          []
        ),
      ];

    case "theories":
      return [
        ...(
          memory.theories ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.theories ??
          []
        ),
      ];

    case "conditions":
      return [
        ...(
          memory.organizationalConditions ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.organizationalConditions ??
          []
        ),
      ];

    case "organizationalState": {
      const values:
        UnknownRecord[] = [];

      const direct =
        asRecord(
          memory.organizationalState,
        );

      const nested =
        asRecord(
          memory
            .organizationalMemory
            ?.organizationalState,
        );

      if (
        direct
      ) {
        values.push(
          direct,
        );
      }

      if (
        nested
      ) {
        values.push(
          nested,
        );
      }

      return values;
    }

    case "executiveAssessment": {
      const value =
        asRecord(
          memory.executiveAssessment,
        );

      return value
        ? [
            value,
          ]
        : [];
    }
  }
}

function buildIdentity(
  record:
    UnknownRecord,

  fallback:
    string,
): string {
  return firstString(
    record,
    [
      "id",
      "conditionId",
      "theoryId",
      "conceptId",
      "beliefId",
      "mechanismId",
      "phenomenonId",
    ],
  ) ??
  fallback;
}

function buildLabel(
  record:
    UnknownRecord,

  fallback:
    string,
): string {
  return firstString(
    record,
    [
      "label",
      "name",
      "title",
      "statement",
      "executiveName",
      "summary",
      "description",
    ],
  ) ??
  fallback;
}

function includesAny(
  text:
    string,

  terms:
    string[],
): boolean {
  return terms.some(
    (term) =>
      text.includes(
        normalizeText(
          term,
        ),
      ),
  );
}

function classifyObject(
  record:
    UnknownRecord,
): SemanticClassification {
  const id =
    normalizeText(
      firstString(
        record,
        [
          "id",
          "type",
          "domain",
        ],
      ) ??
      "",
    );

  const label =
    normalizeText(
      buildLabel(
        record,
        "",
      ),
    );

  const text =
    normalizeText(
      collectText(
        record,
      ).join(
        " ",
      ),
    );

  const reasons:
    string[] = [];

  if (
    id.startsWith(
      "condition ",
    ) ||
    asString(
      record.domain,
    ) !==
      null &&
    includesAny(
      text,
      [
        "limiting organizational performance",
        "condition strength",
        "upstream condition",
        "downstream condition",
      ],
    )
  ) {
    reasons.push(
      "Uses organizational-condition identity or causal condition fields.",
    );

    return {
      category:
        "condition",

      confidence:
        0.98,

      reasons,
    };
  }

  if (
    id.startsWith(
      "theory ",
    ) ||
    includesAny(
      text,
      [
        "theory validation",
        "dominant theory",
        "competing theories",
      ],
    )
  ) {
    reasons.push(
      "Uses theory identity or theory-validation language.",
    );

    return {
      category:
        "theory",

      confidence:
        0.97,

      reasons,
    };
  }

  if (
    id.startsWith(
      "belief ",
    ) ||
    asString(
      record.statement,
    ) !==
      null &&
    Array.isArray(
      record.supportingMechanismIds,
    )
  ) {
    reasons.push(
      "Uses belief identity or belief statement with mechanism ancestry.",
    );

    return {
      category:
        "belief",

      confidence:
        0.96,

      reasons,
    };
  }

  if (
    id.startsWith(
      "mechanism ",
    ) ||
    includesAny(
      label,
      [
        "friction",
        "latency",
        "breakdown",
        "constraint",
        "drag",
        "conflict",
        "dependency",
        "bottleneck",
        "failure",
      ],
    ) &&
    Array.isArray(
      record.supportingPhenomenonIds,
    )
  ) {
    reasons.push(
      "Uses mechanism identity or causal-dynamic language with phenomenon ancestry.",
    );

    return {
      category:
        "mechanism",

      confidence:
        0.94,

      reasons,
    };
  }

  if (
    id.startsWith(
      "phenomenon ",
    ) ||
    Array.isArray(
      record.clusterIds,
    ) ||
    Array.isArray(
      record.patternIds,
    ) &&
    includesAny(
      text,
      [
        "organizational phenomenon",
        "detecting a persistent",
        "detecting an emerging",
      ],
    )
  ) {
    reasons.push(
      "Uses phenomenon identity and synthesis ancestry.",
    );

    return {
      category:
        "phenomenon",

      confidence:
        0.92,

      reasons,
    };
  }

  if (
    id.startsWith(
      "entity cluster ",
    ) ||
    includesAny(
      text,
      [
        "entity centric cluster",
        "related cluster of understandings",
      ],
    )
  ) {
    reasons.push(
      "Represents an entity-centered cluster.",
    );

    return {
      category:
        "cluster",

      confidence:
        0.95,

      reasons,
    };
  }

  if (
    id.startsWith(
      "understanding ",
    ) ||
    id.startsWith(
      "u canonical",
    ) ||
    includesAny(
      text,
      [
        "may be shaping the strategic picture",
        "possible relationship",
        "should be tested against additional evidence",
      ],
    )
  ) {
    reasons.push(
      "Represents an intermediate understanding rather than a reusable concept.",
    );

    return {
      category:
        "understanding",

      confidence:
        0.92,

      reasons,
    };
  }

  if (
    id.startsWith(
      "concept ",
    ) ||
    id.startsWith(
      "emergent concept ",
    ) ||
    id.startsWith(
      "meaning ",
    ) ||
    id.startsWith(
      "dynamic ",
    )
  ) {
    reasons.push(
      "Uses canonical concept, meaning, or emergent-concept identity.",
    );

    return {
      category:
        "concept",

      confidence:
        0.91,

      reasons,
    };
  }

  if (
    includesAny(
      text,
      [
        "current organizational state",
        "organization as strained",
        "organization as stable",
        "organization as improving",
      ],
    )
  ) {
    reasons.push(
      "Summarizes the current integrated organizational state.",
    );

    return {
      category:
        "organizational-state",

      confidence:
        0.95,

      reasons,
    };
  }

  if (
    includesAny(
      text,
      [
        "discovery judges",
        "executive assessment",
        "recommended focus",
        "executive recommendation",
      ],
    )
  ) {
    reasons.push(
      "Represents executive-level synthesis or judgment.",
    );

    return {
      category:
        "executive-assessment",

      confidence:
        0.93,

      reasons,
    };
  }

  if (
    includesAny(
      label,
      [
        "team",
        "company",
        "systems",
        "leadership",
        "operations",
      ],
    ) &&
    !includesAny(
      label,
      [
        "alignment",
        "dependency",
        "friction",
        "failure",
        "capacity",
      ],
    )
  ) {
    reasons.push(
      "Appears to name an organizational entity rather than a cognitive abstraction.",
    );

    return {
      category:
        "entity",

      confidence:
        0.7,

      reasons,
    };
  }

  reasons.push(
    "No canonical semantic signature was detected.",
  );

  return {
    category:
      "unknown",

    confidence:
      0.4,

    reasons,
  };
}

function categoriesCompatible(
  layer:
    CognitiveLayerId,

  category:
    SemanticCategory,
): boolean {
  return (
    EXPECTED_CATEGORY_BY_LAYER[
      layer
    ] ===
    category
  );
}

function uniqueByIdentity(
  records:
    UnknownRecord[],
): UnknownRecord[] {
  const seen =
    new Map<
      string,
      UnknownRecord
    >();

  records.forEach(
    (
      record,
      index,
    ) => {
      const identity =
        buildIdentity(
          record,
          `anonymous-${index}`,
        );

      if (
        !seen.has(
          identity,
        )
      ) {
        seen.set(
          identity,
          record,
        );
      }
    },
  );

  return Array.from(
    seen.values(),
  );
}

function buildDuplicateIndex(
  memory:
    ExtendedMemory,

  layers:
    CognitiveLayerId[],
): Map<
  string,
  CognitiveLayerId[]
> {
  const index =
    new Map<
      string,
      Set<
        CognitiveLayerId
      >
    >();

  for (
    const layer of
    layers
  ) {
    const records =
      uniqueByIdentity(
        extractRecords(
          memory,
          layer,
        ),
      );

    records.forEach(
      (
        record,
        objectIndex,
      ) => {
        const identity =
          buildIdentity(
            record,
            `${layer}-${objectIndex}`,
          );

        const layerSet =
          index.get(
            identity,
          ) ??
          new Set<
            CognitiveLayerId
          >();

        layerSet.add(
          layer,
        );

        index.set(
          identity,
          layerSet,
        );
      },
    );
  }

  return new Map(
    Array.from(
      index.entries(),
    ).map(
      (
        [
          identity,
          layerSet,
        ],
      ) => [
        identity,
        Array.from(
          layerSet,
        ),
      ],
    ),
  );
}

function buildPriorityFindings(
  layers:
    LayerAudit[],

  duplicates:
    DuplicateObject[],
): string[] {
  const findings:
    string[] = [];

  const sorted =
    [
      ...layers,
    ].sort(
      (
        left,
        right,
      ) =>
        left.compatibilityRate -
        right.compatibilityRate,
    );

  const lowest =
    sorted[0];

  if (
    lowest
  ) {
    findings.push(
      `${lowest.label} has the lowest semantic compatibility at ${lowest.compatibilityRate.toFixed(1)}%.`,
    );
  }

  const conceptLayer =
    layers.find(
      (layer) =>
        layer.layer ===
        "concepts",
    );

  if (
    conceptLayer &&
    conceptLayer.incompatibleCount >
      0
  ) {
    findings.push(
      `Concepts contains ${conceptLayer.incompatibleCount} object(s) classified as another semantic category.`,
    );
  }

  const phenomenonLayer =
    layers.find(
      (layer) =>
        layer.layer ===
        "phenomena",
    );

  if (
    phenomenonLayer
  ) {
    const clusterLike =
      phenomenonLayer
        .objects
        .filter(
          (object) =>
            object
              .classification
              .category ===
              "cluster" ||
            object
              .classification
              .category ===
              "entity",
        )
        .length;

    if (
      clusterLike >
      0
    ) {
      findings.push(
        `Phenomena contains ${clusterLike} entity or cluster object(s) that should be normalized before downstream reasoning.`,
      );
    }
  }

  if (
    duplicates.length >
    0
  ) {
    findings.push(
      `${duplicates.length} cognitive object identity or label(s) appear in more than one layer.`,
    );
  }

  if (
    findings.length ===
    0
  ) {
    findings.push(
      "No material semantic-normalization issues were detected.",
    );
  }

  return findings;
}

function truncate(
  value:
    string,

  length:
    number,
): string {
  if (
    value.length <=
    length
  ) {
    return value;
  }

  return `${value.slice(
    0,
    length -
      1,
  )}…`;
}

function printAuditedObject(
  object:
    AuditedObject,
): void {
  console.log(
    `${object.layerCompatible ? "PASS" : "FLAG"}  ${object.label}`,
  );

  console.log(
    `  ID: ${object.id}`,
  );

  console.log(
    `  Stored as: ${LAYER_LABELS[object.storedLayer]}`,
  );

  console.log(
    `  Classified as: ${object.classification.category}`,
  );

  console.log(
    `  Classification confidence: ${(object.classification.confidence * 100).toFixed(0)}%`,
  );

  console.log(
    `  Summary: ${truncate(object.summary, 260) || "n/a"}`,
  );

  if (
    object.duplicateLayers.length >
    1
  ) {
    console.log(
      `  Duplicate layers: ${object.duplicateLayers.map((layer) => LAYER_LABELS[layer]).join(", ")}`,
    );
  }

  for (
    const reason of
    object
      .classification
      .reasons
  ) {
    console.log(
      `  Reason: ${reason}`,
    );
  }

  console.log("");
}

export function runCognitiveSemanticNormalizationAudit001():
  CognitiveSemanticNormalizationAudit {
  const runtime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const memory =
    runtime.memory as
      typeof runtime.memory &
      ExtendedMemory;

  const layerOrder:
    CognitiveLayerId[] = [
    "phenomena",
    "mechanisms",
    "beliefs",
    "concepts",
    "theories",
    "conditions",
    "organizationalState",
    "executiveAssessment",
  ];

  const duplicateIndex =
    buildDuplicateIndex(
      memory,
      layerOrder,
    );

  const layers:
    LayerAudit[] =
    layerOrder.map(
      (layer) => {
        const records =
          uniqueByIdentity(
            extractRecords(
              memory,
              layer,
            ),
          );

        const objects =
          records.map(
            (
              record,
              index,
            ): AuditedObject => {
              const id =
                buildIdentity(
                  record,
                  `${layer}-${index + 1}`,
                );

              const label =
                buildLabel(
                  record,
                  id,
                );

              const summary =
                firstString(
                  record,
                  [
                    "summary",
                    "description",
                    "rationale",
                    "explanation",
                    "whyItMatters",
                    "executiveNarrative",
                    "executiveRecommendation",
                    "recommendedExecutiveAction",
                  ],
                ) ??
                "";

              const classification =
                classifyObject(
                  record,
                );

              return {
                storedLayer:
                  layer,

                id,

                label,

                type:
                  firstString(
                    record,
                    [
                      "type",
                      "domain",
                    ],
                  ),

                summary,

                classification,

                layerCompatible:
                  categoriesCompatible(
                    layer,
                    classification.category,
                  ),

                duplicateLayers:
                  duplicateIndex.get(
                    id,
                  ) ??
                  [
                    layer,
                  ],
              };
            },
          );

        const compatibleCount =
          objects.filter(
            (object) =>
              object.layerCompatible,
          ).length;

        const incompatibleCount =
          objects.length -
          compatibleCount;

        const compatibilityRate =
          objects.length ===
            0
            ? 100
            : compatibleCount /
              objects.length *
              100;

        return {
          layer,

          label:
            LAYER_LABELS[
              layer
            ],

          objectCount:
            objects.length,

          compatibleCount,

          incompatibleCount,

          compatibilityRate:
            Number(
              compatibilityRate.toFixed(
                2,
              ),
            ),

          objects,
        };
      },
    );

  const duplicates:
    DuplicateObject[] =
    Array.from(
      duplicateIndex.entries(),
    )
      .filter(
        (
          [
            ,
            duplicateLayers,
          ],
        ) =>
          duplicateLayers.length >
          1,
      )
      .map(
        (
          [
            identity,
            duplicateLayers,
          ],
        ) => {
          let label =
            identity;

          for (
            const layer of
            duplicateLayers
          ) {
            const record =
              extractRecords(
                memory,
                layer,
              ).find(
                (
                  candidate,
                ) =>
                  buildIdentity(
                    candidate,
                    "",
                  ) ===
                  identity,
              );

            if (
              record
            ) {
              label =
                buildLabel(
                  record,
                  identity,
                );

              break;
            }
          }

          return {
            identity,

            label,

            layers:
              duplicateLayers,
          };
        },
      );

  const totalObjects =
    layers.reduce(
      (
        total,
        layer,
      ) =>
        total +
        layer.objectCount,
      0,
    );

  const totalCompatible =
    layers.reduce(
      (
        total,
        layer,
      ) =>
        total +
        layer.compatibleCount,
      0,
    );

  const overallCompatibilityRate =
    totalObjects ===
      0
      ? 100
      : Number(
          (
            totalCompatible /
            totalObjects *
            100
          ).toFixed(
            2,
          ),
        );

  const priorityFindings =
    buildPriorityFindings(
      layers,
      duplicates,
    );

  const audit:
    CognitiveSemanticNormalizationAudit = {
    auditId:
      "cognitive-semantic-normalization-audit-001",

    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    evaluatedAt:
      new Date()
        .toISOString(),

    overallCompatibilityRate,

    passed:
      overallCompatibilityRate >=
        90 &&
      duplicates.length ===
        0,

    layers,

    duplicates,

    priorityFindings,
  };

  console.log("");
  console.log("==========================================");
  console.log("COGNITIVE SEMANTIC NORMALIZATION AUDIT 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Objects audited: ${totalObjects}`,
  );

  console.log("");

  for (
    const layer of
    layers
  ) {
    console.log("------------------------------------------");
    console.log(
      `${layer.label}: ${layer.compatibilityRate}% compatible`,
    );
    console.log(
      `Objects: ${layer.objectCount} | Compatible: ${layer.compatibleCount} | Flagged: ${layer.incompatibleCount}`,
    );
    console.log("");

    for (
      const object of
      layer.objects
    ) {
      printAuditedObject(
        object,
      );
    }
  }

  console.log("Cross-layer duplicates");
  console.log("------------------------------------------");

  if (
    duplicates.length ===
    0
  ) {
    console.log(
      "None",
    );
  } else {
    for (
      const duplicate of
      duplicates
    ) {
      console.log(
        `- ${duplicate.label}`,
      );

      console.log(
        `  Identity: ${duplicate.identity}`,
      );

      console.log(
        `  Layers: ${duplicate.layers.map((layer) => LAYER_LABELS[layer]).join(", ")}`,
      );
    }
  }

  console.log("");
  console.log("Priority findings");
  console.log("------------------------------------------");

  for (
    const finding of
    priorityFindings
  ) {
    console.log(
      `- ${finding}`,
    );
  }

  console.log("");
  console.log("==========================================");
  console.log("AUDIT RESULT");
  console.log("==========================================");
  console.log("");

  console.log(
    `Overall semantic compatibility: ${overallCompatibilityRate}%`,
  );

  console.log(
    `Cross-layer duplicates: ${duplicates.length}`,
  );

  console.log(
    `Result: ${audit.passed ? "PASS" : "NORMALIZATION REQUIRED"}`,
  );

  console.log("");

  return audit;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "cognitiveSemanticNormalizationAudit001.ts"
) {
  runCognitiveSemanticNormalizationAudit001();
}

export type {
  AuditedObject,
  CognitiveSemanticNormalizationAudit,
  DuplicateObject,
  LayerAudit,
  SemanticCategory,
  SemanticClassification,
};
