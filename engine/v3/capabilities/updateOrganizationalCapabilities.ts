import type { KnowledgeReference } from "../cognition/cognitiveGraph";
import type {
  DetectedOrganizationalCapability,
  OrganizationalCapabilitiesState,
  OrganizationalCapability,
  OrganizationalCapabilityStatus,
} from "./organizationalCapabilities";

function unique(values: string[] = []): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueReferences(
  values: KnowledgeReference[] = []
): KnowledgeReference[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = `${value.type}:${value.id}`;
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function inferStatus(
  strength: number,
  stability: number
): OrganizationalCapabilityStatus {
  if (strength >= 0.75 && stability >= 0.65) return "stable";
  if (strength >= 0.45) return "reinforced";
  return "new";
}

function createCapabilityId(index: number): string {
  return `capability-${index + 1}`;
}

export function updateOrganizationalCapabilities(params: {
  existingState?: OrganizationalCapabilitiesState;
  detectedCapabilities: DetectedOrganizationalCapability[];
  now?: string;
}): OrganizationalCapabilitiesState {
  const { existingState, detectedCapabilities } = params;
  const now = params.now ?? new Date().toISOString();

  const existingCapabilities = existingState?.capabilities ?? [];
  const updatedCapabilities: OrganizationalCapability[] = [
    ...existingCapabilities,
  ];

  detectedCapabilities.forEach((detected) => {
    const detectedDynamicIds = detected.dynamicIds ?? [];
    const detectedUnderstandingIds = detected.understandingIds ?? [];
    const detectedSupportedBy = detected.supportedBy ?? [];
    const detectedEvidence = detected.evidence ?? [];

    const existingIndex = updatedCapabilities.findIndex(
      (capability) =>
        capability.label.trim().toLowerCase() ===
        detected.label.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = updatedCapabilities[existingIndex];

      const strength = clamp((existing.strength ?? 0.35) + 0.12);
      const confidence = clamp(
        Math.max(existing.confidence ?? 0.65, detected.confidence ?? 0.65) +
          0.04
      );
      const stability = clamp((existing.stability ?? 0.2) + 0.08);

      updatedCapabilities[existingIndex] = {
        ...existing,
        type: "capability",
        confidence,
        strength,
        stability,
        status: inferStatus(strength, stability),
        dynamicIds: unique([
          ...(existing.dynamicIds ?? []),
          ...detectedDynamicIds,
        ]),
        understandingIds: unique([
          ...(existing.understandingIds ?? []),
          ...detectedUnderstandingIds,
        ]),
        supportedBy: uniqueReferences([
          ...(existing.supportedBy ?? []),
          ...detectedSupportedBy,
        ]),
        supports: existing.supports ?? [],
        meaningIds: existing.meaningIds ?? [],
        conceptIds: existing.conceptIds ?? [],
        phenomenonIds: existing.phenomenonIds ?? [],
        supportingEvidence: unique([
          ...(existing.supportingEvidence ?? []),
          ...detectedEvidence,
        ]),
        contradictingEvidence: existing.contradictingEvidence ?? [],
        updatedAt: now,
      };

      return;
    }

    const strength = clamp(0.35 + detectedDynamicIds.length * 0.06);
    const stability = clamp(0.2 + detectedDynamicIds.length * 0.04);

    updatedCapabilities.push({
      id: createCapabilityId(updatedCapabilities.length),
      type: "capability",
      label: detected.label,
      description: detected.description,
      confidence: clamp(detected.confidence ?? 0.65),
      strength,
      stability,
      status: inferStatus(strength, stability),
      supportedBy: uniqueReferences(detectedSupportedBy),
      supports: [],
      dynamicIds: unique(detectedDynamicIds),
      understandingIds: unique(detectedUnderstandingIds),
      meaningIds: [],
      conceptIds: [],
      phenomenonIds: [],
      supportingEvidence: unique(detectedEvidence),
      contradictingEvidence: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  return {
    capabilities: updatedCapabilities,
    lastUpdated: now,
  };
}