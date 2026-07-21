import styles from "./OperatingSnapshotCard.module.css";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type OperatingSnapshotCardProps = {
  communication: ExecutiveCommunication;
};

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
      Math.min(
        100,
        percentage,
      ),
    ),
  );
}

function confidenceLabel(
  confidence: number,
): string {
  if (confidence >= 80) {
    return "Strong";
  }

  if (confidence >= 65) {
    return "Developing";
  }

  return "Learning";
}

export default function OperatingSnapshotCard({
  communication,
}: OperatingSnapshotCardProps) {
  const confidence =
    toPercentage(
      communication.confidence.value,
    );

  const primaryChange =
    communication.meaningfulChanges[0];

  const primarySignal =
    communication.supportingSignals[0];

  return (
    <article className={styles.snapshot}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            Operating Snapshot
          </p>

          <h2>Organization today</h2>
        </div>

        <button
          type="button"
          className={styles.action}
        >
          View model →
        </button>
      </header>

      <div className={styles.confidenceRow}>
        <strong>{confidence}%</strong>

        <div>
          <span>
            {confidenceLabel(confidence)}
          </span>

          <p>
            {communication.meaningfulChanges.length}{" "}
            recent{" "}
            {communication.meaningfulChanges.length === 1
              ? "change"
              : "changes"}
          </p>
        </div>
      </div>

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

      <div className={styles.snapshotSection}>
        <span>Current State</span>

        <h3>{communication.headline}</h3>
      </div>

      <div className={styles.snapshotGrid}>
        <div className={styles.snapshotDetail}>
          <span>Primary Constraint</span>

          <strong>
            {primaryChange?.label ??
              primarySignal?.statement ??
              "Still being determined"}
          </strong>
        </div>

        <div className={styles.snapshotDetail}>
          <span>Direction</span>

          <strong>
            {primaryChange?.direction ??
              "Still forming"}
          </strong>
        </div>
      </div>
    </article>
  );
}