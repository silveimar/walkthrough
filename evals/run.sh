#!/usr/bin/env bash
# Eval runner for the walkthrough skill.
#
# Usage:
#   bash evals/run.sh                  # Run all prompts
#   bash evals/run.sh --subset         # Run 4 critical prompts only
#   bash evals/run.sh --id explicit-01 # Run a single prompt
#   bash evals/run.sh --skip-llm       # Skip LLM rubric grading
#   bash evals/run.sh --allow-egress claude_eval_prompt[,...]  # Required for claude_cli (see security/security-policy.json)
#   bash evals/run.sh --tmux           # Run each eval in a tmux window (watch live)
#
# Requires: claude CLI, node >= 18

set -uo pipefail

# PROJECT_DIR must resolve via POSIX bash — use Git Bash or WSL on Windows (see CONTRIBUTING.md).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROMPTS_CSV="$SCRIPT_DIR/prompts.csv"
RESULTS_BASE="$SCRIPT_DIR/results"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="$RESULTS_BASE/$TIMESTAMP"

# CLI flags
SUBSET=false
SINGLE_ID=""
SKIP_LLM=false
USE_TMUX=false
ALLOW_EGRESS=""
MODEL="${EVAL_MODEL:-sonnet}"
MAX_BUDGET="${EVAL_MAX_BUDGET:-2.00}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --subset) SUBSET=true; shift ;;
    --id) SINGLE_ID="$2"; shift 2 ;;
    --skip-llm) SKIP_LLM=true; shift ;;
    --tmux) USE_TMUX=true; shift ;;
    --model) MODEL="$2"; shift 2 ;;
    --allow-egress) ALLOW_EGRESS="$2"; shift 2 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

# Policy preflight and egress (D-09, D-14, D-16)
if ! bash "$PROJECT_DIR/scripts/verify-policy" >&2; then
  echo "Policy verification failed."
  exit 1
fi

# Vendor manifest (OFF-06, D-04): fail-closed when policy requires vendor-sourced viewer assets
if ! (
  cd "$PROJECT_DIR" &&
    node --input-type=module -e "
import { walkthroughPolicyRequiresAnyVendor, verifyVendorManifest } from './security/policy-runtime.mjs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
if (!walkthroughPolicyRequiresAnyVendor()) process.exit(0);
const r = verifyVendorManifest(root);
if (!r.ok) {
  console.error(r.errors.join('\n'));
  process.exit(1);
}
process.exit(0);
"
); then
  echo "Vendor manifest verification failed. When walkthroughViewerAssets uses vendor mode, vendor/walkthrough-viewer must exist and match manifest.json (run: npm ci && node scripts/sync-walkthrough-vendor.mjs)."
  exit 1
fi

# RUN-03: required tools
if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required (Node.js >= 18). See README.md."
  exit 1
fi
if ! command -v claude >/dev/null 2>&1; then
  echo "Error: claude CLI is required for eval generation. See README.md."
  exit 1
fi

export WALKTHROUGH_ALLOW_EGRESS="${ALLOW_EGRESS:-}"
(
  cd "$PROJECT_DIR" &&
    node --input-type=module -e "
import { assertClaudeCliEgressAllowed } from './security/policy-runtime.mjs';
const v = process.env.WALKTHROUGH_ALLOW_EGRESS || '';
const argv = v ? ['--allow-egress', v] : [];
assertClaudeCliEgressAllowed(process.env, argv);
"
) || exit 1

# D-08: LLM rubric network is off by default; skip unless opt-in env is set
if [[ "$SKIP_LLM" != "true" && -z "${WALKTHROUGH_LLM_RUBRIC:-}" ]]; then
  SKIP_LLM=true
  echo "Note: skipping LLM rubric (export WALKTHROUGH_LLM_RUBRIC=1 to enable; see security/security-policy.json)."
fi

SUBSET_IDS="explicit-01 implicit-01 negative-01 diagram-er"
TMUX_SESSION="eval-$TIMESTAMP"

mkdir -p "$RESULTS_DIR"

# Symlink latest
ln -sfn "$TIMESTAMP" "$RESULTS_BASE/latest"

# tmux setup
if [[ "$USE_TMUX" == "true" ]]; then
  if ! command -v tmux &>/dev/null; then
    echo "Error: tmux is not installed. Install it with: brew install tmux"
    exit 1
  fi
  # Create a detached tmux session with a control window
  tmux new-session -d -s "$TMUX_SESSION" -n "control" \
    "echo '=== Eval Control — $TMUX_SESSION ==='; echo 'Waiting for evals...'; tail -f /dev/null"
  echo "tmux session: $TMUX_SESSION"
  echo "  Attach with:  tmux attach -t $TMUX_SESSION"
  echo ""
fi

echo "=== Walkthrough Skill Eval ==="
echo "Timestamp:  $TIMESTAMP"
echo "Model:      $MODEL"
echo "Results:    $RESULTS_DIR"
if [[ "$USE_TMUX" == "true" ]]; then
  echo "tmux:       $TMUX_SESSION  (attach with: tmux attach -t $TMUX_SESSION)"
fi
echo ""

# Parse CSV and run each prompt
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

while IFS=, read -r id expect_trigger expected_diagram prompt; do
  # Strip surrounding quotes from prompt
  prompt="${prompt%\"}"
  prompt="${prompt#\"}"

  # Filter by --subset or --id
  if [[ -n "$SINGLE_ID" && "$id" != "$SINGLE_ID" ]]; then
    continue
  fi
  if [[ "$SUBSET" == "true" ]]; then
    if ! echo "$SUBSET_IDS" | grep -qw "$id"; then
      continue
    fi
  fi

  echo "--- [$id] ---"
  echo "  Prompt:   $prompt"
  echo "  Expect:   trigger=$expect_trigger diagram=$expected_diagram"

  PROMPT_DIR="$RESULTS_DIR/$id"
  mkdir -p "$PROMPT_DIR"

  # Create temp working directory with a copy of the codebase
  # Only copy source files needed for exploration, NOT existing walkthrough outputs
  WORK_DIR=$(mktemp -d)
  (
    cd "$PROJECT_DIR" &&
      VERIFY_WORK_DIR="$WORK_DIR" node --input-type=module -e "
import { assertEvalWorkspaceDirAllowed } from './security/policy-runtime.mjs';
assertEvalWorkspaceDirAllowed(process.env.VERIFY_WORK_DIR || '');
"
  ) || exit 1

  cp -R "$PROJECT_DIR/skills" "$WORK_DIR/"
  cp "$PROJECT_DIR/README.md" "$WORK_DIR/" 2>/dev/null || true
  # Install the walkthrough skill where Claude Code can discover it
  mkdir -p "$WORK_DIR/.claude/skills"
  cp -R "$PROJECT_DIR/skills/walkthrough" "$WORK_DIR/.claude/skills/walkthrough"
  NEEDS_VENDOR="$(cd "$PROJECT_DIR" && node --input-type=module -e "import { walkthroughPolicyRequiresAnyVendor } from './security/policy-runtime.mjs'; process.stdout.write(walkthroughPolicyRequiresAnyVendor() ? 'yes' : 'no');")"
  if [[ "$NEEDS_VENDOR" == "yes" ]]; then
    mkdir -p "$WORK_DIR/vendor"
    cp -R "$PROJECT_DIR/vendor/walkthrough-viewer" "$WORK_DIR/vendor/"
  fi
  # Create a marker file to detect newly created files
  touch "$WORK_DIR/.eval-start-marker"

  # Run claude -p from the work dir so it finds skill files
  echo "  Running claude -p ..."

  if [[ "$USE_TMUX" == "true" ]]; then
    # Write a runner script that claude executes inside the tmux window
    RUNNER="$PROMPT_DIR/_run.sh"
    cat > "$RUNNER" <<RUNNER_EOF
#!/usr/bin/env bash
echo "=== Eval: $id ==="
echo "Prompt: $prompt"
echo "---"
cd "$WORK_DIR" && claude -p "$prompt" \
  --output-format json \
  --dangerously-skip-permissions \
  --max-budget-usd "$MAX_BUDGET" \
  --no-session-persistence \
  --model "$MODEL" \
  < /dev/null \
  > "$PROMPT_DIR/output.json" 2> >(tee "$PROMPT_DIR/stderr.log" >&2)
echo \$? > "$PROMPT_DIR/_exit_code"
echo ""
echo "=== [$id] finished (exit \$(cat "$PROMPT_DIR/_exit_code")) — press q to close ==="
read -n1 -r -s -p ""
RUNNER_EOF
    chmod +x "$RUNNER"

    # Create a new tmux window for this eval
    tmux new-window -t "$TMUX_SESSION" -n "$id" "bash $RUNNER"

    # Wait for the eval to finish (poll for the exit code file)
    while [[ ! -f "$PROMPT_DIR/_exit_code" ]]; do
      sleep 2
    done
    EXIT_CODE=$(cat "$PROMPT_DIR/_exit_code")
    rm -f "$PROMPT_DIR/_exit_code" "$PROMPT_DIR/_run.sh"
  else
    (cd "$WORK_DIR" && claude -p "$prompt" \
      --output-format json \
      --dangerously-skip-permissions \
      --max-budget-usd "$MAX_BUDGET" \
      --no-session-persistence \
      --model "$MODEL" \
      < /dev/null \
      > "$PROMPT_DIR/output.json" 2>"$PROMPT_DIR/stderr.log") || true
    EXIT_CODE=$?
  fi

  if [[ $EXIT_CODE -ne 0 ]]; then
    echo "  claude -p exited with code $EXIT_CODE"
    tail -n 5 "$PROMPT_DIR/stderr.log" | node "$PROJECT_DIR/scripts/redact-stdin.mjs"
  fi

  # Copy only newly created walkthrough-*.html files (newer than our marker)
  find "$WORK_DIR" -maxdepth 2 -name "walkthrough-*.html" -newer "$WORK_DIR/.eval-start-marker" -exec cp {} "$PROMPT_DIR/" \; 2>/dev/null || true

  # Clean up work dir
  rm -rf "$WORK_DIR"

  # Run deterministic grader
  echo "  Running deterministic grader ..."
  node "$SCRIPT_DIR/graders/deterministic.mjs" "$PROMPT_DIR" "$expect_trigger" "$expected_diagram" > /dev/null 2>&1 || true

  # Run LLM grader (only if HTML exists and not skipped)
  HTML_FILE=$(find "$PROMPT_DIR" -name "walkthrough-*.html" -print -quit 2>/dev/null)
  if [[ "$SKIP_LLM" != "true" && -n "$HTML_FILE" ]]; then
    echo "  Running LLM rubric grader ..."
    node "$SCRIPT_DIR/graders/llm-rubric.mjs" "$HTML_FILE" "$PROMPT_DIR/llm-grade.json" > /dev/null 2>&1 || true
  fi

  echo "  Done."
  echo ""
done < <(tail -n +2 "$PROMPTS_CSV")

echo "=== Generating Report ==="
node "$SCRIPT_DIR/report.mjs" "$RESULTS_DIR"

echo ""
echo "Results saved to: $RESULTS_DIR"
echo "Summary: $RESULTS_DIR/summary.json"

# tmux cleanup
if [[ "$USE_TMUX" == "true" ]]; then
  echo ""
  echo "tmux session '$TMUX_SESSION' is still open."
  echo "  Attach:   tmux attach -t $TMUX_SESSION"
  echo "  Kill:     tmux kill-session -t $TMUX_SESSION"
fi
