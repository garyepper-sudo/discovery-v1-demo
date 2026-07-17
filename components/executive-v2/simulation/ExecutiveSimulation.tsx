import type {
  ExecutiveSimulationSummary as ExecutiveSimulationData,
} from "../projection/ExecutiveProjection";

type ExecutiveSimulationProps = {
  simulation: ExecutiveSimulationData;
};

export default function ExecutiveSimulation({
  simulation,
}: ExecutiveSimulationProps) {
  return (
    <section className="executive-v2-section">
      <div className="executive-v2-section-header">
        <div>
          <p className="executive-v2-eyebrow">
            Organizational Simulation
          </p>

          <h2>Most Plausible Future State</h2>
        </div>

        <div className="executive-v2-confidence">
          {simulation.confidence}% confidence
        </div>
      </div>

      <div className="executive-v2-card">
        <p>{simulation.explanation}</p>

        <dl>
          <div>
            <dt>Time horizon</dt>
            <dd>{simulation.timeHorizon}</dd>
          </div>

          <div>
            <dt>Simulated at</dt>
            <dd>{simulation.simulatedAt || "Not available"}</dd>
          </div>
        </dl>

        {simulation.projectedConditions.length > 0 && (
          <div>
            <h3>Projected conditions</h3>

            <ul>
              {simulation.projectedConditions.map(
                (condition) => (
                  <li key={condition}>{condition}</li>
                ),
              )}
            </ul>
          </div>
        )}

        {simulation.projectedBeliefs.length > 0 && (
          <div>
            <h3>Projected beliefs</h3>

            <ul>
              {simulation.projectedBeliefs.map((belief) => (
                <li key={belief}>{belief}</li>
              ))}
            </ul>
          </div>
        )}

        {simulation.projectedPredictions.length > 0 && (
          <div>
            <h3>Active predictions</h3>

            <ul>
              {simulation.projectedPredictions.map(
                (prediction) => (
                  <li key={prediction}>{prediction}</li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}