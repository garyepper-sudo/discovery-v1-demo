export const ALPHA_OBSERVABILITY_SCHEMA_VERSION = "1" as const;

export const alphaEventCategories = ["workflow-transition","access-check","protected-load","replay-recovery","health","browser","acceptance","cleanup"] as const;
export const alphaWorkflowStages = ["activate","prepare","private-working","contribute","freeze","reload","capture","review","closure","what-changed","prepare-again","occurrence-2","acceptance","cleanup","health","runtime"] as const;
export const alphaTransitionCategories = ["attempted","completed","intentionally-empty","reconstructed","abstained","replayed","recovered","cleaned"] as const;
export const alphaOutcomeCategories = ["attempted","success","expected-abstention","access-unavailable","incompatible-replay","cas-conflict","browser-failure","server-failure","blocked","pass","fail"] as const;
export const alphaRoleCategories = ["leader","director","manager","unavailable","system","not-applicable"] as const;
export const alphaOccurrenceCategories = ["occurrence-1","occurrence-2","not-applicable"] as const;
export const alphaViewportCategories = ["desktop","narrow","not-applicable"] as const;
export const alphaLatencyBuckets = ["under-100ms","100ms-to-1s","1s-to-5s","over-5s","not-measured"] as const;
export const alphaReplayRecoveryCategories = ["none","exact-replay","incompatible-replay","cas-conflict","recovered"] as const;
export const alphaFailureCategories = ["none","access","browser","server","observer","evidence","cleanup"] as const;
export const alphaBuildCategories = ["development","test","production"] as const;
export const alphaProtectedLoadCategories = ["not-applicable","attempted","authorized","unavailable"] as const;

type ValueOf<T extends readonly string[]> = T[number];
export type AlphaContentSafeObservabilityEventV1 = {
  schemaVersion: typeof ALPHA_OBSERVABILITY_SCHEMA_VERSION;
  eventCategory: ValueOf<typeof alphaEventCategories>;
  workflowStage: ValueOf<typeof alphaWorkflowStages>;
  transitionCategory: ValueOf<typeof alphaTransitionCategories>;
  outcomeCategory: ValueOf<typeof alphaOutcomeCategories>;
  roleCategory: ValueOf<typeof alphaRoleCategories>;
  occurrenceCategory: ValueOf<typeof alphaOccurrenceCategories>;
  viewportCategory: ValueOf<typeof alphaViewportCategories>;
  latencyBucket: ValueOf<typeof alphaLatencyBuckets>;
  replayRecoveryCategory: ValueOf<typeof alphaReplayRecoveryCategories>;
  failureCategory: ValueOf<typeof alphaFailureCategories>;
  buildCategory: ValueOf<typeof alphaBuildCategories>;
  protectedLoadCategory: ValueOf<typeof alphaProtectedLoadCategories>;
  sequence: number;
  correlation: `run-${number}`;
};
export type AlphaContentSafeObservabilityDraftV1 = Omit<AlphaContentSafeObservabilityEventV1,"schemaVersion"|"sequence"|"correlation"|"buildCategory">;

const fields = ["schemaVersion","eventCategory","workflowStage","transitionCategory","outcomeCategory","roleCategory","occurrenceCategory","viewportCategory","latencyBucket","replayRecoveryCategory","failureCategory","buildCategory","protectedLoadCategory","sequence","correlation"] as const;
const allowed = new Map<string,readonly string[]>([["schemaVersion",[ALPHA_OBSERVABILITY_SCHEMA_VERSION]],["eventCategory",alphaEventCategories],["workflowStage",alphaWorkflowStages],["transitionCategory",alphaTransitionCategories],["outcomeCategory",alphaOutcomeCategories],["roleCategory",alphaRoleCategories],["occurrenceCategory",alphaOccurrenceCategories],["viewportCategory",alphaViewportCategories],["latencyBucket",alphaLatencyBuckets],["replayRecoveryCategory",alphaReplayRecoveryCategories],["failureCategory",alphaFailureCategories],["buildCategory",alphaBuildCategories],["protectedLoadCategory",alphaProtectedLoadCategories]]);
const prohibited = /(?:bearer\s|authorization|cookie|session|token|secret|password|private[ _-]?working|meeting notes|@|https?:\/\/|\/private\/|\/users\/|[a-f0-9]{32,}|(?:user|org|source|artifact|request|operation|receipt|record|question|session)_[a-z0-9_-]+)/iu;

export function assertAlphaContentSafeObservabilityEventV1(value:unknown):asserts value is AlphaContentSafeObservabilityEventV1{
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Alpha observability event is invalid.");
  const record=value as Record<string,unknown>,keys=Object.keys(record).sort(),expected=[...fields].sort();
  if(keys.length!==expected.length||keys.some((key,index)=>key!==expected[index]))throw new Error("Alpha observability event is invalid.");
  for(const [field,values] of allowed){if(typeof record[field]!=="string"||!values.includes(record[field] as string))throw new Error("Alpha observability event is invalid.");}
  if(!Number.isSafeInteger(record.sequence)||Number(record.sequence)<1||Number(record.sequence)>1000||typeof record.correlation!=="string"||!/^run-(?:[1-9]\d{0,3})$/u.test(record.correlation))throw new Error("Alpha observability event is invalid.");
  const firewallRecord={...record,workflowStage:record.workflowStage==="private-working"?"":record.workflowStage};
  if(prohibited.test(JSON.stringify(firewallRecord)))throw new Error("Alpha observability event is prohibited.");
}

export function alphaBuildCategory():AlphaContentSafeObservabilityEventV1["buildCategory"]{return process.env.NODE_ENV==="production"?"production":process.env.NODE_ENV==="test"?"test":"development";}
