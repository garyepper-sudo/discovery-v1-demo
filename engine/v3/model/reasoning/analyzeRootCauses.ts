import type {
  OrganizationalReasoningPath,
  OrganizationalRootCause,
} from "./reasoningTypes";

export function analyzeRootCauses(
  paths: OrganizationalReasoningPath[]
): OrganizationalRootCause[] {
  const rootCauseByNodeId = new Map<string, OrganizationalRootCause>();

  for (const path of paths) {
    if (path.pathLength < 2) continue;
    if (path.confidence < 0.45) continue;

    const sourceNodeId = path.sourceNodeId;
    const sourceLabel = path.sourceLabel;

    const existing = rootCauseByNodeId.get(sourceNodeId);

    const severity = inferSeverity(path);
    const executiveRelevance = path.executiveRelevance;
    const confidence = path.confidence;

    if (!existing) {
      rootCauseByNodeId.set(sourceNodeId, {
        id: `root_cause_${sourceNodeId}`,
        nodeId: sourceNodeId,
        label: sourceLabel,

        affectedNodeIds: [path.targetNodeId],
        affectedLabels: [path.targetLabel],

        reason: `${sourceLabel} appears upstream of multiple organizational effects, including ${path.targetLabel}.`,
        confidence,
        severity,
        executiveRelevance,

        supportingPathIds: [path.id],
        evidenceReferences: path.evidenceReferences,
      });
    } else {
      rootCauseByNodeId.set(sourceNodeId, {
        ...existing,
        affectedNodeIds: dedupe([...existing.affectedNodeIds, path.targetNodeId]),
        affectedLabels: dedupe([...existing.affectedLabels, path.targetLabel]),

        reason: buildReason(
          sourceLabel,
          dedupe([...existing.affectedLabels, path.targetLabel])
        ),

        confidence: Math.max(existing.confidence, confidence),
        severity: Math.max(existing.severity, severity),
        executiveRelevance: Math.max(
          existing.executiveRelevance,
          executiveRelevance
        ),

        supportingPathIds: dedupe([...existing.supportingPathIds, path.id]),
        evidenceReferences: dedupeEvidence([
          ...existing.evidenceReferences,
          ...path.evidenceReferences,
        ]),
      });
    }
  }

  return [...rootCauseByNodeId.values()]
    .filter((rootCause) => rootCause.affectedNodeIds.length >= 2)
    .sort(
      (a, b) =>
        b.severity +
        b.executiveRelevance +
        b.confidence +
        b.affectedNodeIds.length * 0.1 -
        (a.severity +
          a.executiveRelevance +
          a.confidence +
          a.affectedNodeIds.length * 0.1)
    )
    .slice(0, 10);
}

function inferSeverity(path: OrganizationalReasoningPath): number {
  const text = [
    path.sourceLabel,
    path.targetLabel,
    path.summary,
    ...path.steps.flatMap((step) => [
      step.fromLabel,
      step.relationship,
      step.toLabel,
    ]),
  ]
    .join(" ")
    .toLowerCase();

  const severityTerms = [
    "customer",
    "friction",
    "delay",
    "failure",
    "risk",
    "burnout",
    "bottleneck",
    "support",
    "revenue",
    "execution",
  ];

  const matches = severityTerms.filter((term) => text.includes(term)).length;

  return clamp(0.4 + matches * 0.08 + path.causalStrength * 0.25);
}

function buildReason(sourceLabel: string, affectedLabels: string[]): string {
  const affected = affectedLabels.slice(0, 4).join(", ");

  return `${sourceLabel} appears to be an upstream driver connected to several downstream organizational effects, including ${affected}.`;
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

function dedupeEvidence<T>(items: T[]): T[] {
  return [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}