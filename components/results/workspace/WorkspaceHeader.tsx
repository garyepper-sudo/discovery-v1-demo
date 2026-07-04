type WorkspaceHeaderProps = {
  onClose: () => void;
};

export default function WorkspaceHeader({
  onClose,
}: WorkspaceHeaderProps) {
  return (
    <header className="workspace-header">
      <div className="workspace-title-block">
        <p className="overview-label">Discovery Instrument</p>

        <div className="workspace-title-row">
          <h2>Explore Understanding</h2>

          <button
            className="workspace-close-button"
            onClick={onClose}
            aria-label="Close Explore Understanding"
          >
            ✕
          </button>
        </div>

        <p className="workspace-subtitle">
          Understand how Discovery formed its current conclusion.
        </p>
      </div>
    </header>
  );
}