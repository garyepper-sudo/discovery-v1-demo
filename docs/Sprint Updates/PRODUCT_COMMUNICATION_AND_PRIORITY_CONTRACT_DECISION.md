# Product Communication and Priority Contract Decision

**Status:** Architecture decision complete; first bounded implementation
validated as an inactive shadow

**Decision:** Projection-first bounded hybrid with separate upstream cognitive
priority, deterministic communication priority, and source-grounded narrative
synthesis

## Repository state

- Branch: `sprint-79-organization-experience`
- HEAD: `24c90a48099de2b7088d4832b6bc2219fd2528bf`
- HEAD subject: `Canonize Discovery projection foundation`
- Parent milestone:
  `e39be469bfbb02bf846546c515606d33110e5403`
- Later commits at sprint start: none
- Working tree at sprint start: clean
- Projection Foundation: present and canonical

This is a documentation-only decision. No production code, Runtime, schema,
cognition, authority, disclosure, persistence, route, UI, benchmark result, or
DEPS report changed.

## Subsequent implementation

The separately authorized structured Product Communication shadow now
implements this decision's first contract. It consumes only the disclosed
projection and explicit upstream priority signals, applies a versioned
`organization` communication policy, preserves priority provenance,
uncertainty, and alternatives, and passes through exact authorized source
fields. The focused gate passes `60/60`.

It does not implement narrative synthesis, disclosure production, Runtime
access, persistence, product activation, or UI change. See
`STRUCTURED_PRODUCT_COMMUNICATION_CONTRACT_SHADOW.md`.

The next inactive boundary is also validated: a pure Your Organization
communication adapter maps the plan into a source-preserving candidate view
and passes `69/69`. It adds no narrative or active product behavior. See
`YOUR_ORGANIZATION_PRODUCT_COMMUNICATION_ADAPTER.md`.

## Decision summary

Discovery needs three distinct responsibilities:

1. upstream cognitive or application priority;
2. communication priority for one consumer and experience;
3. narrative synthesis.

They must not be collapsed into projection, UI, or one undocumented
`chooseTopInsight()` helper.

The required input boundary is:

```text
Disclosure-enforced Organizational Understanding Projection
        +
Optional separately authorized application-cognition envelope
        +
Explicit upstream priority signals
        ↓
Deterministic Product Communication Policy
        ↓
Structured Communication Plan
        ↓
Source-grounded Narrative Synthesis
        ↓
Product Communication Contract
        ↓
Experience view model
        ↓
UI
```

Communication must not traverse Runtime or canonical stores directly. The
shared projection is the required organizational-understanding input because
it already owns disclosure enforcement, reference resolution, availability,
normalization, and trace closure. Optional application cognition is permitted
only through an explicit typed envelope that retains its own owner, authority,
disclosure result, objective, references, and availability.

## Current communication inventory

| Producer | Inputs and output | Status and implied owner | Priority behavior | Disclosure and uncertainty | Reuse decision |
| --- | --- | --- | --- | --- | --- |
| `synthesizeExecutiveCommunication()` in `engine/v3/communication/synthesizeExecutiveCommunication.ts` | `ExecutiveCommunicationSource` → persisted-style `ExecutiveCommunication` with headline, summary, signals, changes, forecast, recommendation, uncertainty, and evidence sections | Production; Executive Communication | Renders assessment, recommendation, first investigation, and source ordering; also assigns confidence labels | Not consumer-disclosure-aware; receives broad Runtime cognition; uncertainty is investigation-centered | Adapt design principles only; do not generalize its contract |
| `synthesizeExecutiveNarrative()` | Executive assessment, recommendation, Conditions, State, learning, simulation, and compatibility projection → deterministic executive narrative | Production; Executive Communication | Treats first Condition and first investigation as primary; hard-coded domain headlines and summaries | No disclosure result; default confidence and hard-coded implications can exceed a universal source-preserving contract | Replace for shared use; retain for executive application |
| `buildExecutiveStory()` | Broad `ExecutiveCommunicationSource` → executive constraint, strategy, recommendation, confidence, and next-Evidence story | Production; Executive Communication | Consumes primary constraint and ranked scenarios supplied by executive cognition | No consumer disclosure contract; strongly executive and recommendation oriented | Retain as executive-specific extension |
| `runExecutiveCommunicationOperatingSystem()` | Runtime executive cognition → communication → Runtime memory | Production; Executive Communication OS | No independent ranking claim, but assumes ordered source objects and persists result | Direct Runtime assembly; no consumer identity or disclosure decision | Unsuitable as universal product communication boundary |
| `buildExecutivePriority()` | Judgments, Mechanisms, Concepts, Conditions, State, investigations → ranked executive bundle | Production; Executive Assessment/application cognition | Explicit weighted ranking across several domains and selects strongest/primary/highest-value objects | Not disclosure-aware; executive objective; contains cognition | Reuse only within Executive Assessment, never as universal priority |
| `rankOrganizationalCondition()` | Condition strength, confidence, priority, status, trend, support breadth → significance score | Production; Organizational Conditions | Explicit objective: greatest organizational significance | Upstream cognition, not consumer-aware | Valid upstream cognitive-priority owner for Conditions |
| `buildPrimaryExecutiveJudgment()` | Organizational State and Conditions → primary executive judgment, headline, rationale, uncertainty | Production; Executive Assessment | Resolves dominant/highest-risk Condition and creates executive language | Executive-specific and not disclosure-aware | Valid executive application cognition; not shared communication |
| `buildExecutiveRecommendation()` and decision recommendation producers | Assessment, constraints, interventions, scenarios → recommended executive action | Production; recommendation/decision application | Objective-specific action ranking and recommendation | Application-owned; disclosure is not enforced at product boundary | Optional authorized application source for Decisions/Executive Communication |
| `buildInvestigationOpportunities()` | Condition uncertainty, learning profile, prior investigations → ranked opportunities and questions | Production; Investigation Opportunities | Explicit information-gain/executive-leverage objective | Canonical question text but not consumer-disclosure-aware | Valid upstream inquiry-priority owner after projection closure |
| `buildPredictionReflection()` | Predictions and evaluations → primary prediction and narrative | Production; Prediction Reflection | Explicit confidence, likelihood, severity, maturity, and executive-relevance ranking | Executive framing; not application disclosure-aware | Keep prediction-specific |
| `buildOrganizationExperienceView()` | Arbitrary Runtime probing across compatibility Understanding, assessment, communication, State, Conditions, beliefs, investigations, and recommendations | Active compatibility product adapter | First available prose wins; first Condition/investigation and fallback order hide priority policy | No disclosure decision; may mix canonical, compatibility, and application meaning | Retire only after governed replacement is activated |
| `buildRuntimeOrganizationView()` | Runtime canonical and adjacent records → nine prose-first sections | Active Phase 8A Runtime-details adapter | First composition and array position imply primary/top | No disclosure enforcement; explicit missing states | Retain as rollback until activation |
| `buildUnifiedExecutiveWorkspaceView()` | Organization and Runtime section views → top insight, implication, model links | Active product composition | Array order and `.slice(0, 3)` select top insights; indexes assign implications and active areas | No disclosure decision; UI-facing composition hides semantic selection | Replace semantic selection upstream; retain UI composition only |
| `buildExecutiveState()` / `buildExecutiveDashboard()` | Executive cognition → attention, hero, key insights, timelines | Production executive projection | Index-based importance/priority and upstream attention priority | Executive-specific; no shared disclosure result | Keep inside executive application |
| `buildBriefExperienceView()` | Runtime Executive Communication and decisions → brief source strings | Active product compatibility | First communication/decision string wins | No consumer disclosure decision | Replace later with Communication experience extension |
| Executive Communication experiments 001/002 and Runtime-backed language 001 | Fixed or persisted Executive Communication sources → readability, duplication, meaning, confidence, uncertainty, determinism checks | Benchmark | Tests supplied executive priority; does not validate shared priority ownership | No consumer-disclosure non-leakage or unresolved-Explanation protocol | Reuse selected readability and determinism gates; extend substantially |
| Projection and compatibility validators | Disclosed projection → structured, unavailable, and compatibility output | Production-shadow validation | Prohibit ranking and prose | Strong fail-closed disclosure and uncertainty checks | Required baseline for the new communication benchmark |

### Hidden priority currently found

Current product behavior contains several undocumented selection mechanisms:

- first canonical composition;
- first Explanation or first readable string;
- first Condition;
- first investigation;
- fallback order across compatibility Understanding, Executive Assessment,
  Executive Communication, constraint, and State;
- `.slice()` limits after source-array order;
- index-derived insight importance and active model areas.

These are acceptable historical compatibility behavior but are not a valid
Product Communication and Priority Contract.

### Current ownership gaps

- No production owner ranks canonical Organizational Understanding
  compositions or completed Explanations for general organizational
  importance.
- No consumer-specific communication policy records why a disclosed item is
  the lead.
- No shared non-executive narrative contract preserves source-claim
  traceability.
- Existing Executive Communication is not consumer-disclosure-aware.
- The active product path can combine canonical, compatibility, and executive
  prose without exposing semantic ownership.

## Problem decomposition

### 1. Cognitive priority

Cognitive priority asserts significance relative to an explicit objective.
Examples are organizational Condition significance, expected information gain,
decision utility, executive action leverage, or prediction risk.

It is cognition or application cognition. Its owner is the producer responsible
for the named objective:

- Condition significance → Organizational Conditions;
- information gain → Investigation Opportunities;
- executive action leverage → Executive Assessment/Recommendation;
- decision relevance → Decision application cognition;
- research relevance → Research application cognition;
- prediction risk → Prediction Reflection.

There is no universal cognitive-priority owner. Canonical Organizational
Understanding must not acquire a generic `priority` merely to serve a page.
Canonical composition or Explanation priority remains unavailable until a
separately authorized producer defines its objective and benchmark.

### 2. Communication priority

Communication priority answers: “Given disclosed eligible subjects and this
experience, which valid subject is shown first?”

It is owned by a deterministic, versioned Product Communication Policy. It may
use:

- explicit upstream cognitive-priority signals;
- singleton subject availability;
- disclosed material-change signals;
- explicit uncertainty or investigation signals;
- experience-required slots;
- audience relevance expressed as non-truth-changing context.

It may not claim organizational importance when only presentation relevance is
known. Its output says `lead-for-experience`, not `most-important-in-reality`.

### 3. Narrative synthesis

Narrative synthesis turns the selected disclosed sources into readable
language. Product Communication owns this representation. It may:

- quote or pass through authorized readable source text;
- compress and paraphrase disclosed claims;
- sequence supported claims;
- explain source-owned implications;
- state explicit uncertainty and unresolved alternatives;
- adapt terminology, length, depth, and sequencing.

It may not create causal claims, confidence, ranking, recommendations,
urgency, consensus, or certainty.

## Input-boundary decision

### Selected architecture: Option C, bounded by projection-first dependency

Communication requires `OrganizationalUnderstandingProjection` as its shared
base and may receive explicit application cognition through separate typed
extensions.

It does not consume canonical cognition directly.

Rationale:

- projection already enforces disclosure, identity, revision, availability,
  normalization, and reference closure;
- direct canonical access would duplicate projection and disclosure logic;
- the shared projection remains presentation-neutral and need not expand for
  narrative convenience;
- Decisions, Research, inquiry, forecasts, and recommendations have valid
  application semantics that do not belong in universal Understanding;
- typed application extensions avoid forcing executive semantics onto every
  experience;
- one communication foundation can enforce truth and disclosure rules without
  becoming one universal narrative object.

Every application extension must be independently disclosure-qualified. A
projection-safe Understanding does not make unrelated application cognition
safe.

## Ownership matrix

| Concern | Owner | Rule |
| --- | --- | --- |
| Organizational truth | Canonical Organizational Understanding and its referenced canonical objects | Communication never revises it |
| Explanation claims and alternatives | Completed Explanations | Narrative preserves claims, viability, and unresolved competition |
| Cognitive priority | Named cognitive/application producer with explicit objective | No universal ranking |
| Communication priority | Versioned Product Communication Policy | Presentation relevance only; provenance required |
| Narrative | Product Communication synthesis | Source-grounded representation, not truth |
| Audience adaptation | Product Communication synthesis using ephemeral context | May change terminology, depth, length, sequencing only |
| Section order and visual prominence | UI composition | May render supplied communication roles; cannot infer semantic lead |
| Truncation and expansion | UI | Must not change meaning or hide required uncertainty |
| Interaction affordances | Experience/UI | Routes and controls only; action recommendation remains application-owned |
| Disclosure | Existing disclosure contract and future decision producer | Communication consumes already-enforced inputs and independently qualified extensions |
| Persistence | None for the first contract | Communication is ephemeral and revision-addressed |

### Priority ownership details

| Priority form | Owner/status |
| --- | --- |
| Explanatory centrality | Missing for canonical compositions/Explanations; do not infer |
| Organizational Condition significance | `rankOrganizationalCondition()` / Organizational Conditions |
| Urgency | Domain producer only when explicit; otherwise unavailable |
| Decision relevance | Decision application cognition |
| Information gain | Investigation Opportunities |
| Uncertainty magnitude | Organizational Uncertainty, not communication |
| Recency | Communication policy may use disclosed timestamps only as presentation relevance |
| User relevance | Communication policy from ephemeral context; never organizational truth |
| Communication lead | Product Communication Policy |
| Section order | UI |
| Visual prominence | UI rendering of supplied communication role |

## Minimum reusable contracts

### CommunicationContext

```ts
type CommunicationContext = {
  organizationId: string;
  consumerId: string;
  experience:
    | "organization"
    | "inquiry"
    | "research"
    | "decisions"
    | "communication";
  audience?: {
    role?: string;
    scopeIds?: string[];
    familiarity?: "new" | "developing" | "experienced";
  };
  generatedAt: string;
  contractVersion: string;
};
```

`role`, scope, and familiarity are optional, ephemeral presentation inputs.
They are not persisted as organizational truth. `organizationId`,
`consumerId`, experience, explicit time, and contract version are required for
isolation and reproducibility.

### CommunicationSource

```ts
type CommunicationSource = {
  context: CommunicationContext;
  understanding: OrganizationalUnderstandingProjection;
  application?: {
    owner:
      | "inquiry"
      | "research"
      | "decisions"
      | "executive-communication";
    objective: string;
    disclosureDecisionId: string;
    sourceRevisionIds: string[];
    subjects: AuthorizedApplicationSubject[];
    availability: CommunicationAvailability;
  };
  priorities: UpstreamPrioritySignal[];
};
```

The builder verifies exact organization, consumer, revision, and disclosure
identity across all inputs. An application extension cannot refill a withheld
or revoked Understanding area.

### UpstreamPrioritySignal

```ts
type UpstreamPrioritySignal = {
  id: string;
  subjectRef: CanonicalObjectReference;
  owner:
    | "organizational-conditions"
    | "investigation-opportunities"
    | "executive-assessment"
    | "research"
    | "decisions"
    | "prediction-reflection";
  objective:
    | "organizational-significance"
    | "information-gain"
    | "executive-action"
    | "research-relevance"
    | "decision-relevance"
    | "prediction-risk";
  priorityClass: "high" | "medium" | "low";
  basisRefs: CanonicalObjectReference[];
  uncertaintyRefs: CanonicalObjectReference[];
  producerVersion: string;
};
```

The first sprint must consume signals; it must not calculate them. A subject
without a signal may still fill a required slot or become a singleton lead,
but cannot be described as most important.

### CommunicationPriority

```ts
type CommunicationPriority = {
  subjectRef: CanonicalObjectReference;
  role: "lead" | "support" | "background";
  meaning: "lead-for-experience";
  basis:
    | {
        kind: "upstream-priority";
        signalId: string;
        objective: UpstreamPrioritySignal["objective"];
      }
    | {
        kind:
          | "only-available-subject"
          | "material-change"
          | "unresolved-uncertainty"
          | "investigation-opportunity"
          | "required-experience-slot";
        policyId: string;
      };
};
```

`withheld` is not a priority class because withheld subjects must not enter the
candidate set. The policy emits only disclosed references. The policy is pure,
deterministic, versioned, stable under input reversal, and explicit when it
cannot identify a lead.

### CommunicationPlan

```ts
type CommunicationPlan = {
  id: string;
  organizationId: string;
  consumerId: string;
  experience: CommunicationContext["experience"];
  projectionId: string;
  disclosureDecisionIds: string[];
  sourceRevisionIds: string[];
  priorityPolicyVersion: string;
  priorities: CommunicationPriority[];
  slots: Array<{
    kind:
      | "understanding"
      | "why-it-matters"
      | "change"
      | "uncertainty"
      | "next-inquiry"
      | "support";
    subjectRefs: CanonicalObjectReference[];
    sourceText?: string;
    availability: CommunicationAvailability;
  }>;
};
```

The plan is the deterministic boundary tested before prose. It carries no
new claim.

### OrganizationalUnderstandingCommunication

```ts
type OrganizationalUnderstandingCommunication = {
  id: string;
  planId: string;
  organizationId: string;
  consumerId: string;
  headline?: TracedNarrative;
  conciseExplanation?: TracedNarrative;
  whyItMatters?: TracedNarrative;
  whatChanged?: TracedNarrative;
  remainingUncertainty: Array<{
    statement: TracedNarrative;
    kind:
      | "unresolved-alternative"
      | "missing-evidence"
      | "explanation-uncertainty"
      | "historical-uncertainty";
    alternativeRefs: CanonicalObjectReference[];
  }>;
  nextInquiry?: {
    question: TracedNarrative;
    investigationRef: CanonicalObjectReference;
  };
  priority: CommunicationPriority[];
  availability: CommunicationAvailability[];
  disclosureDecisionIds: string[];
  sourceRevisionIds: string[];
  synthesis: {
    mode: "source-pass-through" | "deterministic-template" | "model-assisted";
    producerVersion: string;
    modelVersion?: string;
  };
};

type TracedNarrative = {
  text: string;
  claimType:
    | "source-quotation"
    | "source-paraphrase"
    | "source-compression"
    | "uncertainty-statement";
  sourceRefs: CanonicalObjectReference[];
};
```

Recommendations and actions do not belong in this shared object. A
`nextInquiry` is permitted only when it points to an existing disclosed
Investigation Opportunity. Decision or executive actions remain in their
application contracts.

## Narrative truth rules

### Source fidelity

Every factual or explanatory sentence carries source references. All source
references must exist in the communication plan and disclosed projection or
authorized application envelope.

### No hidden inference

Synthesis may pass through, compress, paraphrase, combine, and sequence valid
source claims. It may not add:

- causal claims;
- confidence;
- ranking;
- recommendations;
- urgency;
- certainty;
- consensus;
- materiality.

### Uncertainty and alternatives

- `unresolved-alternatives` must never become a selected Explanation.
- Every lead that has unresolved alternatives must include an uncertainty
  slot.
- Alternative references include disclosed alternatives only.
- Missing Evidence and unavailable Evidence bodies are distinct.
- Historical uncertainty is not rewritten as current certainty.
- If uncertainty cannot be expressed safely, the related narrative is
  unavailable.

### Priority provenance

Every lead must identify either an upstream priority signal or the exact
communication-policy rule. “Top,” “primary,” “most important,” “highest
leverage,” and equivalent semantic language require an upstream signal whose
objective supports that meaning. Communication-only lead selection may say
“first” or render first, but may not claim organizational importance.

### Disclosure safety

- Withheld and revoked subjects never reach policy or synthesis.
- Narrative exposes no withheld identities, counts, reasons, relationships,
  supporting context, or alternative-set size.
- Application extensions require their own disclosure identity.
- A revoked or mismatched source invalidates the whole dependent narrative.
- Narrative cannot reconstruct protected content from support references.

### Audience adaptation

May change terminology, length, depth, examples already present in disclosed
sources, and sequencing.

May not change truth, uncertainty, provenance, authority, conclusions,
priority objectives, or recommendation ownership.

### Reproducibility and model use

The first implementation must be deterministic and must not use an LLM.

The architecture may later permit model-assisted synthesis only after the
structured plan and deterministic source-pass-through baseline pass. A future
model mode must use:

- the exact disclosed Communication Plan as its entire semantic envelope;
- schema-constrained structured output;
- sentence-level source references;
- temperature `0` or the provider's strongest deterministic posture;
- recorded provider, model version, prompt/contract version, and source
  revisions;
- unsupported-claim detection and rejection;
- bounded retries;
- fail-closed fallback to deterministic source pass-through or unavailable;
- latency and cost budgets;
- organization and consumer isolation.

Generated prose is not persisted in Organization Runtime and never becomes
canonical truth. If future product caching is authorized, it must be an
ephemeral application artifact keyed by consumer, projection ID, disclosure
decision, revisions, contract version, and model version, with revocation and
revision invalidation.

## Your Organization minimum contract

| Product need | Current source | First-contract disposition |
| --- | --- | --- |
| One bold Understanding | Composition and Explanation refs exist; readable canonical Explanation title does not | Optional source text only; lead allowed for singleton or explicit upstream signal; otherwise unavailable |
| Why it matters | Condition `whyItMatters`, State implication, or authorized application source may be readable | Pass through only when trace reaches the lead; no newly inferred implication |
| What changed | Evolution references exist; readable canonical evolution is incomplete | Structured change reference and unavailable narrative unless source text exists |
| What remains uncertain | Composition disposition, Explanation uncertainty, linked Organizational Uncertainty | Required and available where disclosed text exists; unresolved alternatives always explicit |
| Next useful inquiry | Disclosed Investigation Opportunity question | Available only through exact investigation reference |
| Supporting reasoning | Explanation, Evidence-role, ancestry, Condition, and State references | Structured progressive disclosure; Evidence bodies remain unavailable |

The smallest honest first output is:

1. a deterministic Communication Plan;
2. an optional source-grounded headline with explicit priority provenance;
3. required remaining uncertainty;
4. an optional exact next inquiry;
5. supporting canonical references and availability.

`whyItMatters` and `whatChanged` remain optional. No recommendation, scalar
confidence, Evidence body, or fabricated Explanation summary is added.

## Cross-experience architecture

### Shared primitives

- `CommunicationContext`;
- `CommunicationSource`;
- `UpstreamPrioritySignal`;
- `CommunicationPriority`;
- `CommunicationPlan`;
- `TracedNarrative`;
- disclosure and availability states;
- source/revision/provenance bundles;
- narrative truth validation.

### Experience extensions

| Experience | Shared base | Extension owner |
| --- | --- | --- |
| Your Organization | Broad Understanding, uncertainty, change, inquiry | No application extension required for the first shadow |
| Think / Ask | Understanding, alternatives, uncertainty, question context | Inquiry owns response strategy and conversational interpretation |
| Research | Uncertainty, Evidence gaps, contradictions, investigations | Research owns relevance and investigation conclusions |
| Decisions | Organizational context | Decision cognition owns option ranking and recommendations |
| Communication | Governed Understanding and application outputs | Communication experience owns artifact purpose, audience, and format |
| Executive Communication | Shared truth rules where compatible | Existing Executive Communication retains executive assessment, recommendation, forecast, and action semantics |

Do not generalize executive forecasts, leadership recommendations, Board
language, or executive confidence into the shared contract.

## Candidate comparison

| Candidate | Architecture | User value | Governance/trace | Determinism and scope | Decision |
| --- | --- | --- | --- | --- | --- |
| 1. Template-based Organization Communication | Risks encoding domain inference and priority inside templates | Potentially readable quickly | Weak unless every phrase is source-typed; current structured Explanation lacks labels needed for honest prose | Deterministic but brittle and semantically expansive | Wait |
| 2. Structured communication contract with no prose generation | Cleanly separates priority, plan, synthesis, and UI | Modest immediate value; establishes safe slots and pass-through readability | Strongest first boundary; explicit provenance, uncertainty, disclosure, and abstention | Smallest reversible shadow | **Selected** |
| 3. LLM-assisted grounded synthesis | Fits only after a validated structured envelope exists | Highest eventual readability | Requires unsupported-claim detection, model observability, cost/latency, and disclosure-safe failure | Non-zero variation and larger test surface | Later controlled treatment |
| 4. Reuse/generalize Executive Communication | Reuses substantial production code but imports executive recommendation and forecast semantics | Good for executives, inconsistent for broader users | Direct Runtime assembly and missing consumer disclosure make it unsafe universally | Large semantic migration | Retain as application extension |
| 5. Product-safe priority cognition first | Could supply meaningful “top” semantics | High if objective is correct | Requires a new cognitive objective and owner not yet justified for compositions | Larger cognition/benchmark sprint | Wait; consume existing priority signals first |
| 6. Keep Phase 8A prose and activate structural sections | Preserves hidden fallback and source-order policy | Superficial parity | Does not fix disclosure, ownership, or narrative provenance | Easy but entrenches compatibility debt | Reject |

Candidate 2 wins because it proves the ownership and trace boundary before
language generation, does not require new cognition, and creates the exact
source envelope a later deterministic-template or model-assisted treatment
would need. It may pass through existing readable source text but must not
generate new prose in its first sprint.

## Benchmark plan

The first implementation is benchmark-only and compares:

1. structured projection without communication planning;
2. current Phase 8A experience;
3. candidate structured Communication Plan and source-pass-through contract;
4. negative control that selects by array order and overcompresses unresolved
   alternatives.

### Local Understanding Utility

- **Understanding Gain:** correct identification of the supported Understanding,
  alternatives, and source ownership.
- **Action Utility:** correct selection of the existing next inquiry without
  inventing an action.
- **Cognitive Load Reduction:** fewer objects/words required for the same
  comprehension while mandatory uncertainty remains visible.
- **Continuity:** correct recognition of changed versus unavailable historical
  meaning.
- **Trust Calibration:** correct interpretation of uncertainty, alternatives,
  missing Evidence, provenance, and abstention.

### Required gates

- 100% narrative/source-claim traceability;
- zero unsupported factual, causal, priority, confidence, or recommendation
  assertions;
- 100% preservation of unresolved-alternative disposition;
- zero disclosure leakage, including identities and counts;
- byte-stable structured output;
- input-order and reversal stability;
- organization and consumer isolation;
- exact revision and decision identity;
- correct withheld, revoked, mismatch, invalid-authority, missing-reference,
  empty, Runtime-unavailable, and communication-unavailable states;
- active route unchanged;
- Runtime non-mutation and no persistence;
- current projection `30/30`, compatibility `43/43`, Organization Experience
  `24/24`, disclosure `14/14`, and ownership `14/14` regressions remain green.

For benchmark fixtures with independently specified user tasks, candidate
performance must:

- improve or preserve every Local Understanding Utility dimension against the
  structured-projection baseline;
- improve at least Understanding Gain, Cognitive Load Reduction, and Trust
  Calibration over the negative control;
- introduce no regression against Phase 8A in source-grounded task accuracy;
- produce no false confidence increase.

Architecture success is Classification A only if every hard gate passes and
the structured contract is activation-ready except for prose and the real
disclosure producer. Classification B applies if the contract is valid but
needs bounded source or view-model refinement. Any disclosure leak,
unsupported semantic claim, hidden priority, or uncertainty loss is
Classification C.

No User Intelligence improvement may be claimed from this benchmark alone.

## Activation sequence

The required sequence is:

```text
Structured Product Communication and Priority Contract shadow
        ↓
Source-pass-through communication shadow and benchmark
        ↓
Optional separately authorized grounded narrative treatment
        ↓
Real disclosure-decision producer
        ↓
End-to-end revocation and browser validation
        ↓
Route activation decision
```

The communication shadow should precede disclosure-producer implementation.
It can use the existing authorized shadow disclosure input and reveal the
minimum exact decision interface without prematurely designing broader
Governance. No production route may activate before the real producer exists.

## Deferred work

- production disclosure-decision producer and durable history;
- route activation;
- LLM-assisted synthesis;
- persisted or cached prose;
- universal canonical Understanding or Explanation priority;
- canonical Explanation headline/summary fields;
- Evidence body retrieval or persistence;
- readable Theory evolution;
- recommendation and action synthesis;
- Runtime-backed Think/Ask, Research, Decisions, or Communication migrations;
- Phase 6 and broader Governance;
- real-user User Intelligence claims.

## Exact next implementation sprint

**Structured Product Communication Contract Shadow — Priority Provenance and
Source-Pass-Through**

Implement a pure, deterministic, non-persistent shadow that accepts an
`OrganizationalUnderstandingProjection`, explicit `CommunicationContext`, and
optional precomputed upstream priority signals; emits a versioned
`CommunicationPlan` plus source-pass-through
`OrganizationalUnderstandingCommunication`; preserves disclosure,
availability, uncertainty, unresolved alternatives, canonical references, and
priority provenance; performs no Runtime traversal, cognitive ranking, prose
generation, recommendation, confidence calculation, UI activation, or
persistence; and compares against Phase 8A and the inactive compatibility
adapter under the benchmark plan above.

This decision does not authorize implementation automatically.
