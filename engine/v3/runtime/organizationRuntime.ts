import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import type {
  PersistentBelief,
  UnderstandingCluster,
} from "../understanding/types";
import type { ObservationInput } from "../cognition/observations/evolveObservations";
import { createOrganizationModel } from "../model/createOrganizationModel";
import type { OrganizationModel } from "../model/organizationModel";
import type { EntityMention } from "../entities/entityLifecycle";

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
  understandingState: unknown;
  organizationalUnderstandingState: OrganizationalUnderstandingState;
  understandingClusters: UnderstandingCluster[];

  /**
   * Sprint 36
   *
   * Perceptual entity mentions extracted from investigation material.
   * These are not yet persistent organizational memory.
   * They are raw recognized references that can later be resolved
   * into stable OrganizationalEntity records in the OrganizationModel.
   */
  entityMentions: EntityMention[];

  observations: ObservationInput[];
  beliefs: PersistentBelief[];

  patterns: unknown[];
  deltas: unknown[];
  events: unknown[];

  functionalInterpretationState: unknown;
  organizationalCapabilitiesState: unknown;
  organizationalPhenomenaState: unknown;

  semanticConcepts: unknown[];
  meaningSignals: unknown[];
  organizationalConcepts: unknown[];
};

export type OrganizationRuntimeOrganism = {
  organismState: unknown;
  lastEvolutionAt: string | null;
};

export type OrganizationRuntime = {
  metadata: OrganizationRuntimeMetadata;

  /**
   * Sprint 35
   *
   * Canonical representation of organizational understanding.
   * Every cognitive engine should gradually migrate to reading
   * from and contributing back into this shared model.
   */
  organizationModel: OrganizationModel;

  /**
   * Legacy cognitive state.
   *
   * These structures remain during the migration to the unified
   * organizational model and will increasingly become cached
   * projections rather than primary sources of truth.
   */
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

    organizationModel: createOrganizationModel(params.organizationId),

    memory: {
      understandingState: null,

      organizationalUnderstandingState: {
        organizationId: params.organizationId,
        name: params.name,
        industry: params.industry,
        website: params.website,
        lastUpdatedAt: now,
        currentUnderstandings: [],
        organizationalConcepts: [],
        confidenceLandscape: [],
        activeQuestions: [],
        strategicRisks: [],
        evolutionHistory: [],
        health: {
          maturity: 0,
          coherence: 0,
          uncertainty: 1,
          adaptation: 0,
        },
      },

      understandingClusters: [],

      entityMentions: [],

      observations: [],
      beliefs: [],

      patterns: [],
      deltas: [],
      events: [],

      functionalInterpretationState: null,
      organizationalCapabilitiesState: null,
      organizationalPhenomenaState: null,

      semanticConcepts: [],
      meaningSignals: [],
      organizationalConcepts: [],
    },

    organism: {
      organismState: null,
      lastEvolutionAt: null,
    },
  };
}