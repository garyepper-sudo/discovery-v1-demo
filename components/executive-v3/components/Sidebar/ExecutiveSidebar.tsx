"use client";

import styles from "./ExecutiveSidebar.module.css";

import type {
  ExecutiveWorkspaceMode,
} from "../../ExecutiveWorkspaceMode";

type ExecutiveSidebarProps = {
  understandingStrength: number;
  mindStatus: string;

  mode: ExecutiveWorkspaceMode;

  onNavigate: (
    mode: ExecutiveWorkspaceMode,
  ) => void;
};

const navigationItems: Array<{
  mode: ExecutiveWorkspaceMode;
  label: string;
  icon: string;
}> = [
  {
    mode: "briefing",
    label: "Home",
    icon: "●",
  },
  {
    mode: "understand",
    label: "Understand",
    icon: "⌕",
  },
  {
    mode: "recommend",
    label: "Recommend",
    icon: "□",
  },
  {
    mode: "simulate",
    label: "Simulate",
    icon: "⌘",
  },
  {
    mode: "timeline",
    label: "Timeline",
    icon: "◌",
  },
  {
    mode: "ask",
    label: "Ask Discovery",
    icon: "◇",
  },
];

export default function ExecutiveSidebar({
  understandingStrength,
  mindStatus,
  mode,
  onNavigate,
}: ExecutiveSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span
          className={styles.brandMark}
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
        className={styles.navigation}
        aria-label="Executive workspace"
      >
        {navigationItems.map(
          (item) => {
            const isActive =
              item.mode === mode;

            return (
              <button
                key={item.mode}
                type="button"
                className={
                  isActive
                    ? `${styles.navigationItem} ${styles.active}`
                    : styles.navigationItem
                }
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                onClick={() =>
                  onNavigate(item.mode)
                }
              >
                <span
                  className={styles.navigationIcon}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>

                {item.label}
              </button>
            );
          },
        )}
      </nav>

      <section className={styles.contribute}>
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
          className={styles.moreButton}
        >
          Show more ways
          <span aria-hidden="true">›</span>
        </button>
      </section>

      <section className={styles.strength}>
        <p>Understanding Strength</p>

        <div className={styles.strengthSummary}>
          <strong>{understandingStrength}%</strong>
          <span>{mindStatus}</span>
        </div>

        <div
          className={styles.strengthChart}
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