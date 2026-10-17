# ADR-005: Only Export Formats That Can Be Verified

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

Potential diagram targets include Mermaid, draw.io, Lucidchart, and Miro. A converter is useful only if its output is accepted by the target and retains the intended diagram structure.

## Decision

Implement and advertise only export formats whose generated artifacts can be verified end to end. Current exporters are Mermaid and draw.io. Add another target only after its format and import behavior can be tested with representative diagrams.

Do not claim a native Lucidchart or Miro exporter where no corresponding, verified output format exists. If those products accept a supported intermediate format, document that workflow accurately instead.

## Consequences

- The README's supported-format list describes working, verified behavior rather than planned integrations.
- New converters require examples that can be generated and opened or consumed by the target tool.
- Unsupported targets remain outside the implementation until verification is possible.
