#!/usr/bin/env node
/**
 * Ensures verifyVendorManifest rejects tampered manifests (D-04 regression guard).
 */
import { verifyVendorManifest } from "../security/policy-runtime.mjs";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const tmp = mkdtempSync(join(os.tmpdir(), "wt-fail-"));
const vr = join(tmp, "vendor", "walkthrough-viewer");
mkdirSync(vr, { recursive: true });
writeFileSync(join(vr, "x.txt"), "hello");
writeFileSync(
  join(vr, "manifest.json"),
  JSON.stringify({
    manifestVersion: 1,
    algorithm: "sha256",
    entries: [{ path: "x.txt", sha256: "0".repeat(64) }],
  })
);

const r = verifyVendorManifest(tmp);
if (r.ok) {
  console.error("expected verifyVendorManifest to fail on bad hash");
  process.exit(1);
}
if (!r.errors.length) {
  console.error("expected errors array");
  process.exit(1);
}
console.log("test-vendor-failclosed: tampered manifest rejected as expected");
process.exit(0);
