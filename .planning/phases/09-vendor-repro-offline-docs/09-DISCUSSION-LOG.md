# Phase 9: Vendor reproducibility & offline path - Discussion Log

> **Audit trail only.** Decisions are captured in `09-CONTEXT.md`.

**Date:** 2026-04-29  
**Phase:** 09-vendor-repro-offline-docs  
**Areas discussed:** Lockfile truth vs audit, documentation placement, CDN default messaging, provenance refresh step  
**Mode:** `--auto` (recommended defaults) + `--chain` (advance to plan/execute after context)

---

## Lockfile & OFF-03

| Option | Description | Selected |
|--------|-------------|----------|
| Add new lockfile | Run npm install and commit | |
| Align docs to existing lockfile | Repo already has `package-lock.json`; fix stale “missing lockfile” text | ✓ |
| Switch docs to npm install only | Drop npm ci | |

**Auto choice:** Align documentation — **D-01**, **D-02** in CONTEXT.

---

## Documentation placement (OFF-01 / OFF-06)

| Option | Description | Selected |
|--------|-------------|----------|
| README-only | Long vendor section in README | |
| CONTRIBUTING checklist + README pointer | Canonical steps in CONTRIBUTING | ✓ |
| vendor README only | Minimal surface | |

**Auto choice:** **CONTRIBUTING** canonical + **README** pointer — **D-03**, **D-04**.

---

## CDN vs vendor default clarity

| Option | Description | Selected |
|--------|-------------|----------|
| Silent | Assume reader knows policy | |
| Explicit callout | State default `cdn` and opt-in vendor edits | ✓ |

**Auto choice:** Explicit callout — **D-05**.

---

## Provenance step when switching modes

| Option | Description | Selected |
|--------|-------------|----------|
| Omit | Provenance is Phase 8 only | |
| Include in vendor checklist | Link build-provenance-manifest after vendor/policy changes | ✓ |

**Auto choice:** Include — **D-06**.

---

## Claude's Discretion

- Section titles and brevity in CONTRIBUTING; optional future CI guard for missing lockfile.

## Deferred Ideas

- Phase 10/11 scope; Windows CI matrix; retroactive VERIFICATION artifacts.
