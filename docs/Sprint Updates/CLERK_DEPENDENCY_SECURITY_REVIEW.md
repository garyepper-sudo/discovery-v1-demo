# Clerk Dependency Security Review

**Status:** Bounded audit recorded; remediation required before hosted activation
**Audit command:** `npm audit --json`
**Audit result:** 19 vulnerable package entries — 17 high, 2 critical
**Automatic remediation:** Not run

## Installed versions

| Package | Relationship | Installed |
| --- | --- | --- |
| `@clerk/nextjs` | direct production | `6.10.0` |
| `next` | direct production | `14.2.18` |
| `react` | direct production | `18.3.1` |
| `react-dom` | direct production | `18.3.1` |
| `@clerk/backend` | Clerk transitive production | `1.34.0` |
| `@clerk/shared` | Clerk transitive production | `2.22.1` and `3.47.8` |

`@clerk/nextjs@6.10.0` was selected because its peer range supports the
repository's current Next and React versions. It is inactive and imported only
by a `server-only` adapter.

## Findings

The table records npm's vulnerable package entries rather than claiming 19
independent exploitable application paths.

| Package | Direct | Severity | Path | npm remediation | Reachability assessment | Recommendation |
| --- | :---: | --- | --- | --- | --- | --- |
| `@clerk/nextjs` | yes | critical | production, inactive adapter | `6.39.6`, non-major; also requires compatible Next patch | Middleware bypass and verification advisories are relevant to future activation; active middleware does not use Clerk today | Remediate before activation |
| `@clerk/shared` | no | high | production via Clerk | upgrade Clerk to `6.39.6` | Cookie helper is installed; no Clerk client/provider is active | Remediate before activation |
| `js-cookie` | no | high | production via Clerk shared | upgrade Clerk to `6.39.6` | Client Clerk integration is inactive, reducing current reachability; not proof of safety | Remediate before activation |
| `next` | yes | critical | active production framework | npm proposes Next `16.2.12`, a major upgrade | Several server, middleware, cache, image, and SSRF advisories may apply depending on route/configuration; middleware authorization advisory is directly relevant | Remediate before activation; architecture-compatible upgrade decision required |
| `postcss` | no | high | production via Next | npm proposes Next `16.2.12` | Reachability depends on attacker-controlled CSS/source maps; not established | Investigate further and remediate with framework plan |
| `eslint` | yes | high | development/build | npm proposes ESLint `10.8.0`, major | Not shipped as application runtime; processes repository-controlled lint inputs | Accept temporarily for inactive shadow; remediate in tooling upgrade |
| `eslint-config-next` | yes | high | development/build | npm proposes `16.2.12`, major | Build/lint path only | Accept temporarily; coordinate with Next upgrade |
| `@eslint/eslintrc` | no | high | development via ESLint | ESLint `10.8.0`, major | Build/lint path only | Accept temporarily; remediate with ESLint upgrade |
| `@humanwhocodes/config-array` | no | high | development via ESLint | ESLint `10.8.0`, major | Build/lint path only | Accept temporarily; remediate with ESLint upgrade |
| `@next/eslint-plugin-next` | no | high | development via Next lint config | `eslint-config-next@16.2.12`, major | Build/lint path only | Accept temporarily; coordinate with Next upgrade |
| `brace-expansion` | no | high | development toolchains | ESLint `10.8.0`, major | Requires adversarial glob patterns during tooling execution; repository inputs are controlled | Accept temporarily; investigate lock-level options |
| `eslint-plugin-import` | no | high | development via lint | fix available | Build/lint path only | Remediate in tooling upgrade |
| `eslint-plugin-jsx-a11y` | no | high | development via lint | `eslint-config-next@16.2.12`, major | Build/lint path only | Accept temporarily; coordinate with Next upgrade |
| `eslint-plugin-react` | no | high | development via lint | `eslint-config-next@16.2.12`, major | Build/lint path only | Accept temporarily; coordinate with Next upgrade |
| `file-entry-cache` | no | high | development via ESLint | ESLint `10.8.0`, major | Build/lint cache path only | Accept temporarily; remediate with ESLint upgrade |
| `flat-cache` | no | high | development via ESLint | ESLint `10.8.0`, major | Build/lint cache path only | Accept temporarily; remediate with ESLint upgrade |
| `glob` | no | high | development/tooling | npm proposes major Next/ESLint upgrades | Reported command-injection path requires use of glob CLI command execution; Discovery does not invoke that mode in validated scripts | Investigate further; remediate with toolchain upgrade |
| `minimatch` | no | high | development/tooling | ESLint `10.8.0`, major | Glob matching in tooling; untrusted pattern reachability not demonstrated | Accept temporarily; remediate with toolchain upgrade |
| `rimraf` | no | high | development via ESLint cache | ESLint `10.8.0`, major | Tooling cleanup path; no application runtime import identified | Accept temporarily; remediate with ESLint upgrade |

## Clerk-specific advisories

The audit identifies:

- insufficient authenticity verification affecting Clerk Next `>=6.2.10
  <6.23.3`;
- middleware route-protection bypass affecting versions below `6.39.2`; and
- an authorization bypass involving organization, billing, or reverification
  checks through `6.39.2`.

Discovery does not activate Clerk middleware, Clerk Organizations, billing
checks, reverification checks, or the product route in this milestone. That
limits current exposure but does not justify hosted activation on the affected
version. Clerk must be upgraded to a fixed compatible release and its live
server behavior revalidated before activation.

## Upgrade implications

- Clerk's reported fixed `6.39.6` is not a major upgrade, but its peer range
  requires a newer Next 14 patch than the current `14.2.18`.
- npm's complete automated Next remediation proposes `16.2.12`, a framework
  major upgrade.
- npm's ESLint remediation proposes `10.8.0`, a tooling major upgrade.
- `eslint-config-next` remediation proposes `16.2.12`, coupled to a Next major
  upgrade.
- React and React DOM have no audit finding in this report and remain
  `18.3.1`.

No upgrade was attempted because this sprint is audit and canonization only.

## Activation decision

The inactive shadow may be committed with these risks documented. Hosted Alpha
activation is blocked until:

1. Clerk and Next remediation versions are selected and validated;
2. the server adapter, middleware, and route protection are tested with real
   deployed sessions;
3. relevant production advisories are closed or explicitly accepted through a
   separate security decision; and
4. a fresh audit and dependency tree are recorded.
