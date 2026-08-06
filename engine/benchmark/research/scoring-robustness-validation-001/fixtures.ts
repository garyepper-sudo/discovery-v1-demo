import type { BenchmarkPhase, ComparativeTreatmentOutput, ObservableClaim, TreatmentId } from "../external-comparative-validation-001/types";
import type { RobustnessCase } from "./contracts";

const claim = (statement: string, confidence: number | null = 0.82, evidenceIds = ["e-1"]): ObservableClaim => ({ statement, semanticIds: [], confidence, evidenceIds });

export const phase: BenchmarkPhase = {
  phaseId: "initial",
  evidenceIds: ["e-1", "e-2", "e-3"],
  groundTruth: {
    materialFacts: ["approval ownership begins after customer handoff", "credential readiness varies across implementation teams"],
    contradictions: [
      { id: "contradiction-1", left: "approval timing delays onboarding", right: "credential readiness delays onboarding" },
      { id: "contradiction-2", left: "handoff volume is stable", right: "handoff duration is increasing" },
    ],
    supportedMechanisms: ["late approval ownership delays customer onboarding handoffs", "credential unreadiness blocks implementation access"],
    unsupportedMechanisms: ["marketing campaign volume delays customer onboarding"],
    uncertainties: ["the relative contribution of approval timing and credential readiness is unresolved", "the duration effect of regional variation is unknown"],
    conditions: ["customer onboarding handoffs are operationally constrained", "implementation access readiness is inconsistent"],
    primaryConstraint: "approval ownership timing is the principal current constraint",
    highValueMissingEvidence: ["compare handoff duration by approval timing while holding credential readiness constant", "compare access readiness across implementation teams", "measure regional handoff duration using the same process definition"],
    decisionImplications: ["test earlier approval ownership before redesigning the entire onboarding process", "standardize credential readiness checks before changing staffing"],
    expectedAbstention: false,
  },
};

export const baseline: ComparativeTreatmentOutput = {
  contractVersion: "1", treatmentId: "traditional-structured-analysis", executionClass: "deterministic-local-baseline",
  caseId: "scoring-robustness-001", organizationId: "scoring-org-001", phaseId: "initial",
  materialFacts: phase.groundTruth.materialFacts.map((item, index) => claim(item, index ? 0.76 : 0.9, [`e-${index + 1}`])),
  principalFindings: [],
  contradictions: phase.groundTruth.contradictions.map((item, index) => ({ id: item.id, left: claim(item.left, 0.65, [`e-${index + 1}`]), right: claim(item.right, 0.65, [`e-${index + 2}`]), resolved: false })),
  causalExplanations: phase.groundTruth.supportedMechanisms.map((item) => claim(item, 0.78)),
  organizationalConditions: phase.groundTruth.conditions.map((item) => claim(item, 0.74)),
  primaryConstraint: claim(phase.groundTruth.primaryConstraint!, 0.7),
  uncertaintyStatements: phase.groundTruth.uncertainties.map((item) => claim(item, 0.55, ["e-1", "e-2"])),
  missingEvidence: phase.groundTruth.highValueMissingEvidence.slice(0, 1).map((item) => claim(item, null, [])),
  recommendedNextEvidence: phase.groundTruth.highValueMissingEvidence.slice(1).map((item) => claim(item, null, [])),
  decisionImplications: phase.groundTruth.decisionImplications.map((item) => claim(item, 0.68)),
  predictions: [], abstained: false, abstentionReason: null, lineageComplete: true, permissionCompliant: true,
};

const copy = (patch: Partial<ComparativeTreatmentOutput>): ComparativeTreatmentOutput => ({ ...baseline, ...patch });
const rewrite = (items: ObservableClaim[], statements: string[]) => items.map((item, index) => ({ ...item, statement: statements[index] ?? item.statement }));
const treatment = (treatmentId: TreatmentId): ComparativeTreatmentOutput => copy({ treatmentId });

export const cases: RobustnessCase[] = [
  { id: "paraphrase-plain", dimension: "paraphrase", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "lexical-dependence", output: copy({ materialFacts: rewrite(baseline.materialFacts, ["Customers are transferred before anyone takes responsibility for approval.", "Some delivery groups have access credentials ready while others do not."]), causalExplanations: rewrite(baseline.causalExplanations, ["Handovers take longer when responsibility for sign-off is assigned late."]) }) },
  { id: "paraphrase-passive", dimension: "paraphrase", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "lexical-dependence", output: copy({ materialFacts: rewrite(baseline.materialFacts, ["Responsibility for sign-off is assigned only after the client has been transferred.", "Access preparation is inconsistent among delivery groups."]) }) },
  { id: "ordering-reversed", dimension: "ordering", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "ordering-dependence", output: copy({ materialFacts: [...baseline.materialFacts].reverse(), contradictions: [...baseline.contradictions].reverse(), causalExplanations: [...baseline.causalExplanations].reverse(), organizationalConditions: [...baseline.organizationalConditions].reverse(), uncertaintyStatements: [...baseline.uncertaintyStatements].reverse(), missingEvidence: [...baseline.missingEvidence].reverse(), recommendedNextEvidence: [...baseline.recommendedNextEvidence].reverse(), decisionImplications: [...baseline.decisionImplications].reverse() }) },
  { id: "verbosity-concise", dimension: "verbosity", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "verbosity-dependence", output: copy({ primaryConstraint: claim("approval ownership timing is the principal constraint", 0.7) }) },
  { id: "verbosity-expanded", dimension: "verbosity", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "verbosity-dependence", output: copy({ primaryConstraint: claim("Based on the currently authorized evidence and within the stated limits, approval ownership timing is the principal current constraint affecting the organization.", 0.7) }) },
  { id: "terminology-plain", dimension: "terminology", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "discovery-terminology-dependence", output: copy({ organizationalConditions: rewrite(baseline.organizationalConditions, ["The current state of customer onboarding is constrained at team handovers."]), uncertaintyStatements: rewrite(baseline.uncertaintyStatements, ["We cannot yet tell how much delayed sign-off versus access preparation contributes."]), missingEvidence: rewrite(baseline.missingEvidence, ["Missing information: compare transfer times when sign-off differs but access preparation is the same."]) }) },
  { id: "confidence-percentage-language", dimension: "confidence", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "confidence-interpretation-failure", output: copy({ causalExplanations: baseline.causalExplanations.map((item) => ({ ...item, confidence: 78, statement: `${item.statement}; confidence is 78 percent` })) }) },
  { id: "confidence-qualitative-language", dimension: "confidence", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "confidence-interpretation-failure", output: copy({ causalExplanations: baseline.causalExplanations.map((item) => ({ ...item, confidence: null, statement: `${item.statement}; this is moderately likely` })) }) },
  { id: "evidence-order-reversed", dimension: "evidence-ordering", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "ordering-dependence", output: copy({ uncertaintyStatements: baseline.uncertaintyStatements.map((item) => ({ ...item, evidenceIds: [...item.evidenceIds].reverse() })) }) },
  { id: "contradiction-endpoint-order", dimension: "contradiction-ordering", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "contradiction-interpretation-failure", output: copy({ contradictions: baseline.contradictions.map((item) => ({ ...item, left: item.right, right: item.left })).reverse() }) },
  { id: "mechanism-plain", dimension: "mechanism-wording", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "mechanism-interpretation-failure", output: copy({ causalExplanations: rewrite(baseline.causalExplanations, ["Assigning the sign-off owner too late makes the customer transfer take longer."]) }) },
  { id: "uncertainty-inconclusive", dimension: "uncertainty-wording", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "lexical-dependence", output: copy({ uncertaintyStatements: rewrite(baseline.uncertaintyStatements, ["Current evidence is inconclusive about whether late sign-off or access preparation contributes more."]) }) },
  { id: "gap-plain", dimension: "missing-evidence-wording", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "lexical-dependence", output: copy({ missingEvidence: rewrite(baseline.missingEvidence, ["Hold access readiness equal, vary when sign-off responsibility starts, and compare transfer time."]) }) },
  { id: "format-json-roundtrip", dimension: "formatting", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "formatting-dependence", output: JSON.parse(JSON.stringify(baseline)) as ComparativeTreatmentOutput },
  { id: "anti-gaming-duplicates", dimension: "anti-gaming", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "evaluator-bug", output: copy({ materialFacts: [...baseline.materialFacts, ...baseline.materialFacts], causalExplanations: [...baseline.causalExplanations, ...baseline.causalExplanations] }) },
  { id: "cross-treatment-discovery", dimension: "cross-treatment", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "evaluator-bug", output: treatment("discovery") },
  { id: "cross-treatment-human", dimension: "cross-treatment", semanticClass: "equivalent", expectedEquivalentToBaseline: true, failureClass: "evaluator-bug", output: treatment("human-only") },
  { id: "negative-agreement", dimension: "negative-control", semanticClass: "non-equivalent", expectedEquivalentToBaseline: false, expectedDirection: "lower", failureClass: "contradiction-interpretation-failure", output: copy({ contradictions: [{ ...baseline.contradictions[0], right: claim("approval timing does not delay onboarding", 0.65) }] }) },
  { id: "negative-speculation", dimension: "negative-control", semanticClass: "non-equivalent", expectedEquivalentToBaseline: false, expectedDirection: "lower", failureClass: "mechanism-interpretation-failure", output: copy({ causalExplanations: [claim("marketing campaign volume delays customer onboarding", 0.9)] }) },
  { id: "negative-hallucinated-confidence", dimension: "negative-control", semanticClass: "non-equivalent", expectedEquivalentToBaseline: false, expectedDirection: "lower", failureClass: "confidence-interpretation-failure", output: copy({ principalFindings: [claim("renewal pricing is certainly responsible", 1)] }) },
  { id: "negative-irrelevant-gap", dimension: "negative-control", semanticClass: "non-equivalent", expectedEquivalentToBaseline: false, expectedDirection: "lower", failureClass: "lexical-dependence", output: copy({ missingEvidence: [claim("collect social media follower counts", null, [])] }) },
];
