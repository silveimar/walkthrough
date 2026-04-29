# Plan 06-01 Summary — Policy schema & policy-runtime

**Completed:** 2026-04-29  
**Requirements:** OFF-02, OFF-04

## Delivered

- `security/security-policy.schema.json`: required top-level `walkthroughViewerAssets` with `defaults` (`assetSource`, `vendorRootRel`) and per-package overrides (`react`, `reactDom`, `mermaid`, `tailwind`, `shiki`). Precedence documented in schema descriptions (package → defaults).
- `security/security-policy.json`: version **4**, granular packages all `cdn` by default, `vendorRootRel` set.
- `security/policy-runtime.mjs`: `resolveAssetSource`, `walkthroughPolicyRequiresAnyVendor`, `getWalkthroughVendorRootAbs`, `verifyVendorManifest`, `WALKTHROUGH_ASSET_PACKAGE_IDS`.

## Verification

- `bash scripts/verify-policy` — pass  
- Temp-dir `verifyVendorManifest` smoke — pass  
