# Phase 1: Policy Contract Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-29
**Phase:** 01-policy-contract-foundation
**Areas discussed:** Policy contract format and location, Local-only egress model, Initial enforcement scope, Local verification flow

---

## Policy contract format and location

| Option | Description | Selected |
|--------|-------------|----------|
| JSON | Easiest strict parsing from Node/Bash helpers | ✓ |
| YAML | More human-readable, requires parser/tooling discipline | |
| You decide | Claude discretion | |

**User's choice:** JSON, `security/security-policy.json`, strict fail-closed schema validation, single-source policy references in docs.
**Notes:** User prioritized hard guarantees over convenience for contract authority.

---

## Local-only egress model

| Option | Description | Selected |
|--------|-------------|----------|
| Default deny-all egress | Fail-closed local-only by default | ✓ |
| Deny external but allow localhost/system | Mixed default posture | |
| Monitor-only | Observe without enforcement | |

**User's choice:** Deny-all default, explicit per-run allowlist exceptions, hard-fail on blocked egress, LLM/rubric usage off by default with explicit opt-in.
**Notes:** Decision intentionally favors safety-first local mode while preserving explicit escape hatches.

---

## Initial enforcement scope

| Option | Description | Selected |
|--------|-------------|----------|
| Gate core execution entrypoints | `evals/run.sh`, graders, report, publish checks | ✓ |
| Warn on non-gated paths | Transitional enforcement | |
| Defer non-critical gating | Partial scope in Phase 1 | |

**User's choice:** Gate all listed Phase-1 entrypoints and block execution if an expected path is not policy-gated; require docs/skill references to policy; enforce pre-publish gate checks.
**Notes:** Chosen scope aligns with Phase-1 requirement intent and avoids half-enforced policy posture.

---

## Local verification flow

| Option | Description | Selected |
|--------|-------------|----------|
| Single `verify-policy` command | Shared verification surface | ✓ |
| Per-script ad-hoc checks | Distributed logic | |
| CI-only | Verification deferred from local workflows | |

**User's choice:** One `verify-policy` command, run pre-eval and in CI, output JSON + human summary, hard-stop on failure.
**Notes:** This creates predictable operator behavior and reliable downstream automation hooks.

---

## Claude's Discretion

- Internal key naming/layout for `security/security-policy.json`.
- Exact formatting and message copy for policy/verification failures.

## Deferred Ideas

None.
