import Link from "next/link";
import React from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleDashed, Clock3,
  EyeOff, FileQuestion, Layers3, Scale, Search, Shield, Sparkles,
} from "lucide-react";

import type { AuthorizedMetricResult } from "../../engine/v3/governance/authorizedMetricLineage";
import type { ScopedDecisionCalibrationAxisResult } from "../../product/integration/scopedDecisionCalibrationProjection";
import {
  HOME_SECTIONS,
  ROLE_AWARE_NAVIGATION,
  type PresentationItem,
  type RoleAwarePresentation,
} from "../../product/frontend/roleAwarePresentation";
import {
  ROLE_AWARE_FIXTURE_IDS,
  type RoleAwareFixtureId,
  type SemanticDisposition,
} from "../../product/frontend/roleAwareLivingOrganization";
const styles = new Proxy<Record<string, string>>({}, {
  get: (_target, property) => `ra_${String(property)}`,
});

const routeFor = (view: RoleAwarePresentation, query = "") => `${view.routePath ?? (view.fixtureId ? `/role-aware-alpha/${view.fixtureId}` : "/development/role-aware-live")}${query}`;

const dispositionCopy: Record<SemanticDisposition, { label: string; description: string }> = {
  disclosed: { label: "Available", description: "Authorized information is available to this view." },
  "safely-abstracted": { label: "Limited view", description: "Only the approved abstraction can be shown." },
  withheld: { label: "Not shown", description: "This view cannot be shown for this scope." },
  unavailable: { label: "Not available", description: "The information is not available from the canonical source." },
  "insufficient-authorized-information": { label: "More information needed", description: "Discovery does not have enough authorized information to assess this yet." },
  unsupported: { label: "Not supported", description: "Discovery does not currently produce this capability." },
};

const dispositionIcons = {
  disclosed: CheckCircle2,
  "safely-abstracted": Layers3,
  withheld: Shield,
  unavailable: EyeOff,
  "insufficient-authorized-information": CircleDashed,
  unsupported: FileQuestion,
} as const;

export function DisclosureState({ disposition, compact = false, explanation }: { disposition: SemanticDisposition; compact?: boolean; explanation?: string }) {
  const Icon = dispositionIcons[disposition];
  const copy = dispositionCopy[disposition];
  return (
    <div className={`${styles.disclosure} ${styles[`disclosure_${disposition}`]} ${compact ? styles.compact : ""}`} aria-label={`${copy.label}. ${explanation ?? copy.description}`}>
      <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
      <div><strong>{copy.label}</strong>{!compact && <span>{explanation ?? copy.description}</span>}</div>
    </div>
  );
}

function ItemRow({ item }: { item: PresentationItem }) {
  if (item.disposition === "safely-abstracted") {
    return <li className={styles.row}><DisclosureState disposition="safely-abstracted" /></li>;
  }
  return (
    <li className={styles.row}>
      <div className={styles.rowCopy}>
        <strong>{item.title}</strong>
        {item.summary && <p>{item.summary}</p>}
        {item.uncertainty && <p className={styles.uncertainty}>Uncertain: {item.uncertainty}</p>}
      </div>
      <span className={styles.rowAction}>Review <ArrowRight size={15} aria-hidden="true" /></span>
    </li>
  );
}

function EmptyState({ unavailable = false }: { unavailable?: boolean }) {
  return unavailable
    ? <DisclosureState disposition="unavailable" compact />
    : <p className={styles.empty}>Nothing is available in this scope.</p>;
}

function MetricRow({ metric }: { metric: AuthorizedMetricResult }) {
  const label = metric.metricId === "organizational-understanding.coherence"
    ? "Organizational Understanding coherence"
    : metric.metricId === "organizational-learning.learning-velocity"
      ? "Organizational Learning Profile learning velocity"
      : metric.metricId.replaceAll("-", " ").replaceAll(".", " · ");
  if (metric.disposition === "unsupported-metric") {
    return <li className={styles.metric}><div><strong>{label}</strong><DisclosureState disposition="unsupported" compact /></div></li>;
  }
  const semantic = metric.disposition === "insufficient-authorized-information"
    ? "insufficient-authorized-information"
    : metric.disposition;
  return (
    <li className={styles.metric}>
      <div><strong>{label}</strong><span>Canonical, authorized measure</span></div>
      {metric.disposition === "disclosed"
        ? <b>{typeof metric.value === "number" ? metric.value.toFixed(2) : metric.value}</b>
        : <DisclosureState disposition={semantic === "safely-abstracted" ? semantic : semantic as SemanticDisposition} compact />}
    </li>
  );
}

const classificationLabels: Record<string, string> = {
  "aligned-supported": "Consistent with current intent and supported",
  "aligned-stale": "Consistent, based on stale information",
  "justified-divergence": "Divergence supported by local Evidence",
  "unexplained-drift": "Divergence without a current authorized explanation",
  "ambiguous-strategic-intent": "Strategic intent is unclear",
  "cross-scope-conflict": "Local benefit conflicts with broader constraints",
  "local-infeasibility": "Direction is consistent; local execution is constrained",
  "possible-strategy-invalidation": "Local Evidence may challenge strategy",
  "authorized-experiment": "Bounded experiment is authorized",
  "unauthorized-action": "Additional authority is required",
  "insufficient-authorized-information": "Not enough authorized information",
  withheld: "Assessment cannot be shown",
  unavailable: "Assessment is not available",
};

const axisLabels: Record<string, string> = {
  authority: "Authority", "strategic-relationship": "Strategic relationship",
  "evidence-support": "Evidence support", "local-feasibility": "Local feasibility",
  "cross-scope-effect": "Cross-scope effect", "strategy-challenge-potential": "Strategy challenge potential",
  "experiment-status": "Experiment status", "outcome-status": "Outcome status",
};

function AxisRow({ axis }: { axis: ScopedDecisionCalibrationAxisResult }) {
  const disposition = axis.disposition === "insufficient-authorized-information"
    ? axis.disposition : axis.disposition as SemanticDisposition;
  return (
    <details className={styles.axis}>
      <summary><span>{axisLabels[axis.axis]}</span>{axis.disposition === "disclosed" ? <strong>{axis.value?.replaceAll("-", " ")}</strong> : <DisclosureState disposition={disposition} compact />}</summary>
      <p>{axis.disposition === "disclosed" ? `Projected reason: ${axis.reasonCode.replaceAll("-", " ")}.` : dispositionCopy[disposition].description}</p>
    </details>
  );
}

function DecisionDetail({ view }: { view: RoleAwarePresentation }) {
  const decision = view.decisionCalibration;
  if (!decision) return <section className={styles.detail}><h1>{view.primaryHeading}</h1><DisclosureState disposition="unavailable" /></section>;
  if (decision.classification === "withheld") return <section className={styles.detail}><p className={styles.eyebrow}>Decision calibration</p><h1>{view.primaryHeading}</h1><DisclosureState disposition="withheld" />{view.primaryAction && <div className={styles.actions}><Link href={routeFor(view)}>{view.primaryAction}</Link></div>}</section>;
  return (
    <section className={styles.detail} aria-labelledby="decision-title">
      <p className={styles.eyebrow}>{view.primaryHeading}</p>
      <h1 id="decision-title">{classificationLabels[decision.classification]}</h1>
      <p className={styles.lede}>This is an advisory projection of the canonical decision context. It is not an approval or a score.</p>
      <div className={styles.authority}>
        <Shield size={19} aria-hidden="true" />
        <div><span>Authority is assessed separately</span><strong>{decision.axes.find((axis) => axis.axis === "authority")?.value?.replaceAll("-", " ") ?? "Not available"}</strong></div>
      </div>
      {decision.classification === "justified-divergence" && <p className={styles.callout}>This decision differs from current strategy, but local Evidence supports the difference.</p>}
      {decision.classification === "insufficient-authorized-information" && <DisclosureState disposition="insufficient-authorized-information" />}
      {view.primaryAction && <div className={styles.actions}><a href="#axes-title">{view.primaryAction}</a></div>}
      <section className={styles.axes} aria-labelledby="axes-title">
        <div className={styles.sectionHeading}><div><p>Projected dimensions</p><h2 id="axes-title">Eight independent axes</h2></div><span>No composite score</span></div>
        {decision.axes.map((axis) => <AxisRow key={axis.axis} axis={axis} />)}
      </section>
      <AuditDetail view={view} />
    </section>
  );
}

function UnderstandingDetail({ view }: { view: RoleAwarePresentation }) {
  const understanding = view.items.find((item) => item.kind === "understanding");
  const limited = view.items.find((item) => item.disposition === "safely-abstracted");
  return (
    <section className={styles.detail} aria-labelledby="understanding-title">
      <p className={styles.eyebrow}>Organizational Understanding</p>
      <h1 id="understanding-title">{view.primaryHeading}</h1>
      {understanding?.title && <h2>{understanding.title}</h2>}
      <p className={styles.lede}>{understanding?.summary ?? "Discovery can show only the bounded state available to this scope."}</p>
      {understanding?.uncertainty && <div className={styles.callout}><strong>This remains uncertain because</strong><br />{understanding.uncertainty}</div>}
      {limited && <DisclosureState disposition="safely-abstracted" />}
      <details className={styles.disclosurePanel}><summary>See safe support and contradiction</summary><p>{understanding ? "Authorized support is available through safe lineage. Any protected source identity remains absent." : "No additional detail is available."}</p></details>
      <div className={styles.actions}><Link href="/ask">{view.primaryAction ?? "Explore as a Question"}</Link><Link href={routeFor(view, "?view=history")}>View authorized history</Link></div>
      <AuditDetail view={view} />
    </section>
  );
}

function InvestigationDetail({ view }: { view: RoleAwarePresentation }) {
  const gap = view.items.find((item) => item.kind === "evidence-gap");
  const opportunity = view.items.find((item) => item.kind === "investigation-opportunity");
  return (
    <section className={styles.detail} aria-labelledby="investigation-title">
      <p className={styles.eyebrow}>{view.primaryHeading}</p>
      <h1 id="investigation-title">{gap?.title ?? view.primaryHeading}</h1>
      <p className={styles.lede}>{gap?.summary ?? "Discovery cannot establish this from the authorized information available to this view."}</p>
      <DisclosureState disposition="insufficient-authorized-information" explanation={gap?.uncertainty ?? undefined} />
      {opportunity && <section className={styles.focusBlock}><Search size={21} aria-hidden="true" /><div><p>Investigation opportunity</p><h2>{opportunity.title}</h2><span>{opportunity.summary}</span></div></section>}
      <p className={styles.eligibility}><strong>Contribution boundary:</strong> Authorized information may be eligible for governed consideration. Eligibility does not make it Evidence.</p>
      <div className={styles.actions}><Link href="/ask">{view.primaryAction ?? "Continue as a Question"}</Link></div>
      <AuditDetail view={view} />
    </section>
  );
}

function HistoryDetail({ view }: { view: RoleAwarePresentation }) {
  const changes = view.items.filter((item) => item.kind === "material-change");
  const outcome = view.decisionCalibration?.axes.find((axis) => axis.axis === "outcome-status");
  return (
    <section className={styles.detail} aria-labelledby="history-title">
      <p className={styles.eyebrow}>Change and authorized history</p>
      <h1 id="history-title">{view.primaryHeading}</h1>
      {view.projectionDisposition === "unavailable" ? <DisclosureState disposition="unavailable" explanation="This historical view is not available under current access." /> : changes.length ? (
        <ol className={styles.timeline}>
          {changes.map((change) => <li key={change.id}><Clock3 size={18} aria-hidden="true" /><div><time dateTime={view.evaluatedAt}>{view.evaluatedAt}</time><strong>{change.title}</strong>{change.summary && <p>{change.summary}</p>}</div></li>)}
        </ol>
      ) : <EmptyState />}
      {outcome?.disposition === "unavailable" && <DisclosureState disposition="unavailable" explanation="The decision can be assessed; an Outcome is not available." />}
      {view.primaryAction && <div className={styles.actions}><Link href={routeFor(view)}>{view.primaryAction}</Link></div>}
      <AuditDetail view={view} />
    </section>
  );
}

function AuditDetail({ view }: { view: RoleAwarePresentation }) {
  return (
    <details className={styles.audit}>
      <summary>Audit detail</summary>
      <dl><div><dt>Contract</dt><dd>Scoped Product projection v{view.contractVersion}</dd></div><div><dt>Projection reference</dt><dd>{view.projectionId}</dd></div><div><dt>Evaluated</dt><dd>{view.evaluatedAt}</dd></div></dl>
    </details>
  );
}

function Home({ view }: { view: RoleAwarePresentation }) {
  if (view.projectionDisposition !== "available") {
    const disposition = view.projectionDisposition === "insufficient-authorized-information" ? view.projectionDisposition : view.projectionDisposition;
    return <section className={styles.boundaryState}><h1>{view.primaryHeading}</h1><DisclosureState disposition={disposition} /></section>;
  }
  return (
    <div className={styles.home}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Living Organization</p>
        <h1>{view.primaryHeading}</h1>
        <p>See the authorized changes, uncertainties, decisions, and next useful work in this exact scope.</p>
        {view.primaryAction && <a className={styles.primaryAction} href="#attention">{view.primaryAction} <ArrowRight size={16} aria-hidden="true" /></a>}
      </header>
      {HOME_SECTIONS.map((section, index) => {
        const items = view.items.filter((entry) => section.kinds.includes(entry.kind as never));
        const isDecisions = section.id === "decisions";
        const isMeasures = section.id === "measures";
        const isLearning = section.id === "learning";
        const outcome = isLearning
          ? view.decisionCalibration?.axes.find((axis) => axis.axis === "outcome-status")
          : undefined;
        return (
          <section key={section.id} id={section.id} className={`${styles.homeSection} ${index === 0 ? styles.leadSection : ""}`} aria-labelledby={`${section.id}-title`}>
            <div className={styles.sectionHeading}><div><p>{section.question}</p><h2 id={`${section.id}-title`}>{section.title}</h2></div>{index > 0 && <Link href={routeFor(view, `?view=${section.id}`)}>View detail</Link>}</div>
            {isDecisions && view.decisionCalibration ? <div className={styles.decisionSummary}><Scale size={20} aria-hidden="true" /><div><strong>{classificationLabels[view.decisionCalibration.classification]}</strong><span>Review the producer-owned calibration and independent axes.</span></div><ArrowRight size={17} aria-hidden="true" /></div>
              : isMeasures ? (view.metrics.length ? <ul className={styles.rows}>{view.metrics.map((entry) => <MetricRow key={entry.resultId} metric={entry} />)}</ul> : <EmptyState />)
              : isLearning && outcome?.disposition === "disclosed" ? <ul className={styles.rows}><li className={styles.row}><div className={styles.rowCopy}><strong>Decision outcome status</strong><p>{outcome.value?.replaceAll("-", " ")}</p></div></li></ul>
              : isLearning && outcome?.disposition === "unavailable" ? <DisclosureState disposition="unavailable" compact />
              : items.length ? <ul className={styles.rows}>{items.slice(0, index === 0 ? 3 : 2).map((entry) => <ItemRow key={entry.id} item={entry} />)}</ul>
              : <EmptyState unavailable={view.unavailableKinds.length > 0 && section.kinds.some((kind) => view.unavailableKinds.includes(kind))} />}
          </section>
        );
      })}
    </div>
  );
}

function Workspace({ view }: { view: RoleAwarePresentation }) {
  if (view.workspace === "understanding") return <UnderstandingDetail view={view} />;
  if (view.workspace === "decision") return <DecisionDetail view={view} />;
  if (view.workspace === "investigation") return <InvestigationDetail view={view} />;
  if (view.workspace === "history") return <HistoryDetail view={view} />;
  return <Home view={view} />;
}

function FixtureHarness({ fixtureId }: { fixtureId: RoleAwareFixtureId }) {
  const index = ROLE_AWARE_FIXTURE_IDS.indexOf(fixtureId);
  const previous = ROLE_AWARE_FIXTURE_IDS[(index - 1 + ROLE_AWARE_FIXTURE_IDS.length) % ROLE_AWARE_FIXTURE_IDS.length]!;
  const next = ROLE_AWARE_FIXTURE_IDS[(index + 1) % ROLE_AWARE_FIXTURE_IDS.length]!;
  return (
    <aside className={styles.harness} aria-label="Development fixture controls">
      <span>Development fixture</span>
      <Link href={`/role-aware-alpha/${previous}`} aria-label={`Previous fixture, ${previous}`}><ArrowLeft size={15} aria-hidden="true" /></Link>
      <details className={styles.fixtureMenu}><summary aria-label="Choose role-aware fixture">Choose</summary><div>{ROLE_AWARE_FIXTURE_IDS.map((id) => <Link key={id} href={`/role-aware-alpha/${id}`} aria-current={id === fixtureId ? "true" : undefined}>{id}</Link>)}</div></details>
      <strong>{fixtureId}</strong>
      <Link href={`/role-aware-alpha/${next}`} aria-label={`Next fixture, ${next}`}><ArrowRight size={15} aria-hidden="true" /></Link>
    </aside>
  );
}

export default function RoleAwareExperience({ view, fixtureMode = false }: { view: RoleAwarePresentation; fixtureMode?: boolean }) {
  const routePath = view.routePath ?? (view.fixtureId ? `/role-aware-alpha/${view.fixtureId}` : "/development/role-aware-live");
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <header className={styles.topbar}>
        <Link href={routePath} className={styles.brand} aria-label="Discovery role-aware Home"><Sparkles size={19} aria-hidden="true" /><span><strong>Discovery</strong><small>Living Organization</small></span></Link>
        <div className={styles.scopeContext} aria-label="Current scope context"><span>{view.scopeLabel}</span><strong>{view.scopeType} · {view.temporalMode}</strong><small>{view.roleDescription} · descriptive orientation</small></div>
        {fixtureMode && <span className={styles.fixtureBadge}>Prototype · {view.fixtureId}</span>}
      </header>
      <nav className={styles.navigation} aria-label="Primary navigation">
        {ROLE_AWARE_NAVIGATION.map((label) => {
          const active = label.toLowerCase() === (view.workspace === "home" ? "home" : view.workspace === "decision" ? "decisions" : view.workspace === "investigation" ? "investigations" : view.workspace);
          const href = label === "Questions" ? "/ask" : `${routePath}?view=${label.toLowerCase()}`;
          return <Link key={label} href={href} aria-current={active ? "page" : undefined}>{label}</Link>;
        })}
      </nav>
      <main id="main-content" className={styles.main} tabIndex={-1}><Workspace view={view} /></main>
      {fixtureMode && view.fixtureId && <FixtureHarness fixtureId={view.fixtureId} />}
      <footer className={styles.footer}><BookOpen size={15} aria-hidden="true" /><span>{fixtureMode ? "Rendered from a validated scoped Product projection fixture. No live source is connected." : "Rendered from the retained organization through the canonical scoped Product projection."}</span>{view.liveDiagnostic && <span> · {view.liveDiagnostic.organizationId} · {view.liveDiagnostic.requestedScope} · revision {view.liveDiagnostic.sourceRevisionDigest?.slice(0, 12) ?? "unavailable"}</span>}</footer>
    </div>
  );
}
