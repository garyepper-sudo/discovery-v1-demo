import { runExecutiveDecisionCycle } from "../../v3/decisions/runExecutiveDecisionCycle";
import type { ExecutiveDecision } from "../../v3/model/simulate/executiveDecision";
import type { OrganizationRuntime } from "../../v3/runtime";
import type { DecisionStressScenario, ExecutiveDecisionCase, ExecutiveDecisionLabRunResult } from "./contracts";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function buildExecutiveDecision(decisionCase: ExecutiveDecisionCase, scenario: DecisionStressScenario | undefined, fixedTimestamp: string): ExecutiveDecision {
  const overrides = scenario?.decisionOverrides;
  return {
    id: `executive-decision-${decisionCase.id}`,
    organizationId: decisionCase.organizationId,
    type: "execution",
    title: overrides?.proposedDecision ?? decisionCase.proposedDecision,
    objective: decisionCase.statedObjective,
    rationale: overrides?.statedRationale ?? decisionCase.statedRationale,
    status: "ready",
    timeHorizon: "near-term",
    targetConditionIds: overrides?.targetConditionIds ?? decisionCase.decisionContext.organizationalConditionIds,
    successMetrics: [{ name: "Delivery reliability", targetConditionId: "condition-decisionflow", rationale: "The intervention must improve delivery reliability by reducing decision delay." }],
    constraints: [
      { type: "risk", description: "Do not reduce decision quality or organizational control.", required: true },
      ...(overrides?.requiredCapacityConstraint ? [{ type: "capacity" as const, description: overrides.requiredCapacityConstraint, required: true }] : []),
    ],
    allowedInterventionTypes: overrides?.allowedInterventionTypes ?? ["hiring", "technology", "policy", "governance", "strategy", "reorganization"],
    assumptions: unique(["The current organizational judgment is sufficiently accurate.", ...scenario?.changedAssumptions ?? []]),
    openQuestions: [...decisionCase.decisionContext.uncertaintyStatements],
    confidence: 0.78,
    createdAt: fixedTimestamp,
    updatedAt: fixedTimestamp,
  };
}

function applyScenario(runtime: OrganizationRuntime, scenario: DecisionStressScenario | undefined): OrganizationRuntime {
  const next = clone(runtime);
  if (scenario?.evidenceCompleteness !== undefined && next.memory.organizationalUncertainty) {
    next.memory.organizationalUncertainty.evidenceCompleteness = scenario.evidenceCompleteness;
    next.memory.organizationalUncertainty.overallUncertainty = Math.max(next.memory.organizationalUncertainty.overallUncertainty, 1 - scenario.evidenceCompleteness);
    next.memory.organizationalUncertainty.confidenceLimiters = unique([...next.memory.organizationalUncertainty.confidenceLimiters, "Decisive governance evidence is unavailable in this scenario."]);
  }
  return next;
}

export function runExecutiveDecisionLab(params: {
  decisionCase: ExecutiveDecisionCase;
  runtime: OrganizationRuntime;
  fixedTimestamp: string;
  scenario?: DecisionStressScenario;
}): ExecutiveDecisionLabRunResult {
  const executiveDecision = buildExecutiveDecision(params.decisionCase, params.scenario, params.fixedTimestamp);
  const runtime = applyScenario(params.runtime, params.scenario);
  const cycle = runExecutiveDecisionCycle({ executiveDecision, runtime, completedAt: params.fixedTimestamp });
  const ranking = new Map(cycle.rankedScenarios.map((item, index) => [item.interventionId, index + 1]));
  const viability = new Map(cycle.viabilityEvaluations.map((item) => [item.optionId, item.status]));
  const comparison = new Map(cycle.comparisonSet.scenarioComparisons.map((item) => [item.interventionId, item.executiveSummary]));
  const understanding = runtime.memory.organizationalUnderstandingState.currentUnderstandings[0];
  const constraint = (runtime.memory as typeof runtime.memory & { primaryExecutiveConstraint?: { supportingEvidenceIds?: string[] } }).primaryExecutiveConstraint;
  const recommendation = cycle.recommendation;
  const recommendedOption = cycle.generatedOptions.find(
    (option) =>
      option.id === recommendation.recommendedStrategy?.optionId,
  );

  const result = {
    decisionCaseId: params.decisionCase.id,
    scenarioId: params.scenario?.id,
    fixedTimestamp: params.fixedTimestamp,
    engineInput: JSON.stringify({ executiveDecision, scenario: params.scenario ? { id: params.scenario.id, changedAssumptions: params.scenario.changedAssumptions, changedConstraints: params.scenario.changedConstraints, changedEvidence: params.scenario.changedEvidence } : undefined }),
    decisionFrame: {
      statedQuestion: executiveDecision.title,
      interpretedObjective: cycle.optimizationObjective.objective,
      primaryConstraintId: recommendation.primaryConstraintId,
    },
    options: cycle.generatedOptions.map((option) => ({
      id: option.id,
      label: option.title,
      type: option.type,
      scope: option.scope,
      rank: ranking.get(option.id),
      viability: viability.get(option.id),
      expectedImpact: comparison.get(option.id),
      risks: option.risks,
      assumptions: option.assumptions,
    })),
    simulations: cycle.scenarios.map((scenario) => ({
      optionId: scenario.optionId,
      interventionId: scenario.intervention.id,
      scope: scenario.intervention.scope,
    })),
    recommendation: {
      optionId: recommendation.recommendedStrategy?.optionId,
      interventionId: recommendation.recommendedInterventionId,
      label: recommendation.recommendedStrategy?.title,
      scope: recommendedOption?.scope,
      disposition: recommendation.status,
      confidence: recommendation.confidence,
      rationale: recommendation.summary,
    },
    assumptions: recommendation.assumptions,
    risks: recommendation.risks,
    tradeoffs: recommendation.tradeOffs,
    uncertainty: cycle.confidenceCalibration.confidenceLimiters,
    missingEvidence: recommendation.evidenceThatCouldChangeRecommendation,
    supportingEvidenceIds: unique([...(understanding?.evidenceIds ?? []), ...(constraint?.supportingEvidenceIds ?? [])]).sort(),
    upstreamEvidenceIds: unique(params.decisionCase.decisionContext.evidenceIds).sort(),
  };

  return { ...result, deterministicSignature: JSON.stringify(result) };
}
