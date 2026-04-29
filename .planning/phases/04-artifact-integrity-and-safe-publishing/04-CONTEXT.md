# Phase 4: Artifact Integrity and Safe Publishing - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Provide **verifiable integrity signals** for generated walkthrough artifacts (deterministic metadata sidecars), **maintainer-run checks** that reproduce hash/signature-style evidence before sharing outputs, and **fail-closed publishing** so GitHub Pages (and any future publish path) only uploads explicitly approved roots and passes secret-leak screening. This phase covers INTG-01, INTG-02, INTG-03 — not continuous drift governance (Phase 5) or deep SBOM platform integration unless scoped as optional documentation.

</domain>

<decisions>
## Implementation Decisions

### Metadata sidecars (INTG-01)
- **D-01:** Sidecars are **JSON files** adjacent to each published or graded `walkthrough-*.html` artifact (same basename + `.meta.json` or fixed naming convention documented in `skills/walkthrough/references/html-patterns.md`).
- **D-02:** Minimum reproducible fields: `artifactSha256` (of canonical HTML bytes), `generatorId` (walkthrough skill / repo semver or git describe placeholder), `policyVersion` (from `security/security-policy.json` version), `createdAt` (UTC ISO string). Exact schema validated by a small JSON Schema or inline checks in verify script.
- **D-03:** Eval harness and/or graders **emit or validate** sidecars for outputs under `evals/results/` where HTML exists; the **example** under `examples/` carries a checked-in sidecar as reference.

### Integrity verification workflow (INTG-02)
- **D-04:** Ship **`scripts/verify-artifact-integrity.mjs`** (or equivalent) runnable locally and invocable from CI: recomputes SHA-256 for targeted HTML files and compares to sidecar; mismatch fails non-zero.
- **D-05:** **Optional second signal:** document running `npm`/OS tools only if added without heavy deps — prefer **hash-only** as the required gate; SBOM/vuln language in requirements is satisfied by **documented optional** steps (e.g. link to GitHub dependency graph) unless a zero-dep scanner fits — primary gate is **hash verification + policy version alignment**.

### Publish scope and secret gates (INTG-03)
- **D-06:** **Narrow GitHub Pages artifact** from repository root `.` to a **dedicated subtree** (recommended: `examples/` plus minimal assets needed for demo; exclude `.planning`, `evals/results`, raw prompts). Update `.github/workflows/static.yml` `upload-pages-artifact` path accordingly.
- **D-07:** Align **`publish.approvedPathRoots`** in `security/security-policy.json` with the CI `PUBLISH_ARTIFACT_PATH` env so policy verification and workflow stay single-source.
- **D-08:** Add a **pre-upload secret-leak check** step in the workflow (pattern-based scan or `gitleaks`/similar Action if acceptable to maintainer) scoped to the publish subtree — fail workflow on high-confidence matches.

### Claude's Discretion
- Exact sidecar filename suffix (`.meta.json` vs `.walkthrough.json`).
- Choice of community Action for secret scanning vs minimal custom Node grep — must meet fail-closed behavior.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope
- `.planning/ROADMAP.md` — Phase 4 goals and INTG requirements.
- `.planning/REQUIREMENTS.md` — INTG-01, INTG-02, INTG-03.

### Publishing and policy
- `.github/workflows/static.yml` — current Pages deploy and policy gates.
- `security/security-policy.json` — `publish.approvedPathRoots`, version field.
- `security/policy-runtime.mjs` — `assertPublishArtifactPathAllowed`.

### Content contracts
- `skills/walkthrough/references/html-patterns.md` — generated artifact shape.
- `examples/walkthrough-how-it-works.html` — reference consumer artifact.

### Prior phases
- `.planning/phases/03-data-redaction-and-retention-controls/03-CONTEXT.md` — sensitive eval paths (publish must not include them).

### Risks
- `.planning/codebase/CONCERNS.md` — full-repo Pages upload risk.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- CI already runs `scripts/verify-policy` and Node assert for publish path.
- Deterministic grader reads HTML structure — sidecar validation can live beside grading or in a dedicated verify script.

### Integration Points
- Workflow `Upload artifact` step path change is the main INTG-03 lever.
- Policy `publish.approvedPathRoots` must change in lockstep with workflow env.

</code_context>

<specifics>
## Specific Ideas

`/gsd-discuss-phase 4 --chain`: Prefer **examples-only** publish tree and **hash sidecars** as the concrete integrity story before optional SBOM complexity.

</specifics>

<deferred>
## Deferred Ideas

- Full SPDX SBOM generation for CDN-loaded browser deps — defer to documentation or Phase 5 if scope grows.
- Signed attestations / Sigstore — out of Phase 4 scope.

</deferred>

---

*Phase: 04-artifact-integrity-and-safe-publishing*
*Context gathered: 2026-04-29*
