# Roadmap: Walkthrough Skill Local Security Hardening

## Overview

This roadmap delivers a local-first hardening path where policy becomes enforceable, runtime execution becomes constrained and fail-closed, sensitive data is protected by default, publish surfaces are integrity-gated, and recurring verification prevents drift over time.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Policy Contract Foundation** - Establish one machine-readable hardening policy that defines local-only and security contract behavior.
- [x] **Phase 2: Runtime Enforcement Hardening** - Route execution through constrained, safe runtime paths with startup guardrails.
- [ ] **Phase 3: Data Redaction and Retention Controls** - Enforce safe handling, storage boundaries, and lifecycle cleanup for sensitive artifacts.
- [ ] **Phase 4: Artifact Integrity and Safe Publishing** - Add deterministic integrity evidence and explicit publish allow-scopes.
- [ ] **Phase 5: Continuous Governance and Drift Detection** - Keep controls verifiable in local and CI workflows with ongoing drift checks.

## Phase Details

### Phase 1: Policy Contract Foundation
**Goal**: Maintainers can define and enforce local-only security behavior from one authoritative policy contract.
**Depends on**: Nothing (first phase)
**Requirements**: POL-01, POL-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can enable a local-only mode that blocks unintended network egress by default.
  2. Maintainer can point scripts and documentation to one machine-readable policy source for hardening behavior.
  3. Policy-driven hardening behavior can be verified locally with consistent results.
**Plans**: 3 plans

Plans:
- [x] `01-01-PLAN.md` — Canonical policy JSON, schema, verify-policy CLI (`scripts/verify-policy`)
- [x] `01-02-PLAN.md` — Gate `evals/run.sh`, graders, and report via `security/policy-runtime.mjs`
- [x] `01-03-PLAN.md` — CI policy gate in `.github/workflows/static.yml`, README and skill references

### Phase 2: Runtime Enforcement Hardening
**Goal**: Maintainers can run generation/eval through secure execution paths that reject unsafe runtime behavior.
**Depends on**: Phase 1
**Requirements**: RUN-01, RUN-02, RUN-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can execute eval flows without shell-string interpolation for untrusted inputs.
  2. Maintainer can run commands only within constrained contexts using explicit file/process allowlists.
  3. Insecure runtime configuration is detected at startup and execution fails fast with clear errors.
**Plans**: 3 plans (`02-01`..`02-03`)

### Phase 3: Data Redaction and Retention Controls
**Goal**: Maintainers can prevent sensitive data leakage in logs/artifacts while enforcing bounded retention and protected local storage.
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. Sensitive tokens, paths, and protected content are automatically redacted from logs and persisted outputs.
  2. Generated artifacts follow configurable retention TTL rules and are cleaned up automatically when expired.
  3. Sensitive outputs are stored only in protected local locations with documented access boundaries.
**Plans**: TBD

### Phase 4: Artifact Integrity and Safe Publishing
**Goal**: Maintainers can prove artifact integrity and publish only explicitly approved outputs.
**Depends on**: Phase 3
**Requirements**: INTG-01, INTG-02, INTG-03
**Success Criteria** (what must be TRUE):
  1. Generated artifacts include deterministic metadata sidecars that are reproducible across equivalent runs.
  2. Maintainer can produce and verify integrity signals (hash/SBOM/vulnerability status) before release.
  3. Publish operations fail unless files are within explicitly approved scopes and pass secret-leak gates.
**Plans**: TBD

### Phase 5: Continuous Governance and Drift Detection
**Goal**: Maintainers can continuously verify security posture and trace requirement progress without manual reconciliation.
**Depends on**: Phase 4
**Requirements**: POL-03, GOV-01, GOV-02, GOV-03
**Success Criteria** (what must be TRUE):
  1. Deterministic security checks run the same way locally and in CI with consistent pass/fail outcomes.
  2. Requirement-to-phase status is trackable through an updated traceability table without manual guessing.
  3. Recurring hardening checks detect drift between policy, documentation, and graders and fail on mismatch.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 2 → 2.1 → 2.2 → 3 → 3.1 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Policy Contract Foundation | 3/3 | Complete | 2026-04-29 |
| 2. Runtime Enforcement Hardening | 3/3 | Complete | 2026-04-29 |
| 3. Data Redaction and Retention Controls | 0/TBD | Not started | - |
| 4. Artifact Integrity and Safe Publishing | 0/TBD | Not started | - |
| 5. Continuous Governance and Drift Detection | 0/TBD | Not started | - |
