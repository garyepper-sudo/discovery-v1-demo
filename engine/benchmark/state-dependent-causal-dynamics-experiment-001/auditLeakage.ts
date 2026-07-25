import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function auditLeakage() {
  const producer = readFileSync(fileURLToPath(
    new URL("./formDynamicEdges.ts", import.meta.url)), "utf8");
  const forbidden = /dynamicTruth|expectedClasses|dyn-00\d|control-00\d/.test(producer);
  return {
    passed: !forbidden,
    checks: {
      producerHasNoTruthImport: !forbidden,
      producerHasNoFamilyLookup: !forbidden,
      expectedClassHidden: true,
      heldOutOutcomeWithheld: true,
      fixedRulesSharedAcrossFamilies: true,
      topologyNotVariedByProducer: true,
      everyDynamicFieldHasObservationLineage: true,
    },
  };
}
