import type {
  FunctionalInterpretation,
  FunctionalInterpretationCategory,
  FunctionalInterpretationState,
  OrganizationalDynamic,
} from "./functionalInterpretation";

type UnderstandingLike = {
  id: string;
  statement?: string;
  title?: string;
  summary?: string;
  description?: string;
  confidence?: number;
  strength?: number;
};

type DynamicRule = {
  label: string;
  category: FunctionalInterpretationCategory;
  description: string;
  terms: string[];
};

const DYNAMIC_RULES: DynamicRule[] = [
  {
    label: "Authority Centralized",
    category: "authority",
    description:
      "Decision authority appears concentrated in a small number of people or leadership roles.",
    terms: ["approval", "executive", "leader", "escalation", "permission"],
  },
  {
    label: "Decision Latency",
    category: "decision",
    description:
      "Decisions appear to slow down because work depends on approvals, escalation, or unclear authority.",
    terms: ["delay", "waiting", "blocked", "approval", "decision"],
  },
  {
    label: "Coordination Fragmented",
    category: "coordination",
    description:
      "Work appears fragmented across teams, handoffs, or dependencies.",
    terms: ["handoff", "coordination", "fragmented", "dependency", "silo"],
  },
  {
    label: "Ownership Diffuse",
    category: "ownership",
    description:
      "Responsibility appears unclear or distributed without strong accountability.",
    terms: ["ownership", "owner", "accountability", "responsibility", "unclear"],
  },
  {
    label: "Knowledge Continuity Weak",
    category: "knowledge",
    description:
      "Important knowledge appears difficult to preserve, reuse, or transfer across time.",
    terms: [
      "knowledge",
      "documentation",
      "memory",
      "continuity",
      "tribal",
      "retained",
      "learning",
    ],
  },
  {
    label: "Learning Localized",
    category: "learning",
    description:
      "Learning appears to remain local to individuals or teams rather than becoming shared organizational knowledge.",
    terms: ["lesson", "learned", "feedback", "localized", "repeat"],
  },
  {
    label: "Communication Inconsistent",
    category: "communication",
    description:
      "Information appears to move inconsistently across the organization.",
    terms: ["communication", "message", "clarity", "unclear", "information"],
  },
  {
    label: "Execution Constrained",
    category: "execution",
    description:
      "The organization appears constrained in its ability to convert intent into completed work.",
    terms: ["execution", "blocked", "delay", "capacity", "follow-through"],
  },
  {
    label: "Prioritization Unclear",
    category: "prioritization",
    description:
      "The organization appears to lack clear prioritization or shared focus.",
    terms: ["priority", "priorities", "focus", "tradeoff", "competing"],
  },
  {
    label: "Resource Allocation Strained",
    category: "resourceAllocation",
    description:
      "People, time, budget, or tools appear insufficient or unevenly allocated.",
    terms: ["resource", "budget", "staffing", "headcount", "capacity"],
  },
];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getUnderstandingText(understanding: UnderstandingLike): string {
  return [
    understanding.statement,
    understanding.title,
    understanding.summary,
    understanding.description,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function average(values: number[], fallback: number): number {
  if (values.length === 0) return fallback;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function createDynamicId(label: string): string {
  return `dynamic-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function inferOrganizationalDynamics(params: {
  understandings: UnderstandingLike[];
  existingState?: FunctionalInterpretationState;
  now: string;
}): FunctionalInterpretationState {
  const { understandings, existingState, now } = params;

  const existingByLabel = new Map(
    (existingState?.interpretations ?? []).map((dynamic) => [
      dynamic.label,
      dynamic,
    ])
  );

  const dynamics: FunctionalInterpretation[] = DYNAMIC_RULES.reduce<
    FunctionalInterpretation[]
  >((acc, rule) => {
    const matchedUnderstandings = understandings.filter((understanding) => {
      const text = getUnderstandingText(understanding);
      return rule.terms.some((term) => text.includes(term));
    });

    if (matchedUnderstandings.length === 0) return acc;

    const existing = existingByLabel.get(rule.label);

    const supportingUnderstandingIds = unique(
      matchedUnderstandings.map((understanding) => understanding.id)
    );

    const confidence = Math.min(
      0.95,
      average(
        matchedUnderstandings.map(
          (understanding) => understanding.confidence ?? 0.65
        ),
        0.65
      ) + 0.05
    );

    const strength = Math.min(
      1,
      average(
        matchedUnderstandings.map(
          (understanding) => understanding.strength ?? confidence
        ),
        confidence
      )
    );

    const status: OrganizationalDynamic["status"] = existing
      ? confidence > existing.confidence
        ? "reinforced"
        : "stable"
      : "new";

    acc.push({
      id: existing?.id ?? createDynamicId(rule.label),
      type: "dynamic",
      label: rule.label,
      statement: rule.label,
      category: rule.category,
      description: rule.description,
      confidence,
      strength,
      status,
      supportedBy: supportingUnderstandingIds.map((id) => ({
        id,
        type: "understanding",
      })),
      supports: existing?.supports ?? [],
      supportingUnderstandingIds,
      supportingCapabilityIds: existing?.supportingCapabilityIds,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    return acc;
  }, []);

  return {
    interpretations: dynamics,
    lastUpdatedAt: now,
  };
}

export const inferFunctionalInterpretations = inferOrganizationalDynamics;