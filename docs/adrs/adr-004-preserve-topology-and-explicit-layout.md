# ADR-004: Preserve Topology and Explicit Layout

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Archify and target diagram tools use different renderers, style systems, and edge-routing algorithms. A conversion can preserve the diagram's meaning without reproducing every pixel of the source rendering.

## Decision

Converters must preserve the declared diagram structure and geometry:

1. Preserve each component and its identifier, type, and label.
2. Preserve each connection, its direction, endpoints, and relationship semantics.
3. Preserve declared component positions and sizes when the target format supports them.
4. Map supported relationship variants to a corresponding target treatment.

The converter must not silently invent, remove, or reposition diagram elements to improve its own layout.

## Consequences

- A missing component, changed endpoint, reversed connection, or altered explicit position is a conversion defect.
- Differences in typography, styling, routing, and label placement are expected when the target renderer has different capabilities.
- Converter behavior is judged against structural fidelity; visual identity is addressed separately in ADR-008.
