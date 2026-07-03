"use client";

import { useState } from "react";
import type { BeliefObject, EngineReport } from "../investigation/types";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function BeliefCard({
  belief,
  report,
  flipped,
  setFlipped,
  onInspect,
}: {
  belief?: BeliefObject;
  report: EngineReport;
  flipped: boolean;
  setFlipped: (value: boolean) => void;
  onInspect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const title =
    belief?.belief ?? report.brief?.[0] ?? "Initial understanding formed.";

  const confidence = belief?.confidence ?? report.understandingScore;

  const summary =
    belief?.whyItMatters ??
    report.brief?.[1] ??
    "Discovery is forming a belief from the available evidence.";

  const supportingEvidenceCount =
    belief?.supportingEvidence?.length ?? report.evidenceObjects.length;

  const assumptions =
    belief?.assumptions?.length
      ? belief.assumptions
      : ["More independent evidence is needed."];

  const dependencies =
    belief?.externalDependencies?.length
      ? belief.externalDependencies
      : ["External dependencies are not yet clear."];

  const contradictions =
    belief?.contradictions?.length
      ? belief.contradictions
      : ["No direct contradiction has been isolated yet."];

  const confidenceMovement = belief
    ? `${belief.previousConfidence}% → ${belief.confidence}%`
    : `0% → ${report.understandingScore}%`;

  return (
    <article className={cx("belief-card", flipped && "is-flipped")}>
      <div className="belief-face belief-front">
        <div className="panel-header">
          <p className="eyebrow">Current belief</p>
          <span>{confidence}% confidence</span>
        </div>

        <h2>{title}</h2>

        <p>{summary}</p>

        <div className="belief-preview-grid">
          <div>
            <strong>{supportingEvidenceCount}</strong>
            <span>supporting evidence</span>
          </div>
          <div>
            <strong>{confidence}%</strong>
            <span>belief strength</span>
          </div>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Hide reasoning" : "Why this belief?"}
        </button>

        {expanded && (
          <section className="belief-inspector">
            <div className="belief-inspector-block">
  <span>Why Discovery believes this</span>

  <div className="confidence-movement">
    <div>
      <small>Previous</small>
      <strong>{belief?.previousConfidence ?? 0}%</strong>
    </div>

    <div className="confidence-arrow">→</div>

    <div>
      <small>Current</small>
      <strong>{confidence}%</strong>
    </div>
  </div>

  <ul>
    <li>{supportingEvidenceCount} evidence object(s) currently support this belief.</li>
    {assumptions.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
</div>

            <InspectorBlock
              title="Concerns"
              items={dependencies}
            />

            <InspectorBlock
              title="Contradictions"
              items={contradictions}
            />

            <InspectorBlock
              title="What would change Discovery's mind?"
              items={
                report.nextBestEvidence?.length
                  ? report.nextBestEvidence
                  : report.openQuestions?.length
                    ? report.openQuestions
                    : ["Add independent evidence from a different perspective."]
              }
            />

            <button
              className="secondary-button full"
              type="button"
              onClick={onInspect}
            >
              Open full reasoning path
            </button>
          </section>
        )}
      </div>
    </article>
  );
}

function InspectorBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="belief-inspector-block">
      <span>{title}</span>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}