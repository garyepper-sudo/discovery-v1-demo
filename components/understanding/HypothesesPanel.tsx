"use client";

import { useState } from "react";

type Hypothesis = {
  id: string;
  title: string;
  explanation: string;
  status: "leading" | "plausible" | "weak" | "challenged";
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  distinguishingQuestions: string[];
};

type HypothesesPanelProps = {
  hypotheses?: Hypothesis[];
};

export default function HypothesesPanel({
  hypotheses = [],
}: HypothesesPanelProps) {
  const [open, setOpen] = useState(false);

  if (!hypotheses.length) return null;

  const leading = hypotheses[0];

  return (
    <section className="hypotheses-panel">
      <button
        className="hypotheses-summary"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <p className="hypotheses-kicker">Competing explanations</p>
          <h3>{leading.title}</h3>
          <p>
            Discovery is comparing {hypotheses.length} possible explanation
            {hypotheses.length === 1 ? "" : "s"}.
          </p>
        </div>

        <span>{open ? "Hide" : "Explore"}</span>
      </button>

      {open && (
        <div className="hypotheses-list">
          {hypotheses.slice(0, 4).map((hypothesis) => (
            <article className="hypothesis-card" key={hypothesis.id}>
              <div className="hypothesis-card-header">
                <span>{hypothesis.status}</span>
                <strong>{Math.round(hypothesis.confidence * 100)}%</strong>
              </div>

              <h4>{hypothesis.title}</h4>
              <p>{hypothesis.explanation}</p>

              <details>
                <summary>Why Discovery is considering this</summary>

                <div className="hypothesis-details">
                  <div>
                    <b>Strengths</b>
                    <ul>
                      {hypothesis.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <b>Weaknesses</b>
                    <ul>
                      {hypothesis.weaknesses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <b>What would distinguish it</b>
                    <ul>
                      {hypothesis.distinguishingQuestions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}