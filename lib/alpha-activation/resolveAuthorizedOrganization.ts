import {
  preflightAlphaOrganizationAccess,
  type AlphaOrganizationAccessRecord,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import type { AlphaAccessRecordRepository } from "../../db/governance/types";

const VALID_ORGANIZATION_ID = /^[a-zA-Z0-9_-]+$/;

export type AuthorizedOrganizationResolution =
  | {
      status: "resolved";
      organizationId: string;
      resolutionSource:
        | "single-authorized-organization"
        | "configured-authorized-organization"
        | "explicit-authorized-selection";
    }
  | {
      status: "denied";
      reason:
        | "no-active-access"
        | "requested-organization-not-authorized"
        | "configured-organization-not-authorized"
        | "ambiguous-authorized-organizations"
        | "invalid-organization-id";
    };

function validOptionalOrganizationId(value: string | undefined): boolean {
  return value === undefined || VALID_ORGANIZATION_ID.test(value);
}

export async function resolveAuthorizedOrganization(input: {
  identity: VerifiedConsumerIdentity;
  requestedOrganizationId?: string;
  configuredOrganizationId?: string;
  resolvedAt: string;
  accessRepository: {
    findAccessRecordsForConsumer: NonNullable<
      AlphaAccessRecordRepository["findAccessRecordsForConsumer"]
    >;
  };
}): Promise<AuthorizedOrganizationResolution> {
  if (
    !validOptionalOrganizationId(input.requestedOrganizationId) ||
    !validOptionalOrganizationId(input.configuredOrganizationId)
  ) {
    return { status: "denied", reason: "invalid-organization-id" };
  }

  let records: readonly AlphaOrganizationAccessRecord[];
  try {
    records = await input.accessRepository.findAccessRecordsForConsumer({
      consumerId: input.identity.consumerId,
      experience: "organization",
      resolvedAt: input.resolvedAt,
    });
  } catch {
    return { status: "denied", reason: "no-active-access" };
  }

  const recordsByOrganization = new Map<
    string,
    AlphaOrganizationAccessRecord[]
  >();
  for (const record of records) {
    const organizationRecords =
      recordsByOrganization.get(record.organizationId) ?? [];
    organizationRecords.push(record);
    recordsByOrganization.set(record.organizationId, organizationRecords);
  }

  const authorizedOrganizations = [...recordsByOrganization.entries()]
    .filter(([organizationId, organizationRecords]) => {
      const preflight = preflightAlphaOrganizationAccess(
        {
          identity: input.identity,
          organizationId,
          experience: "organization",
          resolvedAt: input.resolvedAt,
        },
        { findAccessRecords: () => organizationRecords },
      );
      return preflight.disposition === "eligible";
    })
    .map(([organizationId]) => organizationId)
    .sort((left, right) => left.localeCompare(right));

  if (input.configuredOrganizationId) {
    if (!authorizedOrganizations.includes(input.configuredOrganizationId)) {
      return {
        status: "denied",
        reason: "configured-organization-not-authorized",
      };
    }
    if (
      input.requestedOrganizationId &&
      input.requestedOrganizationId !== input.configuredOrganizationId
    ) {
      return {
        status: "denied",
        reason: "requested-organization-not-authorized",
      };
    }
    return {
      status: "resolved",
      organizationId: input.configuredOrganizationId,
      resolutionSource: "configured-authorized-organization",
    };
  }

  if (input.requestedOrganizationId) {
    if (!authorizedOrganizations.includes(input.requestedOrganizationId)) {
      return {
        status: "denied",
        reason: "requested-organization-not-authorized",
      };
    }
    return {
      status: "resolved",
      organizationId: input.requestedOrganizationId,
      resolutionSource: "explicit-authorized-selection",
    };
  }

  if (authorizedOrganizations.length === 0) {
    return { status: "denied", reason: "no-active-access" };
  }
  if (authorizedOrganizations.length > 1) {
    return {
      status: "denied",
      reason: "ambiguous-authorized-organizations",
    };
  }
  return {
    status: "resolved",
    organizationId: authorizedOrganizations[0],
    resolutionSource: "single-authorized-organization",
  };
}
