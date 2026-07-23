import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleHelp,
  GitBranch,
  Lightbulb,
  PauseCircle,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  ConfidenceViewModel,
  MeaningfulChangeViewModel,
  RelationshipViewModel,
} from "../../product/alpha/viewModels";
import { Action, Eyebrow, Panel } from "./AlphaPrimitives";
import styles from "./AlphaExperience.module.css";

const toneIcon = {
  confidence: TrendingUp,
  contradiction: AlertTriangle,
  learning: Lightbulb,
  relationship: GitBranch,
} as const;

export function ConfidenceSummary({
  confidence,
  compact = false,
}: {
  confidence: ConfidenceViewModel;
  compact?: boolean;
}) {
  return (
    <div className={`${styles.confidence} ${compact ? styles.confidenceCompact : ""}`}>
      <div>
        <Eyebrow>Confidence</Eyebrow>
        <p className={styles.confidenceValue}>
          <strong>{confidence.qualitative}</strong>
          <b>{confidence.value}%</b>
          <span>↑ {confidence.change} pts</span>
        </p>
      </div>
      <div
        className={styles.confidenceArc}
        role="img"
        aria-label={`${confidence.qualitative} confidence at ${confidence.value} percent, increased by ${confidence.change} points. ${confidence.rationale} ${confidence.limitation}`}
      >
        <i />
        <i />
      </div>
      {!compact && (
        <ul className={styles.confidenceReasons}>
          <li>
            <Check size={16} aria-hidden="true" />
            Multiple source categories agree
          </li>
          <li>
            <Check size={16} aria-hidden="true" />
            Pattern repeats across teams
          </li>
          <li>
            <AlertTriangle size={16} aria-hidden="true" />
            One meaningful contradiction remains
          </li>
        </ul>
      )}
      <p className={styles.srOnly}>
        {confidence.rationale} {confidence.limitation}
      </p>
    </div>
  );
}

export function Sparkline({
  tone = "green",
  label = "Recent change trend",
}: {
  tone?: "green" | "blue" | "violet" | "orange";
  label?: string;
}) {
  return (
    <svg
      className={`${styles.sparkline} ${styles[`tone_${tone}`]}`}
      viewBox="0 0 120 42"
      role="img"
      aria-label={label}
    >
      <path d="M2 33 L20 28 L36 31 L52 17 L68 22 L84 10 L101 14 L118 4" />
      {[2, 20, 36, 52, 68, 84, 101, 118].map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy={[33, 28, 31, 17, 22, 10, 14, 4][index]}
          r="2.2"
        />
      ))}
    </svg>
  );
}

export function EvolutionGraph({
  early = 62,
  current = 74,
}: {
  early?: number;
  current?: number;
}) {
  return (
    <div
      className={styles.evolutionGraph}
      role="img"
      aria-label={`Understanding confidence strengthened from ${early} percent to ${current} percent`}
    >
      <svg viewBox="0 0 760 190" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="alpha-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3158ef" stopOpacity=".18" />
            <stop offset="1" stopColor="#3158ef" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className={styles.areaPath}
          d="M0 175 C75 168 110 145 160 148 C230 152 250 105 330 112 C410 119 430 68 515 77 C602 86 635 37 760 45 L760 190 L0 190 Z"
        />
        <path
          className={styles.linePath}
          d="M0 175 C75 168 110 145 160 148 C230 152 250 105 330 112 C410 119 430 68 515 77 C602 86 635 37 760 45"
        />
        {[160, 330, 515, 710].map((x, index) => (
          <circle key={x} cx={x} cy={[148, 112, 77, 47][index]} r="5" />
        ))}
      </svg>
      <span className={styles.graphEarly}>Early<br /><b>{early}%</b></span>
      <span className={styles.graphNow}>Now<br /><b>{current}%</b></span>
    </div>
  );
}

export function SemanticCallout({
  title,
  children,
  tone,
  icon,
}: {
  title: string;
  children: ReactNode;
  tone: "green" | "blue" | "orange" | "violet";
  icon?: "unknown" | "relationship" | "people" | "trend";
}) {
  const Icon =
    icon === "unknown"
      ? CircleHelp
      : icon === "relationship"
        ? GitBranch
        : icon === "people"
          ? Users
          : TrendingUp;
  return (
    <Panel tone={tone} className={styles.semanticCallout}>
      <span className={`${styles.semanticIcon} ${styles[`tone_${tone}`]}`}>
        <Icon size={21} aria-hidden="true" />
      </span>
      <div>
        <Eyebrow tone={tone === "orange" ? "orange" : tone === "green" ? "green" : tone === "violet" ? "violet" : "default"}>
          {title}
        </Eyebrow>
        {children}
      </div>
    </Panel>
  );
}

export function ChangeCard({
  change,
  compact = false,
  onAction,
}: {
  change: MeaningfulChangeViewModel;
  compact?: boolean;
  onAction?: () => void;
}) {
  const Icon = toneIcon[change.kind];
  const tone =
    change.kind === "contradiction"
      ? "orange"
      : change.kind === "learning"
        ? "violet"
        : change.kind === "relationship"
          ? "blue"
          : "green";
  return (
    <article
      className={`${styles.changeCard} ${styles[`change_${tone}`]} ${compact ? styles.changeCompact : ""}`}
    >
      <span className={`${styles.changeIcon} ${styles[`tone_${tone}`]}`}>
        <Icon size={compact ? 20 : 28} aria-hidden="true" />
      </span>
      <div className={styles.changeBody}>
        <Eyebrow tone={tone === "orange" ? "orange" : tone === "green" ? "green" : tone === "violet" ? "violet" : "default"}>
          {change.eyebrow}
        </Eyebrow>
        <h3>{change.headline}</h3>
        <p>{change.detail}</p>
        <button className={styles.inlineLink} type="button" onClick={onAction}>
          {change.action} <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      {!compact && (
        <div className={styles.changeImpact}>
          <span>Impact on Understanding</span>
          <strong>{change.impact}</strong>
        </div>
      )}
    </article>
  );
}

export function RelationshipRow({
  relationship,
}: {
  relationship: RelationshipViewModel;
}) {
  return (
    <article className={styles.relationshipRow}>
      <span className={`${styles.semanticIcon} ${styles[`tone_${relationship.tone}`]}`}>
        <GitBranch size={18} aria-hidden="true" />
      </span>
      <div>
        <strong>{relationship.title}</strong>
        <span>{relationship.description}</span>
      </div>
      <Sparkline tone={relationship.tone} label={`${relationship.title}: ${relationship.description}`} />
      <ArrowRight size={16} aria-hidden="true" />
    </article>
  );
}

export function FollowConfirmation({
  paused,
  onToggle,
}: {
  paused: boolean;
  onToggle: () => void;
}) {
  return (
    <Panel tone="green" className={styles.followConfirmation}>
      <span className={styles.followCheck}>
        {paused ? <PauseCircle size={24} aria-hidden="true" /> : <Check size={24} aria-hidden="true" />}
      </span>
      <div>
        <strong>{paused ? "Following paused" : "Following"}</strong>
        <p>
          {paused
            ? "Discovery will keep the current Understanding stable until you resume."
            : "Discovery will surface only meaningful changes in this prototype journey."}
        </p>
      </div>
      <Action tone="secondary" onClick={onToggle}>
        {paused ? "Resume following" : "Pause following"}
      </Action>
    </Panel>
  );
}

export function ResponseEffect({
  submitted,
  pathTitle,
}: {
  submitted: boolean;
  pathTitle: string;
}) {
  return (
    <Panel tone="violet" className={styles.responseEffect} aria-live="polite">
      <span className={styles.semanticIcon}>
        {submitted ? <Check size={22} aria-hidden="true" /> : <Search size={22} aria-hidden="true" />}
      </span>
      <div>
        <h3>{submitted ? "Your perspective is now part of the inquiry" : "What happens next"}</h3>
        <p>
          {submitted
            ? `Discovery treated “${pathTitle}” as a provisional contribution. The current synthesis remains unchanged while the contribution is examined.`
            : "Discovery will preserve your contribution, show its bounded effect, and keep the prior Understanding available."}
        </p>
      </div>
    </Panel>
  );
}

export function DirectionSummary() {
  return (
    <div className={styles.directionSummary}>
      <span><TrendingUp size={17} aria-hidden="true" /> Strengthening</span>
      <span><TrendingDown size={17} aria-hidden="true" /> Weakening</span>
      <span><AlertTriangle size={17} aria-hidden="true" /> Contradiction</span>
      <span><GitBranch size={17} aria-hidden="true" /> New relationship</span>
    </div>
  );
}
