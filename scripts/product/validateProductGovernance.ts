import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();
const productDirectory = join(root, "docs/Product");
const documents = [
  "CANONICAL_PRODUCT_ARCHITECTURE.md",
  "PRODUCT_GAPS.md",
  "PRODUCT_ROADMAP.md",
  "PRODUCT_DECISIONS.md",
  "PRODUCT_GOVERNANCE.md",
] as const;

const content = new Map(documents.map((name) => {
  const path = join(productDirectory, name);
  assert.equal(existsSync(path), true, `Missing governance document: ${name}`);
  return [name, readFileSync(path, "utf8")] as const;
}));

let checks = documents.length;

function check(condition: unknown, message: string): void {
  assert.ok(condition, message);
  checks += 1;
}

for (const [name, source] of content) {
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)) {
    const target = match[1]!;
    if (/^[a-z]+:/i.test(target)) continue;
    const path = resolve(dirname(join(productDirectory, name)), target);
    check(existsSync(path), `${name} contains a broken Markdown reference: ${target}`);
  }
}

const architecture = content.get("CANONICAL_PRODUCT_ARCHITECTURE.md")!;
const normalizedArchitecture = architecture.toLowerCase();
for (const term of [
  "ProductQuestion",
  "ProductQuestionWorkspace",
  "ProductAnswer",
  "ProductAnswerConfidence",
  "ProductDecision",
  "ProductOutcomeReview",
  "ProductModelState",
  "ProductInsight",
  "Organization Runtime",
  "projection firewall",
]) {
  check(
    normalizedArchitecture.includes(term.toLowerCase()),
    `Architecture does not reference current contract: ${term}`,
  );
}
check(
  architecture.includes("Changes to this architecture require evidence"),
  "Architecture-change evidence rule is missing.",
);

const gaps = content.get("PRODUCT_GAPS.md")!;
const gapIds = [...gaps.matchAll(/\|\s*(GAP-[A-D]-\d{3})\s*\|/g)]
  .map((match) => match[1]!);
check(gapIds.length >= 30, "Gap register is unexpectedly incomplete.");
check(new Set(gapIds).size === gapIds.length, "Duplicate Product Gap identifiers exist.");
const registeredGaps = new Set(gapIds);
const resolvedGapIds = [...gaps.matchAll(/\|\s*(GAP-R-\d{3})\s*\|/g)]
  .map((match) => match[1]!);
check(gaps.includes("## Resolved Gaps"), "Resolved Gaps ledger is missing.");
check(resolvedGapIds.length > 0, "Resolved Gaps ledger is empty.");
check(
  new Set(resolvedGapIds).size === resolvedGapIds.length,
  "Duplicate resolved Product Gap identifiers exist.",
);
check(
  resolvedGapIds.every((id) => !registeredGaps.has(id)),
  "A resolved Gap identifier is also registered as unresolved.",
);
for (const heading of [
  "Original problem",
  "Solution implemented",
  "Repository location",
  "Date resolved",
  "Validation proving resolution",
]) {
  check(gaps.includes(heading), `Resolved Gaps ledger is missing: ${heading}`);
}

for (const requiredGap of [
  "Governed Google Drive retrieval",
  "Governed Slack retrieval",
  "Email retrieval",
  "Source-backed freshness",
  "Semantic freshness",
  "Connected outcome acquisition",
  "Autonomous reevaluation",
  "Proactive insight delivery",
  "Notification suppression",
  "Question clustering",
  "Cross-question reasoning",
  "Evidence deduplication",
  "Evidence expiration",
  "Multi-user understanding",
  "Role-specific visibility",
  "Confidence calibration",
  "Production observability",
  "Recovery testing",
  "Scalability validation",
]) {
  check(gaps.includes(requiredGap), `Required deferred capability is missing: ${requiredGap}`);
}

const roadmap = content.get("PRODUCT_ROADMAP.md")!;
for (const phase of [
  "Phase 3 — Frontend proof",
  "Phase 4 — First governed connector",
  "Phase 5 — Connected understanding",
  "Phase 6 — Autonomous organizational intelligence",
]) {
  check(roadmap.includes(phase), `Roadmap phase is missing: ${phase}`);
}
const roadmapGapIds = [...new Set(
  [...roadmap.matchAll(/GAP-[A-D]-\d{3}/g)].map((match) => match[0]),
)];
check(roadmapGapIds.length > 0, "Roadmap does not reference Product Gaps.");
for (const id of roadmapGapIds) {
  check(registeredGaps.has(id), `Roadmap references unknown Product Gap: ${id}`);
}

const decisions = content.get("PRODUCT_DECISIONS.md")!;
check(
  decisions.includes("[CANONICAL_PRODUCT_ARCHITECTURE.md](./CANONICAL_PRODUCT_ARCHITECTURE.md)"),
  "Product Decisions must reference Product Architecture.",
);
const decisionIds = [...decisions.matchAll(/##\s+(DEC-PROD-\d{3})/g)]
  .map((match) => match[1]!);
check(decisionIds.length >= 12, "Foundational Product Decisions are incomplete.");
check(new Set(decisionIds).size === decisionIds.length, "Duplicate Product Decision identifiers exist.");

const governance = content.get("PRODUCT_GOVERNANCE.md")!;
for (const rule of [
  "Ownership",
  "Persistence",
  "Lineage",
  "Confidence",
  "Authorization",
  "Validation",
  "Fixtures",
  "Version review",
  "Migration",
]) {
  check(governance.includes(rule), `Governance declaration is missing: ${rule}`);
}

const agents = readFileSync(join(root, "AGENTS.md"), "utf8");
for (const name of documents) {
  check(agents.includes(name), `AGENTS.md does not require review of ${name}`);
}
check(agents.includes("ProductQuestion` is the canonical"), "AGENTS.md lacks canonical Question ownership.");
check(agents.includes("ProductQuestionWorkspace` is the canonical frontend boundary"), "AGENTS.md lacks frontend boundary.");

const workflowContracts = readFileSync(
  join(root, "product/workflow/contracts.ts"),
  "utf8",
);
const questionContracts = readFileSync(
  join(root, "product/questions/contracts.ts"),
  "utf8",
);
check(workflowContracts.includes("PRODUCT_CONTRACT_VERSION"), "Architecture references an absent Product Workflow version.");
check(questionContracts.includes("PRODUCT_QUESTION_SCHEMA_VERSION"), "Architecture references an absent Product Question version.");

console.log(JSON.stringify({
  validation: "product-governance",
  result: "PASS",
  checks,
  governanceDocuments: documents,
  registeredGapCount: gapIds.length,
  resolvedGapCount: resolvedGapIds.length,
  roadmapGapReferenceCount: roadmapGapIds.length,
  decisionCount: decisionIds.length,
  duplicateGapIds: 0,
  productBehaviorChanged: false,
  runtimeBehaviorChanged: false,
  frontendBehaviorChanged: false,
  cognitionBehaviorChanged: false,
}, null, 2));
