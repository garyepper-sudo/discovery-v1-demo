import { registerHooks } from "node:module";

const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const parser = asModule('export async function parseFounderAddGovernedContextForm(data){const keys=[...data.keys()];globalThis.__founderAddContextParsed.push(keys);if(keys.some(key=>!["intent","files","sourcePurpose"].includes(key)))throw new Error("Unexpected add-context field.");return {sources:data.getAll("files").map((file,index)=>({name:`validated-source-${index}`,purpose:data.getAll("sourcePurpose")[index]}))}}');
const composition = asModule('export async function createFounderAddGovernedContextApplicationServiceFromRequest(){globalThis.__founderAddContextServices++;return {apply:async(seriesAddress,input)=>{globalThis.__founderAddContextApplications.push({seriesAddress,input});return {status:"applied",sourceCount:5,meetingHomeDestination:`/product-alpha/meetings/${seriesAddress}`}},close:async()=>undefined}}');

registerHooks({
 resolve(specifier, context, nextResolve) {
  if(specifier.endsWith("/founderAddGovernedContextForm"))return {url:parser,shortCircuit:true};
  if(specifier.endsWith("/founderFirstUnderstandingRequestComposition"))return {url:composition,shortCircuit:true};
  return nextResolve(specifier,context);
 },
 load(url, context, nextLoad) {
  if(url.startsWith("data:text/javascript,"))return {format:"module",source:decodeURIComponent(url.slice(url.indexOf(",")+1)),shortCircuit:true};
  return nextLoad(url,context);
 },
});
