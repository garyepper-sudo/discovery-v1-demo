import type { AlphaTelemetryRepository } from "./alphaTelemetryRepository";
import type { AlphaTelemetryConsentOwner } from "./alphaTelemetryConsentOwner";
import type { AlphaTelemetryOperatorAccess } from "./alphaTelemetryOperatorAccess";

export type AlphaTelemetryMaintenanceReceiptV1 = {
  contractVersion: "1";
  invocationId: string;
  cutoffTime: string;
  rowsDeleted: number;
  rowsEligibleAfterSweep: number;
  oldestEligibleTelemetryAgeMs: number | null;
  completionStatus: "completed";
  durationMs: number;
};

/** ALPHA-OPS invokes this owner via the protected cron route. It exposes no
 * telemetry payloads and leaves retention classification to the existing owner. */
export async function runAlphaTelemetryMaintenance(input:{invocationId:string;now:()=>string;repository:AlphaTelemetryRepository;consent:AlphaTelemetryConsentOwner;operators:AlphaTelemetryOperatorAccess}):Promise<AlphaTelemetryMaintenanceReceiptV1>{
  const started=Date.now(),cutoffTime=input.now();
  await input.consent.expireCompliance();
  await input.operators.expireCompliance();
  const rowsDeleted=await input.repository.sweep(cutoffTime);
  const remaining=await input.repository.read(cutoffTime);
  const eligible=remaining.records.filter(record=>Date.parse(record.expiresAt)<=Date.parse(cutoffTime));
  const oldestEligibleTelemetryAgeMs=eligible.length?Math.max(...eligible.map(record=>Date.parse(cutoffTime)-Date.parse(record.expiresAt))):null;
  if(oldestEligibleTelemetryAgeMs!==null)throw new Error("Alpha telemetry maintenance is incomplete.");
  return {contractVersion:"1",invocationId:input.invocationId,cutoffTime,rowsDeleted,rowsEligibleAfterSweep:0,oldestEligibleTelemetryAgeMs:null,completionStatus:"completed",durationMs:Date.now()-started};
}
