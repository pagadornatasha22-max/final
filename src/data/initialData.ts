import { Product, User } from '../types';

export const adminUser: User = {
  id: 'admin-001',
  fullName: 'Macel Admin',
  email: 'admin@macelsflowershop.com',
  username: 'admin',
  contactNumber: '09123456789',
  address: 'Purok E, Brgy. Canipaan, Hinunangan, Southern Leyte',
  password: 'admin123',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const initialProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Pink Rose Elegance Bouquet',
    price: 850,
    category: 'bouquet',
    description: 'A stunning bouquet of fresh pink and white roses wrapped in elegant kraft paper with a satin ribbon. Perfect for birthdays, anniversaries, or just to brighten someone\'s day.',
    image: '/images/bouquet1.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002',
    name: 'Classic Red Romance Bouquet',
    price: 1200,
    category: 'bouquet',
    description: 'Express your love with this timeless bouquet of red roses accented with delicate baby\'s breath. Wrapped in premium paper for an unforgettable impression.',
    image: '/images/bouquet2.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003',
    name: 'Sunshine Sunflower Bouquet',
    price: 750,
    category: 'bouquet',
    description: 'Brighten any room with this cheerful sunflower bouquet with lush greenery. A perfect gift to spread happiness and warmth.',
    image: '/images/bouquet3.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-004',
    name: 'One Dozen Red Roses',
    price: 1500,
    category: 'dozen',
    description: 'A classic arrangement of 12 long-stemmed red roses in an elegant glass vase. The ultimate symbol of love and passion.',
    image: '/images/dozen1.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-005',
    name: 'One Dozen Pink Tulips',
    price: 1350,
    category: 'dozen',
    description: 'A beautiful collection of 12 fresh pink tulips elegantly wrapped. Symbolizing perfect happiness and spring freshness.',
    image: '/images/dozen2.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-006',
    name: 'One Dozen Mixed Roses',
    price: 1400,
    category: 'dozen',
    description: 'A stunning arrangement of 12 mixed-color roses including red, pink, white, and yellow. Perfect for any celebration.',
    image: '/images/bouquet1.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-007',
    name: 'Luxury Flower Box',
    price: 2500,
    category: 'custom',
    description: 'A premium custom flower arrangement in a decorative box featuring mixed roses, lilies, and orchids. Perfect for special occasions.',
    image: '/images/custom1.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-008',
    name: 'Heart-Shaped Rose Arrangement',
    price: 2800,
    category: 'custom',
    description: 'A romantic heart-shaped arrangement made with red and pink roses. The ultimate expression of love for Valentine\'s Day or anniversaries.',
    image: '/images/custom2.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-009',
    name: 'Custom Wedding Bouquet',
    price: 3000,
    category: 'custom',
    description: 'A bespoke wedding bouquet tailored to your preference. Choose your flowers, colors, and style for your perfect day.',
    image: '/images/bouquet2.jpg',
    inStock: true,
    createdAt: new Date().toISOString(),
  },
];

export function initializeData() {
  // Initialize admin user
  const users = JSON.parse(localStorage.getItem('macels_users') || '[]');
  const adminExists = users.find((u: User) => u.role === 'admin');
  if (!adminExists) {
    users.push(adminUser);
    localStorage.setItem('macels_users', JSON.stringify(users));
  }

  // Initialize products
  const products = JSON.parse(localStorage.getItem('macels_products') || '[]');
  if (products.length === 0) {
    localStorage.setItem('macels_products', JSON.stringify(initialProducts));
  }

  // Initialize orders
  if (!localStorage.getItem('macels_orders')) {
    localStorage.setItem('macels_orders', JSON.stringify([]));
  }
}
