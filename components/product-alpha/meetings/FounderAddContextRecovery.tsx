"use client";

import { useActionState } from "react";
import { resumeAddGovernedContextReconciliationAction, type FounderAddContextRecoveryActionState } from "../../../app/product-alpha/meetings/[seriesAddress]/actions";

const initial: FounderAddContextRecoveryActionState={status:"idle",sourceCount:null,destination:null,message:null};
export function FounderAddContextRecovery({seriesAddress}:{seriesAddress:string}){
 const [state,action,pending]=useActionState(resumeAddGovernedContextReconciliationAction.bind(null,seriesAddress),initial);
 if(state.status==="success")return <section aria-labelledby="context-refresh-complete"><h2 id="context-refresh-complete">Context refresh complete</h2><p>The current preparation now includes {state.sourceCount} governed sources.</p><a href={state.destination??`/product-alpha/meetings/${seriesAddress}`}>Return to Meeting Home</a></section>;
 return <section aria-labelledby="context-refresh-heading" style={{marginTop:32,padding:20,border:"1px solid #d5cfbf",borderRadius:12}}><h2 id="context-refresh-heading">Finish context refresh</h2><p>All submitted sources are safely stored, but the current preparation did not finish updating. Resume the update without uploading the files again.</p><form action={action}><button type="submit" disabled={pending}>{pending?"Refreshing context…":"Finish context refresh"}</button>{state.status==="error"&&<p role="alert">{state.message}</p>}</form></section>;
}
