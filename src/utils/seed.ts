import { Random } from './random';

/**
 * Manages a shared seeded PRNG instance for one `generate()` call.
 * A single seed produces reproducible results across all entity types
 * via deterministic child seeds derived per namespace.
 */
export class SeedManager {
  private _instance: Random | null = null;
  private _currentSeed: number | null = null;

  /**
   * Initialises (or re-initialises) the PRNG.
   * If `seed` is omitted a random seed is generated and stored.
   */
  init(seed?: number): Random {
    const resolved =
      seed !== undefined ? seed : Math.floor(Math.random() * 2_147_483_647);
    this._currentSeed = resolved;
    this._instance = new Random(resolved);
    return this._instance;
  }

  /**
   * Returns the active `Random` instance, auto-initialising if needed.
   */
  getInstance(): Random {
    if (!this._instance) {
      this.init();
    }
    return this._instance as Random;
  }

  /** The seed currently in use (null before first `init()`). */
  getSeed(): number | null {
    return this._currentSeed;
  }

  /** Clears the current instance and seed. */
  reset(): void {
    this._instance = null;
    this._currentSeed = null;
  }

  /**
   * Creates an independent `Random` instance with a seed derived from
   * the base seed and the given namespace string.
   *
   * Using named child RNGs keeps each generator type's sequence
   * isolated so adding/removing types does not shift other results.
   *
   * @param namespace - e.g. `'users'`, `'products'`
   */
  createNamed(namespace: string): Random {
    const base =
      this._currentSeed !== null
        ? this._currentSeed
        : Math.floor(Math.random() * 2_147_483_647);

    // Derive a deterministic child seed via a simple string hash
    let hash = base;
    for (let i = 0; i < namespace.length; i++) {
      hash = (Math.imul(hash ^ namespace.charCodeAt(i), 0x9e3779b9) >>> 0);
      hash ^= hash >>> 16;
    }
    return new Random(hash >>> 0);
  }
}

/** Singleton shared across a single `generate()` invocation. */
export const seedManager = new SeedManager();
