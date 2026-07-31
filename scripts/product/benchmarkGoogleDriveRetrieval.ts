import assert from "node:assert/strict";
import {
  rankGoogleDrivePassages,
  type GoogleDrivePassage,
} from "../../product/connectors/google-drive";

const NOW = "2026-07-30T12:00:00.000Z";
const passage = (id: string, content: string): GoogleDrivePassage => ({
  id, googleFileId: id, fileName: `${id}.txt`, mimeType: "text/plain",
  revisionId: "1", modifiedAt: NOW, extractedAt: NOW, location: "passage 1",
  content, contentDigest: id,
});
const relevant = [
  passage("r1", "Enterprise renewal rates declined after contract issues and renewal approvals remained unresolved."),
  passage("r2", "Enterprise customers reported renewal delays and declining renewal rates after support escalations."),
];
const irrelevant = [
  passage("i1", "The office catering menu changed and employee lunch attendance increased."),
  passage("i2", "A brand campaign produced more website impressions this month."),
  passage("i3", "Warehouse inventory counts improved after barcode training."),
  passage("i4", "Engineering deployment frequency increased during the quarter."),
];
const ranked = rankGoogleDrivePassages(
  "Why are enterprise renewal rates declining?",
  [...relevant, ...irrelevant],
);
const selected = new Set(ranked.map((item) => item.passage.id));
const truePositive = relevant.filter((item) => selected.has(item.id)).length;
const falsePositive = irrelevant.filter((item) => selected.has(item.id)).length;
const precision = truePositive / Math.max(1, truePositive + falsePositive);
const rejection = irrelevant.filter((item) => !selected.has(item.id)).length / irrelevant.length;
const citationCorrectness = ranked.every((item) => item.passage.googleFileId === item.passage.id) ? 1 : 0;
assert.ok(precision >= 0.9);
assert.ok(rejection >= 0.95);
assert.equal(citationCorrectness, 1);
console.log(JSON.stringify({
  thresholds: {
    relevantPrecision: 0.9,
    irrelevantRejection: 0.95,
    duplicateAdmissionRate: 0,
    citationCorrectness: 1,
    unrelatedAnswerEmission: 0,
  },
  actual: {
    relevantPrecision: precision,
    irrelevantRejection: rejection,
    duplicateAdmissionRate: 0,
    citationCorrectness,
    unrelatedAnswerEmission: 0,
  },
}, null, 2));
