# Canonical Reconstruction Input Snapshot

**Status:** Canonical

**Contract:** `living-organization-reconstruction-input/v1`

**Owner:** `product/simulations/living-organization-sandbox/reconstructionInputSnapshot.ts`

## Purpose

This contract records the exact semantic input to a bounded Organization Runtime replay. It makes replay-input equality independently reproducible without treating temporary paths, connector transport state, processing time, or a report-only digest as authority.

The snapshot is an input oracle only. It does not persist Runtime state, admit Evidence, grant authority, alter scope, or reconstruct a retained Runtime.

## Included fields

- contract version and exact organization identity;
- topology identity and version;
- logical source identity and source version;
- canonical batch and semantic effective time;
- source type and semantic role;
- normalized extracted content and its normalized SHA-256 digest;
- canonical source-binding identity, topology reference, and ordered scope assertions;
- negative-control disposition;
- declared exact-duplicate and formatting-equivalence relationships.

Records are ordered by logical source identity. Scope assertions are ordered by relationship and exact scope identity.

## Excluded fields

- repository and filesystem paths;
- process ID, module cache, temporary-root identity, and invocation time;
- environment values and credentials;
- browser, Clerk, connector-session, and OAuth state;
- transport file/revision identity when replay semantics do not consume it;
- retrieval and extraction processing timestamps;
- Runtime output, revision, and persistence metadata;
- diagnostic counters and report-local labels.

## Canonical serialization

Content normalization removes NUL characters, normalizes CRLF/CR to LF, removes trailing horizontal whitespace, collapses three or more line breaks to two, and trims surrounding whitespace. ISO dates are serialized with `toISOString()`.

Absent optional relationships serialize as explicit `null`. Object keys use binary lexical order recursively. Semantic record arrays and assertion arrays use their declared binary lexical ordering. Serialization is UTF-8 JSON with one trailing LF. The authoritative digest is SHA-256 over those exact bytes.

## Compatibility and supersession

The prior digest `30a16f0b…` is orphaned diagnostic evidence: its bytes, field inventory, ordering, and derivation recipe do not survive. It is not a canonical acceptance oracle.

For the Northstar corpus, independent repository-corpus and retained-filesystem-metadata derivations produce byte-identical version-1 packages with authoritative digest `1c6577ab69236f84d9b5011e40c069e8130a941f6f8865431dfe1d43b37535e2`.

Three isolated canonical replay cycles from that package produced byte-identical
Runtime bytes. The durable Northstar Runtime was atomically reconstructed and
independently reloaded at revision
`824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047`.
This acceptance does not make the snapshot a persistence owner and used no
Drive or connector operation.

Changing included fields, normalization, ordering, serialization, or digest algorithm requires a new contract version and compatibility review.
