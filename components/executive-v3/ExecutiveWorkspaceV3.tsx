"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ExecutiveProjection,
} from "../executive-v2/projection/ExecutiveProjection";

type ExecutiveWorkspaceV3Props = {
  projection: ExecutiveProjection;
};

type ReasoningSectionId =
  | "belief"
  | "state"
  | "conditions"
  | "learning"
  | "future";

function firstSentence(
  value: string | undefined,
): string | undefined {
  const normalized =
    value?.trim();

  if (!normalized) {
    return undefined;
  }

  const sentence =
    normalized.match(
      /^.*?[.!?](?:\s|$)/,
    );

  return (
    sentence?.[0]?.trim() ??
    normalized
  );
}

function formatStatus(
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

function getDirection(
  status: string,
): "positive" | "negative" | "stable" {
  const normalized =
    status.toLowerCase();

  if (
    normalized.includes("improv") ||
    normalized.includes("strengthen")
  ) {
    return "positive";
  }

  if (
    normalized.includes("deterior") ||
    normalized.includes("weaken") ||
    normalized.includes("critical") ||
    normalized.includes("constrain")
  ) {
    return "negative";
  }

  return "stable";
}

function ReasoningSection({
  id,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  id: ReasoningSectionId;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: (
    id: ReasoningSectionId,
  ) => void;
  children: ReactNode;
}) {
  return (
    <section className="workspace-v3-reasoning-section">
      <button
        type="button"
        className="workspace-v3-reasoning-trigger"
        aria-expanded={isOpen}
        onClick={() =>
          onToggle(id)
        }
      >
        <span className="workspace-v3-reasoning-title">
          {title}
        </span>

        <span className="workspace-v3-reasoning-summary">
          {summary}
        </span>

        <span
          className="workspace-v3-reasoning-toggle"
          aria-hidden="true"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div className="workspace-v3-reasoning-content">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function ExecutiveWorkspaceV3({
  projection,
}: ExecutiveWorkspaceV3Props) {
  const [
    openSections,
    setOpenSections,
  ] = useState<
    Set<ReasoningSectionId>
  >(
    new Set(),
  );

  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const primaryInvestigation =
    projection
      .investigationOpportunities?.[0];

  const conclusion =
    firstSentence(
      primaryCondition?.summary,
    ) ??
    firstSentence(
      projection
        .organizationalState
        ?.summary,
    ) ??
    firstSentence(
      projection
        .executiveAssessment
        ?.summary,
    ) ??
    firstSentence(
      projection
        .currentUnderstanding
        .belief,
    ) ??
    "Discovery is still forming its executive judgment.";

  const whyItems =
    useMemo(
      () => {
        const items: string[] =
          [];

        const mechanisms =
          projection
            .executiveAssessment
            ?.theoryValidation
            ?.supportingMechanisms ??
          [];

        items.push(
          ...mechanisms
            .slice(0, 3)
            .map(
              (mechanism) =>
                mechanism.label,
            ),
        );

        if (
          items.length < 3
        ) {
          items.push(
            ...(
              projection
                .organizationalBeliefs ??
              []
            )
              .slice(
                0,
                3 -
                  items.length,
              )
              .map(
                (belief) =>
                  belief.statement,
              ),
          );
        }

        if (
          items.length === 0
        ) {
          const explanation =
            firstSentence(
              projection
                .explanation
                .why,
            );

          if (explanation) {
            items.push(
              explanation,
            );
          }
        }

        return Array.from(
          new Set(items),
        ).slice(0, 3);
      },
      [
        projection
          .executiveAssessment,
        projection
          .organizationalBeliefs,
        projection
          .explanation
          .why,
      ],
    );

  const changedConditions =
    useMemo(
      () =>
        (
          projection
            .organizationalConditions ??
          []
        )
          .filter(
            (condition) =>
              condition.status
                .toLowerCase() !==
              "stable",
          )
          .slice(0, 3),
      [
        projection
          .organizationalConditions,
      ],
    );

  const futureStatement =
    firstSentence(
      projection
        .simulation
        ?.projectedPredictions?.[0],
    ) ??
    firstSentence(
      projection
        .simulation
        ?.explanation,
    ) ??
    "Discovery is still forming its future outlook.";

  const recommendedAction =
    firstSentence(
      primaryCondition
        ?.recommendedExecutiveAction,
    ) ??
    firstSentence(
      projection
        .executiveAssessment
        ?.theoryValidation
        ?.executiveRecommendation,
    ) ??
    firstSentence(
      projection
        .explanation
        .nextMove,
    ) ??
    "Continue gathering evidence before taking material action.";

  function toggleSection(
    id: ReasoningSectionId,
  ) {
    setOpenSections(
      (current) => {
        const next =
          new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      },
    );
  }

  return (
    <main className="workspace-v3">
      <section className="workspace-v3-hero">
        <div className="workspace-v3-organism-panel">
          <div className="workspace-v3-organism">
            <span className="workspace-v3-orbit workspace-v3-orbit-one" />
            <span className="workspace-v3-orbit workspace-v3-orbit-two" />
            <span className="workspace-v3-orbit workspace-v3-orbit-three" />

            <span className="workspace-v3-organism-core" />

            <span className="workspace-v3-node workspace-v3-node-one" />
            <span className="workspace-v3-node workspace-v3-node-two" />
            <span className="workspace-v3-node workspace-v3-node-three" />
            <span className="workspace-v3-node workspace-v3-node-four" />
          </div>
        </div>

        <div className="workspace-v3-conclusion">
          <p className="workspace-v3-eyebrow">
            Discovery currently believes
          </p>

          <h1>
            {conclusion}
          </h1>

          <div className="workspace-v3-confidence">
            <strong>
              {
                projection
                  .currentUnderstanding
                  .confidence
              }
              %
            </strong>

            <span>
              Confidence
            </span>
          </div>
        </div>
      </section>

      <section className="workspace-v3-summary-grid">
        <article className="workspace-v3-summary-card">
          <p className="workspace-v3-card-label">
            1. Why Discovery believes this
          </p>

          <ul className="workspace-v3-reason-list">
            {whyItems.map(
              (item) => (
                <li key={item}>
                  {item}
                </li>
              ),
            )}
          </ul>

          <button
            type="button"
            className="workspace-v3-card-action"
            onClick={() =>
              toggleSection(
                "belief",
              )
            }
          >
            View supporting evidence
            <span aria-hidden="true">
              →
            </span>
          </button>
        </article>

        <article className="workspace-v3-summary-card">
          <p className="workspace-v3-card-label">
            2. What changed
          </p>

          <div className="workspace-v3-change-list">
            {changedConditions.length >
            0 ? (
              changedConditions.map(
                (condition) => {
                  const direction =
                    getDirection(
                      condition.status,
                    );

                  return (
                    <div
                      key={
                        condition.name
                      }
                      className="workspace-v3-change"
                    >
                      <span
                        className={`workspace-v3-change-arrow is-${direction}`}
                        aria-hidden="true"
                      >
                        {direction ===
                        "positive"
                          ? "↑"
                          : direction ===
                              "negative"
                            ? "↓"
                            : "—"}
                      </span>

                      <span>
                        <strong>
                          {
                            condition.name
                          }
                        </strong>

                        <small>
                          {formatStatus(
                            condition.status,
                          )}
                        </small>
                      </span>
                    </div>
                  );
                },
              )
            ) : (
              <p>
                No material change
                was detected.
              </p>
            )}
          </div>

          <button
            type="button"
            className="workspace-v3-card-action"
            onClick={() =>
              toggleSection(
                "conditions",
              )
            }
          >
            See change over time
            <span aria-hidden="true">
              →
            </span>
          </button>
        </article>

        <article className="workspace-v3-summary-card">
          <p className="workspace-v3-card-label">
            3. What happens next
          </p>

          <h2>
            {futureStatement}
          </h2>

          <div className="workspace-v3-forecast-confidence">
            <strong>
              {
                projection
                  .simulation
                  ?.confidence ??
                projection
                  .currentUnderstanding
                  .confidence
              }
              %
            </strong>

            <span>
              Forecast confidence
            </span>
          </div>

          <button
            type="button"
            className="workspace-v3-card-action"
            onClick={() =>
              toggleSection(
                "future",
              )
            }
          >
            Explore forecasts
            <span aria-hidden="true">
              →
            </span>
          </button>
        </article>

        <article className="workspace-v3-summary-card workspace-v3-recommendation-card">
          <p className="workspace-v3-card-label">
            4. What should we do?
          </p>

          <h2>
            {recommendedAction}
          </h2>

          {primaryInvestigation ? (
            <div className="workspace-v3-investigation">
              <span>
                Recommended investigation
              </span>

              <strong>
                {
                  primaryInvestigation
                    .suggestedExecutiveQuestion
                }
              </strong>
            </div>
          ) : null}

          <a
            className="workspace-v3-card-action"
            href="/executive-decision"
          >
            Evaluate recommended actions
            <span aria-hidden="true">
              →
            </span>
          </a>
        </article>
      </section>

      <section className="workspace-v3-reasoning">
        <p className="workspace-v3-reasoning-label">
          Explore the reasoning
        </p>

        <ReasoningSection
          id="belief"
          title="Why Discovery believes this"
          summary={
            firstSentence(
              projection
                .explanation
                .why,
            ) ??
            "The evidence supporting Discovery's current judgment."
          }
          isOpen={
            openSections.has(
              "belief",
            )
          }
          onToggle={
            toggleSection
          }
        >
          <p>
            {
              projection
                .executiveAssessment
                ?.executiveNarrative ??
              projection
                .explanation
                .why
            }
          </p>
        </ReasoningSection>

        <ReasoningSection
          id="state"
          title="Current organizational state"
          summary={
            firstSentence(
              projection
                .organizationalState
                ?.summary,
            ) ??
            "Discovery's integrated view of the organization today."
          }
          isOpen={
            openSections.has(
              "state",
            )
          }
          onToggle={
            toggleSection
          }
        >
          {projection
            .organizationalState ? (
            <>
              <h3>
                {formatStatus(
                  projection
                    .organizationalState
                    .status,
                )}
              </h3>

              <p>
                {
                  projection
                    .organizationalState
                    .executiveImplication
                }
              </p>
            </>
          ) : (
            <p>
              Organizational state is
              still forming.
            </p>
          )}
        </ReasoningSection>

        <ReasoningSection
          id="conditions"
          title="Conditions and change"
          summary={`${projection.organizationalConditions?.length ?? 0} active organizational condition(s)`}
          isOpen={
            openSections.has(
              "conditions",
            )
          }
          onToggle={
            toggleSection
          }
        >
          <div className="workspace-v3-condition-grid">
            {projection
              .organizationalConditions
              ?.map(
                (condition) => (
                  <article
                    key={
                      condition.name
                    }
                  >
                    <div>
                      <h3>
                        {
                          condition.name
                        }
                      </h3>

                      <span>
                        {formatStatus(
                          condition.status,
                        )}
                        {" · "}
                        {
                          condition
                            .confidence
                        }
                        %
                      </span>
                    </div>

                    <p>
                      {
                        condition.summary
                      }
                    </p>
                  </article>
                ),
              )}
          </div>
        </ReasoningSection>

        <ReasoningSection
          id="learning"
          title="How Discovery is learning"
          summary={
            firstSentence(
              projection
                .organizationalLearningProfile
                ?.summary,
            ) ??
            "How Discovery's confidence is changing over time."
          }
          isOpen={
            openSections.has(
              "learning",
            )
          }
          onToggle={
            toggleSection
          }
        >
          {projection
            .organizationalLearningProfile ? (
            <div className="workspace-v3-learning-grid">
              <article>
                <span>
                  Learning velocity
                </span>

                <strong>
                  {
                    projection
                      .organizationalLearningProfile
                      .learningVelocity
                  }
                </strong>
              </article>

              <article>
                <span>
                  Knowledge retention
                </span>

                <strong>
                  {
                    projection
                      .organizationalLearningProfile
                      .knowledgeRetention
                  }
                  %
                </strong>
              </article>

              <article>
                <span>
                  Belief stability
                </span>

                <strong>
                  {
                    projection
                      .organizationalLearningProfile
                      .beliefStability
                  }
                  %
                </strong>
              </article>
            </div>
          ) : (
            <p>
              Longitudinal learning
              data is not yet
              available.
            </p>
          )}
        </ReasoningSection>

        <ReasoningSection
          id="future"
          title="Future outlook"
          summary={futureStatement}
          isOpen={
            openSections.has(
              "future",
            )
          }
          onToggle={
            toggleSection
          }
        >
          {projection.simulation ? (
            <>
              <p>
                {
                  projection
                    .simulation
                    .explanation
                }
              </p>

              <p>
                {
                  projection
                    .simulation
                    .confidence
                }
                % confidence over a{" "}
                {formatStatus(
                  projection
                    .simulation
                    .timeHorizon,
                ).toLowerCase()}{" "}
                horizon.
              </p>
            </>
          ) : (
            <p>
              No current simulation
              is available.
            </p>
          )}
        </ReasoningSection>
      </section>
    </main>
  );
}