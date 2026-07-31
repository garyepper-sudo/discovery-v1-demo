import type { AcquisitionAction, AcquisitionActionKind, AcquisitionScenario } from "./types";

type ActionOverrides = Partial<Omit<AcquisitionAction, "id" | "kind">>;

const action = (id: string, kind: AcquisitionActionKind, overrides: ActionOverrides = {}): AcquisitionAction => ({
  id,
  kind,
  expectedInformationGain: 0.5,
  expectedOrganizationalValue: 0.5,
  userBurden: 0.2,
  acquisitionCost: 0.2,
  delay: 0.1,
  sourceReliability: 0.8,
  existingEvidenceQuality: 0.5,
  authorized: true,
  governanceAllowed: true,
  reversible: true,
  ...overrides,
});

const weak = (id: string, kind: AcquisitionActionKind) => action(id, kind, {
  expectedInformationGain: 0.15,
  expectedOrganizationalValue: 0.15,
  userBurden: 0.5,
  acquisitionCost: 0.5,
  delay: 0.5,
  sourceReliability: 0.5,
});

const scenario = (
  id: string,
  label: string,
  expected: AcquisitionAction,
  alternatives: AcquisitionAction[],
  tags: string[],
  negativeControl = false,
): AcquisitionScenario => ({ id, label, candidates: [expected, ...alternatives], expectedActionId: expected.id, tags, negativeControl });

const strong = (id: string, kind: AcquisitionActionKind, overrides: ActionOverrides = {}) => action(id, kind, {
  expectedInformationGain: 0.86,
  expectedOrganizationalValue: 0.84,
  userBurden: 0.1,
  acquisitionCost: 0.1,
  delay: 0.1,
  sourceReliability: 0.9,
  existingEvidenceQuality: 0.8,
  ...overrides,
});

export const acquisitionScenarios: AcquisitionScenario[] = [
  scenario("evidence-sufficient", "Existing evidence is already sufficient", strong("stop", "do-nothing", { expectedInformationGain: 0.05, expectedOrganizationalValue: 0.9, userBurden: 0, acquisitionCost: 0, delay: 0 }), [weak("ask", "ask-user"), weak("search", "search-existing")], ["stopping"]),
  scenario("existing-search", "Relevant authorized evidence has not been searched", strong("search", "search-existing", { userBurden: 0 }), [weak("ask", "ask-user"), weak("survey", "recommend-survey")], ["search"]),
  scenario("contradictory", "Existing evidence is contradictory and directly comparable", strong("compare", "compare-evidence", { expectedInformationGain: 0.92 }), [weak("ask", "ask-user"), weak("experiment", "recommend-experiment")], ["comparison"]),
  scenario("stale-measure", "Existing evidence is stale and a reliable measure is available", strong("measure", "recommend-measurement", { existingEvidenceQuality: 0.2 }), [weak("search", "search-existing"), weak("ask", "ask-user")], ["freshness", "measurement"]),
  scenario("user-already-answered", "The user already answered and supporting records are available", strong("search", "search-existing", { userBurden: 0 }), [weak("ask-again", "ask-user")], ["burden"]),
  scenario("evidence-unavailable", "Evidence is unavailable but the authorized owner knows the answer", strong("ask-owner", "ask-user", { sourceReliability: 0.85 }), [weak("search", "search-existing"), weak("measure", "recommend-measurement")], ["question"]),
  scenario("unauthorized-source", "Highest-gain source is unauthorized", strong("abstain", "abstain", { expectedInformationGain: 0, expectedOrganizationalValue: 0.7, userBurden: 0, acquisitionCost: 0, delay: 0 }), [strong("private-search", "search-existing", { expectedInformationGain: 1, authorized: false, governanceAllowed: false })], ["authorization"], true),
  scenario("permission-denial", "Permission was explicitly denied", strong("abstain", "abstain", { expectedInformationGain: 0, expectedOrganizationalValue: 0.8, userBurden: 0, acquisitionCost: 0, delay: 0 }), [strong("request-private", "request-document", { authorized: false, governanceAllowed: false })], ["authorization"], true),
  scenario("cheap-survey", "A cheap representative survey resolves stakeholder uncertainty", strong("survey", "recommend-survey", { acquisitionCost: 0.15, delay: 0.25 }), [weak("ask-one", "ask-user"), weak("experiment", "recommend-experiment")], ["survey"]),
  scenario("expensive-survey", "An expensive survey adds little value", strong("stop", "do-nothing", { expectedInformationGain: 0.05, expectedOrganizationalValue: 0.72, userBurden: 0, acquisitionCost: 0, delay: 0 }), [strong("survey", "recommend-survey", { expectedInformationGain: 0.55, expectedOrganizationalValue: 0.4, acquisitionCost: 1, userBurden: 0.8, delay: 0.8 })], ["survey", "cost"], true),
  scenario("experiment-causal", "A reversible experiment discriminates causal alternatives", strong("experiment", "recommend-experiment", { expectedInformationGain: 0.95, acquisitionCost: 0.35, delay: 0.35 }), [weak("survey", "recommend-survey"), weak("ask", "ask-user")], ["experiment"]),
  scenario("irreversible-experiment", "A risky irreversible experiment is not governable", strong("abstain", "abstain", { expectedInformationGain: 0, expectedOrganizationalValue: 0.75, userBurden: 0, acquisitionCost: 0, delay: 0 }), [strong("experiment", "recommend-experiment", { expectedInformationGain: 1, expectedOrganizationalValue: 0.9, governanceAllowed: false, reversible: false })], ["experiment", "governance"], true),
  scenario("measurement-direct", "A direct reliable measurement resolves the uncertainty", strong("measure", "recommend-measurement", { expectedInformationGain: 0.94 }), [weak("ask", "ask-user"), weak("survey", "recommend-survey")], ["measurement"]),
  scenario("unreliable-measure", "Available measurement is unreliable", strong("ask", "ask-user", { expectedInformationGain: 0.7, sourceReliability: 0.85 }), [strong("measure", "recommend-measurement", { expectedInformationGain: 0.95, sourceReliability: 0.1 })], ["reliability"]),
  scenario("wait-outcome", "A committed action has a governed Outcome due soon", strong("wait", "recommend-waiting", { expectedInformationGain: 0.9, userBurden: 0, acquisitionCost: 0, delay: 0.3 }), [weak("ask", "ask-user"), weak("experiment", "recommend-experiment")], ["waiting"]),
  scenario("waiting-worsens", "Delay will make evidence materially stale", strong("measure", "recommend-measurement", { delay: 0.05 }), [strong("wait", "recommend-waiting", { expectedInformationGain: 0.7, expectedOrganizationalValue: 0.2, delay: 1 })], ["waiting", "freshness"]),
  scenario("executive-authority", "One governing executive can resolve objective authority", strong("ask", "ask-user", { expectedInformationGain: 0.9, expectedOrganizationalValue: 0.95 }), [weak("search", "search-existing"), weak("survey", "recommend-survey")], ["authority", "question"]),
  scenario("low-value-curiosity", "An interesting uncertainty cannot change understanding or action", strong("stop", "do-nothing", { expectedInformationGain: 0.04, expectedOrganizationalValue: 0.8, userBurden: 0, acquisitionCost: 0, delay: 0 }), [weak("ask", "ask-user"), weak("search", "search-existing")], ["stopping"], true),
  scenario("objective-ambiguity", "Objective authority is ambiguous", strong("ask-authority", "ask-user", { expectedOrganizationalValue: 0.95 }), [weak("search", "search-existing"), weak("measure", "recommend-measurement")], ["objective"]),
  scenario("understanding-ambiguity", "Existing evidence can discriminate competing explanations", strong("compare", "compare-evidence", { expectedInformationGain: 0.95 }), [weak("ask", "ask-user"), weak("survey", "recommend-survey")], ["understanding"]),
  scenario("optimization-ambiguity", "Risk posture requires an authorized preference", strong("ask", "ask-user", { expectedOrganizationalValue: 0.93 }), [weak("search", "search-existing"), weak("experiment", "recommend-experiment")], ["optimization"]),
  scenario("request-document", "The exact missing primary document is known", strong("document", "request-document", { expectedInformationGain: 0.9, userBurden: 0.2 }), [weak("survey", "recommend-survey"), weak("ask", "ask-user")], ["document"]),
  scenario("equal-actions", "Two actions have equal gross gain but one is cheaper", strong("search", "search-existing", { expectedInformationGain: 0.8, expectedOrganizationalValue: 0.8, userBurden: 0, acquisitionCost: 0.05 }), [strong("survey", "recommend-survey", { expectedInformationGain: 0.8, expectedOrganizationalValue: 0.8, userBurden: 0.5, acquisitionCost: 0.7 })], ["tradeoff"]),
  scenario("no-action", "No meaningful authorized acquisition is available", strong("abstain", "abstain", { expectedInformationGain: 0, expectedOrganizationalValue: 0.75, userBurden: 0, acquisitionCost: 0, delay: 0 }), [weak("ask", "ask-user"), strong("private", "search-existing", { authorized: false, governanceAllowed: false })], ["stopping"], true),
  scenario("search-low-quality", "Existing evidence is low quality and a reliable document exists", strong("document", "request-document", { sourceReliability: 0.95 }), [strong("search", "search-existing", { existingEvidenceQuality: 0.05, sourceReliability: 0.2, expectedInformationGain: 0.45 })], ["quality"]),
  scenario("survey-representation", "Distributed stakeholder beliefs require representative sampling", strong("survey", "recommend-survey", { expectedInformationGain: 0.88 }), [strong("ask-one", "ask-user", { expectedInformationGain: 0.45, sourceReliability: 0.3 })], ["survey", "representation"]),
  scenario("outcome-not-due", "Outcome wait is too long and a proxy measurement is available", strong("measure", "recommend-measurement", { expectedInformationGain: 0.75, delay: 0.15 }), [strong("wait", "recommend-waiting", { expectedInformationGain: 0.9, delay: 1, expectedOrganizationalValue: 0.5 })], ["waiting", "delay"]),
  scenario("search-before-ask", "Existing high-quality evidence can answer without user interruption", strong("search", "search-existing", { userBurden: 0 }), [strong("ask", "ask-user", { userBurden: 0.7, expectedInformationGain: 0.75 })], ["search", "burden"]),
  scenario("ask-before-search", "Only an authorized preference can resolve the uncertainty", strong("ask", "ask-user", { expectedOrganizationalValue: 0.95 }), [strong("search", "search-existing", { expectedInformationGain: 0.8, expectedOrganizationalValue: 0.25 })], ["question", "authority"]),
  scenario("repeat-question", "The same question was already answered", strong("compare", "compare-evidence", { userBurden: 0 }), [strong("ask-again", "ask-user", { userBurden: 0.9, expectedInformationGain: 0.25 })], ["burden"], true),
  { ...scenario("existing-search-paraphrase", "Authorized evidence remains unsearched", strong("search", "search-existing", { userBurden: 0 }), [weak("ask", "ask-user"), weak("survey", "recommend-survey")], ["search"]), wordingVariantOf: "existing-search" },
  { ...scenario("executive-authority-paraphrase", "The governing owner can settle the objective", strong("ask", "ask-user", { expectedInformationGain: 0.9, expectedOrganizationalValue: 0.95 }), [weak("search", "search-existing"), weak("survey", "recommend-survey")], ["authority", "question"]), wordingVariantOf: "executive-authority" },
];
