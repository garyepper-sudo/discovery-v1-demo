import { createHash } from "node:crypto";
import {
  ALPHA_TELEMETRY_PURPOSE,
  alphaOperatorScopes,
  type AlphaOperatorGrant,
  type AlphaOperatorScope,
  type AlphaTelemetryAudit,
} from "./alphaProductTelemetryContracts";
import {
  deriveAlphaTelemetryPseudonym,
  signAlphaTelemetryValue,
  verifyAlphaTelemetryValue,
  type AlphaTelemetryKeyRing,
} from "./alphaTelemetryPseudonymization";
import {assertAlphaTelemetryRepositoryIntegrity,type AlphaTelemetryRepository } from "./alphaTelemetryRepository";
import type { AlphaTelemetryConsentOwner } from "./alphaTelemetryConsentOwner";
const DAY = 86_400_000,
  digest = (v: string) => createHash("sha256").update(v).digest("hex");
export class AlphaTelemetryOperatorAccess {
  constructor(
    private repository: AlphaTelemetryRepository,
    private ring: AlphaTelemetryKeyRing,
    private now: () => string,
    private consentOwner?: AlphaTelemetryConsentOwner,
  ) {}
  async issue(input: {
    operatorId: string;
    organizationId: string;
    scopes: AlphaOperatorScope[];
    validUntil: string;
    issuanceAuthority: "development-telemetry-bootstrap";
  }) {
    if (process.env.NODE_ENV === "production"||input.issuanceAuthority!=="development-telemetry-bootstrap"||!input.scopes.length||input.scopes.some(scope=>!alphaOperatorScopes.includes(scope)))
      throw new Error("Telemetry operator provisioning is unavailable.");
    const at = this.now();
    if (
      Date.parse(input.validUntil) <= Date.parse(at) ||
      Date.parse(input.validUntil) > Date.parse(at) + 30 * DAY
    )
      throw new Error("Telemetry operator grant is invalid.");
    const operatorPseudonym = deriveAlphaTelemetryPseudonym(
        this.ring,
        "operator",
        input.operatorId,
      ),
      organizationPseudonym = deriveAlphaTelemetryPseudonym(
        this.ring,
        "organization",
        input.organizationId,
      ),
      organizationPseudonyms = Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version)),
      keyVersion = this.ring.activeVersion;
    let grant!:AlphaOperatorGrant;
    await this.repository.mutate((state) => {
      if(state.grants.some(value=>value.operatorPseudonym===operatorPseudonym&&value.organizationPseudonym===organizationPseudonym&&value.status==="active"&&Date.parse(value.validUntil)>Date.parse(at)&&value.scopes.some(scope=>input.scopes.includes(scope))))throw new Error("Telemetry operator grant is ambiguous.");
      const ordinal=state.grants.filter(value=>value.operatorPseudonym===operatorPseudonym&&value.organizationPseudonym===organizationPseudonym&&value.issuedAt===at).length,
      base = {
        grantId: `grant_${digest(`${operatorPseudonym}:${organizationPseudonym}:${at}:${ordinal}`)}`,
        operatorPseudonym,
        organizationPseudonym,
        organizationPseudonyms,
        keyVersion,
        purpose: ALPHA_TELEMETRY_PURPOSE,
        scopes: [...new Set(input.scopes)].sort(),
        issuedAt: at,
        validUntil: input.validUntil,
        status: "active" as const,
      },
      next: AlphaOperatorGrant = {
        ...base,
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          keyVersion,
          JSON.stringify(base),
        ),
      };
      grant=next;
      state.grants.push(next);
      return state;
    });
    return grant;
  }
  async authorize(input: {
    operatorId: string;
    organizationId: string;
    scope: AlphaOperatorScope;
  }) {
    await this.expireCompliance(input.organizationId);
    const at = this.now(),state = await this.repository.read(at,Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version)));assertAlphaTelemetryRepositoryIntegrity(state,this.ring);
    const operatorPseudonyms=Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"operator",input.operatorId,version)),organizationPseudonyms=Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version)),matches=state.grants.filter(grant=>operatorPseudonyms.includes(grant.operatorPseudonym)&&organizationPseudonyms.includes(grant.organizationPseudonym)&&grant.status==="active"&&grant.scopes.includes(input.scope)&&Date.parse(grant.validUntil)>Date.parse(at));
    for (const grant of matches) {
        const { integrityMac, ...base } = grant;
        if (
          !verifyAlphaTelemetryValue(
            this.ring,
            grant.keyVersion,
            JSON.stringify(base),
            integrityMac,
          )
        )
          break;
    }
    if(matches.length===1)return matches[0]!;
    throw new Error("Telemetry operation is unavailable.");
  }
  async revoke(input: {
    operatorId: string;
    organizationId: string;
    grantId: string;
    issuanceAuthority: "development-telemetry-bootstrap";
  }) {
    if (process.env.NODE_ENV === "production"||input.issuanceAuthority!=="development-telemetry-bootstrap")
      throw new Error("Telemetry operator provisioning is unavailable.");
    const at = this.now();
    const state=await this.repository.read(at,Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version))),target=state.grants.find(value=>value.grantId===input.grantId);if(!target)throw new Error("Telemetry operation is unavailable.");const pending=await this.auditGrant(target,"revoke","blocked");
    await this.repository.mutate((state) => {
      const operatorPseudonyms = Object.keys(this.ring.keys).map((v) =>
          deriveAlphaTelemetryPseudonym(
            this.ring,
            "operator",
            input.operatorId,
            v,
          ),
        ),
        organizationPseudonyms = Object.keys(this.ring.keys).map((v) =>
          deriveAlphaTelemetryPseudonym(
            this.ring,
            "organization",
            input.organizationId,
            v,
          ),
        ),
        grant = state.grants.find(
          (v) =>
            v.grantId === input.grantId &&
            operatorPseudonyms.includes(v.operatorPseudonym) &&
            organizationPseudonyms.includes(v.organizationPseudonym),
        );
      if (!grant) throw new Error("Telemetry operation is unavailable.");
      const unsigned = {
        ...grant,
        status: "revoked" as const,
        complianceExpiresAt: new Date(Date.parse(at) + 90 * DAY).toISOString(),
      };
      delete (unsigned as Partial<AlphaOperatorGrant>).integrityMac;
      Object.assign(grant, unsigned, {
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          grant.keyVersion,
          JSON.stringify(unsigned),
        ),
      });
      return state;
    });
    await this.completeAudit(pending);
  }
  async expireCompliance(organizationId?:string){const at=this.now(),allowed=organizationId?new Set(Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",organizationId,version))):null;await this.repository.mutate(state=>{for(const grant of state.grants.filter(value=>value.status==="active"&&Date.parse(value.validUntil)<=Date.parse(at)&&(!allowed||allowed.has(value.organizationPseudonym)))){const unsigned={...grant,status:"revoked" as const,complianceExpiresAt:new Date(Date.parse(grant.validUntil)+90*DAY).toISOString()};delete (unsigned as Partial<AlphaOperatorGrant>).integrityMac;Object.assign(grant,unsigned,{integrityMac:signAlphaTelemetryValue(this.ring,grant.keyVersion,JSON.stringify(unsigned))});}return state;});await this.repository.sweep(at,allowed?[...allowed]:undefined);}
  private async auditGrant(
    grant: AlphaOperatorGrant,
    operation: AlphaTelemetryAudit["operation"],
    outcome: AlphaTelemetryAudit["outcome"],
  ) {
    const occurredAt = this.now();
    let audit!:AlphaTelemetryAudit;
    await this.repository.mutate((state) => {
      const ordinal=state.audits.filter(value=>value.operatorPseudonym===grant.operatorPseudonym&&value.organizationPseudonym===grant.organizationPseudonym&&value.operation===operation&&value.occurredAt===occurredAt).length;
      const base = {
        auditId: `audit_${digest(`${grant.grantId}:${operation}:${occurredAt}:${ordinal}`)}`,
        operatorPseudonym: grant.operatorPseudonym,
        organizationPseudonym: grant.organizationPseudonym,
        organizationPseudonyms: grant.organizationPseudonyms,
        keyVersion: grant.keyVersion,
        purpose: ALPHA_TELEMETRY_PURPOSE,
        operation,
        outcome,
        occurredAt,
        complianceExpiresAt: new Date(
          Date.parse(occurredAt) + 90 * DAY,
        ).toISOString(),
      },
      next: AlphaTelemetryAudit = {
        ...base,
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          grant.keyVersion,
          JSON.stringify(base),
        ),
      };
      audit=next;
      state.audits.push(next);
      return state;
    });
    return audit;
  }
  private async denied(
    input: { operatorId: string; organizationId: string },
    operation: AlphaTelemetryAudit["operation"],
  ) {
    const occurredAt = this.now(),
      keyVersion = this.ring.activeVersion,
      operatorPseudonym = deriveAlphaTelemetryPseudonym(
        this.ring,
        "operator",
        input.operatorId,
      ),
      organizationPseudonym = deriveAlphaTelemetryPseudonym(
        this.ring,
        "organization",
        input.organizationId,
      ),
      organizationPseudonyms = Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version)),
      baseSeed=`denied:${operatorPseudonym}:${organizationPseudonym}:${operation}:${occurredAt}`;
    let audit!:AlphaTelemetryAudit;
    await this.repository.mutate((state) => {
      const ordinal=state.audits.filter(value=>value.operatorPseudonym===operatorPseudonym&&value.organizationPseudonym===organizationPseudonym&&value.operation===operation&&value.occurredAt===occurredAt).length,
      base = {
        auditId: `audit_${digest(`${baseSeed}:${ordinal}`)}`,
        operatorPseudonym,
        organizationPseudonym,
        organizationPseudonyms,
        keyVersion,
        purpose: ALPHA_TELEMETRY_PURPOSE,
        operation,
        outcome: "denied" as const,
        occurredAt,
        complianceExpiresAt: new Date(
          Date.parse(occurredAt) + 90 * DAY,
        ).toISOString(),
      },
      next: AlphaTelemetryAudit = {
        ...base,
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          keyVersion,
          JSON.stringify(base),
        ),
      };
      audit=next;
      state.audits.push(next);
      return state;
    });
    return audit;
  }
  private async completeAudit(audit:AlphaTelemetryAudit){await this.repository.mutate(state=>{const current=state.audits.find(value=>value.auditId===audit.auditId);if(!current)throw new Error("Telemetry audit is unavailable.");const unsigned={...current,outcome:"success" as const};delete (unsigned as Partial<AlphaTelemetryAudit>).integrityMac;Object.assign(current,unsigned,{integrityMac:signAlphaTelemetryValue(this.ring,current.keyVersion,JSON.stringify(unsigned))});return state;});}
  private async granted(
    input: {
      operatorId: string;
      organizationId: string;
      scope: AlphaOperatorScope;
    },
    operation: AlphaTelemetryAudit["operation"],
  ) {
    try {
      return await this.authorize(input);
    } catch {
      await this.denied(input, operation);
      throw new Error("Telemetry operation is unavailable.");
    }
  }
  async consent(input: {
    operatorId: string;
    organizationId: string;
    grantId: string;
    writtenConsentProofDigest: string;
    validUntil: string;
    owner: AlphaTelemetryConsentOwner;
  }) {
    const grant = await this.granted(
      { ...input, scope: "consent-admin" },
      "consent",
    );
    const pending=await this.auditGrant(grant,"consent","blocked");
    const result = await input.owner.activate(input);
    await this.completeAudit(pending);
    return result;
  }
  async delete(input: {
    operatorId: string;
    organizationId: string;
    grantId: string;
    owner: AlphaTelemetryConsentOwner;
  }) {
    const grant = await this.granted(
      { ...input, scope: "telemetry-delete" },
      "delete",
    );
    const pending=await this.auditGrant(grant,"delete","blocked");
    const result = await input.owner.revoke({...input,auditId:pending.auditId});
    await this.completeAudit(pending);
    return result;
  }
  async read(input: { operatorId: string; organizationId: string }) {
    const grant = await this.granted(
        { ...input, scope: "telemetry-read" },
        "read",
      ),
      pending=await this.auditGrant(grant,"read","blocked"),state = await this.repository.read(this.now(),[grant.organizationPseudonym]),
      records = state.records.filter(
        (v) => v.organizationPseudonym === grant.organizationPseudonym,
      );
    for (const record of records) {
      const { integrityMac, ...base } = record;
      if (
        !verifyAlphaTelemetryValue(
          this.ring,
          record.keyVersion,
          JSON.stringify(base),
          integrityMac,
        )
      )
        throw new Error("Telemetry operation is unavailable.");
    }
    await this.completeAudit(pending);
    return records;
  }
  async sweep(input: { operatorId: string; organizationId: string }) {
    const grant = await this.granted(
        { ...input, scope: "retention-sweep" },
        "sweep",
      ),
      pending=await this.auditGrant(grant,"sweep","blocked");
    await this.consentOwner?.expireCompliance(input.organizationId);
    const removed = await this.repository.sweep(this.now(),Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version)));
    await this.completeAudit(pending);
    return { removed };
  }
  async verify(input: { operatorId: string; organizationId: string }) {
    const grant = await this.granted(
        { ...input, scope: "zero-verify" },
        "zero-verify",
      ),
      pending=await this.auditGrant(grant,"zero-verify","blocked"),zero = await this.repository.verifyZero(
        Object.keys(this.ring.keys).map((v) =>
          deriveAlphaTelemetryPseudonym(
            this.ring,
            "organization",
            input.organizationId,
            v,
          ),
        ),
      );
    await this.completeAudit(pending);
    return zero;
  }
}
