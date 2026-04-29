# Vendored walkthrough viewer assets

Frozen copies of browser-side dependencies for **vendor** `walkthroughViewerAssets` mode (`security/security-policy.json`). Integrity is enforced via `manifest.json` (SHA-256 per file).

The repository includes **`package-lock.json` at the repo root** so `npm ci` uses a pinned dependency graph. If the lockfile is missing, run `npm install` once at the root to generate it (then commit) before relying on `npm ci`.

## Regenerate

From repository root (requires Node.js and npm):

```bash
npm ci
node scripts/sync-walkthrough-vendor.mjs
```

Commit updated files under `vendor/walkthrough-viewer/` and `manifest.json` when dependency versions or layout change.

## Layout

- `umd/` — React, ReactDOM, Mermaid UMD bundles  
- `css/walkthrough-viewer.css` — precompiled Tailwind output  
- `shiki-pkg/` — copy of the `shiki` npm package (ESM + WASM assets)

See `skills/walkthrough/references/html-patterns.md` (“Dual mode”) for how generated HTML references these paths.
