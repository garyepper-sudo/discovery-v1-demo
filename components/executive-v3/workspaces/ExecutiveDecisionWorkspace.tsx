"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveDecisionProjection,
} from "../projection/buildExecutiveDecisionProjection";

type ExecutiveDecisionWorkspaceProps = {
  projection: ExecutiveDecisionProjection;
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
    .replace(/^condition-/, "")
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function ExecutiveDecisionWorkspace({
  projection,
}: ExecutiveDecisionWorkspaceProps) {
  const {
    decisionJustification,
    recommendation,
  } = projection;

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <section
            className={
              styles.decisionConfirmation
            }
          >
            <div>
              <p
                className={
                  styles.placeholderEyebrow
                }
              >
                Executive Decision
              </p>

              <h2>
                {recommendation.headline}
              </h2>

              <p>
                {recommendation.rationale}
              </p>
            </div>

            <div
              className={
                styles.decisionSummaryGrid
              }
            >
              <div
                className={
                  styles.decisionSummaryItem
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
                  styles.decisionSummaryItem
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
                  styles.decisionSummaryItem
                }
              >
                <span>
                  Objective alignment
                </span>

                <strong>
                  {formatPercent(
                    decisionJustification
                      .objectiveAlignment
                      .score,
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.decisionSummaryItem
                }
              >
                <span>
                  Alternatives considered
                </span>

                <strong>
                  {
                    decisionJustification
                      .alternatives.length
                  }
                </strong>
              </div>
            </div>

            <div>
              <h3>Next step</h3>

              <p>
                {recommendation.nextStep}
              </p>
            </div>
          </section>

          <section>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Executive Judgment
            </p>

            <h2>
              Why Discovery chose this
            </h2>

            <p>
              {decisionJustification.summary}
            </p>

            {decisionJustification
              .decisiveAdvantages.length >
            0 ? (
              <>
                <h3>
                  Decisive advantages
                </h3>

                <ul>
                  {decisionJustification
                    .decisiveAdvantages
                    .map((advantage) => (
                      <li key={advantage}>
                        {advantage}
                      </li>
                    ))}
                </ul>
              </>
            ) : null}

            {decisionJustification
              .whyRecommended.length >
            0 ? (
              <>
                <h3>
                  Supporting rationale
                </h3>

                <ul>
                  {decisionJustification
                    .whyRecommended
                    .map((reason) => (
                      <li key={reason}>
                        {reason}
                      </li>
                    ))}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Comparative Judgment
            </p>

            <h2>
              Alternatives considered
            </h2>

            {decisionJustification
              .alternatives.length >
            0 ? (
              decisionJustification
                .alternatives
                .map((alternative) => (
                  <article
                    key={
                      alternative.optionId
                    }
                  >
                    <p
                      className={
                        styles.placeholderEyebrow
                      }
                    >
                      Rank {alternative.rank}
                    </p>

                    <h3>
                      {alternative.title}
                    </h3>

                    <p>
                      {alternative.summary}
                    </p>

                    <p>
                      <strong>
                        Decision score:
                      </strong>{" "}
                      {formatPercent(
                        alternative.score,
                      )}
                    </p>

                    <p>
                      <strong>
                        Difference from the
                        recommended strategy:
                      </strong>{" "}
                      {formatPercent(
                        alternative
                          .scoreDifference,
                      )}
                    </p>

                    <p>
                      <strong>
                        Viability:
                      </strong>{" "}
                      {formatLabel(
                        alternative
                          .viabilityStatus,
                      )}
                    </p>

                    {alternative
                      .reasonsRankedLower
                      .length > 0 ? (
                      <>
                        <h4>
                          Why it ranked lower
                        </h4>

                        <ul>
                          {alternative
                            .reasonsRankedLower
                            .map((reason) => (
                              <li key={reason}>
                                {reason}
                              </li>
                            ))}
                        </ul>
                      </>
                    ) : null}

                    {alternative.strengths
                      .length > 0 ? (
                      <>
                        <h4>Strengths</h4>

                        <ul>
                          {alternative
                            .strengths
                            .map(
                              (strength) => (
                                <li
                                  key={
                                    strength
                                  }
                                >
                                  {strength}
                                </li>
                              ),
                            )}
                        </ul>
                      </>
                    ) : null}

                    {alternative.weaknesses
                      .length > 0 ? (
                      <>
                        <h4>Weaknesses</h4>

                        <ul>
                          {alternative
                            .weaknesses
                            .map(
                              (weakness) => (
                                <li
                                  key={
                                    weakness
                                  }
                                >
                                  {weakness}
                                </li>
                              ),
                            )}
                        </ul>
                      </>
                    ) : null}

                    {alternative
                      .improvedConditionIds
                      .length > 0 ? (
                      <>
                        <h4>
                          Conditions improved
                        </h4>

                        <ul>
                          {alternative
                            .improvedConditionIds
                            .map(
                              (
                                conditionId,
                              ) => (
                                <li
                                  key={
                                    conditionId
                                  }
                                >
                                  {formatLabel(
                                    conditionId,
                                  )}
                                </li>
                              ),
                            )}
                        </ul>
                      </>
                    ) : null}

                    {alternative
                      .worsenedConditionIds
                      .length > 0 ? (
                      <>
                        <h4>
                          Conditions worsened
                        </h4>

                        <ul>
                          {alternative
                            .worsenedConditionIds
                            .map(
                              (
                                conditionId,
                              ) => (
                                <li
                                  key={
                                    conditionId
                                  }
                                >
                                  {formatLabel(
                                    conditionId,
                                  )}
                                </li>
                              ),
                            )}
                        </ul>
                      </>
                    ) : null}
                  </article>
                ))
            ) : (
              <p>
                No lower-ranked alternatives
                were available for comparison.
              </p>
            )}
          </section>

          <section>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Decision Boundaries
            </p>

            <h2>
              What would change this
              recommendation?
            </h2>

            <p>
              Discovery would reconsider
              this preference if new evidence
              materially changed the expected
              benefit, risk, constraint
              position, or confidence of the
              recommended strategy.
            </p>

            {decisionJustification
              .evidenceThatCouldChangePreference
              .length > 0 ? (
              <ul>
                {decisionJustification
                  .evidenceThatCouldChangePreference
                  .map((evidence) => (
                    <li key={evidence}>
                      {evidence}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>
                Discovery has not identified
                any current evidence that
                would materially change this
                preference.
              </p>
            )}

            {recommendation.assumptions
              .length > 0 ? (
              <>
                <h3>
                  Assumptions supporting the
                  recommendation
                </h3>

                <ul>
                  {recommendation.assumptions.map(
                    (assumption) => (
                      <li key={assumption}>
                        {assumption}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            {recommendation.risks.length >
            0 ? (
              <>
                <h3>
                  Risks to monitor
                </h3>

                <ul>
                  {recommendation.risks.map(
                    (risk) => (
                      <li key={risk}>
                        {risk}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Supporting Analysis
            </p>

            <h2>
              How Discovery reached this
              judgment
            </h2>

            <details>
              <summary>
                Objective and optimization
              </summary>

              <h3>
                {projection.objective.headline}
              </h3>

              <p>
                {projection.objective.summary}
              </p>

              <p>
                {projection.objective.rationale}
              </p>

              <h3>
                Optimization objective
              </h3>

              <p>
                {
                  projection.optimization
                    .objective
                }
              </p>

              <p>
                {
                  projection.optimization
                    .explanation
                }
              </p>

              <p>
                <strong>
                  Trade-off strategy:
                </strong>{" "}
                {formatLabel(
                  projection.optimization
                    .tradeoffStrategy,
                )}
              </p>
            </details>

            <details>
              <summary>
                Organizational impact
              </summary>

              <p>
                {
                  decisionJustification
                    .organizationalImpact
                    .explanation
                }
              </p>

              <p>
                <strong>
                  Benefit score:
                </strong>{" "}
                {formatPercent(
                  decisionJustification
                    .organizationalImpact
                    .benefitScore,
                )}
              </p>

              <p>
                <strong>
                  Risk score:
                </strong>{" "}
                {formatPercent(
                  decisionJustification
                    .organizationalImpact
                    .riskScore,
                )}
              </p>

              {decisionJustification
                .organizationalImpact
                .improvedConditionIds
                .length > 0 ? (
                <>
                  <h3>
                    Conditions projected to
                    improve
                  </h3>

                  <ul>
                    {decisionJustification
                      .organizationalImpact
                      .improvedConditionIds
                      .map(
                        (conditionId) => (
                          <li
                            key={
                              conditionId
                            }
                          >
                            {formatLabel(
                              conditionId,
                            )}
                          </li>
                        ),
                      )}
                  </ul>
                </>
              ) : null}

              {decisionJustification
                .organizationalImpact
                .worsenedConditionIds
                .length > 0 ? (
                <>
                  <h3>
                    Conditions projected to
                    worsen
                  </h3>

                  <ul>
                    {decisionJustification
                      .organizationalImpact
                      .worsenedConditionIds
                      .map(
                        (conditionId) => (
                          <li
                            key={
                              conditionId
                            }
                          >
                            {formatLabel(
                              conditionId,
                            )}
                          </li>
                        ),
                      )}
                  </ul>
                </>
              ) : null}
            </details>

            <details>
              <summary>
                Constraint position
              </summary>

              <p>
                <strong>Status:</strong>{" "}
                {formatLabel(
                  decisionJustification
                    .constraintPosition
                    .status,
                )}
              </p>

              <p>
                {
                  decisionJustification
                    .constraintPosition
                    .explanation
                }
              </p>

              {decisionJustification
                .constraintPosition
                .unresolvedRequiredConstraints
                .length > 0 ? (
                <>
                  <h3>
                    Unresolved required
                    constraints
                  </h3>

                  <ul>
                    {decisionJustification
                      .constraintPosition
                      .unresolvedRequiredConstraints
                      .map((constraint) => (
                        <li
                          key={
                            constraint
                          }
                        >
                          {constraint}
                        </li>
                      ))}
                  </ul>
                </>
              ) : null}

              {decisionJustification
                .constraintPosition
                .optionalIssues.length >
              0 ? (
                <>
                  <h3>
                    Optional issues
                  </h3>

                  <ul>
                    {decisionJustification
                      .constraintPosition
                      .optionalIssues
                      .map((issue) => (
                        <li key={issue}>
                          {issue}
                        </li>
                      ))}
                  </ul>
                </>
              ) : null}
            </details>

            <details>
              <summary>
                Scenario comparison and ranking
              </summary>

              <p>
                {projection.comparison.summary}
              </p>

              {projection.comparison
                .differentiators.length >
              0 ? (
                <ul>
                  {projection.comparison
                    .differentiators
                    .map(
                      (
                        differentiator,
                      ) => (
                        <li
                          key={
                            differentiator
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

              {projection.rankedStrategies.map(
                (strategy) => (
                  <article
                    key={
                      strategy.scenarioId
                    }
                  >
                    <h3>
                      Rank {strategy.rank}:{" "}
                      {strategy.title}
                    </h3>

                    <p>
                      <strong>
                        Score:
                      </strong>{" "}
                      {formatPercent(
                        strategy.score,
                      )}
                    </p>

                    <p>
                      {
                        strategy.explanation
                      }
                    </p>
                  </article>
                ),
              )}
            </details>

            <details>
              <summary>
                Confidence and limitations
              </summary>

              <p>
                {
                  projection.confidence
                    .explanation
                }
              </p>

              <p>
                <strong>
                  Calibrated confidence:
                </strong>{" "}
                {formatPercent(
                  projection.confidence
                    .value,
                )}
              </p>

              {projection.confidence
                .limiters.length > 0 ? (
                <ul>
                  {projection.confidence
                    .limiters
                    .map((limiter) => (
                      <li key={limiter}>
                        {limiter}
                      </li>
                    ))}
                </ul>
              ) : (
                <p>
                  No material confidence
                  limiters were identified.
                </p>
              )}
            </details>
          </section>
        </section>

        <aside className={styles.rail}>
          <section>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Recommended Strategy
            </p>

            <h2>
              {
                decisionJustification
                  .recommendedTitle
              }
            </h2>

            <p>
              {
                decisionJustification
                  .objectiveAlignment
                  .explanation
              }
            </p>
          </section>

          <section>
            <h2>Decision confidence</h2>

            <p>
              <strong>
                {formatPercent(
                  recommendation.confidence,
                )}
              </strong>
            </p>

            <p>
              {
                decisionJustification
                  .confidence.explanation
              }
            </p>
          </section>

          <section>
            <h2>Decision set</h2>

            <p>
              <strong>
                Candidate strategies:
              </strong>{" "}
              {
                projection
                  .candidateStrategies
                  .length
              }
            </p>

            <p>
              <strong>
                Simulated futures:
              </strong>{" "}
              {
                projection
                  .simulatedFutures.length
              }
            </p>

            <p>
              <strong>
                Ranked strategies:
              </strong>{" "}
              {
                projection
                  .rankedStrategies.length
              }
            </p>
          </section>

          <section>
            <h2>Completed</h2>

            <p>
              {new Date(
                projection.completedAt,
              ).toLocaleString()}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}