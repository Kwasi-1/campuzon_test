# Frontend Schema Documentation

This document defines the complete data schemas used in the Tobra frontend application. These schemas should be adopted by the backend API and mobile applications to ensure consistency across all platforms.

## 🔧 **General Conventions**

- **ID Fields**: Use `id` (string or number) for backward compatibility
- **Timestamps**: Use ISO 8601 format strings (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Naming**: Use camelCase for all field names
- **Optional Fields**: Marked with `?` in TypeScript
- **Enums**: Use string literals for better readability
- **Flexibility**: Some status fields allow strings for flexibility while others use strict enums

## 👤 **User & Authentication Schemas**

### User
```typescript
interface User {
  id: string | number;        // Support both for backward compatibility
  name: string;
  email: string;
  avatar?: string;
  role?: 'client' | 'store' | 'admin' | 'super-admin';
  
  // Profile information from signup
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  dateOfBirth?: string;       // ISO 8601 format
  
  // Admin specific properties
  location?: string;
  joinDate?: string;          // ISO 8601 format
  status?: string;            // Flexible string for various statuses
  orders?: number;            // Total order count
  totalSpent?: number;        // Total amount spent
}
```

### Authentication Context
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone: string, address: string, city: string, region: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### Form Data Types
```typescript
interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

interface SignupData {
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

interface StoreSignupData {
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
```

## 🛍️ **Product Schemas**

### Product
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;     // For discounted items
  discount?: number;          // Percentage discount
  rating?: number;            // Average rating (0-5) - optional for admin products
  reviews?: string;           // Review count as string - optional for admin products
  image?: string;             // Primary image URL - optional for admin products
  store: string;              // Store name
  category: string;           // Category name
  description?: string;
  inStock?: boolean;
  unit?: string;              // e.g., "kg", "pieces"
  hasDiscount?: boolean;
  
  // Admin/Store specific properties
  stock?: number;             // Available quantity
  status?: string;            // e.g., "active", "inactive" - flexible string
  views?: number;             // View count
  sales?: number;             // Sales count
  dateAdded?: string;         // ISO 8601 format
  
  // Store specific properties
  sku?: string;               // Store keeping unit
  supplier?: string;
}
```

### Store Product (Enhanced for Store Portal)
```typescript
interface StoreProduct {
  id: number;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  price: number;
  stock: number;
  status: string;             // Flexible string
  image: string;
  description?: string;
}
```

### Category
```typescript
interface Category {
  name: string;
  icon: string;               // Icon identifier or URL
  count: number;              // Product count in category
  image?: string;             // Category image URL
  isLarge?: boolean;          // For UI layout purposes
}
```

## 🏪 **Store Schemas**

### Store
```typescript
interface Store {
  name: string;
  logo?: string;
  fallbackIcon: string;      // Fallback icon when logo unavailable
  products: number;          // Product count
  description: string;
  rating?: number;
  deliveryTime?: string;     // e.g., "30-45 min"
}
```

### Store Data (Enhanced)
```typescript
interface StoreData {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  status: string;            // Flexible string
  rating: number;
  totalProducts: number;
  monthlyRevenue: number;
  joinDate: string;          // ISO 8601 format
  logo: string;
}
```

### Admin Store Data
```typescript
interface AdminStoreData {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  category?: string;
  location: string;
  status: string;            // Flexible string
  rating?: number;
  totalProducts: number;
  monthlyRevenue: number;
  joinDate: string;          // ISO 8601 format
  logo?: string;
}
```

### Store Settings
```typescript
interface StoreSettings {
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
  deliveryRadius: number;    // In kilometers
  minimumOrder: number;      // Minimum order amount
  deliveryFee: number;
  taxRate: number;           // Percentage
  currency: string;          // Currency code (e.g., "GHS")
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    promotions: boolean;
  };
}
```

## 🛒 **Cart & Order Schemas**

### Cart Item
```typescript
interface CartItem extends Product {
  quantity: number;
}
```

### Order
```typescript
interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: string;            // Flexible string for various order statuses
  createdAt: string;         // ISO 8601 format
  deliveryAddress: string;
  date: string;              // Display date
  itemCount: number;
  deliveryMethod: string;    // e.g., "standard", "express"
  paymentMethod: string;     // e.g., "card", "cash"
  estimatedDelivery?: string; // ISO 8601 format
  paymentReference?: string; // Payment gateway reference
  paymentStatus?: string;    // e.g., "paid", "pending"
  
  // Store-specific fields
  customer?: string;
  amount?: number;
  phone?: string;
  address?: string;
  priority?: 'low' | 'medium' | 'high';
  orderItems?: OrderItem[];
}
```

### Store Order
```typescript
interface StoreOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;            // Flexible string
  items: number;
  date: string;              // ISO 8601 format
  phone: string;
  address?: string;
  paymentMethod: string;
  priority: 'low' | 'medium' | 'high';
}
```

### Order Item
```typescript
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}
```

### Address
```typescript
interface Address {
  id: string;
  label: string;
  address: string;
  phone: string;
  isDefault?: boolean;
}
```

## 📊 **Admin Management Schemas**

### Admin User
```typescript
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;              // Flexible string
  status: 'active' | 'inactive';
  joinedAt: string;          // ISO 8601 format
  avatar?: string;
}
```

### Admin Management
```typescript
interface AdminManagement {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super-admin';
  status: 'active' | 'inactive';
  lastLogin: string;         // ISO 8601 format
  permissions: string[];
  createdAt: string;         // ISO 8601 format
  createdBy: string;
  avatar?: string;
}
```

### User Activity
```typescript
interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  description: string;
  timestamp: string;         // ISO 8601 format
  ipAddress: string;
  location: string;
  device: string;
  status: 'success' | 'failed' | 'pending';
}
```

### Admin Store
```typescript
interface AdminStore {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;          // ISO 8601 format
  products: number;
  revenue: number;
}
```

### Admin Product
```typescript
interface AdminProduct {
  id: string;
  name: string;
  store: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;         // ISO 8601 format
}
```

## 💳 **Transaction Schemas**

### Admin Transaction
```typescript
interface AdminTransaction {
  id: string;
  orderId: string;
  customer: string;
  store: string;
  amount: number;
  commission: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: 'Mobile Money' | 'Card' | 'Cash on Delivery' | 'Bank Transfer';
  date: string;              // ISO 8601 format
  deliveryStatus: 'Delivered' | 'In Transit' | 'Pending' | 'Cancelled';
  items: number;
}
```

### Store Transaction
```typescript
interface StoreTransaction {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  type: 'sale' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  date: string;              // ISO 8601 format
  paymentMethod: string;
  category: string;
  description: string;
}
```

### Transaction (General)
```typescript
interface Transaction {
  id: string;
  orderId: string;
  store: string;
  customer: string;
  amount: number;
  commission: number;
  status: string;            // Flexible string
  paymentMethod: string;
  date: string;              // ISO 8601 format
  deliveryStatus: string;
}
```

## 🚗 **Delivery & Rider Schemas**

### Admin Rider
```typescript
interface AdminRider {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'busy';
  rating: number;
  totalDeliveries: number;
  earnings: number;
  joinedAt: string;          // ISO 8601 format
  avatar?: string;
  vehicleType: 'bike' | 'car' | 'motorcycle';
  location: string;
}
```

### Rider (Enhanced)
```typescript
interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;            // Flexible string
  location: string;
  rating: number;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  earnings: number;
  joinDate: string;          // ISO 8601 format
  vehicleType: string;
  licenseNumber: string;
  lastDelivery: string;      // ISO 8601 format
  currentOrders: number;
  reviews: Array<{
    customer: string;
    rating: number;
    comment: string;
  }>;
}
```

## 🔔 **Notification Schemas**

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;         // ISO 8601 format
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'order' | 'product' | 'system' | 'payment' | 'user';
}
```

### Notification Settings
```typescript
interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  lowStockAlerts: boolean;
  newUserRegistrations: boolean;
}
```

## 💰 **Financial Schemas**

### Disbursement
```typescript
interface Disbursement {
  id: string;
  storeName: string;
  grossSales: number;
  platformFee: number;
  netPayout: number;
  status: 'Pending' | 'Disbursed' | 'Failed';
  disbursedAt?: string;      // ISO 8601 format
  storeId: string;
}
```

## 📊 **Dashboard & Analytics Schemas**

### Dashboard Stat
```typescript
interface DashboardStat {
  title: string;
  value: string;
  icon: any;                 // React component or icon identifier
  change: string;
  color: string;
}
```

### Revenue Data
```typescript
interface RevenueData {
  name: string;
  revenue: number;
  orders: number;
}
```

### Category Data
```typescript
interface CategoryData {
  name: string;
  value: number;
  color: string;
}
```

### Top Store
```typescript
interface TopStore {
  name: string;
  revenue: string;
  orders: number;
}
```

## 📱 **UI Component Schemas**

### Table Components
```typescript
interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableAction {
  label: string;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive' | 'outline';
}
```

### Form Components
```typescript
interface FormField {
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

interface StoreFormField extends FormField {
  businessRelated?: boolean;
}

interface SignupFormStep {
  step: number;
  title: string;
  description: string;
  fields: FormField[];
}

interface StoreSignupFormStep {
  step: number;
  title: string;
  description: string;
  fields: StoreFormField[];
}
```

### Modal Components
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  data?: any;
}
```

### Filter Components
```typescript
interface DateFilter {
  startDate: Date | undefined;
  endDate: Date | undefined;
}
```

## 🛍️ **Wishlist Schema**

### Wishlist Item
```typescript
interface WishlistItem extends Product {
  addedAt: string;           // ISO 8601 format when item was added
}
```

## 👥 **Permission & Role Management**

### Promotable User
```typescript
interface PromotableUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'store' | 'admin';
}
```

### Permission
```typescript
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'store' | 'product' | 'transaction' | 'system' | 'rider' | 'notification' | 'report';
}
```

## 📋 **Implementation Guidelines**

### Backend Implementation:
1. **Database Schema**: Design tables to match these exact interfaces
2. **Field Naming**: Use camelCase in API responses (convert from snake_case if needed)
3. **Data Types**: Ensure backend types match frontend expectations exactly
4. **Flexible vs Strict Fields**: 
   - Use enums for critical business logic fields
   - Use flexible strings for display/status fields that may evolve
5. **Optional Fields**: Properly handle nullable database columns
6. **Timestamps**: Always return ISO 8601 formatted strings

### Mobile App Implementation:
1. **Model Classes**: Create exact matches for these TypeScript interfaces
2. **Serialization**: Ensure JSON parsing matches these schemas exactly
3. **State Management**: Structure app state using these schemas
4. **Type Safety**: Implement equivalent type checking in your mobile framework

### API Response Format:
All API responses should follow this consistent format:

```typescript
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
```

This comprehensive schema documentation ensures perfect consistency across frontend, backend, and mobile applications in the Tobra ecosystem! 🎯