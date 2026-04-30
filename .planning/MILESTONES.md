# Milestones

## v2.1 — Audit gap closure

**Shipped:** 2026-04-29  
**Scope:** 3 phases (9–11), 3 plans

**Documentation:**

- [Archived roadmap](milestones/v2.1-ROADMAP.md)
- [Archived requirements](milestones/v2.1-REQUIREMENTS.md)
- [Milestone audit](milestones/v2.1-MILESTONE-AUDIT.md)

**Key accomplishments:**

- Vendor/offline maintainer path: lockfile + **`npm ci`** narrative, default CDN vs vendor in **`CONTRIBUTING.md`**, **`AGENTS.md`** / stack blurbs, **`vendor/walkthrough-viewer/README.md`** alignment (**OFF-01**, **OFF-03**, **OFF-06**).
- CI vs docs: **`CONTRIBUTING.md`** **CI automation scope (PLT-04)**; **`provenance/README.md`** matches **`.github/workflows/ci.yml`** provenance step (**ATT-05**).
- Retro verification: **`.planning/milestones/v2.0-VERIFICATION.md`** maps **OFF-02**, **OFF-04**, **OFF-05**, **PLT-01–03**, **ATT-01–04** to code and phase artifacts (**Phase 11**).

**Pre-close audit:** `/gsd-audit-milestone` — **passed** ([v2.1-MILESTONE-AUDIT.md](milestones/v2.1-MILESTONE-AUDIT.md)).

---

## v2.0 — Advanced Local Hardening

**Shipped:** 2026-04-29  
**Scope:** 3 phases, 9 plans

**Documentation:**

- [Archived roadmap](milestones/v2.0-ROADMAP.md)
- [Archived requirements](milestones/v2.0-REQUIREMENTS.md)

**Key accomplishments:**

- Maintainers now have a written supported-platform matrix, parity definition, and Git Bash/WSL smoke commands alongside README discovery.
- RUN-02 workspace rules are now exercised by an automated Node smoke test; eval harness documents Windows bash expectations.
- CI now runs strict cwd + RUN-02 smoke + policy-aware deterministic sanity on example HTML; Docker remains optional.
- Maintainers have a manifest-first spec and JSON Schema for provenance digests (policy + vendor manifest), with explicit exclusions for eval results and sensitive outputs.
- Build and verify scripts emit and check digest manifests; Minisign integration documented; secret keys gitignored.
- CI verifies provenance digests on each run and can verify Minisign when sig/pub exist; CONTRIBUTING explains required-check workflow.

**Stats (from planning closure):** 3 phases · 9 plans · tooling-tracked tasks as recorded by `milestone.complete`.

**Pre-close audit:** Open artifact audit reported all clear (`audit-open`).

---

## v1.0 — Walkthrough Skill Local Security Hardening

**Shipped:** 2026-04-29  
**Scope:** 5 phases, 15 plans

**Documentation:**

- [Archived roadmap](milestones/v1.0-ROADMAP.md)
- [Archived requirements](milestones/v1.0-REQUIREMENTS.md)

**Delivered (summary):**

- Single authoritative policy (`security/security-policy.json`), schema validation, and `scripts/verify-policy` for local and CI parity.
- `policy-runtime.mjs`: egress defaults, LLM rubric opt-in, gated eval entrypoints, publish-scope checks.
- Runtime hardening: no-shell Claude invocation paths, temp workspace policy, redaction on persisted eval artifacts, retention cleanup.
- Integrity sidecars, publish allow-scope scanning, PR CI (`ci.yml`) with traceability and policy-drift scripts.

**Stats (from planning closure):** 5 phases · 15 plans · tooling-tracked tasks as recorded by `milestone.complete`.

**Pre-close audit:** Open artifact audit reported all clear (`audit-open`).

**Note:** No `v1.0-MILESTONE-AUDIT.md` on disk — optional `/gsd-audit-milestone` was not run before close; use next time for formal coverage sign-off.

---
