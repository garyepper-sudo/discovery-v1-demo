"use client";

import { useMemo, useState } from "react";

type LabStage =
  | "evidence"
  | "observations"
  | "concepts"
  | "patterns"
  | "beliefs"
  | "simulation"
  | "executive";

type ExpertNotes = Record<LabStage, string>;

const STAGES: { id: LabStage; label: string }[] = [
  { id: "evidence", label: "Evidence" },
  { id: "observations", label: "Observations" },
  { id: "concepts", label: "Concepts" },
  { id: "patterns", label: "Patterns" },
  { id: "beliefs", label: "Beliefs" },
  { id: "simulation", label: "Simulation" },
  { id: "executive", label: "Executive Understanding" },
];

const SAMPLE_EVIDENCE = `Engineering hired only 3 of 12 planned engineers.

Recruiting says candidate acceptance rates are falling.

The Product launch will likely slip six weeks because teams are understaffed.

Finance approved contractor spending to bridge staffing gaps.

The CEO noted that the company may not be able to service a large contract scheduled to begin in two months.`;

const EMPTY_NOTES: ExpertNotes = {
  evidence: "",
  observations: "",
  concepts: "",
  patterns: "",
  beliefs: "",
  simulation: "",
  executive: "",
};

export default function CognitiveLabPage() {
  const [evidence, setEvidence] = useState(SAMPLE_EVIDENCE);
  const [stageIndex, setStageIndex] = useState(0);
  const [expertNotes, setExpertNotes] = useState<ExpertNotes>(EMPTY_NOTES);

  const observations = stageIndex >= 1
    ? [
        "Engineering hiring is below plan.",
        "Candidate acceptance rates are declining.",
        "Product delivery is delayed because teams are understaffed.",
        "Contractors are being used to offset staffing shortages.",
        "A large upcoming contract may be difficult to service.",
      ]
    : [];

  const concepts = stageIndex >= 2
    ? [
        "Talent Acquisition",
        "Execution Capacity",
        "Revenue Forecast Risk",
        "Contract Delivery Risk",
      ]
    : [];

  const patterns = stageIndex >= 3
    ? [
        "Execution capacity appears constrained by talent acquisition. Confidence: 68%",
      ]
    : [];

  const beliefs = stageIndex >= 4
    ? [
        "Talent acquisition may become a near-term limiter of revenue execution. Confidence: 61%",
      ]
    : [];

  const simulation = stageIndex >= 5
    ? [
        "Hiring shortfall may reduce delivery capacity.",
        "Reduced delivery capacity may affect the ability to service the upcoming contract.",
        "If the contract cannot be serviced on time, revenue forecast accuracy may weaken.",
        "Contractor spending may increase to compensate for staffing gaps.",
      ]
    : [];

  const executiveUnderstanding =
    stageIndex >= 6
      ? "Discovery sees an emerging capacity risk: hiring delays are not merely an HR issue; they may affect contract delivery, contractor spend, and revenue forecast reliability over the next two months."
      : "";

  const activeStage = STAGES[stageIndex];

  const discoveryText = useMemo(() => {
    if (activeStage.id === "evidence") return evidence;
    if (activeStage.id === "observations") return observations.join("\n");
    if (activeStage.id === "concepts") return concepts.join("\n");
    if (activeStage.id === "patterns") return patterns.join("\n");
    if (activeStage.id === "beliefs") return beliefs.join("\n");
    if (activeStage.id === "simulation") return simulation.join("\n");
    return executiveUnderstanding;
  }, [
    activeStage.id,
    evidence,
    observations,
    concepts,
    patterns,
    beliefs,
    simulation,
    executiveUnderstanding,
  ]);

  const expertText = expertNotes[activeStage.id];

  const hasDifference =
    expertText.trim().length > 0 &&
    discoveryText.trim().toLowerCase() !== expertText.trim().toLowerCase();

  function stepForward() {
    setStageIndex((current) => Math.min(current + 1, STAGES.length - 1));
  }

  function runAll() {
    setStageIndex(STAGES.length - 1);
  }

  function reset() {
    setStageIndex(0);
    setExpertNotes(EMPTY_NOTES);
  }

  function updateExpertNote(value: string) {
    setExpertNotes((current) => ({
      ...current,
      [activeStage.id]: value,
    }));
  }

  return (
    <main className="cognitive-lab-page">
      <header className="cognitive-lab-header">
        <div>
          <p className="lab-kicker">Discovery Internal</p>
          <h1>Cognitive Lab v0.2</h1>
          <p>
            Compare Discovery’s reasoning against expert reasoning at every
            cognitive stage.
          </p>
        </div>

        <div className="lab-actions">
          <button onClick={stepForward}>Step Forward</button>
          <button onClick={runAll}>Run All</button>
          <button onClick={reset}>Reset</button>
        </div>
      </header>

      <section className="lab-stage-strip">
        {STAGES.map((stage, index) => (
          <button
            key={stage.id}
            className={[
              "lab-stage-pill",
              index === stageIndex ? "active" : "",
              index < stageIndex ? "complete" : "",
            ].join(" ")}
            onClick={() => setStageIndex(index)}
          >
            <span>{index + 1}</span>
            {stage.label}
          </button>
        ))}
      </section>

      <section className="cognitive-lab-grid lab-grid-five">
        <section className="lab-panel">
          <div className="lab-panel-header">
            <p>Input</p>
            <h2>Evidence</h2>
          </div>

          <textarea
            value={evidence}
            onChange={(event) => setEvidence(event.target.value)}
          />
        </section>

        <section className="lab-panel">
          <div className="lab-panel-header">
            <p>Discovery Thinking</p>
            <h2>{activeStage.label}</h2>
          </div>

          <LabBlock title="Observations" items={observations} />
          <LabBlock title="Concepts" items={concepts} />
          <LabBlock title="Patterns" items={patterns} />
          <LabBlock title="Beliefs" items={beliefs} />
          <LabBlock title="Simulation" items={simulation} />
        </section>

        <section className="lab-panel expert-panel">
          <div className="lab-panel-header">
            <p>Expert Reasoning</p>
            <h2>Your Interpretation</h2>
          </div>

          <p className="expert-prompt">
            At this stage, what would an experienced executive notice,
            compress, question, or forecast?
          </p>

          <textarea
            className="expert-textarea"
            value={expertText}
            onChange={(event) => updateExpertNote(event.target.value)}
            placeholder="Write your reasoning here..."
          />

          {hasDifference && (
            <div className="difference-card">
              <p>Difference Detected</p>
              <h3>Discovery and expert reasoning diverged.</h3>
              <span>
                This is useful. The gap may reveal a missing concept,
                premature abstraction, weak simulation, or wrong level of
                analysis.
              </span>
            </div>
          )}
        </section>

        <section className="lab-panel">
          <div className="lab-panel-header">
            <p>Research</p>
            <h2>Cognitive Gap</h2>
          </div>

          {hasDifference ? (
            <div className="research-question-card">
              <p>Research Question</p>
              <h3>
                Why did Discovery produce this stage differently than the expert?
              </h3>

              <div className="compare-box">
                <strong>Discovery</strong>
                <span>{discoveryText || "No Discovery output yet."}</span>
              </div>

              <div className="compare-box">
                <strong>Expert</strong>
                <span>{expertText}</span>
              </div>
            </div>
          ) : (
            <p className="empty-state">
              Add expert reasoning that differs from Discovery to create a
              research question.
            </p>
          )}
        </section>

        <section className="lab-panel executive-panel">
          <div className="lab-panel-header">
            <p>Output</p>
            <h2>Executive Understanding</h2>
          </div>

          {executiveUnderstanding ? (
            <p className="executive-output">{executiveUnderstanding}</p>
          ) : (
            <p className="empty-state">
              Step through the cognitive loop to generate executive
              understanding.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

function LabBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="lab-block">
      <h3>{title}</h3>

      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Waiting for this stage.</p>
      )}
    </div>
  );
}