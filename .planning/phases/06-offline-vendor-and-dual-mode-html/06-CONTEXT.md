# Phase 6: Offline vendoring & dual-mode HTML - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **ADV-01 / OFF-01..OFF-06**: reproducible frozen vendor layout + integrity manifest; policy-driven **CDN vs vendor** dual mode for walkthrough viewer assets; `html-patterns.md` and deterministic graders aligned; `evals/run.sh` copies vendor into temp workspace with **fail-closed** behavior when vendor mode is active but assets/manifest are wrong.

Phase **does not** implement signed provenance (Phase 8) or cross-platform sandbox parity depth (Phase 7); those phases consume vendor/manifest outputs from this phase.

</domain>

<decisions>
## Implementation Decisions

### Tailwind & styling (vendor vs CDN)
- **D-01:** Tailwind offline strategy is **deferred to planner/research** — choose the smallest maintainable path that satisfies OFF requirements (likely precompiled CSS or equivalent static artifact vs Play CDN in vendor mode). User asked for planner discretion.

### Shiki / syntax highlighting
- **D-02:** Shiki vendor/offline path is **deferred to planner/research** — balance full fidelity (`vitesse-dark`, ESM graph, WASM) vs staged subset; user asked for planner discretion. Planner MUST align `html-patterns.md` contract with whatever subset is chosen.

### Policy schema (`security/security-policy.json`)
- **D-03:** Use **granular policy keys per asset class** (e.g. separate knobs or sources for React/Mermaid/Tailwind/Shiki bundles), **not** only a single global `walkthroughAssetMode`. Graders and `policy-runtime.mjs` must still resolve an effective mode consistently — document precedence rules when implementing.

### Failure behavior (vendor mode)
- **D-04:** **Strict fail-closed** when policy requires vendor mode but vendor tree or integrity manifest is missing or invalid: **no silent fallback to CDN fetch**; `evals/run.sh` / preflight should exit non-zero. Align messaging with existing egress/redaction posture.

### Claude's Discretion
- Tailwind build/layout pipeline details (see **D-01**).
- Shiki packaging depth and vendoring mechanics (see **D-02**).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, OFF-01..OFF-06 mapping
- `.planning/REQUIREMENTS.md` — Authoritative REQ IDs for traceability

### Skill contract & HTML
- `skills/walkthrough/skill.md` — Walkthrough generation triggers and workflow
- `skills/walkthrough/references/html-patterns.md` — CDN script tags, Shiki ESM import, Tailwind config block, React UMD — **must stay consistent with dual mode**

### Policy & eval harness
- `security/security-policy.json` — Extend with vendor roots / per-asset controls per **D-03**
- `security/policy-schema.json` (if present) / `scripts/verify-policy` — Schema parity for new keys
- `security/policy-runtime.mjs` — Enforcement hooks for asset mode and vendor paths
- `evals/run.sh` — Temp workspace, skill copy; extend for vendor copy **D-04**
- `evals/graders/deterministic.mjs` — Structural checks; branch CDN vs vendor expectations per policy

### Examples & research
- `examples/walkthrough-how-it-works.html` — Reference artifact showing current CDN wiring
- `.planning/research/SUMMARY.md` — v2.0 research synthesis (ordering ADV-01 → ADV-03 → ADV-02)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`examples/walkthrough-how-it-works.html`** — Working pattern for React UMD + Mermaid + Tailwind CDN + Shiki module script; dual-mode changes should preserve behavioral parity in each mode.
- **`evals/graders/deterministic.mjs`** — Today enforces structural CDN markers; extend to policy-aware vendor-relative checks instead of one hard-coded shape.

### Established Patterns
- **Policy-in-the-middle:** `security/security-policy.json` + `policy-runtime.mjs` gate egress and paths — vendor roots should plug into the same model (**D-03**).
- **No bundler for generated HTML** — Any build step for Tailwind/CSS vendor artifacts is a **maintainer** workflow addition, not assumed in generated skill output unless skill is updated to emit build artifacts.

### Integration Points
- **`evals/run.sh`** copies skill/eval inputs into temp workspace — vendor tree must be included when vendor mode is on (**OFF-06**, **D-04**).
- **Git:** introducing `package-lock.json` / npm vendor sync touches repo hygiene — align with OFF-03 reproducibility.

</code_context>

<specifics>
## Specific Ideas

- User prefers **granular policy keys** over a single global asset mode flag (**D-03**).
- Offline Tailwind and Shiki mechanics explicitly left to **planner** to minimize discuss-session binding errors (**D-01**, **D-02**).

</specifics>

<deferred>
## Deferred Ideas

**None** — discussion stayed within Phase 6 scope.

</deferred>

---
*Phase: 6-offline-vendor-and-dual-mode-html*
*Context gathered: 2026-04-29*
