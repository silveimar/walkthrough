---
phase: "05"
slug: continuous-governance-and-drift-detection
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-29
---

# Phase 5 — Security

> Governance CI, requirement traceability automation, and policy drift checks — threat register aligned with `05-01`..`05-03` PLAN `<threat_model>` tables.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| GitHub Actions ↔ repository | CI runs on `pull_request` / `push` with `contents: read`; verifies repo files only. | Source tree, policy JSON; no secrets required for these jobs. |
| Maintainer workstation ↔ CI | Same commands documented in README as local parity (`scripts/verify-policy`, trace + drift scripts, integrity/scan, syntax checks). | Developer intent must enable branch protection / required checks (operational control outside repo). |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | Tampering / elevation (merge without checks) | `.github/workflows/ci.yml`, branch protection | mitigate | Dedicated PR workflow runs deterministic gates; README instructs enabling required status checks for merges. | closed |
| T-05-02 | Integrity (traceability drift) | `.planning/requirements-phase-map.json`, `scripts/verify-requirements-trace.mjs` | mitigate | Committed map + CI verifier fails when `REQUIREMENTS.md` table diverges; roadmap/plan updates must update map in lockstep. | closed |
| T-05-03 | Availability / false positives (drift noise) | `scripts/verify-policy-drift.mjs` | mitigate | Drift script scoped to schema validation + existence of `entrypoints.gatedRelPaths`; avoids heavy heuristic drift. | closed |

*Disposition: mitigate — controls implemented in repository.*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

No accepted risks.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-29 | 3 | 3 | 0 | gsd-security-auditor (secure-phase workflow) |

---

## Evidence summary

| Threat | Verification |
|--------|----------------|
| T-05-01 | [`ci.yml`](../../../.github/workflows/ci.yml) defines `pull_request` job with verify-policy, trace, drift, integrity, scan, `bash -n`, `node --check`. README states required-check recommendation. |
| T-05-02 | [`verify-requirements-trace.mjs`](../../../scripts/verify-requirements-trace.mjs) loads map + parses table; [`requirements-phase-map.json`](../../requirements-phase-map.json) committed. |
| T-05-03 | [`verify-policy-drift.mjs`](../../../scripts/verify-policy-drift.mjs) uses `validatePolicyDocument` + existence checks for gated paths only. |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (none)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-29 — automated secure-phase pass with codebase evidence
