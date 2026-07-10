type UnderstandingStatusProps = {
  mindStatus: string;
  confidence: number;
};

function normalizeConfidence(confidence: number): number {
  return Math.round(confidence <= 1 ? confidence * 100 : confidence);
}

export default function UnderstandingStatus({
  mindStatus,
  confidence,
}: UnderstandingStatusProps) {
  const confidencePercent = normalizeConfidence(confidence);

  return (
    <div className="executive-v2-status executive-v2-status-quiet">
      <div className="executive-v2-status-item">
        <span>Mind Status</span>

        <strong>
          <i className="executive-v2-status-dot" />
          {mindStatus}
        </strong>
      </div>

      <div className="executive-v2-status-item">
        <span>Confidence</span>

        <strong>{confidencePercent}%</strong>
      </div>
    </div>
  );
}