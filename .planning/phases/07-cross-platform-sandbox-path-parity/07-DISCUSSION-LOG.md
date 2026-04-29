# Phase 7: Cross-platform sandbox & path parity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `07-CONTEXT.md`.

**Date:** 2026-04-29
**Phase:** 07-cross-platform-sandbox-path-parity
**Areas discussed:** Windows scope, Path & temp contract, CI / smoke, Policy enforcement (no Docker)

---

## Windows support scope

| Option | Description | Selected |
|--------|-------------|----------|
| Git Bash primary | Git Bash primary supported; WSL optional | |
| WSL primary | WSL2 Ubuntu primary on Windows | |
| Docs matrix + manual smoke first | Document matrix (Git Bash + WSL); parity = same Node+bash scripts; PLT-04 via documented manual smoke before optional CI | ✓ |

**User's choice:** Document matrix (Git Bash + WSL) with parity meaning consistent Node+bash behavior; no commitment to Windows CI yet—manual smoke first.

**Notes:** Aligns with PLT-01/02 documentation-first and PLT-04 allowing documented smoke.

---

## Path & temp parity

| Option | Description | Selected |
|--------|-------------|----------|
| Node-first | Centralize in policy-runtime; thin bash | |
| Bash + Node split | Portable bash for dirs/copy; policy-runtime for assertions | ✓ |
| Test harness first | Node tests drive minimal run.sh changes | |

**User's choice:** Explicit split — normalize risky bash paths with portable patterns; policy-runtime holds policy assertions.

---

## CI / smoke

| Option | Description | Selected |
|--------|-------------|----------|
| windows-latest light job | Add Windows job with key scripts | |
| Ubuntu + Node tests only | Stay Linux CI; path tests in Node | |
| Docs + manual checklist first | PLATFORM/CONTRIBUTING + checklist; Windows CI in phase only if small | ✓ |

**User's choice:** Ship documentation and manual checklist first; optional small CI job only if effort stays low.

---

## Policy enforcement (Docker optional)

| Option | Description | Selected |
|--------|-------------|----------|
| Strict cwd in CI | Enable `WALKTHROUGH_STRICT_CWD` in CI | ✓ |
| No strict cwd in default CI | Document opt-in only | |
| CLI allowlist later | Document CLIs; Docker optional | |

**User's choice:** Turn on strict cwd in CI for automated enforcement of RUN-03 alongside other signals.

---

## Claude's Discretion

- Doc filenames and exact CI step layout for `WALKTHROUGH_STRICT_CWD`.
- Optional Windows job scope if included.

## Deferred Ideas

- Full Windows CI matrix with eval — deferred until after docs/manual smoke path is established.
