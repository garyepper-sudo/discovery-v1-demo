import type { ExecutiveProjection } from "../projection/ExecutiveProjection";

type ExecutiveAnswerGridProps = {
  explanation: ExecutiveProjection["explanation"];
};

export default function ExecutiveAnswerGrid({
  explanation,
}: ExecutiveAnswerGridProps) {
  return (
    <section className="executive-v2-answer-grid executive-v2-answer-grid-quiet">
      <article className="executive-v2-answer">
        <p className="executive-v2-answer-label">Why?</p>

        <p className="executive-v2-answer-copy">
          {explanation.why}
        </p>
      </article>

      <article className="executive-v2-answer">
        <p className="executive-v2-answer-label">
          What could change this?
        </p>

        <p className="executive-v2-answer-copy">
          {explanation.whatCouldChangeThis}
        </p>
      </article>

      <article className="executive-v2-answer executive-v2-investigation">
        <div>
          <p className="executive-v2-answer-label">Next move</p>

          <p className="executive-v2-answer-copy">
            {explanation.nextMove}
          </p>
        </div>

        <button
          type="button"
          className="executive-v2-start-button"
        >
          Start Investigation
        </button>
      </article>
    </section>
  );
}