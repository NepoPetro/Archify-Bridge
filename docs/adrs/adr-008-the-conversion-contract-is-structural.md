# ADR-008: The Conversion Contract Is Structural

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Archify, Mermaid, and draw.io render diagrams using different engines. Their typography, styling, edge routing, and label placement cannot be expected to match exactly. ADR-004 specifies which structural information converters must preserve.

## Decision

Define converter correctness by structural fidelity, not pixel-level visual parity. Preserve components, topology, direction, supported relationship semantics, and explicit geometry where the target format supports it. Treat target-specific styling and routing as approximate presentation.

## Consequences

- Visual differences between source and target renderings are expected and do not alone indicate a conversion defect.
- A structural mismatch is a defect even if the result looks polished.
- Documentation must distinguish guaranteed structure from approximate visual treatment.
- Users choose the rendering that suits their task: Archify HTML for executive communication and the target artifact for editing or detailed review.
