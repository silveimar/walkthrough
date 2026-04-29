#!/usr/bin/env node
/**
 * Read stdin, write redacted stdout (for piping stderr tails in evals/run.sh).
 */
import { readFileSync } from "node:fs";
import { redactString } from "../security/redaction.mjs";

const s = readFileSync(0, "utf8");
process.stdout.write(redactString(s));
