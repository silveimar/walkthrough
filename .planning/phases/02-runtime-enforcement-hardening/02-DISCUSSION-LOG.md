# Phase 2: Runtime Enforcement Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 2-Runtime Enforcement Hardening
**Areas discussed:** Command invocation & shell safety, Constrained execution context, Startup validation, Portability

---

## Command invocation and shell safety (RUN-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Keep shell pipelines with careful quoting | Minimal code churn |  |
| Prefer spawn/execFile with argv arrays; remove sh pipelines | Eliminates shell injection class | ✓ |

**User's choice:** Auto mode — recommended default (spawn/execFile, no shell pipelines for dynamic input).
**Notes:** `[auto]` Aligns with `.planning/codebase/CONCERNS.md` recommendation for `evals/graders/llm-rubric.mjs`.

---

## Constrained execution context (RUN-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Per-script ad hoc limits | Fast but inconsistent |  |
| Policy-aligned allowlists for subprocess and workspace roots | Single authority with Phase 1 | ✓ |

**User's choice:** Auto mode — extend/consume `security/security-policy.json` and `policy-runtime.mjs`.
**Notes:** `[auto]` Keeps RUN-02 traceable to POL-era decisions.

---

## Startup validation (RUN-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Only entrypoint assert | Minimal |  |
| Entrypoint assert plus insecure-config checks (cwd, missing policy, prereqs) | Fail-fast, clear errors | ✓ |

**User's choice:** Auto mode — recommended default.
**Notes:** `[auto]` Shell entrypoint should validate prerequisites before prompt loop.

---

## Bash orchestration scope

| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite entire runner in Node | Large blast radius |  |
| Keep bash for flow; harden dynamic segments and fix POSIX issues | Preserves maintainer workflow | ✓ |

**User's choice:** Auto mode.
**Notes:** `[auto]` Includes fixing known portability issues (e.g. `tail` flags) in `evals/run.sh`.

---

## Claude's Discretion

- Helper module layout for subprocess wrappers.
- Plan ordering between `run.sh` and grader refactors.

## Deferred Ideas

- HTML parser grading, CI eval matrix — noted for later phases per roadmap.
