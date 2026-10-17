# ADR-002: Use the Official Archify CLI via Submodule

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Archify defines the JSON schema and validation behavior for its diagram types. A repository-local schema or validator would duplicate those rules and could disagree with the official implementation.

## Decision

Use the official Archify CLI as the authority for validating Archify JSON. Include it as the `vendor/archify` Git submodule and have `src/utils/validator.js` discover source files, infer their diagram type from their directory, and invoke the CLI with machine-readable JSON output.

The local validator is an orchestrator; it does not define a second schema.

## Consequences

- A submodule checkout is required to run validation; initialize it with `git submodule update --init --recursive`.
- Validation follows the official CLI's schema and diagnostics.
- CLI changes are governed by the pinned submodule revision in ADR-003.
- Tmura does not add local schema extensions that would create a competing definition of validity.
