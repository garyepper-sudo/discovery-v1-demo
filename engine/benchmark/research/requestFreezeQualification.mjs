import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, open, rm } from "node:fs/promises";
const hash = (v) => createHash("sha256").update(v).digest("hex");
const stable = (v) => Array.isArray(v) ? v.map(stable) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])])) : v;
const json = (v) => JSON.stringify(stable(v)) + "\n";
const seal = async (path, value) => { const temp = `${path}.${process.pid}.tmp`; const handle = await open(temp,"w",0o600); try { await handle.writeFile(value,"utf8"); await handle.sync(); } finally { await handle.close(); } await rename(temp,path); return hash(await readFile(path,"utf8")); };
/*
 * Validate JSON syntax before handing it to JSON.parse.  JSON.parse has
 * already collapsed duplicate members by the time a reviver runs, and a
 * document-wide string search cannot distinguish keys from values or object
 * scopes.  This small recursive-descent scanner keeps one decoded-key Set per
 * object while leaving JSON.parse responsible for producing the exact value.
 */
const parseStrict = (raw) => {
  if (!raw.endsWith("\n") || raw.endsWith("\\n")) throw new Error("invalid terminator");
  if (raw.trimEnd() !== raw.slice(0, -1)) throw new Error("trailing content");
  let offset = 0;
  const whitespace = () => { while (offset < raw.length && " \t\r\n".includes(raw[offset])) offset += 1; };
  const fail = () => { throw new Error("invalid JSON"); };
  const hex = (character) => (character >= "0" && character <= "9") || (character >= "a" && character <= "f") || (character >= "A" && character <= "F");
  const string = () => {
    if (raw[offset] !== '"') fail();
    const start = offset++;
    while (offset < raw.length) {
      const code = raw.charCodeAt(offset);
      if (code < 0x20) fail();
      if (raw[offset] === '"') {
        offset += 1;
        try { return JSON.parse(raw.slice(start, offset)); } catch { fail(); }
      }
      if (raw[offset] === "\\") {
        offset += 1;
        const escaped = raw[offset++];
        if (!["\"", "\\", "/", "b", "f", "n", "r", "t", "u"].includes(escaped)) fail();
        if (escaped === "u") {
          if ([0, 1, 2, 3].some(index => !hex(raw[offset + index]))) fail();
          offset += 4;
        }
      } else offset += 1;
    }
    fail();
  };
  const value = () => {
    whitespace();
    const token = raw[offset];
    if (token === '"') return string();
    if (token === "{") return object();
    if (token === "[") return array();
    if (raw.startsWith("true", offset)) { offset += 4; return; }
    if (raw.startsWith("false", offset)) { offset += 5; return; }
    if (raw.startsWith("null", offset)) { offset += 4; return; }
    if (token === "-" || (token >= "0" && token <= "9")) {
      if (token === "-") offset += 1;
      if (raw[offset] === "0") offset += 1;
      else {
        if (!(raw[offset] >= "1" && raw[offset] <= "9")) fail();
        while (raw[offset] >= "0" && raw[offset] <= "9") offset += 1;
      }
      if (raw[offset] === ".") {
        offset += 1;
        if (!(raw[offset] >= "0" && raw[offset] <= "9")) fail();
        while (raw[offset] >= "0" && raw[offset] <= "9") offset += 1;
      }
      if (raw[offset] === "e" || raw[offset] === "E") {
        offset += 1;
        if (raw[offset] === "+" || raw[offset] === "-") offset += 1;
        if (!(raw[offset] >= "0" && raw[offset] <= "9")) fail();
        while (raw[offset] >= "0" && raw[offset] <= "9") offset += 1;
      }
      return;
    }
    fail();
  };
  const object = () => {
    offset += 1; whitespace();
    const keys = new Set();
    if (raw[offset] === "}") { offset += 1; return; }
    while (true) {
      whitespace();
      const key = string();
      if (keys.has(key)) throw new Error("duplicate key");
      keys.add(key); whitespace();
      if (raw[offset++] !== ":") fail();
      value(); whitespace();
      if (raw[offset] === "}") { offset += 1; return; }
      if (raw[offset++] !== ",") fail();
    }
  };
  const array = () => {
    offset += 1; whitespace();
    if (raw[offset] === "]") { offset += 1; return; }
    while (true) {
      value(); whitespace();
      if (raw[offset] === "]") { offset += 1; return; }
      if (raw[offset++] !== ",") fail();
    }
  };
  value(); whitespace();
  if (offset !== raw.length) fail();
  return JSON.parse(raw);
};
const root = process.argv[2]; const v4 = process.argv[3]; if (!root || !v4) throw new Error("roots required");
const publicFiles=["R4.public.json","R5.public.json","R6.public.json"];
const publicInputs=await Promise.all(publicFiles.map(async f=>[f,await readFile(`${v4}/frozen-public/${f}`,"utf8")]));
const contract={schemaVersion:"request-freeze-v1",model:"gpt-6-astra",reasoning:"ultra",automaticRetries:0,freshContext:true,outputLimitBytes:65536,outputSchemaVersion:"organizational-account-v1"};
const build=async(dir)=>{await mkdir(dir,{recursive:true,mode:0o700});const inv=[];let sequence=1;for(const [name,raw] of publicInputs){const world=JSON.parse(raw);for(let scenario=1;scenario<=4;scenario++){const envelope={...contract,callSequence:sequence++,candidateVisible:{instruction:"Analyze only supplied authorized evidence. Return one JSON object.",question:world.question,evaluationTime:`cycle-${scenario}`,sources:world.sources.slice(0,Math.min(world.sources.length,scenario+2))}};const request=json(envelope);parseStrict(request);const transcript=json(envelope.candidateVisible);const key=`${world.worldId||name.slice(0,2)}-${String(scenario).padStart(2,"0")}`;await writeFile(`${dir}/${key}.request.json`,request,{mode:0o600});await writeFile(`${dir}/${key}.transcript.json`,transcript,{mode:0o600});inv.push({key,request:hash(request),transcript:hash(transcript),settings:contract})}}return inv};
const primary=`${root}/authoritative`;const duplicate=`${root}/duplicate`;const a=await build(primary);const b=await build(duplicate);if(json(a)!==json(b))throw new Error("nondeterministic export");const receipt={schemaVersion:"qualification-freeze-v1",canonicalInputs:Object.fromEntries(publicInputs.map(([n,r])=>[n,hash(r)])),requests:a,aggregateRequestInventory:hash(json(a)),stoppingRule:"reject any hash, JSON, settings, transcript, or output mismatch"};await mkdir(`${root}/sealed`,{recursive:true,mode:0o700});const receiptHash=await seal(`${root}/freeze-receipt.json`,json(receipt));
const canary={protocol:"local-output-sealing-canary-v1",items:[{id:"item-1",status:"retained"}],callSequence:0};const raw=json(canary);const parsed=parseStrict(raw);if(json(parsed)!==raw)throw new Error("canary semantic mismatch");const canaryHash=await seal(`${root}/sealed/canary.canonical.json`,json(parsed));const controls=["{","{\"x\":1,\"x\":2}","```json\n{}\n```","prefix {}","{} suffix","{\"protocol\":\"x\""];if(controls.some(x=>{try{parseStrict(x.endsWith("\n")?x:x+"\n");return true}catch{return false}}))throw new Error("malformed control accepted");const acceptScopeControls=["{\"left\":{\"id\":1},\"right\":{\"id\":2}}\n","{\"id\":1,\"child\":{\"id\":2}}\n","[{\"id\":1},{\"id\":2}]\n"];for(const candidate of acceptScopeControls)parseStrict(candidate);const rejectDuplicateControls=["{\"model\":1,\"\\u006dodel\":2}\n","{\"outer\":{\"id\":1,\"id\":2}}\n","[{\"id\":1,\"id\":2}]\n"];for(const candidate of rejectDuplicateControls){let rejected=false;try{parseStrict(candidate)}catch{rejected=true}if(!rejected)throw new Error("duplicate-key scope control accepted")}await rm(duplicate,{recursive:true,force:true});console.log(JSON.stringify({requests:a.length,receiptHash,canaryHash,controls:controls.length,scopeAcceptControls:acceptScopeControls.length,scopeRejectControls:rejectDuplicateControls.length},null,2));
