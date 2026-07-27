export type ProductionRoutePolicyEnvironment = Readonly<
  Record<string, string | undefined>
>;

export type ProductionRouteDisposition = "allow" | "not-found";

const governedProductSurface =
  /^\/(?:ask|brief|decisions|experiment|organizations|research|your-organization|discovery-v1|executive-decision|api\/(?:analyze|discovery-lab|executive-decision|executive-decision-record|executive-scenario|product-interaction))(?:\/|$)/;

const internalDevelopmentSurface =
  /^\/(?:cognition-lab|discovery-lab|executive-decision)(?:\/|$)/;

export function isHostedDiscoveryEnvironment(
  environment: ProductionRoutePolicyEnvironment = process.env,
): boolean {
  return (
    environment.NODE_ENV === "production" ||
    environment.VERCEL === "1" ||
    environment.VERCEL_ENV === "preview" ||
    environment.VERCEL_ENV === "production"
  );
}

export function productionRouteDisposition(input: {
  pathname: string;
  activationEnabled: boolean;
  environment?: ProductionRoutePolicyEnvironment;
}): ProductionRouteDisposition {
  if (!isHostedDiscoveryEnvironment(input.environment)) return "allow";

  if (internalDevelopmentSurface.test(input.pathname)) return "not-found";

  if (
    input.pathname === "/" ||
    governedProductSurface.test(input.pathname)
  ) {
    if (!input.activationEnabled) return "not-found";

    if (
      input.pathname !== "/your-organization" &&
      !input.pathname.startsWith("/your-organization/")
    ) {
      return "not-found";
    }
  }

  return "allow";
}
