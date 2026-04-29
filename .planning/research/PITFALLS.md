# Pitfalls Research

**Domain:** Local-first Claude skill + Node eval repo — offline vendoring, signed provenance, cross-platform sandbox (Walkthrough Skill Local Security Hardening v2.0)

**Researched:** 2026-04-29

**Confidence:** MEDIUM (domain patterns and common failure modes are well documented in supply-chain and cross-platform literature; exact phase numbering assumes roadmap aligns with ADV-01/02/03 — adjust mapping if phases are renumbered)

## Critical Pitfalls

### Pitfall 1: Supply chain theater (checks that do not bind to actual artifacts)

**What goes wrong:**
CI or local scripts “verify” dependencies or outputs using hashes, signatures, or policies that are never enforced at the point of use. Examples: signing release tarballs but serving HTML that still loads CDN scripts; recording `package-lock.json` hashes without `npm ci` in eval; attesting a folder while graders read a different path.

**Why it happens:**
Teams add gates where tooling is easy (GitHub Actions, a single script) instead of where consumption happens (eval harness, browser-loaded assets, subprocess cwd). Policy documents and `security-policy.json` can drift from runtime behavior.

**How to avoid:**
Define a **consumption graph**: for each executable path (eval shell → Node graders → generated HTML → browser), list the artifact and the verification step that must pass *immediately before* that step runs. Use one policy file as source of truth and have runners fail closed when vendored paths are missing or signatures invalid. Treat “we sign something” as insufficient without “the thing that runs is what was signed.”

**Warning signs:**
Verification runs only in CI, not in `evals/run.sh`-equivalent local flows; attestations cover repo root but not `evals/results/` or temp workspaces; green CI with `SKIP_LLM` but full eval still hitting the network.

**Phase to address:**
**ADV-02** (provenance must bind to artifacts actually executed); **ADV-01** (offline pins must be what eval resolves). Cross-check in a dedicated verification phase or gate before milestone close.

---

### Pitfall 2: Broken offline mirrors (stale, incomplete, or wrong-scope vendoring)

**What goes wrong:**
“Offline mode” works on one maintainer machine but fails in CI or on Windows: vendored assets are incomplete (only some CDNs mirrored), version skew between vendor snapshot and lockfile, or mirror paths break when the working directory changes. Eval appears reproducible until someone clones fresh or runs from a different drive.

**Why it happens:**
Vendoring is treated as a one-time copy instead of a **rebuildable contract**. Script assumes Unix paths, relative imports from a single cwd, or npm packages without optional deps needed on another OS. Lockfiles updated without refreshing vendor trees.

**How to avoid:**
Treat the vendor directory + lockfile + manifest (e.g. list of URLs and expected integrity fields) as one unit; automate regeneration (`npm ci` + vendor sync) and fail if hashes drift. Run eval **from a clean checkout** in CI and optionally from a second OS matrix row. Document minimal disk layout and require scripts to use repo-root–anchored paths (`PROJECT_DIR` pattern already in `evals/run.sh` — extend consistently).

**Warning signs:**
First-run docs say “copy these files manually”; different behavior with `bash evals/run.sh` vs `sh`; intermittent failures when cache is cold; works only after an undocumented `curl` prefetch.

**Phase to address:**
**ADV-01**. Verification: fresh clone + offline flag + deterministic grader must pass without network.

---

### Pitfall 3: Signature UX that blocks maintainers or encourages bypass

**What goes wrong:**
Signing requires hardware tokens, cloud KMS, or interactive prompts on every eval run. Developers disable verification locally “just for now,” and those flags become permanent. Alternatively, signatures are so opaque that no one knows what failed when verification breaks.

**Why it happens:**
Provenance design optimizes for strongest crypto instead of **local trust model** (single maintainer machine, org-internal keys, no HSM). Error messages expose stack traces but not “which file, which key id, which policy rule.”

**How to avoid:**
Separate **authoring** trust (optional, stronger) from **CI/release** trust (automated key). Support local verification with clear, copy-paste remediation (“re-run vendor sync,” “export KEY_FILE”). Default local dev path: verify signatures in CI and optional strict mode locally; document `STRICT_PROVENANCE=1` vs relaxed defaults. Log verification outcomes into existing eval result JSON (redacted per policy) so failures are inspectable.

**Warning signs:**
README lists five env vars for keys; wiki page “how to turn off signing”; issues titled “works on my machine / CI broken.”

**Phase to address:**
**ADV-02** for design; **ADV-01** if signing keys are tied to vendored trust roots. Add UX/error-design tasks in the same phase as signing implementation, not as follow-up.

---

### Pitfall 4: Windows path and shell assumptions (CRLF, spaces, drive letters, Git Bash vs PowerShell)

**What goes wrong:**
Bash scripts assume `/` paths and GNU `readlink`; Node resolves paths differently when `evals` is on `D:\`. Copy commands use `cp` without portable alternatives. JSON or HTML paths embed backslashes that break in URLs or shell escaping.

**Why it happens:**
Primary development on macOS/Linux; Windows added later. Tests never run `evals/run.sh` under Git Bash or `npm` scripts under `cmd.exe`.

**How to avoid:**
In shell: quote all variables; prefer Node or `node -e` for path normalization when logic is non-trivial. In Node: use `path.join`, `fileURLToPath`, avoid concatenating repo segments by hand. Add CI matrix **windows-latest** for at least smoke: `node evals/graders/deterministic.mjs` on a fixture, or minimal `run.sh` equivalent via `bash` from Git for Windows. Document required shell (Git Bash vs WSL) explicitly.

**Warning signs:**
Issues with paths containing spaces; intermittent path length errors; scripts that use `sed`/`grep` in ways that differ on Windows.

**Phase to address:**
**ADV-03** (sandbox + parity). Treat Windows as a first-class dev target for the harness, not only macOS.

---

### Pitfall 5: Docker-as-sandbox is not default on macOS (and is a weak default elsewhere)

**What goes wrong:**
The team standardizes on “run eval in Docker” for isolation, but Docker Desktop is optional, licensing changed historically, and Apple Silicon adds friction. New contributors skip sandbox entirely or run privileged containers that widen attack surface. Linux hosts assume `docker` in PATH; CI uses different socket permissions than laptops.

**Why it happens:**
Docker is conflated with **reproducibility** and **security**. For local-first repos, Docker is one backend among many; without a fallback, parity promises fail.

**How to avoid:**
Define sandbox **interfaces** (resource limits, filesystem allowlist, no network) with **pluggable backends**: e.g. `none` (document risks), `sandbox-exec`/`seatbelt` on macOS, `bubblewrap`/`firejail` on Linux, `Docker` when available. Document macOS default: no Docker required for basic eval; Docker is optional hardening. CI uses the same interface with a Linux-focused backend.

**Warning signs:**
README starts with “install Docker”; issues complaining Docker won’t start; eval instructions differ between “quick start” and “secure run.”

**Phase to address:**
**ADV-03**. Do not make ADV-01/02 depend on Docker being installed globally.

---

### Pitfall 6: Sandbox escapes via the subprocess boundary you forgot (skills, `claude`, temp dirs)

**What goes wrong:**
Filesystem sandbox applies to `node` but not to `claude -p`, or temp workspaces are world-readable. Sandboxing reduces eval reproducibility (non-deterministic mounts) without improving confidentiality.

**Why it happens:**
Partial instrumentation: only the grader is sandboxed while the prompt runner has full user privileges; or policy defines protected paths but the skill copies repo content to `/tmp` outside the policy.

**How to avoid:**
Threat-model **each spawn**: who reads secrets, who writes `evals/results/`, who reads analyzed repos. Align `security-policy.json` paths with actual temp workspace roots. Prefer explicit allowlists over “block known bad paths.”

**Warning signs:**
Policy mentions paths that don’t exist on Windows; sandbox allows `$HOME` broadly.

**Phase to address:**
**ADV-03**, validated against v1.0 policy-runtime assumptions (redaction, retention).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| “Pin versions in README only” | No vendor dir to maintain | Drift, non-reproducible evals | Never for ADV-01 success criteria |
| Optional `--no-verify` on every command | Faster iteration | Permanent bypass culture | Short spike only; never in default help text as recommended |
| Docker-only scripts | One path to document | Excludes default macOS/laptop workflows | Document as optional hardening only |
| Sign only the git tag, not artifacts | Simple release | Supply chain gap for generated HTML/eval JSON | Interim with explicit “not covered” list |
| WSL-only Windows support | Easier than portable bash | Excludes native Windows devs | Only if documented as deliberate scope |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|---------------|----------------|------------------|
| npm / Node eval | Vendor `node_modules` partially or on one OS only | Lockfile + scripted vendor sync; CI matrix exercises install |
| CDN → local mirror | Replace URL string but miss integrity attribute or SRI | Mirror + update all references (HTML + docs); test offline load |
| GitHub Actions provenance / Sigstore | Assume GH attestations cover arbitrary workspace outputs | Attest only defined artifacts; map digest → eval output schema |
| Claude CLI (`claude -p`) | Sandbox child process but leave CLI unrestricted | Document trust boundary; restrict cwd and env for subprocess |
| Docker | Mount entire `$HOME` for “convenience” | Minimal volume mounts; non-root user in container |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-verify every vendored file on each eval | Slow local runs | Cache verification metadata keyed by lockfile hash | Large vendor trees or many prompts |
| Signing large `evals/results/` trees | Timeouts in CI | Sign summaries or Merkle roots over batches | High prompt volume |
| Sandbox FS overlays | Slow I/O on macOS Docker | Prefer native seatbelt/bubblewrap over Docker on laptops | Large repos copied into sandbox |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Signing with long-lived keys on laptops without rotation | Key theft → forged attestations | Key rotation doc; separate CI signing key; minimal local key scope |
| Offline mirror HTTP-only | MITM on first populate | HTTPS for fetch; pin integrity in manifest |
| Sandbox allows outbound network “for updates” | Eval exfiltration | Deny network in strict eval profile; separate update command |
| Provenance JSON includes sensitive paths or content | Leakage via shared attestations | Redact per `security-policy.json` dataProtection |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| First-run requires 10-step key setup | Abandonment or insecure shortcuts | Progressive trust: run unsigned locally with warnings; sign in CI first |
| Error: “verification failed” with no file name | Hours lost debugging | Include artifact id, expected digest, actual digest, remediate hint |
| “Works offline” but browser still requests fonts/CDN | False confidence in offline | Automated crawl or grep for `http`/`https` in generated HTML in CI |

## "Looks Done But Isn't" Checklist

- [ ] **ADV-01:** Offline run verified on **clean clone** without network — not only on maintainer laptop with warm cache
- [ ] **ADV-01:** Generated walkthrough HTML loads with **no external requests** (or explicit allowlist documented and tested)
- [ ] **ADV-02:** Signature covers the **same bytes** the runtime reads (not a parent directory hash only)
- [ ] **ADV-02:** Failure modes tested: missing sig, wrong key, tampered file, clock skew (if relevant)
- [ ] **ADV-03:** At least one Windows path exercised in CI (Git Bash or documented shell)
- [ ] **ADV-03:** Sandbox documented when Docker is absent on macOS (fallback behavior)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Supply chain theater | HIGH | Map consumption graph; add fail-closed checks at use sites; remove misleading CI-only gates |
| Broken mirrors | MEDIUM | Regenerate vendor from lockfile; add drift detection; fix path anchoring |
| Bad signature UX | MEDIUM | Simplify defaults; separate CI vs local trust; improve errors |
| Windows breakage | MEDIUM | Introduce path abstraction layer; add matrix job; fix quoting |
| Docker assumed universal | LOW–MEDIUM | Document non-Docker path; abstract sandbox backend |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls (align phase numbers with your ROADMAP — requirement ids from `.planning/PROJECT.md` shown).

| Pitfall | Prevention phase | Verification |
|---------|------------------|--------------|
| Supply chain theater | **ADV-02** + policy/eval integration | Trace from policy to runtime; no verify-only-in-CI for consumed artifacts |
| Broken offline mirrors | **ADV-01** | Fresh clone, offline flag, deterministic grader green |
| Signature UX / bypass culture | **ADV-02** | Usability review; no undocumented permanent `--skip-verify` |
| Windows path/shell | **ADV-03** | CI matrix or scripted smoke on Windows |
| Docker not default on Mac | **ADV-03** | Non-Docker sandbox path documented and tested |
| Subprocess/sandbox gaps | **ADV-03** | Spawn inventory vs policy paths; temp workspace review |

## Sources

- OWASP Software Component Verification Standard (concept: consumption-level verification) — https://owasp.org/www-project-software-component-verification-standard/
- Node.js documentation: `path` module (cross-platform path handling) — https://nodejs.org/docs/latest/api/path.html
- Docker Desktop licensing / install friction (context for “not default on every Mac”) — vendor docs and release notes (verify current terms when publishing README)
- Common CI supply-chain pitfalls: verifying dependencies only at install time, not at runtime — industry writeups and npm `npm ci` vs `npm install` behavior — https://docs.npmjs.com/cli/v10/commands/npm-ci

---
*Pitfalls research for: Walkthrough Skill Local Security Hardening (offline vendoring, signed provenance, cross-platform sandbox)*

*Researched: 2026-04-29*
