import assert from "node:assert/strict";

import {
  assertFrontendSafeSerialization,
  getRoleAwareFixture,
  isRoleAwareFixtureExperienceEnabled,
  ROLE_AWARE_FIXTURE_IDS,
  ROLE_AWARE_FIXTURES,
  serializeRoleAwareFixture,
  SUPPORTED_ROLE_AWARE_METRIC_IDS,
  UNSUPPORTED_ROLE_AWARE_METRIC_IDS,
} from "../../product/frontend/roleAwareLivingOrganization";
import { mapRoleAwarePresentation, ROLE_AWARE_NAVIGATION } from "../../product/frontend/roleAwarePresentation";

let checks = 0;
function check(condition: unknown, message: string): asserts condition {
  assert.ok(condition, message);
  checks += 1;
}

check(ROLE_AWARE_FIXTURE_IDS.length === 24, "fixture count must be exactly 24");
check(new Set(ROLE_AWARE_FIXTURE_IDS).size === 24, "every fixture ID must be unique");
check(Object.keys(ROLE_AWARE_FIXTURES).length === 24, "catalog must contain exactly 24 fixtures");
check(ROLE_AWARE_FIXTURE_IDS.every((id, index) => id === `RA-${String(index + 1).padStart(2, "0")}`), "fixture IDs must be contiguous RA-01 through RA-24");
check(ROLE_AWARE_NAVIGATION.join("|") === "Home|Understanding|Questions|Decisions|Investigations|History", "navigation must use the canonical six items");

for (const id of ROLE_AWARE_FIXTURE_IDS) {
  const fixture = getRoleAwareFixture(id);
  check(fixture?.fixtureId === id, `${id} must resolve to its exact fixture ID`);
  check(fixture.projection.contractVersion === "1", `${id} must use exact projection contract version`);
  check(fixture.projection.organizationId === "sandbox-northstar-implementation-services-001", `${id} must bind exact organization`);
  check(Boolean(fixture.projection.recipientId), `${id} must bind recipient`);
  check(fixture.projection.requestedScope.organizationId === fixture.projection.organizationId, `${id} must bind requested scope to organization`);
  check(fixture.projection.purpose === "role-aware-fixture-presentation", `${id} must bind purpose`);
  check(["current", "historical"].includes(fixture.projection.temporalMode), `${id} must declare temporal mode`);
  check(Boolean(fixture.projection.projectionId), `${id} must have deterministic projection identity`);
  check(serializeRoleAwareFixture(fixture) === serializeRoleAwareFixture(fixture), `${id} reset must be byte-identical`);
  assertFrontendSafeSerialization(fixture.projection); checks += 1;
  assertFrontendSafeSerialization(mapRoleAwarePresentation(fixture)); checks += 1;
  check(fixture.projection.items.every((item) => item.requestedScope.id === fixture.projection.requestedScope.id), `${id} items must preserve exact scope`);
  check(fixture.projection.items.every((item) => item.disposition !== "safely-abstracted" || (!item.title && !item.summary && item.safeSupportingLineage.length === 0)), `${id} abstractions must omit protected content`);
  check(fixture.projection.metrics.every((metric) => SUPPORTED_ROLE_AWARE_METRIC_IDS.includes(metric.metricId as never) || UNSUPPORTED_ROLE_AWARE_METRIC_IDS.includes(metric.metricId)), `${id} metrics must use canonical IDs`);
  check(fixture.projection.metrics.every((metric) => metric.recipientId === fixture.projection.recipientId), `${id} metric recipient must match the exact projection recipient`);
  check(fixture.projection.metrics.every((metric) => metric.disposition !== "unsupported-metric" || !("value" in metric)), `${id} unsupported metrics must have no value`);
  check(!fixture.projection.decisionCalibration || !("classification" in fixture.projection.decisionCalibration) || fixture.projection.decisionCalibration.axes.length === 8, `${id} calibration must carry all eight axes`);
  check(!fixture.projection.decisionCalibration || !("classification" in fixture.projection.decisionCalibration) || fixture.projection.decisionCalibration.recipientId === fixture.projection.recipientId, `${id} calibration recipient must match the exact projection recipient`);
}

const roleNeutral = structuredClone(ROLE_AWARE_FIXTURES["RA-01"]);
roleNeutral.roleDescription = "Organization executive";
check(serializeRoleAwareFixture(roleNeutral) === serializeRoleAwareFixture(ROLE_AWARE_FIXTURES["RA-01"]), "descriptive role name must not alter authority or projection");
check(ROLE_AWARE_FIXTURES["RA-06"].projection.disposition === "withheld" && ROLE_AWARE_FIXTURES["RA-06"].projection.items.length === 0, "RA-06 must suppress projection children");
check(ROLE_AWARE_FIXTURES["RA-06"].projection.sourceRevisionRef === null && ROLE_AWARE_FIXTURES["RA-06"].projection.auditRefs.length === 0, "RA-06 must reveal no source revision or audit refs");
check(ROLE_AWARE_FIXTURES["RA-07"].projection.items.some((item) => item.disposition === "safely-abstracted"), "RA-07 must contain a genuine safely abstracted item");
check(ROLE_AWARE_FIXTURES["RA-07"].projection.withheldItemCount === null, "RA-07 must not reveal a hidden count");
check(ROLE_AWARE_FIXTURES["RA-08"].projection.temporalMode === "historical" && ROLE_AWARE_FIXTURES["RA-08"].projection.disposition === "unavailable", "RA-08 must fail closed after revocation");
check(ROLE_AWARE_FIXTURES["RA-08"].projection.sourceRevisionRef === null && ROLE_AWARE_FIXTURES["RA-08"].projection.auditRefs.length === 0, "RA-08 must reveal no unavailable revision or audit refs");
check(ROLE_AWARE_FIXTURES["RA-11"].projection.metrics[0]?.disposition === "unsupported-metric", "RA-11 must be explicitly unsupported");
check(ROLE_AWARE_FIXTURES["RA-12"].projection.decisionCalibration && "classification" in ROLE_AWARE_FIXTURES["RA-12"].projection.decisionCalibration && ROLE_AWARE_FIXTURES["RA-12"].projection.decisionCalibration.classification === "aligned-supported", "RA-12 must preserve aligned-supported calibration");
check(ROLE_AWARE_FIXTURES["RA-14"].projection.decisionCalibration && "classification" in ROLE_AWARE_FIXTURES["RA-14"].projection.decisionCalibration && ROLE_AWARE_FIXTURES["RA-14"].projection.decisionCalibration.classification === "justified-divergence", "RA-14 must preserve justified divergence");
check(ROLE_AWARE_FIXTURES["RA-22"].projection.decisionCalibration && "classification" in ROLE_AWARE_FIXTURES["RA-22"].projection.decisionCalibration && ROLE_AWARE_FIXTURES["RA-22"].projection.decisionCalibration.missingAuthorizedInformation.length === 2, "RA-22 must contain claimed missing axes");
check(ROLE_AWARE_FIXTURES["RA-23"].projection.decisionCalibration && "classification" in ROLE_AWARE_FIXTURES["RA-23"].projection.decisionCalibration && ROLE_AWARE_FIXTURES["RA-23"].projection.decisionCalibration.axes.every((axis) => axis.disposition === "withheld" && axis.value === undefined && axis.safeLineage.length === 0), "RA-23 must clear protected calibration values and lineage");
check(ROLE_AWARE_FIXTURES["RA-24"].projection.decisionCalibration && "classification" in ROLE_AWARE_FIXTURES["RA-24"].projection.decisionCalibration && ROLE_AWARE_FIXTURES["RA-24"].projection.decisionCalibration.axes.find((axis) => axis.axis === "outcome-status")?.disposition === "unavailable", "RA-24 must keep Outcome unavailable without erasing calibration");

const forbiddenCanaries: unknown[] = [
  { nested: { organizationRuntime: { memory: [] } } },
  { array: [{ rawPassages: ["protected"] }] },
  { calibration: { support: { restrictedSourceIdentity: "source:private" } } },
  { metric: { lineage: [{ hiddenMetricInputs: ["input:private"] }] } },
  { history: [{ developer: { oauthRefreshToken: "not-a-real-token" } }] },
  { audit: { rawCanonicalObject: { title: "not approved" } } },
  { nestedValue: { safeLabel: "Bearer abcdefghijklmnopqrstuvwxyz" } },
];
for (const [index, canary] of forbiddenCanaries.entries()) {
  let rejected = false;
  try { assertFrontendSafeSerialization(canary); } catch { rejected = true; }
  check(rejected, `nested forbidden canary ${index + 1} must be rejected`);
}
check(!isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "production", discoveryEnvironment: undefined }), "Production must fail closed by default");
check(!isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "production", discoveryEnvironment: "staging" }), "staging must not expose fixtures through a Production build");
check(!isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "production", discoveryEnvironment: "development" }), "a development label must not override a Production runtime");
check(!isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "development", discoveryEnvironment: undefined }), "an unlabeled runtime must fail closed");
check(!isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "development", discoveryEnvironment: "sandbox" }), "a sandbox label must not expose the development fixture route");
check(isRoleAwareFixtureExperienceEnabled({ nodeEnvironment: "development", discoveryEnvironment: "development" }), "exact local development must expose fixture route");

console.log(JSON.stringify({ validation: "role-aware-frontend-fixtures", result: "PASS", checks, fixtureCount: ROLE_AWARE_FIXTURE_IDS.length, fixtureIds: ROLE_AWARE_FIXTURE_IDS, resetByteIdentical: true, forbiddenFieldsFound: [], roleNameUsedAsAuthority: false, sameAdapterPath: true }, null, 2));
