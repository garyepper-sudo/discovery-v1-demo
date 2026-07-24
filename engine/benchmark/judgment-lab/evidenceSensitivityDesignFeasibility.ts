import assert from "node:assert/strict";

import {
  atlasDecisiveEvidenceIds,
  atlasIndustrialArtifacts,
  atlasIndustrialOrganization,
} from "./atlasIndustrialPilot";
import type { SyntheticEvidenceArtifact } from "./contracts";

type DiagnosticArtifact = SyntheticEvidenceArtifact & {
  opposition?: "supports" | "opposes" | "neutral";
  diagnosticStrength?: number;
  stableSourceId?: string;
};

type Option = "raw-count" | "source-aware" | "weighted" | "targeted-opposition" | "combined";

type Score = {
  support: number;
  opposition: number;
  net: number;
  independentGroups: number;
};

const fixedNow = Date.parse("2026-07-01T12:00:00.000Z");
const options: Option[] = [
  "raw-count",
  "source-aware",
  "weighted",
  "targeted-opposition",
  "combined",
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function semanticGroup(artifact: DiagnosticArtifact): string {
  return artifact.stableSourceId ?? normalize(artifact.content);
}

function reliabilityWeight(
  reliability: DiagnosticArtifact["reliability"],
): number {
  if (reliability === "high") return 1;
  if (reliability === "moderate") return 0.7;
  return 0.4;
}

function recencyWeight(artifact: DiagnosticArtifact): number {
  if (artifact.staleness === "current") return 1;
  if (artifact.staleness === "aging") return 0.75;
  return 0.45;
}

function contribution(
  artifact: DiagnosticArtifact,
  option: Option,
): number {
  const diagnostic = artifact.diagnosticStrength ?? 0.6;
  const reliability =
    option === "weighted" || option === "combined"
      ? reliabilityWeight(artifact.reliability)
      : 1;
  const recency =
    option === "weighted" || option === "combined"
      ? recencyWeight(artifact)
      : 1;
  return diagnostic * reliability * recency;
}

function score(
  artifacts: DiagnosticArtifact[],
  option: Option,
): Score {
  const groups = new Map<string, DiagnosticArtifact[]>();
  for (const artifact of artifacts) {
    const group =
      option === "source-aware" || option === "combined"
        ? semanticGroup(artifact)
        : artifact.id;
    groups.set(group, [...(groups.get(group) ?? []), artifact]);
  }

  let support = 0;
  let opposition = 0;
  for (const group of groups.values()) {
    const strongest = group
      .map((artifact) => ({
        artifact,
        contribution: contribution(artifact, option),
      }))
      .sort(
        (left, right) =>
          right.contribution - left.contribution ||
          left.artifact.id.localeCompare(right.artifact.id),
      )[0];
    if (!strongest) continue;

    if (
      (option === "targeted-opposition" || option === "combined") &&
      strongest.artifact.opposition === "opposes"
    ) {
      opposition += strongest.contribution;
    } else if (strongest.artifact.opposition !== "neutral") {
      support += strongest.contribution;
    }
  }

  return {
    support: Number(support.toFixed(4)),
    opposition: Number(opposition.toFixed(4)),
    net: Number((support - opposition).toFixed(4)),
    independentGroups: groups.size,
  };
}

function clone(
  artifacts: SyntheticEvidenceArtifact[],
): DiagnosticArtifact[] {
  return artifacts.map((artifact) => ({
    ...artifact,
    opposition: atlasDecisiveEvidenceIds.includes(artifact.id)
      ? "supports"
      : "neutral",
    diagnosticStrength: atlasDecisiveEvidenceIds.includes(artifact.id)
      ? 0.9
      : 0.2,
    stableSourceId: artifact.id,
  }));
}

const baseline = clone(atlasIndustrialArtifacts);
const removed = baseline.filter(
  (artifact) => !atlasDecisiveEvidenceIds.includes(artifact.id),
);
const weakened = baseline.map((artifact) =>
  atlasDecisiveEvidenceIds.includes(artifact.id)
    ? { ...artifact, reliability: "low" as const }
    : artifact
);
const stale = baseline.map((artifact) =>
  atlasDecisiveEvidenceIds.includes(artifact.id)
    ? {
        ...artifact,
        createdAt: "2023-06-01T12:00:00.000Z",
        staleness: "stale" as const,
      }
    : artifact
);
const contradicted: DiagnosticArtifact[] = [
  ...baseline,
  {
    id: "A17",
    organizationId: atlasIndustrialOrganization.id,
    title: "Independent decision-quality review",
    artifactType: "decision-log",
    authorRole: "Internal Audit",
    createdAt: "2026-06-17T12:00:00.000Z",
    reliability: "high",
    staleness: "current",
    content:
      "After controlling for complexity, delegated decisions had more defects and executive review protected decision quality.",
    opposition: "opposes",
    diagnosticStrength: 0.85,
    stableSourceId: "independent-audit:A17",
  },
];
const duplicated: DiagnosticArtifact[] = [
  ...baseline,
  ...baseline
    .filter((artifact) => atlasDecisiveEvidenceIds.includes(artifact.id))
    .map((artifact) => ({
      ...artifact,
      id: `${artifact.id}-duplicate`,
      stableSourceId: artifact.stableSourceId,
    })),
];
const contextRemoved = baseline.filter(
  (artifact) => !["A08", "A10", "A16"].includes(artifact.id),
);
const irrelevant: DiagnosticArtifact[] = [
  ...baseline,
  {
    id: "A19",
    organizationId: atlasIndustrialOrganization.id,
    title: "Facilities update",
    artifactType: "other",
    authorRole: "Facilities",
    createdAt: "2026-06-19T12:00:00.000Z",
    reliability: "high",
    staleness: "current",
    content: "Meeting-room chairs were replaced.",
    opposition: "neutral",
    diagnosticStrength: 0,
    stableSourceId: "facilities:A19",
  },
];
const delayed = baseline.map((artifact) =>
  atlasDecisiveEvidenceIds.includes(artifact.id)
    ? {
        ...artifact,
        createdAt: "2026-06-30T12:00:00.000Z",
        staleness: "current" as const,
      }
    : artifact
);

const scenarios = {
  baseline,
  removed,
  weakened,
  stale,
  contradicted,
  duplicated,
  contextRemoved,
  irrelevant,
  delayed,
};

const matrix = Object.fromEntries(
  Object.entries(scenarios).map(([scenario, artifacts]) => [
    scenario,
    Object.fromEntries(
      options.map((option) => [option, score(artifacts, option)]),
    ),
  ]),
);

const first = JSON.stringify(matrix);
const second = JSON.stringify(
  Object.fromEntries(
    Object.entries(scenarios).map(([scenario, artifacts]) => [
      scenario,
      Object.fromEntries(
        options.map((option) => [option, score(artifacts, option)]),
      ),
    ]),
  ),
);

assert.equal(first, second);
assert.equal(
  matrix.duplicated["source-aware"].net,
  matrix.baseline["source-aware"].net,
);
assert.ok(matrix.weakened.weighted.net < matrix.baseline.weighted.net);
assert.ok(matrix.stale.weighted.net < matrix.baseline.weighted.net);
assert.ok(
  matrix.contradicted["targeted-opposition"].net <
    matrix.baseline["targeted-opposition"].net,
);
assert.equal(matrix.irrelevant.combined.net, matrix.baseline.combined.net);

console.log("EVIDENCE SENSITIVITY DESIGN FEASIBILITY");
console.log(JSON.stringify({
  fixedNow: new Date(fixedNow).toISOString(),
  canonicalObjectsModified: false,
  productionSemanticsBypassed: [
    "stableSourceId is supplied by the benchmark adapter",
    "artifact reliability and staleness exist only in the fixture",
    "opposition direction is supplied by the benchmark adapter",
    "diagnostic strength is supplied by the benchmark adapter",
    "scores are not fed back into canonical cognition",
  ],
  interpretation: {
    sourceAware:
      "Faithfully demonstrates that stable grouping can neutralize exact copies, but canonical V3Evidence lacks the required stable source field.",
    weighted:
      "Directionally demonstrates reliability and recency weighting, but cannot reproduce production behavior because those fields are lost before V3Evidence.",
    targetedOpposition:
      "Directionally demonstrates target-specific weakening, but is not production-feasible without a producer that supplies the opposition target.",
    combined:
      "Shows compatible arithmetic only; it is not evidence that a broad combined production intervention is safe.",
  },
  matrix,
}, null, 2));
