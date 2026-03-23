#!/usr/bin/env node
/**
 * Deterministic grader for walkthrough skill output.
 *
 * Usage:
 *   node deterministic.mjs <result-dir> <expect_trigger> <expected_diagram>
 *
 * - result-dir: directory containing walkthrough-*.html (or empty if negative case)
 * - expect_trigger: "true" or "false"
 * - expected_diagram: "flowchart", "erDiagram", "any", or "none"
 *
 * Writes deterministic.json into result-dir.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , resultDir, expectTriggerStr, expectedDiagram] = process.argv;

if (!resultDir || !expectTriggerStr || !expectedDiagram) {
  console.error(
    "Usage: node deterministic.mjs <result-dir> <expect_trigger> <expected_diagram>"
  );
  process.exit(1);
}

const expectTrigger = expectTriggerStr === "true";

// Find walkthrough HTML file
const files = readdirSync(resultDir);
const htmlFile = files.find(
  (f) => f.startsWith("walkthrough-") && f.endsWith(".html")
);
const htmlPath = htmlFile ? join(resultDir, htmlFile) : null;
const html = htmlPath ? readFileSync(htmlPath, "utf8") : "";

const checks = {};

function check(id, pass, detail) {
  checks[id] = { pass, ...(detail !== undefined ? { detail } : {}) };
}

// --- Negative case: skill should NOT have triggered ---
if (!expectTrigger) {
  check("no_trigger", !htmlFile, htmlFile ? `Unexpected file: ${htmlFile}` : undefined);

  const result = {
    prompt_id: resultDir.split("/").pop(),
    html_file: htmlFile || null,
    expect_trigger: false,
    checks,
    passed: Object.values(checks).filter((c) => c.pass).length,
    failed: Object.values(checks).filter((c) => !c.pass).length,
    total: Object.keys(checks).length,
    score: Object.values(checks).every((c) => c.pass) ? 1 : 0,
  };

  writeFileSync(join(resultDir, "deterministic.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// --- Positive case: skill SHOULD have triggered ---

// Tier 1: File level
check("file_exists", !!htmlFile);
check(
  "file_naming",
  htmlFile ? /^walkthrough-[a-z0-9-]+\.html$/.test(htmlFile) : false,
  htmlFile
);
check(
  "file_self_contained",
  html.trimStart().startsWith("<!DOCTYPE html>") ||
    html.trimStart().startsWith("<!doctype html>")
);

// Tier 2: CDN dependencies
check("cdn_react", html.includes("unpkg.com/react@18") || html.includes("react@18"));
check(
  "cdn_reactdom",
  html.includes("unpkg.com/react-dom@18") || html.includes("react-dom@18")
);
check("cdn_tailwind", html.includes("tailwindcss.com") || html.includes("tailwindcss"));
check("cdn_mermaid", html.includes("mermaid@11") || html.includes("mermaid@1"));
check("cdn_shiki", html.includes("createHighlighter") && html.includes("shiki"));

// Tier 3: Dark mode
check(
  "dark_mode_bg",
  html.includes("#000000") || html.includes("'#000000'") || html.includes('"#000000"')
);
check(
  "dark_mode_colorscheme",
  html.includes("color-scheme:dark") || html.includes("color-scheme: dark")
);

// Tier 4: Diagram
if (expectedDiagram === "flowchart") {
  check(
    "diagram_type",
    html.includes("graph TD") || html.includes("graph LR") || html.includes("graph TB"),
    "Expected flowchart (graph TD/LR/TB)"
  );
} else if (expectedDiagram === "erDiagram") {
  check("diagram_type", html.includes("erDiagram"), "Expected erDiagram");
} else if (expectedDiagram === "any") {
  check(
    "diagram_type",
    html.includes("graph TD") ||
      html.includes("graph LR") ||
      html.includes("graph TB") ||
      html.includes("erDiagram"),
    "Expected any diagram type"
  );
}

check(
  "click_handlers",
  html.includes("nodeClickHandler") || html.includes("onEntityClick")
);
// ER diagrams use manual .entityLabel click handlers, not Mermaid's `click` syntax
if (expectedDiagram === "erDiagram") {
  check(
    "click_bindings",
    html.includes("entityLabel") || html.includes("onEntityClick")
  );
} else {
  check("click_bindings", /click\s+\w+\s+nodeClickHandler/.test(html));
}

// Tier 5: NODES data
check("nodes_object", html.includes("const NODES"));

// Extract NODES block for deeper inspection
// The closing }; may be indented, so match with optional whitespace
const nodesMatch = html.match(/const NODES\s*=\s*\{([\s\S]*?)\n\s*\};/);
const nodesBlock = nodesMatch ? nodesMatch[1] : "";

// Count top-level node keys in NODES
// Strategy: find all keys whose block contains "title:" (node entries always have title)
const nodeKeys = [];
const keyPattern = /^\s+(\w+)\s*:\s*\{/gm;
let m;
const allKeys = [];
while ((m = keyPattern.exec(nodesBlock)) !== null) {
  allKeys.push({ key: m[1], index: m.index });
}
// Filter to only top-level node keys (those whose block contains "title:")
for (let i = 0; i < allKeys.length; i++) {
  const start = allKeys[i].index;
  const end = i < allKeys.length - 1 ? allKeys[i + 1].index : nodesBlock.length;
  const block = nodesBlock.slice(start, end);
  if (block.includes("title:") || block.includes("title :")) {
    nodeKeys.push(allKeys[i].key);
  }
}

check("nodes_count", nodeKeys.length >= 5 && nodeKeys.length <= 12, `Found ${nodeKeys.length} nodes: ${nodeKeys.join(", ")}`);

// Check each node for required fields
if (nodeKeys.length > 0) {
  const missingTitle = [];
  const missingDescription = [];
  const missingFiles = [];
  const missingCode = [];
  const missingLang = [];

  // Build a map of node key -> block content using allKeys positions
  const nodeBlockMap = {};
  for (let i = 0; i < allKeys.length; i++) {
    if (!nodeKeys.includes(allKeys[i].key)) continue;
    const start = allKeys[i].index;
    const end = i < allKeys.length - 1 ? allKeys[i + 1].index : nodesBlock.length;
    nodeBlockMap[allKeys[i].key] = nodesBlock.slice(start, end);
  }

  for (let i = 0; i < nodeKeys.length; i++) {
    const key = nodeKeys[i];
    const nodeContent = nodeBlockMap[key] || "";

    if (!nodeContent.includes("title:") && !nodeContent.includes("title :")) {
      missingTitle.push(key);
    }
    if (!nodeContent.includes("description:") && !nodeContent.includes("description :")) {
      missingDescription.push(key);
    }
    if (!nodeContent.includes("files:") && !nodeContent.includes("files :")) {
      missingFiles.push(key);
    }
    if (!nodeContent.includes("code:") && !nodeContent.includes("code :") && !nodeContent.includes("code`")) {
      missingCode.push(key);
    }
    if (!nodeContent.includes("lang:") && !nodeContent.includes("lang :")) {
      missingLang.push(key);
    }
  }

  check("node_has_title", missingTitle.length === 0, missingTitle.length > 0 ? `Missing title: ${missingTitle.join(", ")}` : undefined);
  check("node_has_description", missingDescription.length === 0, missingDescription.length > 0 ? `Missing description: ${missingDescription.join(", ")}` : undefined);
  check("node_has_files", missingFiles.length === 0, missingFiles.length > 0 ? `Missing files: ${missingFiles.join(", ")}` : undefined);
  check("node_has_code", missingCode.length === 0, missingCode.length > 0 ? `Missing code: ${missingCode.join(", ")}` : undefined);
  check("node_has_lang", missingLang.length === 0, missingLang.length > 0 ? `Missing lang: ${missingLang.join(", ")}` : undefined);
} else {
  check("node_has_title", false, "No nodes found to check");
  check("node_has_description", false, "No nodes found to check");
  check("node_has_files", false, "No nodes found to check");
  check("node_has_code", false, "No nodes found to check");
  check("node_has_lang", false, "No nodes found to check");
}

// Tier 6: Components
check("summary_component", html.includes("function Summary") || html.includes("Summary"));
check(
  "summary_collapsed",
  html.includes("useState(true)") || html.includes("collapsed") || html.includes("Collapsed")
);
check("detail_panel", html.includes("DetailPanel") || html.includes("detail-panel"));
check(
  "zoom_controls",
  html.includes("ZoomControls") || html.includes("usePanZoom")
);
check("bind_functions", html.includes("bindFunctions"));
check("legend_data", html.includes("const LEGEND") || html.includes("LEGEND"));

// --- Compute result ---
const passed = Object.values(checks).filter((c) => c.pass).length;
const failed = Object.values(checks).filter((c) => !c.pass).length;
const total = Object.keys(checks).length;

const result = {
  prompt_id: resultDir.split("/").pop(),
  html_file: htmlFile || null,
  expect_trigger: true,
  checks,
  passed,
  failed,
  total,
  score: total > 0 ? +(passed / total).toFixed(3) : 0,
};

writeFileSync(join(resultDir, "deterministic.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
