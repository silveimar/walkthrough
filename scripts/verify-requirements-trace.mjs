#!/usr/bin/env node
/**
 * Verifies `.planning/REQUIREMENTS.md` traceability table matches the committed
 * `.planning/requirements-phase-map.json` (GOV-02).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const reqPath = join(root, ".planning", "REQUIREMENTS.md");
const mapPath = join(root, ".planning", "requirements-phase-map.json");

function fail(msg) {
  console.error(`verify-requirements-trace: ${msg}`);
  process.exit(1);
}

if (!existsSync(reqPath)) {
  console.error(
    "verify-requirements-trace: no .planning/REQUIREMENTS.md — skipped (run /gsd-new-milestone to create the next milestone requirements file)"
  );
  process.exit(0);
}
if (!existsSync(mapPath)) fail(`missing ${mapPath}`);

let mapDoc;
try {
  mapDoc = JSON.parse(readFileSync(mapPath, "utf8"));
} catch (e) {
  fail(`invalid JSON in requirements-phase-map.json: ${e instanceof Error ? e.message : String(e)}`);
}

const expected = mapDoc.traceability;
if (!Array.isArray(expected)) fail('requirements-phase-map.json: expected "traceability" array');

const md = readFileSync(reqPath, "utf8");
const traceIdx = md.indexOf("## Traceability");
if (traceIdx < 0) fail("REQUIREMENTS.md: missing ## Traceability section");

const afterTrace = md.slice(traceIdx);
const lines = afterTrace.split(/\r?\n/);

/** @type {{ id: string, phase: string, status: string }[]} */
const fromMd = [];
const rowRe = /^\|\s*([A-Z]+-\d+)\s*\|\s*(Phase\s+\d+)\s*\|\s*(Done|Pending)\s*\|/;
for (const line of lines) {
  const m = line.match(rowRe);
  if (m) {
    fromMd.push({ id: m[1], phase: m[2], status: m[3] });
  }
}

if (fromMd.length === 0) fail("no traceability table rows parsed from REQUIREMENTS.md");

function key(r) {
  return `${r.id}|${r.phase}|${r.status}`;
}

const expById = new Map(expected.map((r) => [r.id, r]));
const mdById = new Map(fromMd.map((r) => [r.id, r]));

if (expById.size !== mdById.size) {
  fail(`row count mismatch: map has ${expById.size}, REQUIREMENTS.md has ${mdById.size}`);
}

for (const [id, exp] of expById) {
  const got = mdById.get(id);
  if (!got) fail(`REQUIREMENTS.md missing requirement row for ${id}`);
  if (key(exp) !== key(got)) {
    fail(
      `mismatch for ${id}: map says "${exp.phase}" / "${exp.status}", REQUIREMENTS.md says "${got.phase}" / "${got.status}"`
    );
  }
}

for (const [id] of mdById) {
  if (!expById.has(id)) fail(`REQUIREMENTS.md has extra row ${id} not in requirements-phase-map.json`);
}

console.error(`verify-requirements-trace: OK (${fromMd.length} requirement row(s) aligned)`);
process.exit(0);
