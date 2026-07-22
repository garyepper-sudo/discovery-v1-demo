import Link from "next/link";

import type { DecisionsExperienceView as DecisionsView } from "../data/buildDecisionsExperienceView";
import DecisionLifecycle from "./DecisionLifecycle";
import DecisionRecommendation from "./DecisionRecommendation";
import styles from "./DecisionsExperience.module.css";

export default function DecisionsExperience({ view }: { view: DecisionsView }) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <p>Executive work</p>
        <h1>Decisions</h1>
      </header>

      <section className={styles.primaryWork} aria-labelledby="primary-work-title">
        <div className={styles.primaryMeta}>
          <p>{view.state.kind === "active" ? "Active executive work" : "Decision posture"}</p>
          <p>{view.state.kind === "active" && <span aria-hidden="true" />}{view.state.kind === "active" ? view.state.status : "Not opened"}</p>
        </div>
        <h2 id="primary-work-title">{view.state.title}</h2>
        <p className={styles.primaryContext}>{view.state.summary}</p>
      </section>

      <DecisionLifecycle lifecycle={view.lifecycle} />

      <section className={styles.position} aria-labelledby="current-position-title">
        <div className={styles.sectionIntroduction}>
          <p className={styles.eyebrow}>Current position</p>
          <h2 id="current-position-title">{view.currentPosition.headline}</h2>
        </div>

        <div className={styles.positionDetail}>
          <p>{view.currentPosition.summary}</p>
          <div className={styles.positionMeta}>
            {view.currentPosition.recommendationStatus && <span>{view.currentPosition.recommendationStatus}</span>}
            <span>{view.currentPosition.confidenceLabel}</span>
            {view.currentPosition.primaryConstraint && <span>Constraint: {view.currentPosition.primaryConstraint}</span>}
          </div>
          {view.currentPosition.observations.length > 0 && (
            <ul>{view.currentPosition.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul>
          )}
          {view.currentPosition.risks.length > 0 && (
            <section className={styles.risks} aria-labelledby="recommendation-risks-title">
              <h3 id="recommendation-risks-title">What could go wrong?</h3>
              <ul>
                {view.currentPosition.risks.map((risk) => <li key={risk}>{risk}</li>)}
              </ul>
            </section>
          )}
        </div>
      </section>

      <DecisionRecommendation nextStep={view.nextStep} />

      <section className={styles.explore} aria-labelledby="explore-further-title">
        <div className={styles.sectionIntroduction}>
          <p className={styles.eyebrow}>Explore further</p>
          <h2 id="explore-further-title">Keep the decision grounded.</h2>
        </div>
        <ul>
          {view.exploreFurther.map((exploration) => (
            <li key={exploration.label}>
              <Link href={exploration.destination}>
                <span>{exploration.label}</span><i aria-hidden="true">↗</i>
              </Link>
              {exploration.rationale && <small>{exploration.rationale}</small>}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.otherWork} aria-labelledby="other-work-title">
        <div className={styles.sectionIntroduction}>
          <p className={styles.eyebrow}>Other executive work</p>
          <h2 id="other-work-title">{view.otherWork.length ? "Recorded elsewhere." : "Nothing else in motion."}</h2>
        </div>
        {view.otherWork.length ? (
          <ul>{view.otherWork.map((work) => <li key={`${work.title}-${work.status}`}><span>{work.title}</span><small>{work.status}</small></li>)}</ul>
        ) : <p className={styles.emptyWork}>No other Executive Work has been recorded.</p>}
      </section>
    </article>
  );
}
