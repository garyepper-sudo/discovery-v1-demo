"use client";

import {
  useState,
} from "react";

import styles from "./RecommendedDecision.module.css";

import type {
  ExecutiveDecisionProjection,
} from "../../projection/buildExecutiveDecisionProjection";

type RecommendedDecisionProps = {
  headline: string;
  rationale?: string;
  actionCount: number;
  decisionProjection?: ExecutiveDecisionProjection;
};

function formatPercent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
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

export default function RecommendedDecision({
  headline,
  rationale,
  actionCount,
  decisionProjection,
}: RecommendedDecisionProps) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  const justification =
    decisionProjection
      ?.decisionJustification;

  const recommendation =
    decisionProjection
      ?.recommendation;

  const conciseReasons =
    justification
      ?.decisiveAdvantages
      .slice(0, 3) ??
    justification
      ?.whyRecommended
      .slice(0, 3) ??
    [];

  function toggleExpanded(): void {
    setExpanded(
      (current) =>
        !current,
    );
  }

  return (
    <section
      className={`${styles.decision} ${
        expanded
          ? styles.decisionExpanded
          : ""
      }`}
    >
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          Recommended Decision
        </p>

        <h2>{headline}</h2>

        {rationale ? (
          <p className={styles.rationale}>
            {rationale}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        {actionCount > 1 ? (
          <span>
            {actionCount} recommended actions
          </span>
        ) : null}

        {decisionProjection ? (
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-controls="recommended-decision-reasoning"
          >
            {expanded
              ? "Close reasoning"
              : "Explore recommendation"}

            <span aria-hidden="true">
              {expanded ? "↑" : "↓"}
            </span>
          </button>
        ) : null}
      </div>

      {expanded &&
      decisionProjection &&
      recommendation &&
      justification ? (
        <div
          id="recommended-decision-reasoning"
          className={styles.expansion}
        >
          <div
            className={
              styles.expansionSummary
            }
          >
            <div
              className={
                styles.summaryItem
              }
            >
              <span>Status</span>

              <strong>
                {formatLabel(
                  recommendation.status,
                )}
              </strong>
            </div>

            <div
              className={
                styles.summaryItem
              }
            >
              <span>Confidence</span>

              <strong>
                {formatPercent(
                  recommendation.confidence,
                )}
              </strong>
            </div>

            <div
              className={
                styles.summaryItem
              }
            >
              <span>
                Objective alignment
              </span>

              <strong>
                {formatPercent(
                  justification
                    .objectiveAlignment
                    .score,
                )}
              </strong>
            </div>
          </div>

          <div className={styles.reasoning}>
            <p
              className={
                styles.expansionEyebrow
              }
            >
              Why this decision
            </p>

            <p className={styles.summary}>
              {justification.summary}
            </p>

            {conciseReasons.length > 0 ? (
              <ul>
                {conciseReasons.map(
                  (reason) => (
                    <li key={reason}>
                      {reason}
                    </li>
                  ),
                )}
              </ul>
            ) : null}
          </div>

          <div className={styles.nextStep}>
            <span>Next step</span>

            <p>
              {recommendation.nextStep}
            </p>
          </div>

          {justification
            .alternatives.length > 0 ? (
            <details
              className={
                styles.disclosure
              }
            >
              <summary>
                Alternatives considered
                <span>
                  {
                    justification
                      .alternatives.length
                  }
                </span>
              </summary>

              <div
                className={
                  styles.disclosureBody
                }
              >
                {justification
                  .alternatives
                  .map(
                    (alternative) => (
                      <article
                        key={
                          alternative.optionId
                        }
                        className={
                          styles.alternative
                        }
                      >
                        <div
                          className={
                            styles
                              .alternativeHeader
                          }
                        >
                          <h3>
                            {
                              alternative.title
                            }
                          </h3>

                          <span>
                            {formatPercent(
                              alternative
                                .scoreDifference,
                            )}{" "}
                            lower
                          </span>
                        </div>

                        <p>
                          {
                            alternative
                              .reasonsRankedLower[0]
                          }
                        </p>
                      </article>
                    ),
                  )}
              </div>
            </details>
          ) : null}

          {justification
            .evidenceThatCouldChangePreference
            .length > 0 ? (
            <details
              className={
                styles.disclosure
              }
            >
              <summary>
                What could change this recommendation?
              </summary>

              <div
                className={
                  styles.disclosureBody
                }
              >
                <ul>
                  {justification
                    .evidenceThatCouldChangePreference
                    .slice(0, 5)
                    .map(
                      (evidence) => (
                        <li
                          key={
                            evidence
                          }
                        >
                          {evidence}
                        </li>
                      ),
                    )}
                </ul>
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}