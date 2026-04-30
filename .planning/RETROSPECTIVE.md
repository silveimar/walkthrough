# Retrospective

## Milestone: v2.1 — Audit gap closure

**Shipped:** 2026-04-29  
**Phases:** 3 (9–11) · **Plans:** 3

### What shipped

Documentation alignment for vendor install/offline path (**OFF-01**, **OFF-03**, **OFF-06**), CI automation scope and provenance README vs **`ci.yml`** (**PLT-04**, **ATT-05**), and a milestone-level **[v2.0-VERIFICATION.md](milestones/v2.0-VERIFICATION.md)** matrix for remaining **OFF/PLT/ATT** REQ evidence (**Phase 11**).

### What worked

- Formal `/gsd-audit-milestone` before close gave a clear **passed** gate and integration sign-off.
- Consolidating retro verification in one file avoided duplicate per-phase `VERIFICATION.md` maintenance.

### What to improve next

- Optional Nyquist **`VALIDATION.md`** stubs remain deferred; run `/gsd-validate-phase` when dimension coverage matters.
- Keep `requirements-phase-map.json` in sync with `.planning/REQUIREMENTS.md` whenever both exist (CI trace check).

---

## Milestone: v2.0 — Advanced Local Hardening

**Shipped:** 2026-04-29  
**Phases:** 3 · **Plans:** 9

### What shipped

Reproducible offline-capable vendor layout and policy-driven dual-mode HTML; documented platform matrix with Node smoke tests and CI path/cwd checks; manifest-first provenance (`provenance/`), build/verify scripts, Minisign-ready workflow, and CI digest verification aligned with data protection.

### What worked

- Research-driven phase order (ADV-01 → ADV-03 → ADV-02) reduced rework between offline assets, parity, and signing.
- Policy + schema stayed the single contract for runtime, graders, and provenance scope.

### What to improve next

- Run `/gsd-audit-milestone` before close when formal E2E sign-off is required.
- Tighten `milestone.complete` accomplishment extraction so date-only lines do not surface as achievements.

---

## Milestone: v1.0 — Walkthrough Skill Local Security Hardening

**Shipped:** 2026-04-29  
**Phases:** 5 · **Plans:** 15

### What shipped

Policy-first controls across eval harness, graders, GitHub Actions (Pages + PR CI), documentation, and governance scripts (requirement trace + policy drift checks).

### What worked

- One JSON policy contract drove validators, runtime guards, and CI — fewer divergent “shadow” rules.
- Deterministic graders plus explicit traceability map caught doc drift early.
- Phased roadmap aligned security concerns with testable plan summaries.

### What to improve next

- Run `/gsd-audit-milestone` before future closes for explicit E2E / coverage sign-off.
- v2 candidate themes: offline/vendor mode, provenance, sandbox parity (see archived requirements “v2 / Advanced Hardening”).

## Cross-milestone trends

| Milestone | Theme | Outcome |
|-----------|--------|---------|
| v2.0 | Advanced local hardening (vendor, parity, provenance) | Shipped |
| v1.0 | Local security hardening | Shipped |

---

*Updated: 2026-04-29 — v2.0 milestone section added.*
