import type { ExecutiveOrganizationalState } from "../projection/ExecutiveProjection";

type OrganizationalStateCardProps = {
  state: ExecutiveOrganizationalState;
};

function formatStatus(status: string): string {
  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function OrganizationalStateCard({
  state,
}: OrganizationalStateCardProps) {
  return (
    <section className="executive-v2-state">
      <div className="executive-v2-state-heading">
        <div>
          <p className="executive-v2-answer-label">
            Organizational state
          </p>

          <h2>{formatStatus(state.status)}</h2>
        </div>

        <span>{state.confidence}% confidence</span>
      </div>

      <p className="executive-v2-state-summary">
        {state.summary}
      </p>

      <div className="executive-v2-state-implication">
        <p className="executive-v2-answer-label">
          Executive implication
        </p>

        <p>{state.executiveImplication}</p>
      </div>

      {state.recommendedFocus.length > 0 && (
        <div className="executive-v2-state-focus">
          <p className="executive-v2-answer-label">
            Recommended focus
          </p>

          <ul>
            {state.recommendedFocus.slice(0, 4).map((focus) => (
              <li key={focus}>{focus}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}