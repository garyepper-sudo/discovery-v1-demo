# Organizational Intelligence Governance Architecture

Status: Canonical conceptual contract — not yet implemented

This document defines the adopted ownership and enforcement boundaries for
Organizational Intelligence Governance. It describes required future behavior,
not current Runtime behavior. Production implementation requires a separately
authorized sprint.

Document relationship:

```text
Governance Architecture
  → Governance Object Model
  → Governance Behavioral Model
```

This document governs governance ownership and enforcement boundaries. The
Object Model defines conceptual governance records and relationships, and the
Behavioral Model defines their events, transitions, and enforcement behavior.
All three remain subordinate to applicable security, Runtime, and tenancy
contracts in those domains. They do not override the Product Canon's authority
over product identity and philosophy.

## Decision

Organizational Intelligence Governance should be owned by a cross-cutting
**Governance Control Plane**. It is a platform responsibility, not a cognitive
capability, reasoning engine, Runtime responsibility, or projection feature.

The recommended design is a constrained form of Option E:

- identity proof remains with the identity provider;
- the Governance Control Plane owns context, membership, purpose, policy,
  temporal authorization, revocation, propagation, disclosure, and audit;
- contribution, retrieval, provider, and projection boundaries enforce
  governance decisions;
- intelligence objects retain lineage and opaque governance references needed
  for deterministic decisions, but do not own policy;
- Organization Runtime remains the canonical organizational intelligence store;
- the existing cognitive pipeline reasons only over authorized inputs and does
  not decide who may know what.

This preserves one Organization Runtime and one industry- and role-agnostic
reasoning engine.

## Evidence and architectural inference

### Observed evidence

- Authentication establishes users and organizations, but the current
  organization-first model intentionally defers role-based access.
- `OrganizationRuntime` is keyed by organization identity and persists
  organizational intelligence; it has no canonical principal, context
  membership, purpose, sensitivity, revocation, or temporal-policy model.
- Memory owns persistence rather than cognition or authorization.
- Conversation Intelligence is ephemeral and already demonstrates a bounded
  adapter pattern: minimized context enters a provider and is not merged into
  Runtime.
- The Recursive Organizational Intelligence Validation benchmark classified
  the architecture as `PARTIALLY_SUPPORTED_GENUINE_GAP_FOUND`. Cognition reuse
  and scoped composition worked, while visibility, privacy projection,
  authorization, and temporal behavior required benchmark-owned wrappers.
- The capability registry reports no missing cognitive capability corresponding
  to governance.

### Architectural inference

The benchmark wrappers demonstrate useful enforcement behavior, not a
production governance capability. Persistent authorization and temporal policy
need durable state, an authoritative decision owner, enforcement points, and an
audit lifecycle. Assigning these responsibilities to cognition would make
organizational reasoning role-aware. Assigning them only to projection would
permit unauthorized influence before disclosure. Assigning them to Runtime
would conflate organizational truth with permission to access that truth.

The gap is therefore a platform governance subsystem with several enforcement
points. It is not a new Cognitive Operating System or Capability Registry entry.

## Decision matrix

| Option | Strengths | Material failure | Conclusion |
| --- | --- | --- | --- |
| A. Runtime owns governance | Close to persisted intelligence and lineage | Conflates truth persistence with authorization; cannot independently govern contribution, provider input, retrieval, and disclosure; makes Runtime policy-aware | Reject as owner |
| B. Separate Governance Operating System | Clear durable authority and lifecycle | “Operating System” implies a parallel reasoning architecture and risks duplicating Runtime and cognition | Reject the OS framing; retain a narrow control plane |
| C. Governance attached to intelligence objects | Portable labels and lineage references | Objects cannot authoritatively resolve membership, current purpose, revocation, policy versions, or aggregation risk; copied policy drifts | Use references as inputs, not as owner |
| D. Governance as projection layer | Convenient final-output filtering | Too late: unauthorized material can affect cognition, confidence, providers, caches, and derived intelligence before projection | Reject as sole owner |
| E. Hybrid | Separates authority from enforcement and preserves existing architecture | Requires explicit contracts and consistent reference-monitor coverage | Recommend |

## Canonical responsibilities

“Current owner” distinguishes implemented production ownership from temporary
benchmark behavior.

| Responsibility | Current owner | Recommended owner | Dependencies | Why current state is insufficient |
| --- | --- | --- | --- | --- |
| Principal identity | Identity provider | Identity provider, resolved to a stable governance principal | Authentication and organization identity | Authentication alone does not establish scoped authorization |
| Context identity | No canonical production owner | Governance Control Plane context registry | Stable organization and context identifiers | Runtime organization identity cannot distinguish bounded contexts |
| Membership | Organization authentication boundary only | Governance Control Plane membership service | Principal, context, validity interval | Organization membership is too coarse and seniority must not imply raw-data access |
| Contribution identity | Evidence/provenance identifiers are partial | Contribution boundary assigns a stable contribution ID | Principal, context, purpose, provenance | Existing provenance does not establish governance conditions |
| Source sensitivity | No canonical owner | Governance policy taxonomy applied at contribution | Source identity and policy | Source restrictions cannot be reconstructed safely at projection |
| Claim sensitivity | No canonical owner | Governance decision engine | Claim lineage and policy | Sensitivity may differ from the source container |
| Identity sensitivity | No canonical owner | Governance decision engine | Principal/entity references and reidentification rules | Redacting a source label may still expose an identity |
| Aggregation risk | Benchmark evaluator only | Derived Intelligence Governance evaluator | Lineage, audience, query history, context | Individually safe claims can become identifying when combined |
| Purpose | No canonical owner | Governance Control Plane purpose grant | Principal, context, requested operation | Membership does not establish purpose limitation |
| Propagation | Benchmark policy wrapper only | Governance policy decision engine | Contribution lineage, derivation type, purpose | Cognition can reuse information without deciding its permissible spread |
| Disclosure | Product-specific projection behavior | Governance decision engine | Principal, context, purpose, derived-governance result | Projection cannot author policy consistently |
| Retrieval | Runtime loaders/selectors | Retrieval enforcement point using governance decisions | Current authorization and query scope | Storage lookup does not enforce contextual access |
| Projection | Application projection layers, including the current Executive Workspace | Existing projection layers as enforcement points | Governance disclosure decision | Projection is necessary but is too late to be the authority |
| Provider disclosure | Context-minimizing conversation boundary | Provider enforcement point before transmission, with output validation | Provider policy, purpose, authorized bounded context | General minimization does not prove claim-level authorization |
| Audit | No canonical governance audit | Append-only Governance Control Plane decision/event log | Policy version, actor, context, purpose, decision, time | Runtime history represents organizational evolution, not authorization evidence |
| Temporal authorization | No canonical owner | Governance Control Plane | Validity intervals, policy versions, clock | Static membership cannot represent expiry or context exit |
| Revocation | No canonical owner | Governance Control Plane | Membership and grant lifecycle, cache invalidation | Previously granted access can otherwise persist indefinitely |
| Historical disclosure | No canonical owner | Governance decision engine at access time plus audit | Current policy, historical policy receipt, lineage | Prior disclosure does not imply continuing permission |
| Derived intelligence governance | Benchmark evaluator only | Governance derived-intelligence evaluator | Complete contribution lineage, purpose, sensitivity, aggregation risk | A derived claim can reveal restricted inputs even without quoting them |

The specialist-access case is explicit: policy may authorize a specialist
function to inspect restricted evidence while a more senior principal receives
only an aggregate. Organizational seniority is not an authorization lattice.

## Interaction architecture

```text
Identity Provider
    │ authenticated principal
    ▼
Governance Control Plane
    ├── contexts and memberships
    ├── purpose grants
    ├── policy and sensitivity taxonomy
    ├── temporal authorization and revocation
    ├── propagation and disclosure decisions
    └── append-only governance audit
         │ decisions / receipts
         ▼
Contribution Boundary ── authorized evidence + lineage ──┐
                                                         ▼
                                             Organization Runtime
                                                         │
                                              authorized retrieval
                                                         ▼
                                               Existing Cognition
                                                         │
                                              derived intelligence
                                                         ▼
                                      Derived Governance Evaluation
                                                         │
                         ┌───────────────────────────────┴──────────┐
                         ▼                                          ▼
                Provider Boundary                         Projection Boundary
                         │                                          │
                bounded permitted context                    permitted view
                         ▼                                          ▼
                Conversation adapter              Application Projection / Workspace
```

The Governance Control Plane decides. Boundaries enforce. Runtime stores
organizational intelligence and lineage. Cognition reasons. Projection
communicates. None substitutes for another. The Executive Workspace is the
current first application example, not the platform's only projection endpoint.

## Governance lifecycle

1. The identity provider authenticates a principal.
2. Governance resolves the principal's active context memberships and permitted
   purposes for the requested operation.
3. The contribution boundary authorizes a contribution and binds stable
   contribution identity, provenance, context, purpose, and governance
   references.
4. Runtime receives only an authorized organizational contribution. Runtime
   does not evaluate the policy.
5. Retrieval selects only inputs authorized for the principal, context, purpose,
   and time.
6. Existing cognition processes that bounded input without roles or permissions.
7. Derived Intelligence Governance evaluates lineage, source/claim/identity
   sensitivity, permitted propagation, and cumulative aggregation risk.
8. Provider and projection boundaries enforce the resulting disclosure
   decision; denied content is never sent to a provider.
9. The control plane records the decision, policy version, subject, context,
   purpose, object or contribution reference, and time.
10. Membership exit, expiry, or revocation changes future decisions and
    invalidates affected authorization caches. Historical access is reevaluated
    under explicit historical-disclosure policy.

Provider output validation is defense in depth. It cannot replace enforcement
before provider transmission.

## Deterministic governance invariants

- The same policy version, principal, context, purpose, time, lineage, and
  requested operation produce the same decision.
- Context scope and visibility are separate: a claim can belong to a context
  without being visible to every context member.
- Strict noninterference and permitted sanitized influence are distinct policy
  outcomes.
- Purpose authorization is required in addition to membership.
- Generalization must remain valid for the authorized context; sanitization
  cannot turn a contextual claim into an unsupported universal claim.
- Derived disclosure is evaluated from lineage and aggregation risk, not merely
  from the final wording.
- A higher-ranking principal does not automatically inherit specialist raw-data
  access.
- Revocation affects future retrieval and projection without rewriting
  historical organizational truth.
- Governance audit events do not become cognitive evidence.

## Persistence boundaries

The Governance Control Plane requires durable policy state, memberships,
purpose grants, validity intervals, policy versions, revocations, and audit
events. That state is separate from Organization Runtime.

Future intelligence objects may carry opaque governance references and complete
derivation lineage required for evaluation. They should not embed mutable policy
copies or become authorization authorities. The exact reference contract is an
implementation decision and is not introduced by this document.

## Migration strategy

Each phase requires separate authorization and should preserve benchmark
evidence separately from implemented capability:

1. **Contract phase:** specify principal, context, purpose, decision, policy
   version, lineage, and audit contracts without changing Runtime or cognition.
2. **Identity inventory:** map authenticated identities and organization
   membership to stable governance principals and contexts.
3. **Shadow decisions:** run a policy decision service in observation-only mode
   against benchmark fixtures; do not enforce or claim production protection.
4. **Contribution enforcement:** authorize new contributions and issue opaque
   governance receipts.
5. **Retrieval and provider enforcement:** filter before cognition/provider
   access and test strict noninterference plus sanitized influence separately.
6. **Projection enforcement:** apply the same authoritative decisions to
   application projections, views, and exports, including Executive Workspace
   outputs.
7. **Derived governance:** use lineage and cumulative-query state to evaluate
   triangulation and aggregation risk.
8. **Temporal lifecycle:** enforce expiry, context exit, revocation, cache
   invalidation, and historical-disclosure decisions.
9. **Audit operations:** add review, explanation, retention, and incident
   workflows without feeding audit data into cognition.

No phase requires a second Runtime or reasoning engine.

## Risks

- Incomplete enforcement coverage could create the appearance of safety while
  leaving alternate retrieval or export paths open.
- Missing lineage would make derived-intelligence disclosure unverifiable.
- Overly conservative propagation could destroy cross-context utility; overly
  permissive generalization could leak or distort contextual truth.
- Per-object policy copies would drift after revocation or policy changes.
- Cumulative inference requires bounded query-history state and may create
  privacy, retention, and performance tradeoffs of its own.
- Policy checks at every boundary can introduce latency and path explosion
  unless decisions are versioned, cacheable, and invalidated correctly.
- Confusing audit history with organizational evidence would contaminate
  cognition.
- Provider output filtering alone cannot undo disclosure in provider input.

## Open architectural questions

1. Which durable subsystem hosts the control plane, and what availability model
   is required for fail-closed operation?
2. What is the minimum opaque governance reference stored alongside evidence
   and derived objects without changing Runtime into a policy store?
3. Which derivation-lineage granularity is sufficient for propagation,
   contradiction, and aggregation analysis?
4. How are sanitized influence and strict noninterference represented and
   tested as separate decisions?
5. What query-history window is legitimate and sufficient for cumulative
   inference protection?
6. How are policy changes applied to cached projections, provider transcripts,
   exports, and previously materialized derived objects?
7. Which historical disclosures remain legally or operationally viewable after
   context exit?
8. How are emergency access and specialist-access exceptions approved,
   time-bounded, explained, and audited?
9. What failure behavior is required when governance is unavailable?
10. Who owns policy administration and review without encoding organizational
    seniority as automatic access?

## Why the preferred model is the minimum sufficient architecture

Governance has distinct state, lifecycle, correctness criteria, and security
failure modes; no current production owner supplies them. Adding them to
Runtime would distort canonical persistence, adding them to cognition would
distort organizational reasoning, and adding them only to projection would
leave earlier leakage paths. A narrow control plane plus explicit enforcement
points supplies one authoritative owner while reusing existing Runtime,
cognition, providers, and projections.

This recommendation supports shared organizational intelligence without making
governance the product architecture.

## Explicitly not implemented

This investigation does not:

- add a Governance Operating System or cognitive capability;
- modify the Capability Registry;
- alter Runtime, memory, cognition, recommendations, or projections;
- implement identity, membership, permissions, policy, audit, revocation, or
  provider filtering;
- claim benchmark policy wrappers are production controls;
- select a policy language, database, vendor, or provider;
- authorize nested contexts, new Runtime objects, or a second reasoning engine.

Production remains unchanged until a separately approved implementation sprint.
