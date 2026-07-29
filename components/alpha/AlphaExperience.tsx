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
  Clock3,
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
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { alphaFixture } from "../../product/alpha/fixtures";
import { alphaScenes } from "../../product/alpha/viewModels";
import type {
  AlphaScene,
  AlphaFixture,
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
import UnderstandingDisclosure from "./UnderstandingDisclosure";
import styles from "./AlphaExperience.module.css";

const AlphaExperienceContext = createContext<{
  experience: AlphaFixture;
  hosted: boolean;
  sessionControl?: ReactNode;
}>({
  experience: alphaFixture,
  hosted: false,
});

function useAlphaExperience() {
  return useContext(AlphaExperienceContext);
}

function expectedContribution(experience: AlphaFixture): string {
  const gain = experience.understanding.evidenceRequestDisclosure?.request
    ?.expectedConfidenceGain;
  return typeof gain === "number" ? `${gain} points` : "Unavailable";
}

function boundedCurrentAnswer(synthesis: string): string {
  const sentenceEnd = [". ", "? ", "! "]
    .map((separator) => synthesis.indexOf(separator))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right)[0];
  return sentenceEnd === undefined
    ? synthesis
    : synthesis.slice(0, sentenceEnd + 1);
}

const sceneLabels: Record<AlphaScene, { label: string; description: string }> = {
  home: { label: "Home", description: "Open the active question" },
  questions: { label: "Questions", description: "Review organizational questions" },
  decisions: { label: "Decisions", description: "Evaluate possible decisions" },
  history: { label: "History", description: "Review what changed" },
  ask: { label: "Ask", description: "Begin with a question" },
  orient: { label: "Orient", description: "Review objective and scope" },
  plan: { label: "Plan", description: "Review learning plan" },
  learn: { label: "Learn", description: "Watch Discovery learn" },
  understand: { label: "Understand", description: "See the current synthesis" },
  respond: { label: "Respond", description: "Share your perspective" },
  follow: { label: "Follow", description: "Keep learning" },
  return: { label: "Return", description: "See what changed" },
};

const primaryNavigation: Array<{
  scene: AlphaScene;
  label: string;
  icon: typeof Home;
}> = [
  { scene: "home", label: "Home", icon: Home },
  { scene: "questions", label: "Questions", icon: MessageCircleQuestion },
  { scene: "decisions", label: "Decisions", icon: ListChecks },
  { scene: "history", label: "History", icon: Clock3 },
];

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
  const { experience, hosted, sessionControl } = useAlphaExperience();
  return (
    <aside className={styles.sidebar}>
      <DiscoveryMark />
      <nav aria-label="Alpha journey">
        {(hosted ? primaryNavigation : []).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.scene}
              type="button"
              className={scene === item.scene ? styles.navActive : ""}
              aria-current={scene === item.scene ? "page" : undefined}
              onClick={() => navigate(item.scene)}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {!hosted && (
          <>
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
          </>
        )}
        {!hosted && journeyNavigation.map((item) => (
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
      {sessionControl && (
        <div className={styles.hostedSessionControl}>{sessionControl}</div>
      )}
      <div className={styles.sidebarProfile}>
        <span className={styles.avatar} aria-hidden="true">SR</span>
        <span><strong>{experience.user.name}</strong><small>{hosted ? "Organization member" : experience.user.role}</small></span>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
      <div className={styles.sidebarConfidence}>
        <span>Confidence boundary</span>
        <strong>
          {experience.understanding.confidence.qualitative ??
            (hosted ? "Authority-qualified" : "Unavailable")}
        </strong>
        <small>
          {experience.understanding.confidence.value === null
            ? hosted
              ? "See the active question"
              : "Not quantitatively disclosed"
            : `${experience.understanding.confidence.value}%`}
        </small>
      </div>
      <p className={styles.sidebarPrivacy}>
        <ShieldCheck size={16} aria-hidden="true" />
        {hosted ? "Discovery sandbox · read-only" : "Alpha prototype · deterministic fixture"}
      </p>
      {!hosted && <LockPrototypeAction />}
    </aside>
  );
}

function MobileSceneHeader({
  scene,
  navigate,
  onBack,
}: {
  scene: AlphaScene;
  navigate: (scene: AlphaScene) => void;
  onBack?: () => void;
}) {
  const { hosted } = useAlphaExperience();
  return (
    <header className={styles.mobileHeader}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
      ) : (
        <span className={styles.mobileMenuMark} aria-hidden="true">
          <Menu size={20} />
        </span>
      )}
      <label>
        <span className={styles.srOnly}>Discovery scene</span>
        <select
          aria-label="Discovery scene"
          value={scene}
          onChange={(event) => navigate(event.target.value as AlphaScene)}
        >
          {(hosted ? primaryNavigation.map((item) => item.scene) : alphaScenes).map((item) => (
            <option key={item} value={item}>
              {item === "home" ? "Discovery Home" : sceneLabels[item].label}
            </option>
          ))}
        </select>
      </label>
      {hosted ? <DiscoveryMark compact /> : <LockPrototypeAction compact />}
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
  const { experience, hosted } = useAlphaExperience();
  const [editing, setEditing] = useState(false);
  const [objective, setObjective] = useState(experience.understanding.objective);
  const currentAnswer = boundedCurrentAnswer(objective);
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
            <h2>{experience.understanding.originalQuestion}</h2>
          </div>
        </Panel>
        <Panel tone="blue" className={styles.objectivePanel}>
          <span className={styles.orbitIcon} aria-hidden="true">✦</span>
          <div>
            <Eyebrow>My current understanding</Eyebrow>
            {editing && !hosted ? (
              <label>
                <span className={styles.srOnly}>Understanding objective</span>
                <textarea
                  value={objective}
                  onChange={(event) => setObjective(event.target.value)}
                  autoFocus
                />
              </label>
            ) : (
              <h2>{hosted ? currentAnswer : objective}</h2>
            )}
            <p>
              {hosted
                ? "This is the current answer available for your organization."
                : "This focuses on the factors limiting delivery speed and consistency across teams and projects."}
            </p>
          </div>
          {!hosted && (
            <button
              className={styles.inlineLink}
              type="button"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? "Save" : "Edit"}
            </button>
          )}
        </Panel>
        <SemanticCallout title="The biggest thing I don’t understand yet" tone="orange" icon="unknown">
          <h2>{experience.understanding.primaryUnknown}</h2>
          <p>Understanding this could change how we think about the real constraint.</p>
        </SemanticCallout>
        <section className={styles.strategySummary} aria-labelledby="strategy-title">
          <Eyebrow><span id="strategy-title">To answer this, I’ll start by examining</span></Eyebrow>
          <div>
            {experience.sources.map((source) => (
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
        <Action arrow onClick={() => navigate("plan")}>
          {hosted ? "Review learning plan" : "Begin Learning"}
        </Action>
        <PrivacyNote />
      </div>
    </main>
  );
}

function PlanScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
  const [sources, setSources] = useState(experience.sources);
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
          <Eyebrow>{experience.understanding.title} · Living Understanding</Eyebrow>
          <h1 data-scene-heading tabIndex={-1}>Here’s how I’ll learn.</h1>
          <p>The smallest set of information I expect will most improve my understanding.</p>
        </header>
        <Panel className={styles.confidenceProjection}>
          <span>
            <small>Current confidence</small>
            <strong>{hosted ? "Unavailable" : "Early"}</strong>
          </span>
          <span className={styles.dottedArrow} aria-hidden="true">·········· →</span>
          <span>
            <small>Expected after learning</small>
            <strong>{hosted ? "Unavailable" : "Moderate"}</strong>
          </span>
        </Panel>
        <section className={styles.planUnknown}>
          <CircleHelp size={25} aria-hidden="true" />
          <div>
            <Eyebrow>The biggest thing I still don’t understand</Eyebrow>
            <h2>{experience.understanding.primaryUnknown}</h2>
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
                    <b>
                      {hosted
                        ? expectedContribution(experience)
                        : source.contribution ?? "Unavailable"}
                    </b>
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleSource(source.id)}
                    disabled={hosted}
                    title={hosted ? "Source changes are not yet supported in this sandbox" : undefined}
                  >
                    {source.state} <ChevronDown size={15} aria-hidden="true" />
                  </button>
                </article>
              ))}
              <button
                className={styles.addSource}
                type="button"
                disabled={hosted}
                title={hosted ? "Adding information is not yet supported in this sandbox" : undefined}
              >
                <Plus size={20} aria-hidden="true" />
                <span><strong>Something Discovery should also consider?</strong><small>Add a source, context, or file.</small></span>
                <span>{hosted ? "Not yet available" : "Add information"}</span>
              </button>
            </div>
          </section>
          <Panel className={styles.protectionPanel}>
            <ShieldCheck size={22} aria-hidden="true" />
            <h3>Your information is bounded</h3>
            <p>{hosted ? "This read-only plan uses only information currently available for this organization." : "This prototype uses only its deterministic fixture and your local selections."}</p>
          </Panel>
        </div>
        <footer className={styles.planFooter}>
          <Action
            tone="secondary"
            disabled={hosted}
            title={hosted ? "Saving plans is not yet supported in this sandbox" : undefined}
          >
            {hosted ? "Save plan · Not yet available" : "Save plan for later"}
          </Action>
          <span><ShieldCheck size={15} aria-hidden="true" /> You approve each source state.</span>
          <Action arrow onClick={() => navigate("learn")}>
            {hosted ? "Review learning history" : "Start learning"}
          </Action>
        </footer>
      </div>
    </main>
  );
}

function LearnScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
  const [visibleEvents, setVisibleEvents] = useState(3);
  const events = experience.events.slice(0, visibleEvents);
  const currentAnswer = boundedCurrentAnswer(
    experience.understanding.synthesis,
  );
  return (
    <SceneFrame scene="learn" navigate={navigate}>
      <MobileSceneHeader scene="learn" navigate={navigate} onBack={() => navigate("plan")} />
      <div className={styles.appScene}>
        <header className={styles.appSceneHeader}>
          <div>
            <button className={styles.textAction} type="button" onClick={() => navigate("plan")}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to plan
            </button>
            <h1 data-scene-heading tabIndex={-1}>
              Discovery is learning{" "}
              <span className={styles.liveState}>
                {hosted ? "Available history" : "● In progress"}
              </span>
            </h1>
            <p>{hosted ? "Review the learning history currently available for this organization." : "I’m reviewing the approved fixture and updating the Understanding through meaningful events."}</p>
          </div>
          <Action
            tone="secondary"
            disabled={hosted}
            title={hosted ? "Learning guidance is not yet available in this sandbox" : undefined}
          >
            {hosted ? "Learning guidance · Not yet available" : "How learning works"}
          </Action>
        </header>
        <Panel tone="blue" className={styles.learningCanvas}>
          <div className={styles.learningCanvasHead}>
            <Eyebrow>{experience.understanding.title} · Learning history</Eyebrow>
            <span>{hosted ? "Read-only view" : "Live view"} <ChevronDown size={15} aria-hidden="true" /></span>
          </div>
          <div className={styles.liveSynthesis}>
            <span>Current answer</span>
            <h2>
              {hosted
                ? currentAnswer
                : experience.understanding.synthesis}
            </h2>
            {!hosted && (
              <p className={styles.currentExplanation}>
                {experience.understanding.explanation}
              </p>
            )}
            <p className={styles.learningConfidence}>
              <strong>{experience.understanding.confidence.qualitative ?? "Unavailable"}</strong>
              <span>
                {experience.understanding.confidence.value === null
                  ? "A scalar score and trend are not disclosed"
                  : `${experience.understanding.confidence.value}%`}
              </span>
            </p>
          </div>
          {!hosted && (
            <>
              <EvolutionGraph />
              <DirectionSummary />
            </>
          )}
        </Panel>
        <div className={styles.learningGrid}>
          <section className={styles.eventsPanel} aria-labelledby="events-title">
            <div className={styles.sectionHeading}>
              <h2 id="events-title">Recent learning events</h2>
              <span className={styles.liveState}>
                {hosted ? "Available history" : "● Fixture sequence"}
              </span>
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
            {visibleEvents < experience.events.length && (
              <Action tone="secondary" arrow onClick={() => setVisibleEvents(experience.events.length)}>
                View all events ({experience.events.length})
              </Action>
            )}
          </section>
          <Panel className={styles.nextLearning}>
            <h2><Sparkles size={20} aria-hidden="true" /> {hosted ? "Learning availability" : "What I’m doing next"}</h2>
            {hosted ? (
              <p>Future learning operations are not yet available in this Alpha. This view does not start or queue work.</p>
            ) : (
              <>
                <p>I’m continuing to deepen the evidence around ownership ambiguity after commitment.</p>
                <ul>
                  <li>Reviewing project history <span>In progress</span></li>
                  <li>Examining team conversations <span>Queued</span></li>
                  <li>Comparing planning documents <span>Queued</span></li>
                </ul>
              </>
            )}
          </Panel>
        </div>
        <Panel tone="blue" className={styles.readyBanner}>
          <Sparkles size={24} aria-hidden="true" />
          <div>
            <h2>{hosted ? "Review the current understanding." : "I’m forming the first useful synthesis."}</h2>
            <p>{hosted ? "Nothing durable changes from this read-only scene." : "I’ll continue refining it as learning progresses."}</p>
          </div>
          <Action arrow onClick={() => navigate("understand")}>View the Understanding</Action>
        </Panel>
      </div>
    </SceneFrame>
  );
}

function UnderstandScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
  const currentAnswer = boundedCurrentAnswer(
    experience.understanding.synthesis,
  );
  const details = [
    ["why", "Why this matters", experience.understanding.whyItMatters, "green"],
    ["strongest", hosted ? "Current explanation" : "Strongest explanation", experience.understanding.strongestExplanation, "violet"],
    ["unknown", "Largest remaining unknown", experience.understanding.primaryUnknown, "blue"],
    ["contradiction", "Key contradiction", experience.understanding.contradiction, "orange"],
  ] as const;
  return (
    <SceneFrame scene="understand" navigate={navigate}>
      <MobileSceneHeader scene="understand" navigate={navigate} onBack={() => navigate("learn")} />
      <div className={styles.appScene}>
        <header className={styles.understandingTitle}>
          <button className={styles.textAction} type="button" onClick={() => navigate("home")}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to understandings
          </button>
          <div>
            <span className={styles.titleIcon}>
              {hosted ? <Lightbulb size={32} aria-hidden="true" /> : <TrendingUp size={32} aria-hidden="true" />}
            </span>
            <div>
              <Eyebrow>Original question</Eyebrow>
              <h1 data-scene-heading tabIndex={-1}>
                {experience.understanding.originalQuestion}
              </h1>
              <span className={styles.livingBadge}>Living Understanding</span>
              <p>{experience.understanding.title}</p>
            </div>
          </div>
          <Action tone="secondary" onClick={() => navigate("follow")}>Follow this Understanding</Action>
        </header>
        <UnderstandingDisclosure
          basis={experience.understanding.beliefBasis}
          changeDisclosure={experience.understanding.changeDisclosure}
          evidenceRequestDisclosure={
            experience.understanding.evidenceRequestDisclosure
          }
          fullSynthesis={experience.understanding.synthesis}
          details={details}
        >
          {({
            trigger,
            disclosure,
            changeTrigger,
            changeDisclosure,
            evidenceRequestTrigger,
            evidenceRequestDisclosure,
            fullSynthesisTrigger,
            fullSynthesisDisclosure,
            detailGrid,
          }) => (
            <>
              <section
                className={styles.answerFirst}
                aria-label="Current organizational understanding"
              >
                <Panel tone="green" className={styles.currentAnswerPanel}>
                  <Eyebrow>Current answer</Eyebrow>
                  <h2>{currentAnswer}</h2>
                </Panel>
                <Panel className={styles.answerFirstContext}>
                  <div>
                    <Eyebrow>Remaining uncertainty</Eyebrow>
                    <p>{experience.understanding.primaryUnknown}</p>
                  </div>
                  <div>
                    <Eyebrow tone="violet">Next learning opportunity</Eyebrow>
                    <p>
                      {experience.sources[0]?.title ??
                        "No additional inquiry is currently authorized."}
                    </p>
                    {experience.understanding.beliefBasis?.nextInquiry && (
                      <small>
                        {experience.understanding.beliefBasis.nextInquiry
                          .scopeLabel}
                      </small>
                    )}
                    <small>
                      Expected contribution:{" "}
                      <strong>{expectedContribution(experience)}</strong>
                    </small>
                  </div>
                </Panel>
                <div className={styles.answerFirstDisclosures}>
                  {trigger}
                  {hosted && changeTrigger}
                  {hosted && evidenceRequestTrigger}
                  {fullSynthesisTrigger}
                </div>
              </section>
              {disclosure}
              {changeDisclosure}
              {evidenceRequestDisclosure}
              {fullSynthesisDisclosure}
              {!hosted && (
                <Panel className={styles.supportingSummary}>
                  <div>
                    <Eyebrow>Supporting detail</Eyebrow>
                    <p>{experience.understanding.explanation}</p>
                    <span>Updated today · 8:12 AM</span>
                  </div>
                  <ConfidenceSummary confidence={experience.understanding.confidence} />
                </Panel>
              )}
              {detailGrid}
              <div className={styles.understandingLower}>
                <Panel className={styles.beforeAfter}>
                  <h2>How this Understanding changed</h2>
                  {hosted ? (
                    <>
                      <p>{experience.changes[0]?.headline ?? "Evolution availability is described in the disclosure."}</p>
                    </>
                  ) : (
                    <div><span><small>Before</small>Planning and execution appeared equally plausible.</span><ArrowRight aria-hidden="true" /><span><small>Now</small>Ownership ambiguity is the strongest explanation.</span></div>
                  )}
                  {hosted ? <p>Quantitative evolution is unavailable.</p> : <EvolutionGraph early={62} current={74} />}
                </Panel>
                <Panel className={styles.relationshipsPanel}>
                  <div className={styles.sectionHeading}><h2>Related Understandings</h2><button type="button">View all</button></div>
                  {experience.relationships
                    .filter(
                      (relationship) =>
                        !hosted ||
                        boundedCurrentAnswer(relationship.title) !==
                          currentAnswer,
                    )
                    .slice(0, 3)
                    .map((relationship) => (
                    <RelationshipRow
                      key={relationship.id}
                      relationship={
                        hosted
                          ? {
                              ...relationship,
                              title: boundedCurrentAnswer(relationship.title),
                              description: "Related projected understanding",
                            }
                          : relationship
                      }
                      showTrend={!hosted}
                    />
                  ))}
                </Panel>
                <Panel tone="violet" className={styles.recommendedLearning}>
                  <Eyebrow tone="violet">Next recommended learning</Eyebrow>
                  <h2>{hosted ? experience.sources[0]?.title ?? "Not yet available in this Alpha" : "Compare decision practices in the consistently delivering team."}</h2>
                  <p>
                    Expected contribution:{" "}
                    <strong>
                      {hosted
                        ? expectedContribution(experience)
                        : "High"}
                    </strong>
                  </p>
                  <button className={styles.inlineLink} type="button" onClick={() => navigate("plan")}>See learning plan <ArrowRight size={16} aria-hidden="true" /></button>
                </Panel>
              </div>
            </>
          )}
        </UnderstandingDisclosure>
        <footer className={styles.understandingFooter}>
          <span>{hosted ? "Creation and change timing unavailable" : "First created May 1, 2025 · Last meaningful change today · 8:12 AM"}</span>
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
  const { experience, hosted } = useAlphaExperience();
  const [selected, setSelected] = useState<ResponsePathViewModel["id"]>("agree");
  const [context, setContext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const selectedPath = experience.responsePaths.find((path) => path.id === selected)!;
  return (
    <SceneFrame scene="respond" navigate={navigate}>
      <MobileSceneHeader scene="respond" navigate={navigate} onBack={() => navigate("understand")} />
      <div className={styles.appScene}>
        <header className={styles.appSceneHeader}>
          <div>
            <button className={styles.textAction} type="button" onClick={() => navigate("understand")}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to understand
            </button>
            <Eyebrow>{experience.understanding.title} · Living Understanding</Eyebrow>
            <h1 data-scene-heading tabIndex={-1}>
              {hosted ? "Review ways to respond" : "Help Discovery get this right"}
            </h1>
            <p>
              {hosted
                ? "Response options are shown for review. This sandbox does not submit or retain a response."
                : "Your perspective can qualify or deepen this Understanding."}
            </p>
          </div>
        </header>
        <Panel tone="violet" className={styles.responsePanel}>
          <h2>How does this Understanding compare with what you’ve seen?</h2>
          <p>Choose the response that best represents your perspective.</p>
          <div className={styles.responsePaths} role="radiogroup" aria-label="Response path">
            {experience.responsePaths.map((path) => (
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
                {(!hosted || selected === path.id) && (
                  <p>{path.description}</p>
                )}
              </button>
            ))}
          </div>
        </Panel>
        {!hosted && (
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
        )}
        {hosted ? (
          <Panel tone="violet" className={styles.responseEffect}>
            <span className={styles.semanticIcon}>
              <Search size={22} aria-hidden="true" />
            </span>
            <div>
              <h3>Response submission is not yet supported</h3>
              <p>Your selection remains in this page only and does not change organizational understanding.</p>
            </div>
          </Panel>
        ) : (
          <ResponseEffect submitted={submitted} pathTitle={selectedPath.title} />
        )}
        <footer className={styles.responseFooter}>
          <button className={styles.inlineLink} type="button" onClick={() => navigate("follow")}>Skip for now</button>
          <Action
            arrow
            onClick={() => {
              if (hosted || submitted) navigate("follow");
              else setSubmitted(true);
            }}
          >
            {hosted ? "Continue" : submitted ? "Continue to Follow" : "Submit my response"}
          </Action>
        </footer>
      </div>
    </SceneFrame>
  );
}

function FollowScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
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
      <MobileSceneHeader scene="follow" navigate={navigate} onBack={() => navigate("respond")} />
      <div className={styles.appScene}>
        <header className={styles.followHeader}>
          <button className={styles.textAction} type="button" onClick={() => navigate("respond")}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to respond
          </button>
          <h1 data-scene-heading tabIndex={-1}>Following {experience.understanding.title} <span className={styles.livingBadge}>{paused ? "Paused" : hosted ? "Read-only" : "Active"}</span></h1>
          <p>{hosted ? "Follow persistence is not yet available in this Alpha." : "Discovery will keep learning through this deterministic prototype and surface only meaningful change."}</p>
        </header>
        <Panel tone="violet" className={styles.followMeaning}>
          <span className={styles.followOrb} aria-hidden="true">✦</span>
          <div><h2>What following means</h2><p>Discovery preserves the current Understanding, challenges assumptions, and shows meaningful changes over time.</p></div>
          {!hosted && <Sparkline tone="violet" label="Illustrative path of continued Understanding evolution" />}
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
            {experience.relationships.map((relationship) => (
              <RelationshipRow
                key={relationship.id}
                relationship={
                  hosted
                    ? {
                        ...relationship,
                        title: boundedCurrentAnswer(relationship.title),
                        description: "Related projected understanding",
                      }
                    : relationship
                }
                showTrend={!hosted}
              />
            ))}
          </Panel>
        </div>
        <Panel className={styles.nextLikely}>
          <Target size={30} aria-hidden="true" />
          <div><Eyebrow>{hosted ? "Available next inquiry" : "Next likely learning"}</Eyebrow><h2>{hosted ? experience.sources[0]?.title ?? "No additional inquiry is currently available." : "Compare the consistently delivering team with the rest of Engineering."}</h2><p>{hosted ? "This is the next learning opportunity currently available for this organization." : "This comparison could materially qualify the current explanation."}</p></div>
          <div>
            <small>Expected contribution</small>
            <strong>
              {hosted ? expectedContribution(experience) : "High"}
            </strong>
          </div>
        </Panel>
        {hosted ? (
          <Panel tone="green" className={styles.followConfirmation}>
            <span className={styles.followCheck}><PauseCircle size={24} aria-hidden="true" /></span>
            <div>
              <strong>Follow controls are not yet available</strong>
              <p>This read-only scene does not create notifications or change a saved follow state.</p>
            </div>
          </Panel>
        ) : (
          <FollowConfirmation paused={paused} onToggle={() => setPaused((value) => !value)} />
        )}
        <footer className={styles.followFooter}>
          <span>{hosted ? "Creation and change timing unavailable" : "First created May 1, 2025 · Last meaningful change 8 min ago"}</span>
          <Action arrow onClick={() => navigate("return")}>See what changed</Action>
        </footer>
      </div>
    </SceneFrame>
  );
}

function ReturnScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
  return (
    <SceneFrame scene="return" navigate={navigate}>
      <MobileSceneHeader scene="return" navigate={navigate} onBack={() => navigate("follow")} />
      <div className={styles.appScene}>
        <header className={styles.returnHeader}>
          <span className={styles.sunMark} aria-hidden="true">☼</span>
          <div><h1 data-scene-heading tabIndex={-1}>{experience.organization.name}</h1><p>Review the meaningful changes currently available.</p></div>
        </header>
        <section className={styles.returnChanges} aria-label="What Discovery learned">
          <h2 className={styles.srOnly}>What Discovery learned</h2>
          {experience.changes.slice(0, 3).map((change) => (
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
            {experience.relationships.slice(0, 3).map((relationship, index) => (
              <RelationshipRow
                key={relationship.id}
                relationship={{
                  ...relationship,
                  title: hosted
                    ? boundedCurrentAnswer(relationship.title)
                    : relationship.title,
                  description: hosted
                    ? "Related projected understanding · Confidence unavailable"
                    : `${["Moderate", "Early", "Early"][index]} confidence · ${[81, 64, 58][index]}%`,
                }}
                showTrend={!hosted}
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

function AddInformationPanel() {
  const { experience } = useAlphaExperience();
  const router = useRouter();
  const operational = experience.organization.id.startsWith("onb-dev-");

  return (
    <Panel tone="violet" className={styles.addInformationPanel}>
      <div>
        <Eyebrow>Improve understanding</Eyebrow>
        <h2>Add information</h2>
        <p>
          Add an observation, another perspective, a measurement, or an
          outcome to the same question.
        </p>
      </div>
      {!operational ? (
        <p className={styles.readOnlyNotice}>
          Adding information is available only in the isolated onboarding
          sandbox. This organization remains read-only.
        </p>
      ) : (
        <Action
          onClick={() => {
            const search = new URLSearchParams({
              mode: "improve",
              organizationId: experience.organization.id,
            });
            router.push(`/onboarding?${search.toString()}`);
          }}
        >
          Add information
        </Action>
      )}
      <small>
        Connected systems, surveys, reports, and stakeholder requests are
        coming later.
      </small>
    </Panel>
  );
}

function QuestionsScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience } = useAlphaExperience();
  const currentAnswer = boundedCurrentAnswer(experience.understanding.synthesis);
  return (
    <SceneFrame scene="questions" navigate={navigate}>
      <MobileSceneHeader scene="questions" navigate={navigate} />
      <div className={styles.appScene}>
        <header className={styles.baselineHeader}>
          <Eyebrow>Questions</Eyebrow>
          <h1 data-scene-heading tabIndex={-1}>What are we trying to understand?</h1>
          <p>The active question is the center of Discovery’s learning loop.</p>
        </header>
        <Panel className={styles.questionListItem}>
          <div>
            <Eyebrow>Active question</Eyebrow>
            <h2>{experience.understanding.originalQuestion}</h2>
            <p>{currentAnswer}</p>
            <small>
              {experience.understanding.confidence.qualitative
                ? `${experience.understanding.confidence.qualitative} confidence`
                : experience.understanding.confidence.limitation}
            </small>
          </div>
          <Action onClick={() => navigate("home")}>Open question</Action>
        </Panel>
        <Panel className={styles.truthfulState}>
          <h2>Ask a new question</h2>
          <p>
            Creating another durable question is not yet available from this
            active product view. The current question and organization remain
            unchanged.
          </p>
        </Panel>
      </div>
    </SceneFrame>
  );
}

function DecisionsScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience } = useAlphaExperience();
  return (
    <SceneFrame scene="decisions" navigate={navigate}>
      <MobileSceneHeader scene="decisions" navigate={navigate} />
      <div className={styles.appScene}>
        <header className={styles.baselineHeader}>
          <Eyebrow>Decisions</Eyebrow>
          <h1 data-scene-heading tabIndex={-1}>What could we do?</h1>
          <p>{experience.understanding.originalQuestion}</p>
        </header>
        <Panel className={styles.truthfulState}>
          <Eyebrow>Current decision state</Eyebrow>
          <h2>No decisions have been connected to this understanding yet.</h2>
          <p>
            Discovery does not yet have enough authorized supported
            information in this view to recommend a decision.
          </p>
          <Action onClick={() => navigate("home")}>Improve understanding</Action>
        </Panel>
        <Action tone="secondary" onClick={() => navigate("understand")}>
          Review the understanding behind this decision
        </Action>
      </div>
    </SceneFrame>
  );
}

function HistoryScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience } = useAlphaExperience();
  return (
    <SceneFrame scene="history" navigate={navigate}>
      <MobileSceneHeader scene="history" navigate={navigate} />
      <div className={styles.appScene}>
        <header className={styles.baselineHeader}>
          <Eyebrow>History</Eyebrow>
          <h1 data-scene-heading tabIndex={-1}>How has the understanding changed?</h1>
          <p>{experience.understanding.originalQuestion}</p>
        </header>
        <section className={styles.historyList} aria-label="Understanding history">
          {experience.changes.length ? (
            experience.changes.map((change) => (
              <Panel key={change.id}>
                <Eyebrow>{change.eyebrow}</Eyebrow>
                <h2>{change.headline}</h2>
                <p>{change.detail}</p>
              </Panel>
            ))
          ) : (
            <Panel className={styles.truthfulState}>
              <h2>No meaningful understanding change is available yet.</h2>
            </Panel>
          )}
        </section>
        <Action tone="secondary" onClick={() => navigate("understand")}>
          Review full organizational analysis
        </Action>
      </div>
    </SceneFrame>
  );
}

function HomeScene({ navigate }: { navigate: (scene: AlphaScene) => void }) {
  const { experience, hosted } = useAlphaExperience();
  const currentAnswer = boundedCurrentAnswer(experience.understanding.synthesis);
  const nextLearning =
    experience.sources[0]?.title ??
    "No additional inquiry is currently available.";
  return (
    <SceneFrame scene="home" navigate={navigate}>
      <MobileSceneHeader scene="home" navigate={navigate} />
      <div className={styles.appScene}>
        <header className={styles.homeHeader}>
          <span className={styles.sunMark} aria-hidden="true">☼</span>
          <div><h1 data-scene-heading tabIndex={-1}>{experience.organization.name}</h1><p>Your organizational understanding is ready.</p></div>
          <Action tone="secondary" disabled title="Home customization is not yet available in this sandbox"><Settings size={17} aria-hidden="true" /> Customize home · Not yet available</Action>
        </header>
        <div className={styles.homeLead}>
          <article className={`${styles.heroLearning} ${hosted ? styles.hostedHeroLearning : ""}`}>
            <Eyebrow tone="violet">{hosted ? "Original question" : "Most important learning"}</Eyebrow>
            <div>
              <span className={`${styles.changeIcon} ${styles.tone_green}`}>
                {hosted ? <Lightbulb size={30} aria-hidden="true" /> : <TrendingUp size={30} aria-hidden="true" />}
              </span>
              <div>
                <h2>{hosted ? experience.understanding.originalQuestion : experience.understanding.title}</h2>
                <Eyebrow>Current answer</Eyebrow>
                <p>{hosted ? currentAnswer : experience.understanding.synthesis}</p>
                <Action tone="secondary" arrow onClick={() => navigate("understand")}>Open this understanding</Action>
              </div>
              {!hosted && <Sparkline tone="green" label={`${experience.understanding.title} trend`} />}
            </div>
            <footer>
              <span>Remaining uncertainty <strong>{experience.understanding.primaryUnknown}</strong></span>
              <span>Next learning <strong>{nextLearning}</strong></span>
            </footer>
          </article>
          <Panel className={styles.recentChanges}>
            <div className={styles.sectionHeading}><Eyebrow>Recent changes</Eyebrow><button type="button" onClick={() => navigate(hosted ? "history" : "return")}>View all</button></div>
            {hosted ? experience.changes.slice(0, 3).map((change) => (
              <p key={change.id}><Lightbulb size={17} aria-hidden="true" /> {change.headline}</p>
            )) : (
              <>
                <p><TrendingUp size={17} aria-hidden="true" /> {experience.changes[0]?.headline ?? "No meaningful change is currently available"}</p>
                <p><AlertTriangle size={17} aria-hidden="true" /> New contradiction emerged</p>
                <p><GitBranch size={17} aria-hidden="true" /> Product Prioritization became strongly related</p>
              </>
            )}
            <small className={styles.changeAvailability}>
              Impact on understanding:{" "}
              <strong>{experience.changes[0]?.impact ?? "Unavailable"}</strong>
            </small>
          </Panel>
        </div>
        {hosted && <AddInformationPanel />}
        <section className={styles.homeSecondary} aria-labelledby="other-learning-title">
          <h2 className={styles.sectionLabel} id="other-learning-title">{hosted ? "Additional available learnings" : "Other key learnings"}</h2>
          <div>
            {experience.changes.slice(1, 4).map((change) => (
              <ChangeCard key={change.id} change={change} compact onAction={() => navigate(change.kind === "learning" ? "plan" : "understand")} />
            ))}
          </div>
        </section>
        <section className={styles.followedSection} aria-labelledby="followed-home-title">
            <div className={styles.sectionHeading}><Eyebrow><span id="followed-home-title">Related understandings</span></Eyebrow></div>
          <div className={styles.followedCards}>
            {experience.relationships
              .filter(
                (relationship) =>
                  !hosted ||
                  boundedCurrentAnswer(relationship.title) !== currentAnswer,
              )
              .slice(0, 3)
              .map((relationship, index) => (
              <article key={relationship.id}>
                <div><span className={`${styles.semanticIcon} ${styles[`tone_${relationship.tone}`]}`}><GitBranch size={18} aria-hidden="true" /></span><strong>{hosted ? boundedCurrentAnswer(relationship.title) : relationship.title}</strong></div>
                <span>
                  {hosted
                    ? <><b>Confidence unavailable</b> · Trend unavailable</>
                    : <><b>{["Moderate", "Early", "Early"][index]}</b> confidence · {[81, 64, 58][index]}% · +{[7, 4, 2][index]} pts</>}
                </span>
                {!hosted && <Sparkline tone={relationship.tone} label={`${relationship.title} trend`} />}
              </article>
            ))}
          </div>
        </section>
        {!hosted && (
          <Panel tone="violet" className={styles.askBanner}>
            <Sparkles size={28} aria-hidden="true" />
            <div><h2>What should we understand next?</h2><p>Ask Discovery anything about your organization.</p></div>
            <Action onClick={() => navigate("ask")}>Ask Discovery <Plus size={18} aria-hidden="true" /></Action>
          </Panel>
        )}
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

export default function AlphaExperience({
  initialScene,
  experience = alphaFixture,
  hosted = false,
  sessionControl,
}: {
  initialScene: AlphaScene;
  experience?: AlphaFixture;
  hosted?: boolean;
  sessionControl?: ReactNode;
}) {
  const router = useRouter();
  const [activeScene, setActiveScene] = useState(initialScene);
  const [announcement, setAnnouncement] = useState("");

  const navigate = (scene: AlphaScene) => {
    if (hosted) {
      setActiveScene(scene);
      const search = new URLSearchParams({
        organizationId: experience.organization.id,
        scene,
      });
      router.push(`/your-organization?${search.toString()}`);
      return;
    }
    router.push(`/alpha/${scene}`);
  };

  useEffect(() => {
    setActiveScene(initialScene);
  }, [initialScene]);

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>("[data-scene-heading]");
    heading?.focus();
    setAnnouncement(`${sceneLabels[activeScene].label}: ${sceneLabels[activeScene].description}`);
  }, [activeScene]);

  const scene = (() => {
    switch (activeScene) {
      case "questions": return <QuestionsScene navigate={navigate} />;
      case "decisions": return <DecisionsScene navigate={navigate} />;
      case "history": return <HistoryScene navigate={navigate} />;
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
    <AlphaExperienceContext.Provider value={{ experience, hosted, sessionControl }}>
      <div className={styles.alphaRoot}>
        <p className={styles.srOnly} aria-live="polite">{announcement}</p>
        {scene}
      </div>
    </AlphaExperienceContext.Provider>
  );
}
