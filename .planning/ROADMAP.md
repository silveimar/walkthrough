# Roadmap: Walkthrough Skill Local Security Hardening

## Milestones

- **Shipped — [v1.0](milestones/v1.0-ROADMAP.md)** — Local security hardening (Phases 1–5, 15 plans). **Date:** 2026-04-29
- **Shipped — [v2.0](milestones/v2.0-ROADMAP.md)** — Advanced Local Hardening: offline vendoring, cross-platform parity, signed provenance (Phases 6–8, 9 plans). **Date:** 2026-04-29
- **Active — v2.1 Audit gap closure** — Remediation from [.planning/v2.0-MILESTONE-AUDIT.md](v2.0-MILESTONE-AUDIT.md) (Phases 9–11). **Target:** close tooling/docs gaps, CI/doc parity, retroactive verification artifacts.

## Phases (v2.1)

- [x] **Phase 9: Vendor reproducibility & offline path** — Align lockfile or install docs with **`npm ci`**, clarify default CDN vs vendor-mode eval and provenance rebuild steps (**OFF-01**, **OFF-03**, **OFF-06**). **Gap closure:** docs + stack blurbs (completed 2026-04-29).
- [x] **Phase 10: CI parity & provenance documentation** — Strengthen automated vs documented platform signal (**PLT-04**), align provenance README with CI provenance job (**ATT-05**). (completed 2026-04-29)
- [x] **Phase 11: Phase verification backfill** — Author retroactive **VERIFICATION.md** (or milestone-equivalent) mapping **OFF-02**, **OFF-04**, **OFF-05**, **PLT-01**–**PLT-03**, **ATT-01**–**ATT-04** to evidence; optional Nyquist **VALIDATION** stubs per config. **Gap closure:** process gap (no phase VERIFICATION.md). (completed 2026-04-29)

## Active work

**Milestone:** v2.1 Audit gap closure — Phases **9–11** complete.

## Historical references

- Phase execution artifacts: [`.planning/phases/`](phases/)
- Requirements archives: [v1.0](milestones/v1.0-REQUIREMENTS.md), [v2.0](milestones/v2.0-REQUIREMENTS.md)
- v2.0 milestone audit: [v2.0-MILESTONE-AUDIT.md](v2.0-MILESTONE-AUDIT.md)

## Phase artifact paths (v2.1)

| Phase | Slug directory |
|-------|----------------|
| 9 | `.planning/phases/09-vendor-repro-offline-docs/` |
| 10 | `.planning/phases/10-ci-parity-provenance-docs/` |
| 11 | `.planning/phases/11-verification-artifacts-backfill/` |

---

*Roadmap updated: 2026-04-29 — v2.1 gap closure phases 9–11*
