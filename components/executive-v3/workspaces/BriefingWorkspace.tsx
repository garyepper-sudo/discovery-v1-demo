"use client";

import styles from "./BriefingWorkspace.module.css";

import {
  activeInitiatives,
  executiveDecisions,
  recommendedEvidence,
} from "../mvp/discoveryMvpFixtures";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveDecisionProjection,
} from "../projection/buildExecutiveDecisionProjection";

type BriefingWorkspaceProps = {
  communication: ExecutiveCommunication;

  decisionProjection?:
    ExecutiveDecisionProjection;
};

function toPercentage(
  value: number,
): number {
  const percentage =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        percentage,
      ),
    ),
  );
}

function formatLabel(
  value: string,
): string {
  return value
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function BriefingWorkspace({
  communication,
  decisionProjection,
}: BriefingWorkspaceProps) {
  const confidence =
    toPercentage(
      communication.confidence.value,
    );

  const visibleDecisions =
    executiveDecisions.slice(
      0,
      2,
    );

  const visibleInitiatives =
    activeInitiatives.slice(
      0,
      2,
    );

  const visibleInsights =
    communication.supportingSignals.slice(
      0,
      2,
    );

  const suggestedHeadline =
    decisionProjection
      ?.recommendation
      .headline ??
    communication
      .recommendation
      .headline;

  const suggestedSummary =
    decisionProjection
      ?.recommendation
      .rationale ??
    communication
      .recommendation
      .rationale;

  const suggestedConfidence =
    toPercentage(
      decisionProjection
        ?.recommendation
        .confidence ??
      communication.confidence.value,
    );

  const suggestedStatus =
    decisionProjection
      ?.recommendation
      .status;

  return (
    <main className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderCopy}>
          <p className={styles.eyebrow}>
            Today
          </p>

          <h1>Executive Work</h1>

          <p className={styles.pageLead}>
            The decisions, commitments, and
            organizational changes that deserve
            your attention now.
          </p>
        </div>

        <button
          type="button"
          className={styles.modelStatusButton}
        >
          <span
            className={styles.modelStatusDot}
            aria-hidden="true"
          />

          <span className={styles.modelStatusText}>
            <strong>Operating Model</strong>
          </span>

          <span className={styles.modelStatusScore}>
            <strong>{confidence}%</strong>
            <span>View →</span>
          </span>
        </button>
      </header>

      <div className={styles.layout}>
        <section className={styles.primaryColumn}>
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2>Discovery Recommendation</h2>

                <p>
                  The highest-priority action
                  surfaced by Discovery.
                </p>
              </div>
            </header>

            <section className={styles.workGroup}>
              <div className={styles.workList}>
                <article
                  className={`${styles.workItem} ${styles.recommendationItem}`}
                >
                  <div className={styles.workCopy}>
                    <div className={styles.workTopline}>
                      <h4>
                        {suggestedHeadline}
                      </h4>

                      <span
                        className={`${styles.badge} ${styles.badgeAccent}`}
                      >
                        {suggestedStatus
                          ? formatLabel(
                              suggestedStatus,
                            )
                          : "Recommended"}
                      </span>
                    </div>

                    <p>{suggestedSummary}</p>

                    <div className={styles.workMeta}>
                      <span className={styles.badge}>
                        {suggestedConfidence}%
                        confidence
                      </span>

                      <span className={styles.badge}>
                        Discovery recommended
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`${styles.itemAction} ${styles.recommendationAction}`}
                  >
                    Evaluate recommendation →
                  </button>
                </article>
              </div>
            </section>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2>Active Initiatives</h2>

                <p>
                  Committed decisions Discovery
                  is continuing to evaluate.
                </p>
              </div>

              {activeInitiatives.length >
              visibleInitiatives.length ? (
                <button
                  type="button"
                  className={styles.panelAction}
                >
                  View all →
                </button>
              ) : null}
            </header>

            <section className={styles.workGroup}>
              <div className={styles.groupHeader}>
                <h3>In Progress</h3>

                <span className={styles.groupCount}>
                  {activeInitiatives.length}
                </span>
              </div>

              <div className={styles.workList}>
                {visibleInitiatives.map(
                  (initiative) => (
                    <article
                      key={initiative.id}
                      className={styles.workItem}
                    >
                      <div className={styles.workCopy}>
                        <div className={styles.workTopline}>
                          <h4>
                            {initiative.title}
                          </h4>

                          <span
                            className={
                              initiative.status ===
                              "Needs Attention"
                                ? `${styles.badge} ${styles.badgeAccent}`
                                : styles.badge
                            }
                          >
                            {initiative.status}
                          </span>
                        </div>

                        <p>
                          {initiative.summary}
                        </p>

                        <div className={styles.workMeta}>
                          <span className={styles.badge}>
                            {initiative.trend}
                          </span>

                          <span className={styles.badge}>
                            {
                              initiative.nextReviewLabel
                            }
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.itemAction}
                      >
                        Review →
                      </button>
                    </article>
                  ),
                )}
              </div>
            </section>
          </article>
        </section>

        <section className={styles.secondaryColumn}>
          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2>My Decisions</h2>

                <p>
                  Decisions you are currently
                  evaluating or shaping.
                </p>
              </div>

              <button
                type="button"
                className={styles.panelAction}
              >
                New decision +
              </button>
            </header>

            <section className={styles.workGroup}>
              <div className={styles.groupHeader}>
                <h3>Open Decisions</h3>

                <span className={styles.groupCount}>
                  {executiveDecisions.length}
                </span>
              </div>

              <div className={styles.workList}>
                {visibleDecisions.map(
                  (decision) => (
                    <article
                      key={decision.id}
                      className={styles.workItem}
                    >
                      <div className={styles.workCopy}>
                        <div className={styles.workTopline}>
                          <h4>{decision.title}</h4>

                          <span className={styles.badge}>
                            {decision.status}
                          </span>
                        </div>

                        <p>{decision.summary}</p>

                        <div className={styles.workMeta}>
                          <span className={styles.badge}>
                            {decision.updatedLabel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.itemAction}
                      >
                        Continue →
                      </button>
                    </article>
                  ),
                )}
              </div>

              {executiveDecisions.length >
              visibleDecisions.length ? (
                <button
                  type="button"
                  className={styles.panelAction}
                >
                  View all decisions →
                </button>
              ) : null}
            </section>
          </article>

          <article className={styles.panel}>
            <header className={styles.panelHeader}>
              <div>
                <h2>Key Insights</h2>

                <p>
                  Deeper implications surfaced
                  by the Operating Model.
                </p>
              </div>

              {communication.supportingSignals
                .length >
              visibleInsights.length ? (
                <button
                  type="button"
                  className={styles.panelAction}
                >
                  View all →
                </button>
              ) : null}
            </header>

            <div className={styles.insightList}>
              {visibleInsights.length > 0 ? (
                visibleInsights.map(
                  (insight) => (
                    <article
                      key={insight.id}
                      className={styles.insightItem}
                    >
                      <span
                        className={
                          styles.insightMarker
                        }
                        aria-hidden="true"
                      />

                      <div
                        className={
                          styles.insightContent
                        }
                      >
                        <h3>
                          {insight.statement}
                        </h3>

                        {insight.implication ? (
                          <p>
                            {insight.implication}
                          </p>
                        ) : null}

                        <span
                          className={
                            styles.insightLabel
                          }
                        >
                          Supporting signal
                        </span>
                      </div>
                    </article>
                  ),
                )
              ) : (
                <article
                  className={styles.insightItem}
                >
                  <span
                    className={
                      styles.insightMarker
                    }
                    aria-hidden="true"
                  />

                  <div
                    className={
                      styles.insightContent
                    }
                  >
                    <h3>
                      Discovery is still forming
                      deeper insights.
                    </h3>

                    <p>
                      Additional evidence will
                      help identify the mechanisms
                      behind the current state.
                    </p>
                  </div>
                </article>
              )}
            </div>
          </article>
        </section>

        <section
          className={`${styles.panel} ${styles.evidencePanel}`}
        >
          <header className={styles.panelHeader}>
            <div>
              <h2>
                Improve the Operating Model
              </h2>

              <p>
                Add the highest-value evidence
                Discovery can use to strengthen
                future judgment.
              </p>
            </div>

            <button
              type="button"
              className={styles.panelAction}
            >
              View recommendations →
            </button>
          </header>

          <div className={styles.evidenceGrid}>
            {recommendedEvidence.map(
              (evidence) => (
                <article
                  key={evidence.id}
                  className={styles.evidenceItem}
                >
                  <div
                    className={
                      styles.evidenceTopline
                    }
                  >
                    <h3>{evidence.title}</h3>

                    <span
                      className={
                        styles.evidenceGain
                      }
                    >
                      +
                      {
                        evidence
                          .estimatedConfidenceGain
                      }
                      % potential
                    </span>
                  </div>

                  <p>{evidence.reason}</p>

                  <button
                    type="button"
                    className={styles.evidenceButton}
                  >
                    {evidence.actionLabel} →
                  </button>
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}