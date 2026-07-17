import type { EvolvedObservation } from "../cognition/observationEvolution";
import type {
  ExecutiveDecisionRecord,
} from "../decisions/executiveDecisionRecord";
import type { EntityMention } from "../entities/entityLifecycle";
import type { ExecutiveState } from "../executive/executiveState";
import type { OrganizationalCausalModel } from "../model/causal/organizationalCausalModel";
import { createOrganizationModel } from "../model/createOrganizationModel";
import type {
  OrganizationalUncertainty,
} from "../model/epistemic/organizationalUncertainty";
import type { OrganizationalMemory } from "../model/memory/organizationalMemory";
import type {
  OrganizationalMemoryMaturity,
  OrganizationalTheory,
  OrganizationalTheoryEvolution,
  UnderstandingEvolution,
} from "../model/memory/organizationalTheories";
import type { OrganizationModel } from "../model/organizationModel";
import type { PredictionEvaluation } from "../model/predictions/evaluatePredictionOutcomes";
import type { OrganizationalIntervention } from "../model/simulate/organizationalIntervention";
import type { SimulatedOrganizationState } from "../model/simulate/simulateOrganization";
import type {
  PersistentBelief,
  UnderstandingCluster,
} from "../understanding/types";
import {
  createEmptyOrganizationalUnderstandingState,
} from "./organizationalUnderstandingState";
import type {
  OrganizationalUnderstandingState,
} from "./organizationalUnderstandingState";

export type OrganizationRuntimeMetadata = {
  organizationId: string;
  name?: string;
  industry?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  investigationCount: number;
};

export type OrganizationRuntimeMemory = {
  /**
   * Sprint 34
   *
   * Canonical long-term organizational memory.
   *
   * During Sprint 34 this exists alongside the legacy runtime fields.
   * Once migration is complete these legacy fields will be removed and
   * OrganizationalMemory will become the single source of truth.
   */
  organizationalMemory: OrganizationalMemory | null;

  /**
   * Sprint 47
   *
   * Executive narrative continuity memory.
   *
   * This does not change cognition. It preserves the previous
   * executive expression state so the next investigation can explain
   * whether narratives are new, continuing, stable, or changed.
   */
  previousExecutiveState?: ExecutiveState;

  /**
   * Legacy runtime fields
   * (kept temporarily for backwards compatibility)
   */
  understandingState: unknown;
  organizationalUnderstandingState: OrganizationalUnderstandingState;
  understandingClusters: UnderstandingCluster[];
  entityMentions: EntityMention[];

  observations: EvolvedObservation[];
  beliefs: PersistentBelief[];

  theories: OrganizationalTheory[];
  theoryEvolution: OrganizationalTheoryEvolution[];
  understandingEvolution: UnderstandingEvolution | null;
  memoryMaturity: OrganizationalMemoryMaturity | null;

  patterns: unknown[];
  deltas: unknown[];
  events: unknown[];

  functionalInterpretationState: unknown;
  organizationalCapabilitiesState: unknown;
  organizationalPhenomenaState: unknown;

  semanticConcepts: unknown[];
  meaningSignals: unknown[];
  organizationalConcepts: unknown[];

  /**
   * Canonical model of how organizational entities
   * influence one another.
   */
  organizationalCausalModel: OrganizationalCausalModel | null;

  /**
   * Canonical epistemic assessment of the organization's current
   * evidence quality, contradiction load, ambiguity, and confidence
   * limitations.
   *
   * This is optional because newly created runtimes have not yet
   * completed an uncertainty assessment.
   */
  organizationalUncertainty?: OrganizationalUncertainty;

  /**
   * Longitudinal evaluations of prior organizational predictions.
   */
  predictionEvaluations: PredictionEvaluation[];

  /**
   * Intentional organizational changes created for
   * forecasts, scenarios, and decision evaluation.
   */
  organizationalInterventions: OrganizationalIntervention[];

  /**
   * Canonical simulated future organizational states.
   *
   * Version 1 stores one-step projected futures produced by
   * Organizational Simulation.
   */
  simulatedOrganizationStates: SimulatedOrganizationState[];

  /**
   * Durable records of decisions actually made by executives.
   *
   * These records preserve the relationship between Discovery's
   * recommendation, the strategy selected by the executive, expected
   * outcomes, success criteria, and the future review lifecycle.
   */
  executiveDecisionRecords: ExecutiveDecisionRecord[];
};

export type OrganizationRuntimeOrganism = {
  organismState: unknown;
  lastEvolutionAt: string | null;
};

export type OrganizationRuntime = {
  metadata: OrganizationRuntimeMetadata;
  organizationModel: OrganizationModel;
  memory: OrganizationRuntimeMemory;
  organism: OrganizationRuntimeOrganism;
};

export function createEmptyOrganizationRuntime(params: {
  organizationId: string;
  name?: string;
  industry?: string;
  website?: string;
}): OrganizationRuntime {
  const now = new Date().toISOString();

  return {
    metadata: {
      organizationId: params.organizationId,
      name: params.name,
      industry: params.industry,
      website: params.website,
      createdAt: now,
      updatedAt: now,
      investigationCount: 0,
    },

    organizationModel: createOrganizationModel(
      params.organizationId,
    ),

    memory: {
      /**
       * Sprint 34 canonical memory.
       *
       * This starts as null and will be populated by the new
       * Memory Consolidation pipeline.
       */
      organizationalMemory: null,

      /**
       * Sprint 47 executive narrative continuity starts empty.
       */
      previousExecutiveState: undefined,

      /**
       * Legacy runtime state
       */
      understandingState: null,

      organizationalUnderstandingState:
        createEmptyOrganizationalUnderstandingState({
          organizationId: params.organizationId,
          name: params.name,
          industry: params.industry,
          website: params.website,
          now,
        }),

      understandingClusters: [],
      entityMentions: [],

      observations: [],
      beliefs: [],

      theories: [],
      theoryEvolution: [],
      understandingEvolution: null,
      memoryMaturity: null,

      patterns: [],
      deltas: [],
      events: [],

      functionalInterpretationState: null,
      organizationalCapabilitiesState: null,
      organizationalPhenomenaState: null,

      semanticConcepts: [],
      meaningSignals: [],
      organizationalConcepts: [],

      organizationalCausalModel: null,

      /**
       * No uncertainty assessment exists until the cognitive pipeline
       * has evaluated current evidence and organizational ambiguity.
       */
      organizationalUncertainty: undefined,

      predictionEvaluations: [],
      organizationalInterventions: [],
      simulatedOrganizationStates: [],
      executiveDecisionRecords: [],
    },

    organism: {
      organismState: null,
      lastEvolutionAt: null,
    },
  };
}
