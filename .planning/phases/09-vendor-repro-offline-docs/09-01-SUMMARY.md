# Plan 09-01 Summary — Vendor docs & lockfile alignment

**Completed:** 2026-04-29  
**Requirements:** OFF-01, OFF-03, OFF-06

## Delivered

- **`AGENTS.md` / `.planning/codebase/STACK.md`:** Replaced incorrect “lockfile missing” with description of root **`package-lock.json`** and vendor regeneration purpose.
- **`CONTRIBUTING.md`:** New section *Vendor assets & offline-capable eval* — default **`cdn`** in policy, steps to switch to vendor mode, `npm ci` + `sync-walkthrough-vendor.mjs`, `build-provenance-manifest.mjs`, eval fail-closed note.
- **`README.md`:** Testing section pointer to CONTRIBUTING vendor workflow.
- **`vendor/walkthrough-viewer/README.md`:** Note that **`package-lock.json`** at repo root backs **`npm ci`**; recovery if absent.

## Verification

- Manual: paths and links resolve from repo root; policy defaults described match `security/security-policy.json` CDN-first packages.
