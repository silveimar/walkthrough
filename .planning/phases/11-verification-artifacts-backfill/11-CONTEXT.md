# Phase 11: verification-artifacts-backfill - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

**v2.1 gap closure (process):** Author **retroactive verification records** that map the remaining v2.0 **REQ-IDs** (**OFF-02**, **OFF-04**, **OFF-05**, **PLT-01**–**PLT-03**, **ATT-01**–**ATT-04**) to **concrete evidence** in the repository (files, plans, scripts, tests), addressing the v2.0 milestone audit **process** gap: *no `VERIFICATION.md` under v2.0 phase directories*.

Phase **does not** re-implement shipped features; it **documents verification** only. **Phases 9–10** already closed **OFF-01**, **OFF-03**, **OFF-06**, **PLT-04**, **ATT-05** — cite those doc outcomes **only** where they clarify traceability; **do not** expand scope to re-litigate those REQ rows here.

</domain>

<decisions>
## Implementation Decisions

### Verification artifact topology

- **D-01:** Deliver a **single milestone-level** verification document at `.planning/milestones/v2.0-VERIFICATION.md` (explicit **milestone-equivalent** allowed by `.planning/ROADMAP.md`). Structure it with **Phase 6 / Phase 7 / Phase 8** sections so audit expectations map cleanly to original execution phases without scattering duplicate files.

### Evidence citation style

- **D-02:** Use **stable, repository-relative paths** as primary evidence (source files, `security/security-policy.json`, `evals/run.sh`, provenance scripts, existing `.planning/phases/*/*-SUMMARY.md` and `*-PLAN.md`). Prefer **file + optional line/workflow anchor** over brittle CI run URLs. Match the **documentation-first** posture from Phases 9–10 contexts.

### Nyquist / VALIDATION stubs

- **D-03:** **Defer** adding per-phase `VALIDATION.md` Nyquist stubs unless a later `/gsd-validate-phase` run requires them. Phase 11 scope is **`VERIFICATION.md` / milestone-equivalent evidence matrix** per audit and `.planning/REQUIREMENTS.md`; optional stubs remain **out of scope** for this backfill unless explicitly pulled in by a validation audit.

### REQ-ID coverage matrix

- **D-04:** The verification artifact **must** include an explicit **REQ-ID → evidence** mapping for **every** Phase 11 row in `.planning/REQUIREMENTS.md` traceability (OFF-02, OFF-04, OFF-05, PLT-01–03, ATT-01–04). **No gaps.** Rows completed in Phases 9–10 (**PLT-04**, **ATT-05**, etc.) stay marked **Done** in REQUIREMENTS but are **not** part of this phase’s mandatory matrix unless needed as cross-reference footnotes.

### Relationship to v2.1 doc phases

- **D-05:** Treat Phases **9** and **10** deliverables as **already-shipped context** (CONTRIBUTING, provenance README, lockfile narrative). Reference them **only** when they strengthen evidence for a **Phase 11 REQ-ID** (e.g., OFF-03/install path now documented supports reading **OFF-02** vendor schema evidence).

### Claude's Discretion

- Exact section headings and table formatting inside `v2.0-VERIFICATION.md`.
- Whether to add **symlinks or short pointers** from `phases/06-*`, `07-*`, `08-*` READMEs to the milestone verification doc (nice-to-have navigation).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audit & requirements
- `.planning/v2.0-MILESTONE-AUDIT.md` — Process gap (missing VERIFICATION.md); REQ-ID statuses and evidence notes
- `.planning/REQUIREMENTS.md` — Phase 11 traceability rows; REQ-ID–phase assignment
- `.planning/ROADMAP.md` — Phase 11 goal; milestone-equivalent wording

### Milestone scope
- `.planning/milestones/v2.0-ROADMAP.md` — v2.0 phase boundaries (6–8)
- `.planning/milestones/v2.0-REQUIREMENTS.md` — v2.0 REQ definitions for OFF / PLT / ATT IDs

### Prior phase artifacts (evidence sources)
- `.planning/phases/06-offline-vendor-and-dual-mode-html/` — Phase 6 plans and summaries (OFF-*)
- `.planning/phases/07-cross-platform-sandbox-path-parity/` — Phase 7 plans and summaries (PLT-*)
- `.planning/phases/08-signed-provenance/` — Phase 8 plans and summaries (ATT-*)
- `.planning/phases/09-vendor-repro-offline-docs/09-CONTEXT.md` — Doc closure decisions (supplemental)
- `.planning/phases/10-ci-parity-provenance-docs/10-CONTEXT.md` — CI/provenance doc alignment (supplemental)

### Runtime / policy (verify against)
- `security/security-policy.json`
- `security/policy-runtime.mjs`
- `evals/run.sh`
- `scripts/sync-walkthrough-vendor.mjs`, `scripts/build-provenance-manifest.mjs`, `scripts/verify-provenance.mjs` as applicable per REQ-ID
- `.github/workflows/ci.yml` — For PLT/ATT evidence where automated checks apply

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Existing phase directories** `06-offline-vendor-and-dual-mode-html`, `07-cross-platform-sandbox-path-parity`, `08-signed-provenance` — House `*-SUMMARY.md` / `*-PLAN.md` artifacts already cited by the audit; verification maps REQ-IDs to these plus runtime paths.
- **`.planning/milestones/`** — Established location for `v2.0-ROADMAP.md` and `v2.0-REQUIREMENTS.md`; adding `v2.0-VERIFICATION.md` keeps v2.0 records co-located.

### Established patterns
- **Kebab-case / lowercase markdown** under `.planning` per `.planning/codebase/CONVENTIONS.md`.
- **Traceability tables** in `.planning/REQUIREMENTS.md` — Phase 11 should update **Status** to **Done** for listed REQ-IDs after verification is authored and reviewed.

### Integration points
- **STATE.md / ROADMAP.md** — Expect updates when Phase 11 completes and REQ rows flip to Done.
- **No application code changes required** unless a verification step discovers a documentation bug (out of scope unless filing a follow-up).

</code_context>

<specifics>
## Specific Ideas

- **`--auto` mode:** Prioritized a **single milestone verification doc**, **path-based evidence**, and **deferring Nyquist stubs** to keep the backfill proportional to the audit process gap.

</specifics>

<deferred>
## Deferred Ideas

- **Per-phase `VERIFICATION.md`** copies under each of `06/`, `07/`, `08/` — deferred unless maintainers want symmetry with strict per-phase GSD layout; milestone file satisfies roadmap wording.
- **Nyquist VALIDATION.md** pack for phases 6–8 — run `/gsd-validate-phase` when validation gaps are audited separately.

</deferred>

---

*Phase: 11-verification-artifacts-backfill*
*Context gathered: 2026-04-29*
