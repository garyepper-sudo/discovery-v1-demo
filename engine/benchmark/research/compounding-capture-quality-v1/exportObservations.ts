import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { projectCycleObservation, type CycleProjectionInput } from "./projector";
import { metricDictionary, stable } from "./contracts";

const forbidden = /(?:sourceBody|agendaText|talkingPointText|privateNoteText|email|clerk|cookie|token|filesystemPath|accountIdentifier)/i;
function assertSafeValues(value:unknown):void{if(typeof value==="string"&&forbidden.test(value))throw new Error("content-safe-export-rejected");if(Array.isArray(value))value.forEach(assertSafeValues);else if(value&&typeof value==="object")Object.values(value as Record<string,unknown>).forEach(assertSafeValues)}
export async function exportObservations(inputs: CycleProjectionInput[], outputDirectory: string) {
  const observations = inputs.map(projectCycleObservation);
  const unique = [...new Map(observations.map(o => [o.observationId,o])).values()];
  const json = JSON.stringify({schemaVersion:"meeting-cycle-research-export/v1",observations:unique},null,2)+"\n";
  assertSafeValues(unique);
  const columns=["observationId","organizationPseudonym","meetingSeriesPseudonym","occurrencePseudonym","cycleIndex","semanticDigest","sourceCount","sourceVersionCount","estimatedContextTokens"];
  const csv=[columns.join(","),...unique.map(o=>[o.observationId,o.organizationPseudonym,o.meetingSeriesPseudonym,o.occurrencePseudonym,o.cycleIndex,o.semanticDigest,o.inputCoverage.sourceCount,o.inputCoverage.sourceVersionCount,o.inputCoverage.estimatedContextTokens].join(","))].join("\n")+"\n";
  await mkdir(outputDirectory,{recursive:true});
  await writeFile(path.join(outputDirectory,"cycle-observations.json"),json);
  await writeFile(path.join(outputDirectory,"cycle-observations.csv"),csv);
  await writeFile(path.join(outputDirectory,"metric-dictionary.json"),JSON.stringify(metricDictionary,null,2)+"\n");
  await writeFile(path.join(outputDirectory,"export-manifest.json"),JSON.stringify({schemaVersion:"cycle-observation-export-manifest/v1",rowCount:unique.length,semanticDigest:createHash("sha256").update(stable(unique)).digest("hex"),networkExports:0,rawBodiesExported:0},null,2)+"\n");
  return unique;
}

if(process.argv[1]?.endsWith("exportObservations.ts")){const[inputPath,outputDirectory]=process.argv.slice(2);if(!inputPath||!outputDirectory){console.error("usage: npm run research:export-cycle-observations -- <authorized-input.json> <isolated-output-directory>");process.exitCode=2}else import("node:fs/promises").then(({readFile})=>readFile(inputPath,"utf8")).then(JSON.parse).then((inputs:CycleProjectionInput[])=>exportObservations(inputs,outputDirectory)).then(rows=>console.log(`PASS exported ${rows.length} content-safe cycle observations; network exports 0`)).catch(error=>{console.error(error instanceof Error?error.message:"measurement-unavailable");process.exitCode=1})}
