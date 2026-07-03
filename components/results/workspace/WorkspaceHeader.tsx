type WorkspaceHeaderProps = {
  onClose: () => void;
};

export default function WorkspaceHeader({
  onClose,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      <div>
        <p className="overview-label">Discovery Instrument</p>

        <h2>Explore Understanding</h2>

        <p className="workspace-subtitle">
          Understand how Discovery formed its current conclusion.
        </p>
      </div>

      <button
        className="workspace-close-button"
        onClick={onClose}
      >
        Close
      </button>
    </header>
  );
}