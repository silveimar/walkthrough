# Walkthrough Skill Local Security Hardening

## What this is

This project hardens the existing walkthrough-skill repository for secure, local-first use while preserving its current authoring and evaluation workflow. It keeps skill generation and evaluation practical for local development, but adds stronger guardrails to protect analyzed code/content and reduce leakage risk. The primary users are maintainers running the skill and eval harness on their own machines.

## Core value

Generate and evaluate walkthrough artifacts locally with strong protections for repository and analyzed content, without degrading developer velocity.

## Current state

- **Milestone v1.0** — shipped and archived (2026-04-29).
- **Milestone v2.0** — shipped and archived (2026-04-29): offline-capable vendor layout and dual-mode HTML, cross-platform path/temp parity and CI smoke, manifest-first signed provenance with local verify and optional CI.
- Hardening remains **policy-driven** (`security/security-policy.json`), **verified** locally and in CI, with **governed** eval outputs and provenance aligned to data-protection rules.
- **Current focus:** Maintenance and optional next milestone when scope expands (see `.planning/ROADMAP.md`).

## Requirements

### Validated (v1.0)

- ✓ Skill-driven walkthrough generation from prompt triggers — existing
- ✓ Local eval pipeline with deterministic and rubric grading — existing
- ✓ Static example artifact and published documentation workflow — existing
- ✓ Local-only protection model is explicit and enforceable (policy + policy-runtime + eval gates)
- ✓ Analyzed content handling: redaction, retention, protected eval results paths
- ✓ Publish integrity and scoped static deploy; governance CI and traceability

### Validated (v2.0)

- ✓ **ADV-01** — Offline / vendored dependencies and dual-mode HTML with policy-controlled CDN vs vendor contract — Phases 6
- ✓ **ADV-02** — Signed provenance: manifest-first scope, local sign/verify, optional CI verification — Phase 8
- ✓ **ADV-03** — Cross-platform sandbox and path/temp parity across documented matrix — Phase 7

### Active (next milestone)

- _(None — define with `/gsd-new-milestone` when scope warrants a new version.)_

### Out of scope

- Cloud multi-tenant deployment of walkthrough generation — conflicts with local-security focus
- Building a separate SaaS product around this repository — outside current project goal

## Context

- Architecture is specification-driven (`skills/walkthrough/*`) with a local eval harness (`evals/run.sh`, `evals/graders/*`).
- Codebase documentation lives in `.planning/codebase/`.
- **Milestone record:** `.planning/MILESTONES.md` and `.planning/RETROSPECTIVE.md`.

## Constraints

- **Security:** Protect analyzed code/content at rest and in generated artifacts/logs.
- **Local-first:** Prefer execution and storage on developer machines.
- **Compatibility:** Preserve skill and eval behavior where possible.
- **Scope:** Hardening and project quality, not unrelated product domains.

## Key decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize secure local usage | User goal: local-only safety, protect analyzed content | ✓ Policy + runtime + data protection (v1.0); extended with vendor/provenance/parity (v2.0) |
| Keep `.planning` in git | Preserve planning and audit history | ✓ Tracked through v1.0 and v2.0 |
| Balanced planning profile (research, plan-check, verifier) | Rigor for security-sensitive work | ✓ Used across phases |
| Manifest-first provenance + data protection alignment | Avoid signing or persisting sensitive eval material | ✓ v2.0 provenance scripts and CI path |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 2026-04-29 after v2.0 milestone (Advanced Local Hardening) shipped*
