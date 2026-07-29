import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const alphaPath = "components/alpha/AlphaExperience.tsx";
const disclosurePath = "components/alpha/UnderstandingDisclosure.tsx";
const runtimePath =
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json";

const alpha = readFileSync(alphaPath, "utf8");
const disclosure = readFileSync(disclosurePath, "utf8");
const runtimeBefore = createHash("sha256")
  .update(readFileSync(runtimePath))
  .digest("hex");

function scene(name: string, nextName: string): string {
  const start = alpha.indexOf(`function ${name}Scene`);
  const end = alpha.indexOf(`function ${nextName}Scene`);
  assert.notEqual(start, -1, `${name} scene must exist.`);
  assert.notEqual(end, -1, `${nextName} scene boundary must exist.`);
  return alpha.slice(start, end);
}

const orient = scene("Orient", "Plan");
const learn = scene("Learn", "Understand");
const understand = scene("Understand", "Respond");
const respond = scene("Respond", "Follow");
const follow = scene("Follow", "Return");
const returnScene = scene("Return", "Home");
const homeStart = alpha.indexOf("function HomeScene");
const homeEnd = alpha.indexOf("function SceneFrame");
assert.notEqual(homeStart, -1, "Home scene must exist.");
assert.notEqual(homeEnd, -1, "SceneFrame boundary must exist.");
const home = alpha.slice(homeStart, homeEnd);

const answerPosition = understand.indexOf("<Eyebrow>Current answer</Eyebrow>");
const uncertaintyPosition = understand.indexOf(
  "<Eyebrow>Remaining uncertainty</Eyebrow>",
);
const nextLearningPosition = understand.indexOf(
  '<Eyebrow tone="violet">Next learning opportunity</Eyebrow>',
);
const depthPosition = understand.indexOf("{fullSynthesisTrigger}");
assert.ok(
  answerPosition >= 0 &&
    answerPosition < uncertaintyPosition &&
    uncertaintyPosition < nextLearningPosition &&
    nextLearningPosition < depthPosition,
  "mobile reading order must remain answer, uncertainty, next learning, then depth",
);

assert.ok(
  home.includes(
    "hosted ? currentAnswer : experience.understanding.synthesis",
  ),
  "Home must lead with the exact bounded answer.",
);
assert.ok(
  orient.includes("hosted ? currentAnswer : objective"),
  "Orient must not lead with the full canonical analysis.",
);
assert.ok(
  learn.includes("hosted\n                ? currentAnswer"),
  "Learn must show the bounded current answer in hosted mode.",
);
assert.ok(
  learn.includes("{!hosted && (") &&
    learn.includes("experience.understanding.explanation"),
  "Learn must keep the repeated full explanation out of hosted initial content.",
);
assert.ok(
  understand.includes(
    "fullSynthesis={experience.understanding.synthesis}",
  ),
  "Understand must preserve the canonical synthesis as disclosure input.",
);
assert.ok(
  disclosure.includes("<p>{fullSynthesis}</p>"),
  "Full organizational analysis must remain byte-identical and reachable.",
);
assert.ok(
  understand.includes("{!hosted && (") &&
    understand.includes("className={styles.supportingSummary}"),
  "The hosted scene must not repeat the full explanation outside disclosure.",
);
assert.ok(
  understand.includes(
    "boundedCurrentAnswer(relationship.title) !==\n                          currentAnswer",
  ),
  "Understand must remove an exact duplicate of its lead answer from related content.",
);
assert.ok(
  disclosure.includes("openDetail === id && (") &&
    disclosure.includes("<p>{copy}</p>"),
  "deep detail copy must appear only after expansion.",
);
assert.ok(
  respond.includes("{!hosted && (") &&
    respond.includes("className={styles.contributionPanel}"),
  "hosted read-only Respond must not render a disabled contribution form.",
);
assert.ok(
  respond.includes("!hosted || selected === path.id"),
  "Respond must show only the selected path explanation in hosted mode.",
);
assert.ok(
  respond.includes("Response submission is not yet supported") &&
    respond.includes(
      "does not change organizational understanding",
    ),
  "Respond must retain a concise truthful read-only boundary.",
);
assert.ok(
  home.includes(
    "boundedCurrentAnswer(relationship.title) !== currentAnswer",
  ),
  "Home must remove an exact duplicate of its lead answer from related content.",
);
for (const [name, source] of [
  ["Follow", follow],
  ["Return", returnScene],
] as const) {
  assert.ok(
    source.includes("boundedCurrentAnswer(relationship.title)"),
    `${name} must not repeat the full canonical analysis in relationship rows.`,
  );
}

assert.equal(
  alpha.includes("Coordinationbreakdown") ||
    alpha.includes("Accountabilitygap") ||
    alpha.includes("Duplicatedknowledgework") ||
    alpha.includes("Institutionalmemoryloss"),
  false,
  "active presentation must contain no raw driver labels",
);
assert.equal(
  alpha.includes("condition-coordination") ||
    alpha.includes("condition-decision"),
  false,
  "active presentation must contain no raw condition identifiers",
);

const runtimeAfter = createHash("sha256")
  .update(readFileSync(runtimePath))
  .digest("hex");
assert.equal(runtimeAfter, runtimeBefore, "validation must not mutate Runtime");
assert.equal(
  readFileSync(alphaPath, "utf8"),
  alpha,
  "presentation validation must be deterministic",
);

console.log(JSON.stringify({
  validation: "minimal-reading-experience",
  result: "PASS",
  initialOrder: [
    "question",
    "answer",
    "uncertainty",
    "next-learning",
    "optional-depth",
  ],
  fullCanonicalAnalysisReachable: true,
  fullCanonicalAnalysisChanged: false,
  repeatedHostedSynthesisRemoved: true,
  readOnlyStatesTruthful: true,
  rawIdentifiersVisible: false,
  deterministic: true,
  runtimeMutated: false,
}, null, 2));
