# Phase 2: Runtime Enforcement Hardening - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden how generation and eval run on a maintainer machine: remove shell-injection surfaces for untrusted or dynamic inputs, route execution through explicit allowlisted subprocess and filesystem contexts, and fail fast at startup when configuration is unsafe or inconsistent with policy. This phase implements RUN-01, RUN-02, and RUN-03; it does not add data redaction, artifact integrity sidecars, or full CI eval coverage (later phases).

</domain>

<decisions>
## Implementation Decisions

### Command invocation and shell safety (RUN-01)
- **D-01:** Any path from CSV, filesystem discovery, or external input used to build CLI invocations must not pass through `/bin/sh -c` string composition. Prefer `child_process.spawn` / `execFile` with `argv` arrays; pipe stdio explicitly instead of `cat file | cmd` shell pipelines.
- **D-02:** The LLM rubric path that calls the Claude CLI must be refactored to avoid shell-interpreted pipelines; temporary inputs remain under repo or system temp with validated paths only.
- **D-03:** Bash orchestration in `evals/run.sh` may continue for flow control, but dynamic segments (paths, prompt ids) must be passed via environment or arguments using safe quoting patterns; no eval of untrusted strings.
- **D-04:** Address known portability footguns in `evals/run.sh` (e.g. non-POSIX `tail` usage) as part of the same pass so local/CI behavior stays aligned.

### Constrained execution context (RUN-02)
- **D-05:** Subprocess and network posture remain policy-driven: extend or consume `security/security-policy.json` and `security/policy-runtime.mjs` so “what may run” and “where it may read/write” are explicit, not ad hoc per script.
- **D-06:** Temp/workspace roots for eval runs stay bounded to configured directories under the repo or system temp; no arbitrary absolute paths from prompt content as execution roots without validation.
- **D-07:** Align new constraints with existing egress/entrypoint gating from Phase 1 so a single policy read remains authoritative.

### Startup and configuration validation (RUN-03)
- **D-08:** Each gated Node entrypoint continues to assert policy load and entrypoint authorization early; add explicit checks for insecure combinations (e.g. missing policy file, unexpected working directory relative to repo root) with actionable stderr messages.
- **D-09:** The eval shell entrypoint should fail fast when prerequisites are missing (e.g. required tools) before any prompt or copy loop, with messages that point to docs or `verify-policy`.

### Claude's Discretion
- Exact API shape of any new helper wrapping `spawn` (module location, function names).
- Whether to introduce a small shared `security/exec-helpers.mjs` vs in-file refactors, as long as rules D-01–D-03 hold.
- Ordering of run.sh vs grader refactors in implementation plans.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and boundaries.
- `.planning/REQUIREMENTS.md` — RUN-01, RUN-02, RUN-03 and traceability table.
- `.planning/PROJECT.md` — local-first and compatibility constraints.

### Phase 1 policy and runtime (dependency)
- `.planning/phases/01-policy-contract-foundation/01-CONTEXT.md` — locked egress and entrypoint decisions.
- `security/security-policy.json` — authoritative policy contract.
- `security/security-policy.schema.json` — validation rules for policy extensions.
- `security/policy-runtime.mjs` — shared load, entrypoint assert, egress helpers.

### Implementation surfaces
- `evals/run.sh` — eval orchestration and subprocess boundaries.
- `evals/graders/llm-rubric.mjs` — high-priority shell composition risk (per codebase concerns).
- `evals/graders/deterministic.mjs` — gated entrypoint; keep consistent startup checks.
- `evals/report.mjs` — gated entrypoint; consistent startup checks.

### Risk and architecture context
- `.planning/codebase/CONCERNS.md` — shell pipeline / execSync notes and eval isolation notes.
- `.planning/codebase/ARCHITECTURE.md` — execution and evaluation layer boundaries.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `security/policy-runtime.mjs`: `loadRepoPolicy`, `assertEntrypointForCurrentModule`, egress parsing — extend for runtime allowlists and stricter startup validation.
- `evals/run.sh`: single orchestration point for ordering preflight checks and runner behavior.

### Established Patterns
- Policy-first loading with fail-closed validation before any side-effect work.
- Separation between deterministic grader and network-capable LLM grader paths.

### Integration Points
- Replace shell-based Claude invocation in `llm-rubric.mjs` with direct subprocess control.
- Tighten `evals/run.sh` variable handling and prerequisite checks at the top of the script.
- Keep reporting and deterministic grading aligned with the same policy entrypoint pattern.

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-mode selected recommended defaults aligned with RUN-01–RUN-03 and Phase 1 policy.

</specifics>

<deferred>
## Deferred Ideas

- Parser-backed HTML grading and golden fixtures — test/coverage gap noted in CONCERNS; belongs to quality/governance phases, not runtime enforcement core.
- Restricting GitHub Pages artifact roots — publish surface; Phase 4 / governance alignment.

</deferred>

---

*Phase: 02-runtime-enforcement-hardening*
*Context gathered: 2026-04-29*
