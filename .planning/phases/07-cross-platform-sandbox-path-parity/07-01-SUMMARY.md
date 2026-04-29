---
phase: 07-cross-platform-sandbox-path-parity
plan: "01"
subsystem: infra
tags: [documentation, platforms, windows]

requires:
  - phase: Phase 6
    provides: vendor/policy baseline for cross-platform harness behavior

provides:
  - CONTRIBUTING.md maintainer platform matrix and manual smoke
  - README link under Security for parity definition

affects: []

tech-stack:
  added: []
  patterns:
    - "Parity = policy + harness contract, not identical OS sandboxes"

key-files:
  created:
    - CONTRIBUTING.md
  modified:
    - README.md

key-decisions:
  - "Document Git Bash + WSL2 + macOS/Linux before optional Windows CI."
  - "Manual smoke lists verify-policy, bash -n run.sh, node --check policy-runtime."

patterns-established:
  - "CONTRIBUTING.md is the home for shell/OS matrix and Windows smoke."

requirements-completed:
  - PLT-01
  - PLT-04

duration: —
completed: 2026-04-29
---

# Phase 7: Cross-platform sandbox — Plan 01 Summary

**Maintainers now have a written supported-platform matrix, parity definition, and Git Bash/WSL smoke commands alongside README discovery.**

## Completed tasks

- Added `CONTRIBUTING.md` with matrix, parity wording, manual smoke, Docker-optional note.
- Linked from `README.md` under Security.

## Verification

- `rg -n "Git Bash|parity|verify-policy" README.md CONTRIBUTING.md`
