export type OrganizationalDynamicId =
  | "authority-centralized"
  | "decision-latency"
  | "executive-dependency"
  | "local-autonomy-constrained"
  | "coordination-fragmented"
  | "knowledge-continuity-weak"
  | "organizational-memory-degrading"
  | "documentation-unreliable"
  | "ownership-diffuse"
  | "accountability-unclear"
  | "dependencies-unmanaged"
  | "learning-localized"
  | "communication-inconsistent"
  | "planning-reactive"
  | "resource-allocation-constrained"
  | "priorities-competing"
  | "strategic-alignment-weak"
  | "operational-bottlenecks-emerging";

export type OrganizationalDynamicDefinition = {
  id: OrganizationalDynamicId;
  label: string;
  condition: string;
  explanation: string;
  behaviorSignals: string[];
  negativeSignals?: string[];
  relatedDynamics?: OrganizationalDynamicId[];
};

export const ORGANIZATIONAL_DYNAMICS: OrganizationalDynamicDefinition[] = [
  {
    id: "authority-centralized",
    label: "Authority Centralized",
    condition: "Meaningful decisions depend on approval from a small number of senior actors.",
    explanation:
      "The organization appears to rely on concentrated authority rather than distributed decision rights.",
    behaviorSignals: [
      "executive approval",
      "senior approval",
      "wait for approval",
      "approval bottleneck",
      "decisions escalate",
      "escalated to leadership",
      "leaders must approve",
      "cannot proceed without approval",
    ],
    relatedDynamics: ["decision-latency", "executive-dependency"],
  },
  {
    id: "decision-latency",
    label: "Decision Latency",
    condition: "Decisions take longer than the work requires, slowing execution.",
    explanation:
      "The organization appears to experience delay between recognizing a need and authorizing action.",
    behaviorSignals: [
      "wait days",
      "waiting for decisions",
      "delayed decision",
      "slow approval",
      "stalled",
      "blocked",
      "decision bottleneck",
      "approval delay",
    ],
    relatedDynamics: ["authority-centralized", "operational-bottlenecks-emerging"],
  },
  {
    id: "executive-dependency",
    label: "Executive Dependency",
    condition: "Teams depend on senior leadership to resolve normal operating ambiguity.",
    explanation:
      "The organization appears dependent on executives for interpretation, prioritization, or authorization.",
    behaviorSignals: [
      "executive involvement",
      "leadership must decide",
      "escalate to executive",
      "need executive input",
      "waiting on leadership",
      "senior team resolves",
    ],
    relatedDynamics: ["authority-centralized", "local-autonomy-constrained"],
  },
  {
    id: "local-autonomy-constrained",
    label: "Local Autonomy Constrained",
    condition: "Teams lack sufficient authority to resolve issues within their own operating domain.",
    explanation:
      "The organization appears to restrict local action, forcing teams to seek external permission.",
    behaviorSignals: [
      "cannot act independently",
      "limited authority",
      "must ask permission",
      "teams cannot decide",
      "approval required",
      "restricted autonomy",
    ],
    relatedDynamics: ["authority-centralized", "executive-dependency"],
  },
  {
    id: "coordination-fragmented",
    label: "Coordination Fragmented",
    condition: "Teams operate around related work without a shared coordination model.",
    explanation:
      "The organization appears to coordinate through local effort rather than synchronized cross-functional work.",
    behaviorSignals: [
      "departments optimize independently",
      "teams work separately",
      "separate specifications",
      "misaligned handoffs",
      "coordination gaps",
      "fragmented coordination",
      "siloed teams",
      "cross-functional gaps",
    ],
    relatedDynamics: ["dependencies-unmanaged", "communication-inconsistent"],
  },
  {
    id: "knowledge-continuity-weak",
    label: "Knowledge Continuity Weak",
    condition: "Knowledge does not reliably persist across people, teams, or time.",
    explanation:
      "The organization appears to lose useful understanding between efforts, causing repeated discovery or rework.",
    behaviorSignals: [
      "recreate previous work",
      "repeated analysis",
      "lost knowledge",
      "knowledge not retained",
      "previous work unavailable",
      "relearn",
      "rediscover",
      "reinvent",
    ],
    relatedDynamics: ["organizational-memory-degrading", "documentation-unreliable"],
  },
  {
    id: "organizational-memory-degrading",
    label: "Organizational Memory Degrading",
    condition: "The organization is losing access to prior decisions, rationale, or learning.",
    explanation:
      "The organization appears unable to preserve and reuse what it has already learned.",
    behaviorSignals: [
      "no record",
      "lost context",
      "forgot why",
      "unclear rationale",
      "history missing",
      "previous decisions unclear",
      "tribal knowledge",
      "knowledge leaves",
    ],
    relatedDynamics: ["knowledge-continuity-weak", "documentation-unreliable"],
  },
  {
    id: "documentation-unreliable",
    label: "Documentation Unreliable",
    condition: "Written records are incomplete, inconsistent, outdated, or not trusted.",
    explanation:
      "The organization appears unable to rely on documentation as a stable source of shared truth.",
    behaviorSignals: [
      "documentation inconsistent",
      "docs outdated",
      "documentation missing",
      "unreliable documentation",
      "conflicting documentation",
      "incomplete records",
      "specs inconsistent",
    ],
    relatedDynamics: ["knowledge-continuity-weak", "coordination-fragmented"],
  },
  {
    id: "ownership-diffuse",
    label: "Ownership Diffuse",
    condition: "No clear actor owns the full outcome or lifecycle.",
    explanation:
      "The organization appears to distribute responsibility without clear end-to-end ownership.",
    behaviorSignals: [
      "nobody owns",
      "unclear owner",
      "ownership changes",
      "handoff without owner",
      "shared ownership unclear",
      "no single owner",
      "responsibility shifts",
    ],
    relatedDynamics: ["accountability-unclear", "dependencies-unmanaged"],
  },
  {
    id: "accountability-unclear",
    label: "Accountability Unclear",
    condition: "The organization lacks clarity about who is responsible for outcomes.",
    explanation:
      "The organization appears to have ambiguous accountability boundaries.",
    behaviorSignals: [
      "unclear accountability",
      "unclear responsibility",
      "finger pointing",
      "responsibility unclear",
      "no accountable party",
      "accountability gaps",
    ],
    relatedDynamics: ["ownership-diffuse"],
  },
  {
    id: "dependencies-unmanaged",
    label: "Cross-Functional Dependencies Unmanaged",
    condition: "Work depends on other teams, but those dependencies are not actively managed.",
    explanation:
      "The organization appears to have dependency risk that is not coordinated through a reliable operating model.",
    behaviorSignals: [
      "dependency unmanaged",
      "handoff gaps",
      "blocked by another team",
      "waiting on another department",
      "cross-functional dependency",
      "dependencies unclear",
      "teams depend on each other",
    ],
    relatedDynamics: ["coordination-fragmented", "operational-bottlenecks-emerging"],
  },
  {
    id: "learning-localized",
    label: "Learning Localized",
    condition: "Learning occurs in isolated pockets but does not spread across the organization.",
    explanation:
      "The organization appears to learn locally without converting that learning into shared organizational knowledge.",
    behaviorSignals: [
      "only one team knows",
      "learning not shared",
      "localized learning",
      "knowledge silo",
      "team-specific knowledge",
      "lessons not shared",
    ],
    relatedDynamics: ["knowledge-continuity-weak", "coordination-fragmented"],
  },
  {
    id: "communication-inconsistent",
    label: "Communication Inconsistent",
    condition: "Important information is communicated unevenly or unreliably.",
    explanation:
      "The organization appears to lack consistent communication patterns across teams or decisions.",
    behaviorSignals: [
      "communication inconsistent",
      "mixed messages",
      "not communicated",
      "information gaps",
      "updates inconsistent",
      "teams hear different things",
    ],
    relatedDynamics: ["coordination-fragmented", "strategic-alignment-weak"],
  },
  {
    id: "planning-reactive",
    label: "Planning Reactive",
    condition: "Planning responds to immediate pressure rather than anticipated needs.",
    explanation:
      "The organization appears to plan after problems emerge instead of preparing ahead of them.",
    behaviorSignals: [
      "reactive planning",
      "last minute",
      "fire drill",
      "respond after",
      "urgent scramble",
      "planning gaps",
      "unplanned work",
    ],
    relatedDynamics: ["priorities-competing", "resource-allocation-constrained"],
  },
  {
    id: "resource-allocation-constrained",
    label: "Resource Allocation Constrained",
    condition: "Available resources are insufficient or difficult to allocate against priorities.",
    explanation:
      "The organization appears constrained in its ability to assign time, people, budget, or attention to needed work.",
    behaviorSignals: [
      "not enough resources",
      "capacity constrained",
      "budget constrained",
      "understaffed",
      "limited bandwidth",
      "resource bottleneck",
      "competing for resources",
    ],
    relatedDynamics: ["priorities-competing", "operational-bottlenecks-emerging"],
  },
  {
    id: "priorities-competing",
    label: "Priorities Competing",
    condition: "Multiple priorities compete without a clear resolution model.",
    explanation:
      "The organization appears to experience priority conflict that creates tradeoff ambiguity.",
    behaviorSignals: [
      "competing priorities",
      "priority conflict",
      "too many priorities",
      "unclear priorities",
      "shifting priorities",
      "tradeoffs unclear",
    ],
    relatedDynamics: ["strategic-alignment-weak", "planning-reactive"],
  },
  {
    id: "strategic-alignment-weak",
    label: "Strategic Alignment Weak",
    condition: "Teams are not consistently oriented around the same strategic direction.",
    explanation:
      "The organization appears to lack a shared interpretation of what matters most.",
    behaviorSignals: [
      "misaligned priorities",
      "strategic misalignment",
      "different goals",
      "teams optimize differently",
      "unclear strategy",
      "conflicting objectives",
    ],
    relatedDynamics: ["coordination-fragmented", "priorities-competing"],
  },
  {
    id: "operational-bottlenecks-emerging",
    label: "Operational Bottlenecks Emerging",
    condition: "Recurring constraints are beginning to slow organizational throughput.",
    explanation:
      "The organization appears to have developing bottlenecks that reduce execution speed or reliability.",
    behaviorSignals: [
      "bottleneck",
      "work piles up",
      "throughput slows",
      "blocked work",
      "delays recurring",
      "execution slows",
      "queue",
    ],
    relatedDynamics: ["decision-latency", "dependencies-unmanaged"],
  },
];

export function getOrganizationalDynamicById(id: OrganizationalDynamicId) {
  return ORGANIZATIONAL_DYNAMICS.find((dynamic) => dynamic.id === id);
}