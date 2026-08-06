import type { AgreementAnalysis, HumanStudyResponse } from "./contracts";
import { phase5Preregistration } from "./preregistration";

const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const grouped = (responses: HumanStudyResponse[]) => [...new Map(responses.map((item) => [item.packetId, responses.filter((candidate) => candidate.packetId === item.packetId)])).values()];
const adjacent = (left: string, right: string) => left === right || phase5Preregistration.adjacentPairs.some((pair) => pair.includes(left) && pair.includes(right));
const pairAgreement = <T>(rows: HumanStudyResponse[][], read: (response: HumanStudyResponse) => T | undefined) => {
  const eligible = rows.flatMap((row) => { const values = row.map(read).filter((value): value is T => value !== undefined); return values.length < 2 ? [] : [values.every((value) => value === values[0]) ? 1 : 0]; });
  return eligible.length ? mean(eligible) : null;
};

export function cohensKappa(pairs: Array<[string, string]>): number | null {
  if (!pairs.length) return null;
  const labels = [...new Set(pairs.flat())]; const observed = pairs.filter(([a, b]) => a === b).length / pairs.length;
  const expected = labels.reduce((sum, label) => sum + (pairs.filter(([a]) => a === label).length / pairs.length) * (pairs.filter(([, b]) => b === label).length / pairs.length), 0);
  return expected === 1 ? (observed === 1 ? 1 : 0) : (observed - expected) / (1 - expected);
}
export function fleissKappa(rows: string[][]): number | null {
  const complete = rows.filter((row) => row.length >= 2); if (complete.length < 2) return null;
  const labels = [...new Set(complete.flat())]; const n = complete[0].length; if (complete.some((row) => row.length !== n)) return null;
  const observed = mean(complete.map((row) => labels.reduce((sum, label) => { const count = row.filter((value) => value === label).length; return sum + count * (count - 1); }, 0) / (n * (n - 1))));
  const proportions = labels.map((label) => complete.flat().filter((value) => value === label).length / complete.flat().length); const expected = proportions.reduce((sum, value) => sum + value * value, 0);
  return expected === 1 ? (observed === 1 ? 1 : 0) : (observed - expected) / (1 - expected);
}
export function krippendorffAlphaNominal(rows: Array<Array<string | null>>): number | null {
  const pairs = rows.flatMap((row) => row.filter((value): value is string => value !== null).flatMap((left, index, values) => values.slice(index + 1).map((right) => [left, right] as [string, string]))); if (!pairs.length) return null;
  const disagreement = pairs.filter(([a, b]) => a !== b).length / pairs.length; const values = pairs.flat(); const labels = [...new Set(values)]; const expected = 1 - labels.reduce((sum, label) => { const p = values.filter((value) => value === label).length / values.length; return sum + p * p; }, 0);
  return expected === 0 ? (disagreement === 0 ? 1 : 0) : 1 - disagreement / expected;
}
export function analyzeHumanAgreement(responses: HumanStudyResponse[]): AgreementAnalysis {
  const rows = grouped(responses); const completePairs = rows.filter((row) => row.length === 2).map((row) => [row[0].classification, row[1].classification] as [string, string]); const classes = [...new Set(responses.map((item) => item.classification))].sort();
  const exact = pairAgreement(rows, (item) => item.classification); const adjacentValues = rows.flatMap((row) => row.length < 2 ? [] : [row.every((item) => adjacent(item.classification, row[0].classification)) ? 1 : 0]);
  const confusion: Record<string, Record<string, number>> = Object.fromEntries(classes.map((left) => [left, Object.fromEntries(classes.map((right) => [right, 0]))])); for (const [left, right] of completePairs) confusion[left][right] += 1;
  const meaningPairs = rows.flatMap((row) => row.length < 2 ? [] : [Math.abs(row[0].meaningAgreement - row[1].meaningAgreement)]); const allMeaning = responses.map((item) => item.meaningAgreement); const grand = mean(allMeaning); const between = mean(rows.map((row) => Math.pow(mean(row.map((item) => item.meaningAgreement)) - grand, 2))); const within = mean(rows.flatMap((row) => row.map((item) => Math.pow(item.meaningAgreement - mean(row.map((candidate) => candidate.meaningAgreement)), 2))));
  return { itemCount: rows.length, reviewerCount: new Set(responses.map((item) => item.reviewer.blindedReviewerId)).size, exactAgreement: exact, adjacentAgreement: adjacentValues.length ? mean(adjacentValues) : null, cohensKappa: cohensKappa(completePairs), fleissKappa: fleissKappa(rows.map((row) => row.map((item) => item.classification))), krippendorffsAlphaNominal: krippendorffAlphaNominal(rows.map((row) => row.map((item) => item.classification))), classSpecificAgreement: Object.fromEntries(classes.map((classification) => { const relevant = rows.filter((row) => row.some((item) => item.classification === classification)); return [classification, relevant.length ? relevant.filter((row) => row.every((item) => item.classification === classification)).length / relevant.length : null]; })), confusionMatrix: confusion, polarityAgreement: pairAgreement(rows, (item) => item.polarityAgreement), modalityAgreement: pairAgreement(rows, (item) => item.modalityAgreement), temporalAgreement: pairAgreement(rows, (item) => item.temporalAgreement), causalAgreement: pairAgreement(rows, (item) => item.causalAgreement), endpointFidelityAgreement: pairAgreement(rows, (item) => item.endpointFidelity), escalationAgreement: pairAgreement(rows, (item) => item.escalationRequired), meaningAgreementMeanAbsoluteDifference: meaningPairs.length ? mean(meaningPairs) : null, intraclassCorrelation: between + within === 0 ? 1 : (between - within) / (between + within), ...(classes.length === 1 ? { prevalenceWarning: "One-class prevalence makes chance-corrected metrics unstable." } : {}) };
}
