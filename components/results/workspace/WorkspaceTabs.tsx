"use client";

export type WorkspaceView =
  | "understanding"
  | "why"
  | "how"
  | "confidence"
  | "uncertainty"
  | "changes"
  | "evidence"
  | "trace";

type WorkspaceTabsProps = {
  activeView: WorkspaceView;
  onChange: (view: WorkspaceView) => void;
};

const WORKSPACE_TABS: { id: WorkspaceView; label: string }[] = [
  { id: "understanding", label: "Understanding" },
  { id: "why", label: "Why" },
  { id: "how", label: "How" },
  { id: "confidence", label: "Confidence" },
  { id: "uncertainty", label: "Uncertainty" },
  { id: "changes", label: "What Changes This" },
  { id: "evidence", label: "Evidence" },
  { id: "trace", label: "Trace" },
];

export default function WorkspaceTabs({
  activeView,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <nav className="workspace-tabs" aria-label="Explore understanding">
      {WORKSPACE_TABS.map((tab) => (
        <button
          key={tab.id}
          className={activeView === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}