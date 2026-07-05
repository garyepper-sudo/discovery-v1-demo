import type { DetectedOrganizationalCapability } from "./organizationalCapabilities";
import type { FunctionalInterpretation } from "../functional/functionalInterpretation";

type OrganizationReasoningNode = {
  entityId: string;
  canonicalName: string;
  category: string;
  aliases: string[];
  confidence: number;
  evidenceIds: string[];
  relatedEntityIds: string[];
};

type OrganizationReasoningGraph = {
  organizationId: string;
  generatedAt: string;
  nodes: OrganizationReasoningNode[];
};

const CAPABILITY_VOCABULARY = [
  {
    label: "Decision Making",
    description:
      "The organization’s ability to make timely, distributed, and accountable decisions.",
    dynamics: [
      "decision authority",
      "authority centralized",
      "local autonomy",
      "executive dependency",
      "approval",
      "escalation",
      "decision latency",
    ],
    entitySignals: [
      "leadership",
      "executive",
      "approval",
      "decision",
      "bottleneck",
      "latency",
    ],
    categories: ["actor", "team"],
  },
  {
    label: "Governance",
    description:
      "The structures, rules, and review processes that guide organizational action.",
    dynamics: [
      "authority centralized",
      "approval",
      "oversight",
      "control",
      "policy",
      "executive dependency",
      "escalation",
    ],
    entitySignals: ["leadership", "executive", "policy", "approval", "control"],
    categories: ["actor", "team", "process"],
  },
  {
    label: "Leadership",
    description:
      "The organization’s ability to provide direction, clarity, and executive guidance.",
    dynamics: [
      "executive dependency",
      "leadership dependency",
      "local autonomy",
      "direction",
      "guidance",
      "escalation",
    ],
    entitySignals: ["leadership", "executive", "manager", "ceo"],
    categories: ["actor", "team"],
  },
  {
    label: "Execution",
    description:
      "The organization’s ability to translate priorities into completed work.",
    dynamics: [
      "decision latency",
      "approval delay",
      "execution inconsistent",
      "blocked",
      "handoff",
      "coordination",
      "local autonomy",
    ],
    entitySignals: [
      "scheduling",
      "delay",
      "bottleneck",
      "failure",
      "operations",
      "process",
    ],
    categories: ["process", "system", "risk"],
  },
  {
    label: "Coordination",
    description:
      "The organization’s ability to align work across teams, functions, and dependencies.",
    dynamics: [
      "coordination",
      "handoff",
      "fragmented",
      "dependency",
      "alignment",
      "cross-functional",
    ],
    entitySignals: [
      "operations",
      "support",
      "scheduling",
      "dashboard",
      "communication",
      "team",
    ],
    categories: ["team", "system", "process"],
  },
  {
    label: "Communication",
    description:
      "The organization’s ability to share information clearly and consistently.",
    dynamics: [
      "communication",
      "information",
      "message",
      "clarity",
      "unclear",
      "transparency",
    ],
    entitySignals: [
      "communication",
      "narrative",
      "support",
      "human resources",
      "operations",
    ],
    categories: ["team", "actor", "unknown"],
  },
  {
    label: "Knowledge Management",
    description:
      "The organization’s ability to capture, organize, and reuse knowledge.",
    dynamics: [
      "knowledge",
      "documentation",
      "information retained",
      "knowledge retained",
      "knowledge remains",
      "tribal knowledge",
    ],
    entitySignals: [
      "knowledge",
      "documentation",
      "training",
      "onboarding",
      "senior employee",
      "human resources",
    ],
    categories: ["process", "team", "actor", "unknown"],
  },
  {
    label: "Organizational Memory",
    description:
      "The organization’s ability to preserve understanding across time and personnel changes.",
    dynamics: [
      "memory",
      "continuity",
      "knowledge not retained",
      "knowledge remains individual",
      "institutional knowledge",
      "learning localized",
    ],
    entitySignals: [
      "knowledge",
      "continuity",
      "documentation",
      "senior employee",
      "onboarding",
      "human resources",
    ],
    categories: ["process", "team", "actor", "unknown"],
  },
  {
    label: "Alignment",
    description:
      "The organization’s ability to maintain shared priorities, goals, and interpretation.",
    dynamics: [
      "alignment",
      "misalignment",
      "shared understanding",
      "priorities",
      "disconnect",
      "fragmented",
    ],
    entitySignals: [
      "leadership narrative gap",
      "growth pressure",
      "operations",
      "support",
      "leadership",
    ],
    categories: ["team", "actor", "unknown"],
  },
  {
    label: "Innovation",
    description:
      "The organization’s ability to generate, test, and advance new ideas.",
    dynamics: [
      "innovation",
      "experiment",
      "new idea",
      "prototype",
      "creativity",
      "research",
    ],
    entitySignals: ["innovation", "experiment", "prototype", "research"],
    categories: ["process", "system", "unknown"],
  },
  {
    label: "Planning",
    description:
      "The organization’s ability to anticipate future needs and sequence action.",
    dynamics: [
      "planning",
      "roadmap",
      "forecast",
      "timeline",
      "milestone",
      "sequencing",
    ],
    entitySignals: ["planning", "scheduling", "timeline", "roadmap"],
    categories: ["process", "system"],
  },
  {
    label: "Prioritization",
    description:
      "The organization’s ability to decide what matters most and allocate attention accordingly.",
    dynamics: [
      "priority",
      "prioritization",
      "focus",
      "tradeoff",
      "competing priorities",
      "attention",
    ],
    entitySignals: ["priority", "scheduling", "leadership", "operations"],
    categories: ["process", "actor", "team"],
  },
  {
    label: "Resource Allocation",
    description:
      "The organization’s ability to allocate people, capital, time, and tools effectively.",
    dynamics: [
      "resource",
      "budget",
      "staffing",
      "headcount",
      "capacity",
      "funding",
      "allocation",
      "vendor purchases",
    ],
    entitySignals: [
      "staffing",
      "capacity",
      "nurses",
      "managers",
      "human resources",
    ],
    categories: ["actor", "team", "process", "unknown"],
  },
  {
    label: "Customer Responsiveness",
    description:
      "The organization’s ability to sense and respond to customer needs.",
    dynamics: [
      "customer",
      "client",
      "user",
      "market feedback",
      "responsiveness",
      "support",
      "complaint",
      "refund",
    ],
    entitySignals: ["customer", "support", "customer friction"],
    categories: ["team", "unknown", "risk"],
  },
  {
    label: "Accountability",
    description:
      "The organization’s ability to assign ownership and follow through on responsibilities.",
    dynamics: [
      "accountability",
      "ownership",
      "responsibility",
      "owner",
      "follow-up",
      "commitment",
      "empowered",
    ],
    entitySignals: ["leadership", "manager", "operations", "owner"],
    categories: ["actor", "team"],
  },
  {
    label: "Risk Management",
    description:
      "The organization’s ability to identify, evaluate, and manage uncertainty or exposure.",
    dynamics: [
      "risk",
      "exposure",
      "uncertainty",
      "mitigation",
      "threat",
      "failure mode",
      "safer to wait",
      "challenged later",
    ],
    entitySignals: [
      "burnout",
      "failure",
      "bottleneck",
      "delay",
      "friction",
      "risk",
    ],
    categories: ["risk", "unknown"],
  },
  {
    label: "Learning",
    description:
      "The organization’s ability to learn from experience and improve future behavior.",
    dynamics: [
      "learning",
      "feedback loop",
      "lessons learned",
      "improvement",
      "adapt",
      "knowledge retained",
    ],
    entitySignals: ["learning", "feedback", "knowledge", "documentation"],
    categories: ["process", "unknown"],
  },
  {
    label: "Adaptation",
    description:
      "The organization’s ability to adjust behavior when conditions change.",
    dynamics: [
      "adaptation",
      "change",
      "adjust",
      "respond",
      "evolve",
      "pivot",
      "changing conditions",
      "demand spikes",
    ],
    entitySignals: ["growth pressure", "customer friction", "delay", "change"],
    categories: ["risk", "unknown", "process"],
  },
];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getInterpretationText(interpretation: FunctionalInterpretation): string {
  return [
    interpretation.statement,
    interpretation.description,
    interpretation.category,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function nodeText(node: OrganizationReasoningNode): string {
  return [
    node.canonicalName,
    node.category,
    ...node.aliases,
    ...node.relatedEntityIds,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function inferFromGraph(params: {
  organizationReasoningGraph: OrganizationReasoningGraph;
}): DetectedOrganizationalCapability[] {
  const { organizationReasoningGraph } = params;

  return CAPABILITY_VOCABULARY.map((capability) => {
    const matchedNodes = organizationReasoningGraph.nodes.filter((node) => {
      const text = nodeText(node);

      const signalMatch = capability.entitySignals.some((signal) =>
        text.includes(normalizeText(signal))
      );

      const categoryMatch = capability.categories.includes(node.category);

      return signalMatch || (categoryMatch && node.confidence >= 0.95);
    });

    if (matchedNodes.length === 0) return null;

    const evidence = unique(
      matchedNodes.map(
        (node) => `${node.canonicalName} (${node.category})`
      )
    );

    const understandingIds = unique(matchedNodes.map((node) => node.entityId));

    const averageConfidence =
      matchedNodes.reduce((sum, node) => sum + node.confidence, 0) /
      matchedNodes.length;

    return {
      label: capability.label,
      description: capability.description,
      confidence: Math.min(0.95, averageConfidence),
      evidence,
      understandingIds,
    };
  }).filter((capability): capability is DetectedOrganizationalCapability =>
    Boolean(capability)
  );
}

function inferFromInterpretations(params: {
  interpretations: FunctionalInterpretation[];
}): DetectedOrganizationalCapability[] {
  const { interpretations } = params;

  return CAPABILITY_VOCABULARY.map((capability) => {
    const matchedInterpretations = interpretations.filter((interpretation) => {
      const text = getInterpretationText(interpretation);
      return capability.dynamics.some((dynamic) => text.includes(dynamic));
    });

    if (matchedInterpretations.length === 0) {
      return null;
    }

    const evidence = matchedInterpretations
      .map((interpretation) => interpretation.statement)
      .filter((value): value is string => Boolean(value));

    const averageConfidence =
      matchedInterpretations.reduce(
        (sum, interpretation) => sum + (interpretation.confidence ?? 0.65),
        0
      ) / matchedInterpretations.length;

    const understandingIds = unique(
      matchedInterpretations.flatMap(
        (interpretation) => interpretation.supportingUnderstandingIds ?? []
      )
    );

    return {
      label: capability.label,
      description: capability.description,
      confidence: Math.min(0.95, averageConfidence + 0.05),
      evidence: unique(evidence),
      understandingIds,
    };
  }).filter((capability): capability is DetectedOrganizationalCapability =>
    Boolean(capability)
  );
}

export function inferOrganizationalCapabilities(params: {
  interpretations: FunctionalInterpretation[];
  organizationReasoningGraph?: OrganizationReasoningGraph;
}): DetectedOrganizationalCapability[] {
  const { interpretations, organizationReasoningGraph } = params;

  if (
    organizationReasoningGraph &&
    Array.isArray(organizationReasoningGraph.nodes) &&
    organizationReasoningGraph.nodes.length > 0
  ) {
    const graphCapabilities = inferFromGraph({ organizationReasoningGraph });

    if (graphCapabilities.length > 0) {
      return graphCapabilities;
    }
  }

  return inferFromInterpretations({ interpretations });
}