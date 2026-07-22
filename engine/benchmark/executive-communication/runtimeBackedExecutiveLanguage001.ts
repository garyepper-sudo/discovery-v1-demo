import fs from "fs";
import path from "path";

import {
  synthesizeExecutiveCommunication,
} from "../../v3/communication/synthesizeExecutiveCommunication";
import type {
  ExecutiveCommunicationSource,
} from "../../v3/communication/executiveCommunicationSource";
import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

const ORGANIZATION_ID =
  process.argv[2] ?? "atlas-manufacturing-simulation";

if (!/^[a-zA-Z0-9_-]+$/.test(ORGANIZATION_ID)) {
  throw new Error("Runtime validation organization ID is invalid.");
}

const RUNTIME_PATH = path.join(
  process.cwd(),
  ".discovery-runtime",
  "organizations",
  `${ORGANIZATION_ID}.json`,
);

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^(?:leadership|leaders|management|executives?)\s+should\s+/, "")
    .trim();
}

function sentences(value: string): string[] {
  return (value.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [])
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function duplicateSentences(value: string): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const sentence of sentences(value)) {
    const key = normalize(sentence);

    if (key && seen.has(key)) {
      duplicates.add(sentence);
    }

    seen.add(key);
  }

  return [...duplicates];
}

function containsMeaning(value: string, source: string): boolean {
  const sourceTerms = normalize(source)
    .split(" ")
    .filter((term) => term.length >= 5);

  if (sourceTerms.length === 0) {
    return false;
  }

  const normalizedValue = normalize(value);
  return sourceTerms.some((term) => normalizedValue.includes(term));
}

function loadSource(): ExecutiveCommunicationSource {
  const runtime = JSON.parse(
    fs.readFileSync(RUNTIME_PATH, "utf8"),
  ) as OrganizationRuntime;

  const memory = runtime.memory as typeof runtime.memory &
    Partial<ExecutiveCommunicationSource>;

  if (
    !memory.executiveAssessment ||
    !memory.executiveRecommendation ||
    !memory.organizationalState ||
    !memory.organizationalConditions?.length
  ) {
    throw new Error(
      "Representative Runtime does not contain the canonical cognition required for Executive Communication.",
    );
  }

  return {
    organizationId: runtime.metadata.organizationId,
    executiveAssessment: memory.executiveAssessment,
    executiveRecommendation: memory.executiveRecommendation,
    organizationalState: memory.organizationalState,
    organizationalConditions: memory.organizationalConditions,
    executiveExplanation: memory.executiveExplanation,
    organizationalPredictions: memory.organizationalPredictions,
    predictionReflection: memory.predictionReflection,
    organizationalLearningProfile: memory.organizationalLearningProfile,
    organizationalUncertainty: memory.organizationalUncertainty,
    investigationOpportunities: memory.investigationOpportunities,
    organizationalBeliefs: memory.organizationalBeliefs,
    organizationalTheories: memory.organizationalTheories,
    organizationalMechanisms: memory.organizationalMechanisms,
    executiveOptimization: memory.executiveOptimization,
    executiveSimulation: memory.executiveSimulation,
    generatedAt: runtime.metadata.updatedAt,
  };
}

const source = loadSource();
const first = synthesizeExecutiveCommunication({ source });
const second = synthesizeExecutiveCommunication({ source });
const primaryCondition = source.organizationalConditions[0];
const recommendation = source.executiveRecommendation;
const expectedConfidence = Math.round(recommendation.confidence * 100);
const opportunity = source.investigationOpportunities?.[0] as
  | { suggestedExecutiveQuestion?: string }
  | undefined;
const duplicateSummarySentences = duplicateSentences(first.executiveSummary);
const actionKeys = first.recommendation.actions.map(normalize);

const checks: Check[] = [
  {
    name: "Executive headline is readable",
    passed:
      first.headline.trim().length > 20 &&
      !/\.\s+(?:is|are|was|were)\b/i.test(first.headline),
    detail: first.headline,
  },
  {
    name: "Executive summary has no malformed sentence fragments",
    passed:
      first.executiveSummary.trim().length > 60 &&
      !/\.\s+(?:is|are|was|were)\s+(?:the|a|an)\b/i.test(first.executiveSummary) &&
      !/\b(?:and|or)\s*,|\b(?:and|or)\s+(?:and|or)\b/i.test(first.executiveSummary) &&
      !/\bundefined\b|\bnull\b/i.test(first.executiveSummary),
    detail: first.executiveSummary,
  },
  {
    name: "Executive summary contains no duplicate sentences",
    passed: duplicateSummarySentences.length === 0,
    detail: duplicateSummarySentences.join(" | ") || "No duplicate sentences.",
  },
  {
    name: "Recommendation actions contain no duplicates",
    passed: new Set(actionKeys).size === actionKeys.length,
    detail: first.recommendation.actions.join(" | "),
  },
  {
    name: "Recommendation meaning is preserved",
    passed:
      containsMeaning(first.executiveSummary, recommendation.headline) &&
      containsMeaning(first.recommendation.headline, recommendation.headline),
    detail: recommendation.headline,
  },
  {
    name: "Confidence wording is preserved",
    passed: first.executiveSummary.includes(`${expectedConfidence}%`),
    detail: `${expectedConfidence}%`,
  },
  {
    name: "Uncertainty wording is preserved",
    passed:
      !opportunity?.suggestedExecutiveQuestion ||
      first.executiveSummary.includes(opportunity.suggestedExecutiveQuestion),
    detail: opportunity?.suggestedExecutiveQuestion ?? "No investigation opportunity attached.",
  },
  {
    name: "Organization-specific condition language is preserved",
    passed:
      Boolean(primaryCondition) &&
      (
        first.headline.includes(primaryCondition.name) ||
        first.executiveSummary.includes(primaryCondition.name)
      ),
    detail: primaryCondition?.name ?? "No primary condition.",
  },
  {
    name: "Runtime-backed communication is deterministic",
    passed: JSON.stringify(first) === JSON.stringify(second),
    detail: first.id,
  },
];

console.log("\n==========================================");
console.log("RUNTIME-BACKED EXECUTIVE LANGUAGE 001");
console.log("==========================================\n");
console.log(`Organization: ${source.organizationId}\n`);

for (const check of checks) {
  console.log(`${check.passed ? "PASS" : "FAIL"}  ${check.name}`);
  console.log(`      ${check.detail}`);
}

const failures = checks.filter((check) => !check.passed);

console.log(`\nPassed: ${checks.length - failures.length}`);
console.log(`Failed: ${failures.length}\n`);

if (failures.length > 0) {
  process.exitCode = 1;
}
