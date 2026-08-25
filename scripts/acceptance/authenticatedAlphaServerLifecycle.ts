import { spawn,type ChildProcess } from "node:child_process";
import { access,mkdir,rm } from "node:fs/promises";
import path from "node:path";
import { createLeadershipConversationServerComposition } from "../../product/integration/leadershipConversationServerComposition";
import { provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";
import { NORTHSTAR_PREPARED_CONTENT,NORTHSTAR_PREPARED_LINEAGE,northstarLeadershipConversationFixture } from "../../product/workflow/leadershipConversation";

export type AcceptanceServer={process:ChildProcess;baseUrl:string;root:string;stdout:string[];stderr:string[]};
let lifecyclePhase="not-started";
export const currentAcceptanceServerLifecyclePhase=()=>lifecyclePhase;
const localDatabase="postgresql://127.0.0.1/discovery_acceptance";
const fixtureDirectory=(root:string)=>path.join(root,"discovery-northstar-preparation-lineage-onboarding-fixture");

function developmentEnvironment(input:{root:string;fixtureRoot:string;users:{ceo:string;director:string;manager:string};browserRoot:string;port:number}){
  return{TMPDIR:"/private/tmp",NODE_ENV:"development",DISCOVERY_ENV:"development",NEXT_PUBLIC_DISCOVERY_ENV:"development",DISCOVERY_ONBOARDING_TEST_ENABLED:"true",NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED:"true",DISCOVERY_RUNTIME_STORAGE_BACKEND:"filesystem",DISCOVERY_DATABASE_URL:localDatabase,DISCOVERY_DATABASE_ADMIN_URL:localDatabase,DISCOVERY_DATABASE_MIGRATION_URL:localDatabase,DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED:"false",DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_ROOT:input.fixtureRoot,DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT:input.fixtureRoot,DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:path.join(input.fixtureRoot,"runtime"),DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT:path.join(input.root,"workflow"),DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT:path.join(input.root,"source"),DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT:path.join(input.root,"source"),DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED:"true",DISCOVERY_RUNTIME_PROVISIONING_ENABLED:"false",DISCOVERY_ACCESS_PROVISIONING_ENABLED:"false",DISCOVERY_ATLAS_LIVE_PROVISIONING_ENABLED:"false",DISCOVERY_HOSTED_ENVIRONMENT:"false",DISCOVERY_SANDBOX_CEO_USER_ID:input.users.ceo,DISCOVERY_SANDBOX_DIRECTOR_USER_ID:input.users.director,DISCOVERY_SANDBOX_MANAGER_USER_ID:input.users.manager,PLAYWRIGHT_BROWSERS_PATH:input.browserRoot,PORT:String(input.port)};
}

async function provisionPreparedOccurrence(input:{root:string;fixtureRoot:string;questionId:string;users:{ceo:string;director:string;manager:string};browserRoot:string;port:number}){
  const values=developmentEnvironment(input),before=new Map(Object.keys(values).map(key=>[key,process.env[key]]));
  Object.assign(process.env,values);
  try{
    lifecyclePhase="prepared-composition";
    const fixture=northstarLeadershipConversationFixture(input.questionId),identity={userId:input.users.ceo,organizationId:SANDBOX_ORGANIZATION_ID,questionId:fixture.questionId,conversationId:fixture.conversationId},owner=createLeadershipConversationServerComposition();
    lifecyclePhase="prepared-context";
    const stored=await owner.recordContext({...identity,idempotencyKey:"ar2-pre-001b:context",title:"Northstar staff conversation",purpose:"Resolve the next delivery constraint.",intendedOutcome:"Agree one bounded owner action.",timeframe:"Weekly",participants:[{participantRef:"leader",displayName:"Leader",titleLabel:"Chief executive"}],leaderContext:null}),context=stored.contexts.find(value=>value.conversationId===fixture.conversationId);
    if(!context)throw new Error("Acceptance context provisioning unavailable");
    lifecyclePhase="prepared-publication";
    await owner.recordPreparation({...identity,idempotencyKey:"ar2-pre-001b:prepared",contextVersionId:context.contextVersionId,content:NORTHSTAR_PREPARED_CONTENT,lineage:NORTHSTAR_PREPARED_LINEAGE,changeSummary:null});
  }finally{for(const[key,value]of before)value===undefined?delete process.env[key]:process.env[key]=value;}
}

async function ready(server:AcceptanceServer){for(let attempt=0;attempt<200;attempt++){if(server.process.exitCode!==null)throw new Error("Acceptance server stopped");try{if((await fetch(`${server.baseUrl}/alpha-access`,{signal:AbortSignal.timeout(1000)})).status===200)return;}catch{}await new Promise(resolve=>setTimeout(resolve,250));}throw new Error("Acceptance server unavailable");}
async function launch(input:{root:string;port:number;users:{ceo:string;director:string;manager:string};browserRoot:string}){
  const env={...process.env,...developmentEnvironment({...input,fixtureRoot:fixtureDirectory(input.root)})} as NodeJS.ProcessEnv;delete env.VERCEL;delete env.VERCEL_ENV;delete env.NODE_OPTIONS;
  const child=spawn(path.join(process.cwd(),"node_modules/.bin/next"),["dev","-p",String(input.port)],{cwd:process.cwd(),env,stdio:["ignore","pipe","pipe"]}),server:AcceptanceServer={process:child,baseUrl:`http://localhost:${input.port}`,root:input.root,stdout:[],stderr:[]};
  child.stdout?.on("data",value=>server.stdout.push(String(value)));child.stderr?.on("data",value=>server.stderr.push(String(value)));await ready(server);return server;
}

export async function startAcceptanceServer(input:{root:string;port:number;users:{ceo:string;director:string;manager:string};browserRoot:string}):Promise<AcceptanceServer>{
  if(!path.isAbsolute(input.root)||!path.isAbsolute(input.browserRoot)||input.port<1024||input.port>65535)throw new Error("Acceptance server configuration is invalid");
  await mkdir(input.root,{recursive:false,mode:0o700});
  try{lifecyclePhase="fixture";const fixtureRoot=fixtureDirectory(input.root);await mkdir(fixtureRoot,{recursive:false,mode:0o700});const setup=await provisionNorthstarPreparationLineageFixture({environment:"development",fixtureRoot});lifecyclePhase="prepared-occurrence";await provisionPreparedOccurrence({...input,fixtureRoot,questionId:setup.seed.productQuestionId});lifecyclePhase="launch";return await launch(input);}catch(error){await rm(input.root,{recursive:true,force:true});throw error;}
}
export async function restartAcceptanceServer(input:{root:string;port:number;users:{ceo:string;director:string;manager:string};browserRoot:string}){if(!await access(input.root).then(()=>true,()=>false))throw new Error("Acceptance server state is unavailable");return launch(input);}
export async function stopAcceptanceServer(server:AcceptanceServer){if(server.process.exitCode===null){server.process.kill("SIGTERM");await Promise.race([new Promise<void>(resolve=>server.process.once("exit",()=>resolve())),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error("Acceptance server shutdown unavailable")),15_000))]);}}
export async function removeAcceptanceServerRoot(server:AcceptanceServer){if(server.process.exitCode===null)throw new Error("Acceptance server remains active");await rm(server.root,{recursive:true,force:true});if(await access(server.root).then(()=>true,()=>false))throw new Error("Acceptance server root remains");}
