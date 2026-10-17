# ADR-009: Archify Scope Is Executive Views

- **Status:** Accepted
- **Date:** 2026-10-14
- **Extends:** ADR-005 and ADR-008

## Context

Tmura was created for the Imut platform to produce both communicative overviews and detailed data-lineage diagrams. Archify provides attractive, deterministic HTML output and validation, but evaluation against dense, layered lineage showed that its layout workflow is not a good fit for the detailed diagram's information density and multilingual presentation requirements.

## Decision

1. Use Archify for concise executive architecture views in `src/archify/`, with a practical target of roughly 8–12 components per view.
2. Author the detailed authentication-platform lineage in `src/drawio-sources/` and convert it to draw.io XML with `src/converters/to-drawio.js`.
3. Use custom HTML under `docs/diagrams/` for presentation needs such as multilingual labels, branding, and controls not provided by the Archify output.
4. Do not add local Archify schema extensions to accommodate dense detailed diagrams. Revisit this scope if Archify's capabilities or project needs materially change.

The component count is a project guideline based on current evaluation, not a schema limit imposed by Archify.

## DAFO analysis

### Strengths

- High-quality, presentation-ready HTML for concise diagrams.
- Deterministic validation with actionable machine-readable diagnostics.
- Self-contained HTML output and reusable visual presets.

### Weaknesses

- Dense diagrams with many cross-stage relationships require costly author/validate/layout iterations.
- The validation and layout workflow can make detailed diagrams difficult to refine.
- A single authored locale does not meet all multilingual presentation needs in this project.

### Opportunities

- Use Archify's visual quality for executive summaries while retaining detailed source in a better-fitting tool.
- Apply lessons from its visual system to project-specific presentation HTML.
- Reassess the boundary if upstream layout and localization support improves.

### Threats

- Upstream changes can affect validation and rendering, mitigated by the pinned submodule in ADR-003.
- Relying on Archify beyond the density it currently serves well can slow delivery and obscure information.
- Maintaining parallel editable versions can cause drift; ADR-001 and ADR-007 define each source of record.

## Consequences

- Every diagram has an explicit tool of record: Archify JSON for executive views, draw.io source JSON for detailed lineage, or custom HTML for presentation-specific diagrams.
- The Archify view and the detailed draw.io view represent different levels of detail; they are not expected to be pixel-identical.
- The DAFO assessment is a record of this project's evaluation and should be revisited when requirements or tool capabilities change.
