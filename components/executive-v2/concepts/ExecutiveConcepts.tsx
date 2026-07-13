import type { ExecutiveOrganizationalConcept } from "../projection/ExecutiveProjection";

type ExecutiveConceptsProps = {
  concepts: ExecutiveOrganizationalConcept[];
};

function formatStatus(status: string): string {
  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatSupportingConditions(
  supportingConditions: string[],
): string {
  if (supportingConditions.length === 1) {
    return `Supports ${supportingConditions[0]}`;
  }

  return `Supports ${supportingConditions.join(", ")}`;
}

export default function ExecutiveConcepts({
  concepts,
}: ExecutiveConceptsProps) {
  const visibleConcepts = concepts.slice(0, 3);

  return (
    <section className="executive-v2-concepts">
      <div className="executive-v2-section-header">
        <span className="executive-v2-section-eyebrow">
          Organizational Concepts
        </span>

        <h2>Recurring organizational patterns Discovery has learned</h2>
      </div>

      <div className="executive-v2-beliefs-grid">
        {visibleConcepts.map((concept) => (
          <article
            key={concept.id}
            className="executive-v2-belief-card"
          >
            <div className="executive-v2-belief-card-header">
              <span className="executive-v2-belief-trend">
                {formatStatus(concept.status)}
              </span>

              <strong>{concept.confidence}% confidence</strong>
            </div>

            <h3>{concept.label}</h3>

            <p>{concept.statement}</p>

            {concept.supportingConditions.length > 0 && (
              <p className="executive-v2-concept-conditions">
                {formatSupportingConditions(
                  concept.supportingConditions,
                )}
              </p>
            )}

            <div className="executive-v2-belief-support">
              <span>
                {concept.evidenceCount} supporting understandings
              </span>

              <span>
                {concept.emergenceScore}% emergence
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}