# Codebase Structure

**Analysis Date:** 2026-04-29

## Directory Layout

```text
walkthrough/
├── skills/                  # Distributable Claude skill package
│   └── walkthrough/         # Core skill definition + generation references
├── evals/                   # Prompt matrix, graders, runner, and reporting scripts
├── examples/                # Generated HTML walkthrough examples
├── .github/workflows/       # Static site deployment workflow
├── .claude/skills/          # Local authoring helper skill(s)
├── README.md                # Public usage and architecture overview
└── image.png                # README example image
```

## Directory Purposes

**`skills/walkthrough/`:**
- Purpose: Source of truth for behavior expected from the walkthrough skill.
- Contains: `skill.md` contract and `references/html-patterns.md` implementation pattern reference.
- Key files: `skills/walkthrough/skill.md`, `skills/walkthrough/references/html-patterns.md`.

**`evals/`:**
- Purpose: End-to-end evaluation harness for generated walkthrough artifacts.
- Contains: Shell runner, prompt dataset, deterministic and rubric graders, report aggregator.
- Key files: `evals/run.sh`, `evals/prompts.csv`, `evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs`, `evals/report.mjs`.

**`examples/`:**
- Purpose: Concrete generated output for demo and regression spot-checking.
- Contains: Self-contained HTML walkthrough output.
- Key files: `examples/walkthrough-how-it-works.html`.

**`.github/workflows/`:**
- Purpose: Deployment automation for static repository content.
- Contains: GitHub Pages workflow.
- Key files: `.github/workflows/static.yml`.

## Key File Locations

**Entry Points:**
- `skills/walkthrough/skill.md`: Interactive skill runtime entry contract.
- `evals/run.sh`: Batch execution entry point.

**Configuration:**
- `.github/workflows/static.yml`: Deployment behavior.
- `.gitignore`: Excludes generated eval artifacts (`evals/results/`).

**Core Logic:**
- `skills/walkthrough/skill.md`: Workflow phases and generation constraints.
- `skills/walkthrough/references/html-patterns.md`: Required HTML/JS architecture patterns.
- `evals/graders/deterministic.mjs`: Structural output checks.
- `evals/graders/llm-rubric.mjs`: Qualitative scoring bridge.
- `evals/report.mjs`: Result synthesis.

**Testing:**
- `evals/prompts.csv`: Test case matrix.
- `evals/graders/rubric.md`: LLM grader evaluation rubric.

## Naming Conventions

**Files:**
- Markdown docs are lowercase in package paths (`skill.md`, `html-patterns.md`, `rubric.md`).
- Node scripts use `.mjs` and descriptive kebab/camel hybrids (`llm-rubric.mjs`, `deterministic.mjs`).
- Generated walkthrough artifacts follow `walkthrough-<topic>.html` convention enforced by `evals/graders/deterministic.mjs`.

**Directories:**
- Functional top-level folders (`skills`, `evals`, `examples`) map directly to lifecycle stages (author, verify, publish).
- Skill package folder name matches skill identifier (`skills/walkthrough/`).

## Where to Add New Code

**New Feature:**
- Primary code: `skills/walkthrough/skill.md` for behavior and `skills/walkthrough/references/html-patterns.md` for output architecture.
- Tests: Add prompts to `evals/prompts.csv`; extend checks in `evals/graders/deterministic.mjs` and/or rubric in `evals/graders/rubric.md`.

**New Component/Module:**
- Implementation: Place reusable evaluation logic under `evals/` (prefer adjacent `.mjs` helper imported by `evals/report.mjs` or graders).

**Utilities:**
- Shared helpers: Create under `evals/graders/` if grader-specific, or directly under `evals/` if shared by runner and report.

## Special Directories

**`evals/results/`:**
- Purpose: Timestamped run artifacts (`output.json`, grader JSON, summaries).
- Generated: Yes (by `evals/run.sh`).
- Committed: No (ignored in `.gitignore`).

**`.planning/codebase/`:**
- Purpose: Persisted architectural/quality map docs for GSD orchestration.
- Generated: Yes (by mapper workflows).
- Committed: Yes.

**`.claude/skills/`:**
- Purpose: Local skill tooling support.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-04-29*
