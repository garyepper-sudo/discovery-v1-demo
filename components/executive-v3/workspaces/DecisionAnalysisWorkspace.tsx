"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveDecisionProjection,
} from "../projection/buildExecutiveDecisionProjection";

type DecisionAnalysisWorkspaceProps = {
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
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function DecisionAnalysisWorkspace({
  projection,
}: DecisionAnalysisWorkspaceProps) {
  const leadingStrategy =
    projection.rankedStrategies[0];

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header>
            <p className={styles.placeholderEyebrow}>
              Executive Decision Analysis
            </p>

            <h1>{projection.objective.headline}</h1>

            <p>{projection.objective.summary}</p>

            <p>
              Discovery evaluated{" "}
              {projection.candidateStrategies.length}{" "}
              candidate{" "}
              {projection.candidateStrategies.length === 1
                ? "strategy"
                : "strategies"}
              , simulated{" "}
              {projection.simulatedFutures.length}{" "}
              organizational{" "}
              {projection.simulatedFutures.length === 1
                ? "future"
                : "futures"}
              , and ranked the viable alternatives.
            </p>
          </header>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 1
            </p>

            <h2>Executive objective</h2>

            <h3>{projection.objective.headline}</h3>

            <p>{projection.objective.summary}</p>

            <p>{projection.objective.rationale}</p>

            <p>
              <strong>Status:</strong>{" "}
              {formatLabel(
                projection.objective.status,
              )}
            </p>

            <p>
              <strong>Time horizon:</strong>{" "}
              {formatLabel(
                projection.objective.timeHorizon,
              )}
            </p>

            <p>
              <strong>Objective confidence:</strong>{" "}
              {formatPercent(
                projection.objective.confidence,
              )}
            </p>

            {projection.objective.assumptions.length > 0 ? (
              <>
                <h3>Assumptions</h3>

                <ul>
                  {projection.objective.assumptions.map(
                    (assumption) => (
                      <li key={assumption}>
                        {assumption}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            {projection.objective.openQuestions.length > 0 ? (
              <>
                <h3>Open questions</h3>

                <ul>
                  {projection.objective.openQuestions.map(
                    (question) => (
                      <li key={question}>
                        {question}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 2
            </p>

            <h2>Optimization objective</h2>

            <h3>{projection.optimization.objective}</h3>

            <p>{projection.optimization.explanation}</p>

            <p>
              <strong>Time horizon:</strong>{" "}
              {formatLabel(
                projection.optimization.timeHorizon,
              )}
            </p>

            <p>
              <strong>Trade-off strategy:</strong>{" "}
              {formatLabel(
                projection.optimization.tradeoffStrategy,
              )}
            </p>

            <p>
              <strong>Optimization confidence:</strong>{" "}
              {formatPercent(
                projection.optimization.confidence,
              )}
            </p>

            {projection.optimization.confidenceLimiters.length > 0 ? (
              <>
                <h3>Optimization confidence limiters</h3>

                <ul>
                  {projection.optimization.confidenceLimiters.map(
                    (limiter) => (
                      <li key={limiter}>
                        {limiter}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            {projection.optimization.variables.length > 0 ? (
              <>
                <h3>Optimization variables</h3>

                {projection.optimization.variables.map(
                  (variable) => (
                    <article key={variable.conditionId}>
                      <h4>{variable.name}</h4>

                      <p>{variable.rationale}</p>

                      <p>
                        <strong>Role:</strong>{" "}
                        {formatLabel(variable.role)}
                      </p>

                      <p>
                        <strong>Objective:</strong>{" "}
                        {formatLabel(variable.objective)}
                      </p>

                      <p>
                        <strong>Weight:</strong>{" "}
                        {formatPercent(variable.weight)}
                      </p>

                      <p>
                        <strong>
                          Selection confidence:
                        </strong>{" "}
                        {formatPercent(
                          variable.selectionConfidence,
                        )}
                      </p>
                    </article>
                  ),
                )}
              </>
            ) : null}

            {projection.optimization.successCriteria.length > 0 ? (
              <>
                <h3>Success criteria</h3>

                <ul>
                  {projection.optimization.successCriteria.map(
                    (criterion) => (
                      <li
                        key={`${criterion.conditionId}-${criterion.name}`}
                      >
                        <strong>
                          {criterion.name}
                        </strong>

                        {criterion.target !== undefined
                          ? ` — Target: ${criterion.target}${
                              criterion.unit
                                ? ` ${criterion.unit}`
                                : ""
                            }`
                          : ""}

                        {criterion.rationale
                          ? ` — ${criterion.rationale}`
                          : ""}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            {projection.optimization.constraints.length > 0 ? (
              <>
                <h3>Constraints</h3>

                <ul>
                  {projection.optimization.constraints.map(
                    (constraint, index) => (
                      <li
                        key={`${constraint.type}-${index}`}
                      >
                        <strong>
                          {constraint.required
                            ? "Required"
                            : "Preferred"}
                          :
                        </strong>{" "}
                        {constraint.description} —{" "}
                        {formatLabel(
                          constraint.translationStatus,
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}

            {projection.optimization.preferences.length > 0 ? (
              <>
                <h3>Preferences</h3>

                <ul>
                  {projection.optimization.preferences.map(
                    (preference, index) => (
                      <li
                        key={`${preference.type}-${preference.direction}-${index}`}
                      >
                        <strong>
                          {formatLabel(preference.type)}
                        </strong>
                        :{" "}
                        {formatLabel(
                          preference.direction,
                        )}{" "}
                        at{" "}
                        {formatPercent(
                          preference.weight,
                        )}
                        . {preference.rationale}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : null}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 3
            </p>

            <h2>Candidate strategies</h2>

            {projection.candidateStrategies.length > 0 ? (
              projection.candidateStrategies.map(
                (strategy, index) => (
                  <article key={strategy.id}>
                    <p
                      className={
                        styles.placeholderEyebrow
                      }
                    >
                      Candidate {index + 1}
                    </p>

                    <h3>{strategy.title}</h3>

                    <p>{strategy.description}</p>

                    <p>{strategy.rationale}</p>

                    <p>
                      <strong>Type:</strong>{" "}
                      {formatLabel(strategy.type)}
                    </p>

                    <p>
                      <strong>Scope:</strong>{" "}
                      {formatLabel(strategy.scope)}
                    </p>

                    <p>
                      <strong>Time horizon:</strong>{" "}
                      {formatLabel(
                        strategy.timeHorizon,
                      )}
                    </p>

                    <p>
                      <strong>Viability:</strong>{" "}
                      {strategy.viable
                        ? "Under consideration"
                        : "Disqualified"}
                    </p>

                    <p>
                      <strong>Confidence:</strong>{" "}
                      {formatPercent(
                        strategy.confidence,
                      )}
                    </p>

                    {strategy.assumptions.length > 0 ? (
                      <>
                        <h4>Assumptions</h4>

                        <ul>
                          {strategy.assumptions.map(
                            (assumption) => (
                              <li key={assumption}>
                                {assumption}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}

                    {strategy.risks.length > 0 ? (
                      <>
                        <h4>Risks</h4>

                        <ul>
                          {strategy.risks.map(
                            (risk) => (
                              <li key={risk}>
                                {risk}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}

                    {strategy.missingEvidence.length > 0 ? (
                      <>
                        <h4>Missing evidence</h4>

                        <ul>
                          {strategy.missingEvidence.map(
                            (evidence) => (
                              <li key={evidence}>
                                {evidence}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}
                  </article>
                ),
              )
            ) : (
              <p>
                Discovery did not generate any candidate strategies.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 4
            </p>

            <h2>Constraint and viability review</h2>

            <p>
              Discovery tested each candidate against the required executive constraints before simulation.
            </p>

            {projection.viabilityEvaluations.length > 0 ? (
              projection.viabilityEvaluations.map(
                (evaluation) => (
                  <article key={evaluation.optionId}>
                    <p
                      className={
                        styles.placeholderEyebrow
                      }
                    >
                      {formatLabel(evaluation.status)}
                    </p>

                    <h3>{evaluation.title}</h3>

                    <p>{evaluation.explanation}</p>

                    {evaluation.requiredViolations.length >
                    0 ? (
                      <>
                        <h4>Required violations</h4>

                        <ul>
                          {evaluation.requiredViolations.map(
                            (issue) => (
                              <li
                                key={`${evaluation.optionId}-required-${issue.constraintIndex}`}
                              >
                                {issue.description}:{" "}
                                {issue.explanation}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}

                    {evaluation
                      .unresolvedRequiredConstraints
                      .length > 0 ? (
                      <>
                        <h4>
                          Unresolved required constraints
                        </h4>

                        <ul>
                          {evaluation
                            .unresolvedRequiredConstraints
                            .map((issue) => (
                              <li
                                key={`${evaluation.optionId}-unresolved-${issue.constraintIndex}`}
                              >
                                {issue.description}:{" "}
                                {issue.explanation}
                              </li>
                            ))}
                        </ul>
                      </>
                    ) : null}

                    {evaluation.optionalIssues.length > 0 ? (
                      <>
                        <h4>Optional issues</h4>

                        <ul>
                          {evaluation.optionalIssues.map(
                            (issue) => (
                              <li
                                key={`${evaluation.optionId}-optional-${issue.constraintIndex}`}
                              >
                                {issue.description}:{" "}
                                {issue.explanation}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}
                  </article>
                ),
              )
            ) : (
              <p>
                No viability evaluations are currently available.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 5
            </p>

            <h2>Simulated organizational futures</h2>

            <p>
              Each viable strategy was simulated from the same organizational baseline.
            </p>

            {projection.simulatedFutures.length > 0 ? (
              projection.simulatedFutures.map(
                (future, index) => (
                  <article key={future.scenarioId}>
                    <p
                      className={
                        styles.placeholderEyebrow
                      }
                    >
                      Scenario {index + 1}
                    </p>

                    <h3>{future.title}</h3>

                    <p>{future.summary}</p>

                    <p>
                      <strong>
                        Recommendation:
                      </strong>{" "}
                      {formatLabel(
                        future.recommendation,
                      )}
                    </p>

                    <p>
                      <strong>Confidence:</strong>{" "}
                      {formatPercent(
                        future.confidence,
                      )}
                    </p>

                    {future.conditionChanges.length > 0 ? (
                      <>
                        <h4>Condition changes</h4>

                        <ul>
                          {future.conditionChanges.map(
                            (change) => (
                              <li key={change.conditionId}>
                                <strong>
                                  {change.name}
                                </strong>
                                :{" "}
                                {formatLabel(
                                  change.change,
                                )}{" "}
                                (
                                {formatPercent(
                                  change.previousStrength,
                                )}{" "}
                                →{" "}
                                {formatPercent(
                                  change.projectedStrength,
                                )}
                                )
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}

                    {future.predictionChanges.length > 0 ? (
                      <>
                        <h4>Prediction changes</h4>

                        <ul>
                          {future.predictionChanges.map(
                            (change) => (
                              <li key={change.predictionId}>
                                {change.statement} —{" "}
                                {formatLabel(
                                  change.change,
                                )}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}

                    {future.understandingChange.changed ? (
                      <>
                        <h4>Understanding change</h4>

                        <p>
                          <strong>Previous:</strong>{" "}
                          {
                            future.understandingChange
                              .previous
                          }
                        </p>

                        <p>
                          <strong>Projected:</strong>{" "}
                          {
                            future.understandingChange
                              .projected
                          }
                        </p>
                      </>
                    ) : null}

                    {future.risks.length > 0 ? (
                      <>
                        <h4>Risks</h4>

                        <ul>
                          {future.risks.map(
                            (risk) => (
                              <li key={risk}>
                                {risk}
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    ) : null}
                  </article>
                ),
              )
            ) : (
              <p>
                No simulated futures are currently available.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 6
            </p>

            <h2>Cross-scenario comparison</h2>

            <p>{projection.comparison.summary}</p>

            {projection.comparison.differentiators.length >
            0 ? (
              <ul>
                {projection.comparison.differentiators.map(
                  (differentiator) => (
                    <li key={differentiator}>
                      {differentiator}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                No material differentiators were identified.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 7
            </p>

            <h2>Scenario ranking</h2>

            {projection.rankedStrategies.length > 0 ? (
              projection.rankedStrategies.map(
                (strategy) => (
                  <article key={strategy.scenarioId}>
                    <p
                      className={
                        styles.placeholderEyebrow
                      }
                    >
                      Rank {strategy.rank}
                    </p>

                    <h3>{strategy.title}</h3>

                    <p>
                      <strong>Score:</strong>{" "}
                      {formatPercent(strategy.score)}
                    </p>

                    <p>{strategy.explanation}</p>
                  </article>
                ),
              )
            ) : (
              <p>
                No ranked strategies are currently available.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 8
            </p>

            <h2>Decision confidence</h2>

            <p>
              <strong>
                Calibrated confidence:
              </strong>{" "}
              {formatPercent(
                projection.confidence.value,
              )}
            </p>

            <p>{projection.confidence.explanation}</p>

            {projection.confidence.limiters.length > 0 ? (
              <>
                <h3>Confidence limiters</h3>

                <ul>
                  {projection.confidence.limiters.map(
                    (limiter) => (
                      <li key={limiter}>
                        {limiter}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : (
              <p>
                No material confidence limiters were identified.
              </p>
            )}
          </section>

          <section>
            <p className={styles.placeholderEyebrow}>
              Stage 9
            </p>

            <h2>Executive recommendation</h2>

            <h3>
              {projection.recommendation.headline}
            </h3>

            <p>
              {projection.recommendation.rationale}
            </p>

            <h4>Next step</h4>

            <p>
              {projection.recommendation.nextStep}
            </p>
          </section>
        </section>

        <aside className={styles.rail}>
          <section>
            <h2>Decision cycle</h2>

            <p>
              <strong>
                Candidate strategies:
              </strong>{" "}
              {projection.candidateStrategies.length}
            </p>

            <p>
              <strong>
                Viable simulations:
              </strong>{" "}
              {projection.simulatedFutures.length}
            </p>

            <p>
              <strong>
                Ranked strategies:
              </strong>{" "}
              {projection.rankedStrategies.length}
            </p>

            <p>
              <strong>Completed:</strong>{" "}
              {new Date(
                projection.completedAt,
              ).toLocaleString()}
            </p>
          </section>

          {leadingStrategy ? (
            <section>
              <h2>Leading strategy</h2>

              <h3>{leadingStrategy.title}</h3>

              <p>
                <strong>Rank:</strong>{" "}
                {leadingStrategy.rank}
              </p>

              <p>
                <strong>Score:</strong>{" "}
                {formatPercent(
                  leadingStrategy.score,
                )}
              </p>

              <p>
                {leadingStrategy.explanation}
              </p>
            </section>
          ) : null}

          <section>
            <h2>Recommendation</h2>

            <h3>
              {projection.recommendation.headline}
            </h3>

            <p>
              {projection.recommendation.rationale}
            </p>
          </section>

          <section>
            <h2>Confidence</h2>

            <p>
              Discovery&apos;s calibrated confidence is{" "}
              <strong>
                {formatPercent(
                  projection.confidence.value,
                )}
              </strong>
              .
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
