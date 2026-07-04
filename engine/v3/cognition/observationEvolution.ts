export type EvolutionStatus =
  | "new"
  | "active"
  | "reinforced"
  | "stable"
  | "weakening"
  | "retired";

export type EvolvedObservation = {
  id: string;
  statement: string;
  normalizedStatement: string;
  supportCount: number;
  confidence: number;
  status: EvolutionStatus;
  firstSeenAt: string;
  lastSeenAt: string;
  evidenceIds: string[];
  history: {
    date: string;
    event: "created" | "reinforced";
    statement: string;
    confidence: number;
  }[];
};

type ObservationInput = {
  id?: string;
  statement?: string;
  text?: string;
  summary?: string;
  confidence?: number;
  evidenceId?: string;
};

type ObservationEvolutionResult = {
  observations: EvolvedObservation[];
  changes: {
    created: EvolvedObservation[];
    reinforced: EvolvedObservation[];
  };
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): Set<string> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "as",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "that",
    "this",
    "it",
    "from",
    "at",
  ]);

  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
}

function similarity(a: string, b: string): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);

  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let overlap = 0;

  aTokens.forEach((token) => {
    if (bTokens.has(token)) overlap += 1;
  });

  const union = new Set([...aTokens, ...bTokens]).size;

  return overlap / union;
}

function getObservationStatement(observation: ObservationInput): string {
  return (
    observation.statement ||
    observation.text ||
    observation.summary ||
    "Unspecified observation"
  );
}

function createObservation(
  observation: ObservationInput,
  now: string,
  fallbackEvidenceId: string
): EvolvedObservation {
  const statement = getObservationStatement(observation);
  const confidence = observation.confidence ?? 0.65;
  const evidenceId = observation.evidenceId || fallbackEvidenceId;

  return {
    id: observation.id || `obs_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    statement,
    normalizedStatement: normalizeText(statement),
    supportCount: 1,
    confidence,
    status: "new",
    firstSeenAt: now,
    lastSeenAt: now,
    evidenceIds: evidenceId ? [evidenceId] : [],
    history: [
      {
        date: now,
        event: "created",
        statement,
        confidence,
      },
    ],
  };
}

function reinforceObservation(
  existing: EvolvedObservation,
  incoming: ObservationInput,
  now: string,
  fallbackEvidenceId: string
): EvolvedObservation {
  const statement = getObservationStatement(incoming);
  const incomingConfidence = incoming.confidence ?? existing.confidence;
  const evidenceId = incoming.evidenceId || fallbackEvidenceId;

  const supportCount = existing.supportCount + 1;
  const confidence = Math.min(
    0.98,
    Number(((existing.confidence * existing.supportCount + incomingConfidence) / supportCount).toFixed(2))
  );

  let status: EvolutionStatus = "reinforced";

  if (supportCount >= 4 && confidence >= 0.8) {
    status = "stable";
  } else if (supportCount >= 2) {
    status = "reinforced";
  }

  return {
    ...existing,
    supportCount,
    confidence,
    status,
    lastSeenAt: now,
    evidenceIds: evidenceId
      ? Array.from(new Set([...existing.evidenceIds, evidenceId]))
      : existing.evidenceIds,
    history: [
      ...existing.history,
      {
        date: now,
        event: "reinforced",
        statement,
        confidence: incomingConfidence,
      },
    ],
  };
}

export function evolveObservations(params: {
  existingObservations?: EvolvedObservation[];
  newObservations?: ObservationInput[];
  eventId?: string;
  now?: string;
  similarityThreshold?: number;
}): ObservationEvolutionResult {
  const {
    existingObservations = [],
    newObservations = [],
    eventId = "unknown_event",
    now = new Date().toISOString(),
    similarityThreshold = 0.42,
  } = params;

  const evolved = [...existingObservations];
  const created: EvolvedObservation[] = [];
  const reinforced: EvolvedObservation[] = [];

  newObservations.forEach((incoming) => {
    const incomingStatement = getObservationStatement(incoming);

    let bestMatchIndex = -1;
    let bestScore = 0;

    evolved.forEach((existing, index) => {
      const score = similarity(existing.statement, incomingStatement);

      if (score > bestScore) {
        bestScore = score;
        bestMatchIndex = index;
      }
    });

    if (bestMatchIndex >= 0 && bestScore >= similarityThreshold) {
      const updated = reinforceObservation(
        evolved[bestMatchIndex],
        incoming,
        now,
        eventId
      );

      evolved[bestMatchIndex] = updated;
      reinforced.push(updated);
      return;
    }

    const fresh = createObservation(incoming, now, eventId);
    evolved.push(fresh);
    created.push(fresh);
  });

  return {
    observations: evolved,
    changes: {
      created,
      reinforced,
    },
  };
}