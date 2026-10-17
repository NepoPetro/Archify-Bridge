# ADR-001: Archify JSON IR Is the Single Source of Truth

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Tmura produces diagrams for multiple consumers, including Archify HTML, draw.io, and Mermaid. Maintaining a separately editable diagram in every target format would allow topology, labels, and layout to drift.

## Decision

For diagrams in Archify's supported scope, author and review the canonical source as Archify JSON IR under `src/archify/<type>/`. Treat generated files as derived artifacts. Do not make edits to generated exports the authoritative change.

Detailed diagrams that are intentionally authored natively in draw.io are an explicit exception governed by ADR-007 and live under `src/drawio-sources/`.

## Consequences

- Changes to an Archify diagram begin in its JSON source and exports are regenerated from that source.
- Generated exports can be recreated consistently and need not be committed when repository policy ignores `exports/`.
- Reviewers can trace an Archify-derived artifact back to the JSON that produced it.
- Native draw.io sources remain authoritative only for the diagram scope assigned to draw.io.
