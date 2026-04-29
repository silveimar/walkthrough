#!/usr/bin/env node
/**
 * Fail-closed scan of publish subtree for high-confidence secret patterns (INTG-03).
 *
 * Usage:
 *   node scripts/scan-publish-scope.mjs <dir>
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const TEXT_EXT = new Set([".html", ".htm", ".json", ".md", ".css", ".js", ".mjs", ".txt", ".svg"]);

const patterns = [
  { name: "bearer", re: /\bBearer\s+[A-Za-z0-9\-._~+/]{20,}/i },
  { name: "sk-ant", re: /\bsk-ant-[a-z]+-[A-Za-z0-9\-]{10,}/i },
  { name: "github-pat", re: /\bghp_[A-Za-z0-9]{20,}/i },
  { name: "aws-key", re: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
];

function scanFile(absPath) {
  let content;
  try {
    content = readFileSync(absPath, "utf8");
  } catch {
    return;
  }
  for (const { name, re } of patterns) {
    if (re.test(content)) {
      console.error(`scan-publish-scope: rejected pattern "${name}" in ${absPath}`);
      process.exit(1);
    }
  }
}

function walk(dir) {
  if (!existsSync(dir)) {
    console.error(`scan-publish-scope: missing ${dir}`);
    process.exit(1);
  }
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && TEXT_EXT.has(extname(name).toLowerCase())) scanFile(p);
  }
}

const root = process.argv[2];
if (!root) {
  console.error("Usage: node scripts/scan-publish-scope.mjs <dir>");
  process.exit(1);
}

walk(join(process.cwd(), root));
console.error(`scan-publish-scope: OK (${root})`);
