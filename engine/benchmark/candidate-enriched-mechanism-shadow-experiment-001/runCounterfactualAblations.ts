import type { ShadowScenario } from "./types";

export function createCounterfactuals(item: ShadowScenario): ShadowScenario[] {
  const evidence = item.scenario.evidence;
  const central = Math.floor(evidence.length / 2);
  const duplicate = evidence[0];
  return [
    {
      ...item,
      id: `${item.id}-bridge`,
      scenario: {
        ...item.scenario,
        id: `${item.id}-bridge`,
        evidence: evidence.filter((_value, index) => index !== central),
      },
    },
    {
      ...item,
      id: `${item.id}-complementary`,
      scenario: {
        ...item.scenario,
        id: `${item.id}-complementary`,
        evidence: [
          ...evidence.filter((_value, index) => index !== central),
          evidence[central],
        ],
      },
    },
    {
      ...item,
      id: `${item.id}-redundant`,
      scenario: {
        ...item.scenario,
        id: `${item.id}-redundant`,
        evidence: [
          ...evidence,
          { ...duplicate, sourceId: `${item.id}-duplicate` },
        ],
      },
    },
    {
      ...item,
      id: `${item.id}-conflict`,
      scenario: {
        ...item.scenario,
        id: `${item.id}-conflict`,
        evidence: [
          ...evidence,
          {
            ...duplicate,
            sourceId: `${item.id}-conflict`,
            reliability: 0.2,
            content: "An unverified source disputes the proposed relationship.",
          },
        ],
      },
    },
    {
      ...item,
      id: `${item.id}-temporal`,
      scenario: {
        ...item.scenario,
        id: `${item.id}-temporal`,
        evidence: evidence.map((source, index) => ({
          ...source,
          observedAt: `2025-${String(evidence.length - index).padStart(2, "0")}-01T00:00:00.000Z`,
        })),
      },
    },
  ];
}
