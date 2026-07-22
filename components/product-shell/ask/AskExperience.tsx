import Link from "next/link";

import type { AskExperienceView as AskView } from "../data/buildAskExperienceView";
import AnswerReasoning from "./AnswerReasoning";
import styles from "./AskExperience.module.css";

export default function AskExperience({ view }: { view: AskView }) {
  return (
    <article className={styles.page}>
      <header className={styles.header}><p>Question the model</p><h1>Ask</h1></header>

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
