# Material Information Acquisition Calibration Canon

**Classification:** B — Selector promising but live shadow calibration required
**Status:** Benchmark and shadow-calibration research; no production selector
**Governing contract:** [MATERIAL_INFORMATION_ACQUISITION_CONTRACT.md](../Product/MATERIAL_INFORMATION_ACQUISITION_CONTRACT.md)

## 1. Purpose and boundary

This experiment is the final synthetic calibration gate for Material Information Acquisition. It tests whether a deterministic, read-only Product Workflow selector can choose or stop without inventing a universal utility score. All outcomes are fixtures. The experiment imports no Runtime, connector, frontend, persistence, or production selector.

## 2. Existing-state calibration audit

| Attribute | Canonical source | Deterministic fixtures | Live evidence | Outcome calibrated | Current judgment |
| --- | --- | --- | --- | --- | --- |
| Information contribution | Investigation opportunity and Question-scoped Unknown effects, when present | Yes | Partial: existing-evidence inspection and Drive search | No generalized action outcomes | Predictable only as a qualified ordinal |
| Discrimination gain | Canonical competing alternatives/opportunity, when present | Yes | Partial | No | Predictable only when alternatives are explicit |
| Unknown reduction | Product Unknown lifecycle | Yes | Question retrieval acceptance | Partial lifecycle evidence, no counterfactual action set | Measurable after action; estimated before action |
| Answer impact | Product Answer eligibility/version/confidence contracts | Yes | Live Question acceptance | Partial | Measurable downstream; never selector-owned |
| Objective discovery | Objective/Optimization research and authority contracts | Yes | No generalized live acceptance | No | Requires confirmed authority/context |
| Recommendation impact | Product Recommendation purpose and eligibility | Yes | Phase 2C acceptance | No action-level counterfactual calibration | Measurable downstream |
| Organizational relevance | Exact Question; confirmed Objective/Decision when applicable | Yes | Question-relative only | No | Synthetic outside confirmed governed context |
| Reliability | Evidence/source owner and later evaluation | Yes | Drive source behavior | No across action kinds | Owner-provided until outcomes exist |
| Burden | Action owner and consent | Yes | No comparable cross-action corpus | No | Synthetic/owner-provided |
| Cost | Action owner/budget policy | Yes | Connector operational facts only | No | Optional when none; otherwise owner-provided |
| Delay | Action or Outcome owner | Yes | Partial timestamps | No causal delay calibration | Owner-provided |
| Reversibility | Action/Decision owner | Yes | Partial | No | Governed eligibility/ordering input |
| Evidence quality | Canonical Evidence/Understanding projection | Yes | Drive corpus acceptance | Partial | Available for evidence actions |
| Stopping | Understanding sufficiency plus material effect, reliability, and burden | Yes | No selector shadow | No | Scenario-specific, never universal |

Existing Outcome, Review, Learning, Product Answer, Unknown, Recommendation, and action-specific receipts can support future observation. They do not currently provide randomized or counterfactual ground truth for organizational value. Current Phase 2C ranking is therefore the production baseline, not a calibrated generalized selector.

Information contribution and discrimination are correlated; organizational relevance correlates with downstream eligibility; burden, cost, and delay may describe the same friction; reliability overlaps Evidence quality. The calibrated contract prevents double counting by treating information/discrimination as one epistemic-benefit comparison and uses remaining dimensions lexicographically rather than additively.

## 3. Experimental design

The corpus contains 68 deterministic scenarios: 32 calibration, 8 validation, 24 untouched holdout, and 4 negative controls. Four wording perturbations and reversed input-order evaluation test stability. Domains cover sales, onboarding, inventory, product launch, cost reduction, safety, compliance, retention, hiring, and coordination. Candidate actions cover evidence inspection/comparison, authorized search, human questions, document requests, surveys, measurements, experiments, monitoring, Outcome waiting, stop, abstention, material ties, and incomparability.

Ten independent four-round sequences test inspection, focused question, authorized search, then stop. Every round has a new Understanding revision and independent selection; no preplanned chain exists.

## 4. Baseline comparison

| Strategy | All-scenario correct selection | Holdout correct selection | Holdout top-two | Holdout selection regret |
| --- | ---: | ---: | ---: | ---: |
| A — current Phase 2C | 0.897 | 0.708 | 0.875 | 0.292 |
| B — fixed priority | 0.500 | 0.583 | 0.833 | 0.667 |
| C — information only | 0.265 | 0.583 | 0.875 | 0.417 |
| D — organizational value only | 0.735 | 0.250 | 0.958 | 1.208 |
| E — lowest burden | 0.162 | 0.292 | 1.000 | 1.167 |
| F — human heuristic | 0.485 | 0.542 | 0.875 | 0.667 |
| G — contract ordering | 0.985 | 0.958 | 0.958 | 0.042 |
| H — contract plus governed stopping | 1.000 | 1.000 | 1.000 | 0.000 |

All strategies had zero governance and authorization violations because hard eligibility was evaluated separately from value.

## 5. Holdout performance

Treatment H produced: correct selection 1.000; top-two inclusion 1.000; Unknown-resolution precision/recall 1.000/1.000; material-information precision 1.000; stopping precision/recall 1.000/1.000; false-stop and false-continuation rates 0; repeated-action rate 0; user-question burden 0.125; total burden 1.125 ordinal units; delay regret 0; selection regret 0; tie precision 1.000; incomparability accuracy 1.000; wording, input-order, organization-isolation, and deterministic-replay checks 1.000.

These are deliberately discriminating synthetic fixtures, not estimates of production accuracy.

## 6. Attribute ablation

| Removed attribute | Holdout accuracy | Delta | Classification |
| --- | ---: | ---: | --- |
| Information contribution | 0.583 | 0.417 | Essential |
| Discrimination | 0.958 | 0.042 | Conditionally essential |
| Organizational relevance | 0.917 | 0.083 | Conditionally essential |
| Reliability | 0.958 | 0.042 | Conditionally essential |
| Burden | 0.917 | 0.083 | Conditionally essential |
| Cost | 0.958 | 0.042 | Conditionally essential |
| Delay | 0.958 | 0.042 | Conditionally essential |
| Reversibility | 0.958 | 0.042 | Conditionally essential |
| Evidence quality | 0.958 | 0.042 | Conditionally essential |
| Stopping rule | — | — | Essential |

No field is retained by theory alone: each changes at least one held-out selection. Cost may be not-applicable, but cannot be removed when material. None is promoted to a scalar.

## 7. Ordering result

Contract and information-first orders both scored 1.000 on holdout; burden-first and relevance-first scored 0.875, reliability-first 0.750. Retain the contract order: eligibility → material effect/dominance → epistemic contribution → relevance → reliability/Evidence quality → burden/cost/delay/reversibility. The tie does not prove universal superiority; relevance and reliability remain conditional tie-breakers required by their ablations.

## 8. Stopping calibration

The governed combination of material effect, contribution over burden, scenario sufficiency, and hard governance achieved precision 1.000 and recall 1.000. Material-effect and contribution-over-burden alone each scored 0.667/0.667; sufficiency alone 1.000/0.333; high-information alone 0.167/0.667. Thresholds must vary with Question/stakes, exact effect target, action owner, budget, and volatility. No universal number is justified.

## 9. Sequential behavior

All 10 sequences (40 rounds) matched the expected action order. Candidate projections were revision-specific, stale actions were not reused, repeated-action rate was 0, and all sequences stopped on the fourth round. The runner selects once per observed revision and cannot emit an autonomous chain.

## 10. Downstream impact

On holdout, treatment H produced proxy rates of 0.958 for Answer-eligibility improvement, 0.125 for Objective-discovery improvement, 0.958 for Recommendation-eligibility improvement, and 0.708 normalized Decision-quality improvement. Unknown resolution precision/recall were 1.000/1.000. These values describe fixture counterfactuals and create no new Scorecard metric.

## 11. Contract corrections

Design candidate 2 adds estimate maturity (`synthetic`, `fixture-backed`, `owner-provided`, or `outcome-calibrated`) and explicit material-effect targets. It clarifies that information contribution and discrimination form one non-additive epistemic comparison, and that stopping is governed and scenario-specific. No field was removed; no production object or persistence contract was added.

## 12. Live shadow protocol

For exact authorized workflows, the selector ranks read-only while a person or existing workflow chooses independently. The existing action owner executes with action-specific authorization and consent. Existing receipts, Evidence lineage, Unknown transition, Answer changes, Recommendation eligibility, Decision/Outcome, completion, burden, and elapsed time are observed. Predictions are compared after canonical reevaluation. No action is initiated automatically. Collection must minimize private content, preserve organization/Question isolation, disclose shadow evaluation, obtain required contact/participant consent, retain only governed references, and support withdrawal.

## 13. Implementation readiness

Bounded production implementation must not begin yet. Synthetic governance, determinism, holdout lift, and stopping gates pass, and no scalar is needed. However, several ranking inputs would still require invented data outside fixtures. A read-only live shadow must calibrate owner-provided estimates and stopping against real outcomes first.

## 14. Limits and falsification

The experiment encodes ordinal counterfactual ground truth. It cannot establish real organizational value, causal Decision improvement, participant burden, generalized action reliability, cost, or delay. Live shadow should falsify the selector if it fails to beat Phase 2C, produces material false stops, depends on unavailable estimates, or varies across equivalent wording/order/organization-isolated cases.

## 15. Exact next step

**RUN LIVE SHADOW CALIBRATION**
