import Link from "next/link";
import type { ReturnTypeOfExperimentView } from "./types";
import LivingModelContext from "../shared/LivingModelContext";
import { buildProductHref } from "../data/productOrganization";
import styles from "./ExperimentExperience.module.css";

export default function ExperimentExperience({ view }: { view: ReturnTypeOfExperimentView }) {
  return <article className={styles.page}>
    <header><p>Current interaction · Experiment</p><h1>What should we stress test?</h1></header>
    <LivingModelContext model={view.model} activeIds={view.model.areas.slice(0, 3).map((area) => area.id)} />
    <section className={styles.interaction}>
      <p>Current scenario</p><h2>{view.currentScenario}</h2>{view.scenarioSummary && <span>{view.scenarioSummary}</span>}
      <Link href={buildProductHref("/executive-decision", view.organization.id)}>Run Experiment</Link>
    </section>
    <section className={styles.recent}><p>Recent scenarios</p>{view.recentScenarios.length ? <ul>{view.recentScenarios.map((scenario) => <li key={scenario.id}><span>{scenario.title}</span><small>{scenario.status}</small></li>)}</ul> : <span>No prior scenarios are recorded.</span>}</section>
  </article>;
}
