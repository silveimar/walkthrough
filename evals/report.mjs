#!/usr/bin/env node
/**
 * Report aggregator for walkthrough eval results.
 *
 * Usage:
 *   node report.mjs <results-timestamp-dir> [--json]
 *
 * Reads deterministic.json and llm-grade.json from each prompt subdirectory
 * and prints a summary table.
 */

import { readdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  assertEntrypointForCurrentModule,
  assertPathUnderCanonicalEvalResults,
  assertStrictRepoWorkingDirectory,
} from "../security/policy-runtime.mjs";
import { redactDeep } from "../security/redaction.mjs";

assertEntrypointForCurrentModule(import.meta.url);
assertStrictRepoWorkingDirectory();

const [, , resultsDir, ...flags] = process.argv;
const jsonOnly = flags.includes("--json");

if (!resultsDir) {
  console.error("Usage: node report.mjs <results-timestamp-dir> [--json]");
  process.exit(1);
}

try {
  assertPathUnderCanonicalEvalResults(resolve(resultsDir));
} catch (e) {
  console.error("Warning (DATA-03):", e instanceof Error ? e.message : e);
}

const promptDirs = readdirSync(resultsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const rows = [];

for (const promptId of promptDirs) {
  const dir = join(resultsDir, promptId);
  const row = { prompt_id: promptId, triggered: null, det_score: null, det_total: null, llm_score: null, nodes: null, pass: null };

  // Read deterministic results
  const detPath = join(dir, "deterministic.json");
  if (existsSync(detPath)) {
    const det = JSON.parse(readFileSync(detPath, "utf8"));
    row.triggered = det.expect_trigger ? (det.checks.file_exists?.pass ? "yes" : "NO") : (det.checks.no_trigger?.pass ? "no (OK)" : "TRIGGERED");
    row.det_score = det.passed;
    row.det_total = det.total;
    row.nodes = det.checks.nodes_count?.detail?.match(/Found (\d+)/)?.[1] || "N/A";

    // Pass logic for deterministic
    if (!det.expect_trigger) {
      row.pass = det.checks.no_trigger?.pass ? "PASS" : "FAIL";
    } else {
      row.pass = det.score >= 0.8 ? "PASS" : "FAIL";
    }
  }

  // Read LLM results
  const llmPath = join(dir, "llm-grade.json");
  if (existsSync(llmPath)) {
    const llm = JSON.parse(readFileSync(llmPath, "utf8"));
    row.llm_score = llm.overall?.score ?? null;

    // Override pass if LLM says fail
    if (llm.overall?.pass === false && row.pass !== "FAIL") {
      row.pass = "FAIL";
    }
  }

  rows.push(row);
}

// Compute summary
const total = rows.length;
const passed = rows.filter((r) => r.pass === "PASS").length;
const failed = rows.filter((r) => r.pass === "FAIL").length;
const passRate = total > 0 ? +(passed / total).toFixed(3) : 0;

const summary = { total, passed, failed, pass_rate: passRate, rows };

if (jsonOnly) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  // Print markdown table
  console.log("");
  console.log("| Prompt ID      | Triggered | Det. Score | LLM Score | Nodes | Pass |");
  console.log("|----------------|-----------|------------|-----------|-------|------|");
  for (const r of rows) {
    const det = r.det_score !== null ? `${r.det_score}/${r.det_total}` : "N/A";
    const llm = r.llm_score !== null ? r.llm_score.toFixed(1) : "N/A";
    const nodes = r.nodes || "N/A";
    console.log(
      `| ${r.prompt_id.padEnd(14)} | ${(r.triggered || "?").toString().padEnd(9)} | ${det.padEnd(10)} | ${llm.padEnd(9)} | ${nodes.toString().padEnd(5)} | ${r.pass || "?"} |`
    );
  }
  console.log("");
  console.log(`Pass rate: ${passed}/${total} (${(passRate * 100).toFixed(1)}%)`);
  console.log("");
}

// Write summary.json
writeFileSync(join(resultsDir, "summary.json"), JSON.stringify(redactDeep(summary), null, 2));
