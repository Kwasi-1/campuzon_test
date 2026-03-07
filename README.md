
# Tobra - E-Commerce Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Tailwind CSS. Tobra provides a seamless shopping experience for customers and comprehensive management tools for store owners and administrators.

## 🚀 Features

### Customer Features
- **Product Browsing**: Browse products by categories with advanced filtering and search
- **Shopping Cart**: Add, remove, and manage items in your cart
- **Wishlist**: Save favorite products for later
- **User Authentication**: Secure login and signup system
- **Order Management**: Track orders and view order history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Store Owner Features
- **Store Dashboard**: Comprehensive analytics and overview
- **Product Management**: Add, edit, and manage product inventory
- **Order Processing**: View and manage customer orders
- **Transaction History**: Track sales and payment records
- **Bulk Operations**: Import products in bulk via CSV

### Admin Features
- **Admin Dashboard**: System-wide analytics and management
- **User Management**: Manage customer accounts and permissions
- **Store Management**: Oversee all registered stores
- **Product Oversight**: Monitor all products across the platform
- **Transaction Monitoring**: Track all platform transactions
- **Rider Management**: Manage delivery personnel

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Context API
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React & Iconify
- **Charts**: Recharts
- **Notifications**: Sonner
- **Forms**: React Hook Form with Zod validation
- **SEO**: React Helmet Async

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd tobra-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── admin/          # Admin-specific components
│   ├── store/          # Store owner components
│   └── shared/         # Shared utility components
├── pages/              # Page components
│   ├── admin/          # Admin portal pages
│   └── store/          # Store portal pages
├── contexts/           # React Context providers
├── data/              # Static data and mock data
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── assets/            # Static assets
```

## 🔑 Key Components

### Authentication System
- Secure login/signup for customers, store owners, and admins
- Protected routes and role-based access control
- Persistent session management

### Shopping Experience
- **ProductCard**: Reusable product display component
- **FilterModal**: Advanced product filtering
- **Cart Management**: Full shopping cart functionality
- **Wishlist**: Save and manage favorite products

### Store Management
- **StoreLayout**: Dedicated layout for store owners
- **Product Management**: CRUD operations for products
- **Order Processing**: Comprehensive order management
- **Analytics Dashboard**: Sales and performance metrics

### Admin Portal
- **AdminLayout**: Administrative interface
- **User Management**: Customer and store owner oversight
- **System Analytics**: Platform-wide metrics
- **Content Moderation**: Product and store approval

## 🎨 Design System

The project uses a custom design system built on Tailwind CSS:

- **Typography**: Custom font families (Orpheus Pro, Inter)
- **Colors**: HSL-based color palette with semantic tokens
- **Components**: Consistent UI components with variants
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA-compliant components

## 📱 Responsive Design

- **Mobile**: < 768px - Optimized mobile experience
- **Tablet**: 768px - 1024px - Touch-friendly interface
- **Desktop**: > 1024px - Full-featured experience

## 🔐 User Roles

### Customer
- Browse and purchase products
- Manage cart and wishlist
- Track orders
- Account management

### Store Owner
- Manage product inventory
- Process orders
- View sales analytics
- Handle customer inquiries

### Admin
- Platform oversight
- User and store management
- System configuration
- Analytics and reporting

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📄 Pages Overview

### Public Pages
- **Home** (`/`) - Landing page with featured products
- **Products** (`/products`) - Product catalog with filtering
- **Product Detail** (`/product/:id`) - Individual product pages
- **Cart** (`/cart`) - Shopping cart management
- **Login/Signup** - Authentication pages

### Protected Pages
- **Account** (`/account`) - User profile and settings
- **Wishlist** (`/wishlist`) - Saved products
- **Order History** (`/orders`) - Past purchases
- **Order Tracking** (`/order/:id`) - Track specific orders

### Store Portal
- **Dashboard** (`/store-portal`) - Store analytics
- **Products** (`/store-portal/products`) - Inventory management
- **Orders** (`/store-portal/orders`) - Order processing
- **Transactions** (`/store-portal/transactions`) - Financial records

### Admin Portal
- **Dashboard** (`/admin`) - System overview
- **Users** (`/admin/users`) - Customer management
- **Stores** (`/admin/stores`) - Store oversight
- **Products** (`/admin/products`) - Product moderation

## 🎯 Key Features Implementation

### Product Search & Filtering
- Real-time search functionality
- Category-based filtering
- Price range filtering
- Store-specific filtering
- Sort by price, popularity, etc.

### Shopping Cart
- Persistent cart state
- Quantity management
- Real-time price calculations
- Local storage persistence

### Order Management
- Order creation and tracking
- Status updates (Processing, In Transit, Delivered)
- Order history with detailed views
- Email notifications (UI ready)

### Analytics Dashboard
- Sales performance metrics
- Product performance tracking
- User engagement analytics
- Revenue reporting

## 🔧 Customization

### Adding New Product Categories
1. Update `src/data/categories.ts`
2. Add category-specific filtering logic
3. Update navigation components

### Extending User Roles
1. Modify `src/contexts/AuthContext.tsx`
2. Add role-specific route protection
3. Update UI components for new permissions

### Custom Styling
- Modify `tailwind.config.ts` for theme changes
- Update `src/index.css` for global styles
- Use semantic tokens for consistent theming

## 🌐 Deployment

### Lovable Platform
1. Click "Publish" in the Lovable editor
2. Your app will be deployed automatically
3. Access via your Lovable subdomain

### Custom Domain
1. Go to Project > Settings > Domains
2. Connect your custom domain
3. Configure DNS settings as instructed

### External Hosting
The codebase is standard React/Vite and can be deployed to:
- Vercel
- AWS S3 + CloudFront
- Any static hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

