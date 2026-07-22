import Link from "next/link";

import type { ResearchExperienceView as ResearchView } from "../data/buildResearchExperienceView";
import ResearchRecommendation from "./ResearchRecommendation";
import TeachDiscovery from "./TeachDiscovery";
import styles from "./ResearchExperience.module.css";

export default function ResearchExperience({ view }: { view: ResearchView }) {
  return (
    <article className={styles.page}>
      <header className={styles.header}><p>Organization research</p><h1>Research</h1></header>

      <section className={styles.primaryQuestion} aria-labelledby="primary-research-title">
        <p className={styles.eyebrow}>Highest-leverage unknown</p>
        <h2 id="primary-research-title">{view.highestUnknown?.headline ?? "Discovery has not yet identified a high-priority research question."}</h2>
        {view.highestUnknown && <><p className={styles.primarySummary}>{view.highestUnknown.summary}</p><p className={styles.confidence}>{view.highestUnknown.confidenceLabel}</p></>}
      </section>

      <section className={styles.importance} aria-labelledby="research-importance-title">
        <div className={styles.sectionIntroduction}><p className={styles.eyebrow}>Why this matters</p><h2 id="research-importance-title">What resolving this uncertainty would improve.</h2></div>
        <div className={styles.importanceDetail}>
          <p>{view.whyItMatters.explanation}</p>
          {view.whyItMatters.impact && <p className={styles.impact}>{view.whyItMatters.impact}</p>}
          {view.whyItMatters.observations.length > 0 && <ul>{view.whyItMatters.observations.map((item) => <li key={item}>{item}</li>)}</ul>}
        </div>
      </section>

      <ResearchRecommendation recommendation={view.recommendation} />
      <TeachDiscovery requests={view.evidenceRequests} />

      <section className={styles.opportunities} aria-labelledby="research-opportunities-title">
        <div className={styles.sectionIntroduction}><p className={styles.eyebrow}>Other research opportunities</p><h2 id="research-opportunities-title">{view.opportunities.length ? "We know enough to ask better questions." : "No additional priorities are recorded."}</h2></div>
        {view.opportunities.length > 0 ? <ul>{view.opportunities.map((opportunity) => <li key={opportunity.title}><div><h3>{opportunity.title}</h3><p>{opportunity.summary}</p></div>{opportunity.destination && <Link href={opportunity.destination} aria-label={`Explore ${opportunity.title}`}>Explore</Link>}</li>)}</ul> : <p className={styles.emptyOpportunities}>Discovery has not yet identified additional research opportunities.</p>}
      </section>
    </article>
  );
}
