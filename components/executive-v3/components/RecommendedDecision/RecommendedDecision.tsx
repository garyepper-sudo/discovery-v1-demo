import styles from "./RecommendedDecision.module.css";

type RecommendedDecisionProps = {
  headline: string;
  rationale?: string;
  actionCount: number;
  decisionHref?: string;
};

export default function RecommendedDecision({
  headline,
  rationale,
  actionCount,
  decisionHref,
}: RecommendedDecisionProps) {
  return (
    <section className={styles.decision}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          Recommended Decision
        </p>

        <h2>{headline}</h2>

        {rationale ? (
          <p className={styles.rationale}>
            {rationale}
          </p>
        ) : null}
      </div>

      <div className={styles.actions}>
        <span>
          {actionCount} recommended{" "}
          {actionCount === 1 ? "action" : "actions"}
        </span>

        <a href={decisionHref ?? "/executive-decision"}>
          Evaluate decision
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}