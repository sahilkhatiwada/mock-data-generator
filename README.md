# mocks-data-generator

[![CI](https://github.com/sahilkhatiwada/mock-data-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/sahilkhatiwada/mock-data-generator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D14-339933.svg?style=flat-square)](https://nodejs.org)
[![Zero deps](https://img.shields.io/badge/dependencies-0-brightgreen.svg?style=flat-square)](#)

> Generate realistic mock data for users, products, and orders — zero external dependencies, full TypeScript support, seeded PRNG for reproducible output.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Generated Data Shapes](#generated-data-shapes)
- [API Reference](#api-reference)
- [CLI Usage](#cli-usage)
- [TypeScript Types](#typescript-types)
- [Custom Generators (Plugin API)](#custom-generators-plugin-api)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Details |
|---|---|
| **Zero dependencies** | No `faker`, no `chance` — entirely self-contained |
| **Full TypeScript** | Strict types, function overloads, exported interfaces |
| **Seeded PRNG** | Mulberry32 algorithm — same seed always gives same data |
| **Three built-in types** | `users`, `products`, `orders` with realistic fields |
| **Plugin system** | Register your own generator types at runtime |
| **Streaming API** | `generateStream()` yields records one at a time for huge datasets |
| **Async API** | `generateAsync()` Promise wrapper for async pipelines |
| **CLI** | `npx mock-generate` — generate data straight from the terminal |
| **Browser playground** | Visual UI to explore and download generated data |

---

## Installation

```bash
npm install mocks-data-generator
```

Run instantly without installing:

```bash
npx mock-generate users --count=10 --pretty
```

---

## Quick Start

```ts
import { generate } from 'mocks-data-generator';
import type { User, Product, Order } from 'mocks-data-generator';

// Single type — returns a typed array
const users: User[]       = generate('users',    { count: 50 });
const products: Product[] = generate('products', { count: 100 });
const orders: Order[]     = generate('orders',   { count: 75 });

// Reproducible output — same seed → same data every time
const users = generate('users', { count: 10, seed: 12345 });

// Multiple types in one call — returns a keyed object
const data = generate({
  users:    { count: 50 },
  products: { count: 100 },
  orders:   { count: 75 },  // order.userId is bounded to users.count
});

console.log(data.users.length);    // 50
console.log(data.products.length); // 100
console.log(data.orders.length);   // 75
```

---

## Generated Data Shapes

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
  "uuid": "7e8f9a0b-1c2d-4e3f-8a7b-5c6d7e8f9a0b",
  "name": "Wireless Bluetooth Headphones",
  "description": "Premium headphones designed for everyday use. Features noise cancellation and long battery life.",
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
  "uuid": "a1b2c3d4-e5f6-4789-8abc-def012345678",
  "orderNumber": "ORD-00000001",
  "userId": 23,
  "status": "delivered",
  "items": [
    {
      "productId": 4721,
      "name": "Product 4721",
      "category": "Electronics",
      "unitPrice": 89.99,
      "quantity": 2,
      "subtotal": 179.98
    }
  ],
  "itemCount": 2,
  "subtotal": 179.98,
  "shippingCost": 5.99,
  "tax": 18.00,
  "discount": 0,
  "total": 203.97,
  "paymentMethod": "credit_card",
  "currency": "USD",
  "shippingAddress": {
    "street": "123 Shipping Lane",
    "city": "Springfield",
    "state": "IL",
    "zip": "62701",
    "country": "US"
  },
  "orderedAt": "2024-03-01T08:00:00.000Z",
  "shippedAt": "2024-03-02T11:30:00.000Z",
  "deliveredAt": "2024-03-05T14:00:00.000Z"
}
```

---

## API Reference

### `generate(type, options?)`

Generates records for a single built-in type. Returns a fully typed array.

```ts
generate(type: 'users',    options?: GenerateOptions): User[]
generate(type: 'products', options?: GenerateOptions): Product[]
generate(type: 'orders',   options?: GenerateOptions): Order[]
```

```ts
const users    = generate('users',    { count: 50, seed: 42 });
const products = generate('products', { count: 100 });
const orders   = generate('orders',   { count: 75 });
```

### `generate(typeMap)`

Generates multiple types in one call. Returns a `MultiTypeResult` keyed by type name.

```ts
const data = generate({
  users:    { count: 50 },
  products: { count: 100 },
  orders:   { count: 75 },
});
// data.users    → User[]
// data.products → Product[]
// data.orders   → Order[]
```

#### Options

| Option   | Type                             | Default | Description                                   |
|----------|----------------------------------|---------|-----------------------------------------------|
| `count`  | `number`                         | `10`    | Number of records to generate. Max 1,000,000. |
| `seed`   | `number`                         | random  | Seed value for reproducible output.           |
| `fields` | `Record<string, (r) => unknown>` | `{}`    | Override or add fields with a function.       |

---

### `generate(type, { fields })`

Override any existing field or add new computed fields:

```ts
const users = generate('users', {
  count: 10,
  seed: 42,
  fields: {
    fullName:   (u) => `${(u as User).firstName} ${(u as User).lastName}`,
    isPremium:  (u) => (u as User).role === 'premium',
    displayAge: (u) => `${(u as User).age} years old`,
  },
});
```

---

### `generateAsync(type | typeMap, options?)`

Promise-based wrapper — identical signatures to `generate()`.

```ts
const users = await generateAsync('users', { count: 100, seed: 42 });

const data = await generateAsync({
  users:    { count: 50 },
  products: { count: 100 },
});
```

---

### `generateStream(type, options?)`

JavaScript generator function that yields one record at a time.
Use this for very large datasets to avoid holding everything in memory.

```ts
for (const user of generateStream('users', { count: 1_000_000, seed: 1 })) {
  writeLine(JSON.stringify(user));
}

// Or spread into an array
const records = [...generateStream('products', { count: 5000 })];
```

---

### `Random` class

Low-level seeded PRNG — useful when writing custom generators.

```ts
import { Random } from 'mocks-data-generator';

const rng = new Random(42); // same seed → same sequence every time

rng.uuid()                             // "4b3a1f2e-9c8d-4a5b-8e7f-1d2c3b4a5e6f"
rng.int(1, 100)                        // integer in [1, 100]
rng.decimal(9.99, 99.99, 2)           // float with 2 decimal places
rng.bool(0.3)                          // true 30% of the time
rng.pick(['a', 'b', 'c'])             // random element from array
rng.sample(['a','b','c','d'], 2)       // 2 unique random elements
rng.shuffle([1, 2, 3, 4, 5])          // Fisher-Yates shuffle (non-mutating)
rng.phone()                            // "(555) 234-5678"
rng.date(new Date('2020-01-01'), new Date()) // random Date in range
rng.weightedPick([
  { value: 'common', weight: 90 },
  { value: 'rare',   weight: 10 },
])
```

---

## CLI Usage

```bash
# Generate 50 users and print to stdout
npx mock-generate users --count=50

# Multiple types at once
npx mock-generate users products orders --count=25

# Reproducible output with a seed
npx mock-generate users --count=100 --seed=12345

# Pretty-printed and saved to a file
npx mock-generate users products --count=50 --pretty --output=data.json

# List all available generator types
npx mock-generate --list

# Show help
npx mock-generate --help
```

#### CLI Options

| Flag | Description |
|---|---|
| `--count=<n>` | Number of records per type (default: 10) |
| `--seed=<n>` | Seed for reproducible output |
| `--output=<file>` | Write JSON to a file instead of stdout |
| `--pretty` | Pretty-print JSON with 2-space indent |
| `--list` | List all registered generator types |
| `--version` | Print the package version |
| `--help` | Show help text |

---

## TypeScript Types

All types are exported from the package root:

```ts
import type {
  // Entity shapes
  User,
  Product,
  Order,
  Address,
  OrderLineItem,

  // Union types
  UserStatus,    // 'active' | 'inactive' | 'suspended' | 'pending'
  UserRole,      // 'user' | 'admin' | 'moderator' | 'premium'
  OrderStatus,   // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  PaymentMethod, // 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer'

  // Generator utilities
  GenerateOptions,
  TypeOptionsMap,
  MultiTypeResult,
  GeneratorFn,
  FieldOverrideFn,
  GenerationContext,
  WeightedItem,
} from 'sahil-mock-data-generator';
```

---

## Custom Generators (Plugin API)

Register your own data types and use them anywhere `generate()` is called.

```ts
import { registerGenerator, listGenerators } from 'mocks-data-generator';
import type { GeneratorFn } from 'mocks-data-generator';

interface Employee {
  id: number;
  employeeId: string;
  department: string;
  salary: number;
  remote: boolean;
}

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance'];

const employeeGen: GeneratorFn<Employee> = (count, rng) =>
  Array.from({ length: count }, (_, i) => ({
    id:         i + 1,
    employeeId: `EMP-${String(i + 1).padStart(5, '0')}`,
    department: rng.pick(DEPARTMENTS),
    salary:     rng.decimal(45_000, 180_000, 2),
    remote:     rng.bool(0.4),
  }));

registerGenerator('employees', employeeGen as GeneratorFn);

listGenerators();
// ['users', 'products', 'orders', 'employees']
```

---

## Performance

All benchmarks run on Node.js 20, Apple M2.

| Operation | Records | Time |
|---|---|---|
| `generate('users')` | 10,000 | ~150 ms |
| `generate('products')` | 10,000 | ~130 ms |
| `generate('orders')` | 10,000 | ~200 ms |
| `generateStream('users')` | 100,000 | ~1.5 s |

---

## Contributing

Every change goes through a feature branch and a pull request — direct pushes to `master` are not allowed.

```bash
# 1. Create a branch
git checkout -b feat/my-feature

# 2. Make changes, run checks
npm run typecheck   # TypeScript type-check
npm run lint        # ESLint
npm test            # 170 tests with coverage

# 3. Commit using Conventional Commits
git commit -m "feat: add employee generator"

# 4. Push and open a PR
git push -u origin feat/my-feature
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide including release instructions.

### Release a new version

```bash
git checkout master
git pull origin master

npm run release:patch   # 1.0.6 → 1.0.7  (bug fix)
npm run release:minor   # 1.0.6 → 1.1.0  (new feature)
npm run release:major   # 1.0.6 → 2.0.0  (breaking change)
```

This automatically bumps `package.json`, updates `CHANGELOG.md`, creates a git tag, pushes to GitHub, and triggers the release workflow which publishes to npm.

---

## License

MIT © [Sahil Khatiwada](https://github.com/sahilkhatiwada) — see [LICENSE](LICENSE) for details.
