import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const PATHS = {
  recommendation: path.join(
    ROOT,
    "docs/Architecture/ARCHITECTURE_RECOMMENDATIONS.json",
  ),

  output: path.join(
    ROOT,
    "docs/Architecture/ARCHITECTURE_RECOMMENDATION_PROJECTION.json",
  ),
};

function loadJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} not found: ${filePath}`);
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
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true,
  });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function projectOpportunity(opportunity) {
  return {
    id:
      opportunity.id ??
      "architecture-opportunity-unknown",

    title:
      opportunity.title ??
      "Architecture opportunity",

    score:
      typeof opportunity.score === "number"
        ? opportunity.score
        : 0,

    category:
      opportunity.category ??
      "unknown",

    reason:
      opportunity.reason ??
      "No architecture rationale is available.",

    capabilityIds:
      asArray(opportunity.capabilityIds),

    prerequisites:
      asArray(opportunity.prerequisites),

    blockers:
      asArray(opportunity.blockers),
  };
}

function buildProjection(recommendation) {
  const rankedOpportunities = asArray(
    recommendation.rankedOpportunities,
  ).map(projectOpportunity);

  const highestPriority =
    recommendation.highestPriority
      ? projectOpportunity(
          recommendation.highestPriority,
        )
      : rankedOpportunities[0] ?? {
          id:
            "architecture-opportunity-maintenance",

          title:
            "Continue refining existing canonical capabilities",

          score: 50,

          category: "maintenance",

          reason:
            "No higher-priority architecture work was identified.",

          capabilityIds: [],

          prerequisites: [],

          blockers: [],
        };

  return {
    generatedAt:
      new Date().toISOString(),

    capabilityId:
      "CAP-SYS-002",

    objectType:
      "ArchitectureRecommendationProjection",

    sourceCapabilityId:
      recommendation.capabilityId ??
      "CAP-SYS-001",

    sourceObjectType:
      recommendation.objectType ??
      "ArchitectureRecommendation",

    sourceGeneratedAt:
      recommendation.generatedAt ?? null,

    headline:
      highestPriority.title,

    summary:
      highestPriority.reason,

    score:
      highestPriority.score,

    category:
      highestPriority.category,

    highestPriority,

    rankedOpportunities,

    nextActions:
      highestPriority.prerequisites,

    currentBlockers:
      highestPriority.blockers,

    safeguards:
      asArray(recommendation.safeguards),

    sprintBrief: {
      heading:
        "Highest-ROI Next Work",

      recommendation:
        highestPriority.title,

      reason:
        highestPriority.reason,

      score:
        highestPriority.score,

      prerequisites:
        highestPriority.prerequisites,

      blockers:
        highestPriority.blockers,
    },

    architectureHandoff: {
      currentRecommendation:
        highestPriority.title,

      rationale:
        highestPriority.reason,

      rankedOpportunityCount:
        rankedOpportunities.length,

      rankedOpportunities,

      safeguards:
        asArray(recommendation.safeguards),
    },
  };
}

function main() {
  const recommendation = loadJson(
    PATHS.recommendation,
    "Architecture recommendation",
  );

  const projection =
    buildProjection(recommendation);

  ensureDirectory(PATHS.output);

  fs.writeFileSync(
    PATHS.output,
    `${JSON.stringify(
      projection,
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("");
  console.log(
    "Architecture recommendation projection generated.",
  );

  console.log(
    `Recommendation: ${projection.headline}`,
  );

  console.log(
    `Score: ${projection.score}`,
  );

  console.log(
    `Output: ${PATHS.output}`,
  );

  console.log("");
}

main();