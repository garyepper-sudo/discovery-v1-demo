"use client";

import BriefingWorkspace from "./workspaces/BriefingWorkspace";
import UnderstandingWorkspace from "./workspaces/UnderstandingWorkspace";
import RecommendationWorkspace from "./workspaces/RecommendationWorkspace";
import DecisionAnalysisWorkspace from "./workspaces/DecisionAnalysisWorkspace";
import SimulationWorkspace from "./workspaces/SimulationWorkspace";
import TimelineWorkspace from "./workspaces/TimelineWorkspace";
import AskWorkspace from "./workspaces/AskWorkspace";

import type {
  ExecutiveCommunication,
} from "../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveDecisionProjection,
} from "./projection/buildExecutiveDecisionProjection";

import type {
  ExecutiveWorkspaceMode,
} from "./ExecutiveWorkspaceMode";

type ExecutiveWorkspaceProps = {
  communication: ExecutiveCommunication;
  decisionProjection?: ExecutiveDecisionProjection;
  mode: ExecutiveWorkspaceMode;
};

export default function ExecutiveWorkspace({
  communication,
  decisionProjection,
  mode,
}: ExecutiveWorkspaceProps) {
  switch (mode) {
    case "briefing":
      return (
        <BriefingWorkspace
          communication={communication}
        />
      );

    case "understand":
      return (
        <UnderstandingWorkspace
          communication={communication}
        />
      );

    case "recommend":
      return (
        <RecommendationWorkspace
          communication={communication}
        />
      );

    case "decision":
      return decisionProjection ? (
        <DecisionAnalysisWorkspace
          projection={decisionProjection}
        />
      ) : (
        <RecommendationWorkspace
          communication={communication}
        />
      );

    case "simulate":
      return (
        <SimulationWorkspace
          communication={communication}
        />
      );

    case "timeline":
      return (
        <TimelineWorkspace
          communication={communication}
        />
      );

    case "ask":
      return (
        <AskWorkspace
          communication={communication}
        />
      );

    default:
      return (
        <BriefingWorkspace
          communication={communication}
        />
      );
  }
}
