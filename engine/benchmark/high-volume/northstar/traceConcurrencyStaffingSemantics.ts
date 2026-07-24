import fs from "node:fs";
import path from "node:path";

import { runDiscoveryV3 } from "../../../v3";
import { createEmptyOrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../../v3/types";
import type { OrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { northstarCompanyFixture } from "./northstarCompanyFixture";
import {
  northstarEvidenceManifest,
  type NorthstarEvidenceArtifact,
} from "./northstarEvidenceManifest";
import { runCanonicalNorthstarGroundTruthReplay } from "./runCanonicalNorthstarGroundTruthReplay";

const FIXED_TIME = Date.parse("2026-07-22T20:00:00.000Z");
const EVIDENCE_DIRECTORY = path.join(
  process.cwd(),
  "engine",
  "benchmark",
  "high-volume",
  "northstar",
  "evidence",
);

type TargetConcept = {
  id: string;
  label: string;
  phrases: string[];
};

const TARGET_CONCEPTS: TargetConcept[] = [
  {
    id: "concurrent-work",
    label: "Excessive concurrent work",
    phrases: [
      "concurrent work",
      "work in progress",
      "active simultaneously",
      "active initiatives",
      "active projects",
    ],
  },
  {
    id: "priority-dilution",
    label: "Priority dilution and sequencing failure",
    phrases: [
      "priority overload",
      "priority conflict",
      "competing priorities",
      "focus fragmentation",
      "reprioritization",
      "de-prioritization",
      "sequence work",
      "reduce active work",
      "reducing concurrent work",
      "stopping lower-value work",
    ],
  },
  {
    id: "capacity-pressure",
    label: "Execution capacity pressure",
    phrases: [
      "capacity constraint",
      "execution capacity",
      "resource constraint",
      "capacity is fragmented",
      "loses throughput",
      "workload",
      "interruption",
    ],
  },
  {
    id: "staffing-sufficient",
    label: "Existing staffing is sufficient",
    phrases: [
      "staffing is sufficient",
      "current staffing is sufficient",
      "existing staffing is sufficient",
      "headcount is sufficient",
      "unchanged staffing",
      "adequate nominal capacity",
      "without additional headcount",
      "without adding headcount",
    ],
  },
  {
    id: "staffing-not-root",
    label: "Staffing is not the primary constraint",
    phrases: [
      "staffing is not",
      "not a staffing",
      "headcount is not",
      "hiring is not",
      "rather than staffing",
      "insufficient staffing",
      "not the primary constraint",
    ],
  },
  {
    id: "staffing-positive",
    label: "Competing insufficient-staffing claim",
    phrases: [
      "shortage of engineering capacity",
      "insufficient staffing",
      "additional hires",
      "increase headcount",
      "hire more",
      "add engineers",
    ],
  },
];

const CONCURRENCY_IDS = [
  "ns-artifact-021",
  "ns-artifact-022",
  "ns-artifact-023",
  "ns-artifact-027",
  "ns-artifact-028",
  "ns-artifact-044",
];
const STAFFING_IDS = [
  "ns-artifact-009",
  "ns-artifact-027",
  "ns-artifact-029",
  "ns-artifact-041",
  "ns-artifact-042",
  "ns-artifact-048",
];
const COMBINED_IDS = Array.from(new Set([...CONCURRENCY_IDS, ...STAFFING_IDS]));
const SUPPORTING_WITHOUT_CONTRADICTION_IDS = COMBINED_IDS.filter(
  (id) => id !== "ns-artifact-029",
);
const IRRELEVANT_PLAUSIBLE_IDS = ["ns-artifact-030", "ns-artifact-031"];

type TraceObject = {
  id: string | null;
  text: string;
  confidence: number | null;
  scope: string | null;
  references: Record<string, string[]>;
  matchedConcepts: string[];
};

type StageTrace = {
  stage: string;
  totalObjects: number;
  relevantObjects: TraceObject[];
  conceptPresence: Record<string, boolean>;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
  }
  return [];
}

function objectText(value: unknown): string {
  return collectStrings(value).join(" ");
}

function matchedConcepts(value: unknown): string[] {
  const text = normalize(objectText(value));
  const negatesPositiveStaffingClaim = [
    "staffing may not",
    "staffing is not",
    "more by prioritization",
    "rather than staffing",
    "not the primary",
    "staffing is sufficient",
    "unchanged staffing",
    "adequate nominal capacity",
    "without additional headcount",
    "without adding headcount",
  ].some((phrase) => text.includes(normalize(phrase)));

  return TARGET_CONCEPTS.filter((concept) => {
    if (concept.id === "staffing-positive" && negatesPositiveStaffingClaim) {
      return false;
    }

    return concept.phrases.some((phrase) => text.includes(normalize(phrase)));
  }).map((concept) => concept.id);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function traceObject(value: unknown): TraceObject {
  const object =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const references = Object.fromEntries(
    Object.entries(object)
      .filter(([key, item]) => /Ids?$/.test(key) && Array.isArray(item))
      .map(([key, item]) => [key, stringArray(item)]),
  );

  return {
    id: typeof object.id === "string" ? object.id : null,
    text: collectStrings({
      text: object.text,
      title: object.title,
      label: object.label,
      name: object.name,
      statement: object.statement,
      summary: object.summary,
      description: object.description,
      explanation: object.explanation,
      rationale: object.rationale,
      whyItMatters: object.whyItMatters,
      recommendedExecutiveAction: object.recommendedExecutiveAction,
      executiveNarrative: object.executiveNarrative,
      executiveRecommendation: object.executiveRecommendation,
    }).join(" | "),
    confidence:
      typeof object.confidence === "number" ? object.confidence : null,
    scope: typeof object.scope === "string" ? object.scope : null,
    references,
    matchedConcepts: matchedConcepts(value),
  };
}

function stage(stageName: string, value: unknown): StageTrace {
  const objects = Array.isArray(value)
    ? value
    : value === null || value === undefined
      ? []
      : [value];
  const relevantObjects = objects
    .filter((item) => matchedConcepts(item).length > 0)
    .map(traceObject);

  return {
    stage: stageName,
    totalObjects: objects.length,
    relevantObjects,
    conceptPresence: Object.fromEntries(
      TARGET_CONCEPTS.map((concept) => [
        concept.id,
        relevantObjects.some((item) =>
          item.matchedConcepts.includes(concept.id),
        ),
      ]),
    ),
  };
}

function memoryStages(runtime: OrganizationRuntime): StageTrace[] {
  const memory = runtime.memory as typeof runtime.memory &
    Record<string, unknown>;
  const understandingState = memory.understandingState as
    | DiscoveryV3Result
    | undefined;
  const phenomenaState = memory.organizationalPhenomenaState as
    | { phenomena?: unknown[] }
    | undefined;
  const mechanismNetwork = memory.mechanismNetwork as
    | { mechanisms?: unknown[] }
    | undefined;
  const organizationalUnderstandingState =
    memory.organizationalUnderstandingState as
      | { currentUnderstandings?: unknown[] }
      | undefined;

  return [
    stage("evidence", understandingState?.evidence),
    stage("entities", runtime.organizationModel.entities),
    stage("signals", understandingState?.signals),
    stage("themes", understandingState?.themes),
    stage("legacy-observations-current", understandingState?.observations),
    stage("longitudinal-observations", memory.observations),
    stage("contradictions", understandingState?.contradictions),
    stage("legacy-mechanisms", understandingState?.mechanisms),
    stage("causal-chains", understandingState?.causalChains),
    stage("explanations", understandingState?.explanations),
    stage("legacy-beliefs", understandingState?.beliefs),
    stage("canonical-understanding", understandingState?.understanding),
    stage(
      "legacy-executive-understanding",
      understandingState?.executiveUnderstanding,
    ),
    stage("phenomena", phenomenaState?.phenomena),
    stage("mechanisms", mechanismNetwork?.mechanisms),
    stage("beliefs", memory.organizationalBeliefs ?? memory.beliefs),
    stage("theories", memory.theories),
    stage("conditions", memory.organizationalConditions),
    stage("organizational-state", memory.organizationalState),
    stage("executive-assessment", memory.executiveAssessment),
    stage(
      "organizational-understanding",
      organizationalUnderstandingState?.currentUnderstandings,
    ),
    stage("executive-recommendation", memory.executiveRecommendation),
  ];
}

function readArtifact(artifact: NorthstarEvidenceArtifact): string {
  return fs.readFileSync(
    path.join(EVIDENCE_DIRECTORY, artifact.filename),
    "utf8",
  );
}

function artifactsById(ids: string[]): NorthstarEvidenceArtifact[] {
  const requested = new Set(ids);
  return northstarEvidenceManifest.artifacts.filter((artifact) =>
    requested.has(artifact.id),
  );
}

function buildContext(artifacts: NorthstarEvidenceArtifact[]): string {
  return artifacts
    .map((artifact) =>
      [
        `Evidence Artifact ID: ${artifact.id}`,
        `Evidence Sequence: ${artifact.sequence}`,
        `Evidence Batch: ${artifact.batch}`,
        `Evidence Title: ${artifact.title}`,
        `Evidence Owner: ${artifact.owner}`,
        `Evidence Function: ${artifact.function}`,
        `Evidence Effective Date: ${artifact.effectiveDate}`,
        `Evidence Reliability: ${artifact.reliability}`,
        `Evidence Bias: ${artifact.bias}`,
        `Evidence Stale: ${artifact.stale ? "yes" : "no"}`,
        "",
        "Document:",
        readArtifact(artifact),
      ].join("\n"),
    )
    .join("\n\n");
}

function withDeterministicEnvironment<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  const originalLog = console.log;
  let clockTick = 0;
  let randomState = 0x1032026;

  class DeterministicDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length > 0) {
        super(...args);
      } else {
        super(FIXED_TIME + clockTick++);
      }
    }

    static now(): number {
      return FIXED_TIME + clockTick++;
    }
  }

  globalThis.Date = DeterministicDate as DateConstructor;
  Math.random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };
  console.log = () => undefined;

  try {
    return operation();
  } finally {
    globalThis.Date = OriginalDate;
    Math.random = originalRandom;
    console.log = originalLog;
  }
}

function runControl(
  id: string,
  artifactIds: string[],
  reverse = false,
) {
  const selected = artifactsById(artifactIds);
  const ordered = reverse ? [...selected].reverse() : selected;
  const input = {
    company: northstarCompanyFixture.organization.name,
    website: "",
    industry: northstarCompanyFixture.organization.industry,
    question:
      "What is happening inside Northstar Industrial Systems, why is it happening, and what should executives focus on next?",
    context: buildContext(ordered),
  };

  return withDeterministicEnvironment(() => {
    const result = runDiscoveryV3(input);
    const runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId: `northstar-trace-${id}`,
        name: northstarCompanyFixture.organization.name,
        industry: northstarCompanyFixture.organization.industry,
      }),
      result,
      input,
    });

    return {
      id,
      artifactIds: ordered.map((artifact) => artifact.id),
      stages: [
        stage("evidence", result.evidence),
        stage("signals", result.signals),
        stage("themes", result.themes),
        stage("observations", result.observations),
        stage("contradictions", result.contradictions),
        stage("legacy-mechanisms", result.mechanisms),
        stage("causal-chains", result.causalChains),
        stage("explanations", result.explanations),
        stage("legacy-beliefs", result.beliefs),
        stage("canonical-understanding", result.understanding),
        stage("legacy-executive-understanding", result.executiveUnderstanding),
        ...memoryStages(runtime).filter((item) =>
          [
            "phenomena",
            "mechanisms",
            "beliefs",
            "conditions",
            "executive-assessment",
            "executive-recommendation",
          ].includes(item.stage),
        ),
      ],
    };
  });
}

function sourceEvidence() {
  return northstarEvidenceManifest.artifacts
    .filter((artifact) =>
      [
        ...COMBINED_IDS,
        ...IRRELEVANT_PLAUSIBLE_IDS,
        "ns-artifact-002",
        "ns-artifact-024",
      ].includes(artifact.id),
    )
    .map((artifact) => ({
      id: artifact.id,
      sequence: artifact.sequence,
      title: artifact.title,
      stale: artifact.stale,
      reliability: artifact.reliability,
      bias: artifact.bias,
      contradictsArtifactIds: artifact.contradictsArtifactIds,
      supportsGroundTruth: artifact.supportsGroundTruth,
      supportsMisleadingNarratives: artifact.supportsMisleadingNarratives,
      expectedCognitiveEffects: artifact.expectedCognitiveEffects,
      matchedConcepts: matchedConcepts(readArtifact(artifact)),
    }));
}

const canonicalRuntime = runCanonicalNorthstarGroundTruthReplay();
const report = {
  generatedAt: "2026-07-22T20:00:00.000Z",
  researchQuestion:
    "Does concurrency or staffing meaning first disappear at Observations → Signals during the canonical isolated Northstar replay?",
  pipelineOrderEvidence: {
    legacyInvestigationOrder: [
      "evidence",
      "signals",
      "themes",
      "observations",
      "contradictions",
      "mechanisms",
    ],
    finding:
      "Signals are produced before legacy observations; Observations → Signals is not an executable boundary in runDiscoveryV3.",
  },
  targetConcepts: TARGET_CONCEPTS,
  sourceEvidence: sourceEvidence(),
  canonical: {
    organizationId: canonicalRuntime.metadata.organizationId,
    investigationCount: canonicalRuntime.metadata.investigationCount,
    stages: memoryStages(canonicalRuntime),
  },
  controls: [
    runControl("concurrency-only", CONCURRENCY_IDS),
    runControl("staffing-capacity-only", STAFFING_IDS),
    runControl("combined", SUPPORTING_WITHOUT_CONTRADICTION_IDS),
    runControl("combined-plus-contradiction", COMBINED_IDS),
    runControl("combined-plus-irrelevant", [
      ...COMBINED_IDS,
      ...IRRELEVANT_PLAUSIBLE_IDS,
    ]),
    runControl(
      "reversed-all-relevant",
      [...COMBINED_IDS].reverse(),
    ),
    runControl(
      "reversed-supporting-evidence",
      [...SUPPORTING_WITHOUT_CONTRADICTION_IDS].reverse(),
    ),
  ],
  signalProducer: {
    input: "V3Evidence[]",
    ruleThreshold: "one matching evidence object",
    assertionThreshold: "one matching evidence object",
    emergentThreshold: "two evidence objects sharing a non-generic keyword",
    confidence:
      "0.7 × average evidence confidence + support bonus capped at 0.18 + 0.08 strong-evidence bonus; assertions add up to 0.12 phrase-specificity bonus",
    deduplication: "normalized signal title",
    ordering: "descending confidence",
    selectionLimit: 12,
    scopeGrouping: "none",
    downstream:
      "all selected signals go to themes and legacy observations; only selected signals are retained in the investigation result",
  },
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
