import type { InvestigationEvidenceSource } from "../../types";
import {
  atlasIndustrialArtifacts,
  atlasIndustrialOrganization,
} from "./atlasIndustrialPilot";
import type { SyntheticEvidenceArtifact } from "./contracts";

export type ProvenancePilotCase = {
  id: string;
  artifacts: SyntheticEvidenceArtifact[];
  evidenceSources: InvestigationEvidenceSource[];
};

const reliabilityValue: Record<
  SyntheticEvidenceArtifact["reliability"],
  number
> = {
  high: 0.9,
  moderate: 0.7,
  low: 0.4,
};

function artifactBlock(artifact: SyntheticEvidenceArtifact): string {
  return [
    `Artifact: ${artifact.id}`,
    `Title: ${artifact.title}`,
    `Type: ${artifact.artifactType}`,
    `Author role: ${artifact.authorRole}`,
    `Created: ${artifact.createdAt}`,
    `Reliability: ${artifact.reliability}`,
    `Staleness: ${artifact.staleness}`,
    artifact.content,
  ].join("\n");
}

export function buildLegacyArtifactContext(
  artifacts: SyntheticEvidenceArtifact[],
): string {
  return artifacts.map(artifactBlock).join("\n\n");
}

export function buildProvenanceSources(
  artifacts: SyntheticEvidenceArtifact[],
  sourceIdByArtifactId: Record<string, string> = {},
): InvestigationEvidenceSource[] {
  return artifacts.map((artifact) => ({
    sourceId: sourceIdByArtifactId[artifact.id] ?? `artifact:${artifact.id}`,
    sourceType: artifact.artifactType,
    observedAt: artifact.createdAt,
    reliability: reliabilityValue[artifact.reliability],
    content: artifactBlock(artifact),
  }));
}

function cloneArtifacts(): SyntheticEvidenceArtifact[] {
  return atlasIndustrialArtifacts.map((artifact) => ({ ...artifact }));
}

const baselineArtifacts = cloneArtifacts();

const duplicateArtifacts = [
  ...cloneArtifacts(),
  {
    ...atlasIndustrialArtifacts.find((artifact) => artifact.id === "A04")!,
    id: "A04-copy",
  },
];

const weakenedArtifacts = cloneArtifacts().map((artifact) =>
  artifact.id === "A04"
    ? { ...artifact, reliability: "low" as const }
    : artifact
);

const staleArtifacts = cloneArtifacts().map((artifact) =>
  artifact.id === "A04"
    ? {
        ...artifact,
        createdAt: "2023-06-04T12:00:00.000Z",
        staleness: "stale" as const,
      }
    : artifact
);

const contradictionArtifact: SyntheticEvidenceArtifact = {
  id: "A17",
  organizationId: atlasIndustrialOrganization.id,
  title: "Independent decision-quality review",
  artifactType: "decision-log",
  authorRole: "Internal Audit",
  createdAt: "2026-06-17T12:00:00.000Z",
  reliability: "high",
  staleness: "current",
  content:
    "After controlling for decision complexity, delegated decisions had more defects. Executive review protected decision quality without adding material elapsed time.",
};

const contradictionArtifacts = [
  ...cloneArtifacts(),
  contradictionArtifact,
];

export const atlasIndustrialProvenanceCases: ProvenancePilotCase[] = [
  {
    id: "baseline",
    artifacts: baselineArtifacts,
    evidenceSources: buildProvenanceSources(baselineArtifacts),
  },
  {
    id: "exact-duplicate",
    artifacts: duplicateArtifacts,
    evidenceSources: buildProvenanceSources(duplicateArtifacts, {
      A04: "artifact:A04",
      "A04-copy": "artifact:A04",
    }),
  },
  {
    id: "weakened",
    artifacts: weakenedArtifacts,
    evidenceSources: buildProvenanceSources(weakenedArtifacts),
  },
  {
    id: "stale",
    artifacts: staleArtifacts,
    evidenceSources: buildProvenanceSources(staleArtifacts),
  },
  {
    id: "contradicted",
    artifacts: contradictionArtifacts,
    evidenceSources: buildProvenanceSources(contradictionArtifacts),
  },
];
