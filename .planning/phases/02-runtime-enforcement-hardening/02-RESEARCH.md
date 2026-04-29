# Phase 2 — Research: Runtime Enforcement Hardening

**Phase:** 02-runtime-enforcement-hardening  
**Date:** 2026-04-29  
**Requirement IDs:** RUN-01, RUN-02, RUN-03

## Summary

Phase 2 removes shell-mediated execution for dynamic content in the eval pipeline, tightens Bash orchestration for portability, and extends the existing policy runtime so subprocess and filesystem boundaries are explicit and fail-closed. Phase 1 already centralizes policy load and egress; this phase focuses on **how** commands are invoked and **what** is validated before work begins.

## Findings

### RUN-01 — Shell interpolation and pipelines

- **`evals/graders/llm-rubric.mjs`** uses `execSync()` with a string command that runs `cat ... | claude ...` and embeds paths in double quotes. Paths come from trusted `dirname(outputPath)` temp files, but the pattern still invokes `/bin/sh`, expanding injection surface if quoting changes.
- **Recommendation:** Use `spawnSync("claude", [...args], { input: promptText, encoding: "utf8" })` or pipe prompt via `stdin` from a Buffer; pass `--json-schema` content via file path using argv only (`--json-schema`, path) without `cat`. Alternatively `execFile` with argument array and no shell.
- **`evals/run.sh`:** Codebase concern: non-POSIX `tail` usage — replace with `tail -n 5` (or portable equivalent). Ensure variables holding paths are quoted and never expanded through `eval`.

### RUN-02 — Constrained execution context

- **`security/policy-runtime.mjs`** already resolves repo root, loads policy, and gates entrypoints. Phase 2 should add **structured** constraints discoverable from policy JSON (e.g. allowed subprocess basename allowlist for eval channels, optional workspace root prefixes for temp copies) rather than scattering checks.
- **`evals/run.sh`** stages temp workspaces under controlled directories — validate resolved paths stay under repo temp or `TMPDIR` expectations.

### RUN-03 — Startup validation

- Node scripts already call `assertEntrypointForCurrentModule`. Extend with **repo-relative cwd sanity** (optional): warn or fail when `process.cwd()` is outside expected repo root for maintainer misuse detection.
- **`evals/run.sh`:** Fail fast when `node`, `bash` version, or `claude` (when needed) is missing; run after `verify-policy` preflight where applicable.

## References Consulted

- `.planning/codebase/CONCERNS.md` — execSync / shell pipeline note.
- `.planning/phases/01-policy-contract-foundation/01-CONTEXT.md` — Phase 1 decisions D-05–D-16.
- `security/policy-runtime.mjs` — current guards.
- `evals/graders/llm-rubric.mjs` — lines 147–154 (`execSync` pipeline).

## Planning Implications

- Split implementation into three plans: (1) eliminate shell pipeline in LLM rubric + run.sh portability/quoting, (2) policy schema + runtime allowlists for execution context, (3) unified startup/pre-flight checks across shell and Node entrypoints.

## RESEARCH COMPLETE

Research sufficient to proceed to planning without blocking unknowns.
