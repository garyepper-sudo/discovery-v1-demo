"use client";

import styles from "../ExecutiveWorkspace.module.css";

import DecisionCommitPanel from "./DecisionCommitPanel";

import type {
  ExecutiveDecisionProjection,
} from "../projection/buildExecutiveDecisionProjection";

import type {
  ExecutiveDecisionCommitSelection,
} from "../../executive-v2/ExecutiveWorkspace";

type ExecutiveDecisionWorkspaceProps = {
  projection: ExecutiveDecisionProjection;

  onCommitDecision?: (
    selection:
      ExecutiveDecisionCommitSelection,
  ) => Promise<void>;

  isCommittingDecision?: boolean;

  decisionCommitError?: string | null;

  committedDecisionRecord?: unknown | null;
};

function formatPercent(
  value: number,
): string {
  return `${Math.round(value * 100)}%`;
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

export default function ExecutiveDecisionWorkspace({
  projection,
  onCommitDecision,
  isCommittingDecision = false,
  decisionCommitError = null,
  committedDecisionRecord = null,
}: ExecutiveDecisionWorkspaceProps) {
  const leadingStrategy =
    projection.rankedStrategies[0];

  const leadingFuture =
    leadingStrategy
      ? projection.simulatedFutures.find(
          (future) =>
            future.scenarioId ===
            leadingStrategy.scenarioId,
        )
      : projection.simulatedFutures[0];

  const viableStrategyCount =
    projection.viabilityEvaluations.filter(
      (evaluation) =>
        evaluation.status !==
        "disqualified",
    ).length;

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section
          className={styles.main}
          aria-label="Decision Lab"
        >
          <header
            className={
              styles.workspaceHeader
            }
          >
            <p className={styles.eyebrow}>
              Decision Lab
            </p>

            <h1>
              {
                projection.recommendation
                  .headline
              }
            </h1>

            <p
              className={
                styles.workspaceLead
              }
            >
              {
                projection.recommendation
                  .rationale
              }
            </p>

            <div
              className={
                styles.metaRow
              }
            >
              <span
                className={
                  styles.metaPill
                }
              >
                {
                  projection.candidateStrategies
                    .length
                }{" "}
                candidate{" "}
                {projection.candidateStrategies
                  .length === 1
                  ? "strategy"
                  : "strategies"}
              </span>

              <span
                className={
                  styles.metaPill
                }
              >
                {
                  projection.simulatedFutures
                    .length
                }{" "}
                simulated{" "}
                {projection.simulatedFutures
                  .length === 1
                  ? "future"
                  : "futures"}
              </span>

              <span
                className={
                  styles.metaPill
                }
              >
                {formatLabel(
                  projection.objective
                    .timeHorizon,
                )}
              </span>
            </div>
          </header>

          <section
            className={
              styles.featureCard
            }
            aria-labelledby="recommended-strategy-heading"
          >
            <p className={styles.eyebrow}>
              Recommended Strategy
            </p>

            <div
              className={
                styles.decisionHeroHeader
              }
            >
              <div
                className={
                  styles.decisionHeroCopy
                }
              >
                <h2
                  id="recommended-strategy-heading"
                >
                  {leadingStrategy
                    ?.title ??
                    projection
                      .recommendation
                      .headline}
                </h2>

                <p>
                  {leadingStrategy
                    ?.explanation ??
                    projection
                      .recommendation
                      .rationale}
                </p>
              </div>

              <div
                className={
                  styles.decisionHeroConfidence
                }
                aria-label={`Decision confidence ${formatPercent(
                  projection.confidence
                    .value,
                )}`}
              >
                <strong>
                  {formatPercent(
                    projection.confidence
                      .value,
                  )}
                </strong>

                <span>
                  Decision
                  <br />
                  confidence
                </span>
              </div>
            </div>

            <div
              className={
                styles.executiveSynopsis
              }
            >
              <span>
                Executive implication
              </span>

              <p>
                {
                  projection.recommendation
                    .nextStep
                }
              </p>
            </div>
          </section>

          <section
            className={styles.card}
            aria-labelledby="why-recommendation-heading"
          >
            <p className={styles.eyebrow}>
              Why
            </p>

            <h3
              id="why-recommendation-heading"
            >
              Why Discovery recommends this
              strategy
            </h3>

            <p>
              {
                projection.comparison
                  .summary
              }
            </p>

            {projection.comparison
              .differentiators.length >
            0 ? (
              <ul
                className={styles.list}
              >
                {projection.comparison.differentiators
                  .slice(0, 5)
                  .map(
                    (differentiator) => (
                      <li
                        key={
                          differentiator
                        }
                        className={
                          styles.listItem
                        }
                      >
                        {
                          differentiator
                        }
                      </li>
                    ),
                  )}
              </ul>
            ) : null}

            <details
              className={
                styles.detailsDisclosure
              }
            >
              <summary>
                Show decision objective
              </summary>

              <div
                className={
                  styles.evidenceGrid
                }
              >
                <article
                  className={
                    styles.evidenceCard
                  }
                >
                  <h3>
                    Executive objective
                  </h3>

                  <p
                    className={
                      styles.evidenceSummary
                    }
                  >
                    {
                      projection.objective
                        .headline
                    }
                  </p>

                  <p
                    className={
                      styles.evidenceContent
                    }
                  >
                    {
                      projection.objective
                        .summary
                    }
                  </p>
                </article>

                <article
                  className={
                    styles.evidenceCard
                  }
                >
                  <h3>
                    Optimization objective
                  </h3>

                  <p
                    className={
                      styles.evidenceSummary
                    }
                  >
                    {
                      projection.optimization
                        .objective
                    }
                  </p>

                  <p
                    className={
                      styles.evidenceContent
                    }
                  >
                    {
                      projection.optimization
                        .explanation
                    }
                  </p>
                </article>
              </div>

              <div
                className={
                  styles.metaRow
                }
              >
                <span
                  className={
                    styles.metaPill
                  }
                >
                  Objective confidence{" "}
                  {formatPercent(
                    projection.objective
                      .confidence,
                  )}
                </span>

                <span
                  className={
                    styles.metaPill
                  }
                >
                  Optimization confidence{" "}
                  {formatPercent(
                    projection.optimization
                      .confidence,
                  )}
                </span>

                <span
                  className={
                    styles.metaPill
                  }
                >
                  {formatLabel(
                    projection.optimization
                      .tradeoffStrategy,
                  )}{" "}
                  trade-offs
                </span>
              </div>
            </details>
          </section>

          <section
            className={styles.card}
            aria-labelledby="alternatives-heading"
          >
            <p className={styles.eyebrow}>
              Alternatives
            </p>

            <h3 id="alternatives-heading">
              Strategies considered
            </h3>

            <p>
              Discovery compared viable
              strategies against the same
              objective, constraints, and
              organizational baseline.
            </p>

            {projection.rankedStrategies
              .length > 0 ? (
              <div
                className={
                  styles.signalGrid
                }
              >
                {projection.rankedStrategies.map(
                  (strategy) => {
                    const candidate =
                      projection.candidateStrategies.find(
                        (item) =>
                          item.id ===
                          strategy.scenarioId,
                      );

                    const viability =
                      projection.viabilityEvaluations.find(
                        (evaluation) =>
                          evaluation.optionId ===
                          strategy.scenarioId,
                      );

                    return (
                      <article
                        key={
                          strategy.scenarioId
                        }
                        className={
                          strategy.rank === 1
                            ? styles.featureCard
                            : styles.signalCard
                        }
                      >
                        <p
                          className={
                            styles.eyebrow
                          }
                        >
                          {strategy.rank ===
                          1
                            ? "Recommended"
                            : `Rank ${strategy.rank}`}
                        </p>

                        <h3>
                          {strategy.title}
                        </h3>

                        <div
                          className={
                            styles.confidenceRow
                          }
                        >
                          <strong
                            className={
                              styles.confidenceValue
                            }
                          >
                            {formatPercent(
                              strategy.score,
                            )}
                          </strong>

                          <span
                            className={
                              styles.confidenceLabel
                            }
                          >
                            Score
                          </span>
                        </div>

                        <p>
                          {
                            strategy.explanation
                          }
                        </p>

                        {candidate ||
                        viability ? (
                          <details
                            className={
                              styles.detailsDisclosure
                            }
                          >
                            <summary>
                              Review strategy
                            </summary>

                            {candidate ? (
                              <>
                                <p>
                                  {
                                    candidate.description
                                  }
                                </p>

                                <div
                                  className={
                                    styles.metaRow
                                  }
                                >
                                  <span
                                    className={
                                      styles.metaPill
                                    }
                                  >
                                    {formatLabel(
                                      candidate.type,
                                    )}
                                  </span>

                                  <span
                                    className={
                                      styles.metaPill
                                    }
                                  >
                                    {formatLabel(
                                      candidate.timeHorizon,
                                    )}
                                  </span>

                                  <span
                                    className={
                                      styles.metaPill
                                    }
                                  >
                                    {formatPercent(
                                      candidate.confidence,
                                    )}{" "}
                                    confidence
                                  </span>
                                </div>

                                {candidate.risks
                                  .length >
                                0 ? (
                                  <>
                                    <h4>
                                      Risks
                                    </h4>

                                    <ul
                                      className={
                                        styles.list
                                      }
                                    >
                                      {candidate.risks.map(
                                        (
                                          risk,
                                        ) => (
                                          <li
                                            key={
                                              risk
                                            }
                                            className={
                                              styles.listItem
                                            }
                                          >
                                            {
                                              risk
                                            }
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </>
                                ) : null}

                                {candidate
                                  .missingEvidence
                                  .length >
                                0 ? (
                                  <>
                                    <h4>
                                      Missing
                                      evidence
                                    </h4>

                                    <ul
                                      className={
                                        styles.list
                                      }
                                    >
                                      {candidate.missingEvidence.map(
                                        (
                                          evidence,
                                        ) => (
                                          <li
                                            key={
                                              evidence
                                            }
                                            className={
                                              styles.listItem
                                            }
                                          >
                                            {
                                              evidence
                                            }
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </>
                                ) : null}
                              </>
                            ) : null}

                            {viability ? (
                              <>
                                <h4>
                                  Viability
                                </h4>

                                <p>
                                  {
                                    viability.explanation
                                  }
                                </p>
                              </>
                            ) : null}
                          </details>
                        ) : null}
                      </article>
                    );
                  },
                )}
              </div>
            ) : (
              <p>
                Discovery did not identify
                any viable alternative
                strategies.
              </p>
            )}
          </section>

          {leadingFuture ? (
            <section
              className={
                styles.impactSummary
              }
              aria-labelledby="expected-future-heading"
            >
              <div
                className={
                  styles.impactHeader
                }
              >
                <div>
                  <p
                    className={
                      styles.eyebrow
                    }
                  >
                    Expected Future
                  </p>

                  <h2
                    id="expected-future-heading"
                  >
                    {leadingFuture.title}
                  </h2>
                </div>

                <div
                  className={
                    styles.confidenceRow
                  }
                >
                  <strong
                    className={
                      styles.confidenceValue
                    }
                  >
                    {formatPercent(
                      leadingFuture.confidence,
                    )}
                  </strong>

                  <span
                    className={
                      styles.confidenceLabel
                    }
                  >
                    Scenario confidence
                  </span>
                </div>
              </div>

              <p>
                {leadingFuture.summary}
              </p>

              {leadingFuture
                .conditionChanges.length >
              0 ? (
                <div
                  className={
                    styles.impactList
                  }
                >
                  {leadingFuture.conditionChanges
                    .slice(0, 5)
                    .map((change) => (
                      <article
                        key={
                          change.conditionId
                        }
                        className={
                          change.change ===
                          "improved"
                            ? styles.impactItemPositive
                            : change.change ===
                                "worsened"
                              ? styles.impactItemWarning
                              : styles.impactItemPrimary
                        }
                      >
                        <span
                          className={
                            styles.impactIcon
                          }
                        >
                          {change.change ===
                          "improved"
                            ? "↑"
                            : change.change ===
                                "worsened"
                              ? "↓"
                              : "→"}
                        </span>

                        <div>
                          <strong>
                            {change.name}
                          </strong>

                          <p>
                            {formatLabel(
                              change.change,
                            )}
                            :{" "}
                            {formatPercent(
                              change.previousStrength,
                            )}{" "}
                            →{" "}
                            {formatPercent(
                              change.projectedStrength,
                            )}
                          </p>
                        </div>
                      </article>
                    ))}
                </div>
              ) : null}

              <details
                className={
                  styles.detailsDisclosure
                }
              >
                <summary>
                  Review full simulation
                </summary>

                {leadingFuture.risks
                  .length > 0 ? (
                  <>
                    <h3>
                      Scenario risks
                    </h3>

                    <ul
                      className={
                        styles.list
                      }
                    >
                      {leadingFuture.risks.map(
                        (risk) => (
                          <li
                            key={risk}
                            className={
                              styles.listItem
                            }
                          >
                            {risk}
                          </li>
                        ),
                      )}
                    </ul>
                  </>
                ) : null}

                {leadingFuture
                  .predictionChanges
                  .length > 0 ? (
                  <>
                    <h3>
                      Prediction changes
                    </h3>

                    <ul
                      className={
                        styles.list
                      }
                    >
                      {leadingFuture.predictionChanges.map(
                        (change) => (
                          <li
                            key={
                              change.predictionId
                            }
                            className={
                              styles.listItem
                            }
                          >
                            {
                              change.statement
                            }{" "}
                            —{" "}
                            {formatLabel(
                              change.change,
                            )}
                          </li>
                        ),
                      )}
                    </ul>
                  </>
                ) : null}

                {leadingFuture
                  .understandingChange
                  .changed ? (
                  <div
                    className={
                      styles.evidenceGrid
                    }
                  >
                    <article
                      className={
                        styles.evidenceCard
                      }
                    >
                      <h3>
                        Current
                        understanding
                      </h3>

                      <p
                        className={
                          styles.evidenceContent
                        }
                      >
                        {
                          leadingFuture
                            .understandingChange
                            .previous
                        }
                      </p>
                    </article>

                    <article
                      className={
                        styles.evidenceCard
                      }
                    >
                      <h3>
                        Projected
                        understanding
                      </h3>

                      <p
                        className={
                          styles.evidenceContent
                        }
                      >
                        {
                          leadingFuture
                            .understandingChange
                            .projected
                        }
                      </p>
                    </article>
                  </div>
                ) : null}
              </details>
            </section>
          ) : null}

          <section
            className={styles.card}
            aria-labelledby="confidence-heading"
          >
            <p className={styles.eyebrow}>
              Confidence
            </p>

            <div
              className={
                styles.confidenceRow
              }
            >
              <strong
                className={
                  styles.confidenceValue
                }
              >
                {formatPercent(
                  projection.confidence.value,
                )}
              </strong>

              <span
                className={
                  styles.confidenceLabel
                }
              >
                Calibrated confidence
              </span>
            </div>

            <h3 id="confidence-heading">
              How strongly Discovery
              supports this recommendation
            </h3>

            <p>
              {
                projection.confidence
                  .explanation
              }
            </p>

            {projection.confidence.limiters
              .length > 0 ? (
              <details
                className={
                  styles.detailsDisclosure
                }
              >
                <summary>
                  Review confidence limiters
                </summary>

                <ul
                  className={styles.list}
                >
                  {projection.confidence.limiters.map(
                    (limiter) => (
                      <li
                        key={limiter}
                        className={
                          styles.listItem
                        }
                      >
                        {limiter}
                      </li>
                    ),
                  )}
                </ul>
              </details>
            ) : null}
          </section>

          <DecisionCommitPanel
            projection={
              projection
            }
            onCommitDecision={
              onCommitDecision
            }
            isCommitting={
              isCommittingDecision
            }
            error={
              decisionCommitError
            }
            committedRecord={
              committedDecisionRecord
            }
          />
        </section>

        <aside
          className={styles.rail}
          aria-label="Decision summary"
        >
          <section
            className={styles.card}
          >
            <p className={styles.eyebrow}>
              Decision Summary
            </p>

            <h3>
              {leadingStrategy
                ?.title ??
                projection.recommendation
                  .headline}
            </h3>

            <div
              className={
                styles.confidenceRow
              }
            >
              <strong
                className={
                  styles.confidenceValue
                }
              >
                {formatPercent(
                  projection.confidence.value,
                )}
              </strong>

              <span
                className={
                  styles.confidenceLabel
                }
              >
                Confidence
              </span>
            </div>
          </section>

          <section
            className={styles.card}
          >
            <p className={styles.eyebrow}>
              Evaluation
            </p>

            <ul className={styles.list}>
              <li
                className={
                  styles.listItem
                }
              >
                {
                  projection.candidateStrategies
                    .length
                }{" "}
                candidate strategies
              </li>

              <li
                className={
                  styles.listItem
                }
              >
                {viableStrategyCount} viable
                alternatives
              </li>

              <li
                className={
                  styles.listItem
                }
              >
                {
                  projection.simulatedFutures
                    .length
                }{" "}
                organizational futures
              </li>
            </ul>
          </section>

          <section
            className={styles.card}
          >
            <p className={styles.eyebrow}>
              Objective
            </p>

            <h3>
              {
                projection.objective
                  .headline
              }
            </h3>

            <p>
              {
                projection.objective
                  .summary
              }
            </p>
          </section>

          <section
            className={styles.card}
          >
            <p className={styles.eyebrow}>
              Operating Model
            </p>

            <p>
              The completed decision,
              observed outcomes, and
              executive review will improve
              future recommendations.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
