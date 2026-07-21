"use client";

import styles from "../ExecutiveWorkspace.module.css";

type DecisionReviewModalProps = {
  open: boolean;

  onClose: () => void;

  onEvaluate: () => void;
};

export default function DecisionReviewModal({
  open,
  onClose,
  onEvaluate,
}: DecisionReviewModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.decisionReviewBackdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={styles.decisionReviewModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-review-title"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <header
          className={styles.decisionReviewHeader}
        >
          <div>
            <p
              className={
                styles.placeholderEyebrow
              }
            >
              Decision Framing
            </p>

            <h2 id="decision-review-title">
              Evaluate Decision
            </h2>

            <p>
              Review how Discovery has framed
              the decision before beginning
              analysis.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.decisionReviewClose
            }
            aria-label="Close decision review"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div
          className={styles.decisionReviewBody}
        >
          <section
            className={
              styles.decisionReviewSection
            }
          >
            <span>Decision</span>

            <strong>
              Reduce approval layers
            </strong>
          </section>

          <section
            className={
              styles.decisionReviewSection
            }
          >
            <span>Objective</span>

            <p>
              Reduce approval latency while
              preserving governance quality
              and decision accountability.
            </p>

            <button type="button">
              Edit objective
            </button>
          </section>

          <section
            className={
              styles.decisionReviewSection
            }
          >
            <span>Why now?</span>

            <p>
              Approval ownership is currently
              the organization&apos;s
              highest-leverage operating
              constraint.
            </p>

            <button type="button">
              Edit rationale
            </button>
          </section>

          <section
            className={
              styles.decisionReviewSection
            }
          >
            <span>Time horizon</span>

            <div
              className={
                styles.decisionReviewOptions
              }
            >
              <label>
                <input
                  type="radio"
                  name="decision-time-horizon"
                  value="immediate"
                />
                Immediate
              </label>

              <label>
                <input
                  type="radio"
                  name="decision-time-horizon"
                  value="near-term"
                  defaultChecked
                />
                Near term
              </label>

              <label>
                <input
                  type="radio"
                  name="decision-time-horizon"
                  value="medium-term"
                />
                Medium term
              </label>

              <label>
                <input
                  type="radio"
                  name="decision-time-horizon"
                  value="long-term"
                />
                Long term
              </label>
            </div>
          </section>

          <section
            className={
              styles.decisionReviewSection
            }
          >
            <span>
              Discovery will evaluate
            </span>

            <ul>
              <li>
                Alternative strategies
              </li>
              <li>
                Organizational impact
              </li>
              <li>
                Trade-offs and risks
              </li>
              <li>
                Executive confidence
              </li>
            </ul>
          </section>
        </div>

        <footer
          className={styles.decisionReviewFooter}
        >
          <button
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onEvaluate}
          >
            Evaluate Decision
          </button>
        </footer>
      </section>
    </div>
  );
}