import type { ExecutiveAssessment } from "../projection/ExecutiveProjection";

type ExecutiveAssessmentCardProps = {
  assessment: ExecutiveAssessment;
};

export default function ExecutiveAssessmentCard({
  assessment,
}: ExecutiveAssessmentCardProps) {
  return (
    <section className="executive-v2-assessment">
      <div className="executive-v2-section-header">
        <span className="executive-v2-section-eyebrow">
          Executive Assessment
        </span>

        <h2>Discovery&apos;s current executive judgment</h2>
      </div>

      <div className="executive-v2-assessment-content">
        <div className="executive-v2-assessment-summary">
          <p>{assessment.summary}</p>

          <div className="executive-v2-assessment-confidence">
            <span>Confidence</span>
            <strong>{assessment.confidence}%</strong>
          </div>
        </div>

        {assessment.executiveNarrative &&
          assessment.executiveNarrative !== assessment.summary && (
            <p className="executive-v2-assessment-narrative">
              {assessment.executiveNarrative}
            </p>
          )}

        {assessment.recommendedFocus.length > 0 && (
          <div className="executive-v2-assessment-focus">
            <span>Recommended focus</span>

            <ul>
              {assessment.recommendedFocus.map((focus) => (
                <li key={focus}>{focus}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}