/**
 * Policy-backed redaction for persisted eval artifacts (DATA-01).
 */

import { loadRepoPolicy } from "./policy-runtime.mjs";

/**
 * @returns {boolean}
 */
export function isRedactionEnabled() {
  try {
    const policy = loadRepoPolicy();
    const r = /** @type {{ enabled?: boolean } | undefined} */ (
      /** @type {{ dataProtection?: { redaction?: { enabled?: boolean } } }} */ (policy).dataProtection?.redaction
    );
    return r?.enabled !== false;
  } catch {
    return true;
  }
}

/**
 * @param {string} s
 * @returns {string}
 */
export function redactString(s) {
  if (typeof s !== "string" || !isRedactionEnabled()) return s;

  let out = s;
  out = out.replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi, "Bearer [REDACTED]");
  out = out.replace(/\bsk-[a-z]+-[A-Za-z0-9\-]{16,}\b/gi, "[REDACTED:api-key]");
  out = out.replace(/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g, "[REDACTED:aws-key-id]");
  out = out.replace(/\/Users\/[^/\s]+/g, "[REDACTED:path]");
  out = out.replace(/\/home\/[^/\s]+/g, "[REDACTED:path]");
  out = out.replace(/\b(?:ghp|github_pat)_[A-Za-z0-9_]+\b/gi, "[REDACTED:token]");
  return out;
}

/**
 * Deep-redact string leaves in JSON-serializable values.
 * @param {unknown} value
 * @returns {unknown}
 */
export function redactDeep(value) {
  if (!isRedactionEnabled()) return value;
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map((v) => redactDeep(v));
  if (value !== null && typeof value === "object") {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = redactDeep(v);
    }
    return out;
  }
  return value;
}
