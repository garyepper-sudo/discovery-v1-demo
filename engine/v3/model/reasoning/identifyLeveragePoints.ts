import type {
  OrganizationalLeveragePoint,
  OrganizationalReasoningPath,
} from "./reasoningTypes";

export function identifyLeveragePoints(
  paths: OrganizationalReasoningPath[]
): OrganizationalLeveragePoint[] {
  const leverageByNode = new Map<string, OrganizationalLeveragePoint>();

  for (const path of paths) {
    if (path.pathLength < 2) continue;

    const internalSteps = path.steps.slice(0, -1);

    for (const step of internalSteps) {
      const existing = leverageByNode.get(step.toNodeId);

      const upstreamNodeIds = [path.sourceNodeId];
      const downstreamNodeIds = [path.targetNodeId];

      const interventionPotential = Math.min(
        1,
        path.executiveRelevance * 0.45 +
          path.causalStrength * 0.35 +
          path.confidence * 0.2
      );

      if (!existing) {
        leverageByNode.set(step.toNodeId, {
          id: `leverage_${step.toNodeId}`,
          nodeId: step.toNodeId,
          label: step.toLabel,

          reason: `${step.toLabel} appears to connect upstream influence from ${path.sourceLabel} to downstream effects on ${path.targetLabel}.`,
          interventionPotential,
          confidence: path.confidence,

          upstreamNodeIds,
          downstreamNodeIds,

          evidenceReferences: path.evidenceReferences,
        });
      } else {
        leverageByNode.set(step.toNodeId, {
          ...existing,
          interventionPotential: Math.max(
            existing.interventionPotential,
            interventionPotential
          ),
          confidence: Math.max(existing.confidence, path.confidence),
          upstreamNodeIds: dedupe([...existing.upstreamNodeIds, ...upstreamNodeIds]),
          downstreamNodeIds: dedupe([
            ...existing.downstreamNodeIds,
            ...downstreamNodeIds,
          ]),
          evidenceReferences: dedupeEvidence([
            ...existing.evidenceReferences,
            ...path.evidenceReferences,
          ]),
        });
      }
    }
  }

  return [...leverageByNode.values()]
    .sort((a, b) => b.interventionPotential - a.interventionPotential)
    .slice(0, 12);
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)];
}

function dedupeEvidence<T>(items: T[]): T[] {
  return [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
}