import type { DimensionDefinition } from "./types";

const metric = (
  id: string,
  label: string,
  definition: string,
  measurement: string,
  kind: "measured" | "estimated" | "human_only",
  examples: string[],
  failureModes: string[],
) => ({ id, label, definition, measurement, kind, examples, failureModes });

export const DISCOVERY_INTELLIGENCE_SCORECARD: DimensionDefinition[] = [
  {
    id: "organizational_understanding",
    label: "Organizational Understanding",
    role: "optimization_target",
    definition:
      "The quality, completeness, calibration, usefulness, and durability of Discovery's current understanding of an organization.",
    purpose: "Serve as Discovery's single canonical optimization target.",
    relationshipToUnderstanding:
      "This is the fitness function itself; no other dimension may compensate for weak Organizational Understanding.",
    metrics: [
      metric("observation_quality", "Observation quality", "Relevant facts are accurately distinguished from interpretation.", "Compare stated observations with admitted evidence.", "measured", ["Material facts are retained without causal inflation."], ["Evidence is omitted or restated inaccurately."]),
      metric("signal_quality", "Signal quality", "Meaningful patterns are distinguished from isolated facts.", "Score expected pattern recovery and false pattern avoidance.", "measured", ["Repeated changes are recognized as a pattern."], ["A single anecdote is promoted to a trend."]),
      metric("explanation_quality", "Explanation quality", "The explanation accounts for material evidence without exceeding it.", "Compare expected and recovered explanatory claims.", "estimated", ["Multiple evidence lines support a bounded explanation."], ["Description is presented as cause."]),
      metric("competing_explanations", "Competing explanation quality", "Plausible alternatives are surfaced and discriminated.", "Measure expected alternative coverage and unsupported dismissal.", "measured", ["A demand explanation remains alongside an execution explanation."], ["The first plausible story is treated as settled."]),
      metric("uncertainty_quality", "Uncertainty quality", "Known limits and discriminating unknowns are explicit.", "Compare disclosed uncertainty with scenario expectations.", "measured", ["Missing cohort evidence is named."], ["Generic caveats replace specific uncertainty."]),
      metric("coverage", "Coverage", "Material evidence and relevant organizational scope are represented.", "Compute expected evidence and issue coverage.", "measured", ["Supporting and weakening evidence are both covered."], ["Contradictory evidence disappears."]),
      metric("calibration", "Calibration", "Strength of language matches support.", "Compare assertion strength with expected epistemic state.", "measured", ["Provisional claims remain provisional."], ["Low-support claims are stated as facts."]),
      metric("novel_understanding", "Novel understanding", "The result adds a defensible synthesis beyond source restatement.", "Human reviewers identify useful non-obvious synthesis with lineage.", "human_only", ["A cross-silo relationship becomes visible."], ["Novelty is fabricated or merely stylistic."]),
      metric("compression", "Compression", "Complex evidence is reduced without losing decisive distinctions.", "Human review of information retained per unit of communication.", "human_only", ["Ten facts become three traceable implications."], ["Brevity removes material uncertainty."]),
      metric("generalization", "Generalization", "Understanding transfers across wording and domains without lexical leakage.", "Use held-out paraphrase and cross-domain scenarios.", "measured", ["Equivalent evidence phrasing yields the same bounded meaning."], ["Recovery depends on fixture phrases."]),
    ],
  },
  {
    id: "truthfulness",
    label: "Truthfulness",
    role: "hard_constraint",
    definition: "How faithfully communication preserves evidence, authority, uncertainty, and causal limits.",
    purpose: "Prevent any apparent understanding gain from exceeding evidence or authority.",
    relationshipToUnderstanding:
      "Organizational Understanding is invalid unless this constraint passes.",
    metrics: [
      metric("grounding", "Grounding", "Every material claim is supported by admitted evidence or canonical authority.", "Verify claim-to-source coverage.", "measured", ["Each finding has an evidence reference."], ["A material claim has no source."]),
      metric("lineage", "Lineage", "Source ancestry remains exact and organization-scoped.", "Validate references and organization ownership.", "measured", ["All references resolve within the scenario organization."], ["Cross-organization evidence appears."]),
      metric("confidence_calibration", "Confidence calibration", "Confidence and language strength match evidential support.", "Compare expected and reported confidence bands.", "measured", ["Confidence falls when weakening evidence arrives."], ["Confidence remains fixed despite contradiction."]),
      metric("causal_restraint", "Causal restraint", "Association and hypothesis are not presented as causation.", "Run causal and hypothesis negative controls.", "measured", ["Possible mechanism is labeled provisional."], ["Correlation becomes a causal conclusion."]),
      metric("hallucination_avoidance", "Hallucination avoidance", "No unsupported facts, values, or entities are introduced.", "Exact unsupported-claim count.", "measured", ["No invented quantitative values."], ["A fabricated conversion rate appears."]),
      metric("negative_controls", "Negative controls", "Negation, quotation, and irrelevant lookalikes are rejected.", "Run deterministic negative-control fixtures.", "measured", ["A denied claim is not recovered as support."], ["Quoted speculation becomes evidence."]),
      metric("abstention_quality", "Abstention quality", "The system abstains only when useful truthful communication is unavailable.", "Score correct abstentions and unnecessary abstentions.", "measured", ["Insufficient evidence yields a precise gap."], ["Available bounded utility is suppressed."]),
    ],
  },
  {
    id: "decision_utility",
    label: "Truthful Decision Utility",
    role: "supporting_capability",
    definition: "How much the result improves reasonable managerial judgment without making false recommendations.",
    purpose: "Test whether understanding is relevant to reasonable managerial judgment.",
    relationshipToUnderstanding:
      "Decision relevance supports usefulness within Organizational Understanding but is not an independent objective.",
    metrics: [
      metric("thinking_change", "Thinking change", "The result would materially update a reasonable manager's frame.", "Blinded human before/after judgment review.", "human_only", ["A hidden constraint changes the decision frame."], ["The output merely repeats the question."]),
      metric("tradeoff_quality", "Tradeoff quality", "Material tensions and consequences are explicit.", "Compare expected tradeoffs with communication.", "estimated", ["Speed versus control is made visible."], ["Only benefits are presented."]),
      metric("overlooked_explanations", "Overlooked explanations", "Useful plausible alternatives become visible.", "Measure expected alternative recovery.", "measured", ["A capacity explanation is surfaced beside demand."], ["Plausible alternatives are omitted."]),
      metric("next_evidence_utility", "Next-evidence utility", "Recommended evidence can discriminate among live alternatives.", "Rank recommendations against scenario ground truth.", "measured", ["Cohort data separates acquisition from retention."], ["More documents is the only guidance."]),
      metric("false_recommendation_avoidance", "False recommendation avoidance", "No action is prescribed beyond support.", "Count unsupported prescriptive claims.", "measured", ["The output recommends investigation, not a premature intervention."], ["A low-confidence hypothesis becomes an action mandate."]),
    ],
  },
  {
    id: "evidence_acquisition",
    label: "Evidence Acquisition Quality",
    role: "supporting_capability",
    definition: "How effectively Discovery asks for evidence that reduces the most important uncertainty.",
    purpose: "Measure the quality and sequence of learning, not document volume.",
    relationshipToUnderstanding:
      "Evidence acquisition supports future understanding by reducing the most important uncertainty.",
    metrics: [
      metric("next_evidence_quality", "Next-evidence quality", "Recommendations target discriminating evidence.", "Compare ranked recommendations with expected highest-value evidence.", "measured", ["A specific operational cut is requested."], ["A broad upload request lacks purpose."]),
      metric("information_gain", "Information gain", "Expected evidence would materially reduce uncertainty.", "Estimate alternative separation produced by each request.", "estimated", ["One measure distinguishes two explanations."], ["Requested evidence confirms all alternatives equally."]),
      metric("redundancy_avoidance", "Redundancy avoidance", "Requests do not duplicate admitted evidence.", "Exact semantic-purpose redundancy check.", "measured", ["Already-known data is not requested again."], ["The same report is requested twice."]),
      metric("question_relevance", "Question relevance", "Every request serves the user's question.", "Trace request to question and uncertainty.", "measured", ["The request resolves a named uncertainty."], ["Interesting but irrelevant evidence is requested."]),
      metric("investigation_sequence", "Investigation sequencing", "Low-cost, high-discrimination evidence comes first.", "Human review of ordering and dependencies.", "human_only", ["Existing operational data precedes a new survey."], ["Expensive collection precedes available evidence."]),
      metric("insufficient_recovery", "Insufficient-evidence recovery", "After abstention, the next step is specific and recoverable.", "Evaluate gap specificity and next-run usefulness.", "measured", ["The exact missing comparison is named."], ["The flow terminates with insufficient data."]),
    ],
  },
  {
    id: "communication_quality",
    label: "Communication Quality",
    role: "supporting_capability",
    definition: "How clearly and efficiently truthful understanding reaches its intended reader.",
    purpose: "Ensure understanding becomes usable without leaking internal architecture.",
    relationshipToUnderstanding:
      "Communication makes existing understanding accessible; it cannot create or substitute for understanding.",
    metrics: [
      metric("clarity", "Clarity", "Claims, support, and uncertainty are readily distinguishable.", "Human comprehension review.", "human_only", ["A reader can identify the main finding and limit."], ["Evidence and inference are blended."]),
      metric("brevity", "Brevity", "The result uses no more language than necessary.", "Measure redundancy plus human concision review.", "estimated", ["The answer is compact without omissions."], ["Repeated caveats obscure the conclusion."]),
      metric("structure", "Structure", "Information hierarchy supports scanning and reasoning.", "Deterministic section-contract check.", "measured", ["Finding, evidence, limits, and next evidence are separable."], ["An undifferentiated paragraph hides the result."]),
      metric("progressive_disclosure", "Progressive disclosure", "Essential understanding precedes detail.", "Human task-completion review.", "human_only", ["The main answer appears before provenance detail."], ["Internal trace dominates the first view."]),
      metric("cognition_leakage", "Internal cognition leakage", "Ordinary communication does not expose internal object vocabulary.", "Forbidden-vocabulary check with reviewed exceptions.", "measured", ["Product language describes understanding."], ["Mechanism IDs appear in the user answer."]),
      metric("decision_readability", "Decision readability", "A decision-maker can locate implications and constraints.", "Human decision-task review.", "human_only", ["Tradeoffs and next evidence are visible."], ["The reader must reconstruct implications."]),
      metric("audience_readability", "Executive and non-expert readability", "Meaning survives across intended reader expertise.", "Dual-audience human review.", "human_only", ["Both readers interpret the claim similarly."], ["Jargon makes the answer inaccessible."]),
    ],
  },
  {
    id: "learning_quality",
    label: "Learning Quality",
    role: "supporting_capability",
    definition: "How correctly understanding changes after additional evidence.",
    purpose: "Reward revision quality rather than static score maximization.",
    relationshipToUnderstanding:
      "Learning supports the evolution of Organizational Understanding after new evidence.",
    metrics: [
      metric("evidence_response", "Response to new evidence", "New evidence changes only affected understanding.", "Compare before/after evaluations.", "measured", ["A contradicted claim weakens while unrelated claims persist."], ["All understanding is regenerated indiscriminately."]),
      metric("confidence_evolution", "Confidence evolution", "Confidence moves in the direction warranted by evidence.", "Score expected direction and magnitude bands.", "measured", ["Independent support raises confidence."], ["Weakening evidence raises confidence."]),
      metric("explanation_improvement", "Explanation improvement", "Explanations become more discriminating and complete.", "Compare expected explanatory coverage over steps.", "estimated", ["A broad hypothesis narrows after new evidence."], ["Added evidence only lengthens the answer."]),
      metric("alternative_narrowing", "Alternative narrowing", "Competing explanations narrow only when discriminating evidence arrives.", "Track alternative retention and removal.", "measured", ["A falsified alternative is removed with lineage."], ["Alternatives disappear without evidence."]),
      metric("model_usefulness", "Model usefulness", "Accumulated understanding becomes more useful to the question.", "Human longitudinal utility review.", "human_only", ["The second answer supports a better decision frame."], ["More artifacts produce no added understanding."]),
    ],
  },
  {
    id: "model_stewardship",
    label: "Model Stewardship",
    role: "hard_constraint",
    definition: "How safely the organizational model preserves scope, identity, history, and authority.",
    purpose: "Keep evaluation gains compatible with governed organizational memory and sustainable operation.",
    relationshipToUnderstanding:
      "Organizational Understanding is invalid if governance, determinism, permissions, identity, history, or system sustainability fail.",
    metrics: [
      metric("organization_isolation", "Organization isolation", "No evidence or evaluation crosses organization boundaries.", "Exact organization-scope validation.", "measured", ["All references share the expected organization ID."], ["Another organization's evidence affects a score."]),
      metric("identity_continuity", "Identity continuity", "Repeated concepts retain identity where warranted.", "Longitudinal identity-contract validation.", "measured", ["An existing issue evolves rather than duplicating."], ["Every run creates a new identity."]),
      metric("authority_preservation", "Authority preservation", "Evaluation never changes cognition or persistence.", "Dependency and mutation audit.", "measured", ["Inputs are read-only evaluation records."], ["A score promotes a cognitive object."]),
      metric("historical_truth", "Historical truth", "Past states remain interpretable after revision.", "Timeline and revision audit.", "measured", ["Prior confidence remains recorded."], ["Current understanding overwrites history."]),
      metric("governance", "Governance", "Evaluation and system behavior preserve permissions, disclosure, and authority boundaries.", "Permission, disclosure, and authority gate results.", "measured", ["Only authorized organization-scoped evidence is evaluated."], ["A user receives understanding beyond their authorized scope."]),
      metric("determinism", "Determinism", "Identical governed inputs produce identical evaluation outputs.", "Repeat-run digest comparison.", "measured", ["Repeated runs produce the same ordered report."], ["Ordering or scores vary without an input change."]),
      metric("system_sustainability", "System sustainability", "Understanding gains do not require unsafe, unbounded, or operationally fragile behavior.", "Architecture, boundedness, cost, and operational review.", "human_only", ["The evaluation can be repeated without unbounded resource growth."], ["A gain depends on an unmaintainable or unsafe process."]),
    ],
  },
  {
    id: "longitudinal_improvement",
    label: "Longitudinal Understanding",
    role: "supporting_capability",
    definition: "How much truthful organizational understanding improves across repeated investigations.",
    purpose: "Diagnose whether current understanding remains representative and improves with evidence.",
    relationshipToUnderstanding:
      "Freshness qualifies the current state; evolution measures justified improvement over repeated investigations.",
    metrics: [
      metric("understanding_freshness", "Understanding freshness", "Whether current understanding is still likely to represent organizational reality given evidence recency, expected volatility, validation cadence, contradictions, and new support.", "Conceptual human review only; no freshness calculation is implemented.", "human_only", ["Recent validation in a volatile area sustains freshness.", "Older evidence remains fresh when the organization is stable and contradictions are absent."], ["Elapsed time alone is treated as staleness.", "Contradictory new evidence is ignored."]),
      metric("repeat_investigation_gain", "Repeat-investigation gain", "A repeated investigation produces a justified improvement.", "Compare normalized dimension deltas.", "measured", ["Understanding rises after discriminating evidence."], ["Scores rise without new information."]),
      metric("knowledge_accumulation", "Knowledge accumulation", "Useful prior understanding remains available.", "Retention and reuse checks.", "measured", ["Previously supported findings remain traceable."], ["Later runs forget relevant evidence."]),
      metric("truth_preservation", "Truth preservation", "Revision preserves still-valid claims and retracts invalid ones.", "Metamorphic longitudinal controls.", "measured", ["Unaffected truth persists."], ["New evidence rewrites unrelated history."]),
      metric("improvement_efficiency", "Improvement efficiency", "Understanding gain is proportionate to evidence and investigation cost.", "Human review of gain per evidence unit.", "human_only", ["One discriminating source resolves a major uncertainty."], ["Large evidence volume yields trivial gain."]),
    ],
  },
];
