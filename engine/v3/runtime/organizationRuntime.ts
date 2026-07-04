import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import type { OrganizationalPhenomenaState } from "../phenomena/organizationalPhenomena";
import type { UnderstandingCluster } from "../understanding/types";
import type { OrganizationalConcept } from "../concepts/synthesizeOrganizationalConcepts";
import type { OrganizationalConcept as SemanticConcept } from "../compression/types";
import type { MeaningSignal } from "../meaning/types";
import type { OrganizationalCapabilitiesState } from "../capabilities/organizationalCapabilities";
import type { FunctionalInterpretationState } from "../functional/functionalInterpretation";

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
  understandingState: any;
  organizationalUnderstandingState: OrganizationalUnderstandingState;

  understandingClusters: UnderstandingCluster[];

  semanticConcepts: SemanticConcept[];

  meaningSignals: MeaningSignal[];

  organizationalConcepts: OrganizationalConcept[];

  organizationalCapabilitiesState: OrganizationalCapabilitiesState;

  /**
   * Persistent organizational dynamics inferred from
   * accumulated understandings. This becomes the
   * cognitive bridge between Understanding and Capability.
   */
  functionalInterpretationState: FunctionalInterpretationState;

  organizationalPhenomenaState: OrganizationalPhenomenaState;

  observations: any[];
  beliefs: any[];
  patterns: any[];
  deltas: any[];
  events: any[];
};

export type OrganizationRuntimeOrganism = {
  organismState: any;
  lastEvolutionAt: string | null;
};

export type OrganizationRuntime = {
  metadata: OrganizationRuntimeMetadata;
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

      semanticConcepts: [],

      meaningSignals: [],

      organizationalConcepts: [],

      organizationalCapabilitiesState: {
        capabilities: [],
        lastUpdated: now,
      },

      functionalInterpretationState: {
        interpretations: [],
        lastUpdatedAt: now,
      },

      organizationalPhenomenaState: {
        phenomena: [],
        lastUpdatedAt: now,
      },

      observations: [],
      beliefs: [],
      patterns: [],
      deltas: [],
      events: [],
    },

    organism: {
      organismState: null,
      lastEvolutionAt: null,
    },
  };
}