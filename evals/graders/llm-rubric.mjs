#!/usr/bin/env node
/**
 * LLM-based rubric grader for walkthrough skill output.
 *
 * Usage:
 *   node llm-rubric.mjs <html-path> <output-path>
 *
 * Reads the generated HTML, sends it to claude -p with a rubric,
 * and writes structured JSON grading to output-path.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertBeforeLlmRubricExec,
  assertEntrypointForCurrentModule,
} from "../../security/policy-runtime.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

assertEntrypointForCurrentModule(import.meta.url);

const [, , htmlPath, outputPath] = process.argv;

if (!htmlPath || !outputPath) {
  console.error("Usage: node llm-rubric.mjs <html-path> <output-path>");
  process.exit(1);
}

assertBeforeLlmRubricExec(process.env);

const html = readFileSync(htmlPath, "utf8");
const rubric = readFileSync(join(__dirname, "rubric.md"), "utf8");

// Extract the data sections to reduce token usage
function extractDataSections(fullHtml) {
  const sections = [];

  // Extract DIAGRAM
  const diagramMatch = fullHtml.match(/const DIAGRAM\s*=\s*`([\s\S]*?)`;/);
  if (diagramMatch) sections.push("## DIAGRAM\n```\n" + diagramMatch[1].trim() + "\n```");

  // Extract NODES
  const nodesMatch = fullHtml.match(/(const NODES\s*=\s*\{[\s\S]*?\n\};)/);
  if (nodesMatch) sections.push("## NODES\n```js\n" + nodesMatch[1] + "\n```");

  // Extract LEGEND
  const legendMatch = fullHtml.match(/(const LEGEND\s*=\s*\[[\s\S]*?\];)/);
  if (legendMatch) sections.push("## LEGEND\n```js\n" + legendMatch[1] + "\n```");

  // Extract summary text if present
  const summaryMatch = fullHtml.match(/const SUMMARY\s*=\s*["'`]([\s\S]*?)["'`]\s*;/);
  if (summaryMatch) sections.push("## SUMMARY\n" + summaryMatch[1].trim());

  // Extract title
  const titleMatch = fullHtml.match(/<title>(.*?)<\/title>/);
  if (titleMatch) sections.push("## TITLE\n" + titleMatch[1]);

  if (sections.length === 0) {
    // Fallback: send the full HTML but truncated
    return fullHtml.slice(0, 15000);
  }

  return sections.join("\n\n");
}

const dataSections = extractDataSections(html);

const jsonSchema = JSON.stringify({
  type: "object",
  properties: {
    readability: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 1, maximum: 5 },
        reasoning: { type: "string" },
      },
      required: ["score", "reasoning"],
    },
    node_descriptions: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 1, maximum: 5 },
        reasoning: { type: "string" },
      },
      required: ["score", "reasoning"],
    },
    code_snippets: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 1, maximum: 5 },
        reasoning: { type: "string" },
      },
      required: ["score", "reasoning"],
    },
    diagram_accuracy: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 1, maximum: 5 },
        reasoning: { type: "string" },
      },
      required: ["score", "reasoning"],
    },
    overall: {
      type: "object",
      properties: {
        score: { type: "number", minimum: 1, maximum: 5 },
        pass: { type: "boolean" },
      },
      required: ["score", "pass"],
    },
  },
  required: [
    "readability",
    "node_descriptions",
    "code_snippets",
    "diagram_accuracy",
    "overall",
  ],
});

const prompt = `You are evaluating a generated HTML walkthrough. Grade it against the rubric below.

${rubric}

---

Here is the walkthrough content to evaluate:

${dataSections}

---

Grade each dimension (readability, node_descriptions, code_snippets, diagram_accuracy) on a 1-5 scale.
Set overall.pass to true if overall score >= 3 and no individual dimension is below 2.
Respond ONLY with valid JSON matching the required schema.`;

try {
  // Write prompt and schema to temp files to avoid shell escaping issues
  const tmpPromptPath = join(dirname(outputPath), ".llm-rubric-prompt.tmp");
  const tmpSchemaPath = join(dirname(outputPath), ".llm-rubric-schema.tmp");
  writeFileSync(tmpPromptPath, prompt, "utf8");
  writeFileSync(tmpSchemaPath, jsonSchema, "utf8");

  const result = execSync(
    `cat "${tmpPromptPath}" | claude -p --model sonnet --output-format json --json-schema "$(cat "${tmpSchemaPath}")" --no-session-persistence --max-budget-usd 0.50`,
    {
      encoding: "utf8",
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    }
  );

  // Parse the claude output (--output-format json wraps in { result, ... })
  let grade;
  try {
    const parsed = JSON.parse(result);
    // The result field contains the model's text output
    grade = typeof parsed.result === "string" ? JSON.parse(parsed.result) : parsed.result;
  } catch {
    // Maybe it's direct JSON
    grade = JSON.parse(result);
  }

  writeFileSync(outputPath, JSON.stringify(grade, null, 2));
  console.log(JSON.stringify(grade, null, 2));

  // Clean up temp files
  try {
    const { unlinkSync } = await import("node:fs");
    unlinkSync(tmpPromptPath);
    unlinkSync(tmpSchemaPath);
  } catch {}
} catch (err) {
  const fallback = {
    error: err.message,
    readability: { score: 0, reasoning: "Grader failed" },
    node_descriptions: { score: 0, reasoning: "Grader failed" },
    code_snippets: { score: 0, reasoning: "Grader failed" },
    diagram_accuracy: { score: 0, reasoning: "Grader failed" },
    overall: { score: 0, pass: false },
  };
  writeFileSync(outputPath, JSON.stringify(fallback, null, 2));
  console.error("LLM grader failed:", err.message);
  console.log(JSON.stringify(fallback, null, 2));
  process.exit(1);
}
