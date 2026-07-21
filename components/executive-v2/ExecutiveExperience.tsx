"use client";

import ExecutiveWorkspace from "../executive-v3/ExecutiveWorkspace";

import {
  synthesizeExecutiveCommunication,
} from "../../engine/v3/communication/synthesizeExecutiveCommunication";

import type {
  ExecutiveProjection,
} from "./projection/ExecutiveProjection";

import type {
  ExecutiveWorkspaceMode,
} from "../executive-v3/ExecutiveWorkspaceMode";

import type {
  ExecutiveDecisionProjection,
} from "../executive-v3/projection/buildExecutiveDecisionProjection";

import type {
  DecisionDefinitionDraft,
  DecisionDefinitionSource,
} from "../executive-v3/workspaces/DecisionDefinitionWorkspace";

import type {
  ExecutiveDecisionCommitSelection,
} from "./ExecutiveWorkspace";

type ExecutiveExperienceProps = {
  projection: ExecutiveProjection;

  /**
   * Stable organization identity used by the canonical
   * Executive Communication producer.
   */
  organizationId: string;

  /**
   * Active V3 workspace perspective.
   */
  mode: ExecutiveWorkspaceMode;

  /**
   * Canonical projection produced by the Executive Decision cycle.
   */
  decisionProjection?: ExecutiveDecisionProjection;

  /**
   * Source used to initialize the decision-definition workflow.
   */
  decisionDefinitionSource?: DecisionDefinitionSource;

  /**
   * Initial values shown while defining or confirming a decision.
   */
  decisionDefinitionDraft?: Partial<DecisionDefinitionDraft>;

  /**
   * Opens decision definition from the recommendation entry state.
   */
  onOpenDecisionLab?: () => void;

  /**
   * Returns from decision definition to the preceding workspace.
   */
  onCancelDecisionDefinition?: () => void;

  /**
   * Submits a confirmed Executive Decision definition for evaluation.
   */
  onEvaluateDecision?: (
    decision: DecisionDefinitionDraft,
  ) => void;

  /**
   * Records the executive's final disposition after Decision Lab review.
   */
  onCommitDecision?: (
    selection:
      ExecutiveDecisionCommitSelection,
  ) => Promise<void>;

  /**
   * Indicates that the Executive Decision cycle is currently running.
   */
  isOpeningDecisionLab?: boolean;

  /**
   * User-facing error produced while opening the Decision Lab.
   */
  decisionLabError?: string | null;

  /**
   * Indicates that the executive decision record is being persisted.
   */
  isCommittingDecision?: boolean;

  /**
   * User-facing error produced while recording the executive decision.
   */
  decisionCommitError?: string | null;

  /**
   * Persisted Executive Decision Record returned by Runtime.
   */
  committedDecisionRecord?: unknown | null;

  /**
   * Preserved for compatibility with existing callers.
   */
  defaultDecisionConditionId?: string;
};

/**
 * Compatibility boundary between the existing Executive Projection
 * and the canonical Executive Communication Operating System.
 *
 * The V3 workspace receives:
 *
 * - the full Executive Projection for workspaces that expose canonical
 *   organizational cognition directly,
 * - the synthesized Executive Communication for executive-facing
 *   narrative and recommendation surfaces,
 * - the optional Executive Decision Projection for the Decision Lab,
 * - the decision-definition state and callbacks required to create or
 *   confirm an Executive Decision before evaluation,
 * - the decision-commit state and callback owned by the application
 *   conductor.
 */
export default function ExecutiveExperience({
  projection,
  organizationId,
  mode,
  decisionProjection,
  decisionDefinitionSource,
  decisionDefinitionDraft,
  onOpenDecisionLab,
  onCancelDecisionDefinition,
  onEvaluateDecision,
  onCommitDecision,
  isOpeningDecisionLab = false,
  decisionLabError = null,
  isCommittingDecision = false,
  decisionCommitError = null,
  committedDecisionRecord = null,
}: ExecutiveExperienceProps) {
  const communication =
    synthesizeExecutiveCommunication({
      projection,
      organizationId,
    });

  return (
    <ExecutiveWorkspace
      projection={projection}
      organizationId={organizationId}
      communication={communication}
      mode={mode}
      decisionProjection={decisionProjection}
      decisionDefinitionSource={
        decisionDefinitionSource
      }
      decisionDefinitionDraft={
        decisionDefinitionDraft
      }
      onOpenDecisionLab={
        onOpenDecisionLab
      }
      onCancelDecisionDefinition={
        onCancelDecisionDefinition
      }
      onEvaluateDecision={
        onEvaluateDecision
      }
      onCommitDecision={
        onCommitDecision
      }
      isOpeningDecisionLab={
        isOpeningDecisionLab
      }
      decisionLabError={
        decisionLabError
      }
      isCommittingDecision={
        isCommittingDecision
      }
      decisionCommitError={
        decisionCommitError
      }
      committedDecisionRecord={
        committedDecisionRecord
      }
    />
  );
}
