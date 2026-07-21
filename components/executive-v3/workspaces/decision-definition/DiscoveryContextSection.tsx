"use client";

import {
  useState,
} from "react";

import styles from "../../ExecutiveWorkspace.module.css";

type DiscoveryContextSectionProps = {
  rationale: string;

  disabled?: boolean;

  onRationaleChange: (
    value: string,
  ) => void;
};

export default function DiscoveryContextSection({
  rationale,
  disabled = false,
  onRationaleChange,
}: DiscoveryContextSectionProps) {
  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const hasRationale =
    rationale.trim().length > 0;

  function handleFinishEditing() {
    setIsEditing(false);
  }

  return (
    <section
      className={
        styles.decisionDefinitionSection
      }
      aria-labelledby="decision-context-heading"
    >
      <div>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Discovery&apos;s Understanding
        </p>

        <h2 id="decision-context-heading">
          Why this decision matters now
        </h2>

        <p>
          Discovery inferred this context
          from the current Operating Model,
          organizational conditions, and
          executive assessment.
        </p>
      </div>

      {isEditing ? (
        <div>
          <label
            htmlFor="decision-rationale"
          >
            Decision context
          </label>

          <textarea
            id="decision-rationale"
            value={rationale}
            onChange={(event) =>
              onRationaleChange(
                event.target.value,
              )
            }
            placeholder="Correct or add the context Discovery should use when evaluating this decision."
            rows={4}
            disabled={disabled}
          />
        </div>
      ) : hasRationale ? (
        <blockquote>
          {rationale}
        </blockquote>
      ) : (
        <p>
          Discovery has not yet formed enough
          context for this decision. Add a
          brief explanation of why it matters
          now.
        </p>
      )}

      <button
        type="button"
        onClick={
          isEditing
            ? handleFinishEditing
            : () => setIsEditing(true)
        }
        disabled={disabled}
        aria-expanded={isEditing}
        aria-controls="decision-rationale"
      >
        {isEditing
          ? "Confirm context"
          : hasRationale
            ? "Correct context"
            : "Add context"}
      </button>
    </section>
  );
}