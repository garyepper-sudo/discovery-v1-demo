CREATE TABLE alpha_access_records (
  access_record_id text PRIMARY KEY,
  policy_id text NOT NULL,
  policy_version text NOT NULL,
  consumer_id text NOT NULL,
  organization_id text NOT NULL,
  relationship text NOT NULL,
  experience text NOT NULL,
  scope_type text NOT NULL,
  scope_id text NOT NULL,
  status text NOT NULL,
  granted_at timestamptz NOT NULL,
  granted_by text NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by text,
  superseded_at timestamptz,
  superseded_by text,
  supersedes_access_record_id text REFERENCES alpha_access_records(access_record_id),
  administrative_idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT alpha_access_policy_check CHECK (
    policy_id = 'alpha-explicit-allowlist-disclosure' AND policy_version = '1'
  ),
  CONSTRAINT alpha_access_identity_check CHECK (
    consumer_id <> '' AND consumer_id <> '*' AND consumer_id = btrim(consumer_id)
    AND organization_id <> '' AND organization_id <> '*'
    AND organization_id = btrim(organization_id)
    AND access_record_id <> '' AND access_record_id <> '*'
  ),
  CONSTRAINT alpha_access_relationship_check CHECK (relationship = 'allowed_alpha_user'),
  CONSTRAINT alpha_access_experience_check CHECK (experience = 'organization'),
  CONSTRAINT alpha_access_scope_check CHECK (
    scope_type = 'organization' AND scope_id = organization_id
  ),
  CONSTRAINT alpha_access_status_check CHECK (status IN ('active', 'revoked', 'superseded')),
  CONSTRAINT alpha_access_expiry_check CHECK (expires_at IS NULL OR expires_at >= granted_at),
  CONSTRAINT alpha_access_lifecycle_shape_check CHECK (
    (status = 'active' AND revoked_at IS NULL AND revoked_by IS NULL
      AND superseded_at IS NULL AND superseded_by IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL
      AND revoked_at >= granted_at AND superseded_at IS NULL AND superseded_by IS NULL)
    OR (status = 'superseded' AND superseded_at IS NOT NULL AND superseded_by IS NOT NULL
      AND superseded_at >= granted_at AND revoked_at IS NULL AND revoked_by IS NULL)
  ),
  CONSTRAINT alpha_access_no_self_successor_check CHECK (
    supersedes_access_record_id IS NULL OR supersedes_access_record_id <> access_record_id
  )
);

CREATE UNIQUE INDEX alpha_access_one_active_uq
  ON alpha_access_records(policy_id, policy_version, consumer_id, organization_id, experience)
  WHERE status = 'active';
CREATE UNIQUE INDEX alpha_access_successor_uq
  ON alpha_access_records(supersedes_access_record_id)
  WHERE supersedes_access_record_id IS NOT NULL;
CREATE INDEX alpha_access_current_lookup_idx
  ON alpha_access_records(consumer_id, organization_id, experience, policy_id, policy_version);
CREATE INDEX alpha_access_consumer_history_idx
  ON alpha_access_records(consumer_id, granted_at DESC);
CREATE INDEX alpha_access_organization_history_idx
  ON alpha_access_records(organization_id, granted_at DESC);

CREATE TABLE alpha_access_lifecycle_events (
  event_id text PRIMARY KEY,
  access_record_id text NOT NULL REFERENCES alpha_access_records(access_record_id),
  actor text NOT NULL,
  action text NOT NULL CHECK (action IN ('grant', 'revoke', 'supersede')),
  reason_code text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  occurred_at timestamptz NOT NULL,
  predecessor_access_record_id text REFERENCES alpha_access_records(access_record_id),
  successor_access_record_id text REFERENCES alpha_access_records(access_record_id)
);
CREATE INDEX alpha_lifecycle_access_time_idx
  ON alpha_access_lifecycle_events(access_record_id, occurred_at DESC);

CREATE TABLE alpha_disclosure_audit_events (
  audit_event_id text PRIMARY KEY,
  decision_id text NOT NULL UNIQUE,
  event_type text NOT NULL CHECK (event_type = 'alpha-disclosure-decision-resolved'),
  event_version text NOT NULL CHECK (event_version = '1'),
  policy_id text NOT NULL CHECK (policy_id = 'alpha-explicit-allowlist-disclosure'),
  policy_version text NOT NULL CHECK (policy_version = '1'),
  consumer_id text NOT NULL CHECK (consumer_id <> '' AND consumer_id <> '*'),
  organization_id text NOT NULL CHECK (organization_id <> '' AND organization_id <> '*'),
  experience text NOT NULL CHECK (experience = 'organization'),
  access_record_id text REFERENCES alpha_access_records(access_record_id),
  disposition text NOT NULL CHECK (
    disposition IN ('disclosed', 'partially-disclosed', 'withheld', 'revoked', 'invalid')
  ),
  reason_codes jsonb NOT NULL CHECK (jsonb_typeof(reason_codes) = 'array'),
  source_revision_ids jsonb NOT NULL CHECK (jsonb_typeof(source_revision_ids) = 'array'),
  authority_receipt_ids jsonb NOT NULL CHECK (jsonb_typeof(authority_receipt_ids) = 'array'),
  resolved_at timestamptz NOT NULL,
  request_correlation_id text NOT NULL UNIQUE,
  payload_hash text NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX alpha_audit_organization_time_idx
  ON alpha_disclosure_audit_events(organization_id, resolved_at DESC);
CREATE INDEX alpha_audit_consumer_time_idx
  ON alpha_disclosure_audit_events(consumer_id, resolved_at DESC);
CREATE INDEX alpha_audit_policy_review_idx
  ON alpha_disclosure_audit_events(policy_id, policy_version, resolved_at DESC);

CREATE FUNCTION alpha_reject_append_only_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'append-only table % cannot be %', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER alpha_lifecycle_append_only
  BEFORE UPDATE OR DELETE ON alpha_access_lifecycle_events
  FOR EACH ROW EXECUTE FUNCTION alpha_reject_append_only_mutation();
CREATE TRIGGER alpha_audit_append_only
  BEFORE UPDATE OR DELETE ON alpha_disclosure_audit_events
  FOR EACH ROW EXECUTE FUNCTION alpha_reject_append_only_mutation();

CREATE FUNCTION alpha_enforce_access_transition() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF ROW(
    OLD.access_record_id, OLD.policy_id, OLD.policy_version, OLD.consumer_id,
    OLD.organization_id, OLD.relationship, OLD.experience, OLD.scope_type,
    OLD.scope_id, OLD.granted_at, OLD.granted_by, OLD.expires_at,
    OLD.supersedes_access_record_id, OLD.administrative_idempotency_key, OLD.created_at
  ) IS DISTINCT FROM ROW(
    NEW.access_record_id, NEW.policy_id, NEW.policy_version, NEW.consumer_id,
    NEW.organization_id, NEW.relationship, NEW.experience, NEW.scope_type,
    NEW.scope_id, NEW.granted_at, NEW.granted_by, NEW.expires_at,
    NEW.supersedes_access_record_id, NEW.administrative_idempotency_key, NEW.created_at
  ) THEN
    RAISE EXCEPTION 'alpha access identity and grant provenance are immutable'
      USING ERRCODE = '55000';
  END IF;
  IF OLD.status <> 'active' OR NEW.status NOT IN ('revoked', 'superseded') THEN
    RAISE EXCEPTION 'invalid alpha access lifecycle transition'
      USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER alpha_access_terminal_transition
  BEFORE UPDATE ON alpha_access_records
  FOR EACH ROW EXECUTE FUNCTION alpha_enforce_access_transition();

COMMENT ON TABLE alpha_access_lifecycle_events IS
  'Append-only Alpha administrative lifecycle history; UPDATE and DELETE are rejected by trigger.';
COMMENT ON TABLE alpha_disclosure_audit_events IS
  'Append-only Alpha disclosure decision audit; contains references, never protected cognition bodies.';
COMMENT ON COLUMN alpha_access_records.updated_at IS
  'May change only during the single active-to-revoked or active-to-superseded transition.';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'discovery_alpha_application') THEN
    CREATE ROLE discovery_alpha_application NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'discovery_alpha_administration') THEN
    CREATE ROLE discovery_alpha_administration NOLOGIN;
  END IF;
END;
$$;

REVOKE ALL ON alpha_access_records, alpha_access_lifecycle_events,
  alpha_disclosure_audit_events FROM PUBLIC;
GRANT SELECT ON alpha_access_records TO discovery_alpha_application;
GRANT INSERT, SELECT ON alpha_disclosure_audit_events TO discovery_alpha_application;
GRANT SELECT, INSERT, UPDATE ON alpha_access_records TO discovery_alpha_administration;
GRANT SELECT, INSERT ON alpha_access_lifecycle_events TO discovery_alpha_administration;
GRANT SELECT ON alpha_disclosure_audit_events TO discovery_alpha_administration;
