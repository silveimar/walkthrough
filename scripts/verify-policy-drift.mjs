#!/usr/bin/env node
/**
 * Recurring check: policy JSON must parse, validate, and all entrypoints.gatedRelPaths
 * must exist (GOV-03). Catches drift when policy or repo layout diverges.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePolicyDocument } from "../security/validate-policy.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function fail(msg) {
  console.error(`verify-policy-drift: ${msg}`);
  process.exit(1);
}

const policyPath = join(root, "security", "security-policy.json");
if (!existsSync(policyPath)) fail(`missing policy: ${policyPath}`);

let parsed;
try {
  parsed = JSON.parse(readFileSync(policyPath, "utf8"));
} catch (e) {
  fail(`invalid policy JSON: ${e instanceof Error ? e.message : String(e)}`);
}

const { ok, errors } = validatePolicyDocument(parsed);
if (!ok) fail(`policy validation failed: ${errors.join("; ")}`);

const gated = parsed.entrypoints?.gatedRelPaths;
if (!Array.isArray(gated) || gated.length === 0) {
  fail('policy.entrypoints.gatedRelPaths missing or empty');
}

let bad = false;
for (const rel of gated) {
  const norm = normalize(rel).split("\\").join("/");
  const abs = join(root, ...norm.split("/"));
  if (!existsSync(abs)) {
    console.error(`verify-policy-drift: gated path not found on disk: ${rel}`);
    bad = true;
  }
}

if (bad) process.exit(1);
console.error(`verify-policy-drift: OK (${gated.length} gated path(s))`);
process.exit(0);
