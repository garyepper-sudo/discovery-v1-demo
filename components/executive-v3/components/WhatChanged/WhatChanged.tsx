import styles from "./WhatChanged.module.css";

type ChangeDirection =
  | "improving"
  | "worsening"
  | "stable";

type ChangeItem = {
  entityId: string;
  label: string;
  statement: string;
  direction: ChangeDirection;
};

type WhatChangedProps = {
  changes: ChangeItem[];
};

function directionSymbol(
  direction: ChangeDirection,
): string {
  if (direction === "improving") {
    return "↑";
  }

  if (direction === "worsening") {
    return "↓";
  }

  return "—";
}

export default function WhatChanged({
  changes,
}: WhatChangedProps) {
  return (
    <section className={styles.changed}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>
            What Changed
          </p>

          <h2>
            Since your last visit
          </h2>
        </div>

        <button type="button">
          View timeline
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div className={styles.grid}>
        {changes.length > 0 ? (
          changes.slice(0, 4).map((change) => (
            <article
              key={change.entityId}
              className={styles.item}
            >
              <span
                className={`${styles.direction} ${
                  styles[change.direction]
                }`}
                aria-hidden="true"
              >
                {directionSymbol(change.direction)}
              </span>

              <div>
                <strong>{change.label}</strong>
                <p>{change.statement}</p>
              </div>
            </article>
          ))
        ) : (
          <p className={styles.empty}>
            No material changes were detected.
          </p>
        )}
      </div>
    </section>
  );
}