import type { DetectedOrganizationalCapability } from "./organizationalCapabilities";
import type { FunctionalInterpretation } from "../functional/functionalInterpretation";

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

export function inferOrganizationalCapabilities(params: {
  interpretations: FunctionalInterpretation[];
}): DetectedOrganizationalCapability[] {
  const { interpretations } = params;

  const detected = CAPABILITY_VOCABULARY.map((capability) => {
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

  return detected;
}