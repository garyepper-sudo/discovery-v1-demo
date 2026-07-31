# Discovery Organizational Understanding Model

**Status:** Canonical conceptual model
**Authority:** Discovery's primary optimization object
**Governed by:** [PRODUCT_GOVERNANCE.md](./PRODUCT_GOVERNANCE.md)
**Measured by:** [Discovery Scorecard](../Architecture/Canon/DISCOVERY_SCORECARD.md)

## 1. Purpose and Authority

This document is the canonical conceptual model for organizational
understanding. It governs the meaning that product workflows, architecture,
contracts, evaluation, and future acceptance tests may express.

The [Workflow Acceptance Specification](./WORKFLOW_ACCEPTANCE_SPEC.md) defines
the end-to-end operational workflow. The
[Phase 2 Product Acceptance Specification](./PHASE_2_PRODUCT_ACCEPTANCE_SPEC.md)
defines the product behavior required after governed retrieval. The Discovery
Scorecard remains the highest measurement authority, and its Organizational
Understanding Index (OUI) remains the North Star. This model defines the object
that OUI evaluates; it does not replace the Scorecard or prescribe a new
formula.

Lower-level architecture, object, route, product-language, and implementation
specifications may refine this model but may not contradict it.

## 2. Canonical Definition

> Organizational understanding is an organization's current, durable,
> evidence-grounded, permission-aware model of its conditions, relationships,
> explanations, uncertainties, and changes over time, maintained so authorized
> people can understand and act more effectively.

In plain language, it is the best governed account Discovery can currently
support of what is happening, why it may be happening, what remains unknown,
how relevant parts relate, what may happen next, what would most improve
understanding, and what decisions and outcomes have taught the organization.

Discovery's persistent **conceptual** state is organizational understanding.
Questions, Answers, confidence, recommendations, decisions, outcomes, learning,
and Insights inspect, improve, test, communicate, or revise that state.
Technically, Organization Runtime remains canonical persistence, the
Organization Model remains the living product representation, and the
Operating Model remains its primary operational representation.

Discovery optimizes understanding, not Answer production, document volume,
engagement, feature count, or apparent certainty.

| Concept | Boundary |
|---|---|
| Information | A potentially relevant record, statement, measurement, or experience; it has not necessarily acquired organizational authority. |
| Knowledge | Governed information whose source, scope, and meaning are sufficiently established for reuse. This is a conceptual distinction, not a new cognitive layer. |
| Answer | A Question-relative product expression of currently supported understanding, or a targeted abstention. |
| Organizational Understanding | The durable, revisable, governed model that integrates evidence, explanations, uncertainty, relationships, history, and implications across authorized scopes. |
| Decision | An authorized intervention or commitment made using current understanding and uncertainty. |
| Learning | A lineage-preserving change—or explicit no-change—in understanding because reality supplied relevant Evidence. |

Improvement includes resolving a relevant uncertainty with discriminating
Evidence, exposing a material contradiction, calibrating confidence, or
learning from an observed outcome. More documents, a longer summary, repeated
Evidence, unsupported confidence, or a visually richer dashboard do not.

Organizational understanding is not merely retrieval, summarization, a
knowledge graph, a dashboard, an Answer, an executive opinion, a confidence
score, AI-generated claims, or accumulated content.

## 3. Unit and Scope of Understanding

Understanding may be scoped to:

- one authorized user;
- one `ProductQuestion`;
- one issue or investigation;
- one team or function;
- another authorized organizational scope;
- the governed shared Organization Model.

Every scope is organization-scoped, permission-aware, purpose-relative where
appropriate, bounded by admitted Evidence, and allowed to remain partial. A
user never receives a complete organization-wide model merely by belonging to
the organization. Authorization and inherited source permissions determine
what can influence and appear in that user's projection.

## 4. Individual and Collective Understanding

**Individual organizational understanding** is the authorized understanding
available to and shaped by one person within a particular purpose and scope.

**Collective organizational understanding** is the governed combination of
authorized contributions, Evidence, decisions, outcomes, and validated
learning from multiple people and scopes.

Collective understanding is not a vote, average, majority opinion, seniority
rule, or unrestricted merge. It preserves provenance, permissions,
disagreement, source scope, contribution lineage, contradictions, and
organization isolation. Individual contributions may improve the shared model
through existing admission, cognition, review, and learning owners without
losing their identities or granting broader disclosure.

## 5. Components of Organizational Understanding

| Component | Existing canonical owner or status |
|---|---|
| Evidence base | Canonical Evidence admission and ancestry |
| Entities and conditions | Existing cognitive chain and Organizational Conditions |
| Observations and changes | Observations, Signals, Runtime evolution and authorized projections |
| Relationships | Existing phenomena, mechanisms, concepts, theories, and completed explanations |
| Explanations or mechanisms | Completed Organizational Explanations and canonical understanding composition |
| Competing explanations | Existing comparative Evidence semantics; production adjudication remains limited |
| Contradictions | Canonical contradiction detection and preserved lineage |
| Unknowns and evidence gaps | Existing uncertainty and investigation opportunities; Phase 2 event identity and lifecycle governed by the Product Object Contracts |
| Confidence and basis | Existing object-relative confidence; `ProductAnswerConfidence` for customer Answers |
| Temporal freshness | Source-backed freshness where proven; semantic freshness remains deferred |
| Decisions and interventions | Existing Executive Decision pipeline and product references |
| Observed outcomes | Existing review and learning owners |
| Learning history | Runtime memory, evolution, review, and learning events |
| Insights | Quality-gated Product Insight projection; complete lifecycle remains open |

This table maps concepts to current owners. It does not create duplicate
product or cognitive objects.

## 6. Quality Dimensions

- **Relevance:** responds materially to the actual Question or objective.
- **Evidential support:** rests on admitted, governed, attributable Evidence.
- **Explanatory adequacy:** explains relationships or causes rather than
  restating observations.
- **Discrimination:** distinguishes plausible competing explanations.
- **Coherence:** fits relevant parts together without hiding contradictions.
- **Completeness:** covers what the objective requires while naming omissions.
- **Calibration:** expresses confidence consistent with support and limits.
- **Freshness:** reflects recency, volatility, accessibility, supersession, and
  validation cadence.
- **Actionability:** improves the ability to decide, investigate, communicate,
  monitor, or act.
- **Stability and revisability:** resists non-material change and responds to
  material Evidence.
- **Governance integrity:** preserves permissions, attribution, auditability,
  identity, and isolation.
- **Longitudinal learning:** improves through Evidence, decisions, and outcomes
  without rewriting history.

These dimensions inform OUI interpretation and its benchmark research
dimensions. They are not permanent mathematical weights or additional
Scorecard metrics.

## 7. Understanding States

These states are qualitative product semantics, not new Runtime enums or
single confidence bands.

| State | Meaning | Supported by | Must not imply | Allowed transitions |
|---|---|---|---|---|
| Unformed | No relevant supported understanding yet | No admitted relevant basis or failed eligibility | failure, certainty, or generic advice | Partial, Competing, Supported, Retired |
| Partial | Some relevant structure is supported but important gaps remain | Bounded Evidence plus named gaps | complete explanation | Competing, Supported, Revising, Stale, Retired |
| Competing | Multiple explanations remain plausible | Independent alternatives with insufficient discrimination | equal truth or forced winner | Partial, Supported, Revising, Stale, Retired |
| Supported | One Question-relative understanding passes relevance and support gates | Governed Evidence, explanation, uncertainty, lineage | causal certainty or permanence | Operational, Validated, Revising, Stale, Retired |
| Operational | Supported understanding is being used to investigate or decide | Explicit action or Decision ancestry | validation by action alone | Validated, Revising, Stale, Retired |
| Validated | Observed outcomes support the relevant expected relationship | Outcome Evidence and canonical review | universal truth beyond scope | Operational, Revising, Stale, Retired |
| Revising | Material Evidence is changing the current model | New discriminating or contradictory Evidence | regression or loss of history | Partial, Competing, Supported, Validated, Stale, Retired |
| Stale | Currentness is materially limited | Recency, volatility, access, cadence, or supersession limits | falsity based on elapsed time alone | Revising, Partial, Competing, Supported, Retired |
| Retired | The understanding no longer governs the current model | Supersession, invalidation, scope closure, or governed retirement | deletion of history | Revising only through an explicit governed restoration |

## 8. How Understanding Changes

```text
Question or objective
→ authorized Evidence acquisition
→ Evidence admission
→ canonical interpretation
→ current understanding
→ confidence and Unknowns
→ targeted Evidence or action
→ Decision
→ Outcome
→ model revision or explicit no-change
→ new Insight where qualified
```

Adding Evidence changes the governed input set. Updating provenance changes
lineage or current accessibility. Improving discrimination changes relative
support among explanations. Changing confidence changes an object's justified
support, not its identity. Revising an explanation changes current meaning
while retaining history. Changing a Recommendation changes action guidance,
not necessarily understanding. Outcome learning compares expectation with
reality. An Insight is a material new implication of changed understanding.

Document accumulation alone is not learning.

## 9. Understanding Improvement

An interaction improves understanding when it truthfully:

- answers a relevant Question;
- rules out or strengthens an explanation;
- exposes a contradiction;
- converts a vague Unknown into a specific evidence gap;
- identifies the highest-value next Evidence;
- clarifies a relationship;
- improves confidence calibration;
- refreshes stale understanding;
- preserves an important alternative;
- enables a better Decision;
- learns from an Outcome;
- produces a genuinely new Insight;
- communicates existing understanding more clearly without changing meaning.

It does not improve understanding merely by producing longer summaries, more
documents, repeated Evidence, unsupported confidence, an Answer that hides
alternatives, an objective-free Recommendation, UI activity without useful
understanding, or model change without user or organizational utility.

## 10. Understanding Improvement Measurement

**Local improvement** asks whether an authorized user's understanding of the
current Question, issue, or scope improved. Evidence may include reduced
uncertainty, stronger discrimination, clearer causal structure, calibrated
confidence, specific Unknowns, a better next action, or improved explanation
ability.

**Global improvement** asks whether the shared Organization Model became more
useful, accurate, coherent, current, or actionable. Evidence may include
reusable admitted Evidence, resolved contradictions, validated mechanisms,
durable Decision and Outcome learning, supported cross-silo relationships,
retired stale understanding, or new authorized Insights.

| Scorecard dimension | Relationship |
|---|---|
| Organizational Understanding Index | Sole direct optimization target; measures whether the Organizational Model explains and understands better |
| User Intelligence Index | Outcome: authorized people become more capable |
| Collective Intelligence Index | Outcome: governed contributions combine into useful shared understanding |
| Governance Integrity Index | Blocking guardrail: invalid permissions, lineage, or authority invalidate gains |
| System Sustainability Index | Blocking guardrail: unsafe or operationally unsustainable gains cannot be promoted |

Local Understanding Utility remains benchmark-only, experiment-scoped,
traceable to the six research dimensions, and subordinate to OUI. It is not a
sixth Scorecard metric.

## 11. Confidence Within Understanding

Confidence is one property of understanding, not understanding itself. It is
the evidence justification for one exact object or claim. In the product,
customer-facing Answer confidence belongs only to the selected
`ProductAnswer`.

Confidence may be absent during targeted abstention, cannot increase from
duplicate Evidence, may change when explanations discriminate, must account
for contradictions and relevant freshness limits, and must preserve its basis.
It may differ across Questions even when Evidence overlaps.

Existing distinctions—source reliability, Evidence confidence, explanation or
canonical understanding confidence, Answer confidence, recommendation
confidence where canonically owned, and Decision confidence—must retain their
separate owners and semantics. This model creates no universal confidence
layer.

## 12. Unknowns and Evidence Gaps

Unknowns are explicit parts of honest understanding:

- missing Evidence;
- missing relationship;
- unresolved contradiction;
- causal discrimination gap;
- measurement gap;
- authority or ownership gap;
- temporal freshness gap;
- Outcome-validation gap;
- scope or permission gap.

An Unknown becomes actionable when it is relevant to the current objective,
has authoritative lineage, and a bounded permitted action or Evidence request
could materially reduce it.

```text
Understanding objective
→ current understanding
→ knowledge gap
→ expected value of Evidence
→ targeted acquisition
→ updated understanding
```

Unknown identity and lifecycle remain a pre-Phase 2 product-contract question.

## 13. Freshness and Stability

Freshness depends on Evidence recency, expected organizational volatility,
source accessibility, validation cadence, supersession, missing expected
confirmation, and Decision or Outcome timing. Elapsed time alone is
insufficient.

Each understanding may have a different stability profile and appropriate
refresh interval. A stable policy interpretation and a rapidly changing sales
forecast must not decay identically. No universal decay rate is authorized.

## 14. Contradictions and Competing Explanations

Discovery preserves disagreement through explicit alternative identities,
comparative Evidence roles, contradiction lineage, and historical revisions.
It does not force synthesis, treat majority opinion as truth, or eliminate an
explanation without discriminating Evidence. Confidence may be reduced where
the owning contract supports that effect.

Multiple explanations may be partially true. Targeted acquisition should seek
Evidence that distinguishes their contributions, conditions, or scope.
Weakened and retired alternatives retain history.

## 15. Decisions as Tests of Understanding

A Decision is both an authorized action and a potential test of current
understanding. It should retain:

- current understanding and rationale;
- Answer-relative confidence;
- competing explanations and assumptions;
- expected Outcome;
- owner and implementation state;
- observed Outcome.

A Decision may act on supported understanding, test an uncertain mechanism,
collect discriminating Evidence, mitigate risk under uncertainty, or delay
action when support is insufficient. Outcome arrival must not rewrite the
original rationale or confidence.

## 16. Outcomes and Learning

Learning compares:

```text
expected Outcome
vs.
observed Outcome
```

Observed Outcomes enter as governed Evidence. Canonical review may validate or
weaken an explanation, reveal a condition, change confidence, alter a
Recommendation, expose an Unknown, or qualify a new Insight.

Prior understanding, original Decision rationale and confidence, Outcome
Evidence, and revision lineage remain preserved. Learning is attributable,
idempotent, and deterministically replayable where the existing owner requires
determinism.

## 17. Insight Formation

An Insight is a meaningful change in organizational understanding that is not
merely restated from one source. It retains prior and new understanding,
responsible Evidence or Outcomes, scope, confidence or uncertainty,
implications, and lineage.

Insights may emerge from cross-source synthesis, supported cross-silo
relationships, contradiction resolution, Outcome learning, temporal change,
conditional mechanisms, or repeated patterns. Every model update does not
require an Insight.

## 18. Permissions and Governance

Organizational understanding preserves:

- organization isolation;
- exact user, role, and scope authorization;
- source-scope enforcement;
- contribution attribution;
- inherited Evidence permissions;
- restricted explanation visibility where required;
- no leakage through Answers, summaries, Recommendations, or Insights;
- revocation of current authority with historical lineage preserved;
- auditability.

Collective understanding may contain restricted ancestry, but a user-facing
projection may be influenced by and disclose only what its authorization and
disclosure contracts permit. A summary cannot launder inaccessible Evidence.

## 19. Persistence, Identity, and Replay

- Organization identity is stable and canonical.
- `ProductQuestion` has durable organization-scoped identity.
- Connector Evidence is content-addressed within authorized source scope.
- Repository revisions remain provenance and source-version lineage.
- Understanding changes are versioned or event-backed through existing owners.
- Repeated operations are idempotent.
- Historical states and receipts remain replayable.
- New Evidence does not rewrite old receipts.
- Outcomes revise current understanding without corrupting history.
- Reload preserves meaning, ordering, lineage, and identity.

This model prescribes no new storage system or Runtime schema.

## 20. Relationship to Product Objects

The binding Phase 2 identity, persistence, lifecycle, permission, and replay
semantics for these objects are defined in
[PHASE_2_PRODUCT_OBJECT_CONTRACTS.md](./PHASE_2_PRODUCT_OBJECT_CONTRACTS.md).
This section defines their conceptual role and does not override that contract.

| Product object or concept | Role in understanding | Current status |
|---|---|---|
| `ProductQuestion` | Defines the durable understanding objective | Implemented |
| `ProductSearchReceipt` | Records governed Evidence acquisition | Implemented |
| Canonical Evidence | Grounds understanding | Implemented |
| `ProductAnswer` | Presents the current Question-relative conclusion or abstention | Implemented projection; durable identity/lifecycle requires Phase 2 review |
| `ProductAnswerConfidence` | Expresses justification for the exact selected Answer | Implemented, Answer-owned |
| Competing explanation | Preserves unresolved alternatives | Canonical cognition exists; bounded product projection exists; adjudication remains limited |
| Unknown | Identifies what prevents stronger understanding | Conceptually specified; first-class product contract deferred |
| Confidence-improvement operation | Seeks the highest-value next Evidence | Partially implemented through investigation opportunity and improvement history |
| Recommendation | Proposes an action from understanding, objectives, and uncertainty | Canonical producer exists; complete product lifecycle deferred |
| `ProductDecisionDraft` / Decision | Records a proposed or committed intervention | Projection and canonical pipeline exist; complete operation deferred |
| `ProductOutcomeReview` | Supplies governed observations of what happened | Projection and learning owners exist; complete operation deferred |
| Learning event | Records how understanding changed or did not change | Canonical learning exists; binding product replay deferred |
| `ProductInsight` | Surfaces a meaningful new understanding | Quality-gated projection exists; complete lifecycle deferred |

## 21. Relationship to the Cognitive Architecture

This model is the product and architecture meaning of organizational
understanding, not a replacement for the internal cognitive chain. The engine
continues to use its canonical equivalent of:

```text
Evidence
→ Entities
→ Observations
→ Signals
→ Contradictions
→ Phenomena
→ Mechanisms
→ Beliefs
→ Concepts
→ Theories
→ Organizational Conditions
→ Organizational State
```

The ordinary product projects the smallest useful authorized representation
needed for understanding, confidence, alternatives, Unknowns, decisions, and
learning. It does not expose the full chain by default or reinterpret engine
internals.

## 22. Relationship to the Discovery Scorecard

OUI is the sole direct optimization target. User Intelligence and Collective
Intelligence are outcomes of improved understanding. Governance Integrity and
System Sustainability are blocking guardrails. Local metrics, capability
health, research dimensions, and Local Understanding Utility remain
subordinate.

This model tells OUI evaluation what improvement must mean: relevant,
evidence-grounded, explanatory, discriminating, coherent, calibrated,
revisable, useful, governed, and longitudinal. It authorizes no final
mathematical weights.

## 23. Product Acceptance Scenarios

| Scenario | Input condition | Expected result |
|---|---|---|
| A — Supported understanding | Independent sources converge on one explanation | Supported Answer; explained confidence; alternatives weakened but historically preserved; Recommendation only where warranted |
| B — Competing explanations | Ownership timing and credential readiness remain plausible | Targeted abstention or explicit competition; no fabricated confidence; highest-value discriminating Evidence identified |
| C — Duplicate Evidence | Multiple files contain identical content | Distinct source lineage; one content variant; no false corroboration or confidence inflation |
| D — Material source change | A controlled source adds a material claim | Stable source; new source version; one Evidence admission; justified revision; preserved history |
| E — Formatting-only revision | Repository revision changes without material content change | Provenance and freshness update; no new canonical Evidence or understanding inflation |
| F — Contradictory Outcome | Observed result conflicts with expected mechanism | Immutable original Decision; weakened explanation; revised confidence; learning event; Insight considered, not guaranteed |
| G — Stale understanding | Expected validation is absent beyond appropriate cadence | Bounded freshness limitation; targeted acquisition; no universal decay |
| H — Permission boundary | A shared Insight depends partly on restricted Evidence | Full lineage only for authorized users; permitted projection or omission otherwise; no leakage |
| I — Collective understanding | Two teams contribute complementary scoped accounts | Governed combination; provenance and disagreement preserved; cross-silo relationship only where supported |
| J — No improvement | Interaction creates a longer summary without better relevance, discrimination, calibration, or actionability | No Understanding Improvement or Scorecard gain claimed |

## 24. Promotion Criteria

A Phase 2 capability may be promoted only when it demonstrates:

- measurable organizational-understanding improvement;
- truthful uncertainty and preserved alternatives;
- Evidence, Decision, and learning lineage;
- deterministic or bounded-repeatable behavior as required;
- organization and permission isolation;
- no duplicate-Evidence inflation;
- reload and replay survival;
- Governance Integrity and System Sustainability;
- user-facing clarity;
- no unnecessary internal-cognition exposure.

## 25. Non-Goals and Deferrals

Current non-goals include full causal certainty, universal numeric confidence,
automatic organization-wide visibility, unrestricted autonomous action,
replacement of human Decision ownership, engagement as understanding, forced
Answers, broad Production activation without evidence, premature
counterfactual or opportunity-cost expansion, pervasive nonlinear cognition,
and autonomous Evidence acquisition without governance.

Research hypotheses remain research. Industry-specific meaning belongs in
authorized interpretation layers rather than the industry-agnostic core.

## 26. Open Questions

Answer projection/versioning, Answer-owned Confidence persistence, Unknown
identity, Recommendation expiration, Decision amendment, Outcome correction,
no-change Learning, and Insight retirement were resolved by `DEC-PROD-025` and
the Phase 2 Product Object Contracts. Their implementation remains gated, but
they are no longer design questions.

| Question | Classification | Existing gap or required record |
|---|---|---|
| How do scoped local improvements contribute to OUI without arbitrary aggregation? | Phase 2 research | `GAP-D-004` |
| How does individual understanding contribute to a permission-aware shared model? | Phase 2 research | `GAP-B-012`–`GAP-B-014`, `GAP-C-004` |
| How can restricted Evidence affect a shared projection without leaking meaning? | Phase 2 research | `GAP-B-014`, `GAP-C-004` |
| How is expected Evidence value estimated and compared? | Phase 2 research | `GAP-D-003`; Expected Understanding Gain remains current reference |
| What benchmark threshold qualifies a material update as an Insight? | Phase 2 research | `GAP-A-015` |
| How do Decision Outcomes bind to explanations and mechanisms? | Pre-Phase 2 implementation | `GAP-A-012`–`GAP-A-014` |
| When may one Recommendation lineage apply across multiple Questions? | Later product design | `GAP-A-011`, `GAP-B-005` |
| What operational cadence and volatility policy governs freshness? | Later product design | `GAP-B-004`, `GAP-B-005`, `GAP-C-012` |
| Should autonomous Evidence acquisition ever be permitted? | Deferred | `GAP-D-002` |
