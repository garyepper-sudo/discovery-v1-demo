# Discovery — New Chat Handoff

Use this document as the opening context for the next ChatGPT or Codex conversation.

## Discovery identity

Discovery is a platform that continuously builds shared organizational intelligence that becomes more valuable than the sum of its contributors, information, and experiences.

The Executive Operating System is Discovery's first major application. The Operating Model is a primary representation of how the organization functions, while Organization Runtime remains the canonical persistence boundary containing Discovery's evolving Organizational Intelligence.

Executive recommendations, simulations, decisions, research, and questions are interactions with that same model. They do not form separate reasoning systems. Runtime is the canonical persistent representation of each organization.

The strategic canon authorizes no new scopes, governance, Runtime contracts, cognitive layers, orchestration systems, or application families. Current benchmark-authorized conversation and reasoning work remains the immediate implementation priority.

## Stable architecture

The Cognitive Operating System, Runtime, Organization Model, Capability Registry, Executive Projection, Executive Communication, and Executive Decision pipeline are established architecture.

Production architecture should not expand without benchmark evidence. Current optimization work improves an existing producer only after a measured failure and a producer-level trace identify the responsible boundary.

## Completed recent milestones

- **Executive Decision Lab:** established typed decision cases, hidden ground truth, deterministic stress and metamorphic scenarios, semantic intervention correspondence, robustness and sensitivity evaluation, structured scope comparison, and controlled failure taxonomy.
- **Intervention Profiles:** canonical options carry intrinsic execution characteristics used by feasibility evaluation.
- **Capacity-aware feasibility:** constrained implementation capacity can disqualify high-burden options before simulation and change the recommended viable option.
- **Localized intervention scope:** targeted condition and mechanism scope propagates through generated option, profile, simulation input, and recommendation.
- **Operating Model Evolution Lab:** established benchmark-only longitudinal validation for learning, stability, coherence, identity continuity, scope preservation, historical truth, decision learning, and recommendation continuity.
- **Production replay:** chronological evidence updates run through `runDiscoveryV3`, `evolveOrganizationRuntime`, a benchmark-only Runtime adapter, and consecutive Organization Model evaluation without persisting Runtime.
- **Organizational Mechanism Lifecycle:** `docs/Architecture/Canon/ORGANIZATIONAL_MECHANISM_LIFECYCLE.md` defines canonical lifecycle and identity semantics.
- **Mechanism identity reconciliation:** immediately previous mechanisms are matched deterministically as either the same mechanism or a new mechanism. Full lifecycle and lineage are not implemented.
- **Longitudinal contradiction synthesis:** current evidence is compared with immediately previous evidence and classified as support, contradiction, qualification, or unrelated.
- **Contradiction-aware belief revision:** a detected contradiction is associated with the stable challenged mechanism identity and enters the existing belief-update formula.
- **Contradiction-aware mechanism confidence:** after immediate-previous identity reconciliation, unique qualifying contradictions reduce confidence only when opposing evidence intersects the continuing mechanism's current evidence ancestry.
- **Intervention-specific recommendation risks:** Executive Recommendation synthesis preserves the winning intervention's existing risks in stable source order, removes exact duplicates, and leaves recommendation identity, confidence, and scenario ranking unchanged.
- **Executive Recommendation risk projection:** the primary Decisions workspace now displays the selected recommendation's existing risks under “What could go wrong?” in their preserved order and wording, without changing Runtime, recommendation identity, confidence, or simulation.
- **Living Organization Model interaction loop:** Insights surfaces up to three model-backed insights with stewardship actions; Think keeps brainstorming provisional until an explicit save or decision action; Decisions combines Discovery recommendations with leadership-added draft decisions; Session Impact separates discussion from durable updates.
- **Unified Executive Workspace:** `/your-organization` now composes the top insight, interactive Organization Model, Think, Decide, Experiment, Brief, Session Impact, and the living-model learning loop into the primary compact executive surface. Existing focused routes remain available.
- **Deterministic Ground Truth benchmark:** Ground Truth now owns an isolated, deterministic 48-artifact Northstar replay, scores only that replay, and restores the prior persisted Runtime before exiting.
- **Implementation foundation:** the Product Canon, Platform Principles, Design Language, UI System, Component Library, Motion System, Copy Guide, View Model Architecture, and Frontend Architecture define the product-to-frontend implementation boundary.
- **Interactive Prototype Alpha:** the approved nine-scene Understanding journey is implemented as a deterministic, fixture-backed experience under `/alpha`.
- **Advisor deployment boundary:** Alpha has a narrowly scoped server-side shared-password gate, protected responses and assets, safe redirects, and deployment-compatible `/alpha` routing. It does not introduce product authentication or alter existing application routes.

## Current measured state

Sprint 110 extends the ephemeral interpretation with advisory `reasoningAnalysis`: reasoning quality, unsupported assumptions, missing evidence, competing hypotheses, possible biases, confidence, and challenge opportunity. It is provider-generated, never persisted, and never treated as organizational truth. Ask remains the sole executive-facing response composer.

The Executive Collaboration Lab now scores Challenge Opportunity Detection and Challenge Quality separately and includes six held-out reasoning cases. On the split-dimension benchmark, Runtime-only scores `63.36`, Mock `90.88`, Provider V1 `77.81`, and Provider V2 `81.55` combined. V2 improves held-out score from `75.80` to `82.60` and challenge-opportunity detection from `2.50 / 5` to `4.44 / 5`, while recommendation quality, model stewardship, and Session Impact remain unchanged. All 96 live provider calls succeeded with zero fallbacks and zero critical failures. V2 is recommended to replace V1 on the experimental provider path; Prompt V1 remains frozen as the historical baseline.

Sprint 109 adds exactly one experimental provider implementation: OpenAI behind `ExecutiveConversationInterpreter`. It uses a versioned bounded prompt, a minimized conversation-relevant Runtime projection, strict schema validation, sanitized ephemeral observability, and direct fallback from `openai` to `none`. It does not send organization IDs, complete Runtime, recommendations, decisions, evidence collections, or cognitive traces. It does not use mock as a production fallback.

Sprint 109 completed a successful live OpenAI `gpt-4o-mini` evaluation using frozen Prompt Version 1. The canonical first-run baseline is `78.93` development, `77.85` held-out, and `78.49` combined, with 30 successful calls, zero fallbacks, zero schema repairs, zero invalid outputs, and zero critical failures. Average latency was `2,050 ms`; average usage was `411` input and `159` output tokens per turn. A reproduction scored `78.49` development, `83.85` held-out, and `80.63` combined, demonstrating live interpretation variance without prompt, model, scenario, schema, or scoring changes.

Sprint 108 implements the canonical Executive Conversation Intelligence adapter. The provider-neutral contract interprets the current executive message, bounded recent turns, and read-only Runtime into an ephemeral description of conversational objective, intent, hypotheses, questions, assumptions, ambiguity, confidence, and recommended conversational action. It never persists, does not change organizational truth, and does not generate executive-facing responses. Ask remains the response composer. `CONVERSATION_INTERPRETER=none` is the backward-compatible default; `mock` selects the sole deterministic provider implemented in this sprint.

The extended Executive Collaboration Lab records interpretation and response separately for every turn. The Runtime-only baseline remains `65.21 / 100`. Its deterministic controlled-mock baseline is `90.36 / 100`, with executive understanding `14.17 / 15`, collaborative reasoning `14.5 / 15`, constructive challenge `8 / 10`, continuity `10 / 10`, and trust `4.36 / 5`. The controlled score is not evidence of live-provider quality, unseen-conversation generalization, or a final AI-enabled score. The lab has zero critical failures and one remaining semantic-coverage warning. Repeated replay, reversed scenario order, organization isolation, and Runtime restoration pass.

The Sprint 107 Executive Collaboration Lab establishes the first canonical multi-turn collaboration baseline across six scenarios. Overall score is `65.21 / 100`, with zero hard failures. Dimension scores are: executive understanding `3.33 / 15`, question quality `8 / 10`, collaborative reasoning `8 / 15`, constructive challenge `5.33 / 10`, conversational continuity `5.72 / 10`, model stewardship `13.33 / 15`, recommendation quality `8 / 10`, action handoff `5 / 5`, Session Impact accuracy `5 / 5`, and executive trust `3.49 / 5`. Repeated runs and reversed scenario order are identical, organization identity is isolated, and no persisted Runtime artifact is created or left modified.

The earliest responsible producer for the dominant gap is the existing Ask experience projection boundary: `buildAskExperienceView(runtime)` receives Runtime but no current executive message or conversation history, so every turn projects substantially the same answer. This is a conversation quality gap, not evidence of missing cognition or a Runtime architecture gap. The single recommended next optimization is to make that existing response composition turn-aware while keeping all reasoning Runtime-backed and all persistence explicit. Do not implement until authorized.

The production Operating Model Evolution replay currently reports:

- Mechanism identity continuity: **passing**.
- Belief weakening after qualifying evidence: **passing**.
- Recommendation continuity: **passing**.
- Mechanism confidence response to contradiction: **passing**; the production replay moves from `0.396425` to `0.352025` while preserving mechanism identity.
- Historical mechanism truth: **failing**; explicit mechanism evolution history is absent.

The Executive Decision Lab remains established and passing as a regression system. Its baseline risk-recognition score now passes at `5/5` because the selected intervention's risks reach the final recommendation. Direct recommendation evidence grounding remains open. The reduced-capacity scenario still reports a risk-language scoring diagnostic even though its selected intervention risks are present.

Sprint 104 closes the downstream projection omission for those risks. Decisions Experience validation passes `23` checks, the focused recommendation-risk regression passes, Executive Decision Lab passes `39/39`, Operating Model Evolution Lab passes `14/14`, typecheck passes, the production build passes with the existing React Hook warnings, and cognition validation passes. No Runtime, recommendation, confidence, ranking, simulation, or executive-reasoning contract changed.

Sprint 105 proves the first complete product interaction loop. Explicit context, challenges, and save-as-insight actions enter the existing organization-investigation and evidence path; save as insight does not create a standalone insight object. Leadership decisions persist as canonical draft Executive Decision Records with their origin and targeted conditions preserved; casual brainstorming stays provisional. The API rejects unsupported actions and uses stable interaction identities to make investigation and decision retries idempotent. A shared session ledger reports only successfully persisted changes as model impact and deduplicates repeated entries. Living interaction validation passes `18/18`, product interaction boundary validation passes `14/14`, all existing product experience validators pass, Executive Decision Lab passes `39/39`, Operating Model Evolution passes `14/14`, and typecheck, build, cognition validation, and diff checks pass.

Authentication and authorization for the product-interaction route remain deferred to the existing product access-control boundary; Sprint 105 adds no parallel identity or authorization model.

Sprint 106 changes only the product interaction composition. It adds no cognition, Runtime contract, or parallel persistence model. Unified Executive Workspace validation passes `28/28`; organization identity is preserved through every handoff; visual verification at `1440 × 900` and `1728 × 1117` confirms the primary functionality is visible without page scrolling while maintaining the dark premium visual language.

Ground Truth is deterministic at `75 / 100` regardless of prior Cognitive Trace, Cognitive Layer Validation, Atlas, Executive Decision Lab, or Operating Model Evolution Lab execution. Repeated replays produce identical Runtime and score details with or without an existing persisted Northstar Runtime. Remaining deductions are `-20` for excessive-concurrent-work wording sensitivity and `-5` for the explicit staffing-boundary phrase; production already expresses equivalent meaning, so no production repair is authorized from those deductions yet.

Do not represent those findings as completed.

## Current optimization methodology

```text
Benchmark
↓
Production replay
↓
Root-cause trace
↓
Architecture only when required
↓
One narrow production change
↓
Full regression
↓
Benchmark calibration when justified
↓
Commit
```

The Executive Decision Lab and Operating Model Evolution Lab are regression gates after production changes.

## Runtime Validation Rule

Read `docs/Architecture/Validation/RUNTIME_VALIDATION.md` during startup.

Architecture documents describe intended behavior. Runtime validation confirms actual behavior. Before architectural, cognitive, projection, or executive-experience changes, inspect representative Runtime output whenever the task depends on what Discovery actually produces.

> Do not infer Runtime behavior solely from producer contracts or architecture documentation. Inspect representative Runtime state when actual output semantics or lineage matter.

When relevant, inspect one current `.discovery-runtime/organizations/*.json` file and compare actual Runtime state with canonical expectations. Treat discrepancies as validation findings before proposing architecture.

Investigation-local evidence IDs such as `E6` are positional and are not durable longitudinal identities. Stable mechanism identity is used for persisted contradiction ancestry.

## Exact next work

Begin **Benchmark Baseline and Regression Analysis** from a clean Git state:

1. Run the canonical deterministic benchmark and validation suites without production changes.
2. Record exact scores, failures, warnings, determinism, Runtime restoration, and architecture findings.
3. Compare results with the historical Ground Truth, Executive Collaboration, Executive Decision, Operating Model Evolution, Product Interaction Boundary, and Living Interaction Loop baselines.
4. Rank regressions and remaining measured deficiencies by executive impact and earliest responsible producer.
5. Recommend exactly one narrow benchmark-supported improvement.

Do not begin Runtime integration for Prototype Alpha. Do not add cognition or tune the provider during baseline establishment.

## Guardrails

- No new cognitive layers without benchmark proof.
- No broad engine or confidence tuning.
- One production change per optimization sprint.
- Preserve deterministic behavior.
- Run both Decision and Evolution regressions after production changes.
- Do not conflate investigation-local evidence IDs with stable longitudinal identity.
- Do not implement merge, split, lifecycle history, or lineage while fixing confidence.
- Do not modify benchmark expectations merely to make production pass.

## Working-tree state

At the time of this handoff, Prototype Alpha implementation, advisor access protection, and the deployment-routing repair are committed. The working tree still contains separable Sprint 110 conversation/benchmark work, strategic and Alpha documentation, generated architecture artifacts and capability traces, local Runtime state, provider output, and an empty experimental file. These must not be combined into a benchmark-improvement commit.

After repository synchronization, begin the next benchmark session with:

```bash
git status
git log -5 --oneline
npm run typecheck
npm run cognition:validate
```

## Copy-and-paste prompt for the next conversation

```text
Read AGENTS.md, docs/Sprint Updates/DISCOVERY_SNAPSHOT.md, docs/Sprint Updates/PROJECT_STATE.md, docs/Sprint Updates/NEXT_CHAT.md, and docs/Architecture/Validation/RUNTIME_VALIDATION.md.

Inspect current repository state with git status and git log -5 --oneline. Run npm run typecheck before changing code.

Interactive Prototype Alpha is complete and deployed behind the temporary advisor access gate. It remains deterministic and fixture-backed. Runtime integration has not begun and is not authorized.

Start the Benchmark Baseline and Regression Analysis phase. Run the canonical benchmark and validation suites without modifying production, Runtime, cognition, benchmark expectations, or provider prompts. Record exact current results, compare them with historical baselines, separate pre-existing failures from regressions, trace the earliest responsible producer for each material deficiency, and recommend exactly one narrow next optimization. Do not implement until the recommendation is approved.
```
