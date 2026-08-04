import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import RoleAwareExperience from "../../components/role-aware/RoleAwareExperience";
import { assertFrontendSafeSerialization, ROLE_AWARE_FIXTURES, type RoleAwareFixtureId } from "../../product/frontend/roleAwareLivingOrganization";
import { HOME_SECTIONS, mapRoleAwarePresentation, ROLE_AWARE_NAVIGATION } from "../../product/frontend/roleAwarePresentation";

const FIRST_SLICE: RoleAwareFixtureId[] = ["RA-01", "RA-02", "RA-07", "RA-08", "RA-11", "RA-12", "RA-14", "RA-22", "RA-23", "RA-24"];
let checks = 0;
function check(condition: unknown, message: string): asserts condition { assert.ok(condition, message); checks += 1; }

const results = FIRST_SLICE.map((id) => {
  const fixture = ROLE_AWARE_FIXTURES[id];
  const view = mapRoleAwarePresentation(fixture);
  assertFrontendSafeSerialization(view); checks += 1;
  const html = renderToStaticMarkup(<RoleAwareExperience view={view} fixtureMode />);
  check(html.includes("<main"), `${id} shell must render a main landmark`);
  check((html.match(/<main/g) ?? []).length === 1, `${id} must render one main landmark`);
  check((html.match(/aria-label="Primary navigation"/g) ?? []).length === 1, `${id} must render one primary navigation landmark`);
  check(ROLE_AWARE_NAVIGATION.every((item) => html.includes(`>${item}</a>`)), `${id} must render canonical navigation`);
  check(html.includes(fixture.primaryHeading), `${id} must render its primary heading`);
  check(!fixture.primaryAction || html.includes(fixture.primaryAction), `${id} must render its primary action`);
  check(html.includes(fixture.fixtureId), `${id} must identify fixture mode`);
  check(!/OrganizationRuntime|runtime memory|raw Runtime|raw Evidence|connector metadata|credentials/i.test(html), `${id} must not render prohibited internals`);
  check(!html.includes("Discovery is 82% confident"), `${id} must not fabricate confidence`);
  check(!html.includes("compliance score") && !html.includes("good decision") && !html.includes("bad decision"), `${id} must avoid judgmental score language`);
  return { fixtureId: id, workspace: fixture.workspace, rendered: true, bytes: Buffer.byteLength(html) };
});

const homeHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-01"])} fixtureMode />);
check(HOME_SECTIONS.every((section) => homeHtml.includes(section.title)), "Home must render the canonical seven-section hierarchy");
check(homeHtml.indexOf(HOME_SECTIONS[0].title) < homeHtml.indexOf(HOME_SECTIONS[6].title), "Home hierarchy must retain canonical order");
check(homeHtml.includes("Organizational Understanding coherence") && homeHtml.includes("Organizational Learning Profile learning velocity"), "Home must render only the supported measure names when present");
check(!homeHtml.slice(homeHtml.indexOf("Outcomes and Learning"), homeHtml.indexOf("Supported measures")).includes("Review timing changed"), "Home must not reinterpret material change as Outcome or Learning");
const unsupportedHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-11"])} fixtureMode />);
check(unsupportedHtml.includes("Not supported") && !unsupportedHtml.includes("undefined</b>"), "unsupported measure must render no fabricated value");
const abstractedHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-07"])} fixtureMode />);
check(abstractedHtml.includes("Limited view") && !abstractedHtml.includes("ra07:limited"), "safe abstraction must not reveal protected fixture data");
const withheldHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-23"])} fixtureMode />);
check(withheldHtml.includes("Not shown") && !withheldHtml.includes("fixture:authority"), "withheld calibration must reveal no protected value");
const unavailableHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-08"])} fixtureMode />);
check(unavailableHtml.includes("Not available") && !unavailableHtml.includes("Not shown"), "unavailable must remain distinct from withheld");
const historyHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-24"])} fixtureMode />);
check(historyHtml.includes("Decision context was reviewed"), "history must render the projected material change");
check(!historyHtml.includes("Prior authorized revision") && !historyHtml.includes("The review added context but did not change current Understanding."), "history must not invent an unprojected prior revision");
const insufficientHtml = renderToStaticMarkup(<RoleAwareExperience view={mapRoleAwarePresentation(ROLE_AWARE_FIXTURES["RA-22"])} fixtureMode />);
check(insufficientHtml.includes("More information needed") && !insufficientHtml.includes("unexplained drift"), "insufficient state must avoid false classification");

console.log(JSON.stringify({ validation: "role-aware-first-slice-render", result: "PASS", checks, firstSliceFixtureCount: FIRST_SLICE.length, fixturesRendered: results.length, results, shellRendered: true, homeSectionCount: HOME_SECTIONS.length, understandingDetailRendered: true, decisionDetailRendered: true, investigationDetailRendered: true, historyRendered: true }, null, 2));
