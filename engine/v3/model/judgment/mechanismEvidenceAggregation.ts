import type { MechanismSignal } from "./mechanismSignals";
import {
  countMatches,
  extractSharedTerms,
  unique,
} from "./mechanismUtils";

export type MechanismVocabulary = {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
};

export type MechanismTermSet = {
  behaviors: string[];
  capabilities: string[];
  consequences: string[];
};

export type MechanismEvidenceAggregate = {
  relatedSignals: MechanismSignal[];
  sourceTexts: string[];
  sharedTerms: MechanismTermSet;
};

export function aggregateMechanismEvidence(params: {
  signal: MechanismSignal;
  signals: MechanismSignal[];
  vocabulary: MechanismVocabulary;
  fallbackTerms: MechanismTermSet;
}): MechanismEvidenceAggregate {
  const { signal, signals, vocabulary, fallbackTerms } = params;

  const relatedSignals = signals.filter((other) => {
    if (other.id === signal.id) return true;

    const sharedBehaviorCount = extractSharedTerms(
      [signal.text, other.text],
      vocabulary.behaviors,
    ).length;

    const sharedCapabilityCount = extractSharedTerms(
      [signal.text, other.text],
      vocabulary.capabilities,
    ).length;

    const sharedConsequenceCount = extractSharedTerms(
      [signal.text, other.text],
      vocabulary.consequences,
    ).length;

    const fallbackOverlap =
      countMatches(other.text, fallbackTerms.behaviors) +
      countMatches(other.text, fallbackTerms.capabilities) +
      countMatches(other.text, fallbackTerms.consequences);

    return (
      sharedBehaviorCount +
        sharedCapabilityCount +
        sharedConsequenceCount +
        fallbackOverlap >
      0
    );
  });

  const sourceTexts = unique(relatedSignals.map((item) => item.text));

  const sharedTerms = {
    behaviors: extractSharedTerms(sourceTexts, vocabulary.behaviors),
    capabilities: extractSharedTerms(sourceTexts, vocabulary.capabilities),
    consequences: extractSharedTerms(sourceTexts, vocabulary.consequences),
  };

  return {
    relatedSignals,
    sourceTexts,
    sharedTerms,
  };
}