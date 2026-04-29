# Provenance manifest (v2.0)

This directory holds the **manifest-first** provenance model (**ATT-01**): we attest **digests of authoritative artifacts**, not individual eval outputs or secrets.

## What is signed

The maintainer signs a **compact JSON manifest** (`manifest.json`) whose fields are defined in [`manifest.schema.json`](manifest.schema.json).

| Field | Meaning |
|-------|---------|
| `manifestVersion` | Schema version for this JSON file (starts at `1`). |
| `policySha256` | SHA-256 of **`security/security-policy.json`** bytes on disk (canonical file). |
| `vendorManifestSha256` | SHA-256 of **`vendor/walkthrough-viewer/manifest.json`** bytes (vendor integrity surface from Phase 6). |
| `policyVersion` | Copy of `version` from policy JSON for human auditing (informational). |

**Signing tool:** [**Minisign**](https://jedisct1.github.io/minisign/) is the primary documented workflow—small, local-first, cross-platform. Cosign and GPG are acceptable alternatives if your team standardizes on them; this repo documents Minisign commands only.

## What is never attested

Do **not** include paths or hashes for:

- **`evals/results/`** or any directory under `dataProtection.sensitiveOutputs.canonicalEvalResultsRelPath` in policy (default `evals/results`).
- Redacted secrets, tokens, or stderr excerpts from eval runs.
- Arbitrary generated HTML walkthroughs (unless a future phase scopes them explicitly).

Provenance binds **policy + frozen vendor contract**, matching **ATT-04**.

## Workflow

1. **Generate** the manifest from the repo (repo root):

   ```bash
   node scripts/build-provenance-manifest.mjs
   ```

2. **Sign** with Minisign (creates `manifest.json.sig` next to `manifest.json`):

   ```bash
   minisign -Sm provenance/manifest.json
   ```

   Keep your **secret key** off the repo. Commit **`manifest.json`**, **`manifest.json.sig`**, and **`minisign.pub`** (public key) when you want others to verify.

3. **Verify** locally:

   ```bash
   node scripts/verify-provenance.mjs
   ```

   This recomputes digests and, if `manifest.json.sig` and `minisign.pub` exist, runs **`minisign -V`**.

## CI (optional)

Optional GitHub Actions verification is gated by the repository variable **`ENABLE_PROVENANCE_VERIFY`** (`true` to run). See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
