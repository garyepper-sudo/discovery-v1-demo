import { ACCEPTANCE_FRAMEWORK_ID,ACCEPTANCE_FRAMEWORK_VERSION,assertAcceptanceProfileRequirementsV1,type AcceptanceProfileRequirementsV1 } from "./authenticatedAlphaAcceptanceContracts";
export const AR3_CURRENT_BUILD_PROFILE_ID="ar3-current-build-conformance" as const;
export const AR3_CURRENT_BUILD_PROFILE_VERSION="version-1" as const;
export const AR3_ROUTE="/product-alpha/leadership-conversation" as const;
export const AR3_VIEWPORTS={desktop:{width:1440,height:1000},narrow:{width:390,height:844}} as const;
export const ar3CurrentBuildProfile:AcceptanceProfileRequirementsV1={schemaVersion:"1",kind:"acceptance-profile-requirements",framework:{id:ACCEPTANCE_FRAMEWORK_ID,version:ACCEPTANCE_FRAMEWORK_VERSION},profile:{id:AR3_CURRENT_BUILD_PROFILE_ID,version:AR3_CURRENT_BUILD_PROFILE_VERSION},requiredMeasurements:[
 {producer:"browser",phase:"browser-journey",multiplicity:"exactly-one",factIds:["browser-journey-ordered","ceo-authorized","director-authorized-parity","manager-unavailable","denied-not-found","desktop-viewport","narrow-viewport","hard-reload-reconstructed","successor-fresh-process-reconstructed","successor-not-started","successor-execution-not-claimed"]},
 {producer:"replay-recovery",phase:"replay-recovery",multiplicity:"exactly-one",factIds:["exact-replay","incompatible-replay","cas-conflict","recovered","durable-state-parity","same-product-question","distinct-successor","successor-duplicate-zero"]},
 {producer:"observability",phase:"event-observation",multiplicity:"exactly-one",factIds:["event-ordering","bounded-cardinality","protected-load-pairing","sink-parity"]},
 {producer:"lifecycle",phase:"resource-lifecycle",multiplicity:"exactly-one",factIds:["resource-plan-frozen","acknowledgement-loss-recovered","foreign-preserved","organizations-capability-measured"]},
 {producer:"scanner",phase:"surface-scan",multiplicity:"exactly-one",factIds:["scanner-sensitive","public-surfaces-clean"]},
 {producer:"cleanup",phase:"cleanup-attempts",multiplicity:"exactly-one",factIds:["cleanup-first-attempt","cleanup-second-converged","server-browser-roots-zero"]},
 {producer:"independent-zero",phase:"zero-verification",multiplicity:"exactly-one",factIds:["users-zero","sessions-zero","memberships-zero","organizations-zero-or-disabled","local-residue-zero"]},
],orderingConstraints:[{beforeFactId:"browser-journey-ordered",afterFactId:"public-surfaces-clean"},{beforeFactId:"public-surfaces-clean",afterFactId:"cleanup-first-attempt"},{beforeFactId:"cleanup-second-converged",afterFactId:"users-zero"}],identityBindings:["framework","profile","source","task"]};
assertAcceptanceProfileRequirementsV1(ar3CurrentBuildProfile);
