# Engineering Decisions

This directory records the architectural decisions behind Tmura. Each decision follows the ADR (Architecture Decision Record) format, with its own file for traceability.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](adrs/adr-001-archify-json-ir-is-the-single-source-of-truth.md) | Archify JSON IR is the single source of truth | Accepted |
| [ADR-002](adrs/adr-002-use-the-official-archify-cli-via-submodule.md) | Use the official Archify CLI via submodule | Accepted |
| [ADR-003](adrs/adr-003-pin-the-submodule-to-an-exact-commit.md) | Pin the submodule to an exact commit | Accepted |
| [ADR-004](adrs/adr-004-preserve-topology-and-explicit-layout.md) | Preserve topology and explicit layout | Accepted |
| [ADR-005](adrs/adr-005-only-export-formats-that-can-be-verified.md) | Only export formats that can be verified | Accepted |
| [ADR-006](adrs/adr-006-the-validator-fails-loudly.md) | The validator fails loudly | Accepted |
| [ADR-007](adrs/adr-007-hybrid-diagram-ecosystem.md) | Hybrid diagram ecosystem scope | Accepted |
| [ADR-008](adrs/adr-008-the-conversion-contract-is-structural.md) | The conversion contract is structural, not visual | Accepted |
| [ADR-009](adrs/adr-009-archify-scope-executive-views.md) | Archify scope: executive views, not detailed diagramming | Accepted |

## Summary

| Decision | Driver |
|----------|--------|
| JSON IR as single source of truth | Avoid drift |
| Official CLI via submodule | Single definition of correctness |
| Pinned commit | Reproducibility and audit |
| Preserve topology and layout; accept visual divergence | Respect author intent, avoid re-implementation |
| Only verifiable formats | Technical honesty |
| Fail loudly | Pipeline integrity |
| Hybrid diagram ecosystem | Scope discipline |
| Structural conversion contract | Achievable guarantees |
| Archify for executive views only | Tool scope and technical honesty |