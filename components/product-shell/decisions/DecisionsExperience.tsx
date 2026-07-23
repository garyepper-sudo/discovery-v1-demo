"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { DecisionsExperienceView as DecisionsView } from "../data/buildDecisionsExperienceView";
import DecisionLifecycle from "./DecisionLifecycle";
import DecisionRecommendation from "./DecisionRecommendation";
import styles from "./DecisionsExperience.module.css";
import LivingModelContext from "../shared/LivingModelContext";
import { useInteractionSession } from "../shared/InteractionSession";

export default function DecisionsExperience({ view }: { view: DecisionsView }) {
  const { entries, addEntry } = useInteractionSession();
  const seed = [...entries].reverse().find((entry) => entry.kind === "discussion")?.label ?? "";
  const [showForm, setShowForm] = useState(Boolean(seed));
  const [considering, setConsidering] = useState(seed);
  const [whyNow, setWhyNow] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function createDecision() {
    setSaving(true);
    const response = await fetch("/api/product-interaction", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: view.organization.id, interactionId: crypto.randomUUID(), action: "create-decision", content: considering, whyNow, outcome, targetConditionIds: view.model.areas.slice(0, 2).map((area) => area.id) }) });
    setSaving(false);
    if (!response.ok) return;
    addEntry({ action: "create-decision", kind: "decision", label: considering, status: "saved" });
    setShowForm(false); setConsidering(""); setWhyNow(""); setOutcome(""); router.refresh();
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <p>Current interaction · Decisions</p>
        <h1>What are we deciding?</h1>
      </header>

      <LivingModelContext model={view.model} activeIds={view.model.areas.slice(0, 2).map((area) => area.id)} />

      <section className={styles.decisionOverview} aria-label="Decision overview">
        <span><strong>{view.counts.active}</strong>Active</span><span><strong>{view.counts.recommended}</strong>Recommended</span><span><strong>{view.counts.review}</strong>Requiring review</span>
        <a href="#active-decisions">Review active decisions</a>
        <button type="button" onClick={() => setShowForm((current) => !current)}>Add decision</button>
      </section>

      {showForm && <form className={styles.decisionForm} onSubmit={(event) => { event.preventDefault(); void createDecision(); }}>
        <label>What are you considering?<textarea rows={2} value={considering} onChange={(event) => setConsidering(event.target.value)} /></label>
        <label>Why now?<textarea rows={2} value={whyNow} onChange={(event) => setWhyNow(event.target.value)} /></label>
        <label>What outcome do you want?<textarea rows={2} value={outcome} onChange={(event) => setOutcome(event.target.value)} /></label>
        <p>Discovery will connect this leadership-added decision to {view.model.areas.slice(0, 2).map((area) => area.label).join(" and ") || "the current Organization Model"}.</p>
        <button type="submit" disabled={!considering.trim() || !whyNow.trim() || saving}>{saving ? "Opening…" : "Open decision"}</button>
      </form>}

      <section id="active-decisions" className={styles.primaryWork} aria-labelledby="primary-work-title">
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
            <span>Source: {view.currentPosition.source}</span>
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
          <ul>{view.otherWork.map((work) => <li key={`${work.title}-${work.status}`}><span>{work.title}</span><small>{work.source} · {work.status}</small></li>)}</ul>
        ) : <p className={styles.emptyWork}>No other Executive Work has been recorded.</p>}
      </section>
    </article>
  );
}
