import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2] ?? "all";
const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const route = read("app/product-alpha/page.tsx");
const api = read("app/api/product-alpha/route.ts");
const service = read("product/frontend/liveSandboxProductWorkspaceService.ts");
const view = read("components/product-alpha/ProductAlphaExperience.tsx");
const middleware = read("middleware.ts");
const adapter = read("product/integration/canonicalProductWorkspaceAdapter.ts");

function boundary() {
  assert.match(route, /mode === "live-sandbox"/);
  assert.match(route, /validateOnboardingTestEnvironment/);
  assert.match(route, /isOnboardingTestOrganizationId/);
  assert.match(service, /import "server-only"/);
  assert.match(service, /CanonicalProductWorkspaceAdapter/);
  assert.match(service, /validateOnboardingTestEnvironment/);
  assert.match(service, /backend !== "filesystem"/);
  assert.match(middleware, /product-alpha/);
  assert.match(middleware, /api\\\/\(\?:discovery-lab\|product-alpha\|development/);
  assert.doesNotMatch(api, /runtimeRevision|OrganizationRuntime|runDiscoveryV3/);
  assert.doesNotMatch(view, /engine\/v3|Runtime|cognition|relevance|ProductCommunication/);
}

function list() {
  assert.match(service, /adapter\.listQuestions/);
  assert.match(view, /loadLive\(question\.id\)/);
  assert.match(view, /window\.history\.replaceState/);
}

function questionIsolation() {
  assert.match(view, /loadLive\(question\.id\)/);
  assert.match(
    read("product/workflow/buildProductQuestionWorkspace.ts"),
    /questionHasActivity/,
  );
  assert.match(
    read("product/workflow/buildProductQuestionWorkspace.ts"),
    /durableQuestion && question\.searchHistory\.length === 0/,
  );
}

function create() {
  assert.match(service, /adapter\.createQuestion/);
  assert.match(api, /type === "create"/);
  assert.match(view, /Creating Question…/);
  assert.doesNotMatch(view, /setLiveSnapshot\([^)]*question:/);
}

function evidence() {
  assert.match(service, /adapter\.contributeEvidence/);
  assert.match(service, /sourceType: "paste"/);
  assert.match(service, /recordProductWorkspaceLifecycle|CanonicalProductWorkspaceAdapter/);
  assert.match(view, /Updating this understanding…/);
}

function idempotency() {
  assert.match(api, /idempotencyKey/);
  assert.match(adapter, /product-contribution/);
  assert.match(adapter, /if \(existing\)/);
  assert.match(view, /mutationIdempotencyKey/);
  assert.match(view, /crypto\.subtle\.digest/);
  assert.match(view, /value\.trim\(\)\.replace\(\/\\s\+\/g, " "\)/);
  assert.doesNotMatch(view, /crypto\.randomUUID/);
}

function history() {
  assert.match(service, /historicalAnswers/);
  assert.match(service, /reason: "source-missing"/);
  assert.match(view, /An earlier Answer existed/);
}

function errors() {
  assert.match(service, /Organization access denied/);
  assert.match(service, /Reload and try again/);
  assert.match(api, /status \= message === "Authentication required\."/);
  assert.match(view, /role="alert"/);
  assert.match(view, /Discovery could not save this update/);
}

function parity() {
  assert.equal((view.match(/return \(/g) ?? []).length > 1, true);
  assert.match(view, /const snapshot: ProductAlphaSnapshot/);
  assert.match(view, /mode === "live-sandbox"/);
  assert.match(view, /workspace\.answer/);
  assert.doesNotMatch(view, /liveSnapshot\.workspace\.answer/);
}

const validations: Record<string, () => void> = {
  boundary,
  list,
  create,
  evidence,
  reload: list,
  idempotency,
  relevance: evidence,
  isolation: questionIsolation,
  adoption: () => {
    assert.match(service, /adapter\.adoptLegacyQuestions/);
    assert.match(service, /product-alpha-adopt:/);
  },
  history,
  model: () => {
    assert.match(view, /workspace\.modelState/);
    assert.doesNotMatch(view, /modelState\s*=/);
  },
  errors,
  parity,
  fallback: () => {
    assert.doesNotMatch(service, /fixtureProductWorkspaceAdapter|legacy.*projection/i);
    assert.doesNotMatch(api, /fixtureProductWorkspaceAdapter|legacy.*projection/i);
  },
};

if (mode === "all") Object.values(validations).forEach((validate) => validate());
else {
  const validate = validations[mode];
  assert.ok(validate, `Unknown live integration validation: ${mode}`);
  validate();
}

console.log(`Product Alpha live integration validation passed (${mode}).`);
