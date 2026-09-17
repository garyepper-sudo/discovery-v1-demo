-- Additive production-durable storage for the existing Chief V1 owners.
-- No existing owner data is imported, rewritten, or deleted by this migration.
CREATE TABLE chief_workflow_heads (
  organization_id text PRIMARY KEY CHECK (organization_id <> '' AND organization_id <> '*' AND organization_id = btrim(organization_id)),
  repository_revision text NOT NULL,
  store_digest text NOT NULL CHECK (store_digest ~ '^[0-9a-f]{64}$'),
  last_event_sequence bigint NOT NULL CHECK (last_event_sequence >= 0),
  last_event_id text,
  contract_version text NOT NULL CHECK (contract_version = '1')
);
CREATE TABLE chief_workflow_entries (
  organization_id text NOT NULL REFERENCES chief_workflow_heads(organization_id) ON DELETE RESTRICT,
  collection text NOT NULL CHECK (collection IN ('contexts','preparedWorkProducts','frozenSnapshots','registeredMeetingPreparationScopes','preparedWorkPublications','frozenSnapshotPublications','privateWorkingContributionFreezeIntents','privateWorkingContributionPublications','privateWorkingContributionReceipts','privateWorkingContributionCaptures','privateWorkingContributionCaptureReceipts','sharedMeetingPerspectives','meetingPackPrivateNotePublications','meetingPackPublications','publicationReceipts','whatChangedPublications','cycle1ClosureCompletions','reviewedCarryForwardNonpromotions','reviewedCarryForwardCompletions','uploadReceipts','proposals','dispositions','canonicalRoutingReceipts','routingLinks','changeLinks','futurePreparationLinks','productMaterializations','productMaterializationReceipts','historicalCheckpointLifecycleLinks','historicalCheckpointLifecycleLinkReceipts','events')),
  ordinal bigint NOT NULL CHECK (ordinal >= 0), payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'),
  question_id text, series_id text, conversation_id text, checkpoint_id text, checkpoint_revision text,
  event_sequence bigint CHECK (event_sequence >= 0), body_ref_digests text[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (organization_id, collection, ordinal), UNIQUE (organization_id, event_sequence)
);
CREATE INDEX chief_workflow_entries_occurrence_idx ON chief_workflow_entries (organization_id, question_id, series_id, conversation_id, collection);
CREATE INDEX chief_workflow_entries_checkpoint_idx ON chief_workflow_entries (organization_id, question_id, conversation_id, checkpoint_id, checkpoint_revision, collection);
CREATE INDEX chief_workflow_entries_body_ref_digests_idx ON chief_workflow_entries USING gin (body_ref_digests);
CREATE TABLE chief_workflow_replays (
  organization_id text NOT NULL REFERENCES chief_workflow_heads(organization_id) ON DELETE RESTRICT,
  key_digest text NOT NULL CHECK (key_digest ~ '^[0-9a-f]{64}$'), request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'), record_ref text NOT NULL, ordinal bigint NOT NULL CHECK (ordinal >= 0),
  PRIMARY KEY (organization_id, key_digest), UNIQUE (organization_id, ordinal)
);
CREATE TABLE chief_workflow_write_receipts (
  organization_id text NOT NULL REFERENCES chief_workflow_heads(organization_id) ON DELETE RESTRICT,
  request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'), expected_revision text, intended_digest text NOT NULL CHECK (intended_digest ~ '^[0-9a-f]{64}$'), resulting_revision text NOT NULL, payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'),
  PRIMARY KEY (organization_id, request_fingerprint)
);
CREATE TABLE chief_source_heads (
  organization_id text PRIMARY KEY CHECK (organization_id <> '' AND organization_id <> '*' AND organization_id = btrim(organization_id)), repository_revision text NOT NULL, snapshot_digest text NOT NULL CHECK (snapshot_digest ~ '^[0-9a-f]{64}$'), contract_version text NOT NULL CHECK (contract_version = '1')
);
CREATE TABLE chief_source_versions (
  organization_id text NOT NULL REFERENCES chief_source_heads(organization_id) ON DELETE RESTRICT, source_content_version_id text NOT NULL, source_binding_id text NOT NULL, ordinal bigint NOT NULL CHECK (ordinal >= 0), exact_content_digest text NOT NULL CHECK (exact_content_digest ~ '^[0-9a-f]{64}$'), normalized_content_digest text NOT NULL CHECK (normalized_content_digest ~ '^[0-9a-f]{64}$'), byte_length bigint NOT NULL CHECK (byte_length >= 0), blob_key text NOT NULL UNIQUE, payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'),
  PRIMARY KEY (organization_id, source_content_version_id), UNIQUE (organization_id, ordinal)
);
CREATE INDEX chief_source_versions_exact_idx ON chief_source_versions (organization_id, source_binding_id, exact_content_digest);
CREATE INDEX chief_source_versions_normalized_idx ON chief_source_versions (organization_id, source_binding_id, normalized_content_digest, ordinal);
CREATE TABLE chief_source_replays (
  organization_id text NOT NULL REFERENCES chief_source_heads(organization_id) ON DELETE RESTRICT, idempotency_key_digest text NOT NULL CHECK (idempotency_key_digest ~ '^[0-9a-f]{64}$'), request_fingerprint text NOT NULL CHECK (request_fingerprint ~ '^[0-9a-f]{64}$'), source_content_version_id text NOT NULL, ordinal bigint NOT NULL CHECK (ordinal >= 0),
  PRIMARY KEY (organization_id, idempotency_key_digest), UNIQUE (organization_id, ordinal), FOREIGN KEY (organization_id, source_content_version_id) REFERENCES chief_source_versions(organization_id, source_content_version_id) ON DELETE RESTRICT
);
CREATE TABLE chief_artifact_bodies (
  organization_id text NOT NULL, semantic_owner text NOT NULL CHECK (semantic_owner IN ('leadership-conversation','product-decision-draft')), artifact_type text NOT NULL CHECK (artifact_type IN ('prepared-work','frozen-snapshot','private-working-contribution','meeting-pack-private-note','meeting-pack-draft','source-scoped-analysis','what-changed','product-decision-draft')), artifact_id text NOT NULL, artifact_revision text NOT NULL, ref_digest text NOT NULL CHECK (ref_digest ~ '^[0-9a-f]{64}$'), exact_body_digest text NOT NULL CHECK (exact_body_digest ~ '^[0-9a-f]{64}$'), byte_length bigint NOT NULL CHECK (byte_length >= 0), schema_ref text NOT NULL, ref_payload_text text NOT NULL CHECK (jsonb_typeof(ref_payload_text::jsonb) = 'object'), blob_key text NOT NULL UNIQUE, storage_generation uuid NOT NULL, storage_state text NOT NULL CHECK (storage_state IN ('ready','delete-pending','deleted')),
  PRIMARY KEY (organization_id, semantic_owner, artifact_type, artifact_id, artifact_revision), UNIQUE (organization_id, ref_digest)
);
CREATE INDEX chief_artifact_bodies_state_idx ON chief_artifact_bodies (storage_state, organization_id, semantic_owner);
CREATE TABLE chief_analysis_attempts (
  attempt_id text PRIMARY KEY, occurrence_digest text NOT NULL CHECK (occurrence_digest ~ '^[0-9a-f]{64}$'), request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'), receipt_digest text NOT NULL CHECK (receipt_digest ~ '^[0-9a-f]{64}$'), last_stage text NOT NULL CHECK (last_stage IN ('plan-frozen','request-digests-frozen','transport-entry-persisted','response-headers-received','response-body-received','candidate-parsed','candidate-validated','terminal-result-persisted')), terminal text CHECK (terminal IN ('eligible','provider-rejected','transport-failed','response-too-large','malformed-response','model-mismatch','citation-failed','candidate-validation-failed','pre-dispatch-failed')), payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'), UNIQUE (occurrence_digest, attempt_id)
);
CREATE TABLE chief_analysis_active_claims (
  occurrence_digest text PRIMARY KEY CHECK (occurrence_digest ~ '^[0-9a-f]{64}$'), attempt_id text NOT NULL UNIQUE, request_digest text NOT NULL CHECK (request_digest ~ '^[0-9a-f]{64}$'), claim_payload_text text NOT NULL CHECK (jsonb_typeof(claim_payload_text::jsonb) = 'object'), FOREIGN KEY (occurrence_digest, attempt_id) REFERENCES chief_analysis_attempts(occurrence_digest, attempt_id) ON DELETE RESTRICT
);
CREATE TABLE chief_telemetry_head (singleton boolean PRIMARY KEY CHECK (singleton = true), schema_version text NOT NULL CHECK (schema_version = '1'), revision bigint NOT NULL CHECK (revision >= 0));
CREATE TABLE chief_telemetry_entries (
  collection text NOT NULL CHECK (collection IN ('records','consents','grants','audits','deletions')), entry_id text NOT NULL, ordinal bigint NOT NULL CHECK (ordinal >= 0), organization_pseudonym text NOT NULL, organization_pseudonyms text[] NOT NULL, key_version text NOT NULL, expires_at timestamptz, valid_until timestamptz, compliance_expires_at timestamptz, status text, payload_text text NOT NULL CHECK (jsonb_typeof(payload_text::jsonb) = 'object'),
  PRIMARY KEY (collection, entry_id), UNIQUE (collection, ordinal),
  CHECK ((collection = 'records' AND expires_at IS NOT NULL AND status IS NULL) OR (collection = 'consents' AND valid_until IS NOT NULL AND status IN ('active','deletion-pending','revoked')) OR (collection = 'grants' AND valid_until IS NOT NULL AND status IN ('active','revoked')) OR (collection IN ('audits','deletions') AND compliance_expires_at IS NOT NULL AND status IS NULL)),
  CHECK (array_length(organization_pseudonyms, 1) >= 1 AND organization_pseudonym = ANY(organization_pseudonyms))
);
CREATE INDEX chief_telemetry_entries_aliases_idx ON chief_telemetry_entries USING gin (organization_pseudonyms);
CREATE INDEX chief_telemetry_entries_organization_idx ON chief_telemetry_entries (organization_pseudonym, collection);
CREATE INDEX chief_telemetry_entries_expiry_idx ON chief_telemetry_entries (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX chief_telemetry_entries_valid_until_idx ON chief_telemetry_entries (valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX chief_telemetry_entries_compliance_expiry_idx ON chief_telemetry_entries (compliance_expires_at) WHERE compliance_expires_at IS NOT NULL;

CREATE FUNCTION chief_reject_append_only_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Chief immutable record cannot be changed'; END; $$;
CREATE FUNCTION chief_reject_source_version_semantic_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF OLD.organization_id <> NEW.organization_id OR OLD.source_content_version_id <> NEW.source_content_version_id OR OLD.source_binding_id <> NEW.source_binding_id OR OLD.ordinal <> NEW.ordinal OR OLD.exact_content_digest <> NEW.exact_content_digest OR OLD.normalized_content_digest <> NEW.normalized_content_digest OR OLD.byte_length <> NEW.byte_length OR OLD.payload_text <> NEW.payload_text THEN RAISE EXCEPTION 'Chief source version semantic record cannot be changed'; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER chief_workflow_entries_immutable BEFORE UPDATE OR DELETE ON chief_workflow_entries FOR EACH ROW EXECUTE FUNCTION chief_reject_append_only_mutation();
CREATE TRIGGER chief_workflow_replays_immutable BEFORE UPDATE OR DELETE ON chief_workflow_replays FOR EACH ROW EXECUTE FUNCTION chief_reject_append_only_mutation();
CREATE TRIGGER chief_workflow_receipts_immutable BEFORE UPDATE OR DELETE ON chief_workflow_write_receipts FOR EACH ROW EXECUTE FUNCTION chief_reject_append_only_mutation();
CREATE TRIGGER chief_source_versions_no_delete BEFORE DELETE ON chief_source_versions FOR EACH ROW EXECUTE FUNCTION chief_reject_append_only_mutation();
CREATE TRIGGER chief_source_versions_semantic_immutable BEFORE UPDATE ON chief_source_versions FOR EACH ROW EXECUTE FUNCTION chief_reject_source_version_semantic_mutation();
CREATE TRIGGER chief_source_replays_immutable BEFORE UPDATE OR DELETE ON chief_source_replays FOR EACH ROW EXECUTE FUNCTION chief_reject_append_only_mutation();

REVOKE ALL ON chief_workflow_heads, chief_workflow_entries, chief_workflow_replays, chief_workflow_write_receipts, chief_source_heads, chief_source_versions, chief_source_replays, chief_artifact_bodies, chief_analysis_attempts, chief_analysis_active_claims, chief_telemetry_head, chief_telemetry_entries FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON chief_workflow_heads, chief_source_heads, chief_artifact_bodies, chief_analysis_attempts, chief_analysis_active_claims, chief_telemetry_head, chief_telemetry_entries TO discovery_alpha_application;
GRANT SELECT, INSERT ON chief_workflow_entries, chief_workflow_replays, chief_workflow_write_receipts, chief_source_versions, chief_source_replays TO discovery_alpha_application;
