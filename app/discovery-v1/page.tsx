"use client";

import { useState } from "react";

import ExecutiveBriefing from "../../components/executive/ExecutiveBriefing";
// Legacy dashboard kept for reference during Sprint 48.
// import { ExecutiveDashboardView } from "../../components/ExecutiveDashboard";
// import OrganizationWorkspace from "../../components/workspace/OrganizationWorkspace";

export default function DiscoveryV1Page() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runInvestigation(inputOverride?: string) {
    setLoading(true);
    setError(null);

    if (!inputOverride) {
      setResult(null);
    }

    try {
      const response = await fetch("/api/discovery-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          website,
          industry,
          question,
          messyInput: inputOverride ?? messyInput,
        }),
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
        <span className="nav-pill">Executive Intelligence</span>
      </header>

      {!result && (
        <section className="hero-section">
          <p className="eyebrow">Discovery Alpha</p>
          <h1>Organizational understanding emerges.</h1>
          <p>
            Paste messy strategy notes, customer signals, investor thoughts,
            risks, opportunities, or open questions. Discovery will form a
            current belief and preserve it inside the organization.
          </p>

          <section className="input-panel">
            <div className="input-grid">
              <input
                placeholder="Company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />

              <input
                placeholder="Website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />

              <input
                placeholder="Industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
              />

              <input
                placeholder="Strategic question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </div>

            <textarea
              placeholder="Paste messy strategy notes, observations, customer feedback, market facts, investor thoughts, risks, opportunities, or open questions..."
              value={messyInput}
              onChange={(event) => setMessyInput(event.target.value)}
            />

            <button
              className="primary-button full"
              onClick={() => runInvestigation()}
              disabled={loading}
            >
              {loading ? "Building understanding..." : "Begin organization"}
            </button>

            {error && <p className="error-message">{error}</p>}
          </section>
        </section>
      )}

      {result?.executiveDashboard && (
        <ExecutiveBriefing executiveDashboard={result.executiveDashboard} />
      )}

      {/* Legacy workspace preserved, but hidden during Sprint 48B briefing experience. */}
      {/*
      {result && (
        <OrganizationWorkspace
          result={result}
          loading={loading}
          onContinueLearning={(nextInput) => runInvestigation(nextInput)}
        />
      )}
      */}

      {result && error && <p className="error-message">{error}</p>}
    </main>
  );
}