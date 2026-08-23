import { createHash } from "node:crypto";
import {
  ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION,
  ALPHA_TELEMETRY_PURPOSE,
  type AlphaConsentReceipt,
  type AlphaDeletionReceipt,
} from "./alphaProductTelemetryContracts";
import {
  deriveAlphaTelemetryPseudonym,
  signAlphaTelemetryValue,
  verifyAlphaTelemetryValue,
  type AlphaTelemetryKeyRing,
} from "./alphaTelemetryPseudonymization";
import {assertAlphaTelemetryRepositoryIntegrity,type AlphaTelemetryRepository } from "./alphaTelemetryRepository";
const DAY = 86_400_000,
  token = (value: string) => createHash("sha256").update(value).digest("hex");
export class AlphaTelemetryConsentOwner {
  constructor(
    private repository: AlphaTelemetryRepository,
    private ring: AlphaTelemetryKeyRing,
    private now: () => string,
  ) {}
  private assertGrantInState(state:Awaited<ReturnType<AlphaTelemetryRepository["read"]>>,input:{organizationId:string;operatorId:string;grantId:string},scope:"consent-admin"|"telemetry-delete",at:string){const operatorPseudonyms=Object.keys(this.ring.keys).map(v=>deriveAlphaTelemetryPseudonym(this.ring,"operator",input.operatorId,v)),organizationPseudonyms=Object.keys(this.ring.keys).map(v=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,v)),matches=state.grants.filter(v=>v.grantId===input.grantId&&operatorPseudonyms.includes(v.operatorPseudonym)&&organizationPseudonyms.includes(v.organizationPseudonym)&&v.status==="active"&&v.scopes.includes(scope)&&v.purpose===ALPHA_TELEMETRY_PURPOSE&&Date.parse(v.validUntil)>Date.parse(at));if(matches.length!==1)throw new Error("Telemetry consent operation is unavailable.");const grant=matches[0]!,{integrityMac,...base}=grant;if(!this.ring.keys[grant.keyVersion]||!verifyAlphaTelemetryValue(this.ring,grant.keyVersion,JSON.stringify(base),integrityMac))throw new Error("Telemetry consent operation is unavailable.");return grant;}
  private validReceipt(receipt: AlphaConsentReceipt) {
    const { integrityMac, ...base } = receipt;
    return (
      receipt.purpose === ALPHA_TELEMETRY_PURPOSE &&
      receipt.contractVersion === ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION &&
      verifyAlphaTelemetryValue(
        this.ring,
        receipt.keyVersion,
        JSON.stringify(base),
        integrityMac,
      )
    );
  }
  private async authority(input: {
    organizationId: string;
    operatorId: string;
    grantId: string;
  }, scope: "consent-admin" | "telemetry-delete") {
    const at = this.now(),
      state = await this.repository.read(at,Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version))),
      operatorPseudonyms = Object.keys(this.ring.keys).map((v) =>
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
      grants = (assertAlphaTelemetryRepositoryIntegrity(state,this.ring),state.grants.filter(
        (v) =>
          v.grantId === input.grantId &&
          operatorPseudonyms.includes(v.operatorPseudonym) &&
          organizationPseudonyms.includes(v.organizationPseudonym) &&
          v.status === "active" &&
          v.scopes.includes(scope) &&
          v.purpose === ALPHA_TELEMETRY_PURPOSE &&
          Date.parse(v.validUntil) > Date.parse(at),
      ));
    if (grants.length !== 1) throw new Error("Telemetry consent operation is unavailable.");
    const grant=grants[0]!, {integrityMac,...base}=grant;
    if(!this.ring.keys[grant.keyVersion]||!verifyAlphaTelemetryValue(this.ring,grant.keyVersion,JSON.stringify(base),integrityMac))throw new Error("Telemetry consent operation is unavailable.");
    return grant;
  }
  async activate(input: {
    organizationId: string;
    operatorId: string;
    grantId: string;
    writtenConsentProofDigest: string;
    validUntil: string;
  }) {
    await this.authority(input, "consent-admin");
    const at = this.now();
    if (
      !/^[a-f0-9]{64}$/u.test(input.writtenConsentProofDigest) ||
      Date.parse(input.validUntil) <= Date.parse(at) ||
      Date.parse(input.validUntil) > Date.parse(at) + 365 * DAY
    )
      throw new Error("Telemetry consent is invalid.");
    const pseudonyms = Object.keys(this.ring.keys).map((v) =>
        deriveAlphaTelemetryPseudonym(
          this.ring,
          "organization",
          input.organizationId,
          v,
        ),
      ),
      organizationPseudonym = deriveAlphaTelemetryPseudonym(
        this.ring,
        "organization",
        input.organizationId,
      ),
      keyVersion = this.ring.activeVersion,
      base = {
        receiptId: `consent_${token(`${organizationPseudonym}:${at}:${input.writtenConsentProofDigest}`)}`,
        organizationPseudonym,
        organizationPseudonyms: pseudonyms,
        keyVersion,
        purpose: ALPHA_TELEMETRY_PURPOSE,
        contractVersion: ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION,
        writtenConsentProofDigest: input.writtenConsentProofDigest,
        activatedAt: at,
        validUntil: input.validUntil,
        status: "active" as const,
      },
      receipt: AlphaConsentReceipt = {
        ...base,
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          keyVersion,
          JSON.stringify(base),
        ),
      };
    await this.repository.mutate((state) => {
      this.assertGrantInState(state,input,"consent-admin",at);
      const replay = state.consents.find(
        (v) => v.receiptId === receipt.receiptId,
      );
      if (replay) {
        if (JSON.stringify(replay) !== JSON.stringify(receipt))
          throw new Error("Telemetry consent replay is incompatible.");
        return state;
      }
      for (const old of state.consents.filter(
        (v) =>
          pseudonyms.includes(v.organizationPseudonym) && v.status === "active",
      )) {
        const unsigned = {
          ...old,
          status: "revoked" as const,
          complianceExpiresAt: new Date(
            Date.parse(at) + 90 * DAY,
          ).toISOString(),
        };
        delete (unsigned as Partial<AlphaConsentReceipt>).integrityMac;
        Object.assign(old, unsigned, {
          integrityMac: signAlphaTelemetryValue(
            this.ring,
            old.keyVersion,
            JSON.stringify(unsigned),
          ),
        });
      }
      state.consents.push(receipt);
      return state;
    });
    return receipt;
  }
  async expireCompliance(organizationId?: string) {
    const at = this.now();
    const allowed = organizationId
      ? new Set(Object.keys(this.ring.keys).map((version) =>
          deriveAlphaTelemetryPseudonym(this.ring, "organization", organizationId, version),
        ))
      : null;
    await this.repository.mutate((state) => {
      for (const receipt of state.consents.filter(
        (v) =>
          v.status === "active" &&
          Date.parse(v.validUntil) <= Date.parse(at) &&
          (!allowed || allowed.has(v.organizationPseudonym)),
      )) {
        const unsigned = {
          ...receipt,
          status: "revoked" as const,
          complianceExpiresAt: new Date(
            Date.parse(receipt.validUntil) + 90 * DAY,
          ).toISOString(),
        };
        delete (unsigned as Partial<AlphaConsentReceipt>).integrityMac;
        Object.assign(receipt, unsigned, {
          integrityMac: signAlphaTelemetryValue(
            this.ring,
            receipt.keyVersion,
            JSON.stringify(unsigned),
          ),
        });
      }
      return state;
    });
    await this.repository.sweep(at, allowed ? [...allowed] : undefined);
  }
  async current(organizationId: string) {
    await this.expireCompliance(organizationId);
    const at = this.now(),
      state = await this.repository.read(at,Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",organizationId,version))),
      versions = [
        ...state.records.map((v) => v.keyVersion),
        ...state.consents.map((v) => v.keyVersion),
        ...state.grants.map((v) => v.keyVersion),
        ...state.audits.map((v) => v.keyVersion),
        ...state.deletions.flatMap((v) => v.keyVersions),
      ];
    if (versions.some((v) => !this.ring.keys[v]))
      throw new Error("Telemetry historical key is unavailable.");
    assertAlphaTelemetryRepositoryIntegrity(state,this.ring);
    const pseudonyms = Object.keys(this.ring.keys).map((v) =>
        deriveAlphaTelemetryPseudonym(
          this.ring,
          "organization",
          organizationId,
          v,
        ),
      ),
      matches = state.consents.filter(
        (v) =>
          pseudonyms.includes(v.organizationPseudonym) &&
          v.status === "active" &&
          Date.parse(v.validUntil) > Date.parse(at),
      );
    if (matches.length > 1) throw new Error("Telemetry consent is ambiguous.");
    if (matches[0] && !this.validReceipt(matches[0]))
      throw new Error("Telemetry consent is invalid.");
    return matches[0] ?? null;
  }
  async revoke(input: {
    organizationId: string;
    operatorId: string;
    grantId: string;
    auditId?:string;
  }) {
    await this.authority(input, "telemetry-delete");
    const at = this.now(),
      before = await this.repository.read(at,Object.keys(this.ring.keys).map(version=>deriveAlphaTelemetryPseudonym(this.ring,"organization",input.organizationId,version))),
      versions = [
        ...before.records.map((v) => v.keyVersion),
        ...before.consents.map((v) => v.keyVersion),
        ...before.grants.map((v) => v.keyVersion),
        ...before.audits.map((v) => v.keyVersion),
        ...before.deletions.flatMap((v) => v.keyVersions),
      ];
    if (versions.some((v) => !this.ring.keys[v]))
      throw new Error("Telemetry historical key is unavailable.");
    const keyVersions = Object.keys(this.ring.keys),
      pseudonyms = keyVersions.map((v) =>
        deriveAlphaTelemetryPseudonym(
          this.ring,
          "organization",
          input.organizationId,
          v,
        ),
      );
    await this.repository.mutate((state) => {
      this.assertGrantInState(state,input,"telemetry-delete",at);
      for (const receipt of state.consents.filter(
        (v) =>
          pseudonyms.includes(v.organizationPseudonym) &&
          (v.status === "active" || v.status === "deletion-pending"),
      )) {
        const unsigned = {
          ...receipt,
          status: "deletion-pending" as const,
          complianceExpiresAt: new Date(
            Date.parse(at) + 90 * DAY,
          ).toISOString(),
        };
        delete (unsigned as Partial<AlphaConsentReceipt>).integrityMac;
        Object.assign(receipt, unsigned, {
          integrityMac: signAlphaTelemetryValue(
            this.ring,
            receipt.keyVersion,
            JSON.stringify(unsigned),
          ),
        });
      }
      return state;
    });
    const deleted = await this.repository.deleteOrganization(pseudonyms, at,input.auditId?[input.auditId]:[]),
      zero = await this.repository.verifyZero(pseudonyms);
    if (
      zero.payloadRecords ||
      zero.organizationIndexEntries ||
      zero.expiryIndexEntries ||
      zero.feedbackIndexEntries||zero.auditEntries!==(input.auditId?1:0)
    )
      throw new Error("Telemetry deletion is incomplete.");
    const unsigned = {
        receiptId: `deletion_${token(`${pseudonyms[0]}:${at}`)}`,
        organizationPseudonym: pseudonyms[0]!,
        organizationPseudonyms: pseudonyms,
        keyVersion: this.ring.activeVersion,
        keyVersions,
        deletedPayloadCount: deleted,
        occurredAt: at,
        complianceExpiresAt: new Date(Date.parse(at) + 90 * DAY).toISOString(),
      },
      deletion: AlphaDeletionReceipt = {
        ...unsigned,
        integrityMac: signAlphaTelemetryValue(
          this.ring,
          this.ring.activeVersion,
          JSON.stringify(unsigned),
        ),
      };
    await this.repository.mutate((state) => {
      for (const receipt of state.consents.filter(
        (v) =>
          pseudonyms.includes(v.organizationPseudonym) &&
          v.status === "deletion-pending",
      )) {
        const completed = { ...receipt, status: "revoked" as const };
        delete (completed as Partial<AlphaConsentReceipt>).integrityMac;
        Object.assign(receipt, completed, {
          integrityMac: signAlphaTelemetryValue(
            this.ring,
            receipt.keyVersion,
            JSON.stringify(completed),
          ),
        });
      }
      if (!state.deletions.some((v) => v.receiptId === deletion.receiptId))
        state.deletions.push(deletion);
      return state;
    });
    return { outcome: "deleted" as const, deleted };
  }
}
