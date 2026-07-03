import UnderstandingCard from "./UnderstandingCard";

type SupportingUnderstandingsProps = {
  beliefs?: any[];
  onTrace?: () => void;
};

export default function SupportingUnderstandings({
  beliefs = [],
  onTrace,
}: SupportingUnderstandingsProps) {
  if (beliefs.length === 0) return null;

  return (
    <section className="supporting-understandings">
      <p className="overview-label">Supporting Understandings</p>

      <div className="insight-card-list">
        {beliefs.slice(0, 3).map((belief, index) => (
          <UnderstandingCard
            key={belief.id ?? index}
            index={index}
            label={getInsightLabel(belief, index)}
            title={getReadableInsight(belief)}
            detail={getInsightDetail(belief)}
            onTrace={onTrace}
          />
        ))}
      </div>
    </section>
  );
}

function getInsightLabel(item: any, index: number): string {
  return (
    item?.category ??
    item?.type ??
    ["Signal", "Context", "Tension"][index] ??
    "Insight"
  );
}

function getReadableInsight(item: any): string {
  return (
    item?.headline ??
    item?.belief ??
    item?.statement ??
    item?.title ??
    item?.summary ??
    "Supporting understanding"
  );
}

function getInsightDetail(item: any): string {
  return (
    item?.explanation ??
    item?.summary ??
    item?.whyItMatters ??
    item?.supportingReasons?.[0] ??
    "Discovery found this supporting pattern across the available evidence."
  );
}