import "server-only";
import { sourceContentDigest, decodeAndNormalizeSourceContent, type SourceContentMediaTypeV1 } from "../../engine/v3/sources";

export type FirstUnderstandingUpload = { name: string; purpose: string; mediaType: SourceContentMediaTypeV1; bytes: Uint8Array; exactDigest: string; normalizedDigest: string };
export type FirstUnderstandingInput = { organizationDisplayName: string; understandingPurpose: string; primaryQuestion: string; meetingTitle: string; cadence: string; sources: FirstUnderstandingUpload[] };
const allowed = new Set(["organizationDisplayName", "understandingPurpose", "primaryQuestion", "meetingTitle", "cadence", "files", "sourcePurpose", "confirmation"]);
const text = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") throw new Error("Enter the required information.");
  const result = value.trim().replace(/\s+/gu, " ");
  if (!result || result.length > 500 || result.includes("\0")) throw new Error("Enter between 1 and 500 characters.");
  return result;
};
export async function parseFounderGovernedSourceUploads(data:FormData,maxFiles:number):Promise<FirstUnderstandingUpload[]>{
  const files=data.getAll("files"),purposes=data.getAll("sourcePurpose");
  if(files.length<1||files.length>maxFiles||purposes.length!==files.length)throw new Error(`Select 1–${maxFiles} files and describe each source’s purpose.`);
  let total=0;
  for(const file of files){
    if(typeof file==="string"||file.size===0||file.size>1024*1024)throw new Error("Files must contain text and be at most 1 MB each.");
    total+=file.size;if(total>5*1024*1024)throw new Error("The total upload must be at most 5 MB.");
    if(!file.name||/[\\/\0]/u.test(file.name)||file.name.includes("..")||!/\.(txt|md)$/iu.test(file.name))throw new Error("Use a safely named .txt or .md file.");
  }
  const sources:FirstUnderstandingUpload[]=[];
  for(const[index,file]of files.entries()){
    if(typeof file==="string")throw new Error("A file is required.");
    const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.byteLength!==file.size)throw new Error("The upload changed while being read.");
    const{normalizedText}=decodeAndNormalizeSourceContent(bytes);if(!normalizedText.trim())throw new Error("A source cannot be empty.");
    sources.push({name:file.name.normalize("NFC").trim(),purpose:text(purposes[index]!),mediaType:/\.md$/iu.test(file.name)?"text/markdown":"text/plain",bytes,exactDigest:sourceContentDigest(bytes),normalizedDigest:sourceContentDigest(new TextEncoder().encode(normalizedText))});
  }
  if(new Set(sources.map(value=>`${value.mediaType}:${value.normalizedDigest}`)).size!==sources.length)throw new Error("Duplicate sources are not supported.");
  return sources.sort((a,b)=>a.name.localeCompare(b.name)||a.exactDigest.localeCompare(b.exactDigest));
}
/** Closed parsing completes before authenticated protected reads. Each upload is read once. */
export async function parseFirstUnderstandingForm(data: FormData): Promise<FirstUnderstandingInput> {
  for (const key of data.keys()) if (!allowed.has(key)) throw new Error("Unexpected first understanding field.");
  for (const key of ["organizationDisplayName", "understandingPurpose", "primaryQuestion", "meetingTitle", "cadence", "confirmation"]) if (data.getAll(key).length !== 1) throw new Error("Duplicate or missing first understanding field.");
  if (data.get("confirmation") !== "confirmed") throw new Error("Confirm the selected information.");
  const cadence = text(data.get("cadence"));
  if (!["Weekly", "Fortnightly", "Monthly"].includes(cadence)) throw new Error("Choose a supported cadence.");
  const sources=await parseFounderGovernedSourceUploads(data,5);
  return { organizationDisplayName: text(data.get("organizationDisplayName")), understandingPurpose: text(data.get("understandingPurpose")), primaryQuestion: text(data.get("primaryQuestion")), meetingTitle: text(data.get("meetingTitle")), cadence, sources };
}
