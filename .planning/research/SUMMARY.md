# Project Research Summary

**Project:** Walkthrough Skill Local Security Hardening  
**Domain:** Brownfield security hardening — Claude Code walkthrough skill, local eval harness, policy-driven governance (v2.0 Advanced Local Hardening)  
**Researched:** 2026-04-29  
**Confidence:** MEDIUM

## Executive Summary

Walkthrough Skill Local Security Hardening v2.0 extends an already policy-governed repo (v1.0) with three vertical slices: **ADV-01** offline/vendored viewer assets, **ADV-02** signed provenance for artifacts and manifests, and **ADV-03** cross-platform sandbox and path parity. Experts treat this as a **supply-chain + local-trust** problem: reproducible installs (`npm ci` + lockfile), vendored UMD/static bundles for browser-facing deps, **precompiled Tailwind** (not Play CDN), and a manifest-first signing story (Cosign/Minisign/GPG as pluggable backends) rather than enterprise PKI by default.

The recommended approach is **declarative policy first** (`security/security-policy.json`), **runtime enforcement second** (`policy-runtime.mjs`), with **dual-mode HTML** (CDN vs vendor) controlled by a single policy flag, vendor trees under `vendor/walkthrough-runtime/`, and graders that branch on asset mode. Build order should favor **ADV-01 → ADV-03 → ADV-02**: stable layouts and hashes before attestations; harden subprocess/temp/path behavior before signing scripts that would otherwise churn.

Key risks are **supply-chain theater** (verification disconnected from what actually runs), **broken offline mirrors** (stale vendor, path skew, Windows ignored), and **signing UX** that drives bypass culture. Mitigations: map a **consumption graph** from eval shell through graders to browser-loaded bytes; treat vendor + lockfile + manifest as one rebuildable unit; fail closed on missing vendor or invalid sigs; document Git Bash/WSL and optional non-Docker sandbox backends; keep signing optional locally with clear errors and CI as the strict gate.

## Key Findings

### Recommended Stack

v2.0 stack deltas assume v1.0 baseline (Node ≥18, Bash, policy-runtime, eval pipeline). Add **npm + `package-lock.json`** for reproducible vendor tooling; **React/ReactDOM UMD, Mermaid 11.x, Shiki (pinned)** from packages copied into vendor — Shiki may need **bundled ESM or mirrored graph** (not a single file). **Tailwind must be CLI-built CSS**, not the Play CDN JIT script. Support **SBOM** via `npm sbom` or `@cyclonedx/cyclonedx-npm`. **Signing:** Cosign/Sigstore for CI-visible attestations *or* **Minisign** for minimal local Ed25519; **GPG** when policy demands OpenPGP. **Sandbox:** document OS-native equivalents (bubblewrap/Linux, Seatbelt/macOS patterns, Windows Sandbox/WSL) behind a **thin wrapper** with shared argv/env contract — do not standardize on Docker alone.

**Core technologies:**

- **npm + lockfile + `npm ci`** — reproducible dependency graph — enforcement primitive for “same tree as locked.”
- **Vendored UMD + built CSS + Shiki bundle/mirror** — offline viewer — replaces mandatory CDN fetches; Tailwind offline = precompiled CSS only.
- **Cosign and/or Minisign (+ optional GPG)** — artifact/manifest signing — pluggable; local-first Minisign vs CI Sigstore per team.
- **SRI / hash manifests** — tamper detection — binds vendor drops to policy and ADV-02 inputs.

### Expected Features

**Must have (table stakes):**

- **ADV-01:** Documented offline prerequisites; pinned/vendored eval-critical assets; explicit failure when network required; reproducible vendor layout; optional tiered offline (eval-only vs full demo).
- **ADV-02:** Clear scope of what is signed; verify steps runnable locally; key-management story; tamper-evident handling aligned with `evals/results/` governance.
- **ADV-03:** Documented shells/runners; consistent path semantics; same policy interpretation per OS; bounded subprocess contract aligned with temp workspace rules.

**Should have (competitive):**

- Single-command vendor refresh; integrity manifests linking ADV-01 to ADV-02; optional CI verification job; platform flags in policy; optional devcontainer recipe.

**Defer (v2.x / post–v2.0):**

- Automated vendor refresh on schedule; policy-hash-bound signed attestations (audit-driven); native Windows runner without bash; full HTML offline parity for every CDN; hardware tokens / org PKI.

### Architecture Approach

v2.0 layers **vendor**, extended **policy schema**, **dual-mode graders**, and **optional post-grade attestation** on the existing policy-in-the-middle model. New tracked **`vendor/walkthrough-runtime/`** stays out of `skills/` and `evals/results/`; policy remains the integration hub. **`runtime.walkthroughAssetMode: "cdn" | "vendor"`** (or equivalent) keeps deterministic grading unambiguous.

**Major components:**

1. **`skills/walkthrough/*` + `html-patterns.md`** — Contract for CDN vs relative vendor URLs; dual-path templates.
2. **`vendor/walkthrough-runtime/` + manifest** — Frozen assets and hashes for ADV-01 and signing inputs.
3. **`security-policy.json` + schema + `policy-runtime.mjs`** — Vendor roots, asset mode, sandbox/parity hooks; single enforcement surface.
4. **`evals/run.sh` + graders** — Copy vendor into temp workspace when required; deterministic grader branches on policy; optional manifest/sign hooks after grading.

### Critical Pitfalls

1. **Supply-chain theater** — Verification must bind to artifacts at **consumption** (eval + browser), not CI-only; one policy source of truth; fail closed when vendor missing or sig invalid.
2. **Broken offline mirrors** — Vendor + lockfile + manifest as one unit; fresh-clone CI; repo-root–anchored paths; no silent `curl` prefetch.
3. **Signature UX / bypass culture** — Prefer progressive trust (optional strict local, CI verify); clear remediation messages; avoid permanent undocumented `--skip-verify`.
4. **Windows path and shell assumptions** — Quote variables; Node for normalization; CI smoke on `windows-latest` / Git Bash; document WSL vs native scope.
5. **Docker as universal sandbox** — Parity via **pluggable backends**; document non-Docker path on macOS; do not make ADV-01/02 depend on global Docker.

## Implications for Roadmap

Suggested phase structure follows dependency order from FEATURES and ARCHITECTURE: stable vendor layout and manifests before signing; stable harness paths before signing churning scripts.

### Phase 1: ADV-01 — Offline vendoring & dual-mode HTML

**Rationale:** Unlocks reproducible bytes and manifest inputs for ADV-02; ADV-03 workspace copies must include what the skill references on disk.  
**Delivers:** `vendor/walkthrough-runtime/` (or agreed tree), lockfile + `npm ci` story, policy keys for vendor roots and asset mode, `html-patterns.md` + grader dual-path, `run.sh` vendor copy into temp workspace, explicit offline/degraded flags.  
**Addresses:** FEATURES ADV-01 P1 table stakes and differentiators (manifests, single-command refresh as capacity allows).  
**Avoids:** Pitfalls 2 (broken mirrors), Tailwind Play CDN mistaken for offline; anti-features: silent network fallback, vendor-everything sprawl.

### Phase 2: ADV-03 — Cross-platform sandbox & path parity

**Rationale:** Harden `run.sh` (and optional thin Node prelude) for temp, `realpath`, Windows — before freezing attestations on scripts that still move weekly.  
**Delivers:** Documented platform matrix; shared path helpers; policy/runtime asserts for parity; optional CI Windows smoke; sandbox **interface** doc (non-Docker defaults).  
**Addresses:** FEATURES ADV-03 P1; pitfall 4 (Windows), 5 (Docker), 6 (subprocess boundary).  
**Avoids:** Identical OS-level sandbox APIs everywhere; PowerShell rewrite unless roadmap explicitly demands it.

### Phase 3: ADV-02 — Signed provenance

**Rationale:** Sign manifests that include HTML, vendor hashes, and policy digest — after ADV-01 manifest format and ADV-03 paths are stable.  
**Delivers:** One primary signing path (recommendation: Minisign local and/or Cosign in CI), verify docs, optional CI verify job, integration with `report.mjs`/summary as needed; redaction-aware provenance JSON.  
**Addresses:** FEATURES ADV-02 P1; pitfall 1 (bind verification to consumed artifacts), 3 (UX).  
**Avoids:** Signing inside LLM; signing CDN URLs instead of content; attestation without manifest discipline (architecture anti-pattern 1).

### Phase ordering rationale

- **ADV-01 → ADV-03 → ADV-02** matches FEATURE dependency (manifests enable signing; stable paths enable vendor layout) and ARCHITECTURE “suggested build order.”  
- **Parallelism:** Policy schema work for ADV-01 and ADV-03 can overlap if coordinated; **avoid** strict ADV-02 verify gates until ADV-01 manifest format is stable (per ARCHITECTURE).

### Research Flags

Phases likely needing **`/gsd-research-phase`** during planning:

- **ADV-01 / Shiki:** ESM + WASM + themes — bundling vs mirror strategy; high integration complexity.
- **ADV-02:** Org-specific choice among Cosign, Minisign, GPG; CI OIDC vs offline keys.
- **ADV-03:** Windows runner strategy (Git Bash vs WSL scope) if maintainers require native Windows without bash.

Phases with **standard patterns** (lighter research):

- **Lockfile + `npm ci`** — npm docs and repo conventions.
- **SRI / SHA-256 manifests** — OpenSSL or small Node scripts; well-trodden.
- **Policy extend-and-validate** — Existing `verify-policy` / schema bump pattern from v1.0.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Brownfield deltas grounded in npm/vendor patterns; Cosign/Sandbox OS specifics need org/CI validation. |
| Features | MEDIUM | Clear ADV boundaries; prioritization matrix is explicit P1/P2/P3. |
| Architecture | MEDIUM–HIGH | Strong tie-in to existing `security/` and `evals/`; attestation toolchain choice is phase decision. |
| Pitfalls | MEDIUM | Industry patterns; phase mapping assumes ADV-01/02/03 alignment with roadmap. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Shiki offline graph:** Exact vendoring approach (bundle vs selective mirror) — spike during ADV-01 planning.
- **Signing backend:** Lock Minisign vs Cosign (or both) per maintainer and CI — decision before ADV-02 execution.
- **Windows scope:** Confirm “Git Bash + documented” vs future native runner — affects ADV-03 acceptance tests.
- **npm sbom / CycloneDX:** Confirm CI Node/npm version for `npm sbom` behavior.

## Sources

### Aggregated from research files

- `.planning/research/STACK.md` — stack additions, alternatives, version compatibility.
- `.planning/research/FEATURES.md` — ADV-01–03 behaviors, MVP, prioritization, dependencies.
- `.planning/research/ARCHITECTURE.md` — component deltas, patterns, data flow, build order.
- `.planning/research/PITFALLS.md` — critical pitfalls, checklist, phase mapping.

### Primary / secondary (as cited in STACK, FEATURES, ARCHITECTURE, PITFALLS)

- Tailwind Play CDN behavior — tailwindcss.com docs (product).
- Sigstore / Cosign — docs.sigstore.dev.
- CycloneDX npm — GitHub CycloneDX/cyclonedx-node-npm.
- Minisign — jedisct1.github.io/minisign.
- Repository: `security/policy-runtime.mjs`, `security/security-policy.json`, `evals/run.sh`, `evals/graders/deterministic.mjs`, `skills/walkthrough/references/html-patterns.md`.
- OWASP SCVS, Node `path` docs, npm `npm ci` behavior — pitfalls references.

---
*Research completed: 2026-04-29*  
*Ready for roadmap: yes*
