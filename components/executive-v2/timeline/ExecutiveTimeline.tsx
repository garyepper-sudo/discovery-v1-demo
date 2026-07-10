import type { ExecutiveProjection } from "../projection/ExecutiveProjection";

type ExecutiveTimelineProps = {
  evolution: ExecutiveProjection["evolution"];
};

export default function ExecutiveTimeline({
  evolution,
}: ExecutiveTimelineProps) {
  return (
    <section className="executive-workspace-timeline">
      <header>
        <span
          className="executive-workspace-section-icon"
          aria-hidden="true"
        >
          ↗
        </span>

        <p>How Discovery formed this understanding</p>
      </header>

      <div
        className="executive-workspace-timeline-track"
        style={{
          gridTemplateColumns: `repeat(${evolution.milestones.length}, minmax(0, 1fr))`,
        }}
      >
        {evolution.milestones.map((milestone) => (
          <article
            key={milestone.id}
            className={milestone.isCurrent ? "is-current" : undefined}
          >
            <strong>{milestone.label}</strong>
            <p>{milestone.description}</p>
            <span aria-hidden="true" />
          </article>
        ))}
      </div>
    </section>
  );
}