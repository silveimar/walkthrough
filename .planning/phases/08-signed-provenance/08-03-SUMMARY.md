---
phase: 08-signed-provenance
plan: "03"
subsystem: ci
tags: [github-actions, ATT-05]

requires:
  - phase: Phase 8 plan 02
    provides: verify-provenance.mjs

provides:
  - CI installs Minisign + runs verify-provenance on every PR (digests; signatures when committed)
  - CONTRIBUTING documents branch-protection alignment for ATT-05

requirements-completed:
  - ATT-05

completed: 2026-04-29
---

# Phase 8 — Plan 08-03 Summary

**CI verifies provenance digests on each run and can verify Minisign when sig/pub exist; CONTRIBUTING explains required-check workflow.**
