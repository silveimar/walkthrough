# External Integrations

**Analysis Date:** 2026-04-29

## APIs & External Services

**AI/LLM Execution:**
- Claude CLI backend service - Executes prompts and grading jobs
  - SDK/Client: `claude` CLI calls in `evals/run.sh` and `evals/graders/llm-rubric.mjs`
  - Auth: local Claude CLI authentication (required by `README.md`; env var not explicitly defined in repo)

**Frontend CDN Assets (generated walkthrough files):**
- Tailwind CDN - Styling in generated HTML
  - SDK/Client: `<script src="https://cdn.tailwindcss.com">` in `examples/walkthrough-how-it-works.html`
  - Auth: none
- unpkg React 18 + ReactDOM 18 - Runtime UI libraries
  - SDK/Client: `https://unpkg.com/react@18/...` and `https://unpkg.com/react-dom@18/...` in `examples/walkthrough-how-it-works.html`
  - Auth: none
- jsDelivr Mermaid + Shiki - Diagram render and syntax highlighting
  - SDK/Client: `https://cdn.jsdelivr.net/npm/mermaid@11/...` and Shiki ESM import in `examples/walkthrough-how-it-works.html`
  - Auth: none

**Source/Distribution:**
- GitHub repository distribution for skill install
  - SDK/Client: `npx skills add https://github.com/alexanderop/walkthrough --skill walkthrough` in `README.md`
  - Auth: optional (public repo install path)

## Data Storage

**Databases:**
- Not detected
  - Connection: Not applicable
  - Client: Not applicable

**File Storage:**
- Local filesystem only
  - Eval outputs written to `evals/results/<timestamp>/` and `evals/results/latest` symlink in `evals/run.sh`

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Claude CLI account/session authentication (required prerequisite in `README.md`)
  - Implementation: CLI-authenticated local user session consumed by `claude -p` calls

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- File-based logs from eval execution (`output.json`, `stderr.log`, grader JSON files) under `evals/results/*` in `evals/run.sh`

## CI/CD & Deployment

**Hosting:**
- GitHub Pages via workflow in `.github/workflows/static.yml`

**CI Pipeline:**
- GitHub Actions using `actions/checkout@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4` in `.github/workflows/static.yml`

## Environment Configuration

**Required env vars:**
- `EVAL_MODEL` (optional override, defaults to `sonnet`) in `evals/run.sh`
- `EVAL_MAX_BUDGET` (optional override, defaults to `2.00`) in `evals/run.sh`

**Secrets location:**
- GitHub Actions uses `GITHUB_TOKEN` permission model in `.github/workflows/static.yml`
- Local AI access secret material is managed outside this repo by Claude CLI auth state

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- External network calls to Claude service via `claude -p` in `evals/run.sh` and `evals/graders/llm-rubric.mjs`
- CDN asset fetches at runtime in generated HTML (`examples/walkthrough-how-it-works.html`)

---

*Integration audit: 2026-04-29*
