"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type RecommendationWorkspaceProps = {
  communication: ExecutiveCommunication;

  onOpenDecisionLab?: () => void;

  isOpeningDecisionLab?: boolean;

  decisionLabError?: string | null;
};

export default function RecommendationWorkspace({
  communication,
  onOpenDecisionLab,
  isOpeningDecisionLab = false,
  decisionLabError = null,
}: RecommendationWorkspaceProps) {
  const recommendation =
    communication.recommendation;

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header>
            <p className={styles.placeholderEyebrow}>
              Recommended Decision
            </p>

            <h1>{recommendation.headline}</h1>

            <p>{recommendation.rationale}</p>
          </header>

          <section>
            <h2>Recommended actions</h2>

            {recommendation.actions.length > 0 ? (
              <ol>
                {recommendation.actions.map(
                  (action) => (
                    <li key={action}>
                      {action}
                    </li>
                  ),
                )}
              </ol>
            ) : (
              <p>
                No supporting actions are currently
                available.
              </p>
            )}
          </section>

          <section>
            <h2>Trade-offs to consider</h2>

            {recommendation.tradeOffs.length > 0 ? (
              <ul>
                {recommendation.tradeOffs.map(
                  (tradeOff) => (
                    <li key={tradeOff}>
                      {tradeOff}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                Discovery has not identified a
                material trade-off.
              </p>
            )}
          </section>

          <section>
            <h2>
              Assumptions behind the recommendation
            </h2>

            {recommendation.assumptions.length > 0 ? (
              <ul>
                {recommendation.assumptions.map(
                  (assumption) => (
                    <li key={assumption}>
                      {assumption}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                No explicit assumptions are
                currently recorded.
              </p>
            )}
          </section>

          <section>
            <h2>
              What could change this recommendation
            </h2>

            {recommendation
              .evidenceThatCouldChangeRecommendation
              .length > 0 ? (
              <ul>
                {recommendation
                  .evidenceThatCouldChangeRecommendation
                  .map((evidence) => (
                    <li key={evidence}>
                      {evidence}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>
                Discovery has not identified any
                current evidence that would
                materially change the
                recommendation.
              </p>
            )}
          </section>

          <section>
            <button
              type="button"
              onClick={onOpenDecisionLab}
              disabled={
                !onOpenDecisionLab ||
                isOpeningDecisionLab
              }
              aria-busy={isOpeningDecisionLab}
            >
              {isOpeningDecisionLab
                ? "Preparing decision…"
                : "Evaluate Decision"}
            </button>

            {decisionLabError ? (
              <p role="alert">
                {decisionLabError}
              </p>
            ) : null}
          </section>
        </section>

        <aside className={styles.rail}>
          <section>
            <h2>Current understanding</h2>

            <p>{communication.headline}</p>

            <p>
              {communication.executiveSummary}
            </p>
          </section>

          <section>
            <h2>Forecast</h2>

            <h3>
              {communication.forecast.headline}
            </h3>

            <p>
              {communication.forecast.explanation}
            </p>
          </section>

          {communication.uncertainty ? (
            <section>
              <h2>Unresolved uncertainty</h2>

              <h3>
                {communication.uncertainty.question}
              </h3>

              <p>
                {
                  communication.uncertainty
                    .implication
                }
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}