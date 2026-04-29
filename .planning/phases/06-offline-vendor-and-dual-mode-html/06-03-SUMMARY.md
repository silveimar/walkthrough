# Plan 06-03 Summary — npm lockfile, vendor sync, run.sh, fail-closed tests

**Completed:** 2026-04-29  
**Requirements:** OFF-03, OFF-06

## Delivered

- Root `package.json` + `package-lock.json` (public registry); `.gitignore` includes `node_modules/`.
- `scripts/sync-walkthrough-vendor.mjs`, `scripts/tailwind.walkthrough.config.cjs`, `scripts/walkthrough-tailwind-input.css` — populates `vendor/walkthrough-viewer/` (UMD, Tailwind CSS build, full `shiki` tree) and regenerates `manifest.json`.
- `vendor/walkthrough-viewer/README.md` — regeneration instructions.
- `evals/run.sh`: global vendor manifest preflight when policy requires vendor; copies `vendor/walkthrough-viewer` into temp workspace when needed.
- `scripts/test-vendor-failclosed.mjs` — asserts bad SHA-256 fails verification.

## Verification

- `node scripts/sync-walkthrough-vendor.mjs` — pass  
- `verifyVendorManifest` on repo root — pass  
- `node scripts/test-vendor-failclosed.mjs` — pass  
- `bash -n evals/run.sh` — pass  

## Notes

- If `npm install` hits auth errors, use `NPM_CONFIG_REGISTRY=https://registry.npmjs.org/` (documented for CI/contributors as needed).
- Tailwind build warns about empty utility scan — CSS artifact still emitted; consider expanding `content` paths or safelist in a follow-up.
