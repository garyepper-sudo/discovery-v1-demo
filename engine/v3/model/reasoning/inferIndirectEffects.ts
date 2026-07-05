import type {
  OrganizationalIndirectEffect,
  OrganizationalReasoningPath,
} from "./reasoningTypes";

export function inferIndirectEffects(
  paths: OrganizationalReasoningPath[]
): OrganizationalIndirectEffect[] {
  return paths
    .filter((path) => path.pathLength >= 2)
    .filter((path) => path.confidence >= 0.45)
    .map((path) => ({
      id: `indirect_effect_${path.id}`,
      pathId: path.id,

      sourceNodeId: path.sourceNodeId,
      sourceLabel: path.sourceLabel,

      targetNodeId: path.targetNodeId,
      targetLabel: path.targetLabel,

      effect: `${path.sourceLabel} indirectly influences ${path.targetLabel} through ${describeBridge(path)}.`,
      confidence: Math.min(1, path.confidence * 0.95 + path.causalStrength * 0.05),
      evidenceReferences: path.evidenceReferences,
    }));
}

function describeBridge(path: OrganizationalReasoningPath): string {
  const middleSteps = path.steps.slice(0, -1);
  const bridgeLabels = middleSteps.map((step) => step.toLabel);

  return bridgeLabels.length
    ? bridgeLabels.join(", ")
    : "intermediate organizational relationships";
}