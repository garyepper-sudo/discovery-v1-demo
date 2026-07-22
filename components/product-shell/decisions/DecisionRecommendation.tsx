import styles from "./DecisionsExperience.module.css";
import Link from "next/link";
import type { DecisionsExperienceView } from "../data/buildDecisionsExperienceView";

export default function DecisionRecommendation({ nextStep }: { nextStep: DecisionsExperienceView["nextStep"] }) {
  if (!nextStep) return null;
  return (
    <section className={styles.recommendation} aria-labelledby="recommendation-title">
      <p className={styles.eyebrow}>Recommended next step</p>
      <h2 id="recommendation-title">{nextStep.label}</h2>
      <p>{nextStep.rationale}</p>
      <Link href={nextStep.destination}>Continue</Link>
    </section>
  );
}
