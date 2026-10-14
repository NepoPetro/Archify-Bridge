import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';

const ROOT = resolve(process.cwd());
const SOURCE_DIRS = [
  join(ROOT, 'src', 'archify'),
  join(ROOT, 'src', 'drawio-sources')
];
const OUTPUT_DIR = join(ROOT, 'exports', 'drawio');

const DEFAULT_SIZE = [140, 60];
const COLOR_BY_TYPE = {
  frontend: { fill: '#dae8fc', stroke: '#6c8ebf' },
  backend: { fill: '#d5e8d4', stroke: '#82b366' },
  database: { fill: '#ffe6cc', stroke: '#d79b00' },
  cloud: { fill: '#e1d5e7', stroke: '#9673a6' },
  security: { fill: '#f8cecc', stroke: '#b85450' },
  messagebus: { fill: '#fff2cc', stroke: '#d6b656' },
  external: { fill: '#f5f5f5', stroke: '#666666' }
};

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

function styleForComponent(component) {
  const colors = COLOR_BY_TYPE[component.type] || COLOR_BY_TYPE.external;
  return [
    'rounded=1',
    'whiteSpace=wrap',
    'html=1',
    `fillColor=${colors.fill}`,
    `strokeColor=${colors.stroke}`
  ].join(';') + ';';
}

function buildCellForComponent(component) {
  const pos = component.pos || [0, 0];
  const size = component.size || DEFAULT_SIZE;
  const value = component.sublabel
    ? `${component.label}\n${component.sublabel}`
    : component.label;

  return `        <mxCell id="${escapeXml(component.id)}" value="${escapeXml(value)}" style="${styleForComponent(component)}" vertex="1" parent="1">
          <mxGeometry x="${pos[0]}" y="${pos[1]}" width="${size[0]}" height="${size[1]}" as="geometry" />
        </mxCell>`;
}

function buildCellForConnection(connection, index) {
  const id = connection.id ? escapeXml(connection.id) : `connection-${index}`;
  const value = connection.label ? escapeXml(connection.label) : '';
  const variant = connection.variant || 'default';

  const styleParts = ['edgeStyle=orthogonalEdgeStyle', 'rounded=0', 'html=1'];
  if (variant === 'dashed') {
    styleParts.push('dashed=1');
  }
  if (variant === 'emphasis') {
    styleParts.push('strokeWidth=3');
  }
  if (variant === 'security') {
    styleParts.push('strokeColor=#b85450');
  }

  return `        <mxCell id="${id}" value="${value}" style="${styleParts.join(';')};" edge="1" parent="1" source="${escapeXml(connection.from)}" target="${escapeXml(connection.to)}">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>`;
}

function convert(content) {
  if (content.diagram_type !== 'architecture') {
    throw new Error(`Unsupported diagram_type: ${content.diagram_type}`);
  }

  const componentCells = content.components
    .map(buildCellForComponent)
    .join('\n');

  const connectionCells = (content.connections || [])
    .map((connection, index) => buildCellForConnection(connection, index))
    .join('\n');

  const title = escapeXml(content.meta.title || 'Diagram');
  const viewBox = Array.isArray(content.meta.viewBox) ? content.meta.viewBox : [1600, 900];
  const pageWidth = Number.isFinite(viewBox[0]) && viewBox[0] > 0 ? viewBox[0] : 1600;
  const pageHeight = Number.isFinite(viewBox[1]) && viewBox[1] > 0 ? viewBox[1] : 900;

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="archify-bridge" type="device">
  <diagram name="${title}" id="archify-diagram">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageWidth}" pageHeight="${pageHeight}" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${componentCells}
${connectionCells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
}

function main() {
  const requestedFiles = process.argv.slice(2).map((file) => resolve(file));
  const files = requestedFiles.length > 0
    ? requestedFiles
    : SOURCE_DIRS.flatMap(findJsonFiles);

  if (files.length === 0) {
    console.log('No JSON files found in src/archify/ or src/drawio-sources/. Nothing to convert.');
    process.exit(0);
  }

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let converted = 0;
  for (const file of files) {
    const content = JSON.parse(readFileSync(file, 'utf-8'));
    if (content.diagram_type !== 'architecture') {
      console.log(`SKIP: ${file} (unsupported diagram_type: ${content.diagram_type})`);
      continue;
    }
    const xml = convert(content);
    const outName = basename(file, '.json') + '.drawio';
    const outPath = join(OUTPUT_DIR, outName);
    writeFileSync(outPath, xml, 'utf-8');
    console.log(`OK:   ${outPath}`);
    converted++;
  }

  console.log(`\nConverted ${converted} file(s) to draw.io.`);
}

main();
