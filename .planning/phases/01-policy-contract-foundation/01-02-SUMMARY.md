---
phase: 01-policy-contract-foundation
plan: "02"
subsystem: security
tags: [egress, evals, node]

requires:
  - phase: 01-01
    provides: policy file, validatePolicyDocument, verify-policy
provides:
  - security/policy-runtime.mjs shared guards
  - Gated evals/run.sh, graders, report.mjs
affects: [maintainers running evals]

tech-stack:
  added: []
  patterns: [repo-root resolution via security/; env WALKTHROUGH_ALLOW_EGRESS]

key-files:
  created:
    - security/policy-runtime.mjs
  modified:
    - evals/run.sh
    - evals/graders/llm-rubric.mjs
    - evals/graders/deterministic.mjs
    - evals/report.mjs

key-decisions:
  - "Preflight uses || exit 1 after subshell so failed Node guard exits run.sh non-zero (Rule 1 bugfix)."
  - "LLM rubric skipped when llmRubric opt-in env unset, aligned with D-08."

patterns-established:
  - "assertEntrypointForCurrentModule(import.meta.url) for Node entrypoints."
  - "assertClaudeCliEgressAllowed(env, argv) for eval runner."

requirements-completed: [POL-01, POL-02]

duration: —
completed: 2026-04-29
---

# Phase 1 Plan 02: Policy runtime and eval gating Summary

**Shared `policy-runtime.mjs` enforces deny-all egress defaults, LLM rubric opt-in, and entrypoint allowlists across `run.sh` and Node eval scripts.**

## Performance

- **Tasks:** 3
- **Files modified:** 5 (1 new, 4 updated)

## Task Commits

1. **Task 1: Policy runtime module** — `0418783`
2. **Task 2: evals/run.sh preflight and egress flags** — `a82b7d4`
3. **Task 3: Gate Node entrypoints** — `406f6cb`

## Verification

- `node --check security/policy-runtime.mjs`
- `bash -n evals/run.sh`
- `node --check` on graders and report
- `bash evals/run.sh --subset` without `--allow-egress` exits **non-zero** (egress blocked).
- `node -e` smoke: `loadRepoPolicy()` returns version `1`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bash `if ! ( subshell ); then exit $?` did not exit non-zero on Node failure**

- **Found during:** Task 2 verification
- **Issue:** Subshell exit status interaction left `run.sh` continuing with exit 0 when egress guard threw.
- **Fix:** Replaced with `( subshell ) || exit 1`.
- **Files modified:** `evals/run.sh`
- **Commit:** `a82b7d4`

## Self-Check: PASSED

- `security/policy-runtime.mjs` and gated scripts present.
- Commits `0418783`, `a82b7d4`, `406f6cb` on branch history.
