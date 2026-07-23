"use client";

import { useState } from "react";
import type { buildBriefExperienceView } from "../data/buildBriefExperienceView";
import LivingModelContext from "../shared/LivingModelContext";
import styles from "./BriefExperience.module.css";

export default function BriefExperience({ view, initialTemplate }: { view: ReturnType<typeof buildBriefExperienceView>; initialTemplate?: string }) {
  const [template, setTemplate] = useState<string | null>(initialTemplate && view.templates.includes(initialTemplate as never) ? initialTemplate : null);
  const [drafted, setDrafted] = useState(false);
  return <article className={styles.page}>
    <header><p>Current interaction · Brief</p><h1>How do I move the organization?</h1></header>
    <LivingModelContext model={view.model} activeIds={view.model.areas.slice(0, 2).map((area) => area.id)} />
    <section className={styles.interaction}>
      <div><p>Recent briefs</p>{view.recentBriefs.length ? <ul>{view.recentBriefs.map((brief) => <li key={brief}>{brief}</li>)}</ul> : <span>No briefs have been created yet.</span>}</div>
      <div><p>Create Brief</p><h2>{template ? `Create a ${template}` : "Choose the communication this moment needs."}</h2><div className={styles.templates}>{view.templates.map((item) => <button type="button" key={item} onClick={() => { setTemplate(item); setDrafted(false); }}>{item}</button>)}</div>{template && <button type="button" className={styles.create} onClick={() => setDrafted(true)}>Create Brief</button>}<span>{view.sourceSummary}</span>{drafted && <div className={styles.draft}><small>Draft ready · session only</small><strong>{template}</strong><p>{view.sourceSummary}</p></div>}</div>
    </section>
  </article>;
}
