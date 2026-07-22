# Discovery Sprint 79 — New Chat Handoff

Use this document as the opening context for a new ChatGPT conversation.

## Discovery identity

Discovery is an Executive Cognitive Operating System centered on a continuously evolving **Organization Model**. User-facing language is **Your Organization**; internal product and engineering language is **Organization Model**.

> The Organization Model is the product.

The user is its steward. Every important interaction should improve, validate, challenge, query, experiment with, or act on the model. Discovery improves executive judgment; it does not replace it. It is not a dashboard, generic chatbot, document repository, or business-intelligence product.


## Product Mission for Sprint 79

Discovery has completed its first-generation Cognitive Operating System.

The current objective is no longer improving cognition.

The objective is making the Organization Model feel alive.

Every product decision should reinforce one idea:

The executive is continuously cultivating Discovery's understanding of their organization.

The product should reward stewardship before requesting additional effort.

## Active branch and phase


- Active branch: `sprint-78-persistent-organizations`
- Next sprint: **Sprint 79 — Organization Experience / Model Stewardship MVP**
- Current milestone: persistent organizations and the Semantic Fidelity corrections are complete; product implementation is now re-centered on the Organization Model.

Do not add more engine architecture for the next task. Treat the Cognitive Operating System, Capability Registry, Runtime, and current semantic architecture as stable unless a benchmark proves a gap.

## Canonical architecture

The existing deterministic pipeline remains canonical:

```text
Evidence → Observations → Signals → Themes → Understanding
→ Phenomena → Mechanisms → Beliefs → Semantic Concepts
→ Conceptual Understanding → Organizational Conditions
→ Executive Assessment and Recommendation → Simulation, Decision, Communication
→ Runtime memory and organizational learning
```

Runtime is canonical organizational memory and already persists state by organization. Presentation consumes canonical cognition; it must not recreate it.

## Completed work

### Persistent organizations

- `engine/v3/runtime/activeOrganization.ts` provides `DEFAULT_ORGANIZATION_ID` and canonical `resolveOrganizationId` behavior.
- Runtime persistence was already organization-scoped.
- Product API routes now resolve organization identity consistently:
  - `app/api/discovery-lab/route.ts`
  - `app/api/executive-decision/route.ts`
  - `app/api/executive-scenario/route.ts`
  - `app/api/executive-decision-record/route.ts`
- `app/discovery-v1/page.tsx` generates one opaque `org_<crypto.randomUUID()>` ID on first investigation. It is independent of company name and reused for the page lifecycle.
- The ID flows through Discovery Lab, Executive Workspace, Executive Experience, Simulation, Decision, and Decision Commit.

### Semantic Fidelity

The deterministic `engine/benchmark/runtime/executiveMeaningPreservation001.ts` benchmark originally exposed organization-specific meaning loss across abstraction.

- **Themes:** lexical labels such as `Consulting Pattern` and `Founder Pattern` were replaced by evidence-grounded organizational patterns using evidence relationships and signals. `V3Theme` did not change.
- **Phenomena:** Runtime now supplies current Understandings to Phenomena inference; understanding clusters preserve real Understanding IDs; cluster-driven Phenomena retain organization-specific meaning and direct ancestry. The Understanding → Phenomena → Mechanisms lineage discontinuity is gone. Pattern-driven Phenomena remain unchanged.
- **Conceptual Understanding:** normalized theory statements, IDs, signatures, confidence, and ranking remain stable. Candidate summaries and explanations now preserve a concise source-grounded manifestation from Semantic Cohort observations. No founder-, consulting-, or fixture-specific prototype was added.

Current meaning-preservation result:

- Evidence: PASS
- Understanding: PASS
- Semantic Concepts: PASS
- Phenomena: PASS
- Conceptual Understanding: PASS
- First diagnostic semantic degradation: none
- First required semantic failure: none

## Runtime Validation Rule

Read `docs/Architecture/Validation/RUNTIME_VALIDATION.md` during startup.

Architecture documents describe intended behavior. Runtime validation confirms actual behavior. Before making architectural, cognitive, projection, or executive-experience changes, inspect current Runtime output whenever the task depends on what Discovery actually produces.

> Do not infer Runtime behavior solely from producer contracts or architecture documentation. Inspect representative Runtime state when actual output semantics or lineage matter.

When relevant, inspect one current organization file in `.discovery-runtime/organizations/*.json` and compare actual Runtime output with canonical product and architecture expectations. Treat discrepancies as validation findings before proposing architecture.

Runtime validation should inspect:

- organization identity and persistence
- current memory structure
- current Understandings
- Themes and semantic patterns
- Phenomena
- mechanism ancestry
- organizational beliefs
- semantic cohorts
- concept candidates
- `conceptualUnderstanding`
- organizational conditions
- primary executive constraint
- executive assessment
- executive recommendation
- executive communication
- decision records
- learning state

Latest validated semantic Runtime status:

- Emergent Themes preserve evidence-grounded organizational relationships.
- Phenomena preserve direct Understanding ancestry.
- The Understanding → Phenomena → Mechanisms lineage discontinuity is removed.
- Conceptual Understanding preserves normalized concept identity and organization-specific manifestation.
- Executive Meaning Preservation reports no diagnostic degradation and no required semantic failure.

Current presentation caveat: some normalized labels or primary descriptions remain more generic than richer source-grounded meaning retained in summaries, evidence fields, or ancestry. Inspect those richer fields before diagnosing semantic loss.

There is no dedicated Runtime-inspection script in `package.json`. `npm run sprint:brief` is the verified canonical startup brief command; Runtime state itself must be inspected directly when relevant.

## Verified status

- `npm run typecheck`: PASS
- `npm run build`: PASS; only existing React hook warnings outside the semantic changes
- Executive Meaning Preservation: PASS
- Phenomenon Semantic Validation: PASS
- `npm run benchmark`: 15/15 checks, 100% integrity
- Cognitive Semantic Normalization Audit: exits successfully but reports existing `NORMALIZATION REQUIRED` findings
- `npm run verify:architecture`: 291/302 checks, 96%; 11 known registry/dependency failures pre-date and are unrelated to the Semantic Fidelity changes

The remaining audit and architecture findings are known work, not newly introduced regressions.

## Locked MVP product direction

Canonical product documents:

- `docs/Product/MVP_PRODUCT_SPECIFICATION.md`
- `docs/Product/ORGANIZATION_PAGE_SPEC.md`

These Sprint 79 documents govern the MVP experience when older workflow or navigation documents conflict.

Locked primary navigation:

- **Your Organization** — observe and improve the Organization Model
- **Decisions** — recommendations, decision tracking, review, and learning
- **Research** — investigate, compare interventions, simulate, and optimize
- **Ask** — query and challenge the Organization Model

Older assumptions using Home, Executive Work, Executive Brief, Decision Lab, or Operating Model as separate primary destinations are superseded. Those capabilities may still exist inside the new information architecture; they are not primary navigation labels.

## Your Organization and first use

Onboarding is not a separate destination or wizard. First use and mature use occur on **Your Organization**, which evolves through:

```text
EMPTY → EMERGING → DEVELOPING → ACTIVE → EVOLVING
```

The MVP stewardship loop is:

```text
Teach → Discovery Learns → Discovery Produces Value
→ User Validates or Challenges → Organization Model Improves
→ Discovery Earns the Next Request
```

Initial experience:

1. Ask for one important initiative or objective.
2. Request one supporting document.
3. Surface one meaningful understanding.
4. Ask the user to validate or refine it.
5. Increase visible model coherence only when meaningful learning occurs.
6. Reveal a relevant decision or next opportunity.

The initial visualization should be deliberately simple and show increasing coherence, not data volume or ingestion progress.

## Exact next task

> Audit the current executive-v3 product shell and determine the smallest implementation plan for migrating to:
>
> Your Organization  
> Decisions  
> Research  
> Ask
>
> and implementing the initial Your Organization maturity-state experience without changing the engine.

Begin with repository investigation and an implementation plan. Do not immediately change code.

Recommended sequence after plan approval:

1. Audit current executive-v3 UI and routing.
2. Design the smallest migration path to the locked navigation.
3. Implement a persistent Discovery shell and left navigation.
4. Implement one stateful Your Organization page for all five maturity states.
5. Use placeholder visualization states initially.
6. Reuse the existing engine and Runtime for initiative input, evidence ingestion, first understanding, validation, and recommendation.
7. Only then implement Decisions, Research, and Ask under the new information architecture.

## Implementation guardrails

- Do not expand cognition merely because presentation needs change.
- Reuse existing engine capabilities before introducing new ones.
- Minimize reading and use progressive disclosure.
- Preserve organization-specific meaning through every executive-facing projection.
- Do not turn Your Organization into a dashboard.
- Do not make the visualization a gimmick or ingestion progress bar.
- Do not build a separate onboarding wizard.
- Keep custom code focused on Discovery's unique organizational understanding; use mature libraries for commodity functionality.
- Codex implements; ChatGPT designs, reviews, and creates scoped prompts; the user verifies and commits.

## Relevant files

- `docs/Engineering/CODEX_GUIDE.md`
- `docs/Architecture/Validation/RUNTIME_VALIDATION.md`
- `docs/Product/MVP_PRODUCT_SPECIFICATION.md`
- `docs/Product/ORGANIZATION_PAGE_SPEC.md`
- `docs/Sprint Updates/PROJECT_STATE.md`
- `docs/Sprint Updates/DISCOVERY_SNAPSHOT.md`
- `components/executive-v3/ExecutiveWorkspace.tsx`
- `components/executive-v3/workspaces/`
- `app/discovery-v1/page.tsx`
- `engine/v3/runtime/`

## Startup and verification commands

Run at the beginning of the next development conversation:

```bash
git status
git branch --show-current
npm run sprint:brief
npm run typecheck
npm run build
npx tsx engine/benchmark/runtime/executiveMeaningPreservation001.ts
```

Runtime startup procedure:

1. Read `docs/Architecture/Validation/RUNTIME_VALIDATION.md`.
2. Inspect one representative `.discovery-runtime/organizations/*.json` file when the task depends on actual output.
3. Compare Runtime state with product and architecture expectations.
4. Record discrepancies as validation findings rather than immediately adding architecture.

Before completing implementation that affects cognition or Runtime, also run:

```bash
npm run benchmark
npm run verify:architecture
```
