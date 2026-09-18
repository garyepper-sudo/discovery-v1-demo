-- Narrow durable registry for the canonical OrganizationIdentityOwner only.
-- It deliberately creates neither Runtime nor authorization/product state.
CREATE TABLE organization_identities (
  organization_id text PRIMARY KEY,
  creation_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  provenance text NOT NULL,
  created_at timestamptz NOT NULL,
  CONSTRAINT organization_identities_identity_check CHECK (
    organization_id ~ '^organization:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND creation_key <> '' AND creation_key <> '*' AND creation_key = btrim(creation_key)
    AND display_name <> '' AND display_name <> '*' AND display_name = btrim(display_name)
    AND provenance <> '' AND provenance <> '*' AND provenance = btrim(provenance)
  )
);

REVOKE ALL ON organization_identities FROM PUBLIC;
GRANT SELECT ON organization_identities TO discovery_alpha_application;
GRANT SELECT, INSERT ON organization_identities TO discovery_alpha_administration;
