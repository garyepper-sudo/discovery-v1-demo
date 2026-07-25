import type { ConfigurationResult, FamilyId } from "./types";

function mechanismText(result: ConfigurationResult) {
  const mechanism = result.cognition.mechanisms.find(
    (item) => item.crossSilo && !item.explicitInSingleSource,
  );
  return mechanism
    ? `${mechanism.cause} ${mechanism.mechanism} ${mechanism.effect}`
    : "Discovery can support only local observations; no complete cross-silo mechanism was generated.";
}

export function verbalizeBoundaryTransitions(results: ConfigurationResult[]) {
  const families = [...new Set(results.map((item) => item.configuration.familyId))];
  return Object.fromEntries(
    families.map((familyId: FamilyId) => {
      const reveal = results
        .filter(
          (item) =>
            item.configuration.familyId === familyId &&
            item.configuration.kind === "reveal",
        )
        .sort((a, b) => a.configuration.stage - b.configuration.stage);
      const first = reveal.find((item) => item.score.emerged);
      const after = first ?? reveal.at(-1)!;
      const before =
        reveal.find(
          (item) =>
            item.configuration.stage ===
            Math.max(0, after.configuration.stage - 1),
        ) ?? reveal[0];
      const mechanism = after.cognition.mechanisms.find(
        (item) => item.crossSilo && !item.explicitInSingleSource,
      );
      return [
        familyId,
        {
          beforeBoundary: {
            whatDiscoveryCanSupport: mechanismText(before),
            whatDiscoveryCannotYetSupport:
              "The generated cognition does not yet connect every upstream observation to a discriminating downstream outcome.",
            missingEvidence:
              "Seek evidence that directly connects the current local effect to the next downstream organizational outcome.",
          },
          afterBoundary: {
            whatDiscoveryNowSees: mechanismText(after),
            whatChanged: first
              ? "A newly available raw Evidence relationship coincided with the first complete production result."
              : "No tested configuration crossed all operational emergence criteria.",
            whyTheInsightIsNew: mechanism
              ? `${mechanism.silos.join(", ")} contribute separate Evidence to the generated relationship.`
              : "Production did not generate a supported non-local insight.",
            whatItPredicts: mechanism?.effect ?? "No grounded prediction.",
            whatToDoNext:
              "Test the smallest missing relationship before committing to an intervention.",
            whatWouldWeakenTheConclusion: mechanism
              ? `The proposed effect does not follow ${mechanism.cause}.`
              : "Additional evidence continues to leave the causal alternatives unresolved.",
          },
        },
      ];
    }),
  );
}
