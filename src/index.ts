/**
 * mock-data-generator
 * Generate realistic mock data without external dependencies.
 *
 * @module mock-data-generator
 */

import type {
  GenerateOptions,
  TypeOptionsMap,
  MultiTypeResult,
  User,
  Product,
  Order,
  FieldOverrideFn,
  GenerationContext,
} from './types';

import { seedManager } from './utils/seed';
import { normaliseInput, validateOptions } from './utils/validation';
import { getGenerator, listGenerators } from './generators/index';

export { Random } from './utils/random';
export { seedManager } from './utils/seed';
export { registerGenerator, unregisterGenerator, listGenerators } from './generators/index';
export type {
  GenerateOptions,
  TypeOptionsMap,
  MultiTypeResult,
  User,
  Product,
  Order,
  FieldOverrideFn,
  GenerationContext,
  GeneratorFn,
  WeightedItem,
  Address,
  OrderLineItem,
  UserStatus,
  UserRole,
  OrderStatus,
  PaymentMethod,
} from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolves a shared seed from the first type-options entry that defines one. */
function resolveSeed(map: TypeOptionsMap): number | undefined {
  for (const opts of Object.values(map)) {
    if (opts?.seed !== undefined) return opts.seed;
  }
  return undefined;
}

// ─── Overloads ────────────────────────────────────────────────────────────────

/**
 * Generates mock data for a single entity type.
 * Returns a typed array for the three built-in types.
 */
export function generate(type: 'users', options?: GenerateOptions): User[];
export function generate(type: 'products', options?: GenerateOptions): Product[];
export function generate(type: 'orders', options?: GenerateOptions): Order[];
export function generate(type: string, options?: GenerateOptions): Record<string, unknown>[];

/**
 * Generates mock data for multiple entity types in one call.
 * Returns an object keyed by type name.
 */
export function generate(typeMap: TypeOptionsMap): MultiTypeResult;

// ─── Implementation ───────────────────────────────────────────────────────────

/**
 * Generates mock data for one or more entity types.
 *
 * **Single type** – returns an array:
 * ```ts
 * const users = generate('users', { count: 50 });
 * const users = generate('users', { count: 100, seed: 12345 });
 * ```
 *
 * **Multiple types** – returns a keyed object:
 * ```ts
 * const data = generate({
 *   users:    { count: 50 },
 *   products: { count: 100 },
 *   orders:   { count: 75 },
 * });
 * ```
 *
 * **Custom field overrides:**
 * ```ts
 * const users = generate('users', {
 *   count: 10,
 *   fields: {
 *     fullName: (u) => `${(u as User).firstName} ${(u as User).lastName}`,
 *   },
 * });
 * ```
 *
 * @throws {TypeError}  on invalid input types
 * @throws {RangeError} on unknown generator type or out-of-range options
 */
export function generate(
  typeOrMap: string | TypeOptionsMap,
  options: GenerateOptions = {}
): User[] | Product[] | Order[] | Record<string, unknown>[] | MultiTypeResult {
  const isSingle = typeof typeOrMap === 'string';

  // ── 1. Build a { type → options } map ──────────────────────────────────────
  const allAllowed = listGenerators();

  let typeMap: TypeOptionsMap;
  if (isSingle) {
    // Allow custom-registered types through without hitting the built-in list
    if (!allAllowed.includes(typeOrMap.toLowerCase())) {
      // Will throw RangeError for truly unknown types
      normaliseInput(typeOrMap);
    }
    typeMap = { [typeOrMap]: { ...options } };
  } else {
    typeMap = normaliseInput(typeOrMap, allAllowed);
  }

  // ── 2. Initialise shared seed ───────────────────────────────────────────────
  seedManager.init(resolveSeed(typeMap));

  // ── 3. Validate all per-type options ────────────────────────────────────────
  const normMap: TypeOptionsMap = {};
  for (const [type, opts] of Object.entries(typeMap)) {
    normMap[type] = validateOptions(opts ?? {}, type);
  }

  // ── 4. Build cross-entity context ──────────────────────────────────────────
  const context: GenerationContext = {};
  if (normMap['users']?.count !== undefined) context.userCount = normMap['users'].count;
  if (normMap['products']?.count !== undefined) context.productCount = normMap['products'].count;

  // ── 5. Run generators using isolated per-type child RNGs ───────────────────
  const results: MultiTypeResult = {};
  for (const [type, opts] of Object.entries(normMap)) {
    const generatorFn = getGenerator(type);
    const rng = seedManager.createNamed(type);
    const { count = 10, fields = {} } = opts;
    results[type] = generatorFn(count, rng, fields as Record<string, FieldOverrideFn>, context);
  }

  // ── 6. Return array for single-type, object for multi-type ─────────────────
  if (isSingle) {
    const key = Object.keys(results)[0];
    return results[key] as User[] | Product[] | Order[] | Record<string, unknown>[];
  }
  return results;
}

// ─── Async wrapper ────────────────────────────────────────────────────────────

/**
 * Promise-based version of `generate()` with the same signature.
 * Resolves with the same value as the synchronous call.
 */
export async function generateAsync(
  type: 'users',
  options?: GenerateOptions
): Promise<User[]>;
export async function generateAsync(
  type: 'products',
  options?: GenerateOptions
): Promise<Product[]>;
export async function generateAsync(
  type: 'orders',
  options?: GenerateOptions
): Promise<Order[]>;
export async function generateAsync(typeMap: TypeOptionsMap): Promise<MultiTypeResult>;
export async function generateAsync(
  typeOrMap: string | TypeOptionsMap,
  options: GenerateOptions = {}
): Promise<User[] | Product[] | Order[] | MultiTypeResult> {
  return generate(typeOrMap as string, options) as User[] | Product[] | Order[] | MultiTypeResult;
}

// ─── Streaming generator ──────────────────────────────────────────────────────

/**
 * A generator function that yields records one at a time.
 * Ideal for large datasets (100k+) where holding everything in memory is impractical.
 *
 * Records are produced in batches of 1,000 internally; each yielded record
 * has a globally sequential `id` field.
 *
 * @example
 * ```ts
 * for (const user of generateStream('users', { count: 1_000_000, seed: 42 })) {
 *   writeLine(JSON.stringify(user));
 * }
 * ```
 *
 * @throws {TypeError}  when `type` is not a string
 * @throws {RangeError} on invalid options
 */
export function* generateStream(
  type: string,
  options: GenerateOptions = {}
): Generator<Record<string, unknown>> {
  if (typeof type !== 'string') {
    throw new TypeError('generateStream(): first argument must be a type string');
  }

  const opts = validateOptions(options, type);
  seedManager.init(opts.seed);

  const generatorFn = getGenerator(type);
  const rng = seedManager.createNamed(type);
  const { count = 10, fields = {} } = opts;

  const BATCH = 1_000;
  let done = 0;

  while (done < count) {
    const batchSize = Math.min(BATCH, count - done);
    const batch = generatorFn(
      batchSize,
      rng,
      fields as Record<string, FieldOverrideFn>,
      {}
    );
    for (const record of batch) {
      // Re-index ids to be globally sequential across batches
      const rec = record as Record<string, unknown>;
      rec.id = done + (rec.id as number);
      yield record as Record<string, unknown>;
    }
    done += batchSize;
  }
}
