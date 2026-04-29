# Plan 05-01 Summary — PR CI + GOV-01 parity

**Completed:** 2026-04-29

## Outcomes

- Added `.github/workflows/ci.yml` on `pull_request` and `push` to `main`: `scripts/verify-policy`, `verify-artifact-integrity.mjs examples`, `scan-publish-scope.mjs examples`, `bash -n evals/run.sh`, `node --check` on gated `evals/**/*.mjs` and `security/**/*.mjs`.
- README documents PR CI and required-check expectation for POL-03 / GOV-01.

## Verification

- `bash scripts/verify-policy`, `bash -n evals/run.sh`, `node --check` on listed modules, `node scripts/verify-artifact-integrity.mjs examples`, `node scripts/scan-publish-scope.mjs examples`

## Self-Check: PASSED
