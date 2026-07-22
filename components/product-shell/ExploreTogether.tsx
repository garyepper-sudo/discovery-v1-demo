import Link from "next/link";

import styles from "./OrganizationJourney.module.css";
import type { OrganizationExperienceView } from "./data/buildOrganizationExperienceView";

type ExploreTogetherProps = {
  exploration: OrganizationExperienceView["exploration"];
};

export default function ExploreTogether({ exploration }: ExploreTogetherProps) {
  return (
    <section className={styles.explore} aria-labelledby="explore-together-title">
      <p className={styles.eyebrow}>Explore together</p>
      <h2 id="explore-together-title">Where would you like to go from here?</h2>
      <p className={styles.invitation}>
        {exploration.recommended.rationale}
      </p>

      <Link className={styles.recommendedDirection} href={exploration.recommended.destination}>
        <span>{exploration.recommended.label}</span>
        <i aria-hidden="true">↗</i>
      </Link>

      {exploration.alternatives.length > 0 && (
        <ul aria-label="Other exploration directions">
          {exploration.alternatives.map((direction) => (
            <li key={direction.label}>
              <Link href={direction.destination}>
                <span>{direction.label}</span>
                <i aria-hidden="true">↗</i>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
