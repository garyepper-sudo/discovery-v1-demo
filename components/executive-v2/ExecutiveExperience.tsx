"use client";

import ExecutiveAnswerGrid from "./answers/ExecutiveAnswerGrid";
import ExecutiveAttention from "./attention/ExecutiveAttention";
import { getVisibleExecutiveCapabilities } from "./capabilities/ExecutiveCapabilityRegistry";
import ExecutiveDecisionWorkspace from "./decision/ExecutiveDecisionWorkspace";
import type { ExecutiveProjection } from "./projection/ExecutiveProjection";
import UnderstandingCanvas from "./understanding/UnderstandingCanvas";

type ExecutiveExperienceProps = {
  projection: ExecutiveProjection;

  /**
   * Runtime organization evaluated by executive scenarios.
   */
  organizationId: string;

  /**
   * Optional canonical condition selected when the workspace first loads.
   */
  defaultDecisionConditionId?: string;
};

export default function ExecutiveExperience({
  projection,
  organizationId,
  defaultDecisionConditionId = "",
}: ExecutiveExperienceProps) {
  const {
    currentUnderstanding,
    explanation,
    executiveAttention,
  } = projection;

  const visibleCapabilities =
    getVisibleExecutiveCapabilities(
      projection,
    );

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
          belief={
            currentUnderstanding.belief
          }
          mindStatus={
            currentUnderstanding.mindStatus
          }
          confidence={
            currentUnderstanding.confidence
          }
          organizationalCoherence={
            currentUnderstanding
              .organizationalCoherence
          }
        />

        {visibleCapabilities.map(
          (capability) => (
            <div
              key={
                capability.capabilityId +
                "-" +
                String(
                  capability.projectionKey,
                )
              }
            >
              {capability.render(
                projection,
              )}
            </div>
          ),
        )}

        <ExecutiveDecisionWorkspace
          organizationId={
            organizationId
          }
          defaultConditionId={
            defaultDecisionConditionId
          }
        />

        <ExecutiveAttention
          attention={
            executiveAttention
          }
        />

        <ExecutiveAnswerGrid
          explanation={
            explanation
          }
        />
      </div>
    </main>
  );
}