"use client";

import {
  useState,
} from "react";

import ExecutiveExperience from "./ExecutiveExperience";
import ExecutiveSidebar from "../executive-v3/components/Sidebar/ExecutiveSidebar";
import ExecutiveTimeline from "./timeline/ExecutiveTimeline";

import type {
  ExecutiveProjection,
} from "./projection/ExecutiveProjection";

import type {
  ExecutiveWorkspaceMode,
} from "../executive-v3/ExecutiveWorkspaceMode";

type ExecutiveWorkspaceProps = {
  projection: ExecutiveProjection;
};

export default function ExecutiveWorkspace({
  projection,
}: ExecutiveWorkspaceProps) {
  const [
    mode,
    setMode,
  ] = useState<ExecutiveWorkspaceMode>(
    "briefing",
  );

  return (
    <main className="executive-workspace-v2">
      <ExecutiveSidebar
        understandingStrength={
          projection.currentUnderstanding.organizationalCoherence
        }
        mindStatus={
          projection.currentUnderstanding.mindStatus
        }
        mode={mode}
        onNavigate={setMode}
      />

      <section className="executive-workspace-main">
        <header className="executive-workspace-topbar">
          <div className="executive-workspace-investigation-title">
            <span>Investigation:</span>

            <strong>
              {projection.workspace.title}
            </strong>

            <i aria-hidden="true">
              ⌄
            </i>
          </div>

          <div className="executive-workspace-live-status">
            {projection.workspace.updatedLabel ? (
              <span>
                {projection.workspace.updatedLabel}
              </span>
            ) : null}

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
            mode={mode}
          />

          {mode === "briefing" ? (
            <ExecutiveTimeline
              evolution={projection.evolution}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}