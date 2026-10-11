import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import Ajv from 'ajv';

const ROOT = resolve(process.cwd());
const SCHEMA_PATH = join(ROOT, 'archify-schema.json');
const SOURCE_DIR = join(ROOT, 'src', 'archify');

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

function findJsonFiles(dir) {
  const results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
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

function validateFile(filePath) {
  const content = JSON.parse(readFileSync(filePath, 'utf-8'));
  const valid = validate(content);
  if (!valid) {
    console.error(`FAIL: ${filePath}`);
    for (const err of validate.errors) {
      console.error(`  - ${err.instancePath || '/'} ${err.message}`);
    }
    return false;
  }
  console.log(`OK:   ${filePath}`);
  return true;
}

function main() {
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