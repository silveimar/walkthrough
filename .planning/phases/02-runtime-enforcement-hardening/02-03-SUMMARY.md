# Plan 02-03 Summary — RUN-03 startup validation

**Completed:** 2026-04-29

## Outcomes

- `security/policy-runtime.mjs`: `assertStrictRepoWorkingDirectory()` — active only when `WALKTHROUGH_STRICT_CWD=1` or `true`.
- `evals/run.sh`: prerequisite checks for `node` and `claude` after policy verification.
- `evals/graders/deterministic.mjs`, `evals/report.mjs`, `evals/graders/llm-rubric.mjs`: call strict cwd helper after entrypoint assert.

## Verification

- `bash -n evals/run.sh`
- `node --check` on gated graders/report.

## Requirements

- RUN-03
