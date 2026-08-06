# Multi-user sandbox access

This development-only contract maps three exact Clerk development identities to one Discovery organization: `sandbox-northstar-implementation-services-001`. Clerk owns authentication and session identity. Discovery owns organization membership, explicit scoped grants, operations, revocation, and current authorization. Persona titles are descriptive and grant nothing.

The `sandbox-ceo` persona has the explicit organization scope; `sandbox-director` has Engineering and the assigned cross-functional initiative; `sandbox-manager` has Platform Delivery and the assigned initiative. Restricted People/HR scope is not implicit for any persona.

Supply actual IDs only through ignored local configuration: `DISCOVERY_SANDBOX_CEO_USER_ID`, `DISCOVERY_SANDBOX_DIRECTOR_USER_ID`, and `DISCOVERY_SANDBOX_MANAGER_USER_ID`. They must be three distinct exact Clerk development IDs. Never commit emails, IDs, credentials, browser state, or tokens.

The bounded operator provisions canonical organization membership through the existing Alpha access repository, inspects safe summaries, revokes/restores an exact persona, and resets only these three assignments. Commands are `sandbox:provision-multi-user-access`, `sandbox:inspect-multi-user-access`, `sandbox:revoke-multi-user-access`, `sandbox:restore-multi-user-access`, and `sandbox:reset-multi-user-access`; each requires `--organization-id` and revoke/restore also require `--persona`.

Provisioning is idempotent. Inspection prints only the persona key and label, masked user reference, exact organization, scope and operation identifiers, status, revocation flag, and deterministic assignment digest. It never prints email, a full Clerk ID, credentials, session data, or raw database rows.

Revocation performs the canonical one-way active-to-revoked transition and appends its immutable lifecycle event. Restoration never reactivates that record: it appends one active successor that explicitly references the exact revoked chain head and preserves access identity. Every later lifecycle time is deterministically derived from its exact predecessor, so repeated `active → revoked → restored → revoked → restored` cycles remain ordered without wall-clock races. Forked, cyclic, disconnected, stale, cross-user, cross-organization, and identity-changing chains fail closed. Reset restores the exact three-persona baseline without deleting Clerk users, organization state, Runtime, Drive content, or immutable lifecycle history; repeated reset produces the same assignment digests.

For acceptance, use separate browser profiles or fully signed-out sequential sessions, visit the development access or live Product route, and complete Clerk sign-out before switching accounts. Protected Product presentation is synchronously scrubbed before sign-out; hidden, frozen, BFCache-restored, and back/forward-restored documents revalidate current identity and authorization. The server uses private/no-store responses, accepts no persona query authority, and returns 404 in Production. Back navigation and a copied URL must return to Clerk sign-in after sign-out.

All three users share one canonical organization and model; only explicit scope and operation grants differ. `/your-organization`, Drive content, and Drive synchronization remain outside this contract. Live typed-path acceptance now exposes useful canonical Organizational Understanding for all three accounts through one Runtime read and a projection/Product-Communication-only presentation. Their substantive organization-wide content is currently identical; visible role labels are display metadata, and material differentiation remains open pending governed recipient-scope and nested-field disclosure semantics.

The completed disclosure benchmark selects canonical nested-field decisions
before projection but authorizes no implementation. Current assignments lack
explicit recipient-audience authority; default scopes and role labels remain
non-authoritative. Material differentiation stays open through the required
governance D → producer C → contract B sequence.
