# Phase 8: Signed provenance - Discussion Log

> **Audit trail.** Phase run with **`--auto`**: all gray areas auto-selected; choices use recommended defaults per `discuss-phase/modes/auto.md`.

**Date:** 2026-04-29
**Phase:** 08-signed-provenance
**Mode:** `--auto --chain`

---

## Gray areas auto-selected

`[--auto] Selected all gray areas: Signing tool, Manifest scope & layout, Verification UX, Data-protection exclusions`

---

## Signing tool (ATT-02)

**[auto]** → **Minisign** as primary documented tool; Cosign/GPG as documented alternates only unless implementation trivial.

---

## Manifest scope (ATT-01)

**[auto]** → Compact JSON manifest hashing **`security/security-policy.json`** and **`vendor/walkthrough-viewer/manifest.json`** by SHA-256 (reference integrity, not embedding all vendor paths in the signed payload).

---

## Verification (ATT-03)

**[auto]** → Node **`scripts/verify-provenance.mjs`** + `minisign verify`; local-first; CI optional.

---

## Data protection (ATT-04)

**[auto]** → Explicit exclusion of **`evals/results/`** and sensitive outputs from any attestable file lists; document alignment with `dataProtection` in policy.

---

## CI (ATT-05)

**[auto]** → Optional CI job/step gated by env or documented toggle so default contributors are not blocked.

---

## Deferred

- Enterprise PKI / Sigstore — future milestone.
