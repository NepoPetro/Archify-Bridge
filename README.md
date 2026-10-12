# Archify Bridge

Bridge between [Archify](https://github.com/tt-a1i/archify) JSON IR and multiple diagramming tools.

Archify generates verified, interactive system maps from code or system descriptions. This repository takes those JSON sources as input and converts them into portable formats that can be opened, edited, and shared with other tools.

## Supported Formats

| Format | Extension | Status | Import Target |
|--------|-----------|--------|---------------|
| Mermaid | `.mmd` | Available | GitHub, GitLab, Notion, Obsidian, Mermaid Live |
| draw.io | `.drawio` | Available | [app.diagrams.net](https://app.diagrams.net), desktop app, Lucidchart |

## Architecture

This repository does not reimplement Archify. Instead, it uses the official Archify CLI as a git submodule and delegates validation and rendering to it.

- **`vendor/archify/`** — git submodule pinned to a specific commit of `tt-a1i/archify`.
- **`src/archify/`** — source of truth: Archify JSON IR files.
- **`src/converters/`** — one converter per target format.
- **`src/utils/validator.js`** — orchestrates the official Archify validator via the submodule.
- **`exports/`** — generated files (gitignored).

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

## Updating the Archify Submodule

The submodule is pinned to a specific commit for reproducible builds. To update:

```bash
git submodule update --remote vendor/archify
git add vendor/archify
git commit -m "Update Archify submodule"
```

## License

MIT