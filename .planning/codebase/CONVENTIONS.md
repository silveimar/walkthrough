# Coding Conventions

**Analysis Date:** 2026-04-29

## Naming Patterns

**Files:**
- Kebab-case for multi-word JavaScript modules and docs (for example `evals/graders/llm-rubric.mjs`, `skills/walkthrough/references/html-patterns.md`).
- Lowercase short names for entry scripts (`evals/run.sh`, `evals/report.mjs`).
- Lowercase `skill.md` convention for skill definitions (`skills/walkthrough/skill.md`, `.claude/skills/publish-skill/skill.md`).

**Functions:**
- camelCase in JavaScript (`extractDataSections`, `check`) in `evals/graders/llm-rubric.mjs` and `evals/graders/deterministic.mjs`.

**Variables:**
- JavaScript constants use camelCase (`resultsDir`, `jsonSchema`) in `evals/report.mjs`.
- Bash environment-derived variables use uppercase snake case (`PROJECT_DIR`, `RESULTS_DIR`, `SKIP_LLM`) in `evals/run.sh`.

**Types:**
- Type declarations are not used in this repository (no TypeScript source files detected).

## Code Style

**Formatting:**
- Formatter config: Not detected (`.prettierrc*`, `.editorconfig`, `biome.json` not present).
- Observed style in JS/MJS files (`evals/report.mjs`, `evals/graders/*.mjs`): 2-space indentation, semicolons, double-quoted strings.
- Observed style in shell (`evals/run.sh`): strict quoting for variables, `[[ ... ]]` tests, explicit guard branches.

**Linting:**
- Linter config: Not detected (`eslint.config.*`, `.eslintrc*` not present).
- Quality is enforced by script-level guard clauses and deterministic checks instead of static lint rules.

## Import Organization

**Order:**
1. Node built-ins first (`node:fs`, `node:path`, `node:url`) in `evals/report.mjs` and `evals/graders/*.mjs`.
2. Runtime/process globals next (`process.argv` parsing in same files).
3. Local computation helpers after import block.

**Path Aliases:**
- Not detected; all imports use Node built-ins or relative/constructed filesystem paths.

## Error Handling

**Patterns:**
- Fail-fast argument validation with usage output and `process.exit(1)` in `evals/report.mjs`, `evals/graders/deterministic.mjs`, and `evals/graders/llm-rubric.mjs`.
- Shell flag validation with explicit unknown-flag exit in `evals/run.sh`.
- Graceful fallback objects on grading failure in `evals/graders/llm-rubric.mjs`.

## Logging

**Framework:** console + shell echo.

**Patterns:**
- Human-readable progress markers in shell (`=== Walkthrough Skill Eval ===`, per-prompt status) in `evals/run.sh`.
- Structured summary table output and JSON emission in `evals/report.mjs`.
- `console.error` for usage and failure paths in graders.

## Comments

**When to Comment:**
- File headers explain script purpose and usage (`evals/run.sh`, `evals/report.mjs`, `evals/graders/*.mjs`).
- Section comments split major phases (`# tmux setup`, `// Tier 1: File level`, `// Read deterministic results`).

**JSDoc/TSDoc:**
- JSDoc-style multi-line headers are used for Node scripts (`evals/report.mjs`, `evals/graders/*.mjs`).
- Function-level JSDoc is limited; modules rely on top-of-file docs and inline section comments.

## Function Design

**Size:** 
- Utility functions are kept focused (`check`, `extractDataSections`) while orchestration remains in top-level script flow.

**Parameters:** 
- CLI entrypoints parse positional args, then validate before processing (`process.argv` patterns across `evals/*.mjs`).

**Return Values:** 
- Helper functions return plain objects/strings; scripts persist results to disk (`deterministic.json`, `summary.json`) instead of returning values to callers.

## Module Design

**Exports:** 
- Not used; modules are executable scripts with top-level side effects (`#!/usr/bin/env node`, `#!/usr/bin/env bash`).

**Barrel Files:** 
- Not used.

---

*Convention analysis: 2026-04-29*
