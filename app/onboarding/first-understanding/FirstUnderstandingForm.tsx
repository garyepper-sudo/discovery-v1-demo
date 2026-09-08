"use client";
import { useState } from "react";
import { submitFirstUnderstandingAction } from "./actions";
export function FirstUnderstandingForm() {
 const [error,setError]=useState<string>(), [pending,setPending]=useState(false), [files,setFiles]=useState<File[]>([]), [destination,setDestination]=useState<string>();
 if(destination) return <main style={{maxWidth:720,margin:"40px auto",padding:24}}><h1>Your first understanding is ready.</h1><p>Discovery established:</p><ul><li>Your organization’s governed starting point</li><li>The question it will help answer</li><li>The sources connected to the question</li><li>The recurring meeting that will use the understanding</li><li>Initial Prepared Work</li></ul><p>This does not mean Discovery has completed its understanding of your organization.</p><a href={destination}>Open the meeting</a></main>;
 return <main style={{maxWidth:720,margin:"40px auto",padding:24,overflowWrap:"anywhere"}}><h1>Build your first understanding</h1><p>Start with one important question, the information that matters, and the recurring meeting where the understanding will be used.</p><form style={{display:"grid",gap:18}} action={async data=>{setError(undefined);setPending(true);try{const result=await submitFirstUnderstandingAction(data);if("meetingHomeDestination" in result)setDestination(result.meetingHomeDestination);else setError(result.status==="conflict"?"This submission conflicts with an existing starting point. Use the original details and files.":"Some steps may already be saved. Submit the same details and files again to continue.");}catch(error){setError(error instanceof Error&&!error.message.includes("NEXT_REDIRECT")?error.message:"First understanding is unavailable.");}finally{setPending(false);}}}>
 <h2>What should become understandable?</h2>
 <label>Organization name<input style={{display:"block",width:"100%",boxSizing:"border-box"}} required name="organizationDisplayName" maxLength={500}/></label>
 <label>Purpose<textarea style={{display:"block",width:"100%",boxSizing:"border-box"}} required name="understandingPurpose" maxLength={500}/></label>
 <label>Primary question<textarea style={{display:"block",width:"100%",boxSizing:"border-box"}} required name="primaryQuestion" maxLength={500}/></label>
 <h2>What information should Discovery use?</h2><p>Select 1–5 .txt or .md files, at most 1 MB each. Local Alpha stores this content locally.</p>
 <input aria-label="Source files" style={{maxWidth:"100%"}} type="file" name="files" multiple required accept=".txt,.md,text/plain,text/markdown" onChange={event=>setFiles(Array.from(event.target.files??[]))}/>
 {files.map((file,index)=><label key={index}>Why should Discovery use {file.name}?<input style={{display:"block",width:"100%",boxSizing:"border-box"}} name="sourcePurpose" required maxLength={500}/></label>)}
 <h2>Where will this understanding be used?</h2><label>Recurring meeting title<input style={{display:"block",width:"100%",boxSizing:"border-box"}} required name="meetingTitle" maxLength={240}/></label>
 <label>Cadence<select name="cadence" defaultValue="Weekly"><option>Weekly</option><option>Fortnightly</option><option>Monthly</option></select></label>
 <label><input type="checkbox" name="confirmation" value="confirmed" required/> I confirm these details and sources for the first understanding.</label>
 <button disabled={pending} type="submit">{pending?"Building your first understanding…":"Build my first understanding"}</button>
 {error&&<p role="alert">{error}</p>}</form></main>;
}
