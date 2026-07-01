"use client";

import { useState } from "react";

export default function DiscoveryLabPage() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runInvestigation() {
    setLoading(true);
    setResult(null);

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
        messyInput,
      }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#f4efe4",
        padding: 40,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section style={{ maxWidth: 1400, margin: "0 auto" }}>
        <h1 style={{ fontSize: 48, marginBottom: 8 }}>Discovery Lab</h1>
        <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32 }}>
          Engine workbench for turning messy strategic input into executive understanding.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div style={panelStyle}>
            <h2>Investigation Input</h2>

            <input style={inputStyle} placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input style={inputStyle} placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
            <input style={inputStyle} placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <input style={inputStyle} placeholder="Strategic question" value={question} onChange={(e) => setQuestion(e.target.value)} />

            <textarea
              style={{ ...inputStyle, minHeight: 220 }}
              placeholder="Paste messy strategy notes, observations, competitor info, investor thoughts, etc."
              value={messyInput}
              onChange={(e) => setMessyInput(e.target.value)}
            />

            <button style={buttonStyle} onClick={runInvestigation} disabled={loading}>
              {loading ? "Compiling Understanding..." : "Compile Understanding"}
            </button>
          </div>

          <div style={panelStyle}>
            <h2>Engine Status</h2>
            <EngineStep label="Parse" active={!!result?.parsed} />
            <EngineStep label="Observations" active={!!result?.observations} />
            <EngineStep label="Signals" active={!!result?.signals} />
            <EngineStep label="Surprise" active={!!result?.surprises} />
            <EngineStep label="Understanding" active={!!result?.understandings} />
            <EngineStep label="Brief" active={!!result?.brief} />
          </div>
        </div>

        {result && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginTop: 24,
            }}
          >
            <div style={panelStyle}>
                <h2>Evidence Workspace</h2>

<Card title="Workspace Health">
  <p><strong>Evidence count:</strong> {result.workspace?.evidenceCount}</p>
  <p><strong>Cluster count:</strong> {result.workspace?.clusterCount}</p>
  <p><strong>Dominant theme:</strong> {result.workspace?.dominantTheme}</p>
  <p><strong>Coherence:</strong> {result.workspace?.workspaceHealth?.coherence}%</p>
  <p><strong>Instability:</strong> {result.workspace?.workspaceHealth?.instability}%</p>
  <p><strong>Surprise potential:</strong> {result.workspace?.workspaceHealth?.surprisePotential}%</p>
</Card>

<h2 style={{ marginTop: 28 }}>Workspace Clusters</h2>

{result.workspace?.clusters?.map((cluster: any, index: number) => (
  <Card key={index} title={cluster.title}>
    <p><strong>Theme:</strong> {cluster.theme}</p>
    <p><strong>Confidence:</strong> {cluster.confidence}%</p>
    <p><strong>Tags:</strong> {cluster.tags?.join(", ")}</p>
    <p><strong>Evidence:</strong></p>
    <ul>
      {cluster.observations?.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </Card>
))}

{result.workspace?.contradictions?.length > 0 && (
  <>
    <h2 style={{ marginTop: 28 }}>Workspace Contradictions</h2>

    {result.workspace.contradictions.map((contradiction: any, index: number) => (
      <Card key={index} title={contradiction.title}>
        <p>{contradiction.tension}</p>
      </Card>
    ))}
  </>
)}
              <h2>Observations</h2>
              {result.observations?.map((obs: any, index: number) => (
                <Card key={index} title={obs.title}>
                  <p>{obs.description}</p>
                  <small>Confidence: {Math.round(obs.confidence * 100)}%</small>
                </Card>
              ))}

              <h2 style={{ marginTop: 28 }}>Signals</h2>
              {result.signals?.map((signal: any, index: number) => (
                <Card key={index} title={signal.title}>
                  <p><strong>Category:</strong> {signal.category}</p>
                  <p>{signal.whyItMatters}</p>
                  <small>Importance: {signal.importance}</small>
                </Card>
              ))}
            </div>

            <div style={panelStyle}>
                <h2>Strategic Tensions</h2>

{result.tensions?.map((tension: any, index: number) => (
  <Card key={index} title={tension.title}>
    <p>
      <strong>{tension.left}</strong> ↔ <strong>{tension.right}</strong>
    </p>
    <p>{tension.explanation}</p>
    <small>Strength: {Math.round(tension.strength)}%</small>
  </Card>
))}

<h2 style={{ marginTop: 28 }}>Hypotheses</h2>

{result.hypotheses?.map((hypothesis: any, index: number) => (
  <Card key={index} title={hypothesis.title}>
    <p>{hypothesis.explanation}</p>
    <p>
      <strong>Confidence:</strong> {Math.round(hypothesis.confidence)}%
    </p>
    <p><strong>Evidence needed:</strong></p>
    <ul>
      {hypothesis.evidenceNeeded.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </Card>
))}

<h2 style={{ marginTop: 28 }}>Beliefs</h2>

{result.beliefs?.map((belief: any, index: number) => (
  <Card key={index} title={belief.statement}>
    <p>{belief.reasoning}</p>
    <p>
      <strong>Status:</strong> {belief.status}
    </p>
    <p>
      <strong>Confidence:</strong> {belief.confidence}%
    </p>

    <p><strong>Supporting evidence:</strong></p>
    <ul>
      {belief.supportingEvidence.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>

    <p><strong>Evidence needed:</strong></p>
    <ul>
      {belief.evidenceNeeded.map((item: string, i: number) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  </Card>
))}
              <h2>Executive Brief</h2>
              <Card title="Executive Summary">
                <p>{result.brief?.executiveSummary}</p>
              </Card>

              <ListSection title="Key Signals" items={result.brief?.keySignals} />
              <ListSection title="Risks" items={result.brief?.risks} />
              <ListSection title="Opportunities" items={result.brief?.opportunities} />
              <ListSection title="Leadership Questions" items={result.brief?.leadershipQuestions} />
              <ListSection title="Recommended Next Moves" items={result.brief?.recommendedNextMoves} />

              <h2 style={{ marginTop: 28 }}>Surprise</h2>
              {result.surprises?.map((surprise: any, index: number) => (
                <Card key={index} title={surprise.title}>
                  <p>{surprise.reason}</p>
                  <small>Surprise Score: {surprise.score}</small>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function EngineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{label}</span>
      <span>{active ? "✓ Complete" : "○ Waiting"}</span>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

function ListSection({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} style={{ marginBottom: 8 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 18,
  padding: 24,
  background: "rgba(255,255,255,0.045)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  marginBottom: 14,
  padding: 12,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "#111",
  color: "#f4efe4",
  fontSize: 15,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#f4efe4",
  color: "#050505",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};