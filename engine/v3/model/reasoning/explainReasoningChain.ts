import type {
  OrganizationalLeveragePoint,
  OrganizationalReasoningConclusion,
  OrganizationalReasoningPath,
} from "./reasoningTypes";

export function explainReasoningChains(input: {
  paths: OrganizationalReasoningPath[];
  leveragePoints: OrganizationalLeveragePoint[];
}): OrganizationalReasoningConclusion[] {
  const leverageByNodeId = new Map(
    input.leveragePoints.map((point) => [point.nodeId, point])
  );

  return input.paths
    .filter((path) => path.confidence >= 0.45)
    .map((path) => {
      const leveragePointIds = path.steps
        .map((step) => leverageByNodeId.get(step.toNodeId)?.id)
        .filter(Boolean) as string[];

      const claim = buildClaim(path);

      return {
        id: `conclusion_${path.id}`,
        pathId: path.id,

        claim,
        confidence: path.confidence,

        directness: path.directness,
        reasoningType: path.reasoningType,

        explanation: buildExplanation(path),
        evidenceChain: path.evidenceReferences,

        leveragePointIds,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 20);
}

function buildClaim(path: OrganizationalReasoningPath): string {
  if (path.directness === "direct") {
    return `${path.sourceLabel} directly influences ${path.targetLabel}.`;
  }

  if (path.directness === "emergent") {
    return `${path.sourceLabel} appears to create an emergent organizational effect on ${path.targetLabel}.`;
  }

  const bridge = path.steps
    .slice(0, -1)
    .map((step) => step.toLabel)
    .join(", ");

  return `${path.sourceLabel} indirectly influences ${path.targetLabel} through ${bridge}.`;
}

function buildExplanation(path: OrganizationalReasoningPath): string {
  const chain = path.steps
    .map(
      (step) =>
        `${step.fromLabel} ${step.relationship} ${step.toLabel}`
    )
    .join(" → ");

  return `Discovery reached this conclusion by following a ${path.pathLength}-step reasoning chain: ${chain}.`;
}