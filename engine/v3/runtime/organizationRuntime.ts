import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";

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
   * Latest investigation output.
   * This is the raw understanding produced by the most recent investigation.
   */
  understandingState: any;

  /**
   * Discovery's persistent understanding of the organization.
   * This is continuously refined as new organizational experience is added.
   */
  organizationalUnderstandingState: OrganizationalUnderstandingState;

  /**
   * Persistent organizational observations.
   */
  observations: any[];

  /**
   * Persistent organizational beliefs.
   */
  beliefs: any[];

  /**
   * Emerging organizational patterns.
   */
  patterns: any[];

  /**
   * Historical understanding changes.
   */
  deltas: any[];

  /**
   * Investigation history.
   */
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
      /**
       * Latest investigation result.
       */
      understandingState: null,

      /**
       * Canonical organizational cognitive state.
       */
      organizationalUnderstandingState: {
        organizationId: params.organizationId,
        name: params.name,
        industry: params.industry,
        website: params.website,
        lastUpdatedAt: now,

        currentUnderstandings: [],
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