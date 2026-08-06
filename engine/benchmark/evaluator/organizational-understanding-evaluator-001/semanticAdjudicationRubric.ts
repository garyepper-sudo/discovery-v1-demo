import type { MatchClassification, PropositionFamily } from "./contracts";
import { propositionFamilies } from "./frozenSemantics";
import { SEMANTIC_ADJUDICATION_RUBRIC_VERSION } from "./phase4Contracts";

export const semanticClassificationRubric = Object.freeze({
  version: SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
  classifications: Object.freeze({
    exact: "All material meaning and qualifiers are preserved.",
    equivalent: "Wording differs while all decision-relevant meaning is materially equivalent.",
    partial: "Some material meaning is preserved while an important element is omitted or weakened.",
    overgeneralized: "The recovered claim is materially broader than supported.",
    undergeneralized: "The recovered claim is materially narrower than supported.",
    contradictory: "The recovered claim materially opposes the candidate.",
    unsupported: "The recovered claim asserts meaning unsupported by the case.",
    irrelevant: "The claim does not address the candidate meaning.",
    ambiguous: "Available context cannot support a reliable judgment.",
    missing: "No recovered proposition expresses the required candidate meaning.",
  } satisfies Record<MatchClassification, string>),
  examples: Object.freeze(propositionFamilies.map((family) => Object.freeze({
    family,
    positive: `A plain-language ${family} preserves the same material scope and qualifiers.`,
    boundary: `A management memo preserves only part of the material ${family} structure.`,
    negativeControl: `A plausible but unrelated statement must not receive ${family} credit.`,
  }))),
  styleNeutralEquivalentExamples: Object.freeze([
    Object.freeze({ style: "plain-language analyst", text: "The accountable owner is assigned after the customer transfer begins." }),
    Object.freeze({ style: "executive memo", text: "Accountability currently begins too late in the transfer sequence." }),
    Object.freeze({ style: "management consulting", text: "The operating constraint is delayed assignment of sign-off ownership." }),
    Object.freeze({ style: "technical analysis", text: "Ownership assignment follows the handoff event in the observed sequence." }),
    Object.freeze({ style: "generic synthesis", text: "Late ownership timing is the best-supported present explanation." }),
    Object.freeze({ style: "neutral structured output", text: "subject: approval owner; relation: assigned after; object: customer handoff" }),
  ]),
});

export const familyAdjudicationRequirements: Readonly<Record<PropositionFamily, readonly string[]>> = Object.freeze({
  finding: Object.freeze(["factual-meaning", "scope", "polarity", "time"]),
  condition: Object.freeze(["organizational-state", "scope", "polarity", "time"]),
  constraint: Object.freeze(["limiting-factor", "primacy", "scope", "time"]),
  conclusion: Object.freeze(["synthesized-interpretation", "material-qualifiers", "scope"]),
  prediction: Object.freeze(["predicted-outcome", "direction", "horizon", "uncertainty"]),
  contradiction: Object.freeze(["both-endpoints", "conflict-relationship", "evidence-orientation", "unresolved-status"]),
  mechanism: Object.freeze(["explanandum", "causal-pathway", "competing-mechanisms", "causal-modality", "evidentiary-support"]),
  uncertainty: Object.freeze(["unknown-content", "reason-unknown", "abstention-scope"]),
  "evidence-gap": Object.freeze(["missing-information", "affected-understanding", "priority", "expected-utility", "feasibility"]),
  implication: Object.freeze(["downstream-decision-relevance", "non-generic-action-boundary"]),
});

export const ADJUDICATOR_CONFIDENCE_THRESHOLD = Object.freeze({
  version: "oue-adjudicator-confidence-threshold/v1",
  confirmatoryMinimum: 0.75,
});

export const adjacentBoundedClassifications = Object.freeze([
  Object.freeze(["exact", "equivalent"]),
  Object.freeze(["partial", "undergeneralized"]),
  Object.freeze(["partial", "overgeneralized"]),
] as const);
