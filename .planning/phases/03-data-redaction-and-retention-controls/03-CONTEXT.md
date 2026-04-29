# Phase 3: Data Redaction and Retention Controls - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver automatic redaction of sensitive tokens, paths, and protected content in persisted eval outputs and logs; configurable retention and cleanup for generated artifacts under `evals/results/` (and related paths); and documented, enforceable local storage boundaries so sensitive outputs stay in maintainer-controlled locations. This phase covers DATA-01, DATA-02, and DATA-03 only — not artifact integrity sidecars (Phase 4) or CI governance matrices (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Redaction model (DATA-01)
- **D-01:** Redaction applies at **write boundaries**: anything written to disk under eval result trees or copied into summary/report artifacts passes through a shared Node helper (single module under `security/` or `evals/lib/`) so graders and `report.mjs` do not duplicate regex lists.
- **D-02:** Default deny patterns include: bearer/API-token shaped strings, long base64-like secrets, common env keys (`ANTHROPIC`, `OPENAI`, `AWS_SECRET`, `GITHUB_TOKEN`), and **absolute home/user paths** that could fingerprint a maintainer machine. Exact pattern list lives in policy JSON or a dedicated `redaction-patterns` section referenced by policy schema.
- **D-03:** Stderr capture from `claude -p` runs may contain sensitive material — redact before optional persistence or when echoing failure tails in logs; preserve enough context for debugging (e.g. replace with `[REDACTED:token]` not empty string).
- **D-04:** Redaction is fail-safe: on detection of high-confidence secrets in output, prefer redacting over omitting whole files unless integrity checks require presence (then redact in place).

### Retention and cleanup (DATA-02)
- **D-05:** Retention is policy-driven: machine-readable **max age** (days) for timestamp directories under `evals/results/<timestamp>/`, plus optional **max total size** cap (best-effort) documented in policy.
- **D-06:** Ship a **maintainer-invoked** cleanup command (`scripts/cleanup-eval-results` or Node CLI) that deletes expired runs based on directory mtime/name; wire optional `--dry-run`. Phase 3 does not require background daemons.
- **D-07:** README documents retention defaults and how to run cleanup; CI automation for retention can wait for Phase 5 unless a one-line doc hook is trivial.

### Protected local storage (DATA-03)
- **D-08:** Canonical sensitive output root remains **`evals/results/`** (already gitignored); document in README and policy that artifacts there are **local-only sensitive** and must not be published or synced to shared drives without review.
- **D-09:** No relocation of results outside repo in Phase 3 unless trivial — boundaries are **documentary + .gitignore + optional fs permissions note** (e.g. restrictive umask recommendation), not a new encrypted vault.

### Claude's Discretion
- Specific regex catalog vs structured secret scanner tradeoff — start with maintainable regex + blocklist in policy.
- Whether `summary.json` gets a `redacted: true` flag when any substitution occurred.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria.
- `.planning/REQUIREMENTS.md` — DATA-01, DATA-02, DATA-03.
- `.planning/PROJECT.md` — local-first and analyzed-content protections.

### Prior phase dependencies
- `.planning/phases/01-policy-contract-foundation/01-CONTEXT.md` — policy authority.
- `.planning/phases/02-runtime-enforcement-hardening/02-CONTEXT.md` — runtime and workspace boundaries.

### Implementation surfaces
- `evals/run.sh` — orchestration, stderr paths, results dir creation.
- `evals/report.mjs` — aggregates prompt outputs; redaction on write.
- `evals/graders/deterministic.mjs`, `evals/graders/llm-rubric.mjs` — persisted JSON outputs.
- `security/security-policy.json` — extend with redaction/retention keys.
- `security/security-policy.schema.json` — validate new keys.
- `README.md` — operator documentation for sensitive paths and cleanup.

### Risk context
- `.planning/codebase/CONCERNS.md` — GitHub Pages scope, eval result sensitivity.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `evals/results/<timestamp>/` tree with `summary.json`, per-prompt `deterministic.json`, `llm-grade.json`, HTML artifacts — single choke point for retention scanning.
- `security/policy-runtime.mjs` — policy load pattern for extending with `dataProtection` or similar section.

### Established Patterns
- Fail-closed validation via `verify-policy` — new policy keys follow same strict schema approach.
- Gitignored `evals/results/` — aligns DATA-03 with existing layout.

### Integration Points
- Post-process JSON and text writes in graders/report; optionally sanitize stderr snippets printed by `run.sh` on failure.

</code_context>

<specifics>
## Specific Ideas

Session used `/gsd-discuss-phase 3 --chain`: decisions favor policy-backed knobs, minimal new processes, and maintainer-run cleanup over background agents.

</specifics>

<deferred>
## Deferred Ideas

- Encrypted at-rest storage for eval artifacts — v2 / out of scope for Phase 3.
- Automated upload scanning — Phase 4 publish gates.

</deferred>

---

*Phase: 03-data-redaction-and-retention-controls*
*Context gathered: 2026-04-29*
