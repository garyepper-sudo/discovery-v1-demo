import type { ExecutiveOrganizationalBelief } from "../projection/ExecutiveProjection";

type ExecutiveBeliefsProps = {
  beliefs: ExecutiveOrganizationalBelief[];
};

function formatTrend(trend: string): string {
  return trend
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ExecutiveBeliefs({
  beliefs,
}: ExecutiveBeliefsProps) {
  const visibleBeliefs = beliefs.slice(0, 3);

  return (
    <section className="executive-v2-beliefs">
      <div className="executive-v2-section-header">
        <span className="executive-v2-section-eyebrow">
          Organizational Beliefs
        </span>

        <h2>What Discovery currently believes</h2>
      </div>

      <div className="executive-v2-beliefs-grid">
        {visibleBeliefs.map((belief, index) => (
          <article
            key={`${belief.statement}-${index}`}
            className="executive-v2-belief-card"
          >
            <div className="executive-v2-belief-card-header">
              <span className="executive-v2-belief-trend">
                {formatTrend(belief.trend)}
              </span>

              <strong>{belief.confidence}% confidence</strong>
            </div>

            <h3>{belief.statement}</h3>

            <div className="executive-v2-belief-support">
              <span>
                {belief.supportingMechanisms.length} supporting mechanisms
              </span>

              <span>
                {belief.supportingConcepts.length} supporting concepts
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}