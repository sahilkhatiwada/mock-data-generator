/**
 * Core type definitions for mock-data-generator.
 */

// ─── PRNG / Random ───────────────────────────────────────────────────────────

/** A seeded pseudorandom number generator function returning floats in [0, 1). */
export type PRNGFn = () => number;

// ─── Weighted selection ───────────────────────────────────────────────────────

/** An item with an associated selection weight. */
export interface WeightedItem<T> {
  value: T;
  weight: number;
}

// ─── Options ─────────────────────────────────────────────────────────────────

/** A custom field override function that receives the partially-built record. */
export type FieldOverrideFn<T = Record<string, unknown>> = (record: T) => unknown;

/** Per-type generation options. */
export interface GenerateOptions {
  /** Number of records to generate (default: 10, max: 1,000,000). */
  count?: number;
  /** Seed for reproducible output. */
  seed?: number;
  /** Custom field overrides applied after generation. */
  fields?: Record<string, FieldOverrideFn>;
  /** Output format (reserved for future use). */
  format?: 'json' | 'array';
}

/** Map of type names to their individual options, used for multi-type calls. */
export type TypeOptionsMap = Record<string, GenerateOptions>;

// ─── Generator function signature ────────────────────────────────────────────

/** Cross-entity context passed to generators so they can reference related data. */
export interface GenerationContext {
  userCount?: number;
  productCount?: number;
  [key: string]: number | undefined;
}

/**
 * The signature every generator function must conform to.
 * @param count   - Number of records to produce
 * @param rng     - Seeded Random instance
 * @param fields  - Custom field override map
 * @param context - Cross-entity context
 */
export type GeneratorFn<T = Record<string, unknown>> = (
  count: number,
  rng: import('./utils/random').Random,
  fields: Record<string, FieldOverrideFn>,
  context: GenerationContext
) => T[];

// ─── Built-in record shapes ───────────────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  status: UserStatus;
  role: UserRole;
  age: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type UserRole = 'user' | 'admin' | 'moderator' | 'premium';

export interface Product {
  id: number;
  uuid: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  sku: string;
  inStock: boolean;
  quantity: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface OrderLineItem {
  productId: number;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  uuid: string;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  items: OrderLineItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  currency: string;
  shippingAddress: Address;
  orderedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  [key: string]: unknown;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer';

// ─── Multi-type result ────────────────────────────────────────────────────────

/** Shape returned by a multi-type generate() call. */
export interface MultiTypeResult {
  users?: User[];
  products?: Product[];
  orders?: Order[];
  [key: string]: unknown[] | undefined;
}

// ─── Data tables ─────────────────────────────────────────────────────────────

export interface CityRecord {
  city: string;
  state: string;
  zip: string;
}

export interface StateRecord {
  name: string;
  code: string;
}

export interface ProductCategory {
  name: string;
  subcategories: string[];
  priceRange: [number, number];
}
