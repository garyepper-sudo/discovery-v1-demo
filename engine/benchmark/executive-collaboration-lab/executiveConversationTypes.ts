import type { OrganizationRuntime } from "../../v3/runtime";
import type { ExecutiveConversationInterpretation } from "../../conversation";

export type ConversationAction = "brainstorm" | "save-evidence" | "run-experiment" | "open-decision" | "defer";
export type ExecutiveConversationTurn = { speaker: "executive" | "discovery"; message: string; action?: ConversationAction };
export type ExecutiveConversationExpectations = {
  executiveObjective: string;
  requiredConcepts: string[][];
  forbiddenPrematureClaims: string[];
  maximumUsefulClarifyingQuestions: number;
  expectedChallenge: "required" | "appropriate" | "not-required";
  expectedDurableWrites: ConversationAction[];
  prohibitedDurableWrites: ConversationAction[];
  recommendationAfterTurn: number | null;
  expectedHandoff: ConversationAction;
  expectedDecisionSource?: "Leadership";
  expectedSessionImpactEntries: number;
  unchangedRuntimeAreas: string[];
};
export type ExecutiveConversationScenario = { id: string; name: string; organizationId: string; initialRuntime: OrganizationRuntime; turns: ExecutiveConversationTurn[]; expected: ExecutiveConversationExpectations };
export type CollaborationDimension = "executiveUnderstanding" | "questionQuality" | "collaborativeReasoning" | "constructiveChallenge" | "conversationalContinuity" | "modelStewardship" | "recommendationQuality" | "actionHandoff" | "sessionImpactAccuracy" | "executiveTrust";
export type ConversationTraceTurn = { turn: number; executiveMessage: string; action?: ConversationAction; interpretation: ExecutiveConversationInterpretation | null; discoveryResponse: string; questionCount: number; recognizedConcepts: string[]; challenged: boolean; recommendationPresent: boolean; durableWrites: ConversationAction[] };
export type ExecutiveConversationRun = { scenarioId: string; organizationId: string; trace: ConversationTraceTurn[]; finalRuntime: OrganizationRuntime; sessionImpact: { durable: Array<{ action: string; label: string }>; provisional: Array<{ action: string; label: string }> }; runtimeDiff: { decisionDelta: number; investigationDelta: number; unrelatedAreasPreserved: boolean }; hardFailures: string[] };
export type ScenarioScore = { scenarioId: string; score: number; dimensions: Record<CollaborationDimension, number>; criticalFailures: string[]; warnings: string[]; strongestBehavior: string; weakestBehavior: string };
