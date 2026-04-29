#!/usr/bin/env node
/**
 * CLI: validates canonical policy file and prints human summary + JSON result.
 *
 * Usage: node security/verify-policy.mjs
 * Env: WALKTHROUGH_POLICY_PATH — optional override to policy JSON path (default: security/security-policy.json from repo root).
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePolicyDocument } from "./validate-policy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function repoRoot() {
  return dirname(__dirname);
}

const root = repoRoot();
const defaultPolicyPath = join(root, "security", "security-policy.json");
const policyPath = process.env.WALKTHROUGH_POLICY_PATH || defaultPolicyPath;

let parsed;
if (!existsSync(policyPath)) {
  const payload = {
    valid: false,
    errors: [`Policy file not found: ${policyPath}`],
    policyPath,
  };
  console.error(`verify-policy: FAILED — ${payload.errors[0]}`);
  console.log(JSON.stringify(payload));
  process.exit(1);
}

try {
  parsed = JSON.parse(readFileSync(policyPath, "utf8"));
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  const payload = {
    valid: false,
    errors: [`Invalid JSON: ${msg}`],
    policyPath,
  };
  console.error(`verify-policy: FAILED — ${payload.errors[0]}`);
  console.log(JSON.stringify(payload));
  process.exit(1);
}

const { ok, errors } = validatePolicyDocument(parsed);
const payload = {
  valid: ok,
  errors,
  policyPath,
};

if (ok) {
  console.error(`verify-policy: OK — policy valid (${policyPath})`);
} else {
  console.error(
    `verify-policy: FAILED — ${errors.length} validation error(s):\n  - ${errors.join("\n  - ")}`
  );
}

console.log(JSON.stringify(payload));
process.exit(ok ? 0 : 1);
