import "server-only";
import {parseFounderGovernedSourceUploads,type FirstUnderstandingUpload} from "./founderFirstUnderstandingForm";

const allowed=new Set(["files","sourcePurpose","intent"]);
export type FounderAddGovernedContextInput={sources:FirstUnderstandingUpload[]};

/** Closed before any authenticated or protected owner is constructed. */
export async function parseFounderAddGovernedContextForm(data:FormData):Promise<FounderAddGovernedContextInput>{
 for(const key of data.keys())if(!allowed.has(key))throw new Error("Unexpected add-context field.");
 if(data.getAll("intent").length!==1||data.get("intent")!=="add-governed-context")throw new Error("Confirm the context addition.");
 return{sources:await parseFounderGovernedSourceUploads(data,4)};
}
