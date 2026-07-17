import type {
  ExecutiveDecisionRecommendation,
} from "../decisions/buildExecutiveDecisionRecommendation";

import type {
  ExecutiveScenarioComparisonEntry,
  ExecutiveScenarioComparisonSet,
} from "../decisions/compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "../decisions/rankExecutiveScenarios";

import type {
  ExecutiveOptimizationObjective,
} from "../optimization/executiveOptimizationObjective";

import type {
  ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

export type ExecutiveSimulationScenario = {
  optionId: string;

  interventionId: string;

  scenarioId: string;

  scenario:
    ExecutiveScenarioResult;

  comparison:
    ExecutiveScenarioComparisonEntry;

  ranking:
    RankedExecutiveScenario;
};

export type ExecutiveSimulation = {
  id: string;

  organizationId: string;

  generatedAt: string;

  optimizationObjective:
    ExecutiveOptimizationObjective;

  recommendation:
    ExecutiveDecisionRecommendation;

  recommendedScenario:
    ExecutiveSimulationScenario;

  alternativeScenarios:
    ExecutiveSimulationScenario[];

  comparisonSet:
    ExecutiveScenarioComparisonSet;

  executiveConfidence: number;

  executiveSummary: string;

  expectedBenefits: string[];

  tradeoffs: string[];

  risks: string[];

  assumptions: string[];

  keyDrivers: string[];

  evidenceThatCouldChangeRecommendation:
    string[];
};