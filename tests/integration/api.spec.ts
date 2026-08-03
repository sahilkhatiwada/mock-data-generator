import {
  generate,
  generateAsync,
  generateStream,
  registerGenerator,
  unregisterGenerator,
  listGenerators,
  Random,
} from '../../src/index';
import type { User, Product, Order } from '../../src/types';

// ─── generate() single type ───────────────────────────────────────────────────

describe('generate() — single type', () => {
  test('returns an array', () => expect(Array.isArray(generate('users', { count: 5 }))).toBe(true));

  test('returns the correct count', () => {
    expect(generate('users', { count: 20 })).toHaveLength(20);
    expect(generate('products', { count: 15 })).toHaveLength(15);
    expect(generate('orders', { count: 8 })).toHaveLength(8);
  });

  test('returns empty array for count=0', () => {
    expect(generate('users', { count: 0 })).toHaveLength(0);
  });

  test('defaults to 10 records', () => {
    expect(generate('users')).toHaveLength(10);
  });

  test('seed produces reproducible output', () => {
    const a = generate('users', { count: 10, seed: 12345 });
    const b = generate('users', { count: 10, seed: 12345 });
    expect(a).toEqual(b);
  });

  test('different seeds produce different output', () => {
    const a = generate('users', { count: 5, seed: 1 });
    const b = generate('users', { count: 5, seed: 2 });
    expect(a).not.toEqual(b);
  });

  test('custom field overrides are applied', () => {
    const users = generate('users', {
      count: 5,
      fields: {
        fullName: (u) => `${(u as User).firstName} ${(u as User).lastName}`,
        isAdult: (u) => (u as User).age >= 18,
      },
    }) as User[];

    users.forEach((u) => {
      expect((u as Record<string, unknown>)['fullName']).toBe(`${u.firstName} ${u.lastName}`);
      expect((u as Record<string, unknown>)['isAdult']).toBe(true);
    });
  });

  test('returned users have expected shape', () => {
    const [user] = generate('users', { count: 1, seed: 1 }) as User[];
    expect(user).toMatchObject({
      id: 1,
      uuid: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      firstName: expect.any(String),
      email: expect.stringMatching(/@/),
      phone: expect.stringMatching(/^\(555\)/),
      address: expect.objectContaining({ country: 'US' }),
    });
  });

  test('returned products have expected shape', () => {
    const [p] = generate('products', { count: 1, seed: 1 }) as Product[];
    expect(p.sku).toMatch(/^SKU-\d{6}$/);
    expect(p.price).toBeGreaterThan(0);
    expect(p.inStock).toBe(p.quantity > 0);
  });

  test('returned orders have expected shape', () => {
    const [o] = generate('orders', { count: 1, seed: 1 }) as Order[];
    expect(o.orderNumber).toMatch(/^ORD-\d{8}$/);
    expect(o.currency).toBe('USD');
    expect(o.total).toBeGreaterThan(0);
  });
});

// ─── generate() multiple types ────────────────────────────────────────────────

describe('generate() — multiple types', () => {
  test('returns keyed object', () => {
    const result = generate({ users: { count: 5 }, products: { count: 10 }, orders: { count: 3 } });
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('orders');
  });

  test('each key has correct count', () => {
    const result = generate({ users: { count: 7 }, products: { count: 13 } });
    expect(result.users).toHaveLength(7);
    expect(result.products).toHaveLength(13);
  });

  test('seed propagates reproducibility', () => {
    const opts = { users: { count: 5, seed: 42 }, products: { count: 5 } };
    expect(generate(opts)).toEqual(generate(opts));
  });

  test('orders userId is bounded by userCount', () => {
    const result = generate({ users: { count: 10 }, orders: { count: 50 } });
    const userIds = new Set((result.users as User[]).map((u) => u.id));
    (result.orders as Order[]).forEach((o) => {
      expect(userIds.has(o.userId)).toBe(true);
    });
  });
});

// ─── generate() error handling ────────────────────────────────────────────────

describe('generate() — errors', () => {
  test('throws RangeError for unknown type', () => {
    expect(() => generate('aliens' as never)).toThrow(RangeError);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError for null', () => expect(() => generate(null as any)).toThrow(TypeError));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  test('throws TypeError for number', () => expect(() => generate(42 as any)).toThrow(TypeError));

  test('throws RangeError for negative count', () => {
    expect(() => generate('users', { count: -5 })).toThrow(RangeError);
  });

  test('throws RangeError for count > 1_000_000', () => {
    expect(() => generate('users', { count: 2_000_000 })).toThrow(RangeError);
  });

  test('throws RangeError for negative seed', () => {
    expect(() => generate('users', { seed: -1 })).toThrow(RangeError);
  });

  test('throws TypeError when fields is not an object', () => {
    expect(() => generate('users', { fields: 'bad' as never })).toThrow(TypeError);
  });

  test('throws TypeError when a field value is not a function', () => {
    expect(() => generate('users', { fields: { name: 'static' as never } })).toThrow(TypeError);
  });

  test('throws RangeError on empty object', () => {
    expect(() => generate({} as never)).toThrow(RangeError);
  });
});

// ─── generateAsync() ─────────────────────────────────────────────────────────

describe('generateAsync()', () => {
  test('returns a Promise', () => {
    expect(generateAsync('users', { count: 5 })).toBeInstanceOf(Promise);
  });

  test('resolves with the same data as sync generate()', async () => {
    const seed = 9001;
    const sync = generate('users', { count: 10, seed });
    const async_ = await generateAsync('users', { count: 10, seed });
    expect(async_).toEqual(sync);
  });

  test('resolves multi-type results', async () => {
    const result = await generateAsync({ users: { count: 3 }, products: { count: 4 } });
    expect(result.users).toHaveLength(3);
    expect(result.products).toHaveLength(4);
  });

  test('rejects on invalid input', async () => {
    await expect(generateAsync('aliens' as never)).rejects.toThrow(RangeError);
  });
});

// ─── generateStream() ────────────────────────────────────────────────────────

describe('generateStream()', () => {
  test('is iterable', () => {
    const gen = generateStream('users', { count: 5 });
    expect(typeof gen[Symbol.iterator]).toBe('function');
  });

  test('yields the correct number of records', () => {
    expect([...generateStream('users', { count: 25 })]).toHaveLength(25);
  });

  test('yielded records have id and firstName', () => {
    const [first] = generateStream('users', { count: 1 });
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('firstName');
  });

  test('handles large count without error', () => {
    let n = 0;
    for (const _ of generateStream('products', { count: 2500 })) n++;
    expect(n).toBe(2500);
  });

  test('same seed produces reproducible stream', () => {
    const a = [...generateStream('users', { count: 10, seed: 77 })];
    const b = [...generateStream('users', { count: 10, seed: 77 })];
    expect(a.map((u) => u['email'])).toEqual(b.map((u) => u['email']));
  });

  test('yields 0 records for count=0', () => {
    expect([...generateStream('users', { count: 0 })]).toHaveLength(0);
  });

  test('throws TypeError for non-string type', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => [...generateStream(42 as any)]).toThrow(TypeError);
  });
});

// ─── Plugin API ───────────────────────────────────────────────────────────────

describe('registerGenerator() / plugin API', () => {
  afterEach(() => { unregisterGenerator('invoices'); });

  test('custom type appears in listGenerators()', () => {
    registerGenerator('invoices', () => []);
    expect(listGenerators()).toContain('invoices');
  });

  test('custom generator produces records via getGenerator()', () => {
    registerGenerator('invoices', (count, r) =>
      Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        amount: r.decimal(10, 1000, 2),
      }))
    );
    const { getGenerator } = require('../../src/generators/index') as typeof import('../../src/generators/index');
    const gen = getGenerator('invoices');
    const result = gen(5, new Random(1), {}, {});
    expect(result).toHaveLength(5);
    result.forEach((inv) => {
      expect((inv as Record<string, number>)['amount']).toBeGreaterThanOrEqual(10);
      expect((inv as Record<string, number>)['amount']).toBeLessThanOrEqual(1000);
    });
  });

  test('unregisterGenerator removes the type', () => {
    registerGenerator('invoices', () => []);
    unregisterGenerator('invoices');
    expect(listGenerators()).not.toContain('invoices');
  });
});

// ─── Data quality ─────────────────────────────────────────────────────────────

describe('Data quality', () => {
  test('user UUIDs are unique (500 records)', () => {
    const users = generate('users', { count: 500, seed: 2 }) as User[];
    expect(new Set(users.map((u) => u.uuid)).size).toBe(500);
  });

  test('product UUIDs are unique (500 records)', () => {
    const products = generate('products', { count: 500, seed: 3 }) as Product[];
    expect(new Set(products.map((p) => p.uuid)).size).toBe(500);
  });

  test('order totals are all positive', () => {
    const orders = generate('orders', { count: 100, seed: 4 }) as Order[];
    orders.forEach((o) => expect(o.total).toBeGreaterThan(0));
  });

  test('product prices have ≤ 2 decimal places', () => {
    const products = generate('products', { count: 100, seed: 5 }) as Product[];
    products.forEach((p) => expect(p.price).toBe(parseFloat(p.price.toFixed(2))));
  });

  test('all user ages are 18–80', () => {
    const users = generate('users', { count: 200, seed: 6 }) as User[];
    users.forEach((u) => {
      expect(u.age).toBeGreaterThanOrEqual(18);
      expect(u.age).toBeLessThanOrEqual(80);
    });
  });

  test('email uniqueness ≥ 95% over 500 records', () => {
    const users = generate('users', { count: 500, seed: 1 }) as User[];
    const emails = users.map((u) => u.email);
    expect(new Set(emails).size / emails.length).toBeGreaterThan(0.95);
  });
});

// ─── Performance ─────────────────────────────────────────────────────────────

describe('Performance', () => {
  const limit = 2000; // ms

  test('10,000 users in < 2s', () => {
    const t = Date.now();
    generate('users', { count: 10_000, seed: 1 });
    expect(Date.now() - t).toBeLessThan(limit);
  });

  test('10,000 products in < 2s', () => {
    const t = Date.now();
    generate('products', { count: 10_000, seed: 1 });
    expect(Date.now() - t).toBeLessThan(limit);
  });

  test('10,000 orders in < 2s', () => {
    const t = Date.now();
    generate('orders', { count: 10_000, seed: 1 });
    expect(Date.now() - t).toBeLessThan(limit);
  });
});

// ─── Public exports ───────────────────────────────────────────────────────────

describe('Public exports', () => {
  test('generate', () => expect(typeof generate).toBe('function'));
  test('generateAsync', () => expect(typeof generateAsync).toBe('function'));
  test('generateStream', () => expect(typeof generateStream).toBe('function'));
  test('registerGenerator', () => expect(typeof registerGenerator).toBe('function'));
  test('unregisterGenerator', () => expect(typeof unregisterGenerator).toBe('function'));
  test('listGenerators', () => expect(typeof listGenerators).toBe('function'));
  test('Random', () => expect(typeof Random).toBe('function'));
});
