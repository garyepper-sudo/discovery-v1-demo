import type {
  ExecutiveDecisionOutcome,
} from "./executiveDecisionOutcome";

import type {
  ExecutiveDecisionReflection,
} from "./executiveDecisionReflection";

import type {
  ExecutiveDecisionLearning,
} from "./executiveDecisionLearning";

export type ExecutiveDecisionMemory = {
  /**
   * Organization whose decision history is retained.
   */
  organizationId: string;

  /**
   * Completed or partially observed decision outcomes.
   */
  outcomes:
    ExecutiveDecisionOutcome[];

  /**
   * Reflections generated from evaluated outcomes.
   */
  reflections:
    ExecutiveDecisionReflection[];

  /**
   * Reusable lessons synthesized from decision history.
   */
  learnings:
    ExecutiveDecisionLearning[];

  /**
   * Decision IDs already incorporated into this memory.
   */
  rememberedDecisionIds:
    string[];

  /**
   * Number of completed decision outcomes represented.
   */
  completedDecisionCount: number;

  /**
   * Number of decisions with incomplete or unknown outcomes.
   */
  unresolvedDecisionCount: number;

  /**
   * Overall confidence in the retained decision memory.
   */
  confidence: number;

  /**
   * Human-readable summary of what Discovery currently knows
   * from prior executive decisions.
   */
  summary: string;

  /**
   * Stable timestamp for the most recent memory update.
   */
  updatedAt: string;
};