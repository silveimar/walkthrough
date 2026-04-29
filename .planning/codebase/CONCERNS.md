# Codebase Concerns

**Analysis Date:** 2026-04-29

## Tech Debt

**Mixed shell portability in eval runner:**
- Issue: `evals/run.sh` is Bash-based but uses GNU-incompatible flags (`tail -5`), reducing portability on macOS default tooling and making CI/local parity fragile.
- Files: `evals/run.sh`
- Impact: Eval runs can fail for contributors on BSD userland, blocking repeatable quality checks.
- Fix approach: Replace non-portable commands with POSIX-compatible forms (for example, `tail -n 5`), then add a lightweight shell lint check in CI.

**Unstable parser logic for generated HTML sections:**
- Issue: Both graders rely on regex extraction against HTML/JS source (`const NODES`, `const DIAGRAM`, `const LEGEND`), which is brittle against formatting changes.
- Files: `evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs`
- Impact: False negatives/positives in grading can hide regressions or report failures on valid output.
- Fix approach: Parse with a real JS/HTML parser or require a machine-readable sidecar artifact (for example, JSON metadata) from generated walkthrough files.

## Known Bugs

**No confirmed functional runtime bug tracked in-repo:**
- Symptoms: Not detected in committed source.
- Files: `README.md`, `evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs`
- Trigger: Not applicable.
- Workaround: Not applicable.

## Security Considerations

**GitHub Pages deploys full repository contents:**
- Risk: Deployment uploads repository root (`path: '.'`), so accidental commit of sensitive/non-public files becomes a public publishing event.
- Files: `.github/workflows/static.yml`
- Current mitigation: Repository currently appears documentation-focused and `.gitignore` excludes `evals/results/`.
- Recommendations: Restrict deployment artifact to a dedicated publish directory (for example, `examples/`), and add a pre-deploy denylist check for sensitive file patterns.

**Eval grader executes external model CLI through shell command composition:**
- Risk: `execSync` uses a shell command string that invokes `cat ... | claude -p ...`, increasing injection surface if path handling changes.
- Files: `evals/graders/llm-rubric.mjs`
- Current mitigation: Temporary file paths are internally generated and quoted.
- Recommendations: Replace shell pipeline with `spawn`/`execFile` argument arrays and direct stdin piping to avoid shell interpretation.

## Performance Bottlenecks

**Full-repo copy per prompt in eval loop:**
- Problem: Each prompt run performs `cp -R` of skill assets into a new temp directory and repeats setup work for every case.
- Files: `evals/run.sh`
- Cause: Isolation is implemented as per-prompt full directory copy instead of reusable workspace setup.
- Improvement path: Pre-stage one baseline temp workspace and clone/copy-on-write it per prompt, or run prompts in a reusable isolated workspace with cleanup hooks.

## Fragile Areas

**Output-contract coupling between skill and deterministic grader:**
- Files: `skills/walkthrough/skill.md`, `skills/walkthrough/references/html-patterns.md`, `evals/graders/deterministic.mjs`
- Why fragile: Quality checks enforce strict HTML contract details (node count, exact key names, click binding patterns), so small intentional format changes can break evaluations.
- Safe modification: Version the output contract and update grader + skill reference in the same change; validate with `bash evals/run.sh --subset`.
- Test coverage: No parser-unit tests for grader extractors in `evals/graders/`.

**Single-file generated HTML complexity:**
- Files: `examples/walkthrough-how-it-works.html`, `skills/walkthrough/references/html-patterns.md`
- Why fragile: The generated artifact combines rendering, data model, pan/zoom logic, and interaction behavior in one document; debugging regressions becomes costly.
- Safe modification: Keep a canonical minimal template and validate behavior with deterministic checks before expanding optional UI features.
- Test coverage: No browser-level E2E tests for interaction semantics (zoom, pan, node click, detail panel).

## Scaling Limits

**Evaluation throughput constrained by serial prompt execution:**
- Current capacity: One prompt at a time in non-tmux mode, with each prompt invoking a fresh `claude -p` process.
- Limit: Runtime and cost scale linearly with prompt count in `evals/prompts.csv`.
- Scaling path: Add controlled parallelism (worker count flag), shared warm workspace, and budget guardrails per batch run.

## Dependencies at Risk

**Runtime CDN dependencies not pinned in generated HTML output policy:**
- Risk: Generated walkthroughs depend on remote CDNs (`tailwindcss`, `react`, `react-dom`, `mermaid`, `shiki`) and can break if upstream assets change/unpublish.
- Impact: Existing generated walkthrough HTML files may degrade without repository code changes.
- Migration plan: Pin exact versions consistently in templates and optionally provide an offline vendored mode for long-lived artifacts.

## Missing Critical Features

**No CI gate for eval harness health:**
- Problem: CI only deploys static content; it does not run `evals/run.sh` subset or grader smoke checks.
- Blocks: Regressions in skill output format or graders can merge undetected.

**No deterministic baseline snapshots for generated walkthrough outputs:**
- Problem: Repo lacks golden output fixtures that can detect structural drift in generated HTML contracts.
- Blocks: Hard to distinguish intended output evolution from regressions.

## Test Coverage Gaps

**No automated tests for grader modules:**
- What's not tested: Section extraction, schema handling, pass/fail decision boundaries.
- Files: `evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs`, `evals/report.mjs`
- Risk: Silent grading failures or incorrect score summaries.
- Priority: High

**No CI-enforced smoke run of critical prompt subset:**
- What's not tested: End-to-end generation path from prompt ingestion to grading on every merge.
- Files: `evals/run.sh`, `.github/workflows/static.yml`
- Risk: Contract drift reaches `main` before detection.
- Priority: High

## Short-Term Priorities

1. Add a CI workflow to run `bash evals/run.sh --subset --skip-llm` on pushes and pull requests.
2. Fix shell portability issues in `evals/run.sh` (notably `tail -5` usage).
3. Harden graders by replacing regex-only extraction with parser-backed extraction or generated JSON sidecar contracts.
4. Restrict GitHub Pages artifact scope in `.github/workflows/static.yml` to a dedicated publish directory.

---

*Concerns audit: 2026-04-29*
