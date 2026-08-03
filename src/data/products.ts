import type { WeightedItem, ProductCategory } from '../types';
import type { OrderStatus, PaymentMethod, UserStatus, UserRole } from '../types';

/** Product categories with subcategories and realistic price ranges. */
export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [
  {
    name: 'Electronics',
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Headphones', 'Cameras', 'TVs', 'Speakers', 'Wearables'],
    priceRange: [29.99, 2499.99],
  },
  {
    name: 'Clothing',
    subcategories: ["Men's", "Women's", 'Kids', 'Shoes', 'Accessories', 'Activewear', 'Outerwear', 'Swimwear'],
    priceRange: [9.99, 299.99],
  },
  {
    name: 'Home & Garden',
    subcategories: ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Outdoor', 'Lighting', 'Storage', 'Tools'],
    priceRange: [14.99, 1999.99],
  },
  {
    name: 'Books',
    subcategories: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Self-Help', 'Children', 'Cookbooks'],
    priceRange: [4.99, 79.99],
  },
  {
    name: 'Sports & Outdoors',
    subcategories: ['Fitness', 'Camping', 'Cycling', 'Running', 'Swimming', 'Team Sports', 'Golf', 'Tennis'],
    priceRange: [9.99, 799.99],
  },
  {
    name: 'Health & Beauty',
    subcategories: ['Skincare', 'Haircare', 'Vitamins', 'Makeup', 'Fragrances', 'Dental', 'Medical', 'Personal Care'],
    priceRange: [4.99, 199.99],
  },
  {
    name: 'Toys & Games',
    subcategories: ['Board Games', 'Action Figures', 'Dolls', 'Educational', 'Video Games', 'Outdoor Toys', 'Puzzles', 'STEM'],
    priceRange: [7.99, 249.99],
  },
  {
    name: 'Food & Grocery',
    subcategories: ['Snacks', 'Beverages', 'Organic', 'Baking', 'Condiments', 'Frozen', 'Fresh Produce', 'Dairy'],
    priceRange: [1.99, 89.99],
  },
  {
    name: 'Automotive',
    subcategories: ['Car Care', 'Parts', 'Accessories', 'Tools', 'Electronics', 'Tires', 'Interior', 'Exterior'],
    priceRange: [9.99, 899.99],
  },
  {
    name: 'Office Products',
    subcategories: ['Stationery', 'Printers', 'Supplies', 'Furniture', 'Computers', 'Phones', 'Paper', 'Organization'],
    priceRange: [4.99, 1499.99],
  },
] as const;

/** Adjective pool for building product names. */
export const PRODUCT_ADJECTIVES: readonly string[] = [
  'Premium', 'Professional', 'Ultra', 'Advanced', 'Smart', 'Wireless', 'Portable',
  'Compact', 'Heavy-Duty', 'Lightweight', 'Ergonomic', 'Multi-Function', 'High-Performance',
  'Eco-Friendly', 'Durable', 'Versatile', 'Innovative', 'Classic', 'Modern', 'Deluxe',
  'Essential', 'Signature', 'Elite', 'Superior', 'Precision', 'Turbo', 'Max',
  'Pro', 'Plus', 'Mini', 'XL', 'HD', 'Rechargeable', 'Stainless', 'Waterproof',
] as const;

/** Category-specific noun pools for product names. */
export const PRODUCT_NOUNS: Readonly<Record<string, readonly string[]>> = {
  Electronics: [
    'Headphones', 'Speaker', 'Keyboard', 'Mouse', 'Monitor', 'Webcam', 'Charger',
    'USB Hub', 'Power Bank', 'Smart Watch', 'Fitness Tracker', 'Earbuds', 'Microphone',
    'Gaming Controller', 'Flash Drive', 'Hard Drive', 'Laptop Stand', 'Tablet Case',
  ],
  Clothing: [
    'T-Shirt', 'Jeans', 'Jacket', 'Hoodie', 'Sneakers', 'Boots', 'Dress',
    'Shorts', 'Socks', 'Hat', 'Gloves', 'Scarf', 'Belt', 'Sunglasses',
    'Backpack', 'Handbag', 'Wallet', 'Watch',
  ],
  'Home & Garden': [
    'Coffee Maker', 'Blender', 'Toaster', 'Air Fryer', 'Vacuum Cleaner', 'Lamp',
    'Throw Pillow', 'Area Rug', 'Picture Frame', 'Storage Box', 'Planter', 'Candle',
    'Curtains', 'Towel Set', 'Sheet Set', 'Wall Clock', 'Shelf Unit', 'Drawer Organizer',
  ],
  Books: [
    'Novel', 'Handbook', 'Guide', 'Encyclopedia', 'Atlas', 'Workbook',
    'Journal', 'Planner', 'Coloring Book', 'Recipe Book', 'Biography', 'Memoir',
  ],
  'Sports & Outdoors': [
    'Yoga Mat', 'Resistance Bands', 'Dumbbell Set', 'Jump Rope', 'Water Bottle',
    'Hiking Boots', 'Camping Tent', 'Sleeping Bag', 'Backpack', 'Bike Helmet',
    'Running Shoes', 'Sport Shorts', 'Compression Tights', 'Golf Club Set',
  ],
  'Health & Beauty': [
    'Face Wash', 'Moisturizer', 'Shampoo', 'Conditioner', 'Vitamin C Serum',
    'Sunscreen SPF 50', 'Lip Balm', 'Hand Cream', 'Body Lotion', 'Perfume',
    'Electric Toothbrush', 'Whitening Strips', 'Nail Polish', 'Foundation',
  ],
  'Toys & Games': [
    'Building Blocks', 'Board Game', 'Puzzle', 'Action Figure', 'Doll',
    'Remote Control Car', 'Science Kit', 'Art Set', 'Card Game', 'Jigsaw Puzzle',
    'Play Kitchen', 'Train Set', 'Telescope', 'Chemistry Set',
  ],
  'Food & Grocery': [
    'Coffee Beans', 'Green Tea', 'Protein Powder', 'Granola Bars', 'Olive Oil',
    'Hot Sauce', 'Honey', 'Nut Butter', 'Pasta', 'Rice', 'Cereal',
    'Dried Fruit Mix', 'Trail Mix', 'Dark Chocolate', 'Sparkling Water',
  ],
  Automotive: [
    'Car Mount', 'Dash Cam', 'Jump Starter', 'Tire Inflator', 'Car Vacuum',
    'Seat Covers', 'Floor Mats', 'Phone Holder', 'Windshield Wiper', 'Car Wax',
    'Oil Filter', 'Air Freshener', 'Steering Wheel Cover', 'Car Cover',
  ],
  'Office Products': [
    'Desk Organizer', 'Sticky Notes', 'Ballpoint Pens', 'Stapler', 'Paper Clips',
    'Whiteboard', 'File Folders', 'Binder', 'Highlighters', 'Correction Tape',
    'Tape Dispenser', 'Label Maker', 'Scissors', 'Ruler', 'Calculator',
  ],
};

/** Descriptive use-case phrases. */
export const USES: readonly string[] = [
  'everyday use', 'professional work', 'outdoor adventures', 'home improvement',
  'fitness enthusiasts', 'travel', 'students', 'gaming', 'cooking', 'office work',
] as const;

/** Feature descriptors for product descriptions. */
export const FEATURES: readonly string[] = [
  'premium materials', 'ergonomic design', 'easy setup', 'long battery life',
  'water resistance', 'fast charging', 'noise cancellation', 'Bluetooth connectivity',
  'adjustable settings', 'multi-device support', 'compact design', 'durable construction',
  'intuitive controls', 'energy efficiency', 'smart technology', 'HD display',
] as const;

/** Order status weighted distribution. */
export const ORDER_STATUSES: readonly WeightedItem<OrderStatus>[] = [
  { value: 'pending', weight: 10 },
  { value: 'processing', weight: 15 },
  { value: 'shipped', weight: 20 },
  { value: 'delivered', weight: 40 },
  { value: 'cancelled', weight: 10 },
  { value: 'refunded', weight: 5 },
] as const;

/** Payment method weighted distribution. */
export const PAYMENT_METHODS: readonly WeightedItem<PaymentMethod>[] = [
  { value: 'credit_card', weight: 45 },
  { value: 'debit_card', weight: 25 },
  { value: 'paypal', weight: 15 },
  { value: 'apple_pay', weight: 8 },
  { value: 'google_pay', weight: 5 },
  { value: 'bank_transfer', weight: 2 },
] as const;

/** User account status weighted distribution. */
export const USER_STATUSES: readonly WeightedItem<UserStatus>[] = [
  { value: 'active', weight: 70 },
  { value: 'inactive', weight: 20 },
  { value: 'suspended', weight: 5 },
  { value: 'pending', weight: 5 },
] as const;

/** User role weighted distribution. */
export const USER_ROLES: readonly WeightedItem<UserRole>[] = [
  { value: 'user', weight: 80 },
  { value: 'admin', weight: 5 },
  { value: 'moderator', weight: 10 },
  { value: 'premium', weight: 5 },
] as const;
