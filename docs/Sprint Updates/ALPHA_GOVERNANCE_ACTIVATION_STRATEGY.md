# Alpha Governance Activation Strategy

**Status:** Architecture decision complete; inactive producer shadow demonstrated
**Decision:** Explicit Alpha allowlist with authenticated identity
**Current classification:** Producer and identity shadow contracts valid; live
deployment verification and durable access remain unimplemented

## Decision

The minimum safe disclosure-decision producer for hosted Alpha is a
request-time, default-deny evaluator over:

1. a Clerk-authenticated user identifier;
2. the requested Discovery organization identifier;
3. one active, versioned, Discovery-owned Alpha access record;
4. the requested product experience and disclosure purpose;
5. current canonical Organizational Understanding authority receipts; and
6. an explicit evaluation time and policy version.

The selected policy is
`alpha-explicit-allowlist-organization-disclosure@1`.

This is **Model C: explicit allowlist**. It is not the full Governance Control
Plane. It is a narrow Alpha policy that can later migrate into the canonical
principal, context, membership, purpose, policy, decision, and audit model.

The repository now contains an inactive, injected producer shadow validating
this design `61/61` and an official server-only Clerk identity shadow
validating `28/28`. It still cannot safely activate. No live Clerk deployment
session has been verified, and no durable trustworthy user-to-organization
access record or audit store exists.
The existing Alpha password cookie proves possession of a shared secret only.
A URL `organizationId`, Runtime metadata, or organization existence cannot
substitute for authorization.

## Repository inventory

| Input or boundary | Current owner and source | Trust level | Lifecycle | Alpha conclusion |
| --- | --- | --- | --- | --- |
| Alpha gate | `middleware.ts`, `lib/alpha-access/session.ts`, and `app/alpha-access/submit/route.ts` | Shared-secret possession only | HMAC cookie expires after 24 hours | May remain an outer preview gate, but cannot identify a consumer |
| Authenticated person | Official server-only Clerk identity shadow exists; active route remains unwired | Shadow available | Live unavailable | Deployment verification required before hosted activation |
| Consumer identifier | No production owner | Unavailable | Unavailable | Use stable Clerk user ID after verified server-side authentication |
| Requested organization | Route `organizationId`, normalized by `loadProductOrganization` | Untrusted request input until authorized | Request-bound | Identifies the requested tenant; grants no access |
| Organization existence | Organization Runtime registry and persisted Runtime metadata | Canonical for Runtime identity and existence | Durable Runtime lifecycle | May validate the target, but cannot establish user access |
| Creator or owner | No user creator/owner field in `OrganizationRuntimeMetadata`; no trustworthy external mapping | Unavailable | Unavailable | Model B is not currently supportable |
| Membership, role, permission | Canonical Governance documents are conceptual and unimplemented | Unavailable in production | Future Governance lifecycle | Do not infer or fabricate |
| Canonical truth | Organization Runtime and canonical Organizational Understanding | Canonical | Durable, organization-owned | Remains unchanged |
| Canonical authority | Phase 5A authority-transition receipt on each canonical composition | Canonical | Versioned with the composition | Required but not sufficient for disclosure |
| Disclosure enforcement | `discloseCanonicalOrganizationalUnderstanding` | Active pure contract | Request input/output only | Reuse unchanged |
| Projection | Organizational Understanding Projection compiler | Downstream, disclosure-enforced | Pure and non-persistent | Must consume the disclosure result, not policy |
| Communication | Structured Product Communication and product adapter shadows | Downstream, source-pass-through | Pure and non-persistent | Must not make access decisions |
| Access record | No production owner | Unavailable | Unavailable | Add outside Runtime in the implementation sprint |
| Decision audit | No canonical production owner; full governance audit remains conceptual | Unavailable | Unavailable | Bounded Alpha audit is required before enforcement |

The word “owner” used in product view models describes a cognition source, not
a user, tenant owner, or authorization relationship.

## Candidate comparison

| Model | Safety | Speed | Reversibility | Migration path | Decision |
| --- | --- | --- | --- | --- | --- |
| A. Single local or trusted user | Acceptable only in a truly local, single-operator environment | Fastest | High | Poor evidence for hosted Alpha | Reject for hosted Alpha; retain only as a development assumption |
| B. Creator or owner access | Potentially safe with a trustworthy immutable creator relationship | Fast after that relationship exists | Medium | Can over-couple access to creation | Reject now because no creator/owner relationship is persisted |
| C. Explicit allowlist | Safe for bounded hosted Alpha when identity, durable records, revocation, and audit are present | Smallest viable implementation | High | Maps cleanly to future principal/context membership records | **Select** |
| D. Minimal membership model | Stronger general model for multiple roles and grants | Slower; begins broader Governance implementation | Medium | Direct path to the Control Plane | Defer until Alpha evidence justifies it |
| E. Full Governance Control Plane | Canonical long-term architecture | Slowest and widest scope | Lowest local rollback simplicity | End-state architecture | Do not make Alpha activation wait for it |

## Clerk decision

Clerk is required before a hosted Alpha route can disclose organizational
understanding. It owns:

- authentication and credential security;
- verified session lifecycle;
- stable external user identity; and
- sign-in, sign-out, expiry, and provider security.

Discovery owns:

- the mapping from a Clerk user ID to an Alpha access record;
- organization and experience scope;
- policy version and temporal validity;
- revocation;
- the disclosure decision;
- enforcement and Alpha audit evidence.

Clerk Organizations are not required for the first activation. Treating them
as the immediate access authority would couple the Alpha policy to an
uninspected external membership lifecycle and would prematurely select the
future Governance membership store. Evaluate that migration separately.

The existing password gate may remain defense in depth during Alpha, but it
must not be supplied as `consumerId` or used as proof of organizational access.

## Alpha access record

The bounded implementation should introduce one Discovery-owned record outside
Organization Runtime:

```text
AlphaOrganizationAccessRecord
  id
  subjectAuthority             = "clerk"
  externalSubjectId            = Clerk user ID
  organizationId
  experience                   = "your-organization"
  purpose                      = "organizational-understanding"
  status                       = "active" | "revoked"
  validFrom
  validUntil?
  policyVersion                = "alpha-explicit-allowlist-organization-disclosure@1"
  grantedBy
  grantedAt
  revokedBy?
  revokedAt?
  revocationReason?
  version
```

This record is not cognition, Evidence, a Runtime object, a role hierarchy, a
general permission model, or an Intelligence Scope.

### Ownership and persistence

- Store access records in a separate application/governance persistence
  boundary, never in Organization Runtime.
- Do not encode allowlists in source code or deployment environment variables:
  those approaches provide weak lifecycle, revocation, audit, and operator
  safety.
- Do not persist Clerk credentials or session tokens.
- Provisioning is an explicit administrative operation outside the product
  route. The first implementation may use a tightly controlled seed or
  operator workflow, provided records are durable, versioned, and inspectable.
- Duplicate or conflicting active records for the same subject, organization,
  experience, purpose, and policy version fail closed.

This is intentionally smaller than `ContextMembership`. It should have an
explicit migration adapter rather than being renamed into the canonical
Governance object model prematurely.

## Disclosure-decision producer

### Input

```text
AlphaDisclosureDecisionInput
  authenticatedSubject
    authority                  = "clerk"
    externalSubjectId
    sessionId
    authenticatedAt
  organizationId
  consumerId                  = stable namespaced principal reference
  experience                  = "your-organization"
  purpose                     = "organizational-understanding"
  requestedCompositionRefs[]
    compositionId
    revision
    authorityTransitionId
  accessRecords[]
  policyVersion
  evaluatedAt
```

`consumerId` should be a stable, opaque, namespaced derivation or stored
mapping of the verified Clerk subject. Email address is not a stable consumer
identifier. The producer must not accept a caller-asserted consumer identity.

### Output

The producer emits the existing
`OrganizationalUnderstandingDisclosureDecision`:

```text
id
organizationId
consumerId
disposition                   = "eligible" | "withheld" | "revoked"
effectiveAt
supersedesDecisionId?
basis[]
```

For Alpha, `basis` contains stable reason codes, not secrets or mutable prose.
Examples include:

- `alpha-policy-v1-active-access`
- `alpha-policy-v1-no-active-access`
- `alpha-policy-v1-access-revoked`
- `alpha-policy-v1-identity-unavailable`
- `alpha-policy-v1-organization-mismatch`
- `alpha-policy-v1-authority-receipt-missing`
- `alpha-policy-v1-policy-input-invalid`

The producer resolves policy only. The existing disclosure function continues
to enforce the result and filter to authority-qualified compositions.

### Determinism and identity

The decision ID is derived from the policy version, consumer ID, organization
ID, experience, purpose, sorted requested composition revision and authority
references, selected access-record ID and version, disposition, reason codes,
and explicit evaluation time. No ambient clock or random value is read inside
the pure evaluator.

The server boundary supplies `evaluatedAt`. Equal normalized inputs and time
produce equal output. A change in identity, access-record version, policy,
composition revision, authority receipt, or evaluation time produces a new
decision identity.

### Validity and recomputation

- Alpha decisions are valid for one request only.
- Recompute on every request.
- Do not persist a decision as reusable authorization.
- Do not use an eligible prior decision after session expiry, access-record
  revocation, policy change, or composition revision.
- `supersedesDecisionId` remains absent unless a durable decision-history
  implementation can prove the predecessor. Do not fabricate a chain.

## Policy `alpha-explicit-allowlist-organization-disclosure@1`

An `eligible` decision requires all of the following:

1. the server verified a current Clerk session;
2. the request has a nonempty stable subject ID;
3. the Runtime organization exists;
4. exactly one applicable access record is active;
5. subject, organization, experience, purpose, policy version, and validity
   interval match exactly;
6. the record is not revoked or expired;
7. every requested composition reference belongs to that organization;
8. every requested current revision has an explicit
   `authorized-organizational-knowledge` authority receipt; and
9. all policy inputs are well formed.

Disposition is:

- `revoked` when a matching record is explicitly revoked;
- `withheld` for absence, expiry, ambiguity, mismatch, invalid inputs,
  unavailable dependencies, or missing authority;
- `eligible` only when every requirement passes.

There is no implicit owner, employee, executive, email-domain, seniority,
organization-existence, shared-password, or URL-based grant. There is no
wildcard organization or experience. Missing data is denial.

Historical Runtime content is not rewritten. Historical compositions without
current authority receipts remain suppressed. A prior disclosure does not
grant future access.

## Caching, revocation, and audit

### Caching

The safest Alpha baseline has no cross-request cache of decisions, disclosure
results, projections, or communication plans. Request-local memoization is
permitted only within the same authenticated request and decision ID.

If a later cache is introduced, its key must include subject, organization,
experience, purpose, policy version, access-record ID and version, composition
revisions, authority-transition references, and decision ID. Revocation and
policy changes must invalidate affected entries before that cache can be
authorized.

### Revocation

Revocation updates the access record to `revoked`, increments its version, and
causes all subsequent requests to resolve `revoked`. Because Alpha decisions
are request-bound and cross-request caches are prohibited, no previous
eligible decision survives. Revocation changes future disclosure only; it does
not mutate Runtime, cognition, canonical compositions, Evidence ancestry, or
past product output.

### Audit

Before route enforcement, record a bounded append-only Alpha access evaluation
event containing:

- event ID and decision ID;
- policy version;
- subject authority and opaque consumer ID;
- organization, experience, and purpose;
- access-record ID and version when present;
- requested composition IDs and revisions;
- disposition and stable reason codes;
- evaluation time; and
- request correlation ID.

Do not record credentials, session tokens, raw Evidence, composition text, or
communication output. This Alpha audit is security evidence, not Runtime
history or cognition. It is a bounded precursor, not a claim that the full
Governance audit architecture is implemented.

If durable, append-only audit storage is unavailable, the route must remain in
shadow and the repository classification remains B.

## Boundary ownership

```text
Clerk
  proves current identity
        ↓
Alpha access-record store
  owns bounded user ↔ organization grant and revocation
        ↓
Alpha disclosure-decision producer
  resolves policy for one request
        ↓
Existing disclosure enforcement
  admits current authority-qualified canonical compositions
        ↓
Projection compiler
  structures permitted understanding
        ↓
Product Communication
  prioritizes and synthesizes only permitted source references
        ↓
Your Organization UI
  composes the experience
```

No downstream layer may infer access or recover suppressed content. No
upstream layer may become user-aware merely to support presentation.

## Failure and threat analysis

| Failure or attack | Required behavior |
| --- | --- |
| Guessed or edited `organizationId` | Withhold; never load into a product projection before authorization |
| Valid organization but no matching access record | Withhold |
| Shared Alpha password known | Still require Clerk identity and exact access record |
| Missing, expired, invalid, or provider-unverifiable Clerk session | Withhold |
| Email changed or reused | Identity remains based on stable provider subject, not email |
| Access record revoked or expired | Return `revoked` or `withheld`; suppress all new disclosure |
| Duplicate or conflicting active records | Withhold and emit an operational alert |
| Wrong experience or purpose | Withhold |
| Missing Runtime organization | Withhold without revealing its existence |
| Composition organization mismatch | Withhold the request |
| Missing, superseded, or invalid authority receipt | Suppress the composition; never fall back to Phase 8A output |
| Composition revision changed after decision | Recompute; stale decision is unusable |
| Policy version unavailable or malformed | Withhold |
| Access store unavailable or malformed | Withhold |
| Audit write fails during active enforcement | Fail closed; shadow may record an explicit unavailable result |
| Projection or communication receives mismatched decision identity | Preserve existing fail-closed behavior |
| Stale server or CDN response | Protected responses remain private and no-store |
| Revocation during an in-flight request | The already-started response is a bounded race; no later request may reuse it. Activation testing must measure this boundary |
| Rollback requested | Disable the active producer/path or deny; never restore an unauthenticated Phase 8A fallback |

The most important routing invariant is **authorize before loading and
projecting organization content**. A post-projection filter is too late for
tenant isolation.

## Activation sequence

Select the repository brief's **Sequence B**:

1. integrate Clerk authentication at the server boundary;
2. add the separate durable Alpha allowlist and bounded audit store;
3. implement the pure versioned producer in shadow;
4. run deterministic focused benchmarks and inactive end-to-end replay;
5. verify the route authorizes before organization load;
6. activate for a limited explicit Alpha allowlist behind a kill switch;
7. observe denial, revocation, audit, and isolation behavior; and
8. later decide whether evidence warrants migration to minimal membership or
   the full Governance Control Plane.

Narrative synthesis is not a technical prerequisite for safe disclosure.
Current exact-source projection and structured communication may support a
limited Alpha if the UI remains honest about unavailable synthesis. Narrative
quality is a separate product-readiness decision.

## Focused shadow benchmark

The next sprint should add a producer-focused shadow, not modify canonical
benchmark results. At minimum it must demonstrate:

- identical normalized inputs and time produce an identical decision;
- authenticated exact allowlist match is eligible;
- no identity, no record, mismatch, expiry, and malformed input are withheld;
- explicit revocation produces revoked and blocks every later request;
- guessed organization IDs never disclose or reveal tenant data;
- duplicate records fail closed;
- policy and access-record version changes alter decision identity;
- composition revision and authority changes invalidate prior decisions;
- historical missing authority stays suppressed;
- access-store, identity-provider, and audit failures fail closed;
- projection and communication cannot recover suppressed material;
- Runtime replay is byte-stable and unmodified;
- existing active product output remains unchanged while shadow is inactive;
- no cross-request cache survives revocation; and
- rollback disables enforcement without changing Runtime or canonical truth.

Promotion requires all safety cases to pass. Aggregate pass counts cannot hide
an isolation, revocation, identity, audit, or fail-closed failure.

## Scorecard and DEPS expectations

This decision changes no production score.

| Metric | Architecture expectation |
| --- | --- |
| Organizational Understanding | Unchanged; no cognition or truth mutation |
| User Intelligence | Not measured until real authorized users can evaluate usefulness |
| Collective Intelligence | Unchanged; no collaboration or contribution change |
| Governance Integrity | Potential improvement only after identity, durable access, revocation, audit, and fail-closed shadow evidence exist |
| System Sustainability | Potential improvement from one reusable producer boundary; reduced by premature coupling or duplicated policy |

Local Understanding Utility remains benchmark-only and is not evidence of
authorization safety. A DEPS report is not required for this decision-only
sprint. The next substantial implementation should use a compatible,
versioned DEPS manifest after native validation.

## Rollback boundary

The producer, access store, audit store, and route gate must be removable
without changing:

- Organization Runtime;
- canonical Organizational Understanding;
- authority-transition receipts;
- the disclosure enforcement contract;
- projection contracts;
- Product Communication contracts; or
- product view shape.

Before activation, rollback means removing the inactive shadow. After
activation, rollback means disabling the Alpha route or returning to a
deny-safe state behind the same authenticated access boundary. It must never
mean exposing the previous Phase 8A path without consumer authorization.

## Completed bounded implementation sprint

**Alpha Explicit Allowlist Disclosure Producer Shadow** is complete and
inactive. It demonstrates explicit typed identity, injected versioned access,
authorization before Runtime loading, exact receipt validation, deterministic
decision and audit provenance, existing disclosure enforcement, end-to-end
inactive delivery, revocation, and fail-closed behavior.

Together with the subsequent identity shadow, it still does not supply:

- live Clerk deployment configuration or real-session verification;
- durable access records;
- durable audit storage;
- an administrative grant or revocation path;
- production route integration; or
- activation authority.

The one next step is a read-only **Durable Alpha Access and Audit Storage
Decision Sprint**. Keep routes inactive and Clerk limited to authentication.
Do not implement storage automatically. Activation requires later, separately
authorized work and dependency-security remediation.

## Final answers

- **Canonical information remains:** Runtime organization identity and
  existence, canonical Organizational Understanding, composition revisions,
  and Phase 5A authority receipts.
- **Minimum Alpha access model:** explicit per-Clerk-user,
  per-Discovery-organization allowlist.
- **Identity source:** Clerk, required before hosted activation; not the shared
  Alpha password.
- **Access owner:** a separate Discovery application/governance persistence
  boundary, not Runtime or cognition.
- **Decision lifecycle:** pure request-time recomputation; no reusable
  persisted authorization decision.
- **Revocation:** durable access-record transition, immediate for subsequent
  requests, no canonical truth mutation.
- **Audit:** bounded append-only Alpha evaluation events required before
  enforcement.
- **Activation:** shadow first, then separate limited-Alpha authorization.
- **Current readiness:** the architecture is valid, but authenticated identity,
  durable access records, and bounded audit do not yet exist.

**B — DISCLOSURE ARCHITECTURE VALID; IDENTITY OR ACCESS SOURCE MISSING**
