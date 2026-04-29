#!/usr/bin/env node
/**
 * Verify SHA-256 + policyVersion in walkthrough `.meta.json` sidecars (INTG-02).
 *
 * Usage:
 *   node scripts/verify-artifact-integrity.mjs [examples-dir]
 * Default examples-dir: ./examples relative to cwd (repository root).
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadRepoPolicy } from "../security/policy-runtime.mjs";

const examplesDir = join(process.cwd(), process.argv[2] || "examples");

if (!existsSync(examplesDir)) {
  console.error(`verify-artifact-integrity: missing directory ${examplesDir}`);
  process.exit(1);
}

const policy = loadRepoPolicy();
const policyVersion = /** @type {{ version?: number }} */ (policy).version ?? 0;

let checked = 0;

for (const name of readdirSync(examplesDir)) {
  if (!name.endsWith(".html")) continue;
  const base = name.slice(0, -".html".length);
  const htmlPath = join(examplesDir, name);
  const metaPath = join(examplesDir, `${base}.meta.json`);

  if (!existsSync(metaPath)) {
    console.error(`verify-artifact-integrity: missing sidecar for ${name}: ${base}.meta.json`);
    process.exit(1);
  }

  let meta;
  try {
    meta = JSON.parse(readFileSync(metaPath, "utf8"));
  } catch (e) {
    console.error(`verify-artifact-integrity: invalid JSON ${metaPath}:`, e);
    process.exit(1);
  }

  if (meta.policyVersion !== policyVersion) {
    console.error(
      `verify-artifact-integrity: ${metaPath} policyVersion ${meta.policyVersion} !== live policy ${policyVersion}`
    );
    process.exit(1);
  }

  const htmlBuf = readFileSync(htmlPath);
  const sha = createHash("sha256").update(htmlBuf).digest("hex");
  if (meta.artifactSha256 !== sha) {
    console.error(
      `verify-artifact-integrity: hash mismatch for ${name}\n  meta: ${meta.artifactSha256}\n  file: ${sha}`
    );
    process.exit(1);
  }

  if (meta.artifactBasename && meta.artifactBasename !== name) {
    console.error(`verify-artifact-integrity: artifactBasename in meta does not match ${name}`);
    process.exit(1);
  }

  checked++;
}

if (checked === 0) {
  console.error("verify-artifact-integrity: no walkthrough-*.html files found");
  process.exit(1);
}

console.error(`verify-artifact-integrity: OK (${checked} artifact(s))`);
