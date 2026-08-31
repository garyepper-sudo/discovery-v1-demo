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
function SourceScopedAnalysisPanel(){const[candidate,setCandidate]=useState<SourceScopedCandidateV1|null>(null),[error,setError]=useState(false),[pending,start]=useTransition();const generate=()=>start(async()=>{setError(false);const result=await generateSourceScopedExecutiveAnalysisAction();if(result.status==="eligible")setCandidate(result.candidate);else setError(true);});return <section aria-labelledby="ai-working-analysis-heading"><h3 id="ai-working-analysis-heading">AI working analysis</h3><p>Based on the sources currently available in this Leadership Conversation.</p><p>AI-generated working analysis — not yet reviewed</p><button type="button" disabled={pending} onClick={generate}>{pending?"Generating…":candidate?"Refresh analysis":"Generate analysis"}</button>{candidate&&<p className={styles.quiet}>Refreshing makes another model request.</p>}{error&&<p role="status">Analysis unavailable</p>}{candidate&&<>{Object.entries(candidate.sections).map(([key,items])=><section key={key}><h4>{labels[key as keyof typeof labels]}</h4>{items.length?<ul>{items.map((item,index)=><li key={`${key}-${index}`}>{item.statement}<details><summary>Sources</summary><ul>{item.citations.map(citation=><li key={`${citation.sourceId}:${citation.sourceVersion}`}>Source used for this analysis</li>)}</ul></details></li>)}</ul>:<p className={styles.quiet}>No supported item.</p>}</section>)}</>}</section>}

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
      <summary>How Discovery reached this view</summary>
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
