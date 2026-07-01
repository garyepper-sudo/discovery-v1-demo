import { KnowledgeGraph } from "./types";

export type StrategicTension = {
  title: string;
  left: string;
  right: string;
  strength: number;
  explanation: string;
};

export function detectTensions(
  graph: KnowledgeGraph
): StrategicTension[] {
  const tensions: StrategicTension[] = [];

  const labels = graph.nodes.map((n) => n.label);

  addIfPresent(
    tensions,
    labels,
    "AI Platform",
    "Executive OS",
    "Product Positioning"
  );

  addIfPresent(
    tensions,
    labels,
    "Immediate Value",
    "Compounding Memory",
    "Adoption Strategy"
  );

  addIfPresent(
    tensions,
    labels,
    "CEOs",
    "Government",
    "Market Focus"
  );

  addIfPresent(
    tensions,
    labels,
    "CEOs",
    "Universities",
    "Market Expansion"
  );

  return tensions;
}

function addIfPresent(
  tensions: StrategicTension[],
  labels: string[],
  left: string,
  right: string,
  title: string
) {
  if (labels.includes(left) && labels.includes(right)) {
    tensions.push({
      title,
      left,
      right,
      strength: 0.8,
      explanation:
        "Both strategic directions appear in the investigation and may require an executive decision.",
    });
  }
}