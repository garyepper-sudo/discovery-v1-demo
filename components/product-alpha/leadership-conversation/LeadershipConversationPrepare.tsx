"use client";
import {useState,useTransition} from "react";
import type { ChiefFirstPrepareViewV1 } from "../../../product/workflow/leadershipConversation";
import type { ChiefOfStaffValueItemV1, ChiefOfStaffValueLayerV1 } from "../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import type {SourceScopedCandidateV1} from "../../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {reconcileMeetingPackDraftBuffers,type ChiefMeetingPackViewV1,type MeetingPackPrivateNoteIntentV1} from "../../../product/workflow/leadershipConversation/meetingPackContracts";
import {addMeetingPackPrivateNoteAction,buildMeetingPackAction,generateSourceScopedExecutiveAnalysisAction,saveMeetingPackAction} from "../../../app/product-alpha/leadership-conversation/actions";
import styles from "./LeadershipConversationExperience.module.css";

const List = ({ items }: { items: string[] }) => <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>;
const ValueList = ({ items, empty }: { items: ChiefOfStaffValueItemV1[]; empty: string }) => items.length
  ? <ul>{items.map(item => <li key={item.itemId}><span className={styles.epistemic}>{item.status}</span>{item.text}</li>)}</ul>
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
    <button type="button" disabled={pending} onClick={onGenerate}>{candidate?"Run deterministic analysis again":"Generate analysis"}</button>
    {candidate&&Object.entries(candidate.sections).map(([key,items])=>{
      const sectionKey=key as keyof typeof labels;
      return <section key={key}><h4>{labels[sectionKey]}</h4>{items.length?<ul>{items.map((item,index)=><li key={`${key}-${index}`}><span className={styles.epistemic}>{item.factCheck==="PASS"?"Source check passed":"Human review required"}</span>{item.statement}<details><summary>Sources</summary><ul>{item.citations.map(citation=><li key={`${citation.sourceId}:${citation.sourceVersion}:${citation.bodyDigest}`}>Source {citation.sourceId} · version {citation.sourceVersion} · material {citation.bodyDigest}</li>)}</ul></details></li>)}</ul>:<p className={styles.quiet}>No supported item.</p>}</section>;
    })}
  </section>;
}

export function MeetingPackPanel({analysisReady,initialPack,hasPrior=false}:{analysisReady:boolean;initialPack:ChiefMeetingPackViewV1|null;hasPrior?:boolean}){
  const[pack,setPack]=useState(initialPack),[note,setNote]=useState(""),[intent,setIntent]=useState<MeetingPackPrivateNoteIntentV1>("keep-private"),[agenda,setAgenda]=useState(initialPack?.agendaText??""),[talking,setTalking]=useState(initialPack?.talkingPointsText??""),[message,setMessage]=useState<string|null>(null),[pending,start]=useTransition();
  const update=(next:ChiefMeetingPackViewV1|null,preserveEdits=false)=>{setPack(next);const buffers=reconcileMeetingPackDraftBuffers({agendaText:agenda,talkingPointsText:talking},next,preserveEdits);setAgenda(buffers.agendaText);setTalking(buffers.talkingPointsText);};
  const run=(work:()=>Promise<ChiefMeetingPackViewV1|null>,success:string,preserveEdits=false)=>start(async()=>{setMessage(null);try{const next=await work();update(next,preserveEdits);setMessage(success);}catch{setMessage("Your meeting pack could not be changed. Your saved work remains intact.");}});
  const print=(target:"agenda"|"private")=>{document.body.dataset.meetingPackPrint=target;window.print();delete document.body.dataset.meetingPackPrint;};
  return <section className={styles.meetingPack} aria-labelledby="meeting-pack-heading"><p className={styles.badge}>Chief Meeting Pack</p><h3 id="meeting-pack-heading">Ready to turn this into a meeting plan?</h3><p>{hasPrior?"Discovery will use the last meeting’s reviewed outcomes, what changed, current analysis, open commitments, unresolved questions, and your private context to prepare two drafts.":"For this first occurrence, Discovery will use current analysis, open commitments, unresolved questions, and your private context to prepare two drafts. There is no prior reviewed meeting state yet."}</p>
    <details><summary>Add private context</summary><p>Tell Discovery something it could not infer. The default keeps it private.</p><label>Private context<textarea value={note} maxLength={1000} disabled={pending} onChange={event=>setNote(event.target.value)} /></label><label>How may Discovery use this note?<select value={intent} disabled={pending} onChange={event=>setIntent(event.target.value as MeetingPackPrivateNoteIntentV1)}><option value="keep-private">Keep private</option><option value="talking-points">Use in my talking points</option><option value="agenda">Propose for the agenda</option></select></label><button type="button" disabled={pending||!note.trim()} onClick={()=>run(async()=>{const next=await addMeetingPackPrivateNoteAction({text:note,intent});setNote("");return next;},"Private context saved.",true)}>Save private context</button>{pack?.privateNotes.length?<ul>{pack.privateNotes.map(item=><li key={item.noteId}>{item.intent==="keep-private"?"Kept private":item.intent==="talking-points"?"Talking points":"Agenda suggestion"}: {item.text}</li>)}</ul>:null}</details>
    {!pack?<button className={styles.primaryAction} type="button" disabled={pending||!analysisReady} onClick={()=>run(buildMeetingPackAction,"Your meeting pack is ready.")}>{pending?"Building your meeting pack…":"Build my meeting pack"}</button>:<><button className={styles.primaryAction} type="button" onClick={()=>document.getElementById("meeting-pack-drafts")?.scrollIntoView({behavior:"smooth"})}>Review meeting pack</button><p>Built from: {hasPrior?<>prior reviewed outcomes {pack.inputBasis.priorReviewedOutcomes} · material changes {pack.inputBasis.materialChanges}</>:<>current analysis updates {pack.inputBasis.materialChanges}</>} · open commitments {pack.inputBasis.openCommitments} · unresolved questions {pack.inputBasis.unresolvedQuestions} · private notes {pack.inputBasis.privateNotes}</p>{pack.potentiallyOutOfDate&&<p role="status"><strong>This pack may be out of date.</strong> Your edits were preserved; Discovery did not regenerate them.</p>}<div id="meeting-pack-drafts" className={styles.packGrid}><section className={`${styles.packDraft} ${styles.agendaPrint}`}><p><strong>Draft agenda · not yet shared</strong></p><label>Proposed agenda<textarea rows={18} value={agenda} disabled={pending} onChange={event=>setAgenda(event.target.value)} /></label><button type="button" onClick={()=>print("agenda")}>Print agenda</button></section><section className={`${styles.packDraft} ${styles.privatePrint}`}><p><strong>Private talking points · only you can see this</strong></p><label>My talking points<textarea rows={18} value={talking} disabled={pending} onChange={event=>setTalking(event.target.value)} /></label><button type="button" onClick={()=>print("private")}>Print private talking points</button></section></div><button type="button" disabled={pending||agenda===pack.agendaText&&talking===pack.talkingPointsText} onClick={()=>run(()=>saveMeetingPackAction({agendaText:agenda,talkingPointsText:talking,expectedArtifactRevision:pack.artifactRevision}),"Meeting pack edits saved." )}>{pending?"Saving…":"Save meeting pack"}</button><details><summary>How Discovery assembled this pack</summary><p>Chief prioritized continuity and attention. Counsel added supported challenge. Operator added decisions and follow-through. Scout contributed only identified evidence gaps. These are governed roles over one authorized understanding, not separate agents or truth stores.</p></details></>}{message&&<p role="status">{message}</p>}
  </section>;
}

function SourceScopedAnalysisPanel({initialMeetingPack,hasPrior,meetingPackUnavailable}:{initialMeetingPack:ChiefMeetingPackViewV1|null;hasPrior:boolean;meetingPackUnavailable:boolean}){
  const[state,setState]=useState<SourceScopedAnalysisPanelState>({status:"idle"}),[pending,start]=useTransition();
  const generate=()=>start(async()=>{setState({status:"pending"});try{const response=await generateSourceScopedExecutiveAnalysisAction(),result=response.result;setState(result.status==="eligible"?{status:"success",candidate:result.candidate}:{status:"failure",reason:response.failureCategory??"analysis-construction-failure"});}catch{setState({status:"failure",reason:"request-failed"});}});
  return <><SourceScopedAnalysisPanelView state={pending&&state.status!=="success"?{status:"pending"}:state} onGenerate={generate}/>{meetingPackUnavailable?<section className={styles.meetingPack}><h3>Meeting pack unavailable</h3><p role="status">Discovery cannot safely reconstruct this meeting pack with your current access. No private content was shown or changed.</p></section>:<MeetingPackPanel analysisReady={state.status==="success"||Boolean(initialMeetingPack)} initialPack={initialMeetingPack} hasPrior={hasPrior}/>}</>;
}

export function LeadershipConversationPrepare({ prepare, valueLayer, initialMeetingPack=null, meetingPackUnavailable=false, onProgressiveDisclosure }: { prepare: ChiefFirstPrepareViewV1; valueLayer?: ChiefOfStaffValueLayerV1; initialMeetingPack?:ChiefMeetingPackViewV1|null; meetingPackUnavailable?:boolean; onProgressiveDisclosure?:(category:"questions-tensions"|"reasoning-provenance")=>void }) {
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
    </details><SourceScopedAnalysisPanel initialMeetingPack={initialMeetingPack} hasPrior={prepare.priorCycle.status==="completed"} meetingPackUnavailable={meetingPackUnavailable}/>
  </section>;

  return <section aria-labelledby="first-prepare-heading" className={styles.valueLayer}>
    <p>Prepared · guidance only</p>
    <h2 id="first-prepare-heading">Your meeting brief</h2>
    <section className={styles.priority}>
      <h3>What deserves your attention</h3>
      <ValueList items={valueLayer.attention} empty="No supported priority is available yet." />
    </section>
    <section>
      <h3>Why it matters</h3>
      <ValueList items={valueLayer.whyItMatters} empty="Discovery does not yet have enough support to say why." />
    </section>
    <h3>What changed since last time</h3>
    {prepare.priorCycle.status === "none"
      ? <p>Change comparison will begin after this meeting cycle is completed.</p>
      : <ValueList items={valueLayer.changed} empty="No material change is supported." />}
    <p>{prepare.priorCycle.message}</p>
    <details onToggle={event=>{if(event.currentTarget.open)onProgressiveDisclosure?.("questions-tensions");}}>
      <summary>Explore questions, tensions, and what would improve understanding</summary>
      <div className={styles.valueGrid}>
        <section><h3>What may surprise you</h3><ValueList items={valueLayer.surprises} empty="No supported surprise is available." /></section>
        <section><h3>Consequential tensions</h3><ValueList items={valueLayer.tensions} empty="No consequential tension is supported." /></section>
        <section><h3>Questions worth asking</h3><ValueList items={valueLayer.questions} empty="No grounded question is available." /></section>
        <section className={styles.acquire}><h3>What would improve understanding</h3><ValueList items={valueLayer.acquisition} empty="Discovery abstains from recommending evidence acquisition without a grounded gap." /></section>
      </div>
    </details><SourceScopedAnalysisPanel initialMeetingPack={initialMeetingPack} hasPrior={prepare.priorCycle.status==="completed"} meetingPackUnavailable={meetingPackUnavailable}/>
    <details onToggle={event=>{if(event.currentTarget.open)onProgressiveDisclosure?.("reasoning-provenance");}}>
      <summary>How Discovery reached the prepared view</summary>
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
