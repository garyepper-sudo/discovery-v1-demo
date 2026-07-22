import Link from "next/link";

import type { ResearchExperienceView } from "../data/buildResearchExperienceView";
import styles from "./ResearchExperience.module.css";

export default function ResearchRecommendation({ recommendation }: { recommendation: ResearchExperienceView["recommendation"] }) {
  if (!recommendation) return null;

  return (
    <section className={styles.recommendation} aria-labelledby="research-recommendation-title">
      <p className={styles.eyebrow}>Discovery&apos;s research recommendation</p>
      <h2 id="research-recommendation-title">{recommendation.title}</h2>
      <p>{recommendation.rationale}</p>
      {recommendation.destination && <Link href={recommendation.destination}>Explore this question</Link>}
    </section>
  );
}
