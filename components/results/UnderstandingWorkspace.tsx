"use client";

import { useState } from "react";
import CurrentUnderstanding from "./workspace/CurrentUnderstanding";
import WhyView from "./workspace/WhyView";
import HowView from "./workspace/HowView";
import ConfidenceView from "./workspace/ConfidenceView";
import UncertaintyView from "./workspace/UncertaintyView";
import ChangesView from "./workspace/ChangesView";
import EvidenceView from "./workspace/EvidenceView";
import TraceView from "./workspace/TraceView";
import WorkspaceHeader from "./workspace/WorkspaceHeader";
import WorkspaceSidebar from "./workspace/WorkspaceSidebar";
import WorkspaceTabs, { type WorkspaceView } from "./workspace/WorkspaceTabs";

type UnderstandingWorkspaceProps = {
  understanding?: any;
  beliefs?: any[];
  hypotheses?: any[];
  themes?: any[];
  contradictions?: any[];
  causalChains?: any[];
  evidence?: any[];
  organismState?: any;
  onClose: () => void;
  onTrace: () => void;
};

const WORKSPACE_LABELS: Record<WorkspaceView, string> = {
  understanding: "Understanding",
  why: "Why",
  how: "How",
  confidence: "Confidence",
  uncertainty: "Uncertainty",
  changes: "What Changes This",
  evidence: "Evidence",
  trace: "Trace",
};

export default function UnderstandingWorkspace({
  understanding,
  beliefs = [],
  hypotheses = [],
  themes = [],
  contradictions = [],
  causalChains = [],
  evidence = [],
  organismState,
  onClose,
  onTrace,
}: UnderstandingWorkspaceProps) {
  const [activeView, setActiveView] =
    useState<WorkspaceView>("understanding");

  const primaryBelief = beliefs[0];

  return (
    <section className="understanding-workspace">
      <WorkspaceHeader onClose={onClose} />

      <WorkspaceTabs activeView={activeView} onChange={setActiveView} />

      <div className="workspace-body">
        <main className="workspace-panel">
          {activeView === "understanding" && (
            <CurrentUnderstanding
              understanding={understanding}
              primaryBelief={primaryBelief}
            />
          )}

          {activeView === "why" && (
            <WhyView
              primaryBelief={primaryBelief}
              evidence={evidence}
              themes={themes}
            />
          )}

          {activeView === "how" && (
            <HowView causalChains={causalChains} organismState={organismState} />
          )}

          {activeView === "confidence" && (
            <ConfidenceView
              primaryBelief={primaryBelief}
              evidence={evidence}
              contradictions={contradictions}
              organismState={organismState}
            />
          )}

          {activeView === "uncertainty" && (
            <UncertaintyView
              primaryBelief={primaryBelief}
              contradictions={contradictions}
            />
          )}

          {activeView === "changes" && (
            <ChangesView
              primaryBelief={primaryBelief}
              hypotheses={hypotheses}
            />
          )}

          {activeView === "evidence" && <EvidenceView evidence={evidence} />}

          {activeView === "trace" && <TraceView onTrace={onTrace} />}
        </main>

        <WorkspaceSidebar
          organismState={organismState}
          primaryBelief={primaryBelief}
          activeLabel={WORKSPACE_LABELS[activeView]}
        />
      </div>
    </section>
  );
}