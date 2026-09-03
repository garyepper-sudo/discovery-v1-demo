import path from "node:path";
import { createProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { createProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { ChiefMeetingPackOwner } from "../../product/integration/chiefMeetingPackOwner";
import { createLeadershipConversationServerCompositionForValidation } from "../../product/integration/leadershipConversationServerComposition";

async function main(){const root=process.argv[2];
  if(!root)throw new Error("Fresh-process root is required.");
  if(process.argv[3]){const input=JSON.parse(process.argv[3]) as {runtimeRoot:string;workflowRoot:string;sourceContentRoot:string;lineageFixtureRoot:string;userId:string;organizationId:string;questionId:string;conversationId:string;seriesId:string},server=createLeadershipConversationServerCompositionForValidation(input),view=await server.readMeetingPack(input);if(!view)throw new Error("Fresh-process Meeting Pack is unavailable.");process.stdout.write(JSON.stringify({artifactRevision:view.artifactRevision,revision:view.revision}));return;}
  const owner=new ChiefMeetingPackOwner({repository:createProductWorkflowArtifactRepository({root:path.join(root,"workflow"),environment:"test"}),bodyRepository:createProductArtifactBodyRepository({root:path.join(root,"bodies")}),clock:{now:()=>"2026-09-02T12:00:00.000Z"},authorize:async input=>input.userId==="user-a"&&input.organizationId==="org"});
  const view=await owner.read({userId:"user-a",organizationId:"org",questionId:"question",conversationId:"occurrence",seriesId:"leadership-conversation-series:occurrence"},{preparedWorkPublicationDigest:"publication",priorCompletionDigest:null});
  if(!view)throw new Error("Fresh-process Meeting Pack is unavailable.");
  process.stdout.write(JSON.stringify({artifactRevision:view.artifactRevision,revision:view.revision}));
}
void main();
