# Sprint 119 — Competing Explanation Adjudication Benchmark

## Status

Benchmark-only and shadow-only. Production cognition, Runtime, schemas, confidence formulas, ranking, recommendations, providers, applications, capability ownership, and canonical fixtures are unchanged.

## Question

Can Discovery preserve multiple plausible organizational explanations and revise their relative standing when diagnostic evidence arrives?

## Capability design

The experiment compares exactly three policies:

- **A0 — Production judgment.** The current pipeline runs unchanged. The benchmark records the production primary constraint and the production outputs used to construct it.
- **A1 — Competing-explanation state.** A benchmark-local adapter maps existing evidence, Mechanisms, and Conditions into an ephemeral explanation set. It preserves candidates and ancestry but makes no replacement judgment.
- **A2 — Adjudicated judgment shadow.** A deterministic, benchmark-local adjudicator interprets A1 and records a leading explanation, viable alternatives, displaced and weakened explanations, justified multi-cause states, abstention, uncertainty, and evidence that could change the conclusion.

Neither A1 nor A2 persists to Runtime or replaces an Executive Assessment or recommendation.

## Explanation-state model

Each explanation records:

- stable benchmark-local explanation identity;
- associated production Mechanism and Condition identities where present;
- supporting, opposing, discriminating, shared, and contradictory evidence identities;
- independent source ancestry;
- viability: leading, viable, weakened, or rejected;
- bounded support state: decisive, corroborated, supported, bounded, opposed, or ruled out;
- bounded benchmark confidence.

The state also retains the prior leader and prior viable set, the evidence responsible for revision, displaced and weakened explanations, preserved alternatives, causal uncertainty, and evidence that would change the conclusion.

## Adjudication rules

The shadow does not use a weighted sum. It uses deterministic role precedence:

1. Rule-out, counterfactual, and discriminating evidence can make an explanation untenable.
2. New decisive evidence can restore a previously rejected explanation.
3. Decisive evidence outranks nondiagnostic volume.
4. Independent corroboration strengthens support.
5. Credible opposition weakens an otherwise supported explanation.
6. Shared evidence preserves candidates but does not discriminate.
7. Weak and stale evidence remain bounded.
8. Duplicate and irrelevant evidence do not alter the explanation state.
9. Feedback loops, tied explanations, and independent joint causes justify abstention rather than a forced winner.
10. Stable identity ordering resolves serialization only; it never supplies causal preference.

The supported outcome vocabulary is exactly: preserve leader, weaken leader, displace leader, add competitor, preserve multiple causes, unresolved, and reject alternative.

## Hidden-ground-truth fixtures

Twenty-two scored mutation scenarios and four order controls cover:

- decisive displacement;
- weakening without reversal;
- contradiction-created competition;
- unresolved alternatives;
- independent joint causes;
- feedback loops;
- counterfactual disproof;
- delayed outcome revision;
- exact duplicates;
- independent corroboration;
- stale, weak, and irrelevant evidence;
- shared nondiscriminating evidence;
- decisive evidence against broad support;
- rejected-to-viable and viable-to-untenable transitions;
- industry-neutral language;
- team, department, and enterprise scales;
- the canonical Atlas Industrial decisive-evidence fixture;
- reversed evidence, source, and explanation order.

Fixtures encode hidden valid explanation sets, leaders, causal Mechanisms, true Conditions, expected evidence roles, recommendation families, outcomes, and abstention requirements. Hidden labels are used only for scoring and are never passed to production or shadow inference.

Each core case follows:

```text
Initial evidence
→ Initial explanation state
→ Diagnostic mutation
→ Revised explanation state
```

The harness reports expected direction, actual leader transition, viable-set transition, confidence movement, recommendation family, and revision evidence.

## Results

| Measure | A0 | A1 | A2 |
|---|---:|---:|---:|
| Correct leading explanation | 2/22 | Not selected | 22/22 |
| Explanation-set accuracy | Not represented | 22/22 | 22/22 |
| Explanation precision | Not represented | 1.000 | 1.000 |
| Explanation recall | Not represented | 1.000 | 1.000 |
| Mean reciprocal rank | 0.091 | Not ranked | 1.000 |
| Correct outcome | Not represented | Not selected | 22/22 |
| Correct revision direction | Not represented | Not selected | 22/22 |
| Correct confidence direction | Not represented | Bounded state only | 22/22 |
| Correct abstention | Not represented | Not selected | 22/22 |
| Unsupported explanations | Not represented | 0 | 0 |
| Appropriate recommendation family | 2/22 leading proxy | Not selected | 22/22 |

A2 produced 20 beneficial corrections, two correct preservations, and zero harmful changes relative to hidden ground truth. All five cross-benchmark families improved: the canonical Atlas Industrial decisive-evidence fixture plus controlled decisive evidence, counterfactual disproof, delayed evidence, and duplicate evidence.

## Explanation-set and leading-explanation findings

A1 preserved the complete valid explanation set in 22/22 cases. A2 selected or abstained correctly in 22/22 cases. Invalid alternatives were rejected without erasing trace history. Explanation precision and recall were both 1.000.

Production A0 commonly surfaced a broad strategy or knowledge condition regardless of the diagnostic fixture. The shadow result therefore identifies a missing comparative judgment capability, not a coefficient defect in the existing ranking path.

## Revision, contradiction, and confidence

- Direction under diagnostic mutation: 22/22.
- Contradiction ancestry preserved: 22/22.
- Credible opposition weakened rather than automatically erased the leader.
- Contradiction added a competitor when warranted.
- Shared evidence did not act as discriminating evidence.
- Decisive counterfactual and outcome evidence displaced an explanation.
- Weak and stale evidence remained bounded.
- Exact duplication and irrelevant evidence caused no movement.
- Independent corroboration strengthened confidence.
- Confidence direction was correct in 22/22 mutations.

The confidence values are benchmark-local bounded support states. They are not proposed production confidence formulas.

## Multi-cause and abstention behavior

All ambiguous, multi-cause, and feedback-loop cases abstained correctly. Independent causes remained jointly valid, shared evidence preserved unresolved alternatives, and feedback evidence did not force a unique causal root.

## Executive consequence fidelity

The A2 recommendation family followed the adjudicated explanation in 22/22 cases. There were no harmful recommendation-family changes and no production recommendation was mutated. This result only measures whether a future recommendation consequence would be causally appropriate.

## Historical preservation

Prior leader and viable-set state remained available in 22/22 revised states. Displaced explanations remained traceable, revision evidence retained production evidence identities, and repeat execution was byte-identical.

## Determinism and identity

- repeated-run byte equality: pass;
- reversed evidence order: pass;
- reversed source order: pass;
- reversed explanation order: pass;
- evidence identities: stable;
- Mechanism identities: stable;
- organization identity: stable within every replay;
- Runtime persistence: none;
- fixture mutation: none;
- production output mutation: none.

## Cross-benchmark replay

The benchmark directly consumes the canonical Atlas Industrial A03, A04, A11, and A15 fixture evidence and also includes controlled replay families corresponding to decisive-evidence ablation, R04-style controlled evidence, delayed revision, duplicate evidence, and counterfactual outcome cases. It does not alter their canonical expectations. A2 corrected the leading explanation in 5/5 scored cross-benchmark families while preserving production outputs.

## Classification

**A — Breakthrough adjudication capability**

The shadow exceeds every Classification A threshold:

- leading selection: 100%;
- explanation-set preservation: 100%;
- revision direction: 100%;
- justified abstention: 100%;
- unsupported-explanation precision: 1.000;
- duplicate and irrelevant invariance: pass;
- confidence direction: 100%;
- harmful recommendation-family changes: zero;
- identity and order stability: pass;
- controlled and cross-benchmark improvement: pass.

## Exact next recommendation

Authorize a production-shadow design sprint, not production integration.

The next sprint should define the narrow boundary that can construct an ephemeral competing-explanation state from existing Mechanisms, Conditions, contradictions, and evidence ancestry, then replay it beside production judgment. It should preserve the A1/A2 separation, keep confidence semantics bounded, and prove value on canonical fixtures before any authoritative result can consume it.

Do not add a new Runtime object, capability owner, persisted history model, or recommendation path in that sprint. Production adoption should require a separately authorized contract and regression review.
