import { notFound } from "next/navigation";
import { ProductAlphaExperience } from "../../components/product-alpha";
import { fixtureProductWorkspaceAdapter } from "../../product/frontend";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../lib/onboarding/testing";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    fixture?: string;
    mode?: string;
    organizationId?: string;
    questionId?: string;
  }>;
};

function fixtureRouteEnabled(): boolean {
  return process.env.NODE_ENV !== "production"
    || process.env.DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED === "true";
}

export default async function ProductAlphaPage({ searchParams }: Props) {
  if (!fixtureRouteEnabled()) notFound();

  const parameters = await searchParams;
  const liveMode = parameters.mode === "live-sandbox";
  if (liveMode) {
    validateOnboardingTestEnvironment();
    if (!parameters.organizationId || !isOnboardingTestOrganizationId(parameters.organizationId)) {
      notFound();
    }
  }
  const requested = parameters.fixture;
  const fixtures = fixtureProductWorkspaceAdapter.listFixtures();
  const initialFixtureId = requested && fixtures.some((fixture) => fixture.id === requested)
    ? requested
    : fixtureProductWorkspaceAdapter.getInitialFixture().id;

  return (
    <ProductAlphaExperience
      mode={liveMode ? "live-sandbox" : "fixture"}
      fixtures={fixtures}
      initialFixtureId={initialFixtureId}
      organizationId={liveMode ? parameters.organizationId : undefined}
      initialQuestionId={liveMode ? parameters.questionId : undefined}
    />
  );
}
