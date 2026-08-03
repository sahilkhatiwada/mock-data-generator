import type { User, FieldOverrideFn } from '../types';
import { Random } from '../utils/random';
import { FIRST_NAMES, LAST_NAMES, EMAIL_DOMAINS } from '../data/names';
import { STREET_NAMES, STREET_SUFFIXES, CITIES } from '../data/addresses';
import { USER_STATUSES, USER_ROLES } from '../data/products';

const NOW = Date.now();
const FIVE_YEARS_AGO = NOW - 5 * 365.25 * 24 * 60 * 60 * 1000;

/**
 * Generates a single `User` record.
 *
 * @param index - 1-based sequential id
 * @param rng   - Seeded PRNG instance
 */
export function generateUser(index: number, rng: Random): User {
  const firstName = rng.pick(FIRST_NAMES);
  const lastName = rng.pick(LAST_NAMES);
  const domain = rng.pick(EMAIL_DOMAINS);

  // Avoid trivially identical emails by appending index ~30% of the time
  const emailSuffix = index > 1 && rng.bool(0.3) ? String(index) : '';
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailSuffix}@${domain}`;

  const location = rng.pick(CITIES);
  const street = `${rng.streetNumber()} ${rng.pick(STREET_NAMES)} ${rng.pick(STREET_SUFFIXES)}`;

  const createdAt = rng.date(FIVE_YEARS_AGO, NOW);
  const updatedAt = rng.date(createdAt, NOW);

  return {
    id: index,
    uuid: rng.uuid(),
    firstName,
    lastName,
    email,
    phone: rng.phone(),
    address: {
      street,
      city: location.city,
      state: location.state,
      zip: rng.zip(location.zip),
      country: 'US',
    },
    status: rng.weightedPick(USER_STATUSES),
    role: rng.weightedPick(USER_ROLES),
    age: rng.int(18, 80),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

/**
 * Generates an array of `User` records.
 *
 * @param count  - Number of users to generate
 * @param rng    - Seeded PRNG instance
 * @param fields - Optional custom field overrides: `{ key: (user) => value }`
 */
export function generateUsers(
  count: number,
  rng: Random,
  fields: Record<string, FieldOverrideFn> = {}
): User[] {
  const users: User[] = [];
  for (let i = 1; i <= count; i++) {
    const user = generateUser(i, rng);
    for (const [key, fn] of Object.entries(fields)) {
      user[key] = fn(user);
    }
    users.push(user);
  }
  return users;
}
