import type { ExecutiveUnderstandingItem } from "./executiveState";

const NARRATIVE_KEYWORDS: Array<{
  id: string;
  keywords: string[];
}> = [
  {
    id: "leadership_capacity",
    keywords: [
      "leadership",
      "executive",
      "capacity",
      "bandwidth",
      "approval",
      "bottleneck",
      "decision concentration",
      "centralized",
    ],
  },
  {
    id: "decision_velocity",
    keywords: [
      "decision",
      "velocity",
      "speed",
      "approval",
      "bottleneck",
      "coordination",
      "execution",
    ],
  },
  {
    id: "knowledge_continuity",
    keywords: [
      "knowledge",
      "continuity",
      "memory",
      "handoff",
      "transfer",
      "documentation",
      "context loss",
    ],
  },
  {
    id: "customer_learning",
    keywords: [
      "customer",
      "market",
      "feedback",
      "learning",
      "demand",
      "adoption",
      "retention",
    ],
  },
  {
    id: "operational_complexity",
    keywords: [
      "operational",
      "complexity",
      "process",
      "workflow",
      "handoff",
      "cross-functional",
      "coordination",
    ],
  },
  {
    id: "technology_adoption",
    keywords: [
      "technology",
      "platform",
      "tool",
      "system",
      "automation",
      "adoption",
      "integration",
    ],
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  const normalized = normalizeText(value).replace(/\s+/g, "_");
  return normalized || "organizational_narrative";
}

export function resolveNarrativeId(item: ExecutiveUnderstandingItem): string {
  const combined = normalizeText(`${item.title} ${item.summary}`);

  const match = NARRATIVE_KEYWORDS.find((candidate) =>
    candidate.keywords.some((keyword) => combined.includes(keyword)),
  );

  if (match) return match.id;

  return slugify(item.title);
}