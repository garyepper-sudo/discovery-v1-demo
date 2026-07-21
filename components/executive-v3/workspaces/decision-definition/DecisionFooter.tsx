"use client";

import styles from "../../ExecutiveWorkspace.module.css";

type DecisionFooterProps = {
  isValid: boolean;

  isEvaluating?: boolean;

  error?: string | null;

  onCancel: () => void;

  onEvaluate: () => void;
};

export default function DecisionFooter({
  isValid,
  isEvaluating = false,
  error = null,
  onCancel,
  onEvaluate,
}: DecisionFooterProps) {
  return (
    <footer
      className={
        styles.decisionDefinitionFooter
      }
    >
      <div>
        <p>
          Discovery will use the confirmed
          intent and current Operating Model
          to compare strategies, simulate
          outcomes, and form a recommendation.
        </p>

        {error ? (
          <p role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div
        className={
          styles.decisionDefinitionFooterActions
        }
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isEvaluating}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onEvaluate}
          disabled={
            !isValid ||
            isEvaluating
          }
          aria-busy={isEvaluating}
        >
          {isEvaluating
            ? "Preparing Decision Lab…"
            : "Continue to Decision Lab"}
        </button>
      </div>
    </footer>
  );
}