import { canonicalHash } from "./canonicalSerialization";
import type { Phase2ImportedRubricJudgment } from "./phase2Contracts";

export const importedRubricRecordHash = (record: Omit<Phase2ImportedRubricJudgment, "recordHash"> | Phase2ImportedRubricJudgment) => {
  const { recordHash: _recordHash, ...content } = record as Phase2ImportedRubricJudgment;
  return canonicalHash(content);
};
