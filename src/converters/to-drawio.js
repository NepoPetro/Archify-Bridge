import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';

const ROOT = resolve(process.cwd());
const SOURCE_DIR = join(ROOT, 'src', 'archify');
const OUTPUT_DIR = join(ROOT, 'exports', 'drawio');

const NODE_WIDTH = 160;
const NODE_HEIGHT = 60;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 100;
const COLUMNS = 3;

function findJsonFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function computeLayout(nodes) {
  const positions = {};
  nodes.forEach((node, index) => {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    positions[node.id] = {
      x: col * (NODE_WIDTH + HORIZONTAL_GAP),
      y: row * (NODE_HEIGHT + VERTICAL_GAP)
    };
  });
  return positions;
}

function buildCellForNode(node, position) {
  const style = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;';
  return `        <mxCell id="${escapeXml(node.id)}" value="${escapeXml(node.label)}" style="${style}" vertex="1" parent="1">
          <mxGeometry x="${position.x}" y="${position.y}" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" as="geometry" />
        </mxCell>`;
}

function buildCellForEdge(edge, index) {
  const id = edge.id ? escapeXml(edge.id) : `edge-${index}`;
  const value = edge.label ? escapeXml(edge.label) : '';
  const style = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;';
  return `        <mxCell id="${id}" value="${value}" style="${style}" edge="1" parent="1" source="${escapeXml(edge.source)}" target="${escapeXml(edge.target)}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`;
}

function convert(content) {
  const positions = computeLayout(content.nodes);

  const nodeCells = content.nodes
    .map(node => buildCellForNode(node, positions[node.id]))
    .join('\n');

  const edgeCells = content.edges
    .map((edge, index) => buildCellForEdge(edge, index))
    .join('\n');

  const title = escapeXml(content.meta.title || 'Diagram');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="archify-bridge" type="device">
  <diagram name="${title}" id="archify-diagram">
    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${nodeCells}
${edgeCells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

function main() {
  const files = findJsonFiles(SOURCE_DIR);

  if (files.length === 0) {
    console.log('No JSON files found in src/archify/. Nothing to convert.');
    process.exit(0);
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const file of files) {
    const content = JSON.parse(readFileSync(file, 'utf-8'));
    const xml = convert(content);
    const outName = basename(file, '.json') + '.drawio';
    const outPath = join(OUTPUT_DIR, outName);
    writeFileSync(outPath, xml, 'utf-8');
    console.log(`OK:   ${outPath}`);
  }

  console.log(`\nConverted ${files.length} file(s) to draw.io.`);
}

main();