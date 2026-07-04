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

const SECTIONS: {
  id: WorkspaceView;
  label: string;
}[] = [
  { id: "understanding", label: "Understanding" },
  { id: "why", label: "Why" },
  { id: "how", label: "How" },
  { id: "confidence", label: "Confidence" },
  { id: "uncertainty", label: "Uncertainty" },
  { id: "changes", label: "Changes" },
  { id: "evidence", label: "Evidence" },
  { id: "trace", label: "Trace" },
];

export default function WorkspaceTabs({
  activeView,
  onChange,
}: WorkspaceTabsProps) {
  return (
    <nav
      className="workspace-tabs"
      aria-label="Understanding sections"
    >
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          className={
            activeView === section.id
              ? "workspace-tab active"
              : "workspace-tab"
          }
          aria-current={
            activeView === section.id ? "location" : undefined
          }
          onClick={() => onChange(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}