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

import {
  buildExecutiveDashboard,
  type ExecutiveDashboard,
} from "./buildExecutiveDashboard";

import type { ExecutiveState } from "./executiveState";

export type {
  ExecutiveLearningSummary,
  ExecutiveBriefing,
  ExecutiveState,
  ExecutiveDashboard,
  BuildExecutiveStateInput,
};

export * from "./executiveState";
export * from "./buildExecutiveState";
export * from "./buildExecutiveDashboard";

export type ExecutiveLearningExperience = {
  /**
   * Internal executive cognition.
   */
  executiveState: ExecutiveState;

  /**
   * Canonical presentation model.
   * All executive UI should consume this object.
   */
  executiveDashboard: ExecutiveDashboard;

  /**
   * Legacy exports retained temporarily for backwards compatibility.
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

  const executiveDashboard = buildExecutiveDashboard(executiveState);

  return {
    executiveState,
    executiveDashboard,

    // Legacy outputs
    summary,
    briefing,
  };
}