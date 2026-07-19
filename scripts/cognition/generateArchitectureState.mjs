import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();

const PATHS = {
  capabilityRegistry: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_CAPABILITY_REGISTRY.json",
  ),

  fileRegistry: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_FILE_REGISTRY.json",
  ),

  capabilityAudit: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_CAPABILITY_AUDIT.json",
  ),

  cognitiveObjectModel: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_OBJECT_MODEL.md",
  ),

  sprintUpdates: path.join(
    PROJECT_ROOT,
    "docs",
    "Sprint Updates",
  ),

  capabilityTraces: path.join(
    PROJECT_ROOT,
    "docs",
    "Sprint Updates",
    "Capability Traces",
  ),

  output: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "DISCOVERY_ARCHITECTURE_STATE.json",
  ),
};

const PIPELINE = [
  "Evidence Ingestion",
  "Organizational Observation Inference",
  "Organizational Mechanism Inference",
  "Organizational Belief Formation",
  "Organizational Theory Formation",
  "Organizational Condition Inference",
  "Executive Assessment",
  "Executive Understanding Synthesis",
  "Organization Runtime",
  "Executive Projection",
  "Executive Workspace",
  "Atlas",
  "Simulation",
];

const SPRINT_DOCUMENT_PRIORITY = [
  "DISCOVERY_SNAPSHOT.md",
  "ENGINE_CAPABILITY_AUDIT.md",
  "PROJECT_STATE.md",
  "NEXT_CHAT.md",
  "CURRENT_MILESTONE.md",
];

function loadJson(filePath, label, required = true) {
  if (!fs.existsSync(filePath)) {
    if (required) {
      throw new Error(`${label} not found: ${filePath}`);
    }

    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not parse ${label}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    return "";
  }

  return fs.readFileSync(filePath, "utf8");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function tokenize(value) {
  return new Set(
    normalizeText(value)
      .split(" ")
      .filter(
        (token) =>
          token.length >= 4 &&
          ![
            "capability",
            "organizational",
            "discovery",
            "canonical",
            "executive",
            "runtime",
            "cognitive",
          ].includes(token),
      ),
  );
}

function overlapScore(left, right) {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  );

  const union = new Set([...leftTokens, ...rightTokens]);

  return intersection.length / union.size;
}

function capabilityCorpus(capability) {
  return [
    capability.name,
    capability.description,
    capability.subsystem,
    ...asArray(capability.searchTerms),
    ...asArray(capability.producesObjects),
    ...asArray(capability.executiveDestinations),
  ].join(" ");
}

function findPotentialOverlaps(capabilities) {
  const overlaps = [];

  for (let leftIndex = 0; leftIndex < capabilities.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < capabilities.length;
      rightIndex += 1
    ) {
      const left = capabilities[leftIndex];
      const right = capabilities[rightIndex];

      const semanticScore = overlapScore(
        capabilityCorpus(left),
        capabilityCorpus(right),
      );

      const sharedProducedObjects = asArray(left.producesObjects).filter(
        (objectName) =>
          asArray(right.producesObjects).includes(objectName),
      );

      const sameCanonicalProducer =
        Boolean(left.canonicalProducer) &&
        left.canonicalProducer === right.canonicalProducer;

      if (
        semanticScore >= 0.3 ||
        sharedProducedObjects.length > 0 ||
        sameCanonicalProducer
      ) {
        overlaps.push({
          leftCapabilityId: left.id,
          leftCapabilityName: left.name,
          rightCapabilityId: right.id,
          rightCapabilityName: right.name,
          semanticSimilarity: Number(semanticScore.toFixed(3)),
          sharedProducedObjects,
          sameCanonicalProducer,
          status: "review-required",
          duplicate: null,
          interpretation:
            "Potential similarity requires architectural review. Similarity alone does not prove duplication.",
        });
      }
    }
  }

  return overlaps.sort(
    (left, right) =>
      right.semanticSimilarity - left.semanticSimilarity,
  );
}

function extractMarkdownSection(markdown, headingNames) {
  const lines = markdown.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index].trim();

    if (!current.startsWith("#")) {
      continue;
    }

    const heading = current
      .replace(/^#+\s*/, "")
      .replace(/\*\*/g, "")
      .trim()
      .toLowerCase();

    const matchingHeading = headingNames.some(
      (name) => heading === name.toLowerCase(),
    );

    if (!matchingHeading) {
      continue;
    }

    const content = [];

    for (
      let contentIndex = index + 1;
      contentIndex < lines.length;
      contentIndex += 1
    ) {
      const line = lines[contentIndex];

      if (/^#{1,6}\s+/.test(line.trim())) {
        break;
      }

      content.push(line);
    }

    const normalized = content
      .join("\n")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*/g, "")
      .trim();

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function findSprintDocuments() {
  if (!fs.existsSync(PATHS.sprintUpdates)) {
    return [];
  }

  const availableFiles = fs
    .readdirSync(PATHS.sprintUpdates)
    .filter((fileName) => fileName.endsWith(".md"));

  const prioritized = SPRINT_DOCUMENT_PRIORITY.filter((fileName) =>
    availableFiles.includes(fileName),
  );

  const remaining = availableFiles
    .filter((fileName) => !prioritized.includes(fileName))
    .sort();

  return [...prioritized, ...remaining].map((fileName) => ({
    fileName,
    filePath: path.join(PATHS.sprintUpdates, fileName),
    contents: readText(path.join(PATHS.sprintUpdates, fileName)),
  }));
}

function deriveProjectState(documents) {
  let milestone = null;
  let phase = null;
  let objective = null;
  let sprint = null;
  let nextPriority = null;

  for (const document of documents) {
    milestone ??= extractMarkdownSection(document.contents, [
      "Current Milestone",
      "Milestone",
    ]);

    phase ??= extractMarkdownSection(document.contents, [
      "Current Development Phase",
      "Development Phase",
      "Current Phase",
    ]);

    objective ??= extractMarkdownSection(document.contents, [
      "Current Objective",
      "Objective",
    ]);

    sprint ??= extractMarkdownSection(document.contents, [
      "Current Sprint",
      "Sprint",
    ]);

    nextPriority ??= extractMarkdownSection(document.contents, [
      "Next Priority",
      "Next Step",
      "Next Sprint",
      "Recommended Next Sprint",
    ]);
  }

  return {
    currentMilestone: milestone,
    currentPhase: phase,
    currentObjective: objective,
    currentSprint: sprint,
    nextPriority,
    sourceDocuments: documents.map((document) => document.fileName),
  };
}

function parsePipelineSummary(markdown) {
  const result = {
    engine: false,
    runtime: false,
    executive: false,
    projection: false,
    ui: false,
    api: false,
    simulation: false,
    benchmark: false,
  };

  const layerMap = {
    Engine: "engine",
    Runtime: "runtime",
    Executive: "executive",
    Projection: "projection",
    UI: "ui",
    API: "api",
    Simulation: "simulation",
    Benchmark: "benchmark",
  };

  for (const [label, key] of Object.entries(layerMap)) {
    const expression = new RegExp(
      `\\|\\s*${label}\\s*\\|\\s*✅\\s*Found`,
      "i",
    );

    result[key] = expression.test(markdown);
  }

  return result;
}

function loadCapabilityTrace(capabilityId) {
  const tracePath = path.join(
    PATHS.capabilityTraces,
    `${String(capabilityId).toLowerCase()}.md`,
  );

  if (!fs.existsSync(tracePath)) {
    return {
      exists: false,
      connected: null,
      pipelineCoverage: null,
      tracePath: path.relative(PROJECT_ROOT, tracePath),
    };
  }

  const contents = readText(tracePath);

  return {
    exists: true,
    connected:
      contents.includes("**Connection status:** ✅ Connected") ||
      contents.includes("Architecture status: ✅ Connected"),
    pipelineCoverage: parsePipelineSummary(contents),
    tracePath: path.relative(PROJECT_ROOT, tracePath),
  };
}

function countCognitiveObjects(markdown) {
  if (!markdown) {
    return 0;
  }

  const idMatches = markdown.match(/\bCOG-[A-Z]+-\d+\b/g);
  const explicitObjectHeadings = markdown.match(
    /^#{2,6}\s+.+$/gm,
  );

  if (idMatches && idMatches.length > 0) {
    return unique(idMatches).length;
  }

  return explicitObjectHeadings
    ? explicitObjectHeadings.length
    : 0;
}

function buildCapabilityState(capability) {
  const trace = loadCapabilityTrace(capability.id);

  const implementationFiles = asArray(
    capability.implementationFiles,
  );

  return {
    id: capability.id,
    name: capability.name,
    description: capability.description ?? null,
    domain: capability.domain ?? null,
    architecturalLayer:
      capability.architecturalLayer ?? null,
    subsystem: capability.subsystem ?? null,
    status: capability.status ?? null,
    reviewStatus: capability.reviewStatus ?? null,

    ownership: {
      ownsObjects: asArray(capability.producesObjects),
      ownsCanonicalProducer:
        capability.canonicalProducer ?? null,
      implementationFiles,
      doesNotOwn: [],
    },

    relationships: {
      consumesCapabilities: asArray(
        capability.consumesCapabilities,
      ),
      consumedByCapabilities: asArray(
        capability.consumedByCapabilities,
      ),
      terminalCapability:
        capability.terminalCapability === true,
    },

    destinations: {
      runtime: capability.runtimeDestination ?? null,
      executive: asArray(
        capability.executiveDestinations,
      ),
    },

    validation: {
      atlasCoverage: capability.atlasCoverage ?? null,
      benchmarkCoverage: asArray(
        capability.benchmarkCoverage,
      ),
      canonicalProducerExists:
        capability.canonicalProducerExists === true,
      missingImplementationFiles: asArray(
        capability.missingImplementationFiles,
      ),
      capabilityTrace: trace,
    },

    searchTerms: asArray(capability.searchTerms),
    notes: capability.notes ?? "",
  };
}

function deriveIntelligenceState(capabilities) {
  const producedObjects = unique(
    capabilities.flatMap((capability) =>
      asArray(capability.producesObjects),
    ),
  );

  const executiveCapabilities = capabilities.filter(
    (capability) =>
      capability.architecturalLayer === "EXEC" ||
      asArray(capability.executiveDestinations).length > 0,
  );

  const projectedCapabilities = capabilities.filter(
    (capability) =>
      asArray(capability.executiveDestinations).some(
        (destination) =>
          normalizeText(destination).includes("projection"),
      ),
  );

  const workspaceCapabilities = capabilities.filter(
    (capability) =>
      asArray(capability.executiveDestinations).some(
        (destination) =>
          normalizeText(destination).includes("workspace"),
      ),
  );

  /**
   * A capability is structurally connected when its generated trace
   * confirms that the capability reaches the Executive Projection.
   *
   * Structural connection does not require the runtime collection to
   * contain data during the current investigation.
   *
   * This distinction is important for longitudinal capabilities such as
   * Prediction Outcome Evaluation, whose projection pathway can be valid
   * before a later investigation produces populated evaluation objects.
   */
  const structurallyConnectedCapabilityIds =
    projectedCapabilities
      .filter((capability) => {
        const trace = loadCapabilityTrace(capability.id);

        return (
          trace.pipelineCoverage?.projection === true ||
          trace.pipelineCoverage?.ui === true
        );
      })
      .map((capability) => capability.id);

  /**
   * UI visibility remains separately observable.
   *
   * This reports whether the trace found a direct presentation-layer
   * structural match. It does not determine whether the capability is
   * architecturally hidden.
   */
  const uiVisibleCapabilityIds = projectedCapabilities
    .filter((capability) => {
      const trace = loadCapabilityTrace(capability.id);

      return trace.pipelineCoverage?.ui === true;
    })
    .map((capability) => capability.id);

  /**
   * A capability is potentially hidden only when it declares an
   * Executive Projection destination but has neither:
   *
   * - a verified projection pathway, nor
   * - a verified UI pathway.
   *
   * Empty runtime data must not cause a connected capability to be
   * classified as hidden.
   */
  const hiddenCapabilityIds = projectedCapabilities
    .filter(
      (capability) =>
        !structurallyConnectedCapabilityIds.includes(
          capability.id,
        ),
    )
    .map((capability) => capability.id);

  const projectedButNotDisplayedCapabilityIds =
    structurallyConnectedCapabilityIds.filter(
      (capabilityId) =>
        !uiVisibleCapabilityIds.includes(capabilityId),
    );

  return {
    producedObjectCount: producedObjects.length,
    producedObjects,

    executiveCapabilityCount:
      executiveCapabilities.length,

    executiveCapabilityIds:
      executiveCapabilities.map(
        (capability) => capability.id,
      ),

    projectedCapabilityCount:
      projectedCapabilities.length,

    projectedCapabilityIds:
      projectedCapabilities.map(
        (capability) => capability.id,
      ),

    workspaceDeclaredCapabilityCount:
      workspaceCapabilities.length,

    workspaceDeclaredCapabilityIds:
      workspaceCapabilities.map(
        (capability) => capability.id,
      ),

    /**
     * Retained for compatibility with the sprint-startup renderer.
     *
     * "Structurally visible" now means the capability has a verified
     * Executive Projection or UI pathway. It does not mean the current
     * runtime contains populated objects.
     */
    structurallyVisibleCapabilityCount:
      structurallyConnectedCapabilityIds.length,

    structurallyVisibleCapabilityIds:
      structurallyConnectedCapabilityIds,

    structurallyConnectedCapabilityCount:
      structurallyConnectedCapabilityIds.length,

    structurallyConnectedCapabilityIds,

    uiVisibleCapabilityCount:
      uiVisibleCapabilityIds.length,

    uiVisibleCapabilityIds,

    projectedButNotDisplayedCapabilityCount:
      projectedButNotDisplayedCapabilityIds.length,

    projectedButNotDisplayedCapabilityIds,

    potentiallyHiddenCapabilityCount:
      hiddenCapabilityIds.length,

    potentiallyHiddenCapabilityIds:
      hiddenCapabilityIds,

    interpretation:
      "Structural connection is inferred from generated capability traces. A capability is considered connected when its Runtime-to-Executive-Projection pathway exists, even when its current runtime collection is empty. Direct UI presentation is tracked separately and does not determine whether the capability is architecturally hidden.",
  };
}

function deriveArchitectureGaps(capabilities, health) {
  const registeredDomains = new Set(
    capabilities.map((capability) => capability.domain),
  );

  const expectedDomains = [
    "PER",
    "UND",
    "MEM",
    "LRN",
    "ABS",
    "SYS",
    "PRD",
    "SIM",
    "ADP",
    "SELF",
  ];

  const unpopulatedDomains = expectedDomains.filter(
    (domain) => !registeredDomains.has(domain),
  );

  return {
    unpopulatedDomains,
    missingCapabilityIds: [],
    registryFailures: {
      duplicateIds: health.duplicateIdCount ?? 0,
      missingDependencies:
        health.missingDependencyCount ?? 0,
      missingCanonicalProducers:
        health.missingCanonicalProducerCount ?? 0,
      capabilitiesWithoutProducer:
        health.capabilitiesWithoutProducerCount ?? 0,
      capabilitiesWithoutConsumers:
        health.capabilitiesWithoutConsumersCount ?? 0,
      capabilitiesWithoutRuntimeDestination:
        health.capabilitiesWithoutRuntimeDestinationCount ?? 0,
      filesImplementingMultipleCapabilities:
        health.multiCapabilityFileCount ?? 0,
    },
    interpretation:
      "An unpopulated domain is an architectural coverage gap, not automatic permission to create a capability. Validate product need and overlap before implementation.",
  };
}

function deriveRecommendations({
  capabilities,
  intelligence,
  gaps,
  overlaps,
}) {
  const avoid = capabilities.map(
    (capability) =>
      `Do not recreate ${capability.name}; extend ${capability.id} unless a distinct responsibility is proven.`,
  );

  const capabilityIds = new Set(
    capabilities.map((capability) => capability.id),
  );

  const registeredDomains = new Set(
    capabilities.map((capability) => capability.domain),
  );

  const hasPredictionCapability =
    capabilityIds.has("CAP-PRD-001");

  const hasPredictionReflection =
    capabilityIds.has("CAP-PRD-002");

  const hasAdaptiveCapability =
    registeredDomains.has("ADP");

  let highestROI =
    "Continue validating and refining existing canonical capabilities.";

  let reason =
    "The registered architecture is healthy and should be extended before new capability creation.";

  let recommendedCapability = null;

  if (intelligence.potentiallyHiddenCapabilityCount > 0) {
    highestROI =
      "Expose intelligence already produced but not structurally visible in the Executive Workspace.";

    reason =
      `${intelligence.potentiallyHiddenCapabilityCount} projected capability ` +
      `${
        intelligence.potentiallyHiddenCapabilityCount === 1
          ? "appears"
          : "appear"
      } potentially hidden from the UI.`;
  } else if (
    hasPredictionCapability &&
    hasPredictionReflection &&
    !hasAdaptiveCapability
  ) {
    highestROI =
      "Evaluate Adaptive Prediction Evaluation as the next capability.";

    reason =
      "Discovery can produce and reflect on organizational predictions, but it does not yet have a registered adaptive capability that compares predictions with observed outcomes, measures calibration, and learns from prediction accuracy.";

    recommendedCapability = {
      proposedName: "Adaptive Prediction Evaluation",
      proposedDomain: "ADP",
      proposedCapabilityId: "CAP-ADP-001",
      status: "proposal-requires-review",

      responsibility:
        "Evaluate prior organizational predictions against later observed outcomes and convert prediction performance into confidence calibration and longitudinal learning.",

      proposedProducedObject:
        "PredictionEvaluation",

      extendsCapabilities: [
        "CAP-PRD-001",
        "CAP-PRD-002",
      ],

      requiredInputs: [
        "OrganizationalPrediction",
        "PredictionReflection",
        "Later organizational evidence or observed outcome",
      ],

      expectedOutputs: [
        "Prediction accuracy assessment",
        "Calibration adjustment",
        "Explanation of prediction success or failure",
        "Learning signal for future predictions",
      ],

      safeguards: [
        "Do not duplicate prediction generation.",
        "Do not duplicate prediction reflection.",
        "Confirm that outcome comparison is a distinct responsibility before registration.",
        "Define a distinct canonical producer and produced cognitive object.",
        "Connect the capability to Runtime, Executive Projection, Atlas, and longitudinal simulation where appropriate.",
      ],
    };
  } else if (gaps.unpopulatedDomains.length > 0) {
    highestROI =
      "Review remaining unpopulated cognitive domains only after validating a concrete product need.";

    reason =
      `The following domains have no registered capabilities: ${gaps.unpopulatedDomains.join(
        ", ",
      )}. Empty domains are structural review areas, not automatic implementation priorities.`;
  }

  return {
    highestROI,
    reason,
    recommendedCapability,

    requiredPreBuildChecks: [
      "Search the Cognitive Capability Registry.",
      "Search produced cognitive objects.",
      "Search canonical producers and implementation files.",
      "Review semantic overlap candidates.",
      "Determine whether the intelligence is already produced but hidden.",
      "Confirm the proposed responsibility is distinct from existing capabilities.",
      "Extend an existing capability unless a distinct responsibility is proven.",
    ],

    avoid,

    overlapReviewsRequired: overlaps.length,

    decisionRule:
      "Do not create a new capability when an existing capability already owns the responsibility, object, producer, or destination. Expose or extend existing intelligence first.",
  };
}

function calculateHealthScore(health) {
  const failureCounts = [
    health.duplicateIdCount ?? 0,
    health.missingDependencyCount ?? 0,
    health.missingCanonicalProducerCount ?? 0,
    health.capabilitiesWithoutProducerCount ?? 0,
    health.capabilitiesWithoutConsumersCount ?? 0,
    health.capabilitiesWithoutRuntimeDestinationCount ?? 0,
    health.multiCapabilityFileCount ?? 0,
  ];

  const totalFailures = failureCounts.reduce(
    (sum, value) => sum + value,
    0,
  );

  return Math.max(0, 100 - totalFailures * 10);
}

function buildArchitectureState() {
  const capabilityRegistry = loadJson(
    PATHS.capabilityRegistry,
    "Cognitive capability registry",
  );

  const fileRegistry = loadJson(
    PATHS.fileRegistry,
    "Cognitive file registry",
  );

  const capabilityAudit = loadJson(
    PATHS.capabilityAudit,
    "Cognitive capability audit",
  );

  const cognitiveObjectModel = readText(
    PATHS.cognitiveObjectModel,
  );

  const capabilities = asArray(
    capabilityRegistry.capabilities,
  );

  const fileEntries = asArray(
    fileRegistry.entries ?? fileRegistry.files,
  );

  const health = capabilityAudit.health ?? {};

  const sprintDocuments = findSprintDocuments();
  const project = deriveProjectState(sprintDocuments);

  const overlaps = findPotentialOverlaps(capabilities);

  const intelligence = deriveIntelligenceState(
    capabilities,
  );

  const gaps = deriveArchitectureGaps(
    capabilities,
    health,
  );

  const recommendations = deriveRecommendations({
    capabilities,
    intelligence,
    gaps,
    overlaps,
  });

  const capabilityStates = capabilities.map(
    buildCapabilityState,
  );

  const connectedTraceCount = capabilityStates.filter(
    (capability) =>
      capability.validation.capabilityTrace.connected === true,
  ).length;

  const state = {
    metadata: {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      generator:
        "scripts/cognition/generateArchitectureState.mjs",
      sourceOfTruthOrder: [
        "Verified source code",
        "COGNITIVE_CAPABILITY_REGISTRY.json",
        "COGNITIVE_FILE_REGISTRY.json",
        "COGNITIVE_CAPABILITY_AUDIT.json",
        "COGNITIVE_OBJECT_MODEL.md",
        "Sprint Update documents",
      ],
    },

    project,

    architecture: {
      status:
        calculateHealthScore(health) === 100
          ? "healthy"
          : "review-required",

      healthScore: calculateHealthScore(health),

      capabilityCount: capabilities.length,

      canonicalProducerCount:
        capabilities.filter(
          (capability) =>
            Boolean(capability.canonicalProducer),
        ).length,

      registeredFileCount: fileEntries.length,

      cognitiveObjectCount:
        intelligence.producedObjectCount,

      terminalCapabilityCount:
        capabilities.filter(
          (capability) =>
            capability.terminalCapability === true,
        ).length,

      capabilityTraceCount:
        capabilityStates.filter(
          (capability) =>
            capability.validation.capabilityTrace.exists,
        ).length,

      connectedCapabilityTraceCount:
        connectedTraceCount,

      health,
    },

    pipeline: {
      canonicalSequence: PIPELINE,

      rule:
        "Every new capability must connect to the canonical cognitive and executive pipeline or explicitly justify why it is independent.",

      currentCanonicalExecutivePath: [
        "Executive Assessment",
        "Executive Understanding Synthesis",
        "Organization Runtime",
        "Executive Projection",
        "Executive Workspace",
        "Atlas",
      ],
    },

    capabilities: capabilityStates,

    capabilityIndex: Object.fromEntries(
      capabilityStates.map((capability) => [
        capability.id,
        {
          name: capability.name,
          ownsObjects:
            capability.ownership.ownsObjects,
          canonicalProducer:
            capability.ownership
              .ownsCanonicalProducer,
          runtimeDestination:
            capability.destinations.runtime,
          executiveDestinations:
            capability.destinations.executive,
        },
      ]),
    ),

    intelligence,

    gaps,

    duplicateProtection: {
      potentialOverlaps: overlaps,

      exactDuplicateIdCount:
        health.duplicateIdCount ?? 0,

      multipleCanonicalProducerCount:
        health.missingCanonicalProducerCount ?? 0,

      filesImplementingMultipleCapabilities:
        health.multiCapabilityFileCount ?? 0,

      permanentRule:
        "Extend existing capabilities before creating new ones. A new capability requires a distinct responsibility, distinct produced object, distinct canonical producer, and justified position in the pipeline.",
    },

    recommendations,

    handoff: {
      canonicalFiles: [
        "docs/Architecture/DISCOVERY_ARCHITECTURE_STATE.json",
        "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
        "docs/Architecture/COGNITIVE_FILE_REGISTRY.json",
        "docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json",
        "docs/Architecture/COGNITIVE_OBJECT_MODEL.md",
        "docs/Sprint Updates/ARCHITECTURE_HANDOFF.md",
      ],

      startupInstructions: [
        "Read DISCOVERY_ARCHITECTURE_STATE.json first.",
        "Review current milestone, phase, and objective.",
        "Review capability ownership before proposing implementation.",
        "Review potentially hidden intelligence before building new cognition.",
        "Review overlap candidates before registering a new capability.",
        "Run validation before implementation.",
      ],
    },
  };

  fs.mkdirSync(path.dirname(PATHS.output), {
    recursive: true,
  });

  fs.writeFileSync(
    PATHS.output,
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8",
  );

  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    "DISCOVERY ARCHITECTURE STATE",
  );
  console.log(
    "=========================================",
  );
  console.log("");
  console.log(
    `Architecture health .......... ${state.architecture.healthScore}%`,
  );
  console.log(
    `Capabilities ................. ${state.architecture.capabilityCount}`,
  );
  console.log(
    `Canonical producers .......... ${state.architecture.canonicalProducerCount}`,
  );
  console.log(
    `Registered files ............. ${state.architecture.registeredFileCount}`,
  );
  console.log(
    `Cognitive objects ............ ${state.architecture.cognitiveObjectCount}`,
  );
  console.log(
    `Connected traces ............. ${state.architecture.connectedCapabilityTraceCount}/${state.architecture.capabilityTraceCount}`,
  );
  console.log("");
  console.log(
    `Executive capabilities ....... ${state.intelligence.executiveCapabilityCount}`,
  );
  console.log(
    `Projected capabilities ....... ${state.intelligence.projectedCapabilityCount}`,
  );
  console.log(
    `Structurally visible ......... ${state.intelligence.structurallyVisibleCapabilityCount}`,
  );
  console.log(
    `Potentially hidden ........... ${state.intelligence.potentiallyHiddenCapabilityCount}`,
  );
  console.log("");
  console.log(
    `Potential overlaps ........... ${state.duplicateProtection.potentialOverlaps.length}`,
  );
  console.log(
    `Unpopulated domains .......... ${state.gaps.unpopulatedDomains.length}`,
  );
  console.log("");
  console.log(
    `Highest ROI: ${state.recommendations.highestROI}`,
  );
  console.log(
    `Reason: ${state.recommendations.reason}`,
  );
  console.log("");
  console.log(
    `Output: ${path.relative(
      PROJECT_ROOT,
      PATHS.output,
    )}`,
  );
  console.log(
    "=========================================",
  );
}

try {
  buildArchitectureState();
} catch (error) {
  console.error("");
  console.error(
    "Architecture state generation failed.",
  );
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
}