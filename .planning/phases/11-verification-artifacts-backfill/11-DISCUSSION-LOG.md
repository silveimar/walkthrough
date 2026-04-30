# Phase 11: verification-artifacts-backfill - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `11-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 11-verification-artifacts-backfill
**Mode:** `--auto` (recommended defaults, no interactive prompting) + `--chain` (auto-advance to plan-phase)
**Areas discussed:** Verification artifact topology, Evidence citation style, Nyquist / VALIDATION scope, REQ-ID matrix vs Phases 9–10

---

## Verification artifact topology

| Option | Description | Selected |
|--------|-------------|----------|
| Single milestone `.planning/milestones/v2.0-VERIFICATION.md` with Phase 6/7/8 sections | Milestone-equivalent; one maintenance surface; aligns with ROADMAP wording | ✓ |
| Per-phase `VERIFICATION.md` under each of `phases/06-*`, `07-*`, `08-*` | Matches literal “under phase directory” audit phrasing; more files | |

**User's choice:** Autonomous — **Single milestone-level file** (recommended default).

**Notes:** `[auto] Verification artifact topology — Q: "Where should VERIFICATION live?" → Selected: "Milestone-level v2.0-VERIFICATION.md" (recommended default)`

---

## Evidence citation style

| Option | Description | Selected |
|--------|-------------|----------|
| Repository-relative paths + plan/summary pointers | Stable, reviewable, consistent with Phases 9–10 doc-first closure | ✓ |
| Primary CI run URLs / Actions links | Fragile, optional footnotes only | |

**User's choice:** Autonomous — **Relative paths and existing planning artifacts**.

**Notes:** `[auto] Evidence citation — Q: "Primary evidence format?" → Selected: "Repo-relative paths + SUMMARY/PLAN pointers" (recommended default)`

---

## Nyquist / VALIDATION stubs

| Option | Description | Selected |
|--------|-------------|----------|
| Omit VALIDATION stubs in Phase 11; optional later via `/gsd-validate-phase` | Keeps scope to audit VERIFICATION backfill | ✓ |
| Add minimal VALIDATION.md stubs per phase 6–8 now | Extra ceremony not required by REQUIREMENTS.md Phase 11 rows | |

**User's choice:** Autonomous — **Defer Nyquist stubs**.

**Notes:** `[auto] Nyquist scope — Q: "Include VALIDATION stubs?" → Selected: "Defer — verification-only phase" (recommended default)`

---

## REQ-ID matrix vs Phases 9–10

| Option | Description | Selected |
|--------|-------------|----------|
| Strict matrix for Phase 11 REQ-IDs only; Phases 9–10 as supplemental references | Matches `.planning/REQUIREMENTS.md` Phase 11 list | ✓ |
| Re-verify PLT-04 / ATT-05 inside Phase 11 | Scope creep; already closed in Phases 10 and 9–10 | |

**User's choice:** Autonomous — **Phase 11 REQ rows only**, supplemental cites allowed.

**Notes:** `[auto] Scope boundary — Q: "Include PLT-04/ATT-05 in matrix?" → Selected: "No — cite only if supporting a Phase 11 REQ" (recommended default)`

---

## Claude's Discretion

- Heading hierarchy and optional README pointers from phase dirs to `v2.0-VERIFICATION.md`.

## Deferred Ideas

- Per-phase VERIFICATION.md duplication; Nyquist pack — see CONTEXT `<deferred>`.
