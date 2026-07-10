"use client";

import { useState } from "react";

import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";

interface ContinueBuildingUnderstandingProps {
  executiveDashboard: ExecutiveDashboard;
  focusedUnderstanding?: FocusedUnderstanding | null;
}

export default function ContinueBuildingUnderstanding({
  executiveDashboard,
  focusedUnderstanding,
}: ContinueBuildingUnderstandingProps) {
  const [expanded, setExpanded] = useState(false);

  const interpretation = executiveDashboard.interpretation;

  const primaryUploads = [
    "Upload Documents",
    "Paste Notes",
    "Meeting Transcript",
  ];

  const secondaryUploads = [
    "Customer Feedback",
    "Board Deck",
    "Research Report",
  ];

  const uploadOptions = expanded
    ? [...primaryUploads, ...secondaryUploads]
    : primaryUploads;

  const recommendedEvidence = [
    interpretation.evidenceThatCouldChangeTheExplanation,
    interpretation.remainingUncertainty,
    "Evidence showing whether the current explanation strengthens, weakens, or changes over time.",
  ].filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );

  const recommendedConnections = [
    "Slack",
    "Google Drive",
    "Calendar",
    "CRM",
  ];

  return (
    <section className="briefing-section continue-building-understanding-v2">
      <div className="continue-learning-header-v2">
        <p className="briefing-eyebrow">Help Discovery Learn</p>

        <h2>What would strengthen Discovery&apos;s current explanation?</h2>

        <p>{interpretation.evidenceThatCouldChangeTheExplanation}</p>
      </div>

      <div className="continue-learning-grid-v2">
        <article className="continue-learning-card-v2">
          <p className="briefing-section-label">Current Focus</p>

          <h3>
            {focusedUnderstanding?.title ?? "Current Organizational Theory"}
          </h3>

          <p>
            {focusedUnderstanding?.summary ??
              interpretation.currentExplanation}
          </p>

          <div className="confidence-gain-v2">
            <span>Potential Confidence Gain</span>
            <strong>+12%</strong>
          </div>

          <div className="learning-note-v2">
            <p className="briefing-section-label">Why this matters</p>

            <p>{interpretation.confidenceNarrative}</p>
          </div>
        </article>

        <article className="continue-learning-card-v2">
          <h3>Highest Value Evidence</h3>

          <div className="evidence-list-v2">
            {recommendedEvidence.map((item) => (
              <div className="evidence-item-v2" key={item}>
                <span className="evidence-check-v2">✓</span>

                <div>
                  <strong>{item}</strong>

                  <small>
                    Helps Discovery determine whether the current explanation
                    should strengthen, weaken, or be revised.
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="upload-group-v2">
            <p className="briefing-section-label">Contribute New Evidence</p>

            <div className="upload-list-v2">
              {uploadOptions.map((item) => (
                <button className="upload-button-v2" key={item} type="button">
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <button
              className="show-more-learning-v2"
              type="button"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded
                ? "Show fewer options"
                : "Show more ways to help Discovery learn"}
            </button>
          </div>
        </article>

        <article className="continue-learning-card-v2">
          <h3>Recommended Connections</h3>

          <p>
            These systems are most likely to contain evidence that could refine
            Discovery&apos;s current organizational theory.
          </p>

          <div className="connection-list-v2">
            {recommendedConnections.map((connection) => (
              <button
                className="connection-button-v2"
                key={connection}
                type="button"
              >
                <span>{connection}</span>

                <strong>Connect</strong>
              </button>
            ))}
          </div>

          <div className="learning-note-v2">
            <p className="briefing-section-label">
              Discovery is continuously learning
            </p>

            <p>
              Every new piece of evidence is evaluated against the current
              organizational theory. Discovery may strengthen its confidence,
              reduce confidence, or revise the explanation entirely as the
              organization evolves.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}