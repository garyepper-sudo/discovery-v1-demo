# Discovery Production Integration Manifest

## Approval

**A — CORRECTED CANDIDATE APPROVED FOR PRODUCTION**

- Production base: `848aa29f1fccbaf7a008a5990ebac09fce3bbbdb`
- Audited candidate parent: `d853db9d42d203292a310462c13dab65279063ee`
- Corrected candidate: the commit containing this manifest
- Corrected non-manifest diff SHA-256: `1b7277b808c813b523a37734108fc2a7187cff1f8efc592eb18376c7509f1807`
- Ancestry: `origin/main` is an ancestor
- Promotion: fast-forward `main` to the validated `production-integration` tip

A Git commit cannot contain its own SHA without changing that SHA. The remediation commit is therefore identified as the commit containing this manifest; the final report records its resolved SHA.

## Blocker resolutions

### Fail-closed exposure

Hosted preview and production now return 404 for the root, organization registry, governed product routes, legacy product APIs, and internal lab routes when activation is false or unset. When enabled, only `/your-organization` may proceed to Clerk and Discovery authorization.

`/api/health` remains public. `/alpha/*` remains the intentionally documented password-gated advisor prototype. Disabling activation can no longer reveal fixture-backed legacy product behavior.

### Runtime snapshots

| File | Classification | Disposition |
| --- | --- | --- |
| `Gary.json` | `UNVERIFIED_LOCAL_RUNTIME` | Removed; no code or benchmark references |
| `Gary_1.json` | `UNVERIFIED_LOCAL_RUNTIME` | Removed; no code or benchmark references |
| `Gary_2.json` | `UNVERIFIED_LOCAL_RUNTIME` | Removed; no code or benchmark references |
| `default-organization.json` | `PROVEN_SYNTHETIC_NONCANONICAL_FIXTURE` | Restored to `origin/main`; retained for development compatibility only |

The three ambiguous files were introduced together by `e526d0d`, contained accumulated multi-megabyte local Runtime state, and had no repository consumers. The default fixture is a long-lived generated benchmark/development Runtime with the explicit identifier `default-organization`; its candidate delta was generated Runtime churn. Missing organization identity now raises an error instead of selecting this fixture.

### Lab routes

| Route | Classification | Development | Preview | Production |
| --- | --- | --- | --- | --- |
| `/cognition-lab` | `INTERNAL_DEVELOPMENT` | Available | 404 | 404 |
| `/discovery-lab` | `BENCHMARK_OR_RESEARCH` | Available | 404 | 404 |
| `/executive-decision` | `ADVISOR_DEMO` | Available | 404 | 404 |

## Hosted route matrix

| Route | Activation disabled | Activation enabled |
| --- | --- | --- |
| `/` | 404 | 404 |
| `/organizations` | 404 | 404 |
| `/your-organization` | 404 | Clerk → Discovery authorization → Runtime |
| `/ask`, `/decisions`, `/research`, `/brief`, `/experiment` | 404 | 404 |
| Legacy product APIs | 404 | 404 |
| `/api/health` | Available; bounded readiness only | Available |
| `/alpha/*` | Password-gated advisor prototype | Password-gated advisor prototype |
| Lab routes | 404 | 404 |

Authorization continues to precede Runtime loading. Denied access invokes no Runtime loader, and the production loader establishes the durable authorization transaction before its Runtime callback.

## Final-tree file classification

| Category | Files |
| --- | ---: |
| Runtime | 8 |
| benchmark | 296 |
| cognition | 44 |
| communication | 3 |
| deployment | 10 |
| documentation | 166 |
| fixture | 2 |
| generated canonical artifact | 29 |
| governance | 7 |
| production application | 118 |
| projection | 1 |
| research | 7 |
| storage | 12 |
| validation | 26 |

The JSON manifest contains the deterministic path-level inventory of all 729 final-tree changes.

## Validation

| Gate | Result |
| --- | --- |
| npm ci | PASS |
| npm audit --omit=dev | PASS — 0 vulnerabilities |
| typecheck / build | PASS |
| Canonical benchmark integrity | PASS — 15/15 |
| Architecture | Accepted baseline — 295/302, 98%, seven findings |
| DEPS | PASS |
| Atlas / Ground Truth | PASS — canonical 100%; Northstar 75/100 |
| Cognition registry | PASS — 32 capabilities |
| Organization Experience | PASS — 10 + 11 + 3 |
| Projection / compatibility | PASS — 30/30; 43/43 |
| Product Communication / adapter | PASS — 60/60; 69/69 |
| Clerk / disclosure | PASS — 28/28; 61/61 |
| Authority / disclosure contract | PASS — 14/14; 14/14 |
| Alpha activation | PASS — 23/23 |
| PostgreSQL storage | PASS — 60/60 |
| Clean and idempotent migration | PASS |
| Deployment environment / database | PASS |
| Runtime backup and restore | PASS — byte-identical |
| Production reachability | PASS — 38/38 |
| git diff --check | PASS |

Validation-generated Runtime and registry churn is restored before approval. No failed gate is hidden by the accepted architecture baseline.

## Security and data posture

No tracked secret, provider credential, local database, backup, or deployment log containing a secret was found. The ambiguous Runtime snapshots are absent. Benchmark and research modules remain production-inactive. The default fixture cannot substitute for an authorized Runtime. The Alpha feature flag remains false by default and was not enabled in a hosted environment.

## Rollback

Set `DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED=false`; hosted product routes remain fail-closed. Code rollback can revert the remediation commit or redeploy the previous production SHA. Runtime and PostgreSQL recovery remain separate validated procedures.

## Remaining prerequisites

Repository blockers: none.

Hosted activation still requires separately provisioned Clerk, Neon access records, and canonical Runtime storage. Those are deployment prerequisites and are not activated by promoting this repository baseline.
