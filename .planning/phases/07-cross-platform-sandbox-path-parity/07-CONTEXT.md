# Phase 7: Cross-platform sandbox & path parity - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **PLT-01–PLT-04**: maintainer-facing **supported platform matrix** and explicit definition of **parity** (consistent policy + harness semantics, not identical OS sandboxes); **normalized path and temp-workspace behavior** across macOS, Linux, and Windows **within that matrix**; enforcement/validation of subprocess and workspace rules **without Docker as mandatory**; and **CI or documented smoke** so path/shell failure modes are visible before Phase 8 hardens attestations.

Phase does **not** add signed provenance (Phase 8) or change offline vendor layout (Phase 6) except where path/copy behavior must be consistent.

</domain>

<decisions>
## Implementation Decisions

### Windows & supported matrix (PLT-01, PLT-02)
- **D-01:** **Document a full matrix** that includes **Git Bash** and **WSL2** (and primary macOS/Linux shells). **Parity** for this repo means: the **same Node + bash entrypoints** (`scripts/verify-policy`, `evals/run.sh`, documented npm/node scripts) yield **consistent policy interpretation** and documented behavior—not identical OS-level sandboxes.
- **D-02:** **No requirement** in this phase to add a **`windows-latest` GitHub Actions job** as the default deliverable. **PLT-04** is satisfied **first** via **maintainer-facing documentation** plus a **manual smoke checklist** (Git Bash and WSL paths called out). An optional Windows CI job may be added **only if** it stays a small, incremental change in the same phase; otherwise it remains a **follow-up** after docs land.

### Path & temp workspace behavior (PLT-02)
- **D-03:** **Split responsibility:** keep **portable bash** patterns in `evals/run.sh` (and related shell) for `PROJECT_DIR`, workdir creation, and copying—avoid MSYS/path surprises where feasible; keep **policy assertions** (e.g. `realpathSync`, temp-root checks, repo root resolution) in **`security/policy-runtime.mjs`** and align call sites so there is a single contract for “allowed workspace” and canonical paths.
- **D-04:** Prefer **incremental hardening**: when bash must change, pair with **focused checks** (existing or new Node tests) so regressions show up on **ubuntu-latest** CI without requiring a Windows runner.

### CI vs documented smoke (PLT-04)
- **D-05:** **Ship docs first:** add or extend **`README.md` / `CONTRIBUTING.md` / or a dedicated `docs/` platform note** with the matrix, parity definition, and **manual smoke steps** for Windows (Git Bash + WSL). **Automated Windows CI** is optional per **D-02**, not a gate for closing Phase 7.

### Policy enforcement without Docker (PLT-03)
- **D-06:** Enable **`WALKTHROUGH_STRICT_CWD=1`** in **CI** for at least one job or step that exercises repo Node entrypoints (e.g. alongside `node --check` / eval tooling), so **RUN-03** cwd misuse is caught in automation. Local default remains opt-in unless README explicitly recommends it for contributors.
- **D-07:** **Docker** stays **optional**: document that core flows (verify-policy, deterministic grading path, shell syntax checks) do **not** require a container; no new mandatory container runtime for PLT-03.

### Claude's Discretion
- Exact filename/layout for the platform doc (`CONTRIBUTING.md` vs `docs/platform-matrix.md`).
- Wording of the manual smoke checklist and which commands are “must pass” vs advisory on Windows.
- Whether a minimal `windows-latest` job lands in Phase 7 after docs (only if trivial).
- Specific bash refactors in `evals/run.sh` vs new small Node helper modules.

</decisions>

<specifics>
## Specific Ideas

- Research notes (`.planning/research/ARCHITECTURE.md`) already point at **Windows + `realpath`** tests as a direction—planner should align tasks with **D-03** / **D-04** rather than a large rewrite up front.
- User wants **docs + manual smoke before** investing in Windows CI.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, PLT requirements
- `.planning/REQUIREMENTS.md` — PLT-01–PLT-04 traceability

### Policy & runtime
- `security/security-policy.json` — `runtime` (eval workspace, allowed tools)
- `security/policy-runtime.mjs` — `assertEvalWorkspaceDirAllowed`, `assertStrictRepoWorkingDirectory`, `getCanonicalEvalResultsAbsPath`, repo root helpers
- `security/security-policy.schema.json` — runtime shape if extended

### Harness & CI
- `evals/run.sh` — Temp workspace, vendor copy, bash path usage
- `.github/workflows/ci.yml` — Current Ubuntu-only jobs (extend with `WALKTHROUGH_STRICT_CWD` per **D-06**)

### Prior phase context
- `.planning/phases/06-offline-vendor-and-dual-mode-html/06-CONTEXT.md` — Vendor/manifest contract Phase 7 must not break

### Research
- `.planning/research/ARCHITECTURE.md` — v2.0 sandbox/eval direction (ADV-03 / path parity hints)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **`security/policy-runtime.mjs`** — Already uses `path`, `realpathSync`, `os.tmpdir`, `sep`-aware prefix checks for eval workspace and canonical eval results paths.
- **`evals/run.sh`** — Bash `PROJECT_DIR` resolution; copies skill + vendor into temp workspace; policy preflight via `scripts/verify-policy`.

### Established patterns
- **Preflight gate:** `scripts/verify-policy` before eval runs.
- **Fail-closed vendor:** Node snippet verifies vendor manifest when policy requires vendor assets (Phase 6).

### Integration points
- **`.github/workflows/ci.yml`** — Add strict cwd env + keep Ubuntu baseline; optional future `windows-latest` job.
- **Eval/report/rubric/deterministic scripts** — Already call `assertStrictRepoWorkingDirectory()`; CI env ensures the assert is active when those paths run in CI.

</code_context>

<deferred>
## Deferred Ideas

- Full **`windows-latest` matrix job** with full eval (needs Claude CLI)—out of scope until docs/checklist exist unless trivial additive job is agreed during planning.
- **PowerShell-native** runner support — not part of the Phase 7 matrix unless added as an explicit future phase/backlog item.

</deferred>

---

*Phase: 07-cross-platform-sandbox-path-parity*
*Context gathered: 2026-04-29*
