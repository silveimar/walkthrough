# Technology Stack (v2.0 Additions)

**Project:** Walkthrough Skill Local Security Hardening  
**Scope:** New capabilities for **v2.0 Advanced Local Hardening** only (ADV-01 offline vendoring, ADV-02 signed provenance, ADV-03 cross-platform sandbox). v1.0 baseline (Node ≥18, Bash, policy-runtime, eval pipeline) is assumed and not revisited here.  
**Researched:** 2026-04-29  
**Confidence:** MEDIUM (stack choices for brownfield hardening; signing/sandbox details should be validated against org policy and CI targets)

## Recommended Stack

### Core Additions (Offline / Vendored Viewer Assets — ADV-01)

| Technology | Version (pinning target) | Purpose | Why Recommended |
|------------|---------------------------|---------|-----------------|
| **npm + `package-lock.json`** (or `npm-shrinkwrap.json` if publishing a consumable tree) | Lockfile per team policy | Reproducible install of mirrorable browser assets and tooling | Standard for Node brownfield; `npm ci` is the enforcement primitive for “same graph as locked.” |
| **`react` / `react-dom` (UMD builds)** | Align with skill reference (e.g. 18.x) | Offline equivalents to `unpkg.com/.../umd/*.production.min.js` | UMD files ship in `node_modules/react/umd/` and `react-dom/umd/`; copy into `vendor/` (or similar) and rewrite HTML to `file`-relative or `file://`-safe paths for local open. |
| **`mermaid`** | Major 11.x (match `html-patterns.md` / graders) | Replace `cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js` | Official package exposes browser bundle under `dist/`; vendoring is a straight static copy + subresource integrity (SRI) in policy. |
| **`shiki`** | Pin to skill-pinned line (e.g. 3.22.0 per example) | Replace `import from 'https://cdn.jsdelivr.net/npm/shiki@…/+esm'` | Shiki is ESM + WASM + themes; vendoring is **not** a single file: mirror `+esm` graph or ship a small pre-bundled chunk (see pitfalls). Pin exact version to match highlighter behavior in evals. |
| **Tailwind (build-time), not Play CDN** | `tailwindcss` 3.x CLI (or compatible) | Replace `https://cdn.tailwindcss.com` for offline | **Critical:** The Tailwind **Play CDN** script is a **JIT compiler in the browser**, not a static library. True offline/stale-asset policy implies **precompiled CSS** (CLI scanning HTML/JS strings or a curated safelist) checked into `vendor/` or generated in a prep step. |

### Supporting Additions (Pinning, SBOM, Supply Chain — ADV-01 adjacent)

| Library / Tool | Version | Purpose | When to Use |
|----------------|---------|---------|-------------|
| **`@cyclonedx/cyclonedx-npm`** | Current stable (CLI) | CycloneDX SBOM from npm projects | CI/local attestations of dependency inventory; pairs with policy gates on `evals/` and repo scripts. |
| **npm built-in SBOM** | npm ≥10 (`npm sbom`) | SPDX/CycloneDX JSON from lockfile | Zero-extra-dep SBOM when CycloneDX CLI is not desired; verify flags on your npm minor (behavior evolved across 10.x). |
| **`cyclonedx-node-module`** / OWASP variants | As needed | Alternate SBOM generators | If team standardizes on CycloneDX Maven-style BOM aggregation across repos. |

### Signing & Provenance (ADV-02)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Cosign** (`sigstore/cosign`) | Latest stable CLI matching Sigstore policy | Sign blobs (walkthrough HTML bundles, `summary.json`, policy snapshots), verify in CI/local | Fits **supply-chain attestation** narratives (OIDC in CI, keyless or KMS-backed keys); aligns with SLSA-adjacent tooling; good when attestations are **files/OCI-like blobs**, not “email-era PKI.” |
| **Sigstore (Fulcio/Rekor)** | Via Cosign defaults | Public transparency / keyless signing flows | Strong when CI can mint short-lived certs; local-only workflows may prefer fixed keys (see alternatives). |
| **Minisign** (`jedisct1/minisign`) | Stable release | Ed25519 sign/verify for **artifact sidecars** (`*.minisig`) | Minimal surface area, easy shell integration for maintainers who want **offline-capable** signing with long-lived keypairs—good fit for **local trust model** without Full PKI. |
| **GNU Privacy Guard (GPG)** | 2.4.x line typical | Detached signatures (`*.sig`) for artifacts and git-tag hygiene | Use when **organizational policy or auditors expect OpenPGP**; worse UX and harder automation than Cosign/Minisign for greenfield, but maximum interoperability with legacy trust stores. |

**Recommended posture for this repo:** treat signing as **pluggable**: policy declares allowed algorithms and verification commands; implement **one primary** path first (Cosign for CI-visible attestations *or* Minisign for purely local keys), optional second for redundancy.

### Sandbox & Process Isolation Hints (ADV-03)

Cross-platform **parity** means documenting **equivalent constraints**, not identical binaries:

| OS family | Representative tooling (hints only) | Typical constraint knobs |
|-----------|--------------------------------------|---------------------------|
| **Linux** | `bubblewrap`/`bwrap`, `firejail`, systemd namespaces/cgroups, containers | Read-only root overlay, private `/tmp`, dropped caps, seccomp, uid/gid maps |
| **macOS** | `sandbox-exec` (legacy patterns), **Seatbelt** profiles (where applicable), running under **restricted user** + temp-only workspace | Filesystem allowlist, no network (if policy requires), match `evalWorkspaceMustBeUnderSystemTemp` with real path rules |
| **Windows** | **Windows Sandbox**, WSL2 with Linux tools, **AppContainer**-style restriction via higher-level runners | Job objects, low-integrity / restricted tokens, separate user profile; prefer WSL2 for shell parity with `evals/run.sh` where feasible |

**Node/Bash layer:** keep using **explicit temp workspace** and allowlisted CLIs (per `security-policy.json`); add a **thin wrapper** (shell or small Node) that invokes the OS-specific sandbox command with a **shared argument contract** (working directory, read-only bind of repo, env blocklist). Do not standardize on a single vendor product in stack research—select per CI matrix and document in phase plan.

### Development Tools (v2)

| Tool | Purpose | Notes |
|------|---------|-------|
| **Subresource Integrity (SRI)** generation | Hash vendored script/CSS for tamper detection | `openssl dgst -sha384 -binary` + base64; or small Node script; store hashes in policy or sidecar manifest. |
| **Import maps or relative ESM** | Load vendored Shiki without remote `jsdelivr` | May require bundling one `vendor/shiki-bundle.js` if raw `+esm` graph is too fragile offline. |
| **Pre-commit / CI** | Enforce `npm ci`, SBOM regen, signature verify | Gate merges on reproducible install + optional attestation presence. |

## Installation (illustrative — v2 tooling only)

```bash
# Pin and install deps that supply vendorable artifacts (versions from lockfile)
npm install react@18 react-dom@18 mermaid@11 shiki@<pinned> tailwindcss@3 --save-dev

# SBOM (pick one)
npm sbom --omit dev -sbom-format cyclonedx-json > sbom.cdx.json
npx @cyclonedx/cyclonedx-npm --output-file sbom.cdx.json

# Signing (install cosign OR minisign OR use system gpg)
# Cosign: follow https://docs.sigstore.dev/cosign/installation/
# Minisign: package manager (brew/choco/etc.)
```

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| HTML offline strategy | Vendored UMD + built CSS + ESM graph or bundle for Shiki | Full Vite/Rollup app for walkthrough output | If team abandons “single HTML file” for a build step product-wide (conflicts with current skill contract—only if spec changes). |
| SBOM | CycloneDX via npm or `@cyclonedx/cyclonedx-npm` | Syft, Grype-style container scans | When artifacts are OCI images; this repo is file/Node-first. |
| Signing | Cosign (CI) + optional Minisign (local) | X.509 + `openssl smime` only | When enterprise CA mandates PKCS#7 CMS for all signed blobs. |
| Tailwind offline | Prebuilt CSS from Tailwind CLI | Copy “full” Tailwind CSS from a CDN build | **Poor fit:** huge CSS, unused utilities; maintainability and size cost. |

## What NOT to Use (for v2 goals)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Relying on **Play CDN** as the “vendored Tailwind” | It is a network-oriented JIT; behavior tied to CDN service; not a static drop-in | Tailwind CLI + committed `walkthrough.css` (or scoped build) |
| **Ungoverned** `npx` at eval time | Breaks reproducibility and offline guarantees | Pinned `devDependencies` + `npm exec` or local `node_modules/.bin` |
| Single-OS **only** Docker as “the sandbox” | Fails ADV-03 parity for Windows/macOS devs who run evals natively | Document native sandboxes + optional Linux container profile |

## Stack Patterns by Variant

**If the priority is strict offline eval runs:** Vendor React UMD, Mermaid `dist`, Shiki (bundled or mirrored ESM + WASM), replace Tailwind CDN with **precompiled** CSS; run `npm ci` before eval; optional HTTP server only serves `file:`-blocked cases.

**If the priority is CI-verifiable supply chain:** Generate SBOM on release branches; Cosign-sign SBOM + `summary.json` tarball with Rekor upload (if acceptable egress).

**If the priority is maintainer-local-only trust:** Minisign private key offline; verification script in `evals/` or policy-runtime; no Sigstore dependency.

**If Shiki vendoring is too heavy for a phase:** Interim allowlist for one scoped `jsdelivr` URL in policy with SRI + version pin, with explicit follow-up phase to remove network (document as technical debt, not end state for ADV-01).

## Version Compatibility

| Component A | Compatible With | Notes |
|-------------|-----------------|------|
| Mermaid 11 | React 18 UMD global | Mermaid is global `mermaid` init; no React coupling—keep script order: React/ReactDOM before app module. |
| Shiki 3.x | Vite/ESM or bundled IIFE | Browser ESM from CDN expects `type="module"`; vendored path must preserve WASM + theme resolution paths. |
| `npm sbom` | npm 10+ | Confirm CI image Node/npm version; fall back to CycloneDX npm if older. |
| Cosign | Sigstore TUF roots | Pin cosign version in CI; rekor entry format may change—pin verify flags. |

## Sources

- Project context: `.planning/PROJECT.md` (v2.0 ADV-01…03)
- Current viewer contract: `skills/walkthrough/references/html-patterns.md` (CDN table; Tailwind Play script)
- Example artifact: `examples/walkthrough-how-it-works.html` (Shiki ESM URL pattern)
- Policy surface: `security/security-policy.json` (egress, entrypoints, runtime)
- **Tailwind Play CDN behavior:** [https://tailwindcss.com/docs/installation/play-cdn](https://tailwindcss.com/docs/installation/play-cdn) — confirms JIT-in-browser model (MEDIUM: product docs)
- **Sigstore/Cosign:** [https://docs.sigstore.dev/](https://docs.sigstore.dev/) (MEDIUM)
- **CycloneDX npm:** [https://github.com/CycloneDX/cyclonedx-node-npm](https://github.com/CycloneDX/cyclonedx-node-npm) (MEDIUM)
- **Minisign:** [https://jedisct1.github.io/minisign/](https://jedisct1.github.io/minisign/) (MEDIUM)

---
*Stack research (v2.0 delta): Walkthrough Skill Local Security Hardening*  
*Researched: 2026-04-29*
