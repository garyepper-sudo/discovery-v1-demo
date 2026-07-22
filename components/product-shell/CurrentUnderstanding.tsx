import styles from "./CurrentUnderstanding.module.css";
import ExploreTogether from "./ExploreTogether";
import OrganizationModel from "./OrganizationModel";
import SinceLastVisit from "./SinceLastVisit";
import type { OrganizationExperienceView } from "./data/buildOrganizationExperienceView";

type CurrentUnderstandingProps = {
  view: OrganizationExperienceView;
};

export default function CurrentUnderstanding({ view }: CurrentUnderstandingProps) {
  const understanding = view.currentUnderstanding;

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <p>Organization model</p>
        <h1>Your Organization</h1>
      </header>

      <OrganizationModel model={view.model} />

      <section
        className={styles.understanding}
        aria-labelledby="current-understanding-title"
      >
        <div className={styles.labelRow}>
          <p>Current understanding</p>

          <p className={styles.confidence}>
            <span aria-hidden="true" />
            {understanding.confidenceLabel}
          </p>
        </div>

        <h2 id="current-understanding-title">
          {understanding.headline}
        </h2>

        <p className={styles.explanation}>
          {understanding.explanation}
        </p>

        <details className={styles.disclosure}>
          <summary>
            <span>Why Discovery believes this</span>
            <i aria-hidden="true" />
          </summary>

          <div className={styles.rationale}>
            <section className={styles.reasoning}>
              <h3>Discovery&apos;s reasoning</h3>
              <p>
                {understanding.reasoning}
              </p>
            </section>

            {understanding.observations.length > 0 && (
              <section className={styles.observations}>
                <h3>Observed patterns</h3>
                <ul>
                  {understanding.observations.map((observation) => (
                    <li key={observation}>{observation}</li>
                  ))}
                </ul>
              </section>
            )}

            {(understanding.confidenceRationale || understanding.missingEvidence) && (
              <section className={styles.confidenceDetail}>
                <h3>Confidence</h3>
                <p>
                  <strong>{understanding.confidenceLabel}.</strong>{" "}
                  {understanding.confidenceRationale}
                </p>
                {understanding.missingEvidence && (
                  <p>Still needed: {understanding.missingEvidence}</p>
                )}
              </section>
            )}

            <section className={styles.counterEvidence}>
              <h3>What would change Discovery&apos;s view</h3>
              <p>
                {understanding.falsificationCondition}
              </p>
            </section>
          </div>
        </details>
      </section>

      <SinceLastVisit changes={view.changes} />
      <ExploreTogether exploration={view.exploration} />
    </article>
  );
}
