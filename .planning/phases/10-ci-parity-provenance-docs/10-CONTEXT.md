# Phase 10: CI parity & provenance documentation - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

**v2.1 gap closure** for **PLT-04** and **ATT-05**: align maintainer documentation with **actual CI behavior** — (1) **where automated checks run** (single Linux runner vs manual Windows/Git Bash smoke already in CONTRIBUTING), and (2) **provenance verification** — `provenance/README.md` must match **`.github/workflows/ci.yml`** (digest verify runs on every PR/push; optional Minisign only when signature files exist).

Phase **does not** add a Windows CI matrix job or change workflow YAML unless explicitly planned later (doc-first remediation per audit).

</domain>

<decisions>
## Implementation Decisions

### PLT-04 — CI signal vs documented platform matrix

- **D-01:** **Documentation-first:** Add an explicit **CI automation scope** note — **`ci.yml`** uses **`ubuntu-latest`** only; automated path/cwd/grader steps mirror Linux CI; **Windows** shell/path parity remains **manual smoke** (Git Bash / WSL2) as already documented in CONTRIBUTING. Avoid implying CI exercises Windows.
- **D-02:** **Defer** adding `runs-on: windows-latest` (or matrix) to a future backlog item unless product asks — out of scope for this doc-gap slice.

### ATT-05 — Provenance README vs CI

- **D-03:** **`provenance/README.md` incorrectly claimed** CI was gated by **`ENABLE_PROVENANCE_VERIFY`**; **`ci.yml` does not reference that variable** — verification **always** runs `node scripts/verify-provenance.mjs` in the `verify` job. Replace the obsolete subsection with text matching **`CONTRIBUTING.md`** (already accurate): always-on digest check; Minisign when `.sig`/`.pub` committed.
- **D-04:** If **`ENABLE_PROVENANCE_VERIFY`** is mentioned elsewhere as implemented, remove or mark **historical / not wired** — grep shows only provenance README and old plan artifact.

### Claude's Discretion

- Exact heading titles (“CI automation scope” vs “Ubuntu-only CI”).
- Whether to add a one-line pointer in `README.md` — optional if CONTRIBUTING is sufficient.

</decisions>

<canonical_refs>
## Canonical References

- `.github/workflows/ci.yml` — Source of truth for jobs, `runs-on`, provenance step order
- `CONTRIBUTING.md` — Platform matrix, manual smoke, ATT-05 provenance section (already aligned with CI)
- `provenance/README.md` — Must be updated to remove fictional CI gate
- `.planning/v2.0-MILESTONE-AUDIT.md` — PLT-04, ATT-05 integration warnings
- `.planning/REQUIREMENTS.md` — Phase 10 REQ rows

</canonical_refs>

<code_context>
## Existing Code Insights

- **Single job `verify`** — All checks sequential on Ubuntu; no conditional provenance skip.
- **CONTRIBUTING** ATT-05 section already describes always-on `verify-provenance.mjs` — fix README drift only.

</code_context>

<specifics>
## Specific Ideas

- `--auto`: prioritized accuracy over expanding CI infrastructure.

</specifics>

<deferred>
## Deferred Ideas

- GitHub Actions **matrix** (ubuntu + windows) for path smoke — future phase / backlog.
- Wiring **`ENABLE_PROVENANCE_VERIFY`** in workflow — only if product wants opt-out (currently unnecessary).

</deferred>

---

*Phase: 10-ci-parity-provenance-docs*
*Context gathered: 2026-04-29*
