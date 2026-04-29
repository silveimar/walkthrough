#!/usr/bin/env node
/**
 * Writes provenance/manifest.json — SHA-256 of policy JSON + vendor manifest (ATT-01).
 * Run from repository root.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const policyPath = join(root, "security", "security-policy.json");
const vendorManifestPath = join(root, "vendor", "walkthrough-viewer", "manifest.json");
const outPath = join(root, "provenance", "manifest.json");

function sha256File(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

function usage() {
  console.error(
    "Usage: node scripts/build-provenance-manifest.mjs\n  Writes provenance/manifest.json from policy + vendor manifest digests."
  );
}

if (process.argv.includes("-h") || process.argv.includes("--help")) {
  usage();
  process.exit(0);
}

if (!existsSync(policyPath)) {
  console.error(`build-provenance-manifest: missing ${policyPath}`);
  process.exit(1);
}
if (!existsSync(vendorManifestPath)) {
  console.error(`build-provenance-manifest: missing ${vendorManifestPath}`);
  process.exit(1);
}

let policyVersion = null;
try {
  const pol = JSON.parse(readFileSync(policyPath, "utf8"));
  policyVersion = typeof pol.version === "number" ? pol.version : null;
} catch (e) {
  console.error(`build-provenance-manifest: invalid policy JSON: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
}

const manifest = {
  manifestVersion: 1,
  policySha256: sha256File(policyPath),
  vendorManifestSha256: sha256File(vendorManifestPath),
  policyVersion,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.error(`build-provenance-manifest: wrote ${outPath}`);
