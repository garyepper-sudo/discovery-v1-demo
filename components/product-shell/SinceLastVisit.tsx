import styles from "./OrganizationJourney.module.css";
import type { OrganizationExperienceView } from "./data/buildOrganizationExperienceView";

type SinceLastVisitProps = {
  changes: OrganizationExperienceView["changes"];
};

export default function SinceLastVisit({ changes }: SinceLastVisitProps) {
  return (
    <section className={styles.changed} aria-labelledby="since-last-visit-title">
      <div>
        <p className={styles.eyebrow}>
          {changes.isFirstBaseline ? "First organizational baseline" : "Since your last visit"}
        </p>
        <h2 id="since-last-visit-title">{changes.summary}</h2>
      </div>

      {changes.items.length > 0 ? (
        <ul>
          {changes.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      ) : (
        <p className={styles.baselineNote}>
          Future visits will show how understanding, confidence, and coherence change over time.
        </p>
      )}
    </section>
  );
}
