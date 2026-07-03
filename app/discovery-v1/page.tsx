"use client";

import ResultsOverview from "../../components/results/ResultsOverview";
import { useState } from "react";

import type {
  BeliefObject,
  EngineReport,
  InsightFeedback,
} from "../../components/investigation/types";

export default function DiscoveryV1Page() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [feedback, setFeedback] = useState<InsightFeedback>(null);
  const [showInspect, setShowInspect] = useState(false);

  const v3 = result?.v3;
  const report = buildReportFromV3(v3, company);
  const belief = buildBeliefFromV3(v3);

  async function runInvestigation() {
  setLoading(true);
  setResult(null);
  setError(null);
  setFlipped(false);
  setFeedback(null);
  setShowInspect(false);

  try {
    const response = await fetch("/api/discovery-lab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, website, industry, question, messyInput }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    setResult(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Investigation failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="discovery-page discovery-v2">
      <header className="top-nav">
        <div className="brand-mark">
          <span className="brand-dot" />
          <strong>Discovery</strong>
        </div>
        <span className="nav-pill">Understanding Engine</span>
      </header>

      {!result && (
        <section className="hero-section">
          <p className="eyebrow">Discovery Alpha</p>
          <h1>Organizational understanding emerges.</h1>
          <p>
            Paste messy strategy notes, customer signals, investor thoughts,
            risks, opportunities, or open questions. Discovery will form a
            current belief and show how it got there.
          </p>

          <section className="input-panel">
            <div className="input-grid">
              <input
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <input
                placeholder="Website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <input
                placeholder="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <input
                placeholder="Strategic question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>

            <textarea
              placeholder="Paste messy strategy notes, observations, customer feedback, market facts, investor thoughts, risks, opportunities, or open questions..."
              value={messyInput}
              onChange={(e) => setMessyInput(e.target.value)}
            />

           <button
  className="primary-button full"
  onClick={runInvestigation}
  disabled={loading}
>
  {loading ? "Building understanding..." : "Begin investigation"}
</button>

{error && <p className="error-message">{error}</p>}
          </section>
        </section>
      )}

      {result && report && (
  <section>
    <ResultsOverview
  understanding={v3?.executiveUnderstanding}
  beliefs={v3?.beliefs}
  themes={v3?.themes}
  contradictions={v3?.contradictions}
  causalChains={v3?.causalChains}
  evidence={v3?.evidence}
  reasoningGraph={v3?.reasoningGraph}
  organismState={v3?.organismState}
/>
  </section>
)}

      {result && report && showInspect && (
        <section className="inspection-panel">
          <div className="panel-header">
            <p className="eyebrow">Reasoning path</p>
            <button
              className="text-button"
              onClick={() => setShowInspect(false)}
            >
              Close
            </button>
          </div>

          <ReasoningSection
            title="Why the current belief wins"
            items={v3?.dialectic?.whyCurrentBeliefWins ?? []}
          />

          <ReasoningSection
            title="Why it might be wrong"
            items={v3?.dialectic?.whyItMightBeWrong ?? []}
          />

          <ReasoningSection
            title="Evidence that would change Discovery’s mind"
            items={v3?.dialectic?.evidenceThatWouldChangeDiscoverysMind ?? []}
          />

          <ReasoningSection
            title="Competing beliefs"
            items={v3?.beliefs?.map((item: any) => item.headline) ?? []}
          />

          <ReasoningSection
            title="Themes"
            items={v3?.themes?.map((item: any) => item.title) ?? []}
          />

          <ReasoningSection
            title="Causal chains"
            items={
              v3?.causalChains?.map(
                (item: any) => `${item.cause} → ${item.effect}`
              ) ?? []
            }
          />

          <ReasoningSection
            title="Contradictions"
            items={v3?.contradictions?.map((item: any) => item.title) ?? []}
          />
        </section>
      )}
    </main>
  );
}

function ReasoningSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="reasoning-section">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No items detected yet.</p>
      )}
    </section>
  );
}

function buildBeliefFromV3(v3: any): BeliefObject | undefined {
  const primaryBelief = v3?.beliefs?.[0];
  const executiveUnderstanding = v3?.executiveUnderstanding;

  if (!primaryBelief && !executiveUnderstanding) return undefined;

  const confidence = Math.round(
    ((primaryBelief?.confidence ?? executiveUnderstanding?.confidence) || 0) *
      100
  );

  return {
    id: primaryBelief?.id ?? "B1",
    belief:
      primaryBelief?.headline ??
      executiveUnderstanding?.headline ??
      "Current belief formed.",
    type: "current-belief",
    confidence,
    previousConfidence: Math.max(confidence - 18, 0),
    delta: 18,
    supportingEvidence: primaryBelief?.supportingEvidenceIds ?? [],
    assumptions:
      primaryBelief?.supportingReasons ??
      executiveUnderstanding?.evidenceSummary ??
      [],
    externalDependencies:
      primaryBelief?.concerns ??
      executiveUnderstanding?.contradictions ??
      [],
    contradictions:
      primaryBelief?.concerns ??
      executiveUnderstanding?.contradictions ??
      [],
    whyItMatters:
      primaryBelief?.explanation ??
      executiveUnderstanding?.explanation ??
      "This belief gives leadership a testable understanding to act on.",
  };
}

function buildReportFromV3(v3: any, companyName: string): EngineReport | null {
  if (!v3) return null;

  const executiveUnderstanding = v3.executiveUnderstanding;
  const primaryBelief = v3.beliefs?.[0];

  const confidence = Math.round(
    ((primaryBelief?.confidence ?? executiveUnderstanding?.confidence) || 0) *
      100
  );

  const evidenceObjects =
    v3.evidence?.map((item: any) => ({
      id: item.id,
      claim: item.text,
      source: item.source ?? "Uploaded evidence",
      category: item.type ?? "unknown",
      confidence: item.confidence ?? 0.5,
    })) ?? [];

  return {
    companyName: companyName || "Company",
    sourceCount: evidenceObjects.length,
    evidenceObjects,
    relationships: [],
    beliefs: buildBeliefFromV3(v3) ? [buildBeliefFromV3(v3)!] : [],
    contradictions:
      v3.contradictions?.map((item: any) => ({
        title: item.title,
        body: item.explanation,
        confidence: item.confidence,
      })) ?? [],
    openQuestions:
      primaryBelief?.nextQuestions ??
      executiveUnderstanding?.openQuestions ??
      [],
    nextBestEvidence:
      v3.dialectic?.evidenceThatWouldChangeDiscoverysMind ??
      executiveUnderstanding?.openQuestions ??
      [],
    understandingScore: confidence,
    delta: 18,
    brief: [
      primaryBelief?.headline ??
        executiveUnderstanding?.headline ??
        "Current belief formed.",
      primaryBelief?.explanation ??
        executiveUnderstanding?.explanation ??
        "Discovery formed a current understanding from the available evidence.",
    ],
    engineMode: "v3-belief-dialectic",
    modelUsed: "Discovery V3",
    decisionSupport: {
      nextStep:
        executiveUnderstanding?.nextMoves?.[0] ??
        "Collect evidence that could challenge the current belief.",
      suggestedMeeting:
        "Pressure-test the current belief with leadership before treating it as settled.",
      meetingPurpose:
        "Decide whether the belief should guide action, further investigation, or revision.",
      questionsToAsk: executiveUnderstanding?.openQuestions ?? [],
      evidenceToBring:
        v3.dialectic?.evidenceThatWouldChangeDiscoverysMind ?? [],
      exportTitle: "Discovery Current Belief Brief",
    },
    organismState: v3.organismState,
    raw: v3,
  };
}