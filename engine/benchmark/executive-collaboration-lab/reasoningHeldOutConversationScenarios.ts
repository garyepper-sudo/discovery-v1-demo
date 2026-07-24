import type { ExecutiveConversationScenario, ExecutiveConversationTurn } from "./executiveConversationTypes";
import { buildConversationScenarioRuntime, conversationExpectations } from "./executiveConversationScenarios";

const turns = (...messages: string[]): ExecutiveConversationTurn[] =>
  messages.map((message, index) => ({ speaker: "executive", message, action: index === messages.length - 1 ? "defer" : undefined }));

const scenario = (id: string, name: string, messages: string[], requiredConcepts: string[][]): ExecutiveConversationScenario => ({
  id,
  name,
  organizationId: `org-${id}`,
  initialRuntime: buildConversationScenarioRuntime(`org-${id}`),
  turns: turns(...messages),
  expected: conversationExpectations({
    executiveObjective: `Interpret reasoning quality: ${name}`,
    requiredConcepts,
    expectedChallenge: "required",
    expectedHandoff: "defer",
  }),
});

export const reasoningHeldOutConversationScenarios: ExecutiveConversationScenario[] = [
  scenario("reasoning-held-out-001", "Confirmation Bias", [
    "The reorganization is working; the positive comments prove it.",
    "Several delivery metrics declined, but those teams probably have not adapted yet.",
    "I still think the positive comments are the evidence that matters.",
  ], [["reorganization", "working"], ["delivery", "declined"], ["positive comments", "evidence"]]),
  scenario("reasoning-held-out-002", "False Cause", [
    "We introduced the new review meeting in January.",
    "Delivery improved in February, so the meeting caused the improvement.",
    "What should test whether that sequence is actually causal?",
  ], [["review meeting", "January"], ["delivery", "February"], ["causal", "test"]]),
  scenario("reasoning-held-out-003", "Single Data Point", [
    "One enterprise customer praised the new onboarding process.",
    "That tells me the process now works for the whole customer base.",
    "What evidence would make that conclusion more representative?",
  ], [["one", "customer"], ["whole", "customer base"], ["representative", "evidence"]]),
  scenario("reasoning-held-out-004", "Premature Certainty", [
    "I am certain the capacity problem is solved.",
    "We only have one week of data, but utilization fell.",
    "Should we challenge the certainty before treating this as resolved?",
  ], [["certain", "solved"], ["one week", "data"], ["challenge", "certainty"]]),
  scenario("reasoning-held-out-005", "Binary Thinking", [
    "We either centralize every product decision or give teams complete autonomy.",
    "Those are the only two viable choices.",
    "What alternatives or boundary designs are missing?",
  ], [["centralize", "autonomy"], ["only two", "choices"], ["alternatives", "missing"]]),
  scenario("reasoning-held-out-006", "Hidden Assumption", [
    "We should launch the new operating cadence across every region next month.",
    "The plan depends on local leaders having enough facilitation capacity.",
    "We have not checked that capacity assumption yet.",
  ], [["launch", "every region"], ["facilitation", "capacity"], ["assumption", "checked"]]),
];
