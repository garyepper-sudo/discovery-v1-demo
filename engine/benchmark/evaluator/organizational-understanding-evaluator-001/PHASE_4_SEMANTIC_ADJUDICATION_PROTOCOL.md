# Organizational Understanding Evaluator 001 — Phase 4 Semantic Adjudication Protocol

**Status:** Design ready for review; no implementation or execution authorized
**Protocol version:** `oue-001-phase-4-semantic-protocol-design/v1`

## 1. Purpose and non-purpose

The future Phase 4 boundary determines the semantic relationship between one
recovered proposition and one frozen Phase 3 candidate ground-truth
proposition. Its output remains an independently produced, auditable input to
the existing Phase 2 imported-adjudication boundary.

Phase 4 does not generate or rerank candidates, perform one-to-one assignment,
calculate dimension or composite scores, admit benchmark credit by itself,
create organizational truth, or modify Discovery cognition, Runtime, Product
state, Scorecard, frontend, routes, or Production.

The only intended flow is:

```text
frozen Phase 3 candidate edge
→ blinded independent review
→ immutable judgments
→ disagreement/escalation
→ reliability and admission gates
→ eligible imported Phase 2 adjudication
→ unchanged Phase 2 assignment and scoring
```

Material Information Acquisition Independent Live Outcome Calibration 002
remains the primary Product evidence gate. This is parallel benchmark research.

## 2. Immutable adjudication unit

One unit is exactly one frozen Phase 3 candidate edge. Before packet creation,
authorization must bind and hash:

- evaluator, organization, case, and candidate-edge identities;
- candidate edge and candidate packet hashes;
- recovered and ground-truth proposition identities and source revisions;
- proposition family and both exact authorization scopes;
- Phase 3 generator, configuration, graph, and structural-receipt identities;
- protocol, rubric, reviewer-packet, disclosure-policy, and corpus versions.

Packet construction fails closed for identity, hash, organization, case,
authorization, source-revision, withholding, or version mismatch. A packet
change creates a new packet revision; it never mutates a reviewed unit.

The reviewer must not see retrieval feature score, tier, rank, candidate recall
labels, inclusion rationale, expected label or match identity, Phase 2 or
composite consequences, another judgment, or benchmark classification.

## 3. Two-stage review

### Stage 1 — source-blind semantic relationship

Sides A and B are deterministically swapped from a frozen study seed and packet
hash. Where meaning remains judgeable, neither side is labeled recovered or
ground truth. The reviewer records semantic sameness, material difference,
incompatibility, ambiguity, insufficient context, or abstention with cited
packet fields. Stage 1 is sealed before Stage 2 is revealed.

### Stage 2 — minimum direction-sensitive rubric

Only the role information required by frozen Phase 2 is revealed. Reviewers
then assess omission, overstatement, underspecification, subsumption,
directional coverage, decision relevance, and applicable family fields.
Stage 1 cannot be revised silently. Any Stage 2-induced correction creates a
superseding record with rationale and both versions retained.

This maps cleanly to Phase 2: Stage 1 informs meaning agreement and categorical
relationship; Stage 2 selects the existing directional classification and
field-level agreements. It does not alter Phase 2.

## 4. Closed disposition vocabulary and Phase 2 mapping

The canonical Phase 2 target vocabulary remains:

`exact`, `equivalent`, `partial`, `overgeneralized`, `undergeneralized`,
`contradictory`, `unsupported`, `irrelevant`, `ambiguous`, `missing`.

| Protocol finding | Phase 2 mapping | Import eligibility |
|---|---|---|
| Same proposition and representation | `exact` | Eligible after all gates. |
| Same material meaning, representation differs | `equivalent` | Eligible after structural agreements. |
| Material overlap without full directional coverage | `partial` | Eligible with explicit omissions. |
| Recovered proposition is materially broader | `overgeneralized` | Eligible with direction and conflict fields. |
| Recovered proposition is materially narrower | `undergeneralized` | Eligible with direction and omissions. |
| Recovered proposition materially opposes the candidate | `contradictory` | Eligible only with explicit material conflict; never equivalent credit. |
| Claim is not supported by authorized packet context | `unsupported` | Eligible as a non-credit judgment. |
| Semantically unrelated | `irrelevant` | Eligible as a non-credit judgment. |
| Relationship cannot be resolved between allowed labels | `ambiguous` | Import-ineligible until resolved. |
| Required ground-truth proposition has no recovered counterpart | `missing` | Created only by completed-set processing, not by selecting a candidate pair. |

Because pairwise review compares two propositions that both exist, a reviewer
does not normally select `missing`. It remains reserved for the downstream
Phase 2 coverage or assignment condition in which a required proposition has
no eligible recovered match, unless the frozen Phase 2 contract explicitly
documents a pairwise use.

“Related but non-equivalent” is provenance that must resolve to `partial`,
`overgeneralized`, `undergeneralized`, `unsupported`, or `irrelevant` before
import. “Incompatible” resolves to `contradictory`, `unsupported`, or
`irrelevant`. “Insufficient context,” reviewer abstention, and “unresolved after
escalation” are protocol states, not replacement Phase 2 labels; they remain
import-ineligible and preserve the attempted labels and rationale.

Potential gap: Phase 2 has no explicit abstention or insufficient-context
classification. No scoring change is required because Phase 4 can retain both
as import-ineligible provenance. If later requirements demand scored
abstention, that would require separate contract review.

## 5. Family-specific rubric design

Shared review asks whether material meaning, scope, polarity, modality, time,
and authorized lineage are preserved. Family questions remain isolated:

| Family | Semantic question and minimum context | Prohibited inference; partial/directional concern | Ambiguity, abstention, escalation |
|---|---|---|---|
| Finding | Same factual meaning, scope, polarity, and time? Show bounded entities and temporal context. | Do not infer cause or generality; narrower/broader scope is directional. | Abstain if entity/time definitions are withheld; escalate material factual conflict. |
| Condition | Same organizational state and scope? Show state definition and time. | Do not turn state into cause, constraint, or forecast. | Escalate state-versus-event ambiguity. |
| Constraint | Same limiting factor, primacy, scope, and time? Show compared limiting factors where authorized. | Do not infer primacy from salience; omission of “primary” is material. | Escalate when ranking context is missing. |
| Conclusion | Same synthesized interpretation and qualifiers? Show only authorized supporting context. | Do not add certainty or causal meaning; missing qualifier may be partial. | Abstain when synthesis boundaries are withheld. |
| Prediction | Same future outcome, direction, horizon, and uncertainty? | Do not treat current observation as prediction or omit horizon. | Escalate horizon/direction conflict or unavailable evaluation scope. |
| Contradiction | Same two endpoints, conflict relation, Evidence orientation, and unresolved state? | Never reduce to one endpoint; do not infer resolution. | Escalate missing endpoint, switched support/opposition, or false resolution. |
| Mechanism | Same explanandum, causal pathway, competitors, causal modality, and support? | Correlation cannot become cause; omitted competing mechanism is material. | Escalate causal-direction conflict or missing explanandum. |
| Uncertainty | Same unknown, reason unknown, and abstention boundary? | Do not convert uncertainty to claim or confidence. | Abstain if the object of uncertainty is withheld. |
| Evidence gap | Same missing information, affected understanding, priority, utility, and feasibility? | Do not import another family’s recommendation meaning; priority is directional. | Escalate if affected understanding or feasibility context is absent. |
| Implication | Same downstream decision relevance and bounded action consequence? | Do not fabricate Recommendation, Decision, or Outcome. | Escalate generic-action language or missing decision context. |

## 6. Deterministic reviewer packet

Versioned packet fields:

- packet ID, revision, hash, protocol/rubric/corpus versions;
- pseudonymous organization and case bindings retained in protected metadata;
- candidate-edge and structural-receipt hashes retained but hidden from display;
- anonymized Side A/B text and proposition family;
- only necessary polarity, modality, temporal, entity-definition, and
  family-specific graph context;
- explicit unavailable/withheld markers;
- Stage 1 and Stage 2 questions, closed dispositions, and rationale fields;
- authorization/disclosure receipt and source-revision hashes.

Left/right assignment is `hash(studySeed, packetIdentity, packetRevision)` and
is frozen before review. It never uses labels, tier, score, rank, or expected
identity. Re-running packet construction produces byte-identical serialization.

No packet contains raw customer data in portable artifacts, credentials,
tokens, personal contacts, private source bodies, unauthorized Evidence,
cross-organization context, model output, or another reviewer’s record.

## 7. Immutable adjudication record

Required fields:

- record, packet, packet-revision, protocol, rubric, and study-arm identities;
- reviewer pseudonym, eligibility/qualification versions, independence and
  conflict attestations;
- method, frozen Side A/B mapping, Stage 1 sealed judgment, Stage 2 judgment;
- canonical semantic disposition and family-specific field judgments;
- bounded rationale, cited packet-field IDs, uncertainty/abstention reason;
- optional reviewer self-confidence, clearly typed as reviewer self-report;
- started/completed timestamps, authorization/disclosure context;
- correction/supersession ancestry and canonical record hash.

Reviewer confidence is separate from Discovery confidence, proposition
confidence, retrieval score, semantic correctness, and Phase 2 confidence
calibration. It can trigger review escalation but can never create or increase
score credit.

## 8. Reviewer eligibility, training, and qualification

Eligibility precedes packet access. A reviewer must demonstrate rubric and
organizational-reasoning literacy, appropriate language fluency, confidentiality
acceptance, completed training, qualification on a separate set, no unresolved
conflict, no authorship of the exact case, no answer-key access, and independence
from other reviewers. Candidate-generator developers cannot be sole semantic
authority and must recuse from confirmatory cases they shaped.

Separate sets are required:

- training: explained examples, never evidence;
- qualification: unseen controls, used only for eligibility;
- protocol development: exposed cases for process refinement;
- confirmatory holdout: untouched after freeze.

Proposed qualification threshold: at least 85% exact classification on
unambiguous controls, 100% on authorization/blinding controls, and no unsafe
equivalence of a contradictory pair. This is proposed for human approval, not
selected from observed data.

## 9. Independence, reviewer count, and escalation

Every candidate pair receives two independent qualified reviewers. A third
independent reviewer is required for categorical disagreement, abstention,
packet insufficiency, low self-confidence when collected, high-risk family
disagreement, candidate ambiguity, or any disagreement that changes assignment
or score eligibility. Incompatible labels are never averaged and consensus is
never forced.

An unresolved pair remains `unresolved`, is import-ineligible, and receives no
semantic credit. Multiple recovered propositions competing for one truth, or
multiple plausible truths for one recovered proposition, are reviewed as
separate edges; Phase 2 alone performs one-to-one assignment after complete
adjudication.

Third review may produce a resolved two-of-three disposition, packet defect,
insufficient context, reviewer conflict, or unresolved result. A two-of-three
disposition is eligible only when all three reviewers are qualified and
independent, blinding remains intact, no material packet defect exists, the
third reviewer did not see earlier judgments, the disposition maps
unambiguously to Phase 2, and every original judgment and provenance record
remains immutable. Third review never forces consensus.

## 10. Disagreement and escalation record

A separate immutable record retains all original response hashes, disagreement
type, trigger, escalation reviewer and eligibility, newly disclosed context,
final disposition or unresolved state, rationale, packet-change status, import
eligibility, ancestry, and hashes. Original judgments are never overwritten.
Any additional context creates a new packet revision and invalidates prior
confirmatory comparability unless the preregistered correction rule applies.

## 11. Gold-reference admission

Records are not “gold” merely because they exist or reviewers agree. Admission
requires authorized sources; packet and source integrity; eligible independent
reviewers; complete provenance; resolved disagreement; reliability gate;
zero material packet, leakage, or conflict defect; exact hashes; reproducibility;
and an explicit admission decision by an authority independent of candidate
generation and scoring. Only Arm H is initially eligible for confirmatory
gold-set admission. Arm M and Arm HM are exploratory and initially
gold-ineligible. In Arm HM, the sealed pre-assistance human judgment, model
output, and post-assistance human judgment remain separate immutable records.
LLM-only judgments are ineligible for the initial reference set, and agreement
among multiple calls to one model family does not establish an independent
gold label.

## 12. Deterministic mapping to Phase 2

Only admitted records map to the existing `SemanticAdjudication` fields:

- exact candidate IDs → ground-truth and recovered IDs;
- final canonical disposition → `classification`;
- Stage 1/2 rubric fields → meaning, polarity, modality, temporal, causal,
  confidence-agreement, and lineage-agreement fields where applicable;
- bounded rationale → `justification`;
- reviewer self-confidence may be retained as provenance but cannot establish
  `meaningAgreement` or credit;
- Phase 4 record hash → `adjudicatorRecordRef`;
- unresolved or abstained records → no Phase 2 import.

The mapper rejects incomplete records, duplicate pair imports, version/hash
mismatch, cross-case/organization records, unauthorized revisions, and
unresolved dispositions. No Phase 2 score activates until its unchanged
completeness, structural, assignment, and eligibility gates pass.

## 13. Method-comparison study

| Dimension | Qualified human-only (H) | Blinded LLM-only research (M) | Human–LLM assistance (HM) |
|---|---|---|---|
| Independence/authority | Strongest initial authority with conflict controls; human variability remains. | Reproducible only with frozen provider/model; no initial gold authority. | Human authority risks automation anchoring; initial human record must remain. |
| Semantic/context capability | Can interpret authorized organizational definitions; limited by expertise and fatigue. | Scalable and consistent in format; may share systematic/model-training biases. | May improve recall but creates common-mode and anchoring risks. |
| Explainability/correction | Rationale, appeal, and recusal are direct. | Rationale is not proof; appeal requires independent review. | Revision trail can expose model influence if immutable. |
| Scale/cost/latency | Highest cost and latency. | Lowest marginal cost and latency. | Intermediate with added workflow burden. |
| Confidentiality | Controlled reviewer access and agreements. | Provider retention, geography, and customer authorization are unresolved gates. | Inherits both human and provider risks. |
| Drift/reproducibility | Training drift controlled through versions and requalification. | Model and provider drift require revalidation. | Both reviewer and model drift apply. |
| Gold suitability | Primary initial confirmatory reference candidate. | Ineligible initially. | Exploratory; cannot replace original H judgment. |

No method is selected by speed or cost. Future comparison uses the same frozen
packet corpus and separate arms:

- **Arm H:** two independent humans plus third-review escalation; primary.
- **Arm M:** frozen model/prompt/parameters; blinded, no tools; exploratory only.
- **Arm HM:** human seals an initial judgment before model output, then may
  retain or supersede it with rationale; both records remain; exploratory only.

## 14. Reliability reporting and proposed gates

Report separately: raw agreement; agreement by family, disposition, and
difficulty; confusion matrix; Cohen’s kappa for two categorical reviewers;
Gwet’s AC1 as the proposed prevalence-robust complement; weighted agreement
only for genuinely ordered directional categories; abstention, unresolved,
escalation, packet-defect, and qualification rates; model–human agreement;
HM revision rate/direction; measurable common-mode control errors; and
confidence intervals for all primary agreement measures. Cohen’s kappa and
Gwet’s AC1 are reported together under a preregistered treatment for sparse
and prevalence-skewed labels; the more favorable coefficient may not be
selected after results. Family-level claims require the family to reach its
frozen sample floor. Final confirmatory sample-size approval requires a
completed power analysis.

Proposed confirmatory thresholds for later approval:

- raw exact agreement ≥ 0.85 overall and ≥ 0.75 per adequately sampled family;
- Cohen’s kappa and Gwet’s AC1 ≥ 0.70 overall;
- authorization or label-leakage defects = 0;
- control-case unsafe equivalence = 0;
- unresolved rate ≤ 0.10; packet-defect rate ≤ 0.02;
- at least 30 independently reviewed pairs per primary reported family and
  300 total confirmatory pairs, subject to preregistered power analysis.

Agreement is not correctness; thresholds cannot change after confirmatory data.

## 15. Confidentiality and authorization

Authorize before source or packet retrieval; enforce organization/case
isolation, least context, pseudonymization, explicit withholding, scoped packet
access, access logs, disclosure policy, retention/deletion, correction,
revocation, and lineage-preserving withdrawal. Portable artifacts contain no
raw customer source text or personal/credential material. Customer material
cannot be sent to an external model without separate customer, provider,
geographic, retention, and security authorization.

An independent custodian boundary separates candidate-generator developers,
confirmatory answer-key custody, reviewers, and Phase 2 scoring operators. The
custodian controls the confirmatory partition, study seed, packet release,
reviewer assignment, answer key, exposure records, invalidation records, and
post-study unblinding. Unauthorized confirmatory exposure invalidates the
affected case or study partition.

## 16. Future LLM controls

Any separately authorized model arm freezes provider, model ID and dated
snapshot, prompt/system versions and hashes, packet bytes, sampling settings,
schema, retry/refusal/invalid-output rules, truncation, retention, geography,
tool/web prohibition, and drift-revalidation policy. It sees no rank, score,
label, answer key, or other reviewer output. Model rationale and confidence are
never semantic truth or calibrated correctness.

## 17. Required design scenarios A–Z

| Scenario | Disposition/escalation | Import and confirmatory treatment |
|---|---|---|
| A Exact equivalent | `exact` or `equivalent`; no escalation absent conflict. | Eligible after dual review and gates; remains confirmatory. |
| B Lexically distant paraphrase | `equivalent` if meaning and structure agree. | Eligible; lexical distance recorded, not penalized. |
| C Lexically similar, different | `unsupported`, `irrelevant`, or `contradictory`. | Eligible non-credit judgment; control failure if called equivalent. |
| D One narrower | Direction reveal; `undergeneralized` or `overgeneralized` according to recovered side. | Eligible with direction rationale. |
| E One broader | Same directional rule as D. | Eligible with direction rationale. |
| F Partial with omitted claim | `partial` plus material omission. | Eligible if omission is explicit. |
| G Related, non-equivalent | Resolve to directional partial, unsupported, or irrelevant. | Eligible only after canonical label selected. |
| H Ambiguous | `ambiguous`; third review. | Ineligible until resolved; unresolved remains no credit. |
| I Insufficient context | Protocol state `insufficient-context`; packet-defect review. | Ineligible; confirmatory only after preregistered packet correction and restart. |
| J Reviewer abstains | Abstention reason; third review. | Abstaining record retained; pair ineligible until resolved. |
| K Reviewer disagreement | Separate disagreement record; third review. | Never average; unresolved is ineligible. |
| L Agreement for incompatible reasons | Escalate rationale inconsistency. | Ineligible until material reasoning conflict resolved. |
| M Ground-truth author reviewer | Mandatory recusal. | Response invalid; replacement reviewer; case may remain confirmatory if unseen replacement. |
| N Candidate-generator developer | Cannot be sole authority; confirmatory recusal when case shaped. | Development-only unless independent replacement. |
| O Rank accidentally visible | Blinding breach. | Packet and affected responses invalid; confirmatory case removed/replaced under frozen rule. |
| P Model sees expected label | Label leakage. | Arm/study segment invalid; no import or gold admission. |
| Q Cross-organization packet | Hard authorization failure and security record. | No packet, review, or import; investigate breach. |
| R Withheld source context | Explicit withheld marker; abstain if material. | Eligible only if judgment remains supported by permitted context. |
| S Packet changes after review | New revision; preserve prior response. | Prior response cannot bind new packet; re-review required; confirmatory comparability assessed. |
| T Rubric changes mid-study | New study/rubric version. | No mixed-version confirmatory aggregation; prior records retained. |
| U Model changes mid-study | New arm/version. | No pooled confirmatory result; revalidation required. |
| V Third reviewer unresolved | `unresolved`. | No Phase 2 import or semantic credit. |
| W Changes Phase 2 eligibility | Mandatory third review and audit. | Import only after complete resolution; Phase 2 gates remain authoritative. |
| X Many recovered compete for one truth | Review each edge independently. | No local winner; Phase 2 assignment resolves completed records. |
| Y One recovered, many plausible truths | Preserve all edge judgments and ambiguity. | No rank-based choice; unresolved edges receive no credit. |
| Z Human/model agree but fail control | Common-mode failure investigation. | Affected method/arm fails promotion; no gold admission. |

## 18. Design conclusion

The frozen Phase 1–3 contracts can represent the necessary boundary without
modification. Abstention, insufficient context, and unresolved escalation stay
as Phase 4 import-ineligible provenance. The next evidence gate is human review
of this protocol and preregistration—not adjudication execution.
