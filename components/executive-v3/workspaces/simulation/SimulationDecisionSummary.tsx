"use client";

import styles from "../../ExecutiveWorkspace.module.css";

type SimulationDecisionSummaryProps = {
  title: string;

  confidence: number;

  summary: string;

  primaryConstraint?: string;

  expectedImprovements: string[];

  onMoveForward: () => void;

  onCompareAlternatives: () => void;

  onChallengeDecision: () => void;
};

export default function SimulationDecisionSummary({
  title,
  confidence,
  summary,
  primaryConstraint,
  expectedImprovements,
  onMoveForward,
  onCompareAlternatives,
  onChallengeDecision,
}: SimulationDecisionSummaryProps) {
  return (
    <section
      className={
        styles.decisionHero
      }
    >
      <div
        className={
          styles.decisionHeroHeader
        }
      >
        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Recommended Strategy
          </p>

          <h1>{title}</h1>

          <p
            className={
              styles.workspaceLead
            }
          >
            {summary}
          </p>
        </div>

        <div
          className={
            styles.decisionHeroConfidence
          }
        >
          <span>
            Decision confidence
          </span>

          <strong>
            {confidence}%
          </strong>
        </div>
      </div>

      {primaryConstraint ? (
        <div
          className={
            styles.decisionHeroConstraint
          }
        >
          <span>
            Primary constraint
          </span>

          <strong>
            {primaryConstraint}
          </strong>
        </div>
      ) : null}

      {expectedImprovements.length > 0 ? (
        <div
          className={
            styles.decisionHeroImprovements
          }
        >
          <span>
            Expected improvements
          </span>

          <ul>
            {expectedImprovements.map(
              (improvement) => (
                <li key={improvement}>
                  {improvement}
                </li>
              ),
            )}
          </ul>
        </div>
      ) : null}

      <div
        className={
          styles.decisionHeroActions
        }
      >
        <button
          type="button"
          className={
            styles.primaryButton
          }
          onClick={onMoveForward}
        >
          Move Forward
        </button>

        <button
          type="button"
          className={
            styles.secondaryButton
          }
          onClick={
            onCompareAlternatives
          }
        >
          Compare Alternatives
        </button>

        <button
          type="button"
          className={
            styles.secondaryButton
          }
          onClick={
            onChallengeDecision
          }
        >
          Challenge Decision
        </button>
      </div>
    </section>
  );
}