import type { ExecutiveOrganizationalLearningProfile } from "../projection/ExecutiveProjection";

type ExecutiveLearningProfileProps = {
  profile: ExecutiveOrganizationalLearningProfile;
};

export default function ExecutiveLearningProfile({
  profile,
}: ExecutiveLearningProfileProps) {
  return (
    <section className="executive-v2-learning">
      <div className="executive-v2-section-header">
        <span className="executive-v2-section-eyebrow">
          Organizational Learning
        </span>

        <h2>How the organization is learning over time</h2>
      </div>

      <div className="executive-v2-learning-grid">
        <div className="executive-v2-learning-metric">
          <span>Learning Velocity</span>
          <strong>{profile.learningVelocityScore}</strong>
          <small>{profile.learningVelocity}</small>
        </div>

        <div className="executive-v2-learning-metric">
          <span>Knowledge Retention</span>
          <strong>{profile.knowledgeRetention}%</strong>
        </div>

        <div className="executive-v2-learning-metric">
          <span>Belief Stability</span>
          <strong>{profile.beliefStability}%</strong>
        </div>

        <div className="executive-v2-learning-metric">
          <span>Theory Stability</span>
          <strong>{profile.theoryStability}%</strong>
        </div>

        <div className="executive-v2-learning-metric">
          <span>Understanding Growth</span>
          <strong>{profile.understandingGrowth}</strong>
        </div>

        <div className="executive-v2-learning-metric">
          <span>Memory Growth</span>
          <strong>{profile.memoryGrowth}</strong>
        </div>
      </div>

      <p className="executive-v2-learning-summary">
        {profile.summary}
      </p>
    </section>
  );
}