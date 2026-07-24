import type {
  OrganizationalExplanationSeed,
  OrganizationalExplanationType,
  OrganizationalOutcomeRef,
  OrganizationalScopeRef,
} from "./organizationalJudgment";
import type { OrganizationalReasoningPath } from "../reasoning/reasoningTypes";

type SynthesizeExplanationsInput = {
  organizationId: string;
  scope?: OrganizationalScopeRef;
  generatedAt?: string;
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

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const hash = (value: string): string => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16).padStart(8, "0");
};

const relationshipId = (
  step: OrganizationalReasoningPath["steps"][number],
): string =>
  `${step.fromNodeId}->${normalize(step.relationship)}->${step.toNodeId}`;

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

export function synthesizeExplanationSeeds(
  input: SynthesizeExplanationsInput,
): OrganizationalExplanationSeed[] {
  const {
    organizationId,
    scope = {
      organizationId,
      type: "organization",
      id: organizationId,
    },
    generatedAt = new Date().toISOString(),
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

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, paths]) => {
    const primaryPath = paths[0];

    const pathIds = paths
      .map((path: OrganizationalReasoningPath) => path.id)
      .sort();
    const reasoningRelationshipIds = Array.from(
      new Set(paths.flatMap((path) => path.steps.map(relationshipId))),
    ).sort();

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

    const relatedIndirectEffects = indirectEffects
      .filter(
        (item) =>
          (item.sourceNodeId && sourceNodeIds.has(item.sourceNodeId)) ||
          (item.targetNodeId && targetNodeIds.has(item.targetNodeId)),
      )
      .sort((left, right) => left.id.localeCompare(right.id));
    const explainedEffectIds = relatedIndirectEffects.map((item) => item.id);
    const outcomeRefs: OrganizationalOutcomeRef[] = [
      ...Array.from(targetNodeIds)
        .sort()
        .map((id) => ({ type: "reasoningNode" as const, id })),
      ...relatedIndirectEffects.map((item) => ({
        type: "indirectEffect" as const,
        id: item.id,
      })),
    ];
    const evidenceIds = Array.from(
      new Set(
        evidenceReferences
          .filter((reference) => reference.type === "evidence")
          .map((reference) => reference.id),
      ),
    ).sort();
    const semanticKey = stable({
      organizationId,
      scope,
      reasoningRelationshipIds,
      sourceNodeId: primaryPath.sourceNodeId,
      outcomeRefs,
    });

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
      id: `organizational-explanation-seed:${hash(semanticKey)}`,
      organizationId,
      semanticKey,
      title: buildTitle(primaryPath),
      summary: buildSummary(primaryPath, paths.length),

      explanationType: inferExplanationType(primaryPath),

      scope,
      outcomeRefs,
      reasoningPathIds: pathIds,
      reasoningRelationshipIds,
      evidenceIds,

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
      generatedAt,
    };
  });
}

/**
 * Transitional source compatibility. New production code should use the
 * semantically explicit seed producer.
 */
export const synthesizeExplanations = synthesizeExplanationSeeds;
