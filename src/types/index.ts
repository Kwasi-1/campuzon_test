/* eslint-disable @typescript-eslint/no-explicit-any */
// Global type definitions for the entire application

// User and Authentication Types
export interface User {
  id: string | number; // Support both string and number for backward compatibility
  name: string;
  email: string;
  avatar?: string;
  role?: 'client' | 'store' | 'admin' | 'super-admin';
  // Profile information from signup
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  dateOfBirth?: string;
  // Admin specific properties
  location?: string;
  joinDate?: string;
  status?: string; // Allow any string for flexibility
  orders?: number;
  totalSpent?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>; // returns true if 2FA required
  signup: (name: string, email: string, password: string, phone: string, address: string, city: string, region:string) => Promise<void>;
  logout: () => void;
  completeTwoFactor: (code: string) => Promise<void>;
  isLoading: boolean;
}

// Product Types
export interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number; // Made optional for admin products
  reviews?: string; // Made optional for admin products
  image?: string; // Made optional for admin products
  store: string;
  category: string;
  description?: string;
  inStock?: boolean;
  unit?: string;
  hasDiscount?: boolean;
  // Admin specific properties
  stock?: number;
  status?: string;
  views?: number;
  sales?: number;
  dateAdded?: string;
  // Store specific properties
  sku?: string;
  supplier?: string;
}

// Store Types
export interface Store {
  name: string;
  logo?: string;
  fallbackIcon: string;
  products: number;
  description: string;
  rating?: number;
  deliveryTime?: string;
}

// Admin Store Management Types
export interface AdminStoreData {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category?: string;
  location: string;
  status: string; // Allow any string for flexibility
  rating?: number;
  totalProducts: number;
  monthlyRevenue: number;
  joinDate: string;
  logo?: string;
}

// Category Types
export interface Category {
  name: string;
  icon: string;
  count: number;
  image?: string;
  isLarge?: boolean;
}

// Admin Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  avatar?: string;
}

export interface AdminStore {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  products: number;
  revenue: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  store: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  orderId: string;
  customer: string;
  store: string;
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'Mobile Money' | 'Card' | 'Cash on Delivery' | 'Bank Transfer';
  date: string;
  deliveryStatus: 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled';
  items: number;
}

export interface AdminRider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'busy';
  rating: number;
  totalDeliveries: number;
  earnings: number;
  joinedAt: string;
  avatar?: string;
  vehicleType: 'bike' | 'car' | 'motorcycle';
  location: string;
}

// Store Portal Types
export interface StoreProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  description?: string;
}

export interface StoreOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  items: number;
  date: string;
  phone: string;
  address?: string;
  paymentMethod: string;
  priority: 'low' | 'medium' | 'high';
}

export interface StoreTransaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  type: 'sale' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  category: string;
  description: string;
}

export interface StoreSettings {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  logo?: string;
  openingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  deliveryRadius: number;
  minimumOrder: number;
  deliveryFee: number;
  taxRate: number;
  currency: string;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    promotions: boolean;
  };
}

// Table Component Types
export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableAction {
  label: string;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline';
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  region: string;
};

// Filter Types
export interface DateFilter {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  data?: any;
}

// Cart Types - Updated to extend Product
export interface CartItem extends Product {
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
  deliveryAddress: string;
  date: string;
  itemCount: number;
  deliveryMethod: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  paymentReference?: string;
  paymentStatus?: string;
  // Store specific properties
  customer?: string;
  amount?: number;
  phone?: string;
  address?: string;
  priority?: 'low' | 'medium' | 'high';
  orderItems?: OrderItem[];
}

// Order Item Types
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// Wishlist Types
export interface WishlistItem extends Product {
  addedAt: string; // Date/time when the item was added to the wishlist
  // Additional wishlist-specific properties if needed
}

// Super Admin Types
export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'pending';
}

export interface AdminManagement {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super-admin';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
  createdAt: string;
  createdBy: string;
  avatar?: string;
}

// Transaction Types (Enhanced)
export interface AdminTransaction {
  id: string;
  orderId: string;
  customer: string;
  store: string;
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'Mobile Money' | 'Card' | 'Cash on Delivery' | 'Bank Transfer';
  date: string;
  deliveryStatus: 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled';
  items: number;
}

// Disbursement Types
export interface Disbursement {
  id: string;
  storeName: string;
  grossSales: number;
  platformFee: number;
  netPayout: number;
  status: 'Pending' | 'Disbursed' | 'Failed';
  disbursedAt?: string;
  storeId: string;
}

// Multi-step Form Types
export interface SignupFormStep {
  step: number;
  title: string;
  description: string;
  fields: FormField[];
}

export interface StoreSignupFormStep {
  step: number;
  title: string;
  description: string;
  fields: StoreFormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    message?: string;
  };
}

export interface StoreFormField extends FormField {
  businessRelated?: boolean;
}

// Enhanced User Types for Promotion
export interface PromotableUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'store' | 'admin';
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'store' | 'product' | 'transaction' | 'system' | 'rider' | 'notification' | 'report';
}

// Dashboard Stats Types
export interface DashboardStat {
  title: string;
  value: string;
  icon: any;
  change: string;
  color: string;
}

export interface RevenueData {
  name: string;
  revenue: number;
  orders: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TopStore {
  name: string;
  revenue: string;
  orders: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'order' | 'product' | 'system' | 'payment' | 'user';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  lowStockAlerts: boolean;
  newUserRegistrations: boolean;
}

// Signup Form Types
export interface SignupData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  
  // Step 2: Contact Info
  phone: string;
  address: string;
  city: string;
  region: string;
  
  // Step 3: Account Security
  password: string;
  confirmPassword: string;
}

export interface StoreSignupData {
  // Step 1: Store Information
  storeName: string;
  storeDescription: string;
  category: string;
  
  // Step 2: Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  
  // Step 3: Contact & Location
  phone: string;
  address: string;
  city: string;
  region: string;
  
  // Step 4: Account Security
  password: string;
  confirmPassword: string;
}

// Address Types
export interface Address {
  id: string;
  label: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  location: string;
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  earnings: number;
  joinDate: string;
  vehicleType: string;
  licenseNumber: string;
  lastDelivery: string;
  currentOrders: number;
  reviews: Array<{
    customer: string;
    rating: number;
    comment: string;
  }>;
}

export interface StoreData {
  id: number;
  // Backend identifier for the stall (used for admin actions)
  stallId?: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  status: string;
  rating: number;
  totalProducts: number;
  monthlyRevenue: number;
  joinDate: string;
  logo: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  store: string;
  customer: string;
  amount: number;
  commission: number;
  status: string;
  paymentMethod: string;
  date: string;
  deliveryStatus: string;
}