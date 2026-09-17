import "server-only";

import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { chmod, link, lstat, mkdir, open, readFile, readdir, realpath, unlink } from "node:fs/promises";
import path from "node:path";
import type { Sql } from "postgres";
import { del, get, put } from "@vercel/blob";
import {
  createProductArtifactBodyRefV1,
  productArtifactBodyDigest,
  validateProductArtifactBodyRefV1,
  type ProductArtifactBodyRefV1,
  type ProductArtifactBodyStageReceiptV1,
  type ProductArtifactBodyStageRequestV1,
} from "./productArtifactBodyContracts";

const SAFE = /^[A-Za-z0-9_-]+$/;
const DIGEST = /^[a-f0-9]{64}$/;

export interface ProductArtifactBodyRepository {
  readonly backend: "filesystem" | "postgres-blob";
  stage(input: ProductArtifactBodyStageRequestV1): Promise<ProductArtifactBodyStageReceiptV1>;
  readStagedExact(body: ProductArtifactBodyRefV1): Promise<Uint8Array>;
  discardUnreferenced?(body: ProductArtifactBodyRefV1): Promise<void>;
  withPublicationLock?<T>(organizationId:string,semanticOwner:string,operation:()=>Promise<T>):Promise<T>;
}

export class PostgresBlobProductArtifactBodyRepository implements ProductArtifactBodyRepository {
  readonly backend="postgres-blob" as const;
  constructor(private readonly sql:Sql<Record<string,unknown>>,private readonly prefix=process.env.DISCOVERY_CHIEF_BLOB_PREFIX??"discovery/chief/v1"){}
  private key(body:ProductArtifactBodyRefV1){return `${this.prefix.replace(/^\/+|\/+$/g,"")}/artifacts/${body.organizationId}/${body.semanticOwner}/${body.bodyId}.json`;}
  async stage(input:ProductArtifactBodyStageRequestV1){const staged=receipt(input,"staged"),key=this.key(staged.body);const found=await this.sql<{ref_payload_text:string;blob_key:string}[]>`SELECT ref_payload_text,blob_key FROM chief_artifact_bodies WHERE organization_id=${input.organizationId} AND semantic_owner=${input.semanticOwner} AND artifact_type=${input.artifactType} AND artifact_id=${input.artifactId} AND artifact_revision=${input.artifactRevision}`;if(found[0]){const prior=JSON.parse(found[0].ref_payload_text) as ProductArtifactBodyRefV1;if(prior.refDigest!==staged.body.refDigest)throw new Error("Product artifact body identity collision.");return receipt(input,"exact-replay");}await put(key,Buffer.from(input.bytes),{access:"private",addRandomSuffix:false,allowOverwrite:false,contentType:"application/json"});await this.sql.begin("isolation level serializable",async tx=>{const prior=await tx<{ref_payload_text:string}[]>`SELECT ref_payload_text FROM chief_artifact_bodies WHERE organization_id=${input.organizationId} AND semantic_owner=${input.semanticOwner} AND artifact_type=${input.artifactType} AND artifact_id=${input.artifactId} AND artifact_revision=${input.artifactRevision} FOR UPDATE`;if(prior[0]){if((JSON.parse(prior[0].ref_payload_text) as ProductArtifactBodyRefV1).refDigest!==staged.body.refDigest)throw new Error("Product artifact body identity collision.");return;}await tx`INSERT INTO chief_artifact_bodies (organization_id,semantic_owner,artifact_type,artifact_id,artifact_revision,ref_digest,exact_body_digest,byte_length,schema_ref,ref_payload_text,blob_key,storage_generation,storage_state) VALUES (${input.organizationId},${input.semanticOwner},${input.artifactType},${input.artifactId},${input.artifactRevision},${staged.body.refDigest},${staged.body.exactBodyDigest},${staged.body.byteLength},${staged.body.schemaRef},${JSON.stringify(staged.body)},${key},gen_random_uuid(),'ready')`;});return staged;}
  async readStagedExact(body:ProductArtifactBodyRefV1){validateProductArtifactBodyRefV1(body);const rows=await this.sql<{ref_payload_text:string;blob_key:string;storage_state:string}[]>`SELECT ref_payload_text,blob_key,storage_state FROM chief_artifact_bodies WHERE organization_id=${body.organizationId} AND semantic_owner=${body.semanticOwner} AND artifact_type=${body.artifactType} AND artifact_id=${body.artifactId} AND artifact_revision=${body.artifactRevision}`;if(rows.length!==1||rows[0].storage_state!=="ready"||(JSON.parse(rows[0].ref_payload_text) as ProductArtifactBodyRefV1).refDigest!==body.refDigest)throw new Error("Product artifact body reference integrity failed.");const result=await get(rows[0].blob_key,{access:"private",useCache:false});if(!result||result.statusCode!==200)throw new Error("Product artifact body integrity failed.");const bytes=new Uint8Array(await new Response(result.stream).arrayBuffer());if(bytes.byteLength!==body.byteLength||productArtifactBodyDigest(bytes)!==body.exactBodyDigest)throw new Error("Product artifact body integrity failed.");return bytes;}
  async discardUnreferenced(body:ProductArtifactBodyRefV1):Promise<void>{validateProductArtifactBodyRefV1(body);const target=await this.sql.begin("isolation level serializable",async tx=>{await tx`SELECT pg_advisory_xact_lock(hashtextextended(${`chief-artifact:${body.organizationId}:${body.semanticOwner}:${body.exactBodyDigest}`},0))`;const rows=await tx<{blob_key:string;storage_state:string}[]>`SELECT blob_key,storage_state FROM chief_artifact_bodies WHERE ref_digest=${body.refDigest} FOR UPDATE`;if(rows.length!==1||rows[0].storage_state!=="ready")return null;const references=await tx<{count:string}[]>`SELECT count(*)::text AS count FROM chief_artifact_bodies WHERE exact_body_digest=${body.exactBodyDigest} AND storage_state='ready' AND ref_digest<>${body.refDigest}`;if(Number(references[0]!.count)>0){await tx`UPDATE chief_artifact_bodies SET storage_state='deleted' WHERE ref_digest=${body.refDigest}`;return null;}await tx`UPDATE chief_artifact_bodies SET storage_state='delete-pending' WHERE ref_digest=${body.refDigest}`;return rows[0]!.blob_key;});if(!target)return;try{await del(target);}catch{throw new Error("Product artifact body cleanup is unavailable.");}await this.sql`UPDATE chief_artifact_bodies SET storage_state='deleted' WHERE ref_digest=${body.refDigest} AND storage_state='delete-pending'`;}
  async withPublicationLock<T>(organizationId:string,semanticOwner:string,operation:()=>Promise<T>):Promise<T>{const lock=`chief-artifact-publication:${organizationId}:${semanticOwner}`;await this.sql`SELECT pg_advisory_lock(hashtextextended(${lock},0))`;try{return await operation();}finally{await this.sql`SELECT pg_advisory_unlock(hashtextextended(${lock},0))`;}}
}

const publicationQueues=new Map<string,Promise<void>>();

function safe(value: string): string {
  if (!SAFE.test(value)) throw new Error("Product artifact body storage identifier is invalid.");
  return value;
}

function receipt(input: ProductArtifactBodyStageRequestV1, disposition: ProductArtifactBodyStageReceiptV1["disposition"]): ProductArtifactBodyStageReceiptV1 {
  const body = createProductArtifactBodyRefV1({
    organizationId: input.organizationId,
    semanticOwner: input.semanticOwner,
    artifactType: input.artifactType,
    artifactId: input.artifactId,
    artifactRevision: input.artifactRevision,
    exactBodyDigest: productArtifactBodyDigest(input.bytes),
    byteLength: input.bytes.byteLength,
    mediaType: "application/json",
    schemaRef: input.schemaRef,
  });
  const unsigned = { contractVersion: "1" as const, body, disposition };
  return { ...unsigned, receiptDigest: productArtifactBodyDigest(unsigned) };
}

export class FilesystemProductArtifactBodyRepository implements ProductArtifactBodyRepository {
  readonly backend = "filesystem" as const;
  constructor(private readonly root: string) {
    if (!path.isAbsolute(root)) throw new Error("Product artifact body root must be absolute.");
  }
  private async noLink(target: string): Promise<void> {
    try { if ((await lstat(target)).isSymbolicLink()) throw new Error("Product artifact body storage is unsafe."); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  private directory(organizationId: string, owner: string): string {
    return path.join(this.root, "organizations", safe(organizationId), "owners", safe(owner), "blobs");
  }
  private refDirectory(organizationId:string,owner:string):string{return path.join(this.root,"organizations",safe(organizationId),"owners",safe(owner),"refs");}
  private target(body: Pick<ProductArtifactBodyRefV1, "organizationId" | "semanticOwner" | "exactBodyDigest">): string {
    if (!DIGEST.test(body.exactBodyDigest)) throw new Error("Product artifact body digest is invalid.");
    return path.join(this.directory(body.organizationId, body.semanticOwner), `${body.exactBodyDigest}.blob`);
  }
  private refTarget(body:Pick<ProductArtifactBodyRefV1,"organizationId"|"semanticOwner"|"artifactType"|"artifactId"|"artifactRevision">):string{return path.join(this.refDirectory(body.organizationId,body.semanticOwner),`${productArtifactBodyDigest({organizationId:body.organizationId,semanticOwner:body.semanticOwner,artifactType:body.artifactType,artifactId:body.artifactId,artifactRevision:body.artifactRevision})}.json`);}
  private async prepare(organizationId: string, owner: string): Promise<void> {
    await this.noLink(this.root);
    const directory = this.directory(organizationId, owner);
    const refs=this.refDirectory(organizationId,owner);await mkdir(directory, { recursive: true, mode: 0o700 });await mkdir(refs,{recursive:true,mode:0o700});
    for (const candidate of [this.root, path.join(this.root, "organizations"), path.join(this.root, "organizations", safe(organizationId)), path.join(this.root, "organizations", safe(organizationId), "owners"), path.dirname(directory), directory,refs]) {
      await this.noLink(candidate);
      await chmod(candidate, 0o700);
    }
    const actual = await realpath(directory);
    const root = await realpath(this.root);
    if (!actual.startsWith(`${root}${path.sep}`)) throw new Error("Product artifact body storage escaped its root.");
  }
  async stage(input: ProductArtifactBodyStageRequestV1): Promise<ProductArtifactBodyStageReceiptV1> {
    const staged = receipt(input, "staged");
    await this.prepare(input.organizationId, input.semanticOwner);
    const target = this.target(staged.body);
    await this.noLink(target);
    const temporary = path.join(
      path.dirname(target),
      `.${staged.body.exactBodyDigest}.${process.pid}.${randomUUID()}.tmp`,
    );
    let published = false;
    try {
      const handle = await open(temporary, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
      try { await handle.writeFile(input.bytes); await handle.sync(); } finally { await handle.close(); }
      const temporaryStatus = await lstat(temporary);
      const temporaryBytes = new Uint8Array(await readFile(temporary));
      if (!temporaryStatus.isFile() || temporaryStatus.isSymbolicLink() || (temporaryStatus.mode & 0o777) !== 0o600 || temporaryBytes.byteLength !== staged.body.byteLength || productArtifactBodyDigest(temporaryBytes) !== staged.body.exactBodyDigest) {
        throw new Error("Product artifact body temporary integrity failed.");
      }
      try { await link(temporary, target); published = true; }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
      const status = await lstat(target);
      const bytes = new Uint8Array(await readFile(target));
      if (!status.isFile() || (status.mode & 0o777) !== 0o600 || bytes.byteLength !== staged.body.byteLength || productArtifactBodyDigest(bytes) !== staged.body.exactBodyDigest) {
        throw new Error("Product artifact body integrity failed.");
      }
    } finally {
      try { await unlink(temporary); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    }
    const result=published?staged:receipt(input,"exact-replay");await this.bindRef(result.body);return result;
  }
  private async bindRef(body:ProductArtifactBodyRefV1):Promise<void>{const target=this.refTarget(body);await this.noLink(target);const bytes=new TextEncoder().encode(JSON.stringify(body));try{const handle=await open(target,constants.O_CREAT|constants.O_EXCL|constants.O_WRONLY,0o600);try{await handle.writeFile(bytes);await handle.sync();}finally{await handle.close();}}catch(error){if((error as NodeJS.ErrnoException).code!=="EEXIST")throw error;const status=await lstat(target),existing=JSON.parse(await readFile(target,"utf8")) as ProductArtifactBodyRefV1;if(!status.isFile()||(status.mode&0o777)!==0o600||existing.refDigest!==body.refDigest)throw new Error("Product artifact body identity collision.");}}
  async readStagedExact(body: ProductArtifactBodyRefV1): Promise<Uint8Array> {
    validateProductArtifactBodyRefV1(body);
    await this.prepare(body.organizationId, body.semanticOwner);
    const refTarget=this.refTarget(body);await this.noLink(refTarget);const refStatus=await lstat(refTarget),recorded=JSON.parse(await readFile(refTarget,"utf8")) as ProductArtifactBodyRefV1;if(!refStatus.isFile()||(refStatus.mode&0o777)!==0o600||recorded.refDigest!==body.refDigest)throw new Error("Product artifact body reference integrity failed.");
    const target = this.target(body);
    await this.noLink(target);
    const status = await lstat(target);
    const bytes = new Uint8Array(await readFile(target));
    if (!status.isFile() || (status.mode & 0o777) !== 0o600 || bytes.byteLength !== body.byteLength || productArtifactBodyDigest(bytes) !== body.exactBodyDigest) {
      throw new Error("Product artifact body integrity failed.");
    }
    return bytes;
  }
  async discardUnreferenced(body: ProductArtifactBodyRefV1): Promise<void> {
    validateProductArtifactBodyRefV1(body);
    await this.prepare(body.organizationId, body.semanticOwner);
    const refTarget=this.refTarget(body);
    try {
      await this.noLink(refTarget);
      const recorded=JSON.parse(await readFile(refTarget,"utf8")) as ProductArtifactBodyRefV1;
      if(recorded.refDigest!==body.refDigest) throw new Error("Product artifact body cleanup is unavailable.");
      await unlink(refTarget);
    } catch(error) {
      if((error as NodeJS.ErrnoException).code!=="ENOENT") throw error;
      return;
    }
    const refs=await readdir(this.refDirectory(body.organizationId,body.semanticOwner));
    for(const ref of refs){
      if(!ref.endsWith(".json")) continue;
      const value=JSON.parse(await readFile(path.join(this.refDirectory(body.organizationId,body.semanticOwner),ref),"utf8")) as ProductArtifactBodyRefV1;
      if(value.exactBodyDigest===body.exactBodyDigest) return;
    }
    try { await unlink(this.target(body)); } catch(error) { if((error as NodeJS.ErrnoException).code!=="ENOENT") throw error; }
  }
  async withPublicationLock<T>(organizationId:string,semanticOwner:string,operation:()=>Promise<T>):Promise<T>{const key=`${this.root}\0${safe(organizationId)}\0${safe(semanticOwner)}`,prior=publicationQueues.get(key)??Promise.resolve();let release!:()=>void;const current=new Promise<void>(resolve=>{release=resolve;}),tail=prior.then(()=>current);publicationQueues.set(key,tail);await prior;try{return await operation();}finally{release();if(publicationQueues.get(key)===tail)publicationQueues.delete(key);}}
}

export function createProductArtifactBodyRepository(input: { root: string }): ProductArtifactBodyRepository {
  return new FilesystemProductArtifactBodyRepository(path.resolve(input.root));
}
