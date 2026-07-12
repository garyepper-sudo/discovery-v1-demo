"use client";

import ExecutiveAnswerGrid from "./answers/ExecutiveAnswerGrid";
import ExecutiveAssessmentCard from "./assessment/ExecutiveAssessmentCard";
import ExecutiveAttention from "./attention/ExecutiveAttention";
import ExecutiveBeliefs from "./beliefs/ExecutiveBeliefs";
import ExecutiveConditions from "./conditions/ExecutiveConditions";
import ExecutiveInvestigationOpportunities from "./investigations/ExecutiveInvestigationOpportunities";
import ExecutiveLearningProfile from "./learning/ExecutiveLearningProfile";
import type { ExecutiveProjection } from "./projection/ExecutiveProjection";
import OrganizationalStateCard from "./state/OrganizationalStateCard";
import UnderstandingCanvas from "./understanding/UnderstandingCanvas";

type ExecutiveExperienceProps = {
  projection: ExecutiveProjection;
};

export default function ExecutiveExperience({
  projection,
}: ExecutiveExperienceProps) {
  const {
    currentUnderstanding,
    explanation,
    executiveAttention,
    executiveAssessment,
    organizationalState,
    organizationalConditions,
    organizationalBeliefs,
    investigationOpportunities,
    organizationalLearningProfile,
  } = projection;

  return (
    <main className="executive-v2-experience">
      <div className="executive-v2-shell">
        <header className="executive-v2-header">
          <div className="executive-v2-brand">
            <span className="executive-v2-brand-dot" />
            <span>Discovery</span>
          </div>
        </header>

        <UnderstandingCanvas
          belief={currentUnderstanding.belief}
          mindStatus={currentUnderstanding.mindStatus}
          confidence={currentUnderstanding.confidence}
          organizationalCoherence={
            currentUnderstanding.organizationalCoherence
          }
        />

        {executiveAssessment && (
          <ExecutiveAssessmentCard
            assessment={executiveAssessment}
          />
        )}

        {organizationalState && (
          <OrganizationalStateCard state={organizationalState} />
        )}

        {organizationalConditions &&
          organizationalConditions.length > 0 && (
            <ExecutiveConditions
              conditions={organizationalConditions}
            />
          )}

        {organizationalBeliefs &&
          organizationalBeliefs.length > 0 && (
            <ExecutiveBeliefs beliefs={organizationalBeliefs} />
          )}

        {investigationOpportunities &&
          investigationOpportunities.length > 0 && (
            <ExecutiveInvestigationOpportunities
              opportunities={investigationOpportunities}
            />
          )}

        {organizationalLearningProfile && (
          <ExecutiveLearningProfile
            profile={organizationalLearningProfile}
          />
        )}

        <ExecutiveAttention attention={executiveAttention} />

        <ExecutiveAnswerGrid explanation={explanation} />
      </div>
    </main>
  );
}