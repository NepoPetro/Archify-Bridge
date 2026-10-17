# ADR-006: The Validator Fails Loudly

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Invalid diagram JSON can lead to incomplete or misleading exports. A successful process exit must mean that every discovered Archify source passed the authoritative validator.

## Decision

`npm run validate` returns a non-zero exit code if the Archify CLI is missing, a diagram type cannot be inferred, or any source fails validation. Diagnostics from the CLI are surfaced to the caller. CI validation is a required quality gate for changes to Archify sources.

## Consequences

- Invalid sources block the validation workflow instead of producing a success-shaped result.
- Contributors receive the CLI's rule diagnostics and can repair the source before export.
- The repository's GitHub Actions validation workflow runs `npm run validate` for pushes and pull requests targeting `main`.
- Merge protection must require the validation check for the blocking behavior to be enforced at repository level.
