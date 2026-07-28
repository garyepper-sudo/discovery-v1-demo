"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { buildProductHref } from "../product-shell/data/productOrganization";
import styles from "./DiscoveryOnboardingExperience.module.css";

type OnboardingStage =
  | "intent"
  | "organization-context"
  | "evidence-plan"
  | "processing"
  | "first-understanding";

type InitialUnderstanding = {
  finding: string;
  uncertainty: string;
  nextEvidence: string[];
  confidence: {
    state: "unavailable";
    label: string;
  };
};

type DiscoveryLabSuccess = {
  status: "complete";
  organizationId: string;
  initialUnderstanding: InitialUnderstanding;
};

type DiscoveryLabFailure = {
  status: "validation-failed" | "insufficient-evidence" | "access-denied" | "failed";
  message: string;
  organizationId?: string;
};

type EvidenceRecommendation = {
  title: string;
  purpose: string;
  importance: "Recommended" | "Optional";
};

type OnboardingDraft = {
  stage: Exclude<OnboardingStage, "processing" | "first-understanding">;
  organizationId: string | null;
  onboardingRequestId: string;
  question: string;
  company: string;
  industry: string;
  website: string;
  observations: string;
};

const draftStorageKey = "discovery:onboarding-question-first:v1";

const processingSteps = [
  "Organizing your question",
  "Preserving your evidence",
  "Looking for supported patterns",
  "Building an initial understanding",
  "Identifying what remains unknown",
];

const intentExamples = [
  "Why are sales slowing?",
  "Why are projects getting delayed?",
  "Where are decisions getting stuck?",
  "Why is customer retention declining?",
  "What should we understand before making this decision?",
];

function recommendationsFor(question: string): EvidenceRecommendation[] {
  const normalized = question.toLowerCase();
  if (/(sales|pipeline|revenue|growth)/.test(normalized)) {
    return [
      {
        title: "Sales trend or pipeline report",
        purpose: "Clarifies when performance changed and where momentum was lost.",
        importance: "Recommended",
      },
      {
        title: "Customer loss reasons",
        purpose: "Helps distinguish demand, product, pricing, and execution explanations.",
        importance: "Recommended",
      },
      {
        title: "Pricing or promotion changes",
        purpose: "Tests whether commercial changes align with the slowdown.",
        importance: "Optional",
      },
    ];
  }
  if (/(project|delay|delivery|release|execution)/.test(normalized)) {
    return [
      {
        title: "Delivery timeline or work log",
        purpose: "Shows where work waits, changes direction, or misses a handoff.",
        importance: "Recommended",
      },
      {
        title: "Decision and approval notes",
        purpose: "Clarifies ownership, escalation, and approval dependencies.",
        importance: "Recommended",
      },
      {
        title: "Recent retrospective",
        purpose: "Adds the team’s explanation of recurring delivery friction.",
        importance: "Optional",
      },
    ];
  }
  if (/(retention|customer|churn)/.test(normalized)) {
    return [
      {
        title: "Retention trend",
        purpose: "Clarifies which customers changed behavior and when.",
        importance: "Recommended",
      },
      {
        title: "Customer feedback or loss notes",
        purpose: "Adds direct evidence about why customers stay or leave.",
        importance: "Recommended",
      },
      {
        title: "Product or service changes",
        purpose: "Tests whether experience changes align with retention movement.",
        importance: "Optional",
      },
    ];
  }
  if (/(decision|approval|stuck|authority)/.test(normalized)) {
    return [
      {
        title: "Decision log or approval path",
        purpose: "Shows where authority sits and where decisions wait.",
        importance: "Recommended",
      },
      {
        title: "Role and ownership notes",
        purpose: "Clarifies expected ownership across the people involved.",
        importance: "Recommended",
      },
      {
        title: "A recent decision example",
        purpose: "Adds a concrete case that can confirm or challenge the pattern.",
        importance: "Optional",
      },
    ];
  }
  return [
    {
      title: "A recent concrete example",
      purpose: "Helps Discovery distinguish a recurring pattern from a general concern.",
      importance: "Recommended",
    },
    {
      title: "Relevant operating notes or measures",
      purpose: "Adds observable evidence connected to your question.",
      importance: "Recommended",
    },
    {
      title: "A different perspective",
      purpose: "Could challenge assumptions and expose an alternative explanation.",
      importance: "Optional",
    },
  ];
}

function safeFailure(status: number, body: DiscoveryLabFailure | null): string {
  if (status === 422 || body?.status === "insufficient-evidence") {
    return "Discovery needs a little more concrete context. Add specific observations, changes, dependencies, or examples connected to your question.";
  }
  if (status === 400 || body?.status === "validation-failed") {
    return "Review the highlighted information and try again.";
  }
  if (status === 401 || status === 403 || body?.status === "access-denied") {
    return "Your local onboarding session could not be verified. Sign in again, then retry.";
  }
  return "Discovery could not complete this investigation. Your information is preserved, so you can safely try again.";
}

export default function DiscoveryOnboardingExperience({
  initialOrganizationId,
}: {
  initialOrganizationId?: string;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<OnboardingStage>("intent");
  const [organizationId, setOrganizationId] =
    useState<string | null>(initialOrganizationId ?? null);
  const [onboardingRequestId, setOnboardingRequestId] =
    useState(() => crypto.randomUUID());
  const [question, setQuestion] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [observations, setObservations] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InitialUnderstanding | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const recommendations = useMemo(
    () => recommendationsFor(question),
    [question],
  );

  useEffect(() => {
    const serialized = window.sessionStorage.getItem(draftStorageKey);
    if (serialized) {
      try {
        const draft = JSON.parse(serialized) as OnboardingDraft;
        const canRestore =
          (!initialOrganizationId && !draft.organizationId) ||
          (initialOrganizationId &&
            draft.organizationId === initialOrganizationId);
        if (canRestore) {
          setStage(draft.stage);
          setOrganizationId(draft.organizationId);
          setOnboardingRequestId(draft.onboardingRequestId);
          setQuestion(draft.question);
          setCompany(draft.company);
          setIndustry(draft.industry);
          setWebsite(draft.website);
          setObservations(draft.observations);
        } else {
          window.sessionStorage.removeItem(draftStorageKey);
          setOrganizationId(initialOrganizationId ?? null);
        }
      } catch {
        window.sessionStorage.removeItem(draftStorageKey);
      }
    }
    setDraftReady(true);
  }, [initialOrganizationId]);

  useEffect(() => {
    if (!draftReady || stage === "processing" || stage === "first-understanding") {
      return;
    }
    const draft: OnboardingDraft = {
      stage,
      organizationId,
      onboardingRequestId,
      question,
      company,
      industry,
      website,
      observations,
    };
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    company,
    draftReady,
    industry,
    observations,
    onboardingRequestId,
    organizationId,
    question,
    stage,
    website,
  ]);

  useEffect(() => {
    if (stage !== "intent") {
      stageHeadingRef.current?.focus();
    }
  }, [stage]);

  useEffect(
    () => () => {
      requestController.current?.abort();
    },
    [],
  );

  function advanceIntent() {
    if (!question.trim()) {
      setFieldErrors({ question: "Enter the question you want Discovery to investigate." });
      return;
    }
    setFieldErrors({});
    setStage("organization-context");
  }

  function advanceContext() {
    const nextErrors: Record<string, string> = {};
    if (!company.trim()) {
      nextErrors.company = "Enter an organization name.";
    }
    if (!observations.trim()) {
      nextErrors.observations =
        "Share at least one concrete observation connected to your question.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setStage("evidence-plan");
    }
  }

  async function runInvestigation() {
    if (submitting) return;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setSubmitting(true);
    setError(null);
    setStage("processing");

    try {
      const response = await fetch("/api/discovery-lab", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          onboardingRequestId,
          company: company.trim(),
          website: website.trim(),
          industry: industry.trim(),
          question: question.trim(),
          messyInput: observations.trim(),
        }),
      });
      const body = await response.json().catch(() => null) as
        | DiscoveryLabSuccess
        | DiscoveryLabFailure
        | null;
      if (!response.ok || !body || body.status !== "complete") {
        throw {
          userMessage: safeFailure(
            response.status,
            body && body.status !== "complete" ? body : null,
          ),
          organizationId:
            body && "organizationId" in body ? body.organizationId : undefined,
        };
      }
      setOrganizationId(body.organizationId);
      setResult(body.initialUnderstanding);
      window.sessionStorage.removeItem(draftStorageKey);
      setStage("first-understanding");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      const failure = caught as {
        userMessage?: string;
        organizationId?: string;
      };
      if (failure.organizationId) {
        setOrganizationId(failure.organizationId);
      }
      setError(
        failure.userMessage ??
          "Discovery could not complete this investigation. Your information is preserved, so you can safely try again.",
      );
      setStage("evidence-plan");
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false);
      }
      if (requestController.current === controller) {
        requestController.current = null;
      }
    }
  }

  function openDiscovery() {
    if (!organizationId) return;
    router.push(buildProductHref("/your-organization", organizationId));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">✦</span>
          <span>Discovery</span>
        </div>
        <p>Evidence-backed organizational understanding</p>
      </header>

      <section className={styles.experience} aria-live="polite">
        <nav className={styles.progress} aria-label="Onboarding progress">
          {["Question", "Context", "Evidence", "Understanding"].map((label, index) => {
            const stageIndex = {
              intent: 0,
              "organization-context": 1,
              "evidence-plan": 2,
              processing: 3,
              "first-understanding": 3,
            }[stage];
            return (
              <span
                key={label}
                className={index <= stageIndex ? styles.progressActive : undefined}
              >
                {label}
              </span>
            );
          })}
        </nav>

        {stage === "intent" ? (
          <section className={styles.stage}>
            <p className={styles.eyebrow}>Begin with what matters now</p>
            <h1 ref={stageHeadingRef}>What are you trying to understand?</h1>
            <p className={styles.lead}>
              Discovery builds an evidence-backed understanding of your
              organization around the question that matters now.
            </p>
            <label className={styles.questionField}>
              <span className={styles.srOnly}>Question for Discovery</span>
              <textarea
                autoFocus
                value={question}
                onChange={(event) => {
                  setQuestion(event.target.value);
                  setFieldErrors({});
                }}
                placeholder="Ask a question about your organization…"
                aria-invalid={Boolean(fieldErrors.question)}
                aria-describedby={fieldErrors.question ? "question-error" : undefined}
              />
            </label>
            {fieldErrors.question ? (
              <p id="question-error" className={styles.fieldError}>
                {fieldErrors.question}
              </p>
            ) : null}
            <div className={styles.examples} aria-label="Example questions">
              {intentExamples.map((example) => (
                <button key={example} type="button" onClick={() => setQuestion(example)}>
                  {example}
                </button>
              ))}
            </div>
            <button className={styles.primaryAction} type="button" onClick={advanceIntent}>
              Investigate this <span aria-hidden="true">→</span>
            </button>
          </section>
        ) : null}

        {stage === "organization-context" ? (
          <section className={styles.stage}>
            <p className={styles.eyebrow}>A little context</p>
            <h1 ref={stageHeadingRef} tabIndex={-1}>I can help investigate this.</h1>
            <blockquote>{question}</blockquote>
            <p className={styles.lead}>
              Tell Discovery where this question lives and what you have
              already observed. Incomplete evidence is welcome.
            </p>
            <div className={styles.form}>
              <label>
                <span>Organization name</span>
                <input
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.company)}
                />
                {fieldErrors.company ? (
                  <small className={styles.fieldError}>{fieldErrors.company}</small>
                ) : null}
              </label>
              <label>
                <span>Industry or organization type <em>Optional</em></span>
                <input
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                />
              </label>
              <label className={styles.wideField}>
                <span>What have you already noticed about this?</span>
                <textarea
                  value={observations}
                  onChange={(event) => setObservations(event.target.value)}
                  placeholder="Share observations, recent changes, concerns, dependencies, or assumptions. It is fine if they are incomplete."
                  aria-invalid={Boolean(fieldErrors.observations)}
                />
                {fieldErrors.observations ? (
                  <small className={styles.fieldError}>{fieldErrors.observations}</small>
                ) : null}
              </label>
              <label className={styles.wideField}>
                <span>Website <em>Optional</em></span>
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://"
                />
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.textAction} type="button" onClick={() => setStage("intent")}>
                Back
              </button>
              <button className={styles.primaryAction} type="button" onClick={advanceContext}>
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {stage === "evidence-plan" ? (
          <section className={styles.stage}>
            <p className={styles.eyebrow}>Evidence plan</p>
            <h1 ref={stageHeadingRef} tabIndex={-1}>What would sharpen the answer?</h1>
            <p className={styles.lead}>
              You can begin with what you provided. These sources would help
              Discovery test and refine its understanding of “{question}”
            </p>
            <div className={styles.recommendations}>
              {recommendations.map((recommendation) => (
                <article key={recommendation.title}>
                  <div>
                    <strong>{recommendation.title}</strong>
                    <span>{recommendation.importance}</span>
                  </div>
                  <p>{recommendation.purpose}</p>
                </article>
              ))}
            </div>
            <p className={styles.connectionNote}>
              Document connection will be available later. You can begin with
              the context you provided.
            </p>
            {error ? (
              <div className={styles.safeError} role="alert">
                <strong>More context is needed</strong>
                <p>{error}</p>
              </div>
            ) : null}
            <div className={styles.actions}>
              <button
                className={styles.textAction}
                type="button"
                onClick={() => setStage("organization-context")}
                disabled={submitting}
              >
                Back
              </button>
              <button
                className={styles.primaryAction}
                type="button"
                onClick={runInvestigation}
                disabled={submitting}
              >
                {error ? "Try again" : "Build initial understanding"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {stage === "processing" ? (
          <section className={`${styles.stage} ${styles.processing}`}>
            <span className={styles.processingMark} aria-hidden="true">✦</span>
            <p className={styles.eyebrow}>Working with your evidence</p>
            <h1 ref={stageHeadingRef} tabIndex={-1}>Building an initial understanding</h1>
            <p className={styles.lead}>
              Discovery is looking only for patterns your current evidence can support.
            </p>
            <ol>
              {processingSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {stage === "first-understanding" && result ? (
          <section className={styles.stage}>
            <p className={styles.eyebrow}>Current understanding</p>
            <h1 ref={stageHeadingRef} tabIndex={-1}>Here is what Discovery can support.</h1>
            <div className={styles.resultGrid}>
              <article className={styles.primaryResult}>
                <span>What Discovery can support</span>
                <p>{result.finding}</p>
              </article>
              <article>
                <span>What remains uncertain</span>
                <p>{result.uncertainty}</p>
              </article>
              <article>
                <span>Most useful next evidence</span>
                <ul>
                  {result.nextEvidence.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
              <article>
                <span>Confidence</span>
                <p>{result.confidence.label}</p>
              </article>
            </div>
            <p className={styles.provisional}>
              This is an initial, provisional understanding built from the
              evidence you provided. Discovery will revise it as evidence grows.
            </p>
            <button className={styles.primaryAction} type="button" onClick={openDiscovery}>
              Open Discovery <span aria-hidden="true">→</span>
            </button>
          </section>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <span>Your evidence remains isolated to this organization.</span>
        <span>Discovery distinguishes what is supported from what remains unknown.</span>
      </footer>
    </main>
  );
}
