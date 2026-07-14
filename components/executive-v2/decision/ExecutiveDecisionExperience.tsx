"use client";

import type {
  ExecutiveDecisionProjection,
} from "../projection/ExecutiveDecisionProjection";

type ExecutiveDecisionExperienceProps = {
  projection: ExecutiveDecisionProjection;
};

function statusColor(
  status:
    ExecutiveDecisionProjection["recommendation"]["status"],
) {
  switch (status) {
    case "proceed":
      return "#3FB950";

    case "do-not-proceed":
      return "#F85149";

    case "investigate-further":
      return "#D29922";
  }
}

export default function ExecutiveDecisionExperience({
  projection,
}: ExecutiveDecisionExperienceProps) {
  return (
    <main className="executive-v2-experience">

      <div className="executive-v2-shell">

        {/* ------------------------------------------------ */}

        <section className="executive-card">

          <div className="executive-section-label">
            Executive Objective
          </div>

          <h1>
            {projection.title}
          </h1>

          <p>
            {projection.objective}
          </p>

        </section>

        {/* ------------------------------------------------ */}

        <section className="executive-card">

          <div className="executive-section-label">
            Discovery Recommendation
          </div>

          <h2
            style={{
              color: statusColor(
                projection.recommendation.status,
              ),
            }}
          >
            {
              projection.recommendation
                .recommendedInterventionTitle
            }
          </h2>

          <div
            className="executive-confidence"
          >
            {
              projection.recommendation
                .confidence
            }
            %
          </div>

          <p>
            {
              projection.recommendation
                .summary
            }
          </p>

        </section>

        {/* ------------------------------------------------ */}

        <section className="executive-card">

          <div className="executive-section-label">
            Options Considered
          </div>

          {projection.options.map(
            (option) => (
              <div
                key={
                  option.interventionId
                }
                className="executive-option"
              >
                <div
                  className="executive-option-header"
                >
                  <div>

                    <strong>

                      #{option.rank}

                    </strong>

                    {" "}

                    {option.title}

                  </div>

                  <div>

                    {option.score}%

                  </div>
                </div>

                <p>

                  {option.description}

                </p>

                <div
                  className="executive-option-stats"
                >

                  <span>

                    Benefit

                    {" "}

                    {
                      option.organizationalBenefitScore
                    }

                    %

                  </span>

                  <span>

                    Risk

                    {" "}

                    {
                      option.organizationalRiskScore
                    }

                    %

                  </span>

                  <span>

                    Confidence

                    {" "}

                    {
                      option.confidence
                    }

                    %

                  </span>

                </div>

              </div>
            ),
          )}

        </section>

        {/* ------------------------------------------------ */}

        <section className="executive-card">

          <div className="executive-section-label">
            Why Discovery Recommends This
          </div>

          <ul>

            {projection.recommendation.whyRecommended.map(
              (reason) => (
                <li key={reason}>

                  {reason}

                </li>
              ),
            )}

          </ul>

        </section>

        {/* ------------------------------------------------ */}

        <section className="executive-card">

          <div className="executive-section-label">
            Evidence That Could Change This Recommendation
          </div>

          <ul>

            {projection.recommendation.evidenceThatCouldChangeRecommendation.map(
              (item) => (
                <li key={item}>

                  {item}

                </li>
              ),
            )}

          </ul>

        </section>

      </div>

    </main>
  );
}