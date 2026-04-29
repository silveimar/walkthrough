---
phase: "01"
slug: policy-contract-foundation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-29
---

# Phase 1 — Security

> Canonical policy JSON, schema, `verify-policy`, policy-runtime wiring, eval preflight, and publish/docs alignment — per `01-01`..`01-03` PLAN `<threat_model>` registers.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Disk → validator | Policy JSON treated as untrusted structure until schema-validated. | File contents → validation errors (paths/keys only on failure). |
| Env/argv → policy-runtime | Invoker-controlled flags; must match policy allowlists. | argv/env → allow/deny egress and LLM rubric decisions. |
| CI runner → repo | Static workflow reads policy and repo files only for gates. | Policy + paths for publish assertion; no secrets required for `verify-policy`. |
| Docs → maintainer | README and skill reference keys/paths, not parallel rule prose. | Documentation pointers only. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-01-01 | T | `security/security-policy.json` | mitigate | Strict JSON Schema with `additionalProperties: false` at top level and nested objects (`security/security-policy.schema.json`). | closed |
| T-01-02 | I | `security/validate-policy.mjs` | mitigate | `validatePolicyDocument` returns `{ ok, errors }`; fail-closed on invalid documents. | closed |
| T-01-03 | I | `security/verify-policy.mjs` stderr/stdout | accept | Human-oriented messages + JSON `{ valid, errors, policyPath }`; failure text lists validation errors, not full policy dump. Residual handled per Accepted Risks. | closed |
| T-01-04 | S | `evals/run.sh` (`claude` invocation) | mitigate | Preflight `bash scripts/verify-policy`; `--allow-egress` aligned with policy allowlist; blocks when posture denies. | closed |
| T-01-05 | E | `evals/graders/llm-rubric.mjs` | mitigate | Imports `policy-runtime.mjs`; `assertEntrypointForCurrentModule`, `assertBeforeLlmRubricExec` before `spawnSync("claude", ...)`. | closed |
| T-01-06 | I | `evals/report.mjs`, `evals/graders/deterministic.mjs` | mitigate | `assertEntrypointForCurrentModule(import.meta.url)` at load for gated entrypoints. | closed |
| T-01-07 | T | `.github/workflows/static.yml` | mitigate | `bash scripts/verify-policy`; `assertPublishArtifactPathAllowed` before `upload-pages-artifact`. | closed |
| T-01-08 | I | `README.md`, `skills/walkthrough/skill.md` | mitigate | Single-source references to `security/security-policy.json`, `verify-policy`, and policy keys — no duplicate numeric rules. | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01-01 | T-01-03 | PLAN disposition **accept**: CLI may emit structured validation errors (paths/keys). Policy must not hold secrets; output does not echo full policy JSON on success; stderr on failure stays diagnostic. | secure-phase audit | 2026-04-29 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-29 | 8 | 8 | 0 | gsd-secure-phase (`/gsd-secure-phase 01`) |

---

## Evidence summary

| Threat | Verification |
|--------|----------------|
| T-01-01 / T-01-02 | Schema [`security/security-policy.schema.json`](../../../security/security-policy.schema.json); validator [`validate-policy.mjs`](../../../security/validate-policy.mjs). |
| T-01-03 | [`verify-policy.mjs`](../../../security/verify-policy.mjs) prints summary line + JSON payload; errors are validation messages only. |
| T-01-04 | [`evals/run.sh`](../../../evals/run.sh) invokes `scripts/verify-policy`; `--allow-egress` handling present. |
| T-01-05 | [`llm-rubric.mjs`](../../../evals/graders/llm-rubric.mjs): guards then `spawnSync("claude", ...)`. |
| T-01-06 | [`deterministic.mjs`](../../../evals/graders/deterministic.mjs), [`report.mjs`](../../../evals/report.mjs): `assertEntrypointForCurrentModule`. |
| T-01-07 | [`static.yml`](../../../.github/workflows/static.yml): verify-policy + publish path assertion. |
| T-01-08 | [`README.md`](../../../README.md), [`skill.md`](../../../skills/walkthrough/skill.md): canonical policy path and key references. |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented for disposition **accept** (T-01-03)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-29 — secure-phase evidence review
