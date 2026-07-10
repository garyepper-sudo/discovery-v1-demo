type HeroStatusProps = {
  mindStatus: string;
  confidence: number;
};

function formatConfidence(confidence: number): string {
  const normalizedConfidence =
    confidence <= 1 ? confidence * 100 : confidence;

  return `${Math.round(normalizedConfidence)}% confidence`;
}

export default function HeroStatus({
  mindStatus,
  confidence,
}: HeroStatusProps) {
  return (
    <div className="executive-v2-status executive-v2-status-quiet">
      <div className="executive-v2-status-item">
        <strong>
          <i className="executive-v2-status-dot" />
          {mindStatus}
        </strong>
      </div>

      <div className="executive-v2-status-item">
        <strong>{formatConfidence(confidence)}</strong>
      </div>
    </div>
  );
}