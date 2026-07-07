import type { OrganizationRuntime } from "../runtime/organizationRuntime";

import {
  buildExecutiveLearningSummary,
  type ExecutiveLearningSummary,
} from "./executiveLearningSummary";

import {
  buildExecutiveBriefing,
  type ExecutiveBriefing,
} from "./buildExecutiveBriefing";

import {
  buildExecutiveState,
  type BuildExecutiveStateInput,
} from "./buildExecutiveState";

import type { ExecutiveState } from "./executiveState";

export type {
  ExecutiveLearningSummary,
  ExecutiveBriefing,
  ExecutiveState,
  BuildExecutiveStateInput,
};

export * from "./executiveState";
export * from "./buildExecutiveState";
export * from "./buildExecutiveDashboard";

export type ExecutiveLearningExperience = {
  /**
   * Canonical executive presentation object.
   * All new UI should consume this object.
   */
  executiveState: ExecutiveState;

  /**
   * Legacy exports retained for backwards compatibility.
   * These can be removed after Sprint 37 migration.
   */
  summary: ExecutiveLearningSummary;
  briefing: ExecutiveBriefing;
};

export function buildExecutiveLearningExperience(
  runtime: OrganizationRuntime,
): ExecutiveLearningExperience {
  const summary = buildExecutiveLearningSummary(runtime);

  const briefing = buildExecutiveBriefing(summary);

  const executiveState = buildExecutiveState({
    runtime,
    briefing,
    learning: summary,
  });

  return {
    executiveState,

    // Legacy outputs
    summary,
    briefing,
  };
}