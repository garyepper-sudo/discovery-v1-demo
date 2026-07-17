import {
  loadOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
} from "./northstarCompanyFixture";

type DiagnosticTheme = {
  id: string;
  label: string;
  keywordGroups: string[][];
};

type LayerDefinition = {
  id: string;
  label: string;
  selectors: string[][];
};

type ThemeLayerResult = {
  themeId: string;
  themeLabel: string;
  layerId: string;
  layerLabel: string;
  present: boolean;
  matchedKeywords: string[];
  excerpts: string[];
};

type PrecisionGapReport = {
  organizationId: string;
  evaluatedAt: string;
  results: ThemeLayerResult[];
  firstPresenceByTheme: Record<string, string | null>;
  firstLossAfterPresenceByTheme: Record<string, string | null>;
};

const THEMES: DiagnosticTheme[] = [
  {
    id: "concurrent-work",
    label: "Excessive concurrent work",
    keywordGroups: [
      [
        "concurrent work",
        "too many projects",
        "too much work in progress",
        "work in progress",
        "wip",
      ],
      [
        "priority overload",
        "priority conflict",
        "competing priorities",
        "focus fragmentation",
      ],
      [
        "execution demand exceeds",
        "reduce concurrent",
        "reduce active work",
        "sequence work",
      ],
    ],
  },
  {
    id: "staffing-not-root-cause",
    label: "Staffing is not the root cause",
    keywordGroups: [
      [
        "staffing is not",
        "not a staffing",
        "headcount is not",
        "not a headcount",
        "hiring will not",
      ],
      [
        "without adding headcount",
        "avoid additional headcount",
        "do not hire",
        "avoid hiring",
      ],
      [
        "capacity constraint",
        "execution capacity",
        "resource constraint",
        "governance friction",
        "coordination breakdown",
        "decision latency",
      ],
    ],
  },
  {
    id: "staffing-positive",
    label: "Hiring or staffing recommendation",
    keywordGroups: [
      [
        "hire more",
        "increase headcount",
        "add engineers",
        "add staff",
        "recruit more",
      ],
    ],
  },
];

const LAYERS: LayerDefinition[] = [
  {
    id: "observations",
    label: "Observations",
    selectors: [
      ["observations"],
      ["organizationalMemory", "observations"],
    ],
  },
  {
    id: "signals",
    label: "Signals",
    selectors: [
      ["signals"],
      ["organizationalSignals"],
      ["organizationalMemory", "signals"],
    ],
  },
  {
    id: "mechanisms",
    label: "Mechanisms",
    selectors: [
      ["mechanisms"],
      ["mechanismNetwork", "mechanisms"],
      ["organizationalMemory", "mechanisms"],
    ],
  },
  {
    id: "beliefs",
    label: "Beliefs",
    selectors: [
      ["beliefs"],
      ["organizationalBeliefs"],
      ["organizationalMemory", "beliefs"],
    ],
  },
  {
    id: "concepts",
    label: "Concepts",
    selectors: [
      ["organizationalConcepts"],
      ["semanticConcepts"],
      ["conceptualUnderstanding"],
      ["organizationalMemory", "concepts"],
    ],
  },
  {
    id: "theories",
    label: "Theories",
    selectors: [
      ["theories"],
      ["organizationalTheories"],
      ["organizationalMemory", "theories"],
    ],
  },
  {
    id: "conditions",
    label: "Conditions",
    selectors: [
      ["organizationalConditions"],
      ["organizationalMemory", "organizationalConditions"],
    ],
  },
  {
    id: "organizational-state",
    label: "Organizational State",
    selectors: [
      ["organizationalState"],
      ["organizationalMemory", "organizationalState"],
    ],
  },
  {
    id: "executive-assessment",
    label: "Executive Assessment",
    selectors: [
      ["executiveAssessment"],
    ],
  },
  {
    id: "recommendation",
    label: "Recommendation",
    selectors: [
      ["executiveAssessment", "recommendation"],
      ["executiveAssessment", "recommendedFocus"],
      ["executiveAssessment", "executiveRecommendation"],
      [
        "executiveAssessment",
        "organizationalUnderstanding",
        "executiveRecommendation",
      ],
      [
        "executiveAssessment",
        "theoryValidation",
        "executiveRecommendation",
      ],
    ],
  },
];

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAtPath(
  source: unknown,
  path: string[],
): unknown {
  let current = source;

  for (const segment of path) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return undefined;
    }

    current = (
      current as Record<string, unknown>
    )[segment];
  }

  return current;
}

function collectStrings(
  value: unknown,
): string[] {
  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  if (typeof value === "string") {
    return [value];
  }

  if (typeof value === "number") {
    return [];
  }

  if (typeof value === "boolean") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStrings);
  }

  if (typeof value === "object") {
    return Object.values(
      value as Record<string, unknown>,
    ).flatMap(collectStrings);
  }

  return [];
}

function collectLayerStrings(
  memory: unknown,
  layer: LayerDefinition,
): string[] {
  const values = layer.selectors.flatMap(
    (selector) =>
      collectStrings(
        getAtPath(
          memory,
          selector,
        ),
      ),
  );

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function evaluateThemeAgainstLayer(
  theme: DiagnosticTheme,
  layer: LayerDefinition,
  layerStrings: string[],
): ThemeLayerResult {
  const normalizedStrings =
    layerStrings.map(
      (value) => ({
        raw: value,
        normalized: normalizeText(value),
      }),
    );

  const keywords =
    theme.keywordGroups.flat();

  const matchedKeywords =
    Array.from(
      new Set(
        keywords.filter(
          (keyword) => {
            const normalizedKeyword =
              normalizeText(keyword);

            return normalizedStrings.some(
              (entry) =>
                entry.normalized.includes(
                  normalizedKeyword,
                ),
            );
          },
        ),
      ),
    );

  const excerpts =
    normalizedStrings
      .filter((entry) =>
        matchedKeywords.some(
          (keyword) =>
            entry.normalized.includes(
              normalizeText(keyword),
            ),
        ),
      )
      .slice(0, 5)
      .map((entry) =>
        entry.raw.length > 240
          ? `${entry.raw.slice(0, 237)}...`
          : entry.raw,
      );

  return {
    themeId: theme.id,
    themeLabel: theme.label,
    layerId: layer.id,
    layerLabel: layer.label,
    present: matchedKeywords.length > 0,
    matchedKeywords,
    excerpts,
  };
}

function findFirstPresence(
  themeResults: ThemeLayerResult[],
): string | null {
  return (
    themeResults.find(
      (result) => result.present,
    )?.layerLabel ?? null
  );
}

function findFirstLossAfterPresence(
  themeResults: ThemeLayerResult[],
): string | null {
  let hasAppeared = false;

  for (const result of themeResults) {
    if (result.present) {
      hasAppeared = true;
      continue;
    }

    if (hasAppeared) {
      return result.layerLabel;
    }
  }

  return null;
}

function printThemeReport(
  theme: DiagnosticTheme,
  results: ThemeLayerResult[],
): void {
  console.log("");
  console.log("==========================================");
  console.log(theme.label.toUpperCase());
  console.log("==========================================");
  console.log("");

  for (const result of results) {
    console.log(
      `${result.present ? "FOUND" : "MISSING"}  ${result.layerLabel}`,
    );

    if (result.matchedKeywords.length > 0) {
      console.log(
        `Keywords: ${result.matchedKeywords.join(", ")}`,
      );
    }

    for (const excerpt of result.excerpts) {
      console.log(`- ${excerpt}`);
    }

    console.log("");
  }

  const firstPresence =
    findFirstPresence(results);

  const firstLoss =
    findFirstLossAfterPresence(results);

  console.log("------------------------------------------");
  console.log(
    `First presence: ${firstPresence ?? "Not detected"}`,
  );

  console.log(
    `First loss after presence: ${firstLoss ?? "No later loss detected"}`,
  );
}

export function runNorthstarPrecisionGap001():
  PrecisionGapReport {
  const runtime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const memory =
    runtime.memory as unknown;

  const results =
    THEMES.flatMap(
      (theme) =>
        LAYERS.map(
          (layer) => {
            const layerStrings =
              collectLayerStrings(
                memory,
                layer,
              );

            return evaluateThemeAgainstLayer(
              theme,
              layer,
              layerStrings,
            );
          },
        ),
    );

  const firstPresenceByTheme:
    Record<string, string | null> = {};

  const firstLossAfterPresenceByTheme:
    Record<string, string | null> = {};

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR PRECISION GAP 001");
  console.log("==========================================");
  console.log("");
  console.log(
    `Organization: ${NORTHSTAR_ORGANIZATION_ID}`,
  );

  for (const theme of THEMES) {
    const themeResults =
      results.filter(
        (result) =>
          result.themeId ===
          theme.id,
      );

    printThemeReport(
      theme,
      themeResults,
    );

    firstPresenceByTheme[
      theme.id
    ] =
      findFirstPresence(
        themeResults,
      );

    firstLossAfterPresenceByTheme[
      theme.id
    ] =
      findFirstLossAfterPresence(
        themeResults,
      );
  }

  console.log("");
  console.log("==========================================");
  console.log("DIAGNOSTIC SUMMARY");
  console.log("==========================================");
  console.log("");

  for (const theme of THEMES) {
    console.log(theme.label);
    console.log(
      `- First presence: ${
        firstPresenceByTheme[
          theme.id
        ] ?? "Not detected"
      }`,
    );
    console.log(
      `- First loss: ${
        firstLossAfterPresenceByTheme[
          theme.id
        ] ?? "No later loss detected"
      }`,
    );
  }

  console.log("");
  console.log(
    "Interpretation: fix the earliest lossy transformation rather than patching executive language solely to increase the score.",
  );
  console.log("");

  return {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    evaluatedAt:
      new Date().toISOString(),

    results,

    firstPresenceByTheme,
    firstLossAfterPresenceByTheme,
  };
}

runNorthstarPrecisionGap001();

export type {
  PrecisionGapReport,
  ThemeLayerResult,
};
