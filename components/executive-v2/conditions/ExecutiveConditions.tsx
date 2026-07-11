import type { ExecutiveOrganizationalCondition } from "../projection/ExecutiveProjection";

type ExecutiveConditionsProps = {
  conditions: ExecutiveOrganizationalCondition[];
};

export default function ExecutiveConditions({
  conditions,
}: ExecutiveConditionsProps) {
  if (conditions.length === 0) {
    return null;
  }

  return (
    <section className="executive-v2-conditions">
      <div className="executive-v2-attention-heading">
        <p className="executive-v2-answer-label">
          Organizational conditions
        </p>

        <span>
          {conditions.length} active
        </span>
      </div>

      {conditions.slice(0, 4).map((condition) => (
        <article
          key={condition.name}
          className="executive-v2-condition"
        >
          <div className="executive-v2-condition-header">
            <h3>{condition.name}</h3>

            <span>
              {condition.confidence}% confidence
            </span>
          </div>

          <strong>{condition.status}</strong>

          <p>{condition.summary}</p>
        </article>
      ))}
    </section>
  );
}