"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import OrganismPreview from "../organism/OrganismPreview";
import TraceUnderstandingPage from "../trace/TraceUnderstandingPage";
import ExecutiveBrief from "./ExecutiveBrief";
import SemanticConceptInspector from "./SemanticConceptInspector";
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
  organizationRuntime?: any;
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
  organizationRuntime,
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

  const runtimeMemory = organizationRuntime?.memory;
  const runtimeMetadata = organizationRuntime?.metadata;
  const runtimeOrganism = organizationRuntime?.organism;

  const runtimeInvestigationCount = runtimeMetadata?.investigationCount ?? 1;
  const runtimeBeliefCount = runtimeMemory?.beliefs?.length ?? beliefs.length;
  const runtimePatternCount = runtimeMemory?.patterns?.length ?? themes.length;
  const runtimeObservationCount =
    runtimeMemory?.observations?.length ?? evidence.length;
  const runtimeLastEvolutionAt = runtimeOrganism?.lastEvolutionAt;

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
        organizationRuntime,
      }),
    [delta, organismState, beliefs, contradictions, organizationRuntime]
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
          <p className="overview-label">Organization memory</p>

          <div className="briefing-organism-preview">
            <div className="briefing-organism-core" />
          </div>

          <h2>
            {organismState?.emergingPatterns?.[0]?.title ??
              primaryBelief?.headline ??
              "Understanding is stabilizing"}
          </h2>

          <p>
            {runtimeInvestigationCount} investigation
            {runtimeInvestigationCount === 1 ? "" : "s"} ·{" "}
            {runtimeBeliefCount} belief
            {runtimeBeliefCount === 1 ? "" : "s"} ·{" "}
            {runtimePatternCount} pattern
            {runtimePatternCount === 1 ? "" : "s"}
          </p>

          <p className="briefing-muted">
            {runtimeObservationCount} remembered signal
            {runtimeObservationCount === 1 ? "" : "s"}
            {runtimeLastEvolutionAt
              ? ` · evolved ${formatRuntimeDate(runtimeLastEvolutionAt)}`
              : ""}
          </p>

          <button
            className="briefing-primary-button full"
            onClick={() => setShowOrganismExplorer(true)}
          >
            Explore organism →
          </button>

          <p className="briefing-muted">
            Rendered from the organization’s persistent understanding.
          </p>
        </div>
      </aside>

      <SemanticConceptInspector runtime={organizationRuntime} />

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
          organismState={runtimeOrganism?.organismState ?? organismState}
        />
      )}

      <TraceUnderstandingPage
        open={showReasoningTrace}
        onClose={() => setShowReasoningTrace(false)}
        headline={headline}
        confidence={
          (primaryBelief?.confidence ?? understanding?.confidence) || 0.75
        }
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
  organizationRuntime,
}: {
  delta?: any;
  organismState?: any;
  beliefs: any[];
  contradictions: any[];
  organizationRuntime?: any;
}) {
  const newBeliefs = delta?.newBeliefs?.length ?? beliefs.length ?? 0;
  const newContradictions =
    delta?.newContradictions?.length ?? contradictions.length ?? 0;
  const mechanisms = organismState?.mechanisms?.length ?? 0;
  const investigationCount =
    organizationRuntime?.metadata?.investigationCount ?? 1;

  const items: string[] = [];

  if (investigationCount > 1) {
    items.push(
      `This organization has now evolved across ${investigationCount} investigations.`
    );
  }

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
      investigationCount > 1
        ? "Organizational understanding evolved"
        : mechanisms > 0
          ? "Understanding became more explainable"
          : "Discovery formed a new working understanding",
    summary:
      items[0] ??
      "Discovery formed an initial understanding from the available evidence.",
  };
}

function formatRuntimeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}