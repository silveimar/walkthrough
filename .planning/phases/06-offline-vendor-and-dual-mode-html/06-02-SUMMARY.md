# Plan 06-02 Summary — html-patterns, example, deterministic grader

**Completed:** 2026-04-29  
**Requirements:** OFF-01, OFF-05

## Delivered

- `skills/walkthrough/references/html-patterns.md`: **Dual mode** section (CDN vs vendor, policy reference, layout under `vendor/walkthrough-viewer/`).
- `examples/walkthrough-how-it-works.html`: comment linking policy defaults and dual-mode docs (remains **CDN** example).
- `evals/graders/deterministic.mjs`: Tier 2 uses `resolveAssetSource` per package; single-file mode `node deterministic.mjs <file.html>` for maintainer checks.

## Verification

- `node evals/graders/deterministic.mjs examples/walkthrough-how-it-works.html` — exit 0  
