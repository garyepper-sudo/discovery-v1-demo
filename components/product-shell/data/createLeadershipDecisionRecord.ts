import type { ExecutiveDecisionRecord } from "../../../engine/v3/decisions/executiveDecisionRecord";

export function createLeadershipDecisionRecord(input: {
  organizationId: string;
  interactionId: string;
  consideration: string;
  whyNow: string;
  outcome?: string;
  targetConditionIds: string[];
  createdAt: string;
}): ExecutiveDecisionRecord {
  return {
    id: `executive-decision-record-${input.interactionId}`,
    submissionId: input.interactionId,
    organizationId: input.organizationId,
    executiveDecisionId: `leadership-decision-${input.interactionId}`,
    status: "draft",
    disposition: "modified-recommendation",
    title: input.consideration,
    decision: input.consideration,
    rationale: input.whyNow,
    acceptedAssumptions: [],
    acceptedRisks: [],
    expectedOutcomes: input.outcome ? [{ id: `expected-outcome-${input.interactionId}`, description: input.outcome, conditionIds: [...input.targetConditionIds] }] : [],
    successCriteria: [],
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
    outcomeStatus: "not-reviewed",
  };
}
