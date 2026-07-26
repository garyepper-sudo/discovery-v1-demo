# Discovery Alpha Readiness Assessment

**Assessment date:** 2026-07-26
**Repository HEAD:** `a65391c30e62df02787c913db8b27a1eff021345`
**Branch:** `sprint-79-organization-experience`
**Decision:** Not ready for an unsupervised external Alpha deployment

## Executive conclusion

Discovery has enough product and cognition to begin customer learning, but it
does not yet have a safe hosted customer boundary.

The shortest path is not more general Discovery 2 cognition or a broader
Governance Control Plane. It is a bounded deployment-integration program:

1. canonize the validated PostgreSQL foundation;
2. remediate the known Clerk and Next security blockers;
3. make Runtime durable in the selected hosted environment;
4. activate the already-built identity, access, disclosure, and audit chain
   across every customer route and mutation endpoint;
5. provision and verify one isolated customer organization;
6. add the minimum operational controls and run a deployed end-to-end gate.

Supervised design-partner demonstrations with synthetic or customer-approved
non-sensitive material can begin now. Real customer data should not be placed
in the current deployment.

## Repository reconstruction

The four committed milestones are:

- Discovery 2 Foundation — `e39be46`;
- Projection Foundation — `24c90a4`;
- Product Communication Foundation — `2f57d7e`;
- Alpha Governance Identity Foundation — `a65391c` at current `HEAD`.

At assessment time, the Durable Alpha PostgreSQL Storage Foundation was
implemented, validated, and documented in the unstaged worktree rather than
the assessed `HEAD`. The subsequent storage-foundation milestone commit
canonizes that complete package. It remains inactive in the product after
canonization; deployment still requires the bounded Alpha Readiness sequence.

## Current architecture

The implemented cognitive and product flow is:

```text
Evidence
→ observations and structured reasoning
→ completed Explanations
→ canonical Organizational Understanding
→ Executive Assessment
→ projection
→ Product Communication
→ product views
```

Organization Runtime remains the canonical technical persistence boundary for
organizational cognition. It currently persists JSON files under
`.discovery-runtime/organizations`. On Vercel it redirects that directory to
`/tmp/.discovery-runtime/organizations`, which is ephemeral and
instance-local.

The inactive customer-governance flow is:

```text
Clerk server identity
→ PostgreSQL access chain
→ pure Alpha access preflight
→ Runtime load
→ disclosure decision
→ append-only PostgreSQL audit
→ projection and communication
→ candidate product view
```

That flow is validated in shadow but imported by no active product route.

## Capability inventory

### Cognition

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Evidence ingestion and organizational observation inference | Production Active | Registered CAP-PER-001/002 producers |
| Mechanism, belief, theory, and organizational condition inference | Production Active | CAP-UND-001 through CAP-UND-004 |
| Completed organizational Explanations with structured ancestry and comparative Evidence roles | Production Active | Discovery 2 Phase 1 and Explanation completion |
| Canonical Organizational Understanding ownership and authority receipts | Production Active | Phase 4C and Phase 5A |
| Executive Assessment | Production Active | CAP-UND-005 |
| Organizational belief evolution and learning profile | Production Active | CAP-LRN-001/002 |
| Concept formation, theory reflection, and investigation opportunities | Production Active | CAP-ABS-001 and CAP-SELF-001/002 |
| Prediction, prediction reflection, and outcome evaluation | Production Active | CAP-PRD-001/002 and CAP-ADP-001 |
| Simulation, intervention modeling, decision orchestration, ranking, recommendations, recording, executive work, longitudinal judgment, and optimization | Production Active | Registered CAP-SIM, CAP-DEC, and CAP-OPT producers |
| Conditional completed-Explanation adjudication | Benchmark Only | Contract and production shadows exist; activation remains blocked |
| Localized nonlinear cognition adapter | Research Only | Benchmark research adapter; no production imports |
| Bounded Intelligence Scope and later Discovery 2 phases | Planned Only | Sequential program phases remain gated |

### Runtime

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Multi-organization Runtime schema and lifecycle | Production Active | `OrganizationRuntime` and organization IDs |
| Runtime load, normalize, save, persist, reset, and organization listing | Production Active | Filesystem `organizationStateStore` and registry |
| Canonical Organizational Understanding persistence | Production Active | Phase 4C additive Runtime field |
| Hosted durable Runtime persistence | Planned Only | Vercel uses ephemeral `/tmp`; no durable hosted adapter exists |
| Concurrent write control and deployed recovery | Planned Only | No locking, revision compare-and-swap, hosted backup, or restore path |

### Product

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Runtime-backed Your Organization, Ask, Research, Decisions, Experiment, Brief, and organization list | Production Active | Product routes and Runtime view builders |
| Adding context, challenging an understanding, saving an insight, and creating a decision | Production Active | `/api/product-interaction` writes Runtime |
| Executive decision workflows and recording | Production Active | Decision routes and cognition |
| Organizational Understanding Projection | Inactive Shadow | Pure compiler passes its focused gate |
| Structured Product Communication and Your Organization communication adapter | Inactive Shadow | Validated but not active |
| Deterministic Experience Alpha scenes | Inactive Shadow | Explicitly fixture-backed prototype |
| Customer-safe product routing | Planned Only | Product routes are not protected by Clerk or Discovery authorization |

### Governance

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Explicit authority transitions | Production Active | Phase 5A |
| Disclosure eligibility and revocation contract | Production Active | Pure canonical contract |
| Explicit Alpha allowlist producer | Inactive Shadow | `61/61`; no route import |
| Durable access/disclosure transaction orchestration | Inactive Shadow | PostgreSQL shadow; no product import |
| Broader Governance Control Plane | Planned Only | Deliberately not required for limited Alpha |

### Storage

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Local filesystem Runtime store | Production Active | Local and benchmark usage |
| PostgreSQL schema, constraints, migration, access repository, lifecycle, and append-only audit | Inactive Shadow | PostgreSQL 17.10 gate passes `60/60` |
| Local logical backup/restore | Inactive Shadow | Restore preserves records and triggers |
| Neon provisioning, pooling, hosted roles, PITR, and environment wiring | Planned Only | No hosted database was created |

### Authentication

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Shared-password HMAC cookie for `/alpha/**` prototype | Production Active | Middleware protects only prototype routes |
| Official Clerk server identity resolver | Inactive Shadow | `28/28`; no active route import |
| Clerk provider, Clerk middleware enforcement, deployed sessions | Planned Only | Root layout and middleware do not activate Clerk |
| Identity-bound organization access | Planned Only | Product currently accepts organization ID from query/body input |

### Administration

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Access inspect, grant, revoke, and supersede CLI | Inactive Shadow | Exact-ID, confirmation, idempotency, separate credential |
| Migration up, status, and guarded local reset | Inactive Shadow | Local PostgreSQL validated |
| Hosted operator access, break-glass procedure, support tooling | Planned Only | No deployed runbook or operator environment |

### Validation

| Capability | State |
| --- | --- |
| Typecheck and production build | Production Active |
| Cognition registry validation | Production Active |
| Architecture verification | Production Active with seven known findings (`295/302`) |
| Product, Runtime, projection, communication, Clerk, disclosure, and storage focused gates | Production Active as validation infrastructure |
| Deployed browser tenant-isolation and failure testing | Planned Only |
| Load, longevity, connection-pool, and multi-instance tests | Planned Only |

### Benchmarks

| Capability | State |
| --- | --- |
| Atlas and registered cognitive benchmark suites | Benchmark Only |
| Comparative Evidence, ownership, authority, disclosure, projection, communication, and product compatibility gates | Benchmark Only |
| Competing Explanation adjudication | Benchmark Only |
| Phase 4B compatibility assertion | Benchmark Only and obsolete after Phase 4C; known failure at line 509 |
| Organizational Understanding research framework and nonlinear adapter | Research Only |

### DEPS

| Capability | State |
| --- | --- |
| Five-metric engineering progression reporting | Production Active as engineering instrumentation |
| Deterministic report validation and rendering | Production Active |
| PostgreSQL foundation report | Inactive Shadow worktree evidence |
| User Intelligence and Collective Intelligence measurement | Planned Only / Not Measured |

### Deployment

| Capability | State | Evidence boundary |
| --- | --- | --- |
| Next.js production build | Production Active |
| Vercel-aware application behavior | Production Active but insufficient | Runtime switches to ephemeral `/tmp` |
| Deployment manifest, CI deployment workflow, health/readiness endpoints, release promotion, and automated rollback | Planned Only | No repository evidence |
| Hosted secrets and database configuration | Planned Only | Only an empty `.env.example` contract exists |

## Hosted Alpha readiness

Classification means:

- **A — Ready:** safe enough for limited Alpha without material implementation.
- **B — Ready after bounded implementation:** owner and architecture are known;
  a narrow integration or operational task remains.
- **C — Significant work remains:** the current implementation cannot safely
  satisfy the requirement.

| Area | Rating | Repository assessment |
| --- | --- | --- |
| Authentication | B | Clerk server identity is implemented in shadow, but provider/middleware and deployed-session verification are absent. |
| Authorization | B | Access, disclosure, revocation, and audit contracts exist; they must be activated across all reads and writes. |
| Organization creation | C | Creation is not identity-bound or governed, and durable hosted Runtime creation is unavailable. |
| Organization selection | C | Product routes accept `organizationId` from query parameters and API bodies without access verification. |
| Runtime persistence | C | Local JSON works, but Vercel `/tmp` is ephemeral, instance-local, and unsuitable for customer truth. |
| Access storage | B | Local PostgreSQL foundation is valid; Neon and live credentials remain unprovisioned. |
| Audit storage | B | Append-only semantics are valid locally; hosted privileges and operational retention remain unverified. |
| Projection | A | Runtime-backed product projection works; canonical projection remains an optional inactive replacement. |
| Communication | B | Existing product communication is usable, but the structured canonical contract remains inactive. This is not a deployment blocker if current semantics are accepted explicitly. |
| Product experience | B | Core understanding and work flows exist, but empty/error states and some prototype language require bounded customer-path review. |
| User onboarding | C | No Clerk-bound invitation-to-organization provisioning flow exists. |
| Administration | B | Safe CLI exists in shadow; hosted operator access and procedures remain. |
| Operations | C | No deployed service ownership, incident procedure, health model, or release process is evidenced. |
| Logging | C | Ad hoc `console` output exists; no structured, redacted, organization/request-correlated operational logging exists. |
| Monitoring | C | No uptime, error, database, Runtime-write, audit-failure, or saturation monitoring exists. |
| Backup | C | Local logical restore is proven; customer Runtime has no hosted backup, and Neon PITR is unconfigured. |
| Recovery | C | No deployed Runtime restore, database PITR exercise, recovery objective, or incident drill exists. |
| Security | C | Known Clerk/Next advisories, unauthenticated product APIs, query-selected tenants, and ephemeral Runtime prevent Alpha. |
| Dependency health | C | All-dependency audit is 23 findings; production-only is 3 high and 2 critical. |
| Deployment | C | The application builds, but no safe stateful deployment topology or release pipeline is defined. |
| Secrets | B | Names and separation are defined; hosted secret creation, rotation, and access control remain. |
| Environment configuration | B | Database contract exists; complete hosted validation and fail-closed startup/readiness checks remain. |
| Migration tooling | B | Migration up/status and reviewed SQL exist; hosted migration role, forward-repair, and release execution remain. |
| Rollback | B | Code and storage rollback boundaries are documented; deployed rollback and retained-data behavior remain untested. |
| Developer tooling | A | Build, typecheck, focused validators, architecture inventory, startup brief, and DEPS are substantial. |
| Supportability | C | No customer support channel, operator diagnostic view, incident triage, or safe data export exists. |
| Testing | B | Deterministic local coverage is strong; deployed identity, browser isolation, multi-instance, and operational failure tests remain. |
| Customer documentation | C | Prototype access notes exist, but customer onboarding, data handling, limitations, support, and recovery expectations do not. |

## Alpha blockers

### Critical blockers

1. **Durable hosted Runtime.** Customer organizational truth cannot live in
   Vercel `/tmp`. Either add a durable Runtime persistence adapter with
   concurrency/version protection or deploy the existing filesystem Runtime
   on a deliberately stateful single-instance service with an attached,
   backed-up volume. This must be resolved before customer data.
2. **Activate identity and authorization on every customer boundary.** Enable
   Clerk server verification, resolve organization access from PostgreSQL,
   run disclosure/audit before returning protected cognition, and authorize
   every mutation API. Do not trust query/body `organizationId`.
3. **Remediate the known production dependency advisories.** Clerk and Next
   must be upgraded to reviewed fixed versions and the full regression set
   rerun before activation.
4. **Provision and verify hosted PostgreSQL.** Create Neon in the selected
   region, configure separate roles and secrets, apply the reviewed migration,
   verify append-only privileges and pooling, enable PITR, and perform a
   hosted restore exercise.
5. **Create one governed organization provisioning path.** An operator may
   perform the first Alpha setup, but the Clerk user, access grant, exact
   organization, and durable Runtime must be created as one reviewed runbook.
6. **Establish minimum production operations.** Add health/readiness checks,
   structured redacted error logging, alerting for failed Runtime/audit writes
   and service/database availability, deployment rollback, and tested
   recovery.
7. **Pass a deployed Alpha acceptance gate.** Test real Clerk sessions,
   unauthorized/expired/revoked users, cross-tenant URL and API attacks,
   concurrent mutations, audit failure, Runtime failure, secret absence,
   deployment rollback, and browser behavior.

### Strong recommendations

1. Review the first-customer path and remove fixture/prototype ambiguity.
   `/alpha/**` is explicitly a deterministic fixture and must not be presented
   as the customer's living Organization Model.
2. Provide a short customer onboarding and data-handling guide covering
   supported inputs, what Discovery stores, current limitations, access,
   support, and deletion/export expectations.
3. Add an operator runbook for grant, revoke, migration, backup, restore,
   incident response, and customer offboarding.
4. Resolve or formally waive the seven known architecture-verifier findings
   and retire the obsolete Phase 4B command from any release gate.
5. Perform a bounded security review of mutation endpoints, upload limits,
   prompt/provider data flow, rate limiting, and logs before accepting
   sensitive evidence.

### Nice-to-have

- Self-service organization creation and invitations.
- Rich administrative UI.
- Full roles, departments, teams, and Governance Control Plane.
- Automated retention and deletion jobs beyond the first-customer manual
  procedure.
- Numerical User Intelligence or Collective Intelligence reporting.
- Additional Discovery 2 cognition or research promotion.

## Product assessment

### Can a customer understand their organization?

**Yes, when a populated Runtime already exists.** Your Organization exposes
current understanding, explanations, Evidence, uncertainty, conditions,
organizational state, investigations, changes, and model evolution. Ask,
Research, Decisions, Brief, and Experiment reuse the same organization
context.

The limitation is initialization: the repository does not show a safe,
customer-ready path from invited user and source material to a durable,
governed first Runtime.

### Can a customer add context and challenge assumptions?

**Partially.** Product interactions can save insights, challenges, and
decisions through `/api/product-interaction`; the cognitive pipeline can
advance Runtime. Session-only brainstorming is clearly marked provisional.

However, the write route is unauthenticated, organization identity is supplied
by the client, write failures are mostly silent in the UI, and multi-instance
concurrency is not controlled. The capability exists, but it is not safe for
external use.

### Can a customer investigate?

**Yes functionally, but not yet safely.** Investigation opportunities,
Research, Ask, and investigation APIs exist. Some older APIs appear parallel
to the governed product path and are also unauthenticated. The external Alpha
should expose one reviewed path and disable or protect legacy/lab endpoints.

### Can a customer follow changes?

**Partially.** Runtime contains learning and evolution structures, and the
product surfaces recent changes and session impact. Continuity depends on
durable Runtime; current hosted `/tmp` behavior makes the feature unreliable.

### Can a customer trust the output?

**Architecturally promising, operationally not yet.** The product preserves
Evidence, explanations, uncertainty, confidence, authority, and disclosure
boundaries. Several views explicitly say when Runtime information is
unavailable.

Trust is weakened by:

- fixture-backed `/alpha/**` sitting beside Runtime-backed product routes;
- fallback copy that can look like product content rather than a system
  limitation;
- no visible authenticated identity or access scope;
- no customer-visible audit or source inspection at the activated boundary;
- no durable hosted continuity;
- silent interaction failures;
- known dependency vulnerabilities.

### Prototype signals

The strongest prototype signals are the explicit deterministic-fixture Alpha,
query-string organization switching, local filesystem organization registry,
unprotected lab and mutation APIs, absent customer onboarding, sparse failure
feedback, and missing operational support.

These are bounded integration issues, not evidence that the core product needs
another feature cycle.

## Operational assessment

Discovery can be built and started, and its local deterministic validation is
strong. It cannot yet be operated as a reliable customer service.

- **Deploy:** Build succeeds, but the current Vercel-aware persistence choice
  loses Runtime durability.
- **Monitor:** No health, telemetry, alert, or service-level instrumentation.
- **Recover:** Governance storage has local restore evidence; hosted database
  PITR and Runtime recovery are absent.
- **Administer:** The access CLI is suitable for a limited Alpha after hosted
  credential and operator controls are established.
- **Support:** There is no diagnostic/support runbook, safe customer export,
  incident workflow, or stated response channel.

The minimum operational posture is one known owner, one supported deployment
topology, one customer organization, explicit health/alerts, tested backup and
restore, a rollback command, and a written incident/customer-support path.

## Dependency assessment

Current pinned application dependencies include Clerk `6.10.0` and Next
`14.2.18`. The existing audit evidence reports:

- all dependencies: 4 moderate, 17 high, 2 critical;
- production-only: 3 high and 2 critical.

The critical/high production findings are in the existing Clerk/Next path, not
the new PostgreSQL packages. They must be remediated before external Alpha.

Drizzle ORM, Neon serverless, and `postgres` do not change that recommendation.
Drizzle Kit adds four moderate development-tool findings; those may wait if
they remain excluded from the production artifact and are tracked. The
storage packages themselves do not justify postponing the bounded storage
activation work.

No automatic audit fix should be used. Upgrade Clerk and Next deliberately,
review the lockfile and middleware/API behavior, rebuild, inspect client
bundles, and rerun identity, storage, disclosure, product, Runtime, and browser
isolation regressions.

## Qualitative readiness

| Category | Readiness | Assessment |
| --- | --- | --- |
| Architecture | Ready after bounded implementation | Core ownership is coherent; hosted Runtime durability and activation wiring remain. |
| Product | Ready for supervised customer discovery | The useful loop exists for a populated Runtime, but onboarding and failure handling remain incomplete. |
| Governance | Ready after bounded implementation | Contracts and storage are strong in shadow; enforcement is not active. |
| Operations | Significant work remains | Monitoring, recovery, support, and release operation are missing. |
| Deployment | Significant work remains | The current hosted persistence topology is unsafe. |
| Customer Readiness | Not ready for unsupervised real data | A governed, durable, supported customer boundary does not yet exist. |

## Shortest path to first external Alpha deployment

1. Review and commit the existing PostgreSQL foundation as one isolated
   milestone.
2. Upgrade Clerk and Next to reviewed secure versions; rerun the complete
   regression and dependency audit.
3. Choose and implement the minimum durable Runtime deployment boundary:
   durable adapter or intentionally stateful single-instance host with
   versioned writes and backup.
4. Provision Neon, roles, secrets, migration, PITR, and monitoring in the
   selected hosted environment.
5. Activate Clerk identity, exact access lookup, disclosure, and audit on the
   Runtime-backed product read path and every mutation endpoint.
6. Add operator-led first-organization provisioning, grant/revoke, and
   customer offboarding runbooks.
7. Protect or disable legacy, lab, and fixture routes that are outside the
   supported customer path.
8. Add minimum health, structured logging, alerts, backup/restore, and
   deployment rollback.
9. Run deployed browser and API isolation tests with two organizations,
   including revoked, expired, cross-tenant, audit-failure, Runtime-failure,
   and concurrent-write cases.
10. Conduct a supervised first-customer onboarding using approved,
    non-sensitive initial evidence.
11. **First external Alpha deployment.**

## Risks

- A rushed route activation could protect reads while leaving mutation or
  legacy APIs unauthenticated.
- A successful Vercel request can create the illusion of persistence while
  `/tmp` data disappears or diverges across instances.
- Enabling PostgreSQL access without durable Runtime would secure entitlement
  to an unreliable organizational truth store.
- Product confidence language can outpace customer trust if source access,
  limitations, failures, and data handling are not explained.
- Continuing cognition work before deployed customer learning would optimize
  an already substantial engine without resolving the actual Alpha bottleneck.

## Founder recommendation

If I were the technical founder, I would stop expanding general infrastructure
and Discovery 2 cognition now. I would begin putting Discovery in front of
Alpha users immediately in supervised, non-sensitive design-partner sessions,
while the team completes the seven critical deployment gates above.

I would not yet allow an external customer to use the system independently or
store real organizational data. The repository demonstrates that Discovery
can produce and present meaningful organizational understanding. It does not
yet demonstrate durable hosted organizational truth, enforced tenant access,
secure dependencies, or recoverable operations.

The right move is therefore customer contact now, external production access
after a short bounded readiness sprint—not another architecture campaign.

**ALPHA READINESS ASSESSMENT COMPLETE**
