"use client";

import {
  useMemo,
  useState,
} from "react";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveDecisionProjection,
} from "../projection/buildExecutiveDecisionProjection";

import type {
  ExecutiveDecisionCommitSelection,
} from "../../executive-v2/ExecutiveWorkspace";

type DecisionDisposition =
  ExecutiveDecisionCommitSelection["disposition"];

type DecisionCommitPanelProps = {
  projection:
    ExecutiveDecisionProjection;

  onCommitDecision?:
    (
      selection:
        ExecutiveDecisionCommitSelection,
    ) => Promise<void>;

  isCommitting?:
    boolean;

  error?:
    string | null;

  committedRecord?:
    unknown | null;
};

function buildDefaultRationale(
  projection:
    ExecutiveDecisionProjection,

  disposition:
    DecisionDisposition,
): string {
  switch (disposition) {
    case "accepted-recommendation":
      return projection.recommendation
        .rationale;

    case "deferred":
      return projection.recommendation
        .evidenceThatCouldChangeRecommendation[0] ??
        "Additional evidence is required before committing to this intervention.";

    case "rejected":
      return "The recommended intervention is not appropriate under the current executive constraints.";

    default:
      return projection.recommendation
        .rationale;
  }
}

function buildDecisionStatement(
  projection:
    ExecutiveDecisionProjection,

  disposition:
    DecisionDisposition,
): string {
  const recommendedTitle =
    projection.decisionJustification
      .recommendedTitle ||
    projection.recommendation
      .strategy?.title ||
    projection.recommendation
      .headline;

  switch (disposition) {
    case "accepted-recommendation":
      return `Authorize ${recommendedTitle}.`;

    case "deferred":
      return `Defer ${projection.objective.headline} pending additional evidence.`;

    case "rejected":
      return `Do not proceed with ${recommendedTitle}.`;

    default:
      return `Record an executive decision regarding ${projection.objective.headline}.`;
  }
}

export default function DecisionCommitPanel({
  projection,
  onCommitDecision,
  isCommitting = false,
  error = null,
  committedRecord = null,
}: DecisionCommitPanelProps) {
  const [
    disposition,
    setDisposition,
  ] = useState<DecisionDisposition>(
    "accepted-recommendation",
  );

  const [
    rationale,
    setRationale,
  ] = useState(
    () =>
      buildDefaultRationale(
        projection,
        "accepted-recommendation",
      ),
  );

  const selectedOptionId =
    useMemo(
      () =>
        projection
          .decisionJustification
          .recommendedOptionId ||
        projection.recommendation
          .strategy?.optionId,
      [
        projection
          .decisionJustification
          .recommendedOptionId,
        projection.recommendation
          .strategy?.optionId,
      ],
    );

  const canCommit =
    Boolean(onCommitDecision) &&
    rationale.trim().length > 0 &&
    !isCommitting &&
    !committedRecord;

  function handleDispositionChange(
    nextDisposition:
      DecisionDisposition,
  ) {
    setDisposition(
      nextDisposition,
    );

    setRationale(
      buildDefaultRationale(
        projection,
        nextDisposition,
      ),
    );
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !onCommitDecision ||
      !canCommit
    ) {
      return;
    }

    await onCommitDecision({
      selectedOptionId:
        disposition ===
        "accepted-recommendation"
          ? selectedOptionId
          : undefined,

      disposition,

      decision:
        buildDecisionStatement(
          projection,
          disposition,
        ),

      rationale:
        rationale.trim(),

      acceptedAssumptions:
        disposition ===
        "accepted-recommendation"
          ? projection.recommendation
              .assumptions
          : [],

      acceptedRisks:
        disposition ===
        "accepted-recommendation"
          ? projection.recommendation
              .risks
          : [],

      executiveConfidenceAtDecision:
        projection.confidence.value,
    });
  }

  if (committedRecord) {
    return (
      <section
        className={
          styles.decisionConfirmation
        }
        aria-labelledby="decision-committed-heading"
      >
        <div>
          <p className={styles.eyebrow}>
            Decision Recorded
          </p>

          <h2
            id="decision-committed-heading"
          >
            Executive judgment is now part
            of the Operating Model.
          </h2>

          <p>
            Discovery persisted the decision
            and can use its review,
            observed outcomes, and eventual
            learning to improve future
            recommendations.
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
            <span>Disposition</span>

            <strong>
              {disposition ===
              "accepted-recommendation"
                ? "Accepted"
                : disposition ===
                    "deferred"
                  ? "Deferred"
                  : "Rejected"}
            </strong>
          </article>

          <article
            className={
              styles.decisionSummaryItem
            }
          >
            <span>Confidence</span>

            <strong>
              {Math.round(
                projection.confidence
                  .value * 100,
              )}
              %
            </strong>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section
      className={
        styles.decisionConfirmation
      }
      aria-labelledby="decision-next-step-heading"
    >
      <div>
        <p className={styles.eyebrow}>
          Executive Decision
        </p>

        <h2
          id="decision-next-step-heading"
        >
          {
            projection.recommendation
              .nextStep
          }
        </h2>

        <p>
          Discovery has completed its
          evaluation. Record the executive
          disposition so this judgment can
          become part of the organization’s
          decision history.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div
          className={
            styles.decisionActions
          }
          role="group"
          aria-label="Executive disposition"
        >
          <button
            type="button"
            className={
              disposition ===
              "accepted-recommendation"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            disabled={
              isCommitting
            }
            onClick={() => {
              handleDispositionChange(
                "accepted-recommendation",
              );
            }}
          >
            Accept recommendation
          </button>

          <button
            type="button"
            className={
              disposition ===
              "deferred"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            disabled={
              isCommitting
            }
            onClick={() => {
              handleDispositionChange(
                "deferred",
              );
            }}
          >
            Investigate further
          </button>

          <button
            type="button"
            className={
              disposition ===
              "rejected"
                ? styles.primaryButton
                : styles.secondaryButton
            }
            disabled={
              isCommitting
            }
            onClick={() => {
              handleDispositionChange(
                "rejected",
              );
            }}
          >
            Reject recommendation
          </button>
        </div>

        <label
          htmlFor="executive-decision-rationale"
          style={{
            display: "grid",
            gap: "10px",
            marginTop: "24px",
          }}
        >
          <span
            style={{
              color:
                "var(--ds-text-secondary)",
              fontSize: "0.72rem",
              fontWeight: 750,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Executive rationale
          </span>

          <textarea
            id="executive-decision-rationale"
            value={
              rationale
            }
            disabled={
              isCommitting
            }
            rows={5}
            onChange={(
              event,
            ) => {
              setRationale(
                event.target.value,
              );
            }}
            style={{
              width: "100%",
              resize: "vertical",
              padding: "14px 16px",
              border:
                "1px solid var(--ds-border)",
              borderRadius: "12px",
              color:
                "var(--ds-text)",
              background:
                "rgba(255, 255, 255, 0.026)",
              font: "inherit",
              lineHeight: 1.6,
            }}
          />
        </label>

        {error ? (
          <p
            role="alert"
            style={{
              color: "#f0a3a3",
              marginTop: "16px",
            }}
          >
            {error}
          </p>
        ) : null}

        <div
          className={
            styles.decisionActions
          }
        >
          <button
            type="submit"
            className={
              styles.primaryButton
            }
            disabled={
              !canCommit
            }
          >
            {isCommitting
              ? "Recording decision…"
              : "Commit decision"}
          </button>
        </div>
      </form>
    </section>
  );
}
