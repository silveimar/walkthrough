# Architecture Research

**Domain:** Walkthrough Skill — local security hardening (v2.0 Advanced: ADV-01 offline vendoring, ADV-02 attestations, ADV-03 sandbox parity)  
**Researched:** 2026-04-29  
**Confidence:** **MEDIUM–HIGH** for current-repo integration points and policy-runtime boundaries (**HIGH** where grounded in `security/` + `evals/run.sh`); **MEDIUM** for attestation toolchains (Ed25519/minisign/Sigstore patterns are standard; exact choice is a phase decision).

## Standard Architecture

### System Overview

v2.0 adds three vertical slices on top of the v1.0 **policy-in-the-middle** model: declarative `security/security-policy.json`, enforced by `security/policy-runtime.mjs`, validated by `scripts/verify-policy` → `security/verify-policy.mjs`, and exercised by gated entrypoints (`evals/run.sh`, graders, workflow).

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Authoring & contracts                                                      │
│  skills/walkthrough/skill.md · references/html-patterns.md                  │
├────────────────────────────────────────────────────────────────────────────┤
│  ADV-01  Vendored runtime assets (tracked paths, relative HTML references) │
│  ├── vendor/ (recommended tree) ←───┐                                      │
│  └── deterministic grader + patterns  │ pin / offline parity               │
├────────────────────────────────────────────────────────────────────────────┤
│  Policy & runtime (extended schema + guards)                                │
│  security/security-policy.json · policy-runtime.mjs · validate/verify        │
│  ADV-03  sandbox / workspace rules ←────── same runtime loader             │
├────────────────────────────────────────────────────────────────────────────┤
│  Eval harness                                                               │
│  evals/run.sh (temp workspace, claude -p) → evals/results/<ts>/<prompt>/    │
│  evals/graders/*.mjs · evals/report.mjs                                     │
│  ADV-02  attestations (artifact + manifest signatures) ←── post-grade hook  │
├────────────────────────────────────────────────────────────────────────────┤
│  Data protection                                                            │
│  redaction.mjs · canonical evals path · retention                           │
└────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | v2.0 delta |
|-----------|----------------|------------|
| `skills/walkthrough/skill.md` + `references/html-patterns.md` | Contract for generated HTML (CDN vs vendor URLs, structure) | **Modified** — document offline paths and pin strategy alongside CDN mode. |
| `vendor/**` (new) | Frozen copies of React, ReactDOM, Mermaid, Shiki loader, Tailwind strategy | **New** — single source of truth for ADV-01; avoids runtime CDN fetch when selected. |
| `security/security-policy.json` + schema | Egress, entrypoints, publish roots, runtime, data protection | **Modified** — optional keys for vendor roots, attestation profile, sandbox/runtime parity (see Integration Points). |
| `security/policy-runtime.mjs` | Load/validate policy; assert egress, workspace dir, publish paths, eval results containment | **Modified** — new asserts for vendor path allowlist, optional verification hooks, stricter cross-platform path rules. |
| `scripts/verify-policy` / `verify-policy.mjs` | Canonical policy validation (D-13) | **Unchanged surface**; schema version bump if new required sections. |
| `evals/run.sh` | Preflight verify-policy, egress guards, `mktemp` workspace, skill copy, graders | **Modified** — copy/include vendor tree into temp workspace when policy requires offline parity; optional Windows-safe temp helpers. |
| `evals/graders/deterministic.mjs` | Structural checks (CDN markers today) | **Modified** — branch: “CDN mode” vs “vendor relative URL mode” per policy or env. |
| `evals/graders/llm-rubric.mjs` | Rubric grading | **Minor** — unchanged trust boundary; attestation may wrap outputs, not rubric logic. |
| `evals/report.mjs` | Aggregate results | **Optional** — embed attestation manifest paths or verification status in summary. |
| Attestation tool / manifest (TBD) | Sign and verify walkthrough HTML + policy hash | **New** — local trust model; keys not in repo. |

## Recommended Project Structure (v2.0)

```
security/
├── security-policy.json          # + vendorRoots, attestation?, sandbox? (phase-defined)
├── security-policy.schema.json  # extend for new optional sections
├── policy-runtime.mjs            # + asserts for ADV-01/03
├── validate-policy.mjs
├── verify-policy.mjs
└── redaction.mjs

vendor/
└── walkthrough-runtime/          # ADV-01: versioned subdirs or manifest.lock
    ├── react*.js
    ├── react-dom*.js
    ├── mermaid*.js
    ├── shiki/ …                # or documented subset for ESM offline
    └── README.md                 # provenance, upstream versions, license refs

skills/walkthrough/
├── skill.md
└── references/
    └── html-patterns.md          # CDN + offline dual-path templates

evals/
├── run.sh
├── graders/
├── report.mjs
└── results/                      # unchanged canonical sensitive root (DATA-03)

scripts/
├── verify-policy
├── cleanup-eval-results.mjs
└── (optional) sync-vendor.mjs   # fetch/pin vendor blobs in maintainer workflow
```

### Structure Rationale

- **`vendor/walkthrough-runtime/`:** Keeps vendored blobs out of `skills/` (spec vs binaries) and out of `evals/results/` (protected data). Tracked in git for reproducibility; exact layout can use a small `manifest.json` (paths + SHA-256) for deterministic checks and ADV-02 signing inputs.
- **Policy remains the integration hub:** New behaviors are declarative first (`security-policy.json`), enforced second (`policy-runtime.mjs`), so CI (`verify-policy`) and local runs stay aligned.

## Architectural Patterns

### Pattern 1: Dual-mode HTML references (CDN vs vendor)

**What:** Generated walkthrough HTML supports either remote CDN script tags (current) or relative `vendor/...` URLs resolved from repo root or publish root.  
**When to use:** ADV-01 — maintainer machines without egress to CDNs; reproducible CI; supply-chain pinning.  
**Trade-offs:** Larger repo; must update grader predicates from substring checks to “CDN **or** allowed local paths”. Prefer a single **mode flag** in policy (`runtime.walkthroughAssetMode: "cdn" | "vendor"`) so deterministic grading stays unambiguous.

### Pattern 2: Sign-after-write, verify-before-trust

**What:** Provenance is applied to **artifacts already emitted** under `evals/results/` or publish paths: manifest lists files + hashes; signature covers manifest (or Merkle root).  
**When to use:** ADV-02 — integrity and origin for exported HTML and optional policy snapshot hashes.  
**Trade-offs:** Key management is operational (out of repo); automation must not embed private keys in policy JSON.

### Pattern 3: Policy-driven sandbox envelope

**What:** All subprocess and filesystem constraints that differ by OS are expressed under `policy.runtime` (and friends) and implemented once in `policy-runtime.mjs`, invoked from `run.sh` and Node graders.  
**When to use:** ADV-03 — same mental model as RUN-02 (`assertEvalWorkspaceDirAllowed` + `os.tmpdir()`).  
**Trade-offs:** Schema churn requires `version` bump and migration notes.

## Data Flow

### Request flow (eval, unchanged control plane)

```
Maintainer runs evals/run.sh
    ↓
verify-policy (valid JSON + schema)
    ↓
policy-runtime: egress + (future) sandbox preflight
    ↓
mktemp WORK_DIR → assertEvalWorkspaceDirAllowed(WORK_DIR)
    ↓
copy skills/ (+ vendor/ when offline mode) → claude -p in WORK_DIR
    ↓
copy walkthrough-*.html to evals/results/<ts>/<prompt>/
    ↓
deterministic.mjs · llm-rubric.mjs · report.mjs
    ↓
(ADV-02) optional sign manifest for prompt dir or rollup
```

### Signing / verification flow (ADV-02)

```
┌──────────────────┐     digest      ┌─────────────────────┐
│ walkthrough.html │ ──────────────► │ manifest.json       │
│ (optional vendor │     SHA-256      │ files[] + policy   │
│  paths resolved) │                  │  hash / version     │
└──────────────────┘                  └──────────┬──────────┘
                                                 │
                                                 ▼
                                      ┌─────────────────────┐
                                      │ signature            │
                                      │ (detached / cosign / │
                                      │  minisign — phase)   │
                                      └──────────┬──────────┘
                                                 │
                     verify(manifest, sig, keys)▼
                                      ┌─────────────────────┐
                                      │ CI or local verify   │
                                      │ policy-runtime hook  │
                                      └─────────────────────┘
```

**Policy alignment:** Treat attestations as **optional verification**, not a replacement for egress rules. Signing does not imply network allow — keep `egress.defaultPosture: deny_all` unless `exceptionAllowlist` + flags apply.

### Key data flows

1. **Vendor resolution (ADV-01):** Skill-generated HTML references `vendor/walkthrough-runtime/...` (or copies duplicated under `examples/` for GitHub Pages if only `examples/` is publish-approved). Eval temp dir receives a copy of `vendor/` so Claude-generated files resolve the same way locally as in CI.
2. **Sandbox parity (ADV-03):** `mktemp -d` → realpath under `os.tmpdir()` (already enforced when `evalWorkspaceMustBeUnderSystemTemp` is true). Windows paths must use the same normalization as `policy-runtime` (`sep`, `relative` to repo root).

## Scaling Considerations

This project targets **maintainer-local** scale, not multi-tenant service scale.

| Scale | Architecture adjustments |
|-------|---------------------------|
| Single maintainer | Monolithic repo; vendor subtree + policy JSON sufficient. |
| Small team | Shared signing keys via org secret store; CI verify only. |
| Heavier eval matrices | Optional parallel runners — still must respect one workspace dir policy per process; no change to canonical `evals/results/` root without policy bump. |

### Scaling priorities

1. **First bottleneck:** Vendor blob size and review noise — mitigate with `manifest.json` + scripted sync, not ad-hoc binaries.
2. **Second bottleneck:** Cross-platform `run.sh` — if Windows-first maintainers appear, introduce a thin `evals/run.mjs` wrapper that calls the same policy-runtime asserts (optional phase).

## Anti-Patterns

### Anti-Pattern 1: Attestation without manifest discipline

**What people do:** Sign a single HTML file while omitting referenced `vendor/` chunks or policy version.  
**Why it's wrong:** Verification passes while the real runtime graph is incomplete or stale.  
**Do this instead:** Sign a **manifest** that includes HTML, vendor file hashes, and `security-policy.json` hash (or version + digest).

### Anti-Pattern 2: Silent bypass of `policy-runtime`

**What people do:** Add scripts that fetch CDNs or spawn network tools without `gatedRelPaths` or egress exceptions.  
**Why it's wrong:** Violates deny-all posture and audit story.  
**Do this instead:** Register entrypoints; extend `exceptionAllowlist` with named ids; thread `--allow-egress` / env consistently.

### Anti-Pattern 3: Vendoring inside `evals/results/`

**What people do:** Store downloaded assets next to redacted eval JSON.  
**Why it's wrong:** Blurs sensitive-output boundaries (DATA-03) and complicates retention cleanup.  
**Do this instead:** Keep vendor under `vendor/` (tracked); keep eval results strictly under `dataProtection.sensitiveOutputs.canonicalEvalResultsRelPath`.

## Integration Points

### External services

| Service | Integration pattern | Notes |
|---------|---------------------|--------|
| CDNs (unpkg, jsdelivr, tailwindcss.com) | Runtime `<script>` / ESM URLs | Default today; ADV-01 reduces reliance; egress policy unchanged for **eval** network (still primarily `claude_cli` exceptions). |
| Package registries (npm) | Maintainer-only `sync-vendor` script | Optional **out-of-band** fetch during vendor refresh — not part of default deny-all eval path if scripted separately with explicit intent. |
| Public key / Sigstore infra | Verify step in CI | ADV-02 — publish **public** key material or OIDC trust bundle out-of-band; no secrets in repo. |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|--------|
| `security-policy.json` ↔ `policy-runtime.mjs` | Parsed JSON → typed guards | New keys must be validated in `validate-policy.mjs` / schema. |
| `policy-runtime.mjs` ↔ `evals/run.sh` | Node `-e` snippets + env (`WALKTHROUGH_ALLOW_EGRESS`, `VERIFY_WORK_DIR`) | ADV-03: add shared helpers instead of duplicating path logic in bash. |
| `skills/walkthrough/*` ↔ generated HTML | Authoring contract | Patterns must specify both CDN and vendor Relative URLs for ADV-01. |
| `deterministic.mjs` ↔ asset mode | Checks derived from policy or env | Avoid dual maintenance — derive allowlist from one manifest file if possible. |
| ADV-02 ↔ `evals/report.mjs` | Summary may list verification status | Keep JSON redaction rules for sensitive paths. |

### Where vendored assets live

| Location | Purpose |
|----------|---------|
| **`vendor/walkthrough-runtime/`** (recommended) | Canonical tracked blobs for React, ReactDOM, Mermaid, Shiki pieces; referenced by relative URLs from generated HTML at repo root. |
| **Eval temp workspace** | **Copy** of `vendor/` (and `skills/`) so `claude -p` outputs match production paths. |
| **`examples/`** | Published demo on GitHub Pages — either duplicate vendor snippets under `examples/` **or** extend `publish.approvedPathRoots` to include `vendor/` so static hosting serves both (policy change required v1). |

### Sandbox constraints ↔ policy

| Mechanism | Policy hook | Implementation today | v2.0 direction |
|-----------|-------------|-------------------------|----------------|
| Eval workspace location | `runtime.evalWorkspaceMustBeUnderSystemTemp` | `assertEvalWorkspaceDirAllowed` | Keep; add explicit **Windows**/`realpath` tests in CI. |
| Allowed CLIs | `runtime.allowedCliBinaries` | Documented + `run.sh` prereq checks | Optional: enforce allowlist in a central prelude script (ADV-03). |
| Strict cwd | env `WALKTHROUGH_STRICT_CWD` | `assertStrictRepoWorkingDirectory` | Optional CI flag for parity. |
| Egress | `egress.*` + `--allow-egress` | `assertClaudeCliEgressAllowed`, rubric asserts | Unchanged for ADV-03; vendor mode reduces **browser** CDN reliance, not necessarily Claude egress. |

## Suggested build order across phases

1. **ADV-01 (offline vendoring)** — **First.** Establishes filesystem layout, dual-mode references in `html-patterns.md`, grader updates, and copy behavior in `evals/run.sh`. ADV-02 signing needs stable paths and hashes; ADV-03 workspace copies must include whatever the skill expects on disk.

2. **ADV-03 (sandbox parity)** — **Second.** Harden `run.sh` / optional Node runner for cross-platform temp + path normalization; extend `policy.runtime` only where asserts already exist in spirit. Doing this before attestations avoids signing scripts that still change week-to-week.

3. **ADV-02 (attestations)** — **Third.** Consume manifests covering vendored file tree + outputs + policy digest; add verify step to CI next to `verify-policy`.

**Parallelism:** Policy schema drafting for ADV-01 and ADV-03 can overlap in one phase if coordinated; avoid landing ADV-02 verify gates until ADV-01 manifest format is stable.

## Sources

- Repository: `security/policy-runtime.mjs`, `security/security-policy.json`, `security/security-policy.schema.json`, `evals/run.sh`, `evals/graders/deterministic.mjs`, `skills/walkthrough/references/html-patterns.md`
- Project: `.planning/PROJECT.md` (v2.0 ADV-01–03 scope)
- `.planning/codebase/INTEGRATIONS.md`, `.planning/codebase/CONCERNS.md` (CDN / pinning context)

---
*Architecture research for: Walkthrough Skill Local Security Hardening v2.0*  
*Researched: 2026-04-29*
