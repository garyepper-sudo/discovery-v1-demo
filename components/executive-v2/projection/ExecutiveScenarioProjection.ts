import type {
  OrganizationalIntervention,
} from "../../../engine/v3/model/simulate/organizationalIntervention";

import type {
  SimulatedOrganizationState,
} from "../../../engine/v3/model/simulate/simulateOrganization";

import type {
  SimulationScenarioComparison,
} from "../../../engine/v3/model/simulate/compareSimulationScenario";

import type {
  PredictionReflection,
} from "../../../engine/v3/model/predictions/buildPredictionReflection";

import type {
  OrganizationalAssessment,
} from "../../../engine/v3/model/judgment/organizationalJudgment";

import type {
  UnderstandingCandidate,
} from "../../../engine/v3/understanding/consolidateUnderstanding";

export type ExecutiveScenarioProjection = {
  generatedAt: string;

  organizationId: string;

  intervention: OrganizationalIntervention;

  summary: {
    title: string;
    description: string;
    rationale: string;
    confidence: number;
    timeHorizon: string;
  };

  projectedFuture: {
    simulatedOrganizationState:
      SimulatedOrganizationState;

    predictionReflection:
      PredictionReflection;

    executiveAssessment:
      OrganizationalAssessment;

    understandingCandidates:
      UnderstandingCandidate[];
  };

  comparison:
    SimulationScenarioComparison;
};