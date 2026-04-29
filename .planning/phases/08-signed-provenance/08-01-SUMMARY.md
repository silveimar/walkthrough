---
phase: 08-signed-provenance
plan: "01"
subsystem: docs
tags: [provenance, manifest, ATT-01]

requires:
  - phase: Phase 6
    provides: vendor manifest surface

provides:
  - provenance/README.md manifest-first specification
  - provenance/manifest.schema.json

requirements-completed:
  - ATT-01
  - ATT-04

completed: 2026-04-29
---

# Phase 8 — Plan 08-01 Summary

**Maintainers have a manifest-first spec and JSON Schema for provenance digests (policy + vendor manifest), with explicit exclusions for eval results and sensitive outputs.**
