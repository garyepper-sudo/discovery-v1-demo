"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductFrontendFixture } from "../../product/frontend";
import type {
  ProductHistoricalAnswerResolution,
  ProductQuestionSummary,
} from "../../product/integration";
import type {
  ProductAnswer,
  ProductImprovementAction,
  ProductModelDimension,
  ProductQuestionWorkspace,
} from "../../product/workflow/contracts";
import styles from "./ProductAlphaExperience.module.css";

type Props = {
  mode: "fixture" | "live-sandbox";
  initialFixtureId?: string;
  fixtures: ProductFrontendFixture[];
  organizationId?: string;
  initialQuestionId?: string;
};

type ProductAlphaSnapshot = {
  contractVersion: "1";
  organizationId: string;
  questions: ProductQuestionSummary[];
  workspace: ProductQuestionWorkspace | null;
  historicalAnswers: ProductHistoricalAnswerResolution[];
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

async function mutationIdempotencyKey(
  organizationId: string,
  command: Record<string, string>,
): Promise<string> {
  const normalizedCommand = Object.fromEntries(
    Object.entries(command).map(([key, value]) => [
      key,
      key === "content" || key === "question"
        ? value.trim().replace(/\s+/g, " ")
        : value,
    ]),
  );
  const canonical = JSON.stringify(
    Object.entries({ organizationId, ...normalizedCommand })
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return `product-alpha:${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
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

export function ProductAlphaExperience({
  mode,
  initialFixtureId,
  fixtures,
  organizationId,
  initialQuestionId,
}: Props) {
  const fixtureMap = useMemo(
    () => new Map(fixtures.map((fixture) => [fixture.id, fixture])),
    [fixtures],
  );
  const [fixtureId, setFixtureId] = useState(initialFixtureId ?? fixtures[0]?.id ?? "");
  const initialFixture = fixtureMap.get(initialFixtureId ?? "") ?? fixtures[0];
  const [liveSnapshot, setLiveSnapshot] = useState<ProductAlphaSnapshot | null>(null);
  const [loading, setLoading] = useState(mode === "live-sandbox");
  const [mutation, setMutation] = useState<"create" | "contribute" | "archive" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newQuestionOpen, setNewQuestionOpen] = useState(false);
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false);
  const [contribution, setContribution] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const fixture = fixtureMap.get(fixtureId) ?? initialFixture;
  const snapshot: ProductAlphaSnapshot | null = mode === "live-sandbox"
    ? liveSnapshot
    : fixture
      ? {
          contractVersion: "1",
          organizationId: fixture.workspace.question.organizationId,
          questions: fixture.questions,
          workspace: fixture.workspace,
          historicalAnswers: fixture.historicalAnswers,
        }
      : null;
  const workspace = snapshot?.workspace ?? null;
  const questions = snapshot?.questions ?? [];
  const historicalAnswers = snapshot?.historicalAnswers ?? [];
  const activeQuestions = questions.filter((question) => question.status !== "archived");
  const archivedQuestions = questions.filter((question) => question.status === "archived");

  async function loadLive(questionId?: string) {
    if (!organizationId) return;
    setLoading(true);
    setError(null);
    const parameters = new URLSearchParams({ organizationId });
    if (questionId) parameters.set("questionId", questionId);
    try {
      const response = await fetch(`/api/product-alpha?${parameters}`, {
        cache: "no-store",
      });
      const body = await response.json() as ProductAlphaSnapshot & { error?: string };
      if (!response.ok) throw new Error(body.error || "Discovery could not load this understanding.");
      setLiveSnapshot(body);
      const selected = body.workspace?.question.id;
      const url = new URL(window.location.href);
      if (selected) url.searchParams.set("questionId", selected);
      else url.searchParams.delete("questionId");
      window.history.replaceState(null, "", url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Discovery could not load this understanding.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "live-sandbox") void loadLive(initialQuestionId);
    // The route identity is fixed for the mounted workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, organizationId, initialQuestionId]);

  async function mutate(command: Record<string, string>) {
    if (!organizationId) return;
    setError(null);
    const kind = command.type as "create" | "contribute" | "archive";
    setMutation(kind);
    try {
      const idempotencyKey = await mutationIdempotencyKey(
        organizationId,
        command,
      );
      const response = await fetch("/api/product-alpha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...command,
          organizationId,
          idempotencyKey,
        }),
      });
      const body = await response.json() as ProductAlphaSnapshot & { error?: string };
      if (!response.ok) throw new Error(body.error || "Discovery could not save this update.");
      setLiveSnapshot(body);
      const selected = body.workspace?.question.id;
      const url = new URL(window.location.href);
      if (selected) url.searchParams.set("questionId", selected);
      else url.searchParams.delete("questionId");
      window.history.replaceState(null, "", url);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Discovery could not save this update.");
      return false;
    } finally {
      setMutation(null);
    }
  }

  if (!workspace && loading) {
    return <main className={styles.app}><section className={styles.workspace}><p>Loading Questions…</p></section></main>;
  }

  if (!workspace && mode === "live-sandbox") {
    return (
      <main className={styles.app} data-mode={mode}>
        <aside className={styles.sidebar} aria-label="Question navigation">
          <div className={styles.brand}><span className={styles.brandMark}>◌</span><span>Discovery</span></div>
        </aside>
        <section className={styles.workspace}>
          <header className={styles.workspaceHeader}>
            <div><span className={styles.eyebrow}>Live sandbox</span><h1>Start with a Question</h1></div>
          </header>
          {error ? <div role="alert" className={styles.boundedMessage}>{error}</div> : null}
          <section className={styles.composer}>
            <label htmlFor="new-question">What do you want Discovery to understand?</label>
            <textarea id="new-question" value={newQuestion} onChange={(event) => setNewQuestion(event.target.value)} />
            <button
              type="button"
              className={styles.primaryButton}
              disabled={!newQuestion.trim() || mutation !== null}
              onClick={async () => {
                if (await mutate({ type: "create", question: newQuestion })) setNewQuestion("");
              }}
            >
              {mutation === "create" ? "Creating Question…" : "Create Question"}
            </button>
          </section>
        </section>
      </main>
    );
  }

  if (!workspace || !fixture && mode === "fixture") return null;
  const answer = workspace.answer?.kind === "answer" ? workspace.answer : null;
  const abstention = workspace.answer?.kind === "abstention" ? workspace.answer : null;
  const primaryImprovement = answer?.bestNextImprovement
    ?? abstention?.bestNextImprovement
    ?? workspace.improvementPlan?.bestNextAction
    ?? null;
  const actionEnabled = (type: string) =>
    workspace?.permittedActions.some((action) => action.type === type && action.enabled) ?? false;

  function transition(action: string, fallback: string) {
    if (mode === "live-sandbox" || !fixture) return;
    const target = fixture.transitions[action] ?? fallback;
    if (fixtureMap.has(target)) setFixtureId(target);
  }

  async function submitContribution() {
    if (!workspace) return;
    if (mode === "live-sandbox") {
      const saved = await mutate({
        type: "contribute",
        questionId: workspace.question.id,
        content: contribution,
      });
      if (!saved) return;
    } else {
      transition("add_information", answer ? "answer-revised" : "moderate-confidence-answer");
    }
    setContribution("");
    setComposerOpen(false);
  }

  return (
    <main className={styles.app} data-mode={mode} data-fixture={mode === "fixture" ? fixture?.id : undefined}>
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
            onClick={() => mode === "live-sandbox" ? setNewQuestionOpen(true) : setFixtureId("new-question")}
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
                  onClick={() => mode === "live-sandbox"
                    ? void loadLive(question.id)
                    : setFixtureId(
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
                <button key={question.id} type="button" onClick={() => mode === "live-sandbox" ? void loadLive(question.id) : setFixtureId("archived-question")}>
                  {question.title}
                </button>
              ))}
            </details>
          ) : null}
        </nav>
        {mode === "fixture" && fixture ? <label className={styles.fixtureSelect}>
          <span>Review fixture</span>
          <select value={fixture.id} onChange={(event) => setFixtureId(event.target.value)}>
            {fixtures.map((item) => (
              <option value={item.id} key={item.id}>{item.label}</option>
            ))}
          </select>
        </label> : <span className={styles.fixtureSelect}>Local sandbox</span>}
      </aside>

      <section className={styles.workspace}>
        <header className={styles.workspaceHeader}>
          <button
            className={styles.mobileQuestions}
            type="button"
            aria-expanded={questionPickerOpen}
            aria-controls="mobile-question-picker"
            onClick={() => {
              if (mode === "fixture" && questions.length === 1) setFixtureId("multiple-questions");
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
            {mode === "live-sandbox" ? (
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={mutation !== null}
                onClick={() => void mutate({ type: "archive", questionId: workspace.question.id })}
              >
                {mutation === "archive" ? "Archiving…" : "Archive"}
              </button>
            ) : null}
          </div>
        </header>

        {questionPickerOpen ? (
          <nav id="mobile-question-picker" className={styles.mobilePicker} aria-label="Select a Question">
            {questions.map((question) => (
              <button
                type="button"
                key={question.id}
                onClick={() => {
                  if (mode === "live-sandbox") void loadLive(question.id);
                  else setFixtureId(
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
            {error ? (
              <div role="alert" className={styles.boundedMessage}>
                {error} <button type="button" onClick={() => void loadLive(workspace.question.id)}>Reload</button>
              </div>
            ) : null}
            {newQuestionOpen ? (
              <section className={styles.composer} aria-labelledby="new-question-heading">
                <h2 id="new-question-heading">Create a Question</h2>
                <textarea
                  value={newQuestion}
                  onChange={(event) => setNewQuestion(event.target.value)}
                  aria-label="New Question"
                />
                <div className={styles.fixtureActions}>
                  <button type="button" onClick={() => setNewQuestionOpen(false)}>Cancel</button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={!newQuestion.trim() || mutation !== null}
                    onClick={async () => {
                      if (await mutate({ type: "create", question: newQuestion })) {
                        setNewQuestion("");
                        setNewQuestionOpen(false);
                      }
                    }}
                  >
                    {mutation === "create" ? "Creating Question…" : "Create Question"}
                  </button>
                </div>
              </section>
            ) : null}
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
                  {mode === "fixture" ? <button type="button" onClick={() => setContribution("Release-review notes show approval waiting before each missed commitment.")}>
                    Use upload fixture
                  </button> : null}
                  {mode === "fixture" ? <button type="button" onClick={() => setContribution("The release approver described where handoffs wait and why.")}>
                    Use interview fixture
                  </button> : null}
                  <button type="button" onClick={() => setComposerOpen(false)}>Cancel</button>
                  <button type="button" className={styles.primaryButton} disabled={!contribution.trim() || mutation !== null} onClick={() => void submitContribution()}>
                    {mutation === "contribute" ? "Updating this understanding…" : "Add to this Question"}
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
                  {mode === "fixture" && actionEnabled("create_decision") ? (
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
                  {mode === "fixture" && !workspace.latestOutcomeReview && actionEnabled("review_outcome") ? (
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
                  {historicalAnswers.map((historical) => historical.status === "resolved" ? (
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
