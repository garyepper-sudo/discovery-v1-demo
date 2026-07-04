type EvolutionStatus =
  | "new"
  | "active"
  | "reinforced"
  | "stable"
  | "weakening"
  | "retired";

type EvolvedObservation = {
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
  [key: string]: any;
};

type ObservationInput = {
  id?: string;
  statement?: string;
  text?: string;
  summary?: string;
  claim?: string;
  confidence?: number;
  [key: string]: any;
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getStatement(observation: ObservationInput): string {
  return (
    observation.statement ||
    observation.text ||
    observation.summary ||
    observation.claim ||
    "Unspecified observation"
  );
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

function toEvolvedObservation(
  observation: ObservationInput,
  eventId: string,
  now: string
): EvolvedObservation {
  const statement = getStatement(observation);
  const confidence = observation.confidence ?? 0.65;

  return {
    ...observation,
    id:
      observation.id ||
      `obs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    statement,
    normalizedStatement: normalizeText(statement),
    supportCount: 1,
    confidence,
    status: "new",
    firstSeenAt: now,
    lastSeenAt: now,
    evidenceIds: [eventId],
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
  eventId: string,
  now: string
): EvolvedObservation {
  const statement = getStatement(incoming);
  const incomingConfidence = incoming.confidence ?? existing.confidence;
  const supportCount = (existing.supportCount || 1) + 1;

  const confidence = Math.min(
    0.98,
    Number(
      (
        ((existing.confidence || 0.65) * (existing.supportCount || 1) +
          incomingConfidence) /
        supportCount
      ).toFixed(2)
    )
  );

  const status: EvolutionStatus =
    supportCount >= 4 && confidence >= 0.8 ? "stable" : "reinforced";

  return {
    ...existing,
    supportCount,
    confidence,
    status,
    lastSeenAt: now,
    evidenceIds: Array.from(new Set([...(existing.evidenceIds || []), eventId])),
    history: [
      ...(existing.history || []),
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
  existingObservations: ObservationInput[];
  newObservations: ObservationInput[];
  eventId: string;
  now: string;
  similarityThreshold?: number;
}) {
  const {
    existingObservations,
    newObservations,
    eventId,
    now,
    similarityThreshold = 0.42,
  } = params;

  const observations: EvolvedObservation[] = existingObservations.map((obs) => {
    if ("supportCount" in obs && "history" in obs) {
      return obs as EvolvedObservation;
    }

    return toEvolvedObservation(obs, eventId, now);
  });

  const created: EvolvedObservation[] = [];
  const reinforced: EvolvedObservation[] = [];

  newObservations.forEach((incoming) => {
    const incomingStatement = getStatement(incoming);

    let bestMatchIndex = -1;
    let bestScore = 0;

    observations.forEach((existing, index) => {
      const score = similarity(existing.statement, incomingStatement);

      if (score > bestScore) {
        bestScore = score;
        bestMatchIndex = index;
      }
    });

    if (bestMatchIndex >= 0 && bestScore >= similarityThreshold) {
      const updated = reinforceObservation(
        observations[bestMatchIndex],
        incoming,
        eventId,
        now
      );

      observations[bestMatchIndex] = updated;
      reinforced.push(updated);
    } else {
      const fresh = toEvolvedObservation(incoming, eventId, now);
      observations.push(fresh);
      created.push(fresh);
    }
  });

  return {
    observations,
    changes: {
      created,
      reinforced,
    },
  };
}