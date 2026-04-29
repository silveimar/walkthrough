# Phase 4: Artifact Integrity and Safe Publishing - Discussion Log

> **Audit trail only.**

**Date:** 2026-04-29
**Phase:** 4-artifact-integrity-and-safe-publishing
**Mode:** `--chain`

---

## Sidecar format (INTG-01)

| Option | Selected |
|--------|----------|
| JSON sidecar adjacent to HTML with sha256 + policyVersion + timestamps | ✓ |
| Embed metadata only inside HTML | |

---

## Integrity signals (INTG-02)

| Option | Selected |
|--------|----------|
| Required SHA-256 verify script; SBOM/vuln as documented optional follow-up | ✓ |

---

## Publish surface (INTG-03)

| Option | Selected |
|--------|----------|
| Restrict Pages artifact to `examples/` (adjust policy roots to match) | ✓ |
| Keep deploying repo root | |

**Notes:** Add workflow secret/pattern gate before upload.

---

## Deferred

- Full SBOM automation — future phase or optional appendix.
