import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import type {
  PersistentBelief,
  UnderstandingCluster,
} from "../understanding/types";
import type { EvolvedObservation } from "../cognition/observationEvolution";
import { createOrganizationModel } from "../model/createOrganizationModel";
import type { OrganizationModel } from "../model/organizationModel";
import type { EntityMention } from "../entities/entityLifecycle";

import type { OrganizationalMemory } from "../model/memory/organizationalMemory";

import type {
  OrganizationalMemoryMaturity,
  OrganizationalTheory,
  OrganizationalTheoryEvolution,
  UnderstandingEvolution,
} from "../model/memory/organizationalTheories";

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

    organizationModel: createOrganizationModel(params.organizationId),

    memory: {
      /**
       * Sprint 34 canonical memory.
       *
       * This starts as null and will be populated by the new
       * Memory Consolidation pipeline.
       */
      organizationalMemory: null,

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
    },

    organism: {
      organismState: null,
      lastEvolutionAt: null,
    },
  };
}