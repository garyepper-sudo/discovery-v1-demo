CREATE TABLE participant_reference_access_policies (
  organization_id text PRIMARY KEY CHECK (organization_id <> '' AND organization_id = btrim(organization_id)),
  mode text NOT NULL CHECK (mode = 'participant-reference-v1'),
  issued_by text NOT NULL CHECK (issued_by <> '' AND issued_by = btrim(issued_by)),
  operation_id text NOT NULL UNIQUE CHECK (operation_id <> '' AND operation_id = btrim(operation_id)),
  request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL
);

CREATE TABLE participant_reference_access_grants (
  grant_id text PRIMARY KEY CHECK (grant_id <> '' AND grant_id = btrim(grant_id)),
  organization_id text NOT NULL REFERENCES participant_reference_access_policies(organization_id),
  participant_ref text NOT NULL CHECK (participant_ref ~ '^participant:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  scope text NOT NULL CHECK (scope IN ('organization','meeting-series')),
  meeting_series_id text,
  status text NOT NULL CHECK (status IN ('active','revoked')),
  issued_by text NOT NULL,
  operation_id text NOT NULL UNIQUE,
  request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoked_by text,
  revocation_operation_id text UNIQUE,
  revocation_fingerprint text,
  supersedes_grant_id text REFERENCES participant_reference_access_grants(grant_id),
  CHECK ((scope = 'organization' AND meeting_series_id IS NULL) OR (scope = 'meeting-series' AND meeting_series_id IS NOT NULL)),
  CHECK ((status = 'active' AND revoked_at IS NULL) OR (status = 'revoked' AND revoked_at IS NOT NULL))
);
CREATE UNIQUE INDEX participant_reference_active_org_grant_uq ON participant_reference_access_grants(organization_id,participant_ref,scope) WHERE status='active' AND scope='organization';
CREATE UNIQUE INDEX participant_reference_active_meeting_grant_uq ON participant_reference_access_grants(organization_id,participant_ref,scope,meeting_series_id) WHERE status='active' AND scope='meeting-series';
CREATE INDEX participant_reference_current_access_idx ON participant_reference_access_grants(organization_id,participant_ref,scope,meeting_series_id,status);
