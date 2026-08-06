import type { CanonicalObservableArtifact, CanonicalObservableSnapshot, ObservableArtifact, ObservableAuthorization, ObservableOutput } from "./contracts";

const compare = (left: CanonicalObservableArtifact, right: CanonicalObservableArtifact) => left.kind.localeCompare(right.kind) || left.id.localeCompare(right.id);
const uniqueSorted = (values: string[]) => [...new Set(values)].sort();

function canonicalArtifact(artifact: CanonicalObservableArtifact): ObservableArtifact {
  if (!artifact.id || !artifact.organizationId || !artifact.statement.trim()) throw new Error("Observable artifact is incomplete.");
  if (artifact.confidence !== null && (!Number.isFinite(artifact.confidence) || artifact.confidence < 0 || artifact.confidence > 1)) throw new Error("Observable confidence is invalid.");
  return {
    ...artifact,
    statement: artifact.statement.trim(),
    supportingEvidenceIds: uniqueSorted(artifact.supportingEvidenceIds),
    opposingEvidenceIds: uniqueSorted(artifact.opposingEvidenceIds),
    competingArtifactIds: uniqueSorted(artifact.competingArtifactIds),
    understandingRefs: uniqueSorted(artifact.understandingRefs),
  };
}

export function normalizeObservableOutput(input: { snapshot: CanonicalObservableSnapshot; authorization: ObservableAuthorization }): ObservableOutput {
  if (input.snapshot.organizationId !== input.authorization.organizationId) throw new Error("Observable normalization organization mismatch.");
  const allowedEvidence = new Set(input.authorization.authorizedEvidenceIds);
  const allowedArtifacts = new Set(input.authorization.authorizedArtifactIds);
  const artifacts = input.snapshot.artifacts.filter((artifact) => {
    if (artifact.organizationId !== input.snapshot.organizationId) throw new Error("Observable snapshot contains cross-organization cognition.");
    if (!allowedArtifacts.has(artifact.id)) return false;
    return [...artifact.supportingEvidenceIds, ...artifact.opposingEvidenceIds].every((id) => allowedEvidence.has(id));
  }).map(canonicalArtifact).sort(compare);
  const byKind = (kind: CanonicalObservableArtifact["kind"]) => artifacts.filter((artifact) => artifact.kind === kind);
  return {
    contractVersion: "1", organizationId: input.snapshot.organizationId,
    findings: byKind("finding"), conditions: byKind("condition"), constraints: byKind("constraint"),
    conclusions: byKind("conclusion"), predictions: byKind("prediction"), contradictions: byKind("contradiction"),
    mechanisms: byKind("mechanism"), uncertainty: byKind("uncertainty"), evidenceGaps: byKind("evidence-gap"),
  };
}

function ordered(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, ordered(item)]));
  return value;
}

export function serializeObservableOutput(output: ObservableOutput): string { return JSON.stringify(ordered(output)); }

export function semanticObservableSignature(output: ObservableOutput): string {
  const artifacts = [output.findings, output.conditions, output.constraints, output.conclusions, output.predictions, output.contradictions, output.mechanisms, output.uncertainty, output.evidenceGaps].flat();
  return JSON.stringify(artifacts.map((artifact) => ({ kind: artifact.kind, statement: artifact.statement, confidence: artifact.confidence, unresolved: artifact.unresolved, priority: artifact.priority, expectedUtility: artifact.expectedUtility, justification: artifact.justification })).sort((left, right) => left.kind.localeCompare(right.kind) || left.statement.localeCompare(right.statement)));
}

