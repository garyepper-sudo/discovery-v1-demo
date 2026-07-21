"use client";

import styles from "../../ExecutiveWorkspace.module.css";

type DecisionContextRailProps = {
  source:
    | "discovery-recommendation"
    | "executive-created";
};

export default function DecisionContextRail({
  source,
}: DecisionContextRailProps) {
  const isDiscoveryRecommendation =
    source ===
    "discovery-recommendation";

  return (
    <aside
      className={styles.rail}
      aria-label="Decision evaluation context"
    >
      <section>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Discovery&apos;s Starting Point
        </p>

        <h2>
          The organization is already
          understood.
        </h2>

        <p>
          Discovery will evaluate this
          decision using the current Operating
          Model, including organizational
          conditions, constraints, prior
          learning, and supporting evidence.
        </p>
      </section>

      <section>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Next
        </p>

        <h2>
          Decision Lab
        </h2>

        <p>
          Discovery will compare viable
          strategies, simulate likely
          outcomes, rank the alternatives,
          and recommend a course of action.
        </p>
      </section>

      <section>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Decision Origin
        </p>

        <h2>
          {isDiscoveryRecommendation
            ? "Surfaced by Discovery"
            : "Raised by an executive"}
        </h2>

        <p>
          Regardless of origin, the decision
          follows the same evaluation,
          commitment, tracking, review, and
          learning lifecycle.
        </p>
      </section>

      <section>
        <p
          className={
            styles.placeholderEyebrow
          }
        >
          Operating Model
        </p>

        <p>
          The completed decision and its
          outcomes will improve future
          recommendations.
        </p>
      </section>
    </aside>
  );
}