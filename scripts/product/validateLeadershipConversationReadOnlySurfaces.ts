import { readFile } from "node:fs/promises";
import { productArtifactBodyDigest } from "../../product/persistence/productArtifactBodyContracts";

async function main() {
  const [source, experience] = await Promise.all([
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationReadOnlySurfaces.tsx", "utf8"),
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.tsx", "utf8"),
  ]);
  for (const forbidden of ["app/product-alpha", "ServerComposition", "ProductOperations", "actions\""]) {
    if (source.includes(forbidden)) throw new Error(`Read-only surface imports mutation owner: ${forbidden}`);
  }
  for (const symbol of ["LeadershipConversationReviewSurface", "LeadershipConversationClosureSurface", "LeadershipConversationWhatChangedSurface"]) {
    if (!source.includes(`export function ${symbol}`) || !experience.includes(`<${symbol}`)) {
      throw new Error(`Interactive Product composition does not reuse ${symbol}.`);
    }
  }
  for (const contract of ["mode:\"preview\"", "Synthetic Studio Preview", "candidateKind", "epistemicCategory", "supportCategory"]) {
    if (!source.includes(contract)) throw new Error(`Read-only surface is missing ${contract}.`);
  }
  if (!source.includes("onReview?:never") || !source.includes("onPrepareAgain?:never")) {
    throw new Error("Preview surfaces do not reject mutation callbacks at the type boundary.");
  }
  const canonicalInteractiveCopy = "Only the reviewed closure and current authorized evidence will shape the next preparation. Private Working and unreviewed meeting content do not carry forward.";
  const previewComparisonCopy = "Only supported before/after consequences are shown. A continuing statement is not treated as a change without an explicit comparison.";
  for (const exact of [
    'mode==="interactive"?"complete-heading":"preview-complete-heading"',
    'props.mode==="interactive"?"prepare-again-heading":"preview-prepare-again-heading"',
    canonicalInteractiveCopy,
    previewComparisonCopy,
    'aria-labelledby={headingId}',
    '<button type="button" disabled={props.pending} onClick={props.onPrepareAgain}>Prepare Again</button>',
  ]) if (!source.includes(exact)) throw new Error(`Interactive/preview parity contract is missing: ${exact}`);
  if (!experience.includes('<LeadershipConversationClosureSurface mode="interactive"') || !experience.includes('<LeadershipConversationWhatChangedSurface mode="interactive"')) {
    throw new Error("Live Product composition does not explicitly select canonical interactive mode.");
  }
  if (source.includes('interactive-complete-heading') || source.includes('interactive-prepare-again-heading')) {
    throw new Error("Canonical interactive accessibility IDs were renamed.");
  }
  console.log(JSON.stringify({ status: "PASS", surfaces: 3, mutationCallbacks: 0, interactiveParityChecks: 8, previewWritebacks: 0, sourceDigest: productArtifactBodyDigest(source) }));
}

void main();
