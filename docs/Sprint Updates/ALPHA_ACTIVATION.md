# Discovery Alpha Activation — First Design Partner

## Decision

**B — ACTIVATION VALID; BOUNDED BLOCKERS REMAIN**

Discovery now has a reversible, feature-flagged activation of the complete
`Your Organization` delivery path:

```text
Clerk server authentication
  → durable Alpha allowlist and organization-scope check
  → one authorized Runtime load
  → authority-qualified disclosure
  → Organizational Understanding Projection
  → Product Communication Plan
  → Your Organization communication adapter
  → existing Your Organization UI
```

The local activation is valid. Production dependency remediation, bounded
operational logging, environment validation, provisioning, and recovery
tooling are complete. This is not yet evidence that a hosted design partner
can safely use the system: live Clerk deployment, hosted Neon storage, durable
hosted Runtime provider setup, monitoring configuration, and deployed rollback
verification remain blocking operational work.

Runtime persistence now sits behind one organization Runtime repository
contract. Local development, benchmarks, and replay retain the filesystem
implementation. Vercel preview and production require the private
`vercel-blob` implementation and reject filesystem or `/tmp` fallback.
Runtime JSON schema and bytes are unchanged. The activation loader continues
to resolve identity and durable access eligibility before it invokes the
configured repository.

## Activation Audit

| Component | State at audit | Activation result |
| --- | --- | --- |
| Clerk server identity resolver | Ready | Activated only for the flagged route; live tenant verification remains unmeasured |
| Alpha explicit allowlist producer | Ready | Activated without changing policy, policy version, or disclosure semantics |
| PostgreSQL access and audit repositories | Ready locally | Activated transactionally; hosted Neon roles, pooling, backup, and recovery remain unmeasured |
| Runtime loader | Needs bounded implementation | Added after authorization; exactly one organization-scoped load is permitted |
| Authority-qualified disclosure | Ready | Activated fail-closed; persistence still does not grant authority |
| Organizational Understanding Projection | Ready | Activated as the only projection compiler |
| Product Communication Plan | Ready | Activated from projection output |
| Your Organization communication adapter | Ready | Activated from the communication plan |
| Existing Your Organization route | Needs bounded implementation | Switched behind one server flag while preserving its UI and default Phase 8A rollback |
| Hosted provider and deployment operations | Still blocked | Not activated or claimed by this sprint |

## Ownership and Disclosure Boundaries

The route does not recreate cognition or product meaning.

- Runtime remains the canonical persistence boundary.
- Canonical Organizational Understanding remains the semantic owner.
- The allowlist producer decides consumer, organization, experience, and
  authority-qualified disclosure eligibility before Runtime is loaded.
- Projection selects and structures disclosed canonical material.
- Product Communication Plan establishes source-preserving communication
  priority.
- The communication adapter maps that plan into the existing page contract.
- UI composition owns only rendering, loading, unavailable, access-denied, and
  sign-out states.

No benchmark or research object is exposed. No Runtime, cognition, schema,
capability, or governance-policy contract was changed.

## Activated Components

Activation is controlled by:

```text
DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=true
```

When enabled:

- Clerk middleware protects `/your-organization`.
- Other product and product-mutation API surfaces remain unavailable to the
  bounded Alpha.
- Clerk identity is resolved only on the server.
- Durable access evaluation occurs before Runtime loading.
- Denial and successful disclosure attempts are append-only audited.
- Revocation takes effect on the next read.
- The requested organization must exactly match both the access record and the
  Runtime organization.
- Missing Runtime, projection, or communication fails closed with a clear page
  state.
- The existing page layout, navigation structure, and visual composition are
  preserved.
- An authenticated user can sign out from the product shell.

## Remaining Inactive Components

- Ask / Think
- Research
- Decisions
- Brief
- Experiments
- organization switching and creation
- product-mutation APIs
- broader Governance phases
- benchmark and research adapters
- any new cognition

Navigation remains visually unchanged as required, but destinations outside
`Your Organization` return an unavailable response while the bounded flag is
enabled. A design partner cannot yet conduct a full Research workflow.

## Failure Behavior

| Condition | Behavior |
| --- | --- |
| Signed out | Clerk authentication boundary prevents the Runtime path |
| Unauthorized consumer | Access denied; Runtime is not loaded |
| Revoked access | Access denied on the next read; Runtime is not loaded |
| Wrong organization | Access denied; no cross-organization Runtime read |
| Missing Runtime | Explicit Runtime unavailable state |
| Missing authority-qualified projection | Explicit projection unavailable state |
| Missing source-readable communication | Explicit communication unavailable state |
| Audit commit failure | No product output is returned |

The route does not substitute fixture, benchmark, research, or undisclosed
Runtime content for missing information.

## Rollback

Rollback is one environment change:

```text
DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=false
```

With the flag absent or false, the route returns to the committed Phase 8A
`ProductWorkspace` path, the Clerk provider and Clerk route middleware remain
inactive, and the legacy Alpha middleware behavior is preserved. Runtime data,
access records, and audit history require no migration or reversal. The new
activation modules are isolated from the default path.

## Validation

The bounded end-to-end validator uses PostgreSQL 17 and a deterministic
canonical Runtime fixture. It verifies:

- authenticated owner;
- unauthorized consumer;
- revoked consumer;
- wrong organization;
- missing Runtime;
- missing projection;
- missing communication;
- signed-out identity;
- append-only audit durability;
- flag-off rollback;
- exactly one authorized Runtime load;
- no Runtime mutation and deterministic replay.

The authenticated replay completed through disclosure, projection,
communication planning, communication adaptation, and page-view composition.
The canonical benchmark suite and Atlas Runtime replay also passed. Cognition,
projection, communication, Governance, storage, organization-experience,
typecheck, build, architecture, DEPS, and diff validation results are recorded
in the final sprint report and generated DEPS artifact.

The architecture verifier retains the repository's existing 295/302 result
(98%). Its seven pre-existing catalog findings were not introduced or changed
by this activation.

## Design-Partner Readiness Checklist

| Design-partner task | Assessment |
| --- | --- |
| Log in | Implemented; live Clerk tenant verification still blocks hosted use |
| Access their organization | Local isolation passes; Neon and hosted Runtime deployment still block hosted use |
| Understand Discovery's output | Supported when the Runtime contains authority-qualified canonical composition and source-readable linked conditions |
| Investigate | Inquiry opportunities can be read, but the Research experience intentionally remains inactive |
| Trust the results | Provenance, uncertainty, authority, access, and audit boundaries are preserved; evidence bodies not owned by the communication contract are not fabricated |
| Log out safely | Sign-out control is present; deployed-browser verification remains required |

## Remaining Blockers

Critical before first external access:

1. Provision and validate Neon with least-privilege application, migration, and
   administration roles.
2. Deploy and verify the Clerk production instance, callback/origin behavior,
   session invalidation, and logout.
3. Provision durable Runtime storage for the Vercel-connected deployment or
   select a supported host with a persistent Runtime volume.
4. Provision the design partner, organization-scoped access record, and hosted
   canonical Runtime using the existing administration boundary.
5. Configure production secrets and environment validation without committing
   credentials.
6. Configure monitoring and alerts, then demonstrate hosted backup/recovery,
   deployment smoke tests, and release rollback.

Bounded product limitations:

- investigation opportunities are visible, but the Research workflow remains
  intentionally inactive;
- an organization without canonical authority-qualified composition cannot be
  shown through the new path;
- live browser, provider, and hosted-database behavior is not demonstrated by
  local deterministic validation.

## Recommendation

Accept the activation implementation, keep its flag disabled in hosted
environments, and complete only the six operational blockers above. Then run a
deployed authenticated replay for the single provisioned design partner before
enabling the flag. Do not expand cognition, Governance, or product surface in
the interim.
