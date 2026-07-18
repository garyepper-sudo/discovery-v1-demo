import {
  V3Evidence,
  V3Signal,
} from "./types";

type SignalRule = {
  title: string;
  description: string;
  keywords: string[];
  polarity: V3Signal["polarity"];
};

type AssertionPattern = {
  title: string;
  description: string;
  phrases: string[];
  polarity: V3Signal["polarity"];
};

const MAX_SIGNALS = 12;

/**
 * Canonical organizational operating-signal rules.
 *
 * These rules identify recurring organizational pressures rather than
 * startup-market themes. More specific causal and conditional conclusions
 * are preserved separately through assertion signal detection.
 */
const signalRules: SignalRule[] = [
  {
    title:
      "Execution capacity is under pressure",
    description:
      "Evidence suggests organizational demand, workload, interruption, or active work may exceed available execution capacity.",
    keywords: [
      "execution capacity",
      "capacity constraint",
      "resource constraint",
      "workload",
      "work in progress",
      "concurrent work",
      "too many projects",
      "priority overload",
      "priority conflict",
      "reprioritization",
      "interruption",
      "throughput",
      "delivery delay",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Decision flow is constrained",
    description:
      "Evidence suggests decision rights, approval paths, governance, or escalation patterns may be slowing execution.",
    keywords: [
      "decision rights",
      "decision authority",
      "approval dependency",
      "approval bottleneck",
      "decision latency",
      "governance friction",
      "centralized authority",
      "leadership dependency",
      "escalation",
      "unclear ownership",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Coordination friction is present",
    description:
      "Evidence suggests cross-functional handoffs, ownership boundaries, or operating interfaces are constraining coordinated execution.",
    keywords: [
      "coordination breakdown",
      "coordination friction",
      "cross-functional",
      "handoff",
      "ownership boundary",
      "operating interface",
      "silo",
      "misalignment",
      "manual coordination",
      "unclear ownership",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Strategic priorities are competing",
    description:
      "Evidence suggests teams may be operating from conflicting priorities or inconsistent interpretations of what matters most.",
    keywords: [
      "priority conflict",
      "competing priorities",
      "priority change",
      "strategic alignment",
      "strategic drift",
      "conflicting priorities",
      "reprioritization",
      "tradeoff",
      "focus fragmentation",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Knowledge continuity is constrained",
    description:
      "Evidence suggests important operating knowledge may remain fragmented, localized, or difficult to reuse.",
    keywords: [
      "knowledge continuity",
      "knowledge fragmentation",
      "institutional knowledge",
      "context loss",
      "documentation",
      "knowledge transfer",
      "integration fragmentation",
      "continuity failure",
      "personnel dependency",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Organizational learning is constrained",
    description:
      "Evidence suggests recurring organizational problems are not consistently becoming reusable operating improvements.",
    keywords: [
      "learning system",
      "organizational learning",
      "recurring issue",
      "repeated problem",
      "feedback failure",
      "lessons learned",
      "same problem",
      "process improvement",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Customer consequences are emerging",
    description:
      "Evidence suggests internal operating constraints may be producing customer, delivery, or strategic-account consequences.",
    keywords: [
      "customer escalation",
      "customer friction",
      "strategic account risk",
      "delivery failure",
      "delivery performance",
      "customer complaint",
      "customer dissatisfaction",
      "expedite",
      "defect escape",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Operating performance is improving",
    description:
      "Evidence suggests an organizational constraint may be weakening or operating performance may be improving.",
    keywords: [
      "improved",
      "improving",
      "reduced delay",
      "reduced escalation",
      "increased throughput",
      "higher throughput",
      "fewer interruptions",
      "pilot results",
      "performance improvement",
    ],
    polarity:
      "positive",
  },
];

/**
 * High-value assertions should survive even when they appear in only one
 * evidence artifact. These patterns preserve causal, conditional, and
 * rejected-default conclusions that would otherwise be lost before
 * downstream cognition can evaluate them.
 */
const assertionPatterns: AssertionPattern[] = [
  {
    title:
      "Concurrent work is reducing effective capacity",
    description:
      "Evidence indicates that excessive concurrent work, interruption, or reprioritization is reducing effective organizational capacity.",
    phrases: [
      "concurrent work",
      "work in progress",
      "too much work",
      "too many projects",
      "priority overload",
      "focus fragmentation",
      "reprioritization",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Existing staffing may be sufficient if work is better sequenced",
    description:
      "Evidence indicates that current staffing may support planned throughput if concurrent work, interruption, or priority volatility is reduced.",
    phrases: [
      "staffing is sufficient",
      "current staffing is sufficient",
      "existing staffing is sufficient",
      "headcount is sufficient",
      "without adding headcount",
      "without additional headcount",
      "avoid additional headcount",
    ],
    polarity:
      "neutral",
  },
  {
    title:
      "Staffing may not be the primary root cause",
    description:
      "Evidence indicates that apparent capacity pressure may be driven more by prioritization, governance, coordination, or concurrency than by insufficient staffing.",
    phrases: [
      "staffing is not",
      "not a staffing",
      "hiring is not",
      "headcount is not",
      "rather than staffing",
      "rather than headcount",
      "without adding headcount",
      "current staffing is sufficient",
    ],
    polarity:
      "neutral",
  },
  {
    title:
      "Reducing active work may improve throughput",
    description:
      "Evidence indicates that reducing, sequencing, or protecting active work may improve execution throughput.",
    phrases: [
      "if concurrent work is reduced",
      "reduce concurrent work",
      "reducing concurrent work",
      "sequence work",
      "sequencing work",
      "protect highest-leverage work",
      "protect the highest-leverage work",
      "reduce active work",
    ],
    polarity:
      "positive",
  },
  {
    title:
      "Decision authority is constraining execution",
    description:
      "Evidence indicates that unclear or centralized decision authority is creating approval dependency or execution delay.",
    phrases: [
      "decision rights",
      "decision authority",
      "approval dependency",
      "approval bottleneck",
      "centralized authority",
      "unclear governance",
      "decision latency",
    ],
    polarity:
      "negative",
  },
  {
    title:
      "Operating constraints are producing downstream customer risk",
    description:
      "Evidence indicates that internal operating constraints are propagating into customer escalation, delivery failure, or strategic-account risk.",
    phrases: [
      "customer escalation",
      "customer friction",
      "strategic account risk",
      "delivery failure",
      "downstream",
      "propagate",
      "caused by",
      "reinforced by",
    ],
    polarity:
      "negative",
  },
];

const GENERIC_KEYWORDS =
  new Set(
    [
      "company",
      "website",
      "question",
      "evidence",
      "artifact",
      "batch",
      "owner",
      "date",
      "title",
      "report",
      "analysis",
      "update",
      "team",
      "leadership",
      "organization",
      "northstar",
      "industrial",
      "systems",
      "undefined",
    ],
  );

export function detectSignals(
  evidence: V3Evidence[],
): V3Signal[] {
  const ruleSignals =
    buildRuleSignals(
      evidence,
    );

  const assertionSignals =
    buildAssertionSignals(
      evidence,
      ruleSignals.length,
    );

  const emergentSignals =
    buildEmergentSignals(
      evidence,
      ruleSignals.length +
        assertionSignals.length,
    );

  return deduplicateSignals(
    [
      ...assertionSignals,
      ...ruleSignals,
      ...emergentSignals,
    ],
  )
    .sort(
      (
        left,
        right,
      ) =>
        right.confidence -
        left.confidence,
    )
    .slice(
      0,
      MAX_SIGNALS,
    )
    .map(
      (
        signal,
        index,
      ) => ({
        ...signal,
        id:
          `S${index + 1}`,
      }),
    );
}

function buildRuleSignals(
  evidence: V3Evidence[],
): V3Signal[] {
  return signalRules
    .map(
      (
        rule,
      ) => {
        const matchedEvidence =
          evidence.filter(
            (
              item,
            ) =>
              matchesRule(
                item,
                rule,
              ),
          );

        if (
          matchedEvidence.length ===
          0
        ) {
          return null;
        }

        return {
          id:
            "temporary-rule-signal",

          title:
            rule.title,

          description:
            buildSignalDescription(
              rule,
              matchedEvidence,
            ),

          evidenceIds:
            uniqueEvidenceIds(
              matchedEvidence,
            ),

          confidence:
            calculateSignalConfidence(
              matchedEvidence,
            ),

          polarity:
            rule.polarity,
        } satisfies V3Signal;
      },
    )
    .filter(
      (
        signal,
      ): signal is V3Signal =>
        signal !== null,
    );
}

function buildAssertionSignals(
  evidence: V3Evidence[],
  startingIndex: number,
): V3Signal[] {
  return assertionPatterns
    .map(
      (
        pattern,
        index,
      ) => {
        const matchedEvidence =
          evidence.filter(
            (
              item,
            ) =>
              containsAnyPhrase(
                searchableText(
                  item,
                ),
                pattern.phrases,
              ),
          );

        if (
          matchedEvidence.length ===
          0
        ) {
          return null;
        }

        const strongest =
          chooseStrongestEvidence(
            matchedEvidence,
          );

        return {
          id:
            `S${startingIndex + index + 1}`,

          title:
            pattern.title,

          description:
            strongest
              ? `${pattern.description} Strongest evidence: ${extractRelevantExcerpt(
                  strongest.text,
                  pattern.phrases,
                )}`
              : pattern.description,

          evidenceIds:
            uniqueEvidenceIds(
              matchedEvidence,
            ),

          confidence:
            calculateAssertionConfidence(
              matchedEvidence,
              pattern.phrases,
            ),

          polarity:
            pattern.polarity,
        } satisfies V3Signal;
      },
    )
    .filter(
      (
        signal,
      ): signal is V3Signal =>
        signal !== null,
    );
}

function matchesRule(
  evidence: V3Evidence,
  rule: SignalRule,
): boolean {
  return containsAnyPhrase(
    searchableText(
      evidence,
    ),
    rule.keywords,
  );
}

function searchableText(
  evidence: V3Evidence,
): string {
  return normalizeText(
    [
      evidence.text,
      ...(evidence.keywords ??
        []),
      ...(evidence.entities ??
        []),
    ].join(
      " ",
    ),
  );
}

function containsAnyPhrase(
  normalizedText: string,
  phrases: string[],
): boolean {
  return phrases.some(
    (
      phrase,
    ) =>
      normalizedText.includes(
        normalizeText(
          phrase,
        ),
      ),
  );
}

function buildSignalDescription(
  rule: SignalRule,
  evidence: V3Evidence[],
): string {
  const count =
    evidence.length;

  const strongest =
    chooseStrongestEvidence(
      evidence,
    );

  return [
    rule.description,
    `This signal appears in ${count} evidence object${
      count === 1
        ? ""
        : "s"
    }.`,
    strongest
      ? `Strongest evidence: ${extractRelevantExcerpt(
          strongest.text,
          rule.keywords,
        )}`
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      " ",
    );
}

function calculateSignalConfidence(
  evidence: V3Evidence[],
): number {
  if (
    evidence.length ===
    0
  ) {
    return 0.45;
  }

  const averageConfidence =
    evidence.reduce(
      (
        sum,
        item,
      ) =>
        sum +
        item.confidence,
      0,
    ) /
    evidence.length;

  const supportBonus =
    Math.min(
      0.18,
      evidence.length *
        0.045,
    );

  const strengthBonus =
    evidence.some(
      (
        item,
      ) =>
        item.strength ===
        "strong",
    )
      ? 0.08
      : 0;

  return clamp(
    averageConfidence *
      0.7 +
      supportBonus +
      strengthBonus,
  );
}

function calculateAssertionConfidence(
  evidence: V3Evidence[],
  phrases: string[],
): number {
  const baseConfidence =
    calculateSignalConfidence(
      evidence,
    );

  const matchedPhraseCount =
    phrases.filter(
      (
        phrase,
      ) =>
        evidence.some(
          (
            item,
          ) =>
            searchableText(
              item,
            ).includes(
              normalizeText(
                phrase,
              ),
            ),
        ),
    ).length;

  const specificityBonus =
    Math.min(
      0.12,
      matchedPhraseCount *
        0.03,
    );

  return clamp(
    baseConfidence +
      specificityBonus,
  );
}

function chooseStrongestEvidence(
  evidence: V3Evidence[],
): V3Evidence | undefined {
  return [
    ...evidence,
  ].sort(
    (
      left,
      right,
    ) => {
      const strengthDelta =
        strengthRank(
          right.strength,
        ) -
        strengthRank(
          left.strength,
        );

      if (
        strengthDelta !==
        0
      ) {
        return strengthDelta;
      }

      return (
        right.confidence -
        left.confidence
      );
    },
  )[0];
}

function buildEmergentSignals(
  evidence: V3Evidence[],
  startingIndex: number,
): V3Signal[] {
  const keywordGroups =
    new Map<
      string,
      V3Evidence[]
    >();

  for (
    const item of
    evidence
  ) {
    for (
      const rawKeyword of
      item.keywords ??
      []
    ) {
      const keyword =
        normalizeText(
          rawKeyword,
        );

      if (
        !isUsefulEmergentKeyword(
          keyword,
        )
      ) {
        continue;
      }

      const current =
        keywordGroups.get(
          keyword,
        ) ??
        [];

      if (
        !current.some(
          (
            candidate,
          ) =>
            candidate.id ===
            item.id,
        )
      ) {
        current.push(
          item,
        );
      }

      keywordGroups.set(
        keyword,
        current,
      );
    }
  }

  return Array.from(
    keywordGroups.entries(),
  )
    .filter(
      (
        [
          ,
          items,
        ],
      ) =>
        items.length >=
        2,
    )
    .sort(
      (
        left,
        right,
      ) =>
        right[1].length -
        left[1].length,
    )
    .slice(
      0,
      3,
    )
    .map(
      (
        [
          keyword,
          items,
        ],
        index,
      ) => ({
        id:
          `S${startingIndex + index + 1}`,

        title:
          `${capitalizeWords(
            keyword,
          )} signal is recurring`,

        description:
          `Discovery sees repeated references to ${keyword} across ${items.length} evidence objects, suggesting it may represent a persistent organizational pressure.`,

        evidenceIds:
          uniqueEvidenceIds(
            items,
          ),

        confidence:
          calculateSignalConfidence(
            items,
          ),

        polarity:
          normalizePolarity(
            items,
          ),
      }),
    );
}

function isUsefulEmergentKeyword(
  keyword: string,
): boolean {
  if (
    keyword.length <
    4
  ) {
    return false;
  }

  if (
    GENERIC_KEYWORDS.has(
      keyword,
    )
  ) {
    return false;
  }

  if (
    /^\d+$/.test(
      keyword,
    )
  ) {
    return false;
  }

  return true;
}

function extractRelevantExcerpt(
  text: string,
  phrases: string[],
): string {
  const lines =
    text
      .split(
        /\r?\n/,
      )
      .map(
        (
          line,
        ) =>
          line.trim(),
      )
      .filter(
        Boolean,
      );

  const matchingLine =
    lines.find(
      (
        line,
      ) =>
        containsAnyPhrase(
          normalizeText(
            line,
          ),
          phrases,
        ),
    ) ??
    lines[0] ??
    text;

  if (
    matchingLine.length <=
    320
  ) {
    return matchingLine;
  }

  return `${matchingLine.slice(
    0,
    317,
  )}...`;
}

function deduplicateSignals(
  signals: V3Signal[],
): V3Signal[] {
  const deduplicated =
    new Map<
      string,
      V3Signal
    >();

  for (
    const signal of
    signals
  ) {
    const key =
      normalizeText(
        signal.title,
      );

    const existing =
      deduplicated.get(
        key,
      );

    if (
      !existing
    ) {
      deduplicated.set(
        key,
        signal,
      );
      continue;
    }

    deduplicated.set(
      key,
      {
        ...existing,

        evidenceIds:
          Array.from(
            new Set(
              [
                ...existing.evidenceIds,
                ...signal.evidenceIds,
              ],
            ),
          ),

        confidence:
          Math.max(
            existing.confidence,
            signal.confidence,
          ),

        description:
          existing.description.length >=
          signal.description.length
            ? existing.description
            : signal.description,
      },
    );
  }

  return Array.from(
    deduplicated.values(),
  );
}

function uniqueEvidenceIds(
  evidence: V3Evidence[],
): string[] {
  return Array.from(
    new Set(
      evidence.map(
        (
          item,
        ) =>
          item.id,
      ),
    ),
  );
}

function normalizePolarity(
  evidence: V3Evidence[],
): V3Signal["polarity"] {
  const positive =
    evidence.filter(
      (
        item,
      ) =>
        item.polarity ===
        "positive",
    ).length;

  const negative =
    evidence.filter(
      (
        item,
      ) =>
        item.polarity ===
        "negative",
    ).length;

  if (
    positive >
    negative
  ) {
    return "positive";
  }

  if (
    negative >
    positive
  ) {
    return "negative";
  }

  return "neutral";
}

function strengthRank(
  strength?:
    | "weak"
    | "moderate"
    | "strong",
): number {
  if (
    strength ===
    "strong"
  ) {
    return 3;
  }

  if (
    strength ===
    "moderate"
  ) {
    return 2;
  }

  if (
    strength ===
    "weak"
  ) {
    return 1;
  }

  return 0;
}

function capitalizeWords(
  value: string,
): string {
  return value
    .split(
      " ",
    )
    .filter(
      Boolean,
    )
    .map(
      (
        word,
      ) =>
        word.charAt(
          0,
        ).toUpperCase() +
        word.slice(
          1,
        ),
    )
    .join(
      " ",
    );
}

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function clamp(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      Number(
        value.toFixed(
          2,
        ),
      ),
    ),
  );
}