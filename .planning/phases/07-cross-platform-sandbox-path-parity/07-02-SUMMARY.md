---
phase: 07-cross-platform-sandbox-path-parity
plan: "02"
subsystem: testing
tags: [policy-runtime, RUN-02, paths]

requires:
  - phase: Phase 6
    provides: policy-runtime eval workspace rules

provides:
  - scripts/test-path-workspace.mjs RUN-02 smoke
  - Comment on POSIX bash expectations in evals/run.sh

affects: []

tech-stack:
  added:
    - scripts/test-path-workspace.mjs
  patterns:
    - "Automated temp-dir vs repo-root guard without Windows CI"

key-files:
  created:
    - scripts/test-path-workspace.mjs
  modified:
    - evals/run.sh

key-decisions:
  - "Reuse assertEvalWorkspaceDirAllowed for positive and negative cases."

patterns-established:
  - "Small Node smoke beside bash harness for path invariants."

requirements-completed:
  - PLT-02

duration: —
completed: 2026-04-29
---

# Phase 7: Cross-platform sandbox — Plan 02 Summary

**RUN-02 workspace rules are now exercised by an automated Node smoke test; eval harness documents Windows bash expectations.**

## Completed tasks

- `scripts/test-path-workspace.mjs` validates temp-dir OK and repo-root rejection when policy requires workspaces under system temp.
- `evals/run.sh` header comment points to CONTRIBUTING for Git Bash/WSL.

## Verification

- `node scripts/test-path-workspace.mjs`
- `bash -n evals/run.sh`
