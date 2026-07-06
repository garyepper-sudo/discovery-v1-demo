"use client";

import ExecutiveAccordion from "../ui/ExecutiveAccordion";

type CognitionInspectorProps = {
  runtime?: any;
  onExploreInsight?: () => void;
};

function countByStatus(observations: any[], status: string) {
  return observations.filter((obs) => obs?.status === status).length;
}

function formatPercent(value: number | undefined) {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export default function CognitionInspector({
  runtime,
  onExploreInsight,
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
    <aside className="executive-advisor-panel">
      <section className="executive-advisor-card next-step-card">
        <p className="executive-advisor-eyebrow">Recommended Next Step</p>

        <div className="next-step-content">
          <div className="next-step-icon" aria-hidden="true">
            <span>☼</span>
          </div>

          <div>
            <h3>
              The next unknown is whether this pattern holds across additional
              evidence.
            </h3>

            <button
              type="button"
              className="briefing-primary-button compact"
              onClick={onExploreInsight}
            >
              Explore this insight →
            </button>
          </div>
        </div>
      </section>

      <section className="executive-advisor-card understanding-card-compact">
        <p className="executive-advisor-eyebrow">Our Understanding</p>

        <div className="understanding-card-layout">
          <div className="executive-understanding-orbit" aria-hidden="true">
            <span />
            <i />
            <i />
            <i />
            <b className="orbit-node orbit-node-one" />
            <b className="orbit-node orbit-node-two" />
            <b className="orbit-node orbit-node-three" />
          </div>

          <div>
            <h3>Organizational understanding is evolving</h3>
            <p>
              This organization has evolved across{" "}
              <strong>{runtime?.metadata?.investigationCount ?? 1}</strong>{" "}
              investigations.
            </p>
          </div>
        </div>
      </section>

      <section className="executive-advisor-card memory-card-compact">
        <p className="executive-advisor-eyebrow">Organizational Memory</p>
        <h3>Discovery is remembering what changed.</h3>

        <div className="executive-memory-grid">
          <div>
            <strong>{created.length}</strong>
            <span>New</span>
          </div>
          <div>
            <strong>{reinforced.length}</strong>
            <span>Reinforced</span>
          </div>
          <div>
            <strong>{stableCount}</strong>
            <span>Stable</span>
          </div>
          <div>
            <strong>{observations.length}</strong>
            <span>Total</span>
          </div>
        </div>

        <p>
          Status mix: {newCount} new · {reinforcedCount} reinforced ·{" "}
          {stableCount} stable.
        </p>
      </section>

      <ExecutiveAccordion
        title="Technical Details"
        subtitle="Memory changes, patterns, capabilities, and observations."
        badge="Advanced"
        defaultOpen={false}
      >
        <section className="cognition-inspector-technical">
          <div className="cognition-inspector-clusters">
            <div className="cognition-inspector-section-header">
              <span>Patterns We’ve Seen Before</span>
              <em>{understandingClusters.length} detected</em>
            </div>

            {understandingClusters.length === 0 ? (
              <p className="cognition-inspector-empty">
                No recurring patterns detected yet.
              </p>
            ) : (
              <div className="cognition-inspector-list">
                {understandingClusters.slice(0, 8).map((cluster: any) => (
                  <div key={cluster.id} className="cognition-inspector-item">
                    <strong>
                      {cluster.label || "Related Understanding Pattern"}
                    </strong>
                    <p>
                      {cluster.memberUnderstandingIds?.length || 0} signals ·
                      Cohesion {formatPercent(cluster.cohesion)} · Stability{" "}
                      {formatPercent(cluster.stability)} ·{" "}
                      {cluster.status || "emerging"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cognition-inspector-capabilities">
            <div className="cognition-inspector-section-header">
              <span>How We Operate</span>
              <em>{organizationalCapabilities.length} detected</em>
            </div>

            {organizationalCapabilities.length === 0 ? (
              <p className="cognition-inspector-empty">
                No operating capabilities recognized yet.
              </p>
            ) : (
              <div className="cognition-inspector-list">
                {organizationalCapabilities
                  .slice(0, 8)
                  .map((capability: any) => (
                    <div
                      key={capability.id}
                      className="cognition-inspector-item"
                    >
                      <strong>
                        {capability.label ||
                          "Recognized Organizational Capability"}
                      </strong>

                      <p>
                        {capability.status || "new"} · Confidence{" "}
                        {formatPercent(capability.confidence)} · Strength{" "}
                        {formatPercent(capability.strength)} · Stability{" "}
                        {formatPercent(capability.stability)}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="cognition-inspector-phenomena">
            <div className="cognition-inspector-section-header">
              <span>What’s Happening</span>
              <em>{organizationalPhenomena.length} detected</em>
            </div>

            {organizationalPhenomena.length === 0 ? (
              <p className="cognition-inspector-empty">
                No enduring situations inferred yet.
              </p>
            ) : (
              <div className="cognition-inspector-list">
                {organizationalPhenomena.slice(0, 8).map((phenomenon: any) => (
                  <div key={phenomenon.id} className="cognition-inspector-item">
                    <strong>
                      {phenomenon.label || "Emerging Organizational Situation"}
                    </strong>

                    <p>
                      {phenomenon.status || "emerging"} · Confidence{" "}
                      {formatPercent(phenomenon.confidence)} · Strength{" "}
                      {formatPercent(phenomenon.strength)}
                    </p>

                    {phenomenon.executiveMeaning && (
                      <p>{phenomenon.executiveMeaning}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {latestObservations.length > 0 && (
            <div className="cognition-inspector-list">
              {latestObservations.map((obs: any) => (
                <div key={obs.id} className="cognition-inspector-item">
                  <strong>{obs.statement || obs.text || obs.summary}</strong>
                  <p>
                    Support {obs.supportCount || 1} · Confidence{" "}
                    {Math.round((obs.confidence || 0) * 100)}% ·{" "}
                    {obs.status || "stored"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </ExecutiveAccordion>
    </aside>
  );
}