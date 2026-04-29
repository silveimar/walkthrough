# Phase 7 Research — Cross-platform sandbox & path parity

## RESEARCH COMPLETE

**Question:** What must we know to plan PLT-01–PLT-04 well?

### Current implementation anchors

- **`security/policy-runtime.mjs`** — Uses Node `path`, `normalize`, `realpathSync`, `os.tmpdir()`, and `sep`-aware prefix checks for `assertEvalWorkspaceDirAllowed`, canonical eval results paths (`getCanonicalEvalResultsAbsPath`), and `assertStrictRepoWorkingDirectory` when `WALKTHROUGH_STRICT_CWD=1`.
- **`evals/run.sh`** — Bash sets `SCRIPT_DIR` / `PROJECT_DIR` via `cd "$(dirname "${BASH_SOURCE[0]}")"`; POSIX-oriented; primary friction on Windows is Git Bash vs WSL path translation and ensuring copies land where policy asserts expect.
- **CI (`.github/workflows/ci.yml`)** — Ubuntu-only today: `verify-policy`, `bash -n evals/run.sh`, `node --check` on key `.mjs` files. No `WALKTHROUGH_STRICT_CWD` yet.

### Context decisions (07-CONTEXT.md)

- Document **Git Bash + WSL2** in the matrix before adding Windows runners.
- **Bash + Node split:** portable shell for orchestration; policy assertions stay in Node.
- **Docs + manual smoke first** for PLT-04; Windows CI optional if trivial.
- **`WALKTHROUGH_STRICT_CWD=1` in CI** for automated cwd parity.

### Risks / traps

- **`realpath`/symlinks:** Already used in policy-runtime — extend tests rather than duplicating logic in bash.
- **MSYS path mixing:** Prefer Node resolution for invariant checks; bash stays POSIX idioms (`/` paths from `pwd -P` patterns where needed).

### Planning implication

Split work into: (1) maintainer docs + checklist, (2) path/temp consistency in harness + runtime + focused Node tests, (3) CI wiring for strict cwd and documented smoke alignment.
