#!/usr/bin/env node
/**
 * Smoke tests for RUN-02 eval workspace path rules (PLT-02).
 * Run from repository root. No network.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  assertEvalWorkspaceDirAllowed,
  getRepoRoot,
} from "../security/policy-runtime.mjs";

const good = mkdtempSync(join(tmpdir(), "walkthrough-ws-ok-"));
try {
  assertEvalWorkspaceDirAllowed(good);
} finally {
  rmSync(good, { recursive: true, force: true });
}

let sawRun02 = false;
try {
  assertEvalWorkspaceDirAllowed(getRepoRoot());
} catch (e) {
  sawRun02 = e instanceof Error && /RUN-02/.test(e.message);
}
if (!sawRun02) {
  console.error("test-path-workspace: expected RUN-02 failure when workspace is repo root under evalWorkspaceMustBeUnderSystemTemp");
  process.exit(1);
}

console.error("test-path-workspace: OK");
