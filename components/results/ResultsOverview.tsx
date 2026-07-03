"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import OrganismPreview from "../organism/OrganismPreview";
import TraceUnderstandingPage from "../trace/TraceUnderstandingPage";
import ExecutiveBrief from "./ExecutiveBrief";
import UnderstandingWorkspace from "./UnderstandingWorkspace";

type ResultsOverviewProps = {
  understanding?: any;
  beliefs?: any[];
  hypotheses?: any[];
  themes?: any[];
  contradictions?: any[];
  causalChains?: any[];
  evidence?: any[];
  reasoningGraph?: any;
  organismState?: any;
  delta?: any;
};

export default function ResultsOverview({
  understanding,
  beliefs = [],
  hypotheses = [],
  themes = [],
  contradictions = [],
  causalChains = [],
  evidence = [],
  reasoningGraph,
  organismState,
  delta,
}: ResultsOverviewProps) {
  const [showExplore, setShowExplore] = useState(false);
  const [showOrganismExplorer, setShowOrganismExplorer] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showExplore) return;

    requestAnimationFrame(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [showExplore]);

  const primaryBelief = beliefs[0];

  const confidence = Math.round(
    ((primaryBelief?.confidence ?? understanding?.confidence) || 0.75) * 100
  );

  const narrative = useMemo(
    () =>
      buildWhatChangedNarrative({
        delta,
        organismState,
        beliefs,
        contradictions,
      }),
    [delta, organismState, beliefs, contradictions]
  );

  const headline =
    understanding?.headline ??
    primaryBelief?.headline ??
    "Discovery formed a current understanding.";

  const explanation =
    understanding?.explanation ??
    primaryBelief?.explanation ??
    "Discovery connected evidence, themes, mechanisms, and beliefs into a current executive understanding.";

  const whyItMatters =
    understanding?.whyItMatters ??
    understanding?.implication ??
    primaryBelief?.implication ??
    "This pattern may affect execution quality, coordination, or strategic timing.";

  const recommendedNextStep =
    understanding?.recommendedNextStep ??
    understanding?.recommendation ??
    primaryBelief?.recommendedNextStep ??
    primaryBelief?.nextQuestions?.[0] ??
    "Explore the strongest supporting signals before deciding the next action.";

  return (
    <section className="executive-briefing">
      <ExecutiveBrief
        headline={headline}
        explanation={explanation}
        whyItMatters={whyItMatters}
        recommendedNextStep={recommendedNextStep}
        confidence={confidence}
        evidenceCount={evidence.length}
        mechanismCount={organismState?.mechanisms?.length ?? 0}
        narrative={narrative}
        onExplore={() => setShowExplore(true)}
      />

      <aside className="briefing-organism-column">
        <div className="briefing-organism-card">
          <p className="overview-label">Living understanding</p>

          <div className="briefing-organism-preview">
            <div className="briefing-organism-core" />
          </div>

          <h2>
            {organismState?.emergingPatterns?.[0]?.title ??
              primaryBelief?.headline ??
              "Understanding is stabilizing"}
          </h2>

          <p>
            {organismState?.particles?.length ?? 0} particles ·{" "}
            {Math.round((organismState?.tension ?? 0) * 100)}% tension ·{" "}
            {Math.round((organismState?.maturity ?? 0) * 100)}% mature
          </p>

          <button
            className="briefing-primary-button full"
            onClick={() => setShowOrganismExplorer(true)}
          >
            Explore organism →
          </button>

          <p className="briefing-muted">
            Rendered from Discovery’s internal reasoning state.
          </p>
        </div>
      </aside>

      {showExplore && (
        <div ref={workspaceRef} className="workspace-scroll-target">
          <UnderstandingWorkspace
            understanding={understanding}
            beliefs={beliefs}
            hypotheses={hypotheses}
            themes={themes}
            contradictions={contradictions}
            causalChains={causalChains}
            evidence={evidence}
            organismState={organismState}
            onClose={() => setShowExplore(false)}
            onTrace={() => setShowReasoningTrace(true)}
          />
        </div>
      )}

      {showOrganismExplorer && (
        <OrganismPreview
          open={showOrganismExplorer}
          onOpen={() => setShowOrganismExplorer(true)}
          onClose={() => setShowOrganismExplorer(false)}
          organismState={organismState}
        />
      )}

      <TraceUnderstandingPage
        open={showReasoningTrace}
        onClose={() => setShowReasoningTrace(false)}
        headline={headline}
        confidence={(primaryBelief?.confidence ?? understanding?.confidence) || 0.75}
        executiveUnderstanding={understanding}
        beliefs={beliefs}
        themes={themes}
        contradictions={contradictions}
        evidence={evidence}
        reasoningGraph={reasoningGraph}
      />
    </section>
  );
}

function buildWhatChangedNarrative({
  delta,
  organismState,
  beliefs,
  contradictions,
}: {
  delta?: any;
  organismState?: any;
  beliefs: any[];
  contradictions: any[];
}) {
  const newBeliefs = delta?.newBeliefs?.length ?? beliefs.length ?? 0;
  const newContradictions =
    delta?.newContradictions?.length ?? contradictions.length ?? 0;
  const mechanisms = organismState?.mechanisms?.length ?? 0;

  const items: string[] = [];

  if (newBeliefs > 0) {
    items.push(
      `${newBeliefs} working belief${
        newBeliefs === 1 ? "" : "s"
      } formed from the investigation.`
    );
  }

  if (mechanisms > 0) {
    items.push(
      `${mechanisms} explanatory mechanism${
        mechanisms === 1 ? "" : "s"
      } emerged to connect patterns with beliefs.`
    );
  }

  if (newContradictions > 0) {
    items.push(
      `${newContradictions} unresolved tension${
        newContradictions === 1 ? "" : "s"
      } remain important to pressure-test.`
    );
  }

  if (organismState) {
    items.push(
      `The organism is ${Math.round(
        (organismState.maturity ?? 0) * 100
      )}% mature with ${Math.round(
        (organismState.uncertainty ?? 0) * 100
      )}% uncertainty.`
    );
  }

  return {
    headline:
      mechanisms > 0
        ? "Understanding became more explainable"
        : "Discovery formed a new working understanding",
    summary:
      items[0] ??
      "Discovery formed an initial understanding from the available evidence.",
  };
}