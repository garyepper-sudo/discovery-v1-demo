"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  GitBranch,
  Home,
  Lightbulb,
  ListChecks,
  Menu,
  MessageCircleQuestion,
  PauseCircle,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { alphaFixture } from "../../product/alpha/fixtures";
import type {
  AlphaScene,
  ResponsePathViewModel,
  SourceViewModel,
} from "../../product/alpha/viewModels";
import {
  Action,
  DiscoveryMark,
  Eyebrow,
  Panel,
  PrivacyNote,
  QuietHeader,
  LockPrototypeAction,
} from "./AlphaPrimitives";
import {
  ChangeCard,
  ConfidenceSummary,
  DirectionSummary,
  EvolutionGraph,
  FollowConfirmation,
  RelationshipRow,
  ResponseEffect,
  SemanticCallout,
  Sparkline,
} from "./AlphaSemantic";
import styles from "./AlphaExperience.module.css";

const sceneLabels: Record<AlphaScene, { label: string; description: string }> = {
  ask: { label: "Ask", description: "Begin with a question" },
  orient: { label: "Orient", description: "Review objective and scope" },
  plan: { label: "Plan", description: "Review learning plan" },
  learn: { label: "Learn", description: "Watch Discovery learn" },
  understand: { label: "Understand", description: "See the current synthesis" },
  respond: { label: "Respond", description: "Share your perspective" },
  follow: { label: "Follow", description: "Keep learning" },
  return: { label: "Return", description: "See what changed" },
  home: { label: "Home", description: "What matters now" },
};

const journeyNavigation: Array<{
  scene: AlphaScene;
  label: string;
  description: string;
  index: number;
  activeScene?: AlphaScene;
}> = [
  { scene: "orient", label: "Orient", description: "Review objective and scope", index: 1 },
  { scene: "plan", label: "Plan", description: "Review learning plan", index: 2 },
  { scene: "learn", label: "Learn", description: "Watch Discovery learn", index: 3 },
  { scene: "understand", label: "Understand", description: "See the current synthesis", index: 4 },
  {
    scene: "understand",
    label: "Examine",
    description: "Open reasoning in Understand",
    index: 5,
    activeScene: undefined,
  },
  { scene: "respond", label: "Respond", description: "Share your perspective", index: 6 },
  { scene: "follow", label: "Follow", description: "Keep learning", index: 7 },
  { scene: "return", label: "Return", description: "See what changed", index: 8 },
];

function nextSourceState(state: SourceViewModel["state"]): SourceViewModel["state"] {
  if (state === "Included") return "Limited";
  if (state === "Limited") return "Excluded";
  return "Included";
}

function AlphaSidebar({
  scene,
  navigate,
}: {
  scene: AlphaScene;
  navigate: (scene: AlphaScene) => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <DiscoveryMark />
      <nav aria-label="Alpha journey">
        <button
          type="button"
          className={scene === "home" ? styles.navActive : ""}
          onClick={() => navigate("home")}
        >
          <Home size={19} aria-hidden="true" />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={scene === "understand" ? styles.navActive : ""}
          onClick={() => navigate("understand")}
        >
          <Target size={19} aria-hidden="true" />
          <span>Understandings</span>
        </button>
        <button
          type="button"
          className={scene === "ask" ? styles.navActive : ""}
          onClick={() => navigate("ask")}
        >
          <MessageCircleQuestion size={19} aria-hidden="true" />
          <span>Ask Discovery</span>
        </button>
        <span className={styles.navDivider} />
        {journeyNavigation.map((item) => (
          <button
            key={`${item.label}-${item.index}`}
            type="button"
            className={
              item.activeScene === undefined && item.label === "Examine"
                ? ""
                : scene === (item.activeScene ?? item.scene)
                  ? styles.navActive
                  : ""
            }
            aria-current={
              item.label !== "Examine" && scene === (item.activeScene ?? item.scene)
                ? "page"
                : undefined
            }
            onClick={() => navigate(item.scene)}
          >
            <span className={styles.navIndex}>{item.index}</span>
            <span>
              {item.label}
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </nav>
      <div className={styles.sidebarProfile}>
        <span className={styles.avatar} aria-hidden="true">SR</span>
        <span><strong>{alphaFixture.user.name}</strong><small>{alphaFixture.user.role}</small></span>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
      <div className={styles.sidebarConfidence}>
        <span>Confidence in this Understanding</span>
        <strong>Moderate</strong>
        <small>81% · increased by 7 points</small>
      </div>
      <p className={styles.sidebarPrivacy}>
        <ShieldCheck size={16} aria-hidden="true" />
        Alpha prototype · deterministic fixture
      </p>
      <LockPrototypeAction />
    </aside>
  );
}

function MobileSceneHeader({
  scene,
  onBack,
}: {
  scene: AlphaScene;
  onBack?: () => void;
}) {
  return (
    <header className={styles.mobileHeader}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      ) : (
        <button type="button" aria-label="Open navigation">
          <Menu size={20} aria-hidden="true" />
        </button>
      )}
      <strong>{scene === "home" ? "Discovery Home" : sceneLabels[scene].label}</strong>
      <LockPrototypeAction compact />
    </header>
  );
}

function AskScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [question, setQuestion] = useState("");
  const examples = [
    "We’re shipping more slowly than six months ago.",
    "I don’t understand why projects keep slipping.",
    "Our leadership team disagrees on priorities.",
  ];
  return (
    <main className={`${styles.scene} ${styles.askScene}`}>
      <QuietHeader helpLabel="Help" />
      <div className={styles.askComposition}>
        <span className={styles.askCompass} aria-hidden="true">✦</span>
        <h1 data-scene-heading tabIndex={-1}>
          What would you like Discovery to understand?
        </h1>
        <span className={styles.shortRule} aria-hidden="true" />
        <p>Start with the question that matters.</p>
        <label className={styles.srOnly} htmlFor="alpha-question">
          Organizational question
        </label>
        <div className={styles.questionField}>
          <textarea
            id="alpha-question"
            maxLength={1000}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Describe something your organization doesn’t fully understand…"
          />
          <span>{question.length}/1000</span>
        </div>
        <Action arrow onClick={() => navigate("orient")}>
          Begin Understanding
        </Action>
        <div className={styles.examples}>
          <span className={styles.exampleLabel}>Examples to get you started</span>
          <div>
            {examples.map((example) => (
              <button key={example} type="button" onClick={() => setQuestion(example)}>
                <span aria-hidden="true">“</span>
                {example}
              </button>
            ))}
          </div>
        </div>
        <PrivacyNote />
      </div>
    </main>
  );
}

function OrientScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [editing, setEditing] = useState(false);
  const [objective, setObjective] = useState(alphaFixture.understanding.objective);
  return (
    <main className={`${styles.scene} ${styles.lightScene}`}>
      <QuietHeader helpLabel="How orientation works" back={() => navigate("ask")} />
      <div className={styles.centeredScene}>
        <header className={styles.sceneIntro}>
          <h1 data-scene-heading tabIndex={-1}>Here’s my current understanding</h1>
          <p>Review and refine before I begin learning.</p>
        </header>
        <Panel className={styles.questionPanel}>
          <span className={styles.quoteMark} aria-hidden="true">“</span>
          <div>
            <Eyebrow>Your question</Eyebrow>
            <h2>{alphaFixture.understanding.originalQuestion}</h2>
          </div>
        </Panel>
        <Panel tone="blue" className={styles.objectivePanel}>
          <span className={styles.orbitIcon} aria-hidden="true">✦</span>
          <div>
            <Eyebrow>My current understanding</Eyebrow>
            {editing ? (
              <label>
                <span className={styles.srOnly}>Understanding objective</span>
                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  autoFocus
                />
              </label>
            ) : (
              <h2>{objective}</h2>
            )}
            <p>
              This focuses on the factors limiting delivery speed and consistency
              across teams and projects.
            </p>
          </div>
          <button
            className={styles.inlineLink}
            type="button"
            onClick={() => setEditing((value) => !value)}
          >
            {editing ? "Save" : "Edit"}
          </button>
        </Panel>
        <SemanticCallout title="The biggest thing I don’t understand yet" tone="orange" icon="unknown">
          <h2>{alphaFixture.understanding.primaryUnknown}</h2>
          <p>Understanding this could change how we think about the real constraint.</p>
        </SemanticCallout>
        <section className={styles.strategySummary} aria-labelledby="strategy-title">
          <Eyebrow><span id="strategy-title">To answer this, I’ll start by examining</span></Eyebrow>
          <div>
            {alphaFixture.sources.map((source) => (
              <span key={source.id}>
                <FileText size={18} aria-hidden="true" />
                {source.title}
              </span>
            ))}
          </div>
        </section>
        <p className={styles.interpretationNote}>
          <ShieldCheck size={17} aria-hidden="true" />
          This is my current interpretation. You can refine it before learning begins.
        </p>
        <Action arrow onClick={() => navigate("plan")}>Begin Learning</Action>
        <PrivacyNote />
      </div>
    </main>
  );
}

function PlanScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [sources, setSources] = useState(alphaFixture.sources);
  const cycleSource = (id: string) => {
    setSources((current) =>
      current.map((source) =>
        source.id === id ? { ...source, state: nextSourceState(source.state) } : source,
      ),
    );
  };
  return (
    <main className={`${styles.scene} ${styles.lightScene}`}>
      <QuietHeader helpLabel="How learning plans work" back={() => navigate("orient")} />
      <div className={`${styles.centeredScene} ${styles.planScene}`}>
        <header className={styles.sceneIntro}>
          <Eyebrow>{alphaFixture.understanding.title} · Living Understanding</Eyebrow>
          <h1 data-scene-heading tabIndex={-1}>Here’s how I’ll learn.</h1>
          <p>The smallest set of information I expect will most improve my understanding.</p>
        </header>
        <Panel className={styles.confidenceProjection}>
          <span><small>Current understanding</small><strong>Early</strong></span>
          <span className={styles.dottedArrow} aria-hidden="true">·········· →</span>
          <span><small>Expected after learning</small><strong>Moderate</strong></span>
        </Panel>
        <section className={styles.planUnknown}>
          <CircleHelp size={25} aria-hidden="true" />
          <div>
            <Eyebrow>The biggest thing I still don’t understand</Eyebrow>
            <h2>{alphaFixture.understanding.primaryUnknown}</h2>
            <p>Answering this will most improve the current Understanding.</p>
          </div>
        </section>
        <div className={styles.planLayout}>
          <section className={styles.sourcePlan} aria-labelledby="source-plan-title">
            <h2 id="source-plan-title">
              <Sparkles size={20} aria-hidden="true" />
              To reduce this uncertainty, I recommend learning from:
            </h2>
            <div className={styles.sourceList}>
              {sources.map((source) => (
                <article key={source.id} className={styles.sourceRow}>
                  <span className={`${styles.semanticIcon} ${styles[`tone_${source.tone}`]}`}>
                    <FileText size={19} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{source.title}</strong>
                    <span>{source.rationale}</span>
                  </div>
                  <div className={styles.contribution}>
                    <small>Expected contribution</small>
                    <b>{source.contribution}</b>
                  </div>
                  <button type="button" onClick={() => cycleSource(source.id)}>
                    {source.state} <ChevronDown size={15} aria-hidden="true" />
                  </button>
                </article>
              ))}
              <button className={styles.addSource} type="button">
                <Plus size={20} aria-hidden="true" />
                <span><strong>Something Discovery should also consider?</strong><small>Add a source, context, or file.</small></span>
                <span>Add information</span>
              </button>
            </div>
          </section>
          <Panel className={styles.protectionPanel}>
            <ShieldCheck size={22} aria-hidden="true" />
            <h3>Your information is bounded</h3>
            <p>This prototype uses only its deterministic fixture and your local selections.</p>
          </Panel>
        </div>
        <footer className={styles.planFooter}>
          <Action tone="secondary">Save plan for later</Action>
          <span><ShieldCheck size={15} aria-hidden="true" /> You approve each source state.</span>
          <Action arrow onClick={() => navigate("learn")}>Start learning</Action>
        </footer>
      </div>
    </main>
  );
}

function LearnScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [visibleEvents, setVisibleEvents] = useState(3);
  const events = alphaFixture.events.slice(0, visibleEvents);
  return (
    <SceneFrame scene="learn" navigate={navigate}>
      <MobileSceneHeader scene="learn" onBack={() => navigate("plan")} />
      <div className={styles.appScene}>
        <header className={styles.appSceneHeader}>
          <div>
            <button className={styles.textAction} type="button" onClick={() => navigate("plan")}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to plan
            </button>
            <h1 data-scene-heading tabIndex={-1}>Discovery is learning <span className={styles.liveState}>● In progress</span></h1>
            <p>I’m reviewing the approved fixture and updating the Understanding through meaningful events.</p>
          </div>
          <Action tone="secondary">How learning works</Action>
        </header>
        <Panel tone="blue" className={styles.learningCanvas}>
          <div className={styles.learningCanvasHead}>
            <Eyebrow>{alphaFixture.understanding.title} · The Understanding is evolving</Eyebrow>
            <span>Live view <ChevronDown size={15} aria-hidden="true" /></span>
          </div>
          <div className={styles.liveSynthesis}>
            <span>Current synthesis</span>
            <h2>{alphaFixture.understanding.synthesis}</h2>
            <p className={styles.currentExplanation}>{alphaFixture.understanding.explanation}</p>
            <p className={styles.learningConfidence}>
              <strong>Moderate confidence</strong>
              <span>74% · increased by 12 points since learning started</span>
            </p>
          </div>
          <EvolutionGraph />
          <DirectionSummary />
        </Panel>
        <div className={styles.learningGrid}>
          <section className={styles.eventsPanel} aria-labelledby="events-title">
            <div className={styles.sectionHeading}>
              <h2 id="events-title">Recent learning events</h2>
              <span className={styles.liveState}>● Fixture sequence</span>
            </div>
            <ol>
              {events.map((event) => (
                <li key={event.id} className={styles[`event_${event.kind}`]}>
                  <span>{event.time}</span>
                  <div><strong>{event.title}</strong><small>{event.detail}</small></div>
                  <b>{event.effect}</b>
                </li>
              ))}
            </ol>
            {visibleEvents < alphaFixture.events.length && (
              <Action tone="secondary" arrow onClick={() => setVisibleEvents(alphaFixture.events.length)}>
                View all events ({alphaFixture.events.length})
              </Action>
            )}
          </section>
          <Panel className={styles.nextLearning}>
            <h2><Sparkles size={20} aria-hidden="true" /> What I’m doing next</h2>
            <p>I’m continuing to deepen the evidence around ownership ambiguity after commitment.</p>
            <ul>
              <li>Reviewing project history <span>In progress</span></li>
              <li>Examining team conversations <span>Queued</span></li>
              <li>Comparing planning documents <span>Queued</span></li>
            </ul>
          </Panel>
        </div>
        <Panel tone="blue" className={styles.readyBanner}>
          <Sparkles size={24} aria-hidden="true" />
          <div><h2>I’m forming the first useful synthesis.</h2><p>I’ll continue refining it as learning progresses.</p></div>
          <Action arrow onClick={() => navigate("understand")}>View the Understanding</Action>
        </Panel>
      </div>
    </SceneFrame>
  );
}

function UnderstandScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const details = [
    ["why", "Why this matters", alphaFixture.understanding.whyItMatters, "green"],
    ["strongest", "Strongest explanation", alphaFixture.understanding.strongestExplanation, "violet"],
    ["unknown", "Largest remaining unknown", alphaFixture.understanding.primaryUnknown, "blue"],
    ["contradiction", "Key contradiction", alphaFixture.understanding.contradiction, "orange"],
  ] as const;
  return (
    <SceneFrame scene="understand" navigate={navigate}>
      <MobileSceneHeader scene="understand" onBack={() => navigate("learn")} />
      <div className={styles.appScene}>
        <header className={styles.understandingTitle}>
          <button className={styles.textAction} type="button" onClick={() => navigate("home")}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to understandings
          </button>
          <div>
            <span className={styles.titleIcon}><TrendingUp size={32} aria-hidden="true" /></span>
            <div>
              <h1 data-scene-heading tabIndex={-1}>{alphaFixture.understanding.title}</h1>
              <span className={styles.livingBadge}>Living Understanding</span>
              <p>Original question: <button type="button">{alphaFixture.understanding.originalQuestion}</button></p>
            </div>
          </div>
          <Action tone="secondary" onClick={() => navigate("follow")}>Follow this Understanding</Action>
        </header>
        <Panel tone="green" className={styles.synthesisPanel}>
          <div className={styles.synthesisCopy}>
            <Eyebrow>Current synthesis</Eyebrow>
            <h2>{alphaFixture.understanding.synthesis}</h2>
            <p>{alphaFixture.understanding.explanation}</p>
            <span>Updated today · 8:12 AM</span>
            <button className={styles.inlineLink} type="button" onClick={() => setOpenDetail("strongest")}>
              See why Discovery believes this <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
          <ConfidenceSummary confidence={alphaFixture.understanding.confidence} />
        </Panel>
        <div className={styles.detailGrid}>
          {details.map(([id, title, copy, tone]) => (
            <button
              key={id}
              type="button"
              className={`${styles.detailCard} ${openDetail === id ? styles.detailOpen : ""}`}
              onClick={() => setOpenDetail(openDetail === id ? null : id)}
              aria-expanded={openDetail === id}
            >
              <span className={`${styles.semanticIcon} ${styles[`tone_${tone}`]}`}>
                {id === "why" ? <Users size={20} aria-hidden="true" /> : id === "unknown" ? <CircleHelp size={20} aria-hidden="true" /> : id === "contradiction" ? <AlertTriangle size={20} aria-hidden="true" /> : <TrendingUp size={20} aria-hidden="true" />}
              </span>
              <strong>{title}</strong>
              <p>{copy}</p>
              {openDetail === id && <small>{id === "contradiction" ? "This limits where the current explanation applies." : "This remains part of the current, historically traceable synthesis."}</small>}
            </button>
          ))}
        </div>
        <div className={styles.understandingLower}>
          <Panel className={styles.beforeAfter}>
            <h2>How this Understanding changed</h2>
            <div><span><small>Before</small>Planning and execution appeared equally plausible.</span><ArrowRight aria-hidden="true" /><span><small>Now</small>Ownership ambiguity is the strongest explanation.</span></div>
            <EvolutionGraph early={62} current={74} />
          </Panel>
          <Panel className={styles.relationshipsPanel}>
            <div className={styles.sectionHeading}><h2>Related Understandings</h2><button type="button">View all</button></div>
            {alphaFixture.relationships.slice(0, 3).map((relationship) => <RelationshipRow key={relationship.id} relationship={relationship} />)}
          </Panel>
          <Panel tone="violet" className={styles.recommendedLearning}>
            <Eyebrow tone="violet">Next recommended learning</Eyebrow>
            <h2>Compare decision practices in the consistently delivering team.</h2>
            <p>Expected contribution: <strong>High</strong></p>
            <button className={styles.inlineLink} type="button" onClick={() => navigate("plan")}>See learning plan <ArrowRight size={16} aria-hidden="true" /></button>
          </Panel>
        </div>
        <footer className={styles.understandingFooter}>
          <span>First created May 1, 2025 · Last meaningful change today · 8:12 AM</span>
          <div>
            <Action tone="secondary" arrow onClick={() => navigate("respond")}>Examine this Understanding</Action>
            <Action arrow onClick={() => navigate("follow")}>Follow this Understanding</Action>
          </div>
        </footer>
      </div>
    </SceneFrame>
  );
}

function RespondScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [selected, setSelected] = useState<ResponsePathViewModel["id"]>("agree");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const selectedPath = alphaFixture.responsePaths.find((path) => path.id === selected)!;
  return (
    <SceneFrame scene="respond" navigate={navigate}>
      <MobileSceneHeader scene="respond" onBack={() => navigate("understand")} />
      <div className={styles.appScene}>
        <header className={styles.appSceneHeader}>
          <div>
            <button className={styles.textAction} type="button" onClick={() => navigate("understand")}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to understand
            </button>
            <Eyebrow>{alphaFixture.understanding.title} · Living Understanding</Eyebrow>
            <h1 data-scene-heading tabIndex={-1}>Help Discovery get this right</h1>
            <p>Your perspective can qualify or deepen this Understanding.</p>
          </div>
        </header>
        <Panel tone="violet" className={styles.responsePanel}>
          <h2>How does this Understanding compare with what you’ve seen?</h2>
          <p>Choose the response that best represents your perspective.</p>
          <div className={styles.responsePaths} role="radiogroup" aria-label="Response path">
            {alphaFixture.responsePaths.map((path) => (
              <button
                key={path.id}
                type="button"
                role="radio"
                aria-checked={selected === path.id}
                className={selected === path.id ? styles.responseSelected : ""}
                onClick={() => { setSelected(path.id); setSubmitted(false); }}
              >
                <span className={`${styles.semanticIcon} ${styles[`tone_${path.tone}`]}`}>
                  {path.id === "agree" ? <Check aria-hidden="true" /> : path.id === "missing" ? <AlertTriangle aria-hidden="true" /> : path.id === "different" ? <GitBranch aria-hidden="true" /> : <Search aria-hidden="true" />}
                </span>
                <strong>{path.title}</strong>
                <p>{path.description}</p>
              </button>
            ))}
          </div>
        </Panel>
        <Panel className={styles.contributionPanel}>
          <div>
            <h2>What you can tell Discovery <span>(optional)</span></h2>
            <p>Add context, examples, or evidence that helps qualify this Understanding.</p>
            <label className={styles.srOnly} htmlFor="alpha-contribution">Share your perspective</label>
            <div className={styles.contributionField}>
              <textarea
                id="alpha-contribution"
                value={context}
                maxLength={2000}
                onChange={(event) => { setContext(event.target.value); setSubmitted(false); }}
                placeholder="Share your perspective…"
              />
              <span>{context.length}/2000</span>
            </div>
          </div>
          <aside>
            <h3>Examples of helpful context</h3>
            <p>What’s happening that isn’t reflected here?</p>
            <p>Are there specific teams or time periods to examine?</p>
            <p>What may be driving different outcomes?</p>
          </aside>
        </Panel>
        <ResponseEffect submitted={submitted} pathTitle={selectedPath.title} />
        <footer className={styles.responseFooter}>
          <button className={styles.inlineLink} type="button" onClick={() => navigate("follow")}>Skip for now</button>
          <Action
            arrow
            onClick={() => {
              if (submitted) navigate("follow");
              else setSubmitted(true);
            }}
          >
            {submitted ? "Continue to Follow" : "Submit my response"}
          </Action>
        </footer>
      </div>
    </SceneFrame>
  );
}

function FollowScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const [paused, setPaused] = useState(false);
  const notifications = [
    "Confidence changes significantly",
    "A contradiction appears",
    "A better explanation emerges",
    "New relationships form",
    "A better question to answer",
  ];
  return (
    <SceneFrame scene="follow" navigate={navigate}>
      <MobileSceneHeader scene="follow" onBack={() => navigate("respond")} />
      <div className={styles.appScene}>
        <header className={styles.followHeader}>
          <button className={styles.textAction} type="button" onClick={() => navigate("respond")}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to respond
          </button>
          <h1 data-scene-heading tabIndex={-1}>Following Engineering Productivity <span className={styles.livingBadge}>{paused ? "Paused" : "Active"}</span></h1>
          <p>Discovery will keep learning through this deterministic prototype and surface only meaningful change.</p>
        </header>
        <Panel tone="violet" className={styles.followMeaning}>
          <span className={styles.followOrb} aria-hidden="true">✦</span>
          <div><h2>What following means</h2><p>Discovery preserves the current Understanding, challenges assumptions, and shows meaningful changes over time.</p></div>
          <Sparkline tone="violet" label="Illustrative path of continued Understanding evolution" />
        </Panel>
        <div className={styles.followGrid}>
          <Panel>
            <h2>I’ll surface a change when…</h2>
            <ul className={styles.notificationList}>
              {notifications.map((notification) => <li key={notification}><span className={styles.semanticIcon}><Bell size={17} aria-hidden="true" /></span><strong>{notification}</strong><Check size={17} aria-hidden="true" /></li>)}
            </ul>
          </Panel>
          <Panel>
            <h2>Discovery is currently watching</h2>
            {alphaFixture.relationships.map((relationship) => <RelationshipRow key={relationship.id} relationship={relationship} />)}
          </Panel>
        </div>
        <Panel className={styles.nextLikely}>
          <Target size={30} aria-hidden="true" />
          <div><Eyebrow>Next likely learning</Eyebrow><h2>Compare the consistently delivering team with the rest of Engineering.</h2><p>This comparison could materially qualify the current explanation.</p></div>
          <div><small>Expected contribution</small><strong>High</strong></div>
        </Panel>
        <FollowConfirmation paused={paused} onToggle={() => setPaused((value) => !value)} />
        <footer className={styles.followFooter}>
          <span>First created May 1, 2025 · Last meaningful change 8 min ago</span>
          <Action arrow onClick={() => navigate("return")}>See what changed</Action>
        </footer>
      </div>
    </SceneFrame>
  );
}

function ReturnScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  return (
    <SceneFrame scene="return" navigate={navigate}>
      <MobileSceneHeader scene="return" onBack={() => navigate("follow")} />
      <div className={styles.appScene}>
        <header className={styles.returnHeader}>
          <span className={styles.sunMark} aria-hidden="true">☼</span>
          <div><h1 data-scene-heading tabIndex={-1}>Good morning, Alex.</h1><p>Discovery learned <strong>3 meaningful things</strong> while you were away.</p></div>
        </header>
        <section className={styles.returnChanges} aria-label="What Discovery learned">
          <h2 className={styles.srOnly}>What Discovery learned</h2>
          {alphaFixture.changes.slice(0, 3).map((change) => (
            <ChangeCard
              key={change.id}
              change={change}
              onAction={() => navigate(change.kind === "learning" ? "plan" : "understand")}
            />
          ))}
        </section>
        <section className={styles.followedSection} aria-labelledby="followed-return-title">
          <Eyebrow><span id="followed-return-title">Understandings you’re following</span></Eyebrow>
          <div>
            {alphaFixture.relationships.slice(0, 3).map((relationship, index) => (
              <RelationshipRow
                key={relationship.id}
                relationship={{
                  ...relationship,
                  description: `${["Moderate", "Early", "Early"][index]} confidence · ${[81, 64, 58][index]}%`,
                }}
              />
            ))}
          </div>
        </section>
        <Panel tone="violet" className={styles.askBanner}>
          <Sparkles size={26} aria-hidden="true" />
          <div><h2>Ask Discovery anything</h2><p>Continue the inquiry or explore something new.</p></div>
          <Action onClick={() => navigate("home")}>Continue to Home <Plus size={18} aria-hidden="true" /></Action>
        </Panel>
      </div>
    </SceneFrame>
  );
}

function HomeScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  return (
    <SceneFrame scene="home" navigate={navigate}>
      <MobileSceneHeader scene="home" />
      <div className={styles.appScene}>
        <header className={styles.homeHeader}>
          <span className={styles.sunMark} aria-hidden="true">☼</span>
          <div><h1 data-scene-heading tabIndex={-1}>Good morning, Shalini.</h1><p>Discovery learned <strong>3 meaningful things</strong> while you were away.</p></div>
          <Action tone="secondary"><Settings size={17} aria-hidden="true" /> Customize home</Action>
        </header>
        <div className={styles.homeLead}>
          <article className={styles.heroLearning}>
            <Eyebrow tone="violet">Most important learning</Eyebrow>
            <div>
              <span className={`${styles.changeIcon} ${styles.tone_green}`}><TrendingUp size={30} aria-hidden="true" /></span>
              <div><h2>Engineering Productivity<br />Confidence increased.</h2><p>Ownership ambiguity now appears across 12 additional initiatives.</p><Action tone="secondary" arrow onClick={() => navigate("return")}>See what changed</Action></div>
              <Sparkline tone="green" label="Engineering Productivity confidence strengthened" />
            </div>
            <footer>
              <span>Impact on Understanding <strong>High</strong></span>
              <span><strong>Moderate confidence</strong> · 81% · increased by 7 points</span>
            </footer>
          </article>
          <Panel className={styles.recentChanges}>
            <div className={styles.sectionHeading}><Eyebrow>Recent changes</Eyebrow><button type="button" onClick={() => navigate("return")}>View all</button></div>
            <p><TrendingUp size={17} aria-hidden="true" /> Confidence increased in Engineering Productivity</p>
            <p><AlertTriangle size={17} aria-hidden="true" /> New contradiction emerged</p>
            <p><GitBranch size={17} aria-hidden="true" /> Product Prioritization became strongly related</p>
          </Panel>
        </div>
        <section className={styles.homeSecondary} aria-labelledby="other-learning-title">
          <h2 className={styles.sectionLabel} id="other-learning-title">Other key learnings</h2>
          <div>
            {alphaFixture.changes.slice(1, 4).map((change) => (
              <ChangeCard key={change.id} change={change} compact onAction={() => navigate(change.kind === "learning" ? "plan" : "understand")} />
            ))}
          </div>
        </section>
        <section className={styles.followedSection} aria-labelledby="followed-home-title">
          <div className={styles.sectionHeading}><Eyebrow><span id="followed-home-title">Understandings you’re following</span></Eyebrow><button type="button">View all</button></div>
          <div className={styles.followedCards}>
            {alphaFixture.relationships.slice(0, 3).map((relationship, index) => (
              <article key={relationship.id}>
                <div><span className={`${styles.semanticIcon} ${styles[`tone_${relationship.tone}`]}`}><GitBranch size={18} aria-hidden="true" /></span><strong>{relationship.title}</strong></div>
                <span><b>{["Moderate", "Early", "Early"][index]}</b> confidence · {[81, 64, 58][index]}% · +{[7, 4, 2][index]} pts</span>
                <Sparkline tone={relationship.tone} label={`${relationship.title} trend`} />
              </article>
            ))}
          </div>
        </section>
        <Panel tone="violet" className={styles.askBanner}>
          <Sparkles size={28} aria-hidden="true" />
          <div><h2>What should we understand next?</h2><p>Ask Discovery anything about your organization.</p></div>
          <Action onClick={() => navigate("ask")}>Ask Discovery <Plus size={18} aria-hidden="true" /></Action>
        </Panel>
      </div>
    </SceneFrame>
  );
}

function SceneFrame({
  scene,
  navigate,
  children,
}: {
  scene: AlphaScene;
  navigate: (scene: AlphaScene) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.appFrame}>
      <a className={styles.skipLink} href="#alpha-main">Skip to main content</a>
      <AlphaSidebar scene={scene} navigate={navigate} />
      <main id="alpha-main" className={styles.appMain}>{children}</main>
    </div>
  );
}

export default function AlphaExperience({ initialScene }: { initialScene: AlphaScene }) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  const navigate = (scene: AlphaScene) => {
    router.push(`/alpha/${scene}`);
  };

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>("[data-scene-heading]");
    heading?.focus();
    setAnnouncement(`${sceneLabels[initialScene].label}: ${sceneLabels[initialScene].description}`);
  }, [initialScene]);

  const scene = (() => {
    switch (initialScene) {
      case "ask": return <AskScene navigate={navigate} />;
      case "orient": return <OrientScene navigate={navigate} />;
      case "plan": return <PlanScene navigate={navigate} />;
      case "learn": return <LearnScene navigate={navigate} />;
      case "understand": return <UnderstandScene navigate={navigate} />;
      case "respond": return <RespondScene navigate={navigate} />;
      case "follow": return <FollowScene navigate={navigate} />;
      case "return": return <ReturnScene navigate={navigate} />;
      case "home": return <HomeScene navigate={navigate} />;
    }
  })();

  return (
    <div className={styles.alphaRoot}>
      <p className={styles.srOnly} aria-live="polite">{announcement}</p>
      {scene}
    </div>
  );
}
