# Phase 1: Policy Contract Foundation - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish one machine-readable policy contract that defines and enforces local-only security behavior for the current walkthrough skill repository. This phase locks policy authority, egress defaults, and verification behavior for core entrypoints; it does not implement broader runtime/data/integrity controls from later phases.

</domain>

<decisions>
## Implementation Decisions

### Policy contract format and ownership
- **D-01:** The authoritative policy format is JSON.
- **D-02:** The canonical policy path is `security/security-policy.json` (runtime-owned from day one).
- **D-03:** Policy schema validation is strict fail-closed; unknown or missing required keys fail validation.
- **D-04:** Documentation and skill instructions must reference policy keys as single-source authority (no duplicated rule definitions).

### Local-only egress behavior
- **D-05:** Local-only mode defaults to deny-all egress.
- **D-06:** Exceptions require explicit per-run allowlist flags plus matching policy entries.
- **D-07:** Blocked egress attempts hard-fail with actionable error output that includes blocked target details.
- **D-08:** LLM/rubric network usage is off by default and requires explicit opt-in mode.

### Phase-1 enforcement scope
- **D-09:** Phase-1 policy gating must cover `evals/run.sh`, `evals/graders/llm-rubric.mjs`, `evals/graders/deterministic.mjs`, `evals/report.mjs`, and publish checks in `.github/workflows/static.yml`.
- **D-10:** Execution is blocked when an entrypoint is not policy-gated within this scope.
- **D-11:** Skill/docs must contain required references to the policy contract.
- **D-12:** Publish behavior in this phase uses a hard pre-publish gate on approved paths plus policy checks.

### Local verification flow
- **D-13:** Use one shared `verify-policy` command wrapper as the primary verification surface.
- **D-14:** Verification runs both before eval runs and in CI.
- **D-15:** Verification output must include machine-readable JSON and human-readable summary.
- **D-16:** Verification failures are hard-stop and must be fixed before proceeding.

### Claude's Discretion
- Naming and internal field organization of policy JSON keys, as long as strict validation and single-source references are preserved.
- Exact UX wording/format for hard-fail verification and blocked-egress error messages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirement authority
- `.planning/ROADMAP.md` — Phase 1 goal, boundaries, and success criteria.
- `.planning/REQUIREMENTS.md` — POL-01 and POL-02 requirement contract and traceability context.
- `.planning/PROJECT.md` — local-first security constraints and compatibility expectations.

### Existing implementation entrypoints to gate
- `evals/run.sh` — primary eval execution entrypoint.
- `evals/graders/llm-rubric.mjs` — LLM-connected grader path requiring explicit opt-in behavior.
- `evals/graders/deterministic.mjs` — deterministic grader path under policy authority.
- `evals/report.mjs` — reporting pipeline entrypoint to include in policy surface.
- `.github/workflows/static.yml` — publish workflow scope requiring pre-publish policy gate behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `evals/run.sh`: central orchestration point to inject policy preflight and `verify-policy` enforcement.
- `evals/graders/*.mjs`: clear separation between deterministic and network-capable grading paths, useful for explicit policy gating.
- `.planning/codebase/*`: recent architecture/stack/integration maps provide baseline risk and integration context.

### Established Patterns
- Execution relies on local CLI/script orchestration with explicit environment variables (`EVAL_MODEL`, `EVAL_MAX_BUDGET`), which can be aligned with policy-driven enforcement.
- Static publishing is centralized in one GitHub workflow, enabling a single policy-aware pre-publish gate.

### Integration Points
- Pre-run policy verification should plug into `evals/run.sh` before prompt execution.
- Policy-aware checks should be called from CI workflow before publish artifact upload/deploy steps.
- Grader/report scripts should consume a shared policy reader rather than isolated ad-hoc checks.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches consistent with the locked decisions above.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-policy-contract-foundation*
*Context gathered: 2026-04-29*
