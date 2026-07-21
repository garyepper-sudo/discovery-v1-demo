"use client";

import { useState } from "react";

import styles from "../../ExecutiveWorkspace.module.css";

type DecisionHeaderProps = {
  title: string;

  source:
    | "discovery-recommendation"
    | "executive-created";

  disabled?: boolean;

  onTitleChange: (
    value: string,
  ) => void;
};

export default function DecisionHeader({
  title,
  source,
  disabled = false,
  onTitleChange,
}: DecisionHeaderProps) {
  const [
    isEditing,
    setIsEditing,
  ] = useState(
    title.trim().length === 0,
  );

  const isDiscoveryRecommendation =
    source ===
    "discovery-recommendation";

  return (
    <header
      className={styles.workspaceHeader}
    >
      <p className={styles.eyebrow}>
        Executive Intent
      </p>

      <h1>
        Confirm Discovery&apos;s understanding
      </h1>

      <p className={styles.workspaceLead}>
        {isDiscoveryRecommendation
          ? "Discovery believes this decision deserves executive attention. Confirm or adjust its understanding before entering Decision Lab."
          : "Discovery will use this decision to evaluate strategies, simulations, and recommendations."}
      </p>

      <div className={styles.card}>
        <h2>Decision</h2>

        {isEditing ? (
          <>
            <input
              id="decision-title"
              type="text"
              value={title}
              onChange={(event) =>
                onTitleChange(
                  event.target.value,
                )
              }
              disabled={disabled}
              placeholder="What decision should Discovery evaluate?"
            />

            <div
              className={
                styles.decisionActions
              }
            >
              <button
                className={
                  styles.secondaryButton
                }
                type="button"
                onClick={() =>
                  setIsEditing(false)
                }
              >
                Confirm decision
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>
              {title ||
                "Untitled decision"}
            </h3>

            <p>
              Discovery will evaluate this
              decision using the current
              Operating Model.
            </p>

            <div
              className={
                styles.decisionActions
              }
            >
              <button
                className={
                  styles.secondaryButton
                }
                type="button"
                onClick={() =>
                  setIsEditing(true)
                }
              >
                Adjust decision
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}