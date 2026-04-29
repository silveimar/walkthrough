#!/usr/bin/env node
/**
 * Populate vendor/walkthrough-viewer from npm packages (OFF-02, OFF-03).
 * Run after `npm ci`. Regenerates manifest.json with SHA-256 for every file under vendor/walkthrough-viewer.
 */

import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const NM = join(ROOT, "node_modules");
const VENDOR_ROOT = join(ROOT, "vendor", "walkthrough-viewer");

function sha256File(abs) {
  const buf = readFileSync(abs);
  return createHash("sha256").update(buf).digest("hex");
}

function walkFiles(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(p, base));
    else if (name.isFile()) out.push(p);
  }
  return out;
}

function main() {
  if (!existsSync(NM)) {
    console.error("node_modules missing — run npm ci first.");
    process.exit(1);
  }

  mkdirSync(join(VENDOR_ROOT, "umd"), { recursive: true });
  mkdirSync(join(VENDOR_ROOT, "css"), { recursive: true });

  cpSync(join(NM, "react", "umd", "react.production.min.js"), join(VENDOR_ROOT, "umd", "react.production.min.js"));
  cpSync(join(NM, "react-dom", "umd", "react-dom.production.min.js"), join(VENDOR_ROOT, "umd", "react-dom.production.min.js"));
  cpSync(join(NM, "mermaid", "dist", "mermaid.min.js"), join(VENDOR_ROOT, "umd", "mermaid.min.js"));

  const shikiDest = join(VENDOR_ROOT, "shiki-pkg");
  mkdirSync(shikiDest, { recursive: true });
  cpSync(join(NM, "shiki"), shikiDest, { recursive: true });

  const twCli = join(NM, "tailwindcss", "lib", "cli.js");
  execFileSync(
    process.execPath,
    [
      twCli,
      "-c",
      join(ROOT, "scripts", "tailwind.walkthrough.config.cjs"),
      "-i",
      join(ROOT, "scripts", "walkthrough-tailwind-input.css"),
      "-o",
      join(VENDOR_ROOT, "css", "walkthrough-viewer.css"),
      "--minify",
    ],
    { cwd: ROOT, stdio: "inherit" }
  );

  const entries = [];
  for (const abs of walkFiles(VENDOR_ROOT)) {
    if (relative(VENDOR_ROOT, abs) === "manifest.json") continue;
    const rel = relative(VENDOR_ROOT, abs).split("\\").join("/");
    entries.push({
      path: rel,
      sha256: sha256File(abs),
    });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));

  const manifest = {
    manifestVersion: 1,
    algorithm: "sha256",
    entries,
  };
  writeFileSync(join(VENDOR_ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  console.log(`vendor sync OK — ${entries.length} files in manifest under vendor/walkthrough-viewer`);
}

main();
