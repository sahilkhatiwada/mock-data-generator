/**
 * Advanced usage examples for mock-data-generator.
 * Covers: typed overloads, custom fields, streaming, async, plugin generators, Random directly.
 * Run: npx ts-node examples/advanced.ts
 */

import {
  generate,
  generateAsync,
  generateStream,
  registerGenerator,
  unregisterGenerator,
  listGenerators,
  Random,
} from '../src/index';
import type { User, GeneratorFn } from '../src/types';

// ── 1. Typed single-type call ─────────────────────────────────────────────────
console.log('\n=== 1. Typed generate() ===');
const users: User[] = generate('users', { count: 3, seed: 100 });
users.forEach((u) => console.log(`  ${u.firstName} ${u.lastName} — ${u.email}`));

// ── 2. Custom field overrides ─────────────────────────────────────────────────
console.log('\n=== 2. Custom field overrides ===');
const enriched = generate('users', {
  count: 3,
  seed: 200,
  fields: {
    fullName:  (u) => `${(u as User).firstName} ${(u as User).lastName}`,
    initials:  (u) => `${(u as User).firstName[0]}${(u as User).lastName[0]}`,
    isPremium: (u) => (u as User).role === 'premium',
  },
}) as (User & { fullName: string; initials: string; isPremium: boolean })[];

enriched.forEach((u) =>
  console.log(`  [${u.initials}] ${u.fullName} — premium: ${u.isPremium}`)
);

// ── 3. Linked datasets ────────────────────────────────────────────────────────
console.log('\n=== 3. Linked datasets (orders reference user ids) ===');
const linked = generate({ users: { count: 5, seed: 300 }, orders: { count: 10 } });
const userIds = new Set((linked.users as User[]).map((u) => u.id));
const allLinked = (linked.orders as { userId: number }[]).every((o) => userIds.has(o.userId));
console.log(`  User ids: [${[...userIds].join(', ')}]`);
console.log(`  All order.userId values are valid: ${allLinked}`);

// ── 4. Async generation ───────────────────────────────────────────────────────
(async () => {
  console.log('\n=== 4. Async generation ===');
  const asyncUsers = await generateAsync('users', { count: 3, seed: 400 });
  console.log(`  Generated ${asyncUsers.length} users asynchronously`);
  console.log(`  First: ${asyncUsers[0].firstName} ${asyncUsers[0].lastName}`);

  // ── 5. Streaming large dataset ──────────────────────────────────────────
  console.log('\n=== 5. Streaming 5,000 products ===');
  const t = Date.now();
  let count = 0;
  let totalPrice = 0;
  for (const p of generateStream('products', { count: 5_000, seed: 500 })) {
    count++;
    totalPrice += (p as { price: number }).price;
  }
  console.log(`  Streamed ${count} records in ${Date.now() - t}ms`);
  console.log(`  Average price: $${(totalPrice / count).toFixed(2)}`);

  // ── 6. Custom generator plugin ──────────────────────────────────────────
  console.log('\n=== 6. Custom generator plugin ===');

  interface Employee {
    id: number;
    employeeId: string;
    department: string;
    level: string;
    salary: number;
    remote: boolean;
    annualBonus?: number;
  }

  const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance'];
  const LEVELS = [
    { value: 'junior', weight: 40 },
    { value: 'mid',    weight: 35 },
    { value: 'senior', weight: 20 },
    { value: 'lead',   weight:  5 },
  ] as const;

  const employeeGenerator: GeneratorFn<Employee> = (count, rng, fields) =>
    Array.from({ length: count }, (_, i) => {
      const record: Employee = {
        id:         i + 1,
        employeeId: `EMP-${String(i + 1).padStart(5, '0')}`,
        department: rng.pick(DEPARTMENTS),
        level:      rng.weightedPick([...LEVELS]),
        salary:     rng.decimal(45_000, 180_000, 2),
        remote:     rng.bool(0.4),
      };
      for (const [key, fn] of Object.entries(fields)) {
        (record as Record<string, unknown>)[key] = fn(record);
      }
      return record;
    });

  registerGenerator('employees', employeeGenerator as GeneratorFn);

  console.log('  Available types:', listGenerators().join(', '));

  const { getGenerator } = await import('../src/generators/index');
  const gen = getGenerator('employees');
  const rng = new Random(600);
  const employees = gen(4, rng, {
    annualBonus: (e) => parseFloat(((e as Employee).salary * 0.1).toFixed(2)),
  }, {}) as Employee[];

  employees.forEach((e) =>
    console.log(
      `  ${e.employeeId} | ${e.department} ${e.level} | ` +
      `$${e.salary.toLocaleString()} + $${e.annualBonus} bonus | remote: ${e.remote}`
    )
  );

  unregisterGenerator('employees');
  console.log('  Types after cleanup:', listGenerators().join(', '));

  // ── 7. Using Random directly ────────────────────────────────────────────
  console.log('\n=== 7. Using Random directly ===');
  const random = new Random(777);
  console.log('  UUID:         ', random.uuid());
  console.log('  Int (1–100):  ', random.int(1, 100));
  console.log('  Float:        ', random.float().toFixed(6));
  console.log('  Shuffle:      ', random.shuffle([1, 2, 3, 4, 5]));
  console.log('  Sample 3:     ', random.sample(['a', 'b', 'c', 'd', 'e'], 3));
  console.log('  Phone:        ', random.phone());
  console.log(
    '  Weighted:     ',
    random.weightedPick([{ value: 'common', weight: 80 }, { value: 'rare', weight: 20 }])
  );

  console.log('\n✓ All advanced examples complete.');
})();
