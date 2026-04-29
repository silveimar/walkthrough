---
phase: "03"
slug: data-redaction-and-retention-controls
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-29
---

# Phase 3 — Security

> Data protection for DATA-01..DATA-03: redaction on persisted eval output, retention cleanup with safe defaults, and documented canonical sensitive-output paths — per `03-01`..`03-03` PLAN `<threat_model>` entries.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Raw stderr / grading JSON → disk | Model and grader output may contain paths or tokens; must be redacted before persist or tail to console. | Stream → [`redaction.mjs`](../../../security/redaction.mjs) / [`redact-stdin.mjs`](../../../scripts/redact-stdin.mjs). |
| `evals/results/` tree → deletion | TTL cleanup must only touch policy-canonical roots and skip `latest`; accidental wide delete is a availability/confidentiality risk. | Path policy + **`--dry-run`** default messaging in docs. |
| Maintainer misuse | Writing sensitive artifacts outside documented roots or ignoring retention docs increases disclosure risk. | README + [`security-policy.json`](../../../security/security-policy.json) pointers; optional path assertions in [`policy-runtime.mjs`](../../../security/policy-runtime.mjs). |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T3-01 | Information disclosure | Persisted eval JSON / stderr tails | mitigate | [`redactDeep`](../../../security/redaction.mjs) / [`redactString`](../../../security/redaction.mjs) on grader outputs; [`run.sh`](../../../evals/run.sh) pipes stderr tail through [`redact-stdin.mjs`](../../../scripts/redact-stdin.mjs); policy `dataProtection.redaction.enabled`. | closed |
| T3-02 | Denial of service / integrity (accidental delete) | `scripts/cleanup-eval-results.mjs` | mitigate | Deletes only under canonical eval results root from policy; skips `latest`; README documents **`--dry-run`** before destructive run. | closed |
| T3-03 | Information disclosure (misuse) | Sensitive output locations | mitigate | README **Sensitive data** section + policy keys; `getCanonicalEvalResultsAbsPath`, `assertPathUnderCanonicalEvalResults` in [`policy-runtime.mjs`](../../../security/policy-runtime.mjs). | closed |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-29 | 3 | 3 | 0 | gsd-secure-phase (`/gsd-secure-phase 03`) |

---

## Evidence summary

| Threat | Verification |
|--------|----------------|
| T3-01 | [`deterministic.mjs`](../../../evals/graders/deterministic.mjs), [`report.mjs`](../../../evals/report.mjs), [`llm-rubric.mjs`](../../../evals/graders/llm-rubric.mjs): `redactDeep` / `redactString`; [`run.sh`](../../../evals/run.sh) stderr pipeline through `redact-stdin.mjs`. |
| T3-02 | [`cleanup-eval-results.mjs`](../../../scripts/cleanup-eval-results.mjs): `getCanonicalEvalResultsAbsPath`, skips `latest`, optional `--dry-run`; [README](../../../README.md) retention section. |
| T3-03 | README canonical path + policy cross-refs; [`policy-runtime.mjs`](../../../security/policy-runtime.mjs) DATA-03 helpers. |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented (none)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-29 — secure-phase evidence review
