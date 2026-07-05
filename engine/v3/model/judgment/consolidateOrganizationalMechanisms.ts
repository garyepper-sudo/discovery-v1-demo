import type {
  OrganizationalMechanism,
  OrganizationalMechanismType,
} from "./organizationalMechanism";

function unique<T>(items: T[] | undefined): T[] {
  return Array.from(new Set(items ?? []));
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
  const valid = unique(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value)),
  );

  return valid[0] ?? "";
}

export function consolidateOrganizationalMechanisms(
  mechanisms: OrganizationalMechanism[],
): OrganizationalMechanism[] {
  const grouped = new Map<string, OrganizationalMechanism[]>();

  for (const mechanism of mechanisms) {
    const key =
      mechanism.type === "unknown"
        ? buildCanonicalId(mechanism.type, mechanism)
        : mechanism.type;

    const existing = grouped.get(key) ?? [];
    existing.push(mechanism);
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).map((group) => {
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

    const supportingExplanationIds = unique(
      group.flatMap((mechanism) => mechanism.supportingExplanationIds ?? []),
    );

    const supportingEvidenceIds = unique(
      group.flatMap((mechanism) => mechanism.supportingEvidenceIds ?? []),
    );

    const supportingClusterIds = unique(
      group.flatMap((mechanism) => mechanism.supportingClusterIds ?? []),
    );

    const supportingPhenomenonIds = unique(
      group.flatMap((mechanism) => mechanism.supportingPhenomenonIds ?? []),
    );

    const affectedCapabilities = unique(
      group.flatMap((mechanism) => mechanism.affectedCapabilities ?? []),
    );

    const canonicalId = buildCanonicalId(type, representative);

    const reinforcingMechanismIds = unique(
      group.flatMap((mechanism) => mechanism.reinforcingMechanismIds ?? []),
    ).filter((id) => id !== canonicalId);

    return {
      ...representative,
      id: canonicalId,
      type,
      title:
        type === "unknown"
          ? representative.title || titleForType(type)
          : titleForType(type),
      summary: mergeText(group.map((mechanism) => mechanism.summary)),
      interpretation: mergeText(group.map((mechanism) => mechanism.interpretation)),
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
      affectedCapabilities,
      reinforcingMechanismIds,
      supportCount: group.length,
    };
  });
}