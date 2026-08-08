CREATE TABLE alpha_actor_mappings (
  mapping_id text PRIMARY KEY,
  mapping_revision integer NOT NULL CHECK (mapping_revision >= 1),
  actor_ref text NOT NULL UNIQUE,
  organization_id text NOT NULL,
  subject_lookup_digest text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'revoked')),
  assigned_at timestamptz NOT NULL,
  revoked_at timestamptz,
  predecessor_mapping_id text REFERENCES alpha_actor_mappings(mapping_id),
  assignment_idempotency_key text NOT NULL UNIQUE,
  CONSTRAINT alpha_actor_mapping_identity_check CHECK (
    mapping_id <> '' AND mapping_id <> '*' AND mapping_id = btrim(mapping_id)
    AND actor_ref ~ '^actor:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND organization_id <> '' AND organization_id <> '*' AND organization_id = btrim(organization_id)
    AND subject_lookup_digest ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT alpha_actor_mapping_lifecycle_check CHECK (
    (status = 'active' AND revoked_at IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_at >= assigned_at)
  )
);

CREATE UNIQUE INDEX alpha_actor_mapping_active_subject_uq
  ON alpha_actor_mappings(organization_id, subject_lookup_digest)
  WHERE status = 'active';
CREATE INDEX alpha_actor_mapping_subject_history_idx
  ON alpha_actor_mappings(organization_id, subject_lookup_digest, mapping_revision);

-- Historical Alpha records are intentionally not backfilled. A mapping is
-- assigned only by an explicitly authorized owner operation.

REVOKE ALL ON alpha_actor_mappings FROM PUBLIC;
GRANT SELECT ON alpha_actor_mappings TO discovery_alpha_application;
GRANT SELECT, INSERT, UPDATE ON alpha_actor_mappings TO discovery_alpha_administration;
