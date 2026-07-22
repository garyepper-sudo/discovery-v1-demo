# Discovery — New Chat Handoff

Use this document as the opening context for the next ChatGPT or Codex conversation.

## Discovery identity

Discovery is an Executive Operating System centered on one continuously evolving **Organization Model**.

> The Organization Model is the product.

Executive recommendations, simulations, decisions, research, and questions are interactions with that same model. They do not form separate reasoning systems. Runtime is the canonical persistent representation of each organization.

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

## Current measured state

The production Operating Model Evolution replay currently reports:

- Mechanism identity continuity: **passing**.
- Belief weakening after qualifying evidence: **passing**.
- Recommendation continuity: **passing**.
- Mechanism confidence response to contradiction: **passing**; the production replay moves from `0.396425` to `0.352025` while preserving mechanism identity.
- Historical mechanism truth: **failing**; explicit mechanism evolution history is absent.

The Executive Decision Lab remains established and passing as a regression system. Its open findings remain:

- risk specificity;
- direct recommendation evidence grounding.

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

The next session should begin a separate benchmark-led investigation of historical mechanism truth. Sprint 101 does not authorize merge, split, retirement, reactivation, supersession, or full lineage implementation.

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

At the time of this handoff, the working tree includes uncommitted Sprint 99 and Sprint 100 production changes plus documentation synchronization. The commit hash is intentionally not recorded because the commit has not yet been created.

After the user commits and pushes, begin the next session with:

```bash
git status
git log -5 --oneline
npm run typecheck
```

## Copy-and-paste prompt for the next conversation

```text
Read AGENTS.md, docs/Sprint Updates/DISCOVERY_SNAPSHOT.md, docs/Sprint Updates/PROJECT_STATE.md, docs/Sprint Updates/NEXT_CHAT.md, docs/Architecture/Validation/RUNTIME_VALIDATION.md, and docs/Architecture/Canon/ORGANIZATIONAL_MECHANISM_LIFECYCLE.md.

Inspect current repository state with git status and git log -5 --oneline. Run npm run typecheck before changing code.

Discovery is an Executive Operating System centered on one continuously evolving Organization Model. Preserve the stable Cognitive Operating System, Runtime, Executive Projection, Executive Communication, and Executive Decision architecture. Treat the Executive Decision Lab and Operating Model Evolution Lab as required regression gates.

Continue from the two remaining production replay findings:
1. recognized longitudinal contradiction does not reduce Organizational Mechanism confidence;
2. historical mechanism truth is not preserved.

Investigate the mechanism-confidence finding first. Trace the exact production path and identify the earliest responsible producer before proposing or implementing a repair. Do not broadly tune confidence. Do not add a cognitive layer. Do not modify benchmark expectations. Defer mechanism history, merge, split, retirement, reactivation, supersession, and full lifecycle implementation. Add architecture only if the trace proves existing architecture is insufficient.

Do not modify code until the diagnosis is complete and the user authorizes the narrow production change.
```
