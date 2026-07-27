import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  productionRouteDisposition,
} from "../../lib/production-route-policy";

const ROOT = path.resolve(__dirname, "../..");
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

const hosted = { NODE_ENV: "production" };
const development = { NODE_ENV: "development" };
const unsafeWhenInactive = [
  "/",
  "/organizations",
  "/your-organization",
  "/ask",
  "/decisions",
  "/research",
  "/brief",
  "/experiment",
  "/discovery-v1",
  "/api/analyze",
  "/api/discovery-lab",
  "/api/executive-decision",
  "/api/executive-decision-record",
  "/api/executive-scenario",
  "/api/product-interaction",
];

for (const pathname of unsafeWhenInactive) {
  check(() => assert.equal(
    productionRouteDisposition({
      pathname,
      activationEnabled: false,
      environment: hosted,
    }),
    "not-found",
    `${pathname} must fail closed when activation is disabled`,
  ));
}

for (const pathname of [
  "/cognition-lab",
  "/discovery-lab",
  "/executive-decision",
]) {
  check(() => assert.equal(
    productionRouteDisposition({
      pathname,
      activationEnabled: false,
      environment: hosted,
    }),
    "not-found",
  ));
  check(() => assert.equal(
    productionRouteDisposition({
      pathname,
      activationEnabled: true,
      environment: hosted,
    }),
    "not-found",
  ));
  check(() => assert.equal(
    productionRouteDisposition({
      pathname,
      activationEnabled: false,
      environment: development,
    }),
    "allow",
  ));
}

check(() => assert.equal(
  productionRouteDisposition({
    pathname: "/api/health",
    activationEnabled: false,
    environment: hosted,
  }),
  "allow",
));
check(() => assert.equal(
  productionRouteDisposition({
    pathname: "/alpha/ask",
    activationEnabled: false,
    environment: hosted,
  }),
  "allow",
));
check(() => assert.equal(
  productionRouteDisposition({
    pathname: "/alpha-access",
    activationEnabled: false,
    environment: hosted,
  }),
  "allow",
));
check(() => assert.equal(
  productionRouteDisposition({
    pathname: "/your-organization",
    activationEnabled: true,
    environment: hosted,
  }),
  "allow",
));
check(() => assert.equal(
  productionRouteDisposition({
    pathname: "/organizations",
    activationEnabled: true,
    environment: hosted,
  }),
  "not-found",
));

const middleware = fs.readFileSync(path.join(ROOT, "middleware.ts"), "utf8");
const activatedLoader = fs.readFileSync(
  path.join(
    ROOT,
    "components/product-shell/data/loadActivatedYourOrganization.ts",
  ),
  "utf8",
);
const activeOrganization = fs.readFileSync(
  path.join(ROOT, "engine/v3/runtime/activeOrganization.ts"),
  "utf8",
);

check(() => assert.match(
  middleware,
  /productionRouteDisposition/,
));
check(() => assert.match(
  middleware,
  /"\/cognition-lab\/:path\*"/,
));
check(() => assert.match(
  middleware,
  /"\/discovery-lab\/:path\*"/,
));
check(() => assert.match(
  middleware,
  /pathname: request\.nextUrl\.pathname/,
));
check(() => assert.ok(
  activatedLoader.indexOf("runDurableAlphaDisclosureTransaction") <
    activatedLoader.indexOf("loadOrganizationRuntimeState"),
  "authorization transaction must be established before Runtime loading",
));
check(() => assert.doesNotMatch(
  activeOrganization,
  /return DEFAULT_ORGANIZATION_ID/,
));
check(() => assert.equal(
  fs.existsSync(
    path.join(ROOT, ".discovery-runtime/organizations/Gary.json"),
  ),
  false,
));
check(() => assert.equal(
  fs.existsSync(
    path.join(ROOT, ".discovery-runtime/organizations/Gary_1.json"),
  ),
  false,
));
check(() => assert.equal(
  fs.existsSync(
    path.join(ROOT, ".discovery-runtime/organizations/Gary_2.json"),
  ),
  false,
));

console.log(JSON.stringify({
  validation: "production-reachability",
  result: "PASS",
  checks,
  inactiveHostedProduct: "fail-closed",
  health: "available",
  advisorAlpha: "legacy-password-gated",
  internalLabs: "development-only",
  governedAlpha: "your-organization-only",
  ambiguousRuntimeSnapshots: "absent",
  defaultOrganizationFallback: "disabled",
}));
