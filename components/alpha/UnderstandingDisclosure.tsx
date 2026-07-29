"use client";

import {
  AlertTriangle,
  ArrowRight,
  CircleHelp,
  Lightbulb,
  Users,
} from "lucide-react";
import {
  useState,
  type ReactNode,
} from "react";

import type { UnderstandingViewModel } from "../../product/alpha/viewModels";
import { Eyebrow } from "./AlphaPrimitives";
import styles from "./AlphaExperience.module.css";

type BeliefBasis = NonNullable<UnderstandingViewModel["beliefBasis"]>;

const evidenceRoleLabels = {
  supports: "Supporting evidence",
  opposes: "Opposing evidence",
  shared: "Evidence shared across explanations",
} as const;

const inquiryRationale = {
  "investigation-information-gain":
    "Product Communication prioritizes this inquiry using an authorized information-gain signal.",
  "investigation-opportunity-available":
    "Product Communication includes this as an available investigation opportunity.",
  "authorized-next-inquiry":
    "This is the next inquiry available through the authorized communication plan.",
} as const;

function BeliefBasisDisclosure({ basis }: { basis: BeliefBasis }) {
  return (
    <section className={styles.beliefBasis} aria-labelledby="belief-basis-title">
      <header>
        <Eyebrow>Authorized Product Communication</Eyebrow>
        <h2 id="belief-basis-title">Why Discovery currently believes this</h2>
        <p>{basis.summaryExplanation}</p>
      </header>
      <div className={styles.beliefBasisGrid}>
        <div>
          <h3>Comparative evidence</h3>
          <ul>
            {basis.evidenceCategories.map((category) => (
              <li key={category.role}>
                <strong>{evidenceRoleLabels[category.role]}</strong>
                <span>
                  {category.count === 0
                    ? "None available"
                    : `${category.count} authorized reference${category.count === 1 ? "" : "s"}`}
                </span>
              </li>
            ))}
          </ul>
          <small>
            Evidence bodies are not exposed through this communication contract.
          </small>
        </div>
        <div>
          <h3>Remaining uncertainty</h3>
          {basis.uncertainty.length > 0 ? (
            <ul>
              {basis.uncertainty.map((item) => <li key={item}>{item}</li>)}
            </ul>
          ) : (
            <p>No additional uncertainty text is available.</p>
          )}
        </div>
        <div>
          <h3>Alternative explanations not yet eliminated</h3>
          {basis.alternatives.length > 0 ? (
            <ul>
              {basis.alternatives.map((alternative) => (
                <li key={alternative.id}>
                  <strong>{alternative.summary ?? "Explanation text unavailable"}</strong>
                  <span>{alternative.disposition}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No unresolved alternative is available through Product Communication.</p>
          )}
        </div>
        <div>
          <h3>What would most improve this understanding</h3>
          {basis.nextInquiry ? (
            <>
              <strong>{basis.nextInquiry.question}</strong>
              <p>{inquiryRationale[basis.nextInquiry.rationale]}</p>
            </>
          ) : (
            <p>No additional inquiry is currently authorized.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Presentation-only progressive disclosure boundary.
 *
 * The render prop preserves caller-owned layout while this component owns the
 * disclosure state, trigger accessibility, labels, availability copy, and
 * section presentation. Future disclosure content can reuse this placement
 * pattern without moving reasoning or source interpretation into the scene.
 */
export default function UnderstandingDisclosure({
  basis,
  details,
  children,
}: {
  basis: BeliefBasis | undefined;
  details: ReadonlyArray<readonly [
    id: string,
    title: string,
    copy: string,
    tone: "green" | "violet" | "blue" | "orange",
  ]>;
  children: (parts: {
    trigger: ReactNode;
    disclosure: ReactNode;
    detailGrid: ReactNode;
  }) => ReactNode;
}) {
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const expanded = openDetail === "belief-basis";
  const trigger = (
    <button
      className={styles.inlineLink}
      type="button"
      onClick={() => setOpenDetail(expanded ? null : "belief-basis")}
      aria-expanded={expanded}
    >
      See why Discovery believes this <ArrowRight size={16} aria-hidden="true" />
    </button>
  );

  return children({
    trigger,
    disclosure:
      expanded && basis ? <BeliefBasisDisclosure basis={basis} /> : null,
    detailGrid: (
      <div className={styles.detailGrid}>
        {details.map(([id, title, copy, tone]) => (
          <button
            key={id}
            type="button"
            className={`${styles.detailCard} ${openDetail === id ? styles.detailOpen : ""}`}
            onClick={() => setOpenDetail(openDetail === id ? null : id)}
            aria-expanded={openDetail === id}
          >
            <span className={`${styles.semanticIcon} ${styles[`tone_${tone}`]}`}>
              {id === "why" ? <Users size={20} aria-hidden="true" /> : id === "unknown" ? <CircleHelp size={20} aria-hidden="true" /> : id === "contradiction" ? <AlertTriangle size={20} aria-hidden="true" /> : <Lightbulb size={20} aria-hidden="true" />}
            </span>
            <strong>{title}</strong>
            <p>{copy}</p>
            {openDetail === id && <small>{id === "contradiction" ? "This limits where the current explanation applies." : "This remains part of the current, historically traceable synthesis."}</small>}
          </button>
        ))}
      </div>
    ),
  });
}
