# Discovery Platform Principles

Status: Canonical platform constitution

## Purpose

This document summarizes and operationalizes Discovery's existing product,
cognitive, Runtime, Shared Organizational Intelligence, Governance, and
Universal Intelligence Lifecycle canon.

It does not supersede detailed canonical documents. Authority is scoped:

- the Product Canon governs product identity, philosophy, user value, and
  product posture;
- Shared Organizational Intelligence governs the platform intelligence
  hierarchy and long-term cross-application direction;
- specific architecture canon governs its named technical domain, including
  security, Runtime, cognition, governance, tenancy, persistence, and the
  platform learning lifecycle;
- application-specific experience canon governs only its application scope.

Broad product prose cannot override a specific security, governance, Runtime,
cognition, tenancy, persistence, or lifecycle contract. When documents appear
to conflict, the document with explicit authority over that domain governs;
the conflict must be corrected rather than silently resolved by generality or
publication order.

Proposed changes to these principles require benchmark evidence, documented
rationale, and corresponding updates to every affected canonical document.

## Strategic definition

> Discovery is a platform that continuously builds shared organizational
> intelligence that becomes more valuable than the sum of its contributors,
> information, and experiences.

The Executive Operating System is the first major application built on that
foundation. Applications express the platform; they do not redefine it.

## The principles

### 1. Reduce uncertainty through governed learning

Discovery exists to continuously improve the quality of organizational
understanding by reducing material uncertainty through governed,
evidence-based learning.

More data, more output, more confident language, and more activity are not
success by themselves. Work should improve what an organization can understand,
decide, or learn.

Compliant: investigate the uncertainty most likely to change a decision.

Non-compliant: add a feed because more information appears inherently valuable.

### 2. Deliver value before requiring scale

Discovery must solve a meaningful problem for an individual, team, department,
initiative, or executive group before depending on organization-wide adoption.

Every interaction should provide immediate user utility and, when warranted,
improve future interactions. Users should never feel that their primary job is
feeding a model for someone else's eventual benefit.

Participation should compound value, but standalone usefulness comes first.

### 3. Build one Shared Organizational Intelligence

All applications contribute to and consume one organizational intelligence
foundation. They may provide different scopes, workflows, vocabulary, and
projections; they may not maintain independent organizational truth.

Compliant: an HR experience contributes governed evidence through canonical
ingestion and consumes shared mechanisms through projection.

Non-compliant: an HR application creates its own belief engine and organization
model.

### 4. Preserve contextual truth while synthesizing

Local intelligence remains valid within its supported context. Higher-level
synthesis may connect, qualify, or contrast local understanding, but must not
erase disagreement or generalize beyond evidence.

Shared intelligence does not imply shared visibility. What belongs to the same
organizational intelligence can still require different disclosure decisions.

Non-compliant: merge two teams' contradictory experience into one
organization-wide conclusion merely to simplify the narrative.

### 5. Keep one canonical Runtime

Organization Runtime is the canonical technical persistence boundary for
organizational intelligence and history. New applications, contexts, roles, and
providers do not create parallel or nested Runtimes.

Runtime does not own authentication, identity, membership, authorization,
governance policy, provider behavior, presentation, or UI workflow.

Never place a temporary responsibility in Runtime merely because persistence is
convenient.

### 6. Visibility never rewrites truth

Governance, membership, revocation, projection, and application changes affect
future eligibility and representation. They do not rewrite historical
organizational truth, prior reasoning, or prior disclosures.

Projection changes representation, not meaning. Governance determines permitted
use, not what the organization should believe.

### 7. Cognition alone owns reasoning

Canonical cognitive producers own organizational interpretation. Applications,
projections, providers, Governance, connectors, and retrieval layers must not
recreate or silently modify reasoning.

Roles and industries may affect vocabulary, context, workflow, access, and
presentation. They do not change the semantics of evidence, contradiction,
confidence, mechanisms, beliefs, theories, or learning.

Non-compliant: create separate executive, HR, and operations cognition.

### 8. Extend before expanding architecture

Search for an existing capability, cognitive object, producer, owner, and
Runtime destination before introducing anything new. Prefer composition,
extension, exposure, or projection over another capability or layer.

A new cognitive capability or architectural owner requires a measured gap,
benchmark evidence, a distinct responsibility and lifecycle, and proof that
existing owners cannot represent it safely.

Architectural neatness or speculative future utility is not evidence.

### 9. Governance decides; boundaries enforce

The Governance Control Plane owns contextual authorization and disclosure
decisions. Contribution, retrieval, provider, projection, and export boundaries
enforce those decisions.

No boundary may invent local policy, and no allow decision bypasses
enforcement. Security-sensitive ambiguity fails closed.

Compliant: exclude denied evidence before cognition or provider inclusion.

Non-compliant: send confidential evidence to a provider and ask it to redact the
answer afterward.

### 10. Security and governance remain distinct

Security establishes system and tenant isolation, authenticates actors, protects
infrastructure, and prevents unauthorized technical access. Governance
determines permissible organizational use and disclosure within those secure
boundaries.

Tenant isolation is absolute. Authentication or organization membership alone
does not prove purpose-limited authorization.

Neither responsibility substitutes for the other.

### 11. Access follows purpose, context, sensitivity, and policy

Organizational title and seniority never imply broader raw-data access.
Authorization depends on the current principal, membership, context, purpose,
subject, sensitivity, policy, destination, and time.

A specialist may be authorized to inspect restricted evidence while a more
senior principal receives only a sanitized aggregate.

Revocation changes future access without rewriting historical truth.

### 12. Keep epistemic and governance lineage separate

Cognitive lineage explains how Discovery formed meaning. Governance lineage
explains which protected subjects, contexts, transformations, policies, and
disclosures constrain use.

Both may reference the same stable identities, but neither replaces the other.
Governance events are not cognitive evidence; cognitive confidence is not an
access decision.

### 13. Every application follows one learning lifecycle

Every application specializes:

```text
Frame → Prioritize → Acquire → Interpret → Integrate → Apply → Learn
```

Applications may tailor interaction and action. They may not invent independent
learning loops, evidence standards, truth stores, or reasoning semantics.

Unknowns, contradictions, and knowledge gaps are first-class parts of the
experience—not defects to hide with confident output.

### 14. Acquire information to answer an objective

Acquisition follows a bounded understanding objective and a prioritized
knowledge gap. Information should be sought because its expected understanding
gain justifies its cost, delay, sensitivity, and risk—not merely because it is
available.

Prefer targeted retrieval over indiscriminate scanning. Retrieve and filter
before expensive interpretation. Do not repeatedly process unchanged
information without a material reason.

Non-compliant: continuously scan every Slack message in case something becomes
useful.

### 15. Connectors transport; they do not decide truth

A connector cannot exceed the source access granted to the requesting principal
and purpose. It preserves stable source identity, provenance, updates,
deletions, checkpoints, and idempotency.

Retrieved material becomes a governed contribution and then validated evidence
before influencing intelligence. Synchronization is not cognition.

Connectors do not write cognitive objects directly or create connector-specific
truth stores.

### 16. Stable identity protects history

Canonical identities survive retries, reordering, renaming, organizational
change, merging, splitting, and replay through explicit lineage.

Duplicate contribution or derivation paths do not create false corroboration.
Names and current reporting structures are attributes, not durable identity.

Human correction appends or supersedes with provenance; it does not silently
rewrite prior outputs.

### 17. Material outputs must be reproducible

Every material recommendation, answer, decision, simulation, or disclosure
should be traceable to the relevant versions of evidence, cognitive reasoning,
organizational state, governance policy and decision, projection, and provider
behavior where used.

Important decisions are immutable, versioned, and reproducible. Traceability
must not expose protected provenance to an unauthorized audience.

### 18. Applications own utility and interaction

Applications translate canonical cognition rather than presenting it
directly. Product Translation must be deterministic, lineage-preserving,
confidence-preserving, and non-authoritative. Applications may communicate
Supported, Provisional, or Insufficient understanding and should optimize for
Maximum Truthful Utility without changing cognition or thresholds.

Product-owned Evidence Roles may classify the semantic purpose of admitted
Evidence for communication. They remain outside canonical cognition.

Applications turn shared intelligence into first-class work: understanding,
conversation, research, decisions, experiments, execution, review,
communication, and learning.

They remain coherent manifestations of one platform. Projection preserves the
underlying meaning, and progressive disclosure minimizes unnecessary reading
while keeping important reasoning defensible.

An interface that merely reports stored information is insufficient; the
interaction should help the user accomplish meaningful work.

### 19. Providers execute bounded contracts

Discovery owns reasoning tasks, schemas, validation, provenance, fallback, and
canonical adoption. AI providers are replaceable execution dependencies.

Provider prompts receive only policy-approved content. Provider output cannot
elevate disclosure, directly mutate Runtime, or become organizational truth
without canonical validation.

Provider failure degrades to an equally or more restrictive approved behavior,
or stops safely. It never falls back to a less-governed representation.

### 20. Human authority remains explicit

Discovery improves human judgment; it does not replace accountable
decision-makers. Recommendations, human commitments, execution, and observed
outcomes remain distinct.

Users can challenge, correct, reject, or qualify Discovery's understanding.
Supported disagreement and contradiction remain visible. Human status does not
make an assertion true, but accountable correction becomes governed evidence
for future learning.

### 21. Learn from outcomes without rewriting history

Actions and completed workflows do not prove success. Outcomes re-enter through
governed acquisition, evidence formation, cognition, integration, and learning.

Failed predictions, rejected recommendations, negative experiments, and
unchanged understanding are valid learning results.

Every meaningful interaction should improve future understanding when evidence
supports a change; no-change is preferable to fabricated learning.

### 22. Trust requires isolation, audit, and safe failure

Tenant isolation is absolute. Contribution, retrieval, provider inclusion,
projection, export, and sensitive failure behavior are governed and auditable.

Security-sensitive failures default to denial, quarantine, or an equally
restrictive experience. Confidence, counts, absence, refusal wording,
suggestions, and response availability can leak information and require
governance.

Data may be revoked, anonymized, or removed under explicit policy without
corrupting reasoning identity, unrelated history, or audit integrity.

## Boundary decision rules

Before material work crosses a platform boundary:

1. Search existing canonical capabilities, objects, producers, owners,
   destinations, and contracts.
2. Determine whether composition, extension, projection, or exposure solves the
   need.
3. Name the one platform boundary that owns the responsibility and every
   boundary that merely enforces or consumes it.
4. Require benchmark evidence before adding a capability, owner, store,
   pipeline, or canonical object.
5. Do not place identity, permissions, workflow, provider, or presentation
   state in Runtime for convenience.
6. Do not create role-, application-, or industry-specific cognition.
7. Do not bypass Governance at contribution, retrieval, provider, projection,
   or export boundaries.
8. Distinguish reversible product experimentation from canonical architecture
   and label it accordingly.
9. Label benchmark-only wrappers, fixtures, policies, and simulated behavior;
   never claim them as production capability.
10. Preserve unrelated dirty work and pre-existing validation findings during
    narrow sprints.

If the correct owner cannot be identified, stop implementation and perform a
benchmark-first architecture investigation.

## Proposal pressure test

| Future proposal | Governing principle | Decision |
| --- | --- | --- |
| Store permissions in Runtime | Keep one canonical Runtime; Governance decides | Reject: Governance Store/control plane owns authorization |
| Create separate HR cognition | Build one Shared Intelligence; Cognition owns reasoning | Reject: specialize application/context, reuse cognition |
| Scan all Slack continuously | Acquire to answer an objective | Reject: use bounded, governed, expected-value acquisition |
| Show confidential raw evidence to the CEO | Access follows purpose/context/sensitivity/policy | Reject: seniority is not authorization |
| Let an application maintain its own organizational truth | Build one Shared Intelligence | Reject: contribute through canonical paths |
| Let provider output determine disclosure | Governance decides; providers execute bounded contracts | Reject: provider cannot elevate access |
| Merge local disagreement into one organization-wide conclusion | Preserve contextual truth | Reject: retain supported contradiction and scope |
| Create a capability without benchmark evidence | Extend before expanding architecture | Reject until a distinct measured gap is proven |
| Reprocess unchanged connector data on every run | Acquire information to answer an objective | Reject absent material source or objective change |
| Hide a failed prediction | Learn without rewriting history | Reject: preserve and learn from the outcome |
| Add a polished dashboard with no workflow | Applications own utility and interaction | Reject unless it supports meaningful user work |
| Use a less-governed fallback when a provider fails | Providers execute bounded contracts; trust requires safe failure | Reject: stop or degrade restrictively |

## Canonical interpretation notes

Existing canon contains two phrases that require disciplined interpretation
rather than architectural change:

- **“Discovery should never stop learning”** does not mean every interaction
  must mutate organizational truth. The Universal Intelligence Lifecycle
  explicitly permits no-change when evidence does not warrant revision.
- Early multi-tenancy language describes organization ownership and an MVP
  trusted-team assumption. It does not make all organizational evidence visible
  to every executive. The more specific Governance canon controls contextual,
  purpose-limited disclosure and seniority-independent access.

These are scope clarifications, not unresolved architectural conflicts.

## Change control

These principles should change rarely. A proposed change must include:

- the observed benchmark or production evidence;
- the principle that prevents the desired behavior;
- why a more specific contract, composition, extension, or exception is
  insufficient;
- affected owners, objects, Runtime destinations, and enforcement boundaries;
- migration and regression impact;
- updates to all affected detailed canon.

Product experimentation may test alternatives without changing these
principles, provided it is clearly labeled, reversible, governed, and does not
claim canonical or production capability.

## Explicitly not implemented

This constitution adds no platform layer, object, capability, operating system,
store, pipeline, Runtime field, Governance contract, provider behavior,
connector architecture, observability architecture, route, UI, benchmark, or
production behavior.
