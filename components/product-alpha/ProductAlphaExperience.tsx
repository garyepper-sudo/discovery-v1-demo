"use client";

import { useMemo, useState } from "react";
import type { ProductFrontendFixture } from "../../product/frontend";
import type {
  ProductAnswer,
  ProductImprovementAction,
  ProductModelDimension,
} from "../../product/workflow/contracts";
import styles from "./ProductAlphaExperience.module.css";

type Props = {
  initialFixtureId: string;
  fixtures: ProductFrontendFixture[];
};

const statusText: Record<string, string> = {
  created: "New",
  searching: "Reviewing information",
  answered: "Answered",
  improving: "Improving",
  decision_in_progress: "Decision in progress",
  monitoring: "Monitoring",
  archived: "Archived",
};

function displayDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value));
}

function supportLabel(answer: ProductAnswer): string {
  return `${answer.confidence.level.charAt(0).toUpperCase()}${answer.confidence.level.slice(1)} support`;
}

function ModelDimension({ name, dimension }: {
  name: string;
  dimension: ProductModelDimension;
}) {
  return (
    <li className={styles.dimension}>
      <span>
        <strong>{name}</strong>
        <small>{dimension.meaning}</small>
      </span>
      <span className={styles.dimensionStatus}>{dimension.status}</span>
      {dimension.limiter ? <p>{dimension.limiter}</p> : null}
    </li>
  );
}

function Improvement({ action, onUse }: {
  action: ProductImprovementAction | null;
  onUse: () => void;
}) {
  if (!action) {
    return (
      <div className={styles.boundedMessage}>
        No supported improvement action is available yet.
      </div>
    );
  }
  return (
    <div className={styles.improvement}>
      <div>
        <span className={styles.eyebrow}>Best way to improve this</span>
        <h3>{action.title}</h3>
        <p>{action.reason}</p>
        <small>
          Expected contribution: {action.expectedGain}
          {action.limitation ? ` · ${action.limitation}` : ""}
        </small>
      </div>
      {action.executable ? (
        <button type="button" className={styles.secondaryButton} onClick={onUse}>
          Add information
        </button>
      ) : (
        <span className={styles.unavailable}>Not currently available</span>
      )}
    </div>
  );
}

export function ProductAlphaExperience({ initialFixtureId, fixtures }: Props) {
  const fixtureMap = useMemo(
    () => new Map(fixtures.map((fixture) => [fixture.id, fixture])),
    [fixtures],
  );
  const [fixtureId, setFixtureId] = useState(initialFixtureId);
  const [composerOpen, setComposerOpen] = useState(false);
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false);
  const [contribution, setContribution] = useState("");
  const fixture = fixtureMap.get(fixtureId) ?? fixtures[0]!;
  const { workspace } = fixture;
  const answer = workspace.answer?.kind === "answer" ? workspace.answer : null;
  const abstention = workspace.answer?.kind === "abstention" ? workspace.answer : null;
  const activeQuestions = fixture.questions.filter((question) => question.status !== "archived");
  const archivedQuestions = fixture.questions.filter((question) => question.status === "archived");
  const primaryImprovement = answer?.bestNextImprovement
    ?? abstention?.bestNextImprovement
    ?? workspace.improvementPlan?.bestNextAction
    ?? null;

  function transition(action: string, fallback: string) {
    const target = fixture.transitions[action] ?? fallback;
    if (fixtureMap.has(target)) setFixtureId(target);
  }

  function submitContribution() {
    transition("add_information", answer ? "answer-revised" : "moderate-confidence-answer");
    setContribution("");
    setComposerOpen(false);
  }

  return (
    <main className={styles.app} data-fixture={fixture.id}>
      <aside className={styles.sidebar} aria-label="Question navigation">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">◌</span>
          <span>Discovery</span>
        </div>
        <div className={styles.sidebarHeader}>
          <span>Questions</span>
          <button
            type="button"
            aria-label="Review new Question state"
            onClick={() => setFixtureId("new-question")}
          >
            +
          </button>
        </div>
        <nav>
          <ul className={styles.questionList}>
            {activeQuestions.map((question) => (
              <li key={question.id}>
                <button
                  type="button"
                  className={question.id === workspace.question.id ? styles.questionActive : ""}
                  onClick={() => setFixtureId(
                    question.id === "question-retention"
                      ? "answer-abstention"
                      : question.id === "question-approval"
                        ? "decision-committed"
                        : question.id === "question-cycle-time"
                          ? "outcome-working"
                          : "high-confidence-answer"
                  )}
                >
                  <span>{question.title}</span>
                  <small>
                    {statusText[question.status]} · {question.currentSupport}
                    {question.hasUnresolvedChange ? " · Changed" : ""}
                  </small>
                </button>
              </li>
            ))}
          </ul>
          {archivedQuestions.length ? (
            <details className={styles.archived}>
              <summary>Archived ({archivedQuestions.length})</summary>
              {archivedQuestions.map((question) => (
                <button key={question.id} type="button" onClick={() => setFixtureId("archived-question")}>
                  {question.title}
                </button>
              ))}
            </details>
          ) : null}
        </nav>
        <label className={styles.fixtureSelect}>
          <span>Review fixture</span>
          <select value={fixture.id} onChange={(event) => setFixtureId(event.target.value)}>
            {fixtures.map((item) => (
              <option value={item.id} key={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <button
            className={styles.mobileQuestions}
            type="button"
            aria-expanded={questionPickerOpen}
            aria-controls="mobile-question-picker"
            onClick={() => {
              if (fixture.questions.length === 1) setFixtureId("multiple-questions");
              setQuestionPickerOpen((open) => !open);
            }}
          >
            Questions
          </button>
          <div>
            <span className={styles.eyebrow}>Organizational Question</span>
            <h1>{workspace.question.title}</h1>
            <p>
              {statusText[workspace.question.status] ?? workspace.question.status}
              {" · "}
              Updated {displayDate(workspace.question.updatedAt)}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.primaryButton} onClick={() => setComposerOpen(true)}>
              Add information
            </button>
          </div>
        </header>

        {questionPickerOpen ? (
          <nav id="mobile-question-picker" className={styles.mobilePicker} aria-label="Select a Question">
            {fixture.questions.map((question) => (
              <button
                type="button"
                key={question.id}
                onClick={() => {
                  setFixtureId(
                    question.id === "question-retention"
                      ? "answer-abstention"
                      : question.id === "question-approval"
                        ? "decision-committed"
                        : question.id === "question-cycle-time"
                          ? "outcome-working"
                          : question.status === "archived"
                            ? "archived-question"
                            : "high-confidence-answer",
                  );
                  setQuestionPickerOpen(false);
                }}
              >
                <span>{question.title}</span>
                <small>{statusText[question.status]} · {question.currentSupport}</small>
              </button>
            ))}
          </nav>
        ) : null}

        <div className={styles.contentGrid}>
          <div className={styles.primaryColumn}>
            <section className={styles.answerBlock} aria-labelledby="current-understanding">
              <span className={styles.eyebrow}>Current understanding</span>
              {answer ? (
                <>
                  <h2 id="current-understanding">{answer.conclusion}</h2>
                  <div className={styles.supportLine}>
                    <span className={`${styles.support} ${styles[answer.confidence.level]}`}>
                      {supportLabel(answer)}
                    </span>
                    <span>Confidence applies to this Answer</span>
                  </div>
                  <p className={styles.why}>{answer.whyItMatters}</p>
                </>
              ) : abstention ? (
                <>
                  <h2 id="current-understanding">Discovery does not yet have a supported Answer.</h2>
                  <p className={styles.why}>{abstention.explanation}</p>
                  <div className={styles.abstentionReason}>
                    <strong>What is missing</strong>
                    <span>{abstention.principalLimiter}</span>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="current-understanding">This Question is ready for information.</h2>
                  <p className={styles.why}>No Answer has been formed.</p>
                </>
              )}
            </section>

            {workspace.latestChange ? (
              <section className={styles.change} aria-labelledby="latest-change">
                <span className={styles.eyebrow}>Latest change</span>
                <h3 id="latest-change">{workspace.latestChange.summary}</h3>
                <p>
                  {workspace.latestChange.primaryChange.replaceAll("_", " ")}
                  {workspace.latestChange.previousAnswerRevision !== null
                    ? ` · Revision ${workspace.latestChange.previousAnswerRevision} → ${workspace.latestChange.currentAnswerRevision}`
                    : ""}
                </p>
              </section>
            ) : null}

            <section className={styles.section}>
              <Improvement action={primaryImprovement} onUse={() => setComposerOpen(true)} />
            </section>

            {composerOpen ? (
              <section className={styles.composer} aria-labelledby="teach-discovery">
                <div>
                  <span className={styles.eyebrow}>Improve this understanding</span>
                  <h2 id="teach-discovery">Add authorized information</h2>
                  <p>Your contribution stays attached to this Question.</p>
                </div>
                <textarea
                  value={contribution}
                  onChange={(event) => setContribution(event.target.value)}
                  placeholder="Paste a relevant observation, note, or finding…"
                  aria-label="Information to add"
                />
                <div className={styles.fixtureActions}>
                  <button type="button" onClick={() => setContribution("Release-review notes show approval waiting before each missed commitment.")}>
                    Use upload fixture
                  </button>
                  <button type="button" onClick={() => setContribution("The release approver described where handoffs wait and why.")}>
                    Use interview fixture
                  </button>
                  <button type="button" onClick={() => setComposerOpen(false)}>Cancel</button>
                  <button type="button" className={styles.primaryButton} disabled={!contribution.trim()} onClick={submitContribution}>
                    Add to this Question
                  </button>
                </div>
              </section>
            ) : null}

            <section className={styles.section} aria-labelledby="decision">
              <span className={styles.eyebrow}>Decision and outcome</span>
              <h2 id="decision">
                {workspace.activeDecision
                  ? "A Decision is being tracked"
                  : workspace.decisionDraft
                    ? "A Decision draft is available"
                    : "No Decision has been created"}
              </h2>
              {workspace.decisionDraft ? (
                <div className={styles.decision}>
                  <h3>{workspace.decisionDraft.title}</h3>
                  <p>{workspace.decisionDraft.intervention}</p>
                  <p>{workspace.decisionDraft.rationale}</p>
                  <strong>{workspace.decisionDraft.readiness.replaceAll("_", " ")}</strong>
                  {workspace.decisionDraft.readinessLimiter ? <small>{workspace.decisionDraft.readinessLimiter}</small> : null}
                  {workspace.decisionDraft.readiness !== "not_ready" ? (
                    <button type="button" className={styles.secondaryButton} onClick={() => transition("create_decision", "decision-committed")}>
                      Review commitment fixture
                    </button>
                  ) : null}
                </div>
              ) : null}
              {workspace.activeDecision ? (
                <div className={styles.decision}>
                  <h3>{workspace.activeDecision.intervention}</h3>
                  <p>
                    Owner: {workspace.activeDecision.owner?.label ?? "Not specified"}
                    {" · "}
                    Review: {workspace.activeDecision.reviewDate ? displayDate(workspace.activeDecision.reviewDate) : "Not specified"}
                  </p>
                  {workspace.activeDecision.expectedOutcomes.map((outcome) => (
                    <p key={outcome.id}>Expected: {outcome.description}</p>
                  ))}
                  {!workspace.latestOutcomeReview ? (
                    <button type="button" className={styles.secondaryButton} onClick={() => transition("review_outcome", "outcome-too-early")}>
                      Review outcome fixture
                    </button>
                  ) : null}
                </div>
              ) : null}
              {workspace.latestOutcomeReview ? (
                <div className={styles.outcome}>
                  <strong>{workspace.latestOutcomeReview.status.replaceAll("_", " ")}</strong>
                  <p>{workspace.latestOutcomeReview.interpretation}</p>
                  {workspace.latestOutcomeReview.comparisons.map((comparison) => (
                    <p key={comparison.expectedOutcomeId}>
                      Expected: {comparison.expected}<br />
                      Observed: {comparison.observed}
                    </p>
                  ))}
                  {workspace.latestOutcomeReview.nextReviewDate
                    ? <small>Next review: {displayDate(workspace.latestOutcomeReview.nextReviewDate)}</small>
                    : null}
                </div>
              ) : null}
            </section>

            <details className={styles.disclosure}>
              <summary>Evidence, alternatives, and history</summary>
              <div className={styles.disclosureContent}>
                <section>
                  <h3>Evidence</h3>
                  {answer?.discriminatingEvidence.length
                    ? answer.discriminatingEvidence.map((point) => (
                      <article key={point.id}>
                        <strong>{point.role}</strong>
                        <p>{point.statement}</p>
                        {point.sourceLabel ? <small>{point.sourceLabel}</small> : null}
                      </article>
                    ))
                    : <p>No customer-safe evidence detail is available.</p>}
                </section>
                <section>
                  <h3>What remains uncertain</h3>
                  <p>{answer?.principalLimiter ?? abstention?.principalLimiter ?? "No bounded uncertainty statement is available."}</p>
                  {answer?.unresolvedAlternatives.map((alternative) => (
                    <article key={alternative.id}>
                      <p>{alternative.explanation}</p>
                      <small>{alternative.basis}</small>
                    </article>
                  ))}
                </section>
                <section>
                  <h3>History</h3>
                  {fixture.historicalAnswers.map((historical) => historical.status === "resolved" ? (
                    <article key={historical.answerId}>
                      <strong>Revision {historical.questionRevision}</strong>
                      <p>{historical.conclusion}</p>
                      <small>{historical.confidence.level} support at that revision</small>
                    </article>
                  ) : (
                    <article key={historical.answerId}>
                      <strong>Revision {historical.questionRevision}</strong>
                      <p>An earlier Answer existed. Its content is not shown because it cannot be resolved safely.</p>
                    </article>
                  ))}
                  {workspace.question.timeline.length
                    ? workspace.question.timeline.map((entry) => <p key={entry.id}>{displayDate(entry.timestamp)} · {entry.label}</p>)
                    : <p>No additional history is available.</p>}
                </section>
              </div>
            </details>
          </div>

          <aside className={styles.model} aria-label="Organizational Model state">
            <div className={`${styles.modelPresence} ${styles[workspace.modelState.developmentalState]}`}>
              <span aria-hidden="true">◌</span>
            </div>
            <span className={styles.eyebrow}>Organizational Model</span>
            <h2>{workspace.modelState.developmentalState}</h2>
            <p>
              Revision {workspace.modelState.revision}. Model state reflects the authorized product projection, not evidence volume.
            </p>
            <ul>
              <ModelDimension name="Coverage" dimension={workspace.modelState.dimensions.coverage} />
              <ModelDimension name="Coherence" dimension={workspace.modelState.dimensions.coherence} />
              <ModelDimension name="Freshness" dimension={workspace.modelState.dimensions.freshness} />
              <ModelDimension name="Trustworthiness" dimension={workspace.modelState.dimensions.trustworthiness} />
            </ul>
            {workspace.modelState.tensions.map((tension) => (
              <div className={styles.tension} key={tension.id}>
                <strong>Active tension</strong>
                <p>{tension.statement}</p>
              </div>
            ))}
            {workspace.proactiveInsights.length ? (
              <div className={styles.insight}>
                <span className={styles.eyebrow}>New Insight</span>
                <h3>{workspace.proactiveInsights[0]!.title}</h3>
                <p>{workspace.proactiveInsights[0]!.conclusion}</p>
                <small>{workspace.proactiveInsights[0]!.whyItMatters}</small>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
