# ADR-007: Use a Hybrid Diagram Ecosystem

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

No single diagramming tool in this project covers every required notation and level of detail. Archify supports architecture, workflow, sequence, dataflow, and lifecycle diagrams, while detailed lineage and other specialized notations may require native support from another tool.

## Decision

Use a hybrid ecosystem and assign one canonical source format to each diagram scope:

| Diagram scope | Canonical source | Supported derived format or destination |
|---|---|---|
| Architecture and executive views | Archify JSON IR | Archify HTML, Mermaid, draw.io where supported |
| Workflow | Archify JSON IR | Mermaid, draw.io where supported |
| Sequence, dataflow, lifecycle | Archify JSON IR | Mermaid where supported |
| Detailed Imut lineage | draw.io source JSON in `src/drawio-sources/` | draw.io XML |
| Presentation-specific view | Custom HTML in `docs/diagrams/` | Browser |
| Other specialized notations | A tool with native support, selected per diagram | Native format |

Do not extend Archify's schema locally to force unsupported diagram types into it. For each diagram, document which source is authoritative and avoid maintaining competing editable versions.

## Consequences

- Archify is canonical for the diagram types and uses assigned to it; its output is not the only source format in Tmura.
- The detailed authentication lineage can be maintained in draw.io source JSON and converted independently of Archify validation.
- Custom HTML is a presentation artifact with its own source, not an alternate editable copy of Archify IR.
- The README and project documentation must keep the tool-of-record guidance aligned with this decision.
