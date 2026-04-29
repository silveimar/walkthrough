# Phase 8: Signed provenance - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **ATT-01–ATT-05**: **manifest-first** definition of in-scope bytes (vendor integrity surface, policy digest, excluded sensitive zones); **local-first signing** of that manifest with a documented tool; **local verification** that binds to **consumed** artifacts at eval/consumption time; **data-protection–aligned** rules (no signing or persisting redacted eval material); and an **optional CI verify** path for teams that want merge gates.

This phase does **not** change the walkthrough skill’s HTML generation contract; it adds **provenance, signing, and verify** plumbing around **policy + vendor** artifacts established in Phases 6–7.

</domain>

<decisions>
## Implementation Decisions

### Signing tool (ATT-02)
- **D-01 (auto):** **Minisign** is the **primary** documented local-first signing tool (small dependency, clear CLI, fits “local maintainer” trust model). **Cosign** and **GPG** are documented as **alternatives** in short appendix tables—not dual-implemented in CI unless effort stays trivial.
- **D-02:** **Secret keys never committed.** Document pubkey placement (e.g. `provenance/minisign.pub` or `security/` — planner picks exact path) and `.gitignore` rules for `*.key` / Minisign secret paths.

### Manifest-first scope (ATT-01)
- **D-03:** The **signed artifact** is a **compact provenance manifest** (JSON), not a re-hash of every vendored file inside the signature payload. The manifest **references** integrity already tracked elsewhere:
  - **`policySha256`**: SHA-256 of `security/security-policy.json` (canonical bytes).
  - **`vendorManifestSha256`**: SHA-256 of `vendor/walkthrough-viewer/manifest.json` (canonical bytes).
  - **`manifestVersion`**: integer schema version for the provenance JSON itself.
- **D-04:** **Explicit exclusions** (documented + reflected in generator): **never** include paths under `evals/results/` or other **dataProtection** sensitive zones in any “files to attest” list; provenance is about **policy + frozen vendor contract**, not eval outputs (ATT-04).

### Verification binding (ATT-03)
- **D-05:** Ship **`scripts/verify-provenance.mjs`** (name flexible) that: recomputes `policySha256` and `vendorManifestSha256`, compares to signed manifest fields, and runs **`minisign verify`** (or checks detached `.sig` next to manifest). Intended to run **locally** before eval/release workflows; must succeed from **repo root** under `WALKTHROUGH_STRICT_CWD` posture where applicable.
- **D-06:** Verification is **not** “CI-only”: docs state that **maintainers run verify locally**; CI is optional reinforcement (ATT-05).

### CI path (ATT-05)
- **D-07:** Add an **optional** CI job or workflow dispatch pattern gated by **repository variable / env** (e.g. `VERIFY_PROVENANCE=true`) or **comment in workflow** “uncomment to enable”—so default OSS contributors are not blocked without keys. When enabled, CI runs the same Node verify script.

### Claude's Discretion
- Exact filenames under `provenance/` vs `security/provenance.*`.
- Whether detached signature is `provenance/manifest.json.minisig` vs sibling naming.
- Schema enforcement via small JSON Schema vs inline validation in Node.

</decisions>

<specifics>
## Specific Ideas

- Reuse **vendor manifestVersion 1 / sha256** conventions already enforced by `verifyVendorManifest` (Phase 6).

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 8 goals, ATT-01..ATT-05
- `.planning/REQUIREMENTS.md` — Traceability for ATT IDs

### Policy & vendor (inputs to provenance)
- `security/security-policy.json` — Policy bytes to digest (version field included)
- `vendor/walkthrough-viewer/manifest.json` — Vendor integrity manifest (Phase 6)
- `security/policy-runtime.mjs` — `verifyVendorManifest`, `loadRepoPolicy`

### Data protection
- `security/security-policy.json` → `dataProtection.*` — Canonical eval results path; informs exclusions (**D-04**)

### Prior phases
- `.planning/phases/06-offline-vendor-and-dual-mode-html/06-CONTEXT.md` — Vendor/manifest contract
- `.planning/phases/07-cross-platform-sandbox-path-parity/07-CONTEXT.md` — Path/cwd discipline for scripts

### Research
- `.planning/research/ARCHITECTURE.md` — ADV-02 ordering (signing consumes stable vendor + policy)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`verifyVendorManifest`** / vendor **`manifest.json`** — Source of truth for offline bytes; provenance manifest should reference its hash, not duplicate thousands of entries.
- **`scripts/sync-walkthrough-vendor.mjs`** — Regenerates vendor tree; provenance should be regenerated after vendor sync when signing release-quality manifests.

### Established patterns
- **Fail-closed verification** already used for policy and vendor manifest in eval preflight.
- **Node crypto `createHash('sha256')`** — Use for policy and vendor-manifest file hashing.

### Integration points
- **`evals/run.sh`** — Document-only hook: optional “verify provenance before eval” for maintainers; do not make Claude egress depend on signing.
- **`.github/workflows/ci.yml`** — Optional second job or conditional step.

</code_context>

<deferred>
## Deferred Ideas

- **Sigstore/Fulcio** enterprise anchoring — out of scope unless a later milestone adds it.
- **Signing individual HTML outputs** — not required; manifest-first covers policy + vendor contract.

</deferred>

---

*Phase: 08-signed-provenance*
*Context gathered: 2026-04-29*
