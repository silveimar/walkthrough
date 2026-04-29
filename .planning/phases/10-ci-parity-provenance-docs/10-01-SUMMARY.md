# Plan 10-01 Summary — CI scope & provenance docs

**Completed:** 2026-04-29  
**Requirements:** PLT-04, ATT-05

## Delivered

- **`CONTRIBUTING.md`:** New **CI automation scope (PLT-04)** — `ci.yml` is `ubuntu-latest` only; Windows/WSL remains manual smoke.
- **`provenance/README.md`:** Replaced obsolete **ENABLE_PROVENANCE_VERIFY** / optional CI wording with **always-on** `verify-provenance.mjs` description matching **`.github/workflows/ci.yml`**.

## Verification

- Confirmed **`ci.yml`** has unconditional provenance step (no `vars.ENABLE_*`).
