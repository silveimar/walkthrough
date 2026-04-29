# Phase 9: Vendor reproducibility & offline path - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

**v2.1 gap closure** for audit findings **OFF-01**, **OFF-03**, **OFF-06**: align maintainer-facing documentation with actual repo behavior so (a) reproducible vendor installs are documented truthfully, (b) **default CDN vs explicit vendor mode** in `security/security-policy.json` is obvious, and (c) the **end-to-end path** from clone → optional vendor policy flip → `npm ci` + vendor sync → provenance rebuild (when needed) → `evals/run.sh` is discoverable.

Phase **does not** implement Phase 10 (PLT-04 / ATT-05 doc alignment) or Phase 11 (retroactive VERIFICATION.md).

</domain>

<decisions>
## Implementation Decisions

### Lockfile & OFF-03 (reproducible install)

- **D-01:** **`package-lock.json` is present at repo root** (committed; ~2800 lines). The v2.0 audit’s “no lockfile” finding is **stale relative to current tree**. Remediation is **documentation alignment** — update generated/stack summaries that still claim “no lockfile”, and ensure `vendor/walkthrough-viewer/README.md` states that **`npm ci` requires that lockfile at repo root**.
- **D-02:** **Do not introduce a second package manager or alternate lockfile location.** Repo-root **`npm ci`** remains the canonical vendor tooling path (matches `scripts/sync-walkthrough-vendor.mjs` and Phase 06 plans).

### Where docs live (OFF-01 / OFF-06)

- **D-03:** **`CONTRIBUTING.md` is the canonical maintainer checklist** for vendor/offline-capable workflows (default CDN, switching packages to `vendor`, regen commands, provenance manifest refresh). **`README.md`** keeps a **short pointer** under Testing → link to CONTRIBUTING.
- **D-04:** **`vendor/walkthrough-viewer/README.md`** stays focused on **regenerate** commands; add only a minimal cross-check that the lockfile exists at repo root (one sentence).

### Policy defaults & mental model (OFF-01)

- **D-05:** Document explicitly: **`security/security-policy.json` defaults viewer packages to `cdn`** so fresh clones do **not** copy vendor into eval temp workspaces until maintainers opt in by setting relevant `walkthroughViewerAssets.packages.*.assetSource` values to **`vendor`**. Avoid implying “offline by default.”

### Provenance coupling (OFF-06)

- **D-06:** When maintainers change policy or vendor bytes, **`node scripts/build-provenance-manifest.mjs`** must run before relying on CI provenance verification — already described in CONTRIBUTING for ATT-05; **repeat in the vendor checklist** so Phase 9 closes OFF-06 narrative.

### Claude's Discretion

- Exact wording and section order in CONTRIBUTING/README.
- Whether to add a **CI guard** that fails if `package-lock.json` is missing (optional follow-up; not required to close doc-gap phase).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audit & scope
- `.planning/v2.0-MILESTONE-AUDIT.md` — Original gaps OFF-01, OFF-03, OFF-06; note audit predates committed lockfile in current tree
- `.planning/REQUIREMENTS.md` — v2.1 traceability for Phase 9 rows
- `.planning/ROADMAP.md` — Phase 9 goal and REQ IDs

### Policy & harness
- `security/security-policy.json` — `walkthroughViewerAssets` defaults (`cdn` vs `vendor`)
- `security/policy-runtime.mjs` — `walkthroughPolicyRequiresAnyVendor`, `verifyVendorManifest`
- `evals/run.sh` — Vendor copy + fail-closed preflight when vendor mode required
- `scripts/sync-walkthrough-vendor.mjs` — Regenerate `vendor/walkthrough-viewer` + `manifest.json`
- `scripts/build-provenance-manifest.mjs` — Regenerate `provenance/manifest.json` after policy/vendor changes

### Docs & examples
- `vendor/walkthrough-viewer/README.md` — `npm ci` + sync sequence
- `skills/walkthrough/references/html-patterns.md` — Dual mode (CDN vs relative vendor URLs)
- `CONTRIBUTING.md` — Platform matrix, provenance CI section (ATT-05)

### Prior phase context
- `.planning/phases/06-offline-vendor-and-dual-mode-html/06-CONTEXT.md` — D-03/D-04 granular policy + fail-closed behavior

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable assets
- **Root `package-lock.json`** — Pins npm graph for vendor sync; satisfies OFF-03 when docs reflect reality.
- **`evals/run.sh`** — Already prints vendor manifest failure hint referencing `npm ci` + sync.

### Established patterns
- **Policy-first:** Asset mode lives in JSON; docs must not contradict defaults.
- **Repo-root anchoring:** All scripts assume cwd at repository root for reproducibility.

### Integration points
- **AGENTS.md / `.planning/codebase/STACK.md`** — GSD-generated stack blurbs; must stay consistent with lockfile presence so agents and humans do not see conflicting “missing lockfile” messages.

</code_context>

<specifics>
## Specific Ideas

- Auto mode: prioritized **documentation consistency** over adding new automation in this phase.

</specifics>

<deferred>
## Deferred Ideas

- **Phase 10:** PLT-04 CI matrix vs docs; ATT-05 provenance README vs `ci.yml` wording — separate roadmap phase.
- **Phase 11:** Retroactive `VERIFICATION.md` for all v2.0 REQ-IDs.
- Optional CI job: fail PR if `package-lock.json` deleted — backlog unless requested.

</deferred>

---

*Phase: 09-vendor-repro-offline-docs*
*Context gathered: 2026-04-29*
