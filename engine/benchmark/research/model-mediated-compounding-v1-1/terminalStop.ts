import {chmod,copyFile,lstat,mkdir,readFile,readdir,realpath,rename,writeFile} from "node:fs/promises";import path from "node:path";
import {sha256,stable} from "../model-mediated-compounding-v1/contracts";import {assertState,type Entry,type State} from "./pilotController";import {authenticateV1,AUTHORIZED_V1_ROOT,V1_ANCHOR_DIGEST} from "./v1Anchor";
import {verifyStage as verifyStageV2} from "./pilotSealV2";
export const TERMINAL_PROVIDER_PARAMETER_PHASE="terminal-provider-parameter-rejected" as const;
export const TERMINAL_PROVIDER_PARAMETER_REASON="provider-parameter-rejected:temperature" as const;
export const TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION="V1.1 TERMINAL TECHNICAL STOP — PROVIDER PARAMETER REJECTED" as const;
export const TERMINAL_REVIEW_DIGEST="b28c0d31b633eb3129b0e2ccd99171ea6232e7755a0055cf1a7c89ee1c6ccb5c";
export const CANARY_ENVELOPE_DIGEST="9864afd4a4ee02a5f994fabda7e2ca224cca42c4062b5e85ef0a005c97075494";
export const CANARY_STAGE_ONE_DIGEST="dbc196f9a9d595e7dba2e75c23222af36add88fa8958c63caaa251a64d323a69";
export const PILOT_SEMANTIC_SCHEDULE_DIGEST="fcfba2b23e575bb8dc5956855b60d7b4c75e234a57a6b53a2b40b358c4a4f64f";
const ledgerName="execution-ledger.json",reviewRel=`procedural-reviews/${TERMINAL_REVIEW_DIGEST}.json`,stopRel="terminal-stop.json",gateRel="terminal-gate.json",snapshotRel="terminal-execution-ledger.json",manifestRel="terminal-archive-manifest.json",bundleRel="terminal-full-bundle-receipt.json";
const digestBody=(x:Record<string,unknown>)=>{const{semanticDigest:_,contentDigest:__,digest:___,...body}=x;return sha256(stable(body))};
async function exactWrite(file:string,bytes:Buffer|string,mode:number){const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);try{const prior=await readFile(file);if(!prior.equals(b))throw new Error("terminal artifact replay conflict");return}catch(error){if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error}await writeFile(file,b,{flag:"wx",mode});await chmod(file,mode)}
async function safe(root:string,rel:string){const full=path.resolve(root,rel),base=await realpath(root),actual=await realpath(full);if(!actual.startsWith(`${base}${path.sep}`))throw new Error("terminal archive path traversal");const s=await lstat(full);if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1||(s.mode&0o077)!==0)throw new Error("terminal archive unsafe file");const b=await readFile(full);return{path:rel,bytes:b.length,sha256:sha256(b),mode:s.mode&0o777}}
async function inventory(root:string,excluded=new Set([manifestRel,bundleRel,ledgerName])){const out:Array<Awaited<ReturnType<typeof safe>>>=[];async function walk(dir:string,rel=""){for(const d of await readdir(dir,{withFileTypes:true})){const r=rel?`${rel}/${d.name}`:d.name;if(excluded.has(r))continue;if(d.isSymbolicLink())throw new Error("terminal archive symlink");if(d.isDirectory())await walk(path.join(dir,d.name),r);else if(d.isFile())out.push(await safe(root,r));else throw new Error("terminal archive nonregular")}}await walk(root);return out.sort((a,b)=>a.path.localeCompare(b.path))}
function authenticateReview(bytes:Buffer,candidateDigest:string){const review=JSON.parse(bytes.toString()),{contentDigest,...body}=review;if(contentDigest!==TERMINAL_REVIEW_DIGEST||sha256(stable(body))!==contentDigest||review.candidateDigest!==candidateDigest||review.reviewedStateDigest!=="bbd0622d6939ecf74f8b067868e5ca63c5f2aef1cd3c39a63c4b66fbe3c621be"||review.scheduleOrManifestDigest!==CANARY_STAGE_ONE_DIGEST||review.terminalClassification!==TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION||review.noMutationPerformed!==true)throw new Error("terminal review authentication");return review}
export async function terminalizeProviderParameterStop(root:string,reviewSource:string,candidateDigest:string){await mkdir(root,{recursive:true,mode:0o700});const lock=path.join(root,".terminal-stop-lock");await mkdir(lock,{mode:0o700});try{const v1=await authenticateV1(AUTHORIZED_V1_ROOT);if(v1.anchorDigest!==V1_ANCHOR_DIGEST)throw new Error("terminal V1 authentication");const ledgerPath=path.join(root,ledgerName),oldBytes=await readFile(ledgerPath),oldDigest=sha256(oldBytes),old=assertState(JSON.parse(oldBytes.toString())) as State;if(old.phase===TERMINAL_PROVIDER_PARAMETER_PHASE){const replayReview=await readFile(reviewSource);authenticateReview(replayReview,candidateDigest);const replayStop=JSON.parse(await readFile(path.join(root,stopRel),"utf8"));if(replayStop.candidateDigest!==candidateDigest||replayStop.reviewArtifactDigest!==TERMINAL_REVIEW_DIGEST)throw new Error("terminal replay evidence conflict");return verifyTerminalArchive(root)}if(old.phase!=="awaiting-canary"||old.attempts.length!==1||old.attempts[0].state!=="provider-error"||old.attempts[0].ordinal!==1||old.attempts[0].responseDigest!==CANARY_ENVELOPE_DIGEST||old.attempts[0].responseBytes!==191||old.attempts[0].costMicros!==0||old.attempts[0].totalTokens!==0||old.attempts.some(x=>x.state==="claimed")||old.gates.length)throw new Error("terminal source ledger mismatch");if(old.v1AnchorDigest!==V1_ANCHOR_DIGEST||old.v1AttemptCount!==16||old.schedule.length!==192)throw new Error("terminal V1/schedule authentication");const attempt=old.attempts[0],envRel=`attempts/${attempt.attemptId}/provider-error-envelope.bin`,receiptRel=`attempts/${attempt.attemptId}/transport-receipt.json`,env=await readFile(path.join(root,envRel)),receipt=await readFile(path.join(root,receiptRel)),stageBytes=await readFile(path.join(root,"stage-1-manifest.json")),stage=JSON.parse(stageBytes.toString()),reviewBytes=await readFile(reviewSource);if(env.length!==191||sha256(env)!==CANARY_ENVELOPE_DIGEST||stage.digest!==CANARY_STAGE_ONE_DIGEST||stage.ledgerDigest!==oldDigest||stage.rows.length!==1||sha256(receipt)!=="bcfcc35b6760213ac0f46b90d2dc8dc6d1b3bdca464bdfe26a9a8c9c63d51ffe")throw new Error("terminal immutable canary evidence mismatch");authenticateReview(reviewBytes,candidateDigest);const intent={schemaVersion:"model-mediated-v1.1-terminal-intent/v1",archiveId:old.archiveId,oldLedgerDigest:oldDigest,reviewDigest:TERMINAL_REVIEW_DIGEST,reason:TERMINAL_PROVIDER_PARAMETER_REASON,classification:TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION};await exactWrite(path.join(root,"terminal-intent.json"),JSON.stringify({...intent,digest:sha256(stable(intent))},null,2)+"\n",0o600);await mkdir(path.join(root,"procedural-reviews"),{recursive:true,mode:0o700});await exactWrite(path.join(root,reviewRel),reviewBytes,0o600);const stopBody={schemaVersion:"model-mediated-benchmark-terminal-stop/v1",experimentVersion:"model-mediated-compounding/v1.1",archiveId:old.archiveId,ledgerId:old.ledgerId,preregistrationDigest:old.amendmentDigest,executionScheduleDigest:old.scheduleDigest,semanticScheduleDigest:PILOT_SEMANTIC_SCHEDULE_DIGEST,candidateDigest,v1AnchorDigest:old.v1AnchorDigest,v1Attempts:16,canaryAttemptId:attempt.attemptId,canaryRequestId:attempt.requestId,canaryRequestDigest:attempt.requestDigest,providerErrorEnvelopePath:envRel,providerErrorEnvelopeDigest:CANARY_ENVELOPE_DIGEST,providerErrorEnvelopeBytes:191,receiptPath:receiptRel,receiptDigest:sha256(receipt),stageOneSealDigest:CANARY_STAGE_ONE_DIGEST,reviewArtifactPath:reviewRel,reviewArtifactDigest:TERMINAL_REVIEW_DIGEST,terminalReason:TERMINAL_PROVIDER_PARAMETER_REASON,terminalClassification:TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION,v11Attempts:1,cumulativeAttempts:17,providerErrors:1,successes:0,refusals:0,transportFailures:0,parseFailures:0,totalTokens:0,costMicros:0,remainingUnattemptedPackets:191,requestTwoAuthorized:false,nextAttemptAllowed:false,exploratoryResult:"NOT EXECUTED",confirmatoryResult:"NOT TESTED",authenticUserValue:"NOT TESTED",organizationalOutcomes:"NOT TESTED",createdBy:"founder-authorized-terminalization-v1"},semanticDigest=sha256(stable(stopBody)),stop={...stopBody,semanticDigest};await exactWrite(path.join(root,stopRel),JSON.stringify(stop,null,2)+"\n",0o600);const gateBody={schemaVersion:"model-mediated-v1.1-terminal-gate/v1",archiveId:old.archiveId,terminalStopDigest:semanticDigest,reviewDigest:TERMINAL_REVIEW_DIGEST,oldLedgerDigest:oldDigest,stageOneSealDigest:CANARY_STAGE_ONE_DIGEST,nextAttemptAllowed:false,classification:TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION},gateDigest=sha256(stable(gateBody));await exactWrite(path.join(root,gateRel),JSON.stringify({...gateBody,digest:gateDigest},null,2)+"\n",0o600);const manifestIdentity=sha256(stable({archiveId:old.archiveId,stop:semanticDigest,gate:gateDigest,review:TERMINAL_REVIEW_DIGEST,attempts:1,remaining:191})),terminal={...old,phase:TERMINAL_PROVIDER_PARAMETER_PHASE,terminalStopDigest:semanticDigest,terminalGateDigest:gateDigest,terminalManifestDigest:manifestIdentity};const terminalBytes=Buffer.from(JSON.stringify(terminal,null,2)+"\n");await exactWrite(path.join(root,snapshotRel),terminalBytes,0o400);const inv=await inventory(root),manifestBody={schemaVersion:"model-mediated-v1.1-terminal-archive-manifest/v1",experimentVersion:"model-mediated-compounding/v1.1",archiveId:old.archiveId,manifestIdentity,terminalStopDigest:semanticDigest,terminalGateDigest:gateDigest,reviewDigest:TERMINAL_REVIEW_DIGEST,stageOneSealDigest:CANARY_STAGE_ONE_DIGEST,attempts:1,completeProviderErrorEnvelopes:1,successes:0,parsedOutputs:0,requestTwoAttempts:0,totalTokens:0,costMicros:0,remainingUnattemptedPackets:191,inventory:inv},manifestDigest=sha256(stable(manifestBody));await exactWrite(path.join(root,manifestRel),JSON.stringify({...manifestBody,digest:manifestDigest},null,2)+"\n",0o400);const manifestFile=await safe(root,manifestRel),bundleBody={schemaVersion:"model-mediated-v1.1-terminal-bundle-receipt/v1",archiveId:old.archiveId,manifestDigest,files:[...inv,manifestFile]},bundleDigest=sha256(stable(bundleBody));await exactWrite(path.join(root,bundleRel),JSON.stringify({...bundleBody,digest:bundleDigest},null,2)+"\n",0o400);if(sha256(await readFile(ledgerPath))!==oldDigest)throw new Error("terminal ledger CAS conflict");const tmp=`${ledgerPath}.${process.pid}.terminal`;await writeFile(tmp,terminalBytes,{mode:0o600});await rename(tmp,ledgerPath);return verifyTerminalArchive(root)}finally{await (await import("node:fs/promises")).rmdir(lock)}}
async function verifyTerminalArchiveLegacy(root:string){const ledger=assertState(JSON.parse(await readFile(path.join(root,ledgerName),"utf8"))) as State;if(ledger.phase!==TERMINAL_PROVIDER_PARAMETER_PHASE||ledger.attempts.length!==1||ledger.attempts[0].state!=="provider-error"||ledger.gates.length!==0||ledger.terminalStopDigest==null||ledger.terminalGateDigest==null||ledger.terminalManifestDigest==null)throw new Error("terminal ledger reconciliation");const stop=JSON.parse(await readFile(path.join(root,stopRel),"utf8")),gate=JSON.parse(await readFile(path.join(root,gateRel),"utf8")),reviewBytes=await readFile(path.join(root,reviewRel)),snapshot=await readFile(path.join(root,snapshotRel)),manifest=JSON.parse(await readFile(path.join(root,manifestRel),"utf8")),bundle=JSON.parse(await readFile(path.join(root,bundleRel),"utf8"));if(stop.semanticDigest!==ledger.terminalStopDigest||digestBody(stop)!==stop.semanticDigest||stop.terminalReason!==TERMINAL_PROVIDER_PARAMETER_REASON||stop.terminalClassification!==TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION||stop.cumulativeAttempts!==17||stop.remainingUnattemptedPackets!==191||stop.nextAttemptAllowed!==false||stop.requestTwoAuthorized!==false||stop.totalTokens||stop.costMicros)throw new Error("terminal stop semantic tamper");if(gate.digest!==ledger.terminalGateDigest||digestBody(gate)!==gate.digest||gate.nextAttemptAllowed!==false||gate.classification!==TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION)throw new Error("terminal gate tamper");authenticateReview(reviewBytes,stop.candidateDigest);if(!snapshot.equals(await readFile(path.join(root,ledgerName))))throw new Error("terminal ledger snapshot mismatch");const inv=await inventory(root),{digest,...manifestBody}=manifest;if(digest!==sha256(stable(manifestBody))||stable(inv)!==stable(manifest.inventory))throw new Error("terminal manifest missing/orphan/tamper");const manifestFile=await safe(root,manifestRel),{digest:bundleDigest,...bundleBody}=bundle;if(bundleDigest!==sha256(stable(bundleBody))||stable(bundle.files)!==stable([...inv,manifestFile]))throw new Error("terminal bundle tamper");return{terminalStopDigest:stop.semanticDigest,terminalGateDigest:gate.digest,manifestDigest:manifest.digest,bundleDigest,phase:ledger.phase,attempts:ledger.attempts.length,cumulativeAttempts:17,requestTwoClaims:0,providerRequests:0}}

type TerminalStatus = Record<string, unknown> & {
  anchors: Record<string, string>;
};

const exact = (actual: unknown, expected: unknown, label: string) => {
  if (stable(actual) !== stable(expected)) throw new Error(`terminal ${label} binding`);
};

async function trustedStatus(): Promise<TerminalStatus> {
  return JSON.parse(await readFile(new URL("./TERMINAL_STATUS.json", import.meta.url), "utf8"));
}

async function verifyDirectoryTree(root: string) {
  const base = await realpath(root);
  async function walk(dir: string) {
    const stat = await lstat(dir);
    if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700)
      throw new Error("terminal directory mode/symlink");
    if ((await realpath(dir)) !== dir && dir === root) throw new Error("terminal root identity");
    if (!(await realpath(dir)).startsWith(base)) throw new Error("terminal directory escape");
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const child = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error("terminal archive symlink");
      if (entry.isDirectory()) await walk(child);
    }
  }
  await walk(root);
}

export async function verifyTerminalArchive(root: string) {
  const legacy = await verifyTerminalArchiveLegacy(root);
  const status = await trustedStatus();
  const anchors = status.anchors;
  if (!anchors) throw new Error("terminal trusted anchors absent");
  const v1 = await authenticateV1(AUTHORIZED_V1_ROOT);
  if (v1.anchorDigest !== anchors.v1AnchorDigest || v1.startingAttempts !== 16)
    throw new Error("terminal V1 archive authentication");
  await verifyDirectoryTree(root);

  const ledgerBytes = await readFile(path.join(root, ledgerName));
  const ledger = assertState(JSON.parse(ledgerBytes.toString())) as State;
  const stageBytes = await readFile(path.join(root, "stage-1-manifest.json"));
  if (sha256(stageBytes) !== anchors.stageOneManifestFileDigest)
    throw new Error("terminal immutable stage-one bytes");
  const stage = await verifyStageV2(root, ledger.schedule as Entry[], 1);
  if (stage.digest !== anchors.stageOneSealDigest || stage.ledgerDigest !== anchors.oldLedgerDigest)
    throw new Error("terminal stage-one semantic authentication");

  const stop = JSON.parse(await readFile(path.join(root, stopRel), "utf8"));
  const gate = JSON.parse(await readFile(path.join(root, gateRel), "utf8"));
  const manifest = JSON.parse(await readFile(path.join(root, manifestRel), "utf8"));
  const bundle = JSON.parse(await readFile(path.join(root, bundleRel), "utf8"));
  const reviewBytes = await readFile(path.join(root, reviewRel));
  const attempt = ledger.attempts[0];
  const envelope = await readFile(path.join(root, stop.providerErrorEnvelopePath));
  const receiptBytes = await readFile(path.join(root, stop.receiptPath));
  const receipt = JSON.parse(receiptBytes.toString());
  const providerError = JSON.parse(envelope.toString()).error;

  exact(
    {
      schemaVersion: stop.schemaVersion,
      experimentVersion: stop.experimentVersion,
      archiveId: stop.archiveId,
      ledgerId: stop.ledgerId,
      preregistrationDigest: stop.preregistrationDigest,
      executionScheduleDigest: stop.executionScheduleDigest,
      semanticScheduleDigest: stop.semanticScheduleDigest,
      candidateDigest: stop.candidateDigest,
      v1AnchorDigest: stop.v1AnchorDigest,
      v1Attempts: stop.v1Attempts,
      canaryAttemptId: stop.canaryAttemptId,
      canaryRequestId: stop.canaryRequestId,
      canaryRequestDigest: stop.canaryRequestDigest,
      providerErrorEnvelopePath: stop.providerErrorEnvelopePath,
      providerErrorEnvelopeDigest: stop.providerErrorEnvelopeDigest,
      providerErrorEnvelopeBytes: stop.providerErrorEnvelopeBytes,
      receiptPath: stop.receiptPath,
      receiptDigest: stop.receiptDigest,
      stageOneSealDigest: stop.stageOneSealDigest,
      reviewArtifactPath: stop.reviewArtifactPath,
      reviewArtifactDigest: stop.reviewArtifactDigest,
      terminalReason: stop.terminalReason,
      terminalClassification: stop.terminalClassification,
      v11Attempts: stop.v11Attempts,
      cumulativeAttempts: stop.cumulativeAttempts,
      providerErrors: stop.providerErrors,
      successes: stop.successes,
      refusals: stop.refusals,
      transportFailures: stop.transportFailures,
      parseFailures: stop.parseFailures,
      totalTokens: stop.totalTokens,
      costMicros: stop.costMicros,
      remainingUnattemptedPackets: stop.remainingUnattemptedPackets,
      requestTwoAuthorized: stop.requestTwoAuthorized,
      nextAttemptAllowed: stop.nextAttemptAllowed,
      exploratoryResult: stop.exploratoryResult,
      confirmatoryResult: stop.confirmatoryResult,
      authenticUserValue: stop.authenticUserValue,
      organizationalOutcomes: stop.organizationalOutcomes,
      createdBy: stop.createdBy,
    },
    {
      schemaVersion: "model-mediated-benchmark-terminal-stop/v1",
      experimentVersion: "model-mediated-compounding/v1.1",
      archiveId: anchors.archiveId,
      ledgerId: anchors.ledgerId,
      preregistrationDigest: anchors.amendmentDigest,
      executionScheduleDigest: anchors.executionScheduleDigest,
      semanticScheduleDigest: anchors.semanticScheduleDigest,
      candidateDigest: anchors.candidateDigest,
      v1AnchorDigest: anchors.v1AnchorDigest,
      v1Attempts: 16,
      canaryAttemptId: anchors.canaryAttemptId,
      canaryRequestId: anchors.canaryRequestId,
      canaryRequestDigest: anchors.canaryRequestDigest,
      providerErrorEnvelopePath: `attempts/${anchors.canaryAttemptId}/provider-error-envelope.bin`,
      providerErrorEnvelopeDigest: anchors.envelopeDigest,
      providerErrorEnvelopeBytes: 191,
      receiptPath: `attempts/${anchors.canaryAttemptId}/transport-receipt.json`,
      receiptDigest: anchors.receiptDigest,
      stageOneSealDigest: anchors.stageOneSealDigest,
      reviewArtifactPath: `procedural-reviews/${anchors.reviewContentDigest}.json`,
      reviewArtifactDigest: anchors.reviewContentDigest,
      terminalReason: TERMINAL_PROVIDER_PARAMETER_REASON,
      terminalClassification: TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION,
      v11Attempts: 1,
      cumulativeAttempts: 17,
      providerErrors: 1,
      successes: 0,
      refusals: 0,
      transportFailures: 0,
      parseFailures: 0,
      totalTokens: 0,
      costMicros: 0,
      remainingUnattemptedPackets: 191,
      requestTwoAuthorized: false,
      nextAttemptAllowed: false,
      exploratoryResult: "NOT EXECUTED",
      confirmatoryResult: "NOT TESTED",
      authenticUserValue: "NOT TESTED",
      organizationalOutcomes: "NOT TESTED",
      createdBy: "founder-authorized-terminalization-v1",
    },
    "stop full semantic",
  );
  if (stop.semanticDigest !== anchors.terminalStopDigest || digestBody(stop) !== stop.semanticDigest)
    throw new Error("terminal stop digest");

  exact(
    {
      archiveId: ledger.archiveId,
      ledgerId: ledger.ledgerId,
      scheduleDigest: ledger.scheduleDigest,
      amendmentDigest: ledger.amendmentDigest,
      v1AnchorDigest: ledger.v1AnchorDigest,
      phase: ledger.phase,
      attempts: ledger.attempts.length,
      gates: ledger.gates.length,
      terminalStopDigest: ledger.terminalStopDigest,
      terminalGateDigest: ledger.terminalGateDigest,
      terminalManifestDigest: ledger.terminalManifestDigest,
    },
    {
      archiveId: anchors.archiveId,
      ledgerId: anchors.ledgerId,
      scheduleDigest: anchors.executionScheduleDigest,
      amendmentDigest: anchors.amendmentDigest,
      v1AnchorDigest: anchors.v1AnchorDigest,
      phase: TERMINAL_PROVIDER_PARAMETER_PHASE,
      attempts: 1,
      gates: 0,
      terminalStopDigest: anchors.terminalStopDigest,
      terminalGateDigest: anchors.terminalGateDigest,
      terminalManifestDigest: anchors.manifestIdentity,
    },
    "ledger full identity",
  );
  exact(
    {
      ordinal: attempt.ordinal,
      attemptId: attempt.attemptId,
      requestId: attempt.requestId,
      requestDigest: attempt.requestDigest,
      state: attempt.state,
      responseDigest: attempt.responseDigest,
      responseBytes: attempt.responseBytes,
      reason: attempt.reason,
      tokens: attempt.totalTokens,
      cost: attempt.costMicros,
    },
    {
      ordinal: 1,
      attemptId: anchors.canaryAttemptId,
      requestId: anchors.canaryRequestId,
      requestDigest: anchors.canaryRequestDigest,
      state: "provider-error",
      responseDigest: anchors.envelopeDigest,
      responseBytes: 191,
      reason: "http-400",
      tokens: 0,
      cost: 0,
    },
    "canary attempt",
  );
  if (
    sha256(envelope) !== anchors.envelopeDigest ||
    envelope.length !== 191 ||
    sha256(receiptBytes) !== anchors.receiptDigest ||
    receipt.httpStatus !== 400 ||
    receipt.providerRequestId == null ||
    receipt.responseBodyBytes !== 191 ||
    receipt.responseBodySha256 !== anchors.envelopeDigest ||
    providerError.type !== "invalid_request_error" ||
    providerError.param !== "temperature" ||
    providerError.code !== null
  )
    throw new Error("terminal provider error/receipt semantics");
  if (sha256(reviewBytes) !== anchors.reviewFileDigest)
    throw new Error("terminal review immutable bytes");
  authenticateReview(reviewBytes, anchors.candidateDigest);

  exact(
    {
      schemaVersion: gate.schemaVersion,
      archiveId: gate.archiveId,
      terminalStopDigest: gate.terminalStopDigest,
      reviewDigest: gate.reviewDigest,
      oldLedgerDigest: gate.oldLedgerDigest,
      stageOneSealDigest: gate.stageOneSealDigest,
      nextAttemptAllowed: gate.nextAttemptAllowed,
      classification: gate.classification,
    },
    {
      schemaVersion: "model-mediated-v1.1-terminal-gate/v1",
      archiveId: anchors.archiveId,
      terminalStopDigest: anchors.terminalStopDigest,
      reviewDigest: anchors.reviewContentDigest,
      oldLedgerDigest: anchors.oldLedgerDigest,
      stageOneSealDigest: anchors.stageOneSealDigest,
      nextAttemptAllowed: false,
      classification: TERMINAL_PROVIDER_PARAMETER_CLASSIFICATION,
    },
    "gate full semantic",
  );
  if (gate.digest !== anchors.terminalGateDigest || digestBody(gate) !== gate.digest)
    throw new Error("terminal gate digest");
  if (
    manifest.archiveId !== anchors.archiveId ||
    manifest.manifestIdentity !== anchors.manifestIdentity ||
    manifest.terminalStopDigest !== anchors.terminalStopDigest ||
    manifest.terminalGateDigest !== anchors.terminalGateDigest ||
    manifest.reviewDigest !== anchors.reviewContentDigest ||
    manifest.stageOneSealDigest !== anchors.stageOneSealDigest ||
    manifest.attempts !== 1 ||
    manifest.completeProviderErrorEnvelopes !== 1 ||
    manifest.successes !== 0 ||
    manifest.parsedOutputs !== 0 ||
    manifest.requestTwoAttempts !== 0 ||
    manifest.totalTokens !== 0 ||
    manifest.costMicros !== 0 ||
    manifest.remainingUnattemptedPackets !== 191 ||
    manifest.digest !== anchors.finalManifestDigest
  ) throw new Error("terminal manifest full semantic");
  if (
    bundle.archiveId !== anchors.archiveId ||
    bundle.manifestDigest !== anchors.finalManifestDigest ||
    bundle.digest !== anchors.fullBundleDigest
  ) throw new Error("terminal bundle full semantic");
  return legacy;
}
