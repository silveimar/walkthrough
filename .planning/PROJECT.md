# Walkthrough Skill Local Security Hardening

## What This Is

This project hardens the existing walkthrough-skill repository for secure, local-first use while preserving its current authoring and evaluation workflow. It keeps skill generation and evaluation practical for local development, but adds stronger guardrails to protect analyzed code/content and reduce leakage risk. The primary users are maintainers running the skill and eval harness on their own machines.

## Core Value

Generate and evaluate walkthrough artifacts locally with strong protections for repository and analyzed content, without degrading developer velocity.

## Requirements

### Validated

- ✓ Skill-driven walkthrough generation from prompt triggers — existing
- ✓ Local eval pipeline with deterministic and rubric grading — existing
- ✓ Static example artifact and published documentation workflow — existing
- ✓ Local-only protection model is explicit and enforceable across skill/eval docs and scripts (Phases 1–2; policy + runtime gates)
- ✓ Analyzed content handling is hardened — retention, redaction, access boundaries (Phase 3)
- ✓ Publish surfaces integrity-gated and scoped (Phase 4)
- ✓ CI governance: deterministic checks on PRs, requirement traceability, policy drift detection (Phase 5)

### Active

- _(none — v1.0 milestone scope complete)_

### Out of Scope

- Cloud multi-tenant deployment of walkthrough generation — conflicts with local-security focus
- Building a separate SaaS product around this repository — outside current project goal

## Context

- Current architecture is specification-driven (`skills/walkthrough/*`) with a local eval harness (`evals/run.sh`, `evals/graders/*`).
- The repository already contains a fresh codebase map under `.planning/codebase/` that documents stack, architecture, testing posture, and concerns.
- Existing capabilities are mostly local/CLI-oriented, which makes local-first hardening feasible without large architectural rewrites.

## Constraints

- **Security**: Protect analyzed code/content at rest and in generated artifacts/logs — prevents accidental disclosure.
- **Local-first**: Prefer execution and storage paths that stay on developer machines — minimize external data exposure.
- **Compatibility**: Preserve current skill and eval behavior where possible — avoid breaking maintainers' workflow.
- **Scope**: Focus on security/privacy hardening and project-quality improvements, not net-new product domains.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prioritize secure local usage over broader deployment concerns | User goal explicitly emphasizes local-only safety and protecting analyzed content | — Pending |
| Keep `.planning` tracked in git for this repository | User selected git tracking despite local-first focus to preserve planning history | — Pending |
| Use balanced planning profile with research/plan-check/verifier enabled | Improves planning rigor for security-sensitive work | — Pending |

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
*Last updated: 2026-04-29 after Phase 5 / milestone v1.0 completion*
