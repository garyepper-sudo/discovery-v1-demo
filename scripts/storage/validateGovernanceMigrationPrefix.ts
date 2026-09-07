import assert from "node:assert/strict";

import { hasExactCanonicalMigrationPrefix } from "./governanceMigrationContract";

const expected = [
  { hash: "foundation", folderMillis: 1785067200000 },
  { hash: "actor-reference", folderMillis: 1785153600000 },
] as const;

const checks: string[] = [];
function check(name: string, actual: boolean, expectedResult: boolean): void {
  assert.equal(actual, expectedResult, name);
  checks.push(name);
}

check("empty applied history is the canonical empty prefix", hasExactCanonicalMigrationPrefix(expected, []), true);
check("canonical predecessor is an exact prefix", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "1785067200000" },
]), true);
check("complete canonical history is accepted", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "1785067200000" },
  { hash: "actor-reference", created_at: "1785153600000" },
]), true);
check("skipped predecessor is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "actor-reference", created_at: "1785153600000" },
]), false);
check("reordered history is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "actor-reference", created_at: "1785153600000" },
  { hash: "foundation", created_at: "1785067200000" },
]), false);
check("duplicate entry is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "1785067200000" },
  { hash: "foundation", created_at: "1785067200000" },
]), false);
check("altered digest is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "other", created_at: "1785067200000" },
]), false);
check("altered timestamp is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "1785067200001" },
]), false);
check("non-canonical timestamp spelling is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "01785067200000" },
]), false);
check("extra successor is rejected", hasExactCanonicalMigrationPrefix(expected, [
  { hash: "foundation", created_at: "1785067200000" },
  { hash: "actor-reference", created_at: "1785153600000" },
  { hash: "unexpected", created_at: "1785240000000" },
]), false);

console.log(JSON.stringify({
  validation: "governance-migration-exact-prefix",
  result: "PASS",
  checks: checks.length,
  databaseTouched: false,
}, null, 2));
