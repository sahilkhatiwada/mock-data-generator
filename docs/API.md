# API Reference

## `generate(type, options?)`

Generates records for a single built-in type.

### Overloads

```ts
generate(type: 'users',    options?: GenerateOptions): User[]
generate(type: 'products', options?: GenerateOptions): Product[]
generate(type: 'orders',   options?: GenerateOptions): Order[]
generate(type: string,     options?: GenerateOptions): Record<string, unknown>[]
generate(typeMap: TypeOptionsMap): MultiTypeResult
```

### GenerateOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `count` | `number` | `10` | Records to generate. Max `1_000_000`. |
| `seed` | `number` | random | Seed for reproducible output. Must be ≥ 0. |
| `fields` | `Record<string, (record) => unknown>` | `{}` | Override or add fields. |
| `format` | `'json' \| 'array'` | `'array'` | Reserved for future use. |

---

## `generateAsync(type | typeMap, options?)`

Identical overloads to `generate()`, returns `Promise<T>`.

---

## `generateStream(type, options?)`

Returns a `Generator<Record<string, unknown>>` yielding one record at a time.
Records are produced internally in batches of 1,000.

```ts
for (const user of generateStream('users', { count: 1_000_000, seed: 1 })) {
  // process without holding everything in memory
}
```

---

## `registerGenerator(type, fn)`

Registers a custom generator. Custom types take precedence over built-ins.

```ts
type GeneratorFn<T = Record<string, unknown>> = (
  count:   number,
  rng:     Random,
  fields:  Record<string, FieldOverrideFn>,
  context: GenerationContext
) => T[];
```

---

## `unregisterGenerator(type): boolean`

Removes a custom generator. Returns `true` if removed, `false` if not found.

---

## `listGenerators(): string[]`

Returns all registered type names (built-in + custom).

---

## `Random`

Seeded PRNG utility class.

| Method | Signature | Description |
|--------|-----------|-------------|
| `seed` | `number` (getter) | The seed used |
| `float()` | `() => number` | Float in `[0, 1)` |
| `int(min, max)` | `(number, number) => number` | Integer in `[min, max]` |
| `decimal(min, max, dp?)` | `(number, number, number?) => number` | Float rounded to `dp` places |
| `pick(arr)` | `<T>(T[]) => T` | Random element |
| `weightedPick(items)` | `<T>(WeightedItem<T>[]) => T` | Weighted random selection |
| `bool(p?)` | `(number?) => boolean` | True with probability `p` (default 0.5) |
| `shuffle(arr)` | `<T>(T[]) => T[]` | Fisher-Yates, non-mutating |
| `sample(arr, n)` | `<T>(T[], number) => T[]` | `n` unique elements |
| `uuid()` | `() => string` | RFC 4122 v4 UUID |
| `date(start, end)` | `(Date\|string\|number, ...) => Date` | Random Date in range |
| `phone()` | `() => string` | `(555) XXX-XXXX` |
| `zip(base)` | `(string) => string` | 5-digit ZIP offset from base |
| `streetNumber()` | `() => number` | Integer 1–9999 |

---

## Types

```ts
// Entity shapes
interface User      { id, uuid, firstName, lastName, email, phone, address, status, role, age, createdAt, updatedAt }
interface Product   { id, uuid, name, description, price, category, subcategory, sku, inStock, quantity, rating, reviewCount, tags, createdAt, updatedAt }
interface Order     { id, uuid, orderNumber, userId, status, items, itemCount, subtotal, shippingCost, tax, discount, total, paymentMethod, currency, shippingAddress, orderedAt, shippedAt, deliveredAt }
interface Address   { street, city, state, zip, country }
interface OrderLineItem { productId, name, category, unitPrice, quantity, subtotal }

// Union types
type UserStatus    = 'active' | 'inactive' | 'suspended' | 'pending'
type UserRole      = 'user' | 'admin' | 'moderator' | 'premium'
type OrderStatus   = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer'

// Utility types
interface WeightedItem<T>   { value: T; weight: number }
interface GenerateOptions   { count?, seed?, fields?, format? }
interface GenerationContext { userCount?, productCount?, [key: string]: number | undefined }
type FieldOverrideFn<T>     = (record: T) => unknown
type GeneratorFn<T>         = (count, rng, fields, context) => T[]
```
