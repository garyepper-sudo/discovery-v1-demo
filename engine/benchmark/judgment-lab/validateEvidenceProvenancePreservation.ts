import assert from "node:assert/strict";

import { buildEvidence } from "../../v3/evidence";

const checks: string[] = [];
function check(name: string, assertion: () => void): void {
  assertion();
  checks.push(name);
}

const legacyContext = [
  "Atlas approved the operating plan.",
  "Delivery improved 12%.",
  "Could execution slow?",
].join("\n");

const expectedLegacyEvidence = [
  {
    id: "E1",
    text: "Atlas approved the operating plan.",
    type: "decision",
    confidence: 0.72,
    confidenceBand: "medium",
    polarity: "neutral",
    strength: "moderate",
    keywords: ["atlas", "approved", "operating"],
    entities: ["Atlas"],
    source: "user",
    relatedEvidenceIds: [],
    inferredFrom: [],
  },
  {
    id: "E2",
    text: "Delivery improved 12%.",
    type: "metric",
    confidence: 0.84,
    confidenceBand: "high",
    polarity: "positive",
    strength: "strong",
    keywords: ["delivery", "improved"],
    entities: ["Delivery"],
    source: "user",
    relatedEvidenceIds: [],
    inferredFrom: [],
  },
  {
    id: "E3",
    text: "Could execution slow?",
    type: "question",
    confidence: 0.54,
    confidenceBand: "low",
    polarity: "negative",
    strength: "weak",
    keywords: ["execution"],
    entities: ["Could"],
    source: "user",
    relatedEvidenceIds: [],
    inferredFrom: [],
  },
];

check("legacy evidence output is byte-equivalent to the pre-sprint snapshot", () => {
  assert.deepEqual(buildEvidence(legacyContext), expectedLegacyEvidence);
});

check("omitting structured provenance preserves legacy output", () => {
  assert.deepEqual(buildEvidence(legacyContext, []), buildEvidence(legacyContext));
});

const shared = buildEvidence("", [{
  sourceId: "document:decision-review",
  sourceType: "operating-review",
  observedAt: "2026-06-04T12:00:00.000Z",
  reliability: 0.9,
  content: "Approval waiting is measurable.\nDecision quality is unchanged.",
}]);

check("one source can produce distinct evidence records with shared source identity", () => {
  assert.deepEqual(shared.map((item) => item.id), ["E1", "E2"]);
  assert.deepEqual(
    shared.map((item) => item.sourceId),
    ["document:decision-review", "document:decision-review"],
  );
});

check("structured source type is preserved", () => {
  assert.deepEqual(
    shared.map((item) => item.sourceType),
    ["operating-review", "operating-review"],
  );
});

check("structured observed time is preserved exactly", () => {
  assert.deepEqual(
    shared.map((item) => item.observedAt),
    ["2026-06-04T12:00:00.000Z", "2026-06-04T12:00:00.000Z"],
  );
});

check("structured reliability is preserved exactly without changing confidence", () => {
  assert.deepEqual(shared.map((item) => item.reliability), [0.9, 0.9]);
  assert.deepEqual(
    shared.map((item) => item.confidence),
    buildEvidence(
      "Approval waiting is measurable.\nDecision quality is unchanged.",
    ).map((item) => item.confidence),
  );
});

const independent = buildEvidence("", [
  {
    sourceId: "artifact:A04",
    sourceType: "operating-review",
    content: "Decision-cycle evidence.",
  },
  {
    sourceId: "artifact:A11",
    sourceType: "decision-log",
    content: "Decision-log evidence.",
  },
]);

check("independent A04 and A11-style sources remain distinct", () => {
  assert.deepEqual(
    independent.map((item) => item.sourceId),
    ["artifact:A04", "artifact:A11"],
  );
});

const exactCopies = buildEvidence("", [
  {
    sourceId: "artifact:A04",
    sourceType: "operating-review",
    content: "Exact copied statement.",
  },
  {
    sourceId: "artifact:A04",
    sourceType: "operating-review",
    content: "Exact copied statement.",
  },
]);

check("exact copies can share source identity while retaining record identity", () => {
  assert.deepEqual(exactCopies.map((item) => item.id), ["E1", "E2"]);
  assert.deepEqual(
    exactCopies.map((item) => item.sourceId),
    ["artifact:A04", "artifact:A04"],
  );
});

check("invalid optional provenance is omitted deterministically", () => {
  const first = buildEvidence("", [{
    sourceId: "artifact:invalid-optional",
    sourceType: "other",
    observedAt: "not-a-date",
    reliability: 2,
    content: "Valid evidence content.",
  }]);
  const second = buildEvidence("", [{
    sourceId: "artifact:invalid-optional",
    sourceType: "other",
    observedAt: "not-a-date",
    reliability: 2,
    content: "Valid evidence content.",
  }]);
  assert.deepEqual(first, second);
  assert.equal(first[0]?.observedAt, undefined);
  assert.equal(first[0]?.reliability, undefined);
});

check("a structured source without valid source identity is ignored", () => {
  assert.deepEqual(buildEvidence("", [{
    sourceId: " ",
    content: "This record must not enter evidence without source identity.",
  }]), []);
});

check("structured input ordering is caller-order preserving and deterministic", () => {
  const sources = [
    { sourceId: "source:first", content: "First source." },
    { sourceId: "source:second", content: "Second source." },
  ];
  const first = buildEvidence("", sources);
  const repeated = buildEvidence("", sources);
  const reversed = buildEvidence("", [...sources].reverse());

  assert.deepEqual(first, repeated);
  assert.deepEqual(first.map((item) => item.text), [
    "First source.",
    "Second source.",
  ]);
  assert.deepEqual(reversed.map((item) => item.text), [
    "Second source.",
    "First source.",
  ]);
  assert.deepEqual(reversed.map((item) => item.sourceId), [
    "source:second",
    "source:first",
  ]);
});

console.log("EVIDENCE PROVENANCE PRESERVATION");
for (const name of checks) console.log(`PASS  ${name}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
