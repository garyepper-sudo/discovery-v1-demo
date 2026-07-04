"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const SECTION_ORDER: WorkspaceView[] = [
  "understanding",
  "why",
  "how",
  "confidence",
  "uncertainty",
  "changes",
  "evidence",
  "trace",
];

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

  const sectionRefs = useRef<Record<WorkspaceView, HTMLElement | null>>({
    understanding: null,
    why: null,
    how: null,
    confidence: null,
    uncertainty: null,
    changes: null,
    evidence: null,
    trace: null,
  });

  const primaryBelief = beliefs[0];

  const sectionIntro = useMemo<Record<WorkspaceView, string>>(
    () => ({
      understanding: "What Discovery currently understands.",
      why: "The strongest support beneath this understanding.",
      how: "The mechanism Discovery sees connecting events and outcomes.",
      confidence: "How stable this understanding appears right now.",
      uncertainty: "Where the understanding is still incomplete or unstable.",
      changes: "What evidence could shift this conclusion.",
      evidence: "The source material behind the judgment.",
      trace: "A transparent path through the reasoning process.",
    }),
    []
  );

  function handleNavigation(view: WorkspaceView) {
    setActiveView(view);

    sectionRefs.current[view]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        const view = visibleEntry?.target.getAttribute(
          "data-workspace-section"
        ) as WorkspaceView | null;

        if (view) {
          setActiveView(view);
        }
      },
      {
        root: null,
        threshold: [0.28, 0.42, 0.6],
        rootMargin: "-18% 0px -55% 0px",
      }
    );

    SECTION_ORDER.forEach((view) => {
      const section = sectionRefs.current[view];

      if (section) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="understanding-workspace">
      <WorkspaceHeader onClose={onClose} />

      <WorkspaceTabs activeView={activeView} onChange={handleNavigation} />

      <div className="workspace-body workspace-body-notebook">
        <main className="workspace-panel workspace-notebook">
          <section
            ref={(node) => {
              sectionRefs.current.understanding = node;
            }}
            data-workspace-section="understanding"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">
              {WORKSPACE_LABELS.understanding}
            </p>
            <p className="workspace-section-intro">
              {sectionIntro.understanding}
            </p>
            <CurrentUnderstanding
              understanding={understanding}
              primaryBelief={primaryBelief}
            />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.why = node;
            }}
            data-workspace-section="why"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">{WORKSPACE_LABELS.why}</p>
            <p className="workspace-section-intro">{sectionIntro.why}</p>
            <WhyView
              primaryBelief={primaryBelief}
              evidence={evidence}
              themes={themes}
            />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.how = node;
            }}
            data-workspace-section="how"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">{WORKSPACE_LABELS.how}</p>
            <p className="workspace-section-intro">{sectionIntro.how}</p>
            <HowView causalChains={causalChains} organismState={organismState} />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.confidence = node;
            }}
            data-workspace-section="confidence"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">
              {WORKSPACE_LABELS.confidence}
            </p>
            <p className="workspace-section-intro">
              {sectionIntro.confidence}
            </p>
            <ConfidenceView
              primaryBelief={primaryBelief}
              evidence={evidence}
              contradictions={contradictions}
              organismState={organismState}
            />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.uncertainty = node;
            }}
            data-workspace-section="uncertainty"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">
              {WORKSPACE_LABELS.uncertainty}
            </p>
            <p className="workspace-section-intro">
              {sectionIntro.uncertainty}
            </p>
            <UncertaintyView
              primaryBelief={primaryBelief}
              contradictions={contradictions}
            />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.changes = node;
            }}
            data-workspace-section="changes"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">
              {WORKSPACE_LABELS.changes}
            </p>
            <p className="workspace-section-intro">{sectionIntro.changes}</p>
            <ChangesView
              primaryBelief={primaryBelief}
              hypotheses={hypotheses}
            />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.evidence = node;
            }}
            data-workspace-section="evidence"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">
              {WORKSPACE_LABELS.evidence}
            </p>
            <p className="workspace-section-intro">{sectionIntro.evidence}</p>
            <EvidenceView evidence={evidence} />
          </section>

          <section
            ref={(node) => {
              sectionRefs.current.trace = node;
            }}
            data-workspace-section="trace"
            className="workspace-notebook-section"
          >
            <p className="workspace-section-kicker">{WORKSPACE_LABELS.trace}</p>
            <p className="workspace-section-intro">{sectionIntro.trace}</p>
            <TraceView onTrace={onTrace} />
          </section>
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