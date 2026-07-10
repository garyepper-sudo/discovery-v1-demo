import OrganismViewer from "./OrganismViewer";

type OrganismPreviewProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  evidence?: any[];
  themes?: any[];
  contradictions?: any[];
  causalChains?: any[];
};

export default function OrganismPreview({
  open,
  onOpen,
  onClose,
  evidence = [],
  themes = [],
  contradictions = [],
  causalChains = [],
}: OrganismPreviewProps) {
  return (
    <>
      <aside className="mini-organism-area">
        <div className="mini-amoeba" />

        <div className="organism-update">
          <p className="overview-label">Living Understanding</p>
          <h2>New insight integrated</h2>
          <span>Just now</span>
        </div>

        <button className="mini-organism-explore" onClick={onOpen}>
          Explore →
        </button>

        <p className="mini-organism-caption">
          See the organism’s inner connections and supporting evidence.
        </p>
      </aside>

      <OrganismViewer
        open={open}
        onClose={onClose}
        evidence={evidence}
        themes={themes}
        contradictions={contradictions}
        causalChains={causalChains}
      />
    </>
  );
}