# mock-data-generator

[![npm version](https://img.shields.io/npm/v/mock-data-generator.svg)](https://www.npmjs.com/package/mock-data-generator)
[![npm downloads](https://img.shields.io/npm/dm/mock-data-generator.svg)](https://www.npmjs.com/package/mock-data-generator)
[![Build Status](https://github.com/sahilkhatiwada/mock-data-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/sahilkhatiwada/mock-data-generator/actions)
[![Coverage](https://codecov.io/gh/sahilkhatiwada/mock-data-generator/branch/main/graph/badge.svg)](https://codecov.io/gh/sahilkhatiwada/mock-data-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

Generate realistic mock data for **users**, **products**, and **orders** with full TypeScript support — zero external dependencies, seeded PRNG for reproducibility, streaming API, and a built-in CLI.

---

## Features

| | |
|---|---|
| **Zero dependencies** | Self-contained — no `faker`, no `chance`, nothing |
| **Full TypeScript** | Strict types, overloaded signatures, exported interfaces |
| **Seeded PRNG** | Mulberry32 — reproducible output with any seed |
| **Plugin system** | Register custom generator types at runtime |
| **Streaming API** | Memory-efficient `generateStream()` for large datasets |
| **Async API** | Promise-based `generateAsync()` wrapper |
| **CLI** | `npx mock-generate` for quick terminal use |
| **Three built-in types** | Users, products, orders with realistic data |

---

## Installation

```bash
npm install mock-data-generator
```

Use without installing via npx:

```bash
npx mock-generate users --count=10 --pretty
```

---

## Quick Start

```ts
import { generate } from 'mock-data-generator';
import type { User, Product, Order } from 'mock-data-generator';

// Single type — returns typed array
const users: User[]    = generate('users',    { count: 50 });
const products: Product[] = generate('products', { count: 100 });
const orders: Order[]  = generate('orders',   { count: 75 });

// Reproducible output
const users = generate('users', { count: 100, seed: 12345 });

// Multiple types — returns keyed object
const data = generate({
  users:    { count: 50 },
  products: { count: 100 },
  orders:   { count: 75 },
});
// data.users, data.products, data.orders
```

---

## Generated Data

### User
```json
{
  "id": 1,
  "uuid": "4b3a1f2e-9c8d-4a5b-8e7f-1d2c3b4a5e6f",
  "firstName": "Sarah",
  "lastName": "Mitchell",
  "email": "sarah.mitchell@gmail.com",
  "phone": "(555) 234-5678",
  "address": {
    "street": "742 Maple Ave",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94107",
    "country": "US"
  },
  "status": "active",
  "role": "user",
  "age": 34,
  "createdAt": "2023-04-12T14:30:00.000Z",
  "updatedAt": "2024-01-08T09:15:00.000Z"
}
```

### Product
```json
{
  "id": 1,
  "uuid": "...",
  "name": "Wireless Bluetooth Headphones",
  "description": "Premium headphones designed for everyday use...",
  "price": 129.99,
  "category": "Electronics",
  "subcategory": "Headphones",
  "sku": "SKU-000001",
  "inStock": true,
  "quantity": 243,
  "rating": 4.3,
  "reviewCount": 1847,
  "tags": ["wireless", "electronics", "featured"],
  "createdAt": "2023-06-01T10:00:00.000Z",
  "updatedAt": "2024-02-14T16:45:00.000Z"
}
```

### Order
```json
{
  "id": 1,
  "uuid": "...",
  "orderNumber": "ORD-00000001",
  "userId": 23,
  "status": "delivered",
  "items": [{ "productId": 4721, "unitPrice": 89.99, "quantity": 2, "subtotal": 179.98 }],
  "itemCount": 2,
  "subtotal": 179.98,
  "shippingCost": 5.99,
  "tax": 18.00,
  "discount": 0,
  "total": 203.97,
  "paymentMethod": "credit_card",
  "currency": "USD",
  "orderedAt": "2024-03-01T08:00:00.000Z",
  "shippedAt": "2024-03-02T11:30:00.000Z",
  "deliveredAt": "2024-03-05T14:00:00.000Z"
}
```

---

## API Reference

### `generate(type, options?)`

Generates records for a single built-in type. Returns a fully-typed array.

```ts
const users    = generate('users',    { count: 50, seed: 42 });
const products = generate('products', { count: 100 });
const orders   = generate('orders',   { count: 75 });
```

### `generate(typeMap)`

Generates multiple types in one call. Returns a keyed `MultiTypeResult`.

```ts
const data = generate({
  users:    { count: 50 },
  products: { count: 100 },
  orders:   { count: 75 },  // userId bounded to users.count
});
```

**Options:**

| Option   | Type     | Default | Description                              |
|----------|----------|---------|------------------------------------------|
| `count`  | `number` | `10`    | Records to generate (max 1,000,000)      |
| `seed`   | `number` | random  | Seed for reproducible output             |
| `fields` | `object` | `{}`    | Override/add fields: `{ key: (r) => v }` |

### `generateAsync(type | typeMap, options?)`

Promise-based wrapper with identical overloads.

```ts
const users = await generateAsync('users', { count: 100, seed: 42 });
```

### `generateStream(type, options?)`

Generator function for memory-efficient iteration over large datasets.

```ts
for (const user of generateStream('users', { count: 1_000_000, seed: 1 })) {
  writeLine(JSON.stringify(user));
}
```

### Custom field overrides

Override or add fields with a function that receives the generated record:

```ts
const users = generate('users', {
  count: 10,
  fields: {
    fullName: (u) => `${(u as User).firstName} ${(u as User).lastName}`,
    isPremium: (u) => (u as User).role === 'premium',
  },
});
```

### `registerGenerator(type, fn)`

Register a custom generator type usable anywhere `generate()` is called.

```ts
import { registerGenerator } from 'mock-data-generator';
import type { GeneratorFn } from 'mock-data-generator';

const employeeGen: GeneratorFn = (count, rng) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    department: rng.pick(['Engineering', 'Sales', 'Design']),
    salary: rng.decimal(50_000, 200_000, 2),
  }));

registerGenerator('employees', employeeGen);

// Use via the registry directly:
import { getGenerator } from 'mock-data-generator/generators';
const gen = getGenerator('employees');
const employees = gen(20, new Random(42), {}, {});
```

### `listGenerators()`

Returns all registered type names (built-in + custom).

```ts
listGenerators(); // ['users', 'products', 'orders', 'employees']
```

### `Random` class

Low-level seeded PRNG utility, useful inside custom generators.

```ts
import { Random } from 'mock-data-generator';

const rng = new Random(42);
rng.uuid();                     // RFC 4122 v4 UUID
rng.int(1, 100);                // integer in [1, 100]
rng.decimal(9.99, 99.99, 2);   // float rounded to 2dp
rng.pick(['a', 'b', 'c']);     // random element
rng.shuffle([1, 2, 3, 4, 5]); // Fisher-Yates shuffle
rng.weightedPick([{ value: 'rare', weight: 5 }, { value: 'common', weight: 95 }]);
rng.bool(0.3);                  // true 30% of the time
rng.phone();                    // (555) XXX-XXXX
rng.date(new Date('2020-01-01'), new Date()); // random Date in range
```

---

## CLI

```bash
# Generate 50 users
npx mock-generate users --count=50

# Multiple types
npx mock-generate users products orders --count=25

# Reproducible with seed
npx mock-generate users --count=100 --seed=12345

# Write to file, pretty-printed
npx mock-generate users products --count=50 --pretty --output=data.json

# List available types
npx mock-generate --list

# Help
npx mock-generate --help
```

---

## TypeScript Types

All public types are exported from the package root:

```ts
import type {
  User, Product, Order,
  Address, OrderLineItem,
  UserStatus, UserRole, OrderStatus, PaymentMethod,
  GenerateOptions, TypeOptionsMap, MultiTypeResult,
  GeneratorFn, FieldOverrideFn, GenerationContext,
  WeightedItem,
} from 'mock-data-generator';
```

---

## Performance

| Operation              | Records  | Approx. time |
|------------------------|----------|--------------|
| `generate('users')`    | 10,000   | ~150 ms      |
| `generate('products')` | 10,000   | ~130 ms      |
| `generate('orders')`   | 10,000   | ~200 ms      |
| `generateStream`       | 100,000  | ~1.5 s       |

*Benchmarked on Node.js 20, Apple M2.*

---

## Contributing

1. Fork the repo and create a feature branch
2. Run `npm install` to set up devDependencies
3. Make changes in `src/`, add tests in `tests/`
4. Run `npm test` — all tests must pass with ≥ 90% coverage
5. Run `npm run build` to verify the TypeScript compiles cleanly
6. Open a pull request at https://github.com/sahilkhatiwada/mock-data-generator

---

## License

MIT © Sahil Khatiwada — see [LICENSE](LICENSE) for details.
#   m o c k - d a t a - g e n e r a t o r 
 
 