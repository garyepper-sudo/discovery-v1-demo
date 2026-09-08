import "server-only";

import path from "node:path";
import { FounderUnderstandingActivation, type FounderUnderstandingActivationOwners } from "./founderUnderstandingActivation";

/** Environment gate for the nonpublic command. It deliberately performs no
 * Clerk, database, source, or Product operation while constructing the gate. */
export function createFounderLocalAlphaUnderstandingActivationFromEnvironment(input?:{owners?:FounderUnderstandingActivationOwners;environment?:Readonly<Record<string,string|undefined>>}): FounderUnderstandingActivation {
  const environment=input?.environment??process.env;
  if(environment.NODE_ENV==="production"||environment.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true") throw new Error("Founder Local Alpha is unavailable.");
  if(!input?.owners) throw new Error("Founder Local Alpha configuration is unavailable.");
  return new FounderUnderstandingActivation(input.owners);
}

export function assertFounderLocalAlphaCommandInput(input:{packet:string;sourceRoot:string;mode:"dry-run"|"apply"},environment:Readonly<Record<string,string|undefined>>=process.env):void {
  if(environment.NODE_ENV==="production"||environment.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true"||!path.isAbsolute(input.packet)||!path.isAbsolute(input.sourceRoot)) throw new Error("Founder Local Alpha command is unavailable.");
}
