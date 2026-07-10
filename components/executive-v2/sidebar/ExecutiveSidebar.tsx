"use client";

type ExecutiveSidebarProps = {
  understandingStrength: number;
  mindStatus: string;
};

export default function ExecutiveSidebar({
  understandingStrength,
  mindStatus,
}: ExecutiveSidebarProps) {
  return (
    <aside className="executive-workspace-sidebar">
      <div className="executive-workspace-brand">
        <span
          className="executive-workspace-brand-mark"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>

        <div>
          <strong>Discovery</strong>
          <span>Executive Intelligence</span>
        </div>
      </div>

      <nav
        className="executive-workspace-navigation"
        aria-label="Executive workspace"
      >
        <button
          type="button"
          className="executive-workspace-nav-item is-active"
          aria-current="page"
        >
          <span
            className="executive-workspace-nav-icon"
            aria-hidden="true"
          >
            ●
          </span>
          Briefing
        </button>

        <button
          type="button"
          className="executive-workspace-nav-item"
        >
          <span
            className="executive-workspace-nav-icon"
            aria-hidden="true"
          >
            ⌕
          </span>
          Investigations
        </button>

        <button
          type="button"
          className="executive-workspace-nav-item"
        >
          <span
            className="executive-workspace-nav-icon"
            aria-hidden="true"
          >
            □
          </span>
          Evidence
        </button>

        <button
          type="button"
          className="executive-workspace-nav-item"
        >
          <span
            className="executive-workspace-nav-icon"
            aria-hidden="true"
          >
            ⌘
          </span>
          Connections
        </button>

        <button
          type="button"
          className="executive-workspace-nav-item"
        >
          <span
            className="executive-workspace-nav-icon"
            aria-hidden="true"
          >
            ◌
          </span>
          Alerts
        </button>
      </nav>

      <section className="executive-workspace-contribute">
        <p>Contribute Evidence</p>

        <button type="button">
          <span aria-hidden="true">⇧</span>
          Upload Documents
        </button>

        <button type="button">
          <span aria-hidden="true">≡</span>
          Paste Notes
        </button>

        <button type="button">
          <span aria-hidden="true">◉</span>
          Meeting Transcript
        </button>

        <button
          type="button"
          className="executive-workspace-more-button"
        >
          Show more ways
          <span aria-hidden="true">›</span>
        </button>
      </section>

      <section className="executive-workspace-strength">
        <p>Understanding Strength</p>

        <div className="executive-workspace-strength-summary">
          <strong>{understandingStrength}%</strong>
          <span>{mindStatus}</span>
        </div>

        <div
          className="executive-workspace-strength-chart"
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>
    </aside>
  );
}