import type { ExecutiveInterpretation } from "../../../engine/v3/executive/interpretations/executiveInterpretationTypes";

type CurrentWorkingTheoryProps = {
  interpretation: ExecutiveInterpretation;
  organizationConfidence?: number;
};

function normalizeConfidence(value?: number): number | null {
  if (value === undefined || value <= 0) return null;

  return Math.round(value <= 1 ? value * 100 : value);
}

function getMindStatus(confidence: number | null): string {
  if (confidence === null) return "Learning";
  if (confidence >= 80) return "Stable";
  if (confidence >= 65) return "Learning";
  if (confidence >= 45) return "Reconsidering";

  return "Uncertain";
}

function getShortSentence(
  value: string | undefined,
  fallback: string,
  limit = 170,
): string {
  if (!value?.trim()) return fallback;

  const cleaned = value.replace(/\s+/g, " ").trim();
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];

  if (firstSentence.length <= limit) return firstSentence;

  return `${firstSentence.slice(0, limit - 3).trim()}...`;
}

function buildReasons(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  return value
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.replace(/^[-–—•✓]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default function CurrentWorkingTheory({
  interpretation,
  organizationConfidence,
}: CurrentWorkingTheoryProps) {
  const confidence = normalizeConfidence(organizationConfidence);
  const mindStatus = getMindStatus(confidence);

  const currentExplanation = getShortSentence(
    interpretation.currentExplanation,
    "Discovery is still forming a stable organizational explanation.",
    180,
  );

  const uncertainty = getShortSentence(
    interpretation.remainingUncertainty,
    "Discovery still needs more evidence before treating this explanation as stable.",
    210,
  );

  const nextEvidence = getShortSentence(
    interpretation.evidenceThatCouldChangeTheExplanation,
    "Additional evidence could strengthen, weaken, or revise this explanation.",
    210,
  );

  const reasons = buildReasons(interpretation.confidenceNarrative);

  return (
    <section className="current-working-theory">
      <div className="theory-hero">
        <div className="theory-organism" aria-hidden="true">
          <div className="theory-organism-core" />

          <span className="theory-organism-node theory-organism-node-one" />
          <span className="theory-organism-node theory-organism-node-two" />
          <span className="theory-organism-node theory-organism-node-three" />
          <span className="theory-organism-node theory-organism-node-four" />

          <i className="theory-organism-orbit theory-organism-orbit-one" />
          <i className="theory-organism-orbit theory-organism-orbit-two" />
          <i className="theory-organism-orbit theory-organism-orbit-three" />
        </div>

        <div className="theory-hero-copy">
          <p className="briefing-eyebrow">Current Working Theory</p>

          <h1>{currentExplanation}</h1>

          <div className="theory-status-row">
            <div className="theory-status-item">
              <span>Mind Status</span>

              <strong>
                <i aria-hidden="true" />
                {mindStatus}
              </strong>
            </div>

            <div className="theory-status-item theory-confidence">
              <span>Confidence</span>
              <strong>{confidence === null ? "—" : `${confidence}%`}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="theory-card-grid">
        <article className="theory-card theory-why-card">
          <div className="theory-card-heading">
            <span className="theory-card-icon" aria-hidden="true">
              ✓
            </span>

            <p className="briefing-section-label">
              Why Discovery believes this
            </p>
          </div>

          <ul>
            {reasons.length > 0 ? (
              reasons.map((reason) => <li key={reason}>{reason}</li>)
            ) : (
              <li>{interpretation.confidenceNarrative}</li>
            )}
          </ul>

          <button className="theory-text-action" type="button">
            View supporting evidence
            <span aria-hidden="true">›</span>
          </button>
        </article>

        <article className="theory-card theory-uncertainty-card">
          <div className="theory-card-heading">
            <span className="theory-card-icon" aria-hidden="true">
              ?
            </span>

            <p className="briefing-section-label">
              What could change this
            </p>
          </div>

          <div className="theory-question-mark" aria-hidden="true">
            ?
          </div>

          <p>{uncertainty}</p>

          <button className="theory-text-action" type="button">
            View uncertainty details
            <span aria-hidden="true">›</span>
          </button>
        </article>

        <article className="theory-card theory-investigation-card">
          <div className="theory-card-heading">
            <span className="theory-card-icon" aria-hidden="true">
              ↗
            </span>

            <p className="briefing-section-label">
              Next best investigation
            </p>
          </div>

          <div className="theory-investigation-body">
            <div className="theory-investigation-target" aria-hidden="true">
              <span />
            </div>

            <div>
              <h2>Decision Authority</h2>
              <p>{nextEvidence}</p>
            </div>
          </div>

          <div className="theory-confidence-gain">
            <span>Expected confidence gain</span>
            <strong>+11%</strong>
          </div>

          <button className="theory-primary-action" type="button">
            Start Investigation
            <span aria-hidden="true">›</span>
          </button>
        </article>
      </div>
    </section>
  );
}