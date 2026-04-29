---
phase: "02"
slug: runtime-enforcement-hardening
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-29
---

# Phase 2 — Security

> Runtime enforcement for RUN-01..RUN-03: no unsafe shell interpolation, constrained eval workspace, startup cwd/context checks — per `02-01`..`02-03` PLAN `<threat_model>` registers.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Temp artifacts → Claude (`llm-rubric`) | Rubric invokes `claude` via **argv array**, stdin payload — no shell metacharacters from untrusted HTML paths. | File paths passed as argv only with `shell: false`. |
| `mktemp` workspace → policy | Eval working directory must resolve under OS temp when policy requires it. | Absolute path → allow/deny per `runtime.evalWorkspaceMustBeUnderSystemTemp`. |
| Maintainer cwd / stderr | Wrong cwd or verbose errors can mislead or leak paths; messages should stay actionable and scoped. | stderr / guard errors → redacted or scoped strings. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T2-01 | Tampering | `evals/graders/llm-rubric.mjs` | mitigate | `spawnSync` with **`shell: false`** and argv array; comment cites RUN-01. | closed |
| T2-02 | Elevation | `evals/run.sh` | mitigate | POSIX **`tail -n`** forms; controlled quoting for subprocess paths; tmux helper uses `tail -f` only for idle wait (no prompt parsing). | closed |
| T2-03 | Elevation | `evals/run.sh` temp dir | mitigate | After `mktemp -d`, **`assertEvalWorkspaceDirAllowed`** (`VERIFY_WORK_DIR`) in [`policy-runtime.mjs`](../../../security/policy-runtime.mjs) — `realpathSync` + under `os.tmpdir()` when policy enabled. | closed |
| T2-04 | Information disclosure | stderr / grader errors | mitigate | LLM rubric uses **`redactString`** on failure output; RUN-03 **`assertStrictRepoWorkingDirectory`** optional strict cwd (policy-driven). | closed |

*Plan dispositions **MITIGATED** / **LOW** mapped to implemented controls; residual **LOW** items addressed by redaction + scoped errors.*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-29 | 4 | 4 | 0 | gsd-secure-phase (`/gsd-secure-phase 02`) |

---

## Evidence summary

| Threat | Verification |
|--------|----------------|
| T2-01 | [`llm-rubric.mjs`](../../../evals/graders/llm-rubric.mjs): `spawnSync(..., { shell: false })`, argv-only `claude` invocation. |
| T2-02 | [`run.sh`](../../../evals/run.sh): `tail -n 5`, `tail -n +2`; `bash -n` clean. |
| T2-03 | [`run.sh`](../../../evals/run.sh) calls `assertEvalWorkspaceDirAllowed` via inline `node -e`; [`policy-runtime.mjs`](../../../security/policy-runtime.mjs) `assertEvalWorkspaceDirAllowed`. |
| T2-04 | [`llm-rubric.mjs`](../../../evals/graders/llm-rubric.mjs): `redactString` on errors; strict cwd guard available via `WALKTHROUGH_STRICT_CWD`. |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented (none)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-29 — secure-phase evidence review
