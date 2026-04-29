---
phase: 07-cross-platform-sandbox-path-parity
plan: "03"
subsystem: infra
tags: [ci, RUN-03, strict-cwd]

requires:
  - phase: Phase 7 plan 02
    provides: scripts/test-path-workspace.mjs

provides:
  - CI step with WALKTHROUGH_STRICT_CWD + path smoke + deterministic single-file run
  - Node --check coverage for test-path-workspace.mjs

affects: []

tech-stack:
  added: []
  patterns:
    - "Strict cwd enforced where Node eval tooling actually executes"

key-files:
  created: []
  modified:
    - .github/workflows/ci.yml

key-decisions:
  - "Apply STRICT_CWD only on the smoke step that runs importing graders—not globally on all Node steps."

patterns-established:
  - "CI runs path workspace script before full node --check loop."

requirements-completed:
  - PLT-03
  - PLT-04

duration: —
completed: 2026-04-29
---

# Phase 7: Cross-platform sandbox — Plan 03 Summary

**CI now runs strict cwd + RUN-02 smoke + policy-aware deterministic sanity on example HTML; Docker remains optional.**

## Completed tasks

- Added CI job step with `WALKTHROUGH_STRICT_CWD=1`, `node scripts/test-path-workspace.mjs`, and `node evals/graders/deterministic.mjs examples/walkthrough-how-it-works.html`.
- Included `scripts/test-path-workspace.mjs` in the syntax-check list.

## Verification

- YAML valid; local equivalent commands exit 0.
