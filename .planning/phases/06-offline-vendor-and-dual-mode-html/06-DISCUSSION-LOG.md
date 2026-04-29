# Phase 6: Offline vendoring & dual-mode HTML - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `06-CONTEXT.md`.

**Date:** 2026-04-29
**Phase:** 06-offline-vendor-and-dual-mode-html
**Areas discussed:** Tailwind offline, Shiki vendor path, Policy schema surface, Fail-closed behavior

---

## Tailwind offline

| Option | Description | Selected |
|--------|-------------|----------|
| Precompiled CSS in vendor; CDN mode keeps Play CDN | Static CSS artifact for vendor mode | |
| Hand-maintained minimal CSS | No Tailwind build pipeline | |
| Planner discretion | Smallest maintainable approach | ✓ |

**User's choice:** Planner discretion.
**Notes:** Align with OFF requirements; research favors precompiled CSS over Play CDN for true offline.

---

## Shiki / syntax highlighting

| Option | Description | Selected |
|--------|-------------|----------|
| Full offline Shiki | Vendor wasm/themes for full fidelity | |
| Pinned npm copy + manifest | Reproducible subset under vendor | |
| Planner discretion | Balance fidelity vs effort | ✓ |

**User's choice:** Planner discretion.

---

## Policy surface

| Option | Description | Selected |
|--------|-------------|----------|
| Single `walkthroughAssetMode` | One enum cdn vs vendor | |
| Granular keys per asset class | react, mermaid, tailwind, shiki, etc. | ✓ |
| Minimal schema delta | Planner decides | |

**User's choice:** Granular keys per asset class.

---

## Fail-closed behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Strict | Exit non-zero; no silent CDN fetch | ✓ |
| CI strict / local warn + escape hatch | Documented env | |
| Planner default strict | | |

**User's choice:** Strict fail-closed everywhere.

---

## Claude's Discretion

- Tailwind pipeline and artifact shape (**D-01** in CONTEXT).
- Shiki vendoring depth and packaging (**D-02** in CONTEXT).

## Deferred Ideas

- None recorded.
