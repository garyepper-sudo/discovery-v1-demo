"use client";
import {useState,useTransition} from "react";
import type { ChiefFirstPrepareViewV1 } from "../../../product/workflow/leadershipConversation";
import type { ChiefOfStaffValueItemV1, ChiefOfStaffValueLayerV1 } from "../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import type {SourceScopedCandidateV1} from "../../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {generateSourceScopedExecutiveAnalysisAction} from "../../../app/product-alpha/leadership-conversation/actions";
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

function SourceScopedAnalysisPanel(){
  const[state,setState]=useState<SourceScopedAnalysisPanelState>({status:"idle"}),[pending,start]=useTransition();
  const generate=()=>start(async()=>{setState({status:"pending"});try{const response=await generateSourceScopedExecutiveAnalysisAction(),result=response.result;setState(result.status==="eligible"?{status:"success",candidate:result.candidate}:{status:"failure",reason:response.failureCategory??"analysis-construction-failure"});}catch{setState({status:"failure",reason:"request-failed"});}});
  return <SourceScopedAnalysisPanelView state={pending&&state.status!=="success"?{status:"pending"}:state} onGenerate={generate}/>;
}

export function LeadershipConversationPrepare({ prepare, valueLayer, onProgressiveDisclosure }: { prepare: ChiefFirstPrepareViewV1; valueLayer?: ChiefOfStaffValueLayerV1; onProgressiveDisclosure?:(category:"questions-tensions"|"reasoning-provenance")=>void }) {
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
    </details>{prepare.priorCycle.status==="none"&&<SourceScopedAnalysisPanel />}
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
    </details>{prepare.priorCycle.status==="none"&&<SourceScopedAnalysisPanel />}
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
