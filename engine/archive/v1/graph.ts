import { CognitiveAtom, KnowledgeGraph } from "../../types";
import { extractConcepts } from "./concepts";

export function buildGraph(atoms: CognitiveAtom[]): KnowledgeGraph {
  const concepts = extractConcepts(atoms);

  const nodes = new Map<
    string,
    { id: string; label: string; kind: string; weight: number }
  >();

  const edges: KnowledgeGraph["edges"] = [];

  for (const concept of concepts) {
    const conceptId = normalize(concept.label);
    const categoryId = normalize(concept.category);

    upsertNode(nodes, conceptId, concept.label, "concept");
    upsertNode(nodes, categoryId, concept.category, "category");

    edges.push({
      source: conceptId,
      target: categoryId,
      relationship: "belongs_to",
      weight: concept.confidence,
    });
  }

  const nodeList = Array.from(nodes.values()).sort((a, b) => b.weight - a.weight);

  return {
    nodes: nodeList,
    edges,
    centralNodes: nodeList.slice(0, 5).map((node) => node.label),
  };
}

function upsertNode(
  nodes: Map<string, { id: string; label: string; kind: string; weight: number }>,
  id: string,
  label: string,
  kind: string
) {
  if (!nodes.has(id)) {
    nodes.set(id, {
      id,
      label,
      kind,
      weight: 1,
    });
  } else {
    nodes.get(id)!.weight += 1;
  }
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}