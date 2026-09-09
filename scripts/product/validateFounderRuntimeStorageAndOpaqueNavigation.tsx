import assert from "node:assert/strict";
import { lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DiscoveryShell from "../../components/product-shell/DiscoveryShell";
import { classifyLegacyMeetingOrganizationClaim } from "../../lib/alpha-activation/founderFirstUnderstandingMeetingHome";
import { resolveFounderLocalAlphaRuntimeRoot } from "../../lib/alpha-activation/founderLocalAlphaRuntimeRoot";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

async function exists(candidate: string) {
  try { await lstat(candidate); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

async function main() {
  const isolated = await mkdtemp(path.join(tmpdir(), "discovery-founder-storage-navigation-"));
  const worktree = process.cwd();
  const canonicalWorktree = "/Users/garyepper/Development/Alpha-Sprint-14-main-canonical-001";
  let checks = 0;
  try {
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: undefined, cwd: worktree }), { status: "unavailable", reason: "missing" }); checks++;
    assert.equal((await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "production", enabled: "true", configuredRoot: path.join(isolated, "production"), cwd: worktree })).status, "unavailable"); checks++;

    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: canonicalWorktree, cwd: worktree }), { status: "unavailable", reason: "unsafe" }); checks++;
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: worktree, cwd: worktree }), { status: "unavailable", reason: "unsafe" }); checks++;

    const regularFile = path.join(isolated, "not-a-directory");
    await writeFile(regularFile, "not a runtime root", { mode: 0o600 });
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: regularFile, cwd: worktree }), { status: "unavailable", reason: "invalid" }); checks++;

    const nested = path.join(worktree, ".discovery-runtime", "forbidden-validation");
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: nested, cwd: worktree }), { status: "unavailable", reason: "unsafe" });
    assert.equal(await exists(nested), false, "worktree-nested root is rejected before any write"); checks++;

    const alias = path.join(isolated, "worktree-alias");
    await symlink(worktree, alias);
    const escaped = path.join(alias, ".discovery-runtime", "symlink-validation");
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: escaped, cwd: worktree }), { status: "unavailable", reason: "unsafe" });
    assert.equal(await exists(path.join(worktree, ".discovery-runtime", "symlink-validation")), false, "symlink-parent escape is rejected before any write"); checks++;

    const poisonedParent = path.join(isolated, "poisoned-parent");
    const poisonedTarget = path.join(worktree, ".discovery-runtime", "poisoned-subdirectory-validation");
    await mkdir(poisonedParent, { mode: 0o700 });
    await symlink(poisonedTarget, path.join(poisonedParent, "source-content"));
    assert.deepEqual(await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: poisonedParent, cwd: worktree }), { status: "unavailable", reason: "invalid" });
    assert.equal(await exists(poisonedTarget), false, "symlinked body subdirectory is rejected before any write"); checks++;

    const external = path.join(isolated, "external-founder-runtime");
    const accepted = await resolveFounderLocalAlphaRuntimeRoot({ nodeEnv: "test", enabled: "true", configuredRoot: external, cwd: worktree });
    assert.equal(accepted.status, "ready");
    if (accepted.status !== "ready") throw new Error("external root was not accepted");
    assert.equal((await lstat(accepted.value.root)).mode & 0o777, 0o700);
    assert.equal((await lstat(accepted.value.sourceContentRoot)).mode & 0o777, 0o700);
    assert.equal((await lstat(accepted.value.productArtifactBodyRoot)).mode & 0o777, 0o700); checks++;
    assert.equal(path.dirname(accepted.value.sourceContentRoot), accepted.value.root);
    assert.equal(path.dirname(accepted.value.productArtifactBodyRoot), accepted.value.root); checks++;

    assert.equal(classifyLegacyMeetingOrganizationClaim(undefined, "org-internal"), "absent");
    assert.equal(classifyLegacyMeetingOrganizationClaim("org-internal", "org-internal"), "matching");
    assert.equal(classifyLegacyMeetingOrganizationClaim("org-forged", "org-internal"), "conflict");
    assert.equal(classifyLegacyMeetingOrganizationClaim(["org-internal"], "org-internal"), "conflict"); checks++;

    const opaqueHref = "/product-alpha/meetings/opaque-address";
    const markup = renderToStaticMarkup(<DiscoveryShell organization={{ organizationId: "org-internal-secret", organizationName: "Asterline", runtimeAvailable: true, coherence: null, confidence: null, coherenceLabel: "Understanding beginning" }} showSessionImpact={false} opaqueMeetingHref={opaqueHref}><main>Prepared Work</main></DiscoveryShell>);
    assert.equal(markup.includes("org-internal-secret"), false, "opaque shell serializes no internal organization identifier");
    assert.equal(markup.includes("organizationId="), false, "opaque shell emits no organization query parameter");
    assert.equal((markup.match(/href="\/product-alpha\/meetings\/opaque-address"/g) ?? []).length, 2, "brand and navigation use the opaque Meeting Home address"); checks++;

    const founderRoute = await readFile("app/product-alpha/meetings/[seriesAddress]/page.tsx", "utf8");
    const sandboxRoute = await readFile("app/product-alpha/meetings/[seriesAddress]/SandboxMeetingHome.tsx", "utf8");
    for (const forbidden of [
      "authorizedMeetingDirectory",
      "createLeadershipConversationServerComposition",
      "getPersonalRoomSheetPreviewAction",
      "preparationLineageFixtureProvisioner",
      "readNorthstarPreparationLineageSeed",
    ]) assert.equal(founderRoute.includes(forbidden), false, `founder Meeting Home has no ${forbidden} dependency`);
    assert.equal(founderRoute.includes('process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"'), true, "founder mode has an explicit route boundary");
    assert.equal(founderRoute.indexOf('await import("./SandboxMeetingHome")') > founderRoute.indexOf('process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"'), true, "sandbox composition loads only after the founder branch");
    assert.equal(sandboxRoute.includes("authorizedMeetingDirectory"), true, "sandbox meeting directory remains available");
    assert.equal(sandboxRoute.includes("createLeadershipConversationServerComposition"), true, "sandbox composition remains available");
    assert.equal(sandboxRoute.includes("getPersonalRoomSheetPreviewAction"), true, "sandbox private sheet path remains available"); checks++;

    console.log(`PASS founder runtime storage, opaque navigation, and fixture separation checks=${checks} worktree-writes=0 product-writes=0`);
  } finally {
    await rm(isolated, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
