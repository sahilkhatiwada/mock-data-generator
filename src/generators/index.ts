import type { GeneratorFn, FieldOverrideFn, GenerationContext } from '../types';
import { Random } from '../utils/random';
import { generateUsers } from './user';
import { generateProducts } from './product';
import { generateOrders } from './order';

// ─── Built-in registry ────────────────────────────────────────────────────────

type BuiltInType = 'users' | 'products' | 'orders';

const BUILT_IN_GENERATORS: Record<BuiltInType, GeneratorFn> = {
  users: (count, rng, fields, _ctx) => generateUsers(count, rng, fields),
  products: (count, rng, fields, _ctx) => generateProducts(count, rng, fields),
  orders: (count, rng, fields, ctx) => generateOrders(count, rng, fields, ctx),
};

/** Custom generators registered via `registerGenerator()`. */
const customGenerators = new Map<string, GeneratorFn>();

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the generator function for the given type.
 * Custom generators take precedence over built-ins.
 *
 * @throws {RangeError} when no matching generator is found
 */
export function getGenerator(type: string): GeneratorFn {
  const key = type.toLowerCase();
  const custom = customGenerators.get(key);
  if (custom) return custom;

  const builtin = BUILT_IN_GENERATORS[key as BuiltInType];
  if (builtin) return builtin;

  const available = listGenerators().join(', ');
  throw new RangeError(`No generator for type "${type}". Available: ${available}`);
}

/**
 * Registers a custom generator for a new (or existing) type name.
 *
 * The function signature must be:
 * ```ts
 * (count: number, rng: Random, fields: Record<string, FieldOverrideFn>, context: GenerationContext) => object[]
 * ```
 *
 * @example
 * ```ts
 * registerGenerator('employees', (count, rng) =>
 *   Array.from({ length: count }, (_, i) => ({
 *     id: i + 1,
 *     department: rng.pick(['Engineering', 'Sales', 'Marketing']),
 *   }))
 * );
 * ```
 *
 * @throws {TypeError} on invalid arguments
 */
export function registerGenerator(type: string, fn: GeneratorFn): void {
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw new TypeError('registerGenerator: type must be a non-empty string');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('registerGenerator: fn must be a function');
  }
  customGenerators.set(type.toLowerCase(), fn);
}

/**
 * Removes a previously registered custom generator.
 * Built-in generators cannot be removed.
 *
 * @returns `true` if removed, `false` if not found
 */
export function unregisterGenerator(type: string): boolean {
  return customGenerators.delete(type.toLowerCase());
}

/**
 * Lists all available type names (built-in + custom).
 */
export function listGenerators(): string[] {
  return [
    ...Object.keys(BUILT_IN_GENERATORS),
    ...customGenerators.keys(),
  ];
}

// Re-export for convenience
export type { GeneratorFn, FieldOverrideFn, GenerationContext, Random };
