/**
 * Basic usage examples for mock-data-generator.
 * Run: npx ts-node examples/basic.ts
 */

import { generate } from '../src/index';
import type { User, Product, Order } from '../src/types';

// ── 1. Generate users ─────────────────────────────────────────────────────────
console.log('\n=== 1. Generate 3 users ===');
const users = generate('users', { count: 3 });
console.log(JSON.stringify(users, null, 2));

// ── 2. Generate products ──────────────────────────────────────────────────────
console.log('\n=== 2. Generate 2 products ===');
const products = generate('products', { count: 2 });
console.log(JSON.stringify(products, null, 2));

// ── 3. Generate orders ────────────────────────────────────────────────────────
console.log('\n=== 3. Generate 2 orders ===');
const orders = generate('orders', { count: 2 });
console.log(JSON.stringify(orders, null, 2));

// ── 4. Multiple types in one call ─────────────────────────────────────────────
console.log('\n=== 4. Multiple types ===');
const dataset = generate({
  users:    { count: 2 },
  products: { count: 3 },
  orders:   { count: 2 },
});
console.log(
  `Users: ${(dataset.users as User[]).length}, ` +
  `Products: ${(dataset.products as Product[]).length}, ` +
  `Orders: ${(dataset.orders as Order[]).length}`
);

// ── 5. Reproducible output ────────────────────────────────────────────────────
console.log('\n=== 5. Reproducible output (seed: 42) ===');
const run1 = generate('users', { count: 2, seed: 42 });
const run2 = generate('users', { count: 2, seed: 42 });
console.log('Run 1 email:', run1[0].email);
console.log('Run 2 email:', run2[0].email);
console.log('Identical:', JSON.stringify(run1) === JSON.stringify(run2));
