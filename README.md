# Tmura = Archify-Bridge

Bridge between [Archify](https://github.com/tt-a1i/archify) JSON IR and multiple diagramming tools.

**Tmura** (תְּמוּרָה, "bridge" in Hebrew) is a satellite project of [Imut (1DFlfRMH)](https://github.com/NepoPetro), a data governance and digital rights platform. Tmura produces the data lineage diagrams that Imut requires as deliverables: an executive view for communication, and a detailed view for engineering and audit.

## Why this project exists

Imut needed to produce a data lineage diagram that reflects the actual end-to-end flow of authentication data across seven layers: origin, processing, security, storage, failures, observability, and events.

Archify promised an AI-assisted path to that diagram. After evaluating it in depth (see [ADR-009](docs/DECISIONS.md#adr-009--archify-scope-executive-views-not-detailed-diagramming)), the conclusion was that Archify is excellent for executive views but does not scale to detailed diagrams with more than approximately 12 nodes.

Tmura solves that by separating the tool of record per diagram type.

## Tool of record per diagram type

| View | Tool | Location | Node limit |
|------|------|----------|------------|
| Executive view | Archify | `src/archify/` | 8–12 nodes |
| Detailed view | draw.io | `src/drawio-sources/` | none |
| Presentation layer | Custom HTML | `docs/diagrams/` | none |

The three deliverables represent the same system at different levels of detail. They are not competing views; they are layers.

## Supported formats

| Format | Extension | Generated from | Import target |
|--------|-----------|---------------|---------------|
| HTML (Archify) | `.html` | `src/archify/*.json` | Browser |
| draw.io | `.drawio` | `src/drawio-sources/*.json` | [app.diagrams.net](https://app.diagrams.net) |
| HTML (custom) | `.html` | Hand-authored | Browser |

## Repository structure

```
tmura/
├── .github/workflows/       # CI: validation and export
├── src/
│   ├── archify/             # Executive views (validated against Archify schema)
│   │   ├── architecture/
│   │   └── data-flow/
│   ├── drawio-sources/      # Detailed views (not validated by Archify)
│   ├── converters/          # One converter per target format
│   └── utils/               # Validator (delegates to Archify CLI)
├── vendor/
│   └── archify/             # Official Archify (git submodule, pinned)
├── docs/
│   ├── DECISIONS.md         # Architecture Decision Records
│   └── diagrams/
│       ├── authentication-platform.html    # Custom branded HTML
│       └── archify/                        # Archify-generated HTMLs
├── exports/                 # Generated files (gitignored)
└── package.json
```

## Commands

```bash
npm install                       # Install dependencies
npm run validate                  # Validate all Archify JSONs against the official schema
npm run export:drawio             # Generate draw.io files from src/archify + src/drawio-sources
npm run export:mermaid            # Generate Mermaid files from src/archify
npm run export:all                # Run all exporters
```

## Workflow

1. **Author the source JSON.**
   - Executive views: `src/archify/<type>/<name>.json` (must validate).
   - Detailed views: `src/drawio-sources/<name>.json` (no validation).
2. **Validate** the Archify sources: `npm run validate`.
3. **Generate exports:** `npm run export:all`.
4. **Find outputs** in `exports/<format>/`.
5. **For Archify diagrams, render the final HTML:**
   ```bash
   node vendor/archify/archify/bin/archify.mjs finalize <type> <input.json> <output.html> \
     --quality standard --candidate-sha256 <HASH> --json
   ```
   The hash comes from `npm run validate`.

## Context: the Imut project

Tmura exists to serve [Imut](https://github.com/NepoPetro). The current data lineage diagram covers the Imut authentication platform across seven layers:

1. **Origin** — end user, frontend
2. **Processing** — BFF, API Node.js
3. **Security** — bcrypt, JWT, auth middleware, rate limiting, session automata
4. **Storage** — PgBouncer, PostgreSQL, users, audit_logs, chained audit hash
5. **Failures** — Dead Letter Queue
6. **Observability** — Prometheus, Grafana, dashboards
7. **Events** — Dead Letter Topic, Slack notifications, compliance system

The diagram also records one rejected case study from Imut's ADR-008: a Navier-Stokes-based key derivation function that was explored but not adopted for production.

## Architecture decisions

All engineering decisions are documented in [docs/DECISIONS.md](docs/DECISIONS.md):

- **ADR-001** to **ADR-003**: source of truth, submodule governance, pinned commit.
- **ADR-004** and **ADR-008**: conversion contract (structural, not visual).
- **ADR-005** and **ADR-006**: verifiable formats, fail-fast validation.
- **ADR-007**: hybrid diagram ecosystem scope.
- **ADR-009**: Archify scope — executive views only. Includes DAFO analysis.

## Updating the Archify submodule

The submodule is pinned to a specific commit for reproducible builds.

```bash
git submodule update --remote vendor/archify
git add vendor/archify
git commit -m "Update Archify submodule"
```

## License

MIT