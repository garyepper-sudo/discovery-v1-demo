import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const PATHS = {
  architectureState: path.join(
    ROOT,
    "docs/Architecture/DISCOVERY_ARCHITECTURE_STATE.json",
  ),

  capabilityRegistry: path.join(
    ROOT,
    "docs/Architecture/COGNITIVE_CAPABILITY_REGISTRY.json",
  ),

  capabilityAudit: path.join(
    ROOT,
    "docs/Architecture/COGNITIVE_CAPABILITY_AUDIT.json",
  ),

  output: path.join(
    ROOT,
    "docs/Architecture/ARCHITECTURE_RECOMMENDATIONS.json",
  ),
};

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `${label} not found: ${filePath}`,
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(filePath, "utf8"),
    );
  } catch (error) {
    throw new Error(
      `${label} could not be parsed: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    );
  }
}

function ensureDirectory(filePath) {
  fs.mkdirSync(
    path.dirname(filePath),
    {
      recursive: true,
    },
  );
}

function asArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function clamp(
  value,
  minimum,
  maximum,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function unique(values) {
  return [
    ...new Set(
      values.filter(Boolean),
    ),
  ];
}

function isCapabilityImplemented(
  capability,
) {
  if (!capability) {
    return false;
  }

  if (
    capability.canonicalProducerExists === true
  ) {
    return true;
  }

  return (
    Array.isArray(
      capability.missingImplementationFiles,
    ) &&
    capability.missingImplementationFiles
      .length === 0
  );
}

function calculateIntegrityFailureCount(
  auditHealth,
) {
  return [
    auditHealth.duplicateIdCount ?? 0,
    auditHealth.missingDependencyCount ?? 0,
    auditHealth.missingCanonicalProducerCount ?? 0,
    auditHealth.capabilitiesWithoutProducerCount ?? 0,
    auditHealth.capabilitiesWithoutConsumersCount ?? 0,
    auditHealth
      .capabilitiesWithoutRuntimeDestinationCount ??
      0,
    auditHealth.multiCapabilityFileCount ?? 0,
  ].reduce(
    (total, count) =>
      total + count,
    0,
  );
}

function buildArchitectureContext({
  architectureState,
  capabilityRegistry,
  capabilityAudit,
}) {
  const capabilities = asArray(
    capabilityRegistry.capabilities,
  );

  const auditHealth =
    capabilityAudit.health ?? {};

  const hiddenCapabilityIds = asArray(
    architectureState.intelligence
      ?.potentiallyHiddenCapabilityIds,
  );

  const unpopulatedDomains = asArray(
    architectureState.gaps
      ?.unpopulatedDomains,
  );

  const registeredButUnimplementedCapabilities =
    capabilities.filter(
      (capability) =>
        !isCapabilityImplemented(
          capability,
        ),
    );

  const partiallyIntegratedCapabilities =
    capabilities.filter(
      (capability) =>
        hiddenCapabilityIds.includes(
          capability.id,
        ),
    );

  const predictionEvaluationCapability =
    capabilities.find(
      (capability) =>
        capability.id ===
        "CAP-ADP-001",
    );

  const architecturePlanningCapability =
    capabilities.find(
      (capability) =>
        capability.id ===
        "CAP-SYS-001",
    );

  const architectureProjectionCapability =
    capabilities.find(
      (capability) =>
        capability.id ===
        "CAP-SYS-002",
    );

  const integrityFailureCount =
    calculateIntegrityFailureCount(
      auditHealth,
    );

  return {
    capabilities,
    auditHealth,

    capabilityCount:
      capabilities.length,

    hiddenCapabilityIds,

    unpopulatedDomains,

    registeredButUnimplementedCapabilities,

    partiallyIntegratedCapabilities,

    integrityFailureCount,

    predictionEvaluationCapability,

    predictionEvaluationImplemented:
      isCapabilityImplemented(
        predictionEvaluationCapability,
      ),

    architecturePlanningImplemented:
      isCapabilityImplemented(
        architecturePlanningCapability,
      ),

    architectureProjectionImplemented:
      isCapabilityImplemented(
        architectureProjectionCapability,
      ),

    architectureHealthScore:
      architectureState.architecture
        ?.healthScore ??
      null,

    connectedCapabilityTraceCount:
      architectureState.architecture
        ?.connectedCapabilityTraceCount ??
      0,

    capabilityTraceCount:
      architectureState.architecture
        ?.capabilityTraceCount ??
      0,

    projectedCapabilityCount:
      architectureState.intelligence
        ?.projectedCapabilityCount ??
      0,

    structurallyVisibleCapabilityCount:
      architectureState.intelligence
        ?.structurallyVisibleCapabilityCount ??
      0,

    overlapCount:
      asArray(
        architectureState
          .duplicateProtection
          ?.potentialOverlaps,
      ).length,
  };
}

function deriveArchitectureObservations(
  context,
) {
  const observations = [];

  observations.push({
    id:
      "architecture-observation-health",

    type:
      "architecture-health",

    statement:
      context.integrityFailureCount === 0
        ? "Discovery's registered cognitive architecture currently has no capability-integrity failures."
        : `Discovery's registered cognitive architecture currently has ${context.integrityFailureCount} capability-integrity failure(s).`,

    confidence: 1,

    evidence: {
      integrityFailureCount:
        context.integrityFailureCount,

      auditHealth:
        context.auditHealth,
    },
  });

  observations.push({
    id:
      "architecture-observation-integration",

    type:
      "integration-coverage",

    statement:
      context.hiddenCapabilityIds.length === 0
        ? "No projected capabilities are currently classified as structurally hidden."
        : `${context.hiddenCapabilityIds.length} projected capability(s) remain structurally hidden.`,

    confidence: 1,

    evidence: {
      hiddenCapabilityIds:
        context.hiddenCapabilityIds,

      projectedCapabilityCount:
        context.projectedCapabilityCount,

      structurallyVisibleCapabilityCount:
        context.structurallyVisibleCapabilityCount,
    },
  });

  observations.push({
    id:
      "architecture-observation-implementation",

    type:
      "implementation-coverage",

    statement:
      context
        .registeredButUnimplementedCapabilities
        .length === 0
        ? "Every registered capability has a recognized canonical implementation."
        : `${context.registeredButUnimplementedCapabilities.length} registered capability(s) do not yet have a recognized canonical implementation.`,

    confidence: 1,

    evidence: {
      capabilityIds:
        context
          .registeredButUnimplementedCapabilities
          .map(
            (capability) =>
              capability.id,
          ),
    },
  });

  observations.push({
    id:
      "architecture-observation-prediction-maturity",

    type:
      "capability-maturity",

    statement:
      context.predictionEvaluationImplemented
        ? "Prediction Outcome Evaluation is implemented and structurally available, but its semantic outcome-comparison logic remains incomplete."
        : "Prediction Outcome Evaluation is not yet implemented.",

    confidence:
      context.predictionEvaluationImplemented
        ? 0.95
        : 1,

    evidence: {
      capabilityId:
        "CAP-ADP-001",

      implemented:
        context
          .predictionEvaluationImplemented,

      knownLimitation:
        "Current evaluations may remain inconclusive because semantic comparison against later organizational outcomes is not yet complete.",
    },
  });

  observations.push({
    id:
      "architecture-observation-system-planning",

    type:
      "system-capability-maturity",

    statement:
      context.architecturePlanningImplemented &&
      context.architectureProjectionImplemented
        ? "The System Operating System now includes both Architectural Planning and Architecture Recommendation Projection."
        : "The System Operating System is only partially implemented.",

    confidence: 1,

    evidence: {
      architecturalPlanningImplemented:
        context
          .architecturePlanningImplemented,

      architectureProjectionImplemented:
        context
          .architectureProjectionImplemented,
    },
  });

  observations.push({
    id:
      "architecture-observation-domain-coverage",

    type:
      "domain-coverage",

    statement:
      context.unpopulatedDomains.length === 0
        ? "Every expected cognitive domain has at least one registered capability."
        : `The following cognitive domains remain unpopulated: ${context.unpopulatedDomains.join(
            ", ",
          )}.`,

    confidence: 1,

    evidence: {
      unpopulatedDomains:
        context.unpopulatedDomains,
    },
  });

  observations.push({
    id:
      "architecture-observation-trace-coverage",

    type:
      "trace-coverage",

    statement:
      `${context.connectedCapabilityTraceCount} of ${context.capabilityTraceCount} generated capability traces are currently connected.`,

    confidence: 1,

    evidence: {
      connectedCapabilityTraceCount:
        context
          .connectedCapabilityTraceCount,

      capabilityTraceCount:
        context.capabilityTraceCount,
    },
  });

  return observations;
}

function inferArchitectureMechanisms({
  context,
  observations,
}) {
  const mechanisms = [];

  if (
    context.integrityFailureCount > 0
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-integrity-block",

      type:
        "architecture-integrity-block",

      name:
        "Integrity Failure Blocks Expansion",

      explanation:
        "Unresolved registry, producer, dependency, ownership, consumer, or destination failures make architecture expansion unsafe.",

      confidence: 1,

      supportingObservationIds: [
        "architecture-observation-health",
      ],
    });
  }

  if (
    context
      .partiallyIntegratedCapabilities
      .length > 0
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-incomplete-integration",

      type:
        "integration-bottleneck",

      name:
        "Incomplete Integration Bottleneck",

      explanation:
        "Capabilities that exist but remain structurally hidden create more immediate product risk than missing future capabilities.",

      confidence: 0.95,

      supportingObservationIds: [
        "architecture-observation-integration",
      ],
    });
  }

  if (
    context.predictionEvaluationImplemented
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-maturity-before-expansion",

      type:
        "capability-maturity-bottleneck",

      name:
        "Capability Maturity Before Domain Expansion",

      explanation:
        "Prediction Outcome Evaluation is already implemented across the architecture, but incomplete semantic evaluation limits calibration, longitudinal learning, and trustworthy simulation readiness.",

      confidence: 0.96,

      supportingObservationIds: [
        "architecture-observation-prediction-maturity",
        "architecture-observation-domain-coverage",
      ],
    });
  }

  if (
    context.unpopulatedDomains.includes(
      "SIM",
    )
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-simulation-dependency",

      type:
        "dependency-sequencing",

      name:
        "Simulation Depends on Calibrated Prediction",

      explanation:
        "Simulation would create more value after Discovery can compare predictions against observed outcomes and learn from prediction accuracy.",

      confidence: 0.91,

      supportingObservationIds: [
        "architecture-observation-prediction-maturity",
        "architecture-observation-domain-coverage",
      ],
    });
  }

  if (
    context.architecturePlanningImplemented &&
    context.architectureProjectionImplemented
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-system-loop-formation",

      type:
        "system-feedback-loop",

      name:
        "Architecture Planning Feedback Loop",

      explanation:
        "Architectural Planning now produces recommendations that are projected into Sprint Startup, allowing Discovery's own architecture state to influence development sequencing.",

      confidence: 0.92,

      supportingObservationIds: [
        "architecture-observation-system-planning",
      ],
    });
  }

  if (
    context.capabilityTraceCount > 0 &&
    context.connectedCapabilityTraceCount <
      context.capabilityTraceCount
  ) {
    mechanisms.push({
      id:
        "architecture-mechanism-trace-completion",

      type:
        "trace-coverage-gap",

      name:
        "Incomplete Capability Trace Coverage",

      explanation:
        "Capabilities without connected traces reduce confidence that declared consumers and destinations are structurally exercised.",

      confidence: 0.85,

      supportingObservationIds: [
        "architecture-observation-trace-coverage",
      ],
    });
  }

  return mechanisms;
}

function inferArchitectureBeliefs({
  context,
  observations,
  mechanisms,
}) {
  const beliefs = [];

  const mechanismIds = new Set(
    mechanisms.map(
      (mechanism) =>
        mechanism.id,
    ),
  );

  if (
    context.integrityFailureCount > 0
  ) {
    beliefs.push({
      id:
        "architecture-belief-restore-integrity-first",

      statement:
        "Discovery should restore architecture integrity before expanding cognition.",

      confidence: 1,

      supportingMechanismIds: [
        "architecture-mechanism-integrity-block",
      ],
    });
  }

  if (
    context.hiddenCapabilityIds.length > 0
  ) {
    beliefs.push({
      id:
        "architecture-belief-integrate-before-inventing",

      statement:
        "Discovery should complete existing integration pathways before inventing new capabilities.",

      confidence: 0.97,

      supportingMechanismIds: [
        "architecture-mechanism-incomplete-integration",
      ],
    });
  }

  if (
    context.predictionEvaluationImplemented
  ) {
    beliefs.push({
      id:
        "architecture-belief-mature-prediction-evaluation",

      statement:
        "Completing longitudinal prediction outcome evaluation will create more immediate value than opening the Simulation domain.",

      confidence: 0.95,

      supportingMechanismIds: unique([
        mechanismIds.has(
          "architecture-mechanism-maturity-before-expansion",
        )
          ? "architecture-mechanism-maturity-before-expansion"
          : null,

        mechanismIds.has(
          "architecture-mechanism-simulation-dependency",
        )
          ? "architecture-mechanism-simulation-dependency"
          : null,
      ]),
    });
  }

  if (
    context.architecturePlanningImplemented &&
    context.architectureProjectionImplemented
  ) {
    beliefs.push({
      id:
        "architecture-belief-system-loop-established",

      statement:
        "Discovery now has the beginnings of a canonical system-planning feedback loop.",

      confidence: 0.9,

      supportingMechanismIds: [
        "architecture-mechanism-system-loop-formation",
      ],
    });
  }

  if (
    context.unpopulatedDomains.length > 0
  ) {
    beliefs.push({
      id:
        "architecture-belief-empty-domain-not-priority",

      statement:
        "An unpopulated cognitive domain should not become a development priority without a concrete product need and validated dependency sequence.",

      confidence: 0.98,

      supportingMechanismIds: unique([
        mechanismIds.has(
          "architecture-mechanism-simulation-dependency",
        )
          ? "architecture-mechanism-simulation-dependency"
          : null,

        mechanismIds.has(
          "architecture-mechanism-maturity-before-expansion",
        )
          ? "architecture-mechanism-maturity-before-expansion"
          : null,
      ]),
    });
  }

  if (
    context.capabilityTraceCount > 0 &&
    context.connectedCapabilityTraceCount <
      context.capabilityTraceCount
  ) {
    beliefs.push({
      id:
        "architecture-belief-complete-traces",

      statement:
        "Incomplete capability traces should be resolved before treating the architecture as fully operational.",

      confidence: 0.82,

      supportingMechanismIds: [
        "architecture-mechanism-trace-completion",
      ],
    });
  }

  return beliefs;
}

function formArchitectureTheory({
  context,
  observations,
  mechanisms,
  beliefs,
}) {
  const integrityHealthy =
    context.integrityFailureCount === 0;

  const integrationHealthy =
    context.hiddenCapabilityIds.length === 0;

  const implementationHealthy =
    context
      .registeredButUnimplementedCapabilities
      .length === 0;

  const predictionMaturityGap =
    context.predictionEvaluationImplemented;

  let statement =
    "Discovery should continue refining existing canonical capabilities.";

  let explanation =
    "The architecture does not currently present a stronger sequencing signal.";

  let confidence = 0.7;

  if (!integrityHealthy) {
    statement =
      "Discovery is currently constrained by architecture integrity failures.";

    explanation =
      "Registry or structural integrity failures should be resolved before capability maturity or domain expansion work continues.";

    confidence = 1;
  } else if (!integrationHealthy) {
    statement =
      "Discovery is currently constrained by incomplete capability integration.";

    explanation =
      "Existing intelligence should be structurally connected before new cognition is introduced.";

    confidence = 0.97;
  } else if (!implementationHealthy) {
    statement =
      "Discovery is currently constrained by registered capabilities that lack canonical implementation.";

    explanation =
      "Registered architecture should be completed before further capability expansion.";

    confidence = 0.96;
  } else if (predictionMaturityGap) {
    statement =
      "Discovery has transitioned from architecture construction to capability maturation.";

    explanation =
      "The core prediction pipeline and system-planning pipeline now exist. The highest-value remaining work is to make Prediction Outcome Evaluation semantically real so longitudinal calibration and simulation can rely on measured outcomes rather than scaffolds.";

    confidence = 0.95;
  }

  return {
    id:
      "architecture-theory-current-development-phase",

    statement,

    explanation,

    confidence,

    supportingObservationIds:
      observations.map(
        (observation) =>
          observation.id,
      ),

    supportingMechanismIds:
      mechanisms.map(
        (mechanism) =>
          mechanism.id,
      ),

    supportingBeliefIds:
      beliefs.map(
        (belief) =>
          belief.id,
      ),

    falsifyingEvidence: [
      "A higher-value unresolved architecture integrity failure is detected.",
      "A projected capability becomes structurally hidden.",
      "A registered capability lacks a canonical implementation.",
      "Simulation becomes independently valuable without requiring calibrated longitudinal prediction.",
      "Prediction Outcome Evaluation is shown to already perform semantic cross-investigation outcome comparison and confidence calibration.",
    ],
  };
}

function scoreOpportunity({
  baseScore,
  urgency = 0,
  leverage = 0,
  readiness = 0,
  dependencyValue = 0,
  riskReduction = 0,
}) {
  return clamp(
    Math.round(
      baseScore +
        urgency +
        leverage +
        readiness +
        dependencyValue +
        riskReduction,
    ),
    0,
    120,
  );
}

function buildArchitectureOpportunities({
  context,
  theory,
}) {
  const opportunities = [];

  if (
    context.integrityFailureCount > 0
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-restore-integrity",

      title:
        "Restore architecture integrity",

      score:
        scoreOpportunity({
          baseScore: 100,
          urgency: 10,
          riskReduction: 10,
        }),

      category:
        "architecture-health",

      reason:
        `${context.integrityFailureCount} architecture integrity ${
          context.integrityFailureCount === 1
            ? "failure requires"
            : "failures require"
        } resolution before expanding the system.`,

      capabilityIds: [],

      prerequisites: [
        "Review the Cognitive Capability Audit.",
        "Resolve missing producers, dependencies, consumers, destinations, or duplicate ownership.",
      ],

      blockers: [],

      supportingTheoryId:
        theory.id,
    });
  }

  if (
    context
      .partiallyIntegratedCapabilities
      .length > 0
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-complete-integration",

      title:
        "Complete partially integrated capabilities",

      score:
        scoreOpportunity({
          baseScore: 88,
          urgency: 8,
          leverage: 8,
          readiness: 8,
          riskReduction: 6,
        }),

      category:
        "integration",

      reason:
        `${context.partiallyIntegratedCapabilities.length} registered capability ${
          context.partiallyIntegratedCapabilities.length === 1
            ? "is"
            : "are"
        } not yet structurally connected through the full declared architecture.`,

      capabilityIds:
        context
          .partiallyIntegratedCapabilities
          .map(
            (capability) =>
              capability.id,
          ),

      prerequisites: [
        "Confirm the canonical Runtime destination.",
        "Confirm projection or system-output pathways where applicable.",
        "Confirm structural trace coverage.",
      ],

      blockers: [],

      supportingTheoryId:
        theory.id,
    });
  }

  if (
    context
      .registeredButUnimplementedCapabilities
      .length > 0
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-complete-registered-capabilities",

      title:
        "Complete registered capability implementations",

      score:
        scoreOpportunity({
          baseScore: 82,
          urgency: 7,
          readiness: 8,
          riskReduction: 7,
        }),

      category:
        "implementation",

      reason:
        `${context.registeredButUnimplementedCapabilities.length} registered capability ${
          context.registeredButUnimplementedCapabilities.length === 1
            ? "does"
            : "do"
        } not yet have a recognized canonical implementation.`,

      capabilityIds:
        context
          .registeredButUnimplementedCapabilities
          .map(
            (capability) =>
              capability.id,
          ),

      prerequisites: [
        "Create each declared canonical producer.",
        "Regenerate the Cognitive File Registry.",
        "Regenerate and validate the Capability Registry.",
      ],

      blockers:
        context
          .registeredButUnimplementedCapabilities
          .flatMap(
            (capability) =>
              asArray(
                capability
                  .missingImplementationFiles,
              ),
          ),

      supportingTheoryId:
        theory.id,
    });
  }

  if (
    context.predictionEvaluationImplemented
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-mature-prediction-evaluation",

      title:
        "Complete longitudinal prediction outcome evaluation",

      score:
        scoreOpportunity({
          baseScore: 65,
          leverage: 10,
          readiness: 8,
          dependencyValue: 10,
          riskReduction: 5,
        }),

      category:
        "capability-maturity",

      reason:
        "Prediction Outcome Evaluation is structurally implemented, but its current scaffold still records inconclusive outcomes rather than comparing prior predictions with later organizational reality. Completing it unlocks calibration, adaptive learning, and trustworthy simulation readiness.",

      capabilityIds: [
        "CAP-ADP-001",
        "CAP-LRN-002",
      ],

      prerequisites: [
        "Load predictions created during earlier investigations.",
        "Compare them with later observations, conditions, understanding, and evidence.",
        "Define semantic outcome-classification rules.",
        "Calculate accuracy, calibration delta, confidence adjustment, and recommended confidence.",
        "Feed completed evaluations into the Organizational Learning Profile.",
      ],

      blockers: [
        "Semantic cross-investigation outcome comparison is not yet implemented.",
        "Prediction calibration does not yet influence future prediction confidence.",
      ],

      supportingTheoryId:
        theory.id,
    });
  }

  if (
    context.capabilityTraceCount > 0 &&
    context.connectedCapabilityTraceCount <
      context.capabilityTraceCount
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-complete-trace-coverage",

      title:
        "Complete remaining capability traces",

      score:
        scoreOpportunity({
          baseScore: 55,
          urgency: 4,
          readiness: 8,
          riskReduction: 5,
        }),

      category:
        "architecture-verification",

      reason:
        `${context.connectedCapabilityTraceCount} of ${context.capabilityTraceCount} capability traces are connected. Remaining incomplete traces should be reviewed so declared consumers and destinations are structurally verified.`,

      capabilityIds: [],

      prerequisites: [
        "Audit capabilities whose traces are incomplete.",
        "Declare legitimate downstream consumers.",
        "Regenerate affected capability traces.",
      ],

      blockers: [],

      supportingTheoryId:
        theory.id,
    });
  }

  if (
    context.unpopulatedDomains.length > 0
  ) {
    opportunities.push({
      id:
        "architecture-opportunity-review-unpopulated-domains",

      title:
        "Review unpopulated cognitive domains",

      score:
        scoreOpportunity({
          baseScore: 35,
          leverage: 3,
          readiness: 2,
          dependencyValue: 2,
        }),

      category:
        "domain-review",

      reason:
        `The following cognitive domains remain unpopulated: ${context.unpopulatedDomains.join(
          ", ",
        )}. These remain review areas and should only become implementation priorities when a distinct product need and dependency sequence are proven.`,

      capabilityIds: [],

      prerequisites: [
        "Validate a concrete product need.",
        "Search existing capabilities and produced objects for overlap.",
        "Define a distinct responsibility, object, producer, destination, and consumer.",
      ],

      blockers: [
        "An empty domain alone is not sufficient justification for capability creation.",
      ],

      supportingTheoryId:
        theory.id,
    });
  }

  return opportunities.sort(
    (left, right) =>
      right.score - left.score,
  );
}

function buildRecommendation({
  architectureState,
  capabilityRegistry,
  capabilityAudit,
}) {
  const context =
    buildArchitectureContext({
      architectureState,
      capabilityRegistry,
      capabilityAudit,
    });

  const observations =
    deriveArchitectureObservations(
      context,
    );

  const mechanisms =
    inferArchitectureMechanisms({
      context,
      observations,
    });

  const beliefs =
    inferArchitectureBeliefs({
      context,
      observations,
      mechanisms,
    });

  const theory =
    formArchitectureTheory({
      context,
      observations,
      mechanisms,
      beliefs,
    });

  const opportunities =
    buildArchitectureOpportunities({
      context,
      theory,
    });

  const highestPriority =
    opportunities[0] ?? {
      id:
        "architecture-opportunity-refine-existing-capabilities",

      title:
        "Continue refining existing canonical capabilities",

      score: 50,

      category:
        "maintenance",

      reason:
        "No higher-priority integrity, integration, implementation, trace, maturity, or dependency gap was detected.",

      capabilityIds: [],

      prerequisites: [],

      blockers: [],

      supportingTheoryId:
        theory.id,
    };

  return {
    generatedAt:
      new Date().toISOString(),

    capabilityId:
      "CAP-SYS-001",

    objectType:
      "ArchitectureRecommendation",

    version:
      "2.0",

    reasoning: {
      observations,
      mechanisms,
      beliefs,
      theory,
    },

    highestPriority,

    rankedOpportunities:
      opportunities,

    safeguards: [
      "Do not create a capability solely because a cognitive domain is empty.",
      "Resolve architecture integrity failures before expansion.",
      "Complete partially integrated capabilities before opening new domains.",
      "Complete registered implementations before proposing replacement capabilities.",
      "Prefer maturing structurally complete capabilities when they unlock dependent domains.",
      "Extend existing capabilities when they already own the responsibility, object, producer, or destination.",
      "Require a distinct responsibility, cognitive object, canonical producer, consumers, and destination before registering a new capability.",
    ],

    inputs: {
      capabilityCount:
        context.capabilityCount,

      architectureHealthScore:
        context.architectureHealthScore,

      integrityFailureCount:
        context.integrityFailureCount,

      potentiallyHiddenCapabilityCount:
        context.hiddenCapabilityIds.length,

      unpopulatedDomains:
        context.unpopulatedDomains,

      connectedCapabilityTraceCount:
        context
          .connectedCapabilityTraceCount,

      capabilityTraceCount:
        context.capabilityTraceCount,

      overlapCount:
        context.overlapCount,

      auditHealth:
        context.auditHealth,
    },
  };
}

function main() {
  const architectureState = loadJson(
    PATHS.architectureState,
    "Architecture state",
  );

  const capabilityRegistry = loadJson(
    PATHS.capabilityRegistry,
    "Capability registry",
  );

  const capabilityAudit = loadJson(
    PATHS.capabilityAudit,
    "Capability audit",
  );

  const recommendation =
    buildRecommendation({
      architectureState,
      capabilityRegistry,
      capabilityAudit,
    });

  ensureDirectory(
    PATHS.output,
  );

  fs.writeFileSync(
    PATHS.output,
    `${JSON.stringify(
      recommendation,
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("");
  console.log(
    "Architecture recommendation generated.",
  );

  console.log(
    `Theory: ${recommendation.reasoning.theory.statement}`,
  );

  console.log(
    `Highest priority: ${recommendation.highestPriority.title}`,
  );

  console.log(
    `Score: ${recommendation.highestPriority.score}`,
  );

  console.log(
    `Architecture observations: ${recommendation.reasoning.observations.length}`,
  );

  console.log(
    `Architecture mechanisms: ${recommendation.reasoning.mechanisms.length}`,
  );

  console.log(
    `Architecture beliefs: ${recommendation.reasoning.beliefs.length}`,
  );

  console.log(
    `Ranked opportunities: ${recommendation.rankedOpportunities.length}`,
  );

  console.log(
    `Output: ${PATHS.output}`,
  );

  console.log("");
}

main();