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

type InventoryObject = {
  layer:
    CognitiveLayerId;

  id:
    string;

  label:
    string;

  type:
    string | null;

  domain:
    string | null;

  status:
    string | null;

  confidence:
    number | null;

  strength:
    number | null;

  summary:
    string | null;

  supportingIds:
    Record<
      string,
      string[]
    >;

  raw:
    UnknownRecord;
};

type CognitiveLayerInventory = {
  id:
    CognitiveLayerId;

  label:
    string;

  count:
    number;

  objects:
    InventoryObject[];
};

type CognitiveInventoryReport = {
  inventoryId:
    "northstar-cognitive-inventory-001";

  organizationId:
    string;

  generatedAt:
    string;

  layers:
    CognitiveLayerInventory[];

  totalObjects:
    number;
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

const SUPPORTING_ID_KEYS = [
  "evidenceIds",
  "supportingEvidenceIds",
  "contradictoryEvidenceIds",

  "observationIds",
  "supportingObservationIds",

  "signalIds",
  "supportingSignalIds",

  "patternIds",
  "supportingPatternIds",

  "clusterIds",
  "supportingClusterIds",

  "phenomenonIds",
  "supportingPhenomenonIds",
  "relatedPhenomenonIds",

  "mechanismIds",
  "supportingMechanismIds",
  "relatedMechanismIds",

  "beliefIds",
  "supportingBeliefIds",
  "contradictoryBeliefIds",

  "conceptIds",
  "supportingConceptIds",

  "theoryIds",
  "supportingTheoryIds",
  "competingTheoryIds",

  "conditionIds",
  "sourceConditionIds",
  "upstreamConditionIds",
  "downstreamConditionIds",

  "relatedEntityIds",
  "entityIds",

  "predictionIds",
  "sourcePredictionIds",

  "interventionIds",
  "sourceInterventionIds",
] as const;

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

function asNumber(
  value:
    unknown,
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value,
    )
  )
    ? value
    : null;
}

function asStringArray(
  value:
    unknown,
): string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value.filter(
        (
          entry,
        ): entry is string =>
          typeof entry ===
            "string" &&
          entry.trim().length >
            0,
      ),
    ),
  );
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

function buildFallbackId(
  layer:
    CognitiveLayerId,

  index:
    number,
): string {
  return `${layer}-${index + 1}`;
}

function collectSupportingIds(
  record:
    UnknownRecord,
): Record<
  string,
  string[]
> {
  const result:
    Record<
      string,
      string[]
    > = {};

  for (
    const key of
    SUPPORTING_ID_KEYS
  ) {
    const values =
      asStringArray(
        record[
          key
        ],
      );

    if (
      values.length >
      0
    ) {
      result[
        key
      ] = values;
    }
  }

  return result;
}

function buildInventoryObject(
  layer:
    CognitiveLayerId,

  raw:
    UnknownRecord,

  index:
    number,
): InventoryObject {
  const id =
    firstString(
      raw,
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
    buildFallbackId(
      layer,
      index,
    );

  const label =
    firstString(
      raw,
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
    id;

  return {
    layer,

    id,

    label,

    type:
      firstString(
        raw,
        [
          "type",
          "predictionType",
          "interventionType",
        ],
      ),

    domain:
      firstString(
        raw,
        [
          "domain",
          "conditionDomain",
        ],
      ),

    status:
      firstString(
        raw,
        [
          "status",
          "trend",
          "priority",
        ],
      ),

    confidence:
      asNumber(
        raw
          .confidence,
      ),

    strength:
      asNumber(
        raw
          .strength,
      ),

    summary:
      firstString(
        raw,
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
      ),

    supportingIds:
      collectSupportingIds(
        raw,
      ),

    raw,
  };
}

function dedupeRecords(
  records:
    UnknownRecord[],
): UnknownRecord[] {
  const deduped =
    new Map<
      string,
      UnknownRecord
    >();

  records.forEach(
    (
      record,
      index,
    ) => {
      const id =
        firstString(
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
        );

      const label =
        firstString(
          record,
          [
            "label",
            "name",
            "title",
            "statement",
          ],
        );

      const key =
        id ??
        label ??
        `record-${index}`;

      if (
        !deduped.has(
          key,
        )
      ) {
        deduped.set(
          key,
          record,
        );
      }
    },
  );

  return Array.from(
    deduped.values(),
  );
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
      return dedupeRecords(
        [
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
        ],
      );

    case "mechanisms":
      return dedupeRecords(
        [
          ...(
            memory
              .mechanismNetwork
              ?.mechanisms ??
            []
          ),
        ],
      );

    case "beliefs":
      return dedupeRecords(
        [
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
        ],
      );

    case "concepts":
      return dedupeRecords(
        [
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
        ],
      );

    case "theories":
      return dedupeRecords(
        [
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
        ],
      );

    case "conditions":
      return dedupeRecords(
        [
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
        ],
      );

    case "organizationalState": {
      const records:
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
        records.push(
          direct,
        );
      }

      if (
        nested
      ) {
        records.push(
          nested,
        );
      }

      return dedupeRecords(
        records,
      );
    }

    case "executiveAssessment": {
      const assessment =
        asRecord(
          memory.executiveAssessment,
        );

      return assessment
        ? [
            assessment,
          ]
        : [];
    }
  }
}

function truncate(
  value:
    string,

  maxLength:
    number,
): string {
  if (
    value.length <=
    maxLength
  ) {
    return value;
  }

  return `${value.slice(
    0,
    maxLength -
      1,
  )}…`;
}

function formatNumber(
  value:
    number | null,
): string {
  return value ===
    null
      ? "n/a"
      : value.toFixed(
          3,
        );
}

function printSupportingIds(
  supportingIds:
    Record<
      string,
      string[]
    >,
): void {
  const entries =
    Object.entries(
      supportingIds,
    );

  if (
    entries.length ===
    0
  ) {
    console.log(
      "  Supporting links: none exposed",
    );

    return;
  }

  console.log(
    "  Supporting links:",
  );

  for (
    const [
      key,
      values,
    ] of
    entries
  ) {
    console.log(
      `    ${key}: ${values.join(", ")}`,
    );
  }
}


function printExecutiveAssessmentDetails(
  assessment:
    UnknownRecord,
): void {
  const primaryJudgment =
    asRecord(
      assessment.primaryJudgment,
    );

  const dominantCausalChain =
    asRecord(
      assessment.dominantCausalChain,
    );

  const executiveFocus =
    asRecord(
      assessment.executiveFocus,
    );

  if (
    !primaryJudgment &&
    !dominantCausalChain &&
    !executiveFocus
  ) {
    return;
  }

  console.log(
    "  Structured executive synthesis:",
  );

  if (
    primaryJudgment
  ) {
    console.log(
      "    Primary Judgment:",
    );

    const headline =
      asString(
        primaryJudgment.headline,
      );

    const judgment =
      asString(
        primaryJudgment.executiveJudgment,
      );

    const rationale =
      asString(
        primaryJudgment.rationale,
      );

    const uncertainty =
      asString(
        primaryJudgment.uncertaintySummary,
      );

    if (
      headline
    ) {
      console.log(
        `      Headline: ${truncate(headline, 320)}`,
      );
    }

    if (
      judgment
    ) {
      console.log(
        `      Judgment: ${truncate(judgment, 520)}`,
      );
    }

    if (
      rationale
    ) {
      console.log(
        `      Rationale: ${truncate(rationale, 420)}`,
      );
    }

    console.log(
      `      Confidence: ${formatNumber(
        asNumber(
          primaryJudgment.confidence,
        ),
      )}`,
    );

    if (
      uncertainty
    ) {
      console.log(
        `      Uncertainty: ${truncate(uncertainty, 320)}`,
      );
    }
  }

  if (
    dominantCausalChain
  ) {
    console.log(
      "    Dominant Causal Chain:",
    );

    const headline =
      asString(
        dominantCausalChain.headline,
      );

    const explanation =
      asString(
        dominantCausalChain.executiveExplanation,
      );

    if (
      headline
    ) {
      console.log(
        `      Headline: ${truncate(headline, 320)}`,
      );
    }

    if (
      explanation
    ) {
      console.log(
        `      Explanation: ${truncate(explanation, 520)}`,
      );
    }

    const nodes =
      Array.isArray(
        dominantCausalChain.nodes,
      )
        ? dominantCausalChain.nodes
            .map(
              asRecord,
            )
            .filter(
              (
                node,
              ): node is UnknownRecord =>
                Boolean(node),
            )
        : [];

    const edges =
      Array.isArray(
        dominantCausalChain.edges,
      )
        ? dominantCausalChain.edges
            .map(
              asRecord,
            )
            .filter(
              (
                edge,
              ): edge is UnknownRecord =>
                Boolean(edge),
            )
        : [];

    const labelById =
      new Map<
        string,
        string
      >();

    for (
      const node of
      nodes
    ) {
      const id =
        asString(
          node.id,
        );

      const label =
        asString(
          node.label,
        );

      if (
        id &&
        label
      ) {
        labelById.set(
          id,
          label,
        );
      }
    }

    if (
      edges.length >
      0
    ) {
      console.log(
        "      Relationships:",
      );

      for (
        const edge of
        edges
      ) {
        const fromId =
          asString(
            edge.fromId,
          );

        const toId =
          asString(
            edge.toId,
          );

        const relationship =
          asString(
            edge.relationship,
          );

        if (
          !fromId ||
          !toId ||
          !relationship
        ) {
          continue;
        }

        console.log(
          `        ${labelById.get(fromId) ?? fromId} --${relationship}--> ${labelById.get(toId) ?? toId}`,
        );
      }
    }

    console.log(
      `      Confidence: ${formatNumber(
        asNumber(
          dominantCausalChain.confidence,
        ),
      )}`,
    );

    const uncertainty =
      asString(
        dominantCausalChain.uncertaintySummary,
      );

    if (
      uncertainty
    ) {
      console.log(
        `      Uncertainty: ${truncate(uncertainty, 320)}`,
      );
    }
  }

  if (
    executiveFocus
  ) {
    console.log(
      "    Executive Focus:",
    );

    const headline =
      asString(
        executiveFocus.headline,
      );

    const direction =
      asString(
        executiveFocus.executiveDirection,
      );

    if (
      headline
    ) {
      console.log(
        `      Headline: ${truncate(headline, 320)}`,
      );
    }

    if (
      direction
    ) {
      console.log(
        `      Direction: ${truncate(direction, 420)}`,
      );
    }

    const focusAreas =
      Array.isArray(
        executiveFocus.focusAreas,
      )
        ? executiveFocus.focusAreas
            .map(
              asRecord,
            )
            .filter(
              (
                area,
              ): area is UnknownRecord =>
                Boolean(area),
            )
        : [];

    if (
      focusAreas.length >
      0
    ) {
      console.log(
        "      Focus Areas:",
      );

      for (
        const area of
        focusAreas
      ) {
        const label =
          asString(
            area.label,
          ) ??
          asString(
            area.conditionId,
          ) ??
          "Unknown focus area";

        const priority =
          asString(
            area.priority,
          ) ??
          "unspecified";

        console.log(
          `        ${priority.toUpperCase()}: ${label}`,
        );
      }
    }

    console.log(
      `      Confidence: ${formatNumber(
        asNumber(
          executiveFocus.confidence,
        ),
      )}`,
    );

    const uncertainty =
      asString(
        executiveFocus.uncertaintySummary,
      );

    if (
      uncertainty
    ) {
      console.log(
        `      Uncertainty: ${truncate(uncertainty, 320)}`,
      );
    }
  }
}

function printObject(
  object:
    InventoryObject,
): void {
  console.log(
    `- ${object.label}`,
  );

  console.log(
    `  ID: ${object.id}`,
  );

  console.log(
    `  Type: ${object.type ?? "n/a"}`,
  );

  console.log(
    `  Domain: ${object.domain ?? "n/a"}`,
  );

  console.log(
    `  Status: ${object.status ?? "n/a"}`,
  );

  console.log(
    `  Confidence: ${formatNumber(object.confidence)}`,
  );

  console.log(
    `  Strength: ${formatNumber(object.strength)}`,
  );

  if (
    object.summary
  ) {
    console.log(
      `  Summary: ${truncate(object.summary, 320)}`,
    );
  }

  printSupportingIds(
    object.supportingIds,
  );

  console.log("");
}

function buildLayerInventory(
  memory:
    ExtendedMemory,

  layer:
    CognitiveLayerId,
): CognitiveLayerInventory {
  const records =
    extractRecords(
      memory,
      layer,
    );

  const objects =
    records.map(
      (
        record,
        index,
      ) =>
        buildInventoryObject(
          layer,
          record,
          index,
        ),
    );

  return {
    id:
      layer,

    label:
      LAYER_LABELS[
        layer
      ],

    count:
      objects.length,

    objects,
  };
}

export function runCognitiveInventory001():
  CognitiveInventoryReport {
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

  const layers =
    layerOrder.map(
      (layer) =>
        buildLayerInventory(
          memory,
          layer,
        ),
    );

  const totalObjects =
    layers.reduce(
      (
        total,
        layer,
      ) =>
        total +
        layer.count,
      0,
    );

  const report:
    CognitiveInventoryReport = {
    inventoryId:
      "northstar-cognitive-inventory-001",

    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    generatedAt:
      new Date()
        .toISOString(),

    layers,

    totalObjects,
  };

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR COGNITIVE INVENTORY 001");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Organization ID: ${NORTHSTAR_ORGANIZATION_ID}`,
  );

  console.log(
    `Total canonical objects exposed: ${totalObjects}`,
  );

  console.log("");

  for (
    const layer of
    layers
  ) {
    console.log("------------------------------------------");
    console.log(
      `${layer.label} (${layer.count})`,
    );
    console.log("------------------------------------------");
    console.log("");

    if (
      layer.objects.length ===
      0
    ) {
      console.log(
        "No objects exposed.",
      );

      console.log("");

      continue;
    }

    for (
      const object of
      layer.objects
    ) {
      printObject(
        object,
      );

      if (
        layer.id ===
        "executiveAssessment"
      ) {
        printExecutiveAssessmentDetails(
          object.raw,
        );

        console.log("");
      }
    }
  }

  console.log("==========================================");
  console.log("INVENTORY COMPLETE");
  console.log("==========================================");
  console.log("");

  console.log(
    "This inventory is descriptive only. It does not score, rank, or infer correctness.",
  );

  console.log("");

  return report;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "cognitiveInventory001.ts"
) {
  runCognitiveInventory001();
}

export type {
  CognitiveInventoryReport,
  CognitiveLayerInventory,
  InventoryObject,
};
