import type { AlphaFixture } from "./viewModels";

export const alphaFixture: AlphaFixture = {
  organization: {
    id: "alpha-atlas",
    name: "Atlas",
  },
  user: {
    name: "Shalini Rao",
    role: "CEO",
  },
  understanding: {
    id: "understanding-engineering-productivity",
    title: "Engineering Productivity",
    originalQuestion: "Why has engineering productivity slowed?",
    objective:
      "Understand what is constraining Engineering’s ability to turn planned work into reliable delivery.",
    synthesis:
      "Engineering planning appears healthier than delivery outcomes suggest.",
    explanation:
      "The strongest recurring constraint emerges after teams commit to work, when ownership and decision authority become unclear across dependencies.",
    whyItMatters:
      "Work is planned and teams stay busy, but delivery slows when important decisions lack clear ownership after commitment.",
    strongestExplanation:
      "Post-planning ownership ambiguity is the strongest current explanation for recurring delivery friction.",
    primaryUnknown:
      "Why one engineering team delivers reliably despite using a similar ownership structure.",
    contradiction:
      "One comparable team delivers reliably under apparently similar formal ownership conditions.",
    confidence: {
      qualitative: "Moderate",
      value: 81,
      change: 7,
      rationale:
        "Multiple source categories agree, and the pattern repeats across teams.",
      limitation:
        "One meaningful contradiction remains, so causality is not established.",
    },
  },
  sources: [
    {
      id: "sprint-retrospectives",
      title: "Sprint retrospectives",
      rationale: "Recurring delivery patterns and team reflections.",
      contribution: "High",
      state: "Included",
      tone: "green",
    },
    {
      id: "project-history",
      title: "Project history",
      rationale: "Where work slowed, changed, or was reprioritized.",
      contribution: "High",
      state: "Included",
      tone: "blue",
    },
    {
      id: "engineering-conversations",
      title: "Engineering conversations",
      rationale: "Context on decisions, friction, and workarounds.",
      contribution: "Medium",
      state: "Included",
      tone: "violet",
    },
    {
      id: "planning-documents",
      title: "Product planning documents",
      rationale: "Intent, assumptions, and priority trade-offs.",
      contribution: "Medium",
      state: "Limited",
      tone: "orange",
    },
  ],
  events: [
    {
      id: "event-retrospectives",
      time: "10:03 AM",
      title: "Reviewed 12 sprint retrospectives",
      detail: "Across five engineering teams",
      effect: "Strengthens explanation",
      kind: "strengthening",
    },
    {
      id: "event-pattern",
      time: "9:59 AM",
      title: "Found a recurring pattern",
      detail: "Delivery friction appears after commitment in 83% of initiatives",
      effect: "Post-planning ownership ambiguity",
      kind: "strengthening",
    },
    {
      id: "event-contradiction",
      time: "9:54 AM",
      title: "Contradiction discovered",
      detail: "One team delivers reliably under similar structure",
      effect: "Requires explanation",
      kind: "contradiction",
    },
    {
      id: "event-weakening",
      time: "9:47 AM",
      title: "Weaker explanation identified",
      detail: "Formal priority instability is less connected to delivery delay",
      effect: "Weakens explanation",
      kind: "weakening",
    },
    {
      id: "event-relationship",
      time: "9:40 AM",
      title: "New relationship emerged",
      detail: "Decision clarification often occurs after work has started",
      effect: "New relationship",
      kind: "relationship",
    },
  ],
  relationships: [
    {
      id: "decision-ownership",
      title: "Decision Ownership",
      description: "Now strongly connected",
      tone: "green",
    },
    {
      id: "cross-functional",
      title: "Cross-functional Coordination",
      description: "Growing in importance",
      tone: "blue",
    },
    {
      id: "product-prioritization",
      title: "Product Prioritization",
      description: "Recently emerged",
      tone: "violet",
    },
    {
      id: "execution-capacity",
      title: "Execution Capacity",
      description: "Stable",
      tone: "orange",
    },
  ],
  responsePaths: [
    {
      id: "agree",
      title: "This matches my experience",
      description: "This aligns with what I’ve observed.",
      tone: "blue",
    },
    {
      id: "missing",
      title: "Something important is missing",
      description: "There’s context or evidence Discovery should consider.",
      tone: "orange",
    },
    {
      id: "different",
      title: "I interpret this differently",
      description: "I see the story or patterns differently.",
      tone: "violet",
    },
    {
      id: "investigate",
      title: "Investigate further before deciding",
      description: "I need more clarity before making a decision.",
      tone: "green",
    },
  ],
  changes: [
    {
      id: "change-confidence",
      eyebrow: "Update to current Understanding",
      headline: "Engineering planning appears healthier than delivery outcomes suggest.",
      detail:
        "Confidence strengthened because ownership ambiguity now appears across 12 additional initiatives.",
      action: "See what changed",
      kind: "confidence",
      impact: "High",
    },
    {
      id: "change-contradiction",
      eyebrow: "New contradiction found",
      headline: "One team consistently outperforms the others despite similar conditions.",
      detail:
        "This contradicts the current explanation and may change what is driving outcomes.",
      action: "Examine contradiction",
      kind: "contradiction",
      impact: "High",
    },
    {
      id: "change-learning",
      eyebrow: "Next learning recommended",
      headline: "Compare decision practices in the consistently delivering team.",
      detail: "This is the highest-leverage question Discovery can answer next.",
      action: "Begin learning",
      kind: "learning",
      impact: "High",
    },
    {
      id: "change-relationship",
      eyebrow: "New relationship emerged",
      headline: "Engineering planning became strongly related to delivery consistency.",
      detail: "The relationship may help explain recent outcomes; causality remains uncertain.",
      action: "See relationship",
      kind: "relationship",
      impact: "Moderate",
    },
  ],
};
