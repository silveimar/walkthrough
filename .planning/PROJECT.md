# Walkthrough Skill Local Security Hardening

## What this is

This project hardens the existing walkthrough-skill repository for secure, local-first use while preserving its current authoring and evaluation workflow. It keeps skill generation and evaluation practical for local development, but adds stronger guardrails to protect analyzed code/content and reduce leakage risk. The primary users are maintainers running the skill and eval harness on their own machines.

## Core value

Generate and evaluate walkthrough artifacts locally with strong protections for repository and analyzed content, without degrading developer velocity.

## Current state (v1.0 shipped)

- **Milestone v1.0** is **complete** and archived under `.planning/milestones/v1.0-*.md` (2026-04-29).
- Hardening is **policy-driven** (`security/security-policy.json`), **verified** locally and in CI, with **governed** eval outputs (redaction, retention, integrity sidecars, PR checks).
- **Next step:** define **v2** via `/gsd-new-milestone` (requirements, research, roadmap).

## Requirements

### Validated (v1.0)

- ✓ Skill-driven walkthrough generation from prompt triggers — existing
- ✓ Local eval pipeline with deterministic and rubric grading — existing
- ✓ Static example artifact and published documentation workflow — existing
- ✓ Local-only protection model is explicit and enforceable (policy + policy-runtime + eval gates)
- ✓ Analyzed content handling: redaction, retention, protected eval results paths
- ✓ Publish integrity and scoped static deploy; governance CI and traceability

### Active (v2 — to be defined)

- [ ] _None until `/gsd-new-milestone` — see candidate themes below_

### Candidate themes (from prior “v2 / Advanced Hardening” ideas)

- Offline / vendored dependencies for reproducible isolated operation (ADV-01)
- Signed provenance attestations (ADV-02)
- Cross-platform sandbox parity (ADV-03)

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

| Decision | Rationale | Outcome (v1.0) |
|----------|-----------|----------------|
| Prioritize secure local usage | User goal: local-only safety, protect analyzed content | ✓ Policy + runtime + data protection delivered |
| Keep `.planning` in git | Preserve planning and audit history | ✓ Tracked through v1.0 close |
| Balanced planning profile (research, plan-check, verifier) | Rigor for security-sensitive work | ✓ Used across phases |

## Evolution

This document evolves at phase and milestone boundaries. **v1.0** is closed; the next update should follow `/gsd-new-milestone`.

---
*Last updated: 2026-04-29 after v1.0 milestone completion*
