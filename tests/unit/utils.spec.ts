import { Random, createPRNG } from '../../src/utils/random';
import { SeedManager } from '../../src/utils/seed';
import {
  normaliseInput,
  validateType,
  validateOptions,
  sanitiseString,
  assert,
  SUPPORTED_TYPES,
} from '../../src/utils/validation';

// ─── createPRNG ───────────────────────────────────────────────────────────────

describe('createPRNG', () => {
  test('returns a function', () => {
    expect(typeof createPRNG(1)).toBe('function');
  });

  test('produces values in [0, 1)', () => {
    const rng = createPRNG(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('same seed produces identical sequence', () => {
    const a = createPRNG(999);
    const b = createPRNG(999);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  test('different seeds produce different sequences', () => {
    const rng1 = createPRNG(1);
    const rng2 = createPRNG(2);
    const seq1 = Array.from({ length: 20 }, () => rng1());
    const seq2 = Array.from({ length: 20 }, () => rng2());
    expect(seq1).not.toEqual(seq2);
  });
});

// ─── Random ───────────────────────────────────────────────────────────────────

describe('Random', () => {
  let rng: Random;
  beforeEach(() => { rng = new Random(12345); });

  describe('constructor', () => {
    test('stores provided seed', () => {
      expect(new Random(42).seed).toBe(42);
    });

    test('generates a seed when none provided', () => {
      const r = new Random();
      expect(typeof r.seed).toBe('number');
      expect(r.seed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('float()', () => {
    test('returns value in [0, 1)', () => {
      for (let i = 0; i < 500; i++) {
        const v = rng.float();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });

  describe('int()', () => {
    test('returns integers in [min, max]', () => {
      for (let i = 0; i < 500; i++) {
        const v = rng.int(5, 10);
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(5);
        expect(v).toBeLessThanOrEqual(10);
      }
    });

    test('works when min === max', () => expect(rng.int(7, 7)).toBe(7));

    test('throws RangeError when min > max', () => {
      expect(() => rng.int(10, 5)).toThrow(RangeError);
    });
  });

  describe('decimal()', () => {
    test('result is within [min, max]', () => {
      for (let i = 0; i < 200; i++) {
        const v = rng.decimal(1.5, 9.5, 2);
        expect(v).toBeGreaterThanOrEqual(1.5);
        expect(v).toBeLessThanOrEqual(9.5);
      }
    });

    test('honours decimal places', () => {
      const v = rng.decimal(0, 100, 2);
      expect(v).toBe(parseFloat(v.toFixed(2)));
    });
  });

  describe('pick()', () => {
    test('always returns an array element', () => {
      const arr = ['a', 'b', 'c', 'd'];
      for (let i = 0; i < 100; i++) expect(arr).toContain(rng.pick(arr));
    });

    test('throws TypeError on empty array', () => {
      expect(() => rng.pick([])).toThrow(TypeError);
    });

    test('throws TypeError on non-array', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => rng.pick('abc' as any)).toThrow(TypeError);
    });
  });

  describe('weightedPick()', () => {
    const items = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 10 },
      { value: 'c', weight: 100 },
    ] as const;

    test('always returns a listed value', () => {
      for (let i = 0; i < 200; i++) {
        expect(['a', 'b', 'c']).toContain(rng.weightedPick(items));
      }
    });

    test('heavier items are picked more often', () => {
      const r = new Random(0);
      const counts: Record<string, number> = { rare: 0, common: 0 };
      const weighted = [{ value: 'rare', weight: 1 }, { value: 'common', weight: 99 }];
      for (let i = 0; i < 1000; i++) counts[r.weightedPick(weighted)]++;
      expect(counts['common']).toBeGreaterThan(counts['rare'] * 5);
    });

    test('throws TypeError on empty array', () => {
      expect(() => rng.weightedPick([])).toThrow(TypeError);
    });
  });

  describe('bool()', () => {
    test('returns a boolean', () => {
      for (let i = 0; i < 100; i++) expect(typeof rng.bool()).toBe('boolean');
    });

    test('probability=1 always true', () => {
      for (let i = 0; i < 50; i++) expect(rng.bool(1)).toBe(true);
    });

    test('probability=0 always false', () => {
      for (let i = 0; i < 50; i++) expect(rng.bool(0)).toBe(false);
    });
  });

  describe('shuffle()', () => {
    test('returns same length', () => {
      expect(rng.shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
    });

    test('does not mutate original', () => {
      const arr = [1, 2, 3, 4, 5];
      const copy = [...arr];
      rng.shuffle(arr);
      expect(arr).toEqual(copy);
    });

    test('contains same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(rng.shuffle(arr).sort()).toEqual([...arr].sort());
    });
  });

  describe('sample()', () => {
    test('returns n unique elements', () => {
      const result = rng.sample([1, 2, 3, 4, 5, 6, 7, 8], 4);
      expect(result).toHaveLength(4);
      expect(new Set(result).size).toBe(4);
    });

    test('throws RangeError when n > length', () => {
      expect(() => rng.sample([1, 2], 5)).toThrow(RangeError);
    });
  });

  describe('uuid()', () => {
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    test('matches RFC 4122 v4 format', () => {
      for (let i = 0; i < 50; i++) expect(rng.uuid()).toMatch(uuidRe);
    });

    test('generates unique UUIDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => rng.uuid()));
      expect(ids.size).toBe(100);
    });
  });

  describe('date()', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2023-12-31');

    test('returns a Date within bounds', () => {
      for (let i = 0; i < 100; i++) {
        const d = rng.date(start, end);
        expect(d).toBeInstanceOf(Date);
        expect(d.getTime()).toBeGreaterThanOrEqual(start.getTime());
        expect(d.getTime()).toBeLessThanOrEqual(end.getTime());
      }
    });

    test('throws TypeError on invalid dates', () => {
      expect(() => rng.date('not-a-date', new Date())).toThrow(TypeError);
    });

    test('throws RangeError when start > end', () => {
      expect(() => rng.date(new Date('2025-01-01'), new Date('2020-01-01'))).toThrow(RangeError);
    });
  });

  describe('phone()', () => {
    test('matches (555) XXX-XXXX', () => {
      for (let i = 0; i < 50; i++) expect(rng.phone()).toMatch(/^\(555\) \d{3}-\d{4}$/);
    });
  });

  describe('zip()', () => {
    test('returns a 5-digit string', () => {
      for (let i = 0; i < 50; i++) expect(rng.zip('10001')).toMatch(/^\d{5}$/);
    });
  });

  describe('streetNumber()', () => {
    test('returns integer in [1, 9999]', () => {
      for (let i = 0; i < 100; i++) {
        const n = rng.streetNumber();
        expect(Number.isInteger(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(9999);
      }
    });
  });
});

// ─── SeedManager ──────────────────────────────────────────────────────────────

describe('SeedManager', () => {
  let manager: SeedManager;
  beforeEach(() => { manager = new SeedManager(); });

  test('init() stores the seed', () => {
    manager.init(42);
    expect(manager.getSeed()).toBe(42);
  });

  test('init() without seed stores a generated seed', () => {
    manager.init();
    expect(typeof manager.getSeed()).toBe('number');
    expect(manager.getSeed()).toBeGreaterThanOrEqual(0);
  });

  test('getInstance() returns a Random', () => {
    expect(typeof manager.getInstance().float).toBe('function');
  });

  test('getInstance() auto-initialises', () => {
    expect(manager.getInstance()).toBeDefined();
    expect(manager.getSeed()).not.toBeNull();
  });

  test('reset() clears instance and seed', () => {
    manager.init(99);
    manager.reset();
    expect(manager.getSeed()).toBeNull();
  });

  test('createNamed() returns a Random', () => {
    manager.init(100);
    expect(typeof manager.createNamed('users').float).toBe('function');
  });

  test('createNamed() is deterministic for same namespace + seed', () => {
    manager.init(42);
    const m2 = new SeedManager();
    m2.init(42);
    expect(manager.createNamed('orders').float()).toBeCloseTo(m2.createNamed('orders').float(), 10);
  });

  test('createNamed() differs per namespace', () => {
    manager.init(42);
    expect(manager.createNamed('users').float()).not.toBe(manager.createNamed('products').float());
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('SUPPORTED_TYPES', () => {
  test('contains expected types', () => {
    expect(SUPPORTED_TYPES).toContain('users');
    expect(SUPPORTED_TYPES).toContain('products');
    expect(SUPPORTED_TYPES).toContain('orders');
  });
});

describe('validateType()', () => {
  test('accepts built-in types', () => {
    expect(() => validateType('users')).not.toThrow();
    expect(() => validateType('products')).not.toThrow();
    expect(() => validateType('orders')).not.toThrow();
  });

  test('throws RangeError for unknown type', () => {
    expect(() => validateType('aliens')).toThrow(RangeError);
  });

  test('throws RangeError for empty string', () => {
    expect(() => validateType('   ')).toThrow(RangeError);
  });
});

describe('normaliseInput()', () => {
  test('normalises a string to a map', () => {
    expect(normaliseInput('users')).toEqual({ users: {} });
  });

  test('passes through a valid object map', () => {
    const map = { users: { count: 5 }, products: { count: 10 } };
    expect(normaliseInput(map)).toEqual(map);
  });

  test('throws RangeError on empty object', () => {
    expect(() => normaliseInput({})).toThrow(RangeError);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError on array', () => expect(() => normaliseInput(['users'] as any)).toThrow(TypeError));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError on null', () => expect(() => normaliseInput(null as any)).toThrow(TypeError));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError on number', () => expect(() => normaliseInput(42 as any)).toThrow(TypeError));
});

describe('validateOptions()', () => {
  test('defaults count to 10', () => {
    expect(validateOptions({}, 'users').count).toBe(10);
  });

  test('passes through valid count', () => {
    expect(validateOptions({ count: 50 }, 'users').count).toBe(50);
  });

  test('throws RangeError on negative count', () => {
    expect(() => validateOptions({ count: -1 }, 'users')).toThrow(RangeError);
  });

  test('throws RangeError on count > 1_000_000', () => {
    expect(() => validateOptions({ count: 2_000_000 }, 'users')).toThrow(RangeError);
  });

  test('throws RangeError on non-integer count', () => {
    expect(() => validateOptions({ count: 1.5 }, 'users')).toThrow(RangeError);
  });

  test('floors a float seed', () => {
    expect(validateOptions({ seed: 42.9 }, 'users').seed).toBe(42);
  });

  test('throws RangeError on negative seed', () => {
    expect(() => validateOptions({ seed: -5 }, 'users')).toThrow(RangeError);
  });

  test('throws TypeError when fields is not an object', () => {
    expect(() => validateOptions({ fields: 'bad' as never }, 'users')).toThrow(TypeError);
  });

  test('throws TypeError when a field value is not a function', () => {
    expect(() => validateOptions({ fields: { name: 'static' as never } }, 'users')).toThrow(TypeError);
  });

  test('accepts valid field functions', () => {
    expect(() => validateOptions({ fields: { full: () => 'x' } }, 'users')).not.toThrow();
  });

  test('throws RangeError for invalid format', () => {
    expect(() => validateOptions({ format: 'xml' as never }, 'users')).toThrow(RangeError);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError when options is null', () => expect(() => validateOptions(null as any, 'users')).toThrow(TypeError));
});

describe('sanitiseString()', () => {
  test('trims whitespace', () => expect(sanitiseString('  hello  ')).toBe('hello'));
  test('strips null bytes', () => expect(sanitiseString('hel\x00lo')).toBe('hello'));
  test('returns null for number', () => expect(sanitiseString(42)).toBeNull());
  test('returns null for null', () => expect(sanitiseString(null)).toBeNull());
  test('returns null for undefined', () => expect(sanitiseString(undefined)).toBeNull());
});

describe('assert()', () => {
  test('does not throw when true', () => expect(() => assert(true, 'ok')).not.toThrow());
  test('throws with message when false', () => expect(() => assert(false, 'boom')).toThrow('boom'));
  test('throws specified error class', () => expect(() => assert(false, 'range', RangeError)).toThrow(RangeError));
});
