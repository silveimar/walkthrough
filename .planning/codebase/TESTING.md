# Testing Patterns

**Analysis Date:** 2026-04-29

## Test Framework

**Runner:**
- Custom bash + Node eval harness (not Jest/Vitest), centered on `evals/run.sh`.
- Config: prompt matrix in `evals/prompts.csv`, rubric in `evals/graders/rubric.md`, deterministic grader in `evals/graders/deterministic.mjs`, LLM grader in `evals/graders/llm-rubric.mjs`.

**Assertion Library:**
- Custom JSON pass/fail checks (no external assertion library detected).

**Run Commands:**
```bash
bash evals/run.sh                  # Run full prompt suite
bash evals/run.sh --subset         # Run critical subset
bash evals/run.sh --skip-llm       # Deterministic checks only
```

## Test File Organization

**Location:**
- All testing assets are under `evals/`.

**Naming:**
- Graders use descriptive hyphenated module names (`evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs`).
- Prompt IDs in `evals/prompts.csv` follow semantic prefixes (`explicit-*`, `implicit-*`, `negative-*`, `edge-*`).

**Structure:**
```
evals/
├── run.sh
├── prompts.csv
├── report.mjs
└── graders/
    ├── deterministic.mjs
    ├── llm-rubric.mjs
    └── rubric.md
```

## Test Structure

**Suite Organization:**
```typescript
// evals/graders/deterministic.mjs
// Positive and negative branches, then tiered checks
if (!expectTrigger) {
  check("no_trigger", !htmlFile);
} else {
  check("file_exists", !!htmlFile);
  check("cdn_mermaid", html.includes("mermaid@11") || html.includes("mermaid@1"));
  check("nodes_count", nodeKeys.length >= 5 && nodeKeys.length <= 12);
}
```

**Patterns:**
- Setup pattern: per-prompt temp workspace creation and skill copy in `evals/run.sh`.
- Teardown pattern: temp directory cleanup via `rm -rf "$WORK_DIR"` in `evals/run.sh`.
- Assertion pattern: `check(id, pass, detail)` aggregator pattern in `evals/graders/deterministic.mjs`.

## Mocking

**Framework:** None.

**Patterns:**
```typescript
// evals/graders/llm-rubric.mjs
const result = execSync(
  `cat "${tmpPromptPath}" | claude -p --model sonnet --output-format json ...`,
  { encoding: "utf8", timeout: 120_000 }
);
```

**What to Mock:**
- Not currently mocked; tests call the real `claude` CLI and filesystem.

**What NOT to Mock:**
- Generated walkthrough HTML shape and Mermaid/CDN content are validated against real files in `evals/graders/deterministic.mjs`.

## Fixtures and Factories

**Test Data:**
```typescript
// evals/prompts.csv rows drive expected behavior
// id,expect_trigger,expected_diagram,prompt
// explicit-01,true,flowchart,"$walkthrough how does the walkthrough skill itself work"
```

**Location:**
- Static fixtures: `evals/prompts.csv`, `evals/graders/rubric.md`.
- Generated artifacts: `evals/results/<timestamp>/...` plus `evals/results/latest` symlink.

## Coverage

**Requirements:** No line/branch coverage threshold enforced.

**View Coverage:**
```bash
node evals/report.mjs evals/results/latest
```

## Test Types

**Unit Tests:**
- Not detected as separate unit test suites.

**Integration Tests:**
- Prompt-to-output integration is covered by `evals/run.sh` + deterministic grader checks.

**E2E Tests:**
- Skill-level end-to-end evaluation is present (prompt input to generated `walkthrough-*.html` and graded report).

## Common Patterns

**Async Testing:**
```typescript
// evals/run.sh (tmux mode polling)
while [[ ! -f "$PROMPT_DIR/_exit_code" ]]; do
  sleep 2
done
```

**Error Testing:**
```typescript
// evals/prompts.csv + deterministic negative branch
// negative-* prompts assert that no walkthrough HTML is created
check("no_trigger", !htmlFile, htmlFile ? `Unexpected file: ${htmlFile}` : undefined);
```

## Current Gaps

- No automated CI job runs `evals/run.sh`; `.github/workflows/static.yml` only deploys static content.
- No isolated tests for grader internals (`extractDataSections`, node counting regex logic) outside full eval runs.
- LLM rubric introduces nondeterminism and external dependency on `claude` CLI/model availability in `evals/graders/llm-rubric.mjs`.
- No explicit performance regression checks for eval runtime/budget besides `EVAL_MAX_BUDGET` usage in `evals/run.sh`.

---

*Testing analysis: 2026-04-29*
