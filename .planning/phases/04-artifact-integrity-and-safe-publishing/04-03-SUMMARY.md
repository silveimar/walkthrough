# Plan 04-03 Summary — INTG-03 scoped publish

**Completed:** 2026-04-29

## Outcomes

- `publish.approvedPathRoots`: `["examples"]`; policy `version` **3**.
- Workflow uploads **`examples/`** only; `PUBLISH_ARTIFACT_PATH` aligned; `scripts/scan-publish-scope.mjs` pre-upload gate.
- README publish scope + updated live demo URL (site root = `examples/` contents).

## Verification

- `node security/verify-policy.mjs`, `node scripts/scan-publish-scope.mjs examples`
