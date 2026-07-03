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

      <div className="explainable-belief-list">
        {beliefs.slice(0, 3).map((belief, index) => (
          <ExplainableBeliefCard
            key={belief.id ?? index}
            belief={belief}
            index={index}
            onTrace={onTrace}
          />
        ))}
      </div>
    </section>
  );
}

function ExplainableBeliefCard({
  belief,
  index,
  onTrace,
}: {
  belief: any;
  index: number;
  onTrace?: () => void;
}) {
  const confidence = Math.round((belief?.confidence ?? 0) * 100);
  const supportingReasons = belief?.supportingReasons ?? [];
  const concerns = belief?.concerns ?? [];
  const nextQuestions = belief?.nextQuestions ?? [];
  const mechanismReason = supportingReasons.find((reason: string) =>
    reason.toLowerCase().startsWith("mechanism:")
  );

  return (
    <article className="explainable-belief-card">
      <div className="explainable-belief-header">
        <div>
          <p className="overview-label">{getInsightLabel(belief, index)}</p>
          <h3>{getReadableInsight(belief)}</h3>
        </div>

        <div className="belief-confidence-pill">{confidence}%</div>
      </div>

      <p className="belief-explanation">{getInsightDetail(belief)}</p>

      <div className="belief-explanation-grid">
        <BeliefSection
          title="Why Discovery believes this"
          items={supportingReasons.filter(
            (reason: string) => !reason.toLowerCase().startsWith("mechanism:")
          )}
          fallback="Discovery found supporting evidence across the investigation."
        />

        <BeliefSection
          title="Underlying mechanism"
          items={
            mechanismReason
              ? [mechanismReason.replace("Mechanism: ", "")]
              : []
          }
          fallback="No explicit mechanism has been attached yet."
        />

        <BeliefSection
          title="Current uncertainty"
          items={concerns}
          fallback="No major uncertainty detected yet."
        />

        <BeliefSection
          title="Next question"
          items={nextQuestions}
          fallback="What evidence would change this belief?"
          limit={1}
        />
      </div>

      {onTrace && (
        <button className="belief-trace-button" onClick={onTrace}>
          Trace this belief →
        </button>
      )}
    </article>
  );
}

function BeliefSection({
  title,
  items,
  fallback,
  limit = 2,
}: {
  title: string;
  items?: string[];
  fallback: string;
  limit?: number;
}) {
  const visibleItems = (items ?? []).filter(Boolean).slice(0, limit);

  return (
    <div className="belief-section">
      <span>{title}</span>

      {visibleItems.length > 0 ? (
        <ul>
          {visibleItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{fallback}</p>
      )}
    </div>
  );
}

function getInsightLabel(item: any, index: number): string {
  return item?.category ?? item?.type ?? `Belief ${index + 1}`;
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