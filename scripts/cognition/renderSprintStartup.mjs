import fs from "fs";
import path from "path";

const PROJECT_ROOT = process.cwd();

const PRODUCT_CANON_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Product",
  "PRODUCT_CANON.md",
);

const PRODUCT_STATE_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Product",
  "PRODUCT_STATE.md",
);

const ARCHITECTURE_STATE_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Architecture",
  "DISCOVERY_ARCHITECTURE_STATE.json",
);

const ARCHITECTURE_RECOMMENDATION_PROJECTION_PATH = path.join(
  PROJECT_ROOT,
  "docs",
  "Architecture",
  "ARCHITECTURE_RECOMMENDATION_PROJECTION.json",
);

function loadRequiredMarkdown(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf8").trim();
}

function loadArchitectureState() {
  if (!fs.existsSync(ARCHITECTURE_STATE_PATH)) {
    throw new Error(
      `Architecture state not found: ${ARCHITECTURE_STATE_PATH}`,
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(ARCHITECTURE_STATE_PATH, "utf8"),
    );
  } catch (error) {
    throw new Error(
      `Could not parse architecture state: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function loadArchitectureRecommendationProjection() {
  if (
    !fs.existsSync(
      ARCHITECTURE_RECOMMENDATION_PROJECTION_PATH,
    )
  ) {
    return null;
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        ARCHITECTURE_RECOMMENDATION_PROJECTION_PATH,
        "utf8",
      ),
    );
  } catch (error) {
    throw new Error(
      `Could not parse architecture recommendation projection: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactText(value, fallback = "Not declared") {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function truncate(value, maximumLength = 220) {
  const normalized = compactText(value);

  if (normalized.length <= maximumLength) {
    return normalized;
  }

  return `${normalized
    .slice(0, maximumLength - 3)
    .trim()}...`;
}

function statusIcon(condition) {
  return condition ? "✓" : "✗";
}

function printRule(character = "-", length = 57) {
  console.log(character.repeat(length));
}

function printMetric(label, value) {
  const width = 34;
  const normalizedLabel = String(label);

  const dots = ".".repeat(
    Math.max(
      1,
      width - normalizedLabel.length,
    ),
  );

  console.log(
    `${normalizedLabel} ${dots} ${value}`,
  );
}

function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function extractMarkdownSection(
  markdown,
  heading,
) {
  const pattern = new RegExp(
    `^# ${escapeRegExp(
      heading,
    )}\\s*$([\\s\\S]*?)(?=^# |\\Z)`,
    "m",
  );

  const match = markdown.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function extractFirstMarkdownSection(
  markdown,
  headings,
) {
  for (const heading of headings) {
    const section =
      extractMarkdownSection(
        markdown,
        heading,
      );

    if (section) {
      return section;
    }
  }

  return "";
}

function stripMarkdown(value) {
  return value
    .replace(/\*\*/g, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(
      /^```(?:text)?\s*$/gm,
      "",
    )
    .replace(/^```\s*$/gm, "")
    .replace(/^---$/gm, "")
    .trim();
}

function extractAndStripSection(
  markdown,
  headings,
) {
  return stripMarkdown(
    extractFirstMarkdownSection(
      markdown,
      headings,
    ),
  );
}

function printStartupReadingOrder() {
  const files = [
    "docs/Product/PRODUCT_CANON.md",
    "docs/Product/PRODUCT_STATE.md",
    "docs/Sprint Updates/DISCOVERY_SNAPSHOT.md",
    "docs/Architecture/DISCOVERY_ARCHITECTURE_STATE.json",
    "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
    "docs/Sprint Updates/PROJECT_STATE.md",
    "docs/Sprint Updates/NEXT_CHAT.md",
  ];

  console.log(
    "REQUIRED STARTUP READING",
  );
  console.log("");

  for (
    const [index, file] of
    files.entries()
  ) {
    console.log(
      `${index + 1}. ${file}`,
    );
  }

  console.log("");

  console.log(
    "Product Canon defines what Discovery is.",
  );

  console.log(
    "Product State defines the current product.",
  );

  console.log(
    "Sprint documents define current implementation priorities.",
  );

  console.log(
    "Architecture supports the product and should expand only when benchmark evidence proves a genuine gap.",
  );

  console.log("");
}

function printProductCanon(productCanon) {
  const mission =
    extractAndStripSection(
      productCanon,
      ["Mission"],
    );

  const productPhilosophy =
    extractAndStripSection(
      productCanon,
      ["Product Philosophy"],
    );

  const operatingModel =
    extractAndStripSection(
      productCanon,
      ["The Operating Model"],
    );

  const executiveWork =
    extractAndStripSection(
      productCanon,
      ["Executive Work"],
    );

  const executiveLearningCycle =
    extractAndStripSection(
      productCanon,
      [
        "Executive Learning Cycle",
        "Unified Executive Work Lifecycle",
      ],
    );

  const executiveConversation =
    extractAndStripSection(
      productCanon,
      ["The Executive Conversation"],
    );

  console.log("PRODUCT CANON");
  console.log("");

  console.log("Mission");
  console.log(truncate(mission, 360));
  console.log("");

  console.log("Product Identity");
  console.log(
    truncate(
      productPhilosophy,
      420,
    ),
  );
  console.log("");

  console.log("Operating Model");
  console.log(
    truncate(
      operatingModel,
      500,
    ),
  );
  console.log("");

  console.log("Executive Work");
  console.log(
    truncate(
      executiveWork,
      500,
    ),
  );
  console.log("");

  console.log(
    "Executive Learning Cycle",
  );
  console.log(
    truncate(
      executiveLearningCycle,
      500,
    ),
  );
  console.log("");

  console.log(
    "Executive Conversation",
  );
  console.log(
    truncate(
      executiveConversation,
      500,
    ),
  );
  console.log("");
}

function printProductState(productState) {
  const identity =
    extractAndStripSection(
      productState,
      ["Product Identity"],
    );

  const operatingModel =
    extractAndStripSection(
      productState,
      ["Operating Model"],
    );

  const currentProductLifecycle =
    extractAndStripSection(
      productState,
      [
        "Current Product Lifecycle",
        "Current MVP",
      ],
    );

  const currentFocus =
    extractAndStripSection(
      productState,
      ["Current Product Focus"],
    );

  const validationGoal =
    extractAndStripSection(
      productState,
      ["Current Validation Goal"],
    );

  const principles =
    extractAndStripSection(
      productState,
      ["Current Product Principles"],
    );

  console.log(
    "CURRENT PRODUCT STATE",
  );
  console.log("");

  console.log("Identity");
  console.log(
    truncate(identity, 420),
  );
  console.log("");

  console.log("Operating Model");
  console.log(
    truncate(
      operatingModel,
      500,
    ),
  );
  console.log("");

  console.log(
    "Current Product Lifecycle",
  );
  console.log(
    truncate(
      currentProductLifecycle,
      700,
    ),
  );
  console.log("");

  console.log("Current Focus");
  console.log(
    truncate(
      currentFocus,
      500,
    ),
  );
  console.log("");

  console.log(
    "Validation Objective",
  );
  console.log(
    truncate(
      validationGoal,
      500,
    ),
  );
  console.log("");

  console.log(
    "Product Principles",
  );
  console.log(
    truncate(
      principles,
      420,
    ),
  );
  console.log("");
}

function printSprintReadiness(state) {
  const health =
    state.architecture
      ?.healthScore ?? 0;

  const registryHealthy =
    (
      state.architecture
        ?.health
        ?.duplicateIdCount ?? 0
    ) === 0 &&
    (
      state.architecture
        ?.health
        ?.missingDependencyCount ??
      0
    ) === 0 &&
    (
      state.architecture
        ?.health
        ?.missingCanonicalProducerCount ??
      0
    ) === 0 &&
    (
      state.architecture
        ?.health
        ?.capabilitiesWithoutProducerCount ??
      0
    ) === 0 &&
    (
      state.architecture
        ?.health
        ?.capabilitiesWithoutConsumersCount ??
      0
    ) === 0 &&
    (
      state.architecture
        ?.health
        ?.capabilitiesWithoutRuntimeDestinationCount ??
      0
    ) === 0;

  const ready =
    health === 100 &&
    registryHealthy;

  console.log(
    "SPRINT READINESS",
  );
  console.log("");

  console.log(
    ready
      ? "Status ............... READY"
      : "Status ............... REVIEW REQUIRED",
  );

  console.log("");

  if (ready) {
    console.log(
      "Discovery is ready for implementation.",
    );
  } else {
    console.log(
      "Resolve architectural validation before beginning implementation.",
    );
  }

  console.log("");

  return ready;
}

function printExecutiveSummary(
  state,
  ready,
) {
  const project = state.project ?? {};

  console.log(
    "EXECUTIVE SUMMARY",
  );
  console.log("");

  console.log(
    "Discovery has completed the first generation of its Executive Cognitive Operating System.",
  );

  console.log("");

  console.log(
    "The Executive Work lifecycle is implemented, integrated, and benchmark validated.",
  );

  console.log("");

  console.log(
    "The Operating Model is the foundation behind understanding, recommendations, simulations, Executive Work, review, learning, and future executive judgment.",
  );

  console.log("");

  console.log(
    "Architecture is stable.",
  );

  console.log(
    "The current objective is continuously improving executive judgment quality through recommendation refinement, confidence calibration, executive communication, Executive Learning, and Operating Model improvement.",
  );

  console.log("");

  if (!ready) {
    console.log(
      "Architectural validation requires attention before implementation continues.",
    );

    console.log("");
  }

  if (project.nextPriority) {
    console.log(
      "Highest Priority",
    );

    console.log(
      truncate(
        project.nextPriority,
        280,
      ),
    );
  }

  console.log("");
}

function capabilityNamesById(
  state,
  capabilityIds,
) {
  const capabilityMap = new Map(
    asArray(state.capabilities).map(
      (capability) => [
        capability.id,
        capability.name,
      ],
    ),
  );

  return capabilityIds.map(
    (capabilityId) =>
      capabilityMap.get(
        capabilityId,
      ) ?? capabilityId,
  );
}

function printProjectState(state) {
  const project = state.project ?? {};

  console.log(
    "CURRENT IMPLEMENTATION",
  );
  console.log("");

  console.log("Milestone");
  console.log(
    truncate(
      project.currentMilestone,
      280,
    ),
  );
  console.log("");

  console.log(
    "Development Phase",
  );
  console.log(
    truncate(
      project.currentPhase,
      280,
    ),
  );
  console.log("");

  console.log(
    "Current Objective",
  );
  console.log(
    truncate(
      project.currentObjective,
      420,
    ),
  );
  console.log("");

  if (project.currentSprint) {
    console.log(
      "Current Sprint",
    );

    console.log(
      truncate(
        project.currentSprint,
        220,
      ),
    );

    console.log("");
  }

  if (project.nextPriority) {
    console.log(
      "Next Priority",
    );

    console.log(
      truncate(
        project.nextPriority,
        280,
      ),
    );

    console.log("");
  }
}

function printArchitectureHealth(state) {
  const architecture =
    state.architecture ?? {};

  const health =
    architecture.health ?? {};

  console.log(
    "ARCHITECTURE HEALTH",
  );
  console.log("");

  printMetric(
    "Architecture health",
    `${
      architecture.healthScore ??
      0
    }%`,
  );

  printMetric(
    "Registered capabilities",
    architecture.capabilityCount ??
      0,
  );

  printMetric(
    "Canonical producers",
    architecture.canonicalProducerCount ??
      0,
  );

  printMetric(
    "Registered files",
    architecture.registeredFileCount ??
      0,
  );

  printMetric(
    "Cognitive objects",
    architecture.cognitiveObjectCount ??
      0,
  );

  printMetric(
    "Connected traces",
    `${
      architecture.connectedCapabilityTraceCount ??
      0
    }/${
      architecture.capabilityTraceCount ??
      0
    }`,
  );

  console.log("");

  printMetric(
    "Duplicate capability IDs",
    health.duplicateIdCount ?? 0,
  );

  printMetric(
    "Missing dependencies",
    health.missingDependencyCount ??
      0,
  );

  printMetric(
    "Missing canonical producers",
    health.missingCanonicalProducerCount ??
      0,
  );

  printMetric(
    "Capabilities without producer",
    health.capabilitiesWithoutProducerCount ??
      0,
  );

  printMetric(
    "Capabilities without consumers",
    health.capabilitiesWithoutConsumersCount ??
      0,
  );

  printMetric(
    "Missing Runtime destinations",
    health.capabilitiesWithoutRuntimeDestinationCount ??
      0,
  );

  printMetric(
    "Multi-capability files",
    health.multiCapabilityFileCount ??
      0,
  );

  console.log("");
}

function printIntelligenceExtraction(
  state,
) {
  const intelligence =
    state.intelligence ?? {};

  console.log(
    "INTELLIGENCE EXTRACTION",
  );
  console.log("");

  printMetric(
    "Produced cognitive objects",
    intelligence.producedObjectCount ??
      0,
  );

  printMetric(
    "Executive capabilities",
    intelligence.executiveCapabilityCount ??
      0,
  );

  printMetric(
    "Projected capabilities",
    intelligence.projectedCapabilityCount ??
      0,
  );

  printMetric(
    "Structurally visible",
    intelligence.structurallyVisibleCapabilityCount ??
      0,
  );

  printMetric(
    "Potentially hidden",
    intelligence.potentiallyHiddenCapabilityCount ??
      0,
  );

  const hiddenIds = asArray(
    intelligence.potentiallyHiddenCapabilityIds,
  );

  if (hiddenIds.length > 0) {
    console.log("");

    console.log(
      "Potentially Hidden Intelligence",
    );

    console.log("");

    for (
      const capabilityName of
      capabilityNamesById(
        state,
        hiddenIds,
      )
    ) {
      console.log(
        `- ${capabilityName}`,
      );
    }
  }

  console.log("");
}

function printCanonicalPipeline(state) {
  const pipeline =
    state.pipeline
      ?.canonicalSequence ?? [];

  console.log(
    "CANONICAL PIPELINE",
  );
  console.log("");

  for (
    const [index, stage] of
    pipeline.entries()
  ) {
    console.log(stage);

    if (
      index <
      pipeline.length - 1
    ) {
      console.log("↓");
    }
  }

  console.log("");
}

function printDoNotRebuild(state) {
  const capabilities =
    asArray(state.capabilities);

  console.log(
    "DO NOT REBUILD",
  );
  console.log("");

  console.log(
    "The following capabilities already exist and must be extended rather than recreated:",
  );

  console.log("");

  for (
    const capability of
    capabilities
  ) {
    const ownedObjects =
      asArray(
        capability.ownership
          ?.ownsObjects,
      );

    console.log(
      `${statusIcon(true)} ${
        capability.name
      } (${capability.id})`,
    );

    if (ownedObjects.length > 0) {
      console.log(
        `  Owns: ${ownedObjects.join(
          ", ",
        )}`,
      );
    }

    if (
      capability.ownership
        ?.ownsCanonicalProducer
    ) {
      console.log(
        `  Producer: ${capability.ownership.ownsCanonicalProducer}`,
      );
    }
  }

  console.log("");
}

function printDuplicateProtection(state) {
  const duplicateProtection =
    state.duplicateProtection ??
    {};

  const overlaps = asArray(
    duplicateProtection.potentialOverlaps,
  );

  console.log(
    "DUPLICATE-WORK PROTECTION",
  );
  console.log("");

  printMetric(
    "Potential overlaps",
    overlaps.length,
  );

  printMetric(
    "Duplicate IDs",
    duplicateProtection.exactDuplicateIdCount ??
      0,
  );

  printMetric(
    "Files with multiple capabilities",
    duplicateProtection.filesImplementingMultipleCapabilities ??
      0,
  );

  if (overlaps.length > 0) {
    console.log("");

    console.log(
      "Overlap Reviews Required",
    );

    console.log("");

    for (
      const overlap of overlaps
    ) {
      console.log(
        `- ${overlap.leftCapabilityName} ↔ ${overlap.rightCapabilityName}`,
      );

      console.log(
        `  Similarity: ${Math.round(
          (
            overlap.semanticSimilarity ??
            0
          ) * 100,
        )}%`,
      );

      if (
        asArray(
          overlap.sharedProducedObjects,
        ).length > 0
      ) {
        console.log(
          `  Shared objects: ${overlap.sharedProducedObjects.join(
            ", ",
          )}`,
        );
      }
    }
  }

  console.log("");

  console.log(
    compactText(
      duplicateProtection.permanentRule,
      "Extend existing capabilities before creating new ones.",
    ),
  );

  console.log("");
}

function printArchitectureGaps(state) {
  const gaps = state.gaps ?? {};

  const unpopulatedDomains =
    asArray(
      gaps.unpopulatedDomains,
    );

  console.log(
    "ARCHITECTURE GAPS",
  );
  console.log("");

  if (
    unpopulatedDomains.length ===
    0
  ) {
    console.log(
      "No unpopulated cognitive domains were detected.",
    );
  } else {
    console.log(
      "Domains without registered capabilities:",
    );

    console.log("");

    for (
      const domain of
      unpopulatedDomains
    ) {
      console.log(`- ${domain}`);
    }

    console.log("");

    console.log(
      "These are review areas, not automatic permission to build new capabilities.",
    );
  }

  console.log("");
}

function printRecommendation(
  state,
  recommendationProjection,
) {
  const sprintBrief =
    recommendationProjection
      ?.sprintBrief;

  const recommendations =
    state.recommendations ?? {};

  const recommendation =
    sprintBrief?.recommendation ??
    recommendations.highestROI;

  const reason =
    sprintBrief?.reason ??
    recommendations.reason;

  console.log(
    "ARCHITECTURAL RECOMMENDATION",
  );
  console.log("");

  console.log(
    compactText(
      recommendation,
      "Continue refining existing capabilities.",
    ),
  );

  if (
    typeof sprintBrief?.score ===
    "number"
  ) {
    console.log("");

    printMetric(
      "Priority score",
      sprintBrief.score,
    );
  }

  console.log("");

  console.log("Reason");

  console.log(
    compactText(
      reason,
      "Expose, orchestrate, and refine existing intelligence before creating new reasoning architecture.",
    ),
  );

  const prerequisites =
    asArray(
      sprintBrief?.prerequisites,
    );

  if (
    prerequisites.length > 0
  ) {
    console.log("");

    console.log(
      "Prerequisites",
    );

    for (
      const prerequisite of
      prerequisites
    ) {
      console.log(
        `- ${prerequisite}`,
      );
    }
  }

  const blockers = asArray(
    sprintBrief?.blockers,
  );

  if (blockers.length > 0) {
    console.log("");

    console.log(
      "Current Blockers",
    );

    for (
      const blocker of
      blockers
    ) {
      console.log(`- ${blocker}`);
    }
  }

  console.log("");
}

function printPreBuildGate(state) {
  const checks = asArray(
    state.recommendations
      ?.requiredPreBuildChecks,
  );

  console.log(
    "BEFORE BUILDING ANYTHING",
  );
  console.log("");

  for (
    const [index, check] of
    checks.entries()
  ) {
    console.log(
      `${index + 1}. ${check}`,
    );
  }

  console.log("");

  console.log("Decision Rule");

  console.log(
    compactText(
      state.recommendations
        ?.decisionRule,
      "Do not create a new capability when an existing one already owns the responsibility.",
    ),
  );

  console.log("");
}

function printStartupDocuments(state) {
  const architectureFiles =
    asArray(
      state.handoff
        ?.canonicalFiles,
    );

  const productFiles = [
    "docs/Product/PRODUCT_CANON.md",
    "docs/Product/PRODUCT_STATE.md",
    "docs/Product/PRODUCT_PRINCIPLES.md",
    "docs/Product/EXECUTIVE_WORK_OBJECT.md",
    "docs/Product/PRODUCT_FLYWHEEL.md",
  ];

  const files = [
    ...new Set([
      ...productFiles,
      ...architectureFiles,
    ]),
  ];

  console.log(
    "CANONICAL STARTUP FILES",
  );
  console.log("");

  for (const file of files) {
    console.log(`- ${file}`);
  }

  console.log("");
}

function renderSprintStartup() {
  const productCanon =
    loadRequiredMarkdown(
      PRODUCT_CANON_PATH,
      "Product canon",
    );

  const productState =
    loadRequiredMarkdown(
      PRODUCT_STATE_PATH,
      "Product state",
    );

  const state =
    loadArchitectureState();

  const architectureRecommendationProjection =
    loadArchitectureRecommendationProjection();

  console.log("");

  printRule("=");

  console.log(
    "DISCOVERY SPRINT STARTUP",
  );

  printRule("=");

  console.log("");

  console.log(
    `Architecture State Generated: ${
      state.metadata
        ?.generatedAt ?? "Unknown"
    }`,
  );

  console.log("");

  printRule();
  console.log("");

  printStartupReadingOrder();

  printRule();
  console.log("");

  printProductCanon(productCanon);

  printRule();
  console.log("");

  printProductState(productState);

  printRule();
  console.log("");

  const ready =
    printSprintReadiness(state);

  printRule();
  console.log("");

  printExecutiveSummary(
    state,
    ready,
  );

  printRule();
  console.log("");

  printProjectState(state);

  printRule();
  console.log("");

  printArchitectureHealth(state);

  printRule();
  console.log("");

  printIntelligenceExtraction(
    state,
  );

  printRule();
  console.log("");

  printCanonicalPipeline(state);

  printRule();
  console.log("");

  printDoNotRebuild(state);

  printRule();
  console.log("");

  printDuplicateProtection(state);

  printRule();
  console.log("");

  printArchitectureGaps(state);

  printRule();
  console.log("");

  printRecommendation(
    state,
    architectureRecommendationProjection,
  );

  printRule();
  console.log("");

  printPreBuildGate(state);

  printRule();
  console.log("");

  printStartupDocuments(state);

  printRule("=");

  console.log(
    "STARTUP COMPLETE",
  );

  printRule("=");

  console.log("");
}

try {
  renderSprintStartup();
} catch (error) {
  console.error("");

  console.error(
    "Sprint startup rendering failed.",
  );

  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
}