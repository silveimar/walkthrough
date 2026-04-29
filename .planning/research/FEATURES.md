# Feature Research

**Domain:** Walkthrough Skill Local Security Hardening — v2.0 Advanced Local Hardening (brownfield: Claude Code skill + local eval harness)  
**Researched:** 2026-04-29  
**Confidence:** MEDIUM

## Expected maintainer behaviors (v2.0)

| Behavior | Success looks like |
|----------|-------------------|
| **Run eval offline** | `evals/run.sh` (and skill-adjacent flows) complete without mandatory network fetches for pinned tooling/assets; failures are explicit (“missing vendor bundle”) not opaque timeouts. |
| **Verify artifact provenance** | Maintainer can check integrity/origin signals on walkthrough outputs or policy-relevant metadata using documented keys, manifests, and verification steps aligned with a **local trust model** (not enterprise PKI by default). |
| **Cross-platform parity** | Same documented constraints and outcomes for subprocess/workspace isolation on macOS, Linux, and Windows dev machines; scripts fail consistently or succeed consistently—not divergent behavior per OS. |

---

## ADV-01 — Offline / vendored dependencies

Reproducible, isolated operation: eval and skill workflows avoid mandatory CDN/runtime downloads where feasible.

### Table stakes (users expect these)

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Documented offline prerequisites | Maintainers assume they can prepare once, then run air-gapped | LOW | Single doc: what must be vendored, where it lives, version pins |
| Pinned or vendored eval-critical assets | Eval repeatability breaks if Shiki/Tailwind/CDN fetches differ day to day | MEDIUM | Align with existing deterministic grader expectations; separate “full fidelity” vs “offline stub” if needed |
| Explicit failure when network required | Silent hangs undermine trust in local security posture | LOW | Detect missing bundles early; message names missing artifact |
| Reproducible install path for vendored deps | “Works on my machine” defeats brownfield hardening | MEDIUM | Script or manifest listing hashes + extraction layout |

### Differentiators (valued, not universal)

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Single-command vendor refresh | Low friction keeps velocity; matches Core Value | MEDIUM | e.g. script that downloads permitted versions into `vendor/` with checksum verification |
| Scope-tiered offline (eval-only vs full skill demo) | Lets teams prioritize harness without blocking all HTML CDN usage | MEDIUM | Clear matrix: what runs fully offline vs degraded mode |
| Integrity manifests for vendor trees | Ties ADV-01 to ADV-02 story without forcing signatures on day one | MEDIUM | Hash manifest per vendor drop enables later signing |

### Anti-features (avoid)

| Feature | Why requested | Why problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Vendor *everything* including browser UMD stacks | “100% offline” absolutism | Huge repo, legal review of vendored UMD, churn | Tier: vendor eval-critical first; document CDN for optional demo HTML |
| Silent fallbacks to network | Convenience | Violates offline guarantee and security expectations | Fail closed or explicit `ALLOW_NETWORK=1` |
| Duplicate package managers / lockfiles without policy | “Just add npm” | Conflicts v1.0 style (no root lockfile today) and adds supply-chain surface | One blessed vendor mechanism under `security/` or `scripts/` + policy entry |

---

## ADV-02 — Signed provenance attestations

Integrity and origin signals for walkthrough outputs and/or policy-relevant metadata; aligned with **local** trust (maintainer keys, not implied enterprise CA).

### Table stakes (users expect these)

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear definition of “what is signed” | Ambiguity → skipped verification | LOW | Artifacts, manifests, or summary JSON scopes |
| Verify instructions runnable locally | Offline/air-gapped verification path | MEDIUM | Minimize cloud-only services |
| Key management story for maintainers | Signing without a SaaS is non-obvious | MEDIUM | Document ed25519/minisign/cosign-local patterns; pick one |
| Tamper-evident storage alongside eval results | Provenance useless if results tree is mutable | LOW | Align with `evals/results/` governance from v1.0 |

### Differentiators (valued, not universal)

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Detached signatures + sidecar metadata | Standard UX for security-conscious repos | MEDIUM | `.sig` or DSSE envelope next to artifact |
| Binding signature to policy hash | Proves run complied with `security-policy.json` version | HIGH | Strong audit narrative for internal reviews |
| Optional CI verification job | Catches regression without blocking local-only users | MEDIUM | Read-only check on PR |

### Anti-features (avoid)

| Feature | Why requested | Why problematic | Alternative |
|---------|---------------|-----------------|------------- |
| Full SLSA L4 / enterprise PKI | “Industry best practice” | Overkill for local-first; operational burden | Document ladder: optional CI provenance; local signing first |
| Signing *inside* the LLM | Provenance of thought | Nonsense cryptographically | Sign **outputs** and **tool-generated manifests** only |
| Implicit trust of CDN URLs in signature | Short sig chains | Breaks when URLs move | Sign content **after** vendor layout resolved (hash trees) |

---

## ADV-03 — Cross-platform sandbox parity

Predictable subprocess/workspace constraints on macOS, Linux, and Windows.

### Table stakes (users expect these)

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Documented supported shells and runners | Windows vs bash assumptions break scripts | LOW | `evals/run.sh` may stay bash if Git Bash/WSL documented |
| Consistent path semantics | Mixed separators and temp dirs cause flaky eval | MEDIUM | Normalize via helper or Node orchestration where bash is limiting |
| Same security policy interpretation per OS | Policy must not mean stricter on one OS accidentally | MEDIUM | Test matrix in CI or documented manual checklist |
| Bounded subprocess behavior | Sandboxing story requires defined argv, cwd, env | HIGH | Align with existing temp workspace pattern in `evals/run.sh` |

### Differentiators (valued, not universal)

| Feature | Value proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Optional devcontainer / Codespaces recipe | One parity surface for all hosts | MEDIUM | Not replacing native Windows support—complements |
| Platform-specific capability flags in policy | Honest gaps (e.g. no `unshare` on macOS) | MEDIUM | `security-policy.json` extensions per OS |
| Single Node-based orchestrator entry | Reduces bash-only divergence | HIGH | Large change—phase only if roadmap demands |

### Anti-features (avoid)

| Feature | Why requested | Why problematic | Alternative |
|---------|---------------|-----------------|------------- |
| “Real” OS-level sandbox on every platform uniformly | Security parity | macOS sandbox profiles ≠ Linux namespaces ≠ Windows Job Objects | Document **equivalent guarantees** (paths, network off) not identical APIs |
| Rewriting entire harness in PowerShell | Windows parity | Duplication and drift | Git Bash/WSL + minimal shims, or Node driver |
| Ignoring Windows because “maintainers use Mac” | Scope reduction | Conflicts stated v2.0 goal | Smoke path + CI job |

---

## Feature dependencies

```
ADV-01 (vendored/offline assets)
    └──requires──> Manifests / hashes (integrity inputs)
                       └──enables──> ADV-02 (sign those manifests + artifacts)

ADV-03 (sandbox parity)
    └──requires──> Stable artifact paths + subprocess contract (feeds ADV-01 layout expectations)

ADV-02 (signing)
    └──enhances──> ADV-01 (vendor tarball authenticity)
    └──conflicts──> “Silent network fetch” anti-pattern from ADV-01
```

### Dependency notes

- **ADV-01 → ADV-02:** Signing needs stable content identifiers; vendor manifests are natural sign targets.
- **ADV-03 → ADV-01:** Offline bundles must land in predictable locations across OSes or verification and sandbox mounts break.
- **ADV-02 vs implicit network:** Signature verification must not assume phone-home or key escrow.

---

## MVP definition (milestone v2.0)

### Launch with (v2.0 core)

- [ ] **ADV-01 — Minimum viable offline path** — Documented vendor layout + eval completes without mandatory CDN for harness-critical pieces; explicit env/flags for degraded vs strict offline.
- [ ] **ADV-02 — Minimum viable provenance** — One signing format (recommendation: minisign or Sigstore key locally) + verify docs + optional CI check.
- [ ] **ADV-03 — Documented parity baseline** — Supported platforms matrix; `evals/run.sh` behavior contract; known gaps listed with mitigations (WSL/Git Bash).

### Add after validation (v2.x)

- [ ] Automated vendor refresh in CI on schedule — trigger: repeated drift incidents.
- [ ] Policy-bound signed attestations linking policy hash — trigger: audit request.
- [ ] Native Windows runner without bash — trigger: maintainer pool blocks on WSL.

### Future consideration (post–v2.x)

- [ ] Full HTML viewer offline parity (all CDNs vendored) — defer: cost/size vs benefit.
- [ ] Hardware tokens / org PKI — defer: out of local-first scope.

---

## Feature prioritization matrix

| Feature | User value | Implementation cost | Priority |
|---------|------------|---------------------|----------|
| ADV-01 vendor + offline eval path | HIGH | MEDIUM | P1 |
| ADV-02 sign + verify docs | HIGH | MEDIUM | P1 |
| ADV-03 parity docs + smoke matrix | HIGH | LOW–MEDIUM | P1 |
| ADV-01 automated vendor refresh | MEDIUM | MEDIUM | P2 |
| ADV-02 CI verification job | MEDIUM | LOW | P2 |
| ADV-03 Node orchestrator | MEDIUM | HIGH | P3 |

**Priority key:** P1 = must ship in v2.0; P2 = should ship if capacity; P3 = nice / defer.

---

## Ecosystem / analog feature analysis

| Capability | Typical analog | Our approach |
|------------|----------------|--------------|
| Offline tooling | Go modules vendor, `pnpm fetch`, Bazel mirrors | Single-repo vendor drops + policy allowlist |
| Provenance | SLSA, in-toto, Sigstore | Local-first signing; optional CI attestation later |
| Sandbox parity | Docker, devcontainers, GitHub Actions `container:` | Document native paths first; optional container as parity accelerator |
| Skill artifacts | Claude Code plugins | Keep skill contract in Markdown; hardening stays repo mechanics |

---

## Sources

- `.planning/PROJECT.md` — v2.0 goals, ADV-01–03 definitions, constraints, out-of-scope (2026-04-29).
- Repository context: architecture spec-driven skill (`skills/walkthrough/*`), eval harness (`evals/run.sh`, graders), v1.0 completed security/policy baseline.

---

*Feature research for: Walkthrough Skill Local Security Hardening v2.0 Advanced Local Hardening*  
*Researched: 2026-04-29*
