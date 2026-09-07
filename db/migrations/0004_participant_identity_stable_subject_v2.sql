CREATE TABLE participant_identity_stable_subject_mappings (
  binding_id text PRIMARY KEY CHECK (binding_id <> '' AND binding_id <> '*' AND binding_id = btrim(binding_id)),
  provider text NOT NULL CHECK (provider = 'clerk'),
  stable_subject_digest text NOT NULL CHECK (stable_subject_digest ~ '^[0-9a-f]{64}$'),
  participant_ref text NOT NULL UNIQUE CHECK (participant_ref ~ '^participant:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  created_at timestamptz NOT NULL,
  UNIQUE (provider, stable_subject_digest)
);
CREATE TABLE participant_identity_namespace_anchors (
  namespace text PRIMARY KEY CHECK (namespace = 'clerk-participant-identity-v1-to-v2'),
  anchor_id text NOT NULL UNIQUE CHECK (anchor_id <> '' AND anchor_id <> '*' AND anchor_id = btrim(anchor_id)),
  legacy_namespace_fingerprint text NOT NULL CHECK (legacy_namespace_fingerprint ~ '^[0-9a-f]{64}$'),
  stable_instance_fingerprint text NOT NULL CHECK (stable_instance_fingerprint ~ '^[0-9a-f]{64}$'),
  activation_idempotency_key text NOT NULL UNIQUE CHECK (activation_idempotency_key <> '' AND activation_idempotency_key <> '*' AND activation_idempotency_key = btrim(activation_idempotency_key)),
  activated_at timestamptz NOT NULL
);
