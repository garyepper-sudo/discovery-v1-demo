"use client";

import BriefingWorkspace from "./workspaces/BriefingWorkspace";
import UnderstandingWorkspace from "./workspaces/UnderstandingWorkspace";
import RecommendationWorkspace from "./workspaces/RecommendationWorkspace";
import DecisionDefinitionWorkspace from "./workspaces/DecisionDefinitionWorkspace";
import ExecutiveDecisionWorkspace from "./workspaces/ExecutiveDecisionWorkspace";
import SimulationWorkspace from "./workspaces/SimulationWorkspace";
import TimelineWorkspace from "./workspaces/TimelineWorkspace";
import AskWorkspace from "./workspaces/AskWorkspace";

import type {
  ExecutiveProjection,
} from "../executive-v2/projection/ExecutiveProjection";

import type {
  ExecutiveCommunication,
} from "../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveDecisionProjection,
} from "./projection/buildExecutiveDecisionProjection";

import type {
  DecisionDefinitionDraft,
  DecisionDefinitionSource,
} from "./workspaces/DecisionDefinitionWorkspace";

import type {
  ExecutiveWorkspaceMode,
} from "./ExecutiveWorkspaceMode";

import type {
  ExecutiveDecisionCommitSelection,
} from "../executive-v2/ExecutiveWorkspace";

type ExecutiveWorkspaceProps = {
  projection:
    ExecutiveProjection;

  organizationId:
    string;

  communication:
    ExecutiveCommunication;

  decisionProjection?:
    ExecutiveDecisionProjection;

  mode:
    ExecutiveWorkspaceMode;

  decisionDefinitionSource?:
    DecisionDefinitionSource;

  decisionDefinitionDraft?:
    Partial<DecisionDefinitionDraft>;

  onOpenDecisionLab?:
    () => void;

  onCancelDecisionDefinition?:
    () => void;

  onEvaluateDecision?:
    (
      decision:
        DecisionDefinitionDraft,
    ) => void;

  onCommitDecision?:
    (
      selection:
        ExecutiveDecisionCommitSelection,
    ) => Promise<void>;

  isOpeningDecisionLab?:
    boolean;

  decisionLabError?:
    string | null;

  isCommittingDecision?:
    boolean;

  decisionCommitError?:
    string | null;

  committedDecisionRecord?:
    unknown | null;
};

export default function ExecutiveWorkspace({
  projection,
  organizationId,
  communication,
  decisionProjection,
  mode,
  decisionDefinitionSource =
    "discovery-recommendation",
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
}: ExecutiveWorkspaceProps) {
  switch (mode) {
    case "briefing":
      return (
        <BriefingWorkspace
          communication={
            communication
          }
          decisionProjection={
            decisionProjection
          }
        />
      );

    case "understand":
      return (
        <UnderstandingWorkspace
          projection={
            projection
          }
        />
      );

    case "recommend":
      return (
        <RecommendationWorkspace
          communication={
            communication
          }
          onOpenDecisionLab={
            onOpenDecisionLab
          }
          isOpeningDecisionLab={
            isOpeningDecisionLab
          }
          decisionLabError={
            decisionLabError
          }
        />
      );

    case "define-decision":
      return (
        <DecisionDefinitionWorkspace
          source={
            decisionDefinitionSource
          }
          initialDecision={
            decisionDefinitionDraft
          }
          isEvaluating={
            isOpeningDecisionLab
          }
          error={
            decisionLabError
          }
          onCancel={() => {
            onCancelDecisionDefinition?.();
          }}
          onEvaluate={(
            decision,
          ) => {
            onEvaluateDecision?.(
              decision,
            );
          }}
        />
      );

    case "decision":
      return decisionProjection ? (
        <ExecutiveDecisionWorkspace
          projection={
            decisionProjection
          }
          onCommitDecision={
            onCommitDecision
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
      ) : (
        <RecommendationWorkspace
          communication={
            communication
          }
          onOpenDecisionLab={
            onOpenDecisionLab
          }
          isOpeningDecisionLab={
            isOpeningDecisionLab
          }
          decisionLabError={
            decisionLabError
          }
        />
      );

    case "simulate":
      return (
        <SimulationWorkspace
          projection={
            projection
          }
          organizationId={
            organizationId
          }
        />
      );

    case "timeline":
      return (
        <TimelineWorkspace
          communication={
            communication
          }
        />
      );

    case "ask":
      return (
        <AskWorkspace
          communication={
            communication
          }
        />
      );

    default:
      return (
        <BriefingWorkspace
          communication={
            communication
          }
          decisionProjection={
            decisionProjection
          }
        />
      );
  }
}
