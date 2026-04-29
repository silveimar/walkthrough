# Technology Stack

**Analysis Date:** 2026-04-29

## Languages

**Primary:**
- JavaScript (ESM, `.mjs`) - Eval and grading scripts in `evals/report.mjs`, `evals/graders/deterministic.mjs`, and `evals/graders/llm-rubric.mjs`
- Markdown - Skill and reference definitions in `skills/walkthrough/skill.md` and `skills/walkthrough/references/html-patterns.md`

**Secondary:**
- Bash - Eval orchestration in `evals/run.sh`
- HTML/CSS - Generated walkthrough artifact pattern and example in `examples/walkthrough-how-it-works.html`
- YAML - CI/CD workflow in `.github/workflows/static.yml`

## Runtime

**Environment:**
- Node.js >= 18 (explicit requirement in `README.md` and Node shebangs in `.mjs` scripts)
- Bash shell runtime for eval execution (`evals/run.sh`)

**Package Manager:**
- npm/npx-based tooling (`npx skills add ...` in `README.md`)
- Lockfile: missing (no `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock` detected at repo root)

## Frameworks

**Core:**
- Claude Code Skill format - Skill metadata/workflow in `skills/walkthrough/skill.md`
- Static HTML app architecture (no bundler) - Browser-executed module script pattern in `skills/walkthrough/references/html-patterns.md`

**Testing:**
- Custom eval harness - Prompt runner in `evals/run.sh` with result aggregation in `evals/report.mjs`
- Deterministic grader - Structural checks in `evals/graders/deterministic.mjs`
- LLM rubric grader - Quality scoring in `evals/graders/llm-rubric.mjs` against `evals/graders/rubric.md`

**Build/Dev:**
- No build pipeline for generated output (self-contained HTML noted in `README.md`)
- GitHub Actions workflow for static deployment in `.github/workflows/static.yml`

## Key Dependencies

**Critical:**
- React 18 UMD - UI rendering in generated walkthrough HTML (`examples/walkthrough-how-it-works.html`, `skills/walkthrough/references/html-patterns.md`)
- ReactDOM 18 UMD - Client rendering bootstrap for walkthrough app (`examples/walkthrough-how-it-works.html`)
- Mermaid 11 - Diagram rendering (`examples/walkthrough-how-it-works.html`)
- Shiki (ESM, 3.22.0 pattern) - Syntax highlighting (`examples/walkthrough-how-it-works.html`, `skills/walkthrough/references/html-patterns.md`)
- Tailwind CSS CDN - Utility styling (`examples/walkthrough-how-it-works.html`)

**Infrastructure:**
- Claude CLI (`claude -p`) - Prompt execution and grading model calls in `evals/run.sh` and `evals/graders/llm-rubric.mjs`
- GitHub Actions Pages actions - Deployment in `.github/workflows/static.yml`

## Configuration

**Environment:**
- Eval runtime knobs via env vars: `EVAL_MODEL`, `EVAL_MAX_BUDGET` in `evals/run.sh`
- Skill-install workflow uses `npx skills add ...` in `README.md`

**Build:**
- Static deploy workflow config: `.github/workflows/static.yml`
- No TypeScript/build transpiler config detected (`tsconfig.json` not present)

## Platform Requirements

**Development:**
- Node.js >= 18 (`README.md`)
- Authenticated Claude CLI (`README.md`, eval flow in `evals/run.sh`)
- Bash environment; optional `tmux` when `--tmux` is used in `evals/run.sh`

**Production:**
- GitHub Pages static hosting via `.github/workflows/static.yml`
- Browser runtime with CDN access for generated walkthrough dependencies (`examples/walkthrough-how-it-works.html`)

---

*Stack analysis: 2026-04-29*
