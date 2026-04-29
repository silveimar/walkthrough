# Phase 8 Research — Signed provenance

## RESEARCH COMPLETE

### Anchors in repo

- **Vendor**: `vendor/walkthrough-viewer/manifest.json` (manifestVersion 1, sha256 entries) — verified by `verifyVendorManifest` in `security/policy-runtime.mjs`.
- **Policy**: `security/security-policy.json` includes `version`; hashing canonical file gives stable **policy digest**.
- **Data protection**: `dataProtection.sensitiveOutputs.canonicalEvalResultsRelPath` → **exclude `evals/results/`** from any signing scope (ATT-04).

### Industry pattern

**Manifest-first signing**: sign a **small JSON** that captures digests of authoritative artifacts (policy bytes, vendor manifest bytes), not every leaf file—aligns with SLSA-style “subject digest” without bloating the signature.

### Planning implication

Implement **generate → sign → verify** with **Minisign** as primary CLI; optional CI gated.
