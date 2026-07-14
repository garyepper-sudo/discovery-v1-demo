"use client";

import ExecutiveExperience from "./ExecutiveExperience";
import ExecutiveSidebar from "./sidebar/ExecutiveSidebar";
import ExecutiveTimeline from "./timeline/ExecutiveTimeline";
import type { ExecutiveProjection } from "./projection/ExecutiveProjection";

type ExecutiveWorkspaceProps = {
  projection: ExecutiveProjection;
};

export default function ExecutiveWorkspace({
  projection,
}: ExecutiveWorkspaceProps) {
  return (
    <main className="executive-workspace-v2">
      <ExecutiveSidebar
        understandingStrength={
          projection.currentUnderstanding.organizationalCoherence
        }
        mindStatus={projection.currentUnderstanding.mindStatus}
      />

      <section className="executive-workspace-main">
        <header className="executive-workspace-topbar">
          <div className="executive-workspace-investigation-title">
            <span>Investigation:</span>
            <strong>{projection.workspace.title}</strong>
            <i aria-hidden="true">⌄</i>
          </div>

          <div className="executive-workspace-live-status">
            {projection.workspace.updatedLabel && (
              <span>{projection.workspace.updatedLabel}</span>
            )}

            <strong>
              <i aria-hidden="true" />
              {projection.workspace.status}
            </strong>
          </div>
        </header>

        <div className="executive-workspace-content">
          <ExecutiveExperience
  projection={projection}
  organizationId="default-organization"
/>

          <ExecutiveTimeline evolution={projection.evolution} />
        </div>
      </section>
    </main>
  );
}