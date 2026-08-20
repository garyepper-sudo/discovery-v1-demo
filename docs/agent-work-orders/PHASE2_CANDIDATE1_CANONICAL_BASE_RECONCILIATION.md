# Phase 2 Candidate-1 canonical-base reconciliation

- **Work ID:** `P2-CANDIDATE1-CANONICAL-BASE-RECONCILIATION-001`
- **Status:** `DRAFT — AWAITING HUMAN IMPLEMENTATION AUTHORIZATION`
- **Created:** 2026-08-20
- **Roadmap phase:** Phase 2, Candidate-1 / HSS continuation planning
- **Registered gap:** No new Gap ID; this is reconstruction planning for the already-governed Candidate-1 boundary.
- **Architecture change:** None authorized or proposed.
- **Predecessor:** Phase 008 governed-scope foundation, commit `557a2181b69f4b0f9941b72c186d6c4716f91762`
- **Successor relationship:** A successful, separately authorized Candidate-1 reconstruction is a prerequisite to any separately authorized HSS-ONE resumption.

This document is a planning artifact only. It is not implementation, commit, integration, push, promotion, release, deployment, or HSS-ONE authorization.

## Canonical baseline

- Worktree: `/Users/garyepper/Development/Alpha-Sprint-14-main-canonical-001`
- Branch: `main`
- HEAD / Phase 008 commit: `557a2181b69f4b0f9941b72c186d6c4716f91762`
- Tree: `bb22510551d561684f2582ddf9c12320270b7c13`
- Relationship: `origin/main...main = 0/7`
- Status at capture: clean (`main...origin/main [ahead 7]`)
- Push is not required for local reconstruction and remains a separate transition.

## Historical Candidate-1 / HSS-ONE state

- Branch: `product/chief-v1-phase2-cycle1-closure-checkpoint-001`
- Worktree: `/private/tmp/discovery-chief-v1-phase2-cycle1-closure-checkpoint-001`
- HEAD: `9dab563c63aa2357eded34c9ff8e8743e4f89a1f`
- Relative to current main: one commit behind; no unique commit (`0 1` for historical HEAD versus current main)
- Index: empty; working tree: exactly 12 modified, unstaged paths
- Failed-attempt patch SHA-256: `339eb8b3432f37eee4efeb30b401176dcd8e4a7115afdc85a8785b5d7a0af402`
- Current full-index/binary patch SHA-256: `2045904dc191026d90216eab5da438a0c33ffb7b270bac544b515da7244a75d1`
- Prior classification: `P2C1HSS-F`
- Prior stopping condition: the governed-scope foundation had to be canonically integrated before Candidate-1 reconstruction; Phase 008 has now satisfied that prerequisite.
- Durable evidence: `docs/agent-work-orders/evidence/phase2-candidate1-canonical-base-reconciliation/`

Exact paths:

1. `app/product-alpha/leadership-conversation/actions.ts`
2. `app/product-alpha/leadership-conversation/page.tsx`
3. `lib/access/sandboxMultiUserAccess.ts`
4. `product/integration/canonicalProductWorkspaceAdapter.ts`
5. `product/integration/leadershipConversationServerComposition.ts`
6. `product/workflow/leadershipConversation/buildLeadershipConversationWorkspace.ts`
7. `product/workflow/leadershipConversation/contracts.ts`
8. `product/workflow/leadershipConversation/operations.ts`
9. `product/workflow/leadershipConversation/productWorkflowArtifactRepository.ts`
10. `scripts/product/validateHistoricalCheckpointLifecycleCurrentAccess.ts`
11. `scripts/product/validateHistoricalCheckpointLifecycleLinkage.ts`
12. `scripts/product/validateLeadershipConversationPrepareCapture.ts`

## Reconciliation finding

The historical branch has no unique commit and is one commit behind current canonical main. `git apply --check` against current main confirms direct-application failure on exactly six overlapping paths: `product/integration/leadershipConversationServerComposition.ts`, `product/workflow/leadershipConversation/contracts.ts`, `product/workflow/leadershipConversation/operations.ts`, `product/workflow/leadershipConversation/productWorkflowArtifactRepository.ts`, `scripts/product/validateHistoricalCheckpointLifecycleCurrentAccess.ts`, and `scripts/product/validateHistoricalCheckpointLifecycleLinkage.ts`. Direct resumption, rebasing, or blind patch application is therefore unsafe. The proposed method is controlled reconstruction in a new dedicated worktree created from `557a2181b69f4b0f9941b72c186d6c4716f91762`.

## Future bounded objective

After explicit implementation authorization only:

1. Create a dedicated implementation worktree from canonical `557a2181b69f4b0f9941b72c186d6c4716f91762`.
2. Reconstruct intended Candidate-1 behavior deliberately, using the preserved evidence rather than blindly applying the dirty patch.
3. Reconcile the six overlapping paths against the accepted Phase 008 governed-scope foundation.
4. Preserve non-overlapping historical intent where it remains valid.
5. Validate the reconstructed Candidate-1 boundary.
6. Stop before HSS-ONE resumption or any other explicit state transition unless separately authorized.

## Required preservation

- Leave the historical Candidate-1 worktree, branch, index, and working files untouched.
- Keep both historical patch representations losslessly preserved and do not overwrite historical evidence.
- Preserve Phase 008 behavior and existing canonical owners; owner changes require separate authorization.
- Leave `/Users/garyepper/Development/Alpha-Sprint-14-main` and its pre-existing deletion of `product/workflow/buildShadowProductWorkspace.ts` untouched.
- Do not weaken cross-customer, authorization, identity, provenance, concurrency, replay, or governance invariants.
- Keep `package-lock.json` unchanged unless a future work order explicitly authorizes otherwise.

## Required future validation

The future executor must record exact commands and results for:

- source/path allowlist verification and `git diff --check`;
- historical-intent reconciliation and explicit six-overlap-path review;
- focused Candidate-1 acceptance and its negative controls;
- relevant Product/frontend validation;
- authorization, organization-isolation, and non-disclosure validation;
- replay and idempotency checks where the reconstructed operations require them;
- architecture validation and `npm run validate:product-governance` if any Product contract boundary changes;
- package-lock pre/post hash verification;
- `npm run typecheck`, `npm run lint`, and `npm run build`;
- independent read-only review of the complete diff, evidence, and preservation state.

For this planning artifact set, whitespace validation is path-aware. Run whitespace
style checks against every proposed artifact except these two immutable, lossless
patch representations:

- `docs/agent-work-orders/evidence/phase2-candidate1-canonical-base-reconciliation/DISCOVERY_CHIEF_V1_PHASE2_CANDIDATE1_HSS_ONE_001_FAILED_DIAGNOSTIC_PATCH_BEFORE_CORRECTION.diff`
- `docs/agent-work-orders/evidence/phase2-candidate1-canonical-base-reconciliation/DISCOVERY_CHIEF_V1_PHASE2_CANDIDATE1_CURRENT_12_PATH_FULL_INDEX_BINARY_PATCH.diff`

The exclusion applies only to whitespace style checking. Validate each excluded
patch by exact SHA-256, byte size, provenance, and the exact 12-path inventory.
Neither patch may be normalized or otherwise rewritten.

## Future stopping conditions

Stop for human direction on unresolved Product intent, a canonical-owner conflict, any architecture change, source-patch ambiguity, mismatch between preserved evidence and historical state, required scope expansion, a new dependency or service, authorization/security weakening, inability to preserve Phase 008 behavior, inability to reproduce required validation, or need for an unauthorized commit, integration, push, promotion, release, or deployment.

## Future operation permissions

Explicit implementation authorization of this draft may permit only the bounded reconstruction and validation above in a new dedicated worktree. It does not by itself authorize commit, canonical integration, push, HSS-ONE resumption, promotion, release, deployment, dependency installation, network use, infrastructure/database operations, architecture or owner changes, or modification of the historical, canonical-main, or unrelated research worktrees. Each such transition remains separately unauthorized unless an explicit later authorization says otherwise.

## Completion schema

The future executor and reviewer must return: repository/worktree/branch/HEAD/tree identities; task references; exact changed paths; per-path overlap reconciliation; validation evidence; Phase 008, historical-worktree, evidence, package-lock, and unrelated-checkout preservation evidence; reviewer result and any remediation result; commit, integration, push, promotion, release, and deployment statuses; and the exact next separately authorizable transition.
