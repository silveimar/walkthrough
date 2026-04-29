# Feature Landscape

**Domain:** Local-first security hardening for code/content walkthrough generation
**Researched:** 2026-04-29

## Table Stakes

Features maintainers now expect in any security-sensitive local analysis workflow. Missing these creates immediate trust and adoption risk.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Explicit local-only execution mode (no default network egress) | Secure-by-default guidance favors safe defaults over optional hardening after setup | Med | Make local-only the default path; allow explicit opt-in for remote calls with visible warnings and audit marks |
| Sensitive data redaction for prompts, logs, and reports | OWASP logging guidance explicitly warns against logging source code, tokens, secrets, and high-classification data | Med | Must redact before persistence and before console output; include deterministic redaction tests |
| Retention controls and local artifact lifecycle (TTL/purge) | Security logs/artifacts become sensitive stores; retention must be bounded and policy-driven | Med | Add per-artifact retention policy, purge command, and defaults that do not retain raw sensitive payloads indefinitely |
| Secret detection gate before publish/deploy | Existing repo concern shows risk of over-broad publish paths; preflight scanning is a baseline control | Low | Block GitHub Pages/deploy if denylisted patterns or secrets are detected in artifact set |
| Tamper-evident run metadata for eval/generation | Local security workflows still need integrity evidence for "what ran, with what inputs" | Med | Store checksums, tool version, and command provenance per run in a local manifest |
| Hardened process execution (no shell string composition for sensitive paths) | Concern already identified: shell pipeline execution increases injection surface | Low | Replace shell command strings with `spawn`/`execFile`; keep argument arrays explicit |
| CI smoke gate for security contract regressions | Security hardening without continuous enforcement decays quickly | Low | Run subset evals plus security checks on PRs; fail closed on policy violations |

## Differentiators

Features that can make this repository meaningfully better than "secure enough" local tooling.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Policy-as-code security profiles (strict/balanced/dev) | Teams can adopt hardening without forked scripts and can progressively tighten controls | Med | Ship baseline profiles with explicit control deltas (network, retention, redaction strictness, publishing rules) |
| Offline-first dependency mode with vendored or pinned runtime assets | Reduces CDN and supply-chain drift risk for long-lived walkthrough artifacts | High | Build on existing concern about unpinned CDNs; provide `--offline` generation path and pin verification |
| Deterministic contract sidecar (`metadata.json`) for every generated walkthrough | Replaces brittle regex grading with machine-readable, versioned output contract | Med | Enables stable grading, provenance checks, and easier migrations |
| Local provenance attestations for generated artifacts | Gives auditable trust chain even when work stays local | High | Align with SLSA-style provenance concepts (digest, inputs, builder identity) without forcing cloud build infra |
| Security UX guardrails ("unsafe config" warnings and secure defaults wizard) | Cuts misconfiguration by making secure behavior the easiest path | Med | Inspired by secure-by-default guidance: use loosening guides, not hardening guides |

## Anti-Features

Features to explicitly avoid during this hardening initiative.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Auto-uploading prompts/artifacts/logs to cloud services for "convenience" | Violates local-first security goal and increases exposure blast radius | Keep all storage local by default; require explicit per-run opt-in export |
| "Log everything" debugging mode that captures raw analyzed code/content | Contradicts OWASP guidance and turns logs into high-risk data stores | Provide scoped debug logging with redacted fields and short TTL |
| Security model dependent on manual checklist discipline only | Secure-by-default guidance rejects placing core burden on end users | Encode controls in defaults, CI gates, and policy checks |
| Broad repository publishing from root path | Existing deployment concern shows accidental exposure risk | Publish from a dedicated, minimal output directory with denylist preflight |
| One-shot enterprise controls (SIEM/SOC integrations) in MVP hardening phase | High integration cost with low immediate value for local maintainers | Start with local structured audit logs and clean export hooks |

## Feature Dependencies

```text
Explicit local-only execution mode
  -> Sensitive data redaction
  -> Retention controls and local artifact lifecycle
  -> Hardened process execution

Sensitive data redaction
  -> CI smoke gate for security contract regressions
  -> Policy-as-code security profiles

Secret detection gate before publish/deploy
  -> Dedicated publish directory
  -> Offline-first dependency mode

Deterministic contract sidecar (metadata.json)
  -> Tamper-evident run metadata
  -> Local provenance attestations
```

## MVP Recommendation

Prioritize:
1. Explicit local-only execution mode (default deny outbound network and remote sinks)
2. Sensitive data redaction + retention controls (protect at-rest and generated artifacts)
3. Secret/publish preflight gate + CI enforcement (prevent accidental disclosure regressions)

Then add one differentiator:
4. Deterministic contract sidecar (`metadata.json`) to stabilize grading and security verification

Defer:
- Local provenance attestations: valuable, but higher complexity and better after sidecar contract is stable.
- Full offline vendoring mode: strategically important but operationally heavier than first-pass hardening controls.

## Sources

- OWASP Logging Cheat Sheet (sensitive data exclusions, log protection): [https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) (HIGH)
- OWASP ASVS v4 logging controls (no credentials/sensitive data logging, log integrity): [https://github.com/OWASP/ASVS/blob/master/4.0/en/0x15-V7-Error-Logging.md](https://github.com/OWASP/ASVS/blob/master/4.0/en/0x15-V7-Error-Logging.md) (HIGH)
- CISA Secure by Design and Default guidance (secure defaults, reduced end-user hardening burden): [https://www.cisa.gov/resources-tools/resources/secure-by-design-and-default](https://www.cisa.gov/resources-tools/resources/secure-by-design-and-default) (HIGH)
- SLSA Build requirements (provenance integrity/isolation concepts): [https://slsa.dev/spec/v1.2/build-requirements](https://slsa.dev/spec/v1.2/build-requirements) (HIGH)
- Project-local evidence from current repo concerns and requirements: `.planning/PROJECT.md`, `.planning/codebase/CONCERNS.md` (HIGH for repo-specific risks)
