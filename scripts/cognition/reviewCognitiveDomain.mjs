import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const CURRENT_DIRECTORY = path.dirname(CURRENT_FILE);
const PROJECT_ROOT = path.resolve(
  CURRENT_DIRECTORY,
  "../..",
);

const PATHS = {
  capabilityRegistry: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_CAPABILITY_REGISTRY.json",
  ),

  architectureState: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "DISCOVERY_ARCHITECTURE_STATE.json",
  ),

  domainRegistry: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "COGNITIVE_DOMAIN_REGISTRY.md",
  ),

  outputDirectory: path.join(
    PROJECT_ROOT,
    "docs",
    "Architecture",
    "Domain Reviews",
  ),
};

const DOMAIN_DEFINITIONS = {
  PER: {
    id: "PER",
    name: "Perception",
    purpose:
      "Transform incoming organizational material into structured evidence and observations.",
    relatedDomains: ["UND"],
    likelyCapabilityIds: [
      "CAP-PER-001",
      "CAP-PER-002",
    ],
    reviewQuestion:
      "Does Discovery adequately transform organizational material into reliable evidence and observations?",
  },

  UND: {
    id: "UND",
    name: "Understanding",
    purpose:
      "Transform evidence and observations into mechanisms, beliefs, theories, conditions, assessments, and persistent organizational understanding.",
    relatedDomains: [
      "PER",
      "MEM",
      "LRN",
      "SELF",
    ],
    likelyCapabilityIds: [
      "CAP-UND-001",
      "CAP-UND-002",
      "CAP-UND-003",
      "CAP-UND-004",
      "CAP-UND-005",
      "CAP-UND-006",
    ],
    reviewQuestion:
      "Does Discovery produce a coherent progression from evidence to executive organizational understanding?",
  },

  MEM: {
    id: "MEM",
    name: "Memory",
    purpose:
      "Preserve organizational cognition and continuity across investigations.",
    relatedDomains: ["UND", "LRN", "ADP"],
    likelyCapabilityIds: ["CAP-MEM-001"],
    reviewQuestion:
      "Does Discovery preserve and retrieve enough organizational cognition to support longitudinal understanding?",
  },

  LRN: {
    id: "LRN",
    name: "Learning",
    purpose:
      "Revise and evaluate organizational understanding through accumulated experience.",
    relatedDomains: [
      "MEM",
      "UND",
      "SELF",
      "ADP",
    ],
    likelyCapabilityIds: [
      "CAP-LRN-001",
      "CAP-LRN-002",
    ],
    reviewQuestion:
      "Does Discovery measurably improve its organizational understanding across investigations?",
  },

  SELF: {
    id: "SELF",
    name: "Self-Reflection",
    purpose:
      "Inspect the strength, uncertainty, alternatives, and incompleteness of Discovery's own understanding.",
    relatedDomains: ["UND", "LRN", "ADP"],
    likelyCapabilityIds: [
      "CAP-SELF-001",
      "CAP-SELF-002",
    ],
    reviewQuestion:
      "Can Discovery explain why it believes its current theory and determine what it should learn next?",
  },

  ABS: {
    id: "ABS",
    name: "Abstraction",
    purpose:
      "Convert recurring lower-level organizational patterns into reusable higher-order concepts and models.",
    relatedDomains: ["UND", "SYS"],
    likelyCapabilityIds: [
      "CAP-UND-001",
      "CAP-UND-003",
      "CAP-UND-006",
    ],
    reviewQuestion:
      "Is abstraction already embedded in concepts, mechanisms, theories, patterns, compression, and understanding synthesis?",
    likelyExistingObjects: [
      "OrganizationalMechanism",
      "OrganizationalTheory",
      "OrganizationalUnderstanding",
    ],
    candidateObject: "OrganizationalAbstraction",
  },

  SYS: {
    id: "SYS",
    name: "Systems Reasoning",
    purpose:
      "Model the organization as an interacting system with dependencies, feedback, leverage points, and second-order effects.",
    relatedDomains: [
      "UND",
      "ABS",
      "PRD",
      "SIM",
    ],
    likelyCapabilityIds: [
      "CAP-UND-001",
      "CAP-UND-003",
      "CAP-UND-004",
      "CAP-UND-005",
    ],
    reviewQuestion:
      "Do mechanisms, theories, conditions, state, and reasoning graphs already provide sufficient systems reasoning?",
    likelyExistingObjects: [
      "OrganizationalMechanism",
      "OrganizationalTheory",
      "OrganizationalCondition",
      "ExecutiveAssessment",
    ],
    candidateObject: "OrganizationalSystemModel",
  },

  PRD: {
    id: "PRD",
    name: "Prediction",
    purpose:
      "Estimate likely future organizational outcomes from current conditions, mechanisms, trends, and accumulated evidence.",
    relatedDomains: [
      "SYS",
      "SIM",
      "LRN",
      "ADP",
    ],
    likelyCapabilityIds: [
      "CAP-UND-003",
      "CAP-UND-004",
      "CAP-UND-005",
      "CAP-LRN-002",
    ],
    reviewQuestion:
      "Does Discovery make genuine calibrated forecasts, or only describe current conditions and possible implications?",
    likelyExistingObjects: [
      "OrganizationalTheory",
      "OrganizationalCondition",
      "ExecutiveAssessment",
      "OrganizationalLearningProfile",
    ],
    candidateObject: "OrganizationalForecast",
  },

  SIM: {
    id: "SIM",
    name: "Simulation",
    purpose:
      "Test Discovery's organizational understanding against hypothetical scenarios, interventions, and alternative futures.",
    relatedDomains: [
      "SYS",
      "PRD",
      "ADP",
    ],
    likelyCapabilityIds: [
      "CAP-UND-005",
      "CAP-SELF-001",
      "CAP-SELF-002",
    ],
    reviewQuestion:
      "Is simulation a cognitive capability, a validation environment, a product capability, or some combination of these?",
    likelyExistingObjects: [
      "ExecutiveAssessment",
      "TheoryValidation",
      "InvestigationOpportunity",
    ],
    candidateObject: "OrganizationalSimulationResult",
  },

  ADP: {
    id: "ADP",
    name: "Adaptation",
    purpose:
      "Change how Discovery learns, prioritizes evidence, calibrates confidence, and directs future reasoning based on accumulated experience.",
    relatedDomains: [
      "MEM",
      "LRN",
      "SELF",
      "UND",
    ],
    likelyCapabilityIds: [
      "CAP-MEM-001",
      "CAP-LRN-001",
      "CAP-LRN-002",
      "CAP-SELF-001",
      "CAP-SELF-002",
      "CAP-UND-006",
    ],
    reviewQuestion:
      "Does Discovery change only its conclusions, or does it also change how it learns and investigates?",
    likelyExistingObjects: [
      "OrganizationRuntime",
      "OrganizationalBeliefRevision",
      "OrganizationalLearningProfile",
      "TheoryValidation",
      "InvestigationOpportunity",
      "OrganizationalUnderstandingState",
    ],
    candidateObject: "InvestigationStrategyRevision",
  },
};

function normalizePath(value) {
  return String(value ?? "")
    .replaceAll("\\", "/")
    .trim();
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${label} not found: ${normalizePath(
        path.relative(PROJECT_ROOT, filePath),
      )}`,
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    );
  } catch (error) {
    throw new Error(
      `Unable to parse ${label}: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    );
  }
}

function capabilityEntriesFromRegistry(registry) {
  if (!registry || typeof registry !== "object") {
    return [];
  }

  if (Array.isArray(registry.capabilities)) {
    return registry.capabilities;
  }

  if (Array.isArray(registry.entries)) {
    return registry.entries;
  }

  return [];
}

function normalizeComparable(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function capabilityDomain(capability) {
  return (
    capability.domain ??
    capability.cognitiveDomain ??
    null
  );
}

function capabilityName(capability) {
  return (
    capability.name ??
    capability.capabilityName ??
    capability.displayName ??
    capability.id ??
    "Unnamed Capability"
  );
}

function capabilityProduces(capability) {
  return asArray(
    capability.producesObjects ??
      capability.produces ??
      capability.producedObjects ??
      capability.producedCognitiveObjects,
  );
}

function capabilityConsumes(capability) {
  return asArray(
    capability.consumes ??
      capability.consumedObjects ??
      capability.consumedCognitiveObjects,
  );
}

function capabilityConsumers(capability) {
  return asArray(
    capability.consumedByCapabilities ??
      capability.consumers ??
      capability.declaredConsumers,
  );
}

function capabilityDependencies(capability) {
  return asArray(
    capability.consumesCapabilities ??
      capability.dependencies ??
      capability.capabilityDependencies,
  );
}

function capabilityImplementationFiles(capability) {
  return asArray(
    capability.implementationFiles ??
      capability.files,
  );
}

function findCapabilityById(capabilities, id) {
  const normalizedId = normalizeComparable(id);

  return capabilities.find(
    (capability) =>
      normalizeComparable(capability.id) ===
      normalizedId,
  );
}

function capabilitiesForDomain(
  capabilities,
  definition,
) {
  const direct = capabilities.filter(
    (capability) =>
      capabilityDomain(capability) === definition.id,
  );

  const related = definition.likelyCapabilityIds
    .map((id) =>
      findCapabilityById(capabilities, id),
    )
    .filter(Boolean);

  const combined = [
    ...direct,
    ...related,
  ];

  const seen = new Set();

  return combined.filter((capability) => {
    const id =
      capability.id ??
      capabilityName(capability);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);
    return true;
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectProducedObjects(capabilities) {
  return unique(
    capabilities.flatMap((capability) =>
      capabilityProduces(capability),
    ),
  );
}

function collectConsumedObjects(capabilities) {
  return unique(
    capabilities.flatMap((capability) =>
      capabilityConsumes(capability),
    ),
  );
}

function collectImplementationFiles(capabilities) {
  return unique(
    capabilities.flatMap((capability) =>
      capabilityImplementationFiles(capability),
    ),
  );
}

function determineCoverage({
  definition,
  directCapabilities,
  relatedCapabilities,
  producedObjects,
}) {
  if (directCapabilities.length > 0) {
    return {
      status: "Covered",
      score: 100,
      rationale:
        `${directCapabilities.length} canonical ` +
        `${directCapabilities.length === 1 ? "capability is" : "capabilities are"} ` +
        `registered directly in the ${definition.id} domain.`,
    };
  }

  const expectedObjects =
    definition.likelyExistingObjects ?? [];

  const matchedExpectedObjects =
    expectedObjects.filter((objectName) =>
      producedObjects.some(
        (producedObject) =>
          normalizeComparable(producedObject) ===
          normalizeComparable(objectName),
      ),
    );

  if (
    relatedCapabilities.length >= 3 ||
    matchedExpectedObjects.length >= 3
  ) {
    return {
      status: "Partial",
      score: 70,
      rationale:
        "Multiple existing capabilities and cognitive objects appear to perform parts of this domain's responsibility, but ownership is distributed.",
    };
  }

  if (
    relatedCapabilities.length > 0 ||
    matchedExpectedObjects.length > 0
  ) {
    return {
      status: "Partial",
      score: 45,
      rationale:
        "Some existing capabilities appear relevant, but the domain is not yet explicitly or comprehensively owned.",
    };
  }

  return {
    status: "Review Required",
    score: 15,
    rationale:
      "No direct capability and little verified overlapping coverage were found.",
  };
}

function determineRecommendation({
  definition,
  coverage,
  directCapabilities,
  relatedCapabilities,
}) {
  if (coverage.status === "Covered") {
    return {
      decision:
        "Covered by existing capabilities",
      recommendation:
        `Continue extending the existing ${definition.id} capabilities. Do not create a new capability unless a distinct cognitive responsibility and object are proven.`,
    };
  }

  if (
    definition.id === "ADP" &&
    relatedCapabilities.length > 0
  ) {
    return {
      decision:
        "Extend existing capabilities",
      recommendation:
        "Do not create a standalone Adaptation capability yet. First determine whether existing Learning, Memory, Self-Reflection, and Understanding capabilities change Discovery's future reasoning strategy rather than only updating conclusions.",
    };
  }

  if (definition.id === "SIM") {
    return {
      decision:
        "Defer architectural classification",
      recommendation:
        "Determine whether Atlas and benchmark simulation are validation infrastructure, product-facing cognition, or both before registering a Simulation capability.",
    };
  }

  if (definition.id === "PRD") {
    return {
      decision:
        "Defer until more evidence exists",
      recommendation:
        "Do not register Prediction until Discovery can produce calibrated, time-bounded forecasts that can be evaluated against longitudinal outcomes.",
    };
  }

  if (
    definition.id === "ABS" ||
    definition.id === "SYS"
  ) {
    return {
      decision:
        "Audit existing implementations",
      recommendation:
        "Trace the relevant mechanisms, theories, conditions, concepts, graphs, and understanding structures before deciding whether a distinct capability is necessary.",
    };
  }

  if (
    directCapabilities.length === 0 &&
    relatedCapabilities.length === 0
  ) {
    return {
      decision:
        "Review product need",
      recommendation:
        "Define the missing cognitive transformation and proposed cognitive object before considering a new capability.",
    };
  }

  return {
    decision:
      "Extend existing capabilities",
    recommendation:
      "Existing capabilities provide partial coverage. Prefer extending them before registering a new domain-specific capability.",
  };
}

function scorecardDimensionsForDomain(domainId) {
  const map = {
    PER: [
      "Perception",
      "Explainability",
    ],

    UND: [
      "Compression",
      "Integration",
      "Explainability",
      "Executive Utility",
      "Emergence",
    ],

    MEM: [
      "Continuity",
      "Learning Intelligence",
    ],

    LRN: [
      "Adaptation",
      "Continuity",
      "Learning Intelligence",
      "Emergence",
    ],

    SELF: [
      "Explainability",
      "Adaptation",
      "Learning Intelligence",
      "Executive Utility",
    ],

    ABS: [
      "Compression",
      "Integration",
      "Emergence",
    ],

    SYS: [
      "Integration",
      "Emergence",
      "Executive Utility",
    ],

    PRD: [
      "Adaptation",
      "Executive Utility",
      "Learning Intelligence",
    ],

    SIM: [
      "Adaptation",
      "Explainability",
      "Executive Utility",
      "Learning Intelligence",
    ],

    ADP: [
      "Adaptation",
      "Continuity",
      "Learning Intelligence",
      "Emergence",
    ],
  };

  return map[domainId] ?? [];
}

function buildDomainReview({
  definition,
  capabilities,
  architectureState,
}) {
  const directCapabilities = capabilities.filter(
    (capability) =>
      capabilityDomain(capability) ===
      definition.id,
  );

  const relatedCapabilities =
    capabilitiesForDomain(
      capabilities,
      definition,
    ).filter(
      (capability) =>
        capabilityDomain(capability) !==
        definition.id,
    );

  const allRelevantCapabilities = unique([
    ...directCapabilities,
    ...relatedCapabilities,
  ]);

  const producedObjects =
    collectProducedObjects(
      allRelevantCapabilities,
    );

  const consumedObjects =
    collectConsumedObjects(
      allRelevantCapabilities,
    );

  const implementationFiles =
    collectImplementationFiles(
      allRelevantCapabilities,
    );

  const coverage = determineCoverage({
    definition,
    directCapabilities,
    relatedCapabilities,
    producedObjects,
  });

  const recommendation =
    determineRecommendation({
      definition,
      coverage,
      directCapabilities,
      relatedCapabilities,
    });

  const unpopulatedDomains = asArray(
    architectureState?.gaps?.unpopulatedDomains,
  );

  return {
    generatedAt: new Date().toISOString(),

    domain: {
      id: definition.id,
      name: definition.name,
      purpose: definition.purpose,
      reviewQuestion:
        definition.reviewQuestion,
      relatedDomains:
        definition.relatedDomains,
    },

    architecture: {
      currentlyRegistered:
        directCapabilities.length > 0,

      reportedAsUnpopulated:
        unpopulatedDomains.includes(
          definition.id,
        ),

      architectureHealth:
        architectureState?.healthScore ??
        architectureState?.architectureHealth ??
        null,
    },

    coverage,

    directCapabilities:
      directCapabilities.map(
        (capability) => ({
          id: capability.id ?? null,
          name: capabilityName(capability),
          domain:
            capabilityDomain(capability),
          produces:
            capabilityProduces(capability),
          consumes:
            capabilityConsumes(capability),
          consumers:
            capabilityConsumers(capability),
          dependencies:
            capabilityDependencies(capability),
          canonicalProducer:
            capability.canonicalProducer ??
            null,
          runtimeDestination:
            capability.runtimeDestination ??
            null,
          executiveDestinations:
            asArray(
              capability.executiveDestinations,
            ),
        }),
      ),

    relatedCapabilities:
      relatedCapabilities.map(
        (capability) => ({
          id: capability.id ?? null,
          name: capabilityName(capability),
          domain:
            capabilityDomain(capability),
          produces:
            capabilityProduces(capability),
          canonicalProducer:
            capability.canonicalProducer ??
            null,
        }),
      ),

    producedObjects,
    consumedObjects,
    implementationFiles,

    candidateObject:
      definition.candidateObject ?? null,

    scorecardDimensions:
      scorecardDimensionsForDomain(
        definition.id,
      ),

    decision: recommendation.decision,
    recommendation:
      recommendation.recommendation,
  };
}

function markdownList(values, fallback) {
  if (!values || values.length === 0) {
    return [fallback];
  }

  return values.map(
    (value) => `- ${value}`,
  );
}

function capabilityMarkdown(capability) {
  const lines = [
    `### ${capability.id ?? "Unregistered"} — ${capability.name}`,
    "",
    `- Domain: \`${capability.domain ?? "Unknown"}\``,
  ];

  if (capability.canonicalProducer) {
    lines.push(
      `- Canonical producer: \`${normalizePath(
        capability.canonicalProducer,
      )}\``,
    );
  }

  if (capability.runtimeDestination) {
    lines.push(
      `- Runtime destination: \`${capability.runtimeDestination}\``,
    );
  }

  if (
    capability.produces &&
    capability.produces.length > 0
  ) {
    lines.push(
      `- Produces: ${capability.produces
        .map((value) => `\`${value}\``)
        .join(", ")}`,
    );
  }

  if (
    capability.executiveDestinations &&
    capability.executiveDestinations.length > 0
  ) {
    lines.push(
      `- Executive destinations: ${capability.executiveDestinations
        .map((value) => `\`${value}\``)
        .join(", ")}`,
    );
  }

  lines.push("");

  return lines;
}

function createMarkdownReport(review) {
  const lines = [
    `# Cognitive Domain Review — ${review.domain.id}: ${review.domain.name}`,
    "",
    `Generated: ${review.generatedAt}`,
    "",
    `**Coverage status:** ${review.coverage.status}`,
    "",
    `**Coverage score:** ${review.coverage.score}%`,
    "",
    `**Decision:** ${review.decision}`,
    "",
    "---",
    "",
    "# Purpose",
    "",
    review.domain.purpose,
    "",
    "# Review Question",
    "",
    review.domain.reviewQuestion,
    "",
    "# Architecture Status",
    "",
    `- Registered domain capabilities: ${
      review.architecture.currentlyRegistered
        ? "yes"
        : "no"
    }`,
    `- Reported as unpopulated: ${
      review.architecture.reportedAsUnpopulated
        ? "yes"
        : "no"
    }`,
    "",
    "# Coverage Assessment",
    "",
    review.coverage.rationale,
    "",
    "# Direct Domain Capabilities",
    "",
  ];

  if (review.directCapabilities.length === 0) {
    lines.push(
      "No capabilities are currently registered directly in this domain.",
      "",
    );
  } else {
    for (
      const capability
      of review.directCapabilities
    ) {
      lines.push(
        ...capabilityMarkdown(capability),
      );
    }
  }

  lines.push(
    "# Related Existing Capabilities",
    "",
  );

  if (review.relatedCapabilities.length === 0) {
    lines.push(
      "No related capabilities were identified.",
      "",
    );
  } else {
    for (
      const capability
      of review.relatedCapabilities
    ) {
      lines.push(
        `- \`${capability.id ?? "Unregistered"}\` — ${capability.name} (${capability.domain ?? "Unknown"})`,
      );
    }

    lines.push("");
  }

  lines.push(
    "# Existing Produced Cognitive Objects",
    "",
    ...markdownList(
      review.producedObjects.map(
        (value) => `\`${value}\``,
      ),
      "No produced cognitive objects were identified.",
    ),
    "",
    "# Existing Implementation Files",
    "",
    ...markdownList(
      review.implementationFiles.map(
        (value) =>
          `\`${normalizePath(value)}\``,
      ),
      "No implementation files were identified.",
    ),
    "",
    "# Related Cognitive Domains",
    "",
    ...markdownList(
      review.domain.relatedDomains.map(
        (value) => `\`${value}\``,
      ),
      "No related domains were declared.",
    ),
    "",
    "# Understanding Scorecard Contribution",
    "",
    ...markdownList(
      review.scorecardDimensions,
      "No scorecard dimensions were mapped.",
    ),
    "",
    "# Candidate Cognitive Object",
    "",
    review.candidateObject
      ? `A future capability would require a distinct object such as \`${review.candidateObject}\`.`
      : "No new cognitive object is currently proposed.",
    "",
    "# Recommendation",
    "",
    review.recommendation,
    "",
    "# Decision",
    "",
    `**${review.decision}**`,
    "",
    "# Governance Reminder",
    "",
    "Do not register a capability merely to populate an empty cognitive domain.",
    "",
    "A new capability requires:",
    "",
    "- a distinct cognitive responsibility,",
    "- a distinct produced cognitive object,",
    "- a canonical producer,",
    "- a Runtime destination,",
    "- declared consumers,",
    "- an executive or product destination,",
    "- Atlas validation,",
    "- and measurable Understanding Scorecard improvement.",
    "",
  );

  return lines.join("\n");
}

function printSummary(review, reportPath) {
  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    "DISCOVERY COGNITIVE DOMAIN REVIEW",
  );
  console.log(
    "=========================================",
  );
  console.log("");
  console.log(
    `Domain ..................... ${review.domain.id} — ${review.domain.name}`,
  );
  console.log(
    `Coverage ................... ${review.coverage.status}`,
  );
  console.log(
    `Coverage score ............. ${review.coverage.score}%`,
  );
  console.log(
    `Direct capabilities ........ ${review.directCapabilities.length}`,
  );
  console.log(
    `Related capabilities ....... ${review.relatedCapabilities.length}`,
  );
  console.log(
    `Produced objects ........... ${review.producedObjects.length}`,
  );
  console.log("");
  console.log("Decision");
  console.log(review.decision);
  console.log("");
  console.log("Recommendation");
  console.log(review.recommendation);
  console.log("");
  console.log(
    `Output: ${normalizePath(
      path.relative(
        PROJECT_ROOT,
        reportPath,
      ),
    )}`,
  );
  console.log(
    "=========================================",
  );
  console.log("");
}

function requestedDomainFromArguments() {
  const requested = process.argv
    .slice(2)
    .join(" ")
    .trim()
    .toUpperCase();

  if (!requested) {
    return "ADP";
  }

  const directMatch =
    DOMAIN_DEFINITIONS[requested];

  if (directMatch) {
    return requested;
  }

  const nameMatch = Object.values(
    DOMAIN_DEFINITIONS,
  ).find(
    (definition) =>
      normalizeComparable(
        definition.name,
      ) === normalizeComparable(requested),
  );

  if (nameMatch) {
    return nameMatch.id;
  }

  throw new Error(
    `Unknown cognitive domain: ${requested}\n` +
      `Valid domains: ${Object.keys(
        DOMAIN_DEFINITIONS,
      ).join(", ")}`,
  );
}

function main() {
  const requestedDomain =
    requestedDomainFromArguments();

  const definition =
    DOMAIN_DEFINITIONS[requestedDomain];

  const capabilityRegistry = readJson(
    PATHS.capabilityRegistry,
    "Cognitive capability registry",
  );

  const architectureState = fs.existsSync(
    PATHS.architectureState,
  )
    ? readJson(
        PATHS.architectureState,
        "Discovery architecture state",
      )
    : {};

  const capabilities =
    capabilityEntriesFromRegistry(
      capabilityRegistry,
    );

  const review = buildDomainReview({
    definition,
    capabilities,
    architectureState,
  });

  fs.mkdirSync(
    PATHS.outputDirectory,
    {
      recursive: true,
    },
  );

  const jsonPath = path.join(
    PATHS.outputDirectory,
    `${definition.id}.json`,
  );

  const markdownPath = path.join(
    PATHS.outputDirectory,
    `${definition.id}.md`,
  );

  fs.writeFileSync(
    jsonPath,
    `${JSON.stringify(review, null, 2)}\n`,
    "utf8",
  );

  fs.writeFileSync(
    markdownPath,
    createMarkdownReport(review),
    "utf8",
  );

  printSummary(
    review,
    markdownPath,
  );
}

try {
  main();
} catch (error) {
  console.error("");
  console.error(
    "Cognitive domain review failed.",
  );
  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );
  console.error("");
  process.exitCode = 1;
}