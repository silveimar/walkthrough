# Roadmap: Walkthrough Skill Local Security Hardening

## Milestones

- **Shipped — [v1.0](milestones/v1.0-ROADMAP.md)** — Local security hardening (Phases 1–5, 15 plans). **Date:** 2026-04-29
- **Active — v2.0 Advanced Local Hardening** — Offline vendoring, cross-platform parity, signed provenance (Phases 6–8). Research order: ADV-01 → ADV-03 → ADV-02.

## Phases (v2.0)

- [x] **Phase 6: Offline vendoring & dual-mode HTML** — Reproducible vendor layout, policy-driven CDN vs vendor mode, eval temp workspace includes frozen assets with fail-closed checks. (completed 2026-04-29)
- [x] **Phase 7: Cross-platform sandbox & path parity** — Documented platform matrix, normalized paths and temp workspace across macOS/Linux/Windows, CI smoke for shell/path failure modes. (completed 2026-04-29)
- [ ] **Phase 8: Signed provenance** — Manifest-first scope, local sign/verify, data-protection–aligned attestations, optional CI verification.

## Phase Details (v2.0)

### Phase 6: Offline vendoring & dual-mode HTML
**Goal**: Maintainers can run walkthrough eval and representative workflows with reproducible, offline-capable viewer assets and a single policy-controlled CDN vs vendor contract—without ambiguous “works on my machine” HTML or silent network dependence when vendor mode is required.

**Depends on**: Milestone v1.0 complete (policy baseline, eval harness, graders).

**Requirements**: OFF-01, OFF-02, OFF-03, OFF-04, OFF-05, OFF-06

**Success Criteria** (what must be TRUE):

1. Maintainer can follow documentation to run eval or representative workflows in an **offline-capable** configuration such that walkthrough viewer dependencies covered by policy do not require live CDN fetches when asset mode is vendor (dual-mode is explicit, not accidental).
2. Repository contains a **frozen vendor layout** with tracked paths and an **integrity manifest** sufficient for the chosen asset mode; a fresh clone can see what bytes are expected offline.
3. Maintainer can **reproduce** the vendor tree using **pinned tooling** (e.g. lockfile-driven `npm ci` or documented equivalent) from the repo alone.
4. `security/security-policy.json` (and schema) express **asset mode** and **vendor root(s)** so `policy-runtime.mjs` and deterministic graders **share one source of truth**—no divergent “CDN in skill, vendor in grader” drift.
5. `evals/run.sh` and temp-workspace copy behavior **include vendored assets** in isolated runs when policy requires vendor mode, with **fail-closed** behavior when vendor content is missing or the manifest does not match.

**Plans**: 06-01 (policy + runtime), 06-02 (html-patterns + deterministic), 06-03 (vendor sync + run.sh) — **complete**

**UI hint**: yes

---

### Phase 7: Cross-platform sandbox & path parity
**Goal**: Maintainers on macOS, Linux, and supported Windows setups (e.g. Git Bash / documented WSL scope) get **consistent policy interpretation and path/temp semantics** for eval and policy runtime—without Docker as a mandatory prerequisite for core flows.

**Depends on**: Phase 6

**Requirements**: PLT-01, PLT-02, PLT-03, PLT-04

**Success Criteria** (what must be TRUE):

1. Maintainer-facing documentation defines a **supported platform matrix** (shell, Node, OS) and clearly states what **“parity”** means for this repo (policy + harness contract, not identical OS sandboxes).
2. Eval harness and policy runtime exhibit **normalized path and temp-workspace behavior** that is consistent across the supported matrix for the documented runners (recorded choice for Windows scope, e.g. Git Bash vs WSL, is explicit).
3. Subprocess and workspace rules derived from policy are **enforced or validated** without requiring a **single non-default container runtime**—Docker remains optional, not required for core maintainer flows.
4. **CI or documented smoke steps** provide signal on path/shell failure modes (including a **Windows-appropriate** job or equivalent) **before** attestations and signing workflows harden on still-moving scripts.

**Plans**: 07-01 (docs + manual smoke), 07-02 (path/temp + Node tests), 07-03 (CI strict cwd + path smoke) — **complete**

---

### Phase 8: Signed provenance
**Goal**: Maintainers can produce and verify **cryptographic provenance** for in-scope artifacts (vendor layout, key generated outputs, policy digest) using a **manifest-first** model and a **local-first** signing tool choice—with verification bound to **consumed** artifacts and **data protection** rules respected.

**Depends on**: Phase 7

**Requirements**: ATT-01, ATT-02, ATT-03, ATT-04, ATT-05

**Success Criteria** (what must be TRUE):

1. Repository documents a **manifest-first** model: what byte ranges and metadata are in scope (vendor layout, key generated artifacts, policy digest) **before** any signing step.
2. Maintainer can **sign** the v2.0 provenance manifest with a **documented local-first** tool (e.g. Minisign, Cosign, or GPG) appropriate to this project’s trust model, with clear key-handling guidance.
3. Maintainer can **verify** signatures **locally**; verification demonstrably binds to **artifacts at consumption** (eval + relevant outputs), not CI-only checks disconnected from what runs locally.
4. Attestation and verification **respect data protection**: no signing or persisting of redacted secret material; behavior **aligns** with `evals/results/` handling from v1.0.
5. An **optional CI verify** path exists (workflow job or documented required step) so teams can **require** manifest/signature checks on merge when the policy flag is enabled.

**Plans**: 08-01 (manifest docs + schema), 08-02 (build/verify scripts + gitignore), 08-03 (optional CI / docs)

---

## Progress (v2.0)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Offline vendoring & dual-mode HTML | 3/3 | Complete    | 2026-04-29 |
| 7. Cross-platform sandbox & path parity | 3/3 | Complete    | 2026-04-29 |
| 8. Signed provenance | 0/3 | Planned (context + plans) | - |

## Phase artifact paths (v2.0)

| Phase | Slug directory |
|-------|----------------|
| 6 | `.planning/phases/06-offline-vendor-and-dual-mode-html/` |
| 7 | `.planning/phases/07-cross-platform-sandbox-path-parity/` |
| 8 | `.planning/phases/08-signed-provenance/` |

---

## Historical: Phases (v1.0)

All v1.0 phase goals and plan checklists are recorded in the [archived roadmap](milestones/v1.0-ROADMAP.md). Execution artifacts remain under [`.planning/phases/`](phases/) where present.

---

*Roadmap v2.0 updated: 2026-04-29*
