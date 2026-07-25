import type { RegisteredInput } from "./types";

export function identifyAlternativesAndConfounders(input: RegisteredInput) {
  const alternatives = input.rawEvidence.flatMap((evidence) => {
    const match = evidence.text.match(/^A plausible alternative is that (.+?)\.$/i);
    return match ? [{
      explanation: match[1],
      supportingArtifactIds: input.artifacts.filter((a) => a.evidenceIds.includes(evidence.id)).map((a) => a.id),
      supportingEvidenceIds: [evidence.id],
      contradictingArtifactIds: [],
      relativeSupport: 0.25,
      discriminatingEvidenceNeeded: [`A contrast or intervention that separates "${match[1]}" from the leading topology`],
    }] : [];
  });
  const confounderFlags = input.rawEvidence.filter((evidence) =>
    /third factor|selection bias|common cause|reverse|may create the alleged upstream/i.test(evidence.text));
  return { alternatives, confounderFlags };
}
