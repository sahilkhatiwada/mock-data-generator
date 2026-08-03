import { Random } from '../../src/utils/random';
import { generateUser, generateUsers } from '../../src/generators/user';
import { generateProduct, generateProducts } from '../../src/generators/product';
import { generateOrder, generateOrders } from '../../src/generators/order';
import {
  getGenerator,
  registerGenerator,
  unregisterGenerator,
  listGenerators,
} from '../../src/generators/index';

const rng = (seed = 42): Random => new Random(seed);

// ─── User ─────────────────────────────────────────────────────────────────────

describe('generateUser()', () => {
  const user = generateUser(1, rng());

  test('has correct id', () => expect(generateUser(7, rng()).id).toBe(7));

  test('has required fields', () => {
    expect(user).toMatchObject({
      id: expect.any(Number),
      uuid: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      status: expect.any(String),
      role: expect.any(String),
      age: expect.any(Number),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('uuid is RFC 4122 v4', () => {
    expect(user.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test('email contains @ and domain', () => {
    expect(user.email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });

  test('phone matches (555) XXX-XXXX', () => {
    expect(user.phone).toMatch(/^\(555\) \d{3}-\d{4}$/);
  });

  test('address has required fields', () => {
    expect(user.address).toMatchObject({
      street: expect.any(String),
      city: expect.any(String),
      state: expect.any(String),
      zip: expect.stringMatching(/^\d{5}$/),
      country: 'US',
    });
  });

  test('age is 18–80', () => {
    for (let i = 0; i < 50; i++) {
      const { age } = generateUser(i + 1, rng(i));
      expect(age).toBeGreaterThanOrEqual(18);
      expect(age).toBeLessThanOrEqual(80);
    }
  });

  test('updatedAt >= createdAt', () => {
    expect(new Date(user.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(user.createdAt).getTime()
    );
  });

  test('status is a valid value', () => {
    expect(['active', 'inactive', 'suspended', 'pending']).toContain(user.status);
  });

  test('role is a valid value', () => {
    expect(['user', 'admin', 'moderator', 'premium']).toContain(user.role);
  });
});

describe('generateUsers()', () => {
  test('returns correct count', () => expect(generateUsers(25, rng())).toHaveLength(25));
  test('returns empty array for count=0', () => expect(generateUsers(0, rng())).toHaveLength(0));

  test('ids are sequential from 1', () => {
    generateUsers(5, rng()).forEach((u, i) => expect(u.id).toBe(i + 1));
  });

  test('applies field overrides', () => {
    const users = generateUsers(3, rng(), {
      fullName: (u) => `${(u as { firstName: string }).firstName} ${(u as { lastName: string }).lastName}`,
    });
    users.forEach((u) => {
      expect(u['fullName']).toBe(`${u.firstName} ${u.lastName}`);
    });
  });

  test('same seed = identical results', () => {
    expect(generateUsers(10, new Random(99))).toEqual(generateUsers(10, new Random(99)));
  });
});

// ─── Product ──────────────────────────────────────────────────────────────────

describe('generateProduct()', () => {
  const product = generateProduct(1, rng());

  test('has required fields', () => {
    expect(product).toMatchObject({
      id: expect.any(Number),
      uuid: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
      category: expect.any(String),
      subcategory: expect.any(String),
      sku: expect.stringMatching(/^SKU-\d{6}$/),
      inStock: expect.any(Boolean),
      quantity: expect.any(Number),
      rating: expect.any(Number),
      reviewCount: expect.any(Number),
      tags: expect.any(Array),
    });
  });

  test('price has ≤ 2 decimal places', () => {
    for (let i = 0; i < 50; i++) {
      const p = generateProduct(i + 1, rng(i));
      expect(p.price).toBe(parseFloat(p.price.toFixed(2)));
    }
  });

  test('price is positive', () => {
    for (let i = 0; i < 20; i++) expect(generateProduct(i + 1, rng(i)).price).toBeGreaterThan(0);
  });

  test('rating is 1–5', () => {
    for (let i = 0; i < 50; i++) {
      const { rating } = generateProduct(i + 1, rng(i));
      expect(rating).toBeGreaterThanOrEqual(1);
      expect(rating).toBeLessThanOrEqual(5);
    }
  });

  test('inStock matches quantity > 0', () => {
    for (let i = 0; i < 30; i++) {
      const p = generateProduct(i + 1, rng(i));
      expect(p.inStock).toBe(p.quantity > 0);
    }
  });

  test('updatedAt >= createdAt', () => {
    const p = generateProduct(1, rng(5));
    expect(new Date(p.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(p.createdAt).getTime()
    );
  });
});

describe('generateProducts()', () => {
  test('returns correct count', () => expect(generateProducts(30, rng())).toHaveLength(30));

  test('ids are sequential', () => {
    generateProducts(5, rng()).forEach((p, i) => expect(p.id).toBe(i + 1));
  });

  test('applies field overrides', () => {
    const products = generateProducts(3, rng(), {
      discounted: (p) => parseFloat(((p as { price: number }).price * 0.9).toFixed(2)),
    });
    products.forEach((p) => {
      expect(p['discounted']).toBeCloseTo((p.price as number) * 0.9, 1);
    });
  });

  test('same seed = identical results', () => {
    expect(generateProducts(5, new Random(1))).toEqual(generateProducts(5, new Random(1)));
  });
});

// ─── Order ────────────────────────────────────────────────────────────────────

describe('generateOrder()', () => {
  const order = generateOrder(1, rng());

  test('has required fields', () => {
    expect(order).toMatchObject({
      id: expect.any(Number),
      uuid: expect.any(String),
      orderNumber: expect.stringMatching(/^ORD-\d{8}$/),
      userId: expect.any(Number),
      status: expect.any(String),
      items: expect.any(Array),
      itemCount: expect.any(Number),
      subtotal: expect.any(Number),
      total: expect.any(Number),
      paymentMethod: expect.any(String),
      currency: 'USD',
    });
  });

  test('items is non-empty', () => expect(order.items.length).toBeGreaterThan(0));

  test('line item subtotal = unitPrice × quantity', () => {
    order.items.forEach((item) => {
      expect(item.subtotal).toBeCloseTo(item.unitPrice * item.quantity, 1);
    });
  });

  test('itemCount equals sum of quantities', () => {
    expect(order.itemCount).toBe(order.items.reduce((s, i) => s + i.quantity, 0));
  });

  test('total is positive', () => {
    for (let i = 0; i < 20; i++) expect(generateOrder(i + 1, rng(i)).total).toBeGreaterThan(0);
  });

  test('status is valid', () => {
    const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    for (let i = 0; i < 50; i++) expect(valid).toContain(generateOrder(i + 1, rng(i)).status);
  });

  test('shippedAt is null for non-shipped orders', () => {
    for (let i = 0; i < 100; i++) {
      const o = generateOrder(i + 1, rng(i));
      if (['pending', 'processing', 'cancelled', 'refunded'].includes(o.status)) {
        expect(o.shippedAt).toBeNull();
      }
    }
  });

  test('deliveredAt is null for non-delivered orders', () => {
    for (let i = 0; i < 100; i++) {
      const o = generateOrder(i + 1, rng(i));
      if (o.status !== 'delivered') expect(o.deliveredAt).toBeNull();
    }
  });
});

describe('generateOrders()', () => {
  test('returns correct count', () => expect(generateOrders(20, rng())).toHaveLength(20));

  test('ids are sequential', () => {
    generateOrders(5, rng()).forEach((o, i) => expect(o.id).toBe(i + 1));
  });

  test('respects userCount context', () => {
    const orders = generateOrders(100, rng(), {}, { userCount: 5 });
    orders.forEach((o) => {
      expect(o.userId).toBeGreaterThanOrEqual(1);
      expect(o.userId).toBeLessThanOrEqual(5);
    });
  });

  test('same seed = identical results', () => {
    expect(generateOrders(5, new Random(7))).toEqual(generateOrders(5, new Random(7)));
  });
});

// ─── Generator registry ───────────────────────────────────────────────────────

describe('Generator registry', () => {
  afterEach(() => { unregisterGenerator('widgets'); });

  test('listGenerators includes built-ins', () => {
    const types = listGenerators();
    expect(types).toContain('users');
    expect(types).toContain('products');
    expect(types).toContain('orders');
  });

  test('getGenerator returns a function for built-ins', () => {
    expect(typeof getGenerator('users')).toBe('function');
  });

  test('getGenerator throws RangeError for unknown type', () => {
    expect(() => getGenerator('aliens')).toThrow(RangeError);
  });

  test('registerGenerator adds a custom type', () => {
    registerGenerator('widgets', (count, r) =>
      Array.from({ length: count }, (_, i) => ({ id: i + 1, color: r.pick(['red', 'blue']) }))
    );
    expect(listGenerators()).toContain('widgets');
    const gen = getGenerator('widgets');
    expect(gen(3, rng(), {}, {})).toHaveLength(3);
  });

  test('registerGenerator throws on empty type', () => {
    expect(() => registerGenerator('', () => [])).toThrow(TypeError);
  });

  test('registerGenerator throws when fn is not a function', () => {
    expect(() => registerGenerator('widgets', 'bad' as never)).toThrow(TypeError);
  });

  test('unregisterGenerator returns false for unknown type', () => {
    expect(unregisterGenerator('nonexistent')).toBe(false);
  });

  test('unregisterGenerator removes the type', () => {
    registerGenerator('widgets', () => []);
    expect(unregisterGenerator('widgets')).toBe(true);
    expect(listGenerators()).not.toContain('widgets');
  });
});
