# Architecture Patterns

**Domain:** Local-first security hardening for walkthrough generation/evaluation repository  
**Researched:** 2026-04-29  
**Overall confidence:** HIGH

## Recommended Architecture

Use a **policy-enforced local analysis pipeline** with explicit trust boundaries:

1. **Control Plane** (policy, identity, risk decisions)
2. **Data Plane** (artifact generation/eval execution)
3. **Evidence Plane** (sanitized audit logs + verification outputs)

This maps NIST zero trust concepts (policy decision + policy enforcement) to a local CLI/eval repository: every access to prompts, generated artifacts, and result stores is mediated by policy checks, even on a single developer machine.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                          Control Plane (Local)                              │
│  Policy Engine + Policy Store + Secret Resolution + Trust Profiles         │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ policy decisions (allow/redact/block)
                ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Policy Enforcement Layer                          │
│  CLI Wrapper / Eval Gate / Filesystem Guard / Network Egress Guard         │
└───────┬──────────────────────────────┬───────────────────────────────┬──────┘
        │                              │                               │
        ▼                              ▼                               ▼
┌──────────────────────┐      ┌──────────────────────┐       ┌──────────────────────┐
│ Generation Runtime   │      │ Evaluation Runtime   │       │ Artifact Store       │
│ (skill execution)    │      │ (deterministic+LLM)  │       │ (encrypted local)    │
└──────────┬───────────┘      └──────────┬───────────┘       └──────────┬───────────┘
           │                              │                               │
           └──────────────┬───────────────┴───────────────┬──────────────┘
                          ▼                               ▼
                 ┌──────────────────┐            ┌──────────────────────┐
                 │ Redaction Layer  │            │ Audit/Event Ledger   │
                 │ (content/log)    │            │ (tamper-evident)     │
                 └──────────────────┘            └──────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Policy Engine | Evaluate access requests (who/what/why), classify data sensitivity, decide allow/deny/redact | Policy Store, Enforcement Layer |
| Policy Store | Versioned hardening rules (retention, redaction, egress, allowed paths/tools) | Policy Engine |
| Enforcement Layer | Enforce policy before generation/eval execution and before writes/reads | Runtimes, Artifact Store, Audit Ledger |
| Generation Runtime | Execute walkthrough generation in isolated workspace copy | Enforcement Layer, Redaction Layer |
| Evaluation Runtime | Run deterministic and rubric grading under same controls as generation | Enforcement Layer, Redaction Layer |
| Redaction Layer | Remove/highly constrain sensitive code/content from outputs, logs, and reports | Runtimes, Artifact Store, Audit Ledger |
| Artifact Store (Local Encrypted) | Store prompts, outputs, and summaries with TTL + secure deletion workflow | Enforcement Layer, Audit Ledger |
| Audit/Event Ledger | Record security-relevant events (policy decisions, denied access, egress attempts) with integrity protections | Enforcement Layer, Redaction Layer |
| Verification Gate | CI/local checks to fail if security controls regress | All build components |

## Data Flow

1. User/eval runner submits prompt and execution intent.
2. Enforcement Layer asks Policy Engine for decision (allow/deny/redact profile, runtime profile, storage class).
3. If allowed, runtime executes in isolated temp workspace with explicit filesystem/network constraints.
4. Generated artifacts and grading outputs pass through Redaction Layer before persistence.
5. Sanitized outputs are written to encrypted local Artifact Store using retention policy and access labels.
6. Security events (policy decisions, denied actions, failed authz, unusual access) are written to Audit/Event Ledger.
7. Verification Gate continuously checks policy conformance, redaction coverage, and logging integrity.

### Security-Critical Flows

- **Ingress:** raw prompt/input content is classified before processing.
- **In-process:** only minimum required files are mounted/readable (least privilege).
- **Egress:** outbound network is deny-by-default for analysis paths unless explicitly allowlisted.
- **Persistence:** sensitive content uses shortest practical retention; logs never store secrets/raw sensitive payloads.

## Patterns to Follow

### Pattern 1: Local Zero-Trust Control/Data Split
**What:** Separate policy decision logic from execution logic and require policy checks per request/session.  
**When:** Any generation/eval run that reads repo content or writes artifacts.  
**Why:** Avoids implicit trust in “local equals safe.”

### Pattern 2: Classification-First Processing
**What:** Classify artifacts/prompts first, then apply handling policies (mask, hash, retain, block).  
**When:** Before runtime access and before writing logs/results.  
**Why:** Prevents accidental leakage into summaries/logs.

### Pattern 3: Redaction-as-a-Required-Stage
**What:** Redaction is a mandatory pipeline stage, not optional post-processing.  
**When:** Prior to all persisted artifacts and all emitted logs.  
**Why:** Matches OWASP guidance to exclude/mask sensitive data from logs.

### Pattern 4: Tamper-Evident Audit Trail
**What:** Append-only event records with integrity checks and restricted access.  
**When:** For all security decisions and suspicious operations.  
**Why:** Enables forensics without making logs a leak vector.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Implicit Trust in Local Execution
**What:** “It is on my machine, so full access is fine.”  
**Why bad:** Local compromise, tool misconfiguration, or accidental exfil can still occur.  
**Instead:** Enforce per-run least-privilege and egress policies.

### Anti-Pattern 2: Security Logging Raw Payloads
**What:** Logging prompts, source code snippets, tokens, or unredacted artifacts.  
**Why bad:** Logs become highest-risk data store.  
**Instead:** Structured event logs with masked identifiers and sensitivity labels.

### Anti-Pattern 3: Hardening as Final Cleanup Phase
**What:** Add controls only after features are complete.  
**Why bad:** Retrofits are costly and leave long windows of exposure.  
**Instead:** Build policy/enforcement first, then integrate runtimes.

## Recommended Build Order (Hardening Phases)

1. **Define security contract and trust boundaries**
   - Produce policy model: data classes, retention classes, redaction levels, egress policy.
   - Declare control/data/evidence plane interfaces.
   - Output: machine-readable policy schema + threat model.

2. **Implement enforcement shell around existing eval/generation**
   - Add a single gateway/wrapper that all runs pass through.
   - Enforce allowlisted paths/tools and deny-by-default egress profile.
   - Output: policy-enforced entrypoint with fail-closed behavior.

3. **Add classification + mandatory redaction pipeline**
   - Classify prompt/artifact sensitivity at run start.
   - Apply required masking/sanitization before any write/log/report.
   - Output: redaction coverage tests + blocked unsafe writes.

4. **Harden storage and retention lifecycle**
   - Encrypt local result store; add TTL retention + secure deletion/expiration process.
   - Separate sensitive vs general result partitions.
   - Output: retention enforcement and encrypted-at-rest verification.

5. **Implement tamper-evident audit/event ledger**
   - Log authz decisions, denied actions, policy overrides, and high-risk accesses.
   - Add integrity checks and access control on logs.
   - Output: forensics-ready security events without sensitive payload exposure.

6. **Integrate continuous verification gates**
   - Add automated checks for policy regressions, redaction misses, and forbidden network/file accesses.
   - Include security acceptance tests in eval pipeline.
   - Output: hard fail in CI/local eval when controls drift.

7. **Add operational hardening and transparency artifacts**
   - Document secure-by-default defaults, incident handling, and recovery playbooks.
   - Publish security roadmap deltas per phase for maintainers.
   - Output: maintainable hardening posture, not one-off controls.

## Build-Order Implications for Roadmap

- **Phase 1 must be policy + boundary definition** because all later work depends on enforceable contracts.
- **Phase 2-3 should land before feature expansion** to prevent new leakage paths from entering the system.
- **Storage/audit (phases 4-5) should precede scale-up of eval volume** so retained data remains controlled.
- **Continuous verification (phase 6) should gate all subsequent milestones** to prevent silent security regressions.

## Scalability Considerations

| Concern | At current local usage | At heavier local/team usage |
|---------|------------------------|-----------------------------|
| Policy complexity | Simple static rules are enough | Move to versioned policy bundles with migration checks |
| Artifact volume | File-based encrypted store | Tiered retention and rolling archival with stricter TTL |
| Audit signal/noise | Basic structured events | Event taxonomy + anomaly detection for repeated denied actions |
| Runtime isolation | Temp workspace copy | Stronger sandboxing and explicit per-tool capability grants |

## Sources

- NIST SP 800-207, Zero Trust Architecture (policy engine / enforcement model; continuous verification) — HIGH confidence: https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf
- NIST SP 1800-35, Implementing Zero Trust Architecture (reference component model and migration emphasis) — HIGH confidence: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1800-35.pdf
- OWASP Logging Cheat Sheet (what to exclude, sanitize, and protect in logs) — HIGH confidence: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- OWASP ASVS v5 logging requirements (security event logging, integrity, secure failures) — MEDIUM confidence: https://github.com/OWASP/ASVS/blob/master/5.0/en/0x25-V16-Security-Logging-and-Error-Handling.md
- CISA Secure by Design / Secure by Default guidance (ownership of outcomes, secure defaults, logging and roadmap expectations) — MEDIUM confidence: https://www.cisa.gov/sites/default/files/2023-04/principles_approaches_for_security-by-design-default_508_0.pdf
