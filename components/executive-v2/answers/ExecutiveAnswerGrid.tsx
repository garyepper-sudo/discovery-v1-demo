import type {
  ExecutiveProjection,
  ExecutiveTheoryValidation,
} from "../projection/ExecutiveProjection";

type ExecutiveAnswerGridProps = {
  explanation: ExecutiveProjection["explanation"];
  theoryValidation?: ExecutiveTheoryValidation;
};

export default function ExecutiveAnswerGrid({
  explanation,
  theoryValidation,
}: ExecutiveAnswerGridProps) {
  const why =
    theoryValidation?.whyDiscoveryBelievesIt ??
    explanation.why;

  const whatCouldChangeThis =
    theoryValidation?.calibratedConfidenceExplanation ??
    explanation.whatCouldChangeThis;

  const nextMove =
    theoryValidation?.executiveRecommendation ??
    explanation.nextMove;

  return (
    <section className="executive-v2-answer-grid executive-v2-answer-grid-quiet">
      <article className="executive-v2-answer">
        <p className="executive-v2-answer-label">
          Why Discovery believes this
        </p>

        <p className="executive-v2-answer-copy">
          {why}
        </p>

        {theoryValidation?.supportingMechanisms?.length ? (
          <ul className="executive-v2-answer-list">
            {theoryValidation.supportingMechanisms
              .slice(0, 3)
              .map((item) => (
                <li key={item.label}>
                  {item.label}
                </li>
              ))}
          </ul>
        ) : null}
      </article>

      <article className="executive-v2-answer">
        <p className="executive-v2-answer-label">
          What could change this
        </p>

        <p className="executive-v2-answer-copy">
          {whatCouldChangeThis}
        </p>

        {theoryValidation?.evidenceThatWouldFalsifyTheory
          ?.length ? (
          <ul className="executive-v2-answer-list">
            {theoryValidation.evidenceThatWouldFalsifyTheory
              .slice(0, 3)
              .map((item) => (
                <li key={item}>
                  {item}
                </li>
              ))}
          </ul>
        ) : null}
      </article>

      <article className="executive-v2-answer executive-v2-investigation">
        <div>
          <p className="executive-v2-answer-label">
            Recommended investigation
          </p>

          <p className="executive-v2-answer-copy">
            {nextMove}
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