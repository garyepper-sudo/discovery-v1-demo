"use client";

type SemanticConceptInspectorProps = {
  runtime?: any;
};

function formatPercent(value: unknown): string {
  if (typeof value !== "number") return "0%";
  return `${Math.round(value * 100)}%`;
}

function getConceptTone(status?: string): string {
  if (status === "stable") return "Stable";
  if (status === "reinforced") return "Reinforced";
  return "New";
}

export default function SemanticConceptInspector({
  runtime,
}: SemanticConceptInspectorProps) {
  const concepts = runtime?.memory?.semanticConcepts || [];
  const understandings =
    runtime?.memory?.organizationalUnderstandingState?.currentUnderstandings ||
    [];

  if (!concepts.length) {
    return (
      <section className="semantic-concept-inspector">
        <div className="inspector-card">
          <p className="eyebrow">Semantic Compression</p>
          <h3>No compressed concepts yet</h3>
          <p>
            Discovery has not yet compressed accumulated understandings into
            semantic concepts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="semantic-concept-inspector">
      <div className="inspector-card">
        <p className="eyebrow">Semantic Compression</p>
        <h3>Compressed Concepts</h3>
        <p>
          Discovery compressed {understandings.length} understandings into{" "}
          {concepts.length} explanatory concepts.
        </p>

        <div className="concept-list">
          {concepts.map((concept: any) => {
            const supportingUnderstandings = understandings.filter(
              (understanding: any) =>
                concept.understandingIds?.includes(understanding.id)
            );

            return (
              <article className="concept-card" key={concept.id}>
                <div className="concept-card-header">
                  <div>
                    <p className="concept-status">
                      {getConceptTone(concept.status)}
                    </p>
                    <h4>{concept.statement}</h4>
                  </div>

                  <div className="concept-score">
                    {formatPercent(concept.explanatoryPower)}
                  </div>
                </div>

                <p className="concept-summary">{concept.summary}</p>

                <div className="concept-metrics">
                  <span>Coverage {formatPercent(concept.coverage)}</span>
                  <span>Confidence {formatPercent(concept.confidence)}</span>
                  <span>Stability {formatPercent(concept.stability)}</span>
                  <span>Novelty {formatPercent(concept.novelty)}</span>
                </div>

                <details className="concept-details">
                  <summary>Supporting understandings</summary>

                  {supportingUnderstandings.length ? (
                    <ul>
                      {supportingUnderstandings.map((understanding: any) => (
                        <li key={understanding.id}>
                          {understanding.statement ||
                            understanding.summary ||
                            understanding.title ||
                            understanding.label ||
                            "Untitled understanding"}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No supporting understandings found.</p>
                  )}
                </details>

                <p className="concept-explanation">{concept.explanation}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}