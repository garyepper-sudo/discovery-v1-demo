import type {
  DetectedOrganizationalCapability,
  OrganizationalCapabilitiesState,
  OrganizationalCapability,
  OrganizationalCapabilityStatus,
} from "./organizationalCapabilities";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function inferStatus(strength: number, stability: number): OrganizationalCapabilityStatus {
  if (strength >= 0.75 && stability >= 0.65) {
    return "stable";
  }

  if (strength >= 0.45) {
    return "reinforced";
  }

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
  const updatedCapabilities: OrganizationalCapability[] = [...existingCapabilities];

  detectedCapabilities.forEach((detected) => {
    const existingIndex = updatedCapabilities.findIndex(
      (capability) =>
        capability.label.trim().toLowerCase() ===
        detected.label.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = updatedCapabilities[existingIndex];

      const strength = clamp(existing.strength + 0.12);
      const confidence = clamp(
        Math.max(existing.confidence, detected.confidence) + 0.04
      );
      const stability = clamp(existing.stability + 0.08);

      updatedCapabilities[existingIndex] = {
        ...existing,
        confidence,
        strength,
        stability,
        status: inferStatus(strength, stability),
        understandingIds: unique([
          ...existing.understandingIds,
          ...detected.understandingIds,
        ]),
        supportingEvidence: unique([
          ...existing.supportingEvidence,
          ...detected.evidence,
        ]),
        updatedAt: now,
      };

      return;
    }

    const strength = clamp(0.35 + detected.understandingIds.length * 0.05);
    const stability = clamp(0.2 + detected.understandingIds.length * 0.03);

    updatedCapabilities.push({
      id: createCapabilityId(updatedCapabilities.length),
      label: detected.label,
      description: detected.description,
      confidence: clamp(detected.confidence),
      strength,
      stability,
      status: inferStatus(strength, stability),
      understandingIds: unique(detected.understandingIds),
      meaningIds: [],
      conceptIds: [],
      phenomenonIds: [],
      supportingEvidence: unique(detected.evidence),
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