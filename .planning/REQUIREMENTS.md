# Requirements: Walkthrough Skill Local Security Hardening

**Defined:** 2026-04-29  
**Milestone:** v2.0 Advanced Local Hardening  
**Core value:** Generate and evaluate walkthrough artifacts locally with strong protections for repository and analyzed content, without degrading developer velocity.

## v2.0 Requirements

Scoped from `.planning/PROJECT.md` (ADV-01..03) and `.planning/research/SUMMARY.md`. Each item maps to exactly one roadmap phase at authoring time.

### Offline / vendored runtime (ADV-01)

- [ ] **OFF-01**: Maintainer can run eval / representative workflows in an explicitly documented **offline-capable** configuration without relying on live CDN fetches for walkthrough viewer dependencies covered by policy (dual CDN vs vendor mode).
- [ ] **OFF-02**: Repository contains a **frozen vendor layout** (tracked paths + integrity manifest) for browser-facing assets needed by generated walkthrough HTML when asset mode is `vendor`.
- [ ] **OFF-03**: Maintainer can reproduce the vendor tree using **pinned tooling** (lockfile-driven install / documented `npm ci` or equivalent) from the repo.
- [ ] **OFF-04**: `security/security-policy.json` (and schema) express **asset mode** and **vendor root(s)** so `policy-runtime.mjs` and graders share one source of truth.
- [ ] **OFF-05**: `skills/walkthrough/references/html-patterns.md` and deterministic grader checks align on **relative vendor vs CDN** expectations (no ambiguous “works on my machine” HTML).
- [ ] **OFF-06**: `evals/run.sh` (and temp workspace copy behavior) **include vendored assets** in isolated runs when policy requires vendor mode, with **fail-closed** behavior if vendor is missing or manifest mismatch.

### Cross-platform sandbox & path parity (ADV-03)

- [ ] **PLT-01**: Maintainer-facing docs define a **supported platform matrix** (shell, Node, OS) and what “parity” means for this repo (not identical OS sandboxes, but consistent policy + path semantics).
- [ ] **PLT-02**: Eval and policy runtime use **normalized path / temp workspace** behavior that is consistent across macOS, Linux, and Windows **within the supported matrix** (e.g. Git Bash / documented WSL scope — exact choice recorded in plan).
- [ ] **PLT-03**: Subprocess and workspace rules (from policy) are **enforced or validated** in a way that does not depend on a single non-default container runtime (Docker optional, not required for core flows).
- [ ] **PLT-04**: CI or documented smoke steps give **signal on path/shell failure modes** (e.g. Windows job or equivalent) before attestations harden on still-moving scripts.

### Signed provenance (ADV-02)

- [ ] **ATT-01**: Repo defines a **manifest-first** model: what bytes are in scope (vendor layout, key generated artifacts, policy digest) before signing.
- [ ] **ATT-02**: Maintainer can **sign** the v2.0 provenance manifest with a **documented local-first** tool choice (e.g. Minisign / Cosign / GPG) appropriate to this project’s trust model.
- [ ] **ATT-03**: Maintainer can **verify** signatures locally; verification binds to **consumed** artifacts (not “CI-only theater”).
- [ ] **ATT-04**: Attestation and verification respect **data protection** rules: no signing or persisting of redacted secret material; align with `evals/results/` handling from v1.0.
- [ ] **ATT-05**: Optional **CI verify** path exists (job or documented step) so merges can require signature/manifest checks when enabled.

## Future (post–v2.0)

Not in v2.0 scope; candidates from research for later milestones.

- Scheduled vendor refresh automation; full HTML offline parity for every optional CDN; org PKI / hardware tokens; native Windows without Bash; policy-hash-bound signed attestations with audit integration.

## Out of scope (v2.0)

| Feature | Reason |
|--------|--------|
| Cloud multi-tenant walkthrough hosting | Conflicts with local-first security focus (per PROJECT.md) |
| Building a separate SaaS product | Out of project goal |
| Enterprise SLSA L3+ / org-wide PKI as default | Local maintainer trust model; keep signing pluggable and minimal |
| Identical low-level OS sandbox API on all platforms | Unrealistic; parity is policy + harness contract, not kernel-level sameness |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| OFF-01 | TBD | Pending |
| OFF-02 | TBD | Pending |
| OFF-03 | TBD | Pending |
| OFF-04 | TBD | Pending |
| OFF-05 | TBD | Pending |
| OFF-06 | TBD | Pending |
| PLT-01 | TBD | Pending |
| PLT-02 | TBD | Pending |
| PLT-03 | TBD | Pending |
| PLT-04 | TBD | Pending |
| ATT-01 | TBD | Pending |
| ATT-02 | TBD | Pending |
| ATT-03 | TBD | Pending |
| ATT-04 | TBD | Pending |
| ATT-05 | TBD | Pending |

**Coverage:** 15 v2.0 requirements — to be mapped 1:1 to phases in ROADMAP.md.

---
*Requirements defined: 2026-04-29*  
*Last updated: 2026-04-29 — v2.0 research-informed draft*
