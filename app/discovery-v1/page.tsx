"use client";

import { useState } from "react";

import ExecutiveWorkspace from "../../components/executive-v2/ExecutiveWorkspace";
import type { ExecutiveProjection } from "../../components/executive-v2/projection/ExecutiveProjection";

type DiscoveryLabResponse = {
  executiveProjection: ExecutiveProjection;
};

export default function DiscoveryV1Page() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");

  const [projection, setProjection] =
    useState<ExecutiveProjection | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runInvestigation(inputOverride?: string) {
    setLoading(true);
    setError(null);

    if (!inputOverride) {
      setProjection(null);
    }

    try {
      const response = await fetch("/api/discovery-lab", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      const data: DiscoveryLabResponse = await response.json();

      if (!data.executiveProjection) {
        throw new Error(
          "The API did not return an executive projection.",
        );
      }

      setProjection(data.executiveProjection);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Investigation failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (projection) {
    return <ExecutiveWorkspace projection={projection} />;
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
            type="button"
            className="primary-button full"
            onClick={() => runInvestigation()}
            disabled={loading}
          >
            {loading
              ? "Building understanding..."
              : "Begin organization"}
          </button>

          {error && <p className="error-message">{error}</p>}
        </section>
      </section>
    </main>
  );
}