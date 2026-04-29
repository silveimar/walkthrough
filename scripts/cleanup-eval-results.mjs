#!/usr/bin/env node
/**
 * Remove eval result timestamp directories older than policy retention (DATA-02).
 *
 * Usage:
 *   node scripts/cleanup-eval-results.mjs [--dry-run]
 */

import { readdirSync, rmSync, lstatSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadRepoPolicy, getCanonicalEvalResultsAbsPath } from "../security/policy-runtime.mjs";

const dryRun = process.argv.includes("--dry-run");

const policy = loadRepoPolicy();
const maxDays =
  /** @type {number | undefined} */ (
    /** @type {{ dataProtection?: { retention?: { evalResultsMaxAgeDays?: number } } }} */ (policy)
      .dataProtection?.retention?.evalResultsMaxAgeDays
  ) ?? 30;

const resultsRoot = getCanonicalEvalResultsAbsPath();
if (!existsSync(resultsRoot)) {
  console.error(`cleanup-eval-results: nothing to do (missing ${resultsRoot})`);
  process.exit(0);
}

const maxMs = maxDays * 24 * 60 * 60 * 1000;
const now = Date.now();
let removed = 0;

for (const name of readdirSync(resultsRoot)) {
  if (name === "latest") continue;
  const p = join(resultsRoot, name);
  let st;
  try {
    st = lstatSync(p);
  } catch {
    continue;
  }
  if (!st.isDirectory()) continue;
  const ageMs = now - st.mtimeMs;
  if (ageMs <= maxMs) continue;

  if (dryRun) {
    console.log(`dry-run: would remove ${p} (age ${Math.round(ageMs / 86400000)}d > ${maxDays}d)`);
  } else {
    rmSync(p, { recursive: true, force: true });
    console.error(`removed ${p}`);
  }
  removed++;
}

console.error(
  dryRun
    ? `cleanup-eval-results: dry-run complete (${removed} director(y|ies) eligible)`
    : `cleanup-eval-results: removed ${removed} director(y|ies) older than ${maxDays} days`
);
