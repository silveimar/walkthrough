# Technology Stack

**Project:** Walkthrough Skill Local Security Hardening  
**Researched:** 2026-04-29  
**Scope:** Local-only security for CLI-centric analysis and artifact generation

## Recommended Stack (2025 standard, local-first)

### Core Runtime & Package Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 24 LTS (Krypton) | Primary runtime for eval/graders/tooling | Active LTS is the stable production track and aligns with current security patch cadence. |
| pnpm | 11.x | Package manager and lockfile authority | pnpm 11 adds stronger default supply-chain protections (`minimumReleaseAge`, stricter build/deps behavior) and enforces modern runtime baselines. |

### Local Security Controls

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| gitleaks | 8.30.1 | Secret scanning in working tree and git history | Fast local secret detection with mature pre-commit/CI workflows; baseline control for accidental leakage. |
| Semgrep CLI | 1.161.0 | Local SAST/security linting | Practical code-level security findings across languages from CLI; can run fully local via `semgrep scan`. |
| OSV-Scanner | 2.3.5 | Dependency vulnerability scanning | Uses OSV ecosystem data directly and works well in local repos/lockfile workflows. |
| Syft | 1.43.0 | SBOM generation for produced artifacts | Produces SPDX/CycloneDX SBOMs to make artifact contents auditable before publish/share. |
| Grype | 0.111.1 | Vulnerability matching against SBOM/filesystem | Complements Syft with local vulnerability triage and supports SBOM input directly. |

### Secrets & Artifact Integrity

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| age | 1.3.1 | File-level encryption primitive | Simple, modern encryption with low operational complexity for local repos. |
| SOPS | 3.12.2 | Structured secrets encryption workflow | Standard way to keep encrypted config/secrets in repo while preserving editability and reviewability. |
| cosign | 3.0.6 | Artifact signing and verification | Strong default for signing generated artifacts and verifying provenance/integrity before distribution. |

### Supporting Libraries/Tools (Operational)

| Library/Tool | Version | Purpose | When to Use |
|--------------|---------|---------|-------------|
| pre-commit | latest stable 4.x | Enforce local security checks before commit | Use for mandatory gate chain: gitleaks + semgrep + OSV checks. |
| GitHub Actions SARIF upload | current | Structured findings in code-hosting UI | Use only for metadata/results upload, not source upload; keep scans local-first. |

## Opinionated Defaults for This Repository

1. Pin runtime to `Node.js 24 LTS` and set `engines.node` accordingly.
2. Adopt `pnpm 11` with lockfile committed and no ad-hoc package manager mixing.
3. Run `gitleaks`, `semgrep scan`, and `osv-scanner` in pre-commit and CI.
4. Generate SBOM with `syft` for every release artifact and scan with `grype`.
5. Encrypt any local secret/config material with `sops + age`; never plaintext secrets in repo.
6. Sign release artifacts or published bundles with `cosign` and verify before deployment/use.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Package manager | pnpm 11 | npm/yarn classic | Weaker supply-chain defaults and less strict workspace hygiene for this threat model. |
| Secret scanning | gitleaks | trufflehog | TruffleHog is strong but often heavier for day-to-day local CLI loops in this repo size. |
| Dependency scanning | OSV-Scanner | npm audit only | `npm audit` is ecosystem-limited; OSV gives broader advisory coverage across tooling/ecosystems. |
| Secret-at-rest | sops + age | dotenv + gitignore only | `gitignore` does not protect against accidental commits/copies; encryption provides real protection. |

## What NOT to Use (for local-hardening goal)

- Do **not** rely on plaintext `.env` files as the primary secret strategy.
- Do **not** run unpinned `npx`/installer scripts in security gates.
- Do **not** use only `npm audit` as your vulnerability signal.
- Do **not** upload full source trees to SaaS scanners by default for this initiative.
- Do **not** leave package-manager policy ambiguous (pick one: `pnpm`).

## Installation Baseline

```bash
# Core runtime (example via nvm/mise/asdf; exact tool is team choice)
node --version   # target: v24.x LTS

# Package manager
corepack enable
corepack prepare pnpm@11 --activate

# Security tooling (Homebrew examples on macOS)
brew install gitleaks semgrep osv-scanner syft grype sops age cosign
```

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Runtime/package manager | HIGH | Backed by Node and pnpm official release docs. |
| Local security tooling | HIGH | Versions verified from official project release pages. |
| Policy recommendations | MEDIUM | Opinionated for this repo’s local-first constraints; still team-tunable. |

## Sources

- Node.js releases (official): https://nodejs.org/en/about/releases (HIGH)
- pnpm 11 release (official): https://github.com/pnpm/pnpm/releases/tag/v11.0.0 (HIGH)
- Semgrep local CLI docs (official): https://semgrep.dev/docs/getting-started/cli (HIGH)
- Semgrep latest release (official): https://github.com/semgrep/semgrep/releases/latest (HIGH)
- gitleaks latest release (official): https://github.com/gitleaks/gitleaks/releases/latest (HIGH)
- OSV-Scanner v2.3.5 release (official): https://github.com/google/osv-scanner/releases/tag/v2.3.5 (HIGH)
- Syft latest release (official): https://github.com/anchore/syft/releases/latest (HIGH)
- Grype latest release (official): https://github.com/anchore/grype/releases/latest (HIGH)
- SOPS latest release (official): https://github.com/getsops/sops/releases/latest (HIGH)
- age latest release (official): https://github.com/FiloSottile/age/releases/latest (HIGH)
- cosign latest release (official): https://github.com/sigstore/cosign/releases/latest (HIGH)
