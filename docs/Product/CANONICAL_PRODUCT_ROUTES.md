# Discovery Canonical Product Routes

**Status:** Canonical

## Purpose

This contract identifies Discovery's product routes and prevents a resolvable
legacy or prototype route from becoming a product-development target.

The terms in this document have specific meanings:

- **Routing Controller:** selects a destination and renders no product UI.
- **Product Shell:** shared authenticated application chrome and layout.
- **Experience:** route-specific UI, such as Onboarding, Your Organization, or
  organization selection.
- **Legacy Compatibility Layer:** preserves older links by delegating to
  canonical routing or an existing canonical Experience. It is not an
  independent product surface.

## Canonical Product Shell

Canonical Product Shell: `components/product-shell/DiscoveryShell.tsx`

`components/product-shell/ProductWorkspace.tsx` composes product data and
Experiences inside that shell. It is not a second shell. Product routes must
reuse `DiscoveryShell`; they must not create parallel authenticated chrome
merely because a legacy or prototype route still resolves.

## Route responsibilities

### `/`

`/` is a Routing Controller only.

Allowed:

- inspect configuration or request state needed to choose a canonical entry;
- redirect to a canonical route;
- execute at request time when route selection is request-sensitive.

Prohibited:

- rendering onboarding, organization selection, or primary product UI;
- owning product styling, business workflows, or a Product Shell;
- redirecting to a legacy route as a shortcut.

The current isolated onboarding environment redirects `/` to `/onboarding`,
where authenticated organization state is resolved. Outside that environment,
the current root controller redirects to `/organizations`. Production route
availability remains governed by middleware and the existing production route
policy.

### `/onboarding`

`/onboarding` owns the canonical Onboarding Experience for new and interrupted
users. It authenticates through the existing Clerk boundary, resolves access
and Runtime state, renders
`components/onboarding/DiscoveryOnboardingExperience.tsx` when onboarding is
required, and redirects users whose state belongs elsewhere.

Onboarding features and styling belong here and in the shared canonical
Onboarding Experience, never in `/discovery-v1`.

### `/your-organization`

`/your-organization` is the canonical primary Discovery product Experience.
It resolves the authorized organization and renders the current organization
workspace or the governed activated experience. Primary product work belongs
to this route, its canonical Experience components, and the canonical Product
Shell.

It must not delegate product ownership to a lab, Alpha prototype, or legacy
route merely because that route remains accessible.

### `/organizations`

`/organizations` owns organization selection. It lists available
organizations and routes selection to `/your-organization` with the selected
organization identity. Creation actions route to canonical onboarding, not to
legacy UI.

### `/discovery-v1`

`/discovery-v1` is a Legacy Compatibility Layer. It currently delegates
presentation to the canonical Onboarding Experience so older links continue
to resolve.

It must not:

- receive new features or styling;
- own onboarding state resolution;
- acquire its own Product Shell;
- duplicate onboarding or primary product implementation;
- become a destination selected by canonical routing.

Deprecation is complete when supported older links no longer require it and
removal is explicitly approved. Until then, preserve it as a thin compatibility
boundary. Product work must not target it merely because it still resolves.

## Authenticated entry and organization-state routing

Clerk and middleware own the authentication boundary for protected routes.
The canonical `/onboarding` route owns onboarding-specific access and Runtime
state resolution. Discovery currently applies the following state contract:

| User state | Destination |
|---|---|
| unauthenticated | Clerk sign-in flow through the existing protected-route boundary |
| new user | `/onboarding` |
| interrupted onboarding | `/onboarding` |
| one active organization | `/your-organization?organizationId=<id>` |
| multiple organizations requiring selection | `/organizations` |

The root Routing Controller may delegate to `/onboarding` for this resolution;
it must not reproduce the Experience or bypass the authentication boundary.

## Rules for future implementation

1. Read this contract before changing product routes, navigation, or shells.
2. Keep `/` routing-only.
3. Put onboarding work in `/onboarding` and the canonical Onboarding
   Experience.
4. Put primary product work in `/your-organization` and the canonical Product
   Shell.
5. Put organization-selection work in `/organizations`.
6. Keep `/discovery-v1` compatibility-only and free of independent UI,
   business logic, and styles.
7. Route canonical actions to canonical routes; never use legacy UI as a
   shortcut.
8. Preserve existing middleware, Clerk, access, Runtime, and production-policy
   boundaries. This route contract grants no new authority.
