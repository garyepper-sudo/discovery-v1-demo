import type {
  ExecutiveAttentionSeverity,
  ExecutiveProjection,
} from "../projection/ExecutiveProjection";

type ExecutiveAttentionProps = {
  attention: ExecutiveProjection["executiveAttention"];
};

function getSeverityLabel(
  severity: ExecutiveAttentionSeverity,
): string {
  if (severity === "high") {
    return "High attention";
  }

  if (severity === "medium") {
    return "Watch closely";
  }

  return "Low urgency";
}

export default function ExecutiveAttention({
  attention,
}: ExecutiveAttentionProps) {
  return (
    <section
      className={`executive-v2-attention executive-v2-attention-${attention.severity}`}
    >
      <div className="executive-v2-attention-heading">
        <p className="executive-v2-answer-label">
          Executive attention
        </p>

        <span>{getSeverityLabel(attention.severity)}</span>
      </div>

      <h2>{attention.title}</h2>

      <p>{attention.summary}</p>
    </section>
  );
}