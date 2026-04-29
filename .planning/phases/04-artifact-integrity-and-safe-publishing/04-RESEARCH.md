# Phase 4 — Research: Artifact Integrity and Publishing

**Date:** 2026-04-29  
**Requirements:** INTG-01, INTG-02, INTG-03

## Summary

GitHub Actions currently uploads `.` after policy checks; narrowing to `examples/` reduces accidental disclosure. Sidecars can be generated deterministically from file bytes + policy version. Hash recomputation in CI matches maintainer local script.

## RESEARCH COMPLETE
