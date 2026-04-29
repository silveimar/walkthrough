/**
 * Shared policy load and guards for eval entrypoints (POL-02, D-05–D-10).
 */

import { readFileSync, existsSync, realpathSync } from "node:fs";
import os from "node:os";
import { dirname, join, normalize, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePolicyDocument } from "./validate-policy.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @returns {string} Repository root (directory containing `security/`). */
export function getRepoRoot() {
  return dirname(__dirname);
}

/**
 * Load and validate security/security-policy.json (D-02, D-03).
 * @returns {Record<string, unknown>}
 */
export function loadRepoPolicy() {
  const root = getRepoRoot();
  const p = join(root, "security", "security-policy.json");
  if (!existsSync(p)) {
    throw new Error(`Policy missing: ${p} (D-02)`);
  }
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    throw new Error(`Invalid policy JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
  const { ok, errors } = validatePolicyDocument(parsed);
  if (!ok) {
    throw new Error(`Policy validation failed: ${errors.join("; ")}`);
  }
  return parsed;
}

/**
 * @param {string} scriptRelPath repo-relative POSIX path
 */
export function assertEntrypointAllowed(scriptRelPath) {
  const policy = loadRepoPolicy();
  const norm = normalize(scriptRelPath).split("\\").join("/");
  const gated = /** @type {{ gatedRelPaths: string[] }} */ (policy.entrypoints).gatedRelPaths.map((p) =>
    normalize(p).split("\\").join("/")
  );
  if (!gated.includes(norm)) {
    throw new Error(
      `Policy entrypoints.gatedRelPaths (D-10): script not authorized: ${scriptRelPath}. Allowed: ${gated.join(", ")}`
    );
  }
}

/**
 * @param {string} importMetaUrl import.meta.url of the caller module
 */
export function assertEntrypointForCurrentModule(importMetaUrl) {
  const root = getRepoRoot();
  const abs = fileURLToPath(importMetaUrl);
  const rel = relative(root, abs).split("\\").join("/");
  assertEntrypointAllowed(rel);
}

/**
 * Parse `--allow-egress id1,id2` from argv tokens.
 * @param {string[]} argv
 * @returns {string[]}
 */
export function parseAllowEgressArgv(argv) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--allow-egress" && argv[i + 1] !== undefined) {
      const raw = argv[i + 1];
      out.push(
        ...String(raw)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
      i++;
    }
  }
  return out;
}

/**
 * Parse comma-separated egress exception ids from env (set by evals/run.sh).
 * @param {NodeJS.ProcessEnv} env
 * @returns {string[]}
 */
export function parseAllowEgressEnv(env) {
  const raw = env.WALKTHROUGH_ALLOW_EGRESS || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Deny-all egress: allow claude_cli only when argv/env references an allowed exception id (D-06, D-07).
 * @param {NodeJS.ProcessEnv} env
 * @param {string[]} argv process.argv slice for run.sh flags (or synthetic ['--allow-egress', ids])
 */
export function assertClaudeCliEgressAllowed(env, argv) {
  const policy = loadRepoPolicy();
  const egress = /** @type {{ defaultPosture: string, exceptionAllowlist: { id: string, channels: string[] }[] }} */ (
    policy.egress
  );
  if (egress.defaultPosture !== "deny_all") return;

  const allowedIds = new Set(
    egress.exceptionAllowlist.filter((e) => e.channels.includes("claude_cli")).map((e) => e.id)
  );

  const fromArgv = parseAllowEgressArgv(argv);
  const fromEnv = parseAllowEgressEnv(env);
  const requested = [...new Set([...fromArgv, ...fromEnv])];

  const ok = requested.some((id) => allowedIds.has(id));
  if (!ok) {
    throw new Error(
      `Egress blocked (egress.defaultPosture deny_all, D-07): claude_cli requires --allow-egress matching egress.exceptionAllowlist with channel claude_cli. Allowed ids: ${[
        ...allowedIds,
      ].join(", ")}. Requested: ${requested.length ? requested.join(", ") : "(none)"}`
    );
  }
}

/**
 * LLM rubric network off until opt-in env matches policy (D-08).
 * @param {NodeJS.ProcessEnv} env
 */
export function assertLlmRubricNetworkAllowed(env) {
  const policy = loadRepoPolicy();
  const lr = /** @type {{ networkDefault: string, optInEnvVar: string }} */ (policy.llmRubric);
  if (lr.networkDefault !== "off") return;
  const key = lr.optInEnvVar;
  const val = env[key];
  if (val !== "1" && val !== "true") {
    throw new Error(
      `LLM rubric network blocked (llmRubric.networkDefault off, D-08): set ${key}=1. Current ${key}=${val ?? "(unset)"}`
    );
  }
}

/**
 * When LLM rubric runs claude, require matching egress exception id (D-06).
 * @param {NodeJS.ProcessEnv} env
 */
export function assertLlmRubricEgressAllowed(env) {
  const policy = loadRepoPolicy();
  const allowed = policy.egress.exceptionAllowlist
    .filter((e) => e.channels.includes("llm_rubric_claude"))
    .map((e) => e.id);
  const ids = parseAllowEgressEnv(env);
  const ok = allowed.some((a) => ids.includes(a));
  if (!ok) {
    throw new Error(
      `LLM rubric egress blocked (D-07): include a llm_rubric_claude exception in WALKTHROUGH_ALLOW_EGRESS (from evals/run.sh --allow-egress). Required one of: ${allowed.join(", ")}. Got: ${env.WALKTHROUGH_ALLOW_EGRESS ?? "(unset)"}`
    );
  }
}

/**
 * Call immediately before execSync to claude in llm-rubric.mjs.
 * @param {NodeJS.ProcessEnv} env
 */
export function assertBeforeLlmRubricExec(env) {
  assertLlmRubricNetworkAllowed(env);
  assertLlmRubricEgressAllowed(env);
}

/**
 * Optional umbrella for scripted checks (evals/run.sh uses granular asserts).
 * @param {{ scriptId: string, env: NodeJS.ProcessEnv, argv: string[] }} opts
 */
export function assertEvalGuards(opts) {
  assertEntrypointAllowed(opts.scriptId);
  if (opts.scriptId === "evals/run.sh") {
    assertClaudeCliEgressAllowed(opts.env, opts.argv);
  }
}

/**
 * Human-readable hint for blocked egress (for shell messaging).
 * @param {Error} err
 */
export function describeBlockedEgress(err) {
  return err instanceof Error ? err.message : String(err);
}

/**
 * RUN-02: Eval harness uses mktemp — ensure resolved dir stays under system temp when policy requires it.
 * @param {string} absDir absolute path from mktemp -d
 */
export function assertEvalWorkspaceDirAllowed(absDir) {
  const policy = loadRepoPolicy();
  const rt = /** @type {{ evalWorkspaceMustBeUnderSystemTemp?: boolean }} */ (policy.runtime);
  if (!rt?.evalWorkspaceMustBeUnderSystemTemp) return;

  let resolved;
  try {
    resolved = realpathSync(absDir);
  } catch (e) {
    throw new Error(
      `RUN-02: cannot resolve eval workspace dir: ${absDir} (${e instanceof Error ? e.message : String(e)})`
    );
  }

  const tmpRoot = realpathSync(os.tmpdir());
  const ok =
    resolved === tmpRoot || resolved.startsWith(tmpRoot.endsWith(sep) ? tmpRoot : tmpRoot + sep);
  if (!ok) {
    throw new Error(
      `RUN-02: eval workspace must be under system temp (${tmpRoot}); got ${resolved}`
    );
  }
}

/**
 * RUN-03: Optional strict cwd — set WALKTHROUGH_STRICT_CWD=1 for CI-like misuse detection.
 */
export function assertStrictRepoWorkingDirectory() {
  const v = process.env.WALKTHROUGH_STRICT_CWD;
  if (v !== "1" && v !== "true") return;

  const root = realpathSync(getRepoRoot());
  let cwd;
  try {
    cwd = realpathSync(process.cwd());
  } catch (e) {
    throw new Error(`RUN-03: cannot resolve process.cwd(): ${e instanceof Error ? e.message : String(e)}`);
  }

  if (cwd !== root && !cwd.startsWith(root + sep)) {
    throw new Error(
      `RUN-03: with WALKTHROUGH_STRICT_CWD, cwd (${cwd}) must be repository root (${root})`
    );
  }
}

/**
 * Validate publish artifact directory is under publish.approvedPathRoots (D-12).
 * @param {string} artifactPath POSIX path relative to repo root, e.g. '.' or 'examples'
 */
export function assertPublishArtifactPathAllowed(artifactPath) {
  const policy = loadRepoPolicy();
  const roots = /** @type {string[]} */ (
    /** @type {{ approvedPathRoots: string[] }} */ (policy.publish).approvedPathRoots
  );
  const norm = normalize(artifactPath).split("\\").join("/") || ".";
  const ok = roots.some((root) => {
    const r = root === "." ? "." : normalize(root).split("\\").join("/");
    if (r === ".") return true;
    return norm === r || norm.startsWith(r.endsWith("/") ? r : `${r}/`);
  });
  if (!ok) {
    throw new Error(
      `Publish path not allowed by publish.approvedPathRoots (D-12): ${artifactPath}. Allowed roots: ${roots.join(", ")}`
    );
  }
}

/**
 * Absolute path to canonical eval results directory (DATA-03).
 * @returns {string}
 */
export function getCanonicalEvalResultsAbsPath() {
  const policy = loadRepoPolicy();
  const rel =
    /** @type {string | undefined} */ (
      /** @type {{ dataProtection?: { sensitiveOutputs?: { canonicalEvalResultsRelPath?: string } } }} */ (
        policy
      ).dataProtection?.sensitiveOutputs?.canonicalEvalResultsRelPath
    ) || "evals/results";
  const norm = rel.split("\\").join("/").replace(/^\/+/, "");
  return join(getRepoRoot(), ...norm.split("/").filter(Boolean));
}

/**
 * Fail if absolute path is not under canonical eval results root (optional tooling gate).
 * @param {string} absPath
 */
export function assertPathUnderCanonicalEvalResults(absPath) {
  let resolved;
  try {
    resolved = realpathSync(absPath);
  } catch (e) {
    throw new Error(
      `DATA-03: cannot resolve path: ${absPath} (${e instanceof Error ? e.message : String(e)})`
    );
  }
  const base = realpathSync(getCanonicalEvalResultsAbsPath());
  const ok = resolved === base || resolved.startsWith(base.endsWith(sep) ? base : base + sep);
  if (!ok) {
    throw new Error(`DATA-03: path must be under canonical eval results dir (${base}): ${resolved}`);
  }
}
