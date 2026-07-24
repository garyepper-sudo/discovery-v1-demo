# Organizational Intelligence Governance Object Model

Status: Canonical conceptual contract — not yet implemented

This document defines the adopted conceptual governance records and
relationships. It describes required future behavior, not current Runtime
behavior. Production implementation requires a separately authorized sprint.

Depends on:

- `SHARED_ORGANIZATIONAL_INTELLIGENCE.md`
- `ORGANIZATIONAL_INTELLIGENCE_GOVERNANCE_ARCHITECTURE.md`
- `AUTHENTICATION_AND_MULTI_TENANCY.md`

Dependency order:

```text
Governance Architecture
  → Governance Object Model
  → Governance Behavioral Model
```

The Governance Architecture defines ownership and enforcement boundaries. This
document defines conceptual records and relationships within those boundaries.
The Behavioral Model defines their events, transitions, and enforcement
behavior. None of the three claims production implementation. All remain
subordinate to applicable security, Runtime, and tenancy contracts in those
domains, and none overrides the Product Canon's product identity or philosophy.

## Decision

The Governance Control Plane owns a small set of durable governance records and
produces request-time decisions. It does not own organizational intelligence,
cognitive objects, executive projections, provider responses, or application
state.

The minimum canonical model is:

1. `PrincipalReference`
2. `IntelligenceContext`
3. `ContextMembership`
4. `AccessPurpose`
5. `GovernanceSubjectReference`
6. `SensitivityProfile`
7. `GovernancePolicy`
8. `GovernanceLineage`
9. `GovernanceDecision`
10. `GovernanceAuditEvent`

`DisclosureMode`, propagation rules, temporal validity, revocation, and
versioning are canonical value models within those objects rather than
additional independently persisted roots.

The distinction between records and decisions is important:

- contexts, memberships, purposes, policies, lineage references, and audit
  events have durable governance lifecycles;
- a governance decision is an immutable result for one request under one
  policy version and evaluation time;
- sensitivity and propagation constraints may be attached through governance
  references, but mutable policy is never copied into Runtime objects.

## Modeling principles

- One organization continues to have one canonical Organization Runtime.
- One role- and industry-agnostic cognitive pipeline reasons over authorized
  inputs.
- Governance controls use of intelligence; they do not determine
  organizational truth.
- Context scope and visibility are separate concepts.
- Membership and organizational seniority are not equivalent to authorization.
- Purpose limitation is required in addition to membership.
- Governance decisions are deterministic, explainable, reproducible, and
  versioned.
- Strict noninterference and permitted sanitized influence are distinct
  outcomes.
- Historical truth is not rewritten when future access is revoked.
- Derived intelligence is governed through provenance, sensitivity, and
  aggregation risk—not wording alone.
- Benchmark-owned wrappers remain validation scaffolding, not implemented
  platform objects.

## Object model at a glance

```text
Identity Provider
    │ proves
    ▼
PrincipalReference
    │ has time-bounded
    ▼
ContextMembership ───────── permits ────────► AccessPurpose
    │ relates principal to
    ▼
IntelligenceContext ◄──────── graph ────────► IntelligenceContext
    │ scopes contributions and use
    ▼
GovernanceSubjectReference
    ├── SensitivityProfile
    ├── GovernanceLineage
    └── evaluated under GovernancePolicy
                         │
                         ▼
                  GovernanceDecision
                         │
              enforced by a boundary
                         ▼
             Disclosure / Propagation
                         │
                         ▼
               GovernanceAuditEvent
```

## Canonical object definitions

### 1. PrincipalReference

**Why it exists**

A governance decision needs a stable subject for authorization. Authentication
proves identity, but governance must refer to that identity without duplicating
credentials or becoming the identity provider.

**Conceptual shape**

```text
PrincipalReference
  principalId
  identityAuthority
  externalSubjectReference
  principalType
  organizationAffiliations[]
  status
  createdAt
  retiredAt?
```

`principalType` distinguishes human, service, and system actors. It must not
encode access rank.

**Ownership and lifecycle**

- Identity proof and credential lifecycle: identity provider.
- Stable governance reference and mapping: Governance Control Plane.
- Created when an authenticated actor first requires a governance relationship.
- Retired when the upstream identity is no longer valid; historical references
  remain resolvable for audit.

**Relationships**

A principal may belong to multiple organizations and contexts through explicit
memberships. A principal has no implicit access merely because an affiliation
or executive title exists.

**Why existing objects are insufficient**

Application users and organization IDs establish authentication and tenancy,
not purpose-limited, contextual, temporal authorization.

### 2. IntelligenceContext

**Why it exists**

Shared Organizational Intelligence requires stable bounded contexts that can
overlap without creating separate Runtime or cognition instances.

**Conceptual shape**

```text
IntelligenceContext
  contextId
  organizationId
  name
  contextType
  status
  validFrom
  validUntil?
  relationships[]
  policySetId
  version
```

A context relationship contains:

```text
ContextRelationship
  relationshipId
  sourceContextId
  targetContextId
  relationshipType
  direction
  validFrom
  validUntil?
```

Relationship types are extensible and may include parent, child, peer,
overlapping, advisory, delivery, or temporary-project relationships. They do
not imply propagation or disclosure.

**Ownership and lifecycle**

- Owned by the Governance Control Plane context registry.
- Created for a stable organizational boundary requiring distinct membership,
  purpose, or propagation policy.
- Activated, suspended, exited, or retired without deleting historical
  governance lineage.
- Context graphs may be acyclic or cyclic; the model does not assume a strict
  organization tree.

**Why existing objects are insufficient**

Organization Runtime identifies the organization as a whole. Teams, projects,
specialist functions, and temporary decision groups require bounded governance
without nested Runtime.

### 3. ContextMembership

**Why it exists**

Membership is the temporal relationship between a principal and a context. It
cannot be inferred safely from organizational seniority or authentication.

**Conceptual shape**

```text
ContextMembership
  membershipId
  principalId
  contextId
  status
  validFrom
  validUntil?
  purposeGrants[]
  restrictions[]
  grantedBy
  grantedAt
  revokedBy?
  revokedAt?
  revocationReason?
  version
```

**Activation and revocation**

- A membership is active only when status, validity interval, and current
  policy all permit it.
- Revocation ends future authorization and triggers affected cache
  invalidation.
- Context exit is an explicit temporal transition, not deletion.
- Historical membership remains available for audit but grants no current
  access.

**Purpose restrictions**

`purposeGrants` bind registered access purposes to the context, validity
interval, and optional restrictions. The same principal may have different
purposes in different contexts.

**Why existing objects are insufficient**

Tenant membership is too broad. A compensation specialist may access restricted
raw evidence for an approved investigation while a CEO receives only a
sanitized aggregate.

### 4. AccessPurpose

**Why it exists**

Governance must distinguish why intelligence is being used from who is
requesting it and what operation is being performed.

**Canonical values**

The initial purpose registry should define:

- `organizational-understanding`
- `executive-decision-support`
- `authorized-investigation`
- `cross-context-collaboration`
- `organizational-learning`
- `governance-administration`
- `audit-and-assurance`

These values are platform concepts rather than industry roles. Extensions
require versioned registration, definition, owner, and compatibility review.

**Conceptual shape**

```text
AccessPurpose
  purposeId
  name
  definition
  permittedOperations[]
  incompatiblePurposes[]
  owner
  status
  version
```

Operations such as contribute, retrieve, derive, disclose, export, administer,
and audit remain separate from purpose. “Retrieve” describes what happens;
“authorized investigation” describes why.

**Ownership**

The Governance Control Plane owns the purpose registry and evaluates grants
through membership and policy.

**Why existing objects are insufficient**

Product routes, job titles, prompts, and provider requests do not provide
stable or auditable purpose limitation.

### 5. GovernanceSubjectReference

**Decision**

Governance should use one generalized reference rather than separate governance
wrappers for Evidence, Contributions, Cognitive Objects, Projections, and
Answers.

**Why it exists**

The same policy vocabulary must govern raw sources, contributed claims, derived
intelligence, and disclosure artifacts without making Governance their content
owner.

**Conceptual shape**

```text
GovernanceSubjectReference
  subjectId
  organizationId
  subjectKind
  canonicalObjectReference
  originContextIds[]
  currentContextIds[]
  contributionId?
  sensitivityProfileId
  governanceLineageId
  createdAt
  retiredAt?
  version
```

Initial subject kinds:

- source
- contribution
- evidence
- cognitive-object
- derived-intelligence
- projection
- provider-input
- provider-output
- export

An executive answer is governed as a provider output or projection, not as a
new organizational truth object.

**Ownership**

- Governance owns the reference and governance associations.
- Runtime, cognition, provider, projection, or application owns the referenced
  content according to existing architecture.

**Why alternatives are insufficient**

- Evidence-only governance misses derived and disclosed intelligence.
- Contribution-only governance misses later aggregation and reidentification.
- Cognitive-object governance contaminates role-agnostic cognition.
- Projection-only governance begins after unauthorized influence may occur.
- A content-copying governance wrapper would create a second intelligence
  store.

### 6. SensitivityProfile

**Why it exists**

Sensitivity is multidimensional. A public source can support a sensitive claim;
an innocuous claim can expose a protected identity; several safe disclosures
can create unsafe aggregation.

**Conceptual shape**

```text
SensitivityProfile
  sensitivityProfileId
  sourceSensitivity
  claimSensitivity
  identitySensitivity
  aggregationRisk
  reasons[]
  assignedBy
  policyVersion
  evaluatedAt
  version
```

Each dimension uses a small versioned taxonomy such as:

```text
unspecified | ordinary | restricted | highly-restricted
```

Aggregation risk additionally describes the applicable audience, context,
query-history window, and combination conditions.

**Ownership, inheritance, and defaults**

- Governance owns the taxonomy and effective evaluation.
- The contribution boundary may assign asserted sensitivity.
- Governance validates asserted values and derives effective sensitivity.
- Derived subjects inherit lineage constraints as inputs to a fresh evaluation;
  they do not blindly copy a single maximum label.
- Missing sensitivity fails closed for raw disclosure. Policy may still permit
  a documented sanitized or aggregate result.
- Lowering effective sensitivity requires an explicit policy rule and reason;
  wording changes alone are insufficient.

**Why existing objects are insufficient**

Evidence provenance and cognitive confidence describe epistemic properties, not
disclosure harm.

### 7. GovernancePolicy

**Why it exists**

An authoritative, versioned policy must relate principals, memberships,
contexts, purposes, operations, subjects, sensitivity, time, propagation, and
disclosure.

**Conceptual shape**

```text
GovernancePolicy
  policyId
  organizationId
  name
  status
  scope
  rules[]
  effectiveFrom
  effectiveUntil?
  version
  supersedesVersion?
  approvedBy
  approvedAt
```

Rules contain conditions and effects. Effects include permitted disclosure
mode, propagation constraints, retention or re-evaluation requirements, and
reason codes.

#### Propagation rule

A propagation rule answers:

- what subject or derivation may influence another context;
- source and destination contexts;
- permitted purpose and operation;
- valid time;
- required disclosure mode;
- whether only sanitized influence is permitted;
- lineage and aggregation constraints.

Propagation is not automatic from context graph adjacency. A context
relationship supplies topology; policy supplies permission.

**Ownership and lifecycle**

Governance owns drafting state, approval, activation, supersession, expiry, and
retirement. Activated versions are immutable. A new version supersedes rather
than mutates an active version.

**Why existing objects are insufficient**

Runtime describes organizational state. Product configuration and application
conditions are not a cross-boundary authorization authority.

### 8. GovernanceLineage

**Why it exists**

Derived-intelligence governance must know which governed subjects and
transformations contributed to an output, even when the output no longer quotes
its sources.

**Conceptual shape**

```text
GovernanceLineage
  governanceLineageId
  subjectId
  inputSubjectIds[]
  transformationReferences[]
  contextTransitions[]
  disclosureHistoryReferences[]
  createdAt
  version
```

**Preserved internally**

- stable governed subject references;
- contribution ancestry;
- relevant context transitions;
- sanitization and aggregation transformations;
- policy decision references affecting propagation;
- sufficient structure to evaluate cumulative inference and triangulation.

**Not exposed by default**

- protected source identities;
- hidden membership details;
- policy internals that reveal restricted facts;
- unrelated cognitive implementation details.

**Difference from cognitive lineage**

Cognitive lineage explains how Discovery formed organizational meaning and
supports epistemic traceability. Governance lineage explains which protected
subjects, contexts, and disclosure transformations affect permissible use.
Governance may reference cognitive lineage but does not replace or reinterpret
it.

**Relationship to audit**

Lineage describes derivation structure. Audit records evaluated actions and
decisions. Audit references lineage versions; it does not become lineage or
cognitive evidence.

### 9. GovernanceDecision

**Why it exists**

Every enforcement point needs one canonical, reproducible answer from the same
policy authority.

**Conceptual inputs**

```text
GovernanceDecisionRequest
  requestId
  principalId
  organizationId
  contextId
  membershipId
  purposeId
  operation
  subjectIds[]
  requestedDestination?
  evaluationTime
  policySetVersion
  cumulativeDisclosureStateReference?
```

**Conceptual output**

```text
GovernanceDecision
  decisionId
  requestFingerprint
  outcome
  disclosureMode
  permittedSubjectIds[]
  deniedSubjectIds[]
  requiredTransformations[]
  propagationConstraints[]
  reasonCodes[]
  policyIdsAndVersions[]
  inputVersionReferences[]
  evaluatedAt
  expiresAt?
  reproducibilityReceipt
```

Canonical outcomes are `permit`, `permit-with-controls`, and `deny`.

Canonical disclosure modes are:

- `raw`: authorized content without governance transformation;
- `sanitized`: content transformed to remove or generalize protected elements
  while preserving contextually valid meaning;
- `aggregate`: group-level representation meeting policy thresholds;
- `metadata-only`: existence or status may be disclosed without protected
  content;
- `denied`: no content or inferential signal may be disclosed.

`metadata-only` is required in addition to the proposed four modes so an
application can safely represent existence, missing intelligence, or workflow
status without implying permission to disclose content. It must not reveal a
sensitive subject through its metadata.

**Determinism and reproducibility**

The request fingerprint covers all decision inputs. The same normalized inputs,
policy versions, reference data versions, cumulative state, and evaluation time
must produce the same result. Reason codes are stable machine-readable values;
human explanations are derived views.

**Lifecycle**

A decision is immutable. Expiry or policy change causes a new decision, not
mutation. A decision is not persisted in Runtime and does not grant access
beyond its scoped operation and validity.

### 10. GovernanceAuditEvent

**Why it exists**

Governance must prove what was requested, decided, enforced, disclosed,
revoked, or changed without treating audit history as organizational truth.

**Conceptual shape**

```text
GovernanceAuditEvent
  eventId
  eventType
  occurredAt
  actorPrincipalId
  organizationId
  contextIds[]
  purposeId?
  operation?
  subjectIds[]
  decisionId?
  policyIdsAndVersions[]
  enforcementPoint?
  outcome
  reasonCodes[]
  previousEventId?
  integrityReference
  retentionClass
```

Event types include membership granted, activated, expired, exited, or revoked;
policy activated or superseded; contribution accepted or denied; retrieval
decided; provider transmission decided; projection or export disclosed; and
decision enforcement failed.

**Immutability and history**

- Events are append-only.
- Corrections are new linked events.
- Historical audit survives principal, membership, context, and policy
  retirement according to retention policy.
- Viewing the audit is itself purpose-limited and audited.

**Relationship to disclosure**

Audit records that disclosure occurred and under which policy. It does not make
the disclosed content permanently accessible and is not proof that the same
disclosure remains permitted.

## Temporal governance

Temporal behavior is represented consistently rather than by a separate
“temporal permission” object:

- memberships, contexts, purpose grants, and policies have validity intervals;
- active policy versions are immutable and superseded by later versions;
- decisions include evaluation time, versions, and optional expiry;
- revocation is an append-only lifecycle event that ends future authorization;
- caches and materialized projections must be invalidated or re-evaluated;
- future disclosure always uses current effective authorization;
- historical disclosure is a new access request evaluated under explicit
  current historical-disclosure policy;
- prior access does not create continuing entitlement;
- derived intelligence retains historical lineage but receives a new
  governance decision when used after policy or membership change.

Revocation does not rewrite Runtime history or cognitive conclusions. It changes
who may retrieve, use, propagate, or see them.

## End-to-end relationship model

```text
IDENTITY                 GOVERNANCE                       INTELLIGENCE

Authenticated actor
       │
       ▼
PrincipalReference
       │
       ├── ContextMembership ──► IntelligenceContext graph
       │          │                         │
       │          └── AccessPurpose grants │
       │                                    │
       └────────────────┬───────────────────┘
                        ▼
             Contribution authorization
                        │
                        ▼
              Existing contribution/evidence
                        │ governance subject reference
                        ▼
                 Organization Runtime
                        │ authorized retrieval
                        ▼
                 Existing cognition
                        │ derived subject + lineage
                        ▼
     GovernancePolicy + SensitivityProfile + GovernanceLineage
                        │
                        ▼
                GovernanceDecision
                 /        |        \
          retrieval    provider   projection/export
             PEP          PEP          PEP
                 \        |        /
                        ▼
              permitted user experience
                        │
                        ▼
              GovernanceAuditEvent
```

`PEP` means policy enforcement point. Enforcement points consume decisions;
they do not own policies or create alternative governance semantics.

## Lifecycle diagrams

### Membership and context lifecycle

```text
proposed → active → suspended → active
              │          │
              ├──────────┴──→ exited
              ├─────────────→ expired
              └─────────────→ revoked

exited / expired / revoked
  └── retained as historical governance record
      └── grants no current authorization
```

### Policy and decision lifecycle

```text
draft policy
    ↓ approval
active immutable version N
    ↓ evaluated with versioned request
immutable decision + audit event
    ↓ policy evolution
active immutable version N+1
    ↓
new requests receive new decisions

Version N remains reproducible for historical audit.
```

### Contribution-to-disclosure lifecycle

```text
authenticate
  → resolve membership and purpose
  → decide contribution
  → create governance subject reference and lineage
  → persist authorized intelligence through existing Runtime path
  → retrieve authorized inputs
  → reason through existing cognition
  → register derived subject lineage
  → evaluate sensitivity, propagation, and aggregation
  → decide disclosure mode
  → enforce at provider or projection boundary
  → append audit event
```

## Ownership matrix

| Object or responsibility | Canonical owner | Stored where conceptually | Explicit non-owner |
| --- | --- | --- | --- |
| Authentication credentials | Identity provider | Identity provider | Governance, Runtime |
| PrincipalReference mapping | Governance Control Plane | Governance Store | Runtime, application |
| IntelligenceContext graph | Governance Control Plane | Governance Store | Runtime hierarchy |
| ContextMembership | Governance Control Plane | Governance Store | identity provider tenancy |
| AccessPurpose registry and grants | Governance Control Plane | Governance Store | routes, prompts, roles |
| Organizational content | Existing Runtime/canonical subsystem | Existing canonical store | Governance Store |
| GovernanceSubjectReference | Governance Control Plane | Governance Store; opaque reference near content may be required later | cognition |
| SensitivityProfile | Governance Control Plane | Governance Store | confidence/evidence metadata |
| GovernancePolicy and propagation rules | Governance Control Plane | Governance Store | Runtime, projection |
| Cognitive lineage | Existing cognition/Runtime | Existing canonical destination | Governance |
| GovernanceLineage | Governance Control Plane | Governance Store | cognitive pipeline |
| GovernanceDecision | Governance decision service | Decision/audit store or bounded response | Runtime |
| Enforcement | Contribution, retrieval, provider, projection, and export boundaries | Boundary execution state | policy authoring |
| GovernanceAuditEvent | Governance Control Plane | Append-only Governance Audit Store | Runtime memory |
| Executive representation | Projection/application | Existing product view state | Governance policy |

## Object responsibility matrix

| Object | Exists to | Does not do | Existing object cannot own it because |
| --- | --- | --- | --- |
| PrincipalReference | Stabilize the authenticated actor for governance | Authenticate or rank the actor | User/tenant identity lacks contextual purpose and governance history |
| IntelligenceContext | Define bounded, graph-connected scope | Create a Runtime or grant visibility | Organization identity is too coarse; org charts are not policy |
| ContextMembership | Relate principal to context over time | Grant universal context access | Authentication membership lacks purpose, expiry, and revocation semantics |
| AccessPurpose | Define legitimate reason for use | Replace the requested operation | Routes and prompts are mutable presentation details |
| GovernanceSubjectReference | Point consistently to anything governed | Copy or own intelligence content | Domain-specific wrappers leave gaps and duplicate content |
| SensitivityProfile | Represent disclosure harm dimensions | Express epistemic confidence | Evidence and cognition metadata answer different questions |
| GovernancePolicy | Authoritatively determine allowed use | Infer organizational truth | Runtime and applications cannot provide one versioned decision authority |
| GovernanceLineage | Trace protected derivation and movement | Replace cognitive reasoning lineage | Cognitive lineage does not encode permitted movement or disclosure history |
| GovernanceDecision | Give one reproducible boundary instruction | Persist organizational truth or confer indefinite access | Local boundary logic would drift and disagree |
| GovernanceAuditEvent | Prove governance actions and decisions | Become evidence or continuing permission | Runtime evolution is not an immutable authorization ledger |

## Governance metadata placement

### Inside Runtime

Do not place authoritative membership, policy, sensitivity taxonomy, decisions,
or audit state inside Runtime. Runtime is the canonical organizational
intelligence store, not the governance authority.

A future implementation may require an opaque `GovernanceSubjectReference` or
lineage pointer adjacent to stored intelligence so enforcement can resolve the
governed subject. That is a reference, not embedded policy, and requires
separate Runtime-contract authorization.

### Inside cognitive objects

Do not embed roles, permissions, mutable policies, or disclosure decisions.
Cognitive objects may preserve their existing provenance and stable identity.
Governance derives separate lineage associations from those identities.

### Inside Evidence

Evidence may eventually carry or resolve an opaque contribution/subject
reference assigned at the authorized contribution boundary. Source sensitivity
assertions may enter there, but Governance owns their validation and effective
profile. Evidence does not become the policy owner.

### Inside projections and provider payloads

Only the bounded result authorized by a current decision should enter a
projection or provider payload. A short-lived decision receipt may accompany
the enforcement operation. Projections and providers must not contain the
authoritative policy or sensitive governance lineage.

### Separate Governance Store

The Governance Store is the authoritative conceptual destination for principal
mappings, contexts, memberships, purpose grants, policies, sensitivity
profiles, governance subject references, governance lineage, version records,
revocations, decisions required for audit, and immutable audit events.

This is not a second Runtime. It stores control-plane state and references, not
organizational intelligence.

### Multiple locations

References and decision receipts may exist at enforcement boundaries for
performance and traceability. Authority remains singular:

- content in its canonical subsystem;
- governance state in the Governance Store;
- opaque references at integration points;
- immutable audit evidence in the Governance Audit Store.

Cached copies are version-bound, expiring, revocation-aware, and never
authoritative.

## Interaction with Shared Organizational Intelligence

Shared Organizational Intelligence remains a composition of existing
organizational intelligence, not a governance-owned copy.

Governance controls:

- which context-bounded contributions may enter composition;
- which authorized inputs may influence a derivation;
- whether influence must be strictly excluded or may be sanitized;
- where derived intelligence may propagate;
- which disclosure mode is permitted for the requesting principal and purpose;
- whether cumulative disclosures create triangulation or aggregation risk.

Governance does not:

- decide whether a claim is true;
- rewrite contextual claims into universal claims;
- create contradictions, mechanisms, beliefs, or recommendations;
- assign cognitive confidence;
- create a separate context-specific reasoning engine.

## Application and provider interaction

Applications declare the requested context, purpose, operation, and destination.
They render the permitted representation and stable reason explanations. They
do not invent policies.

Provider boundaries request a decision before transmission. Denied information
never enters provider context. Returned content is validated against the
decision as defense in depth. Provider interpretation and generation do not
become governance authorities.

## Migration and implementation sequencing

Every step requires separate implementation authorization:

1. **Freeze conceptual vocabulary.** Review names, identifiers, value sets,
   invariants, and relationship semantics in benchmark fixtures only.
2. **Define contracts outside Runtime.** Specify normalized request, decision,
   reason-code, version, and audit schemas without enforcement.
3. **Map existing identities.** Establish stable PrincipalReference mappings
   and organization affiliation without replacing authentication.
4. **Introduce Governance Store foundations.** Contexts, memberships, purposes,
   policy versions, and audit integrity; no production enforcement.
5. **Shadow evaluation.** Reproduce benchmark policies and compare decisions
   without changing product behavior.
6. **Authorize the contribution boundary.** Create subject references and
   governance lineage for new contributions.
7. **Authorize retrieval and provider boundaries.** Enforce before cognition
   and external transmission, including revocation-aware caching.
8. **Authorize derived-intelligence evaluation.** Combine governance lineage,
   sensitivity dimensions, and cumulative aggregation state.
9. **Authorize projection and export boundaries.** Enforce consistent
   disclosure modes across applications.
10. **Activate temporal operations.** Context exit, membership revocation,
    historical disclosure, policy supersession, and incident review.

The Recursive Organizational Intelligence benchmark should remain the
acceptance harness. Production implementation must not claim capabilities from
benchmark wrappers before each enforcement path exists.

## Objects intentionally deferred

The following are not canonical objects in this sprint:

- governance roles or organizational rank hierarchy;
- a policy language or rule-expression AST;
- entitlement bundles;
- consent records;
- legal holds and jurisdiction-specific retention objects;
- emergency or break-glass grants;
- delegation chains;
- data-residency regions;
- cryptographic key and encryption-policy objects;
- privacy budgets or a chosen cumulative-inference algorithm;
- appeal, exception, and remediation workflows;
- application-specific visibility models;
- provider-specific governance objects;
- nested Runtime, context Runtime, or Governance Operating System;
- a second cognitive lineage model exposed to users.

They may become necessary only after benchmark evidence establishes a distinct
responsibility that the canonical objects cannot represent.

## Open questions

1. Is `metadata-only` required in the first enforcement implementation, or can
   it remain a later disclosure mode while still representing safe missing
   intelligence?
2. What minimum governance-lineage granularity supports derived disclosure
   without duplicating cognitive lineage?
3. Which subject kinds require durable records, and which can be request-scoped
   references?
4. What taxonomy is sufficiently expressive for sensitivity without becoming
   industry-specific?
5. How should aggregate thresholds and query-history windows be represented
   without prematurely choosing a privacy-budget model?
6. Which policy changes invalidate prior materialized projections versus only
   future access?
7. What fail-closed experience preserves executive trust when Governance is
   unavailable?
8. How should context graph cycles be evaluated without propagation path
   explosion?
9. What audit retention is necessary to reproduce historical decisions while
   respecting deletion obligations?
10. When may governance explanations disclose reason details without revealing
    the protected subject?

## Explicitly not implemented

This document introduces no production TypeScript types, Runtime fields,
database schemas, persistence, APIs, policy evaluator, enforcement point,
provider filter, projection behavior, capability, or registry entry.

It does not modify authentication, cognition, Runtime, memory, evidence,
providers, applications, or benchmarks. All named shapes are conceptual and
require separate implementation approval.
