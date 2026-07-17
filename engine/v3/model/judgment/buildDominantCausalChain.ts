import type {
  BuildDominantCausalChainInput,
  CausalChainConditionLike,
  CausalChainMechanismLike,
  DominantCausalChainEdge,
  DominantCausalChainNode,
  ExecutiveDominantCausalChain,
} from "./executiveDominantCausalChainTypes";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function mechanismLabel(
  mechanism: CausalChainMechanismLike,
): string {
  return (
    mechanism.executiveName ||
    mechanism.title ||
    mechanism.id
  );
}

function selectRootMechanisms(params: {
  condition: CausalChainConditionLike;
  mechanisms: CausalChainMechanismLike[];
}): CausalChainMechanismLike[] {
  const byId = new Map(
    params.mechanisms.map(
      (mechanism) => [mechanism.id, mechanism],
    ),
  );

  return (params.condition.supportingMechanismIds ?? [])
    .map((id) => byId.get(id))
    .filter(
      (mechanism): mechanism is CausalChainMechanismLike =>
        Boolean(mechanism),
    )
    .sort(
      (left, right) =>
        (right.confidence ?? 0) -
        (left.confidence ?? 0),
    )
    .slice(0, 3);
}

function selectSupportingConditions(params: {
  condition: CausalChainConditionLike;
  conditions: CausalChainConditionLike[];
}): CausalChainConditionLike[] {
  const byId = new Map(
    params.conditions.map(
      (condition) => [condition.id, condition],
    ),
  );

  const upstream = (
    params.condition.upstreamConditionIds ?? []
  )
    .map((id) => byId.get(id))
    .filter(
      (condition): condition is CausalChainConditionLike =>
        Boolean(condition),
    );

  const downstream = (
    params.condition.downstreamConditionIds ?? []
  )
    .map((id) => byId.get(id))
    .filter(
      (condition): condition is CausalChainConditionLike =>
        Boolean(condition),
    );

  return unique([
    ...upstream,
    ...downstream,
  ]).slice(0, 4);
}

function buildNodes(params: {
  rootMechanisms: CausalChainMechanismLike[];
  dominantCondition: CausalChainConditionLike;
  supportingConditions: CausalChainConditionLike[];
  organizationalState?: BuildDominantCausalChainInput["organizationalState"];
}): DominantCausalChainNode[] {
  const mechanismNodes =
    params.rootMechanisms.map(
      (mechanism): DominantCausalChainNode => ({
        id: mechanism.id,
        type: "mechanism",
        label: mechanismLabel(mechanism),
        summary:
          mechanism.executiveSummary ??
          mechanism.summary,
        confidence:
          mechanism.confidence,
      }),
    );

  const conditionNodes = [
    ...params.supportingConditions.map(
      (condition): DominantCausalChainNode => ({
        id: condition.id,
        type: "condition",
        label: condition.name,
        summary: condition.summary,
        confidence: condition.confidence,
      }),
    ),
    {
      id: params.dominantCondition.id,
      type: "condition" as const,
      label: params.dominantCondition.name,
      summary: params.dominantCondition.summary,
      confidence: params.dominantCondition.confidence,
    },
  ];

  const stateNode =
    params.organizationalState
      ? [{
          id:
            params.organizationalState.id ??
            "organizational-state-current",
          type:
            "organizational_state" as const,
          label:
            params.organizationalState.status
              ? `Organizational State: ${params.organizationalState.status}`
              : "Organizational State",
          summary:
            params.organizationalState.summary,
          confidence:
            params.organizationalState.confidence,
        }]
      : [];

  return [
    ...mechanismNodes,
    ...conditionNodes,
    ...stateNode,
  ];
}

function buildEdges(params: {
  rootMechanisms: CausalChainMechanismLike[];
  dominantCondition: CausalChainConditionLike;
  supportingConditions: CausalChainConditionLike[];
  organizationalState?: BuildDominantCausalChainInput["organizationalState"];
}): DominantCausalChainEdge[] {
  const mechanismEdges =
    params.rootMechanisms.map(
      (mechanism): DominantCausalChainEdge => ({
        fromId: mechanism.id,
        toId: params.dominantCondition.id,
        relationship: "contributes_to",
      }),
    );

  const conditionEdges =
    params.supportingConditions.map(
      (condition): DominantCausalChainEdge => ({
        fromId: condition.id,
        toId: params.dominantCondition.id,
        relationship: "reinforces",
      }),
    );

  const stateEdges =
    params.organizationalState
      ? [{
          fromId:
            params.dominantCondition.id,
          toId:
            params.organizationalState.id ??
            "organizational-state-current",
          relationship:
            "shapes" as const,
        }]
      : [];

  return [
    ...mechanismEdges,
    ...conditionEdges,
    ...stateEdges,
  ];
}

function buildExecutiveExplanation(params: {
  rootMechanisms: CausalChainMechanismLike[];
  dominantCondition: CausalChainConditionLike;
  supportingConditions: CausalChainConditionLike[];
}): string {
  const mechanismNames =
    params.rootMechanisms.map(
      mechanismLabel,
    );

  const conditionNames =
    params.supportingConditions.map(
      (condition) => condition.name,
    );

  const mechanismSentence =
    mechanismNames.length > 0
      ? `${mechanismNames.join(", ")} ${
          mechanismNames.length === 1
            ? "is"
            : "are"
        } the strongest identified causal driver${
          mechanismNames.length === 1
            ? ""
            : "s"
        }.`
      : "Discovery has not yet identified a sufficiently strong mechanism-level driver.";

  const conditionSentence =
    conditionNames.length > 0
      ? `${params.dominantCondition.name} is reinforced by ${conditionNames.join(
          ", ",
        )}.`
      : `${params.dominantCondition.name} is currently the clearest condition-level constraint.`;

  return [
    mechanismSentence,
    conditionSentence,
    params.dominantCondition.whyItMatters,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildDominantCausalChain(
  input: BuildDominantCausalChainInput,
): ExecutiveDominantCausalChain {
  const dominantCondition =
    input.conditions.find(
      (condition) =>
        condition.id ===
        input.dominantConditionId,
    );

  if (!dominantCondition) {
    throw new Error(
      `Cannot build dominant causal chain: condition ${input.dominantConditionId} was not found.`,
    );
  }

  const rootMechanisms =
    selectRootMechanisms({
      condition: dominantCondition,
      mechanisms: input.mechanisms ?? [],
    });

  const supportingConditions =
    selectSupportingConditions({
      condition: dominantCondition,
      conditions: input.conditions,
    });

  const nodes =
    buildNodes({
      rootMechanisms,
      dominantCondition,
      supportingConditions,
      organizationalState:
        input.organizationalState,
    });

  const edges =
    buildEdges({
      rootMechanisms,
      dominantCondition,
      supportingConditions,
      organizationalState:
        input.organizationalState,
    });

  const componentConfidences = [
    dominantCondition.confidence ?? 0.5,
    ...(rootMechanisms.map(
      (mechanism) =>
        mechanism.confidence ?? 0.5,
    )),
    ...(supportingConditions.map(
      (condition) =>
        condition.confidence ?? 0.5,
    )),
  ];

  const confidence =
    clamp01(
      componentConfidences.reduce(
        (sum, value) => sum + value,
        0,
      ) /
      Math.max(
        1,
        componentConfidences.length,
      ),
    );

  return {
    id:
      `executive-dominant-causal-chain-${dominantCondition.id}`,

    generatedAt:
      input.now ??
      new Date().toISOString(),

    dominantConditionId:
      dominantCondition.id,

    rootMechanismIds:
      rootMechanisms.map(
        (mechanism) => mechanism.id,
      ),

    supportingConditionIds:
      supportingConditions.map(
        (condition) => condition.id,
      ),

    nodes,
    edges,

    headline:
      `${dominantCondition.name} is being produced and reinforced by a connected set of organizational drivers.`,

    executiveExplanation:
      buildExecutiveExplanation({
        rootMechanisms,
        dominantCondition,
        supportingConditions,
      }),

    confidence,

    uncertaintySummary:
      dominantCondition.uncertaintySummary ??
      (
        rootMechanisms.length === 0
          ? "The dominant condition is clear, but mechanism-level causal evidence remains incomplete."
          : "The chain reflects the strongest currently supported causal relationships and should be updated as longitudinal evidence accumulates."
      ),
  };
}
