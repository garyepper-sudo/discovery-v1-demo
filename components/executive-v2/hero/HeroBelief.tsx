type HeroBeliefProps = {
  belief: string;
};

export default function HeroBelief({ belief }: HeroBeliefProps) {
  return (
    <div className="executive-v2-belief">
      <p className="executive-v2-belief-prefix">
        Discovery currently believes
      </p>

      <h1>{belief}</h1>
    </div>
  );
}