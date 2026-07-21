import {
  runDiscoveryV3,
} from "../../v3";

import {
  evolveOrganizationRuntime,
} from "../../v3/runtime/evolveOrganizationRuntime";

import {
  createEmptyOrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

type UnknownRecord = Record<string, unknown>;

type SemanticFacet =
  | "expertiseConcentration"
  | "knowledgeTransfer"
  | "scaling"
  | "deliveryQuality";

type LayerClassification =
  | "required"
  | "diagnostic"
  | "informational";

type LineageSupportAssessment =
  | "directly supported by upstream IDs"
  | "reconstructed from another source"
  | "impossible to determine from available ancestry";

type LayerReport = {
  name: string;
  classification: LayerClassification;
  passed: boolean;
  matchedFacets: SemanticFacet[];
  missingFacets: SemanticFacet[];
  excerpts: string[];
  supportIds: string[];
  failures: string[];
};

type LineageDiagnostic = {
  upstream: string;
  missingLayer: string;
  downstream: string;
  supportAssessment: LineageSupportAssessment;
};

const ORGANIZATION_ID =
  "executive-meaning-preservation-001";

const FACET_ORDER: SemanticFacet[] = [
  "expertiseConcentration",
  "knowledgeTransfer",
  "scaling",
  "deliveryQuality",
];

const FACET_TERMS: Record<
  SemanticFacet,
  string[]
> = {
  expertiseConcentration: [
    "founder",
    "founder dependency",
    "key person",
    "single person",
    "centralized expertise",
    "leadership dependency",
    "expertise concentration",
  ],
  knowledgeTransfer: [
    "institutional knowledge",
    "knowledge transfer",
    "knowledge continuity",
    "codify",
    "documented methods",
    "reusable practices",
    "organizational memory",
  ],
  scaling: [
    "scale",
    "growth",
    "add consultants",
    "expand capacity",
    "serve more clients",
    "onboard consultants",
  ],
  deliveryQuality: [
    "service quality",
    "delivery quality",
    "client delivery",
    "quality review",
    "client work",
  ],
};

const SUPPORT_KEYS = [
  "evidenceIds",
  "sourceEvidenceIds",
  "supportingEvidenceIds",
  "observationIds",
  "supportingObservationIds",
  "signalIds",
  "supportingSignalIds",
  "patternIds",
  "supportingPatternIds",
  "phenomenonIds",
  "supportingPhenomenonIds",
  "mechanismIds",
  "supportingMechanismIds",
  "beliefIds",
  "supportingBeliefIds",
  "conceptIds",
  "supportingConceptIds",
  "theoryIds",
  "supportingTheoryIds",
  "conditionIds",
  "supportingConditionIds",
] as const;

const input = {
  company:
    "Summit Advisory Group",
  website:
    "https://example.invalid",
  industry:
    "Management Consulting",
  question:
    "How can the company grow beyond the founder without reducing client service quality?",
  context: [
    "Client delivery depends heavily on founder expertise.",
    "The founder personally handles complex client work and quality review.",
    "Growth requires adding consultants.",
    "New consultants lack reliable access to the founder's methods, judgment, and accumulated client knowledge.",
    "Institutional knowledge is concentrated in the founder.",
    "Leadership wants to scale while preserving service quality and reducing founder dependency.",
  ].join("\n"),
};

function normalizeText(
  value: string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asRecord(
  value: unknown,
): UnknownRecord | null {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as UnknownRecord;
}

function asRecords(
  value: unknown,
): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value
      .map(asRecord)
      .filter(
        (item): item is UnknownRecord =>
          item !== null,
      );
  }

  const record = asRecord(value);
  return record ? [record] : [];
}

function collectStrings(
  value: unknown,
): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  return Object.values(record).flatMap(
    collectStrings,
  );
}

function objectText(
  value: unknown,
): string {
  return normalizeText(
    collectStrings(value).join(" "),
  );
}

function matchingFacets(
  value: unknown,
): SemanticFacet[] {
  const text = objectText(value);

  return FACET_ORDER.filter(
    (facet) =>
      FACET_TERMS[facet].some(
        (term) =>
          text.includes(
            normalizeText(term),
          ),
      ),
  );
}

function layerFacets(
  objects: UnknownRecord[],
): SemanticFacet[] {
  const found = new Set<SemanticFacet>();

  for (const object of objects) {
    for (const facet of matchingFacets(object)) {
      found.add(facet);
    }
  }

  return FACET_ORDER.filter(
    (facet) => found.has(facet),
  );
}

function supportIds(
  value: unknown,
): string[] {
  const record = asRecord(value);
  if (!record) {
    return [];
  }

  const ids = SUPPORT_KEYS.flatMap(
    (key) => {
      const candidate = record[key];
      return Array.isArray(candidate)
        ? candidate.filter(
            (item): item is string =>
              typeof item === "string" &&
              item.trim().length > 0,
          )
        : [];
    },
  );

  return Array.from(new Set(ids));
}

function representativeExcerpts(
  objects: UnknownRecord[],
): string[] {
  return objects
    .filter(
      (object) =>
        matchingFacets(object).length > 0,
    )
    .map((object) =>
      collectStrings(object)
        .map((value) => value.trim())
        .filter(Boolean)
        .join(" | "),
    )
    .filter(Boolean)
    .slice(0, 3)
    .map((excerpt) =>
      excerpt.length > 240
        ? `${excerpt.slice(0, 237)}...`
        : excerpt,
    );
}

function buildObjectIndex(
  layers: UnknownRecord[][],
): Map<string, UnknownRecord> {
  const index = new Map<string, UnknownRecord>();

  for (const object of layers.flat()) {
    const id = object.id;
    if (typeof id === "string") {
      index.set(id, object);
    }
  }

  return index;
}

function linkedObjects(
  object: UnknownRecord,
  index: Map<string, UnknownRecord>,
): UnknownRecord[] {
  return supportIds(object)
    .map((id) => index.get(id))
    .filter(
      (item): item is UnknownRecord =>
        item !== undefined,
    );
}

function hasConnectedFacets(
  objects: UnknownRecord[],
  left: SemanticFacet[],
  right: SemanticFacet[],
): boolean {
  return objects.some((object) => {
    const facets = matchingFacets(object);
    return (
      left.some((facet) => facets.includes(facet)) &&
      right.some((facet) => facets.includes(facet))
    );
  });
}

function makeReport(
  params: {
    name: string;
    classification: LayerClassification;
    objects: UnknownRecord[];
    failures: string[];
    extraSupportIds?: string[];
  },
): LayerReport {
  const matchedFacets =
    layerFacets(params.objects);

  return {
    name: params.name,
    classification: params.classification,
    passed: params.failures.length === 0,
    matchedFacets,
    missingFacets: FACET_ORDER.filter(
      (facet) =>
        !matchedFacets.includes(facet),
    ),
    excerpts:
      representativeExcerpts(params.objects),
    supportIds: Array.from(
      new Set([
        ...params.objects.flatMap(supportIds),
        ...(params.extraSupportIds ?? []),
      ]),
    ),
    failures: params.failures,
  };
}

function printReport(
  report: LayerReport,
): void {
  console.log(
    `${report.name}: ${report.passed ? "PASS" : "FAIL"} (${report.classification})`,
  );
  console.log(
    `  Matched facets: ${report.matchedFacets.join(", ") || "none"}`,
  );
  console.log(
    `  Missing facets: ${report.missingFacets.join(", ") || "none"}`,
  );
  console.log(
    `  Support IDs: ${report.supportIds.slice(0, 12).join(", ") || "none"}`,
  );

  for (const excerpt of report.excerpts) {
    console.log(`  Excerpt: ${excerpt}`);
  }

  for (const failure of report.failures) {
    console.log(`  Assertion: ${failure}`);
  }
}

function objectIds(
  objects: UnknownRecord[],
): Set<string> {
  return new Set(
    objects
      .map((object) => object.id)
      .filter(
        (id): id is string =>
          typeof id === "string",
      ),
  );
}

function assessLineageSupport(
  upstreamObjects: UnknownRecord[],
  downstreamObjects: UnknownRecord[],
  index: Map<string, UnknownRecord>,
): LineageSupportAssessment {
  const upstreamIds =
    objectIds(upstreamObjects);
  const downstreamSupportIds =
    new Set(
      downstreamObjects.flatMap(supportIds),
    );

  if (
    Array.from(downstreamSupportIds).some(
      (id) => upstreamIds.has(id),
    )
  ) {
    return "directly supported by upstream IDs";
  }

  const alternateSources =
    Array.from(downstreamSupportIds)
      .map((id) => index.get(id))
      .filter(
        (object): object is UnknownRecord =>
          object !== undefined &&
          !upstreamIds.has(
            String(object.id ?? ""),
          ),
      );

  if (
    layerFacets(alternateSources).length > 0
  ) {
    return "reconstructed from another source";
  }

  return "impossible to determine from available ancestry";
}

function findLineageDiscontinuities(
  reports: LayerReport[],
  layerObjects: Map<string, UnknownRecord[]>,
  index: Map<string, UnknownRecord>,
): LineageDiagnostic[] {
  const diagnostics: LineageDiagnostic[] = [];

  for (
    let missingIndex = 1;
    missingIndex < reports.length - 1;
    missingIndex += 1
  ) {
    if (
      reports[missingIndex]
        .matchedFacets.length > 0
    ) {
      continue;
    }

    let upstreamIndex = missingIndex - 1;
    while (
      upstreamIndex >= 0 &&
      reports[upstreamIndex]
        .matchedFacets.length === 0
    ) {
      upstreamIndex -= 1;
    }

    let downstreamIndex = missingIndex + 1;
    while (
      downstreamIndex < reports.length &&
      reports[downstreamIndex]
        .matchedFacets.length === 0
    ) {
      downstreamIndex += 1;
    }

    if (
      upstreamIndex < 0 ||
      downstreamIndex >= reports.length
    ) {
      continue;
    }

    const upstream = reports[upstreamIndex];
    const downstream = reports[downstreamIndex];

    diagnostics.push({
      upstream: upstream.name,
      missingLayer:
        reports[missingIndex].name,
      downstream: downstream.name,
      supportAssessment:
        assessLineageSupport(
          layerObjects.get(upstream.name) ?? [],
          layerObjects.get(downstream.name) ?? [],
          index,
        ),
    });
  }

  return diagnostics;
}

function runBenchmark(): {
  reports: LayerReport[];
  lineageDiagnostics: LineageDiagnostic[];
} {
  const runtime =
    createEmptyOrganizationRuntime({
      organizationId:
        ORGANIZATION_ID,
      name: input.company,
      industry: input.industry,
      website: input.website,
    });

  const originalLog = console.log;
  let result: ReturnType<typeof runDiscoveryV3>;
  let evolvedRuntime: ReturnType<
    typeof evolveOrganizationRuntime
  >;

  console.log = () => undefined;
  try {
    result = runDiscoveryV3(input);
    evolvedRuntime =
      evolveOrganizationRuntime({
        runtime,
        result,
        input,
      });
  } finally {
    console.log = originalLog;
  }

  const memory =
    evolvedRuntime.memory as UnknownRecord;

  const evidence =
    asRecords(result.evidence);
  const observations =
    asRecords(result.observations);
  const signals =
    asRecords(result.signals);
  const understanding =
    asRecords(result.understanding);
  const phenomenaState =
    asRecord(
      memory.organizationalPhenomenaState,
    );
  const phenomena = asRecords(
    phenomenaState?.phenomena ??
      memory.organizationalPhenomena ??
      memory.phenomena,
  );
  const mechanismNetwork =
    asRecord(memory.mechanismNetwork);
  const mechanisms = [
    ...asRecords(result.mechanisms),
    ...asRecords(
      mechanismNetwork?.mechanisms,
    ),
  ];
  const beliefs = [
    ...asRecords(result.beliefs),
    ...asRecords(memory.organizationalBeliefs),
    ...asRecords(memory.beliefs),
  ];
  const concepts =
    asRecords(memory.organizationalConcepts);
  const semanticConcepts =
    asRecords(memory.semanticConcepts);
  const conceptualUnderstanding =
    asRecords(memory.conceptualUnderstanding);
  const conditions =
    asRecords(memory.organizationalConditions);
  const primaryConstraint =
    asRecords(memory.primaryExecutiveConstraint);

  const allLayers = [
    evidence,
    observations,
    signals,
    understanding,
    phenomena,
    mechanisms,
    beliefs,
    concepts,
    semanticConcepts,
    conceptualUnderstanding,
    conditions,
    primaryConstraint,
  ];
  const index = buildObjectIndex(allLayers);

  const reports: LayerReport[] = [];

  const evidenceFacets =
    layerFacets(evidence);
  const evidenceFailures: string[] = [];
  if (evidenceFacets.length !== FACET_ORDER.length) {
    evidenceFailures.push(
      "All four semantic facets must appear in the evidence corpus.",
    );
  }
  if (!hasConnectedFacets(
    evidence,
    ["expertiseConcentration"],
    ["deliveryQuality"],
  )) {
    evidenceFailures.push(
      "An evidence object must connect expertise concentration with delivery quality.",
    );
  }
  if (!hasConnectedFacets(
    evidence,
    ["scaling"],
    [
      "knowledgeTransfer",
      "expertiseConcentration",
    ],
  )) {
    evidenceFailures.push(
      "An evidence object must connect scaling with knowledge transfer or expertise concentration.",
    );
  }
  reports.push(makeReport({
    name: "Evidence",
    classification: "required",
    objects: evidence,
    failures: evidenceFailures,
  }));

  for (const [name, classification, objects] of [
    ["Observations", "informational", observations],
    ["Signals", "informational", signals],
    ["Phenomena", "diagnostic", phenomena],
    ["Mechanisms", "diagnostic", mechanisms],
    ["Beliefs", "diagnostic", beliefs],
    ["Concepts", "diagnostic", concepts],
  ] as Array<[
    string,
    LayerClassification,
    UnknownRecord[],
  ]>) {
    reports.push(makeReport({
      name,
      classification,
      objects,
      failures:
        objects.length > 0 &&
        layerFacets(objects).length === 0
          ? [
              "Available layer contains none of the source semantic facets.",
            ]
          : [],
    }));
  }

  const understandingFacets =
    layerFacets(understanding);
  const understandingFailures: string[] = [];
  if (!understandingFacets.includes(
    "expertiseConcentration",
  )) {
    understandingFailures.push(
      "Expertise concentration must survive into Understanding.",
    );
  }
  if (understandingFacets.length < 3) {
    understandingFailures.push(
      "At least three of four semantic facets must survive into Understanding.",
    );
  }
  if (!understanding.some(
    (object) =>
      matchingFacets(object).length >= 2,
  )) {
    understandingFailures.push(
      "At least one understanding object must connect two source facets.",
    );
  }
  reports.splice(3, 0, makeReport({
    name: "Understanding",
    classification: "required",
    objects: understanding,
    failures: understandingFailures,
  }));

  const semanticFacets =
    layerFacets(semanticConcepts);
  const semanticFailures: string[] = [];
  if (semanticFacets.length < 2) {
    semanticFailures.push(
      "At least two source facets must survive into Semantic Concepts.",
    );
  }
  if (
    !semanticFacets.includes(
      "expertiseConcentration",
    ) &&
    !semanticFacets.includes(
      "knowledgeTransfer",
    )
  ) {
    semanticFailures.push(
      "Semantic Concepts must preserve expertise concentration or knowledge transfer.",
    );
  }
  const semanticHasConnection =
    semanticConcepts.some(
      (object) =>
        matchingFacets(object).length >= 2 ||
        layerFacets(
          linkedObjects(object, index),
        ).length >= 2,
    );
  if (!semanticHasConnection) {
    semanticFailures.push(
      "A semantic concept must connect two facets or preserve meaningful ancestry.",
    );
  }
  reports.push(makeReport({
    name: "Semantic Concepts",
    classification: "required",
    objects: semanticConcepts,
    failures: semanticFailures,
  }));

  const conceptualFacets =
    layerFacets(conceptualUnderstanding);
  const conceptualFailures: string[] = [];
  if (conceptualFacets.length < 2) {
    conceptualFailures.push(
      "At least two source facets must survive into Conceptual Understanding.",
    );
  }
  if (!hasConnectedFacets(
    conceptualUnderstanding,
    [
      "expertiseConcentration",
      "knowledgeTransfer",
    ],
    ["scaling", "deliveryQuality"],
  )) {
    conceptualFailures.push(
      "A conceptual understanding must connect concentrated expertise or knowledge transfer with scaling or delivery quality.",
    );
  }
  reports.push(makeReport({
    name: "Conceptual Understanding",
    classification: "required",
    objects: conceptualUnderstanding,
    failures: conceptualFailures,
  }));

  const relevantConditionTerms = [
    "leadership dependency",
    "leadershipDependency",
    "knowledge continuity",
    "knowledgeContinuity",
    "execution capacity",
    "executionCapacity",
    "operating model",
    "operatingModel",
    "strategic alignment",
    "strategicAlignment",
  ].map(normalizeText);
  const relevantConditions =
    conditions.filter((condition) => {
      const text = objectText({
        id: condition.id,
        name: condition.name,
        domain: condition.domain,
      });
      return relevantConditionTerms.some(
        (term) => text.includes(term),
      );
    });
  const conditionsWithSupport =
    relevantConditions.filter(
      (condition) =>
        supportIds(condition).length > 0,
    );
  const groundedConditions =
    conditionsWithSupport.filter(
      (condition) => {
        const facets = layerFacets(
          linkedObjects(condition, index),
        );
        return (
          facets.includes(
            "expertiseConcentration",
          ) ||
          facets.includes(
            "knowledgeTransfer",
          )
        );
      },
    );
  const conditionFailures: string[] = [];
  if (relevantConditions.length === 0) {
    conditionFailures.push(
      "At least one relevant organizational condition must exist.",
    );
  }
  if (conditionsWithSupport.length === 0) {
    conditionFailures.push(
      "A relevant condition must have a non-empty support collection.",
    );
  }
  if (groundedConditions.length === 0) {
    conditionFailures.push(
      "A relevant condition's linked cognition must preserve expertise concentration or knowledge transfer.",
    );
  }
  reports.push(makeReport({
    name: "Organizational Conditions",
    classification: "required",
    objects: conditions,
    failures: conditionFailures,
    extraSupportIds:
      relevantConditions.flatMap(
        supportIds,
      ),
  }));

  const constraint =
    primaryConstraint[0];
  const constraintSupportIds =
    constraint ? supportIds(constraint) : [];
  const linkedConstraintObjects =
    constraint
      ? linkedObjects(constraint, index)
      : [];
  const linkedConstraintFacets =
    layerFacets(linkedConstraintObjects);
  const constraintConditionId =
    constraint?.conditionId;
  const referencedConditionExists =
    typeof constraintConditionId === "string" &&
    conditions.some(
      (condition) =>
        condition.id ===
        constraintConditionId,
    );
  const constraintContext = [
    ...(constraint ? [constraint] : []),
    ...linkedConstraintObjects,
  ];
  const constraintFailures: string[] = [];
  if (!referencedConditionExists) {
    constraintFailures.push(
      "Primary Executive Constraint must reference an existing condition.",
    );
  }
  if (constraintSupportIds.length === 0) {
    constraintFailures.push(
      "Primary Executive Constraint must have valid supporting cognition IDs.",
    );
  }
  if (
    !linkedConstraintFacets.includes(
      "expertiseConcentration",
    ) &&
    !linkedConstraintFacets.includes(
      "knowledgeTransfer",
    )
  ) {
    constraintFailures.push(
      "Constraint support must recover expertise concentration or knowledge transfer.",
    );
  }
  if (!hasConnectedFacets(
    constraintContext,
    [
      "expertiseConcentration",
      "knowledgeTransfer",
    ],
    ["scaling", "deliveryQuality"],
  )) {
    constraintFailures.push(
      "Constraint text or support graph must connect the source mechanism to scaling, capacity, delivery quality, or organizational dependency.",
    );
  }
  reports.push(makeReport({
    name: "Primary Executive Constraint",
    classification: "required",
    objects: primaryConstraint,
    failures: constraintFailures,
    extraSupportIds: constraintSupportIds,
  }));

  const layerObjects = new Map<
    string,
    UnknownRecord[]
  >([
    ["Evidence", evidence],
    ["Observations", observations],
    ["Signals", signals],
    ["Understanding", understanding],
    ["Phenomena", phenomena],
    ["Mechanisms", mechanisms],
    ["Beliefs", beliefs],
    ["Concepts", concepts],
    ["Semantic Concepts", semanticConcepts],
    [
      "Conceptual Understanding",
      conceptualUnderstanding,
    ],
    ["Organizational Conditions", conditions],
    [
      "Primary Executive Constraint",
      primaryConstraint,
    ],
  ]);

  return {
    reports,
    lineageDiagnostics:
      findLineageDiscontinuities(
        reports,
        layerObjects,
        index,
      ),
  };
}

const {
  reports,
  lineageDiagnostics,
} = runBenchmark();

console.log("");
console.log("EXECUTIVE MEANING PRESERVATION 001");
console.log(`Organization: ${ORGANIZATION_ID}`);
console.log("");

for (const report of reports) {
  printReport(report);
  console.log("");
}

const firstDiagnosticDegradation = reports.find(
  (report) =>
    report.classification === "diagnostic" &&
    !report.passed,
);

console.log(
  `First diagnostic semantic degradation: ${firstDiagnosticDegradation?.name ?? "none"}`,
);

const requiredFailures = reports.filter(
  (report) =>
    report.classification === "required" &&
    !report.passed,
);

const firstRequiredFailure =
  requiredFailures[0];

console.log(
  `First required semantic failure: ${firstRequiredFailure?.name ?? "none"}`,
);

for (const diagnostic of lineageDiagnostics) {
  console.log(
    `Semantic lineage discontinuity: ${diagnostic.upstream} → ${diagnostic.missingLayer} → ${diagnostic.downstream}`,
  );
  console.log(
    `  Downstream meaning: ${diagnostic.supportAssessment}`,
  );
}

console.log("");
console.log("Exit-causing required failures:");

if (requiredFailures.length === 0) {
  console.log("  none");
} else {
  for (const report of requiredFailures) {
    console.log(`  ${report.name}`);
    for (const failure of report.failures) {
      console.log(`    - ${failure}`);
    }
  }
}

if (requiredFailures.length > 0) {
  process.exitCode = 1;
}
