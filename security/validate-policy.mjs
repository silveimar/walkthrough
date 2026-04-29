#!/usr/bin/env node
/**
 * Strict structural validation of security/security-policy.json against
 * security/security-policy.schema.json without external npm deps (subset of JSON Schema).
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCHEMA_PATH = join(__dirname, "security-policy.schema.json");

/**
 * @param {unknown} parsed
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validatePolicyDocument(parsed) {
  let schema;
  try {
    schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  } catch (e) {
    return {
      ok: false,
      errors: [`Cannot load schema at ${SCHEMA_PATH}: ${e instanceof Error ? e.message : String(e)}`],
    };
  }
  const errors = [];
  validateValue(parsed, schema, "", errors, new Set());
  return { ok: errors.length === 0, errors };
}

/**
 * @param {unknown} instance
 * @param {Record<string, unknown>} schema
 * @param {string} path
 * @param {string[]} errors
 * @param {Set<unknown>} seen
 */
function validateValue(instance, schema, path, errors, seen) {
  if (schema === true) return;
  if (schema === false) {
    errors.push(`${path || "$"}: schema rejects value`);
    return;
  }
  if (typeof schema !== "object" || schema === null) return;

  if (schema.$ref) {
    errors.push(`${path}: $ref not supported in minimal validator`);
    return;
  }

  const t = schema.type;
  if (t === "object") {
    if (typeof instance !== "object" || instance === null || Array.isArray(instance)) {
      errors.push(`${path || "$"}: expected object`);
      return;
    }
    const props = /** @type {Record<string, unknown>} */ (schema.properties || {});
    const req = /** @type {string[]} */ (schema.required || []);
    const additional = schema.additionalProperties;

    for (const key of req) {
      if (!(key in /** @type {Record<string, unknown>} */ (instance))) {
        errors.push(`${path || "$"}.${key}: required property missing`);
      }
    }

    for (const key of Object.keys(instance)) {
      if (additional === false && !(key in props)) {
        errors.push(`${path || "$"}.${key}: unknown key (additionalProperties false)`);
        continue;
      }
      if (key in props) {
        const childPath = path ? `${path}.${key}` : key;
        validateValue(
          /** @type {Record<string, unknown>} */ (instance)[key],
          /** @type {Record<string, unknown>} */ (props[key]),
          childPath,
          errors,
          seen
        );
      } else if (additional !== false && typeof additional === "object" && additional !== null) {
        const childPath = path ? `${path}.${key}` : key;
        validateValue(
          /** @type {Record<string, unknown>} */ (instance)[key],
          /** @type {Record<string, unknown>} */ (additional),
          childPath,
          errors,
          seen
        );
      }
    }
    return;
  }

  if (t === "array") {
    if (!Array.isArray(instance)) {
      errors.push(`${path || "$"}: expected array`);
      return;
    }
    const items = /** @type {Record<string, unknown> | undefined} */ (schema.items);
    instance.forEach((item, i) => {
      const childPath = `${path}[${i}]`;
      if (items) validateValue(item, items, childPath, errors, seen);
    });
    const minItems = schema.minItems;
    if (typeof minItems === "number" && instance.length < minItems) {
      errors.push(`${path || "$"}: array shorter than minItems ${minItems}`);
    }
    return;
  }

  if (t === "string") {
    if (typeof instance !== "string") {
      errors.push(`${path || "$"}: expected string`);
      return;
    }
    if (typeof schema.minLength === "number" && instance.length < schema.minLength) {
      errors.push(`${path || "$"}: string shorter than minLength`);
    }
    const en = /** @type {string[] | undefined} */ (schema.enum);
    if (en && !en.includes(instance)) {
      errors.push(`${path || "$"}: must be one of ${en.join(", ")}`);
    }
    return;
  }

  if (t === "integer") {
    if (typeof instance !== "number" || !Number.isInteger(instance)) {
      errors.push(`${path || "$"}: expected integer`);
      return;
    }
    if (typeof schema.minimum === "number" && instance < schema.minimum) {
      errors.push(`${path || "$"}: below minimum`);
    }
    return;
  }

  if (t === "boolean") {
    if (typeof instance !== "boolean") {
      errors.push(`${path || "$"}: expected boolean`);
    }
    return;
  }

  if (t === "number") {
    if (typeof instance !== "number") {
      errors.push(`${path || "$"}: expected number`);
    }
  }
}
