import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const files = {
  root: "app/page.tsx",
  onboarding: "app/onboarding/page.tsx",
  legacy: "app/discovery-v1/page.tsx",
  yourOrganization: "app/(product)/your-organization/page.tsx",
  organizations: "app/(product)/organizations/page.tsx",
  shell: "components/product-shell/DiscoveryShell.tsx",
  workspace: "components/product-shell/ProductWorkspace.tsx",
  routeState: "lib/onboarding/testing/onboardingTestOrganization.ts",
  contract: "docs/Product/CANONICAL_PRODUCT_ROUTES.md",
  guidance: "AGENTS.md",
} as const;

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  }));
  return nested.flat();
}

async function main(): Promise<void> {
  const sources = Object.fromEntries(await Promise.all(
    Object.entries(files).map(async ([name, file]) => [
      name,
      await readFile(file, "utf8"),
    ]),
  )) as Record<keyof typeof files, string>;

  assert.match(sources.root, /export const dynamic = ["']force-dynamic["'];/);
  assert.match(sources.root, /redirect\(["']\/onboarding["']\)/);
  assert.match(sources.root, /redirect\(["']\/organizations["']\)/);
  assert.doesNotMatch(
    sources.root,
    /return\s*\(|<[A-Z][A-Za-z0-9]*|<main\b|<section\b/,
    "app/page.tsx must remain a routing controller without product UI",
  );

  assert.match(sources.onboarding, /export const dynamic = ["']force-dynamic["'];/);
  assert.match(
    sources.onboarding,
    /components\/onboarding\/DiscoveryOnboardingExperience/,
  );
  assert.match(sources.onboarding, /resolveOnboardingRouteState/);

  assert.match(
    sources.legacy,
    /components\/onboarding\/DiscoveryOnboardingExperience/,
  );
  assert.doesNotMatch(
    sources.legacy,
    /["']use client["']|\.module\.css|fetch\(|resolveOnboardingRouteState|validateOnboardingTestEnvironment|DiscoveryShell|ProductWorkspace/,
    "/discovery-v1 must remain a thin Legacy Compatibility Layer",
  );

  assert.match(sources.yourOrganization, /DiscoveryShell|ProductWorkspace/);
  assert.match(
    sources.yourOrganization,
    /isYourOrganizationAlphaPresentationEnabled/,
  );
  assert.match(sources.yourOrganization, /loadActivatedYourOrganization/);
  assert.match(sources.yourOrganization, /<AlphaExperience/);
  assert.doesNotMatch(sources.yourOrganization, /alphaFixture/);
  assert.match(sources.organizations, /OrganizationsExperience/);
  assert.match(sources.shell, /export default function DiscoveryShell/);
  assert.match(sources.workspace, /import DiscoveryShell from ["']\.\/DiscoveryShell["']/);
  assert.doesNotMatch(
    sources.workspace,
    /buildProductHref\(\s*["']\/discovery-v1["']/,
    "Product shell fallbacks must not target legacy UI",
  );

  assert.match(sources.routeState, /destination: "\/organizations"/);
  assert.match(
    sources.routeState,
    /destination: `\/your-organization\?organizationId=/,
  );

  assert.match(sources.contract, /\*\*Status:\*\* Canonical/);
  assert.match(
    sources.contract,
    /Canonical Product Shell: `components\/product-shell\/DiscoveryShell\.tsx`/,
  );
  assert.match(
    sources.guidance,
    /docs\/Product\/CANONICAL_PRODUCT_ROUTES\.md/,
  );

  const declaredShells = (await Promise.all(
    (await markdownFiles("docs")).map(async (file) => {
      const source = await readFile(file, "utf8");
      return [...source.matchAll(/Canonical Product Shell: `([^`]+)`/g)]
        .map((match) => ({ file, implementation: match[1] }));
    }),
  )).flat();
  assert.deepEqual(declaredShells, [{
    file: files.contract,
    implementation: files.shell,
  }], "Exactly one canonical Product Shell implementation must be declared");

  console.log("Canonical product route validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
