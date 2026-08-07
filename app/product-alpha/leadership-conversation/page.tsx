import { notFound } from "next/navigation";
import { LeadershipConversationExperience } from "../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import { readLeadershipConversationFixture } from "../../../product/frontend/leadershipConversationFixtureAdapter";
export const dynamic="force-dynamic";
export default function LeadershipConversationPage(){if(process.env.NODE_ENV==="production"&&process.env.DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED!=="true")notFound();return <LeadershipConversationExperience workspace={readLeadershipConversationFixture()}/>;}
