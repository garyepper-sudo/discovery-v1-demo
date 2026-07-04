import type { V3Evidence, V3Observation, V3Signal, V3Theme } from "./types";

const METADATA_PREFIXES = [
  "company:",
  "website:",
  "industry:",
  "question:",
  "context:",
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function sentenceCase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
}

function cleanStatement(text: string): string {
  return text
    .replace(/^Company:\s*/i, "")
    .replace(/^Website:\s*/i, "")
    .replace(/^Industry:\s*/i, "")
    .replace(/^Question:\s*/i, "")
    .replace(/^Context:\s*/i, "")
    .trim();
}

function isMetadata(text: string): boolean {
  const normalized = normalize(text);
  return METADATA_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function isUsefulObservation(text: string): boolean {
  const cleaned = cleanStatement(text);
  const normalized = normalize(cleaned);

  if (!normalized) return false;
  if (isMetadata(text)) return false;
  if (normalized.length < 18) return false;

  return true;
}

function observationFromEvidence(item: V3Evidence): V3Observation {
  return {
    id: `observation-${item.id}`,
    statement: sentenceCase(cleanStatement(item.text)),
    evidenceIds: [item.id],
    confidence: item.confidence,
    keywords: item.keywords || [],
    entities: item.entities || [],
    source: "evidence",
  };
}

function observationFromSignal(signal: V3Signal): V3Observation {
  return {
    id: `observation-${signal.id}`,
    statement: sentenceCase(signal.description || signal.title),
    evidenceIds: signal.evidenceIds,
    confidence: signal.confidence,
    keywords: [],
    entities: [],
    source: "signal",
  };
}

function observationFromTheme(theme: V3Theme): V3Observation {
  return {
    id: `observation-${theme.id}`,
    statement: sentenceCase(theme.description || theme.title),
    evidenceIds: theme.evidenceIds,
    confidence: theme.confidence,
    keywords: theme.keywords || [],
    entities: theme.entities || [],
    source: "theme",
  };
}

function dedupeObservations(observations: V3Observation[]): V3Observation[] {
  const seen = new Map<string, V3Observation>();

  observations.forEach((observation) => {
    const key = normalize(observation.statement);

    if (!key || isMetadata(key)) return;

    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, observation);
      return;
    }

    seen.set(key, {
      ...existing,
      confidence: Math.max(existing.confidence, observation.confidence),
      evidenceIds: Array.from(
        new Set([...existing.evidenceIds, ...observation.evidenceIds])
      ),
      keywords: Array.from(
        new Set([...(existing.keywords || []), ...(observation.keywords || [])])
      ),
      entities: Array.from(
        new Set([...(existing.entities || []), ...(observation.entities || [])])
      ),
    });
  });

  return Array.from(seen.values());
}

export function buildObservations(params: {
  evidence: V3Evidence[];
  signals: V3Signal[];
  themes: V3Theme[];
}): V3Observation[] {
  const { evidence, signals, themes } = params;

  const evidenceObservations = evidence
    .filter((item) => isUsefulObservation(item.text))
    .map(observationFromEvidence);

  const signalObservations = signals
    .filter((signal) => isUsefulObservation(signal.description || signal.title))
    .map(observationFromSignal);

  const themeObservations = themes
    .filter((theme) => isUsefulObservation(theme.description || theme.title))
    .map(observationFromTheme);

  return dedupeObservations([
    ...themeObservations,
    ...signalObservations,
    ...evidenceObservations,
  ]);
}