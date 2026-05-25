#!/usr/bin/env node
/**
 * Validate one or more recipe JSON files against the v1 schema.
 *
 *   node scripts/validate.mjs recipes/poshmark/share-closet-9am.json
 *   node scripts/validate.mjs recipes/**\/*.json
 *
 * Catalog-aware checks (does this trigger type exist? does config match the
 * type's schema?) require the live API and are run server-side by
 * POST /api/automation/rules/validate-recipe. The CI workflow hits that
 * endpoint to surface unwireable recipes; this local validator only checks
 * the static shape so contributors don't need API access to iterate.
 *
 * Exit code: 0 if everything passes, 1 otherwise. Output is a tally + per-file
 * pass/fail with the first error message.
 */
import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const schemaPath = resolve(import.meta.dirname, '..', 'schema', 'automation-recipe.v1.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/validate.mjs <file.json> [more.json ...]');
  process.exit(2);
}

let passed = 0;
let failed = 0;
for (const file of files) {
  const abs = resolve(file);
  let rel = relative(process.cwd(), abs);
  if (!rel) rel = file;

  let data;
  try {
    data = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (err) {
    failed += 1;
    console.error(`✖ ${rel} — invalid JSON: ${err.message}`);
    continue;
  }

  const ok = validate(data);
  if (ok) {
    passed += 1;
    console.log(`✔ ${rel} — ${data.name || '(unnamed)'}`);
  } else {
    failed += 1;
    const first = validate.errors?.[0];
    console.error(
      `✖ ${rel} — ${first?.instancePath || '(root)'} ${first?.message ?? 'failed validation'}`,
    );
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
