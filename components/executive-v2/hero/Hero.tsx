import HeroBelief from "./HeroBelief";
import HeroOrganism from "./HeroOrganism";
import HeroStatus from "./HeroStatus";

type HeroProps = {
  belief: string;
  mindStatus: string;
  confidence: number;
};

export default function Hero({
  belief,
  mindStatus,
  confidence,
}: HeroProps) {
  return (
    <section className="executive-v2-hero">
      <div className="executive-v2-theory">
        <div className="executive-v2-mind">
          <HeroOrganism />

          <div className="executive-v2-understanding">
            <HeroBelief belief={belief} />

            <HeroStatus
              mindStatus={mindStatus}
              confidence={confidence}
            />
          </div>
        </div>
      </div>
    </section>
  );
}