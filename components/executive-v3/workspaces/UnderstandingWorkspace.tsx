"use client";

import styles from "./UnderstandingWorkspace.module.css";

import type {
  ExecutiveProjection,
} from "../../executive-v2/projection/ExecutiveProjection";

type UnderstandingWorkspaceProps = {
  projection: ExecutiveProjection;
};

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

function formatLabel(
  value: string | undefined,
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function getConfidenceLabel(
  confidence: number,
): string {
  if (confidence >= 80) {
    return "High";
  }

  if (confidence >= 55) {
    return "Developing";
  }

  return "Limited";
}

function getConditionPosition(
  status: string,
  index: number,
): string {
  if (index === 0) {
    return "Priority";
  }

  if (
    status === "critical" ||
    status === "strained"
  ) {
    return "Needs Attention";
  }

  if (
    status === "healthy" ||
    status === "improving"
  ) {
    return "Positive";
  }

  return "Active";
}

export default function UnderstandingWorkspace({
  projection,
}: UnderstandingWorkspaceProps) {
  const organizationalState =
    projection.organizationalState;

  const primaryConstraint =
    projection.primaryExecutiveConstraint;

  const conditions =
    projection.organizationalConditions ?? [];

  const executiveExplanation =
    projection.executiveExplanation;

  const theoryValidation =
    projection.theoryValidation;

  const investigationOpportunities =
    projection.investigationOpportunities ?? [];

  const communication =
    projection.executiveCommunication;

  const confidence =
    toPercentage(
      projection.currentUnderstanding.confidence,
    );

  const confidenceLabel =
    getConfidenceLabel(confidence);

  const visibleConditions =
    conditions.slice(0, 5);

  const evidenceSections =
    communication?.evidenceSections ?? [];

  const visibleEvidenceSections =
    evidenceSections.slice(0, 4);

  const visibleOpportunities =
    investigationOpportunities.slice(0, 4);

  const meaningfulChanges =
    communication?.meaningfulChanges ?? [];

  const visibleChanges =
    meaningfulChanges.slice(0, 2);

  const currentStateTitle =
    organizationalState
      ? formatLabel(
          organizationalState.status,
        )
      : projection.currentUnderstanding.belief;

  const currentStateSummary =
    organizationalState?.summary ??
    projection.explanation.why;

  const currentStateImplication =
    organizationalState?.executiveImplication;

  const supportingAnalysisTitle =
    theoryValidation?.dominantTheory ??
    primaryConstraint?.title ??
    projection.currentUnderstanding.belief;

  const supportingAnalysis =
    executiveExplanation?.assessmentNarrative ||
    theoryValidation?.whyDiscoveryBelievesIt ||
    projection.explanation.why;

  const modelUpdateCount =
    meaningfulChanges.length > 0
      ? meaningfulChanges.length
      : projection.predictionEvaluations?.length ??
        0;

  return (
    <main className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>
            Operating Model
          </p>

          <h1>Operating Model</h1>

          <p className={styles.pageLead}>
            Discovery&apos;s current understanding
            of your organization.
          </p>
        </div>

        <button
          type="button"
          className={styles.modelStatus}
        >
          <span
            className={styles.statusDot}
            aria-hidden="true"
          />

          <span>
            <strong>{confidence}%</strong>

            <small>
              {confidenceLabel} confidence
            </small>
          </span>
        </button>
      </header>

      <section className={styles.summaryGrid}>
        <article
          className={`${styles.summaryCard} ${styles.stateCard}`}
        >
          <p className={styles.cardLabel}>
            Current State
          </p>

          <h2>{currentStateTitle}</h2>

          <p>{currentStateSummary}</p>

          {currentStateImplication &&
          currentStateImplication !==
            currentStateSummary ? (
            <p>{currentStateImplication}</p>
          ) : null}
        </article>

        <article className={styles.summaryCard}>
          <p className={styles.cardLabel}>
            Primary Constraint
          </p>

          {primaryConstraint ? (
            <>
              <h2>
                {primaryConstraint.title}
              </h2>

              <p>
                {
                  primaryConstraint
                    .executiveSummary
                }
              </p>

              <span
                className={
                  styles.directionBadge
                }
              >
                {formatLabel(
                  primaryConstraint.urgency,
                )}{" "}
                urgency
              </span>
            </>
          ) : (
            <>
              <h2>
                Still being determined
              </h2>

              <p>
                Discovery has not yet identified
                a single dominant organizational
                constraint.
              </p>
            </>
          )}
        </article>

        <article className={styles.metricCard}>
          <p className={styles.cardLabel}>
            Confidence
          </p>

          <strong>{confidence}%</strong>

          <span>{confidenceLabel}</span>

          <div
            className={styles.confidenceTrack}
            aria-label={`Operating Model confidence ${confidence}%`}
          >
            <div
              className={styles.confidenceFill}
              style={{
                width: `${confidence}%`,
              }}
            />
          </div>
        </article>

        <article className={styles.metricCard}>
          <p className={styles.cardLabel}>
            Model Updates
          </p>

          <strong>{modelUpdateCount}</strong>

          <span>
            Meaningful changes identified
          </span>
        </article>
      </section>

      <section
        className={styles.conditionsSection}
      >
        <header className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>
              Conditions
            </p>

            <h2>
              Current organizational conditions
            </h2>
          </div>

          <span className={styles.sectionCount}>
            {conditions.length} identified
          </span>
        </header>

        <div className={styles.conditionGrid}>
          {visibleConditions.length > 0 ? (
            visibleConditions.map(
              (condition, index) => {
                const conditionConfidence =
                  toPercentage(
                    condition.confidence,
                  );

                const conditionStatus =
                  condition.status ||
                  "unknown";

                return (
                  <article
                    key={`${condition.name}-${index}`}
                    className={
                      index === 0
                        ? `${styles.conditionCard} ${styles.primaryCondition}`
                        : styles.conditionCard
                    }
                  >
                    <div
                      className={
                        styles.conditionTopline
                      }
                    >
                      <span
                        className={
                          styles.conditionMarker
                        }
                        aria-hidden="true"
                      />

                      <span
                        className={
                          styles.conditionPosition
                        }
                      >
                        {getConditionPosition(
                          conditionStatus,
                          index,
                        )}
                      </span>
                    </div>

                    <h3>{condition.name}</h3>

                    <p>
                      {condition.summary}
                    </p>

                    <div
                      className={
                        styles.signalMeta
                      }
                    >
                      <span>
                        {formatLabel(
                          conditionStatus,
                        )}
                      </span>

                      <span>
                        {conditionConfidence}%
                        confidence
                      </span>
                    </div>
                  </article>
                );
              },
            )
          ) : (
            <article
              className={styles.conditionCard}
            >
              <h3>
                No active organizational
                conditions are available.
              </h3>

              <p>
                Add more evidence to help
                Discovery form a stronger
                Operating Model.
              </p>
            </article>
          )}
        </div>
      </section>

      <section className={styles.analysisGrid}>
        <article className={styles.panel}>
          <header
            className={styles.panelHeader}
          >
            <div>
              <p className={styles.eyebrow}>
                Evidence
              </p>

              <h2>
                Improve the Operating Model
              </h2>
            </div>
          </header>

          <div className={styles.evidenceList}>
            {visibleOpportunities.length >
            0 ? (
              visibleOpportunities.map(
                (opportunity, index) => (
                  <article
                    key={`${opportunity.topic}-${index}`}
                    className={
                      styles.evidenceItem
                    }
                  >
                    <span
                      className={
                        styles.evidenceMarker
                      }
                      aria-hidden="true"
                    />

                    <div>
                      <h3>
                        {opportunity.topic}
                      </h3>

                      <p>
                        {
                          opportunity
                            .suggestedExecutiveQuestion
                        }
                      </p>

                      {opportunity.expectedConfidenceGain >
                      0 ? (
                        <small>
                          Up to{" "}
                          {
                            opportunity
                              .expectedConfidenceGain
                          }
                          % expected confidence
                          gain
                        </small>
                      ) : null}
                    </div>
                  </article>
                ),
              )
            ) : visibleEvidenceSections.length >
              0 ? (
              visibleEvidenceSections.map(
                (section) => (
                  <article
                    key={section.id}
                    className={
                      styles.evidenceItem
                    }
                  >
                    <span
                      className={
                        styles.evidenceMarker
                      }
                      aria-hidden="true"
                    />

                    <div>
                      <h3>
                        {section.title}
                      </h3>

                      <p>
                        {section.summary}
                      </p>
                    </div>
                  </article>
                ),
              )
            ) : (
              <div
                className={styles.emptyState}
              >
                Discovery has not identified a
                priority evidence request.
              </div>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <header
            className={styles.panelHeader}
          >
            <div>
              <p className={styles.eyebrow}>
                Why Discovery Believes This
              </p>

              <h2>Supporting analysis</h2>
            </div>
          </header>

          <div className={styles.analysisBody}>
            <h3>
              {supportingAnalysisTitle}
            </h3>

            <p>{supportingAnalysis}</p>

            {executiveExplanation
              ?.confidenceNarrative ? (
              <p>
                {
                  executiveExplanation
                    .confidenceNarrative
                }
              </p>
            ) : null}

            <button
              type="button"
              className={
                styles.analysisAction
              }
            >
              View supporting analysis →
            </button>
          </div>
        </article>
      </section>

      <section
        className={styles.changesSection}
      >
        <header
          className={styles.changesHeader}
        >
          <div>
            <p className={styles.eyebrow}>
              Recent Meaningful Changes
            </p>

            <h2>
              How the Operating Model has evolved
            </h2>
          </div>

          {meaningfulChanges.length >
          visibleChanges.length ? (
            <button
              type="button"
              className={
                styles.changesAction
              }
            >
              View all changes →
            </button>
          ) : null}
        </header>

        <div className={styles.changeGrid}>
          {visibleChanges.length > 0 ? (
            visibleChanges.map(
              (change) => (
                <article
                  key={change.entityId}
                  className={
                    styles.changeItem
                  }
                >
                  <div
                    className={
                      styles.changeTopline
                    }
                  >
                    <h3>{change.label}</h3>

                    <span>
                      {formatLabel(
                        change.direction,
                      )}
                    </span>
                  </div>

                  <p>{change.statement}</p>

                  <small>
                    {toPercentage(
                      change.confidence,
                    )}
                    % confidence
                  </small>
                </article>
              ),
            )
          ) : (
            <p className={styles.emptyState}>
              No meaningful organizational
              changes are currently recorded.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}