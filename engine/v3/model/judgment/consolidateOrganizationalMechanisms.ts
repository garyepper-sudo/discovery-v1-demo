import type {
  OrganizationalMechanism,
  OrganizationalMechanismType,
} from "./organizationalMechanism";

function safeArray<T>(items: T[] | undefined | null): T[] {
  return Array.isArray(items) ? items : [];
}

function safeStringArray(items: Array<string | undefined> | undefined | null): string[] {
  return Array.isArray(items)
    ? items.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

function unique<T>(items: T[] | undefined | null): T[] {
  return Array.from(new Set(safeArray(items)));
}

function uniqueStrings(items: Array<string | undefined> | undefined | null): string[] {
  return Array.from(new Set(safeStringArray(items)));
}

function numericValue(value: unknown): number | undefined {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    if (value === "low") return 0.33;
    if (value === "medium") return 0.66;
    if (value === "high") return 1;
    if (value === "critical") return 1;
  }

  return undefined;
}

function average(values: unknown[]): number {
  const valid = values
    .map(numericValue)
    .filter((value): value is number => typeof value === "number");

  if (valid.length === 0) return 0;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function max(values: unknown[]): number {
  const valid = values
    .map(numericValue)
    .filter((value): value is number => typeof value === "number");

  if (valid.length === 0) return 0;

  return Math.max(...valid);
}

function normalizeKeyPart(value: string | undefined): string {
  return (value ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildCanonicalId(
  type: OrganizationalMechanismType,
  mechanism?: OrganizationalMechanism,
): string {
  if (type !== "unknown") {
    return `mechanism:${type}`;
  }

  return `mechanism:unknown:${normalizeKeyPart(
    mechanism?.organizationalBehavior ||
      mechanism?.title ||
      mechanism?.summary ||
      "unlabeled",
  )}`;
}

function titleForType(type: OrganizationalMechanismType): string {
  return String(type)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function mergeText(values: Array<string | undefined>): string {
  const valid = uniqueStrings(values.map((value) => value?.trim()));
  return valid[0] ?? "";
}

export function consolidateOrganizationalMechanisms(
  mechanisms: OrganizationalMechanism[] = [],
): OrganizationalMechanism[] {
  const grouped = new Map<string, OrganizationalMechanism[]>();

  for (const mechanism of safeArray(mechanisms)) {
    const key =
      mechanism.type === "unknown"
        ? buildCanonicalId(mechanism.type, mechanism)
        : mechanism.type;

    const existing = grouped.get(key) ?? [];
    existing.push(mechanism);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((group): OrganizationalMechanism => {
    const representative = group[0];
    const type = representative.type;

    const confidence = Math.min(
      1,
      average(group.map((mechanism) => mechanism.confidence)) +
        Math.min(0.15, group.length * 0.01),
    );

    const severity = max(group.map((mechanism) => mechanism.severity));
    const executivePriority = max(
      group.map((mechanism) => mechanism.executivePriority),
    );

    const supportingExplanationIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.supportingExplanationIds),
        ...safeStringArray(mechanism.explanationIds),
      ]),
    );

    const supportingEvidenceIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.supportingEvidenceIds),
      ),
    );

    const supportingClusterIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.supportingClusterIds),
        ...safeStringArray(mechanism.clusterIds),
        ...safeStringArray(mechanism.sourceClusterIds),
      ]),
    );

    const supportingPhenomenonIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.supportingPhenomenonIds),
        ...safeStringArray(mechanism.sourcePhenomenonIds),
      ]),
    );

    const supportingCompressedThemeIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.supportingCompressedThemeIds),
      ),
    );

    const affectedCapabilities = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.affectedCapabilities),
      ),
    );

    const affectedCapabilityIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.affectedCapabilityIds),
        ...safeStringArray(mechanism.capabilityIds),
      ]),
    );

    const explanationIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.explanationIds),
        ...safeStringArray(mechanism.supportingExplanationIds),
      ]),
    );

    const reasoningPathIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.reasoningPathIds),
      ),
    );

    const capabilityIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.capabilityIds),
        ...safeStringArray(mechanism.affectedCapabilityIds),
      ]),
    );

    const clusterIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.clusterIds),
        ...safeStringArray(mechanism.supportingClusterIds),
        ...safeStringArray(mechanism.sourceClusterIds),
      ]),
    );

    const judgmentIds = uniqueStrings(
      group.flatMap((mechanism) => safeStringArray(mechanism.judgmentIds)),
    );

    const sourcePhenomenonIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.sourcePhenomenonIds),
        ...safeStringArray(mechanism.supportingPhenomenonIds),
      ]),
    );

    const sourceClusterIds = uniqueStrings(
      group.flatMap((mechanism) => [
        ...safeStringArray(mechanism.sourceClusterIds),
        ...safeStringArray(mechanism.supportingClusterIds),
        ...safeStringArray(mechanism.clusterIds),
      ]),
    );

    const upstreamMechanismIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.upstreamMechanismIds),
      ),
    );

    const downstreamMechanismIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.downstreamMechanismIds),
      ),
    );

    const canonicalId = buildCanonicalId(type, representative);

    const reinforcingMechanismIds = uniqueStrings(
      group.flatMap((mechanism) =>
        safeStringArray(mechanism.reinforcingMechanismIds),
      ),
    ).filter((id) => id !== canonicalId);

    const evidenceReferences = unique(
      group.flatMap((mechanism) => safeArray(mechanism.evidenceReferences)),
    );

    return {
      ...representative,
      id: canonicalId,
      type,
      title:
        type === "unknown"
          ? representative.title || titleForType(type)
          : titleForType(type),

      summary: mergeText(group.map((mechanism) => mechanism.summary)),
      interpretation: mergeText(
        group.map((mechanism) => mechanism.interpretation),
      ),
      executiveImplication: mergeText(
        group.map((mechanism) => mechanism.executiveImplication),
      ),

      confidence,
      severity,
      executivePriority,

      supportingExplanationIds,
      supportingEvidenceIds,
      supportingClusterIds,
      supportingPhenomenonIds,
      supportingCompressedThemeIds,

      explanationIds,
      reasoningPathIds,
      capabilityIds,
      clusterIds,
      judgmentIds,

      sourcePhenomenonIds,
      sourceClusterIds,

      affectedCapabilities,
      affectedCapabilityIds,

      upstreamMechanismIds,
      downstreamMechanismIds,
      reinforcingMechanismIds,

      evidenceReferences,

      supportCount: group.length,
    };
  });
}