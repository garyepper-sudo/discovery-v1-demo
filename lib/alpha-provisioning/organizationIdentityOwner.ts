import { randomUUID } from "node:crypto";

import type { Sql, TransactionSql } from "postgres";

type Executor = Sql<Record<string, unknown>> | TransactionSql<Record<string, unknown>>;

export type OrganizationIdentityCreationV1 = {
  creationKey: string;
  displayName: string;
  provenance: string;
  createdAt: string;
};

export type OrganizationIdentityV1 = OrganizationIdentityCreationV1 & {
  organizationId: string;
};

function exact(value: string, label: string, maximum: number): void {
  if (!value || value === "*" || value !== value.trim() || value.includes("\0") || value.length > maximum) {
    throw new Error(`Organization identity ${label} is invalid.`);
  }
}

function same(row: OrganizationIdentityV1, input: OrganizationIdentityCreationV1): boolean {
  return row.displayName === input.displayName && row.provenance === input.provenance;
}

function row(value: { organization_id: string; creation_key: string; display_name: string; provenance: string; created_at: Date | string }): OrganizationIdentityV1 {
  return {
    organizationId: value.organization_id,
    creationKey: value.creation_key,
    displayName: value.display_name,
    provenance: value.provenance,
    createdAt: new Date(value.created_at).toISOString(),
  };
}

/**
 * The sole production allocator for durable organization identity. It records
 * no memberships, grants, Runtime, Product, source, or meeting state.
 */
export class OrganizationIdentityOwner {
  constructor(private readonly sql: Sql<Record<string, unknown>>) {}

  async createOrResolveOrganization(input: OrganizationIdentityCreationV1): Promise<OrganizationIdentityV1> {
    exact(input.creationKey, "creation key", 256);
    exact(input.displayName, "display name", 500);
    exact(input.provenance, "provenance", 1000);
    if (!Number.isFinite(Date.parse(input.createdAt)) || new Date(input.createdAt).toISOString() !== input.createdAt) {
      throw new Error("Organization identity creation time is invalid.");
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await this.sql.begin("isolation level serializable", async transaction => {
          await transaction`SELECT pg_advisory_xact_lock(hashtextextended(${`organization-identity:${input.creationKey}`}, 0))`;
          const existing = await transaction<{ organization_id: string; creation_key: string; display_name: string; provenance: string; created_at: Date | string }[]>`
            SELECT organization_id, creation_key, display_name, provenance, created_at
            FROM organization_identities
            WHERE creation_key = ${input.creationKey}
          `;
          if (existing.length > 1) throw new Error("Organization identity creation key is ambiguous.");
          if (existing[0]) {
            const resolved = row(existing[0]);
            if (!same(resolved, input)) throw new Error("Organization identity creation facts conflict.");
            return resolved;
          }
          const organizationId = `organization_${randomUUID()}`;
          const created = await transaction<{ organization_id: string; creation_key: string; display_name: string; provenance: string; created_at: Date | string }[]>`
            INSERT INTO organization_identities (organization_id, creation_key, display_name, provenance, created_at)
            VALUES (${organizationId}, ${input.creationKey}, ${input.displayName}, ${input.provenance}, ${input.createdAt})
            RETURNING organization_id, creation_key, display_name, provenance, created_at
          `;
          if (created.length !== 1) throw new Error("Organization identity could not be created.");
          return row(created[0]);
        });
      } catch (error) {
        if ((error as { code?: string }).code !== "40001" || attempt === 2) throw error;
      }
    }
    throw new Error("Organization identity could not be created.");
  }
}
