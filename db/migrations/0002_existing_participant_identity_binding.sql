CREATE TABLE existing_participant_identity_bindings (
  binding_id text PRIMARY KEY,
  provider text NOT NULL CHECK (provider = 'clerk'),
  locator_digest text NOT NULL CHECK (locator_digest ~ '^[0-9a-f]{64}$'),
  participant_ref text NOT NULL UNIQUE CHECK (participant_ref ~ '^participant:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  created_at timestamptz NOT NULL,
  CONSTRAINT existing_participant_identity_binding_identity_check CHECK (
    binding_id <> '' AND binding_id <> '*' AND binding_id = btrim(binding_id)
  )
);

CREATE UNIQUE INDEX existing_participant_identity_binding_locator_uq
  ON existing_participant_identity_bindings(provider, locator_digest);
