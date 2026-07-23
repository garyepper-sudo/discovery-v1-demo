"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import type { AskExperienceView as AskView } from "../data/buildAskExperienceView";
import AnswerReasoning from "./AnswerReasoning";
import styles from "./AskExperience.module.css";
import AskComposer from "./AskComposer";
import LivingModelContext from "../shared/LivingModelContext";
import { useInteractionSession } from "../shared/InteractionSession";
import { buildProductHref } from "../data/productOrganization";

export default function AskExperience({ view, initialPrompt = "" }: { view: AskView; initialPrompt?: string }) {
  const [input, setInput] = useState(initialPrompt);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { entries, addEntry } = useInteractionSession();
  const router = useRouter();

  function brainstorm() {
    const normalized = input.trim();
    if (!normalized) return;
    setCandidate(normalized);
    addEntry({ action: "brainstorm", kind: "discussion", label: normalized, status: "provisional" });
    setInput("");
  }

  async function saveCandidate() {
    if (!candidate) return;
    setSaving(true);
    const response = await fetch("/api/product-interaction", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: view.organization.id, interactionId: crypto.randomUUID(), action: "save-insight", content: candidate }) });
    setSaving(false);
    if (!response.ok) return;
    addEntry({ action: "save-insight", kind: "observation", label: candidate, status: "saved" });
    router.refresh();
  }

  return (
    <article className={styles.page}>
      <header className={styles.header}><p>Current interaction · Think</p><h1>What are you thinking about?</h1></header>

      <LivingModelContext model={view.model} activeIds={view.model.areas.slice(0, 2).map((area) => area.id)} />

      <AskComposer value={input} onChange={setInput} onSubmit={(event) => { event.preventDefault(); brainstorm(); }} />

      <section className={styles.thinkContext} aria-label="Think context">
        <div><p>Suggested prompts</p><ul>{[view.nextQuestion?.text, ...view.otherQuestions.map((item) => item.text)].filter((item): item is string => Boolean(item)).slice(0, 3).map((item) => <li key={item}><button type="button" onClick={() => setInput(item)}>{item}</button></li>)}</ul></div>
        <div><p>Recent conversations</p>{entries.filter((entry) => entry.kind === "discussion").length ? <ul>{entries.filter((entry) => entry.kind === "discussion").slice(-3).reverse().map((entry) => <li key={entry.id}>{entry.label}</li>)}</ul> : <span>No conversations in this session yet.</span>}</div>
      </section>

      {candidate && <section className={styles.candidate} aria-label="Provisional model candidate">
        <p>Discovery is considering this</p><h2>{candidate}</h2>
        <span>This remains provisional until you choose a durable action.</span>
        <div>
          <button type="button" disabled={saving} onClick={() => void saveCandidate()}>Add to model</button>
          <button type="button" disabled={saving} onClick={() => void saveCandidate()}>Save as insight</button>
          <button type="button" onClick={() => router.push(buildProductHref("/decisions", view.organization.id))}>Create decision</button>
          <button type="button" onClick={() => addEntry({ action: "stress-test", kind: "discussion", label: `Stress test later: ${candidate}`, status: "provisional" })}>Stress test later</button>
        </div>
      </section>}

      <section className={styles.primaryQuestion} aria-labelledby="current-question-title">
        <div className={styles.questionMeta}><p>Current question</p></div>
        <h2 id="current-question-title">{view.question?.text ?? "Discovery has not yet identified its highest-priority question."}</h2>
        {view.question?.context && <p className={styles.updateStatus}>{view.question.context}</p>}
      </section>

      <section className={styles.answer} aria-labelledby="discovery-answer-title">
        <p className={styles.eyebrow}>Discovery&apos;s answer</p>
        <h2 id="discovery-answer-title">{view.answer?.headline ?? "Discovery has not yet formed a grounded answer."}</h2>
        {view.answer?.summary && <p className={styles.answerSummary}>{view.answer.summary}</p>}
        <AnswerReasoning reasoning={view.reasoning} />
      </section>

      {view.uncertainty.length > 0 && (
        <section className={styles.challenge} aria-labelledby="challenge-title">
          <div className={styles.sectionIntroduction}><p className={styles.eyebrow}>Remaining uncertainty</p><h2 id="challenge-title">What Discovery still cannot determine.</h2></div>
          <div className={styles.challengeOptions}>
            {view.uncertainty.map((item) => <details key={item.statement}><summary><span>{item.statement}</span><i aria-hidden="true" /></summary>{item.evidenceRequest && <p>{item.evidenceRequest}</p>}</details>)}
          </div>
        </section>
      )}

      <section className={styles.betterQuestions} aria-labelledby="better-question-title">
        <div className={styles.sectionIntroduction}>
          <p className={styles.eyebrow}>A useful next question</p>
          <h2 id="better-question-title">{view.nextQuestion?.text ?? "Discovery has not yet identified a grounded follow-up question."}</h2>
          {view.nextQuestion?.rationale && <p className={styles.nextRationale}>{view.nextQuestion.rationale}</p>}
          {view.nextQuestion && <Link href={view.nextQuestion.destination}>Investigate this question</Link>}
        </div>
        {view.otherQuestions.length > 0 && <ul aria-label="Other useful questions">{view.otherQuestions.map((item) => <li key={item.text}><Link href={item.destination}>{item.text}</Link></li>)}</ul>}
      </section>

      <section className={styles.outcome} aria-labelledby="continue-title">
        <p className={styles.eyebrow}>Continue through the model</p>
        <h2 id="continue-title">Use the current answer where it matters.</h2>
        <div>{view.navigation.map((item) => <Link key={item.label} href={item.destination}>{item.label}</Link>)}</div>
      </section>
    </article>
  );
}
