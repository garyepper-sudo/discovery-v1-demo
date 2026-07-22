"use client";

import { useInteractionSession } from "./InteractionSession";
import styles from "./SessionImpact.module.css";
import { buildSessionImpact } from "../data/buildSessionImpact";

export default function SessionImpact() {
  const { entries } = useInteractionSession();
  if (!entries.length) return null;
  const impact = buildSessionImpact(entries);
  const { durable, provisional } = impact;
  return (
    <aside className={styles.impact} aria-label="Session impact">
      <p>Session impact</p><h2>{impact.headline}</h2>
      {durable.length ? <ul>{durable.map((entry) => <li key={entry.id}><strong>{entry.action.replace(/-/g, " ")}</strong><span>{entry.label}</span><small>{entry.status}</small></li>)}</ul> : <p className={styles.empty}>No Organization Model changes have been saved yet.</p>}
      {provisional.length > 0 && <p className={styles.provisional}>{provisional.length} discussed item{provisional.length === 1 ? " remains" : "s remain"} provisional.</p>}
    </aside>
  );
}
