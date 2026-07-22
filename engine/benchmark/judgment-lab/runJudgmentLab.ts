import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { ExecutivePerspective, JudgmentLabRunResult, SyntheticEvidenceArtifact, SyntheticOrganizationSpec } from "./contracts";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => value && typeof value === "object" ? value as UnknownRecord : {};
const records = (value: unknown): UnknownRecord[] => Array.isArray(value) ? value.map(record) : [];
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
const text = (...values: unknown[]): string | undefined => values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();

export function selectPerspectiveArtifacts(artifacts: SyntheticEvidenceArtifact[], perspective: ExecutivePerspective, removedArtifactIds: string[] = []): SyntheticEvidenceArtifact[] {
  const allowed = new Set(perspective.evidenceAccess.includedArtifactIds);
  const removed = new Set(removedArtifactIds);
  return artifacts.filter((item) => allowed.has(item.id) && !removed.has(item.id)).sort((a, b) => a.id.localeCompare(b.id));
}

export function buildEngineEvidenceContext(artifacts: SyntheticEvidenceArtifact[]): string {
  return [...artifacts].sort((a, b) => a.id.localeCompare(b.id)).map((item) => [
    `Artifact: ${item.id}`,
    `Title: ${item.title}`,
    `Type: ${item.artifactType}`,
    `Author role: ${item.authorRole}`,
    `Created: ${item.createdAt}`,
    `Reliability: ${item.reliability}`,
    `Staleness: ${item.staleness}`,
    item.content,
  ].join("\n")).join("\n\n");
}

export function runJudgmentLab(params: {
  organization: SyntheticOrganizationSpec;
  artifacts: SyntheticEvidenceArtifact[];
  perspective: ExecutivePerspective;
  fixedTimestamp: string;
  removedArtifactIds?: string[];
}): JudgmentLabRunResult {
  const selected = selectPerspectiveArtifacts(params.artifacts, params.perspective, params.removedArtifactIds);
  const context = buildEngineEvidenceContext(selected);
  const input = {
    company: params.organization.name,
    website: "https://judgment-lab.invalid",
    industry: params.organization.industry,
    question: params.organization.investigationQuestion,
    context,
  };
  const originalLog = console.log;
  let result: ReturnType<typeof runDiscoveryV3>;
  let runtime: ReturnType<typeof evolveOrganizationRuntime>;

  try {
    console.log = () => undefined;
    result = runDiscoveryV3(input);
    runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({ organizationId: params.organization.id, name: params.organization.name, industry: params.organization.industry }),
      result,
      input,
    });
  } finally {
    console.log = originalLog;
  }
  const memory = record(runtime.memory);
  const understandingState = record(memory.organizationalUnderstandingState);
  const understanding = records(understandingState.currentUnderstandings)[0] ?? {};
  const constraint = record(memory.primaryExecutiveConstraint);
  const assessment = record(memory.executiveAssessment);
  const recommendation = record(memory.executiveRecommendation);
  const uncertainty = record(memory.organizationalUncertainty);
  const communication = record(memory.executiveCommunication);
  const mechanisms = records(record(memory.mechanismNetwork).mechanisms);
  const opportunities = records(memory.investigationOpportunities);

  return {
    organizationId: params.organization.id,
    perspectiveId: params.perspective.id,
    fixedTimestamp: params.fixedTimestamp,
    evidenceArtifactIds: selected.map((item) => item.id),
    engineInput: context,
    output: {
      dominantUnderstanding: text(understanding.statement, understanding.summary),
      primaryConstraint: text(constraint.title, record(assessment.primaryJudgment).title),
      causalMechanisms: mechanisms.map((item) => text(item.executiveName, item.title, item.summary)).filter((item): item is string => Boolean(item)).slice(0, 5),
      recommendation: text(recommendation.headline, recommendation.executiveRecommendation),
      recommendationDisposition: text(recommendation.status),
      confidence: typeof recommendation.confidence === "number" ? recommendation.confidence : typeof constraint.confidence === "number" ? constraint.confidence : undefined,
      uncertainty: [...strings(uncertainty.confidenceLimiters), ...records(uncertainty.drivers).map((item) => text(item.description)).filter((item): item is string => Boolean(item))].slice(0, 5),
      missingEvidence: opportunities.flatMap((item) => strings(item.missingEvidence)).slice(0, 8),
      supportingEvidenceIds: [...strings(understanding.evidenceIds), ...strings(constraint.supportingEvidenceIds)],
      communicationHeadline: text(communication.headline),
      communicationSummary: text(communication.executiveSummary),
    },
  };
}
