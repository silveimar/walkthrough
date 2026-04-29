# Project Research Summary

**Project:** Walkthrough Skill Local Security Hardening
**Domain:** Local-first security hardening for CLI walkthrough generation and evaluation
**Researched:** 2026-04-29
**Confidence:** HIGH

## Executive Summary

This project is a local-first security hardening effort for a CLI-centric generation and evaluation workflow that handles potentially sensitive source and prompt data. Expert implementations in this space do not treat "local" as inherently trusted: they separate policy decisions from runtime execution, require redaction before persistence, and continuously enforce controls in CI so security does not rely on maintainer discipline.

The recommended approach is to build an enforceable policy shell first, then harden data handling, runtime execution, and publishing surfaces in that order. Concretely: standardize on Node 24 + pnpm 11, enforce local security gates (gitleaks, semgrep, osv-scanner), add mandatory redaction and retention controls, and use deterministic metadata sidecars to make grading and provenance stable and auditable.

The biggest risks are policy drift (rules in docs but not in code), sensitive artifact retention, and accidental disclosure via broad publish paths or shell-injection-prone execution wrappers. Mitigation is clear: machine-readable policy contracts, fail-closed enforcement, dedicated publish directories with denylist checks, and deterministic security checks that gate every PR.

## Key Findings

### Recommended Stack

The stack should optimize for secure defaults, reproducibility, and local auditability. Node 24 LTS and pnpm 11 provide a modern baseline with tighter dependency hygiene, while local scanners and SBOM tooling provide layered visibility across secrets, code risks, and vulnerable dependencies.

**Core technologies:**
- Node.js 24 LTS: primary runtime for tooling and graders — stable LTS with current security patch cadence.
- pnpm 11: package management and lockfile authority — stronger supply-chain defaults and workspace hygiene.
- gitleaks + Semgrep CLI + OSV-Scanner: secret/SAST/dependency checks — practical local-first guardrail trio.
- Syft + Grype: SBOM generation and vulnerability matching — auditable artifact inventory plus risk triage.
- sops + age: secret-at-rest workflow — encrypted, reviewable config management without plaintext secrets.
- cosign: artifact signing and verification — integrity/provenance control before distribution.

### Expected Features

Research converges on secure-by-default workflow controls as MVP, not optional add-ons. The product must first prevent accidental leakage paths, then add quality-of-life differentiators for maintainers.

**Must have (table stakes):**
- Explicit local-only execution mode with deny-by-default egress.
- Sensitive data redaction for prompts, logs, reports, and persisted outputs.
- Retention controls with bounded lifecycle (TTL/purge, ephemeral defaults).
- Secret detection preflight before publish/deploy, plus CI smoke enforcement.
- Hardened process execution (`spawn`/`execFile` over shell string pipelines).

**Should have (competitive):**
- Policy-as-code security profiles (`strict`/`balanced`/`dev`) with explicit control deltas.
- Deterministic `metadata.json` sidecar for output contract stability and grader reliability.
- Security UX guardrails for unsafe config detection and guided secure defaults.

**Defer (v2+):**
- Full offline vendoring mode for all runtime assets.
- Full local provenance attestations beyond initial sidecar and checksum model.
- Heavy enterprise integrations (SIEM/SOC) before local controls are mature.

### Architecture Approach

Adopt a three-plane model: **Control Plane** (policy engine/store), **Data Plane** (generation + evaluation runtimes), and **Evidence Plane** (sanitized logs + audit ledger). Every run passes through a policy enforcement layer that classifies data first, enforces least privilege and egress controls, and requires redaction before any write. This creates a fail-closed pipeline where local execution remains constrained, observable, and testable.

**Major components:**
1. Policy Engine + Policy Store — evaluates allow/deny/redact decisions from versioned policy.
2. Enforcement Layer — mandatory gateway for file, process, and network controls.
3. Generation and Evaluation Runtimes — execute work only through enforcement contracts.
4. Redaction Layer — mandatory sanitization before logs, artifacts, and reports.
5. Encrypted Artifact Store + Retention Manager — controlled persistence and lifecycle.
6. Tamper-evident Audit Ledger + Verification Gate — forensic trail and regression prevention.

### Critical Pitfalls

1. **Local-first without enforcement** — treat policy as executable controls with CI fail gates, not documentation.
2. **Unbounded sensitive artifact retention** — default to ephemeral storage and redact before persistence.
3. **Shell command composition in security paths** — replace with `spawn`/`execFile` argument arrays.
4. **Publishing from broad repository scope** — restrict deploy to dedicated output path with denylist/allowlist preflight.
5. **Contract drift across docs/graders** — centralize security/output contract in one machine-readable source.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Security Contract and Policy Foundation
**Rationale:** Every later safeguard depends on explicit trust boundaries and machine-readable policy.
**Delivers:** Policy schema (classification, retention, redaction, egress), boundary definitions, initial threat model.
**Addresses:** Local-only execution baseline and contract-drift risk.
**Avoids:** "Aspirational security" with no enforceable checks.

### Phase 2: Enforcement Gateway and Runtime Hardening
**Rationale:** Controls must mediate existing generation/eval flows before feature expansion.
**Delivers:** Single policy-enforced entrypoint, deny-by-default egress, path/tool allowlists, shell-exec removal.
**Uses:** Node 24, pnpm 11, semgrep and secret-scan gates.
**Implements:** Enforcement Layer and least-privilege execution patterns.

### Phase 3: Redaction and Retention Pipeline
**Rationale:** Data leakage risk is highest at persistence and logging boundaries.
**Delivers:** Classification-first handling, mandatory redaction stage, retention tiers, TTL/purge workflows.
**Addresses:** Table-stake redaction and artifact lifecycle controls.
**Avoids:** Sensitive artifact accumulation and log leakage.

### Phase 4: Artifact Integrity and Controlled Publishing
**Rationale:** Once storage is controlled, integrity and external-surface controls become reliable.
**Delivers:** Deterministic `metadata.json`, checksums, dedicated publish directory, deploy preflight denylist/allowlist.
**Uses:** Syft/Grype for artifact visibility and risk checks, cosign for signing path.
**Implements:** Evidence-plane integrity patterns.

### Phase 5: Continuous Verification and Operational Hardening
**Rationale:** Security posture decays without automation, ownership, and recurring audits.
**Delivers:** CI security contract suite, portability checks, recurring audit cadence, ownership matrix.
**Addresses:** Regression prevention and long-term maintainability.
**Avoids:** Silent control drift and environment-specific skipped checks.

### Phase Ordering Rationale

- Policy must precede implementation so enforcement and tests are generated from one source of truth.
- Runtime hardening must land before adding higher-order features to prevent new leakage paths.
- Redaction/retention should come before publish and scale-up so stored outputs are already controlled.
- Verification gates should be in place before iterative expansion to keep the posture fail-closed.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Artifact Integrity and Controlled Publishing):** cosign adoption model, key management ergonomics, and right-sized provenance scope.
- **Phase 5 (Continuous Verification and Operations):** cross-platform CI portability strategy and durable audit ownership model.
- **Future offline vendoring phase:** dependency mirror/update strategy and maintenance burden modeling.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Security Contract and Policy Foundation):** well-documented zero-trust/policy-engine patterns.
- **Phase 2 (Enforcement Gateway and Runtime Hardening):** established secure process execution and deny-by-default controls.
- **Phase 3 (Redaction and Retention Pipeline):** mature OWASP-backed logging/redaction/retention guidance.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Backed by official release/docs references for Node, pnpm, and security tooling versions. |
| Features | HIGH | Grounded in OWASP/CISA guidance and reinforced by repository-specific concern inventory. |
| Architecture | HIGH | Strong alignment with NIST zero-trust component model and clear local adaptation. |
| Pitfalls | HIGH | Directly mapped to observed repo risks and common failure modes in local security workflows. |

**Overall confidence:** HIGH

### Gaps to Address

- **Policy schema granularity:** finalize exact data classification taxonomy and retention classes during phase planning.
- **Key management ergonomics:** choose practical local signing/encryption key lifecycle that maintainers can operate daily.
- **Cross-platform enforcement behavior:** validate parity across macOS/Linux shell/runtime differences before strict gating.
- **Provenance depth for MVP:** define minimum viable attestation fields to avoid over-scoping phase 4.

## Sources

### Primary (HIGH confidence)
- Node.js releases — runtime support policy and LTS cadence: https://nodejs.org/en/about/releases
- pnpm v11 release notes — security/supply-chain defaults: https://github.com/pnpm/pnpm/releases/tag/v11.0.0
- OWASP Logging Cheat Sheet — redaction and safe logging requirements: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- NIST SP 800-207 — zero-trust architecture model: https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf
- OSV-Scanner release docs, Semgrep CLI docs, gitleaks/syft/grype/sops/age/cosign official releases (tool validation)
- Project-local evidence: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/TESTING.md`

### Secondary (MEDIUM confidence)
- OWASP ASVS logging controls interpretation for implementation detail mapping: https://github.com/OWASP/ASVS
- CISA Secure by Design/Default guidance for secure-default posture and adoption strategy: https://www.cisa.gov/resources-tools/resources/secure-by-design-and-default

### Tertiary (LOW confidence)
- No low-confidence external source was required for core conclusions; deferred provenance/offline-mode specifics need additional implementation-stage validation.

---
*Research completed: 2026-04-29*
*Ready for roadmap: yes*
