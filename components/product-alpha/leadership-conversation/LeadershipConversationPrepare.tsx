"use client";
import {useEffect,useState,useTransition} from "react";
import type { ChiefFirstPrepareViewV1 } from "../../../product/workflow/leadershipConversation";
import type { ChiefOfStaffValueItemV1, ChiefOfStaffValueLayerV1 } from "../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import type {SourceScopedCandidateV1} from "../../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {reconcileMeetingPackDraftBuffers,type ChiefMeetingPackViewV1,type MeetingPackPrivateNoteIntentV1} from "../../../product/workflow/leadershipConversation/meetingPackContracts";
import {addMeetingPackPrivateNoteAction as addNote,buildMeetingPackAction as buildPack,generateSourceScopedExecutiveAnalysisAction,saveMeetingPackAction as savePack} from "../../../app/product-alpha/leadership-conversation/actions";
import styles from "./LeadershipConversationExperience.module.css";

const List = ({ items }: { items: string[] }) => <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;
const ValueList = ({ items, empty }: { items: ChiefOfStaffValueItemV1[]; empty: string }) => items.length
  ? <ul>{items.slice(0,4).map(item => <li key={item.itemId}><span className={styles.epistemic}>{item.status}</span>{item.text}</li>)}</ul>
  : <p className={styles.quiet}>{empty}</p>;
const labels:Record<keyof SourceScopedCandidateV1["sections"],string>={whatMattersNow:"What matters now",whyItMatters:"Why it matters",competingExplanations:"Competing explanations",whatChanged:"What changed",decisions:"Decisions",notDecided:"Not decided",commitments:"Commitments",openQuestions:"Open questions",contradictions:"Contradictions",evidenceUncertainty:"Evidence uncertainty",modelUncertainty:"Model uncertainty",organizationalDisagreement:"Organizational disagreement",attention:"Attention",whatWouldChangeAssessment:"What would change the assessment"};
export type SourceScopedAnalysisPanelState=
  |{status:"idle"}
  |{status:"pending"}
  |{status:"success";candidate:SourceScopedCandidateV1}
  |{status:"failure";reason:"no-authorized-source-bodies"|"source-access-changed"|"analysis-construction-failure"|"request-failed"};

const failureCopy:Record<Extract<SourceScopedAnalysisPanelState,{status:"failure"}>["reason"],string>={
  "no-authorized-source-bodies":"No currently authorized source material is available for this analysis. Nothing was generated.",
  "source-access-changed":"Source access changed before analysis completed. Nothing was generated.",
  "analysis-construction-failure":"Discovery could not construct the development analysis. Nothing was generated.",
  "request-failed":"The development analysis request did not complete. Nothing was generated.",
};

export function SourceScopedAnalysisPanelView({state,onGenerate}:{state:SourceScopedAnalysisPanelState;onGenerate?:()=>void}){
  const pending=state.status==="pending",candidate=state.status==="success"?state.candidate:null;
  return <section aria-labelledby="working-analysis-heading">
    <h3 id="working-analysis-heading">Working analysis</h3>
    {state.status==="idle"&&<p>No working analysis has been generated. Any generated result is noncanonical and requires human review.</p>}
    {pending&&<p role="status" aria-live="polite">Generating development analysis…</p>}
    {candidate&&<><p><strong>Deterministic development analysis — not a live provider result</strong></p><p>Noncanonical · not yet reviewed</p></>}
    {state.status==="failure"&&<p role="status">{failureCopy[state.reason]}</p>}
    {onGenerate&&<button type="button" disabled={pending} onClick={onGenerate}>{candidate?"Run deterministic analysis again":"Generate analysis"}</button>}
    {candidate&&Object.entries(candidate.sections).map(([key,items])=>{
      const sectionKey=key as keyof typeof labels;
      return <section key={key}><h4>{labels[sectionKey]}</h4>{items.length?<ul>{items.map((item,index)=><li key={`${key}-${index}`}><span className={styles.epistemic}>{item.factCheck==="PASS"?"Source check passed":"Human review required"}</span>{item.statement}<details><summary>Sources</summary><ul>{item.citations.map(citation=><li key={`${citation.sourceId}:${citation.sourceVersion}:${citation.bodyDigest}`}>Source {citation.sourceId} · version {citation.sourceVersion} · material {citation.bodyDigest}</li>)}</ul></details></li>)}</ul>:<p className={styles.quiet}>No supported item.</p>}</section>;
    })}
  </section>;
}

export function MeetingPackPanel({initialPack,hasPrior=false,onPackChange,seriesAddress}:{initialPack:ChiefMeetingPackViewV1|null;hasPrior?:boolean;onPackChange?:(exists:boolean)=>void;seriesAddress?:string}){
  const[pack,setPack]=useState(initialPack),[note,setNote]=useState(""),[intent,setIntent]=useState<MeetingPackPrivateNoteIntentV1>("keep-private"),[agenda,setAgenda]=useState(initialPack?.agendaText??""),[talking,setTalking]=useState(initialPack?.talkingPointsText??""),[editingAgenda,setEditingAgenda]=useState(false),[editingTalking,setEditingTalking]=useState(false),[message,setMessage]=useState<string|null>(null),[pending,start]=useTransition();
  const addMeetingPackPrivateNoteAction=(input:{text:string;intent:MeetingPackPrivateNoteIntentV1})=>addNote({...input,seriesAddress}),buildMeetingPackAction=()=>buildPack(seriesAddress),saveMeetingPackAction=(input:{agendaText:string;talkingPointsText:string;expectedArtifactRevision:string})=>savePack({...input,seriesAddress});
  const update=(next:ChiefMeetingPackViewV1|null,preserveEdits=false)=>{setPack(next);onPackChange?.(Boolean(next));const buffers=reconcileMeetingPackDraftBuffers({agendaText:agenda,talkingPointsText:talking},next,preserveEdits);setAgenda(buffers.agendaText);setTalking(buffers.talkingPointsText);};
  const run=(work:()=>Promise<ChiefMeetingPackViewV1|null>,success:string,preserveEdits=false)=>start(async()=>{setMessage(null);try{const next=await work();update(next,preserveEdits);setMessage(success);}catch{setMessage("Your meeting pack could not be changed. Your saved work remains intact.");}});
  const print=(target:"agenda"|"private")=>{document.body.dataset.meetingPackPrint=target;window.print();delete document.body.dataset.meetingPackPrint;};
  const dirty=Boolean(pack&&(agenda!==pack.agendaText||talking!==pack.talkingPointsText));useEffect(()=>{if(!dirty)return;const unload=(event:BeforeUnloadEvent)=>event.preventDefault(),click=(event:MouseEvent)=>{const anchor=(event.target as Element|null)?.closest("a[href]");if(anchor&&!window.confirm("You have unsaved meeting pack edits. Leave this meeting without saving?")){event.preventDefault();event.stopPropagation()}};window.addEventListener("beforeunload",unload);document.addEventListener("click",click,true);return()=>{window.removeEventListener("beforeunload",unload);document.removeEventListener("click",click,true)}},[dirty]);
  return <section className={styles.meetingPack} aria-labelledby="meeting-pack-heading"><div className={styles.packHeading}><div><p className={styles.badge}>Meeting Pack</p><h3 id="meeting-pack-heading">Prepare for the conversation</h3></div>{pack&&<span className={styles.packReady}>Pack ready</span>}</div><details className={styles.contextDisclosure}><summary>Anything Discovery should know?</summary><p>Add private context Discovery could not infer. {pack?.privateNotes.length?`${pack.privateNotes.length} saved note${pack.privateNotes.length===1?"":"s"}.`:"Nothing added yet."}</p><div className={styles.contextForm}><label>Private context<textarea value={note} maxLength={1000} disabled={pending} onChange={event=>setNote(event.target.value)} /></label><label>How may Discovery use this note?<select value={intent} disabled={pending} onChange={event=>setIntent(event.target.value as MeetingPackPrivateNoteIntentV1)}><option value="keep-private">Keep private — default</option><option value="talking-points">Use in my talking points</option><option value="agenda">Propose for the agenda</option></select></label><p className={styles.quiet}>Nothing added here enters Capture or organizational truth. Contributing to the meeting record remains a separate action.</p><button type="button" disabled={pending||!note.trim()} onClick={()=>run(async()=>{const next=await addMeetingPackPrivateNoteAction({text:note,intent});setNote("");return next;},"Private context saved.",true)}>Save private context</button>{pack?.privateNotes.length?<ul>{pack.privateNotes.map(item=><li key={item.noteId}>{item.intent==="keep-private"?"Kept private":item.intent==="talking-points"?"Talking points":"Agenda suggestion"}: {item.text}</li>)}</ul>:null}</div></details>
    {!pack?<div className={styles.buildPack}><p>{hasPrior?"Discovery will use the last reviewed meeting, material changes, current analysis, open commitments, unresolved questions, and your permitted private context.":"No prior reviewed meeting yet. Change comparison begins after a completed cycle."}</p><button className={styles.primaryAction} type="button" disabled={pending} onClick={()=>run(buildMeetingPackAction,"Your meeting pack is ready.")}>{pending?"Building your meeting pack…":"Build my meeting pack"}</button></div>:<><aside className={styles.draftNotice}><strong>AI-generated draft — review before use.</strong><p>Nothing here becomes organizational truth or a shared meeting record from this page.</p></aside>{pack.potentiallyOutOfDate&&<p role="status" className={styles.staleNotice}><strong>This pack may be out of date.</strong> Your edits were preserved; Discovery did not regenerate them.</p>}<div id="meeting-pack-drafts" className={styles.packGrid}><section className={`${styles.packDraft} ${styles.agendaPrint}`}><div className={styles.artifactHeading}><div><h3>Proposed agenda</h3><p>Draft · not yet shared</p></div><button type="button" onClick={()=>setEditingAgenda(value=>!value)}>{editingAgenda?"Done editing":"Edit agenda"}</button></div>{editingAgenda?<label><span className={styles.srOnly}>Proposed agenda</span><textarea rows={18} value={agenda} disabled={pending} onChange={event=>setAgenda(event.target.value)} /></label>:<div className={styles.artifactPreview}>{agenda}</div>}<button className={styles.printAction} type="button" onClick={()=>print("agenda")}>Print agenda</button></section><section className={`${styles.packDraft} ${styles.privatePrint}`}><div className={styles.artifactHeading}><div><h3>My talking points</h3><p>Private · only you can see this</p></div><button type="button" onClick={()=>setEditingTalking(value=>!value)}>{editingTalking?"Done editing":"Edit talking points"}</button></div><p className={styles.tentative}>Tentative analysis · not my settled view</p>{editingTalking?<label><span className={styles.srOnly}>My talking points</span><textarea rows={18} value={talking} disabled={pending} onChange={event=>setTalking(event.target.value)} /></label>:<div className={styles.artifactPreview}>{talking}</div>}<button className={styles.printAction} type="button" onClick={()=>print("private")}>Print private talking points</button></section></div>{dirty&&<div className={styles.unsaved}><p role="status">Unsaved meeting pack changes.</p><button className={styles.primaryAction} type="button" disabled={pending} onClick={()=>run(()=>saveMeetingPackAction({agendaText:agenda,talkingPointsText:talking,expectedArtifactRevision:pack.artifactRevision}),"Meeting pack edits saved." )}>{pending?"Saving…":"Save changes"}</button></div>}<details className={styles.constructionDetails}><summary>How Discovery built this pack</summary><p>Built from: {hasPrior?<>prior reviewed outcomes {pack.inputBasis.priorReviewedOutcomes} · material changes {pack.inputBasis.materialChanges}</>:<>current analysis updates {pack.inputBasis.materialChanges}</>} · open commitments {pack.inputBasis.openCommitments} · unresolved questions {pack.inputBasis.unresolvedQuestions} · private notes {pack.inputBasis.privateNotes}</p></details></>}{message&&<p role="status">{message}</p>}
  </section>;
}

function SourceScopedAnalysisPanel({initialMeetingPack,hasPrior,meetingPackUnavailable,onPackChange,seriesAddress}:{initialMeetingPack:ChiefMeetingPackViewV1|null;hasPrior:boolean;meetingPackUnavailable:boolean;onPackChange?:(exists:boolean)=>void;seriesAddress?:string}){
  const[state,setState]=useState<SourceScopedAnalysisPanelState>({status:"idle"}),[pending,start]=useTransition();
  const generate=()=>start(async()=>{setState({status:"pending"});try{const response=await generateSourceScopedExecutiveAnalysisAction(seriesAddress),result=response.result;setState(result.status==="eligible"?{status:"success",candidate:result.candidate}:{status:"failure",reason:response.failureCategory??"analysis-construction-failure"});}catch{setState({status:"failure",reason:"request-failed"});}});
  return <>{meetingPackUnavailable?<section className={styles.meetingPack}><h3>Meeting pack unavailable</h3><p role="status">Discovery cannot safely reconstruct this meeting pack with your current access. No private content was shown or changed.</p></section>:<MeetingPackPanel initialPack={initialMeetingPack} hasPrior={hasPrior} onPackChange={onPackChange} seriesAddress={seriesAddress}/>}<details><summary>Why Discovery recommends this</summary><p>Analysis is supporting work, not a separate job and not your settled view.</p>{state.status==="idle"?<button type="button" onClick={generate}>Show detailed working analysis</button>:<SourceScopedAnalysisPanelView state={pending&&state.status!=="success"?{status:"pending"}:state}/>}</details></>;
}

export function LeadershipConversationPrepare({ prepare, valueLayer, initialMeetingPack=null, meetingPackUnavailable=false, onProgressiveDisclosure,onPackChange,seriesAddress }: { prepare: ChiefFirstPrepareViewV1; valueLayer?: ChiefOfStaffValueLayerV1; initialMeetingPack?:ChiefMeetingPackViewV1|null; meetingPackUnavailable?:boolean; onProgressiveDisclosure?:(category:"questions-tensions"|"reasoning-provenance")=>void;onPackChange?:(exists:boolean)=>void;seriesAddress?:string }) {
  if (!valueLayer) return <section aria-labelledby="first-prepare-heading">
    <p>Prepared · guidance only</p>
    <h2 id="first-prepare-heading">Prepare</h2>
    <h3>What changed?</h3><List items={prepare.whatChanged} />
    <h3>What matters now?</h3><List items={prepare.whatMattersNow} />
    <h3>Where is the hidden tension?</h3><List items={prepare.hiddenTension} />
    <h3>What might surprise you?</h3><List items={prepare.possibleSurprise} />
    <h3>What should you ask?</h3><List items={prepare.questions} />
    <h3>What happened last time?</h3><p>{prepare.priorCycle.message}</p>
    <details onToggle={event=>{if(event.currentTarget.open)onProgressiveDisclosure?.("reasoning-provenance");}}>
      <summary>Sources, uncertainty, and reasoning</summary>
      <h4>Sources available to you</h4>
      <ul>{prepare.sourceBasis.map(item => <li key={item.sourceRef}>{item.label}</li>)}</ul>
      <h4>Uncertainty</h4><List items={prepare.uncertainty} />
      <h4>Reasoning</h4><List items={prepare.reasoning} />
      <h4>Other explanations and unknowns</h4><List items={prepare.competingExplanations} />
    </details><SourceScopedAnalysisPanel initialMeetingPack={initialMeetingPack} hasPrior={prepare.priorCycle.status==="completed"} meetingPackUnavailable={meetingPackUnavailable} onPackChange={onPackChange} seriesAddress={seriesAddress}/>
  </section>;

  return <section aria-labelledby="first-prepare-heading" className={styles.valueLayer}>
    <p className={styles.badge}>Prepared · guidance only</p>
    <h2 id="first-prepare-heading">Your meeting brief</h2>
    <div className={styles.orientationGrid}><section><h3>Last time</h3><p>{prepare.priorCycle.status==="none"?"No prior reviewed meeting yet.":prepare.priorCycle.message}</p></section><section><h3>Since last time</h3>{prepare.priorCycle.status === "none" ? <p>Change comparison will begin after this meeting cycle is completed.</p> : <ValueList items={valueLayer.changed} empty="No material change is supported." />}</section><section className={styles.priority}><h3>What matters now</h3><ValueList items={valueLayer.attention} empty="No supported priority is available yet." /></section></div>
    <SourceScopedAnalysisPanel initialMeetingPack={initialMeetingPack} hasPrior={prepare.priorCycle.status==="completed"} meetingPackUnavailable={meetingPackUnavailable} onPackChange={onPackChange} seriesAddress={seriesAddress}/>
    <details onToggle={event=>{if(event.currentTarget.open)onProgressiveDisclosure?.("questions-tensions");}}>
      <summary>Explore questions, tensions, and what would improve understanding</summary>
      <div className={styles.valueGrid}>
        <section><h3>What may surprise you</h3><ValueList items={valueLayer.surprises} empty="No supported surprise is available." /></section>
        <section><h3>Consequential tensions</h3><ValueList items={valueLayer.tensions} empty="No consequential tension is supported." /></section>
        <section><h3>Questions worth asking</h3><ValueList items={valueLayer.questions} empty="No grounded question is available." /></section>
        <section className={styles.acquire}><h3>What would improve understanding</h3><ValueList items={valueLayer.acquisition} empty="Discovery abstains from recommending evidence acquisition without a grounded gap." /></section>
      </div>
    </details>
    <details onToggle={event=>{if(event.currentTarget.open)onProgressiveDisclosure?.("reasoning-provenance");}}>
      <summary>Sources and reasoning</summary>
      <p className={styles.legend}>Supported = grounded in authorized material · Inferred = reasoned from that material · Suspected = a bounded possibility · Unknown = not established.</p>
      <h4>What Discovery does not know</h4>
      <ValueList items={valueLayer.unknowns} empty="No additional unknown is represented." />
      <h4>Sources available to you</h4>
      <ul>{prepare.sourceBasis.map(item => <li key={item.sourceRef}>{item.label}</li>)}</ul>
      <h4>Reasoning and alternatives</h4>
      <ValueList items={valueLayer.details} empty="No further reasoning is available." />
    </details>
  </section>;
}
