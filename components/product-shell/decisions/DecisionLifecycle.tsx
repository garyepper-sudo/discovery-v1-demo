import styles from "./DecisionsExperience.module.css";
import type { DecisionsExperienceView } from "../data/buildDecisionsExperienceView";

export default function DecisionLifecycle({ lifecycle }: { lifecycle: DecisionsExperienceView["lifecycle"] }) {
  return (
    <section className={styles.lifecycle} aria-labelledby="decision-lifecycle-title">
      <div className={styles.sectionIntroduction}>
        <p className={styles.eyebrow}>Executive work lifecycle</p>
        <h2 id="decision-lifecycle-title">From inquiry to learning.</h2>
        <p className={styles.lifecycleSummary}>{lifecycle.summary}</p>
      </div>

      <ol aria-label="Current decision lifecycle stage">
        {lifecycle.stages.map((stage, index) => (
          <li className={stage.status === "current" ? styles.currentStage : stage.status === "complete" ? styles.completeStage : undefined} key={stage.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{stage.label}</strong>
            {stage.status === "current" && <small>Current position</small>}
          </li>
        ))}
      </ol>
    </section>
  );
}
