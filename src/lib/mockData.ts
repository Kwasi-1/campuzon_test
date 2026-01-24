// Mock data for development and demo purposes
import type { Product, Store, Category, User, Order, DeliveryMethod, OrderStatus, Institution } from '@/types';

// Mock Institutions - fetched from database in production
export const mockInstitutions: Institution[] = [
  {
    id: 'inst-1',
    name: 'University of Ghana',
    shortName: 'UG',
    region: 'Greater Accra',
    city: 'Accra',
    isActive: true,
  },
  {
    id: 'inst-2',
    name: 'University of Professional Studies',
    shortName: 'UPSA',
    region: 'Greater Accra',
    city: 'Accra',
    isActive: true,
  },
];

export const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John D.',
  email: 'john.doe@university.edu',
  phoneNumber: '+1 555-123-4567',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  isOwner: false,
  isActive: true,
  isVerified: true,
  emailVerified: true,
  phoneVerified: true,
  institutionID: 'inst-1',
  hallID: 'hall-1',
  dateCreated: '2024-09-15T10:30:00Z',
  twoFactorEnabled: false,
  twoFactorMethod: 'none',
};

export const mockStores: Store[] = [
  {
    id: 'store-1',
    storeName: 'TechHub Campus',
    storeSlug: 'techhub-campus',
    description: 'Your one-stop shop for all tech gadgets and accessories on campus.',
    logo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    email: 'techhub@university.edu',
    phoneNumber: '+1 555-100-1001',
    status: 'active',
    isVerified: true,
    rating: 4.8,
    totalSales: 15000,
    totalOrders: 245,
    institutionID: 'inst-1',
    autoResponderEnabled: true,
    autoResponderName: 'TechBot',
    dateCreated: '2024-01-15T08:00:00Z',
  },
  {
    id: 'store-2',
    storeName: 'Campus Threads',
    storeSlug: 'campus-threads',
    description: 'Trendy clothing and accessories for the modern student.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop',
    email: 'threads@university.edu',
    phoneNumber: '+1 555-100-1002',
    status: 'active',
    isVerified: true,
    rating: 4.6,
    totalSales: 8500,
    totalOrders: 180,
    institutionID: 'inst-1',
    autoResponderEnabled: false,
    autoResponderName: null,
    dateCreated: '2024-02-20T10:00:00Z',
  },
  {
    id: 'store-3',
    storeName: 'BookWorm Corner',
    storeSlug: 'bookworm-corner',
    description: 'New and used textbooks at unbeatable prices.',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop',
    email: 'books@university.edu',
    phoneNumber: '+1 555-100-1003',
    status: 'active',
    isVerified: true,
    rating: 4.9,
    totalSales: 22000,
    totalOrders: 520,
    institutionID: 'inst-1',
    autoResponderEnabled: true,
    autoResponderName: 'BookBot',
    dateCreated: '2024-01-05T09:00:00Z',
  },
];

const createProduct = (
  id: string,
  storeID: string,
  name: string,
  slug: string,
  description: string,
  price: number,
  comparePrice: number | null,
  quantity: number,
  images: string[],
  category: Category,
  condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair',
  isFeatured: boolean,
  soldCount: number,
  rating: number,
  reviewCount: number,
  storeName: string,
  storeSlug: string,
  storeLogo: string,
  dateCreated: string
): Product => ({
  id,
  storeID,
  name,
  slug,
  description,
  price,
  comparePrice,
  quantity,
  minOrderQuantity: 1,
  maxOrderQuantity: Math.min(10, quantity),
  images,
  thumbnail: images[0] || null,
  category,
  condition,
  tags: name.toLowerCase().split(' ').slice(0, 3),
  status: 'active',
  isActive: true,
  isFeatured,
  viewCount: Math.floor(Math.random() * 2000) + 100,
  soldCount,
  rating,
  reviewCount,
  store: {
    id: storeID,
    name: storeName,
    slug: storeSlug,
    logo: storeLogo,
    totalSales: Math.floor(Math.random() * 50000),
  },
  dateCreated,
});

export const mockProducts: Product[] = [
  // Electronics
  createProduct(
    'prod-1',
    'store-1',
    'MacBook Pro M3 - Student Edition',
    'macbook-pro-m3-student',
    'Powerful laptop perfect for coding, design, and everything in between. Comes with student discount applied.',
    1299.99,
    1499.99,
    15,
    [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop',
    ],
    'electronics',
    'new',
    true,
    45,
    4.9,
    38,
    'TechHub Campus',
    'techhub-campus',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    '2024-11-01T10:00:00Z'
  ),
  createProduct(
    'prod-2',
    'store-1',
    'AirPods Pro 2nd Gen',
    'airpods-pro-2',
    'Immersive sound with Active Noise Cancellation. Perfect for studying in noisy environments.',
    199.99,
    249.99,
    50,
    ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=600&fit=crop'],
    'electronics',
    'new',
    true,
    120,
    4.8,
    95,
    'TechHub Campus',
    'techhub-campus',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    '2024-10-15T14:00:00Z'
  ),
  createProduct(
    'prod-3',
    'store-1',
    'iPad Air with Apple Pencil',
    'ipad-air-pencil',
    'Take notes like never before. Perfect for lectures, drawing, and digital art.',
    699.99,
    849.99,
    25,
    ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=600&fit=crop'],
    'electronics',
    'new',
    false,
    28,
    4.7,
    22,
    'TechHub Campus',
    'techhub-campus',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    '2024-09-20T11:00:00Z'
  ),
  // Clothing
  createProduct(
    'prod-4',
    'store-2',
    'University Hoodie - Premium Cotton',
    'university-hoodie-premium',
    'Stay warm and show your school spirit with this ultra-comfortable premium cotton hoodie.',
    49.99,
    69.99,
    100,
    [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=600&fit=crop',
    ],
    'clothing',
    'new',
    true,
    340,
    4.6,
    156,
    'Campus Threads',
    'campus-threads',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    '2024-08-15T09:00:00Z'
  ),
  createProduct(
    'prod-5',
    'store-2',
    'Classic Denim Jacket',
    'classic-denim-jacket',
    'Timeless style meets campus comfort. A wardrobe essential for any student.',
    79.99,
    99.99,
    45,
    ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=600&fit=crop'],
    'clothing',
    'new',
    false,
    65,
    4.5,
    42,
    'Campus Threads',
    'campus-threads',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    '2024-09-01T13:00:00Z'
  ),
  // Books
  createProduct(
    'prod-6',
    'store-3',
    'Calculus: Early Transcendentals (8th Ed)',
    'calculus-early-transcendentals-8',
    'The gold standard calculus textbook. Gently used with minimal highlighting.',
    45.0,
    180.0,
    8,
    ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop'],
    'books',
    'used_good',
    true,
    42,
    4.8,
    28,
    'BookWorm Corner',
    'bookworm-corner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    '2024-08-01T08:00:00Z'
  ),
  createProduct(
    'prod-7',
    'store-3',
    'Introduction to Psychology (12th Ed)',
    'intro-psychology-12',
    'Comprehensive psychology textbook. Like new condition.',
    35.0,
    150.0,
    12,
    ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop'],
    'books',
    'used_like_new',
    false,
    38,
    4.9,
    31,
    'BookWorm Corner',
    'bookworm-corner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    '2024-07-20T10:00:00Z'
  ),
  // Accessories
  createProduct(
    'prod-8',
    'store-1',
    'Ergonomic Laptop Stand',
    'ergonomic-laptop-stand',
    'Improve your posture while studying. Adjustable height aluminum stand.',
    39.99,
    59.99,
    60,
    ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop'],
    'accessories',
    'new',
    false,
    85,
    4.4,
    52,
    'TechHub Campus',
    'techhub-campus',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    '2024-10-05T15:00:00Z'
  ),
  createProduct(
    'prod-9',
    'store-2',
    'Canvas Backpack - Large',
    'canvas-backpack-large',
    'Spacious and stylish backpack with laptop compartment. Perfect for daily campus life.',
    59.99,
    89.99,
    35,
    ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=600&fit=crop'],
    'accessories',
    'new',
    true,
    95,
    4.7,
    68,
    'Campus Threads',
    'campus-threads',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    '2024-09-10T11:00:00Z'
  ),
  // Food & Snacks
  createProduct(
    'prod-10',
    'store-1',
    'Study Snack Box - Energy Pack',
    'study-snack-box-energy',
    'Curated box of healthy snacks to fuel your study sessions. Includes nuts, dried fruits, and energy bars.',
    24.99,
    34.99,
    200,
    ['https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&h=600&fit=crop'],
    'food',
    'new',
    false,
    156,
    4.5,
    89,
    'TechHub Campus',
    'techhub-campus',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop',
    '2024-11-10T12:00:00Z'
  ),
  // Services
  createProduct(
    'prod-11',
    'store-3',
    'Essay Proofreading Service',
    'essay-proofreading-service',
    'Professional proofreading for essays up to 5000 words. 24-hour turnaround.',
    19.99,
    null,
    999,
    ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'],
    'services',
    'new',
    false,
    210,
    4.9,
    145,
    'BookWorm Corner',
    'bookworm-corner',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    '2024-06-15T09:00:00Z'
  ),
  createProduct(
    'prod-12',
    'store-2',
    'Vintage Band T-Shirt Collection',
    'vintage-band-tshirt',
    'Authentic vintage band tees. Various sizes and bands available.',
    29.99,
    45.0,
    25,
    ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop'],
    'clothing',
    'used_good',
    false,
    48,
    4.3,
    29,
    'Campus Threads',
    'campus-threads',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop',
    '2024-10-20T14:00:00Z'
  ),
];

export const mockCategories: { value: Category; label: string; count: number }[] = [
  { value: 'electronics', label: 'Electronics', count: 45 },
  { value: 'clothing', label: 'Clothing', count: 120 },
  { value: 'books', label: 'Books & Textbooks', count: 230 },
  { value: 'accessories', label: 'Accessories', count: 85 },
  { value: 'food', label: 'Food & Snacks', count: 35 },
  { value: 'services', label: 'Services', count: 28 },
  { value: 'furniture', label: 'Furniture', count: 42 },
  { value: 'sports', label: 'Sports & Outdoors', count: 56 },
  { value: 'beauty', label: 'Beauty & Health', count: 38 },
  { value: 'other', label: 'Other', count: 65 },
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001234',
    userID: 'user-1',
    storeID: 'store-1',
    status: 'delivered' as OrderStatus,
    deliveryMethod: 'pickup' as DeliveryMethod,
    subtotal: 239.98,
    deliveryFee: 0,
    serviceFee: 12.0,
    discount: 0,
    totalAmount: 251.98,
    deliveryAddress: 'Room 302, Hall A, University Campus',
    deliveryNotes: 'Leave at door if not available',
    buyerNote: null,
    sellerNote: null,
    paidAt: '2024-12-15T10:35:00Z',
    shippedAt: '2024-12-16T09:00:00Z',
    deliveredAt: '2024-12-17T14:00:00Z',
    completedAt: '2024-12-17T14:30:00Z',
    dateCreated: '2024-12-15T10:30:00Z',
    items: [
      {
        id: 'item-1',
        orderID: 'order-1',
        productID: 'prod-2',
        productName: 'AirPods Pro 2nd Gen',
        productImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=600&fit=crop',
        quantity: 1,
        unitPrice: 199.99,
        subtotal: 199.99,
      },
      {
        id: 'item-2',
        orderID: 'order-1',
        productID: 'prod-8',
        productName: 'Ergonomic Laptop Stand',
        productImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=600&fit=crop',
        quantity: 1,
        unitPrice: 39.99,
        subtotal: 39.99,
      },
    ],
    store: mockStores[0],
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-001235',
    userID: 'user-1',
    storeID: 'store-2',
    status: 'shipped' as OrderStatus,
    deliveryMethod: 'delivery' as DeliveryMethod,
    subtotal: 129.97,
    deliveryFee: 5.0,
    serviceFee: 6.5,
    discount: 0,
    totalAmount: 141.47,
    deliveryAddress: 'Room 302, Hall A, University Campus',
    deliveryNotes: null,
    buyerNote: 'Please call before arriving',
    sellerNote: null,
    paidAt: '2024-12-20T16:50:00Z',
    shippedAt: '2024-12-22T09:00:00Z',
    deliveredAt: null,
    completedAt: null,
    dateCreated: '2024-12-20T16:45:00Z',
    items: [
      {
        id: 'item-3',
        orderID: 'order-2',
        productID: 'prod-4',
        productName: 'University Hoodie - Premium Cotton',
        productImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop',
        quantity: 2,
        unitPrice: 49.99,
        subtotal: 99.98,
      },
      {
        id: 'item-4',
        orderID: 'order-2',
        productID: 'prod-12',
        productName: 'Vintage Band T-Shirt Collection',
        productImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop',
        quantity: 1,
        unitPrice: 29.99,
        subtotal: 29.99,
      },
    ],
    store: mockStores[1],
  },
];

// Featured products for homepage
export const featuredProducts = mockProducts.filter((p) => p.isFeatured);

// New arrivals (sorted by date)
export const newArrivals = [...mockProducts]
  .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
  .slice(0, 8);

// Best sellers (sorted by sold count)
export const bestSellers = [...mockProducts]
  .sort((a, b) => b.soldCount - a.soldCount)
  .slice(0, 8);

// Helper function to simulate API delay
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  async getProducts(filters?: {
    category?: Category;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
  }) {
    await delay(300); // Simulate network delay

    let filtered = [...mockProducts];

    if (filters?.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
    }

    // Sorting
    if (filters?.sortBy) {
      filtered.sort((a, b) => {
        let aVal: number, bVal: number;
        switch (filters.sortBy) {
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'date_created':
            aVal = new Date(a.dateCreated).getTime();
            bVal = new Date(b.dateCreated).getTime();
            break;
          case 'rating':
            aVal = a.rating || 0;
            bVal = b.rating || 0;
            break;
          case 'sold_count':
            aVal = a.soldCount;
            bVal = b.soldCount;
            break;
          default:
            return 0;
        }
        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    const page = filters?.page || 1;
    const perPage = filters?.perPage || 12;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginated = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / perPage);

    return {
      items: paginated,
      pagination: {
        page,
        perPage,
        total: filtered.length,
        pages: totalPages,
        hasNext: end < filtered.length,
        hasPrev: page > 1,
      },
      total: filtered.length,
      pages: totalPages,
      page,
      hasNext: end < filtered.length,
      hasPrev: page > 1,
    };
  },

  async getProduct(idOrSlug: string) {
    await delay(200);
    return mockProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
  },

  async getFeaturedProducts() {
    await delay(200);
    return featuredProducts;
  },

  async getNewArrivals() {
    await delay(200);
    return newArrivals;
  },

  async getBestSellers() {
    await delay(200);
    return bestSellers;
  },

  async getStoreProducts(storeId: string) {
    await delay(200);
    return mockProducts.filter((p) => p.storeID === storeId);
  },

  async getStore(id: string) {
    await delay(200);
    return mockStores.find((s) => s.id === id) || null;
  },

  async getOrders() {
    await delay(300);
    return mockOrders;
  },

  async getCategories() {
    await delay(100);
    return mockCategories;
  },
};
