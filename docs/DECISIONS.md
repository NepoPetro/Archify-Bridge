# Engineering Decisions

This directory records the architectural decisions behind Tmura. Each decision follows the ADR (Architecture Decision Record) format, with its own file for traceability.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](adrs-html/adr-001-archify-json-ir-is-the-single-source-of-truth.html) | Archify JSON IR is the single source of truth | Accepted |
| [ADR-002](adrs-html/adr-002-use-the-official-archify-cli-via-submodule.html) | Use the official Archify CLI via submodule | Accepted |
| [ADR-003](adrs-html/adr-003-pin-the-submodule-to-an-exact-commit.html) | Pin the submodule to an exact commit | Accepted |
| [ADR-004](adrs-html/adr-004-preserve-topology-and-explicit-layout.html) | Preserve topology and explicit layout | Accepted |
| [ADR-005](adrs-html/adr-005-only-export-formats-that-can-be-verified.html) | Only export formats that can be verified | Accepted |
| [ADR-006](adrs-html/adr-006-the-validator-fails-loudly.html) | The validator fails loudly | Accepted |
| [ADR-007](adrs-html/adr-007-hybrid-diagram-ecosystem.html) | Hybrid diagram ecosystem scope | Accepted |
| [ADR-008](adrs-html/adr-008-the-conversion-contract-is-structural.html) | The conversion contract is structural, not visual | Accepted |
| [ADR-009](adrs-html/adr-009-archify-scope-executive-views.html) | Archify scope: executive views, not detailed diagramming | Accepted |

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
