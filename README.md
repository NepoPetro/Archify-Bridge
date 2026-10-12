# Archify Bridge

Bridge between [Archify](https://github.com/tt-a1i/archify) JSON IR and multiple diagramming tools.

Archify generates verified, interactive system maps from code or system descriptions. This repository takes those JSON sources as input and converts them into portable formats that can be opened, edited, and shared with other tools.

## Supported Formats

| Format | Extension | Status | Import Target |
|--------|-----------|--------|---------------|
| Mermaid | `.mmd` | Available | GitHub, GitLab, Notion, Obsidian, Mermaid Live |
| draw.io | `.drawio` | Available | [app.diagrams.net](https://app.diagrams.net), desktop app, Lucidchart |

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
│   └── utils/               # Validator
├── exports/                 # Generated files (gitignored)
├── docs/
│   └── examples/
├── archify-schema.json      # JSON Schema for Archify IR
└── package.json
```

## Commands

```bash
npm install              # Install dependencies
npm run validate         # Validate all JSONs against the schema
npm run export:mermaid   # Generate Mermaid files
npm run export:drawio    # Generate draw.io files
npm run export:all       # Generate all formats
```

## Adding a Diagram

1. Create a new JSON file inside `src/archify/<type>/`, where `<type>` is one of: `architecture`, `workflow`, `sequence`, `data-flow`, `lifecycle`.
2. Follow the structure defined in `archify-schema.json`.
3. Run `npm run validate` locally.
4. Commit and open a Pull Request.

## Example

```json
{
  "meta": {
    "title": "Example Architecture",
    "type": "architecture"
  },
  "nodes": [
    { "id": "browser", "label": "Browser" },
    { "id": "api", "label": "API Gateway" },
    { "id": "db", "label": "PostgreSQL" }
  ],
  "edges": [
    { "source": "browser", "target": "api", "label": "HTTPS" },
    { "source": "api", "target": "db", "label": "query" }
  ]
}
```

## License

MIT