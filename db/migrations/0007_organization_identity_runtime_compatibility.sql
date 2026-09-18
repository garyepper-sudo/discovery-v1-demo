-- Forward-only alignment of OrganizationIdentityOwner with the pre-existing Runtime ID grammar.
ALTER TABLE organization_identities
  DROP CONSTRAINT organization_identities_identity_check;

ALTER TABLE organization_identities
  ADD CONSTRAINT organization_identities_identity_check CHECK (
    organization_id ~ '^organization_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND creation_key <> '' AND creation_key <> '*' AND creation_key = btrim(creation_key)
    AND display_name <> '' AND display_name <> '*' AND display_name = btrim(display_name)
    AND provenance <> '' AND provenance <> '*' AND provenance = btrim(provenance)
  ) NOT VALID;
