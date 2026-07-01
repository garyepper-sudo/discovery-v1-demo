"use client";

import { useState } from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DiscoveryV1Page() {
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [question, setQuestion] = useState("");
  const [messyInput, setMessyInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showWhy, setShowWhy] = useState(false);

  async function runInvestigation() {
    setLoading(true);
    setLoadingStep(1);
    setResult(null);
    setShowWhy(false);

    const response = await fetch("/api/discovery-lab", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, website, industry, question, messyInput }),
    });

    const data = await response.json();

    await sleep(650);
    setLoadingStep(2);
    await sleep(650);
    setLoadingStep(3);
    await sleep(650);
    setLoadingStep(4);
    await sleep(650);
    setLoadingStep(5);
    await sleep(500);

    setResult(data);
    setLoading(false);
  }

  const v3 = result?.v3;
  const understanding = v3?.executiveUnderstanding;
  const understandingScore = Math.round((understanding?.confidence || 0) * 100);

  const evidenceAtoms =
    v3?.evidence?.filter((item: any) => {
      const text = item.text || "";
      return (
        !text.startsWith("Company:") &&
        !text.startsWith("Website:") &&
        !text.startsWith("Industry:") &&
        !text.startsWith("Question:") &&
        text.trim() !== "Context:"
      );
    }) || [];

  return (
    <main style={pageStyle}>
      <section style={shellStyle}>
        <header style={navStyle}>
          <div style={brandStyle}>
            <span style={dotStyle} />
            <strong>Discovery</strong>
          </div>
          <span style={pillStyle}>Discovery V1</span>
        </header>

        {loading && (
          <section style={loadingPanelStyle}>
            <p style={eyebrowStyle}>Investigation forming</p>
            <h1 style={resultTitleStyle}>
              {loadingStep === 1 && "Evidence is surfacing."}
              {loadingStep === 2 && "Patterns are connecting."}
              {loadingStep === 3 && "Disagreements are being tested."}
              {loadingStep === 4 && "Understanding is crystallizing."}
              {loadingStep === 5 && "Understanding emerged."}
            </h1>
            <p style={bodyStyle}>
              Discovery is moving from evidence to patterns to a current belief.
            </p>
            <Organism score={Math.min(loadingStep * 20, 90)} />
          </section>
        )}

        {!result && !loading && (
          <>
            <section style={heroIntroStyle}>
              <p style={eyebrowStyle}>Discovery Alpha</p>
              <h1 style={bigTitleStyle}>Organizational understanding emerges.</h1>
              <p style={subtitleStyle}>
                Paste messy strategy notes, customer signals, investor thoughts,
                market facts, or leadership questions. Discovery will build a
                current belief and show what would strengthen or weaken it.
              </p>
            </section>

            <section style={inputPanelStyle}>
              <div style={inputGridStyle}>
                <input style={inputStyle} placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                <input style={inputStyle} placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
                <input style={inputStyle} placeholder="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                <input style={inputStyle} placeholder="Strategic question" value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>

              <textarea
                style={textareaStyle}
                placeholder="Paste messy strategy notes, observations, customer feedback, market facts, investor thoughts, risks, opportunities, or open questions..."
                value={messyInput}
                onChange={(e) => setMessyInput(e.target.value)}
              />

              <button style={buttonStyle} onClick={runInvestigation} disabled={loading}>
                Begin investigation
              </button>
            </section>
          </>
        )}

        {result && (
          <section style={resultGridStyle}>
            <div style={emergencePanelStyle}>
              <p style={eyebrowStyle}>Understanding</p>
              <h1 style={resultTitleStyle}>Understanding emerged.</h1>
              <p style={bodyStyle}>
                {evidenceAtoms.length} evidence point(s) have resolved into a
                current testable belief. Discovery is ready for questions.
              </p>

              <Organism score={understandingScore} />

              <div style={dividerStyle} />

              <p style={smallEyebrowStyle}>Coherence formed</p>

              <TimelineItem
                label="Evidence"
                text={`${evidenceAtoms.length} evidence point(s) surfaced.`}
              />
              <TimelineItem
                label="Patterns"
                text={`${v3?.themes?.length || 0} recurring pattern(s) detected.`}
              />
              <TimelineItem
                label="Tensions"
                text={`${v3?.contradictions?.length || 0} disagreement(s) found.`}
              />
              <TimelineItem
                label="Belief"
                text="Discovery formed a current belief from the investigation."
              />

              <div style={changeBoxStyle}>
                <p style={smallEyebrowStyle}>What changed</p>
                <p style={bodyStyle}>
                  Raw evidence became patterns, explanations, and a current
                  belief that can now be tested or challenged.
                </p>
              </div>
            </div>

            <div style={rightStackStyle}>
              <section style={beliefCardStyle}>
                <div style={beliefHeaderStyle}>
                  <p style={smallEyebrowStyle}>Discovery’s Current Belief</p>
                  <span style={{ opacity: 0.7 }}>{understandingScore}% strength</span>
                </div>

                <h2 style={beliefTitleStyle}>
                  {understanding?.headline || "No dominant belief yet."}
                </h2>

                <p style={bodyStyle}>
                  {getShortBeliefSummary(understanding?.headline)}
                </p>

                <button
                  onClick={() => setShowWhy(!showWhy)}
                  style={linkButtonStyle}
                >
                  {showWhy ? "Hide reasoning" : "How Discovery got here"}
                </button>
              </section>

              <section style={briefCardStyle}>
                <p style={smallEyebrowStyle}>Stewardship Brief</p>
                <h2 style={briefTitleStyle}>Takeaway, action, and why it matters.</h2>

                <h3 style={subheadStyle}>Best next step</h3>
                <ul style={ulStyle}>
                  {understanding?.nextMoves?.map((move: string, i: number) => (
                    <li key={i}>{move}</li>
                  ))}
                </ul>

                <h3 style={subheadStyle}>What would make this clearer</h3>
                <ul style={ulStyle}>
                  {understanding?.openQuestions?.map((q: string, i: number) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>

                <div style={metricGridStyle}>
                  <Metric label="Evidence" value={evidenceAtoms.length} />
                  <Metric label="Strength" value={`${understandingScore}%`} />
                </div>
              </section>

              <button
                onClick={() => setShowWhy(!showWhy)}
                style={secondaryButtonStyle}
              >
                {showWhy ? "Hide Discovery’s reasoning" : "Inspect the investigation"}
              </button>
            </div>
          </section>
        )}

        {result && showWhy && (
          <section style={reasoningStyle}>
            <Section title="How Discovery got here">
              <div style={whyStackStyle}>
                <MiniCard
                  title="1. A current belief formed"
                  summary={understanding?.headline || "Discovery formed a current belief."}
                >
                  <p>{understanding?.explanation}</p>
                  <Confidence value={understanding?.confidence} />
                </MiniCard>

                <MiniCard
                  title="2. Possible understandings competed"
                  summary={`${v3?.explanations?.length || 0} possible interpretation(s) competed for the strongest explanation.`}
                >
                  <div style={cardGridStyle}>
                    {v3?.explanations?.map((explanation: any) => (
                      <MiniCard
                        key={explanation.id}
                        title={explanation.title}
                        summary={getExplanationSummary(explanation.title)}
                      >
                        <p>{explanation.explanation}</p>
                        <Confidence value={explanation.confidence} />
                      </MiniCard>
                    ))}
                  </div>
                </MiniCard>

                <MiniCard
                  title="3. Possible mechanisms appeared"
                  summary={`${v3?.causalChains?.length || 0} possible cause-and-effect pathway(s) were found.`}
                >
                  <div style={cardGridStyle}>
                    {v3?.causalChains?.map((chain: any) => (
                      <MiniCard
                        key={chain.id}
                        title={chain.cause}
                        summary={getCauseSummary(chain.cause)}
                      >
                        <p><strong>Mechanism:</strong> {chain.mechanism}</p>
                        <p><strong>Effect:</strong> {chain.effect}</p>
                        <Confidence value={chain.confidence} />
                      </MiniCard>
                    ))}
                  </div>
                </MiniCard>

                <MiniCard
                  title="4. Discovery checked for disagreement"
                  summary={`${v3?.contradictions?.length || 0} tension(s) complicated the belief.`}
                >
                  <div style={cardGridStyle}>
                    {v3?.contradictions?.map((item: any) => (
                      <MiniCard
                        key={item.id}
                        title={item.title}
                        summary="Two parts of the investigation are pointing in different directions."
                      >
                        <p>{item.explanation}</p>
                        <Confidence value={item.confidence} />
                      </MiniCard>
                    ))}
                  </div>
                </MiniCard>

                <MiniCard
                  title="5. Recurring patterns formed"
                  summary={`${v3?.themes?.length || 0} recurring pattern(s) appeared across the evidence.`}
                >
                  <div style={cardGridStyle}>
                    {v3?.themes?.map((theme: any) => (
                      <MiniCard
                        key={theme.id}
                        title={theme.title}
                        summary={getThemeSummary(theme.title)}
                      >
                        <p>{theme.description}</p>
                        <Confidence value={theme.confidence} />
                      </MiniCard>
                    ))}
                  </div>
                </MiniCard>

                <MiniCard
                  title="6. Supporting evidence"
                  summary={`${evidenceAtoms.length} evidence point(s) support the investigation.`}
                >
                  <div style={listStyle}>
                    {evidenceAtoms.map((item: any) => (
                      <EvidenceRow key={item.id} text={item.text} type={item.type} />
                    ))}
                  </div>
                </MiniCard>
              </div>
            </Section>
          </section>
        )}
      </section>
    </main>
  );
}

function getExplanationSummary(title?: string): string {
  if (!title) return "A possible interpretation of the evidence.";

  if (title.includes("Leadership confidence")) {
    return "Leadership’s story may be stronger than the proof underneath it.";
  }

  if (title.includes("Customer concerns")) {
    return "Customer friction may be limiting momentum beneath the surface.";
  }

  if (title.includes("Growth expectations")) {
    return "Growth expectations may be moving faster than durable evidence.";
  }

  if (title.includes("strategic bet")) {
    return "The opportunity may be real, but it still needs validation.";
  }

  return "A possible interpretation of the evidence.";
}

function getCauseSummary(cause?: string): string {
  if (!cause) return "A possible mechanism connecting evidence to outcome.";

  if (cause.includes("Leadership Narrative Gap")) {
    return "Leadership confidence may not fully match operational reality.";
  }

  if (cause.includes("Customer Friction")) {
    return "Customer resistance may be slowing otherwise strong momentum.";
  }

  if (cause.includes("Growth Pressure")) {
    return "Expectations may be rising faster than proof.";
  }

  if (cause.includes("Strategic Bet Uncertainty")) {
    return "The strategic bet needs sharper evidence before it becomes durable.";
  }

  return "A possible mechanism connecting evidence to outcome.";
}

function getThemeSummary(title?: string): string {
  if (!title) return "A recurring pattern in the evidence.";

  if (title.includes("Leadership Narrative Gap")) {
    return "Leadership messaging and evidence are not fully aligned.";
  }

  if (title.includes("Customer Friction")) {
    return "Customers are signaling resistance or hesitation.";
  }

  if (title.includes("Growth Pressure")) {
    return "Growth expectations are becoming a central pressure point.";
  }

  if (title.includes("Strategic Bet Uncertainty")) {
    return "A major bet is visible, but not yet fully proven.";
  }

  return "A recurring pattern in the evidence.";
}

function getShortBeliefSummary(headline?: string): string {
  if (!headline) {
    return "Discovery has not formed a strong belief yet.";
  }

  if (headline.includes("Leadership confidence")) {
    return "Leadership’s story appears stronger than the evidence currently supporting it.";
  }

  if (headline.includes("Customer concerns")) {
    return "Customer friction may be limiting momentum even where demand appears strong.";
  }

  if (headline.includes("Growth expectations")) {
    return "Growth expectations may be moving faster than durable proof.";
  }

  if (headline.includes("strategic bet")) {
    return "The opportunity looks meaningful, but the bet still needs sharper validation.";
  }

  return "Discovery has formed a testable belief from the available evidence.";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 26, marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div style={metricStyle}>
      <strong style={{ fontSize: 26 }}>{value}</strong>
      <span style={{ opacity: 0.7 }}>{label}</span>
    </div>
  );
}

function MiniCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={miniCardStyle}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      {!open && (
        <p style={{ lineHeight: 1.45, opacity: 0.72 }}>
          {summary}
        </p>
      )}

      {open && (
        <div style={{ lineHeight: 1.55, opacity: 0.86 }}>
          {children}
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={linkButtonStyle}>
        {open ? "Show less" : "Learn why →"}
      </button>
    </div>
  );
}

function EvidenceRow({ text, type }: { text: string; type: string }) {
  return (
    <div style={evidenceRowStyle}>
      <span style={pillStyle}>{type}</span>
      <p>{text}</p>
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  const percent = Math.round((value || 0) * 100);
  return (
    <>
      <div style={meterOuterStyle}>
        <div style={{ ...meterInnerStyle, width: `${percent}%` }} />
      </div>
      <p style={{ opacity: 0.72 }}>{percent}% confidence</p>
    </>
  );
}

function TimelineItem({ label, text }: { label: string; text: string }) {
  return (
    <div style={timelineItemStyle}>
      <span style={dotStyle} />
      <div>
        <p style={smallEyebrowStyle}>{label}</p>
        <p style={{ ...bodyStyle, margin: 0 }}>{text}</p>
      </div>
    </div>
  );
}

function Organism({ score }: { score: number }) {
  return (
    <div style={organismWrapStyle}>
      <div style={nodeLargeStyle} />
      <div style={{ ...nodeStyle, left: "38%", top: "34%" }} />
      <div style={{ ...nodeStyle, left: "57%", top: "30%" }} />
      <div style={{ ...nodeStyle, left: "48%", top: "52%" }} />
      <div style={{ ...nodeSmallStyle, left: "64%", top: "48%" }} />
      <span style={organismScoreStyle}>{score}% legible</span>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 20% 20%, rgba(209,170,91,0.14), transparent 28%), #070806",
  color: "#f4efe4",
  padding: 28,
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const shellStyle: React.CSSProperties = {
  maxWidth: 1420,
  margin: "0 auto",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 52,
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  fontSize: 20,
};

const dotStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 999,
  background: "#e5bd62",
  display: "inline-block",
  boxShadow: "0 0 18px rgba(229,189,98,0.65)",
};

const pillStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.16)",
  borderRadius: 999,
  padding: "8px 14px",
  opacity: 0.78,
};

const heroIntroStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "80px auto 40px",
  textAlign: "center",
};

const loadingPanelStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "90px auto",
  border: "1px solid rgba(229,189,98,0.22)",
  borderRadius: 34,
  padding: 42,
  background: "rgba(229,189,98,0.06)",
  textAlign: "center",
};

const eyebrowStyle: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: 7,
  color: "#e5bd62",
  fontWeight: 800,
  fontSize: 13,
};

const smallEyebrowStyle: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: 5,
  color: "#e5bd62",
  fontWeight: 800,
  fontSize: 12,
  margin: "0 0 10px",
};

const bigTitleStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "clamp(64px, 9vw, 132px)",
  lineHeight: 0.9,
  margin: "18px 0",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 22,
  lineHeight: 1.5,
  opacity: 0.72,
};

const inputPanelStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  border: "1px solid rgba(244,239,228,0.14)",
  borderRadius: 34,
  padding: 28,
  background: "rgba(255,255,255,0.04)",
};

const inputGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 16,
  borderRadius: 18,
  border: "1px solid rgba(244,239,228,0.14)",
  background: "rgba(0,0,0,0.28)",
  color: "#f4efe4",
  fontSize: 16,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 180,
  marginTop: 12,
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  width: "100%",
  padding: "18px 24px",
  borderRadius: 999,
  border: "none",
  background: "linear-gradient(90deg, #f0d890, #c99b3d)",
  color: "#0b0b08",
  fontSize: 18,
  cursor: "pointer",
};

const resultGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: 28,
  alignItems: "start",
};

const emergencePanelStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.16)",
  borderRadius: 34,
  padding: 42,
  background: "rgba(255,255,255,0.045)",
};

const resultTitleStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "clamp(48px, 6vw, 82px)",
  lineHeight: 0.95,
  margin: "10px 0 16px",
};

const bodyStyle: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1.55,
  opacity: 0.72,
};

const organismWrapStyle: React.CSSProperties = {
  position: "relative",
  height: 340,
  margin: "20px 0",
};

const nodeLargeStyle: React.CSSProperties = {
  position: "absolute",
  left: "45%",
  top: "45%",
  width: 78,
  height: 78,
  borderRadius: 999,
  background: "rgba(229,189,98,0.7)",
  filter: "blur(8px)",
  boxShadow: "0 0 55px rgba(229,189,98,0.8)",
};

const nodeStyle: React.CSSProperties = {
  position: "absolute",
  width: 22,
  height: 22,
  borderRadius: 999,
  background: "#e5bd62",
  boxShadow: "0 0 24px rgba(229,189,98,0.8)",
};

const nodeSmallStyle: React.CSSProperties = {
  position: "absolute",
  width: 18,
  height: 18,
  borderRadius: 999,
  background: "#d39472",
  boxShadow: "0 0 22px rgba(211,148,114,0.8)",
};

const organismScoreStyle: React.CSSProperties = {
  position: "absolute",
  left: "43%",
  bottom: 18,
  border: "1px solid rgba(244,239,228,0.16)",
  borderRadius: 999,
  padding: "8px 14px",
  opacity: 0.8,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "rgba(244,239,228,0.16)",
  margin: "26px 0",
};

const timelineItemStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  border: "1px solid rgba(229,189,98,0.18)",
  borderRadius: 18,
  padding: 16,
  marginBottom: 10,
  background: "rgba(229,189,98,0.04)",
};

const changeBoxStyle: React.CSSProperties = {
  border: "1px solid rgba(229,189,98,0.22)",
  borderRadius: 18,
  padding: 18,
  marginTop: 18,
  background: "rgba(229,189,98,0.06)",
};

const rightStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 22,
};

const beliefCardStyle: React.CSSProperties = {
  border: "1px solid rgba(229,189,98,0.28)",
  borderRadius: 30,
  padding: 34,
  background: "rgba(229,189,98,0.08)",
};

const beliefHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};

const beliefTitleStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 42,
  lineHeight: 1,
  margin: "16px 0",
};

const briefCardStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.16)",
  borderRadius: 30,
  padding: 34,
  background: "rgba(255,255,255,0.045)",
};

const briefTitleStyle: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: 46,
  lineHeight: 1,
  margin: "10px 0 24px",
};

const subheadStyle: React.CSSProperties = {
  fontSize: 20,
  marginTop: 22,
};

const ulStyle: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1.6,
  opacity: 0.78,
};

const metricGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
  marginTop: 22,
};

const metricStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.14)",
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gap: 4,
};

const linkButtonStyle: React.CSSProperties = {
  marginTop: 18,
  background: "transparent",
  border: "none",
  color: "#e5bd62",
  fontSize: 18,
  cursor: "pointer",
  padding: 0,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "16px 24px",
  borderRadius: 999,
  border: "1px solid rgba(244,239,228,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "#f4efe4",
  fontSize: 17,
  cursor: "pointer",
};

const reasoningStyle: React.CSSProperties = {
  marginTop: 34,
  borderTop: "1px solid rgba(244,239,228,0.12)",
  paddingTop: 24,
};

const whyStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 18,
  maxWidth: 980,
};

const cardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
};

const miniCardStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.14)",
  borderRadius: 22,
  padding: 22,
  background: "rgba(255,255,255,0.04)",
};

const listStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const evidenceRowStyle: React.CSSProperties = {
  border: "1px solid rgba(244,239,228,0.12)",
  borderRadius: 18,
  padding: 16,
  background: "rgba(255,255,255,0.035)",
};

const meterOuterStyle: React.CSSProperties = {
  height: 10,
  borderRadius: 999,
  background: "rgba(244,239,228,0.12)",
  overflow: "hidden",
  marginTop: 18,
};

const meterInnerStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #f0d890, #c99b3d)",
};