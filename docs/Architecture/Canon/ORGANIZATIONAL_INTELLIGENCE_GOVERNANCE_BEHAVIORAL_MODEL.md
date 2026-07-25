# Organizational Intelligence Governance Behavioral Model

Status: Canonical conceptual contract — not yet implemented

This document defines the adopted conceptual events, transitions, and
enforcement behavior for Organizational Intelligence Governance. It describes
required future behavior, not current Runtime behavior. Production
implementation requires a separately authorized sprint.

Companion documents:

- `ORGANIZATIONAL_INTELLIGENCE_GOVERNANCE_ARCHITECTURE.md`
- `ORGANIZATIONAL_INTELLIGENCE_GOVERNANCE_OBJECT_MODEL.md`
- `SHARED_ORGANIZATIONAL_INTELLIGENCE.md`

Dependency order:

```text
Governance Architecture
  → Governance Object Model
  → Governance Behavioral Model
```

The Governance Architecture defines ownership and enforcement boundaries. The
Object Model defines conceptual governance records and relationships. This
document defines their events, transitions, and enforcement behavior. None of
the three claims production implementation. All remain subordinate to
applicable security, Runtime, and tenancy contracts in those domains, and none
overrides the Product Canon's product identity or philosophy.

## Decision

Organizational Intelligence Governance behaves as a deterministic control
plane with:

- append-only authoritative lifecycle and decision events;
- versioned, materialized current-state projections for operational lookup;
- immutable policy versions and governance decisions;
- time-bounded authorization evaluated at every enforcement operation;
- distributed enforcement at contribution, retrieval, provider, projection,
  and export boundaries;
- governance lineage distinct from cognitive lineage;
- fail-closed behavior for unresolved security-sensitive state.

This hybrid persistence behavior is the minimum model that supports fast current
authorization, historical reconstruction, revocation, and decision
reproducibility. It is a conceptual recommendation only. No store, event log,
contract, or enforcement behavior is implemented by this document.

## Behavioral vocabulary

The model distinguishes:

- **command**: a requested governance change or operation;
- **event**: an immutable fact that a command was resolved or enforced;
- **current-state projection**: a rebuildable view of effective governance
  state;
- **decision request**: normalized inputs to policy evaluation;
- **decision**: immutable policy result for one request fingerprint;
- **enforcement**: boundary application of a decision;
- **disclosure**: content or inferential signal actually made available;
- **historical reconstruction**: replay of authoritative governance events to a
  stated time and version set.

An allow decision is not itself disclosure. Disclosure occurs only after
successful enforcement.

## Universal governance lifecycle

```text
Contribution proposed
        ↓
Principal + organization + context resolved
        ↓
Purpose asserted and validated
        ↓
Stable governance subject assigned
        ↓
Sensitivity classified
        ↓
Effective immutable policy versions selected
        ↓
Governance decision resolved
        ↓
Contribution admitted / transformed / quarantined / denied
        ↓
Authorized intelligence enters existing cognition
        ↓
Derived subject + governance lineage recorded
        ↓
Retrieval requested and re-evaluated
        ↓
Provider inclusion separately evaluated
        ↓
Projection disclosure separately evaluated
        ↓
Actual disclosure recorded
        ↓
Membership, sensitivity, subject, or policy changes
        ↓
Future access and reuse receive new decisions
```

### Lifecycle stage contract

| Stage | Initiating event | Owner | Required inputs | Result | Invariants | Failure and audit |
| --- | --- | --- | --- | --- | --- | --- |
| Propose contribution | Application receives contribution command | Contribution boundary | authenticated session, organization, claimed context, content reference | pending request | no cognitive influence yet | missing input stops and audits rejection where safe |
| Resolve principal/context | Resolution requested | Identity provider plus Governance | authenticated subject, organization, context reference, evaluation time | stable principal and active context references | seniority grants nothing implicitly | unresolved identity/context denies |
| Establish purpose | Purpose declared | Requesting application; Governance validates | purpose ID, operation, membership, context | validated purpose basis | purpose cannot change mid-decision | absent/invalid purpose denies and audits |
| Assign subject identity | Registration requested | Governance subject registry | canonical object reference, idempotency key, context | stable subject reference | retry and input order preserve identity | identity collision quarantines |
| Classify sensitivity | Classification requested | Governance classification authority | subject, source assertions, lineage, policy | effective versioned profile | unclassified cannot receive raw disclosure | incomplete classification quarantines or denies |
| Select policy | Decision requested | Governance policy resolver | organization, context graph, purpose, operation, time | ordered immutable policy versions | no mutable active policy | missing/conflict denies and requires review |
| Evaluate contribution | Decision requested | Governance decision service | complete normalized request | immutable decision | deterministic for identical versioned inputs | decision and reason codes audited |
| Enforce admission | Decision resolved | Contribution boundary | decision, subject, proposed content | admitted, controlled transformation, quarantine, or denial | only admitted representation reaches cognition | enforcement failure stops; successful result audited |
| Derive intelligence | Existing cognitive pipeline executes | Cognition | authorized admitted inputs | existing cognitive object | cognition interprets truth, never permission | normal cognitive behavior; governance does not rewrite semantics |
| Preserve lineage | Derivation completed | Governance lineage recorder | stable output reference, governed input references, transformations | derived subject and lineage event | duplicate paths deduplicated | broken lineage blocks future governed use |
| Evaluate retrieval | Retrieval requested | Retrieval boundary plus Governance | current principal, membership, purpose, subjects, time | current decision and bounded set | re-evaluation uses current state | denied subjects produce no unauthorized side signal |
| Evaluate provider | Provider request composed | Provider boundary plus Governance | approved candidates, provider destination, purpose | approved bounded provider input | provider sees only approved representation | inclusion failure stops provider call |
| Evaluate projection | Projection requested | Projection boundary plus Governance | current decision inputs, requested mode | permitted representation | projection never changes Runtime truth | stale/failed transformation denies |
| Record disclosure | Representation delivered | Boundary plus Governance audit | enforced decision, actual mode, subject refs, audience | immutable disclosure event | decision and actual disclosure remain distinct | audit failure prevents security-sensitive disclosure |
| Re-evaluate after change | Lifecycle/policy event | Governance | new versions and current request | new decision | prior events and truth remain unchanged | caches invalidated; stale decisions rejected |

## Object lifecycles

### PrincipalReference

The identity provider owns whether an identity is authenticated, suspended,
disabled, deleted, or anonymized. Governance owns only the stable reference,
mapping state, and its historical resolvability.

```text
unresolved → resolved → active-reference
                         ├──→ suspended-reference ──→ active-reference
                         ├──→ disabled-reference
                         └──→ anonymized-historical-reference
```

| Transition | Owner | Trigger | Permitted behavior | Historical representation |
| --- | --- | --- | --- | --- |
| unresolved → resolved | Governance mapping service | authenticated identity first used | issue stable principal ID idempotently | `principal/resolved` event |
| resolved → active-reference | Governance after upstream verification | identity enabled | membership evaluation permitted | current-state projection |
| active → suspended | Identity provider; Governance observes | upstream suspension | deny new use; retain history | suspension event plus upstream reference |
| suspended → active | Identity provider; Governance observes | upstream reinstatement | future requests may evaluate again | new activation event |
| any live → disabled | Identity provider | identity disabled | future access denied | immutable historical reference |
| live/disabled → anonymized historical | privacy authority | approved deletion/anonymization | replace identifying mapping, preserve integrity reference | linked anonymization event |

Governance never stores credentials. A disabled reference cannot be reactivated
by editing governance state contrary to the identity authority. Hard deletion
must not leave audit events falsely attributed to another principal.

### IntelligenceContext

Minimal states:

```text
proposed → active ↔ restricted → suspended → active
              │          │           │
              └──────────┴───────────┴──→ closed → archived
```

`historical` is a query perspective, not a mutable state. Archived contexts
remain reconstructable.

| From | To | Owner and trigger | Rules | Recovery/history |
| --- | --- | --- | --- | --- |
| proposed | active | governance administrator; context approved | identity, organization, initial policy required | activation event |
| active | restricted | governance administrator or emergency policy | only explicitly permitted operations continue | restriction event |
| restricted | active | governance administrator | requires new review event | old restriction retained |
| active/restricted | suspended | governance administrator | no new contribution; explicitly authorized historical access only | may reactivate by new event |
| suspended | active | governance administrator | policy and relationships revalidated | new activation event |
| active/restricted/suspended | closed | governance administrator | no new contributions | cannot silently reopen |
| closed | active | governance administrator | explicit reopen command, new policy validation and event | prior closure remains historical |
| closed | archived | retention authority | read-only reconstruction | no reactivation by mutation |

Contexts are not normally deleted. Approved deletion anonymizes or tombstones
identifying metadata while preserving referential integrity.

Relationships have their own stable identity and validity interval. Adding,
ending, or replacing a relationship is evented. Relationship topology never
grants access. Cycles are permitted only if traversal uses visited-subject and
visited-context sets, bounded depth, deterministic ordering, and explicit
propagation policy; otherwise traversal fails closed.

### ContextMembership

Canonical states:

```text
proposed → pending → active ↔ restricted
                       │          │
                       ├──────────┴──→ suspended → active/restricted
                       └─────────────→ ended

Any non-ended state may be revoked → ended.
Historical is a time-indexed view of prior versions.
```

| Transition | Owner | Trigger event | Timestamp | Recovery and historical rule |
| --- | --- | --- | --- | --- |
| proposed → pending | membership authority | proposal accepted for review | occurred and effective time | reject with reason or activate |
| pending → active | membership authority | requirements satisfied | explicit `validFrom` | retain proposal and activation |
| active → restricted | membership/policy authority | purpose or subject scope reduced | effective time | future decisions use restriction |
| restricted → active | membership authority | new approval | new activation event | never erase restriction interval |
| active/restricted → suspended | identity or membership authority | temporary hold | effective time | future use denied; may reinstate |
| suspended → active/restricted | membership authority | reinstatement approved | new effective time | new state event required |
| any live → ended | membership authority or expiry processor | exit, expiry, transfer, revocation | authoritative end time | cannot mutate back to active |

An ended membership can be followed only by a new membership record or explicit
new activation version, never silent mutation. Transfer between contexts ends
or restricts the old membership and creates a distinct membership in the new
context. Purpose grants are versioned intervals. Context-role labels may aid
administration but never substitute for policy.

### AccessPurpose

Access purpose combines:

- a versioned platform registry of canonical, role-agnostic purposes;
- optional organization-defined sub-purposes mapped to a canonical parent;
- purpose grants within memberships or policy;
- a request-scoped declaration validated for each operation.

```text
draft → validated → active → deprecated → retired
```

The application or actor asserts a purpose; Governance validates that the
purpose is active and granted for the principal, context, operation, and time.
Purpose is immutable within one decision request. A secondary use, changed
purpose, or expanded destination requires a new decision. Purpose misuse is
denied and audited without exposing protected subject existence.

### SensitivityProfile

Each dimension—source sensitivity, claim sensitivity, identity sensitivity, and
aggregation risk—is evaluated separately.

```text
unclassified → provisional → classified → reviewed
                      │             │          │
                      └─────────────┴──────────┴──→ reclassified
                                                       ↓
                                                  superseded
```

Historical is a versioned view. Classification may be manual, deterministic, or
provider-assisted, but an accountable deterministic Governance step resolves
the effective profile. Provider output alone is never authoritative.

Rules:

- unclassified or incomplete subjects fail closed for raw disclosure;
- provisional classification permits only policy-explicit safe handling;
- conflict resolves to the more protective handling until reviewed;
- sensitivity may decrease only through an explicit reviewed reclassification
  with reason, authority, and new immutable version;
- reclassification changes future access and invalidates relevant cached
  decisions;
- previously derived subjects are marked for re-evaluation through lineage;
- prior decisions and disclosures retain their historical profile references.

### GovernancePolicy

```text
draft → validated → published → active → superseded → retired
                                      └──────────────→ emergency-superseded
```

Historical is a query perspective. Published and active policy versions are
immutable.

| Transition | Owner | Preconditions | Prohibited behavior |
| --- | --- | --- | --- |
| draft → validated | policy authority/validator | syntax, references, determinism, conflicts, safety tests pass | self-approval if policy forbids it |
| validated → published | policy authority | immutable version ID and effective interval assigned | changing content after publish |
| published → active | activation authority or scheduled processor | effective time reached; conflicts resolved | activating without validation |
| active → superseded | policy authority | replacement published and activated | mutating active version |
| active → emergency-superseded | emergency policy authority | explicit bounded emergency replacement | unversioned override |
| superseded → retired | retention/policy authority | no current operation may select it | deleting reproduction material |

Policy selection uses explicit scope, specificity, priority, effective time, and
stable tie-breaking. A conflict without a deterministic safe resolution denies
and requires review. Organization overrides may narrow or explicitly alter a
platform default only within platform-defined override bounds. Rollback
publishes a new version whose content may reproduce an older policy; an old
version is never reactivated by mutation.

### GovernanceSubjectReference

The reference has registry lifecycle separate from the protected object's
domain lifecycle:

```text
registered → active → superseded / merged / split / tombstoned
```

- Registration uses a canonical object reference plus idempotency fingerprint.
- Retries and input reorderings return the same subject ID.
- Duplicate detection aliases duplicates to one canonical subject without
  deleting historical references.
- Replacement creates a new subject linked by `supersedes`.
- Merge creates a new canonical reference and explicit predecessor links.
- Split creates new references with explicit ancestor links.
- Subject-type migration creates a new version or replacement; it never
  silently changes interpretation.
- Deletion tombstones or anonymizes the reference according to policy while
  preserving audit integrity.

The reference does not duplicate the content or cognitive contract.

### GovernanceLineage

Lineage is append-only as derivations and disclosures occur:

```text
subject registered
  → contribution ancestry appended
  → derivation ancestry appended
  → context/policy ancestry referenced
  → sanitization or aggregation transformation appended
  → disclosure ancestry appended
```

Immutable:

- stable subject and input references;
- transformations that actually occurred;
- policy/decision references used at the time;
- context transitions and actual disclosure references.

Supersedable:

- current classification association;
- current eligibility summary;
- cached traversal/materialized closure.

Reclassification and revocation append new events and invalidate summaries; they
do not rewrite ancestry. Duplicate derivation edges are normalized by stable
edge identity. Repeated paths do not add corroboration or disclosure authority.

Cognitive lineage explains why organizational meaning was inferred. Governance
lineage explains which protected inputs, contexts, transformations, and prior
disclosures constrain permissible use.

### GovernanceDecision

`requested`, `evaluated`, `recorded`, and `enforced` are events around an
immutable decision, not mutable decision states:

```text
DecisionRequested
       ↓
policy evaluation
       ↓
DecisionResolved (immutable result)
       ↓
DecisionRecorded
       ↓
BoundaryEnforcementAttempted
       ├── EnforcementSucceeded → optional DisclosureRecorded
       └── EnforcementFailed
```

The decision reproduction receipt includes principal, membership version,
context, purpose, subjects and their versions, sensitivity versions, policy
versions, operation, requested disclosure mode, result, reason codes,
evaluation time, cumulative disclosure state reference, and normalized request
fingerprint.

Rules:

- decisions may expire and caches may store them only until the earliest
  relevant expiry;
- cache keys include every normalized input and version;
- membership, purpose, policy, sensitivity, subject, destination, lineage, or
  cumulative-state change requires re-evaluation;
- stale version detection rejects the cached decision;
- enforcement can fail after an allow decision and must be separately audited;
- a decision cannot be amended, widened, or reused for another operation;
- historical decisions remain reproducible but confer no current authority.

### GovernanceAuditEvent

Audit events are immutable, globally unique within an organization governance
domain, and ordered by both authoritative occurrence time and monotonic stream
position. Corrections append linked correction events.

Every event records:

- event ID and family/action;
- occurred time, recorded time, and effective time where different;
- actor or approved system principal;
- organization and relevant contexts;
- governed subjects;
- decision and immutable policy references where applicable;
- enforcement boundary and outcome;
- stable reason codes;
- previous/correlation/causation references;
- integrity and retention metadata.

Audit access is itself purpose-limited, policy-evaluated, and audited. Audit
views may redact identities or subjects, but authoritative events remain
integrity-verifiable. Deletion obligations use approved anonymization,
cryptographic erasure, or tombstoning strategies without rewriting unrelated
history.

## Compact canonical event model

The proposed long list of named events contains useful actions but would create
unnecessary top-level event proliferation. Canonical events use nine families
with stable actions:

| Family | Canonical actions | Covers proposed examples | Owner |
| --- | --- | --- | --- |
| `principal` | resolved, activated, suspended, disabled, anonymized | `PrincipalResolved` | identity adapter/Governance |
| `context` | proposed, activated, restricted, suspended, closed, archived, relationship-added, relationship-ended | context creation and relationship events | Governance context registry |
| `membership` | proposed, pending, activated, restricted, suspended, reinstated, ended, revoked | all membership examples, `AuthorizationRevoked` when membership-scoped | Governance membership authority |
| `purpose` | declared, validated, rejected, activated, deprecated, retired | `AccessPurposeDeclared` | requester plus Governance |
| `subject` | registered, superseded, merged, split, tombstoned | `GovernanceSubjectRegistered` | Governance subject registry |
| `classification` | requested, provisional, classified, reviewed, reclassified, superseded | sensitivity examples | Governance classification authority |
| `policy` | validated, published, activated, superseded, retired | all policy examples | Governance policy authority |
| `decision` | requested, resolved, expired, rejected-as-stale | decision plus propagation/retrieval/provider/projection evaluations | Governance decision service |
| `enforcement` | admitted, denied, quarantined, included, excluded, sanitized, aggregated, disclosed, failed | contribution, provider, projection, disclosure, future-use restriction | enforcement boundary |
| `lineage` | derivation-recorded, transformation-recorded, disclosure-linked, reconstructed | derivation and history examples | Governance lineage/audit |

`GovernanceHistoryReconstructed` is normally a query result plus audited access,
not a new fact about historical state. It uses `lineage/reconstructed` only when
the act of reconstruction itself must be audited.

`FutureReuseRestricted` is a materialized consequence of membership,
classification, subject, or policy events—not an independent authority. It is
recorded as the causal lifecycle event plus affected-projection invalidation.

## Dangerous or prohibited transitions

- An ended membership cannot become active through mutation.
- A disabled principal cannot be enabled by Governance against the identity
  provider's state.
- An archived context cannot accept contributions.
- A closed context cannot accept contributions without an explicit governed
  reopen transition.
- A context relationship cannot itself grant access or propagation.
- A published or active policy version cannot be edited.
- A superseded policy version cannot be reactivated; rollback is a new version.
- A classified profile cannot be silently lowered.
- A registered subject cannot silently change kind or canonical referent.
- A lineage edge, actual transformation, or disclosure record cannot be
  deleted to change history.
- A resolved decision cannot change outcome, reason, input, or policy version.
- An allow decision cannot be treated as proof of successful enforcement.
- A historical disclosure cannot be erased merely because current
  authorization changes.
- A current-state projection cannot override its authoritative event history.

## Decision evaluation and enforcement

```text
Application / boundary
  │ normalize principal, context, purpose, operation, subjects, destination
  ▼
Governance decision service
  │ resolve current membership and subject versions
  │ select effective immutable policy versions
  │ evaluate sensitivity, lineage, propagation, cumulative disclosure state
  ▼
Immutable GovernanceDecision
  │ record
  ▼
Enforcement boundary
  │ verify decision fingerprint, versions, expiry, and requested operation
  ├── deny: emit no protected signal
  ├── permit-with-controls: apply required transformation and validate it
  └── permit: expose only enumerated subjects/mode
  ▼
Enforcement event
  │
  └── if delivered: DisclosureRecorded
```

## Contribution-to-derivation sequence

```text
Principal proposes contribution
  → Contribution boundary resolves organization/context/purpose
  → Governance registers stable subject idempotently
  → Sensitivity classification resolves or contribution is quarantined
  → Contribution decision resolves
  → Boundary admits only approved representation
  → Existing ingestion and cognition operate unchanged
  → Derived object receives separate subject reference
  → Governance lineage records deduplicated input edges
  → Derived sensitivity/propagation eligibility is evaluated
```

Denial records governance metadata without persisting denied content into
Runtime. Quarantine is outside cognition and cannot influence confidence,
source counts, contradictions, or recommendations.

## Retrieval-to-projection sequence

```text
User requests scoped view
  → Retrieval boundary validates current principal/membership/purpose
  → Governance evaluates requested subjects and cumulative disclosure state
  → Retrieval excludes denied subjects before downstream use
  → Provider boundary requests its own destination-specific decision if used
  → Provider input contains only approved raw/sanitized/aggregate representation
  → Provider output is checked against approved maximum mode
  → Projection boundary obtains or validates a current projection decision
  → Required sanitization/aggregation is applied and verified
  → Delivered representation, explanation, counts, confidence, and availability
    are recorded as governed disclosure
```

Confidence and source counts may leak restricted evidence even when text is
removed. They are governed projection fields, not automatically safe metadata.

## Revocation and historical reconstruction

```text
Membership/policy/sensitivity/subject change recorded
  → authoritative event appended
  → current-state projection advances version
  → affected decision/cache references invalidated
  → future retrieval/provider/projection requests re-evaluate
  → existing Runtime truth and cognitive history remain unchanged

Historical reconstruction requested
  → requester and audit purpose authorized now
  → event stream replayed to requested effective time
  → exact policy/membership/sensitivity versions resolved
  → historical decision reproduced
  → reconstructed content disclosed only under a new current decision
  → reconstruction access audited
```

Historical derivation validity, historical decision correctness, current
disclosure eligibility, and future reuse eligibility are four separate
questions.

## Governance Store pressure test

| Model | Strengths | Weaknesses | Suitability |
| --- | --- | --- | --- |
| Mutable state store | Simple writes and fast current lookup | Weak historical reconstruction; in-place correction obscures prior authorization; decision reproduction and policy rollback are fragile | Insufficient as authority |
| Append-only event log | Strong audit, temporal reconstruction, immutable policy and lifecycle history | Operational complexity; expensive current queries; projection rebuilding; event correction and privacy deletion require discipline | Strong authority but incomplete operational model |
| Hybrid: authoritative events plus materialized current state | Fast membership/policy lookup; reproducible history; revocation and supersession are explicit; projections can be rebuilt | Requires projection consistency, version watermarks, idempotent consumers, and failure recovery | Recommended |

### Recommended hybrid behavior

- Authoritative lifecycle, policy, decision, enforcement, and audit facts are
  append-only.
- Current membership, active contexts, effective policy indexes, current
  sensitivity, and invalidation indexes are materialized projections.
- Every projection exposes its event-stream version/watermark.
- A decision records the exact projection and object versions it consumed.
- Revocation appends an event, synchronously advances the authorization
  projection or causes fail-closed behavior, and invalidates caches.
- Policy supersession activates a new immutable version; old versions remain
  reconstructable.
- Data correction appends a correction/supersession event.
- Deletion or anonymization follows explicit policy while retaining
  non-identifying integrity and causal structure where lawful.
- Performance optimizations never make caches or projections authoritative.

## Boundary ownership

### Contribution boundary

- Governance begins before content can enter evidence ingestion or cognition.
- Identity provider proves the actor; Governance resolves principal,
  organization, active context membership, and purpose.
- Subject identity is assigned before admission using an idempotency
  fingerprint.
- Classification completes before raw admission; incomplete cases quarantine.
- Denied content does not enter Runtime, cognition, provider prompts, source
  counts, or confidence.
- The boundary enforces the decision and records admission, transformation,
  quarantine, denial, and failure.

### Retrieval boundary

- The requester supplies organization, context, purpose, operation, and desired
  subject/view.
- Current identity, membership, policy, subject, sensitivity, lineage, and
  cumulative disclosure state are evaluated.
- Derived intelligence is re-evaluated for current use; its historic derivation
  does not grant current access.
- Denied subjects and dependent side channels are excluded before downstream
  composition.
- Confidence, counts, missing-intelligence notices, suggestions, and challenge
  language receive explicit disclosure treatment.

### Provider boundary

- Provider context is built only after a destination-specific decision.
- Raw, sanitized, aggregate, or metadata-only content may enter only as
  enumerated by the decision.
- The provider never receives denied content to sanitize afterward.
- Output validation ensures the response does not exceed the approved mode.
- Logs, traces, retries, caches, and observability are governed disclosures.
- Provider failure falls back only to an equally or more restrictive approved
  representation; otherwise the request stops safely.

### Projection boundary

- Projection requests or validates a current disclosure decision.
- Sanitization occurs at an approved deterministic transformation boundary, not
  through ad hoc wording.
- Aggregate thresholds are verified after transformation and before delivery.
- Explanations and lineage are separately filtered.
- The boundary rejects expired, mismatched, or stale decisions.
- Actual delivered fields and mode are audited without logging restricted
  content unnecessarily.

## Failure-mode matrix

| Failure | Default behavior | Retry/degradation | Human review | Audit |
| --- | --- | --- | --- | --- |
| Missing principal | stop and deny | retry identity resolution | if mapping conflict | safe failure event |
| Unresolved organization | stop and deny | retry resolution | yes if persistent | safe failure event |
| Missing context | stop contribution/request | retry lookup | yes | no protected existence signal |
| Inactive membership | deny | none until state changes | membership authority | decision reason |
| Absent purpose | deny | caller may submit a new complete request | repeated misuse | purpose rejection |
| Unclassified sensitivity | quarantine contribution; deny raw access | classification may retry | yes if unresolved | classification pending/failure |
| Missing policy | fail closed | retry store | policy authority | governance failure |
| Conflicting policy | fail closed | no permissive fallback | required | conflict references |
| Stale policy/version | reject decision and re-evaluate | safe automatic retry | if repeated | stale-decision event |
| Broken governance lineage | deny derived use | rebuild/repair from authoritative events | required if irrecoverable | integrity failure |
| Missing contribution identity | quarantine; no cognition | idempotent registration retry | collision review | registration failure |
| Provider inclusion failure | do not call provider | use only pre-authorized non-provider fallback | if recurrent | boundary failure |
| Provider output validation failure | discard output | retry only under bounded policy | possibly | output rejection without unsafe payload |
| Sanitization failure | deny disclosure | retry deterministic transform | yes | enforcement failure |
| Aggregation threshold failure | deny or policy-approved metadata-only | recompute from authorized set | if inconsistent | threshold reason |
| Audit write failure | stop security-sensitive operation | bounded idempotent retry | operational incident | durable failure when restored |
| Governance Store unavailable | fail closed for governed access/contribution | bounded retry; no less-governed fallback | incident response | local non-sensitive health telemetry |

Degraded behavior is allowed only when a previously evaluated policy explicitly
authorizes an equally or more restrictive representation and its decision is
still current. Availability never justifies broader disclosure.

## Architectural invariants

### Runtime

| Invariant | Owner |
| --- | --- |
| Runtime does not own authoritative identity, membership, policy, or authorization state | Runtime and Governance architecture |
| Governance change never rewrites organizational truth | Governance |
| Runtime never independently decides disclosure | retrieval/projection boundaries |
| Governed references do not turn Runtime into a policy store | integration contracts |

### Cognition

| Invariant | Owner |
| --- | --- |
| Cognition does not interpret permissions or organizational rank | cognitive pipeline |
| Cognitive and governance lineage remain distinct | cognition and Governance |
| Governance transformations do not silently change cognitive semantics | transformation boundary |
| Duplicate contribution paths never create false corroboration | cognition deduplication plus governance lineage |

### Contribution

| Invariant | Owner |
| --- | --- |
| No contribution influences intelligence before admission | contribution boundary |
| Every governed contribution has stable identity | subject registry |
| Source context, principal or approved anonymous source, purpose basis, and sensitivity status are present | contribution boundary |
| Unclassified sensitive material fails closed | Governance classification |

Approved anonymous sources still require a stable protected source reference and
policy basis; “anonymous” is not “unaccounted for.”

### Decision

| Invariant | Owner |
| --- | --- |
| Identical normalized versioned inputs produce identical decisions | decision service |
| Decisions and active policy versions are immutable | Governance Store |
| Every decision references exact policy and input versions | decision service |
| Allow never bypasses boundary enforcement | all enforcement points |
| Material state/version changes require re-evaluation | decision cache and boundaries |

### Disclosure

| Invariant | Owner |
| --- | --- |
| Projection never modifies organizational intelligence | projection |
| Sanitization cannot leak identity, source, subgroup, timing, count, or event detail beyond the decision | transformation and projection |
| Aggregate output satisfies current thresholds | aggregation boundary |
| Metadata-only never confirms sensitive existence without authorization | decision/projection |
| Confidence, counts, suggestions, challenges, refusals, and response availability are governed output | retrieval/provider/projection |

### Temporal

| Invariant | Owner |
| --- | --- |
| Revocation changes future access and invalidates stale authority | membership/policy service |
| Revocation does not rewrite Runtime or prior decisions | Governance |
| Prior disclosures remain auditable | audit |
| Historical derivation, current disclosure, and future reuse are evaluated separately | decision service |
| Policy evolution does not alter historical policy versions | policy store |

### Provider

| Invariant | Owner |
| --- | --- |
| Provider prompts contain only approved content | provider boundary |
| Provider output cannot elevate disclosure mode | output validator |
| Fallback is never less governed | provider/application boundary |
| Observability cannot log restricted content outside policy | provider operations |

## Recursive Organizational Intelligence benchmark mapping

| Benchmark-only responsibility | Future canonical behavior | Current evidentiary limit |
| --- | --- | --- |
| Principal resolution | identity adapter resolves `PrincipalReference` | fixture identities do not test a real identity authority |
| Context graph traversal | versioned context relationships plus bounded deterministic traversal | no production graph store, concurrent update, or cycle recovery |
| Membership evaluation | time-indexed materialized membership plus immutable events | no production revocation latency or cache invalidation |
| Purpose validation | request declaration checked against purpose registry/grant/policy | no real misuse detection or application declaration |
| Sensitivity classification | versioned four-dimensional `SensitivityProfile` | fixture labels do not test classifier error or review operations |
| Raw versus sanitized access | decision mode enforced by deterministic transformation | no production sanitizer |
| Strict noninterference | denied subject excluded before cognition/provider/projection | benchmark cannot inspect all production side channels |
| Sanitized influence | policy-approved transformed input with lineage | no semantic-preservation validator in production |
| Duplicate-path elimination | stable lineage edge identity and visited-path normalization | no production-scale graph or concurrent derivation |
| Temporal revocation | authoritative event, synchronous projection advance/fail closed, cache invalidation | no real distributed timing race |
| Cumulative inference | decision consumes bounded disclosure-state reference | no production query-history retention/privacy model |
| Complexity evaluation | telemetry on traversal, derivation, contradiction, and processing growth | benchmark fixture scale cannot establish operational limits |

The benchmark demonstrates architectural feasibility and adversarial properties
inside its wrappers. Until implementation exists, it cannot validate durable
event ordering, store consistency, identity integration, enforcement coverage,
cache invalidation, provider/log leakage, real sanitization, audit durability,
deletion behavior, or operational failure recovery.

## Implementation sequencing recommendation

Each phase requires separate authorization and benchmark acceptance:

1. Freeze event families, state transitions, normalized identifiers, reason
   codes, and invariants as documentation/fixtures.
2. Define provider-independent governance request, decision, event, and
   reproducibility contracts outside Runtime.
3. Prototype deterministic event replay and materialized projections in
   benchmark-only infrastructure.
4. Test conflict, correction, deletion/anonymization, stream ordering, stale
   projection, and revocation-race behavior.
5. Implement identity mapping, context, membership, purpose, policy, and audit
   persistence without enforcement.
6. Run shadow decisions and compare them to recursive benchmark expectations.
7. Enforce contribution admission and stable subject/lineage registration.
8. Enforce retrieval before cognition and provider use.
9. Implement and validate real sanitization, aggregation, cumulative inference,
   and derived-governance behavior.
10. Enforce provider, projection, export, and observability boundaries.
11. Validate revocation latency, reconstruction, recovery, and incident
    operations before claiming production governance.

## Explicitly deferred

- production governance contract files;
- Governance Store and event-log implementation;
- database or persistence migrations;
- policy language, compiler, or rule engine;
- administration UI and application workflows;
- identity-provider integration;
- Runtime references or contract changes;
- cognition or evidence integration;
- production contribution, retrieval, provider, projection, and export
  enforcement;
- real sanitization implementation;
- real aggregate thresholds or privacy budget;
- cumulative-disclosure storage;
- provider observability controls;
- external compliance controls;
- deletion/anonymization mechanism selection;
- production audit infrastructure;
- routes, authentication behavior, capabilities, and Capability Registry
  changes.

## Open questions requiring benchmark evidence

1. Can compact event families remain unambiguous under replay, correction, and
   cross-stream causality?
2. What maximum projection lag can safely coexist with fail-closed revocation?
3. Which decisions must be synchronously audited before enforcement, and which
   non-disclosure events may use durable asynchronous recording?
4. What exact governed reference is minimally sufficient beside Runtime objects
   without changing Runtime ownership?
5. Can sanitization preserve contextual claim validity across all current
   executive outputs?
6. What aggregation thresholds resist triangulation while preserving standalone
   specialist and executive utility?
7. How much cumulative disclosure history is necessary, and what privacy and
   retention risks does that history create?
8. How should context cycles and overlapping memberships be bounded at
   production scale?
9. Which policy conflicts can resolve deterministically and which must always
   stop for human review?
10. How can audit redaction and identity anonymization preserve decision
    reproducibility?
11. Which provider traces, retry payloads, and failure logs count as disclosure
    events?
12. What evidence proves every production path uses the same enforcement
    semantics?

## Explicitly not implemented

This behavioral model creates no executable lifecycle, events, state machines,
store, projections, authorization, classification, policy evaluation,
enforcement, provider filtering, audit, UI, route, persistence, Runtime field,
cognitive producer, capability, or benchmark behavior.

All diagrams, states, events, sequences, and failure rules are proposed
architecture requiring separate approval before implementation.

## Phase 5B contract mapping

Phase 5B validates the minimum future-read behavior: `eligible` discloses,
while `withheld`, `revoked`, or identity mismatch fails closed. Revocation
does not mutate canonical truth or historical Runtime. The broader lifecycle,
event log, cache invalidation, policy evaluation, audit, and distributed
revocation behavior in this model remain conceptual and activation-blocked.
