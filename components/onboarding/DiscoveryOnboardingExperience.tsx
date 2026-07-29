"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import alphaStyles from "../alpha/AlphaExperience.module.css";
import {
  Action,
  Eyebrow,
  Panel,
  QuietHeader,
} from "../alpha/AlphaPrimitives";
import { buildProductHref } from "../product-shell/data/productOrganization";
import {
  evidenceDigest,
  ONBOARDING_EVIDENCE_MAX_FILES,
  type OnboardingEvidenceSubmission,
  sanitizeEvidenceName,
  validateEvidenceContent,
  validateEvidenceFileMetadata,
} from "../../lib/onboarding/evidence/onboardingEvidence";
import styles from "./DiscoveryOnboardingExperience.module.css";

type OnboardingStage =
  | "intent"
  | "organization-context"
  | "evidence-plan"
  | "processing"
  | "first-understanding";

type ProductUnderstanding = {
  status: "supported" | "provisional" | "insufficient";
  headline: string;
  supportedFindings: Array<{
    statement: string;
    basis: string;
  }>;
  candidateExplanations: Array<{
    statement: string;
    basis: string;
    status: "plausible" | "competing" | "weakly-supported";
  }>;
  uncertainties: string[];
  nextEvidence: Array<{
    label: string;
    whyItHelps: string;
    priority: "highest-value" | "recommended" | "optional";
  }>;
  confidence: {
    state: "available" | "limited" | "unavailable";
    label: string;
    explanation: string;
  };
};

type ProductUtility = {
  immediateInsight: ProductUnderstanding["supportedFindings"][number] | null;
  likelyExplanations: ProductUnderstanding["candidateExplanations"];
  alternativeExplanations: ProductUnderstanding["candidateExplanations"];
  whyDiscoveryThinksThis: ProductUnderstanding["supportedFindings"];
  decisionImplications: ProductUnderstanding["supportedFindings"];
  investigateNext: ProductUnderstanding["nextEvidence"][number] | null;
  watchNext: Array<{
    label: string;
    whyItMatters: string;
  }>;
  evidenceStrength: {
    alreadyStrong: ProductUnderstanding["supportedFindings"];
    stillWeak: string[];
  };
  confidence: ProductUnderstanding["confidence"];
};

type DiscoveryLabSuccess = {
  status: "complete" | "provisional";
  organizationId: string;
  understanding: ProductUnderstanding;
  utility: ProductUtility;
};

type DiscoveryLabFailure = {
  status: "validation-failed" | "insufficient-evidence" | "access-denied" | "idempotency-conflict" | "investigation-in-progress" | "failed";
  message: string;
  organizationId?: string;
  understanding?: ProductUnderstanding;
  utility?: ProductUtility;
};

type EvidenceRecommendation = {
  id: string;
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
  evidenceSources: OnboardingEvidenceSubmission[];
  skippedEvidenceRoles: string[];
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

function evidencePresentationName(params: {
  displayName: string;
  content: string;
  ingestionMethod: "file" | "paste";
  originalFilename?: string;
  sequence: number;
}): string {
  if (params.originalFilename) {
    return sanitizeEvidenceName(params.originalFilename);
  }
  if (params.displayName !== "Additional evidence") {
    return sanitizeEvidenceName(params.displayName);
  }
  const firstLine = params.content
    .split(/\r?\n/, 1)[0]
    ?.replace(/\s+/g, " ")
    .trim();
  const preview = sanitizeEvidenceName(firstLine ?? "").slice(0, 72);
  return preview ||
    `${params.ingestionMethod === "paste" ? "Pasted information" : "Uploaded information"} ${params.sequence}`;
}

function recommendationsFor(question: string): EvidenceRecommendation[] {
  const normalized = question.toLowerCase();
  if (/(sales|pipeline|revenue|growth)/.test(normalized)) {
    return [
      {
        id: "sales-trend",
        title: "Sales trend or pipeline report",
        purpose: "Clarifies when performance changed and where momentum was lost.",
        importance: "Recommended",
      },
      {
        id: "customer-loss",
        title: "Customer loss reasons",
        purpose: "Helps distinguish demand, product, pricing, and execution explanations.",
        importance: "Recommended",
      },
      {
        id: "commercial-change",
        title: "Pricing or promotion changes",
        purpose: "Tests whether commercial changes align with the slowdown.",
        importance: "Optional",
      },
    ];
  }
  if (/(project|delay|delivery|release|execution)/.test(normalized)) {
    return [
      {
        id: "delivery-timeline",
        title: "Delivery timeline or work log",
        purpose: "Shows where work waits, changes direction, or misses a handoff.",
        importance: "Recommended",
      },
      {
        id: "approval-notes",
        title: "Decision and approval notes",
        purpose: "Clarifies ownership, escalation, and approval dependencies.",
        importance: "Recommended",
      },
      {
        id: "retrospective",
        title: "Recent retrospective",
        purpose: "Adds the team’s explanation of recurring delivery friction.",
        importance: "Optional",
      },
    ];
  }
  if (/(retention|customer|churn)/.test(normalized)) {
    return [
      {
        id: "retention-trend",
        title: "Retention trend",
        purpose: "Clarifies which customers changed behavior and when.",
        importance: "Recommended",
      },
      {
        id: "customer-feedback",
        title: "Customer feedback or loss notes",
        purpose: "Adds direct evidence about why customers stay or leave.",
        importance: "Recommended",
      },
      {
        id: "experience-change",
        title: "Product or service changes",
        purpose: "Tests whether experience changes align with retention movement.",
        importance: "Optional",
      },
    ];
  }
  if (/(decision|approval|stuck|authority)/.test(normalized)) {
    return [
      {
        id: "decision-log",
        title: "Decision log or approval path",
        purpose: "Shows where authority sits and where decisions wait.",
        importance: "Recommended",
      },
      {
        id: "ownership-notes",
        title: "Role and ownership notes",
        purpose: "Clarifies expected ownership across the people involved.",
        importance: "Recommended",
      },
      {
        id: "decision-example",
        title: "A recent decision example",
        purpose: "Adds a concrete case that can confirm or challenge the pattern.",
        importance: "Optional",
      },
    ];
  }
  return [
    {
      id: "concrete-example",
      title: "A recent concrete example",
      purpose: "Helps Discovery distinguish a recurring pattern from a general concern.",
      importance: "Recommended",
    },
    {
      id: "operating-notes",
      title: "Relevant operating notes or measures",
      purpose: "Adds observable evidence connected to your question.",
      importance: "Recommended",
    },
    {
      id: "different-perspective",
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
  const [evidenceSources, setEvidenceSources] = useState<
    OnboardingEvidenceSubmission[]
  >([]);
  const [skippedEvidenceRoles, setSkippedEvidenceRoles] = useState<string[]>([]);
  const [evidenceEditor, setEvidenceEditor] = useState<{
    sourceRole: string;
    displayName: string;
    mode: "paste" | "file";
    replacingId?: string;
  } | null>(null);
  const [pastedEvidence, setPastedEvidence] = useState("");
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [recovery, setRecovery] =
    useState<ProductUnderstanding | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductUnderstanding | null>(null);
  const [utility, setUtility] = useState<ProductUtility | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const requestController = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          setEvidenceSources(draft.evidenceSources ?? []);
          setSkippedEvidenceRoles(draft.skippedEvidenceRoles ?? []);
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
      evidenceSources,
      skippedEvidenceRoles,
    };
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [
    company,
    draftReady,
    industry,
    observations,
    evidenceSources,
    onboardingRequestId,
    organizationId,
    question,
    skippedEvidenceRoles,
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

  function openEvidenceEditor(
    sourceRole: string,
    displayName: string,
    mode: "paste" | "file",
    replacingId?: string,
  ) {
    setEvidenceError(null);
    setPastedEvidence("");
    setEvidenceEditor({ sourceRole, displayName, mode, replacingId });
    if (mode === "file") {
      window.setTimeout(() => fileInputRef.current?.click(), 0);
    }
  }

  async function addEvidence(
    editor: NonNullable<typeof evidenceEditor>,
    content: string,
    metadata: { originalFilename?: string; mimeType?: string } = {},
  ) {
    if (
      !editor.replacingId &&
      evidenceSources.length >= ONBOARDING_EVIDENCE_MAX_FILES
    ) {
      setEvidenceError("You can add up to three evidence sources.");
      return;
    }
    const contentError = validateEvidenceContent(content);
    if (contentError) {
      setEvidenceError(contentError);
      return;
    }
    const entry: OnboardingEvidenceSubmission = {
      id: crypto.randomUUID(),
      sourceRole: editor.sourceRole,
      displayName: evidencePresentationName({
        displayName: editor.displayName,
        content: content.trim(),
        ingestionMethod: editor.mode,
        originalFilename: metadata.originalFilename,
        sequence: evidenceSources.length + 1,
      }),
      ingestionMethod: editor.mode,
      ...(metadata.originalFilename
        ? { originalFilename: sanitizeEvidenceName(metadata.originalFilename) }
        : {}),
      ...(metadata.mimeType ? { mimeType: metadata.mimeType } : {}),
      contentDigest: await evidenceDigest(content.trim()),
      extractionStatus: "extracted",
      content: content.trim(),
    };
    setEvidenceSources((current) => [
      ...current.filter((item) => item.id !== editor.replacingId),
      entry,
    ]);
    setSkippedEvidenceRoles((current) =>
      current.filter((role) => role !== editor.sourceRole)
    );
    setEvidenceEditor(null);
    setPastedEvidence("");
    setEvidenceError(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file || !evidenceEditor) return;
    const metadataError = validateEvidenceFileMetadata(file);
    if (metadataError) {
      setEvidenceError(metadataError);
      return;
    }
    try {
      await addEvidence(evidenceEditor, await file.text(), {
        originalFilename: file.name,
        mimeType: file.type,
      });
    } catch {
      setEvidenceError("This file could not be read safely as plain text.");
    }
  }

  function removeEvidence(id: string) {
    setEvidenceSources((current) => current.filter((item) => item.id !== id));
    setEvidenceError(null);
  }

  async function runInvestigation() {
    if (submitting) return;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setSubmitting(true);
    setError(null);
    setRecovery(undefined);
    setStage("processing");

    try {
      const requestMaterial = JSON.stringify({
        company: company.trim(),
        website: website.trim(),
        industry: industry.trim(),
        question: question.trim(),
        context: observations.trim(),
        evidenceSources,
      });
      const investigationRequestId =
        `onboarding-investigation-${await evidenceDigest(requestMaterial)}`;
      const response = await fetch("/api/discovery-lab", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          onboardingRequestId,
          investigationRequestId,
          company: company.trim(),
          website: website.trim(),
          industry: industry.trim(),
          question: question.trim(),
          messyInput: observations.trim(),
          evidenceSources,
        }),
      });
      const body = await response.json().catch(() => null) as
        | DiscoveryLabSuccess
        | DiscoveryLabFailure
        | null;
      if (
        !response.ok ||
        !body ||
        (body.status !== "complete" && body.status !== "provisional")
      ) {
        const failure =
          body && "message" in body ? body : null;
        if (failure) {
          setRecovery(failure.understanding);
        }
        throw {
          userMessage: safeFailure(
            response.status,
            failure,
          ),
          organizationId:
            body && "organizationId" in body ? body.organizationId : undefined,
        };
      }
      setOrganizationId(body.organizationId);
      setResult(body.understanding);
      setUtility(body.utility);
      setEvidenceSources([]);
      setSkippedEvidenceRoles([]);
      window.sessionStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          stage: "evidence-plan",
          organizationId: body.organizationId,
          onboardingRequestId,
          question,
          company,
          industry,
          website,
          observations,
          evidenceSources: [],
          skippedEvidenceRoles: [],
        } satisfies OnboardingDraft),
      );
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
    <main className={`${alphaStyles.alphaRoot} ${styles.page}`}>
      <QuietHeader helpLabel="About onboarding" />
      <section className={styles.experience}>
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
            <Eyebrow tone="violet">Begin with what matters now</Eyebrow>
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
            <Action arrow onClick={advanceIntent}>Investigate this</Action>
          </section>
        ) : null}

        {stage === "organization-context" ? (
          <section className={styles.stage}>
            <Eyebrow tone="violet">A little context</Eyebrow>
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
              <Action tone="text" onClick={() => setStage("intent")}>Back</Action>
              <Action arrow onClick={advanceContext}>Continue</Action>
            </div>
          </section>
        ) : null}

        {stage === "evidence-plan" ? (
          <section className={styles.stage}>
            <Eyebrow tone="violet">Evidence plan</Eyebrow>
            <h1 ref={stageHeadingRef} tabIndex={-1}>Tell Discovery what you already know.</h1>
            <p className={styles.lead}>
              Add up to three sources in this update. After Discovery updates
              the understanding, you can add another batch.
            </p>
            <div className={styles.recommendations}>
              {recommendations.map((recommendation) => {
                const added = evidenceSources.find(
                  (item) => item.sourceRole === recommendation.id,
                );
                const skipped = skippedEvidenceRoles.includes(recommendation.id);
                return (
                  <Panel key={recommendation.id} className={styles.recommendation}>
                    <div className={styles.recommendationHeading}>
                      <div>
                        <strong>{recommendation.title}</strong>
                        <p>{recommendation.purpose}</p>
                      </div>
                      <span>{recommendation.importance}</span>
                    </div>
                    {added ? (
                      <div className={styles.evidenceReceipt}>
                        <span>
                          <b aria-hidden="true">✓</b>
                          {added.originalFilename ?? added.displayName}
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              openEvidenceEditor(
                                recommendation.id,
                                recommendation.title,
                                added.ingestionMethod,
                                added.id,
                              )
                            }
                          >
                            Replace
                          </button>
                          <button type="button" onClick={() => removeEvidence(added.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.evidenceActions}>
                        <button
                          type="button"
                          onClick={() =>
                            openEvidenceEditor(
                              recommendation.id,
                              recommendation.title,
                              "file",
                            )
                          }
                          disabled={evidenceSources.length >= ONBOARDING_EVIDENCE_MAX_FILES}
                        >
                          Upload file
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openEvidenceEditor(
                              recommendation.id,
                              recommendation.title,
                              "paste",
                            )
                          }
                          disabled={evidenceSources.length >= ONBOARDING_EVIDENCE_MAX_FILES}
                        >
                          Paste information
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSkippedEvidenceRoles((current) =>
                              current.includes(recommendation.id)
                                ? current.filter((role) => role !== recommendation.id)
                                : [...current, recommendation.id]
                            )
                          }
                        >
                          {skipped ? "Skipped — undo" : "Skip"}
                        </button>
                      </div>
                    )}
                  </Panel>
                );
              })}
              <Panel className={styles.addAnother} tone="soft">
                <div>
                  <strong>Add something else</strong>
                  <p>Add another relevant plain-text source in your own terms.</p>
                </div>
                <div className={styles.evidenceActions}>
                  <button
                    type="button"
                    onClick={() =>
                      openEvidenceEditor("additional-evidence", "Additional evidence", "file")
                    }
                    disabled={evidenceSources.length >= ONBOARDING_EVIDENCE_MAX_FILES}
                  >
                    Upload file
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openEvidenceEditor("additional-evidence", "Additional evidence", "paste")
                    }
                    disabled={evidenceSources.length >= ONBOARDING_EVIDENCE_MAX_FILES}
                  >
                    Paste information
                  </button>
                </div>
              </Panel>
              {evidenceSources
                .filter((item) => item.sourceRole === "additional-evidence")
                .map((item) => (
                  <Panel key={item.id} className={styles.additionalReceipt}>
                    <div className={styles.evidenceReceipt}>
                      <span>
                        <b aria-hidden="true">✓</b>
                        {item.originalFilename ?? item.displayName}
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            openEvidenceEditor(
                              item.sourceRole,
                              "Additional evidence",
                              item.ingestionMethod,
                              item.id,
                            )
                          }
                        >
                          Replace
                        </button>
                        <button type="button" onClick={() => removeEvidence(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </Panel>
                ))}
            </div>

            <input
              ref={fileInputRef}
              className={styles.srOnly}
              type="file"
              accept=".txt,.md,.markdown,.csv,text/plain,text/markdown,text/csv"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.currentTarget.value = "";
              }}
            />

            {evidenceEditor?.mode === "paste" ? (
              <Panel className={styles.evidenceEditor} tone="blue">
                <label htmlFor="onboarding-pasted-evidence">
                  <strong>Paste {evidenceEditor.displayName.toLowerCase()}</strong>
                  <span>Plain text only. Include dates, examples, measures, or direct observations where available.</span>
                </label>
                <textarea
                  id="onboarding-pasted-evidence"
                  autoFocus
                  value={pastedEvidence}
                  onChange={(event) => {
                    setPastedEvidence(event.target.value);
                    setEvidenceError(null);
                  }}
                />
                <div className={styles.editorActions}>
                  <Action
                    tone="text"
                    onClick={() => {
                      setEvidenceEditor(null);
                      setEvidenceError(null);
                    }}
                  >
                    Cancel
                  </Action>
                  <Action
                    onClick={() => void addEvidence(evidenceEditor, pastedEvidence)}
                  >
                    Add evidence
                  </Action>
                </div>
              </Panel>
            ) : null}

            {evidenceError ? (
              <div className={styles.inlineError} role="alert">{evidenceError}</div>
            ) : null}

            <p className={styles.connectionNote}>
              Supported now: TXT, Markdown, CSV, and pasted text.
            </p>
            {evidenceSources.length === ONBOARDING_EVIDENCE_MAX_FILES ? (
              <p className={styles.batchReady} role="status">
                This update is ready. Submit these sources, then you can add more.
              </p>
            ) : null}
            {error ? (
              <div role="alert">
                <Panel className={styles.safeError} tone="orange">
                  <strong>I need a little more to give you a useful answer</strong>
                  <p>{error}</p>
                  {recovery ? (
                    <>
                      {recovery.uncertainties.map((item) => (
                        <p key={item}><b>What remains uncertain:</b> {item}</p>
                      ))}
                      {recovery.nextEvidence.length ? (
                        <ul>
                          {recovery.nextEvidence.map((item) => (
                            <li key={item.label}>
                              <b>{item.label}:</b> {item.whyItHelps}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : null}
                  <div className={styles.recoveryActions}>
                    <button
                      type="button"
                      onClick={() =>
                        openEvidenceEditor("additional-evidence", "Additional evidence", "paste")
                      }
                    >
                      Add pasted evidence
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openEvidenceEditor("additional-evidence", "Additional evidence", "file")
                      }
                    >
                      Upload evidence
                    </button>
                    <button type="button" onClick={() => setStage("organization-context")}>
                      Return to observations
                    </button>
                  </div>
                </Panel>
              </div>
            ) : null}
            <div className={styles.actions}>
              <Action
                tone="text"
                onClick={() => setStage("organization-context")}
                disabled={submitting}
              >
                Back
              </Action>
              <Action arrow onClick={runInvestigation} disabled={submitting}>
                {error
                  ? "Retry with current evidence"
                  : evidenceSources.length
                    ? "Update understanding"
                    : "Continue with current context"}
              </Action>
            </div>
          </section>
        ) : null}

        {stage === "processing" ? (
          <section className={`${styles.stage} ${styles.processing}`} aria-live="polite">
            <span className={styles.processingMark} aria-hidden="true">✦</span>
            <Eyebrow tone="violet">Working with your evidence</Eyebrow>
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

        {stage === "first-understanding" && result && utility ? (
          <section className={styles.stage}>
            <Eyebrow tone={result.status === "provisional" ? "orange" : "green"}>
              {result.status === "provisional"
                ? "Working explanation"
                : "Current understanding"}
            </Eyebrow>
            <h1 ref={stageHeadingRef} tabIndex={-1}>
              Here’s what I can support so far
            </h1>
            <Panel className={styles.primaryResult} tone="blue">
              <span>Your question</span>
              <blockquote>{question}</blockquote>
              <span>Current understanding</span>
              <p>{utility.immediateInsight?.statement ?? result.headline}</p>
              <span>Confidence boundary</span>
              <p>
                <b>{result.confidence.label}.</b>{" "}
                {result.confidence.explanation}
              </p>
              <span>Remaining uncertainty</span>
              <p>{result.uncertainties[0] ?? "No additional uncertainty is currently available."}</p>
              {result.nextEvidence[0] ? (
                <>
                  <span>Highest-value next information</span>
                  <p>
                    <b>{result.nextEvidence[0].label}:</b>{" "}
                    {result.nextEvidence[0].whyItHelps}
                  </p>
                </>
              ) : null}
            </Panel>
            <details className={styles.resultDetails}>
              <summary>Review supporting analysis</summary>
              <div className={styles.resultGrid}>
              <Panel>
                <span>Why Discovery thinks this</span>
                {utility.whyDiscoveryThinksThis.map((finding) => (
                  <div className={styles.finding} key={finding.statement}>
                    <b>{finding.statement}</b>
                    <small>{finding.basis}</small>
                  </div>
                ))}
              </Panel>
              {utility.likelyExplanations.length ? (
                <Panel>
                  <span>Likely explanations</span>
                  <ul>
                    {utility.likelyExplanations.map((item) => (
                      <li key={item.statement}>
                        <b>{item.statement}</b> {item.basis}
                      </li>
                    ))}
                  </ul>
                </Panel>
              ) : null}
              {utility.alternativeExplanations.length ? (
                <Panel>
                  <span>Alternative explanations</span>
                  <ul>
                    {utility.alternativeExplanations.map((item) => (
                      <li key={item.statement}>
                        <b>{item.statement}</b> {item.basis}
                      </li>
                    ))}
                  </ul>
                </Panel>
              ) : null}
              {utility.decisionImplications.length ? (
                <Panel>
                  <span>Decision implications</span>
                  {utility.decisionImplications.map((item) => (
                    <p key={item.statement}>{item.statement}</p>
                  ))}
                </Panel>
              ) : null}
              <Panel>
                <span>Evidence still weak</span>
                <ul>
                  {utility.evidenceStrength.stillWeak.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Panel>
              <Panel>
                <span>What Discovery would investigate next</span>
                <ul>
                  {result.nextEvidence.map((item) => (
                    <li key={item.label}>
                      <b>{item.label}:</b> {item.whyItHelps}
                    </li>
                  ))}
                </ul>
              </Panel>
              {utility.watchNext.length ? (
                <Panel>
                  <span>What Discovery would watch next</span>
                  <ul>
                    {utility.watchNext.map((item) => (
                      <li key={item.label}>
                        <b>{item.label}:</b> {item.whyItMatters}
                      </li>
                    ))}
                  </ul>
                </Panel>
              ) : null}
              <Panel>
                <span>Confidence</span>
                <p>
                  <b>{result.confidence.label}.</b>{" "}
                  {result.confidence.explanation}
                </p>
              </Panel>
              </div>
            </details>
            {result.status === "provisional" ? (
              <p className={styles.provisional}>
                This is a provisional understanding, not a final causal
                conclusion. Discovery will revise it as evidence grows.
              </p>
            ) : null}
            <div className={styles.actions}>
              <Action
                onClick={() => {
                  setError(null);
                  setStage("evidence-plan");
                }}
              >
                Add more information
              </Action>
              <Action tone="secondary" arrow onClick={openDiscovery}>
                Continue to Discovery
              </Action>
            </div>
            <p className={styles.connectionNote}>
              You can keep improving this understanding as new information
              becomes available.
            </p>
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
