"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, FlaskConical, MessageCircle, Plus, Sparkles, X } from "lucide-react";
import type { buildUnifiedExecutiveWorkspaceView } from "../data/buildUnifiedExecutiveWorkspaceView";
import { useInteractionSession } from "../shared/InteractionSession";
import { buildSessionImpact } from "../data/buildSessionImpact";
import styles from "./UnifiedExecutiveWorkspace.module.css";

type View = ReturnType<typeof buildUnifiedExecutiveWorkspaceView>;

export default function UnifiedExecutiveWorkspace({ view }: { view: View }) {
  const router = useRouter();
  const { entries, addEntry } = useInteractionSession();
  const [selectedInsightId, setSelectedInsightId] = useState(view.insights[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [showDecision, setShowDecision] = useState(false);
  const [showActive, setShowActive] = useState(false);
  const [considering, setConsidering] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [outcome, setOutcome] = useState("");
  const [saving, setSaving] = useState(false);
  const [impactOpen, setImpactOpen] = useState(true);
  const selectedInsight = view.insights.find((item) => item.id === selectedInsightId) ?? view.insights[0];
  const impact = useMemo(() => buildSessionImpact(entries), [entries]);

  function startConversation(value = prompt) {
    const normalized = value.trim();
    if (!normalized) return;
    addEntry({ action: "brainstorm", kind: "discussion", label: normalized, status: "provisional" });
    router.push(`${view.think.destination}&prompt=${encodeURIComponent(normalized)}`);
  }

  async function createDecision() {
    setSaving(true);
    const response = await fetch("/api/product-interaction", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: view.organization.id, interactionId: crypto.randomUUID(), action: "create-decision", content: considering, whyNow, outcome, targetConditionIds: selectedInsight?.activeAreaIds ?? [] }) });
    setSaving(false);
    if (!response.ok) return;
    addEntry({ action: "create-decision", kind: "decision", label: considering, status: "saved" });
    setShowDecision(false); setConsidering(""); setWhyNow(""); setOutcome(""); router.refresh();
  }

  const positions = [[50,50],[50,10],[82,28],[86,64],[66,88],[25,82],[15,45]];
  return <div className={`${styles.workspace} ${impactOpen ? "" : styles.impactClosed}`}>
    <header className={styles.topbar}>
      <div><h1>Good morning, {view.greetingName}.</h1><p>Your Organization Model is evolving.</p></div>
      <div className={styles.summary}>
        <span><small>Understanding</small><strong>{view.summary.understanding === null ? "—" : `${view.summary.understanding}%`}</strong></span>
        <span><small>Confidence</small><strong>{view.summary.confidence === null ? "—" : `${view.summary.confidence}%`}</strong></span>
        <span><small>Primary Constraint</small><strong>{view.summary.primaryConstraint}</strong></span>
        <Link href={view.actions.teach}>Teach Discovery</Link>
      </div>
    </header>

    <main className={styles.main}>
      <section className={styles.primary}>
        <div className={styles.insight}>
          <p><Sparkles size={14}/> Today&apos;s top insight</p>
          <h2>{selectedInsight?.headline ?? "Discovery is still forming its first insight."}</h2>
          <span>{selectedInsight?.implication}</span>
          {view.insights.length > 1 && <div className={styles.insightTabs}>{view.insights.map((item, index) => <button key={item.id} className={item.id === selectedInsight?.id ? styles.selectedTab : undefined} onClick={() => setSelectedInsightId(item.id)}>{String(index + 1).padStart(2,"0")}</button>)}</div>}
          <div className={styles.inlineActions}><Link href={view.actions.exploreInsight}>Explore insight</Link><Link href={`${view.think.destination}&prompt=${encodeURIComponent(selectedInsight?.headline ?? "")}`}>Why this matters</Link></div>
        </div>
        <div className={styles.model} aria-label="Interactive Organization Model">
          <p>Your Organization Model</p>
          <div className={styles.network}>{view.model.areas.slice(0,6).map((area,index) => { const pos=positions[index === 0 ? 0 : index]; const active=selectedInsight?.activeAreaIds.includes(area.id); return <div key={area.id} className={`${styles.node} ${index===0?styles.centerNode:""} ${active?styles.activeNode:""}`} style={{left:`${pos[0]}%`,top:`${pos[1]}%`}}><i/><span>{area.label}</span></div>; })}<svg viewBox="0 0 100 100" aria-hidden="true">{view.model.areas.slice(1,6).map((area,index)=>{const pos=positions[index+1];return <line key={area.id} x1="50" y1="50" x2={pos[0]} y2={pos[1]} className={selectedInsight?.activeAreaIds.includes(area.id)?styles.activeLine:undefined}/>;})}</svg></div>
          <div className={styles.legend}><span><i className={styles.improving}/>Highlighted</span><span><i/>Stable</span><span>{view.model.coherenceLabel}</span></div>
        </div>
        <div className={styles.influence}><p>Model influence</p><h3>{view.influence.statement}</h3><span>{view.influence.metric ?? "Qualitative effect · no quantified projection available"}</span><Link href={view.influence.destination}>View decision impact</Link></div>
      </section>

      <section className={styles.modes}>
        <article className={styles.think}><p><MessageCircle size={15}/> Think</p><h2>Let&apos;s brainstorm.</h2><span>Ask anything about your organization.</span><div className={styles.prompt}><input value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder="What are you thinking about?"/><button onClick={()=>startConversation()} aria-label="Start conversation"><ArrowRight size={15}/></button></div><small>Suggested starters</small>{view.think.starters.map((item)=><button className={styles.starter} key={item} onClick={()=>setPrompt(item)}>{item}</button>)}<button className={styles.panelAction} onClick={()=>startConversation()}><MessageCircle size={14}/> Start a conversation</button></article>
        <article className={styles.decide}><p><Plus size={15}/> Decide</p><h2>Track what matters.</h2><span>See recommended and external decisions.</span><button className={styles.rowAction} onClick={()=>setShowDecision(!showDecision)}>Add decision <ArrowRight size={14}/></button><button className={styles.rowAction} onClick={()=>setShowActive(!showActive)}>Review active decisions <small>{view.decisions.counts.active} active</small></button>{showDecision&&<form className={styles.miniForm} onSubmit={(e)=>{e.preventDefault();void createDecision();}}><input placeholder="What are you considering?" value={considering} onChange={(e)=>setConsidering(e.target.value)}/><input placeholder="Why now?" value={whyNow} onChange={(e)=>setWhyNow(e.target.value)}/><input placeholder="Desired outcome" value={outcome} onChange={(e)=>setOutcome(e.target.value)}/><button disabled={!considering.trim()||!whyNow.trim()||saving}>{saving?"Saving…":"Open decision"}</button></form>} {showActive&&<div className={styles.activeDecision}><strong>{view.decisions.state.title}</strong><span>{view.decisions.state.summary}</span></div>}<small>Discovery recommends</small><div className={styles.recommendation}>{view.decisions.currentPosition.headline}<em>{view.decisions.currentPosition.confidenceLabel}</em></div><Link className={styles.panelAction} href={view.decisions.destination}>View all decisions <ArrowRight size={14}/></Link></article>
        <article className={styles.experiment}><p><FlaskConical size={15}/> Experiment</p><h2>Stress test ideas.</h2><span>Simulate scenarios and compare outcomes.</span><div className={styles.scenario}><strong>{view.experiment.currentScenario}</strong><small>{view.experiment.recentScenarios[0]?.status ?? "Ready"}</small></div>{view.experiment.recentScenarios.slice(0,3).map((item)=><div className={styles.outcome} key={item.id}><span>{item.title}</span><em>{item.status}</em></div>)}<Link className={styles.panelAction} href={view.experiment.runDestination}>Run experiment</Link><Link className={styles.secondaryAction} href={view.experiment.destination}>See all experiments <ArrowRight size={14}/></Link></article>
        <article className={styles.brief}><p><BookOpen size={15}/> Brief</p><h2>Communicate impact.</h2><span>Turn decisions and insights into clear briefs.</span>{view.brief.templates.map((item)=><Link className={styles.briefRow} href={`${view.brief.destination}&template=${encodeURIComponent(item)}`} key={item}>{item}<small>Create</small></Link>)}<Link className={styles.panelAction} href={view.brief.destination}><Plus size={14}/> Create new brief</Link><Link className={styles.secondaryAction} href={view.brief.destination}>View all briefs <ArrowRight size={14}/></Link></article>
      </section>
    </main>

    {impactOpen && <aside className={styles.impact} id="session-recap"><button className={styles.close} onClick={()=>setImpactOpen(false)} aria-label="Close session impact"><X size={16}/></button><p>Session impact</p><h2>{impact.durable.length ? `Great session, ${view.greetingName}.` : "Nothing durable has changed yet."}</h2><span>{impact.durable.length ? "Here’s how you improved your Organization Model." : "Your brainstorming remains provisional."}</span>{impact.durable.length?<ul>{impact.durable.map((entry)=><li key={entry.id}><strong>{entry.action.replace(/-/g," ")}</strong><span>{entry.label}</span></li>)}</ul>:<div className={styles.emptyImpact}>Saved observations and decisions will appear here after persistence succeeds.</div>}<a href="#session-recap">View full session recap</a></aside>}
    <footer className={styles.learning}><strong>One living model.</strong><span>Every interaction helps Discovery learn, adapt, and deliver better judgment.</span><div>You interact <ArrowRight size={14}/> Discovery learns <ArrowRight size={14}/> Model improves <ArrowRight size={14}/> Better decisions &amp; outcomes</div></footer>
  </div>;
}
