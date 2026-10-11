import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';

const ROOT = resolve(process.cwd());
const SOURCE_DIR = join(ROOT, 'src', 'archify');
const OUTPUT_DIR = join(ROOT, 'exports', 'mermaid');

const MERMAID_HEADERS = {
  architecture: 'graph TD',
  workflow: 'graph TD',
  sequence: 'sequenceDiagram',
  'data-flow': 'graph LR',
  lifecycle: 'stateDiagram-v2'
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

function sanitizeId(id) {
  return String(id).replace(/[^a-zA-Z0-9_]/g, '_');
}

function escapeLabel(label) {
  return String(label).replace(/"/g, '\\"');
}

function convertGraph(content) {
  const lines = [MERMAID_HEADERS[content.meta.type] || 'graph TD'];
  for (const node of content.nodes) {
    lines.push(`    ${sanitizeId(node.id)}["${escapeLabel(node.label)}"]`);
  }
  for (const edge of content.edges) {
    const arrow = edge.label ? `-->|${escapeLabel(edge.label)}|` : '-->';
    lines.push(`    ${sanitizeId(edge.source)} ${arrow} ${sanitizeId(edge.target)}`);
  }
  return lines.join('\n') + '\n';
}

function convertSequence(content) {
  const lines = ['sequenceDiagram'];
  for (const node of content.nodes) {
    lines.push(`    participant ${sanitizeId(node.id)} as ${node.label}`);
  }
  for (const edge of content.edges) {
    const arrow = edge.label ? `->>${escapeLabel(edge.label)}` : '->>';
    lines.push(`    ${sanitizeId(edge.source)}${arrow}${sanitizeId(edge.target)}: `);
  }
  return lines.join('\n') + '\n';
}

function convertLifecycle(content) {
  const lines = ['stateDiagram-v2'];
  for (const edge of content.edges) {
    const label = edge.label ? ` : ${edge.label}` : '';
    lines.push(`    ${sanitizeId(edge.source)} --> ${sanitizeId(edge.target)}${label}`);
  }
  return lines.join('\n') + '\n';
}

function convert(content) {
  const type = content.meta.type;
  if (type === 'sequence') return convertSequence(content);
  if (type === 'lifecycle') return convertLifecycle(content);
  return convertGraph(content);
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
    const mermaid = convert(content);
    const outName = basename(file, '.json') + '.mmd';
    const outPath = join(OUTPUT_DIR, outName);
    writeFileSync(outPath, mermaid, 'utf-8');
    console.log(`OK:   ${outPath}`);
  }

  console.log(`\nConverted ${files.length} file(s) to Mermaid.`);
}

main();