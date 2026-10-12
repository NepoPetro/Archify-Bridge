import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';

const ROOT = resolve(process.cwd());
const SOURCE_DIR = join(ROOT, 'src', 'archify');
const OUTPUT_DIR = join(ROOT, 'exports', 'mermaid');

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

function convertArchitecture(content) {
  const lines = ['graph TD'];

  for (const component of content.components) {
    lines.push(`    ${sanitizeId(component.id)}["${escapeLabel(component.label)}"]`);
  }

  for (const connection of content.connections || []) {
    const arrow = connection.label ? `-->|${escapeLabel(connection.label)}|` : '-->';
    lines.push(`    ${sanitizeId(connection.from)} ${arrow} ${sanitizeId(connection.to)}`);
  }

  return lines.join('\n') + '\n';
}

function convert(content) {
  if (content.diagram_type === 'architecture') {
    return convertArchitecture(content);
  }
  throw new Error(`Unsupported diagram_type: ${content.diagram_type}`);
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

  let converted = 0;
  for (const file of files) {
    const content = JSON.parse(readFileSync(file, 'utf-8'));
    const mermaid = convert(content);
    const outName = basename(file, '.json') + '.mmd';
    const outPath = join(OUTPUT_DIR, outName);
    writeFileSync(outPath, mermaid, 'utf-8');
    console.log(`OK:   ${outPath}`);
    converted++;
  }

  console.log(`\nConverted ${converted} file(s) to Mermaid.`);
}

main();