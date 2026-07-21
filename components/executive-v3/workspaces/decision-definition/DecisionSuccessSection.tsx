"use client";

import {
  useState,
} from "react";

import styles from "../../ExecutiveWorkspace.module.css";

type DecisionSuccessSectionProps = {
  objective: string;

  disabled?: boolean;

  onObjectiveChange: (
    value: string,
  ) => void;
};

export default function DecisionSuccessSection({
  objective,
  disabled = false,
  onObjectiveChange,
}: DecisionSuccessSectionProps) {
  const [
    isEditing,
    setIsEditing,
  ] = useState(
    objective.trim().length === 0,
  );

  const hasObjective =
    objective.trim().length > 0;

  return (
    <section
      className={
        styles.decisionDefinitionSection
      }
      aria-labelledby="decision-success-heading"
    >
      <div>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Intended Outcome
        </p>

        <h2 id="decision-success-heading">
          What should this decision improve?
        </h2>

        <p>
          Discovery will use this outcome to
          compare strategies, trade-offs, and
          simulated futures.
        </p>
      </div>

      {isEditing ? (
        <div>
          <label
            htmlFor="decision-objective"
          >
            Success outcome
          </label>

          <textarea
            id="decision-objective"
            value={objective}
            onChange={(event) =>
              onObjectiveChange(
                event.target.value,
              )
            }
            placeholder="State the organizational outcome this decision should improve."
            rows={3}
            disabled={disabled}
          />
        </div>
      ) : (
        <blockquote>
          {objective}
        </blockquote>
      )}

      <button
        type="button"
        onClick={() =>
          setIsEditing(
            (current) => !current,
          )
        }
        disabled={disabled}
        aria-expanded={isEditing}
        aria-controls="decision-objective"
      >
        {isEditing
          ? "Confirm outcome"
          : hasObjective
            ? "Adjust outcome"
            : "Define outcome"}
      </button>
    </section>
  );
}