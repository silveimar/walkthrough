# Domain Pitfalls

**Domain:** Local-first security hardening for code/content analysis workflows
**Researched:** 2026-04-29

## Critical Pitfalls

Mistakes that commonly cause data leakage, false confidence, or expensive rewrites.

### Pitfall 1: "Local-first" stated but not enforced
**What goes wrong:** The project claims local-only handling, but scripts, docs, and workflows still permit accidental external data movement (for example, publishing from repo root or implicit remote calls).
**Why it happens:** Security intent is documented but not turned into executable controls and CI checks.
**Consequences:** Sensitive analyzed content is exposed publicly, and maintainers assume protections that do not actually exist.
**Prevention:** Convert policy to guardrails: explicit "local-only" rules in scripts/docs, publish-scope allowlists, and CI checks that fail on violations.
**Detection:** New workflow changes touch deployment paths or networked tooling without corresponding policy/check updates; "security by convention" wording appears without enforceable tests.

### Pitfall 2: Sensitive artifacts and logs retained by default
**What goes wrong:** Eval runs persist raw prompts, generated walkthrough HTML, and grading outputs that may include proprietary snippets.
**Why it happens:** Results directories are optimized for debugging and history, but retention/redaction boundaries are undefined.
**Consequences:** Local compromise, accidental sharing, or future commits expose sensitive material.
**Prevention:** Introduce retention tiers (ephemeral by default), redact before persistence, and gate long-term storage behind explicit opt-in.
**Detection:** `evals/results` grows unbounded, raw content appears in artifacts, or troubleshooting routinely requires reading unredacted outputs.

### Pitfall 3: Shell command composition for model/tool execution
**What goes wrong:** Security-sensitive paths are passed through shell strings (`execSync` pipelines), creating injection and quoting risk over time.
**Why it happens:** Shell pipelines are quick to implement and "work now," so they outlive prototype stages.
**Consequences:** Malformed inputs or future refactors can execute unintended commands; security review becomes brittle.
**Prevention:** Replace shell-string execution with argument-array invocation (`spawn`/`execFile`) and explicit stdin piping.
**Detection:** Any grader/runtime path uses `"cmd | cmd"` composition, string interpolation into command shells, or ad-hoc quoting logic.

### Pitfall 4: Public publishing coupled to repository root
**What goes wrong:** Static publishing deploys too broad a path, so non-demo files can become public if committed.
**Why it happens:** Initial deployment convenience (deploy ".") is not revisited during hardening.
**Consequences:** Private planning notes, eval data, or future sensitive assets are exposed via static hosting.
**Prevention:** Publish only a dedicated directory (for example, `examples/`), add pre-deploy denylist checks, and require review for workflow-scope changes.
**Detection:** Deploy workflow references repository root or broad globs; no artifact manifest/allowlist is present.

### Pitfall 5: Contract drift between security policy and graders
**What goes wrong:** Output/security requirements diverge across `skill.md`, references, and grader logic.
**Why it happens:** Rules are duplicated in multiple files and updated manually.
**Consequences:** "Passing" evals no longer prove secure behavior; regressions ship undetected.
**Prevention:** Centralize contract into one machine-readable source and generate/validate checks from it.
**Detection:** Security-related rule changes land in one file without synchronized updates in graders and references.

## Moderate Pitfalls

### Pitfall 1: Portability assumptions break secure defaults
**What goes wrong:** Non-portable shell behavior causes skipped or failed checks on some developer machines.
**Prevention:** Keep scripts POSIX-compatible where possible and run shell lint/compat checks in CI.

### Pitfall 2: Over-reliance on nondeterministic LLM grading
**What goes wrong:** Security regressions are hidden by rubric variance or model availability issues.
**Prevention:** Keep hard security gates deterministic; treat LLM grading as supplemental, not authoritative.

### Pitfall 3: CDN dependency drift for generated artifacts
**What goes wrong:** Unpinned/remote runtime dependencies change behavior without repository changes.
**Prevention:** Pin versions consistently and provide an offline/vendored mode for long-lived artifacts.

## Minor Pitfalls

### Pitfall 1: Security changes without threat-model updates
**What goes wrong:** Controls are added, but assumptions and trust boundaries are not documented.
**Prevention:** Require threat-model delta notes for every security-impacting change.

### Pitfall 2: Ambiguous ownership of hardening checks
**What goes wrong:** Everyone assumes someone else maintains security gates.
**Prevention:** Assign explicit owners and review cadence for each safeguard.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Warning Signs | Mitigation |
|-------------|----------------|---------------|------------|
| Phase 1 - Security baseline and policy codification | "Local-first" is aspirational only | Policy language exists but no failing checks enforce it | Convert policy to executable controls; add CI gate for policy violations |
| Phase 2 - Data handling (retention, redaction, boundaries) | Sensitive eval artifacts persist by default | Large timestamped result directories; raw snippets in logs/artifacts | Default to ephemeral storage, implement redaction pipeline, enforce retention cleanup |
| Phase 3 - Eval harness/runtime hardening | Shell injection and command execution risk | `execSync` shell strings and interpolation for tool/model calls | Migrate to `spawn`/`execFile` with arg arrays and direct stdin |
| Phase 4 - Publishing and external surface control | Over-broad static deployment scope | Workflow deploys `.` or wide globs without manifest | Restrict artifact path, add denylist/allowlist pre-deploy checks |
| Phase 5 - Contract and test hardening | Security checks drift from spec | Security rule updated in skill/reference but not grader | Introduce single contract source; generate/check deterministic security assertions |
| Phase 6 - CI reliability and portability | Security checks silently skip on some environments | GNU/BSD command mismatches and flaky runner behavior | Enforce shell portability, smoke-run subset in CI on every PR |
| Phase 7 - Ongoing operations and audits | Hardening decays post-launch | Controls become stale; no periodic audit evidence | Schedule recurring security audits and drift checks with ownership |

## Sources

- Internal project context: `.planning/PROJECT.md` (HIGH confidence for project-specific goals/constraints)
- Internal risk inventory: `.planning/codebase/CONCERNS.md` (HIGH confidence for repository-specific failure modes)
- Internal architecture/testing references: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/TESTING.md` (HIGH confidence for workflow mapping)

