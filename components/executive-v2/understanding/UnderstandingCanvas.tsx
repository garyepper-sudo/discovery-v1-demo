import UnderstandingBelief from "./UnderstandingBelief";
import UnderstandingOrganism from "./UnderstandingOrganism";
import UnderstandingStatus from "./UnderstandingStatus";

type UnderstandingCanvasProps = {
  belief: string;
  mindStatus: string;
  confidence: number;
};

export default function UnderstandingCanvas({
  belief,
  mindStatus,
  confidence,
}: UnderstandingCanvasProps) {
  return (
    <section className="executive-v2-hero">
      <div className="executive-v2-theory">
        <div className="executive-v2-mind">
          <UnderstandingOrganism />

          <div className="executive-v2-understanding">
            <UnderstandingBelief belief={belief} />

            <UnderstandingStatus
              mindStatus={mindStatus}
              confidence={confidence}
            />
          </div>
        </div>
      </div>
    </section>
  );
}