import type { ExecutiveInvestigationOpportunity } from "../projection/ExecutiveProjection";

type ExecutiveInvestigationOpportunitiesProps = {
  opportunities: ExecutiveInvestigationOpportunity[];
};

export default function ExecutiveInvestigationOpportunities({
  opportunities,
}: ExecutiveInvestigationOpportunitiesProps) {
  const visibleOpportunities = opportunities.slice(0, 3);

  return (
    <section className="executive-v2-investigations">
      <div className="executive-v2-section-header">
        <span className="executive-v2-section-eyebrow">
          Investigation Opportunities
        </span>

        <h2>What Discovery recommends investigating next</h2>
      </div>

      <div className="executive-v2-investigations-grid">
        {visibleOpportunities.map((opportunity, index) => (
          <article
            key={`${opportunity.topic}-${index}`}
            className="executive-v2-investigation-card"
          >
            <div className="executive-v2-investigation-card-header">
              <h3>{opportunity.topic}</h3>

              <strong>
                +{opportunity.expectedConfidenceGain}% confidence
              </strong>
            </div>

            <p>{opportunity.reason}</p>

            <div className="executive-v2-investigation-question">
              <span>Executive question</span>
              <p>{opportunity.suggestedExecutiveQuestion}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}