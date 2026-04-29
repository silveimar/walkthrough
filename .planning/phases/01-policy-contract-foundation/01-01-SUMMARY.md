---
phase: 01-policy-contract-foundation
plan: "01"
subsystem: security
tags: [json-schema, policy, cli]

requires:
  - phase: none
    provides: baseline repo
provides:
  - Canonical security/security-policy.json and strict schema
  - validate-policy.mjs and verify-policy CLI + scripts/verify-policy
affects: [01-02, CI, docs]

tech-stack:
  added: []
  patterns: [minimal JSON Schema subset validator without new npm deps]

key-files:
  created:
    - security/security-policy.json
    - security/security-policy.schema.json
    - security/validate-policy.mjs
    - security/verify-policy.mjs
    - scripts/verify-policy
  modified: []

key-decisions:
  - "Strict additionalProperties false at policy object levels for fail-closed validation (D-03)."
  - "Human summary on stderr; machine JSON on stdout (D-15)."

patterns-established:
  - "validatePolicyDocument(parsed) returns { ok, errors[] } for reuse by policy-runtime."

requirements-completed: [POL-02]

duration: —
completed: 2026-04-29
---

# Phase 1 Plan 01: Canonical policy, schema, verify-policy Summary

**Strict JSON policy + schema with a zero-dep validator and `bash scripts/verify-policy` as the shared verification surface.**

## Performance

- **Tasks:** 3
- **Files modified:** 5 created

## Task Commits

1. **Task 1: Canonical policy document and JSON Schema** — `387f353`
2. **Task 2: Strict validator module** — `3fe7908`
3. **Task 3: verify-policy CLI and wrapper** — `78c367a`

## Files Created/Modified

- `security/security-policy.json` — authoritative policy (version, localOnly, egress, llmRubric, entrypoints, publish).
- `security/security-policy.schema.json` — JSON Schema with `additionalProperties: false` where required.
- `security/validate-policy.mjs` — structural validation; exports `validatePolicyDocument`.
- `security/verify-policy.mjs` — CLI; stderr summary + stdout JSON; exit non-zero when invalid.
- `scripts/verify-policy` — bash wrapper resolving repo root.

## Verification

- `bash scripts/verify-policy` — exit 0.
- `node --check` on `security/validate-policy.mjs`, `security/verify-policy.mjs`.

## Deviations from Plan

None — plan executed as written.

## Self-Check: PASSED

- `security/security-policy.json`, `security/validate-policy.mjs`, `scripts/verify-policy` present.
- Commits `387f353`, `3fe7908`, `78c367a` on branch history.
