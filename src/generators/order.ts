import type { Order, OrderLineItem, FieldOverrideFn, GenerationContext } from '../types';
import { Random } from '../utils/random';
import { ORDER_STATUSES, PAYMENT_METHODS, PRODUCT_CATEGORIES } from '../data/products';

const NOW = Date.now();
const TWO_YEARS_AGO = NOW - 2 * 365.25 * 24 * 60 * 60 * 1000;

/**
 * Generates `count` order line items.
 */
function generateLineItems(count: number, rng: Random): OrderLineItem[] {
  const items: OrderLineItem[] = [];
  for (let i = 0; i < count; i++) {
    const category = rng.pick(PRODUCT_CATEGORIES);
    const [minPrice, maxPrice] = category.priceRange;
    const unitPrice = rng.decimal(minPrice, maxPrice, 2);
    const quantity = rng.int(1, 5);
    items.push({
      productId: rng.int(1, 10_000),
      name: `Product ${rng.int(1000, 9999)}`,
      category: category.name,
      unitPrice,
      quantity,
      subtotal: parseFloat((unitPrice * quantity).toFixed(2)),
    });
  }
  return items;
}

/**
 * Generates a single `Order` record.
 *
 * @param index      - 1-based sequential id
 * @param rng        - Seeded PRNG instance
 * @param maxUserId  - Upper bound for the `userId` foreign key
 */
export function generateOrder(index: number, rng: Random, maxUserId = 1000): Order {
  const status = rng.weightedPick(ORDER_STATUSES);

  const orderedAt = rng.date(TWO_YEARS_AGO, NOW);

  let shippedAt: string | null = null;
  let deliveredAt: string | null = null;

  if (status === 'shipped' || status === 'delivered') {
    shippedAt = rng.date(orderedAt, NOW).toISOString();
  }
  if (status === 'delivered' && shippedAt) {
    deliveredAt = rng.date(new Date(shippedAt), NOW).toISOString();
  }

  const lineItems = generateLineItems(rng.int(1, 6), rng);
  const subtotal = parseFloat(
    lineItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
  );
  const shippingCost = rng.decimal(0, 19.99, 2);
  const taxRate = rng.decimal(0.05, 0.12, 4);
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));
  const discount = rng.bool(0.2) ? rng.decimal(1, Math.min(subtotal * 0.3, 50), 2) : 0;
  const finalTotal = discount > 0 ? parseFloat((total - discount).toFixed(2)) : total;

  return {
    id: index,
    uuid: rng.uuid(),
    orderNumber: `ORD-${String(index).padStart(8, '0')}`,
    userId: rng.int(1, maxUserId),
    status,
    items: lineItems,
    itemCount: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shippingCost,
    tax,
    discount,
    total: finalTotal,
    paymentMethod: rng.weightedPick(PAYMENT_METHODS),
    currency: 'USD',
    shippingAddress: {
      street: `${rng.int(1, 9999)} Shipping Lane`,
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      country: 'US',
    },
    orderedAt: orderedAt.toISOString(),
    shippedAt,
    deliveredAt,
  };
}

/**
 * Generates an array of `Order` records.
 *
 * @param count   - Number of orders to generate
 * @param rng     - Seeded PRNG instance
 * @param fields  - Optional custom field overrides
 * @param context - Cross-entity context (e.g. `{ userCount: 50 }`)
 */
export function generateOrders(
  count: number,
  rng: Random,
  fields: Record<string, FieldOverrideFn> = {},
  context: GenerationContext = {}
): Order[] {
  const maxUserId = context.userCount ?? 1000;
  const orders: Order[] = [];
  for (let i = 1; i <= count; i++) {
    const order = generateOrder(i, rng, maxUserId);
    for (const [key, fn] of Object.entries(fields)) {
      order[key] = fn(order);
    }
    orders.push(order);
  }
  return orders;
}
