#!/usr/bin/env bash
# Eval runner for the walkthrough skill.
#
# Usage:
#   bash evals/run.sh                  # Run all prompts
#   bash evals/run.sh --subset         # Run 4 critical prompts only
#   bash evals/run.sh --id explicit-01 # Run a single prompt
#   bash evals/run.sh --skip-llm       # Skip LLM rubric grading
#   bash evals/run.sh --tmux           # Run each eval in a tmux window (watch live)
#
# Requires: claude CLI, node >= 18

set -uo pipefail

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
MODEL="${EVAL_MODEL:-sonnet}"
MAX_BUDGET="${EVAL_MAX_BUDGET:-2.00}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --subset) SUBSET=true; shift ;;
    --id) SINGLE_ID="$2"; shift 2 ;;
    --skip-llm) SKIP_LLM=true; shift ;;
    --tmux) USE_TMUX=true; shift ;;
    --model) MODEL="$2"; shift 2 ;;
    *) echo "Unknown flag: $1"; exit 1 ;;
  esac
done

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
  cp -R "$PROJECT_DIR/skills" "$WORK_DIR/"
  cp "$PROJECT_DIR/README.md" "$WORK_DIR/" 2>/dev/null || true
  # Install the walkthrough skill where Claude Code can discover it
  mkdir -p "$WORK_DIR/.claude/skills"
  cp -R "$PROJECT_DIR/skills/walkthrough" "$WORK_DIR/.claude/skills/walkthrough"
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
    tail -5 "$PROMPT_DIR/stderr.log"
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
