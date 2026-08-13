import "server-only";

import { randomUUID } from "node:crypto";
import { constants } from "node:fs";
import { chmod, link, lstat, mkdir, open, readFile, realpath, unlink } from "node:fs/promises";
import path from "node:path";
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
  readonly backend: "filesystem";
  stage(input: ProductArtifactBodyStageRequestV1): Promise<ProductArtifactBodyStageReceiptV1>;
  readStagedExact(body: ProductArtifactBodyRefV1): Promise<Uint8Array>;
}

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
}

export function createProductArtifactBodyRepository(input: { root: string }): ProductArtifactBodyRepository {
  return new FilesystemProductArtifactBodyRepository(path.resolve(input.root));
}
