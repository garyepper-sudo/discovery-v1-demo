import type {
  OrganizationalReasoningPath,
  OrganizationalReasoningStep,
} from "./reasoningTypes";

type GraphNode = {
  id?: string;
  entityId?: string;

  label?: string;
  name?: string;
  canonicalName?: string;

  type?: string;
  category?: string;

  importance?: number;
  confidence?: number;
};

type GraphEdge = {
  id?: string;

  from?: string;
  to?: string;

  source?: string;
  target?: string;

  sourceId?: string;
  targetId?: string;

  relationship?: string;
  type?: string;
  confidence?: number;
  evidenceReferences?: any[];
};

type OrganizationReasoningGraphLike = {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
};

export function discoverReasoningPaths(
  graph: OrganizationReasoningGraphLike,
  options?: {
    maxDepth?: number;
    maxPaths?: number;
    minConfidence?: number;
  }
): OrganizationalReasoningPath[] {
  const maxDepth = options?.maxDepth ?? 5;
  const maxPaths = options?.maxPaths ?? 40;
  const minConfidence = options?.minConfidence ?? 0.35;

  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  const nodeById = new Map<string, GraphNode>();

  for (const node of nodes) {
    const nodeId = getNodeId(node);
    if (nodeId) nodeById.set(nodeId, node);
  }

  const outgoing = new Map<string, GraphEdge[]>();

  for (const edge of edges) {
    const from = getEdgeSource(edge);
    const to = getEdgeTarget(edge);

    if (!from || !to) continue;

    if (!outgoing.has(from)) outgoing.set(from, []);
    outgoing.get(from)!.push(edge);
  }

  const startNodes = [...nodes]
    .filter((node) => Boolean(getNodeId(node)))
    .sort(
      (a, b) =>
        (b.importance ?? b.confidence ?? 0.5) -
        (a.importance ?? a.confidence ?? 0.5)
    )
    .slice(0, 20);

  const discovered: OrganizationalReasoningPath[] = [];
  const discoveredPathIds = new Set<string>();

  for (const startNode of startNodes) {
    const startNodeId = getNodeId(startNode);
    if (!startNodeId) continue;

    walk({
      startNodeId,
      currentNodeId: startNodeId,
      visited: new Set([startNodeId]),
      steps: [],
      depth: 0,
    });
  }

  return discovered
    .filter((path) => path.confidence >= minConfidence)
    .sort(
      (a, b) =>
        b.executiveRelevance +
        b.causalStrength +
        b.confidence -
        (a.executiveRelevance + a.causalStrength + a.confidence)
    )
    .slice(0, maxPaths);

  function walk(input: {
    startNodeId: string;
    currentNodeId: string;
    visited: Set<string>;
    steps: OrganizationalReasoningStep[];
    depth: number;
  }) {
    if (input.depth >= maxDepth) return;

    const nextEdges = outgoing.get(input.currentNodeId) ?? [];

    for (const edge of nextEdges) {
      const fromId = getEdgeSource(edge);
      const toId = getEdgeTarget(edge);

      if (!fromId || !toId) continue;
      if (input.visited.has(toId)) continue;

      const fromNode = nodeById.get(fromId);
      const toNode = nodeById.get(toId);

      if (!fromNode || !toNode) continue;

      const step: OrganizationalReasoningStep = {
        fromNodeId: fromId,
        fromLabel: getNodeLabel(fromNode),
        relationship: edge.relationship ?? edge.type ?? "relatesTo",
        toNodeId: toId,
        toLabel: getNodeLabel(toNode),
        confidence: clamp(edge.confidence ?? 0.6),
        evidenceReferences: edge.evidenceReferences ?? [],
      };

      const nextSteps = [...input.steps, step];

      if (nextSteps.length >= 2) {
        const candidatePath = buildCandidatePath(
          input.startNodeId,
          toId,
          nextSteps
        );

        if (!discoveredPathIds.has(candidatePath.id)) {
          discoveredPathIds.add(candidatePath.id);
          discovered.push(candidatePath);
        }
      }

      walk({
        startNodeId: input.startNodeId,
        currentNodeId: toId,
        visited: new Set([...input.visited, toId]),
        steps: nextSteps,
        depth: input.depth + 1,
      });
    }
  }

  function buildCandidatePath(
    sourceNodeId: string,
    targetNodeId: string,
    steps: OrganizationalReasoningStep[]
  ): OrganizationalReasoningPath {
    const sourceNode = nodeById.get(sourceNodeId);
    const targetNode = nodeById.get(targetNodeId);

    const confidence = average(steps.map((step) => step.confidence));
    const causalStrength = inferCausalStrength(steps);
    const executiveRelevance = inferExecutiveRelevance(steps);

    const evidenceReferences = dedupeEvidence(
      steps.flatMap((step) => step.evidenceReferences ?? [])
    );

    return {
      id: `reasoning_path_${hashPath(steps)}`,
      sourceNodeId,
      sourceLabel: getNodeLabel(sourceNode),
      targetNodeId,
      targetLabel: getNodeLabel(targetNode),

      steps,
      pathLength: steps.length,

      reasoningType: "unknown",
      directness: steps.length <= 1 ? "direct" : "indirect",

      confidence,
      causalStrength,
      executiveRelevance,

      summary: summarizePath(steps),
      evidenceReferences,
    };
  }
}

function getNodeId(node?: GraphNode): string | undefined {
  return node?.id ?? node?.entityId;
}

function getEdgeSource(edge: GraphEdge): string | undefined {
  return edge.from ?? edge.source ?? edge.sourceId;
}

function getEdgeTarget(edge: GraphEdge): string | undefined {
  return edge.to ?? edge.target ?? edge.targetId;
}

function getNodeLabel(node?: GraphNode): string {
  return (
    node?.label ??
    node?.name ??
    node?.canonicalName ??
    node?.id ??
    node?.entityId ??
    "Unknown"
  );
}

function summarizePath(steps: OrganizationalReasoningStep[]): string {
  return steps
    .map((step, index) =>
      index === 0
        ? `${step.fromLabel} ${step.relationship} ${step.toLabel}`
        : `${step.relationship} ${step.toLabel}`
    )
    .join(" → ");
}

function inferCausalStrength(steps: OrganizationalReasoningStep[]): number {
  const causalWords = [
    "causes",
    "contributes",
    "creates",
    "drives",
    "blocks",
    "delays",
    "fails",
    "constrains",
    "influences",
    "depends",
    "uses",
    "owns",
    "coordinates",
    "createsrisk",
    "contributesto",
    "dependson",
  ];

  const matches = steps.filter((step) =>
    causalWords.some((word) =>
      normalize(step.relationship).includes(normalize(word))
    )
  ).length;

  return clamp(0.4 + (matches / Math.max(steps.length, 1)) * 0.5);
}

function inferExecutiveRelevance(steps: OrganizationalReasoningStep[]): number {
  const executiveWords = [
    "leadership",
    "customer",
    "revenue",
    "risk",
    "delay",
    "decision",
    "accountability",
    "owner",
    "strategy",
    "capability",
    "failure",
    "friction",
    "dashboard",
    "scheduling",
    "operations",
    "burnout",
  ];

  const text = steps
    .flatMap((step) => [step.fromLabel, step.toLabel, step.relationship])
    .join(" ")
    .toLowerCase();

  const matches = executiveWords.filter((word) =>
    text.includes(word.toLowerCase())
  ).length;

  return clamp(0.45 + matches * 0.08);
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return clamp(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function dedupeEvidence<T>(items: T[]): T[] {
  return [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
}

function hashPath(steps: OrganizationalReasoningStep[]): string {
  return steps
    .map((step) => `${step.fromNodeId}_${step.relationship}_${step.toNodeId}`)
    .join("__")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 120);
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}