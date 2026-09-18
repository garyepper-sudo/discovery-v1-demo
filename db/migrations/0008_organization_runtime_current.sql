-- PostgreSQL is the single mutable/current Organization Runtime owner.
-- Existing Blob Runtime objects remain untouched as recovery artifacts.
CREATE TABLE organization_runtime_current (
  organization_id text PRIMARY KEY REFERENCES organization_identities(organization_id) ON DELETE RESTRICT CHECK (organization_id <> '' AND organization_id <> '*' AND organization_id = btrim(organization_id)),
  revision bigint NOT NULL CHECK (revision >= 1),
  payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'),
  payload_digest text NOT NULL CHECK (payload_digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

REVOKE ALL ON organization_runtime_current FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE ON organization_runtime_current TO discovery_alpha_application;
