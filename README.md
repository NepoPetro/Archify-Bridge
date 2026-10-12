# Archify Bridge

Bridge between [Archify](https://github.com/tt-a1i/archify) JSON IR and multiple diagramming tools.

Archify generates verified, interactive system maps from code or system descriptions. This repository takes those JSON sources as input and converts them into portable formats that can be opened, edited, and shared with other tools.

## Supported Formats

| Format | Extension | Status | Import Target |
|--------|-----------|--------|---------------|
| Mermaid | `.mmd` | Available | GitHub, GitLab, Notion, Obsidian, Mermaid Live |
| draw.io | `.drawio` | Available | [app.diagrams.net](https://app.diagrams.net), desktop app, Lucidchart |

## Conversion Contract

The conversion between Archify JSON and any target format is **structural, not visual**. This is a deliberate decision, documented in [ADR-008](docs/DECISIONS.md#adr-008---the-conversion-contract-is-structural-not-visual).

| Guaranteed | Approximate | Not guaranteed |
|------------|-------------|----------------|
| Topology (components, connections, direction) | Visual style (colors, typography, stroke widths) | Pixel-perfect parity with Archify HTML |
| Author-declared layout (`pos`, `size`) | Alignment to the Archify preset | Connection routing identical to Archify |
| Relationship semantics (`variant`) | Type-based color mapping | Label placement identical to Archify |

**What this means in practice:**
The diagram opened in draw.io represents the same system, with the same structure and the same declared layout. It looks different because the two tools use different rendering engines, in the same way the same document looks different in Word and in Google Docs without ceasing to be the same document.

If a diagram is structurally wrong (missing component, wrong connection, wrong position), that is a bug and must be fixed. If it looks visually different from the Archify HTML, that is expected.

## Architecture

This repository does not reimplement Archify. Instead, it uses the official Archify CLI as a git submodule and delegates validation and rendering to it.

- **`vendor/archify/`** - git submodule pinned to a specific commit of `tt-a1i/archify`.
- **`src/archify/`** - source of truth: Archify JSON IR files.
- **`src/converters/`** - one converter per target format.
- **`src/utils/validator.js`** - orchestrates the official Archify validator via the submodule.
- **`exports/`** - generated files (gitignored).

## Workflow

1. Write Archify JSON files inside `src/archify/<type>/`.
2. Validate them with `npm run validate`.
3. Generate exports with `npm run export:all`.
4. Find generated files inside `exports/<format>/`.

Every push that modifies `src/archify/**` triggers GitHub Actions, which validates the JSONs and publishes the exports as downloadable artifacts.

## Repository Structure

```
archify-bridge/
├── .github/workflows/       # CI: validation and export
├── src/
│   ├── archify/             # Source of truth: Archify JSON files
│   │   ├── architecture/
│   │   ├── workflow/
│   │   ├── sequence/
│   │   ├── data-flow/
│   │   └── lifecycle/
│   ├── converters/          # One file per target format
│   └── utils/               # Validator (delegates to Archify CLI)
├── vendor/
│   └── archify/             # Official Archify (git submodule)
├── exports/                 # Generated files (gitignored)
├── docs/
│   └── DECISIONS.md         # Architecture Decision Records
└── package.json
```

## Commands

```bash
npm install                       # Install dependencies
npm run validate                  # Validate all JSONs against the official Archify schema
npm run export:mermaid            # Generate Mermaid files
npm run export:drawio             # Generate draw.io files
npm run export:all                # Generate all formats
```

## Adding a Diagram

1. Create a new JSON file inside `src/archify/<type>/`, where `<type>` is one of: `architecture`, `workflow`, `sequence`, `data-flow`, `lifecycle`.
2. Follow the official Archify schema. Reference: `vendor/archify/archify/schemas/`.
3. Run `npm run validate` locally.
4. Commit and open a Pull Request.

## Example

```json
{
  "schema_version": 1,
  "diagram_type": "architecture",
  "meta": {
    "title": "Example Architecture",
    "output": "example.html",
    "visual_preset": "signal-flow",
    "animation": "trace"
  },
  "components": [
    { "id": "browser", "type": "frontend", "label": "Browser", "pos": [60, 80], "size": [140, 60] },
    { "id": "api", "type": "backend", "label": "API Gateway", "pos": [280, 80], "size": [140, 60] }
  ],
  "connections": [
    { "from": "browser", "to": "api", "label": "HTTPS", "variant": "emphasis" }
  ]
}
```

## Diagram Ecosystem

Archify covers five diagram types: `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`. It does not attempt to cover the full diagramming ecosystem.

For diagram types outside that scope (network topology, C4 model, Gantt, ERD, UML, BPMN), a different tool is used as the canonical source. The full decision matrix is in [ADR-007](docs/DECISIONS.md#adr-007---diagram-ecosystem-scope-archify-for-what-it-covers-other-tools-for-the-rest).

## Engineering Decisions

The reasoning behind the architecture of this repository is documented in [docs/DECISIONS.md](docs/DECISIONS.md), following the ADR (Architecture Decision Record) format.

## Updating the Archify Submodule

The submodule is pinned to a specific commit for reproducible builds. To update:

```bash
git submodule update --remote vendor/archify
git add vendor/archify
git commit -m "Update Archify submodule"
```

## License

MIT