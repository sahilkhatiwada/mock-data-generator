import type { Product, FieldOverrideFn } from '../types';
import { Random } from '../utils/random';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_ADJECTIVES,
  PRODUCT_NOUNS,
  USES,
  FEATURES,
} from '../data/products';

const NOW = Date.now();
const THREE_YEARS_AGO = NOW - 3 * 365.25 * 24 * 60 * 60 * 1000;

/** Fallback nouns used when a category has no specific noun pool. */
const FALLBACK_NOUNS = ['Item', 'Product', 'Device', 'Accessory', 'Kit'] as const;

/**
 * Builds a natural-language product description.
 */
function buildDescription(adjective: string, noun: string, rng: Random): string {
  const use = rng.pick(USES);
  const feature1 = rng.pick(FEATURES);
  let feature2 = rng.pick(FEATURES);
  while (feature2 === feature1) feature2 = rng.pick(FEATURES);

  const templates = [
    `${adjective} ${noun} designed for ${use}. Features ${feature1} and ${feature2}.`,
    `Experience the difference with this ${adjective.toLowerCase()} ${noun.toLowerCase()}. Perfect for ${use}.`,
    `The ${adjective.toLowerCase()} ${noun.toLowerCase()} combines style and functionality for ${use}.`,
    `Upgrade your ${use} with this premium ${noun.toLowerCase()} featuring ${feature1}.`,
    `Designed for professionals, this ${noun.toLowerCase()} delivers exceptional performance for ${use}.`,
  ] as const;

  return rng.pick(templates);
}

/**
 * Generates a single `Product` record.
 *
 * @param index - 1-based sequential id
 * @param rng   - Seeded PRNG instance
 */
export function generateProduct(index: number, rng: Random): Product {
  const category = rng.pick(PRODUCT_CATEGORIES);
  const subcategory = rng.pick(category.subcategories);
  const adjective = rng.pick(PRODUCT_ADJECTIVES);
  const nounPool = PRODUCT_NOUNS[category.name] ?? FALLBACK_NOUNS;
  const noun = rng.pick(nounPool);
  const name = `${adjective} ${noun}`;

  const [minPrice, maxPrice] = category.priceRange;
  const price = rng.decimal(minPrice, maxPrice, 2);

  const createdAt = rng.date(THREE_YEARS_AGO, NOW);
  const updatedAt = rng.date(createdAt, NOW);

  const quantity = rng.bool(0.85) ? rng.int(1, 500) : 0;

  const tagPool = [
    adjective.toLowerCase(),
    category.name.toLowerCase(),
    subcategory.toLowerCase(),
    'sale',
    'new',
    'featured',
  ];

  return {
    id: index,
    uuid: rng.uuid(),
    name,
    description: buildDescription(adjective, noun, rng),
    price,
    category: category.name,
    subcategory,
    sku: `SKU-${String(index).padStart(6, '0')}`,
    inStock: quantity > 0,
    quantity,
    rating: rng.decimal(1, 5, 1),
    reviewCount: rng.int(0, 5000),
    tags: rng.sample(tagPool, rng.int(1, Math.min(4, tagPool.length))),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Generates an array of `Product` records.
 *
 * @param count  - Number of products to generate
 * @param rng    - Seeded PRNG instance
 * @param fields - Optional custom field overrides
 */
export function generateProducts(
  count: number,
  rng: Random,
  fields: Record<string, FieldOverrideFn> = {}
): Product[] {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const product = generateProduct(i, rng);
    for (const [key, fn] of Object.entries(fields)) {
      product[key] = fn(product);
    }
    products.push(product);
  }
  return products;
}
