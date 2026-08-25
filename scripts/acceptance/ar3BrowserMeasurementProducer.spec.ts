import assert from "node:assert/strict";
import type { Page } from "@playwright/test";
import { AR3_ROUTE, AR3_VIEWPORTS } from "./ar3CurrentBuildAcceptanceProfile";

export type BrowserJourneyMeasurement={ordered:boolean;ceoAuthorized:boolean;directorAuthorizedParity:boolean;managerUnavailable:boolean;deniedNotFound:boolean;desktop:boolean;narrow:boolean;hardReload:boolean;successorNotStarted:boolean;successorFreshProcess:boolean;successorExecutionNotClaimed:boolean;consoleFindings:number;browserFailures:number;horizontalOverflowFindings:number;stageCount:number};
const route=(baseUrl:string)=>`${baseUrl}${AR3_ROUTE}`;
let currentPhase="not-started";
export const currentBrowserMeasurementPhase=()=>currentPhase;
export const markBrowserMeasurementPhase=(phase:string)=>{currentPhase=phase;};
async function noOverflow(page:Page){for(let attempt=0;attempt<5;attempt++){try{await page.waitForLoadState("networkidle");return await page.evaluate(()=>{const surfaces=[...document.querySelectorAll("main")].filter(surface=>{const box=surface.getBoundingClientRect();return box.width>0&&box.height>0;});return surfaces.length>0&&surfaces.every(surface=>surface.scrollWidth<=surface.clientWidth+1);});}catch{if(page.isClosed())throw new Error("Responsive Product surface closed");}}throw new Error("Responsive Product surface unavailable");}

export async function executeCeoJourney(page:Page,baseUrl:string,onPhase:(phase:string)=>void=phase=>{currentPhase=phase;}){
  const observedStages:string[]=[];
  const emit=onPhase;
  onPhase=phase=>{observedStages.push(phase);emit(phase);};
  onPhase("initial-load");
  await page.setViewportSize(AR3_VIEWPORTS.desktop);
  const response=await page.goto(route(baseUrl),{waitUntil:"domcontentloaded"});
  assert.equal(response?.status(),200);
  onPhase("prepare-entry");
  if(new URL(page.url()).hostname!=="localhost")onPhase("authentication-continuation");
  if(await page.getByRole("heading",{name:"This meeting brief is unavailable"}).count())onPhase("prepare-unavailable");
  await page.getByRole("heading",{name:"Your meeting brief",exact:true}).waitFor();
  onPhase("private-working-open");
  await page.getByRole("button",{name:"Open Private Working"}).click();
  onPhase("private-working-confirm");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button",{name:"Confirm this private view"}).click();
  await page.getByRole("button",{name:"Confirm this private view"}).waitFor({state:"detached"});
  const contribute=page.getByRole("button",{name:"Contribute selected items to Freeze"});
  await contribute.waitFor();
  onPhase("private-working-select");
  await page.locator("#private-working-sheet input[type=checkbox]").first().check();
  onPhase("private-working-contribute");
  await contribute.click();
  onPhase("freeze");
  await page.getByRole("button",{name:"Freeze preparation and begin meeting"}).click();
  await page.getByRole("heading",{name:"Preparation frozen"}).waitFor();
  await page.reload({waitUntil:"domcontentloaded"});
  onPhase("capture");
  await page.getByRole("heading",{name:"Capture what happened"}).waitFor();
  await page.getByLabel("Meeting notes").fill("Synthetic acceptance decision with an owner and next step.");
  await page.getByRole("button",{name:"Record meeting outcome"}).click();
  onPhase("review-heading");
  await page.getByRole("heading",{name:"Review the consequential results"}).waitFor();
  onPhase("review-dispositions");
  const evidenceArticle=page.locator("article").filter({has:page.getByRole("heading",{name:"Possible new information"})}).first();
  onPhase("review-evidence-accept");
  await evidenceArticle.getByRole("button",{name:"Accept as Evidence"}).click();
  onPhase("review-evidence-routed");
  await evidenceArticle.getByText("Accepted as Evidence",{exact:true}).waitFor();
  onPhase("review-remaining");
  const keepOpen=page.getByRole("button",{name:"Keep open"});
  while(await keepOpen.count()){const before=await keepOpen.count();await keepOpen.first().click();await page.waitForFunction(count=>[...document.querySelectorAll("button")].filter(button=>button.textContent?.trim()==="Keep open").length<count,before);}
  onPhase("closure-ready");
  await page.getByRole("button",{name:"Complete Occurrence 1"}).waitFor();
  onPhase("closure");
  await page.getByRole("button",{name:"Complete Occurrence 1"}).click();
  await page.getByRole("heading",{name:"This meeting is closed"}).waitFor();
  await page.getByRole("heading",{name:"Carry the reviewed outcome forward"}).waitFor();
  onPhase("prepare-again");
  await page.getByRole("button",{name:"Prepare Again"}).click();
  await page.getByText("Occurrence 2 is prepared, but the next meeting has not started.",{exact:true}).waitFor();
  await page.reload({waitUntil:"domcontentloaded"});
  onPhase("successor-reload");
  const status=page.getByText("Occurrence 2 is prepared. The next meeting has not started.",{exact:true});
  await status.waitFor();
  const successorStatusCount=await status.count(),successorExecutionActionCount=await page.getByRole("button",{name:/Freeze|Capture|Complete Occurrence/}).count();
  assert.equal(successorStatusCount,1);
  assert.equal(successorExecutionActionCount,0);
  const expectedStages=["initial-load","prepare-entry","private-working-open","private-working-confirm","private-working-select","private-working-contribute","freeze","capture","review-heading","review-dispositions","review-evidence-accept","review-evidence-routed","review-remaining","closure-ready","closure","prepare-again","successor-reload"];
  return{overflow:!(await noOverflow(page)),ordered:JSON.stringify(observedStages)===JSON.stringify(expectedStages),stageCount:observedStages.length,successorStatusCount,successorExecutionActionCount};
}

export async function observeAuthorizedParity(page:Page,baseUrl:string,viewport:keyof typeof AR3_VIEWPORTS){currentPhase="authorized-viewport";await page.setViewportSize(AR3_VIEWPORTS[viewport]);currentPhase="authorized-load";const response=await page.goto(route(baseUrl),{waitUntil:"domcontentloaded"});currentPhase="authorized-status";assert.equal(response?.status(),200);currentPhase="authorized-successor";const successorStatus=page.getByText("Occurrence 2 is prepared. The next meeting has not started.",{exact:true});await successorStatus.waitFor();const successorStatusCount=await successorStatus.count();currentPhase="authorized-no-execution";const successorExecutionActionCount=await page.getByRole("button",{name:/Freeze|Capture|Complete Occurrence/}).count();assert.equal(successorExecutionActionCount,0);currentPhase="authorized-overflow";return{reconstructed:response?.status()===200&&successorStatusCount===1&&successorExecutionActionCount===0,overflow:!(await noOverflow(page))};}
export async function observeFreshSuccessorReconstruction(page:Page,baseUrl:string){currentPhase="fresh-load";const response=await page.goto(route(baseUrl),{waitUntil:"networkidle"});currentPhase="fresh-status";assert.equal(response?.status(),200);const successorStatus=page.getByText("Occurrence 2 is prepared. The next meeting has not started.",{exact:true});await successorStatus.waitFor();const successorStatusCount=await successorStatus.count();currentPhase="fresh-no-execution";let successorExecutionActionCount:number|undefined;for(let attempt=0;attempt<5&&successorExecutionActionCount===undefined;attempt++){try{await page.waitForLoadState("networkidle");successorExecutionActionCount=await page.getByRole("button",{name:/Freeze|Capture|Complete Occurrence/}).count();}catch{if(page.isClosed())throw new Error("Fresh reconstruction page closed");}}if(successorExecutionActionCount===undefined)throw new Error("Fresh reconstruction final DOM unavailable");return{reconstructed:response?.status()===200&&successorStatusCount===1&&successorExecutionActionCount===0};}
export async function observeManagerUnavailable(page:Page,baseUrl:string){const response=await page.goto(route(baseUrl),{waitUntil:"domcontentloaded"});assert.equal(response?.status(),200);await page.getByRole("heading",{name:"This meeting brief is unavailable"}).waitFor();assert.equal(await page.locator("#private-working-sheet,#personal-room-sheet-title").count(),0);for(const name of ["Open Private Working","Freeze preparation and begin meeting","Record meeting outcome","Accept as Evidence","Keep open","Complete Occurrence 1","Prepare Again"])assert.equal(await page.getByRole("button",{name,exact:true}).count(),0);for(const text of ["Your meeting brief","Carry the reviewed outcome forward","What Changed","Occurrence 2 is prepared"])assert.equal(await page.getByText(text,{exact:false}).count(),0);return true;}
export async function observeDenied(page:Page,baseUrl:string){currentPhase="denied-load";const response=await page.goto(route(baseUrl),{waitUntil:"domcontentloaded"});await page.waitForLoadState("networkidle");currentPhase="denied-navigation";const current=new URL(page.url());assert.equal(current.hostname,"localhost");assert.equal(current.pathname,AR3_ROUTE);currentPhase="denied-status";assert.equal(response?.status(),404);currentPhase="denied-hard-reload";const reloaded=await page.reload({waitUntil:"networkidle"});assert.equal(reloaded?.status(),404);currentPhase="denied-private-working";assert.equal(await page.locator("main #private-working-sheet").isVisible(),false);currentPhase="denied-personal-room";assert.equal(await page.locator("main #personal-room-sheet-title").isVisible(),false);const actions=["Freeze preparation and begin meeting","Record meeting outcome","Accept as Evidence","Keep open","Do not carry forward","Complete Occurrence 1","Prepare Again"];for(let index=0;index<actions.length;index++){currentPhase=`denied-action-${index+1}`;assert.equal(await page.getByRole("button",{name:actions[index]!,exact:true}).isVisible(),false);}return true;}
