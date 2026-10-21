# Architecture and Governance Context

Tmura is not a standalone tool; it is the documentation engine for Imut.

## The Density Problem

Imut requires a 7-layer data lineage diagram (28 nodes) to satisfy governance and audit requirements. 
Archify, the tool initially chosen for its excellent visual output, fails to render diagrams with more than 12 nodes due to layout engine constraints. 

As documented in **ADR-009**, the decision was made to use a hybrid approach:
- **Archify:** Used exclusively for executive views (8 to 12 nodes).
- **draw.io:** Used for the detailed, 28-node faithful diagram.
- **Custom HTML:** Used as the presentation layer, adding multilingual support and personal branding.

## The Principle

The client does not adapt to the tool. We adapt the tool to the client's governance needs. If a diagramming tool cannot represent the complexity of the architecture, it is scoped down or replaced.
