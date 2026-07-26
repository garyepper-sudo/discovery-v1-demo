# Your Organization Product Communication Adapter

**Status:** Validated inactive shadow

**Classification:** A — Your Organization Communication Adapter Demonstrated

## Purpose and inherited state

This sprint adds the thinnest product boundary after the validated structured
Product Communication Plan:

```text
disclosed Organizational Understanding Projection
→ Product Communication Plan
→ Your Organization communication adapter
→ inactive candidate view
```

The baseline is branch `sprint-79-organization-experience` at
`24c90a48099de2b7088d4832b6bc2219fd2528bf`, with no later commits. The
inherited Product Communication decision, compiler, benchmark, DEPS, and
documentation package remains unstaged and is preserved.

The adapter takes only `ProductCommunicationPlan`. It cannot traverse Runtime
or projection, evaluate disclosure, execute policy, calculate priority,
synthesize text, calculate confidence, recommend action, persist, read a
clock, or mutate its input.

## Product field inventory

| Product field | Current Phase 8A source and behavior | Candidate disposition | Ownership |
| --- | --- | --- | --- |
| Top insight / lead | First readable canonical composition Explanation, then fallback chains; `.slice(0, 3)` later assigns product importance | A — direct plan lead reference and provenance | Communication Plan |
| Headline | First readable Understanding, Assessment, Communication, constraint, or State prose; compacted | A when exact lead source text exists; C otherwise | Source owner, then communication |
| Summary / explanation | Compatibility, executive, and State prose fallbacks | D — narrative synthesis required | Future Product Communication |
| Why it matters | Compatibility Understanding, Executive Communication, Assessment, constraint, or State implication | D; some application meaning also requires a separately authorized envelope | Future communication/application cognition |
| Supporting Explanations | First composition membership and readable Explanation strings | A references; C readable Explanation text | Canonical Explanation / plan |
| Uncertainty | Explanation and Organizational Uncertainty strings; limited to four | A exact plan statements and references | Communication Plan |
| Alternatives | Product-generated action labels, not competing Explanations | A structural unresolved Explanation groups; H legacy action labels excluded | Communication Plan |
| Condition context | Condition name/title/summary, first four | A references and exact lead summary; B candidate shape differs | Conditions / plan |
| Investigation question | First Investigation Opportunity question or topic | A exact questions; no first-item selection in adapter | Investigation Opportunities / plan |
| What changed | Latest learning/evolution text, sliced and reversed | A references; C readable change narrative | Evolution / future communication |
| Next action | First investigation, recommendation, or fallback product copy | E — application cognition required | Investigation/decision application |
| Source references | Optional section references in projection compatibility | A exact canonical and supporting references | Projection / plan |
| Evidence roles | Projection metadata only | A exact structured role pass-through after additive plan preservation | Completed Explanation / projection / plan |
| Confidence | Executive or compatibility scalar and label | E; intentionally absent | Cognitive/application owner |
| Availability | Boolean plus bounded projection states | B; all plan states preserved in candidate metadata | Communication and product adapter |
| Priority | Array order, fallback order, index, and `.slice()` | A explicit provenance and policy identity | Upstream producer / communication policy |
| Section ordering | Fixed component and view-model order | G — UI-only | UI |

All candidate fields remain F — disclosure activation blocked until a real
application disclosure-decision producer supplies current resolved decisions.
Legacy fixture and assessment prose is not copied merely to produce parity.

## Adapter contract and availability

`buildYourOrganizationCommunicationView({ plan })` emits:

- plan, policy, projection, disclosure, revision, organization, and consumer
  identity;
- one optional `lead-understanding`, without universal-importance language;
- an exact source-grounded headline when the lead carries text;
- normalized support, uncertainty, change, and inquiry items;
- unresolved alternative groups;
- comparative Evidence-role metadata;
- all Product Communication availability states;
- an explicit list of unsupported product fields.

The adapter normalizes support and alternative order with canonical identity.
It does not choose the first support, Explanation, alternative, inquiry, or
change. Empty and protected states retain their exact machine-readable
disposition without exposing hidden identities or counts in UI copy.

Unsupported fields remain explicit:

- generated why-it-matters and Explanation summaries;
- recommendations and next actions;
- scalar confidence;
- Evidence bodies;
- readable change, Understanding-evolution, and Theory-evolution narrative.

## Hidden-priority audit

| Active behavior | Hidden policy | Future replacement |
| --- | --- | --- |
| `canonicalCompositions[0]` | First composition becomes primary | Plan lead with upstream provenance or explicit singleton fallback |
| First readable Explanation | Source order becomes headline ownership | Exact plan lead source text; otherwise unavailable |
| `conditions[0]` fallback | First Condition becomes missing-Evidence context | Named Condition-significance signal |
| `investigations[0]` | First inquiry becomes recommended exploration | Plan inquiry inclusion; a singular “best” inquiry still requires upstream information-gain ownership |
| Fallback across Understanding, Assessment, Communication, constraint, State | Availability order silently becomes semantic priority | Separate authorized sources plus explicit communication policy |
| `.slice(0, 3/4)` | Array order becomes product importance | Plan roles first; UI may visually limit without changing meaning |
| Insight index | Index assigns implication and active model areas | Future view composition from explicit roles; not adapter cognition |

The plan can replace most hidden product ordering. A claim that one of several
inquiries is the highest-value next inquiry still requires an upstream
information-gain signal; the adapter deliberately exposes the included inquiry
array without selecting one.

## Semantic comparison

| Area | Result |
| --- | --- |
| Lead identity | More trustworthy through explicit provenance |
| Lead text | Exact parity when Phase 8A uses the same Condition summary |
| Priority provenance | New explicit preservation |
| Explanation membership | Semantic parity through canonical references |
| Condition relationship | Semantic parity with explicit source ownership |
| Uncertainty | More trustworthy; exact text, references, and required inclusion |
| Alternatives | More trustworthy; unresolved competitors remain visible |
| Evidence roles | Exact structured preservation |
| Next inquiry | Exact source-text parity without generation |
| Supporting references | More trustworthy through normalized canonical identity |
| Availability | More precise, backward-inactive candidate metadata |
| Readable change narrative | Intentionally unavailable |
| Recommendation/confidence/next action | Cognitive owner required |
| Fixture and assessment fallbacks | Legacy compatibility excluded |
| Active output | Byte-identical and unchanged |

## Validation and Local Understanding Utility

The focused adapter gate passes `69/69`.

- candidate view SHA-256:
  `29337ed354e6f92293b61dc6e96d0ec164890cb9b27d10fb286035a0a132482b`;
- persisted Runtime SHA-256:
  `ce267f9e34bc60f94d4c1e16e0a153042f5d8a5b1d54ee4633999c17041fc9cc`;
- active-route output SHA-256:
  `e19f81d56beaf1f7672ec9f0950a28ae2b1a9e85c9706fb6692cd5a629a2f156`.

Local Understanding Utility disposition:

- Understanding Gain: positive hypothesis; roles map clearly but no user
  outcome is measured.
- Action Utility: demonstrated benchmark utility; the exact Investigation
  Opportunity question survives.
- Cognitive Load Reduction: positive hypothesis; role structure is proven,
  interpretive effort is not.
- Continuity: demonstrated benchmark utility for change references, not
  readable temporal understanding.
- Trust Calibration: demonstrated benchmark utility through provenance,
  alternatives, abstention, and exact availability.

User Intelligence remains not measured.

## Activation readiness, rollback, and recommendation

Excluding disclosure production, the candidate product contract is technically
sufficient for a minimally readable experience when an authorized Condition
summary exists. It safely abstains otherwise. Narrative synthesis would enrich
the experience but is not required to validate this adapter.

Activation readiness: **A — Disclosure producer only**.

Rollback is adapter-local: remove the adapter, validator, command, DEPS source
and report, and synchronization. The communication compiler's additive
Evidence-role pass-through may be removed independently. Runtime, schemas,
cognition, projection, active Phase 8A adapters, routes, and UI remain
unchanged.

The next recommended sprint is to **implement a disclosure-decision producer**
through a separately authorized architecture and implementation boundary.
