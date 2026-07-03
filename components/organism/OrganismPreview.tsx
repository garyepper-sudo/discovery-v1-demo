import OrganismViewer from "./OrganismViewer";

type OrganismPreviewProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  organismState?: any;
};

export default function OrganismPreview({
  open,
  onOpen,
  onClose,
  organismState,
}: OrganismPreviewProps) {
  const topPattern = organismState?.emergingPatterns?.[0];
  const particleCount = organismState?.particles?.length ?? 0;
  const tension = Math.round((organismState?.tension ?? 0) * 100);
  const maturity = Math.round((organismState?.maturity ?? 0) * 100);

  return (
    <>
      <aside className="mini-organism-area">
        <div
          className="mini-amoeba"
          data-tension={tension > 35 ? "high" : "normal"}
          data-maturity={maturity > 70 ? "mature" : "forming"}
        >
          <span className="mini-organism-core" />

          {(organismState?.particles ?? []).slice(0, 7).map((particle: any, index: number) => (
            <span
              key={particle.id ?? index}
              className={`mini-organism-node ${particle.kind ?? "unknown"}`}
              style={{
                left: `${miniNodePositions[index]?.x ?? 50}%`,
                top: `${miniNodePositions[index]?.y ?? 50}%`,
              }}
            />
          ))}
        </div>

        <div className="organism-update">
          <p className="overview-label">Living Understanding</p>
          <h2>{topPattern?.title ?? "Understanding organism active"}</h2>
          <span>
            {particleCount} particles · {tension}% tension · {maturity}% mature
          </span>
        </div>

        <button className="mini-organism-explore" onClick={onOpen}>
          Explore →
        </button>

        <p className="mini-organism-caption">
          This organism is now rendered from Discovery’s internal reasoning
          state.
        </p>
      </aside>

      <OrganismViewer
        open={open}
        onClose={onClose}
        organismState={organismState}
      />
    </>
  );
}

const miniNodePositions = [
  { x: 48, y: 32 },
  { x: 31, y: 48 },
  { x: 66, y: 47 },
  { x: 44, y: 65 },
  { x: 59, y: 62 },
  { x: 36, y: 34 },
  { x: 70, y: 33 },
];