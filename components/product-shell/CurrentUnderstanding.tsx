"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CurrentUnderstanding.module.css";
import ExploreTogether from "./ExploreTogether";
import OrganizationModel from "./OrganizationModel";
import SinceLastVisit from "./SinceLastVisit";
import type { OrganizationExperienceView } from "./data/buildOrganizationExperienceView";
import { buildProductHref } from "./data/productOrganization";
import { useInteractionSession } from "./shared/InteractionSession";

type CurrentUnderstandingProps = {
  view: OrganizationExperienceView;
};

export default function CurrentUnderstanding({ view }: CurrentUnderstandingProps) {
  const understanding = view.currentUnderstanding;
  const router = useRouter();
  const { addEntry } = useInteractionSession();
  const [mode, setMode] = useState<"add-context" | "challenge" | null>(null);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const insights = view.insights;

  async function commit(action: "add-context" | "challenge" | "save-insight", content: string) {
    setSaving(true);
    const response = await fetch("/api/product-interaction", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: view.organization.id, interactionId: crypto.randomUUID(), action, content }) });
    setSaving(false);
    if (!response.ok) return;
    addEntry({ action, kind: "observation", label: content, status: "saved" });
    setMode(null);
    setInput("");
    router.refresh();
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <p>Current interaction · Insights</p>
        <h1>What should I know?</h1>
      </header>

      <OrganizationModel model={view.model} />

      <section
        className={styles.understanding}
        aria-labelledby="current-understanding-title"
      >
        <div className={styles.labelRow}>
          <p>Current understanding</p>

          <p className={styles.confidence}>
            <span aria-hidden="true" />
            {understanding.confidenceLabel}
          </p>
        </div>

        <h2 id="current-understanding-title">
          {understanding.headline}
        </h2>

        <p className={styles.explanation}>
          {understanding.explanation}
        </p>

        <ul className={styles.insightList} aria-label="Surfaced insights">
          {insights.map((insight, index) => <li key={insight} className={index === 0 ? styles.selectedInsight : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{insight}</li>)}
        </ul>

        <div className={styles.actions}>
          <a href="#insight-reasoning">Explore</a>
          <button type="button" onClick={() => setMode("add-context")}>Add context</button>
          <button type="button" onClick={() => setMode("challenge")}>Challenge</button>
          <button type="button" onClick={() => { addEntry({ action: "brainstorm", kind: "discussion", label: understanding.headline, status: "provisional" }); router.push(buildProductHref("/ask", view.organization.id)); }}>Brainstorm</button>
        </div>

        {mode && <form id="teach-discovery" className={styles.contextForm} onSubmit={(event) => { event.preventDefault(); void commit(mode, input); }}>
          <label htmlFor="insight-context">{mode === "challenge" ? "What does Discovery have wrong?" : "What context is missing?"}</label>
          <textarea id="insight-context" value={input} onChange={(event) => setInput(event.target.value)} rows={3} />
          <button type="submit" disabled={!input.trim() || saving}>{saving ? "Updating…" : "Add to Organization Model"}</button>
        </form>}

        <details id="insight-reasoning" className={styles.disclosure}>
          <summary>
            <span>Why Discovery believes this</span>
            <i aria-hidden="true" />
          </summary>

          <div className={styles.rationale}>
            <section className={styles.reasoning}>
              <h3>Discovery&apos;s reasoning</h3>
              <p>
                {understanding.reasoning}
              </p>
            </section>

            {understanding.observations.length > 0 && (
              <section className={styles.observations}>
                <h3>Observed patterns</h3>
                <ul>
                  {understanding.observations.map((observation) => (
                    <li key={observation}>{observation}</li>
                  ))}
                </ul>
              </section>
            )}

            {(understanding.confidenceRationale || understanding.missingEvidence) && (
              <section className={styles.confidenceDetail}>
                <h3>Confidence</h3>
                <p>
                  <strong>{understanding.confidenceLabel}.</strong>{" "}
                  {understanding.confidenceRationale}
                </p>
                {understanding.missingEvidence && (
                  <p>Still needed: {understanding.missingEvidence}</p>
                )}
              </section>
            )}

            <section className={styles.counterEvidence}>
              <h3>What would change Discovery&apos;s view</h3>
              <p>
                {understanding.falsificationCondition}
              </p>
            </section>
          </div>
        </details>
      </section>

      <SinceLastVisit changes={view.changes} />
      <ExploreTogether exploration={view.exploration} />
    </article>
  );
}
