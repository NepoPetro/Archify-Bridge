import { existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';

const ROOT = resolve(process.cwd());
const SOURCE_DIR = join(ROOT, 'src', 'archify');
const ARCHIFY_CLI = join(ROOT, 'vendor', 'archify', 'archify', 'bin', 'archify.mjs');

const TYPE_MAP = {
  architecture: 'architecture',
  workflow: 'workflow',
  sequence: 'sequence',
  'data-flow': 'dataflow',
  lifecycle: 'lifecycle'
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

function inferDiagramType(filePath) {
  const parts = filePath.split(/[\\/]/);
  const folder = parts[parts.length - 2];
  return TYPE_MAP[folder] || null;
}

function validateFile(filePath) {
  const type = inferDiagramType(filePath);
  if (!type) {
    console.error(`FAIL: ${filePath} (cannot infer diagram type from folder)`);
    return false;
  }

  const result = spawnSync('node', [ARCHIFY_CLI, 'validate', type, filePath, '--json'], {
    encoding: 'utf-8'
  });

  if (result.status === 0) {
    console.log(`OK:   ${filePath}`);
    return true;
  }

  console.error(`FAIL: ${filePath}`);
  try {
    const parsed = JSON.parse(result.stdout);
    for (const diag of parsed.diagnostics || []) {
      console.error(`  - [${diag.code}] ${diag.message}`);
    }
  } catch {
    console.error(result.stdout);
    console.error(result.stderr);
  }
  return false;
}

function main() {
  if (!existsSync(ARCHIFY_CLI)) {
    console.error(`Archify CLI not found at ${ARCHIFY_CLI}`);
    console.error('Run: git submodule update --init --recursive');
    process.exit(1);
  }

  const files = findJsonFiles(SOURCE_DIR);

  if (files.length === 0) {
    console.log('No JSON files found in src/archify/. Nothing to validate.');
    process.exit(0);
  }

  let allValid = true;
  for (const file of files) {
    if (!validateFile(file)) {
      allValid = false;
    }
  }

  if (!allValid) {
    process.exit(1);
  }

  console.log(`\nAll ${files.length} file(s) validated successfully.`);
}

main();