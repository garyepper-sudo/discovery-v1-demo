/**
 * The current Prepared Work revision is a single, contiguous lineage.  This
 * deliberately does not use filesystem order, artifact ids, or source-count
 * as a proxy for "current".  Callers choose their own fail-closed response.
 */
export type PreparedWorkRevision = {
  artifactVersion: number;
  artifactRevision: string;
  predecessorArtifactVersionId: string | null;
};

export function resolveCurrentPreparedWorkPublication<T extends PreparedWorkRevision>(
  publications: readonly T[],
): T {
  const ordered = [...publications].sort(
    (left, right) => left.artifactVersion - right.artifactVersion || left.artifactRevision.localeCompare(right.artifactRevision),
  );
  if (!ordered.length || ordered.some((value, index) =>
    value.artifactVersion !== index + 1
    || value.predecessorArtifactVersionId !== (index ? ordered[index - 1]!.artifactRevision : null),
  )) {
    throw new Error("Current Prepared Work is ambiguous.");
  }
  return ordered.at(-1)!;
}
