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
type ChangeDisclosure = NonNullable<
  UnderstandingViewModel["changeDisclosure"]
>;
type EvidenceRequestDisclosure = NonNullable<
  UnderstandingViewModel["evidenceRequestDisclosure"]
>;

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

const changeAvailabilityMessage: Record<
  Exclude<ChangeDisclosure["state"], "available">,
  string
> = {
  "first-supported-understanding":
    "This is the first supported understanding, so no prior revision exists.",
  "history-not-authorized":
    "Prior history exists but is not authorized for this view.",
  "change-reason-unavailable":
    "A canonical change exists, but no supported reason is available.",
  "no-meaningful-change":
    "No meaningful change to this understanding is currently recorded.",
  "projection-data-unavailable":
    "Evolution data is not yet available through the authorized projection.",
};

const changeDirectionLabels: Record<
  ChangeDisclosure["changes"][number]["direction"],
  string
> = {
  emerged: "Emerged",
  strengthened: "Strengthened",
  weakened: "Weakened",
  revised: "Revised",
  contradicted: "Contradicted",
  retired: "Retired",
  merged: "Merged",
  resolved: "Resolved",
  unresolved: "Became unresolved",
};

function ChangeDisclosureContent({
  disclosure,
}: {
  disclosure: ChangeDisclosure;
}) {
  return (
    <section className={styles.beliefBasis} aria-labelledby="change-disclosure-title">
      <header>
        <Eyebrow>Authorized Product Communication</Eyebrow>
        <h2 id="change-disclosure-title">What changed and why</h2>
      </header>
      {disclosure.changes.length > 0 ? (
        <div className={styles.changeDisclosureList}>
          {disclosure.changes.map((change) => (
            <article key={change.id}>
              <strong>
                Recorded change: {changeDirectionLabels[change.direction]}.
              </strong>
              <p>
                {change.reason ??
                  "A canonical change exists, but no supported reason is available."}
              </p>
              <span>
                {change.previousRevisionAvailable
                  ? "This change continues from a previous authorized revision."
                  : "This is the first supported version of this understanding."}
              </span>
              <time dateTime={change.occurredAt}>{change.occurredAt}</time>
            </article>
          ))}
        </div>
      ) : (
        <p>{changeAvailabilityMessage[
          disclosure.state === "available"
            ? "no-meaningful-change"
            : disclosure.state
        ]}</p>
      )}
    </section>
  );
}

const evidenceRequestAvailabilityMessage: Record<
  Exclude<EvidenceRequestDisclosure["state"], "available">,
  string
> = {
  "no-additional-evidence-recommended":
    "No additional evidence is currently recommended.",
  "inquiry-rationale-unavailable":
    "An inquiry is available, but its rationale is not available.",
  "gap-known-request-not-authorized":
    "A gap is known, but no authorized evidence request can be shown.",
  "expected-gain-unavailable":
    "The expected improvement estimate is not available.",
  "supporting-references-unavailable":
    "The inquiry is authorized, but its supporting references are not available.",
  "investigation-data-unavailable":
    "Investigation data is not available through the active projection.",
  "organizational-context-not-authorized":
    "The relevant organizational context is not authorized for this view.",
};

function EvidenceRequestDisclosureContent({
  disclosure,
}: {
  disclosure: EvidenceRequestDisclosure;
}) {
  const request = disclosure.request;
  return (
    <section className={styles.beliefBasis} aria-labelledby="evidence-request-disclosure-title">
      <header>
        <Eyebrow>Authorized Product Communication</Eyebrow>
        <h2 id="evidence-request-disclosure-title">Why this evidence matters</h2>
      </header>
      {request ? (
        <div className={styles.beliefBasisGrid}>
          <div>
            <h3>What Discovery is asking for</h3>
            <p>{request.question}</p>
          </div>
          <div>
            <h3>What gap it addresses</h3>
            {request.gaps.length > 0 ? (
              <ul>{request.gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul>
            ) : (
              <p>The specific gap is not available.</p>
            )}
          </div>
          <div>
            <h3>What it may clarify</h3>
            {request.clarificationTargets.length > 0 ? (
              <ul>
                {request.clarificationTargets.map((target) => (
                  <li key={target}>{target}</li>
                ))}
              </ul>
            ) : (
              <p>The clarification target is not available.</p>
            )}
          </div>
          <div>
            <h3>Why it is prioritized now</h3>
            <p>
              {request.rationale ??
                "The inquiry rationale is not available."}
            </p>
          </div>
          <div>
            <h3>Expected improvement</h3>
            <p>
              {request.expectedConfidenceGain === null
                ? "The expected confidence-gain estimate is not available."
                : `Discovery estimates a confidence-gain signal of ${request.expectedConfidenceGain} points on its existing scale. This is an estimate, not a guarantee.`}
            </p>
          </div>
          <div>
            <h3>What remains uncertain</h3>
            <p>{request.outcomeCaveat}</p>
            <small>
              {request.supportingReferencesAvailable
                ? "Authorized supporting context is available."
                : "Supporting references are not available for this inquiry."}
            </small>
          </div>
        </div>
      ) : (
        <p>{evidenceRequestAvailabilityMessage[
          disclosure.state === "available"
            ? "no-additional-evidence-recommended"
            : disclosure.state
        ]}</p>
      )}
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
  changeDisclosure,
  evidenceRequestDisclosure,
  details,
  children,
}: {
  basis: BeliefBasis | undefined;
  changeDisclosure: ChangeDisclosure | undefined;
  evidenceRequestDisclosure: EvidenceRequestDisclosure | undefined;
  details: ReadonlyArray<readonly [
    id: string,
    title: string,
    copy: string,
    tone: "green" | "violet" | "blue" | "orange",
  ]>;
  children: (parts: {
    trigger: ReactNode;
    disclosure: ReactNode;
    changeTrigger: ReactNode;
    changeDisclosure: ReactNode;
    evidenceRequestTrigger: ReactNode;
    evidenceRequestDisclosure: ReactNode;
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
  const changeExpanded = openDetail === "change-disclosure";
  const changeTrigger = (
    <button
      className={styles.inlineLink}
      type="button"
      onClick={() =>
        setOpenDetail(changeExpanded ? null : "change-disclosure")
      }
      aria-expanded={changeExpanded}
    >
      What changed and why <ArrowRight size={16} aria-hidden="true" />
    </button>
  );
  const evidenceRequestExpanded = openDetail === "evidence-request-disclosure";
  const evidenceRequestTrigger = (
    <button
      className={styles.inlineLink}
      type="button"
      onClick={() =>
        setOpenDetail(
          evidenceRequestExpanded ? null : "evidence-request-disclosure",
        )
      }
      aria-expanded={evidenceRequestExpanded}
    >
      Why this evidence matters <ArrowRight size={16} aria-hidden="true" />
    </button>
  );

  return children({
    trigger,
    disclosure:
      expanded && basis ? <BeliefBasisDisclosure basis={basis} /> : null,
    changeTrigger,
    changeDisclosure:
      changeExpanded && changeDisclosure
        ? <ChangeDisclosureContent disclosure={changeDisclosure} />
        : null,
    evidenceRequestTrigger,
    evidenceRequestDisclosure:
      evidenceRequestExpanded && evidenceRequestDisclosure
        ? (
            <EvidenceRequestDisclosureContent
              disclosure={evidenceRequestDisclosure}
            />
          )
        : null,
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
