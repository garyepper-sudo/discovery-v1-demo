import type {
  OrganizationalExplanation,
  OrganizationalExplanationType,
} from "./organizationalJudgment";
import type { OrganizationalReasoningPath } from "../reasoning/reasoningTypes";

type SynthesizeExplanationsInput = {
  reasoningPaths: OrganizationalReasoningPath[];
  indirectEffects?: Array<{
    id: string;
    sourceNodeId?: string;
    targetNodeId?: string;
    summary?: string;
    description?: string;
    confidence?: number;
  }>;
  leveragePoints?: Array<{
    id: string;
    nodeId?: string;
    title?: string;
    summary?: string;
    description?: string;
    confidence?: number;
  }>;
  rootCauses?: Array<{
    id: string;
    nodeId?: string;
    title?: string;
    summary?: string;
    description?: string;
    confidence?: number;
  }>;
  executiveConclusions?: Array<{
    id: string;
    title?: string;
    summary?: string;
    conclusion?: string;
    confidence?: number;
  }>;
};

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const normalize = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const inferExplanationType = (
  path: OrganizationalReasoningPath,
): OrganizationalExplanationType => {
  if (path.reasoningType === "ownership") return "ownership";
  if (path.reasoningType === "constraint") return "constraint";
  if (path.reasoningType === "riskAmplification") return "risk";
  if (path.reasoningType === "capabilityFormation") return "capability";
  if (path.reasoningType === "causal") return "causal";
  if (path.reasoningType === "dependency") return "coordination";
  return "unknown";
};

const buildTitle = (path: OrganizationalReasoningPath): string =>
  `${path.sourceLabel} appears to influence ${path.targetLabel}`;

const buildSummary = (
  path: OrganizationalReasoningPath,
  relatedPathCount: number,
): string => {
  const relationship =
    path.steps[0]?.relationship ??
    path.reasoningType ??
    "organizational relationship";

  return `${path.sourceLabel} appears connected to ${path.targetLabel} through ${relationship}. This explanation is supported by ${relatedPathCount} related reasoning path${
    relatedPathCount === 1 ? "" : "s"
  }.`;
};

export function synthesizeExplanations(
  input: SynthesizeExplanationsInput,
): OrganizationalExplanation[] {
  const {
    reasoningPaths,
    indirectEffects = [],
    leveragePoints = [],
    rootCauses = [],
    executiveConclusions = [],
  } = input;

  const grouped = new Map<string, OrganizationalReasoningPath[]>();

  for (const path of reasoningPaths) {
    const key = normalize(
      `${path.reasoningType}:${path.sourceNodeId}:${path.targetNodeId}`,
    );

    const existing = grouped.get(key) ?? [];
    existing.push(path);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((paths, index) => {
    const primaryPath = paths[0];

    const pathIds = paths.map((path: OrganizationalReasoningPath) => path.id);

    const evidenceReferences = paths.flatMap(
      (path: OrganizationalReasoningPath) =>
        path.steps.flatMap(
          (step: OrganizationalReasoningPath["steps"][number]) =>
            step.evidenceReferences ?? [],
        ),
    );

    const sourceNodeIds = new Set(
      paths.map((path: OrganizationalReasoningPath) => path.sourceNodeId),
    );

    const targetNodeIds = new Set(
      paths.map((path: OrganizationalReasoningPath) => path.targetNodeId),
    );

    const relatedRootCauseIds = rootCauses
      .filter((item) => item.nodeId && sourceNodeIds.has(item.nodeId))
      .map((item) => item.id);

    const relatedLeveragePointIds = leveragePoints
      .filter(
        (item) =>
          item.nodeId &&
          (sourceNodeIds.has(item.nodeId) || targetNodeIds.has(item.nodeId)),
      )
      .map((item) => item.id);

    const explainedEffectIds = indirectEffects
      .filter(
        (item) =>
          (item.sourceNodeId && sourceNodeIds.has(item.sourceNodeId)) ||
          (item.targetNodeId && targetNodeIds.has(item.targetNodeId)),
      )
      .map((item) => item.id);

    const relatedExecutiveConclusionIds = executiveConclusions
      .filter((item) => {
        const text = normalize(
          `${item.title ?? ""} ${item.summary ?? ""} ${item.conclusion ?? ""}`,
        );

        return (
          text.includes(normalize(primaryPath.sourceLabel)) ||
          text.includes(normalize(primaryPath.targetLabel))
        );
      })
      .map((item) => item.id);

    const averagePathConfidence =
      paths.reduce(
        (sum: number, path: OrganizationalReasoningPath) =>
          sum + path.confidence,
        0,
      ) / paths.length;

    const confidence = clamp01(
      averagePathConfidence +
        Math.min(0.15, evidenceReferences.length * 0.01) +
        Math.min(0.1, explainedEffectIds.length * 0.03) +
        Math.min(0.1, relatedRootCauseIds.length * 0.04),
    );

    return {
      id: `organizational-explanation-${index + 1}`,
      title: buildTitle(primaryPath),
      summary: buildSummary(primaryPath, paths.length),

      explanationType: inferExplanationType(primaryPath),

      supportedPathIds: pathIds,
      explainedEffectIds,
      relatedRootCauseIds,
      relatedLeveragePointIds,
      relatedExecutiveConclusionIds,

      assumptions:
        primaryPath.pathLength > 2
          ? ["This explanation depends on a multi-step reasoning chain."]
          : [],

      evidenceReferences,

      confidence,
    };
  });
}