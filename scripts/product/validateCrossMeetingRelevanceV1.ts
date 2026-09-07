import { strict as assert } from "node:assert";
import { projectCrossMeetingRelevanceV1 } from "../../product/integration/meetingExecutiveContentProjection";

const proposal=(id:string,summary:string,reviewedCarryForward?:boolean)=>({proposalId:id,payload:{summary,targetRef:null},kind:"commitment",reviewedCarryForward:reviewedCarryForward?{citations:[{sourceId:"source:delivery",sourceVersion:"v1",bodyDigest:"body",sourcePacketDigest:"packet"}]}:undefined});
const workspace=(conversationId:string,currentStep:"freeze"|"capture",summary:string,reviewed=true)=>({organizationId:"org",questionId:"question:shared",conversationId,currentStep,closureCompletion:reviewed?{checkpointStatus:"completed",completedAt:"2026-01-01T00:00:00Z"}:null,reviewedCarryForwardCompletion:reviewed?{dispositionReceiptIds:["disposition:1"]}:null,proposals:reviewed?[proposal("proposal:1",summary,true)]:[proposal("proposal:1",summary,false)],dispositions:reviewed?[{proposalId:"proposal:1",dispositionReceiptId:"disposition:1",disposition:"approved",effectivePayload:null}]:[],canonicalRoutingReceipts:reviewed?[{proposalId:"proposal:1",dispositionReceiptId:"disposition:1",integrationReceiptId:"receipt:1"}]:[]}) as any;

const current=workspace("meeting:pipeline","freeze","Current purpose",false);
const origin=workspace("meeting:product","capture","Reviewed delivery commitment");
const result=projectCrossMeetingRelevanceV1(current,[{meeting:{seriesId:"series:product",title:"Product Leadership"},workspace:origin}]);
assert.equal(result.length,1);
assert.equal(result[0]!.relationshipKind,"shared-product-question");
assert.equal(result[0]!.epistemicStatus,"Reviewed");
assert.deepEqual(result[0]!.citationRefs,["source:delivery:v1"]);
assert.equal(projectCrossMeetingRelevanceV1(current,[{meeting:{seriesId:"series:product",title:"Product Leadership"},workspace:origin,citationAccess:false}]).length,0,"revoked or stale citations fail closed");
assert.equal(projectCrossMeetingRelevanceV1({...current,currentStep:"capture"},[{meeting:{seriesId:"series:product",title:"Product Leadership"},workspace:origin}]).length,0);
assert.equal(projectCrossMeetingRelevanceV1(current,[{meeting:{seriesId:"series:product",title:"Product Leadership"},workspace:{...origin,questionId:"question:foreign"}}]).length,0);
assert.equal(projectCrossMeetingRelevanceV1(current,[{meeting:{seriesId:"series:product",title:"Product Leadership"},workspace:workspace("meeting:product","capture","Unreviewed",false)}]).length,0);
console.log("RESULT cross-meeting-relevance-v1 PASS");
