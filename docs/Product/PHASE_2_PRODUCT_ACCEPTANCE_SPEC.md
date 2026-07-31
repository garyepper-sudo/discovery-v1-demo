# Discovery Phase 2 Product Acceptance Specification

**Status:** Canonical Phase 2 product authority
**Applies after:** Phase 1.1 — Governed Google Drive Retrieval
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)
**Conceptual authority:** [ORGANIZATIONAL_UNDERSTANDING_MODEL.md](./ORGANIZATIONAL_UNDERSTANDING_MODEL.md)
**Object contracts:** [PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md)

## 1. Purpose

Phase 1.1 established governed evidence retrieval: exact authorization,
selected-source scope, deterministic extraction, content-addressed Evidence,
Question-relative search, canonical admission, citations, freshness, and
truthful Answer gating.

Phase 2 defines how Discovery transforms authorized Evidence into useful
organizational understanding and decision support while preserving existing
Runtime, cognition, Product Workflow, authorization, confidence, and lineage
owners.

> Discovery does not optimize for producing answers.
> Discovery optimizes for improving organizational understanding.

An Answer is therefore one bounded expression of current understanding, not the
terminal product objective.

## 2. Canonical Workflow

```text
Question
↓
Search
↓
Evidence
↓
Answer
↓
Confidence
↓
Why?
↓
Competing Explanations
↓
Unknowns
↓
Improve Confidence
↓
Recommendation
↓
Decision
↓
Outcome
↓
Model Learns
↓
New Insight
```

`ProductQuestion` remains the durable product identity and
`ProductQuestionWorkspace` remains the frontend boundary. This workflow
composes existing authoritative owners; it does not authorize parallel
cognition or persistence.

Lifecycle implementation must follow `DEC-PROD-025`: historical records are
immutable, current projections advance through additive versioned events or
linked canonical records, and no-change must be recorded explicitly rather
than inferred from omission.

## 3. Answer Semantics

### Phase 2A acceptance record

**Status:** COMPLETE — Canonical Answer Contract
**Accepted:** 2026-07-30

Phase 2A added immutable, deterministic Answer-version references and bounded
Answer-operation receipts in existing Runtime events. Version-1 Question
Answer history and version-2 Answer events compose through a deterministic
mixed-history reader. Each eligible Answer version owns its exact immutable
customer Confidence snapshot; targeted abstention persists no Answer version
and has null customer Confidence.

Fourteen deterministic scenarios cover supported, competing-explanation,
unsupported, abstention, relevance, duplicate Evidence, formatting-only
revision, material supersession, replay, Question isolation, authorization,
mixed-version reload, freshness, and contradiction behavior. The controlled
Google Drive onboarding Question remained a targeted abstention because
ownership timing and credential readiness remain insufficiently
discriminated. Its replay returned the same receipt without a duplicate write.

No Runtime collection, cognition, frontend behavior, later Phase 2 object, or
Production activation was introduced.

### Phase 2B acceptance record

**Status:** COMPLETE — Unknown Identity and Lifecycle
**Accepted:** 2026-07-30

Phase 2B added immutable version-2 Unknown lifecycle events to ProductQuestion
history in Runtime `memory.events`. Stable identity is derived from the
organization, durable Question, category, typed target, and sorted source
ancestry; mutable wording, timestamps, and actors are excluded. The current
projection is rebuilt from opened, targeted, resolved, reopened, superseded,
and retired events. Resolution requires explicit Evidence, Outcome, Decision,
or governed-determination ancestry.

Candidate Unknowns are read-only projections until an explicit authorized open
operation succeeds. Eighteen deterministic scenarios pass without a new
Runtime collection, migration, frontend behavior, confidence-improvement
execution, Recommendation, or downstream object automation.

The proven Phase 2A–2B workflow segment is:

```text
Question
→ admitted Evidence
→ Answer or targeted abstention
→ Answer-owned Confidence only when an Answer exists
→ explicit candidate Unknown
→ durable Unknown lifecycle
```

A targeted abstention is not an Answer and owns no customer Confidence.
Candidate Unknowns are projections, not writes. Unknown resolution requires
explicit ancestry; disappearance from a projection never implies resolution.
Opening or targeting an Unknown creates no downstream action automatically.
ProductQuestion history in Runtime `memory.events` remains the sole durable
owner, and no new Runtime collection exists.

### Phase 2C acceptance record

**Status:** COMPLETE

Phase 2C adds read-only, typed proposals for one exact current Unknown and
version-2 ProductQuestion operation receipts beginning only with explicit human
authorization. Deterministic ranking prioritizes discrimination, understanding,
governance safety, burden, delay, and effort without an opaque scalar.
Equivalent proposals remain tied rather than receiving a fabricated winner.
Completion may reference canonically admitted Evidence but never admits it,
resolves the Unknown, or mutates Confidence. Twenty-four deterministic
scenarios pass with no connector action, downstream product object, Runtime
collection, migration, frontend change, or Production activation.

Authenticated live acceptance used one existing authorized development
Question and its exact durable competing-explanation Unknown. Proposal
generation preserved the Runtime revision and bytes. Explicit operator
authorization recorded exactly one `inspect-existing-evidence` receipt and
targeted the exact Unknown. Identical replay produced no write, conflicting
replay failed closed, and reload preserved the receipt and targeted state.
Connector activity, Evidence admission, Answer and Confidence mutation, and
downstream Product objects remained zero. Product Recommendation and all later
Phase 2 work remain open.

Every Question resolves to exactly one of these customer-safe states:

- **Supported Answer:** authorized Evidence and canonical understanding
  materially address the exact Question and pass existing relevance,
  specificity, and truthfulness gates.
- **Competing Explanations:** two or more plausible explanations remain
  independently supported and available Evidence does not yet discriminate
  among them.
- **Targeted Abstention:** Discovery identifies the exact limiter preventing an
  Answer and names a bounded next improvement when one is supported.
- **Unsupported:** no authorized basis exists for an Answer, explanation, or
  improvement claim.

Uncertainty must remain visible and source-bounded. Discovery must not emit an
Answer merely to increase coverage, transfer confidence from adjacent
cognition, or fabricate certainty.

## 4. Confidence

Confidence communicates the quality of the current organizational
understanding supporting the exact selected Answer.

Confidence remains owned by that `ProductAnswer`; it is not a workspace,
Question, recommendation, prediction, document, or organization-model score.
It must preserve its authoritative source, principal limiter, and
customer-readable explanation.

Confidence must never be interpreted as:

- a probability that the Answer is true;
- a document-count or evidence-volume score;
- increased corroboration from duplicate Evidence;
- certainty unsupported by canonical cognition.

No Answer means no customer-facing Answer confidence.

## 5. Why?

Every Supported Answer must let an authorized user understand:

- why Discovery currently believes it;
- which authorized Evidence contributed;
- which Evidence supports, opposes, or is shared across explanations;
- why competing Evidence or explanations did not dominate;
- what uncertainty still limits the Answer.

The explanation must come through existing authorized product contracts. It
must not expose raw cognition, chain-of-thought, hidden implementation details,
or frontend-derived reasoning.

## 6. Competing Explanations

Competing explanations remain independently identified until admitted Evidence
discriminates among them. Similar wording, presentation pressure, or a leading
candidate is insufficient to eliminate an alternative.

Their canonical identity, Evidence relationships, revision lineage, and
resolution status must survive persistence and deterministic replay. Historical
alternatives remain inspectable even after later Evidence weakens or
discriminates among them.

## 7. Unknowns

Discovery must explicitly identify, when canonically supported:

- missing Evidence;
- unresolved conflicts;
- weak assumptions;
- unanswered Questions.

Phase 2 may introduce a versioned product contract for Unknowns only as a
projection or reference to existing authoritative uncertainty, investigation,
Evidence, and Question owners. It must declare ownership, persistence,
lineage, authorization, migration, and validation before implementation.
Unknowns must not become a parallel cognition store or inferred frontend list.

## 8. Improve Confidence

Improve Confidence identifies the highest-value next Evidence for improving
the exact Question's current understanding. It is a user-governed acquisition
step, not autonomous collection.

When supported, the improvement must communicate separately:

- expected confidence improvement;
- expected understanding improvement;
- expected discrimination gained among remaining explanations.

These values must come from existing authoritative producers or remain
explicitly unknown. They must not be converted into probabilities, guarantees,
or frontend-computed scores. Acquisition and completion retain Question,
Answer, Evidence, source, and organization lineage.

## 9. Recommendation

Discovery has two explicit Recommendation purposes:

- **Understanding Recommendation:** primarily improves organizational
  understanding by targeting an actionable Unknown. It is the product-facing,
  non-persistent projection of a governed Phase 2C Confidence-Improvement
  proposal. Its internal operation lifecycle remains authoritative.
- **Objective Recommendation:** primarily advances an explicit organizational
  objective. Generation remains unimplemented. Eligibility requires an active
  Objective version, disclosed Optimization Context or default, material
  constraints, alternatives, authorization, and exact understanding ancestry.

Every Recommendation has exactly one primary purpose. Secondary learning or
objective value cannot bypass the eligibility rules for that primary purpose.

A product Recommendation derives from:

```text
Understanding
+
Confidence
+
Unknowns
+
Organizational objectives
```

It does not follow directly from the presence of an Answer. Existing canonical
cognition and decision-support owners remain authoritative; Phase 2 governs
the Recommendation's product eligibility, composition, ancestry, and
customer-safe projection.

A Recommendation must name its supporting understanding, confidence limiter,
relevant Unknowns, objective relationship, expected effect, risks, and
conditions. If those relationships are unsupported, Discovery must abstain
rather than emit generic advice.

With an unknown or low-confidence inferred objective, Discovery may still
offer an Understanding Recommendation but must not emit an Objective
Recommendation. A high-confidence inferred objective supports only disclosed,
conditional, reversible eligibility. High-stakes or irreversible action
requires a confirmed Objective.

## 10. Decision Lifecycle

The canonical Phase 2 product lifecycle is:

```text
Draft
↓
Active
↓
Implemented
↓
Observed
↓
Completed
↓
Archived
```

Every transition is explicit, authorized, idempotent, time-ordered, and
organization-isolated. History is immutable and retains exact ancestry to the
Question, Answer, Recommendation, expected outcomes, owner, and review timing.

This lifecycle is an acceptance requirement, not permission to replace the
existing Executive Decision pipeline. Any contract or state mapping required
to expose it must complete version, fixture, migration, rollback, and canonical
owner review before implementation.

## 11. Outcome

Outcomes are authorized observations of what happened after implementation.
They become new Evidence through the canonical admission path; they are never
written directly as conclusions.

Observed outcomes may strengthen, weaken, redirect, or leave current
understanding unchanged. Expected results never substitute for observations.
Question, Decision, Evidence, review, and historical understanding lineage
remain preserved.

## 12. Learning

Learning means:

> Understanding changes because reality supplied new evidence.

Learning is not document accumulation, synchronization, persistence, user
activity, or the arrival of Evidence alone. Canonical review and learning
owners determine whether understanding changed and record an explicit revision
or no-change result.

Equal authorized inputs and operation history must reproduce the same learning
result, ordering, lineage, and product projection.

## 13. Insight

An Insight may emerge only after canonical learning materially changes
organizational understanding. It must identify:

- the previous understanding;
- the updated understanding;
- the supporting admitted Evidence.

It must also preserve affected Question and Decision lineage, authorization,
materiality gating, and duplicate suppression. Unsupported, immaterial,
duplicate, or merely restated changes must abstain.

## 14. Product Experience Principles

Discovery optimizes for:

- clarity;
- truthfulness;
- actionability;
- organizational learning.

The ordinary product exposes governed understanding and decision support, not
internal cognition, Runtime structure, object volume, or implementation
complexity. Progressive disclosure may compress presentation but may not
change product meaning.

## 15. Understanding Improvement

Every capability implemented after Phase 1.1 must measurably improve either:

- individual organizational understanding; or
- collective organizational understanding.

This is Phase 2's primary optimization objective. Each acceptance test must
state whose understanding should improve, what truthful information becomes
available, and how the test demonstrates improvement without relying only on
completion, activity, document volume, or interface engagement.

## 16. Acceptance Criteria

These criteria specify future tests; they do not implement them.

### Answer

- A supported exact-Question fixture emits one source-backed Answer.
- Adjacent, unrelated, unsupported, and underdetermined fixtures abstain.
- Answer text, Evidence ancestry, and revision survive reload.
- Duplicate Evidence does not change Answer eligibility.

### Confidence

- Confidence appears only for the exact selected Answer.
- Its source, explanation, and principal limiter remain stable through reload.
- Document volume and duplicate Evidence cannot increase it.
- Abstention exposes no Answer confidence.

### Competing Explanations

- Two supported alternatives remain independently identified and evidenced.
- New discriminating Evidence may weaken one without deleting its history.
- Non-discriminating Evidence cannot eliminate either alternative.
- Ordering and reload are deterministic.

### Unknowns

- Missing Evidence, conflicts, assumptions, and unanswered Questions remain
  distinct when supported.
- Unsupported Unknowns are absent rather than inferred.
- Every item preserves authoritative lineage and organization isolation.
- Resolving one Unknown does not silently resolve another.

### Improve Confidence

- One supported next-Evidence action names the exact Question and limiter.
- Expected confidence, understanding, and discrimination gains remain distinct
  or explicitly unknown.
- Completion admits Evidence once and records revision or explicit no-change.
- Unauthorized, duplicate, or failed acquisition cannot improve confidence.

### Recommendation

- A Recommendation requires supported understanding, Answer confidence,
  relevant Unknowns, and an organizational-objective relationship.
- It preserves ancestry, risks, conditions, and expected effect.
- Missing intervention support produces abstention, not generic advice.
- Equivalent replay produces an equivalent Recommendation.

### Decision

- Draft-to-Archived transitions follow the canonical lifecycle exactly.
- Invalid, skipped, repeated, or unauthorized transitions fail closed.
- Immutable history and Question/Answer/Recommendation ancestry survive reload.
- No fixture or presentation state becomes decision authority.

### Outcome

- Only explicit authorized observations become Outcome Evidence.
- Expected outcomes are never reported as observed results.
- Mixed, inconclusive, and too-early outcomes remain truthful.
- Admission, review, citations, and historical lineage survive retry and reload.

### Learning

- Canonical review produces one understanding revision or explicit no-change.
- Evidence arrival alone cannot create a learning claim.
- Repeated application is idempotent and deterministic.
- Previous understanding and complete ancestry remain available.

### Insight

- A material post-learning change may emit one source-backed Insight.
- The Insight identifies previous and updated understanding plus Evidence.
- No-change, unsupported, immaterial, unrelated, and duplicate cases abstain.
- Insight identity, affected objects, authorization, and reload remain stable.
