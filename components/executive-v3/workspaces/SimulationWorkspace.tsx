"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveCommunication,
  ExecutiveCommunicationForecast,
} from "../../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveScenarioProjection,
} from "../../executive-v2/projection/ExecutiveScenarioProjection";

type SimulationWorkspaceProps = {
  communication: ExecutiveCommunication;
};

type ExecutiveScenarioResponse = {
  executiveScenarioProjection?:
    ExecutiveScenarioProjection;

  error?: string;
};

type SimulationHorizon =
  ExecutiveCommunicationForecast["timeHorizon"];

const horizonOptions: Array<{
  value: SimulationHorizon;
  label: string;
}> = [
  {
    value: "immediate",
    label: "Immediate",
  },
  {
    value: "near-term",
    label: "Near term",
  },
  {
    value: "medium-term",
    label: "Medium term",
  },
  {
    value: "long-term",
    label: "Long term",
  },
];

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
      Math.min(100, percentage),
    ),
  );
}

function humanizeIdentifier(
  value: string,
): string {
  return value
    .replace(/^condition-/, "")
    .replace(/[-_]+/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default function SimulationWorkspace({
  communication,
}: SimulationWorkspaceProps) {
  const recommendation =
    communication.recommendation;

  const forecast =
    communication.forecast;

  /**
   * The executive should not have to select an internal condition ID.
   *
   * Discovery derives the most relevant condition from the communication
   * product, prioritizing forecast scope, supporting signals, and meaningful
   * organizational changes.
   */
  const availableConditionIds =
    useMemo(() => {
      const conditionIds =
        new Set<string>();

      forecast.affectedConditionIds.forEach(
        (conditionId) => {
          conditionIds.add(conditionId);
        },
      );

      communication.supportingSignals.forEach(
        (signal) => {
          signal.supportingConditionIds.forEach(
            (conditionId) => {
              conditionIds.add(conditionId);
            },
          );
        },
      );

      communication.meaningfulChanges.forEach(
        (change) => {
          if (
            change.entityId.startsWith(
              "condition-",
            )
          ) {
            conditionIds.add(
              change.entityId,
            );
          }
        },
      );

      return Array.from(conditionIds);
    }, [
      communication.meaningfulChanges,
      communication.supportingSignals,
      forecast.affectedConditionIds,
    ]);

  const primaryConditionId =
    availableConditionIds[0] ??
    communication.meaningfulChanges.find(
      (change) =>
        change.entityId.startsWith(
          "condition-",
        ),
    )?.entityId ??
    "condition-decisionflow";

  const [
    interventionStrength,
    setInterventionStrength,
  ] = useState(0.25);

  const [
    timeHorizon,
    setTimeHorizon,
  ] =
    useState<SimulationHorizon>(
      forecast.timeHorizon,
    );

  const [
    challengedAssumption,
    setChallengedAssumption,
  ] = useState("");

  const [
    projection,
    setProjection,
  ] =
    useState<ExecutiveScenarioProjection | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    isDecisionConfirmed,
    setIsDecisionConfirmed,
  ] = useState(false);

  async function runSimulation(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setError(null);
    setProjection(null);
    setIsDecisionConfirmed(false);

    const assumptions = [
      ...recommendation.assumptions,
    ];

    if (
      challengedAssumption.trim()
        .length > 0
    ) {
      assumptions.push(
        `Executive challenge: ${challengedAssumption.trim()}`,
      );
    }

    const interventionDescription =
      recommendation.actions.length > 0
        ? recommendation.actions.join(
            " ",
          )
        : recommendation.headline;

    setIsLoading(true);

    try {
      const response =
        await fetch(
          "/api/executive-scenario",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              organizationId:
                communication.organizationId,

              changedEntityId:
                primaryConditionId,

              interventionDelta:
                interventionStrength,

              intervention: {
                type: "governance",

                title:
                  recommendation.headline,

                description:
                  interventionDescription,

                rationale:
                  recommendation.rationale,

                scope: "organization",

                timeHorizon,

                affectedConditionIds:
                  availableConditionIds.length >
                  0
                    ? availableConditionIds
                    : [
                        primaryConditionId,
                      ],

                assumptions,

                confidence:
                  communication.confidence
                    .value,
              },
            }),
          },
        );

      const result =
        (await response.json()) as
          ExecutiveScenarioResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "The simulation could not be completed.",
        );
      }

      if (
        !result.executiveScenarioProjection
      ) {
        throw new Error(
          "The simulation completed without returning a projected organizational future.",
        );
      }

      setProjection(
        result.executiveScenarioProjection,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The simulation could not be completed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const simulatedState =
    projection?.projectedFuture
      .simulatedOrganizationState;

  const baselineConfidence =
    toPercentage(
      communication.confidence.value,
    );

  const simulationConfidence =
    simulatedState
      ? toPercentage(
          simulatedState.confidence,
        )
      : 0;

  const confidenceDelta =
    simulationConfidence -
    baselineConfidence;

  const primaryCondition =
    simulatedState?.projectedConditions.find(
      (condition) =>
        condition.id ===
        primaryConditionId,
    );

  const improvingConditions =
    simulatedState?.projectedConditions
      .filter(
        (condition) =>
          condition.status ===
          "improving",
      )
      .slice(0, 2) ?? [];

  const unresolvedConditions =
    simulatedState?.projectedConditions
      .filter(
        (condition) =>
          condition.status ===
            "deteriorating" ||
          condition.status ===
            "constrained",
      )
      .slice(0, 2) ?? [];

  const executiveSynopsis =
    improvingConditions.length > 0
      ? `The intervention improves ${improvingConditions
          .map(
            (condition) =>
              condition.name,
          )
          .join(
            " and ",
          )}, while ${
          unresolvedConditions.length > 0
            ? `${unresolvedConditions
                .map(
                  (condition) =>
                    condition.name,
                )
                .join(
                  " and ",
                )} remain unresolved.`
            : "no major unresolved conditions remain in the projected state."
        }`
      : "The intervention does not yet produce a clear improvement in the projected organizational state.";

  function reviseScenario(): void {
    setIsDecisionConfirmed(false);
    setProjection(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header
            className={
              styles.workspaceHeader
            }
          >
            <p className={styles.eyebrow}>
              Run a What-If Scenario
            </p>

            <h1>
              Test what happens if leadership
              follows Discovery&apos;s
              recommendation.
            </h1>

            <p
              className={
                styles.workspaceLead
              }
            >
              Adjust the intensity, timing, or
              assumptions behind the action and
              compare the projected future with
              the current organizational
              baseline.
            </p>
          </header>

          <section
            className={styles.featureCard}
          >
            <h2>
              Recommended intervention
            </h2>

            <h3>
              {recommendation.headline}
            </h3>

            <p>
              {recommendation.rationale}
            </p>

            {recommendation.actions.length >
            0 ? (
              <ul className={styles.list}>
                {recommendation.actions.map(
                  (action) => (
                    <li
                      key={action}
                      className={
                        styles.listItem
                      }
                    >
                      {action}
                    </li>
                  ),
                )}
              </ul>
            ) : null}

            <div className={styles.metaRow}>
              <span
                className={styles.metaPill}
              >
                Primary focus:{" "}
                {humanizeIdentifier(
                  primaryConditionId,
                )}
              </span>

              <span
                className={styles.metaPill}
              >
                {
                  Math.max(
                    1,
                    availableConditionIds.length,
                  )
                }{" "}
                condition
                {
                  Math.max(
                    1,
                    availableConditionIds.length,
                  ) === 1
                    ? ""
                    : "s"
                }{" "}
                in scope
              </span>
            </div>
          </section>

          <form
            className={styles.card}
            onSubmit={runSimulation}
          >
            <h2>
              Configure the scenario
            </h2>

            <div
              className={
                styles.simulationControl
              }
            >
              <div
                className={
                  styles.simulationControlHeader
                }
              >
                <div>
                  <h3>
                    Intervention intensity
                  </h3>

                  <p>
                    Choose how strongly
                    leadership should apply the
                    recommendation.
                  </p>
                </div>

                <span
                  className={styles.metaPill}
                >
                  {Math.round(
                    interventionStrength *
                      100,
                  )}
                  %
                </span>
              </div>

              <input
                aria-label="Intervention intensity"
                className={
                  styles.simulationRange
                }
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={
                  interventionStrength
                }
                onChange={(event) => {
                  setInterventionStrength(
                    Number(
                      event.target.value,
                    ),
                  );
                }}
              />

              <div
                className={
                  styles.rangeLabels
                }
              >
                <span>Conservative</span>

                <span>Aggressive</span>
              </div>
            </div>

            <div
              className={
                styles.simulationControl
              }
            >
              <h3>
                Expected timeframe
              </h3>

              <div
                className={
                  styles.optionGrid
                }
              >
                {horizonOptions.map(
                  (option) => (
                    <label
                      key={option.value}
                      className={
                        timeHorizon ===
                        option.value
                          ? styles.optionCardActive
                          : styles.optionCard
                      }
                    >
                      <input
                        type="radio"
                        name="time-horizon"
                        value={option.value}
                        checked={
                          timeHorizon ===
                          option.value
                        }
                        onChange={() => {
                          setTimeHorizon(
                            option.value,
                          );
                        }}
                      />

                      <span>
                        {option.label}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>

            <div
              className={
                styles.simulationControl
              }
            >
              <label
                htmlFor="challenged-assumption"
              >
                <h3>
                  Anything Discovery might be
                  missing?
                </h3>

                <p>
                  Optional. Add an executive
                  concern or belief Discovery
                  should include in the
                  simulation.
                </p>
              </label>

              <textarea
                id="challenged-assumption"
                className={
                  styles.simulationTextarea
                }
                rows={4}
                value={
                  challengedAssumption
                }
                placeholder="For example: Teams may resist distributing decision authority."
                onChange={(event) => {
                  setChallengedAssumption(
                    event.target.value,
                  );
                }}
              />
            </div>

            {error ? (
              <p
                className={
                  styles.errorMessage
                }
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <button
              className={
                styles.primaryButton
              }
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Simulating organizational future..."
                : "Run what-if scenario"}
            </button>
          </form>

          {projection &&
          simulatedState ? (
            <>
              <section
                className={
                  styles.featureCard
                }
              >
                <h2>
                  Projected result
                </h2>

                <h3>
                  {
                    projection.summary
                      .title
                  }
                </h3>

                <p>
                  {
                    simulatedState.explanation
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
                    Confidence{" "}
                    {simulationConfidence}%
                  </span>

                  <span
                    className={
                      styles.metaPill
                    }
                  >
                    {
                      projection.summary
                        .timeHorizon
                    }
                  </span>

                  <span
                    className={
                      styles.metaPill
                    }
                  >
                    {
                      simulatedState
                        .projectedConditions
                        .length
                    }{" "}
                    projected conditions
                  </span>
                </div>
              </section>

              <section
                className={
                  styles.impactSummary
                }
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
                      What changes
                    </p>

                    <h2>
                      The simulation produces{" "}
                      {
                        improvingConditions.length
                      }{" "}
                      clear improvement
                      {
                        improvingConditions.length ===
                        1
                          ? ""
                          : "s"
                      }
                      .
                    </h2>
                  </div>

                  <div
                    className={
                      styles.confidenceComparison
                    }
                  >
                    <span>
                      {baselineConfidence}%
                    </span>

                    <span aria-hidden="true">
                      →
                    </span>

                    <strong>
                      {
                        simulationConfidence
                      }
                      %
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    styles.impactList
                  }
                >
                  {primaryCondition ? (
                    <article
                      className={
                        styles.impactItemPrimary
                      }
                    >
                      <span
                        className={
                          styles.impactIcon
                        }
                        aria-hidden="true"
                      >
                        ↑
                      </span>

                      <div>
                        <strong>
                          {
                            primaryCondition.name
                          }
                        </strong>

                        <p>
                          Primary decision focus
                          becomes{" "}
                          {
                            primaryCondition.status
                          }
                          .
                        </p>
                      </div>
                    </article>
                  ) : null}

                  {improvingConditions
                    .filter(
                      (condition) =>
                        condition.id !==
                        primaryConditionId,
                    )
                    .map(
                      (condition) => (
                        <article
                          key={condition.id}
                          className={
                            styles.impactItemPositive
                          }
                        >
                          <span
                            className={
                              styles.impactIcon
                            }
                            aria-hidden="true"
                          >
                            ✓
                          </span>

                          <div>
                            <strong>
                              {
                                condition.name
                              }
                            </strong>

                            <p>
                              Projected to
                              improve under this
                              intervention.
                            </p>
                          </div>
                        </article>
                      ),
                    )}

                  {unresolvedConditions.map(
                    (condition) => (
                      <article
                        key={condition.id}
                        className={
                          styles.impactItemWarning
                        }
                      >
                        <span
                          className={
                            styles.impactIcon
                          }
                          aria-hidden="true"
                        >
                          !
                        </span>

                        <div>
                          <strong>
                            {
                              condition.name
                            }
                          </strong>

                          <p>
                            Remains{" "}
                            {
                              condition.status
                            }{" "}
                            after the
                            intervention.
                          </p>
                        </div>
                      </article>
                    ),
                  )}
                </div>

                <div
                  className={
                    styles.executiveSynopsis
                  }
                >
                  <span>
                    Executive synopsis
                  </span>

                  <p>
                    {executiveSynopsis}
                  </p>
                </div>

                <details
                  className={
                    styles.detailsDisclosure
                  }
                >
                  <summary>
                    Explore projected
                    conditions
                  </summary>

                  <div
                    className={
                      styles.evidenceGrid
                    }
                  >
                    {simulatedState.projectedConditions.map(
                      (condition) => (
                        <article
                          key={condition.id}
                          className={
                            styles.evidenceCard
                          }
                        >
                          <h3>
                            {condition.name}
                          </h3>

                          <p
                            className={
                              styles.evidenceSummary
                            }
                          >
                            {
                              condition.summary
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
                                condition.status
                              }
                            </span>

                            <span
                              className={
                                styles.metaPill
                              }
                            >
                              Confidence{" "}
                              {toPercentage(
                                condition.confidence,
                              )}
                              %
                            </span>
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </details>
              </section>

              <section
                className={
                  styles.decisionCard
                }
              >
                <div>
                  <p
                    className={
                      styles.eyebrow
                    }
                  >
                    Decision confidence
                  </p>

                  <h2>
                    {confidenceDelta > 0
                      ? "This scenario increases confidence."
                      : confidenceDelta ===
                          0
                        ? "This scenario maintains current confidence."
                        : "This scenario does not yet improve confidence."}
                  </h2>

                  <p>
                    Discovery&apos;s confidence
                    moved from{" "}
                    {baselineConfidence}% to{" "}
                    {simulationConfidence}%.
                  </p>
                </div>

                <div
                  className={
                    styles.confidenceComparison
                  }
                >
                  <span>
                    {baselineConfidence}%
                  </span>

                  <span aria-hidden="true">
                    →
                  </span>

                  <strong>
                    {simulationConfidence}%
                  </strong>
                </div>

                <div
                  className={
                    styles.decisionActions
                  }
                >
                  <button
                    className={
                      styles.primaryButton
                    }
                    type="button"
                    onClick={() => {
                      setIsDecisionConfirmed(
                        true,
                      );
                    }}
                  >
                    Move forward
                  </button>

                  <button
                    className={
                      styles.secondaryButton
                    }
                    type="button"
                    onClick={reviseScenario}
                  >
                    Adjust scenario
                  </button>
                </div>
              </section>

              {isDecisionConfirmed ? (
                <section
                  className={
                    styles.decisionConfirmation
                  }
                >
                  <div>
                    <p
                      className={
                        styles.eyebrow
                      }
                    >
                      Decision ready
                    </p>

                    <h2>
                      Move forward with{" "}
                      {
                        recommendation.headline
                      }
                    </h2>

                    <p>
                      Discovery will preserve
                      the recommendation,
                      scenario assumptions,
                      projected future, and
                      confidence at the time of
                      the decision.
                    </p>
                  </div>

                  <div
                    className={
                      styles.decisionSummaryGrid
                    }
                  >
                    <article
                      className={
                        styles.decisionSummaryItem
                      }
                    >
                      <span>
                        Decision confidence
                      </span>

                      <strong>
                        {
                          simulationConfidence
                        }
                        %
                      </strong>
                    </article>

                    <article
                      className={
                        styles.decisionSummaryItem
                      }
                    >
                      <span>
                        Confidence change
                      </span>

                      <strong>
                        {confidenceDelta >= 0
                          ? `+${confidenceDelta}%`
                          : `${confidenceDelta}%`}
                      </strong>
                    </article>

                    <article
                      className={
                        styles.decisionSummaryItem
                      }
                    >
                      <span>
                        Time horizon
                      </span>

                      <strong>
                        {
                          projection.summary
                            .timeHorizon
                        }
                      </strong>
                    </article>

                    <article
                      className={
                        styles.decisionSummaryItem
                      }
                    >
                      <span>
                        Assumptions challenged
                      </span>

                      <strong>
                        {challengedAssumption
                          .trim()
                          .length > 0
                          ? 1
                          : 0}
                      </strong>
                    </article>
                  </div>

                  <div
                    className={
                      styles.decisionActions
                    }
                  >
                    <button
                      className={
                        styles.primaryButton
                      }
                      type="button"
                    >
                      Commit decision
                    </button>

                    <button
                      className={
                        styles.secondaryButton
                      }
                      type="button"
                      onClick={() => {
                        setIsDecisionConfirmed(
                          false,
                        );
                      }}
                    >
                      Back to result
                    </button>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </section>

        <aside className={styles.rail}>
          <section className={styles.card}>
            <h2>
              Current baseline
            </h2>

            <h3>
              {communication.headline}
            </h3>

            <p>
              {
                communication.executiveSummary
              }
            </p>

            <div className={styles.metaRow}>
              <span
                className={styles.metaPill}
              >
                Confidence{" "}
                {baselineConfidence}%
              </span>
            </div>
          </section>

          <section className={styles.card}>
            <h2>
              Expected future without action
            </h2>

            <h3>
              {forecast.headline}
            </h3>

            <p>
              {forecast.explanation}
            </p>
          </section>

          {communication.uncertainty ? (
            <section
              className={styles.card}
            >
              <h2>
                Uncertainty to reduce
              </h2>

              <h3>
                {
                  communication.uncertainty
                    .question
                }
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
