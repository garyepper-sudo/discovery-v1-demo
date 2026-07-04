type CognitionInspectorProps = {
  runtime?: any;
};

function countByStatus(observations: any[], status: string) {
  return observations.filter((obs) => obs?.status === status).length;
}

function formatPercent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export default function CognitionInspector({
  runtime,
}: CognitionInspectorProps) {
  const observations = runtime?.memory?.observations || [];
  const understandingClusters = runtime?.memory?.understandingClusters || [];
  const organizationalCapabilities =
    runtime?.memory?.organizationalCapabilitiesState?.capabilities || [];

  const organizationalPhenomena =
    runtime?.memory?.organizationalPhenomenaState?.phenomena || [];

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

      <div className="cognition-inspector-clusters">
        <div className="cognition-inspector-section-header">
          <span>Understanding Clusters</span>
          <em>{understandingClusters.length} detected</em>
        </div>

        {understandingClusters.length === 0 ? (
          <p className="cognition-inspector-empty">
            No compressed understanding clusters detected yet.
          </p>
        ) : (
          <div className="cognition-inspector-list">
            {understandingClusters.map((cluster: any) => (
              <div key={cluster.id} className="cognition-inspector-item">
                <div>
                  <strong>
                    {cluster.label || "Related Understanding Pattern"}
                  </strong>
                  <p>
                    {cluster.memberUnderstandingIds?.length || 0} understandings ·
                    Cohesion {formatPercent(cluster.cohesion)} · Stability{" "}
                    {formatPercent(cluster.stability)} ·{" "}
                    {cluster.status || "emerging"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cognition-inspector-capabilities">
        <div className="cognition-inspector-section-header">
          <span>Organizational Capabilities</span>
          <em>{organizationalCapabilities.length} detected</em>
        </div>

        {organizationalCapabilities.length === 0 ? (
          <p className="cognition-inspector-empty">
            No organizational capabilities recognized yet.
          </p>
        ) : (
          <div className="cognition-inspector-list">
            {organizationalCapabilities.map((capability: any) => (
              <div key={capability.id} className="cognition-inspector-item">
                <div>
                  <strong>
                    {capability.label || "Recognized Organizational Capability"}
                  </strong>

                  <p>
                    {capability.status || "new"} · Confidence{" "}
                    {formatPercent(capability.confidence)} · Strength{" "}
                    {formatPercent(capability.strength)} · Stability{" "}
                    {formatPercent(capability.stability)} ·{" "}
                    {capability.understandingIds?.length || 0} understandings
                  </p>

                  {capability.description && <p>{capability.description}</p>}

                  <details className="cognition-inspector-details">
                    <summary>What reinforced this capability</summary>

                    {capability.supportingEvidence?.length > 0 ? (
                      <ul>
                        {capability.supportingEvidence
                          .slice(0, 4)
                          .map((evidence: string, index: number) => (
                            <li key={`${capability.id}-evidence-${index}`}>
                              {evidence}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p>No supporting evidence stored yet.</p>
                    )}
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cognition-inspector-phenomena">
        <div className="cognition-inspector-section-header">
          <span>Organizational Phenomena</span>
          <em>{organizationalPhenomena.length} detected</em>
        </div>

        {organizationalPhenomena.length === 0 ? (
          <p className="cognition-inspector-empty">
            No enduring organizational phenomena inferred yet.
          </p>
        ) : (
          <div className="cognition-inspector-list">
            {organizationalPhenomena.map((phenomenon: any) => (
              <div key={phenomenon.id} className="cognition-inspector-item">
                <div>
                  <strong>
                    {phenomenon.label || "Emerging Organizational Phenomenon"}
                  </strong>

                  <p>
                    {phenomenon.status || "emerging"} · Confidence{" "}
                    {formatPercent(phenomenon.confidence)} · Strength{" "}
                    {formatPercent(phenomenon.strength)} ·{" "}
                    {phenomenon.understandingIds?.length || 0} understandings
                  </p>

                  {phenomenon.executiveMeaning && (
                    <p>{phenomenon.executiveMeaning}</p>
                  )}

                  <details className="cognition-inspector-details">
                    <summary>Why Discovery inferred this</summary>

                    {phenomenon.evidenceSummary && (
                      <p>{phenomenon.evidenceSummary}</p>
                    )}

                    {phenomenon.changeExplanation && (
                      <p>{phenomenon.changeExplanation}</p>
                    )}

                    {phenomenon.clusterIds?.length > 0 && (
                      <p>
                        Derived from {phenomenon.clusterIds.length} understanding
                        cluster
                        {phenomenon.clusterIds.length === 1 ? "" : "s"}.
                      </p>
                    )}
                  </details>
                </div>
              </div>
            ))}
          </div>
        )}
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