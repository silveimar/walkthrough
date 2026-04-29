<!-- refreshed: 2026-04-29 -->
# Architecture

**Analysis Date:** 2026-04-29

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                    Skill Interface Layer                    │
├──────────────────┬──────────────────┬───────────────────────┤
│ Skill Contract   │ Render Patterns  │ Public Usage Context  │
│ `skills/walk...` │ `skills/walk...` │ `README.md`           │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Execution Layer                        │
│ `claude -p` runtime driven by `evals/run.sh`               │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Verification/Artifacts                   │
│ `evals/graders/*.mjs`, `evals/report.mjs`, `examples/*.html` │
└─────────────────────────────────────────────────────────────┘
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

**Overall:** Specification-driven generation pipeline with offline evaluation loop.

**Key Characteristics:**
- Authoring boundary is declarative Markdown (`skill.md` + `html-patterns.md`) rather than source-code library APIs.
- Execution boundary is externalized to `claude -p` calls from shell scripts in isolated temporary copies (`evals/run.sh`).
- Quality boundary is split into deterministic checks and rubric-based checks before report aggregation.

## Layers

**Instruction Layer:**
- Purpose: Define what to generate and which constraints are non-negotiable.
- Location: `skills/walkthrough/`
- Contains: Trigger rules, workflow phases, Mermaid/HTML requirements.
- Depends on: Claude skill runtime conventions.
- Used by: Claude runtime and eval harness copies in `evals/run.sh`.

**Generation Runtime Layer:**
- Purpose: Execute prompt-to-output transformation.
- Location: `evals/run.sh` (invocation), `claude -p` process.
- Contains: Prompt iteration, temp-workspace setup, model/budget flags, artifact capture.
- Depends on: Local CLI tools (`claude`, `node`, optional `tmux`).
- Used by: Manual eval runs and CI-style local verification workflows.

**Evaluation Layer:**
- Purpose: Validate generated files for correctness and quality.
- Location: `evals/graders/`, `evals/report.mjs`
- Contains: Rule checks, schema-constrained rubric grading, summary synthesis.
- Depends on: Generated `walkthrough-*.html` artifacts.
- Used by: `evals/run.sh` completion pipeline.

**Publishing Layer:**
- Purpose: Serve static examples/docs for consumers.
- Location: `.github/workflows/static.yml`, `examples/`, `README.md`
- Contains: GitHub Pages deployment and public example page.
- Depends on: Repository content on `main`.
- Used by: External readers of demo output.

## Data Flow

### Primary Request Path

1. Prompt definitions are loaded from `evals/prompts.csv` and filtered by CLI flags in `evals/run.sh`.
2. Runtime creates isolated workspace copy (`skills/` and `README.md`) and invokes `claude -p` in that temp directory from `evals/run.sh`.
3. Newly created `walkthrough-*.html` artifacts are copied into timestamped result folders, then graded by `evals/graders/deterministic.mjs` and optionally `evals/graders/llm-rubric.mjs`.
4. Aggregated pass/fail metrics and details are written to `evals/results/<timestamp>/summary.json` via `evals/report.mjs`.

### Generated Viewer Runtime

1. HTML loads runtime dependencies (`react`, `react-dom`, `mermaid`, `tailwind`, `shiki`) in `examples/walkthrough-how-it-works.html`.
2. Mermaid graph text (`DIAGRAM`) and node metadata (`NODES`) are rendered in browser code in `examples/walkthrough-how-it-works.html`.
3. User interaction (click, zoom, pan) updates active node state and detail panel content in the same generated HTML file.

**State Management:**
- Eval pipeline state is file-system based (timestamped directories under `evals/results/`).
- Viewer state is client-side React state and refs inside generated HTML (`activeId`, pan/zoom refs).

## Key Abstractions

**Skill Contract:**
- Purpose: Canonical behavior spec for all walkthrough generation.
- Examples: `skills/walkthrough/skill.md`, `README.md`
- Pattern: Frontmatter + procedural markdown directives.

**Artifact Contract:**
- Purpose: Enforced output shape for generated HTML.
- Examples: `skills/walkthrough/references/html-patterns.md`, `evals/graders/deterministic.mjs`
- Pattern: Reference template + checker parity.

**Eval Record:**
- Purpose: Persisted scoring evidence per prompt run.
- Examples: `evals/results/<timestamp>/<prompt-id>/deterministic.json`, `evals/results/<timestamp>/summary.json` (generated by scripts).
- Pattern: Prompt-scoped JSON plus rollup summary.

## Entry Points

**Interactive Skill Usage:**
- Location: `skills/walkthrough/skill.md`
- Triggers: User prompts matching walkthrough phrases or `$walkthrough`.
- Responsibilities: Produce one self-contained walkthrough HTML artifact.

**Batch Evaluation:**
- Location: `evals/run.sh`
- Triggers: `bash evals/run.sh` (plus flags).
- Responsibilities: Execute matrix, grade outputs, write results.

**Static Demo Publishing:**
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

**What happens:** Prompt subset filtering in `evals/run.sh` uses inline text matching (`grep -qw`) in shell flow.
**Why it's wrong:** Expands bash complexity and makes parser behavior harder to unit test.
**Do this instead:** Keep `evals/run.sh` as coordinator and move CSV filtering into a dedicated Node helper beside `evals/report.mjs`.

### Duplicated Output Contract Sources

**What happens:** Output requirements live in both `skills/walkthrough/references/html-patterns.md` and `evals/graders/deterministic.mjs`.
**Why it's wrong:** Contract drift risk if rules evolve in one file only.
**Do this instead:** Generate grader checks from a shared machine-readable contract file under `skills/walkthrough/references/`.

## Error Handling

**Strategy:** Fail-soft grading with persisted fallback outputs.

**Patterns:**
- Shell runner continues per-prompt execution even when `claude -p` exits non-zero in `evals/run.sh`.
- LLM grader writes structured fallback JSON on failure instead of aborting run in `evals/graders/llm-rubric.mjs`.

## Cross-Cutting Concerns

**Logging:** CLI/stdout progress logs in `evals/run.sh`; structured summary output in `evals/report.mjs`.
**Validation:** Deterministic structural checks plus rubric grading in `evals/graders/`.
**Authentication:** External auth delegated to local `claude` CLI session and GitHub token in `.github/workflows/static.yml`.

---

*Architecture analysis: 2026-04-29*
