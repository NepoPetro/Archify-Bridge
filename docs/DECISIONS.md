# Engineering Decisions

This document records the decisions behind Archify Bridge and the reasoning for each one. It follows the ADR (Architecture Decision Record) format: each entry states the context, the decision, and the trade-offs.

---

## ADR-001 - Archify JSON IR is the single source of truth

**Context.**
Diagrams need to be generated for multiple consumers: human review, tooling, and downstream repositories. Each consumer has its own format (Mermaid, draw.io).

**Decision.**
Every diagram is authored once, in Archify JSON IR, inside `src/archify/<type>/`. All other formats are derived from it. The derived files are not versioned.

**Rationale.**
Two sources of truth always drift. If a diagram is edited directly in draw.io, the change is lost the next time the JSON is regenerated. Keeping the JSON as the only writable artifact ensures that the diagram always reflects the intent captured in the source.

**Consequence.**
`exports/` is gitignored. Regeneration is part of the pipeline, not a manual step. Consumers either pull artifacts from CI or run the exporters locally.

---

## ADR-002 - Use the official Archify CLI via submodule instead of reimplementing the validator

**Context.**
An earlier version of this repository contained its own JSON schema and validator. Archify already provides a validated JSON schema and a deterministic validator.

**Decision.**
Remove the local schema and validator. Delegate validation to the official Archify CLI, integrated as a git submodule.

**Rationale.**
Reimplementing a validator that already exists duplicates maintenance, guarantees divergence from the official behavior, and creates two definitions of "valid". Governance prefers a single authoritative definition of correctness that all consumers agree on.

The submodule provides autonomy (the code lives in this repository, is versioned with it, and does not depend on network access at build time) without giving up the authority of the upstream source.

**Consequence.**
`src/utils/validator.js` becomes an orchestrator: it discovers JSON files, infers the diagram type, and invokes the official CLI with `--json`. It does not interpret the schema itself.

---

## ADR-003 - Pin the submodule to an exact commit

**Context.**
Archify evolves. A submodule can be configured to follow a branch or to stay pinned to a specific commit.

**Decision.**
Pin the submodule to an exact commit. Updates are explicit and reviewed.

**Rationale.**
Reproducibility. A pipeline that validates and renders today must produce the same result six months from now. Following a branch would make builds depend on the state of the upstream repository at build time, which is not auditable.

The pinned commit is the record of which version of the validator and renderer produced a given artifact. For data and architectural governance, that traceability is not optional.

**Consequence.**
Updating Archify is a deliberate action:

```bash
git submodule update --remote vendor/archify
git add vendor/archify
git commit -m "Update Archify submodule"
```

That commit is part of the audit trail.

---

## ADR-004 - Preserve topology and explicit layout; accept visual divergence

**Context.**
Archify renders a diagram to self-contained HTML/SVG. draw.io renders a diagram to XML. These are two different rendering engines with different defaults, different styling vocabularies, and different routing algorithms.

A naive reading of "export to draw.io" would suggest the result must look identical to the Archify HTML. That is not achievable without writing a rendering engine that duplicates Archify's and tracking every upstream change.

**Decision.**
The conversion contract between Archify JSON and any target format guarantees three things and explicitly renounces two.

**Guaranteed:**

1. **Topology.** Same components, same connections, same direction (`from`/`to`), same component type.
2. **Author-declared layout.** Each component is placed at its declared `pos` and sized at its declared `size`. The converter does not recompute layout.
3. **Relationship semantics.** `variant` (`emphasis`, `security`, `dashed`) maps to an equivalent visual treatment in the target tool.

**Approximate, not guaranteed:**

4. **Visual style.** Colors, typography, and stroke widths are aligned to the Archify preset as closely as the target tool allows. The result is "visually coherent", not pixel-perfect.
5. **Connection routing and label placement.** Archify uses its own algorithm (orthogonality, clearance, rhythm). draw.io uses a generic `orthogonalEdgeStyle`. Replicating the exact route and label position is out of scope.

**Rationale.**
The purpose of export is portability, not reproduction. A diagram that carries the same structure, the same declared positions, and the same semantics is the same diagram, even if the two renderers draw it differently. This is the same reason a document in Word and the same document in Google Docs are considered the same document.

Attempting pixel-perfect parity would require:

- A custom SVG renderer in the converter.
- Tracking Archify's preset changes on every release.
- Solving the same label-clearance and routing problems Archify already solves.

That is duplication with no strategic value, and it would break with the first upstream change.

**Consequence.**
If a diagram looks visually different between Archify HTML and draw.io, that is expected and documented. If a diagram is structurally wrong (a missing component, a wrong connection, a wrong position), that is a converter bug and must be fixed.

---

## ADR-005 - Only export formats that can be verified

**Context.**
Several targets were considered: Mermaid, draw.io, Lucidchart, Miro, and others. Each has different input formats and different degrees of public documentation.

**Decision.**
Only implement exporters for formats that can be verified end to end: the artifact is generated, opened in the target tool, and confirmed to represent the same diagram. Currently: Mermaid and draw.io.

**Rationale.**
An exporter that "probably works" is worse than no exporter. It creates false confidence, wastes the time of whoever tries to use it, and hides a real gap behind a nominal feature.

Lucidchart, for example, does not accept a generic JSON format. It accepts `.drawio` files, `.vsdx`, `.bpmn`, and images. A "Lucidchart converter" would either duplicate the draw.io work or invent a format that does not exist. The honest answer is to document that draw.io is the bridge to Lucidchart, not to build a converter that pretends otherwise.

**Consequence.**
Additional formats are added only when their format is documented and testable. The list of supported formats in the README reflects what is actually verified, not what is planned.

---

## ADR-006 - The validator fails loudly

**Context.**
Validation can be configured to report errors and continue, or to stop execution.

**Decision.**
The validator exits with a non-zero code on any failure. In CI, a failed validation blocks the merge.

**Rationale.**
This is a data pipeline. Silent failures in a data pipeline produce downstream artifacts that appear valid and are not. A diagram that renders with missing components is more dangerous than a build that fails, because the failure is invisible until someone relies on it.

Failing loudly also has a diagnostic benefit: the CLI returns a structured "repair receipt" with the exact rule that failed, the subject, and the supported fixes. That is machine-readable and actionable, which is what a pipeline needs.

**Consequence.**
Branch protection on `main` requires the validation check to pass. No merge happens on a failed validation.

---

## ADR-007 - Diagram ecosystem scope: Archify for what it covers, other tools for the rest

**Context.**
The diagram ecosystem is broad: software architecture, workflows, sequences, data flows, lifecycles, network topologies, C4 models, Gantt charts, ERD, UML class/activity/state diagrams, BPMN, DFD, and more.

Archify supports five diagram types: `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`. It does not attempt to cover the full ecosystem. Its README states explicitly that automatic Mermaid parsing and general-purpose auto-layout are intentionally out of scope.

Forcing every diagram into Archify would either fail (the schema rejects it) or require extending the official schema locally, which would break the "single source of truth" principle established in ADR-002.

**Decision.**
Adopt a hybrid model with a clear decision matrix:

| Diagram type | Canonical tool | Export format |
|--------------|---------------|---------------|
| Architecture | Archify | Mermaid, draw.io |
| Workflow | Archify | Mermaid, draw.io |
| Sequence | Archify | Mermaid |
| Data flow | Archify | Mermaid |
| Lifecycle | Archify | Mermaid |
| Network topology | draw.io | draw.io native |
| C4 model | Mermaid (C4 syntax) | Mermaid |
| Gantt | Mermaid (Gantt syntax) | Mermaid |
| ERD | draw.io | draw.io native |
| UML class / activity / state | PlantUML | PlantUML |
| BPMN | draw.io (BPMN shapes) | draw.io native |
| Other | draw.io or Mermaid | native |

The matrix is the governance artifact. It documents which tool is authoritative for which diagram type, and why.

**Rationale.**
A single tool for all diagram types is not a governance principle; it is a convenience that fails at the edges. Governance means defining which tool is authoritative for which scope, and enforcing that decision.

Archify remains the canonical source for the five types it supports because its schema, validator, and deterministic renderer provide guarantees no generic tool provides. For everything else, the tool that has native support for that diagram type is authoritative.

If Archify adds a new diagram type upstream in the future, the matrix is updated and the corresponding type is migrated. The architecture of the repository does not change.

**Consequence.**
- Not every diagram in the project lives in `src/archify/`.
- Diagrams made outside Archify live in dedicated folders (`diagrams/network/`, `diagrams/c4/`, etc.) with their own source format.
- The README documents the matrix so that contributors know which tool to use.
- No local schema extensions are added to Archify. If a diagram type is not supported, a different tool is used, not a fork of the schema.

---

## ADR-008 - The conversion contract is structural, not visual

**Context.**
ADR-004 states what is guaranteed and what is not in the conversion. This ADR states why.

**Decision.**
The conversion contract between Archify and any target format is **structural**. It guarantees topology, layout, and relationship semantics. It does not guarantee visual identity.

**Rationale.**
Visual identity across two different rendering engines is not achievable without writing a third rendering engine. Even tools that claim "round-trip fidelity" (e.g., some Visio to draw.io converters) achieve "structural fidelity with manual review", not pixel parity.

For a data and architecture governance context, structural fidelity is what matters:

- A diagram reviewer needs to know that a component exists, where it is, and what it connects to.
- A DBA needs to know that a data store is represented, in the right layer, connected to the right consumers.
- An auditor needs to know that the diagram in the artifact is the same diagram that was reviewed and approved.

None of those needs are met or broken by the difference between two rendering engines' default fonts.

**Consequence.**
- The README includes a "Guaranteed / Approximate / Not guaranteed" matrix.
- Documentation for each converter states its target tool's rendering behavior when it diverges from Archify.
- If a reviewer needs to see the Archify rendering, they open the HTML. If they need to see the draw.io rendering, they open the XML. Both represent the same diagram.

---

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