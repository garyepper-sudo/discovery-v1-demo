"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ExecutiveProjection,
} from "../projection/ExecutiveProjection";

type ExecutiveBriefingProps = {
  projection: ExecutiveProjection;
};

type BriefingSectionId =
  | "assessment"
  | "state"
  | "conditions"
  | "learning"
  | "future";

function firstSentence(
  value: string | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized =
    value.trim();

  if (!normalized) {
    return undefined;
  }

  const match =
    normalized.match(
      /^.*?[.!?](?:\s|$)/,
    );

  return (
    match?.[0]?.trim() ??
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

function statusDirection(
  status: string,
): "up" | "down" | "steady" {
  const normalized =
    status.toLowerCase();

  if (
    normalized.includes(
      "improv",
    ) ||
    normalized.includes(
      "strengthen",
    )
  ) {
    return "up";
  }

  if (
    normalized.includes(
      "deterior",
    ) ||
    normalized.includes(
      "weaken",
    ) ||
    normalized.includes(
      "constrain",
    ) ||
    normalized.includes(
      "critical",
    )
  ) {
    return "down";
  }

  return "steady";
}

function BriefingAccordion({
  id,
  title,
  summary,
  isOpen,
  onToggle,
  children,
}: {
  id: BriefingSectionId;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: (
    id: BriefingSectionId,
  ) => void;
  children: ReactNode;
}) {
  return (
    <section className="executive-briefing-accordion">
      <button
        type="button"
        className="executive-briefing-accordion-trigger"
        aria-expanded={isOpen}
        onClick={() =>
          onToggle(id)
        }
      >
        <span className="executive-briefing-accordion-copy">
          <strong>
            {title}
          </strong>

          <small>
            {summary}
          </small>
        </span>

        <span
          className="executive-briefing-accordion-icon"
          aria-hidden="true"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen ? (
        <div className="executive-briefing-accordion-content">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export default function ExecutiveBriefing({
  projection,
}: ExecutiveBriefingProps) {
  const [
    openSections,
    setOpenSections,
  ] = useState<
    Set<BriefingSectionId>
  >(
    new Set(),
  );

  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const primaryInvestigation =
    projection
      .investigationOpportunities?.[0];

  const primaryPrediction =
    projection
      .simulation
      ?.projectedPredictions?.[0];

  const executiveConclusion =
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
    "Discovery is still forming its current executive judgment.";

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
          const beliefs =
            projection
              .organizationalBeliefs ??
            [];

          items.push(
            ...beliefs
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

  const changedItems =
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
      primaryPrediction,
    ) ??
    firstSentence(
      projection
        .simulation
        ?.explanation,
    ) ??
    firstSentence(
      primaryCondition
        ?.whyItMatters,
    ) ??
    "Discovery is still forming a reliable future outlook.";

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
    sectionId:
      BriefingSectionId,
  ) {
    setOpenSections(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(sectionId)
        ) {
          next.delete(
            sectionId,
          );
        } else {
          next.add(
            sectionId,
          );
        }

        return next;
      },
    );
  }

  return (
    <main className="executive-briefing">
      <section className="executive-briefing-hero">
        <div className="executive-briefing-hero-visual">
          <div className="executive-briefing-organism">
            <div className="executive-briefing-orbit executive-briefing-orbit-one" />
            <div className="executive-briefing-orbit executive-briefing-orbit-two" />
            <div className="executive-briefing-orbit executive-briefing-orbit-three" />

            <div className="executive-briefing-core" />

            <span className="executive-briefing-node executive-briefing-node-one" />
            <span className="executive-briefing-node executive-briefing-node-two" />
            <span className="executive-briefing-node executive-briefing-node-three" />
            <span className="executive-briefing-node executive-briefing-node-four" />
          </div>
        </div>

        <div className="executive-briefing-hero-copy">
          <p className="executive-briefing-eyebrow">
            Discovery currently believes
          </p>

          <h1>
            {executiveConclusion}
          </h1>

          <div className="executive-briefing-confidence">
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

      <section className="executive-briefing-grid">
        <article className="executive-briefing-card">
          <p className="executive-briefing-card-number">
            1. Why Discovery believes this
          </p>

          <ul className="executive-briefing-list">
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
            className="executive-briefing-card-link"
            onClick={() =>
              toggleSection(
                "assessment",
              )
            }
          >
            View supporting evidence
            <span aria-hidden="true">
              →
            </span>
          </button>
        </article>

        <article className="executive-briefing-card">
          <p className="executive-briefing-card-number">
            2. What changed
          </p>

          <div className="executive-briefing-change-list">
            {changedItems.length >
            0 ? (
              changedItems.map(
                (condition) => {
                  const direction =
                    statusDirection(
                      condition.status,
                    );

                  return (
                    <div
                      key={
                        condition.name
                      }
                      className="executive-briefing-change"
                    >
                      <span
                        className={`executive-briefing-change-indicator is-${direction}`}
                        aria-hidden="true"
                      >
                        {direction ===
                        "up"
                          ? "↑"
                          : direction ===
                              "down"
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
            className="executive-briefing-card-link"
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

        <article className="executive-briefing-card">
          <p className="executive-briefing-card-number">
            3. What happens next
          </p>

          <h2>
            {futureStatement}
          </h2>

          <div className="executive-briefing-forecast">
            <strong>
              {projection
                .simulation
                ?.confidence ??
                projection
                  .currentUnderstanding
                  .confidence}
              %
            </strong>

            <span>
              Forecast confidence
            </span>
          </div>

          <button
            type="button"
            className="executive-briefing-card-link"
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

        <article className="executive-briefing-card executive-briefing-card-recommendation">
          <p className="executive-briefing-card-number">
            4. What should we do?
          </p>

          <h2>
            {recommendedAction}
          </h2>

          {primaryInvestigation ? (
            <div className="executive-briefing-investigation">
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
            className="executive-briefing-card-link"
            href="/executive-decision"
          >
            Evaluate recommended actions
            <span aria-hidden="true">
              →
            </span>
          </a>
        </article>
      </section>

      <section className="executive-briefing-detail">
        <p className="executive-briefing-detail-label">
          Explore the reasoning
        </p>

        <BriefingAccordion
          id="assessment"
          title="Why Discovery believes this"
          summary={
            firstSentence(
              projection
                .explanation
                .why,
            ) ??
            "The evidence and reasoning supporting Discovery's judgment."
          }
          isOpen={openSections.has(
            "assessment",
          )}
          onToggle={toggleSection}
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
        </BriefingAccordion>

        <BriefingAccordion
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
          isOpen={openSections.has(
            "state",
          )}
          onToggle={toggleSection}
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

              <p>
                {
                  projection
                    .organizationalState
                    .confidence
                }
                % confidence
              </p>
            </>
          ) : (
            <p>
              Organizational state
              is still forming.
            </p>
          )}
        </BriefingAccordion>

        <BriefingAccordion
          id="conditions"
          title="Conditions and change"
          summary={`${projection.organizationalConditions?.length ?? 0} active organizational condition(s)`}
          isOpen={openSections.has(
            "conditions",
          )}
          onToggle={toggleSection}
        >
          <div className="executive-briefing-condition-list">
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
        </BriefingAccordion>

        <BriefingAccordion
          id="learning"
          title="How Discovery is learning"
          summary={
            firstSentence(
              projection
                .organizationalLearningProfile
                ?.summary,
            ) ??
            "How confidence and organizational understanding are evolving."
          }
          isOpen={openSections.has(
            "learning",
          )}
          onToggle={toggleSection}
        >
          {projection
            .organizationalLearningProfile ? (
            <div className="executive-briefing-learning-grid">
              <div>
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
              </div>

              <div>
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
              </div>

              <div>
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
              </div>
            </div>
          ) : (
            <p>
              Longitudinal learning
              data is not yet
              available.
            </p>
          )}
        </BriefingAccordion>

        <BriefingAccordion
          id="future"
          title="Future outlook"
          summary={futureStatement}
          isOpen={openSections.has(
            "future",
          )}
          onToggle={toggleSection}
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
        </BriefingAccordion>
      </section>
    </main>
  );
}