import { notFound } from "next/navigation";
import { ProductAlphaExperience } from "../../components/product-alpha";
import { fixtureProductWorkspaceAdapter } from "../../product/frontend";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ fixture?: string }>;
};

function fixtureRouteEnabled(): boolean {
  return process.env.NODE_ENV !== "production"
    || process.env.DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED === "true";
}

export default async function ProductAlphaPage({ searchParams }: Props) {
  if (!fixtureRouteEnabled()) notFound();

  const requested = (await searchParams).fixture;
  const fixtures = fixtureProductWorkspaceAdapter.listFixtures();
  const initialFixtureId = requested && fixtures.some((fixture) => fixture.id === requested)
    ? requested
    : fixtureProductWorkspaceAdapter.getInitialFixture().id;

  return (
    <ProductAlphaExperience
      fixtures={fixtures}
      initialFixtureId={initialFixtureId}
    />
  );
}
