#!/usr/bin/env node
/**
 * Verify provenance/manifest.json digests vs disk; optionally Minisign signature (ATT-03).
 * Run from repository root.
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const policyPath = join(root, "security", "security-policy.json");
const vendorManifestPath = join(root, "vendor", "walkthrough-viewer", "manifest.json");
const manifestPath = join(root, "provenance", "manifest.json");
const sigPath = join(root, "provenance", "manifest.json.sig");
const pubPath = join(root, "provenance", "minisign.pub");

function sha256File(absPath) {
  return createHash("sha256").update(readFileSync(absPath)).digest("hex");
}

function usage() {
  console.error(
    "Usage: node scripts/verify-provenance.mjs\n  Checks digest fields in provenance/manifest.json; verifies Minisign if manifest.json.sig + minisign.pub exist."
  );
}

if (process.argv.includes("-h") || process.argv.includes("--help")) {
  usage();
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error(`verify-provenance: missing ${manifestPath} — run: node scripts/build-provenance-manifest.mjs`);
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (e) {
  console.error(`verify-provenance: invalid manifest JSON: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
}

if (!existsSync(policyPath) || !existsSync(vendorManifestPath)) {
  console.error("verify-provenance: policy or vendor manifest missing on disk");
  process.exit(1);
}

const policySha = sha256File(policyPath);
const vendorSha = sha256File(vendorManifestPath);

if (manifest.policySha256 !== policySha) {
  console.error(
    `verify-provenance: policySha256 mismatch (manifest ${manifest.policySha256} vs disk ${policySha})`
  );
  process.exit(1);
}
if (manifest.vendorManifestSha256 !== vendorSha) {
  console.error(
    `verify-provenance: vendorManifestSha256 mismatch (manifest ${manifest.vendorManifestSha256} vs disk ${vendorSha})`
  );
  process.exit(1);
}

console.error("verify-provenance: digest checks OK");

if (!existsSync(sigPath)) {
  console.error("verify-provenance: no manifest.json.sig — digest-only verification (unsigned manifest acceptable for dev)");
  process.exit(0);
}

if (!existsSync(pubPath)) {
  console.error(`verify-provenance: signature present but missing ${pubPath} — cannot verify`);
  process.exit(1);
}

const r = spawnSync("minisign", ["-Vm", manifestPath, "-p", pubPath], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (r.error && "code" in r.error && r.error.code === "ENOENT") {
  console.error("verify-provenance: minisign CLI not found — install Minisign to verify signatures");
  process.exit(1);
}

if (r.status !== 0) {
  console.error(r.stderr || r.stdout || "minisign verify failed");
  process.exit(1);
}

console.error("verify-provenance: minisign signature OK");
process.exit(0);
