export type ProductOrganizationSummary = {
  organizationId?: string;
  organizationName?: string;
  runtimeAvailable: boolean;
  coherence?: number | null;
  coherenceLabel?: string;
};

export function buildProductHref(
  pathname: string,
  organizationId?: string,
): string {
  if (!organizationId) return pathname;

  const search = new URLSearchParams({ organizationId });
  return `${pathname}?${search.toString()}`;
}
