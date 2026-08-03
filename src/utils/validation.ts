import type { GenerateOptions, TypeOptionsMap } from '../types';

/** Built-in generator type names. */
export const SUPPORTED_TYPES = ['users', 'products', 'orders'] as const;
export type SupportedType = (typeof SUPPORTED_TYPES)[number];

/**
 * Normalises the first argument of `generate()` into a `TypeOptionsMap`.
 *
 * Accepts:
 *  - a string  → `{ [type]: {} }`
 *  - an object → validates all keys, returns as-is
 *
 * @throws {TypeError}  on wrong input kind
 * @throws {RangeError} on empty object or unknown type
 */
export function normaliseInput(
  typeOrMap: string | TypeOptionsMap,
  allowedTypes: readonly string[] = SUPPORTED_TYPES
): TypeOptionsMap {
  if (typeof typeOrMap === 'string') {
    validateType(typeOrMap, allowedTypes);
    return { [typeOrMap]: {} };
  }

  if (
    typeOrMap !== null &&
    typeof typeOrMap === 'object' &&
    !Array.isArray(typeOrMap)
  ) {
    const keys = Object.keys(typeOrMap);
    if (keys.length === 0) {
      throw new RangeError(
        'generate() received an empty object. Provide at least one type.'
      );
    }
    keys.forEach((k) => validateType(k, allowedTypes));
    return typeOrMap;
  }

  throw new TypeError(
    `generate() expects a type string or options object, received: ${typeof typeOrMap}`
  );
}

/**
 * Asserts that `type` is a known generator type.
 * @throws {TypeError}  when type is not a string
 * @throws {RangeError} when type is empty or not in the allowed list
 */
export function validateType(
  type: string,
  allowedTypes: readonly string[] = SUPPORTED_TYPES
): void {
  if (typeof type !== 'string') {
    throw new TypeError(`Type must be a string, received: ${typeof type}`);
  }
  const normalised = type.trim().toLowerCase();
  if (normalised.length === 0) {
    throw new RangeError('Type name cannot be empty.');
  }
  if (!allowedTypes.includes(normalised)) {
    throw new RangeError(
      `Unknown generator type: "${type}". Supported types: ${allowedTypes.join(', ')}`
    );
  }
}

/**
 * Validates and normalises a per-type `GenerateOptions` object.
 * Fills in defaults and coerces types where safe.
 *
 * @throws {TypeError}  on wrong option types
 * @throws {RangeError} on out-of-range values
 */
export function validateOptions(
  options: GenerateOptions = {},
  type = ''
): Required<Omit<GenerateOptions, 'seed' | 'format'>> & GenerateOptions {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError(
      `Options for "${type}" must be a plain object, received: ${typeof options}`
    );
  }

  const out: GenerateOptions = { ...options };

  // ── count ──────────────────────────────────────────────────────────────────
  if ('count' in out && out.count !== undefined) {
    if (!Number.isInteger(out.count) || out.count < 0) {
      throw new RangeError(
        `options.count for "${type}" must be a non-negative integer, received: ${out.count}`
      );
    }
    if (out.count > 1_000_000) {
      throw new RangeError(
        `options.count for "${type}" exceeds the maximum of 1,000,000. Received: ${out.count}`
      );
    }
  } else {
    out.count = 10;
  }

  // ── seed ───────────────────────────────────────────────────────────────────
  if ('seed' in out && out.seed !== undefined) {
    if (!Number.isFinite(out.seed) || out.seed < 0) {
      throw new RangeError(
        `options.seed for "${type}" must be a non-negative finite number, received: ${out.seed}`
      );
    }
    out.seed = Math.floor(out.seed);
  }

  // ── fields ─────────────────────────────────────────────────────────────────
  if ('fields' in out && out.fields !== undefined) {
    if (
      out.fields === null ||
      typeof out.fields !== 'object' ||
      Array.isArray(out.fields)
    ) {
      throw new TypeError(`options.fields for "${type}" must be a plain object`);
    }
    for (const [key, fn] of Object.entries(out.fields)) {
      if (typeof fn !== 'function') {
        throw new TypeError(
          `options.fields["${key}"] for "${type}" must be a function, received: ${typeof fn}`
        );
      }
    }
  } else {
    out.fields = {};
  }

  // ── format ─────────────────────────────────────────────────────────────────
  if ('format' in out && out.format !== undefined) {
    if (!['json', 'array'].includes(out.format)) {
      throw new RangeError(
        `options.format for "${type}" must be "json" or "array", received: "${out.format}"`
      );
    }
  }

  return out as Required<Omit<GenerateOptions, 'seed' | 'format'>> & GenerateOptions;
}

/**
 * Strips null bytes and control characters from a string, then trims it.
 * Returns `null` for non-string input.
 */
export function sanitiseString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Asserts `condition` is truthy; throws with `message` otherwise.
 * @param ErrorClass - Defaults to `Error`
 */
export function assert(
  condition: boolean,
  message: string,
  ErrorClass: new (msg: string) => Error = Error
): asserts condition {
  if (!condition) throw new ErrorClass(message);
}
