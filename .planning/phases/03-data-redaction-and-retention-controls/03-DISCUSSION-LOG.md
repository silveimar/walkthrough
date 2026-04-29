# Phase 3: Data Redaction and Retention Controls - Discussion Log

> **Audit trail only.**

**Date:** 2026-04-29
**Phase:** 3-data-redaction-and-retention-controls
**Mode:** `--chain` (interactive-style decisions captured in single session)

**Areas covered:** Redaction scope, Retention model, Protected storage boundaries

---

## Redaction scope (DATA-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Ad hoc per script | Fast, inconsistent | |
| Shared write-boundary helper + policy patterns | Single authority, testable | ✓ |

**Notes:** Patterns for tokens, env-key names, user home paths; stderr redaction when surfaced.

---

## Retention (DATA-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Manual only | No automation | |
| Policy TTL + maintainer cleanup CLI | Configurable, documented | ✓ |

**Notes:** Optional dry-run; no daemon required in Phase 3.

---

## Protected storage (DATA-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Move results outside repo | Heavy UX change | |
| Keep `evals/results/` + docs + gitignore + policy statement | Matches current layout | ✓ |

---

## Deferred Ideas

- Full secrets scanner / vault integration — later phases.
