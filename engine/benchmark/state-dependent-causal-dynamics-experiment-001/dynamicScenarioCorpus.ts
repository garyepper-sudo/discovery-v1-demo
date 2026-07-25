import type { DynamicFamily, DynamicTruth } from "./types";

export const dynamicFamilies: DynamicFamily[] = [
  {
    opaqueId: "dyn-001", sourceNode: "customization", targetNode: "delivery variability",
    stateVariable: "specialist utilization",
    variants: [
      { stateLevel: 0.2, upstreamLevel: 0.3, outcomeLevel: 0.1, conditionPresent: false },
      { stateLevel: 0.5, upstreamLevel: 0.5, outcomeLevel: 0.2, conditionPresent: false },
      { stateLevel: 0.75, upstreamLevel: 0.5, outcomeLevel: 0.55, conditionPresent: true },
      { stateLevel: 0.9, upstreamLevel: 0.7, outcomeLevel: 0.9, conditionPresent: true },
      { stateLevel: 1, upstreamLevel: 0.95, outcomeLevel: 0.94, conditionPresent: true },
    ],
    heldOut: { stateLevel: 0.82, upstreamLevel: 0.6, outcomeLevel: 0.72, conditionPresent: true },
  },
  {
    opaqueId: "dyn-002", sourceNode: "decision ambiguity", targetNode: "manager escalation",
    stateVariable: "executive workload",
    variants: [
      { stateLevel: 0.2, upstreamLevel: 0.5, outcomeLevel: 0.2, conditionPresent: false },
      { stateLevel: 0.45, upstreamLevel: 0.5, outcomeLevel: 0.25, conditionPresent: false },
      { stateLevel: 0.7, upstreamLevel: 0.5, outcomeLevel: 0.62, conditionPresent: true },
      { stateLevel: 0.85, upstreamLevel: 0.5, outcomeLevel: 0.82, conditionPresent: true },
      { stateLevel: 0.95, upstreamLevel: 0.5, outcomeLevel: 0.9, conditionPresent: true },
    ],
    heldOut: { stateLevel: 0.8, upstreamLevel: 0.5, outcomeLevel: 0.75, conditionPresent: true },
  },
  {
    opaqueId: "dyn-003", sourceNode: "approval layers", targetNode: "decision latency",
    stateVariable: "decision ownership clarity",
    variants: [
      { stateLevel: 0.1, upstreamLevel: 0.6, outcomeLevel: 0.8, conditionPresent: true },
      { stateLevel: 0.3, upstreamLevel: 0.6, outcomeLevel: 0.68, conditionPresent: true },
      { stateLevel: 0.55, upstreamLevel: 0.6, outcomeLevel: 0.48, conditionPresent: true },
      { stateLevel: 0.8, upstreamLevel: 0.6, outcomeLevel: 0.25, conditionPresent: true },
      { stateLevel: 0.95, upstreamLevel: 0.6, outcomeLevel: 0.18, conditionPresent: true },
    ],
    heldOut: { stateLevel: 0.72, upstreamLevel: 0.6, outcomeLevel: 0.32, conditionPresent: true },
  },
  {
    opaqueId: "dyn-004", sourceNode: "knowledge concentration", targetNode: "execution fragility",
    stateVariable: "historical adaptation",
    variants: [
      { stateLevel: 0.1, upstreamLevel: 0.7, outcomeLevel: 0.72, conditionPresent: true, historicalExposure: 0.1 },
      { stateLevel: 0.3, upstreamLevel: 0.7, outcomeLevel: 0.74, conditionPresent: true, historicalExposure: 0.3 },
      { stateLevel: 0.6, upstreamLevel: 0.2, outcomeLevel: 0.7, conditionPresent: false, historicalExposure: 0.8 },
      { stateLevel: 0.8, upstreamLevel: 0.2, outcomeLevel: 0.68, conditionPresent: false, historicalExposure: 0.9 },
      { stateLevel: 0.95, upstreamLevel: 0.2, outcomeLevel: 0.65, conditionPresent: false, historicalExposure: 1 },
    ],
    heldOut: { stateLevel: 0.9, upstreamLevel: 0.2, outcomeLevel: 0.66, conditionPresent: false, historicalExposure: 1 },
  },
  {
    opaqueId: "dyn-005", sourceNode: "customer exception volume", targetNode: "margin erosion",
    stateVariable: "resource scarcity",
    variants: [
      { stateLevel: 0.2, upstreamLevel: 0.2, outcomeLevel: 0.08, conditionPresent: false },
      { stateLevel: 0.45, upstreamLevel: 0.4, outcomeLevel: 0.18, conditionPresent: false },
      { stateLevel: 0.7, upstreamLevel: 0.6, outcomeLevel: 0.6, conditionPresent: true },
      { stateLevel: 0.88, upstreamLevel: 0.8, outcomeLevel: 0.88, conditionPresent: true },
      { stateLevel: 1, upstreamLevel: 1, outcomeLevel: 0.91, conditionPresent: true },
    ],
    heldOut: { stateLevel: 0.92, upstreamLevel: 0.9, outcomeLevel: 0.9, conditionPresent: true },
  },
];

export const dynamicTruth: DynamicTruth[] = [
  { familyOpaqueId: "dyn-001", expectedClasses: ["activated", "threshold", "amplified", "saturated"], dynamicExpected: true, relevantVariable: "specialist utilization" },
  { familyOpaqueId: "dyn-002", expectedClasses: ["activated", "threshold", "amplified"], dynamicExpected: true, relevantVariable: "executive workload" },
  { familyOpaqueId: "dyn-003", expectedClasses: ["suppressed"], dynamicExpected: true, relevantVariable: "decision ownership clarity" },
  { familyOpaqueId: "dyn-004", expectedClasses: ["persistent"], dynamicExpected: true, relevantVariable: "historical adaptation" },
  { familyOpaqueId: "dyn-005", expectedClasses: ["activated", "threshold", "amplified", "saturated"], dynamicExpected: true, relevantVariable: "resource scarcity" },
];

export const negativeControls = [
  { opaqueId: "control-001", kind: "static", values: [0.4, 0.41, 0.39, 0.4, 0.4] },
  { opaqueId: "control-002", kind: "correlation", values: [0.1, 0.4, 0.2, 0.6, 0.3] },
  { opaqueId: "control-003", kind: "coincidental-threshold", values: [0.2, 0.2, 0.7, 0.2, 0.2] },
  { opaqueId: "control-004", kind: "random-fluctuation", values: [0.5, 0.2, 0.6, 0.3, 0.55] },
  { opaqueId: "control-005", kind: "false-saturation", values: [0.1, 0.3, 0.5, 0.48, 0.7] },
  { opaqueId: "control-006", kind: "false-activation", values: [0.2, 0.7, 0.25, 0.65, 0.3] },
  { opaqueId: "control-007", kind: "common-cause", values: [0.1, 0.3, 0.5, 0.7, 0.9] },
  { opaqueId: "control-008", kind: "reverse-causality", values: [0.1, 0.3, 0.5, 0.7, 0.9] },
  { opaqueId: "control-009", kind: "missing-state", values: [0.2, 0.4, 0.6, 0.8, 1] },
] as const;
