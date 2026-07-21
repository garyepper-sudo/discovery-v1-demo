# Authentication and Multi-Tenancy

**Status:** Canonical  
**Phase:** Functional MVP Foundation

---

# Purpose

This document defines Discovery's authentication and multi-tenancy architecture.

Its purpose is to establish how organizations, users, data ownership, and authentication are structured while intentionally minimizing implementation complexity during MVP development.

Discovery's competitive advantage is **not authentication**.

Authentication should rely on mature industry infrastructure so Discovery's engineering effort remains focused on executive cognition.

---

# Guiding Principle

Discovery owns:

- organizational reasoning,
- executive judgment,
- the Operating Model,
- simulations,
- recommendations,
- organizational learning.

Discovery does **not** seek to own:

- authentication,
- password management,
- OAuth,
- identity providers,
- session management,
- invitation systems.

Commodity infrastructure should use mature, well-supported platforms whenever possible.

---

# Authentication Provider

Discovery uses:

**Clerk**

Reasons:

- Mature Next.js integration
- Organization support
- Invitations
- Enterprise-ready authentication
- Google authentication
- Microsoft authentication
- Password authentication
- Multi-factor authentication
- Passkeys
- Session management
- Excellent developer experience

Authentication should remain independent of Discovery's cognitive architecture.

---

# Multi-Tenancy Philosophy

Discovery is **organization-first**, not user-first.

The organization is the primary unit of intelligence.

Users participate in and contribute to an organization's Operating Model.

The Operating Model belongs to the organization rather than to any individual user.

---

# Core Relationship

```text
Organization

↓

Operating Model

↓

Evidence

↓

Executive Work

↓

Learning

↓

Executive Briefs
```

Users interact with this shared organizational understanding.

---

# User Relationship

```text
Organization

├── CEO

├── COO

├── CFO

├── VP Product

├── VP Sales

└── Executive Team
```

Every authenticated user belongs to one or more organizations.

Each organization maintains its own independent Operating Model.

---

# Organization Ownership

Everything that represents organizational cognition belongs to the organization.

Examples include:

- Operating Model
- Organizational Memory
- Runtime
- Executive Communication
- Executive Assessments
- Organizational Conditions
- Beliefs
- Concepts
- Theories
- Insights
- Executive Decisions
- Initiatives
- Simulations
- Executive Briefs
- Uploaded Evidence

If an executive leaves the company, organizational knowledge remains with the organization.

---

# User Ownership

Users own only personal information and preferences.

Examples:

- Name
- Email
- Authentication credentials
- UI preferences
- Notification preferences
- Personal dashboard preferences

Users do **not** own organizational cognition.

---

# Operating Model Ownership

Exactly one canonical Operating Model exists per organization.

```text
Organization

↓

Operating Model

↓

Current Organizational Understanding
```

Executives collaborate around a shared organizational understanding.

Discovery does not maintain separate Operating Models for individual users.

---

# Executive Work

Executive Work belongs to the organization.

Examples:

```text
Discovery Suggestions

Executive Decisions

Initiatives
```

Every authorized executive should be able to view current organizational work.

Future role-based permissions may limit editing rights.

---

# Evidence Ownership

Evidence belongs to the organization.

Examples include:

- Board decks
- Strategic plans
- Quarterly business reviews
- Financial reports
- Organizational charts
- Leadership updates
- Meeting notes
- CRM integrations
- ERP integrations
- Uploaded documents

Evidence continuously strengthens the Operating Model.

---

# Runtime Ownership

Runtime is organizational.

```text
Organization

↓

Runtime

↓

Executive Projection

↓

Operating Model
```

Runtime state should never be shared across organizations.

---

# Data Isolation

Every organization is completely isolated.

No organizational cognition may be shared between organizations.

All persistent records should include:

```text
organizationId
```

This includes:

- documents,
- runtime,
- operating model,
- decisions,
- initiatives,
- executive briefs,
- simulations,
- projections,
- uploaded evidence.

Organization isolation is a foundational architectural requirement.

---

# User Roles

The MVP assumes trusted executive teams.

Initially every authenticated user within an organization may access organizational information.

Future versions may introduce roles such as:

- Owner
- Administrator
- Executive
- Contributor
- Viewer

Role management is intentionally deferred until customer validation.

---

# Authentication Flow

```text
Sign In

↓

Organization

↓

Load Operating Model

↓

Load Executive Work

↓

Open Discovery
```

Authentication should never interfere with executive workflows.

---

# Onboarding Flow

New organizations complete onboarding once.

```text
Company Information

↓

Create Organization

↓

Create Initial Operating Model

↓

Upload Initial Evidence

↓

Discovery Generates First Understanding

↓

Executive Work
```

Individual users invited later skip organizational setup.

---

# Initial Evidence

Discovery should recommend only a small number of high-value documents during onboarding.

Examples:

- Board Deck
- Strategic Plan
- Organizational Chart
- Quarterly Business Review
- Leadership Update

The objective is to establish a useful initial Operating Model quickly rather than requesting exhaustive information.

---

# Operating Model Stewardship

Discovery should continuously recommend high-value evidence that improves organizational understanding.

Examples:

```text
Latest Board Deck

Estimated Confidence Gain

+8%
```

```text
Leadership Update

Estimated Confidence Gain

+5%
```

Executives strengthen the Operating Model gradually rather than completing a one-time upload process.

---

# Persistence Strategy

MVP implementation should prioritize:

```text
Authentication

↓

Organization

↓

Document Storage

↓

Operating Model

↓

Executive Work

↓

Runtime Persistence
```

Additional enterprise features should follow product validation.

---

# Implementation Strategy

The MVP should become **authentication-ready** without delaying product development.

Current MVP assumptions:

- One authenticated organization
- One shared Operating Model
- One executive team
- Minimal permissions

The architecture should support future expansion without requiring redesign.

---

# Explicitly Deferred

The MVP intentionally defers:

- Enterprise SSO
- SCIM provisioning
- Advanced permissions
- Audit logs
- Departmental isolation
- Cross-organization collaboration
- Billing
- Subscription management
- API keys
- External administration portals

These capabilities should be driven by customer demand rather than speculative implementation.

---

# Architectural Principles

## Organization First

Organizations own knowledge.

Users participate in knowledge.

---

## Shared Understanding

Executives collaborate around one canonical Operating Model.

---

## Commodity Authentication

Identity management should rely on mature industry infrastructure.

Discovery should focus engineering effort on executive cognition rather than authentication.

---

## Data Isolation

Organizational cognition must remain completely isolated between organizations.

---

## Progressive Growth

The MVP implements only the minimum authentication and persistence required to validate the product.

Enterprise capabilities should be layered on after customer validation rather than anticipated prematurely.