import type { ExecutiveConversationScenario, ExecutiveConversationTurn } from "./executiveConversationTypes";
import { buildConversationScenarioRuntime, conversationExpectations } from "./executiveConversationScenarios";

const turns = (...items: Array<[string, import("./executiveConversationTypes").ConversationAction?]>): ExecutiveConversationTurn[] =>
  items.map(([message, action]) => ({ speaker: "executive", message, action }));

export const heldOutConversationScenarios: ExecutiveConversationScenario[] = [
  {
    id: "held-out-001",
    name: "Functional Manager Perspective",
    organizationId: "org-collab-held-out-001",
    initialRuntime: buildConversationScenarioRuntime("org-collab-held-out-001"),
    turns: turns(
      ["As a functional manager, I am seeing design and sales handoffs miss delivery dates."],
      ["I can report the delays, but I do not control either team."],
      ["What should I clarify before escalating?", "defer"],
    ),
    expected: conversationExpectations({
      executiveObjective: "Understand a manager's cross-team delivery concern without assuming decision authority",
      requiredConcepts: [["manager", "perspective"], ["design", "sales", "handoff"], ["clarify", "escalating"]],
      expectedHandoff: "defer",
    }),
  },
  {
    id: "held-out-002",
    name: "Ambiguous Concern Without Request",
    organizationId: "org-collab-held-out-002",
    initialRuntime: buildConversationScenarioRuntime("org-collab-held-out-002"),
    turns: turns(
      ["I am frustrated that the launch keeps slipping."],
      ["I do not know whether I want an explanation or simply need to surface the concern."],
      ["Help me clarify what I am asking.", "defer"],
    ),
    expected: conversationExpectations({
      executiveObjective: "Clarify an ambiguous concern before offering advice",
      requiredConcepts: [["frustrated", "concern"], ["explanation", "surface"], ["clarify", "asking"]],
      expectedHandoff: "defer",
    }),
  },
  {
    id: "held-out-003",
    name: "Conflicting Statements Across Turns",
    organizationId: "org-collab-held-out-003",
    initialRuntime: buildConversationScenarioRuntime("org-collab-held-out-003"),
    turns: turns(
      ["Customer onboarding is slow because training is inconsistent."],
      ["Training completion is high, but handoffs are still failing."],
      ["I may be combining two explanations.", "defer"],
    ),
    expected: conversationExpectations({
      executiveObjective: "Recognize tension between two causal explanations without resolving it",
      requiredConcepts: [["onboarding", "slow"], ["training", "handoff"], ["two", "explanations", "ambiguity"]],
      expectedChallenge: "required",
      expectedHandoff: "defer",
    }),
  },
  {
    id: "held-out-004",
    name: "Evidence Versus Interpretation",
    organizationId: "org-collab-held-out-004",
    initialRuntime: buildConversationScenarioRuntime("org-collab-held-out-004"),
    turns: turns(
      ["Cycle time rose from 12 to 19 days, and I think unclear ownership caused it."],
      ["The cycle-time data is confirmed; the ownership explanation is my hypothesis."],
      ["What should remain evidence versus interpretation?", "defer"],
    ),
    expected: conversationExpectations({
      executiveObjective: "Separate a reported fact from the participant's causal hypothesis",
      requiredConcepts: [["cycle time", "12", "19"], ["ownership", "hypothesis"], ["evidence", "interpretation"]],
      expectedChallenge: "required",
      expectedHandoff: "defer",
    }),
  },
];
