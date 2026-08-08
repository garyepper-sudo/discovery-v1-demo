import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  resolveCanonicalOrganizationalUnderstandingChange,
  validateCanonicalOrganizationalUnderstandingChangeOutcome,
  validateCanonicalOrganizationalUnderstandingChangeResult,
} from "../../engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange";

const ORG = "canonical-change-validation";
const QUESTION = "question-one";
const OPERATION = "operation-one";
let checks = 0;
const check = (value: unknown, message: string) => { assert.ok(value, message); checks += 1; };
const stable = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value as Record<string, unknown>).sort().map(key => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`
    : JSON.stringify(value);
const sha = (value: unknown) => createHash("sha256").update(stable(value)).digest("hex");
const composition = (id: string, revisionId: string): CanonicalUnderstandingComposition => ({
  id, revisionId, previousRevisionId: null, organizationId: ORG,
  scope: { organizationId: ORG, type: "organization", id: ORG },
  outcomeRef: { type: "phenomenon", id: `outcome-${id}` },
  explanationIds: [`explanation-${revisionId}`], compositionUncertainty: [],
  createdAt: "2026-08-07T00:00:00.000Z", updatedAt: "2026-08-07T00:00:00.000Z",
});
const resolve = (before: CanonicalUnderstandingComposition[] | undefined, after: CanonicalUnderstandingComposition[] | undefined) =>
  resolveCanonicalOrganizationalUnderstandingChange({ organizationId: ORG, questionId: QUESTION, contributionOperationId: OPERATION, beforeCompositions: before, afterCompositions: after });

const empty = resolve([], []); check(empty.status === "available" && empty.result.disposition === "unchanged", "empty state unchanged");
const first = resolve([], [composition("a", "r1")]); check(first.status === "available" && first.result.disposition === "changed", "first composition changed");
const replaced = resolve([composition("a", "r1")], [composition("a", "r2")]); check(replaced.status === "available" && replaced.result.disposition === "changed", "replacement changed");
const removed = resolve([composition("a", "r1")], []); check(removed.status === "available" && removed.result.disposition === "changed", "removed composition changed");
const ordered = resolve([composition("a", "r1"), composition("b", "r1")], [composition("b", "r1"), composition("a", "r1")]);
check(ordered.status === "available" && ordered.result.disposition === "unchanged", "enumeration order is neutral");
const duplicated = resolve([composition("a", "r1"), composition("a", "r1")], [composition("a", "r1")]);
check(duplicated.status === "available" && duplicated.result.disposition === "unchanged", "identical duplicates normalize");
assert.throws(() => resolve([composition("a", "r1"), composition("a", "r2")], [])); checks += 1;
const unavailable = resolve(undefined, []); check(unavailable.status === "unavailable", "historical missing state unavailable");
validateCanonicalOrganizationalUnderstandingChangeOutcome(unavailable); checks += 1;
assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeOutcome({ status: "unavailable", reason: "invalid" } as never)); checks += 1;
assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeOutcome(undefined as never)); checks += 1;
if (ordered.status !== "available") throw new Error("available result expected");
const expectedRefs = [{ compositionId: "a", revisionId: "r1" }, { compositionId: "b", revisionId: "r1" }];
const expectedSetDigest = sha({ contractVersion: "1", revisionRefs: expectedRefs });
check(ordered.result.beforeCompositionSetDigest === expectedSetDigest && ordered.result.afterCompositionSetDigest === expectedSetDigest, "independent set digest");
const { resultDigest: _digest, ...unsigned } = ordered.result;
check(ordered.result.resultDigest === sha(unsigned), "independent result digest");
validateCanonicalOrganizationalUnderstandingChangeResult(ordered.result); checks += 1;
assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeResult({ ...ordered.result, disposition: "changed" })); checks += 1;
assert.throws(() => validateCanonicalOrganizationalUnderstandingChangeResult({ ...ordered.result, resultDigest: "0".repeat(64) })); checks += 1;
assert.throws(() => resolve([composition("a", "r1")], [{ ...composition("a", "r1"), organizationId: "wrong" }])); checks += 1;
check(!JSON.stringify(ordered).includes("workspace") && !JSON.stringify(ordered).includes("authorization"), "non-authority fields absent");

console.log(JSON.stringify({ validation: "canonical-organizational-understanding-change-result-001", result: "PASS", checks, independentOracle: true, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0 }));
