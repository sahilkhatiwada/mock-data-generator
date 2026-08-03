import type { WeightedItem, PRNGFn } from '../types';

/**
 * Mulberry32 — fast, high-quality 32-bit seeded PRNG.
 * Returns a function that produces floats in [0, 1).
 */
export function createPRNG(seed: number): PRNGFn {
  // Keep state as an unsigned 32-bit integer throughout
  let state = seed >>> 0;

  return function next(): number {
    // Mulberry32 — all arithmetic kept unsigned via >>> 0
    state = (state + 0x6d2b79f5) >>> 0;
    let z = Math.imul(state ^ (state >>> 15), 1 | state) >>> 0;
    z = (z ^ (z + Math.imul(z ^ (z >>> 7), 61 | z))) >>> 0;
    z = (z ^ (z >>> 14)) >>> 0;
    return z / 4294967296;
  };
}

/**
 * Typed random utility class wrapping a seeded PRNG.
 * All methods are deterministic given the same seed.
 */
export class Random {
  private readonly _seed: number;
  private readonly _rng: PRNGFn;

  /**
   * @param seed - Optional seed value. Defaults to a random integer if omitted.
   */
  constructor(seed?: number) {
    this._seed = seed !== undefined ? seed : Math.floor(Math.random() * 2_147_483_647);
    this._rng = createPRNG(this._seed);
  }

  /** The seed used to initialise this instance. */
  get seed(): number {
    return this._seed;
  }

  /** Returns a float in [0, 1). */
  float(): number {
    return this._rng();
  }

  /**
   * Returns an integer in [min, max] (inclusive).
   * @throws {RangeError} when min > max
   */
  int(min: number, max: number): number {
    if (min > max) {
      throw new RangeError(`int(): min (${min}) must be <= max (${max})`);
    }
    return Math.floor(this.float() * (max - min + 1)) + min;
  }

  /**
   * Returns a float in [min, max) rounded to `decimals` places.
   * @param decimals - Number of decimal places (default: 2)
   */
  decimal(min: number, max: number, decimals = 2): number {
    const value = this.float() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Returns a random element from a non-empty array.
   * @throws {TypeError} on empty or non-array input
   */
  pick<T>(arr: readonly T[]): T {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new TypeError('pick(): requires a non-empty array');
    }
    return arr[this.int(0, arr.length - 1)];
  }

  /**
   * Weighted random selection. Items with higher `weight` are chosen more often.
   * @throws {TypeError} on empty array
   */
  weightedPick<T>(items: readonly WeightedItem<T>[]): T {
    if (!Array.isArray(items) || items.length === 0) {
      throw new TypeError('weightedPick(): requires a non-empty array');
    }
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let threshold = this.float() * total;

    for (const item of items) {
      threshold -= item.weight;
      if (threshold <= 0) return item.value;
    }
    // Floating-point safety: return last item
    return items[items.length - 1].value;
  }

  /**
   * Returns `true` with the given probability (0–1).
   * @param probability - Default 0.5
   */
  bool(probability = 0.5): boolean {
    return this.float() < probability;
  }

  /**
   * Fisher-Yates shuffle. Returns a shuffled copy; does not mutate the original.
   */
  shuffle<T>(arr: readonly T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Returns `n` unique random elements from `arr`.
   * @throws {RangeError} when n > arr.length
   */
  sample<T>(arr: readonly T[], n: number): T[] {
    if (n > arr.length) {
      throw new RangeError(`sample(): cannot pick ${n} items from array of length ${arr.length}`);
    }
    return this.shuffle(arr).slice(0, n);
  }

  /**
   * Generates a UUID v4 string compliant with RFC 4122.
   */
  uuid(): string {
    const bytes = Array.from({ length: 16 }, () => this.int(0, 255));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx

    const hex = bytes.map((b) => b.toString(16).padStart(2, '0'));
    return [
      hex.slice(0, 4).join(''),
      hex.slice(4, 6).join(''),
      hex.slice(6, 8).join(''),
      hex.slice(8, 10).join(''),
      hex.slice(10, 16).join(''),
    ].join('-');
  }

  /**
   * Returns a random Date between `start` and `end`.
   * @throws {TypeError}  on invalid date values
   * @throws {RangeError} when start > end
   */
  date(start: Date | string | number, end: Date | string | number): Date {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      throw new TypeError('date(): start and end must be valid dates');
    }
    if (startMs > endMs) {
      throw new RangeError('date(): start must be before end');
    }
    return new Date(startMs + this.float() * (endMs - startMs));
  }

  /**
   * Generates a US-style phone number: (555) XXX-XXXX.
   * The 555 prefix avoids real phone numbers.
   */
  phone(): string {
    const exchange = this.int(100, 999);
    const subscriber = this.int(1000, 9999);
    return `(555) ${exchange}-${subscriber}`;
  }

  /**
   * Returns a 5-digit ZIP code string offset from a base ZIP.
   */
  zip(baseZip: string): string {
    const base = parseInt(baseZip, 10);
    const offset = this.int(0, 99);
    return String(base + offset).padStart(5, '0');
  }

  /** Returns a random building number (1–9999). */
  streetNumber(): number {
    return this.int(1, 9999);
  }
}
