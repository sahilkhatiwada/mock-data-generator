# Developer Guide

## Setup

```bash
git clone https://github.com/username/mock-data-generator.git
cd mock-data-generator
npm install
```

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm test` | Run Jest with coverage |
| `npm run test:run` | Same as test, force-exits (CI) |
| `npm run lint` | Type-check + ESLint |
| `npm run format` | Prettier on src/tests/examples |
| `npm run clean` | Delete `dist/` |

## Project layout

```
src/
  types.ts              — All exported TypeScript interfaces and union types
  index.ts              — Public API: generate / generateAsync / generateStream
  cli.ts                — CLI logic (parseArgs, run, serialise)
  bin/generate.ts       — Thin shebang entry point
  data/
    names.ts            — First/last name arrays, email domains
    addresses.ts        — Street components, cities, states
    products.ts         — Categories, adjectives, weighted distributions
  utils/
    random.ts           — Mulberry32 PRNG + Random class
    seed.ts             — SeedManager singleton
    validation.ts       — Input validation and normalisation
  generators/
    index.ts            — Registry: getGenerator / registerGenerator / listGenerators
    user.ts             — User generator
    product.ts          — Product generator
    order.ts            — Order generator
tests/
  unit/
    utils.spec.ts       — PRNG, Random, SeedManager, validation
    generators.spec.ts  — All three generators + registry
  integration/
    api.spec.ts         — Full public API surface, data quality, performance
examples/
  basic.ts              — Quick-start examples
  advanced.ts           — Streaming, async, plugins, Random direct use
```

## Adding a new built-in generator type

1. Create `src/generators/<type>.ts` following the `GeneratorFn<T>` signature.
2. Add its type name to `SUPPORTED_TYPES` in `src/utils/validation.ts`.
3. Register it in `BUILT_IN_GENERATORS` in `src/generators/index.ts`.
4. Export the record interface from `src/types.ts`.
5. Add typed overloads in `src/index.ts`.
6. Write unit tests in `tests/unit/generators.spec.ts`.
7. Add integration coverage in `tests/integration/api.spec.ts`.

## Writing a plugin generator

```ts
import { registerGenerator } from 'mock-data-generator';
import type { GeneratorFn } from 'mock-data-generator';

interface Invoice { id: number; amount: number; paid: boolean }

const invoiceGen: GeneratorFn<Invoice> = (count, rng, fields) =>
  Array.from({ length: count }, (_, i) => {
    const record: Invoice = {
      id:     i + 1,
      amount: rng.decimal(10, 5000, 2),
      paid:   rng.bool(0.7),
    };
    for (const [key, fn] of Object.entries(fields)) {
      (record as Record<string, unknown>)[key] = fn(record);
    }
    return record;
  });

registerGenerator('invoices', invoiceGen as GeneratorFn);
```

## Seeding strategy

Each `generate()` call initialises `seedManager` with a single resolved seed.
Each generator type then receives an independent `Random` instance whose seed
is derived deterministically from `(baseSeed, namespace)` — so adding or
removing types never shifts the output of other types.

## Publishing

```bash
# Bump version
npm version patch   # or minor / major

# Build + test run automatically via prepublishOnly
npm publish
```
