<!-- GSD:project-start source:PROJECT.md -->
## Project

**Walkthrough Skill Local Security Hardening**

This project hardens the existing walkthrough-skill repository for secure, local-first use while preserving its current authoring and evaluation workflow. It keeps skill generation and evaluation practical for local development, but adds stronger guardrails to protect analyzed code/content and reduce leakage risk. The primary users are maintainers running the skill and eval harness on their own machines.

**Core Value:** Generate and evaluate walkthrough artifacts locally with strong protections for repository and analyzed content, without degrading developer velocity.

### Constraints

- **Security**: Protect analyzed code/content at rest and in generated artifacts/logs — prevents accidental disclosure.
- **Eval artifacts**: Canonical tree `evals/results/` per `security/security-policy.json` `dataProtection`; redaction on persisted JSON; TTL cleanup via `scripts/cleanup-eval-results.mjs`.
- **Local-first**: Prefer execution and storage paths that stay on developer machines — minimize external data exposure.
- **Compatibility**: Preserve current skill and eval behavior where possible — avoid breaking maintainers' workflow.
- **Scope**: Focus on security/privacy hardening and project-quality improvements, not net-new product domains.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- JavaScript (ESM, `.mjs`) - Eval and grading scripts in `evals/report.mjs`, `evals/graders/deterministic.mjs`, and `evals/graders/llm-rubric.mjs`
- Markdown - Skill and reference definitions in `skills/walkthrough/skill.md` and `skills/walkthrough/references/html-patterns.md`
- Bash - Eval orchestration in `evals/run.sh`
- HTML/CSS - Generated walkthrough artifact pattern and example in `examples/walkthrough-how-it-works.html`
- YAML - CI/CD workflow in `.github/workflows/static.yml`
## Runtime
- Node.js >= 18 (explicit requirement in `README.md` and Node shebangs in `.mjs` scripts)
- Bash shell runtime for eval execution (`evals/run.sh`)
- npm/npx-based tooling (`npx skills add ...` in `README.md`)
- Lockfile: **`package-lock.json`** at repo root (pins npm packages used to regenerate `vendor/walkthrough-viewer/` via `npm ci` + `scripts/sync-walkthrough-vendor.mjs`)
## Frameworks
- Claude Code Skill format - Skill metadata/workflow in `skills/walkthrough/skill.md`
- Static HTML app architecture (no bundler) - Browser-executed module script pattern in `skills/walkthrough/references/html-patterns.md`
- Custom eval harness - Prompt runner in `evals/run.sh` with result aggregation in `evals/report.mjs`
- Deterministic grader - Structural checks in `evals/graders/deterministic.mjs`
- LLM rubric grader - Quality scoring in `evals/graders/llm-rubric.mjs` against `evals/graders/rubric.md`
- No build pipeline for generated output (self-contained HTML noted in `README.md`)
- GitHub Actions workflow for static deployment in `.github/workflows/static.yml`
## Key Dependencies
- React 18 UMD - UI rendering in generated walkthrough HTML (`examples/walkthrough-how-it-works.html`, `skills/walkthrough/references/html-patterns.md`)
- ReactDOM 18 UMD - Client rendering bootstrap for walkthrough app (`examples/walkthrough-how-it-works.html`)
- Mermaid 11 - Diagram rendering (`examples/walkthrough-how-it-works.html`)
- Shiki (ESM, 3.22.0 pattern) - Syntax highlighting (`examples/walkthrough-how-it-works.html`, `skills/walkthrough/references/html-patterns.md`)
- Tailwind CSS CDN - Utility styling (`examples/walkthrough-how-it-works.html`)
- Claude CLI (`claude -p`) - Prompt execution and grading model calls in `evals/run.sh` and `evals/graders/llm-rubric.mjs`
- GitHub Actions Pages actions - Deployment in `.github/workflows/static.yml`
## Configuration
- Eval runtime knobs via env vars: `EVAL_MODEL`, `EVAL_MAX_BUDGET` in `evals/run.sh`
- Skill-install workflow uses `npx skills add ...` in `README.md`
- Static deploy workflow config: `.github/workflows/static.yml`
- No TypeScript/build transpiler config detected (`tsconfig.json` not present)
## Platform Requirements
- Node.js >= 18 (`README.md`)
- Authenticated Claude CLI (`README.md`, eval flow in `evals/run.sh`)
- Bash environment; optional `tmux` when `--tmux` is used in `evals/run.sh`
- GitHub Pages static hosting via `.github/workflows/static.yml`
- Browser runtime with CDN access for generated walkthrough dependencies (`examples/walkthrough-how-it-works.html`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Kebab-case for multi-word JavaScript modules and docs (for example `evals/graders/llm-rubric.mjs`, `skills/walkthrough/references/html-patterns.md`).
- Lowercase short names for entry scripts (`evals/run.sh`, `evals/report.mjs`).
- Lowercase `skill.md` convention for skill definitions (`skills/walkthrough/skill.md`, `.claude/skills/publish-skill/skill.md`).
- camelCase in JavaScript (`extractDataSections`, `check`) in `evals/graders/llm-rubric.mjs` and `evals/graders/deterministic.mjs`.
- JavaScript constants use camelCase (`resultsDir`, `jsonSchema`) in `evals/report.mjs`.
- Bash environment-derived variables use uppercase snake case (`PROJECT_DIR`, `RESULTS_DIR`, `SKIP_LLM`) in `evals/run.sh`.
- Type declarations are not used in this repository (no TypeScript source files detected).
## Code Style
- Formatter config: Not detected (`.prettierrc*`, `.editorconfig`, `biome.json` not present).
- Observed style in JS/MJS files (`evals/report.mjs`, `evals/graders/*.mjs`): 2-space indentation, semicolons, double-quoted strings.
- Observed style in shell (`evals/run.sh`): strict quoting for variables, `[[ ... ]]` tests, explicit guard branches.
- Linter config: Not detected (`eslint.config.*`, `.eslintrc*` not present).
- Quality is enforced by script-level guard clauses and deterministic checks instead of static lint rules.
## Import Organization
- Not detected; all imports use Node built-ins or relative/constructed filesystem paths.
## Error Handling
- Fail-fast argument validation with usage output and `process.exit(1)` in `evals/report.mjs`, `evals/graders/deterministic.mjs`, and `evals/graders/llm-rubric.mjs`.
- Shell flag validation with explicit unknown-flag exit in `evals/run.sh`.
- Graceful fallback objects on grading failure in `evals/graders/llm-rubric.mjs`.
## Logging
- Human-readable progress markers in shell (`=== Walkthrough Skill Eval ===`, per-prompt status) in `evals/run.sh`.
- Structured summary table output and JSON emission in `evals/report.mjs`.
- `console.error` for usage and failure paths in graders.
## Comments
- File headers explain script purpose and usage (`evals/run.sh`, `evals/report.mjs`, `evals/graders/*.mjs`).
- Section comments split major phases (`# tmux setup`, `// Tier 1: File level`, `// Read deterministic results`).
- JSDoc-style multi-line headers are used for Node scripts (`evals/report.mjs`, `evals/graders/*.mjs`).
- Function-level JSDoc is limited; modules rely on top-of-file docs and inline section comments.
## Function Design
- Utility functions are kept focused (`check`, `extractDataSections`) while orchestration remains in top-level script flow.
- CLI entrypoints parse positional args, then validate before processing (`process.argv` patterns across `evals/*.mjs`).
- Helper functions return plain objects/strings; scripts persist results to disk (`deterministic.json`, `summary.json`) instead of returning values to callers.
## Module Design
- Not used; modules are executable scripts with top-level side effects (`#!/usr/bin/env node`, `#!/usr/bin/env bash`).
- Not used.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| Skill contract | Defines trigger conditions and mandatory generation workflow | `skills/walkthrough/skill.md` |
| HTML reference | Defines required rendering architecture and UI behavior for generated files | `skills/walkthrough/references/html-patterns.md` |
| Eval orchestrator | Runs prompt cases, prepares isolated temp workspace, invokes Claude, collects outputs | `evals/run.sh` |
| Deterministic grader | Enforces structural guarantees in generated HTML (CDNs, nodes, handlers, dark mode) | `evals/graders/deterministic.mjs` |
| LLM grader | Applies qualitative rubric scoring through schema-constrained Claude evaluation | `evals/graders/llm-rubric.mjs` |
| Report aggregator | Combines per-prompt grading into `summary.json` and table output | `evals/report.mjs` |
| Example artifact | Demonstrates expected generated output shape and client runtime | `examples/walkthrough-how-it-works.html` |
## Pattern Overview
- Authoring boundary is declarative Markdown (`skill.md` + `html-patterns.md`) rather than source-code library APIs.
- Execution boundary is externalized to `claude -p` calls from shell scripts in isolated temporary copies (`evals/run.sh`).
- Quality boundary is split into deterministic checks and rubric-based checks before report aggregation.
## Layers
- Purpose: Define what to generate and which constraints are non-negotiable.
- Location: `skills/walkthrough/`
- Contains: Trigger rules, workflow phases, Mermaid/HTML requirements.
- Depends on: Claude skill runtime conventions.
- Used by: Claude runtime and eval harness copies in `evals/run.sh`.
- Purpose: Execute prompt-to-output transformation.
- Location: `evals/run.sh` (invocation), `claude -p` process.
- Contains: Prompt iteration, temp-workspace setup, model/budget flags, artifact capture.
- Depends on: Local CLI tools (`claude`, `node`, optional `tmux`).
- Used by: Manual eval runs and CI-style local verification workflows.
- Purpose: Validate generated files for correctness and quality.
- Location: `evals/graders/`, `evals/report.mjs`
- Contains: Rule checks, schema-constrained rubric grading, summary synthesis.
- Depends on: Generated `walkthrough-*.html` artifacts.
- Used by: `evals/run.sh` completion pipeline.
- Purpose: Serve static examples/docs for consumers.
- Location: `.github/workflows/static.yml`, `examples/`, `README.md`
- Contains: GitHub Pages deployment and public example page.
- Depends on: Repository content on `main`.
- Used by: External readers of demo output.
## Data Flow
### Primary Request Path
### Generated Viewer Runtime
- Eval pipeline state is file-system based (timestamped directories under `evals/results/`).
- Viewer state is client-side React state and refs inside generated HTML (`activeId`, pan/zoom refs).
## Key Abstractions
- Purpose: Canonical behavior spec for all walkthrough generation.
- Examples: `skills/walkthrough/skill.md`, `README.md`
- Pattern: Frontmatter + procedural markdown directives.
- Purpose: Enforced output shape for generated HTML.
- Examples: `skills/walkthrough/references/html-patterns.md`, `evals/graders/deterministic.mjs`
- Pattern: Reference template + checker parity.
- Purpose: Persisted scoring evidence per prompt run.
- Examples: `evals/results/<timestamp>/<prompt-id>/deterministic.json`, `evals/results/<timestamp>/summary.json` (generated by scripts).
- Pattern: Prompt-scoped JSON plus rollup summary.
## Entry Points
- Location: `skills/walkthrough/skill.md`
- Triggers: User prompts matching walkthrough phrases or `$walkthrough`.
- Responsibilities: Produce one self-contained walkthrough HTML artifact.
- Location: `evals/run.sh`
- Triggers: `bash evals/run.sh` (plus flags).
- Responsibilities: Execute matrix, grade outputs, write results.
- Location: `.github/workflows/static.yml`
- Triggers: Push to `main` or manual workflow dispatch.
- Responsibilities: Publish repository content to GitHub Pages.
## Architectural Constraints
- **Threading:** Script orchestration is sequential bash + single-process Node scripts; optional parallel visibility only via tmux windows in `evals/run.sh`.
- **Global state:** Browser runtime relies on global callback (`window.nodeClickHandler`) pattern described in `skills/walkthrough/references/html-patterns.md`.
- **Circular imports:** Not applicable; no internal multi-file JS module graph in repository source.
- **Runtime dependency:** `claude` CLI availability is mandatory for evals in `evals/run.sh` and `evals/graders/llm-rubric.mjs`.
## Anti-Patterns
### Shell-Embedded Search Logic
### Duplicated Output Contract Sources
## Error Handling
- Shell runner continues per-prompt execution even when `claude -p` exits non-zero in `evals/run.sh`.
- LLM grader writes structured fallback JSON on failure instead of aborting run in `evals/graders/llm-rubric.mjs`.
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| publish-skill | Creates a new GitHub repository for a Claude Code skill with proper README and directory structure. Use when you want to package and publish a skill so others can install it. Triggers on "publish skill", "publish this skill", "create skill repo", "package skill", "share this skill". | `.claude/skills/publish-skill/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
