"use client";

import type {
  ExecutiveCommunication,
} from "../../engine/v3/communication/executiveCommunication";

type ExecutiveWorkspaceProps = {
  communication: ExecutiveCommunication;
};

function directionSymbol(
  direction:
    ExecutiveCommunication["meaningfulChanges"][number]["direction"],
): string {
  switch (direction) {
    case "improving":
      return "↑";

    case "worsening":
      return "↓";

    case "stable":
      return "—";
  }
}

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

export default function ExecutiveWorkspace({
  communication,
}: ExecutiveWorkspaceProps) {
  return (
    <main className="executive-v3">
      <section className="executive-v3-hero">
        <div className="executive-v3-organism-panel">
          <div
            className="executive-v3-organism"
            aria-hidden="true"
          >
            <span className="executive-v3-orbit executive-v3-orbit-one" />
            <span className="executive-v3-orbit executive-v3-orbit-two" />
            <span className="executive-v3-orbit executive-v3-orbit-three" />

            <span className="executive-v3-core" />

            <span className="executive-v3-node executive-v3-node-one" />
            <span className="executive-v3-node executive-v3-node-two" />
            <span className="executive-v3-node executive-v3-node-three" />
            <span className="executive-v3-node executive-v3-node-four" />
          </div>
        </div>

        <div className="executive-v3-conclusion">
          <p className="executive-v3-eyebrow">
            Discovery currently believes
          </p>

          <h1>
            {communication.headline}
          </h1>

          <p className="executive-v3-summary">
            {communication.executiveSummary}
          </p>

          <div className="executive-v3-confidence">
            <strong>
              {toPercentage(
                communication.confidence.value,
              )}
              %
            </strong>

            <span>
              Confidence
            </span>
          </div>
        </div>
      </section>

      <section className="executive-v3-summary-grid">
        <article className="executive-v3-summary-card">
          <p className="executive-v3-card-label">
            1. Why Discovery believes this
          </p>

          <ul className="executive-v3-reason-list">
            {communication.supportingSignals.length > 0 ? (
              communication.supportingSignals.map(
                (signal) => (
                  <li key={signal.id}>
                    <strong>
                      {signal.statement}
                    </strong>

                    {signal.implication ? (
                      <span>
                        {signal.implication}
                      </span>
                    ) : null}
                  </li>
                ),
              )
            ) : (
              <li>
                Discovery is still forming the supporting explanation.
              </li>
            )}
          </ul>
        </article>

        <article className="executive-v3-summary-card">
          <p className="executive-v3-card-label">
            2. What changed
          </p>

          <div className="executive-v3-change-list">
            {communication.meaningfulChanges.length > 0 ? (
              communication.meaningfulChanges.map(
                (change) => (
                  <div
                    key={change.entityId}
                    className={`executive-v3-change is-${change.direction}`}
                  >
                    <span
                      className="executive-v3-change-symbol"
                      aria-hidden="true"
                    >
                      {directionSymbol(
                        change.direction,
                      )}
                    </span>

                    <span>
                      <strong>
                        {change.label}
                      </strong>

                      <small>
                        {change.statement}
                      </small>
                    </span>
                  </div>
                ),
              )
            ) : (
              <p>
                No material change detected.
              </p>
            )}
          </div>
        </article>

        <article className="executive-v3-summary-card">
          <p className="executive-v3-card-label">
            3. What happens next
          </p>

          <h2>
            {communication.forecast.headline}
          </h2>

          <div className="executive-v3-forecast-confidence">
            <strong>
              {toPercentage(
                communication.forecast.confidence,
              )}
              %
            </strong>

            <span>
              Forecast confidence
            </span>
          </div>

          {communication.forecast.explanation ? (
            <p>
              {communication.forecast.explanation}
            </p>
          ) : null}
        </article>

        <article className="executive-v3-summary-card executive-v3-recommendation-card">
          <p className="executive-v3-card-label">
            4. What should we do?
          </p>

          <h2>
            {communication.recommendation.headline}
          </h2>

          {communication.recommendation.actions.length > 0 ? (
            <ul className="executive-v3-action-list">
              {communication.recommendation.actions.map(
                (action) => (
                  <li key={action}>
                    {action}
                  </li>
                ),
              )}
            </ul>
          ) : null}

          {communication.recommendation.rationale ? (
            <p>
              {communication.recommendation.rationale}
            </p>
          ) : null}

          {communication.uncertainty?.recommendedInvestigation ? (
            <div className="executive-v3-investigation">
              <span>
                Recommended investigation
              </span>

              <strong>
                {
                  communication
                    .uncertainty
                    .recommendedInvestigation
                }
              </strong>
            </div>
          ) : null}

          {communication.recommendation.decisionHref ? (
            <a
              className="executive-v3-decision-link"
              href={
                communication
                  .recommendation
                  .decisionHref
              }
            >
              Evaluate recommended actions
              <span aria-hidden="true">
                →
              </span>
            </a>
          ) : null}
        </article>
      </section>
    </main>
  );
}