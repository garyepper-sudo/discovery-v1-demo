# Organizational Understanding Evaluator 001 — Phase 4 Semantic Adjudication Preregistration

**Status:** Design-only draft for human approval; no study execution authorized
**Version:** `oue-001-phase-4-semantic-preregistration-design/v1`

## 1. Research questions

1. Can qualified independent reviewers reliably map frozen Phase 3 candidate
   pairs to the existing Phase 2 classification vocabulary?
2. Which proposition families, lexical/structural strata, and directional
   relationships produce material disagreement or abstention?
3. Do blinded fixed-version model judgments agree with a qualified human
   reference without common-mode control failures?
4. Does model assistance change human judgments, and in which direction?

Agreement is not correctness. Candidate retrieval is not a semantic label.

## 2. Methods and arms

- Primary confirmatory arm: **H**, two independent qualified humans with an
  independent third reviewer when triggered.
- Exploratory arm **M**: blinded, frozen LLM-only research; separately
  authorized model use required; never initial gold authority.
- Exploratory arm **HM**: human seals an initial response before viewing model
  output; retained/revised response and rationale are separate immutable data.

No model provider or model is selected or authorized by this design.

## 3. Reviewer eligibility and independence

Before packet access, every human reviewer must have:

- appropriate language fluency and organizational-reasoning literacy;
- completed versioned rubric and confidentiality training;
- passed a separate qualification set;
- signed independence and conflict attestations;
- no authorship of the exact reviewed ground-truth case;
- no expected-label, answer-key, retrieval-rank, or other-response access;
- no sole-authority role if they developed candidate generation or scoring.

Proposed qualification gate: ≥ 85% exact classification on unambiguous
controls, 100% authorization/blinding controls, and zero unsafe equivalence of
contradictory controls. Threshold requires approval before responses exist.

## 4. Reviewer count

Two independent qualified reviewers per pair. An independent third reviewer is
required for categorical disagreement, abstention, low self-confidence when
collected, high-risk family disagreement, packet insufficiency, candidate-set
ambiguity, or any disagreement that changes assignment or score eligibility.
No categorical averaging or forced consensus is permitted.

Third review may produce a resolved two-of-three disposition, packet defect,
insufficient context, reviewer conflict, or unresolved result. Two-of-three is
eligible only when all reviewers are qualified and independent, blinding is
intact, no material packet defect exists, the third reviewer did not see prior
judgments, the disposition maps unambiguously to Phase 2, and original
judgments and full provenance remain immutable. Third review never forces
consensus.

## 5. Training and qualification

Training cases include explained examples across all ten families and all
canonical classifications. Qualification cases are unseen and have separate
answers. Neither set contributes confirmatory reliability or gold admission.
Reviewer training and qualification versions are frozen before confirmatory
packet access.

## 6. Packet schema and blinding

The frozen packet includes only packet/revision/protocol/rubric identities;
anonymized Side A/B text; family; minimum permitted polarity, modality,
temporality, definitions, and family context; withholding markers; rubric
questions; dispositions; and rationale fields. Protected metadata binds exact
organization, case, candidate edge, source revisions, scopes, structural
receipt, candidate generator/configuration, disclosure receipt, and hashes.

The packet excludes retrieval score/tier/rank/reasons, expected labels,
candidate-recall labels, Phase 2/composite consequences, benchmark outcome,
study partition where practical, and every other response.

Left/right assignment is deterministically derived from a frozen study seed,
packet identity, and revision without labels. Packet bytes and hashes freeze
before review.

## 7. Two-stage response and vocabulary

Stage 1 seals a source-blind semantic-relationship judgment. Stage 2 reveals
only the recovered/ground-truth direction necessary for Phase 2 coverage,
subsumption, omission, overstatement, and family fields.

Canonical import labels are exactly:

`exact`, `equivalent`, `partial`, `overgeneralized`, `undergeneralized`,
`contradictory`, `unsupported`, `irrelevant`, `ambiguous`, `missing`.

`missing` is a completed-set state, not a selected candidate-pair label.
Because pairwise review compares two propositions that both exist, reviewers
do not normally use `missing`; it is reserved for downstream Phase 2 coverage
or assignment when a required proposition has no eligible recovered match,
unless the frozen Phase 2 contract documents a pairwise use.

Abstention, insufficient context, and unresolved after escalation are
import-ineligible protocol states. They never receive semantic credit.

## 8. Family-specific rubric freeze

Each packet selects only its family rubric:

- finding: factual meaning, scope, polarity, time;
- condition: organizational state, scope, polarity, time;
- constraint: limiting factor, primacy, scope, time;
- conclusion: synthesis, qualifiers, scope;
- prediction: future outcome, direction, horizon, uncertainty;
- contradiction: both endpoints, conflict, Evidence orientation, unresolved state;
- mechanism: explanandum, causal pathway, competitors, modality, support;
- uncertainty: unknown content, reason, abstention scope;
- evidence gap: missing information, affected understanding, priority, utility,
  feasibility;
- implication: decision relevance and non-generic action boundary.

Cross-family metadata is prohibited.

## 9. Immutable response and disagreement records

Responses preserve packet/reviewer/method/version identities, sealed Stage 1,
Stage 2, classification, family fields, cited packet fields, rationale,
abstention/uncertainty, optional reviewer self-confidence, timestamps,
authorization, supersession ancestry, and hash.

Disagreement records preserve every original hash, disagreement and trigger,
third reviewer, added context, final or unresolved state, rationale, packet
revision effect, import eligibility, and ancestry. Originals are never
overwritten.

Reviewer confidence is a self-report used only for escalation. It is not
Discovery confidence, proposition confidence, semantic correctness,
confidence calibration, or credit.

## 10. Corpus design and split

Phase 4 uses a new corpus. Phase 3’s protected synthetic holdout is developer
exposed and is not an untouched Phase 4 confirmatory set.

Future partitions:

- training;
- qualification;
- protocol development;
- confirmatory holdout.

The corpus must contain negative near-matches, ambiguity, partial coverage,
paraphrases, lexically similar non-equivalents, lexically distant equivalents,
family edge cases, and insufficient-context cases. Stratify by family, lexical
overlap, structural similarity, directionality, ambiguity, confidence
representation, time, modality, polarity, and organization terminology.

No cases or answers are created or inspected in this design task. Before
future execution, freeze case IDs, split, packet hashes, answer-key custody,
developer-exposure records, and study seed. Development cases can never move
to confirmatory.

## 11. Minimum sample and stopping rules

Proposed minimum: 300 confirmatory candidate pairs total and at least 30 per
primary reported family. These are planning floors, not proof of adequate
power. Final confirmatory sample-size approval requires a completed,
preregistered power analysis before packet review. Stop and invalidate
affected strata for any label leakage,
cross-organization disclosure, answer-key exposure, material packet/rubric
version drift, unauthorized model use, or source-revision mismatch.

Do not stop early for favorable agreement. Stop for safety, confidentiality,
futility defined before execution, or insufficient eligible reviewers. Missing
responses are not imputed. Abstentions and unresolved cases remain reported in
their denominators and receive no import.

## 12. Reliability metrics

Report without a universal aggregate:

- raw exact agreement overall and by family/disposition/difficulty;
- pairwise confusion matrix;
- Cohen’s kappa for two-reviewer categorical agreement;
- Gwet’s AC1 as the proposed prevalence-robust coefficient;
- weighted agreement only for genuinely ordered directional categories;
- abstention, unresolved, escalation, packet-defect, and qualification rates;
- agreement by lexical, structural, temporal, modality, polarity, and context strata;
- M-versus-H agreement and control-case error;
- HM revision rate, direction, and model-induced common-mode error.

Report confidence intervals for all primary agreement measures. Cohen’s kappa
and Gwet’s AC1 are always reported together under a preregistered treatment
for sparse and prevalence-skewed labels; the more favorable coefficient cannot
be selected after results. Family-level claims require the family to reach its
frozen sample floor.

## 13. Proposed promotion thresholds

Freeze before confirmatory execution:

- raw exact agreement ≥ 0.85 overall;
- raw exact agreement ≥ 0.75 for each adequately sampled primary family;
- Cohen’s kappa ≥ 0.70 overall;
- Gwet’s AC1 ≥ 0.70 overall;
- authorization, cross-organization, and label-leakage defects = 0;
- unsafe equivalence on independently verified negative controls = 0;
- unresolved rate ≤ 0.10;
- packet-defect rate ≤ 0.02;
- complete provenance and reproducibility = 1.00.

These are bounded proposals for approval, not data-derived thresholds.
Agreement does not prove correctness. Failure cannot be repaired by lowering a
threshold after results.

## 14. Missing data, abstention, and unresolved cases

- Missing reviewer response: retain missingness; replace reviewer only under a
  frozen rule; do not impute.
- Abstention: preserve reason, trigger third review, no credit while unresolved.
- Insufficient context: packet-defect review; new revision and re-review if
  corrected.
- Unresolved after escalation: import-ineligible, no semantic credit, reported.
- Conflicting categorical labels: never average.

## 15. Gold-reference admission

Admission requires authorized source data; frozen packet/rubric/protocol;
eligible independent reviewers; completed disagreement handling; reliability
gate; no material defect, leakage, conflict, or unresolved state; exact hashes;
reproducibility; immutable ancestry; and explicit independent admission.
Only Arm H is initially eligible for confirmatory gold-set admission. Arm M
and Arm HM are exploratory and initially gold-ineligible. The sealed
pre-assistance human judgment, model output, and post-assistance human judgment
in Arm HM remain separate immutable records. LLM-only judgments cannot enter
the initial reference set, and repeated agreement within one model family does
not establish an independent gold label.

## 16. Phase 2 mapping gate

The future mapper may emit an existing Phase 2 `SemanticAdjudication` only from
an admitted record with exact candidate edge, organization, case, packet,
source, protocol, reviewer, and disposition provenance. It rejects duplicates,
incomplete records, abstention, ambiguity, unresolved escalation, unauthorized
context, and version/hash mismatch. Phase 2 scoring remains unchanged and
inactive until every existing completeness and eligibility gate passes.

## 17. Confidentiality, authorization, retention, and revocation

Authorize exact organization/case before packet construction; disclose least
necessary context; pseudonymize where possible; mark withholding; prohibit
portable raw customer data, credentials, tokens, personal contacts, and private
source bodies; scope reviewer access; log access; forbid cross-organization
packets; freeze retention/deletion policy; preserve correction and revocation
lineage; and remove future access when authority is revoked.

No external model receives customer material without separate provider,
customer, geography, retention, security, and disclosure authorization.

An independent custodian boundary separates candidate-generator developers,
confirmatory answer-key custody, reviewers, and Phase 2 scoring operators. The
custodian controls the confirmatory partition, study seed, packet release,
reviewer assignment, answer key, exposure records, invalidation records, and
post-study unblinding. Unauthorized confirmatory exposure invalidates the
affected case or study partition.

## 18. Future model-arm freeze

Before any separately authorized model execution, freeze exact provider, model
ID and dated version, prompt/system versions and hashes, packet serialization,
sampling parameters, deterministic mode, schema, retries, invalid/refusal
handling, truncation, retention, geography, confidentiality, and tool/web
prohibition. Model-version drift creates a new arm and requires revalidation.
Model confidence and rationale are never semantic truth.

## 19. Allowed corrections and invalidation

Before confirmatory review, typo-only clarifications may create a new
preregistration version with a complete diff and no case-label exposure. After
review begins, no threshold, rubric, split, packet, method, or analysis change
is allowed within the same confirmatory study. Material changes require a new
version and new untouched holdout.

Invalidate the affected packet, arm, stratum, or study for label/rank/score
leakage; unauthorized disclosure; reviewer conflict; packet/source mismatch;
rubric, model, prompt, or protocol drift; answer-key exposure; fabricated
identity; overwritten response; or non-reproducible hashes.

## 20. Canonical hashing

Canonical hashes bind preregistration, corpus split, study seed commitment,
packet schema and bytes, source revisions, authorization/disclosure receipt,
reviewer eligibility version, response, correction/supersession, disagreement,
admission decision, and any Phase 2 import. Semantically irrelevant ordering is
canonicalized; unsupported values fail closed under the frozen Phase 2
serialization contract.

## 21. Authorization boundary

Approval of this document authorizes protocol review only. It does not
authorize packet construction, case creation, adjudication, human recruitment,
model selection or calls, gold labels, executable Phase 4/5 work, External
Comparative Validation 002, Phase 2 score activation, Runtime, Product,
Scorecard, frontend, cognition, or Production integration.
