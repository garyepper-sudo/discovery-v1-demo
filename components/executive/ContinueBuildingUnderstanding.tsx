"use client";

import { useMemo, useState } from "react";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";
import { buildExecutiveNarrative } from "./buildExecutiveNarrative";

interface ContinueBuildingUnderstandingProps {
  executiveDashboard: any;
  focusedUnderstanding?: FocusedUnderstanding | null;
}

export default function ContinueBuildingUnderstanding({
  focusedUnderstanding,
}: ContinueBuildingUnderstandingProps) {
  const [expanded, setExpanded] = useState(false);

  const narrative = useMemo(
    () => buildExecutiveNarrative(focusedUnderstanding),
    [focusedUnderstanding],
  );

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

  return (
    <section className="briefing-section continue-building-understanding-v2">
      <div className="continue-learning-header-v2">
        <p className="briefing-eyebrow">Help Discovery Learn</p>

        <h2>What would make this understanding stronger.</h2>

        <p>{narrative.learningQuestion}</p>
      </div>

      <div className="continue-learning-grid-v2">
        <article className="continue-learning-card-v2">
          <p className="briefing-section-label">Current Focus</p>

          <h3>
            {focusedUnderstanding?.title ?? "Organizational Understanding"}
          </h3>

          <p>{narrative.summary}</p>

          <div className="confidence-gain-v2">
            <span>Estimated Confidence Gain</span>
            <strong>+{narrative.confidenceGain}%</strong>
          </div>

          <div className="learning-note-v2">
            <p className="briefing-section-label">Why this matters</p>
            <p>{narrative.whyItMatters}</p>
          </div>
        </article>

        <article className="continue-learning-card-v2">
          <h3>Highest Value Evidence</h3>

          <div className="evidence-list-v2">
            {narrative.recommendedEvidence.map((item) => (
              <div className="evidence-item-v2" key={item}>
                <span className="evidence-check-v2">✓</span>

                <div>
                  <strong>{item}</strong>
                  <small>
                    Helps Discovery test whether this pattern is persistent
                    across the organization.
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
            These systems are most likely to contain useful evidence for this
            understanding.
          </p>

          <div className="connection-list-v2">
            {narrative.recommendedConnections.map((connection) => (
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
              Discovery is still learning
            </p>

            <p>
              Each new piece of evidence helps Discovery distinguish temporary
              observations from enduring organizational understanding.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}