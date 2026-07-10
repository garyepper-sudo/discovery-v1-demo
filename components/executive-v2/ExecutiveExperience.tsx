"use client";

import ExecutiveAnswerGrid from "./answers/ExecutiveAnswerGrid";
import ExecutiveAttention from "./attention/ExecutiveAttention";
import type { ExecutiveProjection } from "./projection/ExecutiveProjection";
import UnderstandingCanvas from "./understanding/UnderstandingCanvas";

type ExecutiveExperienceProps = {
  projection: ExecutiveProjection;
};

export default function ExecutiveExperience({
  projection,
}: ExecutiveExperienceProps) {
  const {
    currentUnderstanding,
    explanation,
    executiveAttention,
  } = projection;

  return (
    <main className="executive-v2-experience">
      <div className="executive-v2-shell">
        <header className="executive-v2-header">
          <div className="executive-v2-brand">
            <span className="executive-v2-brand-dot" />
            <span>Discovery</span>
          </div>
        </header>

        <UnderstandingCanvas
          belief={currentUnderstanding.belief}
          mindStatus={currentUnderstanding.mindStatus}
          confidence={currentUnderstanding.confidence}
          organizationalCoherence={
            currentUnderstanding.organizationalCoherence
          }
        />

        <ExecutiveAttention
          attention={executiveAttention}
        />

        <ExecutiveAnswerGrid
          explanation={explanation}
        />
      </div>
    </main>
  );
}