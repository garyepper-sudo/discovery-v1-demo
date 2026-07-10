"use client";

import ExecutiveExperience from "./ExecutiveExperience";
import ExecutiveSidebar from "./sidebar/ExecutiveSidebar";

export default function ExecutiveWorkspace() {
  return (
    <main className="executive-workspace-v2">
      <ExecutiveSidebar />

      <section className="executive-workspace-main">
        <header className="executive-workspace-topbar">
          <div className="executive-workspace-investigation-title">
            <span>Investigation:</span>
            <strong>Executive Overview</strong>
            <i aria-hidden="true">⌄</i>
          </div>

          <div className="executive-workspace-live-status">
            <span>Last updated 2 min ago</span>

            <strong>
              <i aria-hidden="true" />
              Live
            </strong>
          </div>
        </header>

        <div className="executive-workspace-content">
          <ExecutiveExperience />

          <section className="executive-workspace-timeline">
            <header>
              <span
                className="executive-workspace-section-icon"
                aria-hidden="true"
              >
                ↗
              </span>

              <p>How this theory has evolved</p>
            </header>

            <div className="executive-workspace-timeline-track">
              <article>
                <strong>Jan</strong>
                <p>Initial signal detected</p>
                <span aria-hidden="true" />
              </article>

              <article>
                <strong>Feb</strong>
                <p>Patterns emerge</p>
                <span aria-hidden="true" />
              </article>

              <article>
                <strong>Mar</strong>
                <p>Confidence strengthens</p>
                <span aria-hidden="true" />
              </article>

              <article>
                <strong>Apr</strong>
                <p>Cross-team confirmation</p>
                <span aria-hidden="true" />
              </article>

              <article>
                <strong>May</strong>
                <p>Current theory forms</p>
                <span aria-hidden="true" />
              </article>

              <article className="is-current">
                <strong>Today</strong>
                <p>84% confidence · Learning</p>
                <span aria-hidden="true" />
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}