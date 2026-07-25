import { baseFamilies } from "./fixtures";
import type {
  EvidenceConfiguration,
  FamilyId,
} from "./types";

const scenario = (
  familyId: FamilyId,
  id: string,
  evidence: (typeof baseFamilies)[number]["evidence"],
) => ({
  id,
  organizationId: `phase-${familyId}`,
  company: "Neutral Phase Organization",
  industry: "Organizational Services",
  question: "What explains the current organizational outcomes?",
  evidence,
});

export function generateEvidenceConfigurations(): EvidenceConfiguration[] {
  return baseFamilies.flatMap((family) => {
    const ordered = family.revealOrder.map(
      (id) => family.evidence.find((item) => item.sourceId === id)!,
    );
    const bridge = ordered.find(
      (item) => item.sourceId === family.bridgeSourceId,
    )!;
    const peripheral = ordered.find(
      (item) => item.sourceId === family.peripheralSourceId,
    )!;
    const core = ordered.slice(0, 4);
    const disconnected = core.map((item, index) => ({
      ...item,
      content: [
        "The function reviewed its internal operating calendar and staffing.",
        "The team documented a local process change and routine follow-up.",
        "Managers observed ordinary variation in a separate internal measure.",
        "A periodic review recorded stable activity in an unrelated workflow.",
      ][index],
    }));
    const redundant = [
      ...core.slice(0, 2),
      { ...core[0], sourceId: `${family.id}-repeat-1` },
      { ...core[0], sourceId: `${family.id}-repeat-2` },
    ];
    const noise = [
      ...core.slice(0, 3),
      {
        ...core[3],
        content: "Office access badge replacements increased this quarter.",
      },
    ];
    const alternative = [
      ...core,
      {
        ...peripheral,
        sourceId: `${family.id}-alternative`,
        reliability: 0.6,
        content:
          "A separate local review attributes the outcome to staffing availability.",
      },
    ];
    const temporal = (mode: string) =>
      core.map((item, index) => ({
        ...item,
        observedAt:
          mode === "none"
            ? undefined
            : mode === "reverse"
              ? `2026-0${4 - index}-01T00:00:00.000Z`
              : mode === "ambiguous"
                ? "2026-02-01T00:00:00.000Z"
                : `2026-0${index + 1}-01T00:00:00.000Z`,
      }));
    const configurations: EvidenceConfiguration[] = ordered.map(
      (_item, index) => ({
        id: `${family.id}-reveal-${index}`,
        familyId: family.id,
        kind: "reveal",
        stage: index,
        scenario: scenario(
          family.id,
          `${family.id}-reveal-${index}`,
          ordered.slice(0, index + 1),
        ),
        bridgeSourceId: family.bridgeSourceId,
        expectedEmergence: index >= 3,
      }),
    );
    configurations.push(
      {
        id: `${family.id}-topology-disconnected`,
        familyId: family.id,
        kind: "topology-disconnected",
        stage: 3,
        scenario: scenario(
          family.id,
          `${family.id}-topology-disconnected`,
          disconnected,
        ),
        expectedEmergence: false,
      },
      {
        id: `${family.id}-topology-connected`,
        familyId: family.id,
        kind: "topology-connected",
        stage: 3,
        scenario: scenario(
          family.id,
          `${family.id}-topology-connected`,
          core,
        ),
        bridgeSourceId: family.bridgeSourceId,
        expectedEmergence: true,
      },
      {
        id: `${family.id}-bridge-removal`,
        familyId: family.id,
        kind: "bridge-removal",
        stage: 3,
        scenario: scenario(
          family.id,
          `${family.id}-bridge-removal`,
          ordered.filter(
            (item) =>
              item.sourceId !== bridge.sourceId &&
              item.sourceId !== peripheral.sourceId,
          ),
        ),
        expectedEmergence: false,
      },
      {
        id: `${family.id}-peripheral-removal`,
        familyId: family.id,
        kind: "peripheral-removal",
        stage: 4,
        scenario: scenario(
          family.id,
          `${family.id}-peripheral-removal`,
          ordered.filter((item) => item.sourceId !== peripheral.sourceId),
        ),
        bridgeSourceId: family.bridgeSourceId,
        expectedEmergence: true,
      },
      {
        id: `${family.id}-redundant`,
        familyId: family.id,
        kind: "redundant",
        stage: 3,
        scenario: scenario(family.id, `${family.id}-redundant`, redundant),
        expectedEmergence: false,
      },
      {
        id: `${family.id}-complementary`,
        familyId: family.id,
        kind: "complementary",
        stage: 3,
        scenario: scenario(family.id, `${family.id}-complementary`, core),
        bridgeSourceId: family.bridgeSourceId,
        expectedEmergence: true,
      },
      ...[1, 2, 3].map(
        (level): EvidenceConfiguration => ({
          id: `${family.id}-noise-${level}`,
          familyId: family.id,
          kind: "noise",
          stage: level,
          scenario: scenario(
            family.id,
            `${family.id}-noise-${level}`,
            level === 1
              ? noise
              : [
                  ...core,
                  ...Array.from({ length: level }, (_value, index) => ({
                    ...peripheral,
                    sourceId: `${family.id}-noise-${index}`,
                    silo: `Noise ${index}`,
                    sourceType: `Noise ${index}`,
                    content: `Unrelated facility measure ${index} changed during a routine review.`,
                  })),
                ],
          ),
          bridgeSourceId: family.bridgeSourceId,
          expectedEmergence: false,
        }),
      ),
      ...[1, 2, 3].map(
        (level): EvidenceConfiguration => ({
          id: `${family.id}-alternative-${level}`,
          familyId: family.id,
          kind: "alternative",
          stage: level,
          scenario: scenario(
            family.id,
            `${family.id}-alternative-${level}`,
            [
              ...alternative,
              ...Array.from(
                { length: level - 1 },
                (_value, index) => ({
                  ...peripheral,
                  sourceId: `${family.id}-alternative-${index + 2}`,
                  silo: `Alternative ${index}`,
                  sourceType: `Alternative ${index}`,
                  reliability: 0.6,
                  content:
                    "Another separate review attributes the outcome to staffing availability.",
                }),
              ),
            ],
          ),
          bridgeSourceId: family.bridgeSourceId,
          expectedEmergence: false,
        }),
      ),
      ...(["correct", "ambiguous", "reverse", "none"] as const).map(
        (mode, index): EvidenceConfiguration => ({
          id: `${family.id}-temporal-${mode}`,
          familyId: family.id,
          kind: "temporal",
          stage: index,
          scenario: scenario(
            family.id,
            `${family.id}-temporal-${mode}`,
            temporal(mode),
          ),
          bridgeSourceId: family.bridgeSourceId,
          expectedEmergence: mode === "correct",
        }),
      ),
    );
    return configurations;
  }).sort((a, b) => a.id.localeCompare(b.id));
}
