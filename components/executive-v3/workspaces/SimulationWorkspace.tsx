"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import styles from "../ExecutiveWorkspace.module.css";

import SimulationDecisionSummary from "./simulation/SimulationDecisionSummary";

import type {
  ExecutiveProjection,
} from "../../executive-v2/projection/ExecutiveProjection";

import type {
  ExecutiveCommunicationForecast,
} from "../../../engine/v3/communication/executiveCommunication";

import type {
  ExecutiveScenarioProjection,
} from "../../executive-v2/projection/ExecutiveScenarioProjection";

type SimulationWorkspaceProps = {
  projection: ExecutiveProjection;
  organizationId: string;
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
  value: number | undefined,
): number {
  if (
    value === undefined ||
    Number.isNaN(value)
  ) {
    return 0;
  }

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

function humanizeIdentifier(
  value: string,
): string {
  return value
    .replace(/^condition-/, "")
    .replace(/^option-/, "")
    .replace(/^intervention-/, "")
    .replace(/[-_]+/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function formatHorizon(
  value: string,
): string {
  return humanizeIdentifier(value);
}

export default function SimulationWorkspace({
  projection,
  organizationId,
}: SimulationWorkspaceProps) {
  const executiveSimulation =
    projection.executiveSimulation;

  const communication =
    projection.executiveCommunication;

  const recommendedScenario =
    executiveSimulation?.recommendedScenario;

  const canonicalSimulatedState =
    recommendedScenario
      ?.scenario
      .simulatedOrganizationState;

  const alternativeScenarios =
    executiveSimulation?.alternativeScenarios ??
    [];

  const recommendationTitle =
    recommendedScenario
      ? humanizeIdentifier(
          recommendedScenario.optionId,
        )
      : communication
        ?.recommendation.headline ??
        "Discovery has not completed a recommended scenario.";

  const recommendationSummary =
    executiveSimulation?.executiveSummary ??
    communication
      ?.recommendation.rationale ??
    "Discovery is still evaluating the strongest executive intervention.";

  const decisionConfidence =
    toPercentage(
      executiveSimulation
        ?.executiveConfidence ??
      communication
        ?.confidence.value ??
      projection.currentUnderstanding
        .confidence,
    );

  const baselineConfidence =
    toPercentage(
      projection.currentUnderstanding
        .confidence,
    );

  const primaryConstraint =
    projection.primaryExecutiveConstraint;

  const forecast =
    communication?.forecast;

  const availableConditionIds =
    useMemo(() => {
      const conditionIds =
        new Set<string>();

      canonicalSimulatedState
        ?.projectedConditions
        .forEach((condition) => {
          conditionIds.add(condition.id);
        });

      forecast
        ?.affectedConditionIds
        .forEach((conditionId) => {
          conditionIds.add(conditionId);
        });

      communication
        ?.supportingSignals
        .forEach((signal) => {
          signal.supportingConditionIds.forEach(
            (conditionId) => {
              conditionIds.add(conditionId);
            },
          );
        });

      if (
        primaryConstraint?.conditionId
      ) {
        conditionIds.add(
          primaryConstraint.conditionId,
        );
      }

      return Array.from(conditionIds);
    }, [
      canonicalSimulatedState,
      communication,
      forecast,
      primaryConstraint,
    ]);

  const primaryConditionId =
    primaryConstraint?.conditionId ??
    canonicalSimulatedState
      ?.projectedConditions[0]
      ?.id ??
    availableConditionIds[0] ??
    "condition-decisionflow";

  const initialHorizon =
    canonicalSimulatedState
      ?.timeHorizon ??
    forecast?.timeHorizon ??
    "near-term";

  const [
    isAdjustingScenario,
    setIsAdjustingScenario,
  ] = useState(false);

  const [
    interventionStrength,
    setInterventionStrength,
  ] = useState(0.25);

  const [
    timeHorizon,
    setTimeHorizon,
  ] =
    useState<SimulationHorizon>(
      initialHorizon,
    );

  const [
    challengedAssumption,
    setChallengedAssumption,
  ] = useState("");

  const [
    customProjection,
    setCustomProjection,
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
    setCustomProjection(null);
    setIsDecisionConfirmed(false);

    if (!communication) {
      setError(
        "Discovery cannot run an adjusted scenario because executive communication data is not available.",
      );

      return;
    }

    const assumptions = [
      ...(executiveSimulation
        ?.assumptions ??
        communication
          .recommendation.assumptions),
    ];

    if (
      challengedAssumption
        .trim()
        .length > 0
    ) {
      assumptions.push(
        `Executive challenge: ${challengedAssumption.trim()}`,
      );
    }

    const recommendationActions =
      communication
        .recommendation.actions;

    const interventionDescription =
      recommendationActions.length > 0
        ? recommendationActions.join(
            " ",
          )
        : recommendationSummary;

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
              organizationId,

              changedEntityId:
                primaryConditionId,

              interventionDelta:
                interventionStrength,

              intervention: {
                type: "governance",

                title:
                  recommendationTitle,

                description:
                  interventionDescription,

                rationale:
                  recommendationSummary,

                scope: "organization",

                timeHorizon,

                affectedConditionIds:
                  availableConditionIds
                    .length > 0
                    ? availableConditionIds
                    : [
                        primaryConditionId,
                      ],

                assumptions,

                confidence:
                  executiveSimulation
                    ?.executiveConfidence ??
                  communication
                    .confidence.value,
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
        !result
          .executiveScenarioProjection
      ) {
        throw new Error(
          "The simulation completed without returning a projected organizational future.",
        );
      }

      setCustomProjection(
        result
          .executiveScenarioProjection,
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

  const customSimulatedState =
    customProjection
      ?.projectedFuture
      .simulatedOrganizationState;

  const activeSimulatedState =
    customSimulatedState ??
    canonicalSimulatedState;

  const activeSimulationConfidence =
    toPercentage(
      activeSimulatedState
        ?.confidence ??
      executiveSimulation
        ?.executiveConfidence,
    );

  const confidenceDelta =
    activeSimulationConfidence -
    baselineConfidence;

  const improvingConditions =
    activeSimulatedState
      ?.projectedConditions
      .filter(
        (condition) =>
          condition.status ===
          "improving",
      ) ?? [];

  const unresolvedConditions =
    activeSimulatedState
      ?.projectedConditions
      .filter(
        (condition) =>
          condition.status ===
            "deteriorating" ||
          condition.status ===
            "constrained",
      ) ?? [];

  const stableConditions =
    activeSimulatedState
      ?.projectedConditions
      .filter(
        (condition) =>
          condition.status !==
            "improving" &&
          condition.status !==
            "deteriorating" &&
          condition.status !==
            "constrained",
      ) ?? [];

  const expectedImprovements =
    improvingConditions
      .slice(0, 4)
      .map(
        (condition) =>
          condition.name,
      );

  const visibleExpectedBenefits =
    executiveSimulation
      ?.expectedBenefits
      .slice(0, 4) ??
    [];

  const visibleTradeoffs =
    executiveSimulation
      ?.tradeoffs
      .slice(0, 4) ??
    communication
      ?.recommendation.tradeOffs
      .slice(0, 4) ??
    [];

  const visibleRisks =
    executiveSimulation
      ?.risks
      .slice(0, 4) ??
    [];

  const visibleAssumptions =
    executiveSimulation
      ?.assumptions
      .slice(0, 4) ??
    communication
      ?.recommendation.assumptions
      .slice(0, 4) ??
    [];

  const evidenceThatCouldChange =
    executiveSimulation
      ?.evidenceThatCouldChangeRecommendation
      .slice(0, 4) ??
    communication
      ?.recommendation
      .evidenceThatCouldChangeRecommendation
      .slice(0, 4) ??
    [];

  const executiveSynopsis =
    activeSimulatedState
      ?.explanation ??
    executiveSimulation
      ?.executiveSummary ??
    recommendationSummary;

  function scrollToElement(
    elementId: string,
  ): void {
    window.requestAnimationFrame(
      () => {
        document
          .getElementById(elementId)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
    );
  }

  function openAlternativeComparison(): void {
    scrollToElement(
      "alternative-strategies",
    );
  }

  function openScenarioChallenge(): void {
    setIsAdjustingScenario(true);

    scrollToElement(
      "challenge-decision",
    );
  }

  function reviseScenario(): void {
    setIsDecisionConfirmed(false);
    setCustomProjection(null);
    setIsAdjustingScenario(true);

    scrollToElement(
      "challenge-decision",
    );
  }

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <SimulationDecisionSummary
  title={recommendationTitle}
  confidence={decisionConfidence}
  summary={recommendationSummary}
  primaryConstraint={
    primaryConstraint?.title
  }
  expectedImprovements={
    expectedImprovements
  }
  onMoveForward={() => {
    if (
      activeSimulatedState
    ) {
      setIsDecisionConfirmed(
        true,
      );

      scrollToElement(
        "decision-confirmation",
      );
    }
  }}
  onCompareAlternatives={
    openAlternativeComparison
  }
  onChallengeDecision={
    openScenarioChallenge
  }
/>

          {activeSimulatedState ? (
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
                    Expected Organizational
                    Impact
                  </p>

                  <h2>
                    {improvingConditions.length >
                    0
                      ? `${improvingConditions.length} organizational condition${improvingConditions.length === 1 ? "" : "s"} expected to improve.`
                      : "The recommended strategy does not yet produce a clear organizational improvement."}
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
                      activeSimulationConfidence
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
                {improvingConditions
                  .slice(0, 3)
                  .map((condition) => (
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
                        ↑
                      </span>

                      <div>
                        <strong>
                          {condition.name}
                        </strong>

                        <p>
                          {condition.summary}
                        </p>
                      </div>
                    </article>
                  ))}

                {unresolvedConditions
                  .slice(0, 3)
                  .map((condition) => (
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
                          {condition.name}
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
                  ))}

                {improvingConditions.length ===
                  0 &&
                unresolvedConditions.length ===
                  0
                  ? stableConditions
                      .slice(0, 3)
                      .map(
                        (condition) => (
                          <article
                            key={
                              condition.id
                            }
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
                              →
                            </span>

                            <div>
                              <strong>
                                {
                                  condition.name
                                }
                              </strong>

                              <p>
                                {
                                  condition.summary
                                }
                              </p>
                            </div>
                          </article>
                        ),
                      )
                  : null}
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
                  Explore all projected
                  conditions
                </summary>

                <div
                  className={
                    styles.evidenceGrid
                  }
                >
                  {activeSimulatedState
                    .projectedConditions
                    .map(
                      (condition) => (
                        <article
                          key={
                            condition.id
                          }
                          className={
                            styles.evidenceCard
                          }
                        >
                          <h3>
                            {
                              condition.name
                            }
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
          ) : (
            <section
              className={styles.card}
            >
              <h2>
                No canonical simulation is
                available.
              </h2>

              <p>
                Discovery has not yet produced a
                complete recommended scenario
                for this organization.
              </p>
            </section>
          )}

          {alternativeScenarios.length >
          0 ? (
            <section
              id="alternative-strategies"
              className={styles.card}
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
                    Alternative Strategies
                  </p>

                  <h2>
                    Compare the strongest
                    available strategies
                  </h2>
                </div>

                <span
                  className={
                    styles.metaPill
                  }
                >
                  {
                    alternativeScenarios.length +
                    1
                  }{" "}
                  scenarios compared
                </span>
              </div>

              <div
                className={
                  styles.evidenceGrid
                }
              >
                {recommendedScenario ? (
                  <article
                    className={
                      styles.evidenceCard
                    }
                  >
                    <p
                      className={
                        styles.eyebrow
                      }
                    >
                      Recommended
                    </p>

                    <h3>
                      {
                        recommendationTitle
                      }
                    </h3>

                    <p
                      className={
                        styles.evidenceSummary
                      }
                    >
                      {
                        recommendedScenario
                          .scenario
                          .simulatedOrganizationState
                          .explanation
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
                        {toPercentage(
                          recommendedScenario
                            .scenario
                            .simulatedOrganizationState
                            .confidence,
                        )}
                        %
                      </span>
                    </div>
                  </article>
                ) : null}

                {alternativeScenarios.map(
                  (scenario) => {
                    const state =
                      scenario
                        .scenario
                        .simulatedOrganizationState;

                    return (
                      <article
                        key={
                          scenario.scenarioId
                        }
                        className={
                          styles.evidenceCard
                        }
                      >
                        <p
                          className={
                            styles.eyebrow
                          }
                        >
                          Alternative
                        </p>

                        <h3>
                          {humanizeIdentifier(
                            scenario.optionId,
                          )}
                        </h3>

                        <p
                          className={
                            styles.evidenceSummary
                          }
                        >
                          {
                            state.explanation
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
                            {toPercentage(
                              state.confidence,
                            )}
                            %
                          </span>

                          <span
                            className={
                              styles.metaPill
                            }
                          >
                            {formatHorizon(
                              state.timeHorizon,
                            )}
                          </span>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </section>
          ) : null}

          <section
            className={styles.card}
          >
            <p className={styles.eyebrow}>
              Executive Judgment
            </p>

            <h2>
              Benefits, trade-offs, and risks
            </h2>

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
                <h3>Expected benefits</h3>

                {visibleExpectedBenefits.length >
                0 ? (
                  <ul
                    className={styles.list}
                  >
                    {visibleExpectedBenefits.map(
                      (benefit) => (
                        <li
                          key={benefit}
                          className={
                            styles.listItem
                          }
                        >
                          {benefit}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p>
                    No explicit benefits are
                    currently recorded.
                  </p>
                )}
              </article>

              <article
                className={
                  styles.evidenceCard
                }
              >
                <h3>Trade-offs</h3>

                {visibleTradeoffs.length >
                0 ? (
                  <ul
                    className={styles.list}
                  >
                    {visibleTradeoffs.map(
                      (tradeoff) => (
                        <li
                          key={tradeoff}
                          className={
                            styles.listItem
                          }
                        >
                          {tradeoff}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p>
                    No material trade-off is
                    currently recorded.
                  </p>
                )}
              </article>

              <article
                className={
                  styles.evidenceCard
                }
              >
                <h3>Risks</h3>

                {visibleRisks.length >
                0 ? (
                  <ul
                    className={styles.list}
                  >
                    {visibleRisks.map(
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
                ) : (
                  <p>
                    No explicit risk is
                    currently recorded.
                  </p>
                )}
              </article>
            </div>
          </section>

          {isAdjustingScenario ? (
            <form
              id="challenge-decision"
              className={styles.card}
              onSubmit={runSimulation}
            >
              <p
                className={styles.eyebrow}
              >
                Challenge Decision
              </p>

              <h2>
                Challenge Discovery&apos;s
                recommendation
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
                      leadership should apply
                      the strategy.
                    </p>
                  </div>

                  <span
                    className={
                      styles.metaPill
                    }
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
                          value={
                            option.value
                          }
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
                    What might Discovery be
                    missing?
                  </h3>

                  <p>
                    Add an executive concern,
                    belief, or constraint that
                    should be included in the
                    adjusted scenario.
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
                disabled={
                  isLoading ||
                  !communication
                }
              >
                {isLoading
                  ? "Simulating organizational future..."
                  : "Run adjusted scenario"}
              </button>
            </form>
          ) : null}

          <details
            className={
              styles.detailsDisclosure
            }
          >
            <summary>
              Review assumptions and evidence
              that could change the recommendation
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
                <h3>Key assumptions</h3>

                {visibleAssumptions.length >
                0 ? (
                  <ul
                    className={styles.list}
                  >
                    {visibleAssumptions.map(
                      (assumption) => (
                        <li
                          key={assumption}
                          className={
                            styles.listItem
                          }
                        >
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
              </article>

              <article
                className={
                  styles.evidenceCard
                }
              >
                <h3>
                  What could change the
                  recommendation
                </h3>

                {evidenceThatCouldChange.length >
                0 ? (
                  <ul
                    className={styles.list}
                  >
                    {evidenceThatCouldChange.map(
                      (evidence) => (
                        <li
                          key={evidence}
                          className={
                            styles.listItem
                          }
                        >
                          {evidence}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p>
                    Discovery has not identified
                    evidence that would
                    materially change the
                    recommendation.
                  </p>
                )}
              </article>
            </div>
          </details>

          {isDecisionConfirmed ? (
            <section
              id="decision-confirmation"
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
                  Decision Ready
                </p>

                <h2>
                  Move forward with{" "}
                  {recommendationTitle}
                </h2>

                <p>
                  Discovery will preserve the
                  recommended strategy,
                  assumptions, projected future,
                  alternatives considered, and
                  confidence at the time of the
                  decision.
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
                      activeSimulationConfidence
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
                    {activeSimulatedState
                      ? formatHorizon(
                          activeSimulatedState
                            .timeHorizon,
                        )
                      : "Unknown"}
                  </strong>
                </article>

                <article
                  className={
                    styles.decisionSummaryItem
                  }
                >
                  <span>
                    Alternatives considered
                  </span>

                  <strong>
                    {
                      alternativeScenarios.length
                    }
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
                  Back to analysis
                </button>

                <button
                  className={
                    styles.secondaryButton
                  }
                  type="button"
                  onClick={reviseScenario}
                >
                  Revise scenario
                </button>
              </div>
            </section>
          ) : null}
        </section>

        <aside className={styles.rail}>
          <section className={styles.card}>
            <h2>Current baseline</h2>

            <h3>
              {
                projection
                  .currentUnderstanding
                  .belief
              }
            </h3>

            <p>
              {projection.explanation.why}
            </p>

            <div className={styles.metaRow}>
              <span
                className={
                  styles.metaPill
                }
              >
                Confidence{" "}
                {baselineConfidence}%
              </span>
            </div>
          </section>

          {primaryConstraint ? (
            <section
              className={styles.card}
            >
              <h2>
                Primary constraint
              </h2>

              <h3>
                {
                  primaryConstraint.title
                }
              </h3>

              <p>
                {
                  primaryConstraint
                    .executiveSummary
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
                    primaryConstraint
                      .confidence
                  }
                  % confidence
                </span>

                <span
                  className={
                    styles.metaPill
                  }
                >
                  {
                    primaryConstraint
                      .urgency
                  }{" "}
                  urgency
                </span>
              </div>
            </section>
          ) : null}

          {forecast ? (
            <section
              className={styles.card}
            >
              <h2>
                Future without action
              </h2>

              <h3>
                {forecast.headline}
              </h3>

              <p>
                {forecast.explanation}
              </p>
            </section>
          ) : null}

          {executiveSimulation
            ?.keyDrivers.length ? (
            <section
              className={styles.card}
            >
              <h2>Key drivers</h2>

              <ul className={styles.list}>
                {executiveSimulation
                  .keyDrivers
                  .slice(0, 4)
                  .map((driver) => (
                    <li
                      key={driver}
                      className={
                        styles.listItem
                      }
                    >
                      {driver}
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
