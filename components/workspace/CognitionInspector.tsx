type CognitionInspectorProps = {
  runtime?: any;
};

function countByStatus(observations: any[], status: string) {
  return observations.filter((obs) => obs?.status === status).length;
}

export default function CognitionInspector({
  runtime,
}: CognitionInspectorProps) {
  const observations = runtime?.memory?.observations || [];
  const lastEvolution = runtime?.cognition?.lastEvolution;
  const observationChanges = lastEvolution?.observationChanges;

  const created = observationChanges?.created || [];
  const reinforced = observationChanges?.reinforced || [];

  const stableCount = countByStatus(observations, "stable");
  const reinforcedCount = countByStatus(observations, "reinforced");
  const newCount = countByStatus(observations, "new");

  const latestObservations = observations.slice(-5).reverse();

  return (
    <section className="cognition-inspector">
      <div className="cognition-inspector-eyebrow">Cognition Inspector</div>

      <h3>What changed in memory</h3>

      <div className="cognition-inspector-grid">
        <div>
          <span>{created.length}</span>
          <p>Created</p>
        </div>

        <div>
          <span>{reinforced.length}</span>
          <p>Reinforced</p>
        </div>

        <div>
          <span>{stableCount}</span>
          <p>Stable</p>
        </div>

        <div>
          <span>{observations.length}</span>
          <p>Total</p>
        </div>
      </div>

      <div className="cognition-inspector-summary">
        <p>
          {reinforced.length > 0
            ? `Discovery reinforced ${reinforced.length} existing signal${
                reinforced.length === 1 ? "" : "s"
              }.`
            : created.length > 0
            ? `Discovery created ${created.length} new signal${
                created.length === 1 ? "" : "s"
              }.`
            : "No observation evolution detected yet."}
        </p>

        <p>
          Status mix: {newCount} new · {reinforcedCount} reinforced ·{" "}
          {stableCount} stable
        </p>
      </div>

      {latestObservations.length > 0 && (
        <div className="cognition-inspector-list">
          {latestObservations.map((obs: any) => (
            <div key={obs.id} className="cognition-inspector-item">
              <div>
                <strong>{obs.statement || obs.text || obs.summary}</strong>
                <p>
                  Support {obs.supportCount || 1} · Confidence{" "}
                  {Math.round((obs.confidence || 0) * 100)}% ·{" "}
                  {obs.status || "stored"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}