import { UnderstandingState } from "../understanding/types";

export function createInitialUnderstandingState(
  organizationId: string
): UnderstandingState {
  const now = new Date().toISOString();

  return {
    organizationId,
    version: 1,
    createdAt: now,
    updatedAt: now,

    events: [],

    beliefs: [],
    themes: [],
    contradictions: [],
    mechanisms: [],
    evidenceIndex: [],
    observations: [],

    stablePatterns: [],
    openQuestions: [],

    organism: {
      version: 1,
      nodes: [],
      links: [],
      recentChangeNodeIds: [],
    },
  };
}