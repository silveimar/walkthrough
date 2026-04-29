# Contributing — Walkthrough Skill (maintainers)

This repo’s security and eval contracts live in [`security/security-policy.json`](security/security-policy.json). Prefer **`bash scripts/verify-policy`** locally before pushing; CI runs the same checks (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Supported platform matrix

Parity for **this repository** means **consistent interpretation of `security/security-policy.json` and the same scripted entrypoints** (`scripts/verify-policy`, `evals/run.sh`, documented Node checks)—**not** identical OS-level sandboxes or identical paths across operating systems.

| Environment | Shell | Node.js | Notes |
|-------------|-------|---------|--------|
| **macOS** | bash / zsh | **≥ 18** (20 in CI) | Primary local dev for many maintainers. |
| **Linux** (glibc) | bash | **≥ 18** | CI uses `ubuntu-latest`. |
| **Windows (Git Bash)** | **Git for Windows** bash | **≥ 18** | Use **Git Bash** for `evals/run.sh` and `bash scripts/verify-policy`. Paths are POSIX-style under MSYS. |
| **Windows (WSL2)** | bash (e.g. Ubuntu on WSL) | **≥ 18** | Treat like Linux; clone repo in the WSL filesystem for fewer path surprises. |

**Not in the supported matrix for Phase 7:** PowerShell-only or `cmd.exe` as the primary shell for `evals/run.sh` (the harness is written for bash). Native Windows without a POSIX shell is out of scope unless a future phase adds a dedicated runner.

**Docker** is **optional** for core flows: `verify-policy`, `bash -n evals/run.sh`, and the Node checks in CI do not require a container.

## Vendor assets & offline-capable eval (OFF-01 / OFF-03 / OFF-06)

**Defaults:** In [`security/security-policy.json`](security/security-policy.json), `walkthroughViewerAssets.packages.*.assetSource` is typically **`cdn`** for a fresh clone. Eval does **not** copy `vendor/walkthrough-viewer/` into the temp workspace until you opt into **vendor** mode — there is no silent switch.

**To exercise vendor bytes end-to-end:**

1. Edit `security/security-policy.json`: set the packages you need to **`vendor`** (and keep `vendorRootRel` consistent). See [`skills/walkthrough/references/html-patterns.md`](skills/walkthrough/references/html-patterns.md) (“Dual mode”) for URL shapes.
2. From repository root, reproducible install + regenerate the frozen tree:
   ```bash
   npm ci
   node scripts/sync-walkthrough-vendor.mjs
   ```
3. Refresh provenance digests when policy or vendor files change (matches CI):
   ```bash
   node scripts/build-provenance-manifest.mjs
   ```
4. Run eval as usual (`bash evals/run.sh …`) with egress flags per policy. If vendor mode is required but the tree or manifest is wrong, `evals/run.sh` fails closed (no CDN fallback).

For regeneration-only reference, see [`vendor/walkthrough-viewer/README.md`](vendor/walkthrough-viewer/README.md).

## Manual smoke (Windows / path sanity)

Run these from a **clone of the repository root** (the same place CI uses). On Windows, use **Git Bash** or **WSL2** as above.

```bash
# 1) Policy + schema
bash scripts/verify-policy

# 2) Eval harness shell syntax
bash -n evals/run.sh

# 3) Key Node modules parse
node --check security/policy-runtime.mjs
```

Optional (matches CI path/cwd checks after this phase):

```bash
node scripts/test-path-workspace.mjs
WALKTHROUGH_STRICT_CWD=1 node evals/graders/deterministic.mjs examples/walkthrough-how-it-works.html
```

**Full eval** (`bash evals/run.sh …`) still requires the **`claude` CLI** and appropriate egress settings from policy—see `README.md` → Testing.

## Cross-platform gotchas

- **Temp workspace (RUN-02):** When `runtime.evalWorkspaceMustBeUnderSystemTemp` is `true` in policy, the eval harness expects workspaces under the OS temp directory (`os.tmpdir()` on Node; `mktemp -d` in bash). Avoid pointing eval workspaces at arbitrary non-temp paths.
- **Strict cwd (RUN-03):** Setting **`WALKTHROUGH_STRICT_CWD=1`** makes Node entrypoints require `cwd` to be the repository root—useful in CI. Locally this can fail if you run scripts from a subdirectory without `cd` to root first.

## Provenance verify in CI (ATT-05)

The default **`CI`** workflow runs **`node scripts/verify-provenance.mjs`** on every PR/push: it checks that **`provenance/manifest.json`** matches **`security/security-policy.json`** and **`vendor/walkthrough-viewer/manifest.json`** on disk. Regenerate before merging when you change policy or vendor files:

```bash
node scripts/build-provenance-manifest.mjs
```

Minisign is **installed in CI** so if you commit **`provenance/manifest.json.sig`** and **`provenance/minisign.pub`**, signature verification runs too; otherwise digest-only verification passes.

Use branch protection **required checks** on the `CI / verify` workflow if you want merges blocked when provenance drifts.
