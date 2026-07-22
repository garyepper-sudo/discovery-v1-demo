import styles from "./OrganizationModel.module.css";
import type { OrganizationExperienceView } from "./data/buildOrganizationExperienceView";

type OrganizationModelProps = {
  model: OrganizationExperienceView["model"];
};

export default function OrganizationModel({ model }: OrganizationModelProps) {
  return (
    <section className={styles.section} aria-labelledby="organization-model-title">
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>Organization model</p>
        <h2 id="organization-model-title">
          Understanding is {model.coherenceLabel.toLocaleLowerCase()}.
        </h2>
        <p className={styles.copy}>
          {model.summary}
        </p>
      </div>

      <details className={styles.model}>
        <summary aria-label="Explore the Organization Model">
          <span className={styles.visual} aria-hidden="true">
            <i className={styles.orbitOne} />
            <i className={styles.orbitTwo} />
            <i className={styles.orbitThree} />
            <i className={styles.axis} />
            <b className={styles.pointOne} />
            <b className={styles.pointTwo} />
            <b className={styles.pointThree} />
            <b className={styles.pointFour} />
            <b className={styles.pointFive} />
            <em />
          </span>

          <span className={styles.measure}>
            <span>Coherence</span>
            <strong>{model.coherence === null ? "—" : `${model.coherence}%`}</strong>
            <small>{model.coherenceLabel}</small>
          </span>
        </summary>

        <ul className={styles.areas}>
          {model.areas.map((area, index) => <li key={area.id} className={index === 0 ? styles.activeArea : undefined}><i aria-hidden="true" /><span>{area.label}</span><small>{area.status.replace(/-/g, " ")}</small></li>)}
        </ul>
      </details>
    </section>
  );
}
