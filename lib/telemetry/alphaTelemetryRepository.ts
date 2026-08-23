import { lstat, mkdir, open, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION,
  assertTelemetryRecord,
  type AlphaConsentReceipt,
  type AlphaDeletionReceipt,
  type AlphaOperatorGrant,
  type AlphaTelemetryAudit,
  type AlphaTelemetryRecord,
  type AlphaTelemetryState,
  alphaOperatorScopes,
} from "./alphaProductTelemetryContracts";
import {verifyAlphaTelemetryValue,type AlphaTelemetryKeyRing} from "./alphaTelemetryPseudonymization";
const indexes = () =>
    ({
      primary: {},
      organization: {},
      expiry: {},
      feedback: {},
      audit: {},
    }) as AlphaTelemetryState["indexes"],
  empty = (): AlphaTelemetryState => ({
    schemaVersion: ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION,
    revision: 0,
    records: [],
    consents: [],
    grants: [],
    audits: [],
    deletions: [],
    indexes: indexes(),
  });
const add = (map: Record<string, string[]>, key: string, id: string) => {
  (map[key] ??= []).push(id);
  map[key]!.sort();
};
const pseudo = (v: string) => /^atp_[a-f0-9]{64}$/u.test(v),
  time = (v: string) => Number.isFinite(Date.parse(v));
const exact=(value:object,required:readonly string[],optional:readonly string[]=[])=>{const keys=Object.keys(value);if(required.some(key=>!keys.includes(key))||keys.some(key=>!required.includes(key)&&!optional.includes(key)))throw new Error("Telemetry repository state is invalid.");};
function rebuild(state: AlphaTelemetryState) {
  exact(state,["schemaVersion","revision","records","consents","grants","audits","deletions","indexes"]);
  const next = indexes();
  const recordIds=new Set<string>(),consentIds=new Set<string>(),grantIds=new Set<string>(),auditIds=new Set<string>(),deletionIds=new Set<string>();
  for (const record of state.records) {
    assertTelemetryRecord(record);
    if (recordIds.has(record.recordId))
      throw new Error("Telemetry repository is invalid.");
    recordIds.add(record.recordId);
    next.primary[record.recordId] = record.organizationPseudonym;
    add(next.organization, record.organizationPseudonym, record.recordId);
    add(next.expiry, record.expiresAt.slice(0, 10), record.recordId);
    if (record.kind === "feedback")
      add(next.feedback, record.organizationPseudonym, record.recordId);
  }
  for (const consent of state.consents)
    {exact(consent,["receiptId","organizationPseudonym","organizationPseudonyms","keyVersion","purpose","contractVersion","writtenConsentProofDigest","activatedAt","validUntil","status","integrityMac"],["complianceExpiresAt"]);if (
      consentIds.has(consent.receiptId) ||
      !pseudo(consent.organizationPseudonym) ||
      !Array.isArray(consent.organizationPseudonyms) || new Set(consent.organizationPseudonyms).size!==consent.organizationPseudonyms.length || !consent.organizationPseudonyms.every(pseudo) || !consent.organizationPseudonyms.includes(consent.organizationPseudonym) ||
      !time(consent.activatedAt) ||
      !time(consent.validUntil) ||
      consent.purpose !== "alpha-product-improvement" || consent.contractVersion !== "1" ||
      !/^[a-f0-9]{64}$/u.test(consent.writtenConsentProofDigest) ||
      !/^[a-f0-9]{64}$/u.test(consent.integrityMac) ||
      !["active","deletion-pending","revoked"].includes(consent.status)
    )throw new Error("Telemetry consent state is invalid.");consentIds.add(consent.receiptId);}
  for (const grant of state.grants)
    {exact(grant,["grantId","operatorPseudonym","organizationPseudonym","organizationPseudonyms","keyVersion","purpose","scopes","issuedAt","validUntil","status","integrityMac"],["complianceExpiresAt"]);if (
      grantIds.has(grant.grantId) ||
      !pseudo(grant.organizationPseudonym) ||
      !Array.isArray(grant.organizationPseudonyms) || new Set(grant.organizationPseudonyms).size!==grant.organizationPseudonyms.length || !grant.organizationPseudonyms.every(pseudo) || !grant.organizationPseudonyms.includes(grant.organizationPseudonym) ||
      !pseudo(grant.operatorPseudonym) ||
      !time(grant.issuedAt) ||
      !time(grant.validUntil) ||
      grant.purpose !== "alpha-product-improvement" ||
      !/^[a-f0-9]{64}$/u.test(grant.integrityMac) ||
      !["active","revoked"].includes(grant.status) ||
      !Array.isArray(grant.scopes) || new Set(grant.scopes).size !== grant.scopes.length ||
      grant.scopes.some(scope=>!alphaOperatorScopes.includes(scope))
    )throw new Error("Telemetry operator state is invalid.");grantIds.add(grant.grantId);}
  for (const audit of state.audits) {
    exact(audit,["auditId","operatorPseudonym","organizationPseudonym","organizationPseudonyms","keyVersion","purpose","operation","outcome","occurredAt","complianceExpiresAt","integrityMac"]);
    if (
      auditIds.has(audit.auditId) || !pseudo(audit.organizationPseudonym) ||
      !Array.isArray(audit.organizationPseudonyms) || new Set(audit.organizationPseudonyms).size!==audit.organizationPseudonyms.length || !audit.organizationPseudonyms.every(pseudo) || !audit.organizationPseudonyms.includes(audit.organizationPseudonym) ||
      !pseudo(audit.operatorPseudonym) ||
      !time(audit.occurredAt) ||
      !time(audit.complianceExpiresAt)
      || audit.purpose !== "alpha-product-improvement"
      || !["consent","read","delete","sweep","revoke","zero-verify"].includes(audit.operation)
      || !["success","denied","blocked"].includes(audit.outcome)
      || !/^[a-f0-9]{64}$/u.test(audit.integrityMac)
    )
      throw new Error("Telemetry audit state is invalid.");
    auditIds.add(audit.auditId);
    add(next.audit, audit.organizationPseudonym, audit.auditId);
  }
  for (const deletion of state.deletions)
    {exact(deletion,["receiptId","organizationPseudonym","organizationPseudonyms","keyVersion","keyVersions","deletedPayloadCount","occurredAt","complianceExpiresAt","integrityMac"]);if (
      deletionIds.has(deletion.receiptId) ||
      !pseudo(deletion.organizationPseudonym) ||
      !time(deletion.occurredAt) ||
      !time(deletion.complianceExpiresAt)
      || !/^[a-f0-9]{64}$/u.test(deletion.integrityMac)
      || !Number.isSafeInteger(deletion.deletedPayloadCount) || deletion.deletedPayloadCount < 0
      || !Array.isArray(deletion.keyVersions) || new Set(deletion.keyVersions).size !== deletion.keyVersions.length
      || !Array.isArray(deletion.organizationPseudonyms) || deletion.organizationPseudonyms.length!==deletion.keyVersions.length || new Set(deletion.organizationPseudonyms).size!==deletion.organizationPseudonyms.length || !deletion.organizationPseudonyms.every(pseudo) || !deletion.organizationPseudonyms.includes(deletion.organizationPseudonym)
    )throw new Error("Telemetry deletion state is invalid.");deletionIds.add(deletion.receiptId);}
  return next;
}
function validate(state: AlphaTelemetryState) {
  if (
    state.schemaVersion !== ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION ||
    !Number.isSafeInteger(state.revision) ||
    state.revision < 0
  )
    throw new Error("Telemetry repository is invalid.");
  if (JSON.stringify(rebuild(state)) !== JSON.stringify(state.indexes))
    throw new Error("Telemetry repository index is invalid.");
}
export function assertAlphaTelemetryRepositoryIntegrity(state:AlphaTelemetryState,ring:AlphaTelemetryKeyRing){const signed=[...state.records,...state.consents,...state.grants,...state.audits,...state.deletions];for(const value of signed){const{integrityMac,...base}=value;if(!ring.keys[value.keyVersion]||!verifyAlphaTelemetryValue(ring,value.keyVersion,JSON.stringify(base),integrityMac))throw new Error("Telemetry repository integrity is unavailable.");}}
export type AlphaTelemetryZero = {
  payloadRecords: number;
  organizationIndexEntries: number;
  expiryIndexEntries: number;
  feedbackIndexEntries: number;
  auditEntries: number;
};
export interface AlphaTelemetryRepository {
  read(now?: string,pseudonyms?:readonly string[]): Promise<AlphaTelemetryState>;
  mutate(
    change: (state: AlphaTelemetryState) => AlphaTelemetryState,
  ): Promise<AlphaTelemetryState>;
  append(
    record: AlphaTelemetryRecord,
    now: string,
    consentReceiptId: string,
    authorizedOrganizationPseudonyms: readonly string[],
  ): Promise<"stored" | "replay">;
  sweep(now: string,pseudonyms?:readonly string[]): Promise<number>;
  deleteOrganization(pseudonyms:readonly string[],now:string,preserveAuditIds?:readonly string[]):Promise<number>;
  verifyZero(pseudonyms: readonly string[]): Promise<AlphaTelemetryZero>;
}
export class FilesystemAlphaTelemetryRepository implements AlphaTelemetryRepository {
  private file: string;
  private lock: string;
  constructor(root: string) {
    this.file = path.join(path.resolve(root), "alpha-telemetry-v1.json");
    this.lock = `${this.file}.lock`;
  }
  private async raw() {
    try {
      const fileStat=await lstat(this.file);if(!fileStat.isFile()||fileStat.isSymbolicLink()||(fileStat.mode&0o077)!==0)throw new Error("Telemetry repository is unavailable.");
      const state = JSON.parse(
        await readFile(this.file, "utf8"),
      ) as AlphaTelemetryState;
      validate(state);
      return state;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return empty();
      throw e;
    }
  }
  private async acquire() {
    await mkdir(path.dirname(this.file), { recursive: true });
    const rootStat=await lstat(path.dirname(this.file));if(!rootStat.isDirectory()||rootStat.isSymbolicLink())throw new Error("Telemetry repository is unavailable.");
    for (let i = 0; i < 200; i++)
      try {
        await mkdir(this.lock,{mode:0o700});
        await writeFile(path.join(this.lock,"owner"),JSON.stringify({pid:process.pid,createdAt:Date.now()}),{mode:0o600,flag:"wx"});
        return;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
        try{const lockStat=await stat(this.lock);if(Date.now()-lockStat.mtimeMs>60_000){const owner=JSON.parse(await readFile(path.join(this.lock,"owner"),"utf8")) as {pid?:number};let alive=true;try{if(typeof owner.pid!=="number")throw new Error();process.kill(owner.pid,0);}catch{alive=false;}if(!alive){await rm(this.lock,{recursive:true});continue;}}}catch(error){if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error;}
        await new Promise((r) => setTimeout(r, 5));
      }
    throw new Error("Telemetry repository is unavailable.");
  }
  async read(now = new Date().toISOString(),pseudonyms?:readonly string[]) {
    await this.sweep(now,pseudonyms);
    const state=await this.raw();
    if(!pseudonyms)return structuredClone(state);
    const allowed=new Set(pseudonyms),projected:AlphaTelemetryState={...state,revision:0,records:state.records.filter(value=>value.organizationPseudonyms.some(pseudonym=>allowed.has(pseudonym))),consents:state.consents.filter(value=>value.organizationPseudonyms.some(pseudonym=>allowed.has(pseudonym))),grants:state.grants.filter(value=>value.organizationPseudonyms.some(pseudonym=>allowed.has(pseudonym))),audits:state.audits.filter(value=>value.organizationPseudonyms.some(pseudonym=>allowed.has(pseudonym))),deletions:state.deletions.filter(value=>value.organizationPseudonyms.some(pseudonym=>allowed.has(pseudonym))),indexes:indexes()};
    projected.indexes=rebuild(projected);
    return structuredClone(projected);
  }
  async mutate(change: (state: AlphaTelemetryState) => AlphaTelemetryState) {
    await this.acquire();
    try {
      const current = await this.raw(),
        next = change(structuredClone(current));
      next.revision = current.revision + 1;
      next.indexes = rebuild(next);
      validate(next);
      const temp = `${this.file}.${process.pid}.${current.revision}.tmp`;
      const handle=await open(temp,"wx",0o600);try{await handle.writeFile(`${JSON.stringify(next)}\n`,"utf8");await handle.sync();}finally{await handle.close();}
      await rename(temp, this.file);
      const directory=await open(path.dirname(this.file),"r");try{await directory.sync();}finally{await directory.close();}
      return structuredClone(next);
    } finally {
      await rm(this.lock, { recursive: true, force: true });
    }
  }
  async append(
    record: AlphaTelemetryRecord,
    now: string,
    consentReceiptId: string,
    authorizedOrganizationPseudonyms: readonly string[],
  ) {
    let result: "stored" | "replay" = "stored";
    await this.mutate((state) => {
      const allowed = new Set(authorizedOrganizationPseudonyms),
        consent = state.consents.find(
          (v) =>
            v.receiptId === consentReceiptId &&
            allowed.has(v.organizationPseudonym) &&
            v.status === "active" &&
            Date.parse(v.validUntil) > Date.parse(now),
        );
      if (!consent || !allowed.has(record.organizationPseudonym))
        throw new Error("Telemetry consent is unavailable.");
      state.records = state.records.filter(
        (v) => Date.parse(v.expiresAt) > Date.parse(now),
      );
      const prior = state.records.find((v) => v.recordId === record.recordId);
      if (prior) {
        if (JSON.stringify(prior) !== JSON.stringify(record))
          throw new Error("Telemetry replay is incompatible.");
        result = "replay";
      } else state.records.push(record);
      return state;
    });
    return result;
  }
  async sweep(now: string,pseudonyms?:readonly string[]) {
    await this.acquire();
    let removed = 0;
    try {
      const current = await this.raw(),
        next = structuredClone(current),
        before =
          next.records.length +
          next.consents.length +
          next.grants.length +
          next.audits.length +
          next.deletions.length;
      const scoped=pseudonyms?new Set(pseudonyms):null,expiredAliases=(aliases:readonly string[],expiresAt:string)=>Date.parse(expiresAt)<=Date.parse(now)&&(!scoped||aliases.some(alias=>scoped.has(alias)));
      next.records = next.records.filter(
        (v) => !expiredAliases(v.organizationPseudonyms,v.expiresAt),
      );
      next.consents = next.consents.filter(
        (v) =>
          !expiredAliases(v.organizationPseudonyms,v.validUntil) ||
          !v.complianceExpiresAt ||
          !expiredAliases(v.organizationPseudonyms,v.complianceExpiresAt),
      );
      next.grants = next.grants.filter(
        (v) =>
          !expiredAliases(v.organizationPseudonyms,v.validUntil) ||
          !v.complianceExpiresAt ||
          !expiredAliases(v.organizationPseudonyms,v.complianceExpiresAt),
      );
      next.audits = next.audits.filter(
        (v) => !expiredAliases(v.organizationPseudonyms,v.complianceExpiresAt),
      );
      next.deletions = next.deletions.filter(
        (v) => Date.parse(v.complianceExpiresAt)>Date.parse(now)||Boolean(scoped&&!v.organizationPseudonyms.some(pseudonym=>scoped.has(pseudonym))),
      );
      removed =
        before -
        (next.records.length +
          next.consents.length +
          next.grants.length +
          next.audits.length +
          next.deletions.length);
      if (removed) {
        next.revision = current.revision + 1;
        next.indexes = rebuild(next);
        const temp = `${this.file}.${process.pid}.${current.revision}.tmp`;
        const handle=await open(temp,"wx",0o600);try{await handle.writeFile(`${JSON.stringify(next)}\n`,"utf8");await handle.sync();}finally{await handle.close();}
        await rename(temp, this.file);
        const directory=await open(path.dirname(this.file),"r");try{await directory.sync();}finally{await directory.close();}
      }
    } finally {
      await rm(this.lock, { recursive: true, force: true });
    }
    return removed;
  }
  async deleteOrganization(pseudonyms: readonly string[], now: string,preserveAuditIds:readonly string[]=[]) {
    const set = new Set(pseudonyms);
    const preserve=new Set(preserveAuditIds);
    let removed = 0;
    await this.mutate((state) => {
      const before = state.records.length;
      state.records = state.records.filter(
        (v) => !set.has(v.organizationPseudonym),
      );
      state.audits = state.audits.filter((v) => !set.has(v.organizationPseudonym)||preserve.has(v.auditId));
      removed = before - state.records.length;
      return state;
    });
    await this.sweep(now,pseudonyms);
    return removed;
  }
  async verifyZero(pseudonyms: readonly string[]) {
    const set = new Set(pseudonyms),
      s = await this.raw(),
      ids = new Set(
        s.records
          .filter((v) => set.has(v.organizationPseudonym))
          .map((v) => v.recordId),
      );
    return {
      payloadRecords: ids.size,
      organizationIndexEntries: pseudonyms.reduce(
        (n, p) => n + (s.indexes.organization[p]?.length ?? 0),
        0,
      ),
      expiryIndexEntries: Object.values(s.indexes.expiry)
        .flat()
        .filter((id) => ids.has(id)).length,
      feedbackIndexEntries: pseudonyms.reduce(
        (n, p) => n + (s.indexes.feedback[p]?.length ?? 0),
        0,
      ),
      auditEntries: pseudonyms.reduce(
        (n, p) => n + (s.indexes.audit[p]?.length ?? 0),
        0,
      ),
    };
  }
}
export type {
  AlphaConsentReceipt,
  AlphaDeletionReceipt,
  AlphaOperatorGrant,
  AlphaTelemetryAudit,
};
